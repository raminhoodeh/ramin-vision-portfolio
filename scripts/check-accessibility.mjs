import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

// A small DOM fixture runs the actual keyboard/isolation utility without a browser,
// packages, network requests, or source-string assertions about visual presentation.
let document;
class Element {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parentElement = null;
    this.style = { overflow: '' };
    this.visible = true;
    this.disabled = false;
  }
  append(...children) { for (const child of children) { child.parentElement = this; this.children.push(child); } return this; }
  remove() {
    if (this.contains(document.activeElement)) document.activeElement = document.body;
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
  }
  get isConnected() { return this === document.body || Boolean(this.parentElement?.isConnected); }
  get inert() { return this.hasAttribute('inert'); }
  set inert(value) { if (value) this.setAttribute('inert', ''); else this.removeAttribute('inert'); }
  get tabIndex() { return this.hasAttribute('tabindex') ? Number(this.getAttribute('tabindex')) : /^(BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(this.tagName) || this.matches('a[href]') ? 0 : -1; }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  removeAttribute(key) { this.attributes.delete(key); }
  hasAttribute(key) { return this.attributes.has(key); }
  matches(selector) {
    return selector.split(',').some((part) => {
      part = part.trim();
      if (part === ':disabled') return this.disabled;
      const attr = part.match(/^(\w+)?\[([^=\]]+)(?:="([^"]*)")?\]$/);
      if (attr) return (!attr[1] || this.tagName === attr[1].toUpperCase()) && this.hasAttribute(attr[2]) && (attr[3] === undefined || this.getAttribute(attr[2]) === attr[3]);
      return part.toUpperCase() === this.tagName;
    });
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null; }
  contains(node) { return this === node || this.children.some((child) => child.contains(node)); }
  querySelectorAll(selector) { return this.children.flatMap((child) => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  getClientRects() { return this.visible && !this.closest('[hidden]') ? [{}] : []; }
  focus() {
    if (this.closest('[inert]')) return;
    document.activeElement = this;
    document.dispatch('focusin', { target: this });
  }
}

const listeners = new Map();
document = {
  body: new Element('body'),
  activeElement: null,
  querySelector(selector) { return this.body.querySelector(selector); },
  addEventListener(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); },
  removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
  dispatch(name, event) { for (const callback of [...(listeners.get(name) ?? [])]) callback(event); },
};
const module = { exports: {} };
const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/lib/dialogFocus.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
let reducedMotion = false;
const frames = new Map();
let frameId = 0;
function flushFrame() {
  for (const id of [...frames.keys()]) {
    const callback = frames.get(id);
    frames.delete(id);
    callback?.();
  }
}
vm.runInNewContext(compiled, {
  module, exports: module.exports, document, HTMLElement: Element, Node: Element,
  getComputedStyle: () => ({ visibility: 'visible' }),
  window: {
    matchMedia: () => ({ matches: reducedMotion }),
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
  },
});
const { activateDialog, getDialogFocusables, hasOpenDialog, focusRouteContent, prefersReducedMotion } = module.exports;

const main = new Element('main', { 'data-route-focus': '' });
const opener = new Element('button');
main.append(opener);
const existingInert = new Element('aside', { inert: '', 'aria-hidden': 'true' });
const backdrop = new Element('button', { 'data-dialog-backdrop': '', tabindex: '-1', 'aria-hidden': 'true' });
const root = new Element('section', { tabindex: '-1' });
const close = new Element('button', { 'data-dialog-initial': '' });
const link = new Element('a', { href: '/work/side' });
const disabled = new Element('button'); disabled.disabled = true;
const hidden = new Element('button'); hidden.visible = false;
const closedPanel = new Element('aside', { inert: '' }); closedPanel.append(new Element('button'));
root.append(close, disabled, hidden, closedPanel, link);
document.body.append(main, existingInert, backdrop, root);
document.body.style.overflow = 'scroll';
opener.focus();
let closeCount = 0;
const cleanup = activateDialog(root, () => { closeCount += 1; });
assert.equal(document.activeElement, close, 'Dialog starts at its visible labelled close control');
assert.equal(hasOpenDialog(), true);
assert.equal(main.inert, true, 'Background page is inert');
assert.equal(backdrop.inert, false, 'Pointer backdrop remains usable');
assert.equal(document.body.style.overflow, 'hidden');
assert.equal(getDialogFocusables(root).length, 2, 'Disabled, hidden and closed-panel controls are skipped');
assert.equal(focusRouteContent(main), false, 'Route focus cannot steal an open dialog');

function key(key, shiftKey = false) {
  const event = { key, shiftKey, prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } };
  document.dispatch('keydown', event);
  return event;
}
link.focus();
assert.equal(key('Tab').prevented, true);
assert.equal(document.activeElement, close, 'Tab wraps last to first');
assert.equal(key('Tab', true).prevented, true);
assert.equal(document.activeElement, link, 'Shift+Tab wraps first to last');
document.activeElement = opener;
document.dispatch('focusin', { target: opener });
assert.equal(document.activeElement, close, 'Programmatic background focus is rescued');
const escape = key('Escape');
assert.equal(closeCount, 1);
assert.equal(escape.prevented && escape.stopped, true, 'Escape is consumed by the active dialog');

