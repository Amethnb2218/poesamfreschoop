// Convertit les .md du dossier POESAM en .html imprimables (Ctrl+P pour PDF)
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Mini Markdown → HTML (suffit pour ce dossier)
function md(text) {
  let out = text;
  // Échapper les caractères HTML dangereux dans les blocs code
  out = out.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const safe = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code class="lang-${lang}">${safe}</code></pre>`;
  });
  // Titres
  out = out.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  out = out.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  out = out.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  out = out.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Hr
  out = out.replace(/^---$/gm, '<hr>');
  // Blockquote
  out = out.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  // Tables GitHub-style
  out = out.replace(/((?:^\|.+\|\s*\n)+)/gm, (block) => {
    const lines = block.trim().split('\n');
    const rows = lines.map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
    if (rows.length < 2) return block;
    const [header, sep, ...body] = rows;
    if (!sep.every((c) => /^-+:?$|^:?-+:?$/.test(c))) return block;
    const thead = `<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    return `<table>${thead}${tbody}</table>`;
  });
  // Listes
  out = out.replace(/(^(?:[-*] .+\n?)+)/gm, (m) => {
    const items = m.trim().split('\n').map((l) => l.replace(/^[-*] /, ''));
    return `<ul>${items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
  });
  out = out.replace(/(^(?:\d+\. .+\n?)+)/gm, (m) => {
    const items = m.trim().split('\n').map((l) => l.replace(/^\d+\. /, ''));
    return `<ol>${items.map((i) => `<li>${inline(i)}</li>`).join('')}</ol>`;
  });
  // Paragraphes
  out = out
    .split(/\n\n+/)
    .map((block) => {
      if (/^\s*<(h\d|ul|ol|table|pre|hr|blockquote)/.test(block)) return block;
      return `<p>${inline(block.trim())}</p>`;
    })
    .join('\n');
  return out;
}

function inline(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br>');
}

const css = `
* { box-sizing: border-box; }
body {
  font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
  color: #1a2e25;
  max-width: 880px;
  margin: 40px auto;
  padding: 40px;
  line-height: 1.55;
  background: #fff;
}
h1 { color: #0a4b3e; font-size: 2rem; border-bottom: 3px solid #1f835d; padding-bottom: 10px; margin-top: 2rem; }
h2 { color: #0a4b3e; font-size: 1.4rem; margin-top: 1.8rem; border-bottom: 1px solid #d7e5dc; padding-bottom: 6px; }
h3 { color: #1f835d; font-size: 1.15rem; margin-top: 1.4rem; }
h4 { color: #247f9a; font-size: 1rem; margin-top: 1.2rem; }
p { margin: 0.6em 0; }
ul, ol { margin: 0.6em 0; padding-left: 22px; }
li { margin: 0.2em 0; }
blockquote { border-left: 4px solid #1f835d; margin: 1em 0; padding: 0.4em 1em; background: #e4f7ef; color: #0a4b3e; font-style: italic; border-radius: 0 4px 4px 0; }
hr { border: 0; border-top: 2px solid #d7e5dc; margin: 2em 0; }
code { background: #edf6f1; padding: 2px 6px; border-radius: 4px; color: #0a4b3e; font-family: Consolas, 'Courier New', monospace; font-size: 0.92em; }
pre { background: #071b14; color: #e4f7ef; padding: 16px; border-radius: 8px; overflow-x: auto; }
pre code { background: transparent; color: inherit; padding: 0; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.92em; }
th { background: #0a4b3e; color: #fff; padding: 10px 12px; text-align: left; }
td { padding: 10px 12px; border-bottom: 1px solid #d7e5dc; vertical-align: top; }
tr:nth-child(even) td { background: #f7fbf8; }
strong { color: #0a4b3e; }
a { color: #1f835d; text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; }
@media print {
  body { max-width: 100%; margin: 0; padding: 20px; }
  h1, h2, h3 { page-break-after: avoid; }
  table, pre { page-break-inside: avoid; }
}
.print-hint {
  position: fixed;
  top: 12px; right: 12px;
  background: #0a4b3e;
  color: #fff;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
@media print { .print-hint { display: none; } }
`;

function wrap(title, html) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>${css}</style>
</head>
<body>
<div class="print-hint">📄 Ctrl+P → Enregistrer en PDF</div>
${html}
</body>
</html>`;
}

const files = (await readdir(__dirname)).filter((f) => f.endsWith('.md'));
for (const file of files) {
  const raw = await readFile(path.join(__dirname, file), 'utf8');
  const title = file.replace(/\.md$/, '').replace(/^\d+-/, '').replace(/-/g, ' ');
  const html = wrap(title, md(raw));
  const out = path.join(__dirname, file.replace(/\.md$/, '.html'));
  await writeFile(out, html, 'utf8');
  console.log('✓', path.basename(out));
}
console.log('\n🎉 Conversion terminée. Ouvre les .html dans ton navigateur puis Ctrl+P → Enregistrer au format PDF');
