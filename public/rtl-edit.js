// rtl-edit.jsx — WYSIWYG / direct-edit engine for the live preview
// Maps edits in the rendered view back to precise source ranges in the .tex.
const { useState, useEffect, useRef, useCallback } = React;
// ── MATH SOURCE TOKENIZER (mirrors the parser's recognition, document order) ─
function findMathSpans(text) {
    const spans = [];
    let i = 0;
    const n = text.length;
    while (i < n) {
        const ch = text[i];
        if (ch === '\\') {
            if (text[i + 1] === '[') {
                const end = text.indexOf('\\]', i + 2);
                if (end >= 0) {
                    spans.push({ start: i, end: end + 2, kind: 'bdisplay', raw: text.slice(i, end + 2), inner: text.slice(i + 2, end) });
                    i = end + 2;
                    continue;
                }
            }
            if (text[i + 1] === '(') {
                const end = text.indexOf('\\)', i + 2);
                if (end >= 0) {
                    spans.push({ start: i, end: end + 2, kind: 'pinline', raw: text.slice(i, end + 2), inner: text.slice(i + 2, end) });
                    i = end + 2;
                    continue;
                }
            }
            const bm = text.slice(i).match(/^\\begin\{(equation\*?|align\*?|gather\*?|multline\*?|eqnarray\*?)\}/);
            if (bm) {
                const env = bm[1];
                const endTok = '\\end{' + env + '}';
                const end = text.indexOf(endTok, i);
                if (end >= 0) {
                    const e = end + endTok.length;
                    spans.push({ start: i, end: e, kind: env, raw: text.slice(i, e), inner: text.slice(i + bm[0].length, end) });
                    i = e;
                    continue;
                }
            }
            i += 2;
            continue; // skip escaped char (\$ \% \{ ...)
        }
        if (ch === '%') {
            const nl = text.indexOf('\n', i);
            i = nl < 0 ? n : nl;
            continue;
        }
        if (ch === '$') {
            if (text[i + 1] === '$') {
                const end = text.indexOf('$$', i + 2);
                if (end >= 0) {
                    spans.push({ start: i, end: end + 2, kind: 'ddisplay', raw: text.slice(i, end + 2), inner: text.slice(i + 2, end) });
                    i = end + 2;
                    continue;
                }
            }
            else {
                let j = i + 1;
                while (j < n && text[j] !== '\n' && !(text[j] === '$' && text[j - 1] !== '\\'))
                    j++;
                if (j < n && text[j] === '$') {
                    spans.push({ start: i, end: j + 1, kind: 'dinline', raw: text.slice(i, j + 1), inner: text.slice(i + 1, j) });
                    i = j + 1;
                    continue;
                }
            }
        }
        i++;
    }
    return spans;
}
// Document-order math spans across the whole project (follows \input like the preview)
function collectMathSpans(files, mainId) {
    const byId = {};
    files.forEach(f => byId[f.id] = f);
    const byName = {};
    files.forEach(f => { byName[f.name.replace(/\.tex$/, '')] = f; });
    const out = [];
    const seen = new Set();
    function walk(file, depth) {
        if (!file || depth > 6 || seen.has(file.id))
            return;
        seen.add(file.id);
        const text = file.content;
        // for the main file, only consider the document body (parser strips preamble)
        let lo = 0, hi = text.length;
        const dm = text.match(/\\begin\{document\}/);
        if (dm) {
            lo = dm.index + dm[0].length;
            const de = text.indexOf('\\end{document}', lo);
            if (de >= 0)
                hi = de;
        }
        const spans = findMathSpans(text).filter(s => s.start >= lo && s.end <= hi).map(s => ({ ...s, fileId: file.id }));
        const inputs = [...text.matchAll(/\\(?:input|include)\{([^}]+)\}/g)]
            .filter(m => m.index >= lo && m.index <= hi)
            .map(m => ({ pos: m.index, name: m[1].trim().replace(/\.tex$/, '') }));
        const events = [...spans.map(s => ({ pos: s.start, span: s })), ...inputs.map(ip => ({ pos: ip.pos, input: ip }))]
            .sort((a, b) => a.pos - b.pos);
        for (const e of events) {
            if (e.span)
                out.push(e.span);
            else
                walk(byName[e.input.name], depth + 1);
        }
        seen.delete(file.id);
    }
    walk(byId[mainId], 0);
    return out;
}
// Reconstruct delimited source from edited LaTeX, preserving delimiter style + label
function buildMathRaw(kind, latex, origRaw) {
    latex = latex.trim();
    switch (kind) {
        case 'dinline': return `$${latex}$`;
        case 'pinline': return `\\(${latex}\\)`;
        case 'ddisplay': return `$$${latex}$$`;
        case 'bdisplay': return `\\[${latex}\\]`;
        default: {
            const env = kind; // equation / align / gather / ...
            const lbl = (origRaw && origRaw.match(/\\label\{[^}]+\}/) || [])[0] || '';
            const body = lbl ? `${latex}\n${lbl}` : latex;
            return `\\begin{${env}}\n${body}\n\\end{${env}}`;
        }
    }
}
// Replace the seq-th math span across the project with newRaw
function patchMathBySeq(files, mainId, seq, newRaw) {
    const spans = collectMathSpans(files, mainId);
    const t = spans[seq];
    if (!t)
        return null;
    return files.map(f => f.id === t.fileId
        ? { ...f, content: f.content.slice(0, t.start) + newRaw + f.content.slice(t.end) }
        : f);
}
// Insert new LaTeX at the seq-th math span boundary (after it) — used for "insert equation"
function insertAfterSeq(files, mainId, seq, insertText) {
    const spans = collectMathSpans(files, mainId);
    const t = spans[seq];
    if (!t)
        return null;
    return files.map(f => f.id === t.fileId
        ? { ...f, content: f.content.slice(0, t.end) + insertText + f.content.slice(t.end) }
        : f);
}
// ── PROSE: HTML → LaTeX serializer ──────────────────────────────────────────
function escapeProseText(s) {
    return s
        .replace(/\u00a0/g, '~')
        .replace(/\u2014/g, '---').replace(/\u2013/g, '--')
        .replace(/\u201C/g, '``').replace(/\u201D/g, "''")
        .replace(/\u2018/g, '`').replace(/\u2019/g, "'")
        .replace(/([&%#_$])/g, '\\$1');
}
function proseToLatex(node) {
    let out = '';
    node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
            out += escapeProseText(n.textContent);
            return;
        }
        if (n.nodeType !== 1)
            return;
        const el = n, tag = el.tagName.toLowerCase();
        if (el.classList.contains('math-edit')) {
            out += el.getAttribute('data-mathraw') || '';
            return;
        }
        if (el.classList.contains('sec-num'))
            return; // skip auto numbers
        if (el.classList.contains('citation')) {
            const keys = [...el.querySelectorAll('a')].map(a => (a.getAttribute('href') || '').replace('#bib-', '')).filter(Boolean);
            out += keys.length ? `\\cite{${keys.join(',')}}` : '';
            return;
        }
        if (el.classList.contains('ref-link')) {
            const key = (el.getAttribute('href') || '').replace('#label-', '');
            out += /^\(.*\)$/.test(el.textContent.trim()) ? `\\eqref{${key}}` : `\\ref{${key}}`;
            return;
        }
        if (tag === 'strong' || tag === 'b')
            out += `\\textbf{${proseToLatex(el)}}`;
        else if (tag === 'em' || tag === 'i')
            out += `\\emph{${proseToLatex(el)}}`;
        else if (tag === 'code')
            out += `\\texttt{${proseToLatex(el)}}`;
        else if (tag === 'u')
            out += `\\underline{${proseToLatex(el)}}`;
        else if (tag === 'a')
            out += `\\href{${el.getAttribute('href') || ''}}{${proseToLatex(el)}}`;
        else if (tag === 'br')
            out += '\\\\\n';
        else
            out += proseToLatex(el);
    });
    return out;
}
// ── PROSE: patch a block's source lines ─────────────────────────────────────
// kind: 'paragraph' | 'section' | 'subsection' | 'subsubsection'
function patchProseBlock(files, mainId, startLine, kind, newLatex) {
    const main = files.find(f => f.id === mainId);
    if (!main)
        return null;
    const lines = main.content.split('\n');
    if (startLine < 0 || startLine >= lines.length)
        return null;
    if (kind.startsWith('section') || kind === 'subsection' || kind === 'subsubsection' ||
        kind === 'chapter' || /section$/.test(kind)) {
        // replace the heading command's argument on this line
        const cmd = kind; // section/subsection/...
        lines[startLine] = lines[startLine].replace(new RegExp(`(\\\\${cmd}\\*?\\{)[^}]*(\\})`), `$1${newLatex}$2`);
        return files.map(f => f.id === mainId ? { ...f, content: lines.join('\n') } : f);
    }
    // paragraph: replace from startLine to the next blank line (exclusive)
    let end = startLine;
    while (end < lines.length && lines[end].trim() !== '')
        end++;
    const before = lines.slice(0, startLine);
    const after = lines.slice(end);
    const newLines = newLatex.split('\n');
    return files.map(f => f.id === mainId
        ? { ...f, content: [...before, ...newLines, ...after].join('\n') }
        : f);
}
// ── MATHQUILL POPOVER ───────────────────────────────────────────────────────
const MQ_PALETTE = [
    { label: '½', cmd: '\\frac', title: 'Fraction' },
    { label: '√', cmd: '\\sqrt', title: 'Square root' },
    { label: 'xⁿ', write: '^', title: 'Superscript' },
    { label: 'xₙ', write: '_', title: 'Subscript' },
    { label: '∑', cmd: '\\sum', title: 'Sum' },
    { label: '∫', cmd: '\\int', title: 'Integral' },
    { label: '∏', cmd: '\\prod', title: 'Product' },
    { label: '∂', write: '\\partial', title: 'Partial' },
    { label: '∇', write: '\\nabla', title: 'Nabla' },
    { label: '∞', write: '\\infty', title: 'Infinity' },
    { label: '→', write: '\\to', title: 'Arrow' },
    { label: '≤', write: '\\leq', title: '≤' },
    { label: '≥', write: '\\geq', title: '≥' },
    { label: '≠', write: '\\neq', title: '≠' },
    { label: '±', write: '\\pm', title: '±' },
    { label: '·', write: '\\cdot', title: 'Dot' },
    { label: 'α', write: '\\alpha', title: 'alpha' },
    { label: 'β', write: '\\beta', title: 'beta' },
    { label: 'θ', write: '\\theta', title: 'theta' },
    { label: 'λ', write: '\\lambda', title: 'lambda' },
    { label: 'μ', write: '\\mu', title: 'mu' },
    { label: 'π', write: '\\pi', title: 'pi' },
    { label: 'σ', write: '\\sigma', title: 'sigma' },
    { label: 'ω', write: '\\omega', title: 'omega' },
    { label: 'Σ', write: '\\Sigma', title: 'Sigma' },
    { label: 'Ω', write: '\\Omega', title: 'Omega' },
    { label: 'ℝ', write: '\\mathbb{R}', title: 'Reals' },
    { label: '⟨⟩', write: '\\langle\\rangle', title: 'Angle brackets' },
    { label: '⃗', cmd: '\\vec', title: 'Vector' },
    { label: '^', cmd: '\\hat', title: 'Hat' },
];
function MathEditorPopover({ initialLatex, kind, rect, onSave, onCancel, isNew, macros }) {
    const mqRef = useRef(null);
    const fieldRef = useRef(null);
    const taRef = useRef(null);
    const isMultiline = /\\\\|&/.test(initialLatex) || /align|gather|multline|eqnarray/.test(kind);
    const macroNames = Object.keys(macros || {});
    const usesMacro = macroNames.some(k => initialLatex.includes(k));
    const [rawMode, setRawMode] = useState(isMultiline || usesMacro);
    const [rawLatex, setRawLatex] = useState(initialLatex);
    const [rawPreview, setRawPreview] = useState('');
    // MathQuill init (simple math)
    useEffect(() => {
        if (rawMode || !window.MathQuill || !mqRef.current)
            return;
        const MQ = window.MathQuill.getInterface(2);
        const field = MQ.MathField(mqRef.current, {
            spaceBehavesLikeTab: true,
            handlers: { edit: () => { fieldRef.current = field; } },
        });
        fieldRef.current = field;
        try {
            field.latex(initialLatex || '');
        }
        catch (_a) { }
        setTimeout(() => field.focus(), 30);
        return () => { try {
            mqRef.current && (mqRef.current.innerHTML = '');
        }
        catch (_a) { } };
    }, [rawMode]);
    // Raw-mode live KaTeX preview (knows the document's custom macros)
    useEffect(() => {
        if (!rawMode)
            return;
        try {
            setRawPreview(window.katex.renderToString(rawLatex || '', {
                displayMode: true, throwOnError: false, errorColor: '#c00', strict: 'ignore', trust: true,
                macros: macros || {},
            }));
        }
        catch (e) {
            setRawPreview(`<span style="color:#c00">${e.message}</span>`);
        }
    }, [rawLatex, rawMode]);
    const applyPalette = (item) => {
        if (rawMode) {
            const ta = taRef.current;
            if (!ta)
                return;
            const ins = item.cmd ? item.cmd : item.write;
            const s = ta.selectionStart, e = ta.selectionEnd;
            const next = rawLatex.slice(0, s) + ins + rawLatex.slice(e);
            setRawLatex(next);
            setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + ins.length; }, 0);
            return;
        }
        const field = fieldRef.current;
        if (!field)
            return;
        if (item.cmd)
            field.cmd(item.cmd);
        else
            field.write(item.write);
        field.focus();
    };
    const handleSave = () => {
        const latex = rawMode ? rawLatex : (fieldRef.current ? fieldRef.current.latex() : initialLatex);
        onSave(latex);
    };
    // position: clamp to viewport
    const top = Math.min(Math.max(8, (rect ? rect.bottom + 8 : 80)), window.innerHeight - 320);
    const left = Math.min(Math.max(8, (rect ? rect.left : 80)), window.innerWidth - 440);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "mq-backdrop", onMouseDown: onCancel }),
        React.createElement("div", { className: "mq-popover", style: { top, left }, onMouseDown: e => e.stopPropagation() },
            React.createElement("div", { className: "mq-head" },
                React.createElement("span", { className: "mq-title" },
                    isNew ? 'New equation' : 'Edit math',
                    " \u00B7 ",
                    React.createElement("span", { className: "mq-kind" }, kind)),
                React.createElement("button", { className: "mq-mode", onClick: () => {
                        if (!rawMode && fieldRef.current)
                            setRawLatex(fieldRef.current.latex());
                        setRawMode(v => !v);
                    } }, rawMode ? 'Visual' : '⟨⟩ LaTeX')),
            rawMode ? (React.createElement("div", { className: "mq-raw" },
                React.createElement("textarea", { ref: taRef, className: "mq-textarea", value: rawLatex, spellCheck: false, onChange: e => setRawLatex(e.target.value), autoFocus: true, placeholder: "Type LaTeX \u2014 multi-line align/matrix supported here" }),
                React.createElement("div", { className: "mq-rawpreview", dangerouslySetInnerHTML: { __html: rawPreview } }))) : (React.createElement("div", { className: "mq-field-wrap" },
                React.createElement("span", { ref: mqRef, className: "mq-field" }))),
            React.createElement("div", { className: "mq-palette" }, MQ_PALETTE.map((it, i) => (React.createElement("button", { key: i, className: "mq-pal-btn", title: it.title, onMouseDown: e => { e.preventDefault(); applyPalette(it); } }, it.label)))),
            React.createElement("div", { className: "mq-actions" },
                React.createElement("span", { className: "mq-hint" }, "Patches only this equation in your source"),
                React.createElement("div", { className: "mq-action-btns" },
                    React.createElement("button", { className: "mq-cancel", onClick: onCancel }, "Cancel"),
                    React.createElement("button", { className: "mq-save", onClick: handleSave }, "Save"))))));
}
// Insert a new display equation after a given source line (or end of body)
function insertEquation(files, mainId, afterLine, latex) {
    const main = files.find(f => f.id === mainId);
    if (!main)
        return null;
    const lines = main.content.split('\n');
    let pos;
    if (afterLine == null || afterLine < 0 || afterLine >= lines.length) {
        const de = lines.findIndex(l => l.includes('\\end{document}'));
        pos = de >= 0 ? de : lines.length;
    }
    else {
        let end = afterLine;
        while (end < lines.length && lines[end].trim() !== '')
            end++;
        pos = end;
    }
    lines.splice(pos, 0, '', '\\begin{equation}', latex || '', '\\end{equation}');
    return files.map(f => f.id === mainId ? { ...f, content: lines.join('\n') } : f);
}
window.RTLEdit = {
    findMathSpans, collectMathSpans, buildMathRaw, patchMathBySeq, insertAfterSeq,
    insertEquation, proseToLatex, patchProseBlock,
};
window.MathEditorPopover = MathEditorPopover;
