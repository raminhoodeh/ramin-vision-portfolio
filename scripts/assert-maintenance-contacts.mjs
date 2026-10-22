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
  const buttons = [...withoutScript.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button\s*>/gi)];
  assert.equal([...withoutScript.matchAll(/<button\b/gi)].length, buttons.length, 'Every proof motion button must be explicitly closed');
  assert.equal([...withoutScript.matchAll(/<\/button\s*>/gi)].length, buttons.length, 'Every motion control closing tag belongs to the reviewed button');
  assert.ok(buttons.length <= 1, 'Only one proof rotation control is allowed');
  if (requireVisual) assert.equal(buttons.length, 1, 'Animated proof rotation must have its native pause control');
  const approvedMotionAttributes = {
    type: 'button',
    class: 'homepage-proof-motion',
    'data-proof-motion': '',
    'aria-label': 'Pause proof rotation',
    'aria-pressed': 'false',
    title: 'Pause proof rotation',
  };
  for (const [, attributes, content] of buttons) {
    let rest = attributes;
    for (const [name, expected] of Object.entries(approvedMotionAttributes)) {
      const matches = [...attributes.matchAll(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'gi'))];
      assert.equal(matches.length, 1, `Motion control has exactly one explicit ${name}`);
      assert.equal(matches[0][2], expected, `Only the reviewed motion control ${name} is allowed`);
      rest = rest.replace(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'gi'), ' ');
    }
    assert.equal(rest.trim(), '', 'No application, submission or executable button attributes are allowed');
    assert.doesNotMatch(content, /<(?:a|button)\b/i, 'The motion control cannot contain other interactive elements');
    assert.match(content, /<svg\b/i, 'The approved motion control retains its local SVG icon');
  }
  assert.doesNotMatch(withoutScript, /<(?:iframe|form|input|select|textarea|option|fieldset|nav|img|image|object|embed|link|base|audio|video|source|track|foreignObject|animate|animateMotion|animateTransform|set|use)\b/i,
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
  assert.equal([...html.matchAll(/<a\b/gi)].length, destinations.length, 'Exactly three contacts and five approved external proof anchors are allowed');
  assert.equal(anchors.length, destinations.length, 'Every approved anchor must be well-formed and closed');
  assert.equal([...html.matchAll(/\bhref\s*=/gi)].length, destinations.length, 'No href is allowed outside the eight approved anchors');
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
  const visualFixture = fixture.replace('</style>', '@font-face{font-family:Inter;src:url("/_maintenance/inter-latin.woff2")}@font-face{font-family:Instrument;src:url("/_maintenance/instrument-serif-italic-latin.woff2")}</style>')
    + '<button type="button" class="homepage-proof-motion" data-proof-motion="" aria-label="Pause proof rotation" aria-pressed="false" title="Pause proof rotation"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M4 3v10M12 3v10" /></svg></button>'
    + `<script defer src="/_maintenance/background.js" integrity="sha384-${'A'.repeat(64)}" crossorigin="anonymous"></script>`;
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
    ['unclosed button', visualFixture.replace('</button>', '')],
    ['duplicate motion button', visualFixture + visualFixture.match(/<button\b[\s\S]*?<\/button>/)[0]],
    ['submission control', visualFixture.replace('type="button"', 'type="submit"')],
    ['wrong control label', visualFixture.replace('aria-label="Pause proof rotation"', 'aria-label="Open AI assistant"')],
    ['incorrect initial pause state', visualFixture.replace('aria-pressed="false"', 'aria-pressed="true"')],
    ['incorrect motion selector', visualFixture.replace('data-proof-motion=""', 'data-ai-provider="gemini"')],
    ['unexpected control attribute', visualFixture.replace('type="button"', 'type="button" form="provider"')],
    ['control provider event', visualFixture.replace('type="button"', 'type="button" onclick="fetch(\'/api/ai-ramin\')"')],
    ['control resource source', visualFixture.replace('<svg aria-hidden="true" viewBox', '<svg src="https://example.com/provider" aria-hidden="true" viewBox')],
    ['missing motion icon', visualFixture.replace(/<svg aria-hidden="true" viewBox="0 0 16 16">[\s\S]*?<\/svg>/, '')],
    ['nested interactive control', visualFixture.replace('</button>', '<button type="button">Extra</button></button>')],
    ['missing required motion control', visualFixture.replace(/<button\b[\s\S]*?<\/button>/, ''), { requireVisual: true }],
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
  for (const [name, html, options] of rejected) assert.throws(() => assertMaintenanceContacts(html, options), undefined, `Reject ${name}`);
  return rejected.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Maintenance contact/proof policy passed: exact three-contact plus five-proof-link allowlist and ${checkMaintenanceContactPolicy()} rejection fixtures.`);
}
