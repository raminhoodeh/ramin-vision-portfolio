import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { initialAssetReport } from './report-initial-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const parse = (file) => ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function isRuntimeImport(node) {
  if (ts.isImportDeclaration(node)) {
    if (!node.importClause) return true;
    if (node.importClause.isTypeOnly) return false;
    const bindings = node.importClause.namedBindings;
    return !!node.importClause.name || !bindings || !ts.isNamedImports(bindings) || bindings.elements.some((item) => !item.isTypeOnly);
  }
  return !node.isTypeOnly && (!node.exportClause || !ts.isNamedExports(node.exportClause) || node.exportClause.elements.some((item) => !item.isTypeOnly));
}

// Follow actual runtime import/export edges, excluding type-only and dynamic imports.
// This catches a heavy renderer accidentally moved back to an eager barrel/import.
const visited = new Set();
const external = new Set();
function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const ast = parse(file);
  for (const node of ast.statements) {
    if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) || !node.moduleSpecifier || !isRuntimeImport(node)) continue;
    const name = node.moduleSpecifier.text;
    if (!name.startsWith('.')) { external.add(name); continue; }
    const base = path.resolve(root, path.dirname(file), name);
    const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, path.join(base, 'index.ts')]
      .find((candidate) => /\.(?:tsx?|mjs)$/.test(candidate) && fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (resolved) visit(path.relative(root, resolved));
  }
}
visit('src/main.tsx');
for (const deferred of [
  'src/sections/Contact.tsx', 'src/sections/ExperienceEducation.tsx', 'src/sections/Projects/index.tsx',
  'src/sections/TeachingWriting/index.tsx', 'src/sections/AiRamin.tsx',
  'src/sections/Bonus.tsx', 'src/sections/Projects/CaseStudyOverlay.tsx',
  'src/sections/Projects/ThesisDeepDive.tsx', 'src/sections/TeachingWriting/MetacognitionDeepDive.tsx',
  'src/sections/ProfessionalStories.tsx', 'src/sections/DisxTalkPage.tsx',
  'src/components/VisionLoadingScreen.tsx', 'src/three/hashgraphRockAssets.ts',
  'src/components/IPhone3D.tsx', 'src/performance/workVideoPreload.ts',
]) assert.equal(visited.has(deferred), false, `${deferred} must stay out of the initial static dependency graph`);
for (const name of external) assert.ok(!/^(three(?:\/|$)|@react-three\/|@shadergradient\/|hls\.js$)/.test(name), `${name} must be deferred`);

function execute(file, requireMock, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(read(file), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: requireMock, ...globals }, { filename: file });
  return module.exports;
}

let preferences = { saveData: false, effectiveType: '4g', deviceMemory: 8, reducedMotion: false, visible: true };
const policyGlobals = {
  navigator: { connection: {}, deviceMemory: 8 },
  window: { matchMedia: () => ({ matches: false }) },
  document: { visibilityState: 'visible' },
};
const policy = execute('src/performance/loadingPolicy.ts', () => { throw new Error('Policy must be dependency-free'); }, policyGlobals);
assert.equal(policy.canSpeculativelyLoad(preferences), true);
for (const restricted of [
  { saveData: true }, { effectiveType: '3g' }, { effectiveType: '2g' },
  { effectiveType: 'slow-2g' }, { deviceMemory: 4 }, { deviceMemory: 2 },
  { reducedMotion: true }, { visible: false },
]) assert.equal(policy.canSpeculativelyLoad({ ...preferences, ...restricted }), false, JSON.stringify(restricted));
assert.equal(policy.canSpeculativelyLoad({ ...preferences, deviceMemory: undefined, effectiveType: undefined }), true, 'Browsers without network/device APIs still support intent loading');
assert.equal(policy.shouldAnimate({ ...preferences, reducedMotion: true }), false);
policyGlobals.navigator.connection.saveData = true;
assert.equal(policy.getLoadingPreferences().saveData, true, 'Read actual browser settings');

