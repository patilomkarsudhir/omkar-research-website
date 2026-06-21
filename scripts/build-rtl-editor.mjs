import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import JSZip from 'jszip';

const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, 'public');
const zipPath = path.join(publicDir, 'Real Time Latex.zip');
const outputCssPath = path.join(publicDir, 'latex-editor.css');

const jsxFiles = [
  ['rtl-components.jsx', 'rtl-components.js'],
  ['rtl-edit.jsx', 'rtl-edit.js'],
  ['rtl-app.jsx', 'rtl-app.js'],
];

async function transpileJsx() {
  for (const [inputName, outputName] of jsxFiles) {
    const inputPath = path.join(publicDir, inputName);
    const outputPath = path.join(publicDir, outputName);
    const source = await fs.readFile(inputPath, 'utf8');
    const result = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2018,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.None,
      },
      fileName: inputName,
    });
    await fs.writeFile(outputPath, result.outputText, 'utf8');
  }
}

async function extractCss() {
  const zipData = await fs.readFile(zipPath);
  const zip = await JSZip.loadAsync(zipData);
  const htmlFile = zip.file('Real Time LaTeX.html');
  if (!htmlFile) {
    throw new Error('Real Time LaTeX.html not found inside zip');
  }
  const html = await htmlFile.async('string');
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) {
    throw new Error('Could not find style block in Real Time LaTeX.html');
  }
  await fs.writeFile(outputCssPath, styleMatch[1].trim() + '\n', 'utf8');
}

await extractCss();
await transpileJsx();