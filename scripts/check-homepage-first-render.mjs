import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const destinations = [
  'https://nsso.me/',
  'https://apps.apple.com/us/app/dreamsea/id6761101193',
  'https://apps.apple.com/us/app/24seven-concierge/id6663954162',
  'https://www.coursera.org/learn/ai-product-management/',
  'https://www.udemy.com/course/from-product-manager-to-ai-product-manager/',
  'mailto:raminhoodeh@gmail.com',
  'https://www.linkedin.com/in/raminhoodeh',
  'https://wa.link/7g31wi',
];
const fonts = ['/_maintenance/inter-latin.woff2', '/_maintenance/instrument-serif-italic-latin.woff2'];
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|apos|#39|#\d+|#x[\da-f]+);/gi, (entity) => {
  const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'" };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const value = entity.slice(2, -1);
  return String.fromCodePoint(value[0]?.toLowerCase() === 'x' ? Number.parseInt(value.slice(1), 16) : Number(value));
});

// This checks the actual initial HTML, not JSX strings or a post-JavaScript DOM.
// A tag stack is necessary: an anchor/metric may be unobscured itself while an
// ancestor makes it hidden or inert. Raw scripts/styles never count as content.
function parseHtml(html) {
  const document = { tag: '#document', attributes: {}, children: [], parent: null };
  const stack = [document];
  const nodes = [];
  let cursor = 0;
  while (cursor < html.length) {
    if (html.startsWith('<!--', cursor)) {
      const end = html.indexOf('-->', cursor + 4);
      assert.ok(end >= 0, 'HTML comment closes');
      cursor = end + 3;
      continue;
    }
    if (html[cursor] !== '<') {
      const end = html.indexOf('<', cursor);
      const text = { tag: '#text', text: decode(html.slice(cursor, end < 0 ? html.length : end)), parent: stack.at(-1) };
      stack.at(-1).children.push(text);
      nodes.push(text);
      cursor = end < 0 ? html.length : end;
      continue;
    }
    const token = html.slice(cursor).match(/^<(?:[^>"']|"[^"]*"|'[^']*')*>/);
    assert.ok(token, `Complete HTML tag at offset ${cursor}`);
    cursor += token[0].length;
    if (/^<!/i.test(token[0])) continue;
    const closing = token[0].match(/^<\/\s*([\w:-]+)\s*>$/);
    if (closing) {
      assert.equal(stack.at(-1).tag, closing[1].toLowerCase(), 'HTML nesting remains well formed');
      stack.pop();
      continue;
    }
    const opening = token[0].match(/^<([\w:-]+)([\s\S]*?)\/?>$/);
    assert.ok(opening, 'Recognised HTML opening tag');
    const attributes = {};
    for (const match of opening[2].matchAll(/([^\s=/'">]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      const name = match[1].toLowerCase();
      assert.ok(!Object.hasOwn(attributes, name), `Single ${name} attribute`);
      attributes[name] = decode(match[2] ?? match[3] ?? match[4] ?? '');
    }
    const node = { tag: opening[1].toLowerCase(), attributes, children: [], parent: stack.at(-1) };
    node.parent.children.push(node);
    nodes.push(node);
    if (['script', 'style', 'title', 'textarea'].includes(node.tag)) {
      const remainder = html.slice(cursor);
      const end = new RegExp(`<\\/\\s*${node.tag}\\s*>`, 'i').exec(remainder);
      assert.ok(end, `Raw ${node.tag} content closes`);
      cursor += end.index + end[0].length;
    } else if (!voidTags.has(node.tag) && !/\/\s*>$/.test(token[0])) stack.push(node);
  }
  assert.equal(stack.length, 1, 'All initial HTML elements close');
  return nodes;
}

const has = (node, name) => Object.hasOwn(node.attributes ?? {}, name);
const ancestors = (node) => {
  const result = [];
  for (let current = node; current; current = current.parent) result.push(current);
  return result;
};
function assertVisible(node, label) {
  for (const ancestor of ancestors(node)) {
    const attributes = ancestor.attributes ?? {};
    assert.ok(!['head', 'template', 'script', 'style'].includes(ancestor.tag), `${label} is real body content`);
    assert.ok(!has(ancestor, 'hidden') && !has(ancestor, 'inert'), `${label} has no hidden/inert ancestor`);
    assert.notEqual(attributes['aria-hidden']?.toLowerCase(), 'true', `${label} has no aria-hidden ancestor`);
    if (has(ancestor, 'data-proof-slide')) assert.equal(attributes['data-active'], 'true', `${label} is not an inactive proof`);
    const classes = (attributes.class ?? '').split(/\s+/);
    assert.ok(!classes.some((name) => ['hidden', 'invisible', 'sr-only'].includes(name)), `${label} is not visually hidden`);
    for (const declaration of (attributes.style ?? '').split(';')) {
      const separator = declaration.indexOf(':');
      if (separator < 0) continue;
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const value = declaration.slice(separator + 1).replace(/!important/gi, '').trim().toLowerCase();
      assert.ok(!(property === 'display' && value === 'none') && !(property === 'visibility' && ['hidden', 'collapse'].includes(value)) && !(property === 'opacity' && /^(?:0+(?:\.0*)?|\.0+)$/.test(value)), `${label} has no hidden inline style`);
    }
  }
}

async function reviewedLiteral(filename, declarationName, fields) {
  const source = ts.createSourceFile(filename, await readFile(path.join(root, filename), 'utf8'), ts.ScriptTarget.Latest, true);
  let value = source.statements.filter(ts.isVariableStatement).flatMap((statement) => [...statement.declarationList.declarations]).find((declaration) => declaration.name.getText(source) === declarationName)?.initializer;
  const unwrap = (node) => {
    while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
    return node;
  };
  for (const field of fields) {
    value = unwrap(value);
    assert.ok(value && ts.isObjectLiteralExpression(value), `Reviewed ${declarationName} object`);
    value = value.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(source) === field)?.initializer;
  }
  value = unwrap(value);
  if (value && ts.isStringLiteralLike(value)) return value.text;
  assert.ok(value && ts.isArrayLiteralExpression(value) && value.elements.every(ts.isStringLiteralLike), `Reviewed ${declarationName} literal`);
  return value.elements.map((element) => element.text);
}

export function assertHomepageFirstRender(html, expected) {
  const nodes = parseHtml(html);
  const summaries = nodes.filter((node) => has(node, 'data-teaching-summary'));
  assert.equal(summaries.length, 1, 'Exactly one persistent teaching summary is emitted');
  const summary = summaries[0];
  assertVisible(summary, 'Teaching summary');
  assert.ok(!ancestors(summary).some((node) => has(node, 'data-proof-ticker')), 'Teaching summary is outside every rotating ticker');
  const inside = (ancestor, node) => ancestors(node).includes(ancestor);
  const assertText = (ancestor, text, label) => {
    const matches = nodes.filter((node) => node.tag === '#text' && inside(ancestor, node) && normalize(node.text).includes(text));
    assert.equal(matches.length, 1, `${label} occurs once as initial text`);
    assertVisible(matches[0], label);
  };
  assertText(summary, `${expected.learners} Udemy learners`, 'Udemy instructor learner total');
  assertText(summary, `${expected.reviews} reviews`, 'Udemy instructor review total');
  for (const badge of expected.badges) assertText(summary, badge, `AI-course ${badge} badge`);

  const anchors = nodes.filter((node) => node.tag === 'a');
  assert.equal(anchors.length, destinations.length, 'Exactly five proof links and three contacts are initial anchors');
  for (const href of destinations) {
    const matches = anchors.filter((node) => node.attributes.href === href);
    assert.equal(matches.length, 1, `One initial anchor for ${href}`);
    assertVisible(matches[0], href);
    const labels = nodes.filter((node) => node.tag === '#text' && inside(matches[0], node) && normalize(node.text));
    assert.ok(labels.some((label) => { try { assertVisible(label, href); return true; } catch { return false; } }), `${href} has an initially visible label`);
  }
  const commercial = nodes.find((node) => node.attributes?.['data-proof-ticker'] === 'commercial');
  assert.ok(commercial, 'Commercial proof group exists');
  const firstSlide = nodes.find((node) => has(node, 'data-proof-slide') && inside(commercial, node));
  assert.ok(firstSlide, 'First commercial proof is emitted');
  assertVisible(firstSlide, 'First commercial proof');
  assertText(firstSlide, expected.commercial, 'First commercial result');

  const preloads = nodes.filter((node) => node.tag === 'link' && node.attributes.rel === 'preload' && node.attributes.as === 'font');
  assert.deepEqual(preloads.map((node) => node.attributes.href).sort(), [...fonts].sort(), 'Both original local fonts are preloaded');
  for (const preload of preloads) {
    assert.equal(preload.attributes.type, 'font/woff2', 'Font preload declares WOFF2');
    assert.ok(has(preload, 'crossorigin') && ['', 'anonymous'].includes(preload.attributes.crossorigin), 'Font preload uses anonymous CORS');
  }
  const scripts = nodes.filter((node) => node.tag === 'script');
  assert.equal(scripts.length, 2, 'Proof controls and shader have separate scripts');
  assert.match(scripts[0].attributes.src ?? '', /^\/_maintenance\/[\w-]+\.js$/, 'Lean proof controls load from the isolated local namespace');
  assert.notEqual(scripts[0].attributes.src, '/_maintenance/background.js', 'Proof controls precede the shader');
  assert.ok(has(scripts[0], 'defer') && !has(scripts[0], 'async'), 'Proof controls defer until initial HTML is parsed');
  assert.equal(scripts[1].attributes.src, '/_maintenance/background.js', 'Original shader loads independently after proof entry');
  assert.ok(has(scripts[1], 'async') && !has(scripts[1], 'defer'), 'Shader loading does not hold the proof controls in a deferred execution queue');
}

function regressionFixtures(expected) {
  const summary = `<div data-teaching-summary="" class="homepage-proof-summary homepage-proof-detail"><p>${expected.learners} Udemy learners · ${expected.reviews} reviews</p>${expected.badges.map((badge) => `<span>${badge}</span>`).join('')}</div>`;
  const links = destinations.map((href, index) => `<a href="${href}">Link ${index + 1}</a>`);
  const fixture = `<!doctype html><html><head>${fonts.map((href) => `<link rel="preload" as="font" href="${href}" type="font/woff2" crossorigin="anonymous">`).join('')}<style>.example::after{content:"<a hidden>"}</style><script defer src="/_maintenance/proofs.js"></script><script async src="/_maintenance/background.js"></script></head><body data-note="a > b"><main><section data-proof-ticker="commercial"><div data-proof-slide="" data-active="true"><h3>${expected.commercial}</h3></div><div data-proof-slide="" data-active="false" aria-hidden="true" inert>Other result</div></section>${summary}${links.join('')}</main></body></html>`;
  assertHomepageFirstRender(fixture, expected);
  const rejected = [
    ['summary inside inactive ticker', fixture.replace(summary, `<div data-proof-ticker="teaching"><div data-proof-slide="" data-active="false">${summary}</div></div>`)],
    ['summary inside active ticker', fixture.replace(summary, `<div data-proof-ticker="teaching">${summary}</div>`)],
    ['hidden summary ancestor', fixture.replace(summary, `<div hidden>${summary}</div>`)],
    ['inert summary ancestor', fixture.replace(summary, `<div inert>${summary}</div>`)],
    ['aria-hidden summary ancestor', fixture.replace(summary, `<div aria-hidden="true">${summary}</div>`)],
    ['inline hidden summary ancestor', fixture.replace(summary, `<div style="display:none">${summary}</div>`)],
    ['hidden learner text', fixture.replace(`${expected.learners} Udemy learners`, `<span hidden>${expected.learners} Udemy learners</span>`)],
    ['hidden course badge', fixture.replace(`<span>${expected.badges[0]}</span>`, `<span aria-hidden="true">${expected.badges[0]}</span>`)],
    ['inactive first commercial result', fixture.replace('data-active="true"', 'data-active="false"')],
    ['missing original font preload', fixture.replace(/<link\b[^>]*>/, '')],
    ['shader before controls', fixture.replace(/<script defer[^>]*><\/script><script async[^>]*><\/script>/, '<script async src="/_maintenance/background.js"></script><script defer src="/_maintenance/proofs.js"></script>')],
    ['shader in deferred queue', fixture.replace('<script async', '<script defer')],
    ...links.map((link, index) => [`hidden ancestor for approved anchor ${index + 1}`, fixture.replace(link, `<div aria-hidden="true">${link}</div>`)]),
  ];
  for (const [label, html] of rejected) assert.throws(() => assertHomepageFirstRender(html, expected), undefined, `Reject ${label}`);
  return rejected.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [learners, reviews, badges, commercial] = await Promise.all([
    reviewedLiteral('src/data/teachingEvidence.ts', 'instructorTeachingEvidence', ['totalLearners']),
    reviewedLiteral('src/data/teachingEvidence.ts', 'instructorTeachingEvidence', ['reviews']),
    reviewedLiteral('src/data/teachingEvidence.ts', 'aiProductCourseEvidence', ['udemy', 'badges']),
    reviewedLiteral('src/data/homepage.ts', 'homepagePositioning', ['strengthCommercial']),
  ]);
  const expected = { learners, reviews, badges, commercial };
  const rejected = regressionFixtures(expected);
  if (!process.argv.includes('--self-test')) assertHomepageFirstRender(await readFile(path.join(root, 'dist/index.html'), 'utf8'), expected);
  console.log(`Homepage first HTML ${process.argv.includes('--self-test') ? 'fixtures' : 'visibility'} passed: persistent instructor totals and AI-course badges, eight visible native anchors, visible first commercial proof, font preloads, independent script order; ${rejected} rejected visibility/loading regressions. This is a static markup check, not a browser timing measurement.`);
}