const effects = { tags: [], hints: [], removed: 0, imported: [], warmed: 0 };
const documentMock = {
  head: { appendChild: (link) => effects.hints.push(link) },
  createElement: (tag) => {
    effects.tags.push(tag);
    return { setAttribute() {}, remove() { effects.removed += 1; } };
  },
};
const guardedPolicy = { canSpeculativelyLoad: () => policy.canSpeculativelyLoad(preferences) };
const videos = execute('src/performance/workVideoPreload.ts', (name) => {
  if (name.endsWith('loadingPolicy')) return guardedPolicy;
  if (name.endsWith('/assets')) return { resolveWorkVideoSrc: (entry) => entry.video };
  throw new Error(`Unexpected media dependency ${name}`);
}, { document: documentMock });
assert.equal(effects.tags.length, 0, 'Importing Work preloader performs no DOM/media/network work');
for (const reason of ['idle', 'intent', 'navigate', 'visible', 'activate']) videos.preloadWorkVideos(reason);
assert.equal(effects.hints.length, 0, 'Bulk Work compatibility API never warms unrelated companies');
for (const restricted of [{ saveData: true }, { effectiveType: '3g' }, { reducedMotion: true }, { deviceMemory: 2 }, { visible: false }]) {
  preferences = { ...preferences, ...restricted };
  for (const reason of ['intent', 'navigate', 'visible', 'activate']) videos.preloadWorkVideoForEntry({ video: '/selected.webm' }, reason);
  preferences = { saveData: false, effectiveType: '4g', deviceMemory: 8, reducedMotion: false, visible: true };
}
assert.equal(effects.tags.length, 0, 'Optional selected Work hints honor every restriction, even on entry/activate');
videos.preloadWorkVideoForEntry({ video: '/selected.webm' }, 'idle');
assert.equal(effects.hints.length, 0, 'Selected media also refuses idle warming');
videos.preloadWorkVideoForEntry({ video: '/selected.webm' }, 'intent');
videos.preloadWorkVideoForEntry({ video: '/selected.webm' }, 'activate');
assert.equal(effects.hints.length, 1, 'Only the selected source is hinted and deduplicated');
assert.equal(effects.hints[0].href, '/selected.webm');
assert.equal(effects.hints[0].rel, 'prefetch');
assert.deepEqual(effects.tags, ['link'], 'No hidden video decoder or media element');
videos.cancelScheduledWorkVideoPreloads();
assert.equal(effects.removed, 1);
assert.equal(videos.getWorkVideoUrls().length, 0);

const bonus = execute('src/three/bonusRockPreload.ts', (name) => {
  if (name.endsWith('loadingPolicy')) return guardedPolicy;
  effects.imported.push(name);
  if (name.endsWith('hashgraphRockAssets')) return { warmHashgraphRockAssetPipeline: async () => { effects.warmed += 1; } };
  if (name === 'three' || name.startsWith('three/')) return {};
  throw new Error(`Unexpected Bonus dependency ${name}`);
}, { window: {}, performance: { now: () => 1 } });
assert.equal(effects.imported.length, 0, 'Importing Bonus coordinator never imports Three or its model pipeline');
await bonus.preloadBonusRockAssets('idle');
preferences = { ...preferences, saveData: true };
await bonus.preloadBonusRockAssets('intent');
assert.equal(effects.imported.length, 0, 'Idle or restricted Bonus intent performs no module/asset requests');
// Explicit entry is required content and must still work with Save-Data enabled.
const coldEntry = bonus.preloadBonusRockAssets('navigate');
assert.equal(bonus.preloadBonusRockAssets('visible'), coldEntry, 'Cold Bonus calls share one in-flight request');
assert.equal((await coldEntry).status, 'ready');
assert.equal(effects.warmed, 1);
await bonus.preloadBonusRockAssets('navigate');
assert.equal(effects.warmed, 1, 'Warm/return Bonus entry reuses loaded assets');

let imports = 0;
let fail = false;
const deferred = execute('src/performance/deferredComponent.ts', () => ({ lazy: (factory) => factory })).deferredComponent(async () => {
  imports += 1;
  if (fail) throw new Error('Offline');
  return { default: () => null };
});
const coldRoute = deferred.preload();
assert.equal(deferred.preload(), coldRoute, 'Cold/intent navigation shares its import');
await coldRoute;
assert.equal(deferred.Component(), coldRoute, 'React render uses the same resolved import');
assert.equal(imports, 1, 'Warm/return code requests reuse their promise');
fail = true;
const retryable = execute('src/performance/deferredComponent.ts', () => ({ lazy: (factory) => factory })).deferredComponent(async () => {
  if (fail) throw new Error('Offline');
  return { default: () => null };
});
await assert.rejects(retryable.preload());
fail = false;
await retryable.preload();

