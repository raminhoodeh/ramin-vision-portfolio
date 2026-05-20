import type { PortfolioPerformanceBaselineSnapshot } from './portfolioPerformanceBaseline';

export type PortfolioFrameBudgetSample = {
  fps: number;
  p95Ms: number;
  longFrames: number;
  sampleCount: number;
};

export type PortfolioPerformanceBudgetResult = {
  id: string;
  label: string;
  actual: string;
  budget: string;
  passed: boolean;
};

const MAX_VISIBLE_CANVAS_PIXELS = 2_400_000;
const MAX_WEBGL_CONTEXTS = 10;
const MAX_VISIBLE_CANVASES = 10;
const MAX_PENDING_RAF = 14;
const MAX_BONUS_ROCK_OVERDRAW = 2.35;
const MAX_NON_BONUS_ROCK_CANVASES = 0;
const MAX_LIQUID_GLASS_TEXTURE_FPS = 26;
const MAX_NESTED_GLASS_FPS_PER_CHILD = 26;
const MIN_INTERACTIVE_FPS = 45;
const MAX_INTERACTIVE_P95_MS = 28;

function formatPixels(pixels: number) {
  if (pixels >= 1_000_000) return `${Math.round((pixels / 1_000_000) * 100) / 100}MP`;
  if (pixels >= 1_000) return `${Math.round((pixels / 1_000) * 10) / 10}K`;
  return String(pixels);
}

function formatNumber(value: number, suffix = '') {
  return `${Math.round(value * 10) / 10}${suffix}`;
}

function countCanvases(snapshot: PortfolioPerformanceBaselineSnapshot, role: string) {
  return snapshot.canvases.filter((canvas) => canvas.role === role && canvas.visible).length;
}

function countAllCanvases(snapshot: PortfolioPerformanceBaselineSnapshot, role: string) {
  return snapshot.canvases.filter((canvas) => canvas.role === role).length;
}

function countShaderSurfaces(snapshot: PortfolioPerformanceBaselineSnapshot, variant: string) {
  return snapshot.shaderSurfaces.filter((surface) => surface.variant === variant && surface.visible).length;
}

function formatShaderVariants(snapshot: PortfolioPerformanceBaselineSnapshot) {
  const variants = Array.from(
    new Set(snapshot.shaderSurfaces.filter((surface) => surface.visible).map((surface) => surface.variant)),
  );

  return variants.length ? variants.join(', ') : 'none';
}

function hasActiveBonusPreload(status: string | undefined) {
  return status === 'preloading' || status === 'ready';
}

function addBudget(
  results: PortfolioPerformanceBudgetResult[],
  id: string,
  label: string,
  actual: string,
  budget: string,
  passed: boolean,
) {
  results.push({ id, label, actual, budget, passed });
}

