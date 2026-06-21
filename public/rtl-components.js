// rtl-components.jsx — presentational components + editor constants
const { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } = React;
// ── SYMBOL DATA ───────────────────────────────────────────────────────────
const SYMBOL_DATA = {
    Greek: [['α', '\\alpha'], ['β', '\\beta'], ['γ', '\\gamma'], ['δ', '\\delta'], ['ε', '\\varepsilon'],
        ['ζ', '\\zeta'], ['η', '\\eta'], ['θ', '\\theta'], ['κ', '\\kappa'], ['λ', '\\lambda'],
        ['μ', '\\mu'], ['ν', '\\nu'], ['ξ', '\\xi'], ['π', '\\pi'], ['ρ', '\\rho'], ['σ', '\\sigma'],
        ['τ', '\\tau'], ['φ', '\\varphi'], ['χ', '\\chi'], ['ψ', '\\psi'], ['ω', '\\omega'],
        ['Γ', '\\Gamma'], ['Δ', '\\Delta'], ['Θ', '\\Theta'], ['Λ', '\\Lambda'], ['Ξ', '\\Xi'],
        ['Π', '\\Pi'], ['Σ', '\\Sigma'], ['Φ', '\\Phi'], ['Ψ', '\\Psi'], ['Ω', '\\Omega']],
    Sets: [['∈', '\\in'], ['∉', '\\notin'], ['⊂', '\\subset'], ['⊆', '\\subseteq'], ['∪', '\\cup'],
        ['∩', '\\cap'], ['∅', '\\emptyset'], ['ℝ', '\\mathbb{R}'], ['ℕ', '\\mathbb{N}'],
        ['ℤ', '\\mathbb{Z}'], ['ℚ', '\\mathbb{Q}'], ['ℂ', '\\mathbb{C}'], ['∀', '\\forall'], ['∃', '\\exists']],
    Ops: [['∑', '\\sum'], ['∏', '\\prod'], ['∫', '\\int'], ['∮', '\\oint'], ['∂', '\\partial'],
        ['∇', '\\nabla'], ['∞', '\\infty'], ['±', '\\pm'], ['×', '\\times'], ['÷', '\\div'],
        ['⊗', '\\otimes'], ['⊕', '\\oplus'], ['·', '\\cdot'], ['√', '\\sqrt{}'], ['∓', '\\mp']],
    Rel: [['≤', '\\leq'], ['≥', '\\geq'], ['≠', '\\neq'], ['≈', '\\approx'], ['≡', '\\equiv'],
        ['∼', '\\sim'], ['≅', '\\cong'], ['≪', '\\ll'], ['≫', '\\gg'], ['∝', '\\propto']],
    Arrows: [['→', '\\to'], ['←', '\\leftarrow'], ['↔', '\\leftrightarrow'], ['⇒', '\\Rightarrow'],
        ['⇐', '\\Leftarrow'], ['⇔', '\\Leftrightarrow'], ['↦', '\\mapsto'], ['⟹', '\\implies'],
        ['⟺', '\\iff'], ['↑', '\\uparrow'], ['↓', '\\downarrow']],
};
// ── TOOLBAR CONFIG ────────────────────────────────────────────────────────
const TOOLBAR = [
    { label: 'Format', items: [
            { t: 'B', title: 'Bold', ins: '\\textbf{|}' },
            { t: 'I', title: 'Italic', ins: '\\textit{|}', style: { fontStyle: 'italic' } },
            { t: 'TT', title: 'Monospace', ins: '\\texttt{|}', style: { fontFamily: 'monospace' } },
            { t: 'U̲', title: 'Underline', ins: '\\underline{|}' },
        ] },
    { label: 'Struct', items: [
            { t: '§', title: 'Section', ins: '\\section{|}' },
            { t: '§§', title: 'Subsection', ins: '\\subsection{|}' },
            { t: '§§§', title: 'Subsubsection', ins: '\\subsubsection{|}' },
        ] },
    { label: 'Math', items: [
            { t: '$·$', title: 'Inline math', ins: '$|$' },
            { t: '$$·$$', title: 'Display math', ins: '$$\n|\n$$' },
            { t: 'eq', title: 'Equation', ins: '\\begin{equation}\n|\n\\end{equation}' },
            { t: 'align', title: 'Align', ins: '\\begin{align}\n  | &= \\\\\\\\\n\\end{align}' },
            { t: '√', title: 'Square root', ins: '\\sqrt{|}' },
            { t: 'a/b', title: 'Fraction', ins: '\\frac{|}{}' },
        ] },
    { label: 'Envs', items: [
            { t: 'thm', title: 'Theorem', ins: '\\begin{theorem}\n|\n\\end{theorem}' },
            { t: 'def', title: 'Definition', ins: '\\begin{definition}\n|\n\\end{definition}' },
            { t: 'pf', title: 'Proof', ins: '\\begin{proof}\n|\n\\end{proof}' },
            { t: '•', title: 'Itemize', ins: '\\begin{itemize}\n  \\item |\n\\end{itemize}' },
            { t: '1.', title: 'Enumerate', ins: '\\begin{enumerate}\n  \\item |\n\\end{enumerate}' },
            { t: 'fig', title: 'Figure', ins: '\\begin{figure}[ht]\n  \\centering\n  |\n  \\caption{}\n  \\label{fig:}\n\\end{figure}' },
        ] },
    { label: 'Ref', items: [
            { t: '\\label', title: 'Label', ins: '\\label{|}' },
            { t: '\\ref', title: 'Ref', ins: '\\ref{|}' },
            { t: '\\cite', title: 'Cite', ins: '\\cite{|}' },
            { t: '\\fn', title: 'Footnote', ins: '\\footnote{|}' },
        ] },
];
// ── AUTOCOMPLETE COMMANDS ─────────────────────────────────────────────────
const AC_COMMANDS = [
    '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\varepsilon', '\\zeta', '\\eta',
    '\\theta', '\\vartheta', '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi',
    '\\varpi', '\\rho', '\\sigma', '\\tau', '\\upsilon', '\\phi', '\\varphi', '\\chi', '\\psi', '\\omega',
    '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Phi', '\\Psi', '\\Omega',
    '\\sum', '\\prod', '\\int', '\\oint', '\\iint', '\\iiint', '\\partial', '\\nabla',
    '\\infty', '\\pm', '\\mp', '\\times', '\\div', '\\cdot', '\\otimes', '\\oplus',
    '\\leq', '\\geq', '\\neq', '\\approx', '\\equiv', '\\sim', '\\simeq', '\\cong',
    '\\ll', '\\gg', '\\subset', '\\supset', '\\subseteq', '\\supseteq', '\\in', '\\notin',
    '\\cup', '\\cap', '\\setminus', '\\emptyset', '\\forall', '\\exists',
    '\\to', '\\leftarrow', '\\rightarrow', '\\leftrightarrow', '\\Rightarrow',
    '\\Leftarrow', '\\Leftrightarrow', '\\mapsto', '\\implies', '\\iff', '\\uparrow', '\\downarrow',
    '\\frac{}{}', '\\sqrt{}', '\\overline{}', '\\underline{}', '\\hat{}', '\\tilde{}',
    '\\vec{}', '\\dot{}', '\\ddot{}', '\\bar{}', '\\widehat{}', '\\widetilde{}',
    '\\mathbf{}', '\\mathit{}', '\\mathrm{}', '\\mathcal{}', '\\mathbb{}', '\\mathfrak{}',
    '\\text{}', '\\operatorname{}', '\\binom{}{}',
    '\\left(', '\\right)', '\\left[', '\\right]', '\\left\\{', '\\right\\}',
    '\\left|', '\\right|', '\\left\\|', '\\right\\|',
    '\\textbf{}', '\\textit{}', '\\texttt{}', '\\textsf{}', '\\textrm{}', '\\textsc{}',
    '\\emph{}', '\\underline{}', '\\textcolor{}{}',
    '\\section{}', '\\subsection{}', '\\subsubsection{}', '\\paragraph{}', '\\chapter{}',
    '\\title{}', '\\author{}', '\\date{}', '\\maketitle',
    '\\label{}', '\\ref{}', '\\eqref{}', '\\cite{}', '\\citep{}', '\\citet{}', '\\footnote{}',
    '\\href{}{}', '\\url{}', '\\includegraphics[]{}', '\\caption{}', '\\centering',
    '\\begin{equation}', '\\begin{equation*}', '\\begin{align}', '\\begin{align*}',
    '\\begin{gather}', '\\begin{gather*}', '\\begin{multline}',
    '\\begin{itemize}', '\\begin{enumerate}', '\\begin{description}',
    '\\begin{theorem}', '\\begin{lemma}', '\\begin{proposition}', '\\begin{corollary}',
    '\\begin{definition}', '\\begin{example}', '\\begin{proof}', '\\begin{remark}',
    '\\begin{abstract}', '\\begin{verbatim}', '\\begin{center}', '\\begin{quote}',
    '\\begin{tabular}{}', '\\begin{figure}', '\\begin{table}', '\\begin{tikzpicture}',
    '\\begin{thebibliography}{}', '\\bibitem{}', '\\bibliography{}', '\\bibliographystyle{}',
    '\\usepackage{}', '\\usepackage[]{}', '\\documentclass{}', '\\documentclass[]{}',
    '\\input{}', '\\include{}', '\\printbibliography', '\\addbibresource{}',
    '\\item', '\\newcommand{}{}', '\\renewcommand{}{}', '\\DeclareMathOperator{}{}',
    '\\LaTeX', '\\TeX', '\\ldots', '\\cdots', '\\vdots', '\\ddots', '\\quad', '\\qquad',
    '\\\\', '\\newline', '\\newpage', '\\noindent', '\\nonumber', '\\notag', '\\tag{}',
    '\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\exp', '\\lim', '\\max', '\\min', '\\sup', '\\inf',
    '\\det', '\\gcd', '\\arg', '\\dim', '\\ker', '\\hline', '\\toprule', '\\midrule', '\\bottomrule',
    '\\mathbb{R}', '\\mathbb{N}', '\\mathbb{Z}', '\\mathbb{Q}', '\\mathbb{C}',
];
// ── OUTLINE EXTRACTOR ─────────────────────────────────────────────────────
function extractOutline(latex) {
    const result = [];
    const lines = latex.split('\n');
    let s = 0, sub = 0, subsub = 0;
    lines.forEach((line, lineIdx) => {
        const m = line.match(/\\(chapter|section|subsection|subsubsection)(\*?)\{([^}]*)\}/);
        if (!m)
            return;
        const [, env, star, title] = m;
        if (!star) {
            if (env === 'chapter' || env === 'section') {
                s++;
                sub = 0;
                subsub = 0;
            }
            else if (env === 'subsection') {
                sub++;
                subsub = 0;
            }
            else if (env === 'subsubsection')
                subsub++;
        }
        const num = env === 'section' ? `${s}` : env === 'subsection' ? `${s}.${sub}` :
            env === 'subsubsection' ? `${s}.${sub}.${subsub}` : '';
        result.push({ env, title, line: lineIdx, num, star: !!star });
    });
    return result;
}
// ── CODEMIRROR EDITOR ──────────────────────────────────────────────────────
const Editor = forwardRef(function Editor({ value, onChange, onFindOpen, onCompile }, apiRef) {
    const taRef = useRef(null);
    const cmRef = useRef(null);
    const suppressRef = useRef(false);
    const marksRef = useRef([]);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    useEffect(() => {
        if (!taRef.current || !window.CodeMirror)
            return;
        const cm = window.CodeMirror.fromTextArea(taRef.current, {
            mode: 'stex', theme: 'rtl-dark', lineNumbers: true, lineWrapping: true,
            autofocus: true, matchBrackets: true,
            gutters: ['CodeMirror-linenumbers', 'rtl-diag-gutter'],
            autoCloseBrackets: { pairs: '{}[]()$$', explode: '{}' },
            indentUnit: 2, tabSize: 2,
            extraKeys: {
                'Tab': cm => cm.replaceSelection('  '),
                'Ctrl-F': () => onFindOpen(),
                'Cmd-F': () => onFindOpen(),
                'Ctrl-Enter': () => onCompile && onCompile(),
                'Cmd-Enter': () => onCompile && onCompile(),
            },
        });
        cm.on('keyup', (cm, e) => {
            if (e.key === 'Escape' || e.ctrlKey || e.metaKey)
                return;
            const cursor = cm.getCursor();
            const before = cm.getLine(cursor.line).slice(0, cursor.ch);
            if (before.match(/\\[a-zA-Z]{0,30}$/) && window.CodeMirror.showHint) {
                cm.showHint({ hint: latexHint, completeSingle: false, alignWithWord: true });
            }
        });
        function latexHint(cm) {
            const cursor = cm.getCursor();
            const before = cm.getLine(cursor.line).slice(0, cursor.ch);
            const match = before.match(/(\\[a-zA-Z]*)$/);
            if (!match)
                return null;
            const token = match[1];
            const from = { line: cursor.line, ch: cursor.ch - token.length };
            const list = AC_COMMANDS.filter(c => c.startsWith(token)).slice(0, 30).map(c => {
                const braceIdx = c.indexOf('{}');
                return { text: c, displayText: c, hint: (cm, data, comp) => {
                        cm.replaceRange(comp.text, data.from, data.to);
                        if (braceIdx > -1)
                            cm.setCursor({ line: data.from.line, ch: data.from.ch + braceIdx + 1 });
                    } };
            });
            return list.length ? { list, from, to: cursor } : null;
        }
        cm.on('change', () => { if (!suppressRef.current)
            onChangeRef.current(cm.getValue()); });
        cmRef.current = cm;
        return () => { try {
            cm.toTextArea();
        }
        catch (e) { } };
    }, []);
    useEffect(() => {
        const cm = cmRef.current;
        if (!cm || cm.getValue() === value)
            return;
        suppressRef.current = true;
        const cur = cm.getCursor();
        const scroll = cm.getScrollInfo();
        cm.setValue(value || '');
        cm.setCursor(cur);
        cm.scrollTo(scroll.left, scroll.top);
        suppressRef.current = false;
    }, [value]);
    useImperativeHandle(apiRef, () => ({
        insert(text) {
            const cm = cmRef.current;
            if (!cm)
                return;
            const pipeIdx = text.indexOf('|');
            const cursor = cm.getCursor();
            cm.replaceRange(text.replace(/\|/g, ''), cursor);
            if (pipeIdx > -1)
                cm.setCursor({ line: cursor.line, ch: cursor.ch + pipeIdx });
            cm.focus();
        },
        goToLine(lineNum) {
            const cm = cmRef.current;
            if (!cm)
                return;
            cm.setCursor({ line: lineNum, ch: 0 });
            const t = cm.charCoords({ line: lineNum, ch: 0 }, 'local').top;
            cm.getScrollerElement().scrollTop = Math.max(0, t - 80);
            cm.focus();
        },
        find(query) {
            const cm = cmRef.current;
            if (!cm || !query) {
                this.clearFind();
                return 0;
            }
            marksRef.current.forEach(m => m.clear());
            marksRef.current = [];
            const cur = cm.getSearchCursor(query, null, { caseFold: true });
            let count = 0, first = null;
            while (cur.findNext()) {
                count++;
                if (!first)
                    first = cur.from();
                marksRef.current.push(cm.markText(cur.from(), cur.to(), { className: 'find-highlight' }));
            }
            if (first) {
                cm.setCursor(first);
                const t = cm.charCoords(first, 'local').top;
                cm.getScrollerElement().scrollTop = Math.max(0, t - 80);
            }
            return count;
        },
        findNext(query, forward = true) {
            const cm = cmRef.current;
            if (!cm || !query)
                return;
            const from = cm.getCursor(forward ? 'to' : 'from');
            const cur = cm.getSearchCursor(query, from, { caseFold: true });
            const found = forward ? cur.findNext() : cur.findPrevious();
            if (found) {
                cm.setSelection(cur.from(), cur.to());
                const t = cm.charCoords(cur.from(), 'local').top;
                cm.getScrollerElement().scrollTop = Math.max(0, t - 80);
            }
            else {
                const wrap = cm.getSearchCursor(query, forward ? { line: 0, ch: 0 } : { line: cm.lastLine(), ch: 1e9 }, { caseFold: true });
                if (forward ? wrap.findNext() : wrap.findPrevious())
                    cm.setSelection(wrap.from(), wrap.to());
            }
        },
        clearFind() { marksRef.current.forEach(m => m.clear()); marksRef.current = []; },
        setDiagnostics(diags) {
            const cm = cmRef.current;
            if (!cm)
                return;
            cm.operation(() => {
                cm.clearGutter('rtl-diag-gutter');
                (this._lineMarks || []).forEach(m => m && cm.removeLineClass(m, 'background'));
                this._lineMarks = [];
                const last = cm.lastLine();
                (diags || []).forEach(d => {
                    if (d.line == null)
                        return;
                    const ln = Math.max(0, Math.min(last, d.line - 1));
                    const marker = document.createElement('div');
                    marker.className = `diag-gutter-mark diag-gutter-${d.type}`;
                    marker.textContent = d.type === 'error' ? '✕' : '⚠';
                    marker.title = d.message;
                    cm.setGutterMarker(ln, 'rtl-diag-gutter', marker);
                    this._lineMarks.push(cm.addLineClass(ln, 'background', `diag-line-${d.type}`));
                });
            });
            const si = cm.getScrollInfo();
            cm.scrollTo(si.left, si.top + 1);
            cm.scrollTo(si.left, si.top);
            cm.refresh();
        },
        clearDiagnostics() {
            const cm = cmRef.current;
            if (!cm)
                return;
            cm.clearGutter('rtl-diag-gutter');
            (this._lineMarks || []).forEach(m => m && cm.removeLineClass(m, 'background'));
            this._lineMarks = [];
        },
    }), []);
    return React.createElement("div", { className: "cm-wrap" },
        React.createElement("textarea", { ref: taRef, defaultValue: value }));
});
// ── TOOLBAR ────────────────────────────────────────────────────────────────
function Toolbar({ onInsert, showSymbols, setShowSymbols }) {
    return (React.createElement("div", { className: "editor-toolbar" },
        TOOLBAR.map((group, gi) => (React.createElement(React.Fragment, { key: gi },
            gi > 0 && React.createElement("div", { className: "ebar-sep" }),
            React.createElement("span", { className: "ebar-label" }, group.label),
            group.items.map((item, ii) => (React.createElement("button", { key: ii, className: "ebar-btn", title: item.title, style: item.style || {}, onClick: () => onInsert(item.ins) }, item.t)))))),
        React.createElement("div", { className: "ebar-sep" }),
        React.createElement("button", { className: `ebar-btn${showSymbols ? ' active' : ''}`, title: "Symbol palette", onClick: () => setShowSymbols(v => !v) }, "\u03A9")));
}
// ── SYMBOL PALETTE ─────────────────────────────────────────────────────────
function SymbolPalette({ onInsert }) {
    const [tab, setTab] = useState('Greek');
    return (React.createElement("div", { className: "symbol-palette" },
        React.createElement("div", { className: "sym-tabs" }, Object.keys(SYMBOL_DATA).map(cat => (React.createElement("button", { key: cat, className: `sym-tab${tab === cat ? ' active' : ''}`, onClick: () => setTab(cat) }, cat)))),
        React.createElement("div", { className: "sym-grid" }, (SYMBOL_DATA[tab] || []).map(([disp, latex], i) => (React.createElement("button", { key: i, className: "sym-btn", title: latex, onClick: () => onInsert(latex + ' ') }, disp))))));
}
// ── FIND BAR ───────────────────────────────────────────────────────────────
function FindBar({ editorRef, onClose }) {
    const [query, setQuery] = useState('');
    const [count, setCount] = useState(0);
    const inputRef = useRef(null);
    useEffect(() => { var _a; (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, []);
    const handleChange = e => { var _a; const q = e.target.value; setQuery(q); setCount(((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.find(q)) || 0); };
    const handleClose = () => { var _a; (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.clearFind(); onClose(); };
    return (React.createElement("div", { className: "find-bar" },
        React.createElement("span", { className: "find-icon" }, "\u2315"),
        React.createElement("input", { ref: inputRef, className: "find-input", placeholder: "Find in file\u2026", value: query, onChange: handleChange, onKeyDown: e => { var _a; if (e.key === 'Escape')
                handleClose(); if (e.key === 'Enter')
                (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.findNext(query, !e.shiftKey); } }),
        query && React.createElement("span", { className: "find-count" },
            count,
            " match",
            count !== 1 ? 'es' : ''),
        React.createElement("button", { className: "find-nav", title: "Previous", onClick: () => { var _a; return (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.findNext(query, false); } }, "\u2191"),
        React.createElement("button", { className: "find-nav", title: "Next", onClick: () => { var _a; return (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.findNext(query, true); } }, "\u2193"),
        React.createElement("button", { className: "find-close", onClick: handleClose }, "\u2715")));
}
// ── OUTLINE PANEL ──────────────────────────────────────────────────────────
function OutlinePanel({ outline, editorRef }) {
    if (!outline.length)
        return React.createElement("div", { className: "outline-empty" }, "No sections yet");
    return (React.createElement("div", { className: "outline-list" }, outline.map((item, i) => (React.createElement("button", { key: i, className: `outline-item outline-${item.env}`, title: item.title, onClick: () => { var _a; return (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.goToLine(item.line); } },
        React.createElement("span", { className: "outline-num" }, item.star ? '' : item.num),
        React.createElement("span", { className: "outline-title" }, item.title))))));
}
// ── LIVE HTML PREVIEW ──────────────────────────────────────────────────────
function LivePreview({ html, tweaks, onJumpToSource, editMode, onEditMath, onProseCommit, onBlockFocus }) {
    const paperBg = { white: '#FDFCF8', warm: '#F7F1E3', sepia: '#F5EDD8', dark: '#1E1E28' };
    const paperFg = { white: '#1A1A1A', warm: '#2A1F0F', sepia: '#3A2C1A', dark: '#D8D0C8' };
    const fonts = { 'EB Garamond': "'EB Garamond',Georgia,serif", 'Georgia': 'Georgia,serif',
        'Palatino': "'Palatino Linotype',Palatino,serif", 'Times': "'Times New Roman',Times,serif" };
    const docRef = useRef(null);
    const blockKind = (el) => {
        if (el.classList.contains('latex-section'))
            return 'section';
        if (el.classList.contains('latex-subsection'))
            return 'subsection';
        if (el.classList.contains('latex-subsubsection'))
            return 'subsubsection';
        if (el.classList.contains('latex-chapter'))
            return 'chapter';
        if (el.tagName === 'P')
            return 'paragraph';
        return null;
    };
    // Apply edit-mode affordances after each render
    useEffect(() => {
        const doc = docRef.current;
        if (!doc)
            return;
        // always make math chips non-text-editable so caret can't land inside KaTeX
        doc.querySelectorAll('.math-edit').forEach(m => m.setAttribute('contenteditable', 'false'));
        const editables = [];
        if (editMode) {
            doc.querySelectorAll('[data-src-line]').forEach(el => {
                const kind = blockKind(el);
                // exclude blocks with footnotes (can't round-trip the note text safely)
                if (!kind || el.querySelector('.fn-ref'))
                    return;
                el.setAttribute('contenteditable', 'true');
                el.classList.add('prose-editable');
                editables.push(el);
            });
        }
        return () => {
            editables.forEach(el => { el.removeAttribute('contenteditable'); el.classList.remove('prose-editable'); });
        };
    }, [html, editMode]);
    const handleClick = (e) => {
        // Math chip → open the math editor (in edit mode)
        if (editMode) {
            const m = e.target.closest('.math-edit');
            if (m) {
                e.preventDefault();
                e.stopPropagation();
                onEditMath && onEditMath({
                    seq: parseInt(m.getAttribute('data-mathseq')),
                    kind: m.getAttribute('data-mathkind'),
                    raw: m.getAttribute('data-mathraw'),
                    rect: m.getBoundingClientRect(),
                });
                return;
            }
            return; // let contentEditable handle prose clicks
        }
        // Not in edit mode → click-to-source
        if (!onJumpToSource)
            return;
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed)
            return;
        if (e.target.closest('a'))
            return;
        const el = e.target.closest('[data-src-line]');
        if (el)
            onJumpToSource(parseInt(el.getAttribute('data-src-line')));
    };
    // Commit prose edits on blur
    const handleBlur = (e) => {
        if (!editMode || !onProseCommit)
            return;
        const block = e.target.closest && e.target.closest('.prose-editable');
        if (!block)
            return;
        const kind = blockKind(block);
        const startLine = parseInt(block.getAttribute('data-src-line'));
        if (isNaN(startLine) || !kind)
            return;
        const latex = window.RTLEdit.proseToLatex(block).replace(/\s+\n/g, '\n').trim();
        onProseCommit({ startLine, kind, latex });
    };
    const handleFocus = (e) => {
        if (!editMode || !onBlockFocus)
            return;
        const block = e.target.closest && e.target.closest('.prose-editable');
        if (block) {
            const l = parseInt(block.getAttribute('data-src-line'));
            if (!isNaN(l))
                onBlockFocus(l);
        }
    };
    return (React.createElement("div", { className: "preview-scroll" },
        React.createElement("div", { className: `preview-document${onJumpToSource && !editMode ? ' clickable-src' : ''}${editMode ? ' edit-mode' : ''}`, ref: docRef, onClick: handleClick, onBlur: handleBlur, onFocus: handleFocus, style: { background: paperBg[tweaks.paperStyle] || paperBg.white,
                color: paperFg[tweaks.paperStyle] || paperFg.white,
                fontFamily: fonts[tweaks.previewFont] || fonts['EB Garamond'],
                fontSize: tweaks.fontSize + 'px', lineHeight: tweaks.lineHeight }, dangerouslySetInnerHTML: { __html: html } })));
}
// ── TWEAKS PANEL ───────────────────────────────────────────────────────────
function TweaksPanel({ tweaks, setTweaks, onClose }) {
    const set = (k, v) => setTweaks(p => ({ ...p, [k]: v }));
    return (React.createElement("div", { className: "tweaks-panel" },
        React.createElement("div", { className: "tweaks-header" },
            React.createElement("span", { className: "tweaks-title" }, "Tweaks"),
            React.createElement("button", { className: "tweaks-close", onClick: onClose }, "\u2715")),
        React.createElement("div", { className: "tw-row" },
            React.createElement("label", { className: "tw-label" }, "Preview Font"),
            React.createElement("select", { className: "tw-select", value: tweaks.previewFont, onChange: e => set('previewFont', e.target.value) }, ['EB Garamond', 'Georgia', 'Palatino', 'Times'].map(f => React.createElement("option", { key: f }, f)))),
        React.createElement("div", { className: "tw-row" },
            React.createElement("label", { className: "tw-label" },
                "Font Size: ",
                tweaks.fontSize,
                "px"),
            React.createElement("input", { type: "range", className: "tw-slider", min: 13, max: 24, step: 0.5, value: tweaks.fontSize, onChange: e => set('fontSize', parseFloat(e.target.value)) })),
        React.createElement("div", { className: "tw-row" },
            React.createElement("label", { className: "tw-label" },
                "Line Height: ",
                tweaks.lineHeight),
            React.createElement("input", { type: "range", className: "tw-slider", min: 1.3, max: 2.2, step: 0.05, value: tweaks.lineHeight, onChange: e => set('lineHeight', parseFloat(e.target.value)) })),
        React.createElement("div", { className: "tw-row" },
            React.createElement("label", { className: "tw-label" }, "Live Preview Paper"),
            React.createElement("select", { className: "tw-select", value: tweaks.paperStyle, onChange: e => set('paperStyle', e.target.value) }, ['white', 'warm', 'sepia', 'dark'].map(s => React.createElement("option", { key: s }, s))))));
}
// Export to window for the app file
Object.assign(window, {
    Editor, Toolbar, SymbolPalette, FindBar, OutlinePanel, LivePreview, TweaksPanel,
    extractOutline, SYMBOL_DATA, TOOLBAR, AC_COMMANDS,
});
