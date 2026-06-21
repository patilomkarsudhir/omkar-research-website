export default function LatexHead() {
  return (
    <>
      <title>Real Time LaTeX</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/hint/show-hint.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathquill@0.10.1/build/mathquill.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=EB+Garamond:ital,opsz,wght@0,8..144,400;0,8..144,600;1,8..144,400;1,8..144,600&family=Inter:wght@300;400;500;600&display=swap" />
      <link rel="stylesheet" href="/latex-editor.css" />
    </>
  );
}