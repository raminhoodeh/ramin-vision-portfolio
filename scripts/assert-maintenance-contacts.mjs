import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

// The user-authorized contacts and five external proof links are the only
// exceptions to the public maintenance lock. Keep this exact allowlist
// independent from the page template and portfolio code.
const contacts = [
  { href: 'mailto:raminhoodeh@gmail.com', label: /email|raminhoodeh@gmail\.com/i },
  { href: 'https://www.linkedin.com/in/raminhoodeh', label: /linkedin/i },
  { href: 'https://wa.link/7g31wi', label: /whatsapp/i },
];
const proofLinks = [
  { href: 'https://nsso.me/', label: /\bnsso\b/i },
  { href: 'https://apps.apple.com/us/app/dreamsea/id6761101193', label: /\bdreamsea\b/i },
  { href: 'https://apps.apple.com/us/app/24seven-concierge/id6663954162', label: /\b24\s?seven\b/i },
  { href: 'https://www.coursera.org/learn/ai-product-management/', label: /\bcoursera\b/i },
  { href: 'https://www.udemy.com/course/from-product-manager-to-ai-product-manager/', label: /\budemy\b/i },
];
const destinations = [...contacts, ...proofLinks];
const visibleText = (html) => html
  .replace(/<(style|svg|script)\b[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ');

const fontUrls = new Set(['/_maintenance/inter-latin.woff2', '/_maintenance/instrument-serif-italic-latin.woff2']);

function assertExactAttributes(attributes, values, booleans = []) {
  let rest = attributes;
  for (const [name, expected] of Object.entries(values)) {
    const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'gi');
    const matches = [...attributes.matchAll(pattern)];
    assert.equal(matches.length, 1, `Exactly one explicit ${name} is required`);
    assert.equal(matches[0][2], expected, `Only the reviewed ${name} is allowed`);
    rest = rest.replace(pattern, ' ');
  }
  for (const name of booleans) {
    const pattern = new RegExp(`(?:^|\\s)${name}(?=\\s|$)`, 'gi');
    assert.equal([...rest.matchAll(pattern)].length, 1, `Exactly one boolean ${name} is required`);
    rest = rest.replace(pattern, ' ');
  }
  assert.equal(rest.trim(), '', 'No unexpected resource or executable attributes are allowed');
}

export function assertMaintenanceContacts(html, { requireVisual = false, expectedIntegrity, expectedProofIntegrity } = {}) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  assert.equal([...html.matchAll(/<script\b/gi)].length, scripts.length, 'Every reviewed script must be explicitly closed');
  assert.equal([...html.matchAll(/<\/script\s*>/gi)].length, scripts.length, 'Every script closing tag belongs to a reviewed entry');
  assert.ok(scripts.length === 0 || scripts.length === 2, 'Only the two independent reviewed scripts are allowed together');
  if (requireVisual) assert.equal(scripts.length, 2, 'Built maintenance contains independent proof and visual entries');
  for (const [index, [, attributes, content]] of scripts.entries()) {
    assert.equal(content.trim(), '', 'Inline JavaScript is not allowed');
    const src = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
    const proof = index === 0;
    assert.equal(src, proof ? '/_maintenance/proofs.js' : '/_maintenance/background.js', 'Small proof controller is first and independent of the asynchronous background');
    const integrity = attributes.match(/\bintegrity\s*=\s*(["'])(.*?)\1/i)?.[2];
    assert.match(integrity ?? '', /^sha384-[A-Za-z0-9+/]{64}$/, 'Both scripts require SHA-384 integrity');
    const expected = proof ? expectedProofIntegrity : expectedIntegrity;
    if (expected) assert.equal(integrity, expected, 'Script integrity matches its emitted independent bundle');
    assertExactAttributes(attributes, { src, integrity, crossorigin: 'anonymous', ...(proof ? {} : { fetchpriority: 'low' }) }, [proof ? 'defer' : 'async']);
  }
  const withoutScript = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const preloads = [...withoutScript.matchAll(/<link\b([^>]*)>/gi)];
  assert.ok(preloads.length === 0 || preloads.length === 2, 'Only the two reviewed font preloads are allowed together');
  if (requireVisual) assert.equal(preloads.length, 2, 'Original typography is discovered immediately from the initial HTML');
  const preloadedFonts = [];
  for (const [, rawAttributes] of preloads) {
    const attributes = rawAttributes.replace(/\/\s*$/, '');
    const href = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
    assert.ok(fontUrls.has(href), 'Only original first-party fonts may be preloaded');
    assertExactAttributes(attributes, { rel: 'preload', href, as: 'font', type: 'font/woff2', crossorigin: 'anonymous' });
    preloadedFonts.push(href);
  }
  if (preloads.length) assert.deepEqual(preloadedFonts.sort(), [...fontUrls].sort(), 'Each original font is preloaded exactly once');
  const withoutPreloads = withoutScript.replace(/<link\b[^>]*>/gi, '');
  assert.doesNotMatch(withoutScript, /<\/?button\b|\brole\s*=\s*(["'])[^"']*\bbutton\b[^"']*\1|\bdata-proof-motion(?:\s|=|>)/i, 'No pause/play buttons or replacement controls are rendered');
  assert.doesNotMatch(withoutScript, /\bclass\s*=\s*(["'])[^"']*\bhomepage-proof-(?:motion|pause|play|next)\b[^"']*\1/i, 'Removed pause/play icon markup cannot reappear');
  assert.doesNotMatch(withoutPreloads, /<(?:iframe|form|input|select|textarea|option|fieldset|nav|img|image|object|embed|link|base|audio|video|source|track|foreignObject|animate|animateMotion|animateTransform|set|use)\b/i,
    'Maintenance cannot load application code, media, embeds, forms or portfolio navigation');
  assert.doesNotMatch(withoutScript, /\b(?:src|srcset|xlink:href)\s*=|\son[a-z]+\s*=/i,
    'Only the reviewed decorative script may have a resource source; no executable event attributes');
  assert.doesNotMatch(html, /\/cv\b|drive\.google|docs\.google|View CV|Read my CV/i,
    'Maintenance cannot expose CV or document access');
  assert.doesNotMatch(html, /@import\b|expression\s*\(/i,
    'Maintenance styles cannot import external styles or expressions');
  const foundFonts = new Set();
  for (const match of html.matchAll(/\burl\s*\(\s*([^)]*)\)/gi)) {
    const reference = match[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2');
    if (fontUrls.has(reference)) foundFonts.add(reference);
    else assert.match(reference, /^#[a-z][\w:.-]*$/i, 'Only local decorative filters and the two reviewed fonts are allowed');
  }
  if (requireVisual) assert.deepEqual([...foundFonts].sort(), [...fontUrls].sort(), 'Built maintenance uses both original local fonts');

  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)];
  assert.equal([...html.matchAll(/<a\b/gi)].length, destinations.length, 'Exactly three contacts and five approved external proof anchors are allowed');
  assert.equal(anchors.length, destinations.length, 'Every approved anchor must be well-formed and closed');
  assert.equal([...withoutPreloads.matchAll(/\bhref\s*=/gi)].length, destinations.length, 'No href is allowed outside the eight approved anchors and two reviewed preloads');
  const found = [];
  for (const [, attributes, content] of anchors) {
    const hrefs = [...attributes.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)];
    assert.equal(hrefs.length, 1, 'Each approved anchor has one explicit quoted href');
    const href = hrefs[0][2];
    const approved = destinations.find((destination) => destination.href === href);
    assert.ok(approved, `Unapproved maintenance destination: ${href}`);
    assert.match(visibleText(content), approved.label, `Visible link label must identify ${href}`);
    assert.doesNotMatch(attributes, /\baria-hidden\s*=\s*(["'])true\1|\bhidden(?:\s|=|$)|\btabindex\s*=\s*(["'])-1\2/i, 'Approved links remain accessible');
    const target = attributes.match(/\btarget\s*=\s*(["'])(.*?)\1/i)?.[2];
    assert.equal([...attributes.matchAll(/\btarget\s*=/gi)].length, target ? 1 : 0, 'One target at most per link');
    if (!href.startsWith('mailto:')) assert.equal(target, '_blank', 'External proof and contact links open safely in a new tab');
    if (target) assert.equal(target, '_blank', 'Only the explicit new-tab target is allowed');
    if (target === '_blank') {
      const rel = attributes.match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2].toLowerCase().split(/\s+/) ?? [];
      assert.equal([...attributes.matchAll(/\brel\s*=/gi)].length, 1, 'A single explicit new-tab relationship is required');
      assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), 'New-tab links need noopener noreferrer');
    }
    found.push(href);
  }
  assert.deepEqual(found.sort(), destinations.map(({ href }) => href).sort(), 'Each approved contact and proof destination appears exactly once');
  assert.match(visibleText(html), /raminhoodeh@gmail\.com/, 'The email address remains readable without following a link');
}

export function checkMaintenanceContactPolicy() {
  const fixture = `<main><h1>Ramin Hoodeh</h1><p>Under construction</p><p>raminhoodeh@gmail.com</p>
    <svg aria-hidden="true"><filter id="maintenance-glass"><feGaussianBlur stdDeviation="1" /></filter></svg>
    <style>.lens{backdrop-filter:blur(7px) url(#maintenance-glass)}</style>
    <a href="mailto:raminhoodeh@gmail.com"><span>Email</span></a>
    <a href="https://www.linkedin.com/in/raminhoodeh" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    <a href="https://wa.link/7g31wi" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    <a href="https://nsso.me/" target="_blank" rel="noopener noreferrer">NSSO</a>
    <a href="https://apps.apple.com/us/app/dreamsea/id6761101193" target="_blank" rel="noopener noreferrer">Dreamsea</a>
    <a href="https://apps.apple.com/us/app/24seven-concierge/id6663954162" target="_blank" rel="noopener noreferrer">24Seven</a>
    <a href="https://www.coursera.org/learn/ai-product-management/" target="_blank" rel="noopener noreferrer">Coursera</a>
    <a href="https://www.udemy.com/course/from-product-manager-to-ai-product-manager/" target="_blank" rel="noopener noreferrer">Udemy</a></main>`;
  assertMaintenanceContacts(fixture);
  const visualFixture = [...fontUrls].map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin="anonymous" />`).join('')
    + fixture.replace('</style>', '@font-face{font-family:Inter;src:url("/_maintenance/inter-latin.woff2")}@font-face{font-family:Instrument;src:url("/_maintenance/instrument-serif-italic-latin.woff2")}</style>')
    + `<script defer src="/_maintenance/proofs.js" integrity="sha384-${'A'.repeat(64)}" crossorigin="anonymous"></script>`
    + `<script async src="/_maintenance/background.js" integrity="sha384-${'A'.repeat(64)}" crossorigin="anonymous" fetchpriority="low"></script>`;
  assertMaintenanceContacts(visualFixture, { requireVisual: true });
  const rejected = [
    ['internal page', fixture.replace('https://wa.link/7g31wi', '/projects')],
    ['different external link', fixture.replace('https://wa.link/7g31wi', 'https://example.com')],
    ['lookalike destination', fixture.replace('https://wa.link/7g31wi', 'https://wa.link/7g31wi?redirect=/cv')],
    ['javascript URL', fixture.replace('https://wa.link/7g31wi', 'javascript:alert(1)')],
    ['encoded destination', fixture.replace('mailto:raminhoodeh@gmail.com', 'mailto&#58;raminhoodeh@gmail.com')],
    ['duplicate approved contact', fixture.replace('https://wa.link/7g31wi', 'https://www.linkedin.com/in/raminhoodeh')],
    ['internal proof destination', fixture.replace('https://nsso.me/', '/projects/nsso')],
    ['CV proof destination', fixture.replace('https://nsso.me/', '/cv')],
    ['lookalike proof destination', fixture.replace('https://nsso.me/', 'https://nsso.me.evil.example/')],
    ['unapproved app identifier', fixture.replace('id6761101193', 'id0000000000')],
    ['course redirect suffix', fixture.replace('https://www.coursera.org/learn/ai-product-management/', 'https://www.coursera.org/learn/ai-product-management/?next=/cv')],
    ['missing proof destination', fixture.replace(/<a href="https:\/\/nsso\.me\/"[^>]*>NSSO<\/a>/, '')],
    ['duplicate proof destination', fixture.replace('https://nsso.me/', 'https://apps.apple.com/us/app/dreamsea/id6761101193').replace('>NSSO</a>', '>Dreamsea</a>')],
    ['additional internal proof link', fixture.replace('</main>', '<a href="/projects">Portfolio</a></main>')],
    ['unlabelled proof destination', fixture.replace('>NSSO</a>', '>Open</a>')],
    ['hidden proof destination', fixture.replace('<a href="https://nsso.me/', '<a hidden href="https://nsso.me/')],
    ['unfocusable proof destination', fixture.replace('<a href="https://nsso.me/', '<a tabindex="-1" href="https://nsso.me/')],
    ['proof missing new-tab target', fixture.replace('href="https://nsso.me/" target="_blank"', 'href="https://nsso.me/"')],
    ['proof missing safe relationship', fixture.replace('href="https://nsso.me/" target="_blank" rel="noopener noreferrer"', 'href="https://nsso.me/" target="_blank"')],
    ['duplicate target attribute', fixture.replace('href="https://nsso.me/"', 'target="_self" href="https://nsso.me/"')],
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
    ['unapproved button', fixture + '<button type="button">Open portfolio</button>'],
    ['unapproved input', fixture + '<input name="provider-query" />'],
    ['removed native pause control', visualFixture + '<button type="button" class="homepage-proof-motion" data-proof-motion="" aria-label="Pause proof rotation" aria-pressed="false" title="Pause proof rotation"><svg aria-hidden="true"><path d="M4 3v10" /></svg></button>'],
    ['replacement ARIA pause control', visualFixture + '<span role="button" tabindex="0" aria-label="Pause rotation">Pause</span>'],
    ['replacement motion control hook', visualFixture + '<span data-proof-motion="">Pause</span>'],
    ['removed play icon without button', visualFixture + '<svg class="homepage-proof-play" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg>'],
    ['removed pause icon without button', visualFixture + '<svg class="homepage-proof-pause" aria-hidden="true"><path d="M4 3v10" /></svg>'],
    ['unclosed control', visualFixture + '<button type="button">Pause'],
    ['additional decorative script', visualFixture + `<script defer src="/_maintenance/background.js" integrity="sha384-${'A'.repeat(64)}" crossorigin="anonymous"></script>`],
    ['inline decorative script', visualFixture.replace('</script>', 'alert(1)</script>')],
    ['different script entry', visualFixture.replace('/_maintenance/background.js', '/assets/index.js')],
    ['external script entry', visualFixture.replace('/_maintenance/background.js', 'https://example.com/background.js')],
    ['missing SRI', visualFixture.replace(/ integrity="[^"]+"/, '')],
    ['invalid SRI', visualFixture.replace('sha384-', 'sha256-')],
    ['script event handler', visualFixture.replace(' defer ', ' defer onload="alert(1)" ')],
    ['module application entry', visualFixture.replace(' defer ', ' defer type="module" ')],
    ['blocking proof entry', visualFixture.replace(' defer ', ' ')],
    ['background blocks proof discovery', visualFixture.replace(' async ', ' defer ')],
    ['background elevated priority', visualFixture.replace('fetchpriority="low"', 'fetchpriority="high"')],
    ['coupled proof/background entry', visualFixture.replace('src="/_maintenance/proofs.js"', 'src="/_maintenance/background.js"')],
    ['missing independent proof entry', visualFixture.replace(/<script defer[^>]*><\/script>/, '')],
    ['proof integrity mismatch', visualFixture, { expectedProofIntegrity: `sha384-${'B'.repeat(64)}` }],
    ['visual integrity mismatch', visualFixture, { expectedIntegrity: `sha384-${'B'.repeat(64)}` }],
    ['font preload missing', visualFixture.replace(/<link\b[^>]*>/, '')],
    ['font preload duplicated', visualFixture.replace('/_maintenance/instrument-serif-italic-latin.woff2', '/_maintenance/inter-latin.woff2')],
    ['extra font preload', visualFixture + '<link rel="preload" href="/_maintenance/inter-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />'],
    ['external font preload', visualFixture.replace('/_maintenance/inter-latin.woff2', 'https://example.com/font.woff2')],
    ['stylesheet disguised as preload', visualFixture.replace('rel="preload"', 'rel="stylesheet"')],
    ['font preload as script', visualFixture.replace('as="font"', 'as="script"')],
    ['wrong font preload content type', visualFixture.replace('type="font/woff2"', 'type="text/javascript"')],
    ['font preload event', visualFixture.replace('rel="preload"', 'rel="preload" onload="alert(1)"')],
    ['font preload duplicate href', visualFixture.replace('rel="preload"', 'rel="preload" href="/_maintenance/inter-latin.woff2"')],
    ['font preload missing crossorigin', visualFixture.replace(' crossorigin="anonymous"', '')],
    ['unexpected local font', visualFixture.replace('/_maintenance/inter-latin.woff2', '/fonts/other.woff2')],
    ['external font', visualFixture.replace('/_maintenance/inter-latin.woff2', 'https://example.com/font.woff2')],
  ];
  for (const [name, html, options] of rejected) assert.throws(() => assertMaintenanceContacts(html, options), undefined, `Reject ${name}`);
  return rejected.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Maintenance contact/proof policy passed: exact three-contact plus five-proof-link allowlist and ${checkMaintenanceContactPolicy()} rejection fixtures.`);
}
