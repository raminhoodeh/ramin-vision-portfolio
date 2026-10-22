import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

// Contact links are the only exception to the public maintenance lock. Keep
// this exact allowlist independent from the page template and portfolio code.
const contacts = [
  { href: 'mailto:raminhoodeh@gmail.com', label: /email|raminhoodeh@gmail\.com/i },
  { href: 'https://www.linkedin.com/in/raminhoodeh', label: /linkedin/i },
  { href: 'https://wa.link/7g31wi', label: /whatsapp/i },
];
const visibleText = (html) => html
  .replace(/<(style|svg|script)\b[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ');

export function assertMaintenanceContacts(html, { requireVisual = false, expectedIntegrity } = {}) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  assert.equal([...html.matchAll(/<script\b/gi)].length, scripts.length, 'Every decorative script must be explicitly closed');
  assert.ok(scripts.length <= 1, 'Only one isolated decorative script is allowed');
  if (requireVisual) assert.equal(scripts.length, 1, 'Built maintenance restores the original decorative shader');
  for (const [, attributes, content] of scripts) {
    assert.equal(content.trim(), '', 'Inline JavaScript is not allowed');
    const src = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
    assert.equal(src, '/_maintenance/background.js', 'Only the reviewed decorative entry is allowed');
    const integrity = attributes.match(/\bintegrity\s*=\s*(["'])(.*?)\1/i)?.[2];
    assert.match(integrity ?? '', /^sha384-[A-Za-z0-9+/]{64}$/, 'Decorative script requires SHA-384 integrity');
    if (expectedIntegrity) assert.equal(integrity, expectedIntegrity, 'Script integrity matches the emitted decorative bundle');
    assert.match(attributes, /\sdefer(?:\s|$)/i, 'The decorative entry must defer until the page is parsed');
    assert.match(attributes, /\bcrossorigin\s*=\s*(["'])anonymous\1/i, 'Decorative script uses anonymous SRI loading');
    const rest = attributes
      .replace(/\s+(?:src|integrity|crossorigin)\s*=\s*(["'])(.*?)\1/gi, '')
      .replace(/\s+defer\b/gi, '').trim();
    assert.equal(rest, '', 'No executable or unexpected script attributes are allowed');
    for (const name of ['src', 'integrity', 'crossorigin', 'defer']) assert.equal([...attributes.matchAll(new RegExp(`(?:^|\\s)${name}(?=\\s|=|$)`, 'gi'))].length, 1, `Single ${name} attribute`);
  }
  const withoutScript = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  assert.doesNotMatch(withoutScript, /<(?:iframe|form|button|nav|img|image|object|embed|link|base|audio|video|source|track|foreignObject|animate|animateMotion|animateTransform|set|use)\b/i,
    'Maintenance cannot load application code, media, embeds, forms or portfolio navigation');
  assert.doesNotMatch(withoutScript, /\b(?:src|srcset|xlink:href)\s*=|\son[a-z]+\s*=/i,
    'Only the reviewed decorative script may have a resource source; no executable event attributes');
  assert.doesNotMatch(html, /\/cv\b|drive\.google|docs\.google|View CV|Read my CV/i,
    'Maintenance cannot expose CV or document access');
  assert.doesNotMatch(html, /@import\b|expression\s*\(/i,
    'Maintenance styles cannot import external styles or expressions');
  const fontUrls = new Set(['/_maintenance/inter-latin.woff2', '/_maintenance/instrument-serif-italic-latin.woff2']);
  const foundFonts = new Set();
  for (const match of html.matchAll(/\burl\s*\(\s*([^)]*)\)/gi)) {
    const reference = match[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2');
    if (fontUrls.has(reference)) foundFonts.add(reference);
    else assert.match(reference, /^#[a-z][\w:.-]*$/i, 'Only local decorative filters and the two reviewed fonts are allowed');
  }
  if (requireVisual) assert.deepEqual([...foundFonts].sort(), [...fontUrls].sort(), 'Built maintenance uses both original local fonts');

  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)];
  assert.equal([...html.matchAll(/<a\b/gi)].length, 3, 'Exactly three contact anchors are allowed');
  assert.equal(anchors.length, 3, 'Every contact anchor must be well-formed and closed');
  assert.equal([...html.matchAll(/\bhref\s*=/gi)].length, 3, 'No href is allowed outside the three contacts');
  const found = [];
  for (const [, attributes, content] of anchors) {
    const hrefs = [...attributes.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)];
    assert.equal(hrefs.length, 1, 'Each contact has one explicit quoted href');
    const href = hrefs[0][2];
    const approved = contacts.find((contact) => contact.href === href);
    assert.ok(approved, `Unapproved maintenance destination: ${href}`);
    assert.match(visibleText(content), approved.label, `Contact label must identify ${href}`);
    assert.doesNotMatch(attributes, /\baria-hidden\s*=\s*(["'])true\1|\bhidden(?:\s|=|$)/i, 'Contacts remain accessible');
    const target = attributes.match(/\btarget\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (target === '_blank') {
      const rel = attributes.match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2].toLowerCase().split(/\s+/) ?? [];
      assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), 'New-tab contacts need noopener noreferrer');
    }
    found.push(href);
  }
  assert.deepEqual(found.sort(), contacts.map(({ href }) => href).sort(), 'Each approved contact appears exactly once');
  assert.match(visibleText(html), /raminhoodeh@gmail\.com/, 'The email address remains readable without following a link');
}

export function checkMaintenanceContactPolicy() {
  const fixture = `<main><h1>Ramin Hoodeh</h1><p>Under construction</p><p>raminhoodeh@gmail.com</p>
    <svg aria-hidden="true"><filter id="maintenance-glass"><feGaussianBlur stdDeviation="1" /></filter></svg>
    <style>.lens{backdrop-filter:blur(7px) url(#maintenance-glass)}</style>
    <a href="mailto:raminhoodeh@gmail.com"><span>Email</span></a>
    <a href="https://www.linkedin.com/in/raminhoodeh" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    <a href="https://wa.link/7g31wi" target="_blank" rel="noopener noreferrer">WhatsApp</a></main>`;
  assertMaintenanceContacts(fixture);
  const visualFixture = fixture.replace('</style>', '@font-face{font-family:Inter;src:url("/_maintenance/inter-latin.woff2")}@font-face{font-family:Instrument;src:url("/_maintenance/instrument-serif-italic-latin.woff2")}</style>')
    + `<script defer src="/_maintenance/background.js" integrity="sha384-${'A'.repeat(64)}" crossorigin="anonymous"></script>`;
  assertMaintenanceContacts(visualFixture, { requireVisual: true });
  const rejected = [
    ['internal page', fixture.replace('https://wa.link/7g31wi', '/projects')],
    ['different external link', fixture.replace('https://wa.link/7g31wi', 'https://example.com')],
    ['lookalike destination', fixture.replace('https://wa.link/7g31wi', 'https://wa.link/7g31wi?redirect=/cv')],
    ['javascript URL', fixture.replace('https://wa.link/7g31wi', 'javascript:alert(1)')],
    ['encoded destination', fixture.replace('mailto:raminhoodeh@gmail.com', 'mailto&#58;raminhoodeh@gmail.com')],
    ['duplicate approved contact', fixture.replace('https://wa.link/7g31wi', 'https://www.linkedin.com/in/raminhoodeh')],
    ['extra contact', fixture.replace('</main>', '<a href="mailto:raminhoodeh@gmail.com">Email</a></main>')],
    ['unlabelled link', fixture.replace('>WhatsApp</a>', '><svg><path d="M0 0" /></svg></a>')],
    ['hidden contact', fixture.replace('<a href="https://wa.link', '<a aria-hidden="true" href="https://wa.link')],
    ['unsafe new tab', fixture.replace('rel="noopener noreferrer"', 'rel="noopener"')],
    ['executable attribute', fixture.replace('<main>', '<main onload="alert(1)">')],
    ['external source', fixture.replace('</main>', '<svg src="https://example.com/payload"></svg></main>')],
    ['external CSS URL', fixture.replace('url(#maintenance-glass)', 'url(https://example.com/pixel)')],
    ['external stylesheet', fixture.replace('</style>', '@import "https://example.com/style.css";</style>')],
    ['SVG linked resource', fixture.replace('</main>', '<svg><use href="#maintenance-glass" /></svg></main>')],
    ['script payload', fixture.replace('</main>', '<script>console.log(1)</script></main>')],
    ['additional decorative script', visualFixture + `<script defer src="/_maintenance/background.js" integrity="sha384-${'A'.repeat(64)}" crossorigin="anonymous"></script>`],
    ['inline decorative script', visualFixture.replace('</script>', 'alert(1)</script>')],
    ['different script entry', visualFixture.replace('/_maintenance/background.js', '/assets/index.js')],
    ['external script entry', visualFixture.replace('/_maintenance/background.js', 'https://example.com/background.js')],
    ['missing SRI', visualFixture.replace(/ integrity="[^"]+"/, '')],
    ['invalid SRI', visualFixture.replace('sha384-', 'sha256-')],
    ['script event handler', visualFixture.replace(' defer ', ' defer onload="alert(1)" ')],
    ['module application entry', visualFixture.replace(' defer ', ' defer type="module" ')],
    ['unexpected local font', visualFixture.replace('/_maintenance/inter-latin.woff2', '/fonts/other.woff2')],
    ['external font', visualFixture.replace('/_maintenance/inter-latin.woff2', 'https://example.com/font.woff2')],
  ];
  for (const [name, html] of rejected) assert.throws(() => assertMaintenanceContacts(html), undefined, `Reject ${name}`);
  return rejected.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Maintenance contact policy passed: exact three-contact allowlist and ${checkMaintenanceContactPolicy()} rejection fixtures.`);
}
