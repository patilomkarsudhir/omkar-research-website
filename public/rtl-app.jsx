// rtl-app.jsx — container: multi-file project, real PDF compilation, viewer
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const RC = window.RTLCompile;

// ── PDF CACHE (IndexedDB) ───────────────────────────────────────────────────
// Survives reload so you don't lose the last compiled PDF.
const PDF_DB = 'rtl-pdf-cache';
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PDF_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('pdfs');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function cachePdf(project, blob) {
  if (!blob) return;
  try {
    const db = await idbOpen();
    const tx = db.transaction('pdfs', 'readwrite');
    tx.objectStore('pdfs').put({ blob, name: project.name, ts: Date.now() }, 'last');
    db.close();
  } catch {}
}
async function loadCachedPdf() {
  try {
    const db = await idbOpen();
    const rec = await new Promise((res, rej) => {
      const r = db.transaction('pdfs', 'readonly').objectStore('pdfs').get('last');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    db.close();
    return rec && rec.blob ? rec.blob : null;
  } catch { return null; }
}

// ── DEFAULT PROJECT ─────────────────────────────────────────────────────────
const MAIN_TEX = `\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{graphicx}
\\usepackage{tikz}
\\usepackage[numbers]{natbib}
\\usepackage{hyperref}

\\newcommand{\\norm}[1]{\\left\\|#1\\right\\|}
\\newcommand{\\inner}[2]{\\langle #1,\\, #2 \\rangle}

\\newtheorem{theorem}{Theorem}[section]
\\newtheorem{definition}{Definition}[section]

\\title{Real-Time \\LaTeX: A Researcher-Grade Scratchpad}
\\author{Jane Doe \\and John Smith}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
This document is compiled by a \\emph{real} TeX Live engine over the network:
TikZ, \\texttt{natbib} citations, custom macros, theorem environments, and
multi-file \\texttt{\\textbackslash input} all work exactly as in a desktop
LaTeX install. The instant HTML preview gives you sub-second feedback while
you type; hit \\textbf{Compile} for the submission-grade PDF.
\\end{abstract}

\\input{intro.tex}

\\section{The Cauchy-Schwarz Inequality}
\\label{sec:cs}

Let $H$ be a Hilbert space with inner product $\\inner{\\cdot}{\\cdot}$ and induced
norm $\\norm{x} = \\sqrt{\\inner{x}{x}}$.

\\begin{theorem}[Cauchy-Schwarz]
\\label{thm:cs}
For all $x, y \\in H$,
\\begin{equation}
\\label{eq:cs}
|\\inner{x}{y}|^2 \\leq \\inner{x}{x}\\cdot\\inner{y}{y}.
\\end{equation}
\\end{theorem}

Equation~\\eqref{eq:cs} is the cornerstone of inner-product geometry;
see~\\citet{rudin1976} for a classical treatment.

\\section{A TikZ Figure}

\\begin{figure}[ht]
\\centering
\\begin{tikzpicture}[scale=1.4]
  \\draw[->] (-0.2,0) -- (2.4,0) node[right] {$x$};
  \\draw[->] (0,-0.2) -- (0,2.4) node[above] {$y$};
  \\draw[thick,blue] (0,0) -- (2,1.2) node[midway,above left] {$x$};
  \\draw[thick,red]  (0,0) -- (1.2,2) node[midway,right] {$y$};
  \\draw (0,0) circle (0.4);
\\end{tikzpicture}
\\caption{Two vectors in $H$ and the angle between them.}
\\label{fig:vectors}
\\end{figure}

Figure~\\ref{fig:vectors} illustrates the geometry behind~\\eqref{eq:cs}.

\\bibliographystyle{plainnat}
\\bibliography{refs}

\\end{document}
`;

const INTRO_TEX = `\\section{Introduction}
\\label{sec:intro}

This section lives in a separate file, \\texttt{intro.tex}, and is pulled in
with \\verb|\\input{intro.tex}|. Multi-file projects keep large papers
manageable: one file per section or chapter. Foundational analysis results
trace back to \\citet{rudin1976} and the inequality compendium
of~\\citet{hardy1952}.
`;

const REFS_BIB = `@book{rudin1976,
  author    = {Walter Rudin},
  title     = {Principles of Mathematical Analysis},
  edition   = {3rd},
  publisher = {McGraw-Hill},
  year      = {1976}
}

@book{hardy1952,
  author    = {G. H. Hardy and J. E. Littlewood and G. P\\'olya},
  title     = {Inequalities},
  publisher = {Cambridge University Press},
  year      = {1952}
}
`;

let _idc = 0;
const newId = () => `f${Date.now()}_${_idc++}`;

function defaultProject() {
  return {
    name: 'Untitled Paper',
    compiler: 'pdflatex',
    mainFile: 'main',
    files: [
      { id:'main',  name:'main.tex',  content: MAIN_TEX },
      { id:'intro', name:'intro.tex', content: INTRO_TEX },
      { id:'refs',  name:'refs.bib',  content: REFS_BIB },
    ],
  };
}

// ── TEMPLATES ───────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id:'default', name:'Demo paper', desc:'The full feature tour (TikZ, natbib, theorems)',
    make: defaultProject,
  },
  {
    id:'article', name:'Article', desc:'Minimal article — start clean',
    make: () => ({ name:'Untitled', compiler:'pdflatex', mainFile:'main', files:[
      { id:'main', name:'main.tex', content:
`\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Title}
\\author{Author}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Abstract goes here.
\\end{abstract}

\\section{Introduction}

Write here. Inline math like $e^{i\\pi}+1=0$ works, and display math:
\\begin{equation}
  \\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}.
\\end{equation}

\\end{document}
` }] }),
  },
  {
    id:'neurips', name:'NeurIPS', desc:'neurips_2023 style (falls back to article if class absent)',
    make: () => ({ name:'NeurIPS Submission', compiler:'pdflatex', mainFile:'main', files:[
      { id:'main', name:'main.tex', content:
`% NeurIPS uses the neurips_2023.sty package. The compile server fetches it
% from CTAN automatically. If unavailable it falls back gracefully.
\\documentclass{article}
\\usepackage[preprint]{neurips_2023}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage[numbers]{natbib}

\\title{Your Paper Title}
\\author{%
  First Author\\\\
  Department\\\\
  Institution\\\\
  \\texttt{email@domain.edu}
}

\\begin{document}
\\maketitle

\\begin{abstract}
The abstract paragraph.
\\end{abstract}

\\section{Introduction}
\\label{sec:intro}
Your introduction. Cite like \\citep{lecun2015deep}.

\\section{Method}
\\begin{equation}
  \\mathcal{L}(\\theta) = \\frac{1}{N}\\sum_{i=1}^N \\ell(f_\\theta(x_i), y_i).
\\end{equation}

\\bibliographystyle{plainnat}
\\bibliography{refs}
\\end{document}
` },
      { id:'refs', name:'refs.bib', content:
`@article{lecun2015deep,
  title={Deep learning},
  author={LeCun, Yann and Bengio, Yoshua and Hinton, Geoffrey},
  journal={Nature},
  volume={521},
  number={7553},
  pages={436--444},
  year={2015}
}
` }] }),
  },
  {
    id:'ieee', name:'IEEE', desc:'IEEEtran journal class',
    make: () => ({ name:'IEEE Submission', compiler:'pdflatex', mainFile:'main', files:[
      { id:'main', name:'main.tex', content:
`\\documentclass[journal]{IEEEtran}
\\usepackage{amsmath, amssymb}
\\usepackage{graphicx}
\\usepackage{cite}

\\begin{document}
\\title{Paper Title}
\\author{First Author,~\\IEEEmembership{Member,~IEEE}
\\thanks{Manuscript received \\today.}}

\\markboth{Journal of \\LaTeX\\ Class Files}{Author: Title}
\\maketitle

\\begin{abstract}
The abstract.
\\end{abstract}

\\begin{IEEEkeywords}
keyword, keyword.
\\end{IEEEkeywords}

\\IEEEpeerreviewmaketitle

\\section{Introduction}
\\IEEEPARstart{T}{his} is the first paragraph.

\\section{Method}
\\begin{equation}
  y = Hx + n.
\\end{equation}

\\end{document}
` }] }),
  },
  {
    id:'beamer', name:'Beamer', desc:'Presentation slides',
    make: () => ({ name:'Slides', compiler:'pdflatex', mainFile:'main', files:[
      { id:'main', name:'main.tex', content:
`\\documentclass{beamer}
\\usetheme{metropolis}
\\usepackage{amsmath}

\\title{Presentation Title}
\\author{Author}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{frame}{First Slide}
  \\begin{itemize}
    \\item Point one
    \\item Point two
  \\end{itemize}
\\end{frame}

\\begin{frame}{Math}
  \\[ E = mc^2 \\]
\\end{frame}

\\end{document}
` }] }),
  },
];

