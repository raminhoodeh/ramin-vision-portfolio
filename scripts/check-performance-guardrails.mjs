import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(rootDir, 'src/App.tsx');
const legacyGlassPath = path.join(rootDir, 'src/components/LiquidGlassJsNavShellReadable.tsx');
const tahoeNavPath = path.join(rootDir, 'src/components/TahoeGlassTabNav.tsx');
const shaderPath = path.join(rootDir, 'src/components/ShaderGradientBackground.tsx');
const bonusPreloadPath = path.join(rootDir, 'src/three/bonusRockPreload.ts');
const baselinePath = path.join(rootDir, 'src/performance/portfolioPerformanceBaseline.ts');
const budgetsPath = path.join(rootDir, 'src/performance/portfolioPerformanceBudgets.ts');

const app = fs.readFileSync(appPath, 'utf8');
const legacyGlass = fs.existsSync(legacyGlassPath) ? fs.readFileSync(legacyGlassPath, 'utf8') : '';
const tahoeNav = fs.existsSync(tahoeNavPath) ? fs.readFileSync(tahoeNavPath, 'utf8') : '';
const shader = fs.readFileSync(shaderPath, 'utf8');
const bonusPreload = fs.readFileSync(bonusPreloadPath, 'utf8');
const baseline = fs.readFileSync(baselinePath, 'utf8');
const budgets = fs.readFileSync(budgetsPath, 'utf8');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, value, message) {
  assert(source.includes(value), message);
}

