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
const keptIntro = '8+ years delivering commercial results. I build AI products proven to grow revenue and teach the judgment behind them.';
const removedProposition = 'I am the AI product manager companies bring in when money needs to move somewhere it has never moved before.';
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
  assert.ok(!nodes.some((node) => ['button', 'input', 'select', 'textarea', 'option', 'fieldset'].includes(node.tag)
    || (node.attributes?.role ?? '').toLowerCase().split(/\s+/).includes('button')
    || has(node, 'data-proof-motion')), 'No native or substitute pause/play controls are rendered');
  assert.ok(!nodes.some((node) => (node.attributes?.class ?? '').split(/\s+/).some((name) => /^homepage-proof-(?:motion|pause|play|next)$/.test(name))), 'Removed pause/play icon markup is absent');
  const visibleBodyText = normalize(nodes.filter((node) => {
    if (node.tag !== '#text') return false;
    try { assertVisible(node, 'Visible body text'); return true; } catch { return false; }
  }).map((node) => node.text).join(' '));
  assert.equal(visibleBodyText.split(keptIntro).length - 1, 1, 'The approved 8+ years subtitle is visible exactly once');
  assert.doesNotMatch(visibleBodyText, /I\s+am\s+the\s+AI\s+product\s+manager\s+companies\s+bring\s+in\s+when\s+money\s+needs\s+to\s+move\s+somewhere\s+it\s+has\s+never\s+moved\s+before\b/i, 'The removed money-movement proposition cannot reappear as visible content');
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
  assertText(summary, `${expected.learners} Learners`, 'Instructor learner total with the approved short label');
  assertText(summary, `${expected.rating}/5`, 'Published instructor rating score and denominator');
  assertText(summary, `${expected.reviews} reviews`, 'Udemy instructor review total');
  const summaryVisibleText = normalize(nodes.filter((node) => {
    if (node.tag !== '#text' || !inside(summary, node)) return false;
    try { assertVisible(node, 'Teaching summary text'); return true; } catch { return false; }
  }).map((node) => node.text).join(' '));
  assert.doesNotMatch(summaryVisibleText, /\bUdemy\s+learners\b/i, 'Visible learner label stays concise without the platform prefix');
  const scopeLabels = nodes.filter((node) => inside(summary, node)).flatMap((node) => [node.attributes?.title ?? '', node.attributes?.['aria-label'] ?? '']).join(' ');
  assert.match(scopeLabels, /\bUdemy\b/i, 'The simplified learner label retains its platform scope in accessible text or a tooltip');
  assert.match(scopeLabels, /\binstructor\b/i, 'The score and counters retain instructor-level scope');
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
  const learnerText = `${expected.learners} Learners`;
  const ratingText = `${expected.rating}/5`;
  const reviewText = `${expected.reviews} reviews`;
  const summary = `<div data-teaching-summary="" class="homepage-proof-summary homepage-proof-detail" title="Udemy instructor rating and totals"><p>${learnerText}</p><p>${ratingText} · ${reviewText}</p>${expected.badges.map((badge) => `<span>${badge}</span>`).join('')}</div>`;
  const intro = `<p class="homepage-hero__intro">${keptIntro}</p>`;
  const links = destinations.map((href, index) => `<a href="${href}">Link ${index + 1}</a>`);
  const fixture = `<!doctype html><html><head>${fonts.map((href) => `<link rel="preload" as="font" href="${href}" type="font/woff2" crossorigin="anonymous">`).join('')}<style>.example::after{content:"<a hidden>"}</style><script defer src="/_maintenance/proofs.js"></script><script async src="/_maintenance/background.js"></script></head><body data-note="a > b"><main>${intro}<section data-proof-ticker="commercial"><div data-proof-slide="" data-active="true"><h3>${expected.commercial}</h3></div><div data-proof-slide="" data-active="false" aria-hidden="true" inert>Other result</div></section>${summary}${links.join('')}</main></body></html>`;
  assertHomepageFirstRender(fixture, expected);
  assertHomepageFirstRender(fixture.replace('</main>', `<p hidden>${removedProposition}</p></main>`), expected);
  assertHomepageFirstRender(fixture.replace(keptIntro, '<span>8&#43; years</span> delivering commercial results. I build AI products proven to grow revenue and teach the judgment behind them.'), expected);
  const rejected = [
    ['removed money proposition visible', fixture.replace('</main>', `<h2>${removedProposition}</h2></main>`)],
    ['removed money proposition split and encoded', fixture.replace('</main>', '<h2><span>I am the AI product manager</span> companies bring in when money needs to move somewhere it has <strong>never moved befor&#101;.</strong></h2></main>')],
    ['missing approved subtitle', fixture.replace(intro, '')],
    ['hidden approved subtitle', fixture.replace(intro, `<div hidden>${intro}</div>`)],
    ['duplicate approved subtitle', fixture.replace('</main>', `${intro}</main>`)],
    ['changed approved subtitle', fixture.replace('AI products proven to grow revenue', 'AI systems that might grow revenue')],
    ['removed native pause control', fixture.replace('</main>', '<button type="button" aria-label="Pause proof rotation">Pause</button></main>')],
    ['substitute ARIA pause control', fixture.replace('</main>', '<span role="button" tabindex="0">Pause</span></main>')],
    ['removed motion control hook', fixture.replace('</main>', '<span data-proof-motion="">Pause</span></main>')],
    ['removed play icon', fixture.replace('</main>', '<svg class="homepage-proof-play" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg></main>')],
    ['summary inside inactive ticker', fixture.replace(summary, `<div data-proof-ticker="teaching"><div data-proof-slide="" data-active="false">${summary}</div></div>`)],
    ['summary inside active ticker', fixture.replace(summary, `<div data-proof-ticker="teaching">${summary}</div>`)],
    ['hidden summary ancestor', fixture.replace(summary, `<div hidden>${summary}</div>`)],
    ['inert summary ancestor', fixture.replace(summary, `<div inert>${summary}</div>`)],
    ['aria-hidden summary ancestor', fixture.replace(summary, `<div aria-hidden="true">${summary}</div>`)],
    ['inline hidden summary ancestor', fixture.replace(summary, `<div style="display:none">${summary}</div>`)],
    ['hidden learner text', fixture.replace(learnerText, `<span hidden>${learnerText}</span>`)],
    ['obsolete platform-prefixed learner label', fixture.replace(learnerText, `${expected.learners} Udemy learners`)],
    ['visible platform-prefixed learner label repeated', fixture.replace(learnerText, `${learnerText}<span>${expected.learners} Udemy learners</span>`)],
    ['missing instructor rating', fixture.replace(ratingText, '')],
    ['hidden instructor rating', fixture.replace(ratingText, `<span hidden>${ratingText}</span>`)],
    ['inert instructor rating', fixture.replace(ratingText, `<span inert>${ratingText}</span>`)],
    ['aria-hidden instructor rating', fixture.replace(ratingText, `<span aria-hidden="true">${ratingText}</span>`)],
    ['incorrect instructor rating', fixture.replace(ratingText, '5.0/5')],
    ['incorrect rating denominator', fixture.replace(ratingText, `${expected.rating}/10`)],
    ['missing review total', fixture.replace(reviewText, '')],
    ['hidden review total', fixture.replace(reviewText, `<span hidden>${reviewText}</span>`)],
    ['incorrect review total', fixture.replace(reviewText, '999,999 reviews')],
    ['missing platform scope', fixture.replace('Udemy instructor rating and totals', 'Instructor rating and totals')],
    ['missing instructor scope', fixture.replace('Udemy instructor rating and totals', 'Udemy rating and totals')],
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
  const [learners, rating, reviews, badges, commercial] = await Promise.all([
    reviewedLiteral('src/data/teachingEvidence.ts', 'instructorTeachingEvidence', ['totalLearners']),
    reviewedLiteral('src/data/teachingEvidence.ts', 'instructorTeachingEvidence', ['rating']),
    reviewedLiteral('src/data/teachingEvidence.ts', 'instructorTeachingEvidence', ['reviews']),
    reviewedLiteral('src/data/teachingEvidence.ts', 'aiProductCourseEvidence', ['udemy', 'badges']),
    reviewedLiteral('src/data/homepage.ts', 'homepagePositioning', ['strengthCommercial']),
  ]);
  const expected = { learners, rating, reviews, badges, commercial };
  const rejected = regressionFixtures(expected);
  if (!process.argv.includes('--self-test')) assertHomepageFirstRender(await readFile(path.join(root, 'dist/index.html'), 'utf8'), expected);
  console.log(`Homepage first HTML ${process.argv.includes('--self-test') ? 'fixtures' : 'visibility'} passed: persistent Learners, published instructor score/reviews with platform scope and AI-course badges, eight visible native anchors, visible first commercial proof, approved 8+ years subtitle exactly once, removed money proposition and pause/play controls, font preloads, independent script order; ${rejected} rejected visibility/loading regressions. This is a static markup check, not a browser timing measurement.`);
}