function loadProject() {
  try {
    const saved = JSON.parse(localStorage.getItem('rtl-project') || 'null');
    if (saved && saved.files && saved.files.length) return saved;
  } catch {}
  // migrate legacy single-doc content
  const legacy = localStorage.getItem('rtl-content');
  if (legacy) {
    const wrapped = /\\documentclass/.test(legacy) ? legacy :
      `\\documentclass[11pt]{article}\n\\usepackage{amsmath,amssymb,amsthm}\n\\begin{document}\n${legacy}\n\\end{document}\n`;
    return { name:'Untitled', compiler:'pdflatex', mainFile:'main',
      files:[{ id:'main', name:'main.tex', content: wrapped }] };
  }
  return defaultProject();
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "previewFont": "EB Garamond",
  "fontSize": 17,
  "paperStyle": "white",
  "lineHeight": 1.7
}/*EDITMODE-END*/;

// Inject source-line markers (\x07N\x07) at each block start, for click-to-source.
function markLines(src){
  const lines = src.split('\n'); let inBlock=false;
  return lines.map((ln,i)=>{
    if(ln.trim()===''){ inBlock=false; return ln; }
    if(!inBlock){ inBlock=true; return '\x07'+i+'\x07'+ln; }
    return ln;
  }).join('\n');
}

