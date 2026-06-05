import { useEffect, useMemo, useState } from 'react';
import {
  getPortfolioPerformanceBaselineSnapshot,
  type PortfolioPerformanceBaselineSnapshot,
} from '../performance/portfolioPerformanceBaseline';
import { evaluatePortfolioPerformanceBudgets } from '../performance/portfolioPerformanceBudgets';

type FrameWindow = {
  fps: number;
  avgMs: number;
  p95Ms: number;
  p99Ms: number;
  longFrames: number;
  sampleCount: number;
};

const emptyFrameWindow: FrameWindow = {
  fps: 0,
  avgMs: 0,
  p95Ms: 0,
  p99Ms: 0,
  longFrames: 0,
  sampleCount: 0,
};

function round(value: number, precision = 1) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function percentile(samples: number[], ratio: number) {
  if (!samples.length) return 0;

  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

function summarizeFrameWindow(samples: number[]): FrameWindow {
  if (!samples.length) return emptyFrameWindow;

  const total = samples.reduce((sum, sample) => sum + sample, 0);
  const avgMs = total / samples.length;

  return {
    fps: round(1000 / avgMs, 1),
    avgMs: round(avgMs, 1),
    p95Ms: round(percentile(samples, 0.95), 1),
    p99Ms: round(percentile(samples, 0.99), 1),
    longFrames: samples.filter((sample) => sample > 34).length,
    sampleCount: samples.length,
  };
}

function formatPixels(pixels: number) {
  if (pixels >= 1_000_000) return `${round(pixels / 1_000_000, 2)}MP`;
  if (pixels >= 1_000) return `${round(pixels / 1_000, 1)}K`;
  return String(pixels);
}

function formatMetric(value: number | undefined, suffix = '') {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'n/a';
  return `${round(value, 1)}${suffix}`;
}

function getWebGlContextCount(snapshot: PortfolioPerformanceBaselineSnapshot) {
  return (snapshot.contexts.webgl ?? 0) + (snapshot.contexts.webgl2 ?? 0);
}

function logSnapshot(snapshot: PortfolioPerformanceBaselineSnapshot, frames: FrameWindow) {
  const payload = {
    ...snapshot,
    frameWindow: frames,
  };

  console.info('[portfolio perf baseline]', payload);
  console.table(
    snapshot.canvases.map((canvas) => ({
      index: canvas.index,
      role: canvas.role,
      context: canvas.contextTypes.join(', '),
      css: `${canvas.cssWidth}x${canvas.cssHeight}`,
      buffer: `${canvas.bufferWidth}x${canvas.bufferHeight}`,
      pixels: formatPixels(canvas.bufferPixels),
      overdraw: canvas.overdrawRatio,
      owner: canvas.owner,
    })),
  );
  console.table(
    snapshot.shaderSurfaces.map((surface) => ({
      index: surface.index,
      variant: surface.variant,
      canvases: surface.canvasCount,
      visible: surface.visible,
      owner: surface.owner,
    })),
  );
}

export function PerformanceBaselinePanel({ activeSection }: { activeSection: string }) {
  const [frames, setFrames] = useState<FrameWindow>(emptyFrameWindow);
  const [snapshot, setSnapshot] = useState<PortfolioPerformanceBaselineSnapshot>(() =>
    getPortfolioPerformanceBaselineSnapshot(),
  );
  const shouldAutoLog = useMemo(() => new URLSearchParams(window.location.search).has('perfLog'), []);

  useEffect(() => {
    let frameId = 0;
    let lastFrame = performance.now();
    const samples: number[] = [];

    const tick = (now: number) => {
      const delta = now - lastFrame;
      lastFrame = now;

      if (delta > 0 && delta < 1000) {
        samples.push(delta);
        while (samples.length > 180) samples.shift();
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    const interval = window.setInterval(() => {
      setFrames(summarizeFrameWindow(samples));
      setSnapshot(getPortfolioPerformanceBaselineSnapshot());
    }, 500);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!shouldAutoLog) return undefined;

    const interval = window.setInterval(() => {
      logSnapshot(getPortfolioPerformanceBaselineSnapshot(), frames);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [frames, shouldAutoLog]);

  const liquidGlass = snapshot.liquidGlass;
  const snapshotMs = liquidGlass?.snapshot?.lastMs;
  const textureMs = liquidGlass?.textureRefresh?.lastMs;
  const textureUploadMs = liquidGlass?.textureUpload?.lastMs;
  const webglContexts = getWebGlContextCount(snapshot);
  const shaderVariants = Array.from(
    new Set(snapshot.shaderSurfaces.filter((surface) => surface.visible).map((surface) => surface.variant)),
  );
  const budgetResults = useMemo(() => evaluatePortfolioPerformanceBudgets(snapshot, frames), [frames, snapshot]);
  const failingBudgetCount = budgetResults.filter((result) => !result.passed).length;

  return (
    <aside className="portfolio-perf-panel" aria-label="Portfolio performance baseline">
      <div className="portfolio-perf-panel__header">
        <div>
          <p className="portfolio-perf-panel__eyebrow">Phase 1 baseline</p>
          <h2>Performance</h2>
        </div>
        <button type="button" onClick={() => logSnapshot(snapshot, frames)}>
          Log
        </button>
      </div>

      <dl className="portfolio-perf-panel__grid">
        <div>
          <dt>FPS</dt>
          <dd>{frames.fps}</dd>
        </div>
        <div>
          <dt>p95</dt>
          <dd>{formatMetric(frames.p95Ms, 'ms')}</dd>
        </div>
        <div>
          <dt>Long</dt>
          <dd>{frames.longFrames}</dd>
        </div>
        <div>
          <dt>DPR</dt>
          <dd>{snapshot.devicePixelRatio}</dd>
        </div>
        <div>
          <dt>Canvas</dt>
          <dd>
            {snapshot.visibleCanvasCount}/{snapshot.canvasCount}
          </dd>
        </div>
        <div>
          <dt>WebGL</dt>
          <dd>{webglContexts}</dd>
        </div>
        <div>
          <dt>Pixels</dt>
          <dd>{formatPixels(snapshot.totalVisibleCanvasPixels)}</dd>
        </div>
        <div>
          <dt>RAF/s</dt>
          <dd>{snapshot.raf.callbacksPerSecond}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{failingBudgetCount ? `${failingBudgetCount} fail` : 'pass'}</dd>
        </div>
      </dl>

      <div className="portfolio-perf-panel__section">
        <p>
          <span>Section</span>
          <strong>{activeSection}</strong>
        </p>
        <p>
          <span>Viewport</span>
          <strong>
            {snapshot.viewport.width}x{snapshot.viewport.height}
          </strong>
        </p>
        <p>
          <span>Resources</span>
          <strong>{formatMetric(snapshot.resources.transferKb, 'KB')}</strong>
        </p>
        <p>
          <span>Rock preload</span>
          <strong>{snapshot.bonusRockPreloadStatus ?? 'n/a'}</strong>
        </p>
        <p>
          <span>Shader variant</span>
          <strong>{shaderVariants.length ? shaderVariants.join(', ') : 'n/a'}</strong>
        </p>
      </div>

      <div className="portfolio-perf-panel__section">
        <p>
          <span>Glass instances</span>
          <strong>{liquidGlass?.instances ?? 'n/a'}</strong>
        </p>
        <p>
          <span>Glass texture FPS</span>
          <strong>{formatMetric(liquidGlass?.textureFps)}</strong>
        </p>
        <p>
          <span>Snapshot draw</span>
          <strong>{formatMetric(snapshotMs, 'ms')}</strong>
        </p>
        <p>
          <span>Texture refresh</span>
          <strong>{formatMetric(textureMs, 'ms')}</strong>
        </p>
        <p>
          <span>Upload</span>
          <strong>{formatMetric(textureUploadMs, 'ms')}</strong>
        </p>
        <p>
          <span>Nested render FPS</span>
          <strong>{formatMetric(liquidGlass?.nestedRenderFps)}</strong>
        </p>
      </div>

      <div className="portfolio-perf-panel__budgets" aria-label="Performance budgets">
        {budgetResults.map((result) => (
          <p
            key={result.id}
            className={result.passed ? 'portfolio-perf-panel__budget is-pass' : 'portfolio-perf-panel__budget is-fail'}
          >
            <span>{result.passed ? 'pass' : 'fail'}</span>
            <strong>{result.label}</strong>
            <em>
              {result.actual} / {result.budget}
            </em>
          </p>
        ))}
      </div>

      <div className="portfolio-perf-panel__canvas-list" aria-label="Canvas inventory">
        {snapshot.canvases.map((canvas) => (
          <p key={`${canvas.index}-${canvas.role}-${canvas.bufferWidth}`}>
            <span>{canvas.index}</span>
            <strong>{canvas.role}</strong>
            <em>
              {canvas.contextTypes.join(', ')} · {canvas.bufferWidth}x{canvas.bufferHeight}
            </em>
          </p>
        ))}
      </div>
    </aside>
  );
}
