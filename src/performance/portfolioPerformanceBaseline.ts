export type PortfolioCanvasBaseline = {
  index: number;
  contextTypes: string[];
  role: string;
  cssWidth: number;
  cssHeight: number;
  bufferWidth: number;
  bufferHeight: number;
  cssPixels: number;
  bufferPixels: number;
  overdrawRatio: number;
  visible: boolean;
  owner: string;
};

export type PortfolioShaderSurfaceBaseline = {
  index: number;
  variant: string;
  canvasCount: number;
  visible: boolean;
  owner: string;
};

export type PortfolioLiquidGlassMetrics = {
  instances?: number;
  refreshMode?: string;
  textureFps?: number;
  snapshot?: MetricSeriesSnapshot;
  textureRefresh?: MetricSeriesSnapshot;
  textureUpload?: MetricSeriesSnapshot;
  nestedRenderFps?: number;
};

export type MetricSeriesSnapshot = {
  count: number;
  lastMs: number;
  avgMs: number;
  maxMs: number;
  lastAt: number;
};

export type PortfolioPerformanceBaselineSnapshot = {
  activeHash: string;
  canvasCount: number;
  visibleCanvasCount: number;
  totalCanvasPixels: number;
  totalVisibleCanvasPixels: number;
  contexts: Record<string, number>;
  devicePixelRatio: number;
  viewport: {
    width: number;
    height: number;
  };
  raf: {
    callbacksPerSecond: number;
    scheduledPerSecond: number;
    pendingCallbacks: number;
  };
  resources: {
    count: number;
    transferKb: number;
    encodedKb: number;
    decodedKb: number;
  };
  bonusRockPreloadStatus?: string;
  shaderSurfaces: PortfolioShaderSurfaceBaseline[];
  liquidGlass?: PortfolioLiquidGlassMetrics;
  canvases: PortfolioCanvasBaseline[];
};

type PortfolioPerformanceBaselineApi = {
  installedAt: number;
  snapshot: () => PortfolioPerformanceBaselineSnapshot;
};

type LiquidGlassWindowApi = {
  getInstanceCount?: () => number;
  getTextureFps?: () => number;
  getMetrics?: () => PortfolioLiquidGlassMetrics;
  refreshMode?: string;
};

declare global {
  interface Window {
    __portfolioPerfBaseline?: PortfolioPerformanceBaselineApi;
    __portfolioLiquidGlassNav?: LiquidGlassWindowApi;
  }
}

const contextTypesByCanvas = new WeakMap<HTMLCanvasElement, Set<string>>();
const trackedContextRecords = new Set<{ canvas: HTMLCanvasElement; type: string }>();

let installed = false;
let originalGetContext: HTMLCanvasElement['getContext'] | undefined;
let originalRequestAnimationFrame: Window['requestAnimationFrame'] | undefined;
let originalCancelAnimationFrame: Window['cancelAnimationFrame'] | undefined;

let rafWindowStart = 0;
let rafScheduledInWindow = 0;
let rafCompletedInWindow = 0;
let rafScheduledPerSecond = 0;
let rafCallbacksPerSecond = 0;
const pendingRafHandles = new Set<number>();

function round(value: number, precision = 1) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function recordContext(canvas: HTMLCanvasElement, type: string) {
  let contextTypes = contextTypesByCanvas.get(canvas);
  if (!contextTypes) {
    contextTypes = new Set<string>();
    contextTypesByCanvas.set(canvas, contextTypes);
  }

  if (!contextTypes.has(type)) {
    contextTypes.add(type);
    trackedContextRecords.add({ canvas, type });
  }
}

function updateRafWindow(now: number) {
  if (!rafWindowStart) rafWindowStart = now;

  const elapsed = now - rafWindowStart;
  if (elapsed < 1000) return;

  rafScheduledPerSecond = round((rafScheduledInWindow * 1000) / elapsed, 1);
  rafCallbacksPerSecond = round((rafCompletedInWindow * 1000) / elapsed, 1);
  rafScheduledInWindow = 0;
  rafCompletedInWindow = 0;
  rafWindowStart = now;
}

function patchCanvasContexts() {
  if (originalGetContext) return;

  originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function patchedGetContext(
    this: HTMLCanvasElement,
    contextId: string,
    options?: unknown,
  ) {
    const context = originalGetContext?.call(this, contextId as never, options as never);
    if (context) recordContext(this, contextId);
    return context;
  } as HTMLCanvasElement['getContext'];
}

function patchRequestAnimationFrame() {
  if (originalRequestAnimationFrame || originalCancelAnimationFrame) return;

  originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);
  originalCancelAnimationFrame = window.cancelAnimationFrame.bind(window);

  window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    rafScheduledInWindow += 1;
    updateRafWindow(performance.now());

    const handle = originalRequestAnimationFrame?.((time) => {
      pendingRafHandles.delete(handle);
      rafCompletedInWindow += 1;
      updateRafWindow(time);
      callback(time);
    });

    if (typeof handle === 'number') {
      pendingRafHandles.add(handle);
      return handle;
    }

    return 0;
  };

  window.cancelAnimationFrame = (handle: number) => {
    pendingRafHandles.delete(handle);
    originalCancelAnimationFrame?.(handle);
  };

  window.setInterval(() => updateRafWindow(performance.now()), 1000);
}