// Inline \input / \include for the live preview.
// Verbatim spans and comments are shielded so a literal \input written inside
// \verb|...|, a verbatim environment, or a comment is NOT expanded (which would
// otherwise re-inline a file into itself and duplicate its content).
function expandInputs(content, files, depth=0) {
  if (depth > 5) return content;
  const guards = [];
  const stash = m => { const id = `\x00G${guards.length}\x00`; guards.push(m); return id; };
  let s = content
    .replace(/\\begin\{(verbatim|lstlisting|Verbatim)\}[\s\S]*?\\end\{\1\}/g, stash)
    .replace(/\\verb\*?(\S)[\s\S]*?\1/g, stash)
    .replace(/(?<!\\)%[^\n]*/g, stash);
  s = s.replace(/\\(?:input|include)\{([^}]+)\}/g, (_, name) => {
    const want = name.trim().replace(/\.tex$/,'');
    const f = files.find(x => x.name.replace(/\.tex$/,'') === want);
    return f ? expandInputs(f.content, files, depth+1) : '';
  });
  return s.replace(/\x00G(\d+)\x00/g, (_, i) => guards[+i]);
}

// ── FILE TREE ───────────────────────────────────────────────────────────────
const KIND_ICON = { tex:'∫', bib:'❝', image:'▦', style:'§', default:'·' };

