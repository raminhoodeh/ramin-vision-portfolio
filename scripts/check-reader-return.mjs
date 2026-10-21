import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declarations = ast.statements.filter(ts.isFunctionDeclaration);
const page = declarations.find((node) => node.name?.text === 'PortfolioPage');
assert.ok(page);
const helpers = ['captureReaderReturn', 'isReaderReturn', 'readerBackgroundRoute', 'restoreReaderReturn', 'scheduleReaderReturn'];
const helperCode = helpers.map((name) => {
  const node = declarations.find((candidate) => candidate.name?.text === name);
  assert.ok(node, `Production reader helper ${name}`);
  return node.getText(ast);
}).join('\n');
const compile = (code) => ts.transpileModule(code, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
} }).outputText;

const frames = new Map();
let frameId = 0;
let dialogOpen = false;
let mainFocuses = 0;
let resizes = 0;
class Element {
  isConnected = true;
  scrollTop = 0;
  scrollLeft = 0;
  hidden = false;
  disabled = false;
  inReader = false;
  focusable = true;
  children = [];
  focused = 0;
  revealed = 0;
  bounds = { top: 250, bottom: 280, left: 40, right: 180 };
  querySelectorAll() { return this.children; }
  closest(selector) {
    if (selector === '.portfolio-reader-layer') return this.inReader ? this : null;
    return this.hidden ? this : null;
  }
  matches(selector) { return selector === ':disabled' ? this.disabled : this.focusable; }
  getClientRects() { return this.hidden ? [] : [this.bounds]; }
  getBoundingClientRect() { return this.bounds; }
  scrollTo({ top, left }) { this.scrollTop = top; this.scrollLeft = left; }
  scrollIntoView(options) { this.revealed++; this.revealOptions = options; }
  focus(options) { this.focused++; this.focusOptions = options; document.activeElement = this; }
}
const stage = new Element();
stage.bounds = { top: 20, bottom: 700, left: 20, right: 1260 };
const main = new Element();
const body = new Element();
const html = new Element();
const document = { body, documentElement: html, activeElement: body, querySelector: () => stage };
const window = {
  scrollX: 0, scrollY: 0, innerWidth: 1280, innerHeight: 720,
  scrollTo({ top, left }) { this.scrollY = top; this.scrollX = left; },
  requestAnimationFrame(callback) { const id = ++frameId; frames.set(id, callback); return id; },
  cancelAnimationFrame(id) { frames.delete(id); },
  dispatchEvent() { resizes++; },
};
const context = {
  module: { exports: {} }, document, window, HTMLElement: Element, Event,
  getComputedStyle: (element) => ({ visibility: element.hidden ? 'hidden' : 'visible' }),
  hasOpenDialog: () => dialogOpen,
  focusRouteContent: (element) => { mainFocuses++; element?.focus({ preventScroll: true }); },
};
vm.createContext(context);
vm.runInContext(compile(`${helperCode}\nmodule.exports = { ${helpers.join(', ')} };`), context);
const api = context.module.exports;
const flushFrame = () => {
  const callbacks = [...frames.values()];
  frames.clear();
  for (const callback of callbacks) callback();
};
const location = { pathname: '/about', search: '?source=portfolio', hash: '' };
const about = { section: 'thoughts', documentPage: 'about', caseStudy: null, canonicalPath: '/about', scrollTargetId: null };
const reader = { section: 'thoughts', caseStudy: { id: 'metacognition-deep-dive' }, canonicalPath: '/thoughts/framework-of-metacognition', scrollTargetId: null };
const essayLink = new Element();
stage.scrollTop = 1420;
window.scrollY = 12;
document.activeElement = body; // Pointer activation need not focus a link in every browser.
const aboutReturn = api.captureReaderReturn(location, about, essayLink);
assert.equal(aboutReturn.opener, essayLink, 'Capture the clicked opener even when BODY has focus');
assert.equal(api.readerBackgroundRoute(reader, aboutReturn), about, 'About remains the same document beneath the essay');
assert.equal(api.readerBackgroundRoute(reader, null), reader, 'A cold reader URL does not invent an origin');
assert.ok(api.isReaderReturn(aboutReturn, { ...location }));
for (const changed of [{ pathname: '/thoughts' }, { search: '' }, { hash: '#thoughts-books' }]) {
  assert.equal(api.isReaderReturn(aboutReturn, { ...location, ...changed }), false, 'Only the captured destination restores its position');
}