function readConstant(source, name) {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*([^;]+);`));
  return match?.[1]?.trim() ?? '';
}

function readDivisionFps(source, name) {
  const value = readConstant(source, name);
  const match = value.match(/^1000\s*\/\s*([\d.]+)$/);
  return match ? Number(match[1]) : Number.NaN;
}

function readNumber(source, name) {
  const value = readConstant(source, name);
  return Number(value.replaceAll('_', ''));
}

function sliceBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  if (start < 0) return '';

  const end = source.indexOf(endNeedle, start + startNeedle.length);
  return source.slice(start, end < 0 ? undefined : end);
}

const shaderPresetFps = readDivisionFps(shader, 'SHADER_PRESET_SAMPLE_MS');
const usesTahoeNav = app.includes('TahoeGlassTabNav');
let navGuardSummary = 'nav guard unavailable';

if (usesTahoeNav) {
  assertIncludes(app, "import { TahoeGlassTabNav }", 'App must import the active Tahoe glass nav');
  assertIncludes(app, 'onNavIntent={onNavIntent}', 'active nav must receive predictive preload intent callback');
  assertIncludes(tahoeNav, 'onNavIntent', 'Tahoe glass nav must expose intent callbacks for predictive loading');
  assertIncludes(tahoeNav, 'onPointerEnter={() => onNavIntent?.(link.target)}', 'Tahoe nav hover intent must be available for preloading');
  assertIncludes(tahoeNav, 'onFocus={() => onNavIntent?.(link.target)}', 'Tahoe nav focus intent must be available for preloading');
  assertIncludes(tahoeNav, 'role="tablist"', 'Tahoe nav must preserve tablist semantics');
  assertIncludes(tahoeNav, 'role="tab"', 'Tahoe nav must preserve tab semantics');
  assert(!tahoeNav.includes('requestAnimationFrame'), 'Tahoe nav must not add its own RAF loop');
  assert(!tahoeNav.includes('new WebGL'), 'Tahoe nav must not create a WebGL context');
  navGuardSummary = 'tahoe nav intent hooks, no RAF/WebGL';
} else {
  const activeGlassFps = readDivisionFps(legacyGlass, 'GLASS_ACTIVE_REFRESH_MS');
  const idleGlassFps = readDivisionFps(legacyGlass, 'GLASS_IDLE_REFRESH_MS');
  const floatingGlassFps = readDivisionFps(legacyGlass, 'GLASS_FLOATING_REFRESH_MS');
  const glassMaxDpr = readNumber(legacyGlass, 'GLASS_MAX_DPR');
  const nestedRenderLoop = sliceBetween(
    legacyGlass,
    'Button.prototype.startNestedRenderLoop = function startNestedRenderLoop()',
    'function renderNestedChildren',
  );

  assertIncludes(legacyGlass, "refreshMode: 'adaptive-raf'", 'liquid glass must advertise adaptive-raf refresh mode');
  assert(!legacyGlass.includes('const SNAPSHOT_REFRESH_MS = 1000 / 60'), 'liquid glass must not restore a 60fps snapshot interval');
  assert(Number.isFinite(activeGlassFps) && activeGlassFps <= 24, 'active liquid glass texture refresh must be capped at 24fps');
  assert(Number.isFinite(idleGlassFps) && idleGlassFps <= 6, 'idle liquid glass texture refresh must be capped at 6fps');
  assert(Number.isFinite(floatingGlassFps) && floatingGlassFps <= 4, 'floating glass texture refresh must be capped at 4fps');
  assert(Number.isFinite(glassMaxDpr) && glassMaxDpr <= 1.7, 'liquid glass DPR cap must stay at or below 1.7');
  assert(nestedRenderLoop, 'could not find nested glass render loop override');
  assert(
    !nestedRenderLoop.includes('requestAnimationFrame'),
    'nested glass buttons must not run their own requestAnimationFrame loop',
  );
  assertIncludes(legacyGlass, 'onNavIntent', 'navigation shell must expose intent callbacks for predictive loading');
  assertIncludes(legacyGlass, "instance.element.addEventListener('pointerenter'", 'Bonus nav hover intent must be available for preloading');
  navGuardSummary = `glass ${activeGlassFps}fps active/${idleGlassFps}fps idle, DPR cap ${glassMaxDpr}`;
}

assert(!app.includes("activeSection !== 'bonus'"), 'live shader background must remain enabled while Bonus is active');
assertIncludes(app, 'const shouldUseLiveBackground = liveBackgroundReady', 'live shader background must depend on readiness only');
assertIncludes(app, '<StaticShaderGradientBackground variant={shaderVariant} />', 'static shader fallback must stay mounted under live shader');
assertIncludes(app, 'rockVisibilityObserver', 'Bonus rock renderer must keep an IntersectionObserver visibility gate');
assertIncludes(app, 'handleRockDocumentVisibility', 'Bonus rock renderer must pause/resume on document visibility');
assertIncludes(app, 'scheduleRockFrame', 'Bonus rock renderer must schedule frames through a visibility-aware gate');
assertIncludes(app, 'targetTracksRef', 'Bonus rock renderer must cache animation targets outside the frame loop');
assertIncludes(app, 'const particleCount = window.innerWidth < 720 ? 640 : 920', 'Bonus rock renderer must keep an adaptive particle budget');
assertIncludes(app, 'particleMotionActive', 'Bonus rock renderer must skip invisible particle buffer updates');
assertIncludes(app, "requestBonusRockPreload('idle')", 'Bonus rock assets must warm during idle time');
assertIncludes(app, "preloadBonusRockAssets('visible')", 'visible Bonus rock scene must join the preload state machine');
assertIncludes(app, 'data-rock-preload-status', 'Bonus rock preload status must be observable on the Bonus scene');
assertIncludes(app, 'data-bonus-rock-preload-status', 'root preload status must be observable without mounting Bonus');
assertIncludes(bonusPreload, 'warmHashgraphRockAssetPipeline', 'Bonus preload coordinator must warm rock asset URLs');
assertIncludes(bonusPreload, "import('three')", 'Bonus preload coordinator must warm Three.js');
assertIncludes(bonusPreload, 'subscribeBonusRockPreload', 'Bonus preload coordinator must expose preload status updates');

const assetPath = path.join(rootDir, 'src/three/hashgraphRockAssets.ts');
const rockAssets = fs.readFileSync(assetPath, 'utf8');
assertIncludes(rockAssets, 'installHashgraphRockResourceHints', 'rock asset pipeline must expose resource hint installation');
assertIncludes(rockAssets, "link.rel = 'prefetch'", 'rock resource hints must use prefetch rather than preload');
assertIncludes(rockAssets, "link.as = 'fetch'", 'rock resource hints must be fetch hints for GLB/KTX2/decoder assets');
assertIncludes(rockAssets, "link.crossOrigin = 'anonymous'", 'rock resource hints must be anonymous cache-compatible requests');
assertIncludes(rockAssets, 'installedResourceHints', 'rock resource hints must be de-duplicated');
assertIncludes(baseline, 'PortfolioShaderSurfaceBaseline', 'performance baseline must track shader surfaces');
assertIncludes(baseline, 'collectShaderSurfaces', 'performance baseline must collect shader surface variants');
assertIncludes(baseline, 'bonusRockPreloadStatus', 'performance baseline must expose Bonus rock preload status');

assert(Number.isFinite(shaderPresetFps) && shaderPresetFps <= 24, 'shader preset transition updates must be sampled at 24fps or below');
assertIncludes(shader, 'lastSampleAt', 'shader preset transition must avoid React state writes on every RAF');

const rockPixelRatioMatch = app.match(/renderer\.setPixelRatio\(\s*Math\.min\(\s*window\.devicePixelRatio,\s*window\.innerWidth\s*<\s*720\s*\?\s*([\d.]+)\s*:\s*([\d.]+)\s*\)\s*\)/);
assert(Boolean(rockPixelRatioMatch), 'Bonus rock renderer must use explicit mobile and desktop DPR caps');
if (rockPixelRatioMatch) {
  const mobileCap = Number(rockPixelRatioMatch[1]);
  const desktopCap = Number(rockPixelRatioMatch[2]);
  assert(mobileCap <= 1.2, 'Bonus rock mobile DPR cap must stay at or below 1.2');
  assert(desktopCap <= 1.25, 'Bonus rock desktop DPR cap must stay at or below 1.25');
}

assertIncludes(budgets, 'MAX_VISIBLE_CANVAS_PIXELS', 'performance budgets must include visible canvas pixel budget');
assertIncludes(budgets, 'MAX_BONUS_ROCK_OVERDRAW', 'performance budgets must include Bonus rock overdraw budget');
assertIncludes(budgets, 'MAX_NON_BONUS_ROCK_CANVASES', 'performance budgets must prevent hidden Bonus rock canvases');
assertIncludes(budgets, 'non-bonus-rock-canvas', 'performance budgets must guard against non-Bonus rock canvas leaks');
assertIncludes(budgets, 'non-bonus-shader-variant', 'performance budgets must guard against non-Bonus shader variant leaks');
assertIncludes(budgets, 'bonus-preload-status', 'performance budgets must require Bonus preload when Bonus is active');
assertIncludes(budgets, 'adaptive-raf', 'performance budgets must enforce adaptive liquid glass refresh mode');

if (failures.length) {
  console.error(`Performance guardrail check failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Performance guardrail check passed: ${navGuardSummary}, rock <= 1.25.`,
);
