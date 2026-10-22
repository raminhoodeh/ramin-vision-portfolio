import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the shipped controller without a browser, network or wall-clock
// waits. Each scenario receives fresh DOM/event/timer globals and actual
// transpiled controller code, so no mocked implementation drives the result.
const source = await readFile(new URL('../src/components/proofTicker.ts', import.meta.url), 'utf8');
assert.ok(Buffer.byteLength(source) < 8000, 'DOM-only controller stays below its 8KB source budget');
assert.equal(ts.createSourceFile('proofTicker.ts', source, ts.ScriptTarget.Latest, true).statements.filter(ts.isImportDeclaration).length, 0, 'The proof controller has no imports');
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
  hovered = false;
  append(...nodes) { this.children.push(...nodes); return this; }
  contains(node) { return this === node || this.children.some((child) => child.contains(node)); }
  matches(selector) { assert.equal(selector, ':hover'); return this.hovered; }
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

function fixture({ reducedMotion = false, observers = true, groups = true, slideCount = 3, initialHovered = false, initialFocused = false } = {}) {
  const clock = new FakeClock();
  const document = new TrackedEvents();
  document.visibilityState = 'visible';
  document.activeElement = null;
  const media = new TrackedEvents();
  media.matches = reducedMotion;
  const root = new FakeNode();
  root.hovered = initialHovered;
  root.setAttribute('data-proof-cycle', '0');
  const makeGroup = (count) => {
    const element = new FakeNode();
    element.setAttribute('data-proof-ticker', 'commercial');
    const slides = Array.from({ length: count }, () => {
      const slide = new FakeNode();
      slide.setAttribute('data-proof-slide', '');
      element.append(slide);
      return slide;
    });
    root.append(element);
    return { element, slides };
  };
  const commercial = groups ? makeGroup(slideCount) : null;
  const focusTarget = new FakeNode();
  root.append(focusTarget);
  if (initialFocused) document.activeElement = focusTarget;
  const persistentSummary = new FakeNode();
  persistentSummary.setAttribute('data-teaching-summary', '');
  root.append(persistentSummary);
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
  return { root, commercial, persistentSummary, focusTarget, clock, document, media, intersections, start: () => exports.startProofTickers(root) };
}

function assertSlide(group, expected) {
  assert.equal(group.element.getAttribute('aria-live'), 'off', 'Automatic proof changes do not repeatedly announce themselves');
  group.slides.forEach((slide, index) => {
    assert.equal(slide.dataset.active, String(index === expected), 'Exactly the current proof is visually active');
    assert.equal(slide.getAttribute('aria-hidden'), String(index !== expected), 'Inactive proofs are hidden from assistive technology');
    assert.equal(slide.attributes.has('inert'), index !== expected, 'Inactive proofs cannot receive focus');
  });
}
function assertClean(fixture) {
  assert.equal(fixture.clock.tasks.size, 0, 'Cleanup clears all scheduled work');
  for (const target of [fixture.root, fixture.media, fixture.document]) assert.equal(target.listenerCount, 0, 'Cleanup removes event listeners');
  assert.ok(fixture.intersections.every((observer) => observer.disconnected), 'Cleanup disconnects all intersection observers');
  assert.equal(fixture.root.dataset.proofEnhanced, undefined, 'Cleanup removes the enhancement marker');
  assert.equal(fixture.root.dataset.proofMotionState, undefined, 'Cleanup removes transient motion state');
  assert.equal(fixture.root.dataset.proofCycle, '0', 'Cleanup restores the static surface cycle');
}

const checks = [];
function check(name, run) { run(); checks.push(name); }

check('control-free autoplay wraps and drives surface cycles with accessible inactive states', () => {
  const f = fixture();
  const stop = f.start();
  assert.equal(f.root.dataset.proofEnhanced, 'true');
  assert.equal(f.root.dataset.proofMotionState, 'running');
  assert.equal(f.root.dataset.proofCycle, '0');
  assert.equal(f.root.listeners.get('click')?.size ?? 0, 0, 'Autoplay creates no click control');
  assert.equal(f.clock.tasks.size, 1);
  assertSlide(f.commercial, 0);
  f.clock.tick(6499);
  assertSlide(f.commercial, 0);
  f.clock.tick(1);
  assertSlide(f.commercial, 1);
  assert.equal(f.root.dataset.proofCycle, '1');
  f.clock.tick(6500);
  assertSlide(f.commercial, 2);
  assert.equal(f.root.dataset.proofCycle, '0');
  f.clock.tick(6500);
  assertSlide(f.commercial, 0);
  assert.equal(f.root.dataset.proofCycle, '1');
  assert.equal(f.persistentSummary.getAttribute('aria-hidden'), null, 'Persistent teaching evidence remains untouched');
  assert.equal(f.persistentSummary.attributes.has('inert'), false);
  assert.equal(f.clock.tasks.size, 1, 'One scheduler remains after repeated rotations');
  stop();
  assertClean(f);
});

check('hover and keyboard focus pause without rotating a focused card', () => {
  const f = fixture();
  const stop = f.start();
  f.root.emit('pointerenter');
  assert.equal(f.root.dataset.proofMotionState, 'paused');
  f.clock.tick(20_000);
  assertSlide(f.commercial, 0);
  f.root.emit('pointerleave');
  assert.equal(f.clock.tasks.size, 1);
  assert.equal(f.root.dataset.proofMotionState, 'running');
  f.root.emit('focusin');
  f.clock.tick(20_000);
  assertSlide(f.commercial, 0);
  f.root.emit('focusout', { relatedTarget: f.focusTarget });
  assert.equal(f.clock.tasks.size, 0, 'Moving focus inside the proof group stays paused');
  f.root.emit('focusout', { relatedTarget: new FakeNode() });
  f.clock.tick(6500);
  assertSlide(f.commercial, 1);
  f.root.emit('focusin');
  f.root.emit('focusout', { relatedTarget: null });
  assert.equal(f.clock.tasks.size, 1, 'Leaving the document also releases focus pause');
  stop();
  assertClean(f);
});