// Nested AI panels/menu boundaries: only the top dialog closes, background stays inert.
const nested = new Element('aside', { tabindex: '-1' });
const nestedClose = new Element('button', { 'data-dialog-initial': '' });
nested.append(nestedClose);
root.append(nested);
link.focus();
let nestedCloseCount = 0;
const cleanupNested = activateDialog(nested, () => { nestedCloseCount += 1; });
key('Escape');
assert.equal(nestedCloseCount, 1);
assert.equal(closeCount, 1, 'Outer Escape handler stays inactive');
assert.equal(main.inert, true);
cleanupNested();
flushFrame();
assert.equal(document.activeElement, link, 'Nested close restores its opener');
assert.equal(main.inert, true, 'Nested cleanup preserves outer isolation');
cleanup();
cleanup();
flushFrame();
assert.equal(document.activeElement, opener, 'Close restores the original opener');
assert.equal(main.inert, false);
assert.equal(existingInert.inert, true, 'Pre-existing inert state survives');
assert.equal(existingInert.getAttribute('aria-hidden'), 'true', 'React-owned aria-hidden state is untouched');
assert.equal(document.body.style.overflow, 'scroll');
assert.equal(hasOpenDialog(), false);
assert.equal(listeners.get('keydown').size + listeners.get('focusin').size, 0, 'Cleanup removes keyboard and focus listeners');

// A direct URL has no surviving opener; restore the actual page target instead.
const empty = new Element('section', { tabindex: '-1' });
document.body.append(empty);
opener.focus();
const cleanupEmpty = activateDialog(empty, () => {});
assert.equal(document.activeElement, empty);
assert.equal(key('Tab').prevented, true, 'An empty dialog keeps focus on its root');
main.children = [];
opener.parentElement = null;
cleanupEmpty();
flushFrame();
assert.equal(document.activeElement, main, 'Disconnected opener falls back to the page');
assert.equal(main.getAttribute('tabindex'), '-1');
assert.equal(prefersReducedMotion(), false);
reducedMotion = true;
assert.equal(prefersReducedMotion(), true);

// Static HTML can keep the React root hidden until the route finishes mounting.
const coldReader = new Element('section', { tabindex: '-1' });
const coldClose = new Element('button', { 'data-dialog-initial': '' });
coldReader.append(coldClose); coldReader.visible = false;
document.body.append(coldReader);
main.focus();
const cleanupCold = activateDialog(coldReader, () => {});
assert.equal(document.activeElement, main, 'Hidden route does not receive premature focus');
coldReader.visible = true;
flushFrame();
assert.equal(document.activeElement, coldClose, 'Revealed cold-load reader receives focus on the next frame');
cleanupCold();
flushFrame();

document.activeElement = document.body;
const cleanupBodyOpener = activateDialog(coldReader, () => {});
cleanupBodyOpener();
flushFrame();
assert.equal(document.activeElement, main, 'Cold-load BODY is not treated as a restorable opener');
const nonFocusable = new Element('div');
main.append(nonFocusable);
document.activeElement = nonFocusable;
const cleanupNonFocusable = activateDialog(coldReader, () => {});
cleanupNonFocusable();
flushFrame();
assert.equal(document.activeElement, main, 'A non-focusable element without tabindex falls back to main');