function describeOwner(element: Element | null) {
  if (!element) return 'unknown';

  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const className =
    typeof element.className === 'string'
      ? element.className
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 4)
          .join('.')
      : '';

  return `${tag}${id}${className ? `.${className}` : ''}`;
}

function inferCanvasRole(canvas: HTMLCanvasElement) {
  if (canvas.closest('.portfolio-bottom-navigation')) return 'liquid-nav';
  if (canvas.closest('#bonus')) return 'bonus-rock';
  if (canvas.closest('.shader-gradient-surface')) return 'shader-background';
  if (canvas.closest('.glass-container')) return 'liquid-glass';
  return 'canvas';
}

function collectCanvases(): PortfolioCanvasBaseline[] {
  return Array.from(document.querySelectorAll('canvas')).map((canvas, index) => {
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(0, Math.round(rect.width));
    const cssHeight = Math.max(0, Math.round(rect.height));
    const cssPixels = cssWidth * cssHeight;
    const bufferPixels = canvas.width * canvas.height;

    return {
      index,
      contextTypes: Array.from(contextTypesByCanvas.get(canvas) ?? ['untracked']),
      role: inferCanvasRole(canvas),
      cssWidth,
      cssHeight,
      bufferWidth: canvas.width,
      bufferHeight: canvas.height,
      cssPixels,
      bufferPixels,
      overdrawRatio: cssPixels > 0 ? round(bufferPixels / cssPixels, 2) : 0,
      visible: cssWidth > 0 && cssHeight > 0,
      owner: describeOwner(canvas.parentElement),
    };
  });
}

function collectShaderSurfaces(): PortfolioShaderSurfaceBaseline[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.shader-gradient-surface')).map((surface, index) => {
    const rect = surface.getBoundingClientRect();

    return {
      index,
      variant: surface.dataset.shaderVariant ?? 'unknown',
      canvasCount: surface.querySelectorAll('canvas').length,
      visible: rect.width > 0 && rect.height > 0,
      owner: describeOwner(surface.parentElement),
    };
  });
}

function collectContextCounts() {
  const counts: Record<string, number> = {};
  trackedContextRecords.forEach(({ canvas, type }) => {
    if (!canvas.isConnected) return;
    counts[type] = (counts[type] ?? 0) + 1;
  });
  return counts;
}

function collectResources() {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const totals = resources.reduce(
    (accumulator, resource) => {
      accumulator.transfer += resource.transferSize || 0;
      accumulator.encoded += resource.encodedBodySize || 0;
      accumulator.decoded += resource.decodedBodySize || 0;
      return accumulator;
    },
    { transfer: 0, encoded: 0, decoded: 0 },
  );

  return {
    count: resources.length,
    transferKb: round(totals.transfer / 1024, 1),
    encodedKb: round(totals.encoded / 1024, 1),
    decodedKb: round(totals.decoded / 1024, 1),
  };
}

function collectLiquidGlassMetrics(): PortfolioLiquidGlassMetrics | undefined {
  const nav = window.__portfolioLiquidGlassNav;
  if (!nav) return undefined;

  return {
    instances: nav.getInstanceCount?.(),
    refreshMode: nav.refreshMode,
    textureFps: nav.getTextureFps?.(),
    ...nav.getMetrics?.(),
  };
}

export function getPortfolioPerformanceBaselineSnapshot(): PortfolioPerformanceBaselineSnapshot {
  const canvases = collectCanvases();
  const visibleCanvases = canvases.filter((canvas) => canvas.visible);
  const bonusRockPreloadStatus = document
    .querySelector('[data-bonus-rock-preload-status]')
    ?.getAttribute('data-bonus-rock-preload-status');

  return {
    activeHash: window.location.hash || '#hero',
    canvasCount: canvases.length,
    visibleCanvasCount: visibleCanvases.length,
    totalCanvasPixels: canvases.reduce((total, canvas) => total + canvas.bufferPixels, 0),
    totalVisibleCanvasPixels: visibleCanvases.reduce((total, canvas) => total + canvas.bufferPixels, 0),
    contexts: collectContextCounts(),
    devicePixelRatio: round(window.devicePixelRatio || 1, 2),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    raf: {
      callbacksPerSecond: rafCallbacksPerSecond,
      scheduledPerSecond: rafScheduledPerSecond,
      pendingCallbacks: pendingRafHandles.size,
    },
    resources: collectResources(),
    bonusRockPreloadStatus: bonusRockPreloadStatus ?? undefined,
    shaderSurfaces: collectShaderSurfaces(),
    liquidGlass: collectLiquidGlassMetrics(),
    canvases,
  };
}

export function installPortfolioPerformanceBaseline() {
  if (installed || typeof window === 'undefined') return;

  installed = true;
  patchCanvasContexts();
  patchRequestAnimationFrame();

  window.__portfolioPerfBaseline = {
    installedAt: performance.now(),
    snapshot: getPortfolioPerformanceBaselineSnapshot,
  };
}
