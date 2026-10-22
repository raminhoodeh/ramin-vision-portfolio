import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cache = new Map();
const loaded = new Set();
const compile = (code) => ts.transpileModule(code, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;

function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  loaded.add(path.relative(root, file));
  const localRequire = (name) => {
    if (name.endsWith('.css')) return {};
    if (/\.(png|jpe?g|webp|gif|svg|webm|mp4)(\?url)?$/.test(name)) return `/assets/${path.basename(name)}`;
    if (name.endsWith('visitorJourney')) return { journeyMeasurementEnabled: () => false, setJourneyMeasurementEnabled() {}, recordJourneyEvent() {} };
    if (name.endsWith('hashgraphRockAssets')) return { hashgraphRockAssetPipeline: {}, validateHashgraphRockAssetPipeline() {} };
    if (name === 'gsap') return { default: { matchMedia() { throw new Error('Server render must not start Contact animation'); } } };
    if (!name.startsWith('.')) {
      assert.ok(!/^(three|@react-three|@shadergradient)/.test(name), `Direct resources must not import ${name}`);
      return require(name);
    }
    const base = path.resolve(path.dirname(file), name);
    const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    assert.ok(resolved, `Cannot resolve ${name} from ${file}`);
    return load(resolved);
  };
  vm.runInNewContext(compile(fs.readFileSync(file, 'utf8')), { module, exports: module.exports, require: localRequire }, { filename: file });
  return module.exports;
}

