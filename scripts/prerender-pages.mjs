import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { CANONICAL_ORIGIN, getPageMetadata, getStructuredData, serializeStructuredData, portfolioPreview, previewImagePath, publicPages } from '../src/seo/routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const baseHtml = (await readFile(path.join(dist, 'index.html'), 'utf8'))
  .replace(/<div id="portfolio-initial">[\s\S]*?(?=<div id="root"><\/div>)/, '')
  .replace(/<script\b(?=[^>]*\bid="portfolio-structured-data")[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<link rel="stylesheet" href="\/initial-content.css"\s*\/?>/g, '');
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const head = (metadata) => `<title>${escape(metadata.title)}</title>
<meta name="description" content="${escape(metadata.description)}" />
<meta name="robots" content="${metadata.robots}" />
${metadata.canonical ? `<link rel="canonical" href="${metadata.canonical}" /><meta property="og:url" content="${metadata.canonical}" />` : ''}
<meta property="og:type" content="website" /><meta property="og:site_name" content="Ramin Hoodeh" />
<meta property="og:title" content="${escape(metadata.title)}" /><meta property="og:description" content="${escape(metadata.description)}" />
<meta property="og:image" content="${metadata.image}" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escape(metadata.title)}" /><meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(metadata.title)}" /><meta name="twitter:description" content="${escape(metadata.description)}" /><meta name="twitter:image" content="${metadata.image}" /><meta name="twitter:image:alt" content="${escape(metadata.title)}" />
${metadata.canonical ? `<script id="portfolio-structured-data" type="application/ld+json">${serializeStructuredData(getStructuredData(metadata.path))}</script>` : ''}`;

const css = `html{background:#edf3f7;color:#26384d;font-family:Arial,sans-serif}html:not([data-portfolio-ready=true]),html:not([data-portfolio-ready=true]) body{height:auto!important;max-height:none!important;overflow:auto!important;overscroll-behavior:auto!important}html:not([data-portfolio-ready=true]) #root{position:absolute;inset:0;visibility:hidden;pointer-events:none}.initial-document{max-width:1120px;margin:auto;padding:2rem 1.5rem 7rem}.initial-document *{box-sizing:border-box}.initial-document main{max-width:900px;margin:2rem auto}.initial-document h1{font-size:clamp(2rem,5vw,3.8rem);line-height:1.12;letter-spacing:-.035em}.initial-document h2{font-size:1.6rem;line-height:1.3;margin-top:2.5rem}.initial-document h3{font-size:1.15rem}.initial-document p,.initial-document li,.initial-document dd{font-size:1rem;line-height:1.85;color:#344b62}.initial-document a{color:#28577f;text-decoration:underline;text-underline-offset:.2em}.initial-document nav{display:flex;flex-wrap:wrap;gap:.8rem 1.5rem}.initial-document-nav{display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;padding-bottom:1.5rem;border-bottom:1px solid #bfcddd}.initial-document section{margin-top:1.8rem}.initial-document dt{font-weight:700;margin-top:.8rem}.initial-document dd{margin-left:0}.initial-document img{max-width:100%;height:auto}.initial-document footer{padding-top:2rem;border-top:1px solid #bfcddd}.initial-document .product-method-summary,.initial-document .disx-talk-page{padding:0;width:100%}.initial-document .disx-talk-page__meta{display:flex;flex-wrap:wrap;gap:1rem 2rem}.initial-document .disx-talk-page__example,.initial-document .disx-talk-page__takeaways{padding-left:1.5rem}.initial-document .disx-talk-page__transcript{max-width:72ch}.initial-document .disx-talk-page__editorial-note{padding:1rem;border-left:3px solid #8ca6be;background:#fff}.initial-document .professional-story-page{padding:0}.initial-document [style*="opacity: 0"],.initial-document [style*="opacity:0"]{opacity:1!important}`;
// Reader components also have dark interactive treatments. The static document has one
// deliberately consistent light reading surface; these rules never target the live #root.
const initialReaderReset = `
.initial-document{background:#edf3f7!important;color:#26384d!important}
.initial-document *{background:transparent!important;background-image:none!important;color:#26384d!important;opacity:1!important;box-shadow:none!important;text-shadow:none!important}
.initial-document *::before,.initial-document *::after{background:transparent!important;background-image:none!important;box-shadow:none!important;text-shadow:none!important}
.initial-document a,.initial-document a *{color:#28577f!important;text-decoration-color:#28577f!important}
`;
await writeFile(path.join(dist, 'initial-content.css'), css + initialReaderReset);

const assetNames = await readdir(path.join(dist, 'assets'));
const resolveAssets = (html) => html.replace(/(?:src|href)="(\/(?:src|thoughts-section|projects-section)\/[^"?#]+)([^" ]*)"/g, (match, url, suffix) => {
  const decoded = decodeURIComponent(url);
  const extension = path.extname(decoded);
  const stem = path.basename(decoded, extension);
  const file = assetNames.find((name) => name.startsWith(`${stem}-`) && name.endsWith(extension));
  return file ? match.replace(url + suffix, `/assets/${file}${suffix}`) : match;
});

