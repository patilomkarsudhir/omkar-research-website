// rtl-parser.js — LaTeX → HTML parser
'use strict';

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/\n/g,'&#10;');
}

function parseLatex(input, opts) {
  if (!input) return '';
  opts = opts || {};
  const bibEntries = opts.bibEntries || null; // external .bib: [{key,type,fields}]
  let text = input;
  const slots = []; let sid = 0;
  const protect = html => { const id=`\x02S${sid++}\x03`; slots.push({id,html}); return id; };

  // ── 0. VERBATIM PROTECTION ───────────────────────────────────────────────
  // Must run before any stripping so literal \input, % and \begin{document}
  // inside \verb / verbatim survive intact and are not mistaken for commands.
  text = text.replace(/\\verb([^a-zA-Z*\s])(.*?)\1/g, (_,d,c) => protect(`<code>${escHtml(c)}</code>`));
  text = text.replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g,
    (_,c) => protect(`<pre class="verbatim-block"><code>${escHtml(c.trim())}</code></pre>`));

  // ── 1. COMMENTS ─────────────────────────────────────────────────────────
  text = text.replace(/(?<!\\)%[^\n]*/g, '');

  // ── 1b. PREAMBLE / DOCUMENT WRAPPER ──────────────────────────────────────
  // If a \begin{document} exists, render only its body (but keep macro/title
  // definitions from the preamble, which are parsed globally below).
  const docMatch = text.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (docMatch) {
    const preamble = text.slice(0, docMatch.index);
    const keepRe = /\\(?:re)?newcommand\{[\s\S]*?\}\{(?:[^{}]|\{[^{}]*\})*\}|\\def\\[a-zA-Z]+\{[^{}]*\}|\\title\{[^}]*\}|\\author\{[^}]*\}|\\date\{[^}]*\}/g;
    const kept = (preamble.match(keepRe) || []).join('\n');
    text = kept + '\n' + docMatch[1];
  }
  // Drop preamble-only / no-op commands that may remain in the body
  text = text.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/g, '');
  text = text.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, '');
  text = text.replace(/\\(?:RequirePackage|pagestyle|thispagestyle|geometry|setlength|addbibresource|bibliographystyle|usetikzlibrary|pgfplotsset|hypersetup|setcounter|input|include)(\[[^\]]*\])?\{[^}]*\}/g, '');
  text = text.replace(/\\(?:begin|end)\{document\}/g, '');
  text = text.replace(/\\tableofcontents\b/g, '');

  // ── 2. \newcommand / \renewcommand / \def ────────────────────────────────
  const macros = {};
  text = text.replace(/\\(?:re)?newcommand\{\\([a-zA-Z]+)\}(?:\[(\d+)\])?\{((?:[^{}]|\{[^{}]*\})*)\}/g,
    (_,name,nargs,def) => { macros[name]={def,nargs:parseInt(nargs)||0}; return ''; });
  text = text.replace(/\\def\\([a-zA-Z]+)\{([^{}]*)\}/g,
    (_,name,def) => { macros[name]={def,nargs:0}; return ''; });

  // ── 4. BIBLIOGRAPHY PRE-SCAN ─────────────────────────────────────────────
  const citeMap = {}; let bibHtml = '';
  const BIB_MARKER = '\x01BIBLIO\x01';
  // Lightweight inline formatter for bib entry text (the bib HTML is injected
  // after the main formatting pass, so we must handle commands here too).
  const bibFormat = (s) => {
    s = s.replace(/\\textit\{([^{}]*)\}/g,'<em>$1</em>')
         .replace(/\\emph\{([^{}]*)\}/g,'<em>$1</em>')
         .replace(/\\textbf\{([^{}]*)\}/g,'<strong>$1</strong>')
         .replace(/\\texttt\{([^{}]*)\}/g,'<code>$1</code>')
         .replace(/\\url\{([^{}]*)\}/g,'<a href="$1">$1</a>');
    if (window.RTLCompile && window.RTLCompile.decodeTexAccents) s = window.RTLCompile.decodeTexAccents(s);
    s = s.replace(/~/g,'\u00a0').replace(/\\&/g,'&amp;').replace(/\\,/g,'\u2009')
         .replace(/---/g,'\u2014').replace(/--/g,'\u2013')
         .replace(/\\[a-zA-Z]+\b/g,'').replace(/[{}]/g,'');
    return s;
  };
  // 4a. Inline thebibliography environment
  text = text.replace(/\\begin\{thebibliography\}\{[^}]*\}([\s\S]*?)\\end\{thebibliography\}/g, (_,body) => {
    let n=0; const entries=[];
    const re=/\\bibitem(?:\[[^\]]*\])?\{([^}]+)\}([\s\S]*?)(?=\\bibitem|\s*$)/g; let m;
    while((m=re.exec(body))!==null){
      n++; const key=m[1].trim(); citeMap[key]=n;
      entries.push({key,n,content:bibFormat(m[2].trim())});
    }
    bibHtml=`<div class="bibliography"><h2 class="latex-section ref-section"><span class="sec-num"></span>References</h2><ol class="bib-list">${
      entries.map(e=>`<li id="bib-${e.key}" class="bib-entry"><span class="bib-marker">[${e.n}]</span><span class="bib-content"> ${e.content}</span></li>`).join('')
    }</ol></div>`;
    return BIB_MARKER;
  });
  // 4b. External .bib file (passed in) used via \bibliography{} or \printbibliography.
  // Number entries in order of first \cite (numeric styles like plainnat/unsrt),
  // and list only entries that are actually cited — matching a real bibtex run.
  if (bibEntries && bibEntries.length && !bibHtml) {
    const order = [];
    const citeScan = /\\cite[tp]?\*?(?:\[[^\]]*\])?(?:\[[^\]]*\])?\{([^}]+)\}/g;
    let cm2;
    while ((cm2 = citeScan.exec(text)) !== null) {
      cm2[1].split(',').forEach(k => { const key=k.trim(); if(key && !order.includes(key)) order.push(key); });
    }
    const byKey = {}; bibEntries.forEach(e => { byKey[e.key] = e; });
    // cited entries first (in citation order), then any uncited (greyed) at the end
    const uncited = bibEntries.filter(e => !order.includes(e.key)).map(e => e.key);
    const finalOrder = order.filter(k => byKey[k]).concat(uncited);
    const fmtFn = (window.RTLCompile && window.RTLCompile.formatBibEntry) || (e => e.fields.title || e.key);
    const cited = finalOrder.map((key, i) => {
      citeMap[key] = i + 1;
      const e = byKey[key];
      const isUncited = !order.includes(key);
      return `<li id="bib-${key}" class="bib-entry${isUncited?' bib-uncited':''}"><span class="bib-marker">[${i+1}]</span><span class="bib-content"> ${fmtFn(e)}</span></li>`;
    });
    bibHtml = `<div class="bibliography"><h2 class="latex-section ref-section"><span class="sec-num"></span>References</h2><ol class="bib-list">${cited.join('')}</ol></div>`;
  }
  text = text.replace(/\\printbibliography(\[[^\]]*\])?/g, BIB_MARKER);
  text = text.replace(/\\bibliography\{[^}]*\}/g, BIB_MARKER);

  // ── 5. MATH PROTECTION ───────────────────────────────────────────────────
  const katexMacros = {'\\R':'\\mathbb{R}','\\N':'\\mathbb{N}','\\Z':'\\mathbb{Z}',
    '\\C':'\\mathbb{C}','\\Q':'\\mathbb{Q}','\\F':'\\mathbb{F}'};
  Object.entries(macros).forEach(([n,{def,nargs}])=>{
    katexMacros[`\\${n}`]=def; // KaTeX expands #1..#n itself
  });

  const renderMath = (math, displayMode) => {
    try {
      return window.katex.renderToString(math,{displayMode,throwOnError:false,
        errorColor:'#c00',strict:'ignore',trust:true,macros:katexMacros});
    } catch(e) {
      return `<span class="math-error">[${escHtml(e.message)}]</span>`;
    }
  };
  // Wrap a rendered math element so the WYSIWYG editor can locate its source.
  const editMath = (html, raw, kind, block) =>
    `<span class="math-edit${block?' math-block':''}" data-mathkind="${kind}" data-mathraw="${escAttr(raw)}">${html}</span>`;

  // Counters & label registry
  const C = {sec:0,sub:0,subsub:0,eq:0,fig:0,tbl:0,
    theorem:0,lemma:0,proposition:0,corollary:0,
    definition:0,example:0,exercise:0,remark:0};
  const labelMap = {};
  const pullLabel = body => {
    let lbl=null;
    const clean=body.replace(/\\label\{([^}]+)\}/g,(_,k)=>{lbl=k.trim();return '';});
    return {body:clean,label:lbl};
  };

  // Align-like: number each row via \tag
  const processAlignLike = (env, body) => {
    const starred=env.endsWith('*');
    if(starred){
      return renderMath(`\\begin{${env}}${body.replace(/\\label\{[^}]+\}/g,'')}\\end{${env}}`,true);
    }
    const rows=body.split(/\\\\/);
    const processed=rows.map((row,i)=>{
      if(i===rows.length-1&&!row.trim()) return row;
      if(/\\(?:nonumber|notag)\b/.test(row))
        return row.replace(/\\(?:nonumber|notag)\b/g,'\\nonumber');
      C.eq++; let lbl=null;
      const r=row.replace(/\\label\{([^}]+)\}/g,(_,k)=>{lbl=k.trim();return '';});
      if(lbl) labelMap[lbl]=String(C.eq);
      return `${r} \\tag{${C.eq}}`;
    });
    const base=env.startsWith('gather')?'gather':env.startsWith('multline')?'multline':'align';
    return renderMath(`\\begin{${base}}${processed.join('\\\\')}\\end{${base}}`,true);
  };

  const processEquation = (env, body) => {
    const starred=env.endsWith('*');
    const {body:clean,label}=pullLabel(body);
    if(!starred){
      C.eq++;
      if(label) labelMap[label]=String(C.eq);
      return renderMath(`${clean} \\tag{${C.eq}}`,true);
    }
    return renderMath(clean,true);
  };

  text=text.replace(/\\begin\{(equation\*?)\}([\s\S]*?)\\end\{\1\}/g,
    (_,env,body)=>protect(editMath(processEquation(env,body),_,env,true)));
  text=text.replace(/\\begin\{(align\*?|gather\*?|multline\*?|eqnarray\*?)\}([\s\S]*?)\\end\{\1\}/g,
    (_,env,body)=>protect(editMath(processAlignLike(env,body),_,env,true)));
  text=text.replace(/\$\$([\s\S]*?)\$\$/g,(_,m)=>protect(editMath(renderMath(m,true),_,'ddisplay',true)));
  text=text.replace(/\\\[([\s\S]*?)\\\]/g,(_,m)=>protect(editMath(renderMath(m,true),_,'bdisplay',true)));
  text=text.replace(/(?<!\$)\$([^\$\n]{1,500}?)\$(?!\$)/g,(_,m)=>protect(editMath(renderMath(m,false),_,'dinline',false)));
  text=text.replace(/\\\(([\s\S]*?)\\\)/g,(_,m)=>protect(editMath(renderMath(m,false),_,'pinline',false)));

  // ── 6. APPLY TEXT-MODE MACROS ────────────────────────────────────────────
  Object.entries(macros).forEach(([name,{def,nargs}])=>{
    if(nargs===0) text=text.replace(new RegExp(`\\\\${name}\\b`,'g'),def);
    else if(nargs===1) text=text.replace(new RegExp(`\\\\${name}\\{([^{}]*)\\}`,'g'),(_,a)=>def.replace(/#1/g,a));
    else if(nargs===2) text=text.replace(new RegExp(`\\\\${name}\\{([^{}]*)\\}\\{([^{}]*)\\}`,'g'),
      (_,a,b)=>def.replace(/#1/g,a).replace(/#2/g,b));
  });

  // ── 7. DOCUMENT METADATA ─────────────────────────────────────────────────
  let docTitle='',docAuthor='',docDate='';
  text=text.replace(/\\title\{([^}]*)\}/g,(_,t)=>{docTitle=t;return '';});
  text=text.replace(/\\author\{([^}]*)\}/g,(_,a)=>{docAuthor=a.replace(/\\and\b/g,'&amp;');return '';});
  text=text.replace(/\\date\{([^}]*)\}/g,(_,d)=>{docDate=d;return '';});
  text=text.replace(/\\maketitle\b/g,()=>(docTitle||docAuthor)?
    `<div class="doc-title-block">${docTitle?`<div class="doc-title">${docTitle}</div>`:''}${docAuthor?`<div class="doc-author">${docAuthor}</div>`:''}${docDate?`<div class="doc-date">${docDate}</div>`:''}</div>` : '');
  text=text.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g,
    (_,c)=>`<div class="abstract-block">${c.trim()}</div>`);

  // ── 8. SECTIONS + THEOREMS (single sequential pass) ──────────────────────
  const THM = {
    theorem:    {lbl:'Theorem',    ctr:'theorem',    cls:'thm-theorem'},
    lemma:      {lbl:'Lemma',      ctr:'lemma',      cls:'thm-lemma'},
    proposition:{lbl:'Proposition',ctr:'proposition',cls:'thm-prop'},
    corollary:  {lbl:'Corollary',  ctr:'corollary',  cls:'thm-corollary'},
    definition: {lbl:'Definition', ctr:'definition', cls:'thm-definition'},
    example:    {lbl:'Example',    ctr:'example',    cls:'thm-example'},
    exercise:   {lbl:'Exercise',   ctr:'exercise',   cls:'thm-example'},
    remark:     {lbl:'Remark',     ctr:'remark',     cls:'thm-remark'},
    note:       {lbl:'Note',       ctr:'remark',     cls:'thm-remark'},
    claim:      {lbl:'Claim',      ctr:'theorem',    cls:'thm-theorem'},
    conjecture: {lbl:'Conjecture', ctr:'theorem',    cls:'thm-prop'},
    proof:      {lbl:'Proof',      ctr:null,         cls:'thm-proof'},
  };
  const resetThm=()=>{['theorem','lemma','proposition','corollary','definition','example','exercise','remark'].forEach(k=>C[k]=0);};
  const thmKeys=Object.keys(THM).join('|');
  const secThmRe=new RegExp(
    '\\\\(chapter|section|subsection|subsubsection)(\\*?)\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}' +
    '|\\\\begin\\{(' + thmKeys + ')\\}(?:\\[([^\\]]*?)\\])?([\\s\\S]*?)\\\\end\\{\\4\\}',
    'g');
  text=text.replace(secThmRe,(m,secEnv,secStar,secTitle,thmEnv,thmOpt,thmBody)=>{
    if(secEnv){
      const star=secStar;
      switch(secEnv){
        case 'chapter': if(!star){C.sec++;C.sub=C.subsub=0;resetThm();}
          return `<h1 class="latex-chapter" id="sec-${C.sec}">${star?'':`<span class="sec-num">${C.sec}</span> `}${secTitle}</h1>`;
        case 'section': if(!star){C.sec++;C.sub=C.subsub=0;resetThm();}
          return `<h2 class="latex-section" id="sec-${C.sec}">${star?'':`<span class="sec-num">${C.sec}</span> `}${secTitle}</h2>`;
        case 'subsection': if(!star){C.sub++;C.subsub=0;}
          return `<h3 class="latex-subsection">${star?'':`<span class="sec-num">${C.sec}.${C.sub}</span> `}${secTitle}</h3>`;
        case 'subsubsection': if(!star) C.subsub++;
          return `<h4 class="latex-subsubsection">${star?'':`<span class="sec-num">${C.sec}.${C.sub}.${C.subsub}</span> `}${secTitle}</h4>`;
      }
      return '';
    }
    const cfg=THM[thmEnv];
    const {body:clean,label}=pullLabel(thmBody);
    let num='';
    if(cfg.ctr){
      C[cfg.ctr]++;
      const pfx=C.sec>0?`${C.sec}.`:'';
      num=` ${pfx}${C[cfg.ctr]}`;
      if(label) labelMap[label]=`${pfx}${C[cfg.ctr]}`;
    }
    const nameStr=thmOpt?` <span class="thm-name">(${thmOpt})</span>`:'';
    const anchor=label?` id="label-${label}"`:'';
    const qed=thmEnv==='proof'?'<span class="qed-symbol">∎</span>':'';
    return `<div class="thm-env ${cfg.cls}"${anchor}><em class="thm-label">${cfg.lbl}${num}${nameStr}.</em> ${clean.trim()}${qed}</div>`;
  });
  text=text.replace(/\\paragraph\*?\{([^{}]*)\}/g,'<p class="para-title"><strong>$1&ensp;</strong></p>');

  // ── 9. LISTS ─────────────────────────────────────────────────────────────
  const parseItems=(body,tag)=>{
    const parts=body.split(/\\item\b/).slice(1);
    return `<${tag}>${parts.map(p=>`<li>${p.trim()}</li>`).join('')}</${tag}>`;
  };
  for(let i=0;i<3;i++){
    text=text.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g,(_,b)=>parseItems(b,'ul'));
    text=text.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g,(_,b)=>parseItems(b,'ol'));
    text=text.replace(/\\begin\{description\}([\s\S]*?)\\end\{description\}/g,(_,b)=>{
      return `<dl>${b.split(/\\item\b/).slice(1).map(p=>{
        const m=p.match(/^\[([^\]]*)\]([\s\S]*)/);
        return m?`<dt>${m[1]}</dt><dd>${m[2].trim()}</dd>`:`<dd>${p.trim()}</dd>`;
      }).join('')}</dl>`;
    });
  }

  // ── 10. TABULAR ──────────────────────────────────────────────────────────
  text=text.replace(/\\begin\{(?:tabular|array)\}\{([^}]*)\}([\s\S]*?)\\end\{(?:tabular|array)\}/g,
    (_,spec,body)=>{
      const cols=[...spec.replace(/[|@{}]/g,'')].filter(c=>'lcr'.includes(c));
      const bordered=spec.includes('|');
      const rows=body.split(/\\\\/).map(r=>r.trim()).filter(r=>r&&!/^\\hline$/.test(r));
      const tbody=rows.map(row=>{
        const cells=row.replace(/\\hline/g,'').split('&');
        return `<tr>${cells.map((c,ci)=>{
          const a=cols[ci]==='r'?'right':cols[ci]==='c'?'center':'left';
          return `<td style="text-align:${a}">${c.trim()}</td>`;
        }).join('')}</tr>`;
      }).join('');
      return `<div class="table-wrap"><table class="latex-table${bordered?' tbl-bordered':''}">${tbody}</table></div>`;
    });

  // ── 11. FIGURE / TABLE FLOATS ────────────────────────────────────────────
  const processFloat=(body,ctrKey,envLabel)=>{
    C[ctrKey]++;
    const {body:clean,label}=pullLabel(body);
    if(label) labelMap[label]=String(C[ctrKey]);
    const anchor=label?` id="label-${label}"`:'';
    const cap=clean.replace(/\\caption\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
      `<figcaption><strong>${envLabel} ${C[ctrKey]}.</strong> $1</figcaption>`);
    return `<figure class="latex-figure"${anchor}>${cap.trim()}</figure>`;
  };
  text=text.replace(/\\begin\{figure\*?\}([\s\S]*?)\\end\{figure\*?\}/g,(_,b)=>processFloat(b,'fig','Figure'));
  text=text.replace(/\\begin\{table\*?\}([\s\S]*?)\\end\{table\*?\}/g,(_,b)=>processFloat(b,'tbl','Table'));

  // ── 12. MISC ENVIRONMENTS ────────────────────────────────────────────────
  text=text.replace(/\\begin\{quote[^}]*\}([\s\S]*?)\\end\{quote[^}]*\}/g,(_,b)=>`<blockquote>${b.trim()}</blockquote>`);
  text=text.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g,(_,b)=>`<div style="text-align:center">${b.trim()}</div>`);
  text=text.replace(/\\begin\{flushright\}([\s\S]*?)\\end\{flushright\}/g,(_,b)=>`<div style="text-align:right">${b.trim()}</div>`);
  text=text.replace(/\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g,'');

  // ── 13. CITATIONS & REFERENCES ───────────────────────────────────────────
  text=text.replace(/\\cite[tp]?\*?(?:\[[^\]]*\])?(?:\[[^\]]*\])?\{([^}]+)\}/g,(_,keys)=>{
    const refs=keys.split(',').map(k=>{
      const key=k.trim(); const n=citeMap[key];
      return n?`<a href="#bib-${key}" class="cite-link">${n}</a>`:`<span class="ref-unknown">?</span>`;
    });
    return `<span class="citation">[${refs.join(', ')}]</span>`;
  });
  text=text.replace(/\\eqref\{([^}]+)\}/g,(_,key)=>`\x01REF:eq:${key.trim()}\x01`);
  text=text.replace(/\\ref\{([^}]+)\}/g,(_,key)=>`\x01REF:pl:${key.trim()}\x01`);
  text=text.replace(/\\label\{([^}]+)\}/g,(_,key)=>`<span id="label-${key.trim()}" class="label-anchor"></span>`);

  // ── 15. TEXT FORMATTING ──────────────────────────────────────────────────
  const fmt=(cmd,open,close)=>{
    text=text.replace(new RegExp(`\\\\${cmd}\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}`,'g'),
      (_,c)=>`${open}${c}${close}`);
  };
  fmt('textbf','<strong>','</strong>'); fmt('textit','<em>','</em>');
  fmt('emph','<em>','</em>'); fmt('underline','<u>','</u>');
  fmt('texttt','<code>','</code>'); fmt('textsf','<span style="font-family:sans-serif">','</span>');
  fmt('textsc','<span style="font-variant:small-caps">','</span>');
  fmt('textrm','<span>','</span>'); fmt('text','<span>','</span>');
  text=text.replace(/\\textcolor\{([^}]*)\}\{([^{}]*)\}/g,'<span style="color:$1">$2</span>');
  text=text.replace(/\\colorbox\{([^}]*)\}\{([^{}]*)\}/g,'<span style="background:$1;padding:0 2px">$2</span>');

  // ── 16. LINKS ────────────────────────────────────────────────────────────
  text=text.replace(/\\href\{([^}]*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    '<a href="$1" target="_blank" rel="noopener">$2</a>');
  text=text.replace(/\\url\{([^}]*)\}/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');

  // ── 17. FOOTNOTES (collect; render at bottom) ────────────────────────────
  const footnotes=[]; let fnN=0;
  text=text.replace(/\\footnote\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,(_,c)=>{
    fnN++;
    footnotes.push({n:fnN,text:c});
    return `<sup class="fn-ref" id="fnref-${fnN}"><a href="#fn-${fnN}">${fnN}</a></sup>`;
  });

  // ── 18. LOGOS & SPECIAL CHARACTERS ──────────────────────────────────────
  text=text.replace(/\\LaTeX\b/g,'<span class="latex-logo">L<sup>A</sup>T<sub>E</sub>X</span>');
  text=text.replace(/\\TeX\b/g,'<span class="latex-logo">T<sub>E</sub>X</span>');
  text=text.replace(/\\BibTeX\b/g,'<span class="latex-logo">B<sub>IB</sub>T<sub>E</sub>X</span>');
  text=text.replace(/\\today\b/g,new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}));
  text=text.replace(/\\ss\b/g,'ß');
  text=text.replace(/\\textbackslash\b/g,'\\'); text=text.replace(/\\ldots\b|\\dots\b/g,'…');
  text=text.replace(/\\cdots\b/g,'⋯'); text=text.replace(/\\vdots\b/g,'⋮');
  text=text.replace(/\\&/g,'&amp;'); text=text.replace(/\\%/g,'%');
  text=text.replace(/\\\$/g,'\x01DOLLAR\x01'); text=text.replace(/\\#/g,'#');
  text=text.replace(/\\_/g,'_'); text=text.replace(/\\\^/g,'^');
  text=text.replace(/\\{/g,'{'); text=text.replace(/\\}/g,'}');
  text=text.replace(/\\ /g,'&nbsp;'); text=text.replace(/\\,/g,'&thinsp;');
  text=text.replace(/(?<!\\)~/g,'&nbsp;'); // LaTeX non-breaking space tie
  text=text.replace(/\\;/g,'&ensp;'); text=text.replace(/\\quad\b/g,'&emsp;');
  text=text.replace(/\\qquad\b/g,'&emsp;&emsp;');
  text=text.replace(/\\medskip\b/g,'<div style="height:0.6em"></div>');
  text=text.replace(/\\bigskip\b/g,'<div style="height:1.2em"></div>');
  text=text.replace(/\\smallskip\b/g,'<div style="height:0.3em"></div>');
  text=text.replace(/\\vspace\{[^}]*\}/g,'<div style="height:0.8em"></div>');
  text=text.replace(/\\hspace\{[^}]*\}/g,'&ensp;');
  text=text.replace(/\\newpage\b|\\clearpage\b/g,'<hr>');
  text=text.replace(/\\noindent\b|\\centering\b|\\linebreak\b/g,'');
  text=text.replace(/---/g,'—'); text=text.replace(/--/g,'–');
  text=text.replace(/``/g,'\u201C'); text=text.replace(/''/g,'\u201D');
  text=text.replace(/`/g,'\u2018');
  text=text.replace(/\\\\\s*(?:\[[^\]]*\])?\s*/g,'<br>');
  text=text.replace(/\\newline\b/g,'<br>');

  // Remove remaining unknown commands, then stray braces
  text=text.replace(/\\[a-zA-Z@]+\*?\b(\{[^}]*\})*/g,m=>m.startsWith('\x02')?m:'');
  text=text.replace(/[{}]/g,'');

  // ── 19. PARAGRAPHS (+ source-line markers for click-to-source) ───────────
  const BLOCK=/^(<h[1-6]|<ul|<ol|<dl|<div|<blockquote|<pre|<figure|<hr|\x02)/;
  text=text.split(/\n\n+/).map(b=>{
    let t=b.trim(); if(!t) return '';
    // Extract a source line number from the first \x07N\x07 marker in this block
    let line=null;
    const mm=t.match(/\x07(\d+)\x07/);
    if(mm) line=parseInt(mm[1]);
    t=t.replace(/\x07\d+\x07/g,'').trim();   // strip all markers
    if(!t) return '';
    const attr=line!=null?` data-src-line="${line}"`:'';
    if(BLOCK.test(t)){
      // inject the attribute into the first HTML tag of the block
      return line!=null ? t.replace(/^(<[a-zA-Z0-9]+)/,`$1${attr}`) : t;
    }
    return `<p${attr}>${t}</p>`;
  }).join('\n');

  // ── 20–21. SLOT RESTORE + \ref RESOLUTION (reusable for footnotes too) ───
  const restoreSlots = (str) => {
    slots.forEach(({id,html})=>{ str=str.split(id).join(html); });
    return str.split('\x01DOLLAR\x01').join('$');
  };
  const resolveRefs = (str) => str.replace(/\x01REF:(eq|pl):([^\x01]+)\x01/g,(_,kind,key)=>{
    const val=labelMap[key];
    if(!val) return `<span class="ref-unknown">??</span>`;
    const shown=kind==='eq'?`(${val})`:val;
    return `<a href="#label-${key}" class="ref-link">${shown}</a>`;
  });
  const stripMarkers = (str) => str.replace(/\x07\d+\x07/g,'');
  text = resolveRefs(restoreSlots(text));

  // ── 22. BIBLIOGRAPHY ─────────────────────────────────────────────────────
  text=text.split(BIB_MARKER).join(bibHtml || '');

  // ── 23. FOOTNOTES AT BOTTOM (run through the same restore/resolve passes) ─
  if(footnotes.length>0){
    // footnote text was captured before step 18, so apply the inline-char pass
    const inlineChars = (s) => s
      .replace(/\\LaTeX\b/g,'<span class="latex-logo">L<sup>A</sup>T<sub>E</sub>X</span>')
      .replace(/\\TeX\b/g,'<span class="latex-logo">T<sub>E</sub>X</span>')
      .replace(/\\&/g,'&amp;').replace(/\\%/g,'%').replace(/\\_/g,'_')
      .replace(/(?<!\\)~/g,'&nbsp;').replace(/\\,/g,'&thinsp;').replace(/\\ /g,'&nbsp;')
      .replace(/---/g,'\u2014').replace(/--/g,'\u2013')
      .replace(/``/g,'\u201C').replace(/''/g,'\u201D').replace(/`/g,'\u2018')
      .replace(/\\[a-zA-Z@]+\b/g,'');
    text+=`<div class="footnotes-section"><hr class="fn-rule"><ol class="fn-list">${
      footnotes.map(fn=>{
        const body = resolveRefs(restoreSlots(inlineChars(stripMarkers(fn.text))));
        return `<li id="fn-${fn.n}" class="fn-item">${body} <a href="#fnref-${fn.n}" class="fn-back">↩</a></li>`;
      }).join('')
    }</ol></div>`;
  }

  // ── 24. SAFETY: strip any stray control characters ───────────────────────
  text=text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');

  // ── 25. STAMP MATH ELEMENTS WITH DOCUMENT-ORDER SEQUENCE (for editing) ────
  let _mseq=0;
  text=text.replace(/<span class="(math-edit[^"]*)"/g,(m,cls)=>`<span data-mathseq="${_mseq++}" class="${cls}"`);

  return text;
}
