import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Files requested by HTML and static imports. Dynamic imports are deliberately excluded. */
export function initialAssetReport(dist = path.join(root, 'dist'), route = '/') {
  const htmlPath = path.join(dist, route === '/' ? 'index.html' : `${route.replace(/^\/+|\/+$/g, '')}/index.html`);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const pending = [...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"[^>]*>/g)]
    .map((match) => match[1]).filter((url) => /\.(?:js|css)(?:\?|$)/.test(url) && !/^https?:/.test(url));
  const seen = new Set();
  const files = [];
  while (pending.length) {
    const url = pending.pop().split('?')[0];
    const relative = url.replace(/^\//, '');
    if (seen.has(relative)) continue;
    seen.add(relative);
    const file = path.join(dist, relative);
    const bytes = fs.readFileSync(file);
    files.push({ file: relative, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
    if (!relative.endsWith('.js')) continue;
    const ast = ts.createSourceFile(relative, bytes.toString(), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    for (const node of ast.statements) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const imported = node.moduleSpecifier.text;
        if (imported.startsWith('.')) pending.push(path.posix.join(path.posix.dirname(relative), imported));
      }
    }
  }
  const sum = (items, field) => items.reduce((total, file) => total + file[field], 0);
  const javascript = files.filter((file) => file.file.endsWith('.js'));
  const css = files.filter((file) => file.file.endsWith('.css'));
  return {
    route, capturedAt: new Date().toISOString(),
    htmlBytes: Buffer.byteLength(html), htmlGzipBytes: gzipSync(html).length,
    hasReadableInitialContent: html.includes('id="portfolio-initial"') && /<h1[\s>]/.test(html),
    files: files.sort((a, b) => a.file.localeCompare(b.file)),
    javascriptBytes: sum(javascript, 'bytes'), javascriptGzipBytes: sum(javascript, 'gzipBytes'),
    cssBytes: sum(css, 'bytes'), cssGzipBytes: sum(css, 'gzipBytes'),
    totalBytes: sum(files, 'bytes'), gzipBytes: sum(files, 'gzipBytes'),
    note: 'Static HTML/import graph and gzip estimates; excludes optional dynamic imports, images, fonts, media, request headers and browser timing. Not a Core Web Vitals measurement.',
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = initialAssetReport(process.argv[2] ? path.resolve(process.argv[2]) : undefined, process.argv[3] ?? '/');
  console.log(JSON.stringify(report, null, 2));
}