// React's layout cleanup precedes its aria-hidden removal and AnimatePresence
// can keep the old dialog DOM mounted after that cleanup.
const pointerOpener = new Element('button'); main.append(pointerOpener);
pointerOpener.focus();
const cleanupCommitted = activateDialog(coldReader, () => {});
main.setAttribute('aria-hidden', 'true');
cleanupCommitted();
assert.equal(document.activeElement, coldClose, 'Cleanup does not restore focus before React commits');
assert.equal(frames.size, 1, 'One restoration is queued');
main.removeAttribute('aria-hidden');
flushFrame();
assert.equal(document.activeElement, pointerOpener, 'Focus restores after the underlay becomes available');
coldReader.remove();
assert.equal(document.activeElement, pointerOpener, 'Late exiting DOM removal does not reset restored focus');
document.body.append(coldReader);

document.activeElement = document.body;
const cleanupColdCommit = activateDialog(coldReader, () => {});
main.setAttribute('aria-hidden', 'true');
cleanupColdCommit();
coldReader.remove();
assert.equal(document.activeElement, document.body, 'Unmount can reset the departing close button to BODY');
main.removeAttribute('aria-hidden');
flushFrame();
assert.equal(document.activeElement, main, 'Direct reader fallback focuses main after unmount and reveal');
document.body.append(coldReader);

// A new page/user target or new modal must win over an older pending restore.
pointerOpener.focus();
const cleanupBeforeRouteFocus = activateDialog(coldReader, () => {});
cleanupBeforeRouteFocus();
assert.equal(focusRouteContent(main), true);
assert.equal(frames.size, 0, 'Explicit route focus cancels a pending dialog restoration');
flushFrame();
assert.equal(document.activeElement, main);

pointerOpener.focus();
const cleanupBeforeUserFocus = activateDialog(coldReader, () => {});
cleanupBeforeUserFocus();
const newPageTarget = new Element('button'); main.append(newPageTarget); newPageTarget.focus();
flushFrame();
assert.equal(document.activeElement, newPageTarget, 'Queued restoration preserves a newer intentional focus target');

pointerOpener.focus();
const cleanupBeforeNewDialog = activateDialog(coldReader, () => {});
cleanupBeforeNewDialog();
newPageTarget.focus();
const cleanupNewDialog = activateDialog(root, () => {});
flushFrame();
assert.equal(document.activeElement, close, 'A newly opened dialog cancels stale restoration');
cleanupNewDialog();
flushFrame();
assert.equal(document.activeElement, newPageTarget, 'The new dialog retains its own restoration target');

// Check the actual rendered navigation and closed AI panels, not just utility fixtures.
const require = createRequire(import.meta.url);
function evaluateComponent(code, overrides = {}) {
  const componentModule = { exports: {} };
  const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(js, { module: componentModule, exports: componentModule.exports, require: (name) => overrides[name] ?? require(name), ...React, useDialogFocus() {} });
  return componentModule.exports;
}
const nav = evaluateComponent(fs.readFileSync(new URL('../src/components/TahoeGlassTabNav.tsx', import.meta.url), 'utf8'));
const { BottomNavigation } = evaluateComponent(fs.readFileSync(new URL('../src/components/BottomNavigation.tsx', import.meta.url), 'utf8'), {
  './TahoeGlassTabNav': nav,
  '../lib/useDialogFocus': { useDialogFocus() {} },
});
const navigation = renderToStaticMarkup(React.createElement(BottomNavigation, { active: 'projects', currentSection: 'projects', onNavigate() {} }));
for (const href of ['/', '/experience-education', '/projects', '/thoughts', '/contact', '/bonus', '/ai-ramin']) {
  assert.ok(navigation.includes(`href="${href}"`), `Page navigation exposes ${href} as a real link`);
}
assert.equal((navigation.match(/aria-current="page"/g) ?? []).length, 1, 'Exactly one current page is announced');
assert.ok(!navigation.includes('role="tab"') && !navigation.includes('role="tablist"'), 'Page links do not claim tab-panel keyboard behavior');