let reloads = 0;
const { RouteLoadBoundary } = execute('src/performance/RouteLoadBoundary.tsx', (name) => {
  if (name === 'react') return { ...React, useRef: () => ({ current: null }) };
  if (name === 'react/jsx-runtime') return jsxRuntime;
  if (name.endsWith('PortfolioAppReady')) return { PortfolioAppReady: () => null };
  if (name.endsWith('useDialogFocus')) return { useDialogFocus() {} };
  throw new Error(`Unexpected boundary dependency ${name}`);
}, { window: { location: { reload: () => { reloads += 1; } } } });
const boundary = new RouteLoadBoundary({ routeKey: '/projects/nsso', children: 'Page content', onClose() {} });
assert.equal(boundary.render(), 'Page content');
boundary.state = RouteLoadBoundary.getDerivedStateFromError(new Error('Offline'));
const fallbackComponent = boundary.render();
const fallback = fallbackComponent.type(fallbackComponent.props);
assert.equal(fallback.props.role, 'dialog', 'A failed reader retains an accessible exit boundary');
const failureHtml = renderToStaticMarkup(fallback);
for (const label of ['Reload page', 'Return to the portfolio', 'Contact Ramin']) assert.ok(failureHtml.includes(label), `Failure fallback exposes ${label}`);
assert.ok(!failureHtml.includes('href="/cv"'), 'A failed route does not expose a CV download');
fallback.props.children.find((child) => child?.type === 'button').props.onClick();
assert.equal(reloads, 1, 'Reload clears the browser/React lazy download failure');
boundary.setState = (next) => { boundary.state = { ...boundary.state, ...next }; };
const previous = boundary.props;
boundary.props = { ...previous, routeKey: '/contact' };
boundary.componentDidUpdate(previous);
assert.equal(boundary.render(), 'Page content', 'A new route clears the previous failure state');
const optional = new RouteLoadBoundary({ routeKey: 'background', children: 'Shader', optional: true });
optional.state = { failed: true };
assert.equal(optional.render(), null, 'An optional shader failure leaves the static background');

// Built artifacts provide a second check against source-graph assumptions.
// Run after a normal build: route chunks must exist but not be HTML/static-import dependencies.
const report = initialAssetReport();
assert.ok(report.javascriptBytes < 650_000, `Initial JavaScript budget exceeded: ${report.javascriptBytes} bytes (before split: 1,271,226)`);
assert.ok(report.javascriptGzipBytes < 220_000, `Initial compressed JavaScript estimate exceeded: ${report.javascriptGzipBytes} bytes`);
const manifestFile = path.join(root, 'dist/.vite/manifest.json');
assert.ok(fs.existsSync(manifestFile), 'Build with vite build --manifest to verify source-to-chunk boundaries');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const entry = Object.values(manifest).find((chunk) => chunk.isEntry);
assert.ok(entry, 'The build must expose its entry chunk');
const staticChunks = new Set();
const followBuiltImports = (chunk) => {
  if (!chunk || staticChunks.has(chunk.file)) return;
  staticChunks.add(chunk.file);
  for (const dependency of chunk.imports ?? []) followBuiltImports(manifest[dependency]);
};
followBuiltImports(entry);
const dynamicTargets = new Set();
for (const file of report.files.filter((file) => file.file.endsWith('.js'))) {
  const ast = ts.createSourceFile(file.file, fs.readFileSync(path.join(root, 'dist', file.file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const collectDynamicImports = (node) => {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteralLike(node.arguments[0])) {
      dynamicTargets.add(path.posix.join(path.posix.dirname(file.file), node.arguments[0].text));
    }
    ts.forEachChild(node, collectDynamicImports);
  };
  collectDynamicImports(ast);
}
for (const module of [
  'src/sections/Contact.tsx', 'src/sections/ExperienceEducation.tsx', 'src/sections/Projects/index.tsx',
  'src/sections/TeachingWriting/index.tsx', 'src/sections/AiRamin.tsx', 'src/sections/Bonus.tsx',
  'src/sections/Projects/ThesisDeepDive.tsx', 'src/sections/TeachingWriting/MetacognitionDeepDive.tsx',
  'src/performance/ResolvedCaseStudyReader.tsx', 'src/sections/ProfessionalStories.tsx',
  'src/sections/DisxTalkPage.tsx', 'src/components/VisionLoadingScreen.tsx',
]) {
  // Rolldown records a module imported both statically by another deferred route
  // and dynamically by App as a shared chunk. Such chunks have a stable semantic
  // name but no source key/isDynamicEntry flag (e.g. Projects and Metacognition).
  // Resolve that metadata, then prove a real import() edge in the built entry;
  // never infer deferral from a hashed filename or that flag alone.
  const moduleName = path.basename(module).replace(/\.tsx?$/, '') === 'index'
    ? path.basename(path.dirname(module)) : path.basename(module).replace(/\.tsx?$/, '');
  const candidates = Object.values(manifest).filter((chunk) => !chunk.src && chunk.name === moduleName && chunk.file.endsWith('.js'));
  const chunk = manifest[module] ?? (candidates.length === 1 ? candidates[0] : null);
  assert.ok(chunk, `${module} must resolve to a unique build chunk`);
  assert.ok(dynamicTargets.has(chunk.file), `${module} must have a real dynamic import edge from initial code`);
  assert.equal(staticChunks.has(chunk.file), false, `${module} must not be reachable through built static imports`);
  assert.equal(report.files.some((file) => file.file === chunk.file), false, `${module} must not be requested by initial HTML/import graph`);
}

console.log(`Performance loading checks passed: ${visited.size} initial source modules; heavy routes deferred; restricted intent requests suppressed; selected-only Work hints; cold/warm/return imports deduplicated. Initial JS ${report.javascriptBytes} bytes / ${report.javascriptGzipBytes} gzip estimate. Browser handoff and timing are separate checks.`);
