// rtl-compile.js — real LaTeX compilation via TeX Live HTTP API + helpers
'use strict';

// ── COMPILE ENDPOINTS (primary proven reachable + CORS-enabled from probe) ──
// We try them in order; first to return a PDF wins. Each has a distinct
// request/response shape, handled by its own adapter below.
const ENDPOINTS = [
  {
    id: 'ytotech',
    url: 'https://latex.ytotech.com/builds/sync',
    label: 'YtoTech TeX Live',
  },
];
const COMPILE_URL = ENDPOINTS[0].url; // back-compat alias

// Compilers the API supports
const COMPILERS = ['pdflatex', 'xelatex', 'lualatex', 'platex'];

// Map a project file's name → MIME for download
function mimeFor(name) {
  if (/\.pdf$/i.test(name)) return 'application/pdf';
  if (/\.bib$/i.test(name)) return 'text/x-bibtex';
  if (/\.(png)$/i.test(name)) return 'image/png';
  if (/\.(jpe?g)$/i.test(name)) return 'image/jpeg';
  return 'text/plain';
}

function fileKind(name) {
  if (/\.bib$/i.test(name)) return 'bib';
  if (/\.(png|jpe?g|pdf|eps|gif)$/i.test(name)) return 'image';
  if (/\.(sty|cls)$/i.test(name)) return 'style';
  return 'tex';
}

// ── BUILD API PAYLOAD ──────────────────────────────────────────────────────
// project = { files:[{id,name,content,data?}], mainFile, compiler }
function buildPayload(project) {
  const resources = project.files.map(f => {
    const r = { path: f.name };
    if (f.id === project.mainFile) r.main = true;
    if (f.data) {
      // base64 binary asset (image). data is a bare base64 string.
      r.file = f.data;
    } else {
      r.content = f.content || '';
    }
    return r;
  });
  return { compiler: project.compiler || 'pdflatex', resources };
}

// ── COMPILE ────────────────────────────────────────────────────────────────
// Resilient compile: per-attempt timeout, retry with backoff, endpoint
// fallback, and external cancellation via opts.signal.
// Returns { ok, pdfBlob?, pdfUrl?, log, status, ms, endpoint?, attempts, canceled? }
async function compileProject(project, opts = {}) {
  const t0 = performance.now();
  const externalSignal = opts.signal;
  const onProgress = opts.onProgress || (() => {});
  const perAttemptTimeout = opts.timeout || 45000;
  const maxRetries = opts.retries != null ? opts.retries : 1; // per endpoint
  const payload = JSON.stringify(buildPayload(project));

  let attempts = 0;
  let lastLog = '';
  let lastStatus = 0;

  for (const ep of ENDPOINTS) {
    for (let retry = 0; retry <= maxRetries; retry++) {
      if (externalSignal && externalSignal.aborted)
        return { ok: false, canceled: true, status: 0, log: 'Compile canceled.', ms: performance.now() - t0, attempts };

      attempts++;
      onProgress({ phase: 'request', endpoint: ep.label, attempt: retry + 1, attempts });

      // Per-attempt abort: fires on timeout OR external cancel
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort('timeout'), perAttemptTimeout);
      const onExternalAbort = () => ctrl.abort('external');
      if (externalSignal) externalSignal.addEventListener('abort', onExternalAbort, { once: true });

      let res;
      try {
        res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          signal: ctrl.signal,
        });
      } catch (e) {
        clearTimeout(timer);
        if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
        if (externalSignal && externalSignal.aborted)
          return { ok: false, canceled: true, status: 0, log: 'Compile canceled.', ms: performance.now() - t0, attempts };
        // timeout or network error → retry / fall through
        lastLog = ctrl.signal.reason === 'timeout'
          ? `Timed out after ${Math.round(perAttemptTimeout/1000)}s on ${ep.label}.`
          : `Network error on ${ep.label}: ${e.message}`;
        lastStatus = 0;
        if (retry < maxRetries) { await backoff(retry); continue; }
        break; // next endpoint
      }
      clearTimeout(timer);
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);

      const ms = performance.now() - t0;
      const ct = res.headers.get('content-type') || '';

      if (res.ok && ct.includes('pdf')) {
        onProgress({ phase: 'done', endpoint: ep.label });
        const pdfBlob = await res.blob();
        return { ok: true, pdfBlob, pdfUrl: URL.createObjectURL(pdfBlob),
                 log: '', status: res.status, ms, endpoint: ep.label, attempts };
      }

      // Extract a useful log
      lastStatus = res.status;
      try {
        const j = await res.json();
        lastLog = j.logs || j.log || j.error || j.message || JSON.stringify(j, null, 2);
      } catch {
        try { lastLog = await res.text(); } catch { lastLog = `HTTP ${res.status}`; }
      }

      // 4xx (bad LaTeX) → real failure, don't retry/fallback; 5xx → retry
      if (res.status >= 400 && res.status < 500) {
        return { ok: false, status: res.status, log: lastLog || `HTTP ${res.status}`,
                 ms, endpoint: ep.label, attempts };
      }
      if (retry < maxRetries) { await backoff(retry); continue; }
      // else fall to next endpoint
    }
  }

  return { ok: false, status: lastStatus,
           log: (lastLog || 'All compile endpoints failed.') +
                '\n\nTried: ' + ENDPOINTS.map(e => e.label).join(', ') + '.',
           ms: performance.now() - t0, attempts };
}