function documentHtml(metadata, content) {
  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[\s\S]*?\/>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace('</head>', `${head(metadata)}<link rel="stylesheet" href="/initial-content.css" /></head>`)
    .replace('<div id="root"></div>', `<div id="portfolio-initial">${resolveAssets(content)}</div><div id="root"></div>`);
}

async function preview(metadata, imagePath) {
  const title = metadata.title.replace(/ \| Ramin Hoodeh$/, '');
  const words = title.split(' '); const lines = []; let line = '';
  for (const word of words) { if ((line + ' ' + word).trim().length > 34 && line) { lines.push(line); line = word; } else line = (line + ' ' + word).trim(); }
  if (line) lines.push(line);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="bg"><stop stop-color="#e7eff6"/><stop offset="1" stop-color="#c9dbe9"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1080" cy="40" r="330" fill="#fff" opacity=".3"/><text x="85" y="98" fill="#526b84" font-family="Arial,sans-serif" font-size="24" letter-spacing="5">RAMIN HOODEH</text>${lines.slice(0, 4).map((text, index) => `<text x="80" y="${220 + index * 68}" fill="#233c57" font-family="Arial,sans-serif" font-size="54" font-weight="600">${escape(text)}</text>`).join('')}<text x="85" y="555" fill="#526b84" font-family="Arial,sans-serif" font-size="24">AI Product Manager · Builder · Educator</text></svg>`;
  const destination = path.join(dist, imagePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(destination);
}

const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
try {
  const { InitialDocument } = await server.ssrLoadModule('/src/seo/InitialDocument.tsx');
  for (const entry of publicPages) {
    const metadata = getPageMetadata(entry.path);
    let content;
    try { content = renderToStaticMarkup(React.createElement(InitialDocument, { page: entry })); }
    catch (error) { throw new Error(`Prerender failed for ${entry.path}: ${error.message}`, { cause: error }); }
    const html = documentHtml(metadata, content);
    const destination = entry.path === '/' ? path.join(dist, 'index.html') : path.join(dist, `${entry.path.slice(1)}.html`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, html);
    await preview(metadata, previewImagePath(entry.path));
  }
  await writeFile(path.join(dist, '404.html'), documentHtml(getPageMetadata('/404'), renderToStaticMarkup(React.createElement(InitialDocument, { page: null }))));
  await writeFile(path.join(dist, 'robots.txt'), portfolioPreview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`);
  await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map((entry) => `  <url><loc>${CANONICAL_ORIGIN}${entry.path}</loc></url>`).join('\n')}\n</urlset>\n`);
  console.log(`Prerendered ${publicPages.length} readable ${portfolioPreview ? 'Preview pages (noindex)' : 'public pages'}, social images, sitemap, robots and 404.`);
} finally { await server.close(); }
