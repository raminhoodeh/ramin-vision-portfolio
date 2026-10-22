import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nativeRequire = createRequire(import.meta.url);
const tests = [];
const test = (name, run) => tests.push({ name, run });
const plain = (value) => JSON.parse(JSON.stringify(value));
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} != ${expected}`);
const compile = (source) => ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;
function execute(file, requireMock, globals = {}) {
  const module = { exports: {} };
  vm.runInNewContext(compile(fs.readFileSync(path.join(root, file), 'utf8')), {
    module, exports: module.exports, require: requireMock, ...globals,
  }, { filename: file });
  return module.exports;
}
const layout = execute('src/components/glass-carousel/layout.ts', (name) => { throw new Error(`Unexpected geometry dependency ${name}`); });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flushAsync = async () => { for (let index = 0; index < 12; index += 1) await Promise.resolve(); };

class Target {
  listeners = new Map();
  addEventListener(type, listener, options = false) {
    const capture = typeof options === 'boolean' ? options : Boolean(options.capture);
    const entries = this.listeners.get(type) ?? [];
    if (!entries.some((entry) => entry.listener === listener && entry.capture === capture)) entries.push({ listener, capture });
    this.listeners.set(type, entries);
  }
  removeEventListener(type, listener, options = false) {
    const capture = typeof options === 'boolean' ? options : Boolean(options.capture);
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter((entry) => entry.listener !== listener || entry.capture !== capture));
  }
  emit(type, values = {}) {
    const event = {
      type, target: this, defaultPrevented: false, propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.propagationStopped = true; },
      ...values,
    };
    for (const { listener } of [...(this.listeners.get(type) ?? [])]) listener(event);
    return event;
  }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, entries) => sum + entries.length, 0); }
}
class Style {
  setProperty(name, value) { this[name] = value; }
  removeProperty(name) {
    delete this[name];
    delete this[name.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase())];
  }
}
class Element extends Target {
  constructor(tag = 'div', parent = null) {
    super(); this.tag = tag; this.parent = parent; this.style = new Style(); this.dataset = {}; this.clientWidth = 1000;
    this.contentHeight = 400; this.borderHeight = 0; this.rectTop = 0; this.rectLeft = 0;
    this.captures = new Set(); this.captureCount = 0; this.releaseCount = 0;
  }
  closest(selector) {
    if (selector.includes('[data-glass-index]') && this.dataset.glassIndex !== undefined) return this;
    if (selector.includes('[data-glass-selectable]') && this.selectable) return this;
    if (selector.split(',').map((part) => part.trim()).includes(this.tag)) return this;
    return this.parent?.closest(selector) ?? null;
  }
  setPointerCapture(id) { this.captures.add(id); this.captureCount += 1; }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); this.releaseCount += 1; }
  // Fixed CSS height affects both the content box and scroll metrics. Returning
  // a constant scrollHeight would miss ResizeObserver height-growth feedback.
  get offsetHeight() { return Number.parseFloat(this.parent?.style['--glass-card-height']) || 446; }
  get clientHeight() { return this.offsetHeight - this.borderHeight; }
  get scrollHeight() { return Math.max(this.contentHeight, this.clientHeight); }
  getBoundingClientRect() {
    const width = this.clientWidth, height = Number.parseFloat(this.style['--glass-stage-height']) || 566;
    return { left: this.rectLeft, right: this.rectLeft + width, width, top: this.rectTop, bottom: this.rectTop + height, height };
  }
}

function fixture(options = {}) {
  const frames = new Map();
  let frameId = 0, now = 100, selection = '';
  const stage = options.stage ?? new Element();
  stage.rectTop = options.initialTop ?? 1220; stage.rectLeft = 0;
  const mount = new Element();
  const cards = options.cards ?? Array.from({ length: 3 }, (_item, index) => {
    const card = new Element('article', stage); card.dataset.glassIndex = String(index); return card;
  });
  const document = new Target(); document.visibilityState = options.hidden ? 'hidden' : 'visible';
  document.documentElement = { clientWidth: 1280, clientHeight: 720 };
  const media = new Target(); media.matches = options.reducedMotion ?? false;
  const connection = new Target(); connection.saveData = options.saveData ?? false; connection.effectiveType = options.effectiveType ?? '4g';
  const navigator = { connection, deviceMemory: options.deviceMemory ?? 8 };
  const window = Object.assign(new Target(), { innerWidth: 1280, innerHeight: 720, matchMedia: () => media, getSelection: () => ({ toString: () => selection }) });
  const observers = { intersection: [], resize: [] };
  const observer = (type) => class {
    constructor(callback) { this.callback = callback; this.connected = true; this.targets = new Set(); observers[type].push(this); }
    observe(target) { this.targets.add(target); }
    disconnect() { this.connected = false; this.targets.clear(); }
    emit(visible = true) { if (this.connected) this.callback(type === 'intersection' ? [{ isIntersecting: visible }] : []); }
  };
  const effects = { imports: 0, creates: 0, selected: [], modes: [], scenes: [], failures: [] };
  const makeScene = (onFailure) => {
    const scene = {
      renders: [], sizes: [], disposed: 0,
      render(poses, light) { assert.equal(this.disposed, 0, 'Never render a disposed scene'); this.renders.push({ poses: plain(poses), light }); if (options.renderFails) onFailure(); },
      resize(...size) { assert.equal(this.disposed, 0, 'Never resize a disposed scene'); this.sizes.push(size); if (options.resizeFails) onFailure(); },
      dispose() { this.disposed += 1; },
    };
    effects.scenes.push(scene); return scene;
  };
  const policy = execute('src/performance/loadingPolicy.ts', (name) => { throw new Error(`Policy dependency ${name}`); }, { window, navigator, document });
  const globals = {
    window, navigator, document, performance: { now: () => now },
    requestAnimationFrame(callback) { const id = ++frameId; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    IntersectionObserver: observer('intersection'), ResizeObserver: observer('resize'),
  };
  const { createCarouselController } = execute('src/components/glass-carousel/createCarouselController.ts', (name) => {
    if (name.endsWith('/layout') || name === './layout') return layout;
    if (name.endsWith('loadingPolicy')) return policy;
    if (name.endsWith('createGlassScene')) {
      effects.imports += 1;
      if (options.importFails) throw new Error('Fixture renderer download failed');
      return { createGlassScene(_mount, onFailure) {
        assert.equal(_mount, mount); effects.creates += 1; effects.failures.push(onFailure);
        if (options.createFails) return Promise.reject(new Error('Fixture WebGL unavailable'));
        const scene = makeScene(onFailure);
        return options.creation ? options.creation.promise.then(() => scene) : Promise.resolve(scene);
      } };
    }
    throw new Error(`Unexpected controller dependency ${name}`);
  }, globals);
  const controller = createCarouselController({
    stage, mount, cards, initialIndex: options.initialIndex ?? 0,
    onSelect: (index) => effects.selected.push(index), onMode: (mode) => effects.modes.push(mode),
  });
  const frame = () => {
    now += 1000 / 60;
    const pending = [...frames.values()]; frames.clear();
    for (const callback of pending) callback(now);
  };
  const drain = () => {
    let count = 0;
    while (frames.size && count < 500) { frame(); count += 1; }
    assert.equal(frames.size, 0, 'An event-driven animation must settle instead of rendering forever');
    return count;
  };
  return {
    stage, mount, cards, document, window, media, connection, navigator, observers, effects, controller, frames,
    frame, drain, advance: (milliseconds) => { now += milliseconds; },
    setSelection: (value) => { selection = value; },
    // Normal IO events agree with actual geometry. The stale-IO regressions
    // below deliberately move the rect without delivering another IO event.
    intersect: (visible) => { stage.rectTop = visible ? 0 : window.innerHeight + 500; observers.intersection.at(-1).emit(visible); },
    bounds: ({ top = stage.rectTop, left = stage.rectLeft, width = stage.clientWidth } = {}) => { stage.rectTop = top; stage.rectLeft = left; stage.clientWidth = width; },
    viewport: (width, height) => { window.innerWidth = width; window.innerHeight = height; document.documentElement.clientWidth = width; document.documentElement.clientHeight = height; },
    resize: () => observers.resize.at(-1).emit(),
    async ready() { this.intersect(true); await flushAsync(); drain(); return effects.scenes.at(-1); },
    visibility(value) { document.visibilityState = value; document.emit('visibilitychange'); },
    pointer(type, values = {}) { return stage.emit(type, { pointerType: 'touch', pointerId: 1, button: 0, clientX: 100, clientY: 100, ...values }); },
    dispose() { controller.dispose(); },
  };
}

test('wrap, shortest-path selection and cyclic poses agree across boundaries', () => {
  for (const [index, expected] of [[0, 0], [3, 0], [4, 1], [-1, 2], [-4, 2]]) assert.equal(layout.wrapIndex(index, 3), expected);
  for (const [position, index, expected] of [[2, 0, 3], [0, 2, -1], [-1, 0, 0], [2.8, 0, 3], [6, 2, 5]]) close(layout.nearestTarget(position, index, 3), expected, 'nearest cyclic target');
  for (let position = -6; position <= 6; position += 0.125) {
    for (let index = 0; index < 3; index += 1) {
      const delta = layout.relativeIndex(index, position, 3);
      assert.ok(delta >= -1.5 && delta < 1.5);
      close(layout.nearestTarget(position, index, 3) - position, delta, 'selection and pose use the same arc');
    }
    const current = layout.carouselPoses(position, 3, 360), wrapped = layout.carouselPoses(position + 3, 3, 360);
    current.forEach((pose, index) => Object.keys(pose).forEach((key) => close(pose[key], wrapped[index][key], `wrapped pose ${key}`)));
  }
});
test('phone and desktop sizes, centre and invisible wrap boundary are stable', () => {
  const phone = layout.carouselSize(390), desktop = layout.carouselSize(1200);
  close(phone.cardWidth, 327.6, 'Phone card fits the available width');
  assert.equal(phone.height, 590); assert.equal(desktop.cardWidth, 360); assert.equal(desktop.height, 566);
  const poses = layout.carouselPoses(1, 3, desktop.cardWidth);
  assert.equal(poses[1].x, 0); assert.equal(poses[1].z, 34); assert.equal(poses[1].opacity, 1);
  assert.ok(poses[0].x < 0 && poses[2].x > 0 && poses[0].z < poses[1].z && poses[2].z < poses[1].z);
  assert.equal(layout.carouselPoses(1.5, 3, 360)[0].opacity, 0, 'A rear card is hidden while crossing the cyclic boundary');
});
test('mount is inert until visibility and concurrent entry imports only once', async () => {
  const creation = deferred(), h = fixture({ creation });
  assert.equal(h.effects.imports, 0); assert.equal(h.frames.size, 0); assert.equal(h.cards[0].style.transform, undefined);
  assert.equal(h.observers.intersection[0].targets.has(h.stage), true);
  h.intersect(true); h.intersect(true); await flushAsync();
  assert.equal(h.effects.imports, 1); assert.equal(h.effects.creates, 1);
  h.visibility('visible'); h.intersect(true); await flushAsync();
  assert.equal(h.effects.creates, 1, 'One in-flight renderer owns repeated visibility events');
  creation.resolve(); await flushAsync(); h.drain();
  assert.deepEqual(h.effects.modes, ['loading', 'ready']); h.dispose();
});
test('physical visibility alone never bypasses the first observer report or loads a truly offscreen stage', async () => {
  const h = fixture({ initialTop: 0 });
  assert.ok(h.stage.getBoundingClientRect().bottom > 0, 'The initial stage really has visible bounds');
  for (let index = 0; index < 3; index += 1) h.resize();
  h.visibility('visible'); await flushAsync();
  assert.equal(h.effects.imports, 0, 'Initial measurement/visibility events still wait for IntersectionObserver');
  assert.equal(h.frames.size, 0);
  h.intersect(false); h.resize(); await flushAsync();
  assert.equal(h.effects.imports, 0, 'A reported offscreen stage does not initialise on resize');
  h.bounds({ top: 50, left: h.window.innerWidth + 1 }); h.resize(); await flushAsync();
  assert.equal(h.effects.imports, 0, 'Vertical proximity does not override horizontal exclusion');
  h.bounds({ left: 0 }); h.resize(); await flushAsync(); h.drain();
  assert.equal(h.effects.creates, 1, 'After the initial observer report, actual entry can recover without another report'); h.dispose();
});
for (const [name, options] of [
  ['reduced motion', { reducedMotion: true }], ['Save-Data', { saveData: true }],
  ['low memory', { deviceMemory: 2 }], ['slow connection', { effectiveType: '2g' }],
]) test(`${name} retains native cards without importing a scene`, async () => {
  const h = fixture(options); h.intersect(true); await flushAsync();
  assert.equal(h.effects.imports, 0); assert.equal(h.effects.creates, 0); assert.equal(h.frames.size, 0);
  assert.equal(h.cards[0].style.transform, undefined); h.dispose();
});
test('visible rendering supports a 3G-reported connection and 4 GB device', async () => {
  const h = fixture({ effectiveType: '3g', deviceMemory: 4 }); await h.ready();
  assert.equal(h.effects.imports, 1); assert.equal(h.effects.creates, 1); assert.equal(h.effects.modes.at(-1), 'ready'); h.dispose();
});
test('a hidden document does not import until it becomes visible', async () => {
  const h = fixture({ hidden: true }); h.intersect(true); await flushAsync(); assert.equal(h.effects.imports, 0);
  h.visibility('visible'); await flushAsync(); h.drain(); assert.equal(h.effects.creates, 1); h.dispose();
});
test('next, previous and dot selection take the nearest cyclic route', async () => {
  const h = fixture(); await h.ready();
  for (const [method, argument, selected, position] of [['step', 1, 1, 1], ['step', -1, 0, 0], ['step', -1, 2, -1], ['select', 0, 0, 0], ['select', 2, 2, -1]]) {
    h.controller[method](argument); h.drain(); assert.equal(h.effects.selected.at(-1), selected); assert.equal(Number(h.stage.dataset.glassPosition), position);
  }
  h.dispose();
});
test('stage keyboard controls work without stealing keys from native links', async () => {
  const h = fixture(); await h.ready();
  for (const [key, selected] of [['ArrowRight', 1], ['End', 2], ['Home', 0], ['ArrowLeft', 2]]) {
    const event = h.stage.emit('keydown', { key }); assert.equal(event.defaultPrevented, true); h.drain(); assert.equal(h.effects.selected.at(-1), selected);
  }
  const before = h.effects.selected.length, link = new Element('a', h.cards[0]);
  assert.equal(h.stage.emit('keydown', { key: 'ArrowRight', target: link }).defaultPrevented, false);
  assert.equal(h.effects.selected.length, before); h.dispose();
});
test('modifier and composing keys preserve browser and input shortcuts', async () => {
  const h = fixture(); await h.ready();
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'isComposing']) {
    const event = h.stage.emit('keydown', { key: 'ArrowLeft', [modifier]: true });
    assert.equal(event.defaultPrevented, false, `${modifier} remains native`);
  }
  assert.equal(h.effects.selected.length, 0); assert.equal(h.frames.size, 0); h.dispose();
});
test('background card clicks select, while links and selected copy remain native', async () => {
  const h = fixture(); await h.ready();
  h.stage.emit('click', { target: h.cards[2] }); h.drain(); assert.equal(h.effects.selected.at(-1), 2);
  assert.equal(h.stage.emit('click', { target: new Element('button', h.cards[1]) }).defaultPrevented, false);
  const before = h.effects.selected.length;
  h.setSelection('Selected product description'); h.stage.emit('click', { target: h.cards[1] });
  assert.equal(h.effects.selected.length, before); h.dispose();
});
test('an inactive native case/public anchor activates its owning card without blocking navigation', async () => {
  const h = fixture(); await h.ready();
  const link = new Element('a', h.cards[2]);
  h.setSelection('A previous text selection');
  const event = h.stage.emit('click', { target: new Element('span', link) });
  assert.equal(event.defaultPrevented, false); assert.equal(event.propagationStopped, false);
  assert.equal(h.effects.selected.at(-1), 2); h.drain();
  assert.equal(layout.wrapIndex(Number(h.stage.dataset.glassPosition), 3), 2); h.dispose();
});
test('position and pointer light animations quiesce, then wake for actual input', async () => {
  const h = fixture(); const scene = await h.ready();
  assert.equal(scene.renders.length, 1); assert.equal(h.frames.size, 0);
  h.controller.step(1); assert.ok(h.drain() > 1);
  const settled = scene.renders.length; for (let index = 0; index < 20; index += 1) h.frame(); assert.equal(scene.renders.length, settled);
  h.pointer('pointermove', { pointerType: 'mouse', clientX: h.stage.clientWidth }); h.drain(); assert.equal(scene.renders.at(-1).light, 1);
  h.stage.emit('pointerleave'); h.drain(); assert.equal(scene.renders.at(-1).light, 0); h.dispose();
});
for (const type of ['offscreen', 'hidden']) test(`${type} cancels queued work and resumes at the requested card`, async () => {
  const h = fixture(); const scene = await h.ready(); h.controller.step(1); h.frame();
  if (type === 'offscreen') h.intersect(false); else h.visibility('hidden');
  assert.equal(h.frames.size, 0); const before = scene.renders.length;
  h.controller.select(2); h.resize(); for (let index = 0; index < 12; index += 1) h.frame();
  assert.equal(scene.renders.length, before, 'Offscreen/hidden callbacks must not draw');
  if (type === 'offscreen') h.intersect(true); else h.visibility('visible');
  await flushAsync(); h.drain(); assert.equal(h.effects.creates, 1); assert.equal(h.effects.selected.at(-1), 2);
  assert.equal(layout.wrapIndex(Number(h.stage.dataset.glassPosition), 3), 2); h.dispose();
});
test('selection wakes a resized partly visible stage despite a stale false IO report', async () => {
  const h = fixture(); h.viewport(390, 844); h.stage.clientWidth = 390; await h.ready();
  h.controller.select(1); h.drain(); assert.equal(Number(h.stage.dataset.glassPosition), 1);
  h.intersect(false); assert.equal(h.frames.size, 0);
  h.viewport(1280, 720); h.bounds({ width: 1280, top: -252 });
  assert.ok(h.stage.getBoundingClientRect().bottom > 0, 'The desktop stage is partly visible after resizing');
  h.controller.select(0); assert.equal(h.effects.selected.at(-1), 0); h.drain();
  assert.equal(Number(h.stage.dataset.glassPosition), 0, 'Status and actual position both change without a new observer event'); h.dispose();
});
test('resize refreshes physical visibility and wakes an existing paused scene without IO delivery', async () => {
  const h = fixture(); const scene = await h.ready(); h.intersect(false); h.controller.select(1);
  const renders = scene.renders.length; assert.equal(h.frames.size, 0);
  h.bounds({ width: 1280, top: -252 }); h.resize(); await flushAsync(); h.drain();
  assert.equal(h.effects.creates, 1); assert.ok(scene.renders.length > renders);
  assert.equal(Number(h.stage.dataset.glassPosition), 1); assert.equal(h.frames.size, 0); h.dispose();
});
test('resize can start a newly visible stage before the observer updates its false report', async () => {
  const h = fixture(); h.intersect(false); await flushAsync(); assert.equal(h.effects.imports, 0);
  h.bounds({ top: 50, width: 1280 }); h.resize(); await flushAsync(); h.drain();
  assert.equal(h.effects.imports, 1); assert.equal(h.effects.creates, 1); assert.equal(h.effects.modes.at(-1), 'ready');
  assert.equal(Number(h.stage.dataset.glassPosition), 0); h.dispose();
});
test('resizing shares geometry between DOM cards and scene', async () => {
  const h = fixture(); const scene = await h.ready(); h.stage.clientWidth = 390; h.resize(); h.drain();
  const expected = layout.carouselSize(390);
  assert.deepEqual(scene.sizes.at(-1), [expected.width, expected.height, expected.cardWidth, expected.cardHeight]);
  assert.equal(h.stage.style['--glass-card-width'], `${expected.cardWidth}px`);
  assert.deepEqual(scene.renders.at(-1).poses, plain(layout.carouselPoses(0, 3, expected.cardWidth))); h.dispose();
});
test('fixed-height desktop and phone cards never grow on repeated nonoverflow measurements', async () => {
  const h = fixture(); await h.ready();
  for (const [width, cardHeight, stageHeight] of [[1000, 446, 566], [390, 470, 590]]) {
    h.stage.clientWidth = width;
    for (let iteration = 0; iteration < 12; iteration += 1) {
      h.resize(); h.drain();
      assert.equal(h.stage.style['--glass-card-height'], `${cardHeight}px`);
      assert.equal(h.stage.style['--glass-stage-height'], `${stageHeight}px`);
      h.cards.forEach((card) => { assert.equal(card.offsetHeight, cardHeight); assert.equal(card.scrollHeight, card.clientHeight); });
    }
  }
  h.dispose();
});
test('long or enlarged card copy grows the shared surface without a resize feedback loop', async () => {
  for (const borderHeight of [0, 2]) {
    const h = fixture(); await h.ready();
    for (const card of h.cards) { card.contentHeight = 620; card.borderHeight = borderHeight; }
    h.resize(); h.drain();
    const height = 620 + borderHeight;
    assert.equal(h.stage.style['--glass-card-height'], `${height}px`); assert.equal(h.stage.style['--glass-stage-height'], `${height + 120}px`);
    for (let index = 0; index < 12; index += 1) { h.resize(); h.drain(); }
    assert.equal(h.stage.style['--glass-card-height'], `${height}px`, 'Fixed cards do not grow when ResizeObserver fires again');
    h.cards.forEach((card) => assert.equal(card.scrollHeight, card.clientHeight, 'Content fits after growth')); h.dispose();
  }
});
test('touch drag snaps, releases capture and suppresses the synthetic click only briefly', async () => {
  const h = fixture(); await h.ready();
  h.pointer('pointerdown'); const move = h.pointer('pointermove', { clientX: -100, clientY: 104 });
  assert.equal(move.defaultPrevented, true); assert.equal(h.stage.dataset.dragging, 'true'); assert.equal(h.stage.hasPointerCapture(1), true);
  h.pointer('pointerup'); assert.equal(h.effects.selected.at(-1), 1); assert.equal(h.stage.dataset.dragging, undefined); assert.equal(h.stage.hasPointerCapture(1), false);
  const link = new Element('a', h.cards[1]), suppressed = h.stage.emit('click', { target: link });
  assert.equal(suppressed.defaultPrevented, true); assert.equal(suppressed.propagationStopped, true);
  h.drain(); h.advance(351); assert.equal(h.stage.emit('click', { target: link }).defaultPrevented, false, 'A later intentional case/public click works'); h.dispose();
});
test('vertical gestures, small movement and unrelated pointers remain untouched', async () => {
  const h = fixture(); await h.ready();
  h.pointer('pointerdown'); assert.equal(h.pointer('pointermove', { clientX: 104, clientY: 104 }).defaultPrevented, false);
  assert.equal(h.pointer('pointermove', { clientX: 104, clientY: 110, pointerId: 9 }).defaultPrevented, false);
  assert.equal(h.pointer('pointermove', { clientX: 102, clientY: 135 }).defaultPrevented, false);
  h.pointer('pointerup'); assert.equal(h.stage.captureCount, 0); assert.equal(h.effects.selected.length, 0); h.dispose();
});
test('mouse text selection and native controls never become drag handles', async () => {
  const h = fixture(); await h.ready();
  const text = new Element('p', h.cards[0]); text.selectable = true;
  for (const target of [text, new Element('a', h.cards[0]), new Element('button', h.cards[0])]) {
    h.pointer('pointerdown', { pointerType: 'mouse', target }); h.pointer('pointermove', { pointerType: 'mouse', clientX: 300 }); h.pointer('pointerup');
  }
  assert.equal(h.stage.captureCount, 0); assert.equal(h.effects.selected.length, 0); h.dispose();
});
test('pointer cancellation ends and snaps a horizontal gesture', async () => {
  const h = fixture(); await h.ready(); h.pointer('pointerdown'); h.pointer('pointermove', { clientX: -100 }); h.pointer('pointercancel'); h.drain();
  assert.equal(h.stage.hasPointerCapture(1), false); assert.equal(h.stage.dataset.dragging, undefined); assert.equal(h.effects.selected.at(-1), 1); h.dispose();
});
for (const type of ['offscreen', 'hidden', 'lost capture']) test(`${type} interrupts a drag, releases ownership and resumes quiescently`, async () => {
  const h = fixture(); const scene = await h.ready(); h.pointer('pointerdown'); h.pointer('pointermove', { clientX: -100 });
  assert.equal(h.stage.hasPointerCapture(1), true);
  if (type === 'offscreen') h.intersect(false);
  else if (type === 'hidden') h.visibility('hidden');
  else { h.stage.captures.delete(1); h.stage.emit('lostpointercapture', { pointerId: 1 }); }
  assert.equal(h.stage.hasPointerCapture(1), false); assert.equal(h.stage.dataset.dragging, undefined); assert.equal(h.effects.selected.at(-1), 1);
  const announcements = h.effects.selected.length, renders = scene.renders.length;
  h.pointer('pointermove', { clientX: 900 }); h.pointer('pointerup');
  assert.equal(h.effects.selected.length, announcements, 'An interrupted pointer cannot continue the old drag');
  if (type !== 'lost capture') {
    assert.equal(h.frames.size, 0); h.frame(); assert.equal(scene.renders.length, renders);
    if (type === 'offscreen') h.intersect(true); else h.visibility('visible');
  }
  await flushAsync(); h.drain(); assert.equal(Number(h.stage.dataset.glassPosition), 1);
  const settled = scene.renders.length; h.frame(); assert.equal(scene.renders.length, settled); assert.equal(h.frames.size, 0); h.dispose();
});
test('secondary and overlapping pointerdown events cannot replace the primary gesture', async () => {
  const h = fixture(); await h.ready();
  h.pointer('pointerdown', { pointerId: 2, isPrimary: false });
  assert.equal(h.pointer('pointermove', { pointerId: 2, clientX: -100 }).defaultPrevented, false); assert.equal(h.stage.captureCount, 0);
  h.pointer('pointerdown', { pointerId: 1, isPrimary: true });
  h.pointer('pointerdown', { pointerId: 2, isPrimary: false, clientX: 500 });
  h.pointer('pointerdown', { pointerId: 3, isPrimary: true, clientX: 500 });
  assert.equal(h.pointer('pointermove', { pointerId: 2, clientX: 800 }).defaultPrevented, false);
  assert.equal(h.pointer('pointermove', { pointerId: 3, clientX: 800 }).defaultPrevented, false);
  assert.equal(h.pointer('pointermove', { pointerId: 1, clientX: -100 }).defaultPrevented, true);
  h.pointer('pointerup', { pointerId: 2 }); assert.equal(h.stage.hasPointerCapture(1), true);
  h.pointer('pointerup', { pointerId: 1 }); h.drain(); assert.equal(h.effects.selected.at(-1), 1); assert.equal(h.stage.captures.size, 0); h.dispose();
});
test('changed data/motion policy disposes enhancement and can re-enter later', async () => {
  const h = fixture(); const scene = await h.ready(); h.controller.step(1);
  h.connection.saveData = true; h.connection.emit('change');
  assert.equal(scene.disposed, 1); assert.equal(h.frames.size, 0); assert.equal(h.effects.modes.at(-1), 'static');
  h.cards.forEach((card) => { assert.equal(card.style.transform, undefined); assert.equal(card.style.opacity, undefined); assert.equal(card.style.zIndex, undefined); });
  h.connection.saveData = false; h.connection.emit('change'); await flushAsync(); h.drain();
  assert.equal(h.effects.creates, 2); assert.equal(h.effects.modes.at(-1), 'ready'); h.dispose();
});
for (const options of [{ importFails: true }, { createFails: true }]) test(`renderer ${options.importFails ? 'download' : 'creation'} failure leaves a stable fallback`, async () => {
  const h = fixture(options); h.intersect(true); await flushAsync(); assert.equal(h.effects.modes.at(-1), 'fallback'); assert.equal(h.frames.size, 0);
  const imports = h.effects.imports; h.intersect(false); h.intersect(true); await flushAsync(); assert.equal(h.effects.imports, imports, 'Visibility changes do not create a retry storm'); h.dispose();
});
test('disposal before dynamic import finishes prevents scene creation', async () => {
  const h = fixture(); h.intersect(true); h.dispose(); await flushAsync();
  assert.equal(h.effects.creates, 0); assert.deepEqual(h.effects.modes, ['loading']); assert.equal(h.frames.size, 0);
});
test('disposal while scene creation is pending disposes its late result once', async () => {
  const creation = deferred(), h = fixture({ creation }); h.intersect(true); await flushAsync(); h.dispose(); creation.resolve(); await flushAsync();
  assert.equal(h.effects.scenes[0].disposed, 1); assert.deepEqual(h.effects.modes, ['loading']); assert.equal(h.frames.size, 0);
});
for (const type of ['offscreen', 'hidden']) test(`${type} while import resolves prevents delayed GPU creation`, async () => {
  const h = fixture(); h.intersect(true);
  if (type === 'offscreen') h.intersect(false); else h.visibility('hidden');
  await flushAsync();
  try { assert.equal(h.effects.creates, 0, 'Recheck viewport/document after the dynamic import, before allocating GPU resources'); }
  finally { h.dispose(); }
});
test('a failure during pending scene creation cannot resurrect the failed scene', async () => {
  const creation = deferred(), h = fixture({ creation }); h.intersect(true); await flushAsync(); h.effects.failures[0](); creation.resolve(); await flushAsync();
  try { assert.equal(h.effects.modes.at(-1), 'fallback'); assert.equal(h.effects.scenes[0].disposed, 1); assert.equal(h.frames.size, 0); }
  finally { h.dispose(); }
});
test('a synchronous initial resize failure cannot resurrect ready mode', async () => {
  const h = fixture({ resizeFails: true }); h.intersect(true); await flushAsync();
  assert.deepEqual(h.effects.modes, ['loading', 'fallback']); assert.equal(h.effects.scenes[0].disposed, 1); assert.equal(h.frames.size, 0);
  h.intersect(false); h.intersect(true); await flushAsync(); assert.equal(h.effects.creates, 1); assert.equal(h.effects.modes.at(-1), 'fallback'); h.dispose();
});
test('a synchronous render failure stops an in-progress animation without scheduling another frame', async () => {
  const h = fixture({ renderFails: true }); h.intersect(true); await flushAsync();
  assert.equal(h.effects.modes.at(-1), 'ready'); h.controller.step(1); h.frame();
  assert.equal(h.effects.modes.at(-1), 'fallback'); assert.equal(h.effects.scenes[0].disposed, 1); assert.equal(h.frames.size, 0);
  const renders = h.effects.scenes[0].renders.length; h.frame(); assert.equal(h.effects.scenes[0].renders.length, renders);
  assert.deepEqual(h.effects.modes, ['loading', 'ready', 'fallback']); h.dispose();
});
test('disposal removes every observer/listener/frame, including repeated mounts', async () => {
  const stage = new Element(), cards = Array.from({ length: 3 }, (_item, index) => { const card = new Element('article', stage); card.dataset.glassIndex = String(index); return card; });
  for (let mount = 0; mount < 3; mount += 1) {
    const h = fixture({ stage, cards }); const scene = await h.ready(); h.controller.step(1); h.dispose(); h.dispose();
    assert.equal(scene.disposed, 1); assert.equal(h.frames.size, 0); assert.equal(stage.listenerCount, 0);
    assert.equal(h.document.listenerCount + h.media.listenerCount + h.connection.listenerCount, 0);
    assert.ok([...h.observers.intersection, ...h.observers.resize].every((observer) => !observer.connected && observer.targets.size === 0));
    const before = h.effects.selected.length; stage.emit('click', { target: cards[1] }); stage.emit('keydown', { key: 'ArrowRight' }); assert.equal(h.effects.selected.length, before);
  }
});
test('disposing an active drag releases pointer ownership and drag styling', async () => {
  const h = fixture(); await h.ready(); h.pointer('pointerdown'); h.pointer('pointermove', { clientX: -100 }); h.dispose();
  assert.equal(h.stage.hasPointerCapture(1), false); assert.equal(h.stage.dataset.dragging, undefined);
});
test('a policy change during drag releases pointer ownership before returning to native cards', async () => {
  const h = fixture(); await h.ready(); h.pointer('pointerdown'); h.pointer('pointermove', { clientX: -100 });
  h.media.matches = true; h.media.emit('change');
  try { assert.equal(h.stage.hasPointerCapture(1), false); assert.equal(h.stage.dataset.dragging, undefined); assert.equal(h.frames.size, 0); }
  finally { h.dispose(); }
});

function componentLoader({ hooks } = {}) {
  const cache = new Map(), loaded = new Set();
  function load(file) {
    file = path.resolve(root, file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module); loaded.add(path.relative(root, file));
    const localRequire = (name) => {
      if (name.endsWith('.css')) return {};
      assert.ok(!/createGlassScene|^(three(?:\/|$)|@react-three|@shadergradient)/.test(name), `SSR/native markup must not load a renderer: ${name}`);
      if (name === 'react' && hooks) return { ...React, ...hooks };
      if (!name.startsWith('.')) return nativeRequire(name);
      const base = path.resolve(path.dirname(file), name);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      assert.ok(resolved, `Cannot resolve ${name} from ${file}`); return load(resolved);
    };
    vm.runInNewContext(compile(fs.readFileSync(file, 'utf8')), { module, exports: module.exports, require: localRequire }, { filename: file });
    return module.exports;
  }
  return { load, loaded };
}
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[character]));
test('actual HomeHighlights SSR preserves three products, native evidence links and commercial outcomes without browser globals', () => {
  const { load, loaded } = componentLoader();
  const data = load('src/data/homepage.ts'); const { HomeHighlights } = load('src/sections/HomeHighlights.tsx');
  const html = renderToStaticMarkup(React.createElement(HomeHighlights));
  assert.deepEqual(plain(data.homepageProducts.map((product) => product.name)), ['nsso', '24Seven Concierge', 'Dreamsea']);
  for (const [index, product] of data.homepageProducts.entries()) {
    const article = html.match(new RegExp(`<article[^>]*data-glass-index="${index}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(article, `${product.name}: native article exists before enhancement`);
    for (const value of [product.name, product.description, product.kind, product.focus]) assert.ok(article.includes(escapeHtml(value)), `${product.name}: authored ${value} remains readable`);
    for (const href of [product.href, product.publicHref]) assert.ok(article.includes(`href="${escapeHtml(href)}"`), `${product.name}: native ${href} link survives`);
    assert.ok(!article.slice(0, article.indexOf('>')).includes('aria-hidden="true"'), `${product.name}: static content is not a hidden slide`);
    assert.ok(!/<a\b[^>]*tabindex="-1"/.test(article), `${product.name}: static links are keyboard reachable`);
  }
  for (const outcome of data.homepageOutcomes) {
    for (const value of [outcome.metric, outcome.outcome, outcome.responsibility, outcome.rolePeriod, outcome.measurementPeriod]) assert.ok(html.includes(escapeHtml(value)), `Existing commercial evidence remains: ${value}`);
    assert.ok(html.includes(`href="${outcome.href}"`));
  }
  assert.ok(html.includes('not independently audited')); assert.ok(html.includes('data-glass-mode="static"'));
  assert.ok(!html.includes('<canvas')); assert.ok(![...loaded].some((file) => /createGlassScene|three\//.test(file)));
});
test('actual component wires native arrow/dot buttons and hides only inactive enhanced slide links', () => {
  let ref = 0, state = 0; const calls = [];
  const controller = { step: (delta) => calls.push(['step', delta]), select: (index) => calls.push(['select', index]) };
  const { load } = componentLoader({ hooks: {
    useEffect() {}, useRef: () => ({ current: ++ref === 3 ? controller : null }),
    useState: () => [state++ === 0 ? 1 : 'ready', () => {}],
  } });
  const { homepageProducts } = load('src/data/homepage.ts');
  const { GlassCarousel } = load('src/components/GlassCarousel.tsx');
  const tree = GlassCarousel({ products: homepageProducts, labelledBy: 'products' });
  const nodes = [];
  const walk = (node) => { if (!node || typeof node !== 'object') return; if (Array.isArray(node)) { node.forEach(walk); return; } nodes.push(node); walk(node.props?.children); };
  walk(tree);
  const buttons = nodes.filter((node) => node.type === 'button');
  buttons.find((node) => node.props['aria-label'] === 'Previous product').props.onClick();
  buttons.find((node) => node.props['aria-label'] === 'Next product').props.onClick();
  homepageProducts.forEach((product) => buttons.find((node) => node.props['aria-label'] === `Show ${product.name}`).props.onClick());
  assert.deepEqual(calls, [['step', -1], ['step', 1], ['select', 0], ['select', 1], ['select', 2]]);
  nodes.filter((node) => node.type === 'article').forEach((article, index) => {
    assert.equal(article.props['aria-hidden'], index === 1 ? undefined : true);
    const links = []; const collect = (node) => { if (Array.isArray(node)) return node.forEach(collect); if (!node || typeof node !== 'object') return; if (node.type === 'a') links.push(node); collect(node.props?.children); }; collect(article);
    links.forEach((link) => assert.equal(link.props.tabIndex, index === 1 ? undefined : -1));
  });
});

const failures = [];
for (const { name, run } of tests) {
  try { await run(); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}\n  ${error.stack ?? error}`); }
}
if (failures.length) {
  console.error(`Glass carousel: ${failures.length}/${tests.length} behavioural checks failed.`); process.exitCode = 1;
} else console.log(`Glass carousel: ${tests.length} behavioural checks passed: cyclic geometry, actual controller events/lifecycle/policies, lazy scene requests, idle/offscreen scheduling, drag/native gestures, disposal races, actual SSR content and native component controls. No browser, WebGL, build, server or provider call was used.`);