function backoff(retry) {
  return new Promise(r => setTimeout(r, 600 * Math.pow(2, retry)));
}

// ── PARSE A COMPILE LOG INTO STRUCTURED DIAGNOSTICS ────────────────────────
// Returns [{type:'error'|'warning', file, line, message}]
function parseCompileLog(log) {
  if (!log) return [];
  const diags = [];
  const lines = log.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // TeX error:  ! Undefined control sequence.
    let m = line.match(/^!\s+(.*)/);
    if (m) {
      // find "l.NN" line number in following lines
      let ln = null;
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        const lm = lines[j].match(/^l\.(\d+)/);
        if (lm) { ln = parseInt(lm[1]); break; }
      }
      diags.push({ type: 'error', line: ln, message: m[1].trim() });
      continue;
    }

    // LaTeX Error / Package Error
    m = line.match(/^(?:! )?(?:LaTeX|Package|Class)\s*(\w+)?\s*Error:\s*(.*)/);
    if (m) {
      const lm = (lines[i + 1] || '').match(/(?:on input line|line)\s+(\d+)/);
      diags.push({ type: 'error', line: lm ? parseInt(lm[1]) : null, message: m[2].trim() });
      continue;
    }

    // Warnings (undefined references, citations)
    m = line.match(/(?:LaTeX|Package\s+\w+)\s+Warning:\s*(.*)/);
    if (m) {
      const lm = line.match(/(?:on input line|line)\s+(\d+)/);
      let msg = m[1].trim();
      // warning may continue on next line
      if (!/line \d+\.?$/.test(msg) && lines[i + 1] && !/^\s*$/.test(lines[i + 1]) && !/Warning|Error/.test(lines[i + 1])) {
        msg += ' ' + lines[i + 1].trim();
      }
      diags.push({ type: 'warning', line: lm ? parseInt(lm[1]) : null, message: msg });
      continue;
    }

    // Overfull/Underfull boxes
    m = line.match(/^(Overfull|Underfull)\s+\\[hv]box.*?lines?\s+(\d+)/);
    if (m) {
      diags.push({ type: 'warning', line: parseInt(m[2]), message: `${m[1]} box (line ${m[2]})` });
    }
  }
  return diags;
}

// ── BIBTEX PARSER (for live-preview citations before compile) ──────────────
// Returns ordered array of { key, type, fields:{...} }
function parseBibtex(text) {
  if (!text) return [];
  const entries = [];
  const re = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const type = m[1].toLowerCase();
    if (type === 'comment' || type === 'preamble' || type === 'string') continue;
    const key = m[2].trim();
    // Capture the entry body by brace-matching from end of header
    let i = re.lastIndex, depth = 1, body = '';
    while (i < text.length && depth > 0) {
      const ch = text[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth > 0) body += ch;
      i++;
    }
    const fields = {};
    const fre = /(\w+)\s*=\s*(\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|"([^"]*)"|([^,]+))/g;
    let fm;
    while ((fm = fre.exec(body)) !== null) {
      const fname = fm[1].toLowerCase();
      let val = (fm[3] !== undefined ? fm[3] : fm[4] !== undefined ? fm[4] : fm[5] || '').trim();
      val = val.replace(/\s+/g, ' ');
      fields[fname] = val;  // keep braces/escapes; decoded later by formatBibEntry
    }
    entries.push({ key, type, fields });
  }
  return entries;
}