export function evaluatePortfolioPerformanceBudgets(
  snapshot: PortfolioPerformanceBaselineSnapshot,
  frames?: PortfolioFrameBudgetSample,
) {
  const results: PortfolioPerformanceBudgetResult[] = [];
  const webglContexts = (snapshot.contexts.webgl ?? 0) + (snapshot.contexts.webgl2 ?? 0);
  const isBonus = snapshot.activeHash === '#bonus';
  const bonusRockCanvasCount = countAllCanvases(snapshot, 'bonus-rock');
  const bonusRockCanvases = snapshot.canvases.filter((canvas) => canvas.role === 'bonus-rock' && canvas.visible);
  const maxBonusRockOverdraw = Math.max(0, ...bonusRockCanvases.map((canvas) => canvas.overdrawRatio));
  const bonusShaderSurfaces = countShaderSurfaces(snapshot, 'bonus');
  const defaultShaderSurfaces = countShaderSurfaces(snapshot, 'default');

  addBudget(
    results,
    'visible-canvases',
    'Visible canvases',
    String(snapshot.visibleCanvasCount),
    `<= ${MAX_VISIBLE_CANVASES}`,
    snapshot.visibleCanvasCount <= MAX_VISIBLE_CANVASES,
  );
  addBudget(
    results,
    'visible-canvas-pixels',
    'Visible canvas pixels',
    formatPixels(snapshot.totalVisibleCanvasPixels),
    `<= ${formatPixels(MAX_VISIBLE_CANVAS_PIXELS)}`,
    snapshot.totalVisibleCanvasPixels <= MAX_VISIBLE_CANVAS_PIXELS,
  );
  addBudget(
    results,
    'webgl-contexts',
    'WebGL contexts',
    String(webglContexts),
    `<= ${MAX_WEBGL_CONTEXTS}`,
    webglContexts <= MAX_WEBGL_CONTEXTS,
  );
  addBudget(
    results,
    'pending-raf',
    'Pending RAF',
    String(snapshot.raf.pendingCallbacks),
    `<= ${MAX_PENDING_RAF}`,
    snapshot.raf.pendingCallbacks <= MAX_PENDING_RAF,
  );

  if (isBonus) {
    addBudget(
      results,
      'bonus-preload-status',
      'Bonus preload status',
      snapshot.bonusRockPreloadStatus ?? 'missing',
      'preloading or ready',
      hasActiveBonusPreload(snapshot.bonusRockPreloadStatus),
    );
    addBudget(
      results,
      'bonus-rock-canvas',
      'Bonus rock canvas',
      String(bonusRockCanvases.length),
      '= 1',
      bonusRockCanvases.length === 1,
    );
    addBudget(
      results,
      'bonus-shader-variant',
      'Bonus shader variant',
      formatShaderVariants(snapshot),
      'bonus visible',
      bonusShaderSurfaces >= 1,
    );
    addBudget(
      results,
      'bonus-shader-background',
      'Bonus shader canvas',
      String(countCanvases(snapshot, 'shader-background')),
      '>= 1',
      countCanvases(snapshot, 'shader-background') >= 1,
    );
    addBudget(
      results,
      'bonus-rock-overdraw',
      'Rock overdraw',
      formatNumber(maxBonusRockOverdraw),
      `<= ${MAX_BONUS_ROCK_OVERDRAW}`,
      maxBonusRockOverdraw <= MAX_BONUS_ROCK_OVERDRAW,
    );
  } else {
    addBudget(
      results,
      'non-bonus-rock-canvas',
      'Non-Bonus rock canvas',
      String(bonusRockCanvasCount),
      `<= ${MAX_NON_BONUS_ROCK_CANVASES}`,
      bonusRockCanvasCount <= MAX_NON_BONUS_ROCK_CANVASES,
    );
    addBudget(
      results,
      'non-bonus-shader-variant',
      'Non-Bonus shader variant',
      formatShaderVariants(snapshot),
      'default only',
      defaultShaderSurfaces >= 1 && bonusShaderSurfaces === 0,
    );
  }

  if (snapshot.liquidGlass?.refreshMode) {
    addBudget(
      results,
      'glass-refresh-mode',
      'Glass refresh mode',
      snapshot.liquidGlass.refreshMode,
      'adaptive-raf',
      snapshot.liquidGlass.refreshMode === 'adaptive-raf',
    );
  }

  if (typeof snapshot.liquidGlass?.textureFps === 'number') {
    addBudget(
      results,
      'glass-texture-fps',
      'Glass texture FPS',
      formatNumber(snapshot.liquidGlass.textureFps),
      `<= ${MAX_LIQUID_GLASS_TEXTURE_FPS}`,
      snapshot.liquidGlass.textureFps <= MAX_LIQUID_GLASS_TEXTURE_FPS,
    );
  }

  if (typeof snapshot.liquidGlass?.nestedRenderFps === 'number') {
    const nestedRenderBudget = Math.max(
      MAX_NESTED_GLASS_FPS_PER_CHILD,
      Math.max((snapshot.liquidGlass.instances ?? 1) - 1, 1) * MAX_NESTED_GLASS_FPS_PER_CHILD,
    );

    addBudget(
      results,
      'nested-glass-fps',
      'Nested glass render',
      formatNumber(snapshot.liquidGlass.nestedRenderFps),
      `<= ${nestedRenderBudget}`,
      snapshot.liquidGlass.nestedRenderFps <= nestedRenderBudget,
    );
  }

  const strictFrameBudgets =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('perfStrict');

  if (strictFrameBudgets && frames && frames.sampleCount >= 90) {
    addBudget(
      results,
      'interactive-fps',
      'Interactive FPS',
      formatNumber(frames.fps),
      `>= ${MIN_INTERACTIVE_FPS}`,
      frames.fps >= MIN_INTERACTIVE_FPS,
    );
    addBudget(
      results,
      'interactive-p95',
      'Frame p95',
      formatNumber(frames.p95Ms, 'ms'),
      `<= ${MAX_INTERACTIVE_P95_MS}ms`,
      frames.p95Ms <= MAX_INTERACTIVE_P95_MS,
    );
  }

  return results;
}