const aiSource = fs.readFileSync(new URL('../src/sections/AiRamin.tsx', import.meta.url), 'utf8');
const aiAst = ts.createSourceFile('AiRamin.tsx', aiSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = ['AiRaminConsiderationsPanel', 'AiRaminModeSelector', 'AiRaminRequestTypeSelector', 'AiRaminContextPanel'].map((name) => {
  const declaration = aiAst.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(declaration, `Actual ${name} is available`);
  return declaration.getText(aiAst);
});
const panelCode = `
const aiRaminPrototype = { hiringModes: [{ id: 'hiring-manager', label: 'Hiring manager', proofBias: [] }], requestTypes: [{ id: 'general_chat', label: 'General' }] };
const aiRaminBuildConsiderations = [];
function findHiringMode() { return aiRaminPrototype.hiringModes[0]; }
function getRequestTypeLabel() { return 'General'; }
${functions.join('\n')}
module.exports = { AiRaminContextPanel, AiRaminConsiderationsPanel };`;
const panels = evaluateComponent(panelCode);
for (const Panel of Object.values(panels)) {
  const properties = { onClose() {}, selectedMode: 'hiring-manager', onSelectMode() {}, selectedRequestType: 'general_chat', onSelectRequestType() {} };
  const closed = renderToStaticMarkup(React.createElement(Panel, { ...properties, isOpen: false }));
  const opened = renderToStaticMarkup(React.createElement(Panel, { ...properties, isOpen: true }));
  const aside = closed.match(/<aside[^>]+>/)?.[0] ?? '';
  assert.ok(aside.includes('inert=""') && aside.includes('aria-hidden="true"'), 'Closed AI dialog removes every descendant from keyboard and accessibility tree');
  assert.ok(opened.includes('role="dialog"') && opened.includes('aria-modal="true"') && opened.includes('aria-labelledby='), 'Open AI panel is a labelled modal');
}

// Safari pointer clicks do not automatically focus buttons. Exercise the actual
// six opener handlers, then open/close the real focus utility from BODY.
const openerHandlers = [];
for (const file of ['../src/components/BottomNavigation.tsx', '../src/sections/AiRamin.tsx']) {
  const ast = ts.createSourceFile(file, fs.readFileSync(new URL(file, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) && node.tagName.getText(ast) === 'button') {
      const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
      const value = (name) => {
        const initializer = attributes.find((attribute) => attribute.name.getText(ast) === name)?.initializer;
        return initializer && ts.isStringLiteral(initializer) ? initializer.text : '';
      };
      if (['portfolio-mobile-menu', 'ai-ramin-context-panel', 'ai-ramin-considerations'].includes(value('aria-controls')) || ['Settings', 'Open navigation menu'].includes(value('aria-label'))) {
        const handler = attributes.find((attribute) => attribute.name.getText(ast) === 'onClick')?.initializer;
        assert.ok(handler && ts.isJsxExpression(handler) && handler.expression);
        openerHandlers.push(handler.expression.getText(ast));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
}
assert.equal(openerHandlers.length, 6, 'Menu, AI menu, both How-it-works controls, settings and composer lens are covered');
for (const handler of openerHandlers) {
  const trigger = new Element('button'); main.append(trigger);
  document.activeElement = document.body;
  let closeOpened;
  let opens = 0;
  const open = () => {
    opens += 1;
    assert.equal(document.activeElement, trigger, 'The tapped trigger is focused before modal state changes');
    closeOpened = activateDialog(coldReader, () => closeOpened());
  };
  const handlerModule = { exports: {} };
  const js = ts.transpileModule(`module.exports = ${handler};`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(js, { module: handlerModule, setIsMobileMenuOpen: open, setIsConsiderationsOpen: open, setIsContextPanelOpen: open, onOpen: open, onOpenMenu: open });
  handlerModule.exports({ currentTarget: trigger });
  assert.equal(opens, 1);
  key('Escape');
  flushFrame();
  assert.equal(document.activeElement, trigger, 'Escape returns focus to the pointer opener');
}
console.log('Accessibility passed: focus entry/cold-load retry, Tab/Shift+Tab, Escape, nested isolation, restoration, reduced motion, seven route links, closed AI dialogs and six pointer-opener handlers.');