// The real scheduler must wait for reader exit/inert cleanup, then restore the
// captured scroll rather than taking the ordinary route's top/anchor branch.
stage.scrollTop = 0;
window.scrollY = 0;
const readerControl = new Element();
readerControl.inReader = true;
document.activeElement = readerControl;
dialogOpen = true;
api.scheduleReaderReturn(aboutReturn, main);
flushFrame();
assert.equal(stage.scrollTop, 0);
assert.equal(essayLink.focused, 0, 'Never focus an inert background while its reader is open');
dialogOpen = false;
flushFrame();
assert.equal(stage.scrollTop, 1420);
assert.equal(window.scrollY, 12);
assert.equal(essayLink.focused, 1);
assert.equal(essayLink.focusOptions.preventScroll, true);
assert.equal(aboutReturn.pending, false);
assert.equal(resizes, 1);

// The expanded More products disclosure and nested scroll areas retain their
// existing elements because the original Projects document is the underlay.
const details = new Element();
details.open = true;
const nested = new Element();
nested.scrollTop = 88;
const qadamLink = new Element();
stage.children = [details, nested, qadamLink];
stage.scrollTop = 1960;
const projects = { ...about, section: 'projects', documentPage: undefined, canonicalPath: '/projects' };
const productsReturn = api.captureReaderReturn({ pathname: '/projects', search: '', hash: '' }, projects, qadamLink);
assert.equal(api.readerBackgroundRoute({ ...reader, section: 'projects' }, productsReturn), projects);
stage.scrollTop = 0;
nested.scrollTop = 0;
document.activeElement = readerControl;
api.restoreReaderReturn(productsReturn, main);
assert.equal(stage.scrollTop, 1960);
assert.equal(nested.scrollTop, 88);
assert.equal(details.open, true, 'Returning must not replace the expanded disclosure');
assert.equal(qadamLink.focused, 1);

// A changed layout may move the opener outside the viewport. Reveal it before
// focus; do not override a visitor who deliberately chose another control.
qadamLink.bounds.top = 1000;
qadamLink.bounds.bottom = 1030;
document.activeElement = body;
api.restoreReaderReturn(productsReturn, main);
assert.equal(qadamLink.revealed, 1);
assert.equal(qadamLink.revealOptions.block, 'nearest');
const otherControl = new Element();
document.activeElement = otherControl;
api.restoreReaderReturn(productsReturn, main);
assert.equal(document.activeElement, otherControl, 'Intentional user focus after closing takes precedence');
qadamLink.isConnected = false;
document.activeElement = body;
api.restoreReaderReturn(productsReturn, main);
assert.equal(mainFocuses, 1, 'A removed opener falls back to the visible main content');

// A route change cancels any pending frame instead of restoring an old page.
productsReturn.pending = true;
stage.scrollTop = 55;
dialogOpen = true;
const cancel = api.scheduleReaderReturn(productsReturn, main);
flushFrame();
cancel();
dialogOpen = false;
flushFrame();
assert.equal(stage.scrollTop, 55);
assert.equal(productsReturn.pending, true);

const variables = page.body.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]);
const variable = (name) => {
  const node = variables.find((candidate) => candidate.name.getText(ast) === name);
  assert.ok(node, `PortfolioPage variable ${name}`);
  return node;
};
assert.equal(variable('documentPage').initializer.getText(ast), 'backgroundRoute.documentPage', 'The actual rendered document uses the preserved underlay');
const backgroundCall = variable('backgroundRoute').initializer;
assert.ok(ts.isCallExpression(backgroundCall));
assert.equal(backgroundCall.expression.getText(ast), 'readerBackgroundRoute');
assert.equal(backgroundCall.arguments[1].getText(ast), 'readerReturnRef.current');