const { Resources } = load('src/sections/Resources.tsx');
const data = load('src/data/resources.ts');
const resourcesHtml = renderToStaticMarkup(React.createElement(Resources));
assert.ok(resourcesHtml.includes('<h1 id="resources-title">'), 'Resources has a readable page heading');
for (const resource of data.resourceStarterLinks) assert.ok(resourcesHtml.includes(`href="${resource.href}"`), `Direct starter link: ${resource.title}`);
for (const href of ['/presentation', '/talks/disx-dubai', '/product-method', '/bonus']) assert.ok(resourcesHtml.includes(`href="${href}"`), `Direct route ${href}`);
assert.ok(resourcesHtml.includes('fictional Risk Brief Assistant'), 'Evaluation example is identified as fictional teaching material');
assert.ok(resourcesHtml.includes('Coursera') && resourcesHtml.includes('LearnKartS') && resourcesHtml.includes('Udemy'));
assert.equal(data.resourceOffers.length, 4);
for (const offer of data.resourceOffers) {
  assert.ok(resourcesHtml.includes(offer.title), `${offer.title}: status remains inspectable without an interaction`);
  assert.ok(resourcesHtml.includes(`href="${offer.link}"`), `${offer.title}: direct route`);
}
for (const removedClaim of [/couponCode=/i, /FREEPM/, /iloverazin/, /lifetime membership/i, /over 350/i, /calendar\.app\.google/]) {
  assert.ok(!removedClaim.test(resourcesHtml), `Unsupported offer must not render: ${removedClaim}`);
}
for (const file of loaded) assert.ok(!/Bonus\.tsx|IPhone3D|ShaderGradientBackground|three\//.test(file), `${file}: Resources must render independently of decorative code`);

const { Contact } = load('src/sections/Contact.tsx');
const contactHtml = renderToStaticMarkup(React.createElement(Contact));
assert.ok(contactHtml.includes(`href="mailto:${data.resourceContact.email}"`), 'Email composition is a native link');
assert.ok(contactHtml.includes('>Copy email</button>'), 'Copy is a separate button');
assert.ok(contactHtml.includes(`>${data.resourceContact.email}</p>`), 'The address is visible/selectable');
for (const href of ['/resources', data.resourceContact.linkedin]) assert.ok(contactHtml.includes(`href="${href}"`), `Contact exposes ${href}`);
assert.ok(!contactHtml.includes('href="/cv"'), 'Contact does not expose a CV download');
assert.ok(contactHtml.includes('problem, team and timeline'), 'Contact explains what to send');
assert.ok(contactHtml.includes(data.resourceContact.timezoneLabel));
assert.ok(!/available (now|immediately)|response within|book a free/i.test(contactHtml), 'No invented availability or consultation entitlement');

// CV access is removed from the portfolio itself, including the ordinary site
// and its first HTML, independently of any temporary maintenance response.
function assertNoCvLinks(html, label) {
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    const pathname = new URL(href.replaceAll('&amp;', '&'), 'https://www.ramin.vision').pathname;
    assert.ok(!/^\/cv\/?$/i.test(pathname), `${label}: CV links must stay absent`);
  }
}
assertNoCvLinks(contactHtml, 'Contact');
const { Hero } = load('src/sections/Hero.tsx');
assertNoCvLinks(renderToStaticMarkup(React.createElement(Hero, { ready: true, onOpenThesis() {} })), 'Hero');
const { ProfessionalStories } = load('src/sections/ProfessionalStories.tsx');
const { professionalStories } = load('src/data/professionalStories.ts');
for (const story of professionalStories) {
  assertNoCvLinks(renderToStaticMarkup(React.createElement(ProfessionalStories, { activeSlug: story.slug })), `${story.company} story`);
  assert.ok(story.sourceRefs.some((source) => source.includes('CV')), 'Removing the CTA must retain career provenance');
}
const initialSource = fs.readFileSync(path.join(root, 'src/seo/InitialDocument.tsx'), 'utf8');
const initialAst = ts.createSourceFile('InitialDocument.tsx', initialSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const initialFunctions = ['Body', 'InitialDocument'].map((name) => {
  const declaration = initialAst.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(declaration, `First HTML ${name}`);
  return declaration.getText(initialAst).replace(/^export\s+/, '');
});
const initialModule = { exports: {} };
vm.runInNewContext(compile(`${initialFunctions.join('\n')}\nmodule.exports = { InitialDocument };`), {
  module: initialModule, exports: initialModule.exports, require,
  portfolioContent: { contactCta: { headline: 'Contact Ramin', hook: 'Let’s talk.' }, teachingSpeakingWriting: {} },
  resourceContact: data.resourceContact,
  portfolioDestinations: load('src/data/nav.ts').portfolioDestinations,
  NotFoundPage: () => React.createElement('h1', null, 'Page not found'),
});
for (const page of [null, { kind: 'contact' }]) {
  assertNoCvLinks(renderToStaticMarkup(React.createElement(initialModule.exports.InitialDocument, { page })), 'First HTML navigation, contact and footer');
}

const { BonusSection } = load('src/sections/Bonus.tsx');
const locked = renderToStaticMarkup(React.createElement(BonusSection, { rockClicks: 0, preloadStatus: 'idle', onRockClick() {} }));
const revealed = renderToStaticMarkup(React.createElement(BonusSection, { rockClicks: 3, preloadStatus: 'idle', onRockClick() {} }));
assert.ok(locked.includes('href="/resources"'), 'Bonus has a direct resources exit before any click');
assert.ok(locked.includes('<button') && locked.includes('aria-live="polite"'), 'Optional rock keeps its keyboard action and announcement');
for (const offer of data.resourceOffers) assert.ok(revealed.includes(offer.title) && revealed.includes(`href="${offer.link}"`), `${offer.title}: Bonus uses the same safe offer`);
for (const removedClaim of [/couponCode=/i, /FREEPM/, /iloverazin/, /lifetime membership/i]) assert.ok(!removedClaim.test(revealed));

// Execute the actual copy handler with deterministic clipboard/DOM fixtures.
const contactSource = fs.readFileSync(path.join(root, 'src/sections/Contact.tsx'), 'utf8');
const ast = ts.createSourceFile('Contact.tsx', contactSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const component = ast.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'Contact');
const handler = component.body.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]).find((node) => node.name.getText(ast) === 'handleCopyEmail');
assert.ok(handler && ts.isCallExpression(handler.initializer));
const copyCode = compile(`module.exports = ${handler.initializer.arguments[0].getText(ast)};`);
async function copyFixture({ clipboardWorks, commandThrows = false }) {
  let copied = false;
  let failed = false;
  let restored = false;
  let inserted = 0;
  let removed = 0;
  let clipboardValue;
  const events = [];
  class Element { focus() { restored = true; } }
  const module = { exports: {} };
  vm.runInNewContext(copyCode, {
    module, Error, HTMLElement: Element, emailAddress: data.resourceContact.email,
    navigator: { clipboard: { writeText: async (value) => { if (!clipboardWorks) throw new Error('Blocked test clipboard'); clipboardValue = value; } } },
    document: {
      activeElement: new Element(),
      body: { appendChild() { inserted += 1; }, removeChild() { removed += 1; } },
      createElement: () => ({ style: {}, setAttribute() {}, focus() {}, select() {}, setSelectionRange() {} }),
      execCommand: () => { if (commandThrows) throw new Error('Blocked fallback'); return true; },
    },
    setEmailCopied: (value) => { copied = value; }, setCopyFailed: (value) => { failed = value; },
    recordJourneyEvent: (...args) => events.push(args), copyResetTimeoutRef: { current: null },
    window: { setTimeout: () => 1, clearTimeout() {} },
  });
  await module.exports();
  return { copied, failed, restored, inserted, removed, clipboardValue, events };
}
const clipboard = await copyFixture({ clipboardWorks: true });
assert.equal(clipboard.copied, true);
assert.equal(clipboard.clipboardValue, data.resourceContact.email);
assert.equal(clipboard.inserted, 0, 'Native clipboard does not move focus');
assert.deepEqual(clipboard.events, [['contact_open', 'email_copy', 'contact']], 'Copy event contains only categories');
const fallback = await copyFixture({ clipboardWorks: false });
assert.equal(fallback.copied, true);
assert.equal(fallback.restored, true);
assert.equal(fallback.inserted, fallback.removed, 'Fallback removes temporary text selection');
const failure = await copyFixture({ clipboardWorks: false, commandThrows: true });
assert.equal(failure.failed, true);
assert.equal(failure.copied, false);
assert.equal(failure.restored, true);
assert.equal(failure.inserted, failure.removed, 'Failed fallback still cleans up and restores focus');
assert.equal(failure.events.length, 0, 'Failed copying is not reported as a completed contact action');

console.log('Contact/resources checks passed: no-browser direct resource render; starter/course links; four safe shared offers; pre-click resources access; compose/copy/LinkedIn and no public CV action; clipboard success/fallback/failure and focus cleanup. Live offer eligibility and booking availability are not claimed.');