function FileTree({ project, activeId, onOpen, onAdd, onRename, onDelete, onSetMain, onUpload }) {
  const [menu, setMenu] = useState(null); // file id with open menu
  const fileInput = useRef(null);
  return (
    <div className="filetree">
      <div className="filetree-actions">
        <button className="ft-act" title="New file" onClick={onAdd}>+ File</button>
        <button className="ft-act" title="Upload image" onClick={()=>fileInput.current?.click()}>↑ Img</button>
        <input ref={fileInput} type="file" accept="image/*" style={{display:'none'}}
          onChange={e => { if(e.target.files[0]) onUpload(e.target.files[0]); e.target.value=''; }} />
      </div>
      <div className="filetree-list">
        {project.files.map(f => {
          const kind = RC.fileKind(f.name);
          const isMain = f.id === project.mainFile;
          return (
            <div key={f.id} className={`ft-item${f.id===activeId?' active':''}`}
              onClick={()=>onOpen(f.id)}>
              <span className={`ft-icon ft-icon-${kind}`}>{KIND_ICON[kind]||KIND_ICON.default}</span>
              <span className="ft-name">{f.name}</span>
              {isMain && <span className="ft-badge" title="Main file">main</span>}
              <button className="ft-menu-btn" title="Options"
                onClick={e=>{ e.stopPropagation(); setMenu(menu===f.id?null:f.id); }}>⋯</button>
              {menu===f.id && (
                <div className="ft-menu" onClick={e=>e.stopPropagation()}>
                  {!isMain && kind==='tex' && <button onClick={()=>{onSetMain(f.id);setMenu(null);}}>Set as main</button>}
                  <button onClick={()=>{onRename(f.id);setMenu(null);}}>Rename</button>
                  {project.files.length>1 && <button className="danger" onClick={()=>{onDelete(f.id);setMenu(null);}}>Delete</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PDF VIEWER (PDF.js canvas — works in sandboxed iframes) ─────────────────
function PdfViewer({ pdfUrl, compiling, progress, onDownload }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(() => parseFloat(localStorage.getItem('rtl-pdf-scale')||'1.3'));
  const [pageCount, setPageCount] = useState(0);
  const [renderErr, setRenderErr] = useState(null);
  const docRef = useRef(null);
  const renderTokenRef = useRef(0);

  useEffect(() => { localStorage.setItem('rtl-pdf-scale', scale); }, [scale]);

  // Load (cached per-URL) + render all pages to canvas. One effect to avoid
  // ref/ordering races; zoom re-renders without re-downloading.
  useEffect(() => {
    if (!pdfUrl || !window.pdfjsLib) { setPageCount(0); docRef.current = null; return; }
    let cancelled = false;
    const container = containerRef.current;
    (async () => {
      setRenderErr(null);
      let doc = (docRef.current && docRef.current._rtlUrl === pdfUrl) ? docRef.current : null;
      if (!doc) {
        // In a bundled/offline file the worker is inlined and exposed via __resources
        if (window.__resources && window.__resources.pdfWorker && window.pdfjsLib)
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = window.__resources.pdfWorker;
        try { doc = await window.pdfjsLib.getDocument(pdfUrl).promise; doc._rtlUrl = pdfUrl; docRef.current = doc; }
        catch (e) { if (!cancelled) setRenderErr(e.message || 'Failed to load PDF'); return; }
      }
      if (cancelled) return;
      setPageCount(doc.numPages);
      if (!container) return;
      container.innerHTML = '';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let n = 1; n <= doc.numPages; n++) {
        let page;
        try { page = await doc.getPage(n); } catch { continue; }
        if (cancelled) return;
        const vp = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page';
        canvas.width = Math.floor(vp.width * dpr);
        canvas.height = Math.floor(vp.height * dpr);
        canvas.style.width = vp.width + 'px';
        canvas.style.height = vp.height + 'px';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        try { await page.render({ canvasContext: ctx, viewport: vp }).promise; } catch {}
        if (cancelled) return;
      }
    })();
    return () => { cancelled = true; };
  }, [pdfUrl, scale]);

  if (compiling) return (
    <div className="pdf-empty">
      <div className="pdf-spinner" />
      <div className="pdf-empty-text">Compiling with TeX Live…</div>
      <div className="pdf-empty-sub">
        {progress && progress.endpoint
          ? <>{progress.endpoint}{progress.attempt>1?` · retry ${progress.attempt}`:''} — full engine (TikZ, biblatex, custom classes)</>
          : 'Full engine — TikZ, biblatex, custom classes'}
      </div>
    </div>
  );
  if (!pdfUrl) return (
    <div className="pdf-empty">
      <div className="pdf-empty-icon">⌘↵</div>
      <div className="pdf-empty-text">No PDF yet</div>
      <div className="pdf-empty-sub">Hit <b>Compile</b> (or ⌘/Ctrl+Enter) to render a real, submission-grade PDF.</div>
    </div>
  );
  return (
    <div className="pdf-view">
      <div className="pdf-toolbar">
        <span className="pdf-pages">{pageCount} page{pageCount!==1?'s':''}</span>
        <div className="pdf-zoom">
          <button onClick={()=>setScale(s=>Math.max(0.5, +(s-0.15).toFixed(2)))} title="Zoom out">−</button>
          <span className="pdf-zoom-val">{Math.round(scale*100)}%</span>
          <button onClick={()=>setScale(s=>Math.min(3, +(s+0.15).toFixed(2)))} title="Zoom in">+</button>
        </div>
        <div className="pdf-tb-spacer" />
        {onDownload && <button className="pdf-tb-btn" onClick={onDownload}>↓ PDF</button>}
        <a className="pdf-tb-btn" href={pdfUrl} target="_blank" rel="noopener">⤢ Open</a>
      </div>
      {renderErr
        ? <div className="pdf-empty"><div className="pdf-empty-text">Couldn’t render inline</div>
            <div className="pdf-empty-sub">{renderErr}. The PDF still compiled — use <b>Open</b> or <b>↓ PDF</b>.</div></div>
        : <div className="pdf-canvas-scroll" ref={containerRef} />}
    </div>
  );
}

// ── LOG / DIAGNOSTICS PANEL ──────────────────────────────────────────────────
function LogPanel({ result, diags, onClose, onJump }) {
  const [tab, setTab] = useState('problems');
  const errors = diags.filter(d=>d.type==='error');
  const warnings = diags.filter(d=>d.type==='warning');
  return (
    <div className="log-panel">
      <div className="log-tabs">
        <button className={`log-tab${tab==='problems'?' active':''}`} onClick={()=>setTab('problems')}>
          Problems {errors.length>0 && <span className="badge-err">{errors.length}</span>}
          {warnings.length>0 && <span className="badge-warn">{warnings.length}</span>}
        </button>
        <button className={`log-tab${tab==='raw'?' active':''}`} onClick={()=>setTab('raw')}>Raw log</button>
        <div className="log-spacer" />
        {result && <span className="log-status">{result.ok?'✓ compiled':'✕ failed'} · {Math.round(result.ms)}ms</span>}
        <button className="log-close" onClick={onClose}>✕</button>
      </div>
      {tab==='problems' ? (
        <div className="log-body">
          {diags.length===0 && <div className="log-clean">{result&&result.ok?'No problems. Clean compile. ✓':'No structured diagnostics — see Raw log.'}</div>}
          {diags.map((d,i)=>(
            <button key={i} className={`diag diag-${d.type}`} onClick={()=>d.line&&onJump(d.line)}>
              <span className="diag-icon">{d.type==='error'?'✕':'⚠'}</span>
              {d.line && <span className="diag-line">L{d.line}</span>}
              <span className="diag-msg">{d.message}</span>
            </button>
          ))}
        </div>
      ) : (
        <pre className="log-raw">{result ? result.log || '(no log returned)' : '(no compile yet)'}</pre>
      )}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
function App() {
  const [project, setProject] = useState(loadProject);
  const [activeId, setActiveId] = useState(() => loadProject().mainFile);
  const [previewMode, setPreviewMode] = useState('live'); // live | pdf
  const [html, setHtml] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [compiling, setCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState(null);
  const [diags, setDiags] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('files'); // files | outline
  const [showSidebar, setShowSidebar] = useState(true);
  const [splitPct, setSplitPct] = useState(() => parseFloat(localStorage.getItem('rtl-split')||'46'));
  const [showSymbols, setShowSymbols] = useState(false);
  const [showTweaks, setShowTweaks] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [mathEditor, setMathEditor] = useState(null); // {seq,kind,raw,rect} | null
  const [focusedLine, setFocusedLine] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [autoCompile, setAutoCompile] = useState(() => localStorage.getItem('rtl-autocompile')==='1');
  const [dragOver, setDragOver] = useState(false);
  const [tweaks, setTweaks] = useState(() => {
    try { return {...TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem('rtl-tweaks')||'{}')}; }
    catch { return TWEAK_DEFAULTS; }
  });
  const [status, setStatus] = useState('ready');
  const [stats, setStats] = useState({ words:0, eqs:0 });
  const [compileProgress, setCompileProgress] = useState(null);
  const editorRef = useRef(null);
  const renderTimer = useRef(null);
  const compileAbortRef = useRef(null);
  const compileTokenRef = useRef(0);
  const autoTimer = useRef(null);
  const didFirstRender = useRef(false);
  const importInputRef = useRef(null);

  const activeFile = project.files.find(f => f.id === activeId) || project.files[0];
  const mainFile = project.files.find(f => f.id === project.mainFile) || project.files[0];

  // Live HTML preview (expand inputs, parse bib)
  useEffect(() => {
    setStatus('pending');
    clearTimeout(renderTimer.current);
    renderTimer.current = setTimeout(() => {
      try {
        const bibFile = project.files.find(f => RC.fileKind(f.name)==='bib');
        const bibEntries = bibFile ? RC.parseBibtex(bibFile.content) : null;
        const src = expandInputs(markLines(mainFile.content), project.files);
        const out = parseLatex(src, { bibEntries });
        setHtml(out);
        const plain = out.replace(/<[^>]*>/g,'');
        const words = plain.trim().split(/\s+/).filter(Boolean).length;
        const eqs = (src.match(/\\begin\{(equation|align|gather)\*?\}/g)||[]).length +
                    (src.match(/\$\$[\s\S]*?\$\$/g)||[]).length;
        setStats({ words, eqs });
        setStatus('ready');
      } catch(e) { setStatus('error'); }
    }, 120);
    return () => clearTimeout(renderTimer.current);
  }, [project.files, mainFile.content]);

  // Persist
  useEffect(() => { localStorage.setItem('rtl-project', JSON.stringify(project)); }, [project]);
  useEffect(() => { localStorage.setItem('rtl-split', splitPct); }, [splitPct]);
  useEffect(() => { localStorage.setItem('rtl-tweaks', JSON.stringify(tweaks)); }, [tweaks]);

  // Tweaks host bridge
  useEffect(() => {
    const h = e => {
      if (e.data?.type==='__activate_edit_mode') setShowTweaks(true);
      if (e.data?.type==='__deactivate_edit_mode') setShowTweaks(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({ type:'__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', h);
  }, []);
  useEffect(() => { window.parent.postMessage({ type:'__edit_mode_set_keys', edits:tweaks }, '*'); }, [tweaks]);

  // Restore last compiled PDF from IndexedDB on mount
  useEffect(() => {
    loadCachedPdf().then(blob => { if (blob) setPdfUrl(URL.createObjectURL(blob)); });
  }, []);

  // Persist + drive auto-compile on idle
  useEffect(() => { localStorage.setItem('rtl-autocompile', autoCompile?'1':'0'); }, [autoCompile]);
  useEffect(() => {
    if (!autoCompile) { clearTimeout(autoTimer.current); return; }
    // skip the very first run (initial mount) so we don't compile unprompted
    if (!didFirstRender.current) { didFirstRender.current = true; return; }
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => { compileRef.current && compileRef.current(); }, 2500);
    return () => clearTimeout(autoTimer.current);
  }, [project.files, autoCompile]);

  const outline = useMemo(() => extractOutline(activeFile.content), [activeFile.content, activeId]);

  // Custom macros (\newcommand) across the project — fed to the math editor's preview
  const docMacros = useMemo(() => {
    const m = {};
    project.files.forEach(f => {
      if (window.RTLCompile.fileKind(f.name) !== 'tex') return;
      const re = /\\(?:re)?newcommand\{\\([a-zA-Z]+)\}(?:\[\d+\])?\{((?:[^{}]|\{[^{}]*\})*)\}/g;
      let x; while ((x = re.exec(f.content))) m['\\'+x[1]] = x[2];
    });
    return m;
  }, [project.files]);

  // Show compile diagnostics in the editor gutter (only on the main file,
  // which is what the compile log line numbers refer to)
  useEffect(() => {
    const ed = editorRef.current; if (!ed || !ed.setDiagnostics) return;
    if (activeId === project.mainFile && diags.length) ed.setDiagnostics(diags);
    else ed.clearDiagnostics && ed.clearDiagnostics();
  }, [diags, activeId, project.mainFile]);

  // ── File ops ──
  const updateActiveContent = useCallback(content => {
    setProject(p => ({ ...p, files: p.files.map(f => f.id===activeId ? {...f, content} : f) }));
  }, [activeId]);

  const addFile = () => {
    const name = prompt('New file name (e.g. methods.tex, refs.bib):', 'section.tex');
    if (!name) return;
    const id = newId();
    setProject(p => ({ ...p, files:[...p.files, { id, name, content:'' }] }));
    setActiveId(id);
  };
  const renameFile = id => {
    const f = project.files.find(x=>x.id===id); if(!f) return;
    const name = prompt('Rename file:', f.name); if(!name) return;
    setProject(p => ({ ...p, files: p.files.map(x => x.id===id?{...x,name}:x) }));
  };
  const deleteFile = id => {
    if (!confirm('Delete this file?')) return;
    setProject(p => {
      const files = p.files.filter(x=>x.id!==id);
      const mainFile = p.mainFile===id ? files[0]?.id : p.mainFile;
      return { ...p, files, mainFile };
    });
    if (activeId===id) setActiveId(project.files.find(x=>x.id!==id)?.id);
  };
  const setMain = id => setProject(p => ({ ...p, mainFile:id }));
  const uploadImage = file => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = String(reader.result).split(',')[1];
      const id = newId();
      setProject(p => ({ ...p, files:[...p.files, { id, name:file.name, content:'', data:b64 }] }));
    };
    reader.readAsDataURL(file);
  };

  // ── Compile ──
  const compile = useCallback(async () => {
    // Cancel any in-flight compile and start fresh (last-write-wins)
    if (compileAbortRef.current) compileAbortRef.current.abort();
    const ctrl = new AbortController();
    compileAbortRef.current = ctrl;
    const myToken = ++compileTokenRef.current;

    setCompiling(true);
    setPreviewMode('pdf');
    setShowDownload(false);
    setCompileProgress(null);

    const result = await RC.compileProject(project, {
      signal: ctrl.signal,
      onProgress: p => { if (myToken === compileTokenRef.current) setCompileProgress(p); },
    });

    // Ignore results from a superseded/canceled run
    if (myToken !== compileTokenRef.current) return;
    if (result.canceled) { return; } // a newer compile took over

    setCompileResult(result);
    const d = RC.parseCompileLog(result.log);
    setDiags(d);
    if (result.ok) {
      setPdfUrl(prev => { if (prev) URL.revokeObjectURL(prev); return result.pdfUrl; });
      setShowLog(d.length > 0);
      cachePdf(project, result.pdfBlob);
    } else {
      setShowLog(true);
    }
    setCompiling(false);
    compileAbortRef.current = null;
  }, [project]);

  // Keep a live ref to compile() so the idle-timer always calls the latest one
  const compileRef = useRef(compile);
  useEffect(() => { compileRef.current = compile; }, [compile]);

  const cancelCompile = useCallback(() => {
    compileTokenRef.current++; // invalidate
    if (compileAbortRef.current) compileAbortRef.current.abort();
    compileAbortRef.current = null;
    setCompiling(false);
    setCompileProgress(null);
  }, []);

  // ── Downloads ──
  const downloadActiveTex = () => RC.downloadText(activeFile.content, activeFile.name);
  const downloadPdf = () => {
    if (!compileResult?.pdfBlob) return;
    RC.downloadBlob(compileResult.pdfBlob, (project.name||'document').replace(/\s+/g,'_')+'.pdf');
  };
  const downloadZip = async () => {
    if (!window.JSZip) { alert('Zip library still loading — try again in a moment.'); return; }
    const zip = new window.JSZip();
    project.files.forEach(f => {
      if (f.data) zip.file(f.name, f.data, { base64:true });
      else zip.file(f.name, f.content || '');
    });
    const blob = await zip.generateAsync({ type:'blob' });
    RC.downloadBlob(blob, (project.name||'project').replace(/\s+/g,'_')+'.zip');
  };

  // ── Resizer ──
  const startDrag = useCallback(e => {
    e.preventDefault();
    document.body.style.cursor='col-resize'; document.body.style.userSelect='none';
    const sidebarW = showSidebar ? 210 : 0;
    const onMove = ev => {
      const x = ev.touches?ev.touches[0].clientX:ev.clientX;
      const avail = window.innerWidth - sidebarW - 5;
      setSplitPct(Math.max(20, Math.min(80, ((x - sidebarW) / avail) * 100)));
    };
    const onUp = () => { document.body.style.cursor=''; document.body.style.userSelect='';
      window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); };
    window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
  }, [showSidebar]);

  const handleInsert = useCallback(ins => editorRef.current?.insert(ins), []);

  // ── WYSIWYG edit handlers ──
  const openMathEditor = useCallback(info => setMathEditor(info), []);
  const saveMathEditor = useCallback(latex => {
    setMathEditor(cur => {
      if (!cur) return null;
      if (cur.isNew) {
        const newFiles = window.RTLEdit.insertEquation(project.files, project.mainFile, cur.insertLine, latex);
        if (newFiles) setProject(p => ({ ...p, files: newFiles }));
        return null;
      }
      const newRaw = window.RTLEdit.buildMathRaw(cur.kind, latex, cur.raw);
      const newFiles = window.RTLEdit.patchMathBySeq(project.files, project.mainFile, cur.seq, newRaw);
      if (newFiles) setProject(p => ({ ...p, files: newFiles }));
      return null;
    });
  }, [project.files, project.mainFile]);
  const insertEquation = useCallback(() => {
    setMathEditor({ isNew: true, kind: 'equation', raw: '', insertLine: focusedLine, rect: null });
  }, [focusedLine]);
  const commitProse = useCallback(({ startLine, kind, latex }) => {
    if (!latex) return;
    const newFiles = window.RTLEdit.patchProseBlock(project.files, project.mainFile, startLine, kind, latex);
    if (newFiles) setProject(p => ({ ...p, files: newFiles }));
  }, [project.files, project.mainFile]);
  const jumpToLine = useCallback(line => {
    setActiveId(project.mainFile);
    setTimeout(()=>editorRef.current?.goToLine(line-1), 50);
  }, [project.mainFile]);

  // Click-to-source from the Live preview (markers map to MAIN file lines)
  const jumpToSource = useCallback(line => {
    if (activeId !== project.mainFile) setActiveId(project.mainFile);
    setTimeout(()=>editorRef.current?.goToLine(line), activeId!==project.mainFile?60:0);
  }, [activeId, project.mainFile]);

  // New project from template
  const newFromTemplate = useCallback(tpl => {
    if (!confirm(`Start a new "${tpl.name}" project? This replaces the current files.`)) return;
    const proj = tpl.make();
    setProject(proj);
    setActiveId(proj.mainFile);
    setShowTemplates(false);
    setPdfUrl(null); setCompileResult(null); setDiags([]);
  }, []);

  // Import a .zip project or a .tex/.bib file
  const importFiles = useCallback(async (fileList) => {
    const arr = [...fileList];
    const zipFile = arr.find(f => /\.zip$/i.test(f.name));
    if (zipFile && window.JSZip) {
      const zip = await window.JSZip.loadAsync(zipFile);
      const newFiles = [];
      const entries = Object.values(zip.files).filter(e => !e.dir);
      for (const e of entries) {
        const nm = e.name.split('/').pop();
        if (/\.(tex|bib|sty|cls|txt)$/i.test(nm)) {
          newFiles.push({ id:newId(), name:nm, content: await e.async('string') });
        } else if (/\.(png|jpe?g|pdf)$/i.test(nm)) {
          newFiles.push({ id:newId(), name:nm, content:'', data: await e.async('base64') });
        }
      }
      if (newFiles.length) {
        const main = newFiles.find(f => /main\.tex$/i.test(f.name)) ||
                     newFiles.find(f => RC.fileKind(f.name)==='tex');
        setProject({ name: zipFile.name.replace(/\.zip$/i,''), compiler:'pdflatex',
          mainFile: main?main.id:newFiles[0].id, files:newFiles });
        setActiveId(main?main.id:newFiles[0].id);
      }
      return;
    }
    // individual text files → add to current project
    const added = [];
    for (const f of arr) {
      if (/\.(png|jpe?g|pdf)$/i.test(f.name)) {
        const b64 = await new Promise(res => { const r=new FileReader(); r.onload=()=>res(String(r.result).split(',')[1]); r.readAsDataURL(f); });
        added.push({ id:newId(), name:f.name, content:'', data:b64 });
      } else if (/\.(tex|bib|sty|cls|txt)$/i.test(f.name)) {
        const txt = await f.text();
        added.push({ id:newId(), name:f.name, content:txt });
      }
    }
    if (added.length) {
      setProject(p => ({ ...p, files:[...p.files, ...added] }));
      setActiveId(added[0].id);
    }
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files?.length) importFiles(e.dataTransfer.files);
  }, [importFiles]);

  const errCount = diags.filter(d=>d.type==='error').length;
  const warnCount = diags.filter(d=>d.type==='warning').length;

  return (
    <div className="app"
      onDragOver={e=>{ e.preventDefault(); if(!dragOver) setDragOver(true); }}
      onDragLeave={e=>{ if(e.target===e.currentTarget) setDragOver(false); }}
      onDrop={onDrop}>
      <input ref={importInputRef} type="file" multiple accept=".zip,.tex,.bib,.sty,.cls,.txt,.png,.jpg,.jpeg,.pdf"
        style={{display:'none'}} onChange={e=>{ if(e.target.files?.length) importFiles(e.target.files); e.target.value=''; }} />
      {dragOver && <div className="drop-overlay"><div className="drop-card">Drop .zip / .tex / .bib / images to import</div></div>}
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-logo">
          <div className="logo-badge">ℒ</div>
          <span>Real Time LaTeX</span>
        </div>
        <div className="topbar-sep" />
        <button className="icon-toggle" title="Toggle sidebar" onClick={()=>setShowSidebar(v=>!v)}>☰</button>
        <input className="filename-input" value={project.name} spellCheck={false}
          onChange={e=>setProject(p=>({...p,name:e.target.value}))} />
        <div className="spacer" />
        <span className="stats-label">{stats.words} words · {stats.eqs} eq · {project.files.length} files</span>
        <div className={`status-dot ${status}`} title="Live preview status" />
        <div className="topbar-sep" />
        <select className="compiler-select" value={project.compiler}
          onChange={e=>setProject(p=>({...p,compiler:e.target.value}))} title="TeX engine">
          {RC.COMPILERS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        {compiling
          ? <button className="compile-btn compiling" onClick={cancelCompile} title="Cancel compile">
              <span className="btn-spinner" />Cancel
            </button>
          : <button className="compile-btn" onClick={()=>compile()}>▸ Compile</button>}
        <button className={`auto-toggle${autoCompile?' on':''}`} title="Auto-compile ~2.5s after you stop typing"
          onClick={()=>setAutoCompile(v=>!v)}>⟳ Auto</button>
        <div className="download-wrap">
          <button className="tbtn tbtn-ghost" onClick={()=>setShowTemplates(v=>!v)} title="New from template">+ New ▾</button>
          {showTemplates && (
            <div className="download-menu tpl-menu" onMouseLeave={()=>setShowTemplates(false)}>
              <div className="tpl-menu-head">Start from template</div>
              {TEMPLATES.map(t => (
                <button key={t.id} className="tpl-item" onClick={()=>newFromTemplate(t)}>
                  <span className="tpl-name">{t.name}</span>
                  <span className="tpl-desc">{t.desc}</span>
                </button>
              ))}
              <div className="tpl-sep" />
              <button className="tpl-import" onClick={()=>{ importInputRef.current?.click(); setShowTemplates(false); }}>↑ Import .zip / .tex / .bib…</button>
            </div>
          )}
        </div>
        <div className="download-wrap">
          {showDownload && (
            <div className="download-menu" onMouseLeave={()=>setShowDownload(false)}>
              <button onClick={()=>{downloadActiveTex();setShowDownload(false);}}>Current file (.tex)</button>
              <button disabled={!compileResult?.pdfBlob} onClick={()=>{downloadPdf();setShowDownload(false);}}>Compiled PDF</button>
              <button onClick={()=>{downloadZip();setShowDownload(false);}}>Whole project (.zip)</button>
            </div>
          )}
        </div>
        <button className="tbtn tbtn-ghost" onClick={()=>setShowTweaks(v=>!v)} title="Tweaks">⚙</button>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* SIDEBAR */}
        {showSidebar && (
          <div className="sidebar">
            <div className="sidebar-tabs">
              <button className={`sb-tab${sidebarTab==='files'?' active':''}`} onClick={()=>setSidebarTab('files')}>Files</button>
              <button className={`sb-tab${sidebarTab==='outline'?' active':''}`} onClick={()=>setSidebarTab('outline')}>Outline</button>
            </div>
            {sidebarTab==='files'
              ? <FileTree project={project} activeId={activeId} onOpen={setActiveId}
                  onAdd={addFile} onRename={renameFile} onDelete={deleteFile}
                  onSetMain={setMain} onUpload={uploadImage} />
              : <OutlinePanel outline={outline} editorRef={editorRef} />}
          </div>
        )}

        {/* EDITOR PANE */}
        <div className="editor-pane" style={{width: splitPct+'%'}}>
          <Toolbar onInsert={handleInsert} showSymbols={showSymbols} setShowSymbols={setShowSymbols} />
          <div className="active-file-bar">
            <span className="afb-icon">{KIND_ICON[RC.fileKind(activeFile.name)]||'·'}</span>
            <span className="afb-name">{activeFile.name}</span>
            {activeFile.id===project.mainFile && <span className="afb-main">main</span>}
          </div>
          {activeFile.data
            ? <div className="image-preview"><img src={`data:${RC.mimeFor(activeFile.name)};base64,${activeFile.data}`} alt={activeFile.name} /><div className="image-note">Binary asset · referenced from .tex via <code>\includegraphics</code></div></div>
            : <Editor ref={editorRef} value={activeFile.content} onChange={updateActiveContent}
                onFindOpen={()=>setShowFind(true)} onCompile={compile} />}
          {showFind && <FindBar editorRef={editorRef} onClose={()=>setShowFind(false)} />}
          {showSymbols && <SymbolPalette onInsert={handleInsert} />}
        </div>

        {/* DIVIDER */}
        <div className="pane-divider" onMouseDown={startDrag} />

        {/* PREVIEW PANE */}
        <div className="preview-pane" style={{flex:1}}>
          <div className="preview-header">
            <div className="preview-modes">
              <button className={`pmode${previewMode==='live'?' active':''}`} onClick={()=>setPreviewMode('live')}>Live</button>
              <button className={`pmode${previewMode==='pdf'?' active':''}`} onClick={()=>setPreviewMode('pdf')}>
                PDF {pdfUrl && <span className="pmode-dot" />}
              </button>
            </div>
            <div className="preview-header-actions">
              {previewMode==='live' &&
                <button className={`edit-toggle${editMode?' on':''}`} title="Edit the document directly in the preview"
                  onClick={()=>{ setEditMode(v=>!v); setMathEditor(null); }}>
                  {editMode ? '✓ Editing' : '✎ Edit'}
                </button>}
              {previewMode==='live' && editMode &&
                <button className="edit-toggle" title="Insert a new equation after the current block"
                  onClick={insertEquation}>+ Eq</button>}
              {previewMode==='pdf' && (compileResult || diags.length>0) &&
                <button className="prev-hbtn" onClick={()=>setShowLog(v=>!v)}>
                  Log {errCount>0 && <span className="badge-err">{errCount}</span>}
                  {warnCount>0 && <span className="badge-warn">{warnCount}</span>}
                </button>}
              {previewMode==='pdf' && pdfUrl && <button className="prev-hbtn" onClick={downloadPdf}>↓ PDF</button>}
              {previewMode==='live' && <button className="prev-hbtn" onClick={()=>window.print()}>Print</button>}
            </div>
          </div>
          <div className="preview-body">
            {previewMode==='live'
              ? <LivePreview html={html} tweaks={tweaks}
                  onJumpToSource={jumpToSource}
                  editMode={editMode}
                  onEditMath={openMathEditor}
                  onBlockFocus={setFocusedLine}
                  onProseCommit={commitProse} />
              : <PdfViewer pdfUrl={pdfUrl} compiling={compiling} progress={compileProgress} onDownload={downloadPdf} />}
            {previewMode==='pdf' && showLog &&
              <LogPanel result={compileResult} diags={diags} onClose={()=>setShowLog(false)} onJump={jumpToLine} />}
          </div>
        </div>
      </div>

      {showTweaks && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={()=>setShowTweaks(false)} />}
      {mathEditor && <MathEditorPopover
        initialLatex={mathEditor.isNew ? '' : (mathEditor.kind && /equation|align|gather|multline|eqnarray/.test(mathEditor.kind)
          ? (mathEditor.raw.replace(/^\\begin\{[^}]+\}/,'').replace(/\\end\{[^}]+\}$/,'').replace(/\\label\{[^}]+\}/,'').trim())
          : mathEditor.raw.replace(/^\$\$?|\$\$?$|^\\\[|\\\]$|^\\\(|\\\)$/g,'').trim())}
        kind={mathEditor.kind}
        rect={mathEditor.rect}
        macros={docMacros}
        isNew={mathEditor.isNew}
        onSave={saveMathEditor}
        onCancel={()=>setMathEditor(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
