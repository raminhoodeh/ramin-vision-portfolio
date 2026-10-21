import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the actual scoped DOM helpers and detail component callbacks without
// a browser or a reimplementation of their focus/scroll behaviour.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/sections/ExperienceEducation.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('ExperienceEducation.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const names = ['captureMobileWorkReturn', 'restoreMobileWorkReturn', 'MobileWorkDetail'];
const code = names.map((name) => {
  const fn = ast.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(fn, `${name}: actual implementation exists`);
  return fn.getText(ast).replace(/^export\s+/, '');
}).join('\n') + '\nmodule.exports = { captureMobileWorkReturn, restoreMobileWorkReturn, MobileWorkDetail };';
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
let mobile = true;
const document = { fullscreenElement: null };
const refs = [];
const effects = [];
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
  module, exports: module.exports, require,
  window: { matchMedia: () => ({ matches: mobile }) }, document,
  useRef: () => ({ current: refs.shift() }), useLayoutEffect: (effect) => effects.push(effect),
  publicWorkValue: (value) => value, motion: { article: 'article' },
  MobileWorkSummaryCard() {}, WorkPublicDetails() {}, ProductVideoPreview() {},
  SelectedCompanyContextCard() {}, WorkFactRow() {}, WorkProductDetailsBlock() {},
});
const { captureMobileWorkReturn, restoreMobileWorkReturn, MobileWorkDetail } = module.exports;
const stage = {
  isConnected: true, scrollTop: 1360, scrollLeft: 12, style: { scrollBehavior: 'smooth' }, calls: [],
  scrollTo(options) { this.scrollTop = options.top; this.scrollLeft = options.left; this.calls.push(options); },
};
const section = { offsetTop: 24, closest: () => stage };
const saved = captureMobileWorkReturn(section, 'SIDE');
check(saved.companyName === 'SIDE' && saved.scrollTop === 1360 && saved.scrollLeft === 12, 'Capture the clicked company and both list coordinates before unmount');
check(captureMobileWorkReturn(null, 'SIDE') === null, 'Missing section does not create stale return state');
let focused = '';
const other = { dataset: { workCompany: 'Vivup' }, focus() { focused = 'Vivup'; } };
const remounted = { dataset: { workCompany: 'SIDE' }, focus(options) { focused = 'SIDE'; check(options.preventScroll, 'Focus prevents an implicit jump'); } };
const list = { isConnected: true, querySelectorAll: () => [other, remounted] };
stage.scrollTop = 0;
check(restoreMobileWorkReturn(list, saved), 'Restore to the new card after the list remounts');
check(focused === 'SIDE', 'Company identity wins over changed card position');
check(stage.scrollTop === 1360 && stage.scrollLeft === 12, 'Restore the original list position');
check(stage.style.scrollBehavior === 'smooth' && stage.calls.every((call) => call.behavior === 'instant'), 'Restoration is immediate and preserves the original scroll style');
focused = '';
check(!restoreMobileWorkReturn({ ...list, isConnected: false }, saved) && !focused, 'Leaving Work cancels focus restoration into a detached list');
check(!restoreMobileWorkReturn({ ...list, querySelectorAll: () => [other] }, saved) && !focused, 'Never restore focus to a different company when the original is absent');
stage.isConnected = false;
check(!restoreMobileWorkReturn(list, saved), 'Detached scroll container is ignored');
stage.isConnected = true;
let fallbackCalls = 0;
const legacyCard = { dataset: { workCompany: 'SIDE' }, focus(options) { fallbackCalls++; if (options) throw Error('Options unsupported'); stage.scrollTop = 0; } };
check(restoreMobileWorkReturn({ ...list, querySelectorAll: () => [legacyCard] }, saved), 'Older focus API falls back safely');
check(fallbackCalls === 2 && stage.scrollTop === 1360, 'A fallback focus scroll is corrected');

let closeFocus = 0;
let closed = 0;
refs.push({ closest: () => section }, { focus(options) { check(options.preventScroll, 'Detail entry focus does not scroll again'); closeFocus++; } });
const detail = MobileWorkDetail({ entry: { companyName: 'SIDE', location: 'Remote', customerClientTypesAndUserNumbers: 'Internal teams' }, index: 1, onClose: () => { closed++; } });
check(closeFocus === 0, 'Focus waits for the committed detail layout');
effects.shift()();
check(closeFocus === 1 && stage.scrollTop === 24, 'Mobile detail entry focuses its close control at the detail start');
let prevented = 0;
let stopped = 0;
const escape = () => detail.props.onKeyDownCapture({ key: 'Escape', defaultPrevented: false, preventDefault() { prevented++; }, stopPropagation() { stopped++; } });
escape();
check(closed === 1 && prevented === 1 && stopped === 1, 'Escape closes within this inline detail only');
document.fullscreenElement = {};
escape();
check(closed === 1, 'Escape remains available to exit fullscreen media');
document.fullscreenElement = null;
mobile = false;
escape();
check(closed === 1, 'Hidden desktop copy does not handle mobile Escape');
refs.push({ closest: () => section }, { focus() { closeFocus++; } });
MobileWorkDetail({ entry: { companyName: 'Vivup' }, index: 2, onClose() {} });
effects.shift()();
check(closeFocus === 1, 'Desktop work selection does not move focus into hidden mobile controls');
check(!detail.props['aria-modal'] && !detail.props.role, 'Inline detail is not turned into a global modal');
console.log(`Mobile Work return: ${checks} deterministic focus/scroll checks passed. Actual transition timing is checked in the browser.`);
