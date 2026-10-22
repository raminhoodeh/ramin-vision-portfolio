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
  .replace(/<(style|svg)\b[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ');

export function assertMaintenanceContacts(html) {
  assert.doesNotMatch(html, /<(?:script|iframe|form|button|nav|img|image|object|embed|link|base|audio|video|source|track|foreignObject|animate|animateMotion|animateTransform|set|use)\b/i,
    'Maintenance cannot load application code, media, embeds, forms or portfolio navigation');
  assert.doesNotMatch(html, /\b(?:src|srcset|xlink:href)\s*=|\son[a-z]+\s*=/i,
    'Maintenance cannot have resource sources or executable event attributes');
  assert.doesNotMatch(html, /\/cv\b|drive\.google|docs\.google|View CV|Read my CV/i,
    'Maintenance cannot expose CV or document access');
  assert.doesNotMatch(html, /@import\b|@font-face\b|expression\s*\(/i,
    'Maintenance styles must remain self-contained');
  for (const match of html.matchAll(/\burl\s*\(\s*([^)]*)\)/gi)) {
    const reference = match[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2');
    assert.match(reference, /^#[a-z][\w:.-]*$/i, 'Only local decorative filter references are allowed');
  }

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
  ];
  for (const [name, html] of rejected) assert.throws(() => assertMaintenanceContacts(html), undefined, `Reject ${name}`);
  return rejected.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Maintenance contact policy passed: exact three-contact allowlist and ${checkMaintenanceContactPolicy()} rejection fixtures.`);
}