// Decode common TeX accents/escapes into Unicode for the live preview.
// (The real PDF handles these natively; this is just so Live looks right.)
function decodeTexAccents(s) {
  if (!s) return s;
  // formatting commands first, so they survive the command-strip below
  s = s.replace(/\\textit\{([^{}]*)\}/g, '<em>$1</em>')
       .replace(/\\emph\{([^{}]*)\}/g, '<em>$1</em>')
       .replace(/\\textbf\{([^{}]*)\}/g, '<strong>$1</strong>');
  const ACC = {
    "'a":'á',"'e":'é',"'i":'í',"'o":'ó',"'u":'ú',"'y":'ý',"'n":'ń',"'c":'ć',"'s":'ś',"'z":'ź',
    "'A":'Á',"'E":'É',"'I":'Í',"'O":'Ó',"'U":'Ú',
    '`a':'à','`e':'è','`i':'ì','`o':'ò','`u':'ù','`A':'À','`E':'È',
    '"a':'ä','"e':'ë','"i':'ï','"o':'ö','"u':'ü','"A':'Ä','"O':'Ö','"U':'Ü','"y':'ÿ',
    '^a':'â','^e':'ê','^i':'î','^o':'ô','^u':'û','^A':'Â','^O':'Ô',
    '~n':'ñ','~a':'ã','~o':'õ','~N':'Ñ',
    'va':'ǎ','vc':'č','ve':'ě','vs':'š','vz':'ž','vr':'ř','vn':'ň','vS':'Š','vZ':'Ž','vC':'Č',
    'ca':'å','cc':'ç','cC':'Ç',
    'Ho':'ő','Hu':'ű',
  };
  // \'{a}, \"{o}, \v{s}, \~{n}, \c{c}, \H{o}
  s = s.replace(/\\(['`"^~vcH])\s*\{?\\?([a-zA-Z])\}?/g, (m, acc, ltr) =>
    ACC[acc + ltr] || (acc + ltr));
  // \'a style without braces already covered above; special tokens
  s = s.replace(/\\ss\b/g, 'ß').replace(/\\ae\b/g, 'æ').replace(/\\oe\b/g, 'œ')
       .replace(/\\o\b/g, 'ø').replace(/\\O\b/g, 'Ø').replace(/\\aa\b/g, 'å').replace(/\\AA\b/g, 'Å')
       .replace(/\\&/g, '&amp;').replace(/[{}]/g, '').replace(/\\([a-zA-Z]+)/g, '$1');
  return s;
}

// Format a bib entry as a human reference string (numeric-style)
function formatBibEntry(e) {
  const f = e.fields;
  const dec = decodeTexAccents;
  const parts = [];
  if (f.author) {
    // "Last, First and A, B" or "First Last and ..." -> "F. Last, ..."
    const authors = f.author.split(/\s+and\s+/).map(a => dec(a.trim()));
    parts.push(authors.join(', ') + '.');
  }
  if (f.title) parts.push(`\u201C${dec(f.title)}.\u201D`);
  if (f.journal) parts.push(`<em>${dec(f.journal)}</em>` + (f.volume ? ` ${f.volume}` : '') + (f.number ? `(${f.number})` : '') + (f.pages ? `: ${f.pages}` : '') + '.');
  else if (f.booktitle) parts.push(`In <em>${dec(f.booktitle)}</em>.`);
  else if (f.publisher) parts.push(`${dec(f.publisher)}.`);
  if (f.year) parts.push(`${f.year}.`);
  return parts.join(' ');
}

// ── DOWNLOAD HELPERS ────────────────────────────────────────────────────────
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function downloadText(text, filename) {
  downloadBlob(new Blob([text], { type: 'text/plain' }), filename);
}

// Expose to global (loaded as plain script before the babel app)
window.RTLCompile = {
  COMPILE_URL, ENDPOINTS, COMPILERS, compileProject, parseCompileLog,
  parseBibtex, formatBibEntry, decodeTexAccents, mimeFor, fileKind,
  downloadBlob, downloadText,
};
