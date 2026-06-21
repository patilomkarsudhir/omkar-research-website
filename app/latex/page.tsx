export default function LatexPage() {
  return (
    <div className="w-full h-full">
      <div id="root" className="w-full h-full" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossOrigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/stex/stex.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/edit/matchbrackets.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/edit/closebrackets.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/hint/show-hint.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/search/searchcursor.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js" crossOrigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js" crossOrigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/mathquill@0.10.1/build/mathquill.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js" crossOrigin="anonymous"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: "if (window.pdfjsLib) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; }",
        }}
      />
      <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossOrigin="anonymous" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L"></script>
      <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossOrigin="anonymous" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm"></script>
      <script src="/rtl-parser.js"></script>
      <script src="/rtl-compile.js"></script>
      <script src="/rtl-components.js"></script>
      <script src="/rtl-edit.js"></script>
      <script src="/rtl-app.js"></script>
    </div>
  );
}