check('already-hovered or focused cards are suspended on initialization', () => {
  for (const options of [{ initialHovered: true }, { initialFocused: true }]) {
    const f = fixture(options);
    const stop = f.start();
    assert.equal(f.clock.tasks.size, 0);
    assert.equal(f.root.dataset.proofMotionState, 'paused');
    f.clock.tick(20_000);
    assertSlide(f.commercial, 0);
    f.root.emit(options.initialHovered ? 'pointerleave' : 'focusout', { relatedTarget: null });
    f.clock.tick(6500);
    assertSlide(f.commercial, 1);
    stop();
    assertClean(f);
  }
});

check('hidden tabs and offscreen groups suspend work with combined pause reasons', () => {
  const f = fixture();
  const stop = f.start();
  f.document.visibilityState = 'hidden';
  f.document.emit('visibilitychange');
  f.clock.tick(20_000);
  assertSlide(f.commercial, 0);
  assert.equal(f.root.dataset.proofMotionState, 'paused');
  f.intersections[0].show(false);
  f.document.visibilityState = 'visible';
  f.document.emit('visibilitychange');
  assert.equal(f.clock.tasks.size, 0, 'Visibility alone cannot resume an offscreen group');
  f.intersections[0].show(true);
  f.clock.tick(6500);
  assertSlide(f.commercial, 1);
  assert.equal(f.root.dataset.proofMotionState, 'running');
  f.root.emit('pointerenter');
  f.intersections[0].show(false);
  f.intersections[0].show(true);
  assert.equal(f.clock.tasks.size, 0, 'Intersection changes cannot override hover pause');
  stop();
  assertClean(f);
});

check('reduced motion stays static and runtime preference changes suspend or resume autoplay', () => {
  const f = fixture({ reducedMotion: true });
  const stop = f.start();
  assert.equal(f.clock.tasks.size, 0);
  assert.equal(f.root.dataset.proofMotionState, 'reduced');
  f.clock.tick(60_000);
  assertSlide(f.commercial, 0);
  f.root.emit('click');
  assertSlide(f.commercial, 0);
  assert.equal(f.clock.tasks.size, 0, 'Reduced motion has no hidden manual control or autoplay');
  f.media.matches = false;
  f.media.emit('change');
  assertSlide(f.commercial, 0);
  assert.equal(f.root.dataset.proofMotionState, 'running');
  f.clock.tick(6500);
  assertSlide(f.commercial, 1);
  f.media.matches = true;
  f.media.emit('change');
  assert.equal(f.clock.tasks.size, 0, 'Live preference changes immediately stop autoplay');
  assert.equal(f.root.dataset.proofMotionState, 'reduced');
  f.root.emit('pointerenter');
  f.root.emit('pointerleave');
  assert.equal(f.root.dataset.proofMotionState, 'reduced', 'Hover changes cannot override reduced motion');
  f.clock.tick(60_000);
  assertSlide(f.commercial, 1);
  stop();
  assertClean(f);
});

check('cleanup is inert, idempotent and safe when observers are unavailable', () => {
  const f = fixture({ observers: false });
  const stop = f.start();
  f.clock.tick(6500);
  assertSlide(f.commercial, 1);
  stop();
  stop();
  assertClean(f);
  f.root.emit('click');
  f.root.emit('pointerleave');
  f.root.emit('focusout', { relatedTarget: null });
  f.document.emit('visibilitychange');
  f.media.emit('change');
  f.clock.tick(60_000);
  assertSlide(f.commercial, 1);
  assertClean(f);
});

check('duplicate initialization replaces the old controller without duplicate rotation', () => {
  const f = fixture();
  const firstStop = f.start();
  f.clock.tick(6500);
  const stop = f.start();
  assertSlide(f.commercial, 0);
  assert.equal(f.clock.tasks.size, 1, 'Replacement has exactly one timer');
  assert.equal(f.root.listenerCount, 4, 'Replacement has one set of hover/focus listeners');
  assert.equal(f.document.listenerCount, 1);
  assert.equal(f.media.listenerCount, 1);
  assert.equal(f.intersections[0].disconnected, true);
  f.clock.tick(6500);
  assertSlide(f.commercial, 1);
  assert.equal(f.root.dataset.proofCycle, '1', 'Replacement advances exactly once');
  // A consumer may retain and call an already-replaced disposer. It must not
  // remove the live controller from the registry or break the next replacement.
  firstStop();
  const finalStop = f.start();
  assert.equal(f.clock.tasks.size, 1, 'A stale disposer cannot orphan the replacement scheduler');
  assert.equal(f.root.listenerCount, 4, 'A stale disposer cannot orphan hover/focus listeners');
  stop();
  finalStop();
  assertClean(f);
});

check('incomplete static proof markup safely remains unenhanced', () => {
  for (const options of [{ groups: false }, { slideCount: 1 }]) {
    const f = fixture(options);
    const stop = f.start();
    assert.equal(typeof stop, 'function');
    assert.equal(f.clock.tasks.size, 0);
    stop();
    assertClean(f);
  }
});

console.log(`Proof ticker passed: ${checks.length} deterministic behavior scenarios (${checks.join('; ')}).`);