const effects = page.body.statements.filter((node) => ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && node.expression.expression.getText(ast) === 'useEffect').map((node) => node.expression.arguments[0]);
const scrollEffect = effects.find((node) => node.getText(ast).includes('scheduleReaderReturn('));
assert.ok(scrollEffect);
let normalResets = 0;
let anchors = 0;
let scheduled = 0;
let cleaned = 0;
const scrollContext = {
  module: { exports: {} }, isLoading: false, resolvedContentKey: '/about', routeKey: '/about', activeCaseStudy: null,
  readerReturnRef: { current: { ...aboutReturn, pending: true } }, location, mainRef: { current: main }, routeScrollTargetId: 'thoughts-books',
  isReaderReturn: api.isReaderReturn,
  scheduleReaderReturn() { scheduled++; return () => { cleaned++; }; },
  resetViewportScroll() { normalResets++; }, scrollToId() { anchors++; }, isLegacyHashRoute: () => false, window, Event,
};
vm.createContext(scrollContext);
vm.runInContext(compile(`module.exports = ${scrollEffect.getText(ast)};`), scrollContext);
const cleanup = scrollContext.module.exports();
assert.equal(scheduled, 1, 'The production scroll effect handles a reader return before normal scroll');
assert.equal(normalResets, 0);
assert.equal(anchors, 0, 'Returning to a subsection restores the reading position, not its starting anchor');
cleanup();
assert.equal(cleaned, 1, 'React effect cleanup cancels a stale return');
scrollContext.readerReturnRef.current = null;
scrollContext.routeScrollTargetId = null;
scrollContext.module.exports()();
assert.equal(normalResets, 1, 'Ordinary navigation retains top-of-page behavior');

const routeEffect = effects.find((node) => node.getText(ast).includes('setActiveSection(route.caseStudy'));
assert.ok(routeEffect);
const forwardSnapshot = { ...aboutReturn, pending: false };
stage.scrollTop = 1775;
const routeContext = {
  module: { exports: {} }, notFound: false, requestedRoute: reader,
  location: { pathname: reader.canonicalPath, search: location.search, hash: '' },
  readerReturnRef: { current: forwardSnapshot }, caseStudyReturnSection: 'thoughts',
  isLegacyHashRoute: () => false, navigate() { throw new Error('Canonical routes must not be replaced'); },
  setActiveSection() {}, setActiveCaseStudy() {}, setRouteScrollTargetId() {}, setCaseStudyReturnSection() {}, requestBonusRockPreload() {},
  captureReaderReturn: api.captureReaderReturn, isReaderReturn: api.isReaderReturn,
};
vm.createContext(routeContext);
vm.runInContext(compile(`module.exports = ${routeEffect.getText(ast)};`), routeContext);
routeContext.module.exports();
assert.equal(routeContext.readerReturnRef.current.pending, true, 'Forward re-arms the return');
assert.equal(routeContext.readerReturnRef.current.scroll[0].top, 1775, 'Forward captures the origin page’s current position');
routeContext.requestedRoute = about;
routeContext.location = location;
routeContext.module.exports();
assert.ok(routeContext.readerReturnRef.current, 'Native Back to the origin keeps its return snapshot');
routeContext.requestedRoute = { ...about, section: 'contact', canonicalPath: '/contact' };
routeContext.location = { pathname: '/contact', search: '', hash: '' };
routeContext.module.exports();
assert.equal(routeContext.readerReturnRef.current, null, 'Leaving for another route discards the old return');

console.log('Reader return passed: mounted About/Products origin, nested scroll, visible opener, dialog-exit wait, intentional focus, cancellation, Back/Forward and ordinary navigation.');
