import Script from "next/script";

export default function LatexPage() {
  return (
    <div className="w-full h-full">
      <div id="root" className="w-full h-full" />
      <Script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" strategy="beforeInteractive" crossOrigin="anonymous" />
      <Script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/stex/stex.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/edit/matchbrackets.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/edit/closebrackets.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/hint/show-hint.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/search/searchcursor.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js" strategy="beforeInteractive" crossOrigin="anonymous" />
      <Script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js" strategy="beforeInteractive" crossOrigin="anonymous" />
      <Script src="https://cdn.jsdelivr.net/npm/mathquill@0.10.1/build/mathquill.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js" strategy="beforeInteractive" crossOrigin="anonymous" />
      <Script
        id="latex-pdf-worker"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: "if (window.pdfjsLib) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; }",
        }}
      />
      <Script src="https://unpkg.com/react@18.3.1/umd/react.development.js" strategy="beforeInteractive" crossOrigin="anonymous" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" />
      <Script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" strategy="beforeInteractive" crossOrigin="anonymous" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" />
      <Script src="/rtl-parser.js" strategy="beforeInteractive" />
      <Script src="/rtl-compile.js" strategy="beforeInteractive" />
      <Script src="/rtl-components.js" strategy="beforeInteractive" />
      <Script src="/rtl-edit.js" strategy="beforeInteractive" />
      <Script src="/rtl-app.js" strategy="afterInteractive" />
    </div>
  );
}