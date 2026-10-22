import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the shipped controller without a browser, network or wall-clock
// waits. Each scenario receives fresh DOM/event/timer globals and actual
// transpiled controller code, so no mocked implementation drives the result.
const source = await readFile(new URL('../src/components/proofTicker.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.filter(({ category }) => category === ts.DiagnosticCategory.Error).length, 0);

class TrackedEvents extends EventTarget {
  listeners = new Map();
  addEventListener(type, listener, options) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
    super.addEventListener(type, listener, options);
  }
  removeEventListener(type, listener, options) {
    this.listeners.get(type)?.delete(listener);
    super.removeEventListener(type, listener, options);
  }
  get listenerCount() { return [...this.listeners.values()].reduce((total, set) => total + set.size, 0); }
  emit(type, properties = {}) {
    const event = new Event(type);
    for (const [name, value] of Object.entries(properties)) Object.defineProperty(event, name, { value });
    this.dispatchEvent(event);
  }
}

class FakeNode extends TrackedEvents {
  children = [];
  dataset = {};
  attributes = new Map();
  title = '';
  append(...nodes) { this.children.push(...nodes); return this; }
  contains(node) { return this === node || this.children.some((child) => child.contains(node)); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value);
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  toggleAttribute(name, force) {
    const enabled = force ?? !this.attributes.has(name);
    if (enabled) this.setAttribute(name, ''); else this.removeAttribute(name);
    return enabled;
  }
  querySelectorAll(selector) {
    const name = selector.match(/^\[([a-z-]+)\]$/)?.[1];
    assert.ok(name, `The lightweight DOM must explicitly support selector ${selector}`);
    return this.children.flatMap((child) => [
      ...(child.attributes.has(name) ? [child] : []),
      ...child.querySelectorAll(selector),
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
}

class FakeClock {
  now = 0;
  nextId = 0;
  tasks = new Map();
  setTimeout = (callback, delay) => {
    assert.ok(Number.isFinite(delay) && delay > 0, 'Scheduled rotation has a positive finite interval');
    const id = ++this.nextId;
    this.tasks.set(id, { due: this.now + delay, callback });
    return id;
  };
  clearTimeout = (id) => { this.tasks.delete(id); };
  tick(duration) {
    const end = this.now + duration;
    let executions = 0;
    while (true) {
      const [id, task] = [...this.tasks.entries()].sort((left, right) => left[1].due - right[1].due || left[0] - right[0])[0] ?? [];
      if (!task || task.due > end) break;
      assert.ok(++executions <= 1000, 'No busy loop in the rotation scheduler');
      this.now = task.due;
      this.tasks.delete(id);
      task.callback();
    }
    this.now = end;
  }
}

function fixture({ reducedMotion = false, observers = true, groups = true, button = true } = {}) {
  const clock = new FakeClock();
  const document = new TrackedEvents();
  document.visibilityState = 'visible';
  const media = new TrackedEvents();
  media.matches = reducedMotion;
  const root = new FakeNode();
  const makeGroup = (count) => {
    const element = new FakeNode();
    element.setAttribute('data-proof-ticker', '');
    const slides = Array.from({ length: count }, () => {
      const slide = new FakeNode();
      slide.setAttribute('data-proof-slide', '');
      element.append(slide);
      return slide;
    });
    root.append(element);
    return { element, slides };
  };
  const commercial = groups ? makeGroup(3) : null;
  const teaching = groups ? makeGroup(2) : null;
  const control = button ? new FakeNode() : null;
  if (control) { control.setAttribute('data-proof-motion', ''); root.append(control); }
  const intersections = [];
  class FakeIntersectionObserver {
    disconnected = false;
    constructor(callback) { this.callback = callback; intersections.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    show(isIntersecting) { this.callback([{ isIntersecting, target: this.target }]); }
  }
  const exports = {};
  vm.runInNewContext(compiled.outputText, {
    exports,
    window: { matchMedia(query) { assert.equal(query, '(prefers-reduced-motion: reduce)'); return media; } },
    document,
    Node: FakeNode,
    ...(observers ? { IntersectionObserver: FakeIntersectionObserver } : {}),
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
  }, { filename: 'proofTicker.transpiled.js' });
  return { root, commercial, teaching, control, clock, document, media, intersections, start: () => exports.startProofTickers(root) };
}

function assertSlide(group, expected, { manual = false } = {}) {
  assert.equal(group.element.getAttribute('aria-live'), manual ? 'polite' : 'off', 'Only an explicit next action is announced');
  group.slides.forEach((slide, index) => {
    assert.equal(slide.dataset.active, String(index === expected), 'Exactly the current proof is visually active');
    assert.equal(slide.getAttribute('aria-hidden'), String(index !== expected), 'Inactive proofs are hidden from assistive technology');
    assert.equal(slide.attributes.has('inert'), index !== expected, 'Inactive proofs cannot receive focus');
  });
}
function assertBoth(fixture, commercial, teaching, options) {
  assertSlide(fixture.commercial, commercial, options);
  assertSlide(fixture.teaching, teaching, options);
}
function assertClean(fixture) {
  assert.equal(fixture.clock.tasks.size, 0, 'Cleanup clears all scheduled work');
  for (const target of [fixture.root, fixture.control, fixture.media, fixture.document].filter(Boolean)) assert.equal(target.listenerCount, 0, 'Cleanup removes event listeners');
  assert.ok(fixture.intersections.every((observer) => observer.disconnected), 'Cleanup disconnects all intersection observers');
  assert.equal(fixture.root.dataset.proofEnhanced, undefined, 'Cleanup removes the enhancement marker');
}

const checks = [];
function check(name, run) { run(); checks.push(name); }

check('automatic independent cycles and accessible inactive states', () => {
  const f = fixture();
  const stop = f.start();
  assert.equal(f.root.dataset.proofEnhanced, 'true');
  assert.equal(f.control.dataset.motionMode, 'playing');
  assert.equal(f.control.getAttribute('aria-label'), 'Pause proof rotation');
  assert.equal(f.control.getAttribute('aria-pressed'), 'false');
  assert.equal(f.clock.tasks.size, 1);
  assertBoth(f, 0, 0);
  f.clock.tick(6499);
  assertBoth(f, 0, 0);
  f.clock.tick(1);
  assertBoth(f, 1, 1);
  f.clock.tick(6500);
  assertBoth(f, 2, 0);
  f.clock.tick(6500);
  assertBoth(f, 0, 1);
  assert.equal(f.clock.tasks.size, 1, 'One scheduler remains after repeated rotations');
  stop();
  assertClean(f);
});

check('hover and keyboard focus pause without rotating a focused card', () => {
  const f = fixture();
  const stop = f.start();
  f.root.emit('pointerenter');
  f.clock.tick(20_000);
  assertBoth(f, 0, 0);
  f.root.emit('pointerleave');
  assert.equal(f.clock.tasks.size, 1);
  f.root.emit('focusin');
  f.clock.tick(20_000);
  assertBoth(f, 0, 0);
  f.root.emit('focusout', { relatedTarget: f.control });
  assert.equal(f.clock.tasks.size, 0, 'Moving focus inside the proof group stays paused');
  f.root.emit('focusout', { relatedTarget: new FakeNode() });
  f.clock.tick(6500);
  assertBoth(f, 1, 1);
  f.root.emit('focusin');
  f.root.emit('focusout', { relatedTarget: null });
  assert.equal(f.clock.tasks.size, 1, 'Leaving the document also releases focus pause');
  stop();
  assertClean(f);
});

check('hidden tabs and offscreen groups suspend work with combined pause reasons', () => {
  const f = fixture();
  const stop = f.start();
  f.document.visibilityState = 'hidden';
  f.document.emit('visibilitychange');
  f.clock.tick(20_000);
  assertBoth(f, 0, 0);
  f.intersections[0].show(false);
  f.document.visibilityState = 'visible';
  f.document.emit('visibilitychange');
  assert.equal(f.clock.tasks.size, 0, 'Visibility alone cannot resume an offscreen group');
  f.intersections[0].show(true);
  f.clock.tick(6500);
  assertBoth(f, 1, 1);
  f.root.emit('pointerenter');
  f.intersections[0].show(false);
  f.intersections[0].show(true);
  assert.equal(f.clock.tasks.size, 0, 'Intersection changes cannot override hover pause');
  stop();
  assertClean(f);
});

check('explicit pause persists across visibility changes and can resume', () => {
  const f = fixture();
  const stop = f.start();
  f.control.emit('click');
  assert.equal(f.control.dataset.motionMode, 'paused');
  assert.equal(f.control.getAttribute('aria-label'), 'Resume proof rotation');
  assert.equal(f.control.getAttribute('aria-pressed'), 'true');
  f.document.visibilityState = 'hidden';
  f.document.emit('visibilitychange');
  f.document.visibilityState = 'visible';
  f.document.emit('visibilitychange');
  f.clock.tick(20_000);
  assertBoth(f, 0, 0);
  f.control.emit('click');
  assert.equal(f.control.dataset.motionMode, 'playing');
  assert.equal(f.control.title, 'Pause proof rotation');
  f.clock.tick(6500);
  assertBoth(f, 1, 1);
  stop();
  assertClean(f);
});

check('reduced motion exposes manual next with a polite announcement', () => {
  const f = fixture({ reducedMotion: true });
  const stop = f.start();
  assert.equal(f.clock.tasks.size, 0);
  assert.equal(f.control.dataset.motionMode, 'manual');
  assert.equal(f.control.getAttribute('aria-label'), 'Show next proof');
  assert.equal(f.control.getAttribute('aria-pressed'), null);
  f.clock.tick(60_000);
  assertBoth(f, 0, 0);
  f.control.emit('click');
  assertBoth(f, 1, 1, { manual: true });
  f.control.emit('click');
  assertBoth(f, 2, 0, { manual: true });
  assert.equal(f.clock.tasks.size, 0, 'Manual navigation never creates autoplay');
  f.media.matches = false;
  f.media.emit('change');
  assertBoth(f, 2, 0);
  assert.equal(f.control.dataset.motionMode, 'playing');
  f.clock.tick(6500);
  assertBoth(f, 0, 1);
  f.media.matches = true;
  f.media.emit('change');
  assert.equal(f.clock.tasks.size, 0, 'Live preference changes immediately stop autoplay');
  stop();
  assertClean(f);
});

check('cleanup is inert, idempotent and safe when observers are unavailable', () => {
  const f = fixture({ observers: false });
  const stop = f.start();
  f.clock.tick(6500);
  assertBoth(f, 1, 1);
  stop();
  stop();
  assertClean(f);
  f.control.emit('click');
  f.root.emit('pointerleave');
  f.root.emit('focusout', { relatedTarget: null });
  f.document.emit('visibilitychange');
  f.media.emit('change');
  f.clock.tick(60_000);
  assertBoth(f, 1, 1);
  assertClean(f);
});

check('duplicate initialization replaces the old controller without duplicate rotation', () => {
  const f = fixture();
  const firstStop = f.start();
  f.clock.tick(6500);
  const stop = f.start();
  assertBoth(f, 0, 0);
  assert.equal(f.clock.tasks.size, 1, 'Replacement has exactly one timer');
  assert.equal(f.control.listenerCount, 1, 'Replacement has exactly one control listener');
  assert.equal(f.document.listenerCount, 1);
  assert.equal(f.media.listenerCount, 1);
  assert.equal(f.intersections[0].disconnected, true);
  f.control.emit('click');
  assert.equal(f.control.dataset.motionMode, 'paused', 'One click toggles exactly once');
  f.control.emit('click');
  f.clock.tick(6500);
  assertBoth(f, 1, 1);
  // A consumer may retain and call an already-replaced disposer. It must not
  // remove the live controller from the registry or break the next replacement.
  firstStop();
  const finalStop = f.start();
  assert.equal(f.clock.tasks.size, 1, 'A stale disposer cannot orphan the replacement scheduler');
  assert.equal(f.control.listenerCount, 1, 'A stale disposer cannot orphan control listeners');
  stop();
  finalStop();
  assertClean(f);
});

check('incomplete static proof markup safely remains unenhanced', () => {
  for (const options of [{ groups: false }, { button: false }]) {
    const f = fixture(options);
    const stop = f.start();
    assert.equal(typeof stop, 'function');
    assert.equal(f.clock.tasks.size, 0);
    stop();
    assertClean(f);
  }
});

console.log(`Proof ticker passed: ${checks.length} deterministic behavior scenarios (${checks.join('; ')}).`);
