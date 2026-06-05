import { useEffect, useRef } from 'react';
import profileImageUrl from '../assets/ramin-profile-nav.webp';
import containerSource from '../../react libraries/liquid-glass-js-main/container.js?raw';
import buttonSource from '../../react libraries/liquid-glass-js-main/button.js?raw';

type NavLink = {
  label: string;
  menuLabel?: string;
  target: string;
  icon?: NavIconName;
};

type LiquidGlassJsNavShellProps = {
  active: string;
  navLinks: readonly NavLink[];
  onNavigate: (target: string) => void;
  onNavIntent?: (target: string) => void;
  onCta: () => void;
  logoLabel?: string;
  ctaLabel?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical' | 'bottom';
  showLogo?: boolean;
  showCta?: boolean;
  navLabel?: string;
};

type LiquidGlassJsFloatingButtonProps = {
  label: string;
  ariaLabel?: string;
  className?: string;
  onClick: () => void;
};

type GlassRefs = {
  gl?: WebGLRenderingContext;
  texture?: WebGLTexture;
  positionBuffer?: WebGLBuffer;
  texcoordBuffer?: WebGLBuffer;
  resolutionLoc?: WebGLUniformLocation;
  textureSizeLoc?: WebGLUniformLocation;
  pageHeightLoc?: WebGLUniformLocation;
  viewportHeightLoc?: WebGLUniformLocation;
  tintOpacityLoc?: WebGLUniformLocation;
  scrollYLoc?: WebGLUniformLocation;
  containerPositionLoc?: WebGLUniformLocation;
  buttonPositionLoc?: WebGLUniformLocation;
  containerSizeLoc?: WebGLUniformLocation;
  borderRadiusLoc?: WebGLUniformLocation;
  timeLoc?: WebGLUniformLocation;
};

type LiquidGlassInstance = {
  element: HTMLDivElement;
  canvas: HTMLCanvasElement;
  gl?: WebGLRenderingContext;
  children?: LiquidGlassInstance[];
  gl_refs: GlassRefs;
  isNestedGlass?: boolean;
  parent?: LiquidGlassInstance | null;
  render?: () => void;
  getPosition: () => { x: number; y: number };
  addChild: (child: LiquidGlassInstance) => void;
  updateSizeFromDOM: () => void;
  initWebGL: () => void;
  setupShader: (image: TexImageSource) => void;
  capturePageSnapshot?: () => void;
  textElement?: HTMLDivElement;
  tintOpacity: number;
  webglInitialized: boolean;
  __portfolioDestroyed?: boolean;
  __portfolioRaf?: number;
  __portfolioScrollHandler?: () => void;
  __portfolioTextureWidth?: number;
  __portfolioTextureHeight?: number;
};

type LiquidGlassContainerConstructor = {
  new (options?: { borderRadius?: number; tintOpacity?: number; type?: 'rounded' | 'circle' | 'pill' }): LiquidGlassInstance;
  instances: LiquidGlassInstance[];
  pageSnapshot: HTMLCanvasElement | null;
  isCapturing: boolean;
  waitingForSnapshot: LiquidGlassInstance[];
  prototype: LiquidGlassInstance & {
    startRenderLoop: () => void;
  };
};

type LiquidGlassButtonConstructor = {
  new (options?: {
    text?: string;
    size?: string | number;
    type?: 'rounded' | 'circle' | 'pill';
    tintOpacity?: number;
    warp?: boolean;
    onClick?: (text: string) => void;
  }): LiquidGlassInstance;
  prototype: LiquidGlassInstance & {
    startNestedRenderLoop: () => void;
  };
};

type LiquidGlassLibrary = {
  Container: LiquidGlassContainerConstructor;
  Button: LiquidGlassButtonConstructor;
};

type NavIconName = 'intro' | 'work' | 'projects' | 'thoughts' | 'contact' | 'bonus' | 'ai';

type LiquidGlassWindow = Window &
  typeof globalThis & {
    glassControls?: {
      edgeIntensity: number;
      rimIntensity: number;
      baseIntensity: number;
      edgeDistance: number;
      rimDistance: number;
      baseDistance: number;
      cornerBoost: number;
      rippleEffect: number;
      blurRadius: number;
      tintOpacity: number;
      warp: boolean;
    };
    __portfolioLiquidGlassNav?: {
      instances: LiquidGlassInstance[];
      getInstanceCount: () => number;
      refreshMode: 'adaptive-raf';
      getTextureFps: () => number;
      getMetrics: () => LiquidGlassNavPerfSnapshot;
    };
  };

type MetricSeries = {
  count: number;
  totalMs: number;
  lastMs: number;
  maxMs: number;
  lastAt: number;
};

type MetricSeriesSnapshot = {
  count: number;
  lastMs: number;
  avgMs: number;
  maxMs: number;
  lastAt: number;
};

type LiquidGlassNavPerfSnapshot = {
  instances: number;
  refreshMode: 'adaptive-raf';
  textureFps: number;
  snapshot: MetricSeriesSnapshot;
  textureRefresh: MetricSeriesSnapshot;
  textureUpload: MetricSeriesSnapshot;
  nestedRenderFps: number;
};

type NavInstances = {
  all: LiquidGlassInstance[];
  buttons: Array<{ instance: LiquidGlassInstance; target?: string; tintOpacity: number }>;
  container: LiquidGlassInstance;
};

let cachedLibrary: LiquidGlassLibrary | null = null;
let reusableSnapshotCanvas: HTMLCanvasElement | null = null;
let reusableSnapshotContext: CanvasRenderingContext2D | null = null;

const liquidGlassPerf = {
  snapshot: { count: 0, totalMs: 0, lastMs: 0, maxMs: 0, lastAt: 0 },
  textureRefresh: { count: 0, totalMs: 0, lastMs: 0, maxMs: 0, lastAt: 0 },
  textureUpload: { count: 0, totalMs: 0, lastMs: 0, maxMs: 0, lastAt: 0 },
  nestedRenderFrames: 0,
  nestedRenderFps: 0,
  nestedRenderLastSample: typeof performance === 'undefined' ? 0 : performance.now(),
};

const SNAPSHOT_MAX_HEIGHT = 10000;
const GLASS_ACTIVE_REFRESH_MS = 1000 / 24;
const GLASS_IDLE_REFRESH_MS = 1000 / 6;
const GLASS_FLOATING_REFRESH_MS = 1000 / 4;
const SNAPSHOT_OVERSCAN = 220;
const SNAPSHOT_ELEMENT_LIMIT = 520;
const SNAPSHOT_TEXT_LIMIT = 380;
const GLASS_MAX_DPR = 1.65;
const SNAPSHOT_IGNORED_SELECTOR = [
  '.glass-container',
  '.glass-button',
  '.glass-button-text',
  '.liquid-glass-js-nav-host',
  'canvas',
  'script',
  'style',
  'noscript',
].join(',');

function roundMetric(value: number) {
  return Math.round(value * 10) / 10;
}

function recordSeriesMetric(series: MetricSeries, startedAt: number) {
  const duration = performance.now() - startedAt;
  series.count += 1;
  series.totalMs += duration;
  series.lastMs = duration;
  series.maxMs = Math.max(series.maxMs, duration);
  series.lastAt = performance.now();
}

function snapshotSeries(series: MetricSeries): MetricSeriesSnapshot {
  return {
    count: series.count,
    lastMs: roundMetric(series.lastMs),
    avgMs: roundMetric(series.count ? series.totalMs / series.count : 0),
    maxMs: roundMetric(series.maxMs),
    lastAt: roundMetric(series.lastAt),
  };
}

function recordNestedRenderFrame() {
  const now = performance.now();
  liquidGlassPerf.nestedRenderFrames += 1;

  const elapsed = now - liquidGlassPerf.nestedRenderLastSample;
  if (elapsed < 500) return;

  liquidGlassPerf.nestedRenderFps = roundMetric((liquidGlassPerf.nestedRenderFrames * 1000) / elapsed);
  liquidGlassPerf.nestedRenderFrames = 0;
  liquidGlassPerf.nestedRenderLastSample = now;
}

function getLiquidGlassPerfSnapshot(
  instances: LiquidGlassInstance[],
  textureFps: number,
): LiquidGlassNavPerfSnapshot {
  return {
    instances: instances.filter((instance) => !instance.__portfolioDestroyed).length,
    refreshMode: 'adaptive-raf',
    textureFps: roundMetric(textureFps),
    snapshot: snapshotSeries(liquidGlassPerf.snapshot),
    textureRefresh: snapshotSeries(liquidGlassPerf.textureRefresh),
    textureUpload: snapshotSeries(liquidGlassPerf.textureUpload),
    nestedRenderFps: liquidGlassPerf.nestedRenderFps,
  };
}

const navIconPaths: Record<NavIconName, readonly string[]> = {
  intro: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h5v-6h4v6h5V9.5'],
  work: ['M9 6V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1', 'M3 7h18v13H3z', 'M3 12h18'],
  projects: ['M12 3 3 8l9 5 9-5-9-5Z', 'M3 13l9 5 9-5', 'M3 18l9 5 9-5'],
  thoughts: ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z', 'M8 7h8', 'M8 11h7'],
  contact: ['M4 6h16v12H4z', 'm4 7 8 6 8-6'],
  bonus: ['M20 12v8H4v-8', 'M3 8h18v4H3z', 'M12 8v12', 'M12 8H8.5A2.5 2.5 0 1 1 12 5.5V8Z', 'M12 8h3.5A2.5 2.5 0 1 0 12 5.5V8Z'],
  ai: ['M12 3l1.15 4.1L17 8.25l-3.85 1.15L12 13.5l-1.15-4.1L7 8.25l3.85-1.15L12 3Z', 'M5 14l.75 2.2L8 17l-2.25.8L5 20l-.75-2.2L2 17l2.25-.8L5 14Z', 'M18 14l.75 2.2L21 17l-2.25.8L18 20l-.75-2.2L15 17l2.25-.8L18 14Z'],
};

function getGlassDpr() {
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), GLASS_MAX_DPR);
}

function getCssRect(element: HTMLElement | HTMLCanvasElement) {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: Math.max(rect.width, 1),
    height: Math.max(rect.height, 1),
  };
}

function syncGlassUniforms(instance: LiquidGlassInstance) {
  const gl = instance.gl_refs.gl;
  if (!gl) return;

  const dpr = getGlassDpr();
  if (instance.gl_refs.resolutionLoc) {
    gl.uniform2f(instance.gl_refs.resolutionLoc, instance.canvas.width, instance.canvas.height);
  }
  if (instance.gl_refs.borderRadiusLoc) {
    gl.uniform1f(instance.gl_refs.borderRadiusLoc, instance.borderRadius * dpr);
  }
  if (instance.gl_refs.containerSizeLoc && instance.parent) {
    gl.uniform2f(instance.gl_refs.containerSizeLoc, instance.parent.width, instance.parent.height);
  }
}

function syncGlassTime(instance: LiquidGlassInstance, timestamp = performance.now()) {
  const gl = instance.gl_refs.gl;
  if (!gl || !instance.gl_refs.timeLoc) return;

  gl.uniform1f(instance.gl_refs.timeLoc, timestamp * 0.001);
}

function createNavIcon(icon: NavIconName) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('portfolio-liquid-nav-icon');

  navIconPaths[icon].forEach((pathData) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '1.9');
    svg.appendChild(path);
  });

  return svg;
}

function loadLiquidGlassLibrary() {
  if (cachedLibrary) return cachedLibrary;

  const patchedContainerSource = containerSource
    .replace(
      `    this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true })`,
      `    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      desynchronized: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    })`,
    )
    .replace(
      `      uniform float u_rippleEffect;
      uniform float u_tintOpacity;`,
      `      uniform float u_rippleEffect;
      uniform float u_tintOpacity;
      uniform float u_time;`,
    )
    .replace(
      `        float rippleEffect = sin(distFromEdge * 25.0) * u_rippleEffect * rimIntensity;`,
      `        float rippleEffect = sin(distFromEdge * 25.0 - u_time * 2.4) * u_rippleEffect * rimIntensity;`,
    )
    .replace(
      `        float caustic = pow(1.0 - clamp(abs(coord.y - 0.18) * 5.0, 0.0, 1.0), 2.0) * glassEdge;
        float grain = fract(sin(dot(coord * u_resolution + u_containerPosition, vec2(12.9898, 78.233))) * 43758.5453);`,
      `        float causticBand = 0.18 + sin(u_time * 0.75 + coord.x * 3.14159) * 0.018;
        float caustic = pow(1.0 - clamp(abs(coord.y - causticBand) * 5.0, 0.0, 1.0), 2.0) * glassEdge;
        float grain = fract(sin(dot(coord * u_resolution + u_containerPosition + u_time * 7.0, vec2(12.9898, 78.233))) * 43758.5453);`,
    )
    .replace(
      `    const tintOpacityLoc = gl.getUniformLocation(program, 'u_tintOpacity')
    const imageLoc = gl.getUniformLocation(program, 'u_image')`,
      `    const tintOpacityLoc = gl.getUniformLocation(program, 'u_tintOpacity')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const imageLoc = gl.getUniformLocation(program, 'u_image')`,
    )
    .replace(
      `      rippleEffectLoc,
      tintOpacityLoc,
      imageLoc,`,
      `      rippleEffectLoc,
      tintOpacityLoc,
      timeLoc,
      imageLoc,`,
    )
    .replace(
      `    gl.uniform1f(tintOpacityLoc, this.tintOpacity)`,
      `    gl.uniform1f(tintOpacityLoc, this.tintOpacity)
    if (timeLoc) gl.uniform1f(timeLoc, 0)`,
    )
    .replace(
      `        color.rgb -= vec3(0.06, 0.09, 0.12) * innerShadow * 0.16;`,
      `        color.rgb -= vec3(0.045, 0.065, 0.09) * innerShadow * 0.055;`,
    )
    .replace(
      `        vec3 finalTinted = mix(color.rgb, sampledGradient, u_tintOpacity * 0.16);
        color = vec4(finalTinted, color.a);`,
      `        vec3 finalTinted = mix(color.rgb, sampledGradient, u_tintOpacity * 0.16);
        float luminance = dot(finalTinted, vec3(0.2126, 0.7152, 0.0722));
        float lift = smoothstep(0.7, 0.18, luminance) * u_tintOpacity * 1.06;
        finalTinted = mix(finalTinted, vec3(0.9, 0.95, 1.0), clamp(lift, 0.0, 0.72));
        color = vec4(finalTinted, color.a);`,
    )
    .replace(
      `        gl_FragColor = vec4(color.rgb, mask);`,
      `        float innerRim = (1.0 - smoothstep(0.0, 9.0, abs(maskDistance))) * mask;
        float topGlint = innerRim * pow(max(dot(shapeNormal, normalize(vec2(-0.32, -0.95))), 0.0), 1.28);
        float lowerPrism = innerRim * pow(max(dot(shapeNormal, normalize(vec2(0.52, 0.86))), 0.0), 1.42);
        float sidePrism = innerRim * pow(abs(dot(shapeNormal, normalize(vec2(0.98, -0.18)))), 1.7);
        vec3 rimLight =
          vec3(1.0, 0.98, 0.92) * topGlint * 0.48 +
          vec3(0.58, 0.82, 1.0) * sidePrism * 0.16 +
          vec3(0.68, 0.9, 1.0) * lowerPrism * 0.12;
        color.rgb = clamp(color.rgb + rimLight, 0.0, 1.0);

        gl_FragColor = vec4(color.rgb, min(mask + innerRim * 0.08, 1.0));`,
    );

  const patchedButtonSource = buttonSource
    .replace(
      `      uniform float u_rippleEffect;
      uniform float u_tintOpacity;`,
      `      uniform float u_rippleEffect;
      uniform float u_tintOpacity;
      uniform float u_time;`,
    )
    .replace(
      `        float rippleEffect = sin(distFromEdge * 30.0) * u_rippleEffect * rimIntensity;`,
      `        float rippleEffect = sin(distFromEdge * 30.0 - u_time * 2.8) * u_rippleEffect * rimIntensity;`,
    )
    .replace(
      `        float caustic = pow(1.0 - clamp(abs(coord.y - 0.2) * 5.4, 0.0, 1.0), 2.0) * glassEdge;
        float grain = fract(sin(dot(coord * u_resolution + u_buttonPosition, vec2(15.733, 91.417))) * 24634.6345);`,
      `        float causticBand = 0.2 + sin(u_time * 0.9 + coord.x * 3.14159) * 0.02;
        float caustic = pow(1.0 - clamp(abs(coord.y - causticBand) * 5.4, 0.0, 1.0), 2.0) * glassEdge;
        float grain = fract(sin(dot(coord * u_resolution + u_buttonPosition + u_time * 8.0, vec2(15.733, 91.417))) * 24634.6345);`,
    )
    .replace(
      `    const tintOpacityLoc = gl.getUniformLocation(program, 'u_tintOpacity')
    const imageLoc = gl.getUniformLocation(program, 'u_image')`,
      `    const tintOpacityLoc = gl.getUniformLocation(program, 'u_tintOpacity')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const imageLoc = gl.getUniformLocation(program, 'u_image')`,
    )
    .replace(
      `      rippleEffectLoc,
      tintOpacityLoc,
      imageLoc,`,
      `      rippleEffectLoc,
      tintOpacityLoc,
      timeLoc,
      imageLoc,`,
    )
    .replace(
      `    gl.uniform1f(tintOpacityLoc, this.tintOpacity)`,
      `    gl.uniform1f(tintOpacityLoc, this.tintOpacity)
    if (timeLoc) gl.uniform1f(timeLoc, 0)`,
    )
    .replace(
      `        vec2 viewportCenter = u_buttonPosition;
        float topY = max(0.0, (viewportCenter.y - buttonSize.y * 0.4) / containerSize.y);
        float midY = viewportCenter.y / containerSize.y;
        float bottomY = min(1.0, (viewportCenter.y + buttonSize.y * 0.4) / containerSize.y);`,
      `        float gradientRadius = buttonSize.y * 0.4 / containerSize.y;
        float topY = clamp(baseTextureCoord.y - gradientRadius, 0.0, 1.0);
        float midY = clamp(baseTextureCoord.y, 0.0, 1.0);
        float bottomY = clamp(baseTextureCoord.y + gradientRadius, 0.0, 1.0);`,
    )
    .replace(
      `        color.rgb -= vec3(0.06, 0.09, 0.12) * innerShadow * 0.14;`,
      `        color.rgb -= vec3(0.045, 0.065, 0.09) * innerShadow * 0.045;`,
    )
    .replace(
      `        vec3 finalTinted = secondTinted * buttonGradient;`,
      `        vec3 finalTinted = secondTinted * buttonGradient;
        float buttonLuminance = dot(finalTinted, vec3(0.2126, 0.7152, 0.0722));
        float buttonLift = smoothstep(0.68, 0.18, buttonLuminance) * u_tintOpacity * 1.08;
        finalTinted = mix(finalTinted, vec3(0.9, 0.95, 1.0), clamp(buttonLift, 0.0, 0.74));`,
    )
    .replace(
      `        gl_FragColor = vec4(finalTinted, mask);`,
      `        float buttonInnerRim = (1.0 - smoothstep(0.0, 7.0, abs(maskDistance))) * mask;
        float buttonTopGlint = buttonInnerRim * pow(max(dot(shapeNormal, normalize(vec2(-0.32, -0.95))), 0.0), 1.18);
        float buttonSidePrism = buttonInnerRim * pow(abs(dot(shapeNormal, normalize(vec2(0.98, -0.18)))), 1.55);
        float buttonLowerPrism = buttonInnerRim * pow(max(dot(shapeNormal, normalize(vec2(0.52, 0.86))), 0.0), 1.36);
        vec3 buttonRimLight =
          vec3(1.0, 0.99, 0.94) * buttonTopGlint * 0.58 +
          vec3(0.55, 0.82, 1.0) * buttonSidePrism * 0.2 +
          vec3(0.72, 0.92, 1.0) * buttonLowerPrism * 0.12;
        finalTinted = clamp(finalTinted + buttonRimLight, 0.0, 1.0);

        gl_FragColor = vec4(finalTinted, min(mask + buttonInnerRim * 0.12, 1.0));`,
    );

  cachedLibrary = new Function(
    `${patchedContainerSource}\n${patchedButtonSource}\nreturn { Container, Button };`,
  )() as LiquidGlassLibrary;

  patchLiquidGlassLibrary(cachedLibrary);
  return cachedLibrary;
}

function reportGlassError(context: string, error: unknown) {
  console.warn(`[portfolio liquid glass] ${context}`, error);
}

function prepareSharedSnapshotState(Container: LiquidGlassContainerConstructor) {
  Container.waitingForSnapshot = Container.waitingForSnapshot.filter((instance) => !instance.__portfolioDestroyed);
  if (!Container.pageSnapshot) {
    Container.isCapturing = true;
  }
}

function patchLiquidGlassLibrary({ Container, Button }: LiquidGlassLibrary) {
  Container.prototype.getPosition = function getPosition() {
    const rect = getCssRect(this.canvas);
    const dpr = getGlassDpr();
    return {
      x: (rect.left + rect.width / 2) * dpr,
      y: (rect.top + rect.height / 2) * dpr,
    };
  };

  Container.prototype.updateSizeFromDOM = function updateSizeFromDOM() {
    window.requestAnimationFrame(() => {
      if (this.__portfolioDestroyed || !this.element || !this.canvas) return;

      const dpr = getGlassDpr();
      const rect = getCssRect(this.element);
      let cssWidth = Math.ceil(rect.width);
      let cssHeight = Math.ceil(rect.height);

      if (this.type === 'circle') {
        const cssSize = Math.max(cssWidth, cssHeight);
        cssWidth = cssSize;
        cssHeight = cssSize;
        this.borderRadius = cssSize / 2;
        this.element.style.width = `${cssSize}px`;
        this.element.style.height = `${cssSize}px`;
        this.element.style.borderRadius = `${this.borderRadius}px`;
      } else if (this.type === 'pill') {
        this.borderRadius = cssHeight / 2;
        this.element.style.borderRadius = `${this.borderRadius}px`;
      }

      const pixelWidth = Math.max(Math.ceil(cssWidth * dpr), 1);
      const pixelHeight = Math.max(Math.ceil(cssHeight * dpr), 1);

      if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
        this.canvas.width = pixelWidth;
        this.canvas.height = pixelHeight;
        this.canvas.style.width = `${cssWidth}px`;
        this.canvas.style.height = `${cssHeight}px`;
        this.canvas.style.borderRadius = `${this.borderRadius}px`;
      }

      this.width = pixelWidth;
      this.height = pixelHeight;
      syncGlassUniforms(this);

      if (this.gl_refs.gl) {
        this.gl_refs.gl.viewport(0, 0, pixelWidth, pixelHeight);
      }

      this.children?.forEach((child) => {
        child.updateSizeFromDOM();
        if (child.gl_refs.gl && child.gl_refs.texture && child.isNestedGlass) {
          const gl = child.gl_refs.gl;
          gl.bindTexture(gl.TEXTURE_2D, child.gl_refs.texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pixelWidth, pixelHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          if (child.gl_refs.textureSizeLoc) gl.uniform2f(child.gl_refs.textureSizeLoc, pixelWidth, pixelHeight);
          syncGlassUniforms(child);
        }
      });
    });
  };

  Container.prototype.initWebGL = function initWebGL() {
    if (!Container.pageSnapshot || !this.gl || this.__portfolioDestroyed) return;

    try {
      this.setupShader(Container.pageSnapshot);
      syncGlassUniforms(this);
      this.webglInitialized = true;
    } catch (error) {
      reportGlassError('container initWebGL failed', error);
    }
  };

  Container.prototype.capturePageSnapshot = function capturePageSnapshot() {
    Container.isCapturing = true;

    const snapshot = drawPortfolioSnapshot();
    if (!snapshot) {
      Container.isCapturing = false;
      return;
    }

    Container.pageSnapshot = snapshot;
    Container.isCapturing = false;

    const waiting = Container.waitingForSnapshot.slice();
    Container.waitingForSnapshot = [];
    waiting.forEach((instance) => {
      if (!instance.__portfolioDestroyed && !instance.webglInitialized) {
        try {
          instance.initWebGL();
        } catch (error) {
          reportGlassError('waiting instance init failed', error);
        }
      }
    });
  };

  Container.prototype.startRenderLoop = function startRenderLoop() {
    const render = () => {
      if (this.__portfolioDestroyed || !this.gl_refs.gl) return;

      try {
        const gl = this.gl_refs.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (this.gl_refs.scrollYLoc) gl.uniform1f(this.gl_refs.scrollYLoc, 0);

        if (this.gl_refs.containerPositionLoc) {
          const position = this.getPosition();
          gl.uniform2f(this.gl_refs.containerPositionLoc, position.x, position.y);
        }

        syncGlassUniforms(this);
        syncGlassTime(this);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        renderNestedChildren(this);
      } catch (error) {
        reportGlassError('container render failed', error);
      }
    };

    render();
    this.__portfolioScrollHandler = render;
    window.addEventListener('scroll', render, { passive: true });
    this.render = render;
  };

  Button.prototype.startNestedRenderLoop = function startNestedRenderLoop() {
    const render = () => {
      if (this.__portfolioDestroyed || this.parent?.__portfolioDestroyed || !this.gl_refs.gl || !this.parent) {
        return;
      }

      try {
        const gl = this.gl_refs.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.gl_refs.texture ?? null);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.parent.canvas);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (this.gl_refs.buttonPositionLoc) {
          const buttonPosition = this.getPosition();
          gl.uniform2f(this.gl_refs.buttonPositionLoc, buttonPosition.x, buttonPosition.y);
        }

        if (this.gl_refs.containerPositionLoc) {
          const containerPosition = this.parent.getPosition();
          gl.uniform2f(this.gl_refs.containerPositionLoc, containerPosition.x, containerPosition.y);
        }

        syncGlassUniforms(this);
        syncGlassTime(this);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        recordNestedRenderFrame();
      } catch (error) {
        reportGlassError('nested button render failed', error);
        return;
      }
    };

    this.render = render;
    render();
  };
}

function renderNestedChildren(parent: LiquidGlassInstance) {
  parent.children?.forEach((child) => {
    if (!child.__portfolioDestroyed && child.isNestedGlass) {
      try {
        child.render?.();
      } catch (error) {
        reportGlassError('nested child render failed', error);
      }
    }
  });
}

function getShaderCanvas() {
  const host = document.getElementById('gradientCanvas');
  if (host instanceof HTMLCanvasElement) return host;

  const nested = host?.querySelector('canvas');
  if (nested instanceof HTMLCanvasElement) return nested;

  const markedCanvas = document.querySelector<HTMLCanvasElement>('[data-glass-media] canvas, canvas[data-glass-media]');
  if (markedCanvas) return markedCanvas;

  return Array.from(document.querySelectorAll<HTMLCanvasElement>('canvas')).find(
    (canvas) =>
      !canvas.closest('.glass-container') &&
      canvas.width >= window.innerWidth * 0.5 &&
      canvas.height >= window.innerHeight * 0.5,
  );
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function colorAlpha(color: string) {
  if (!color || color === 'transparent') return 0;

  const rgba = color.match(/rgba?\((.+)\)/i);
  if (!rgba) return 1;

  const [, body] = rgba;
  const slashParts = body.split('/');
  const parts = slashParts[0].trim().split(/[,\s]+/).filter(Boolean);
  const explicitAlpha = slashParts[1] ?? parts[3];

  if (!explicitAlpha) return 1;

  const normalized = explicitAlpha.trim();
  if (normalized.endsWith('%')) return Math.max(0, Math.min(parseFloat(normalized) / 100, 1));

  const alpha = parseFloat(normalized);
  return Number.isFinite(alpha) ? Math.max(0, Math.min(alpha, 1)) : 1;
}

function resolveElementRadius(element: HTMLElement, style: CSSStyleDeclaration) {
  const rect = element.getBoundingClientRect();
  const radius = parseFloat(style.borderTopLeftRadius);

  if (Number.isFinite(radius)) return Math.min(radius, rect.width / 2, rect.height / 2);

  if (style.borderTopLeftRadius.includes('%')) {
    return Math.min(rect.width, rect.height) * (parseFloat(style.borderTopLeftRadius) / 100);
  }

  return 0;
}

function isElementInSnapshot(element: HTMLElement, scrollY: number, snapshotHeight: number) {
  const rect = element.getBoundingClientRect();
  const y = rect.top + scrollY;

  return rect.width > 0.5 && rect.height > 0.5 && y + rect.height >= -SNAPSHOT_OVERSCAN && y <= snapshotHeight + SNAPSHOT_OVERSCAN;
}

function hasRenderableSurface(element: HTMLElement, style: CSSStyleDeclaration) {
  return (
    colorAlpha(style.backgroundColor) > 0.025 ||
    style.backgroundImage !== 'none' ||
    colorAlpha(style.borderTopColor) > 0.08 ||
    element.classList.contains('liquid-glass') ||
    element.classList.contains('liquid-glass-strong') ||
    element.classList.contains('portfolio-stage')
  );
}

function canDrawMediaSource(src: string) {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return true;

  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function drawElementSurface(
  ctx: CanvasRenderingContext2D,
  element: HTMLElement,
  scrollY: number,
  snapshotHeight: number,
) {
  if (!isElementInSnapshot(element, scrollY, snapshotHeight)) return;

  const style = window.getComputedStyle(element);
  if (!hasRenderableSurface(element, style)) return;

  const rect = element.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top + scrollY;
  const radius = resolveElementRadius(element, style);
  const bgAlpha = colorAlpha(style.backgroundColor);
  const borderAlpha = colorAlpha(style.borderTopColor);
  const isGlass = element.classList.contains('liquid-glass') || element.classList.contains('liquid-glass-strong');

  ctx.save();
  roundedRectPath(ctx, x, y, rect.width, rect.height, radius);
  ctx.clip();

  if (style.backgroundImage !== 'none' || isGlass) {
    const wash = ctx.createLinearGradient(x, y, x + rect.width, y + rect.height);
    wash.addColorStop(0, isGlass ? 'rgba(255, 255, 255, 0.5)' : 'rgba(250, 253, 255, 0.36)');
    wash.addColorStop(0.5, isGlass ? 'rgba(232, 242, 251, 0.2)' : 'rgba(181, 204, 225, 0.14)');
    wash.addColorStop(1, isGlass ? 'rgba(112, 159, 198, 0.18)' : 'rgba(111, 148, 178, 0.2)');
    ctx.fillStyle = wash;
    ctx.fillRect(x, y, rect.width, rect.height);
  }

  if (bgAlpha > 0.025) {
    ctx.globalAlpha = Math.min(bgAlpha * 1.2, 0.9);
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(x, y, rect.width, rect.height);
    ctx.globalAlpha = 1;
  }

  if (borderAlpha > 0.08) {
    ctx.strokeStyle = style.borderTopColor;
    ctx.globalAlpha = Math.min(borderAlpha * 1.45, 0.85);
    ctx.lineWidth = Math.max(parseFloat(style.borderTopWidth) || 1, 1);
    roundedRectPath(ctx, x + 0.5, y + 0.5, Math.max(rect.width - 1, 0), Math.max(rect.height - 1, 0), Math.max(radius - 0.5, 0));
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawMediaElement(
  ctx: CanvasRenderingContext2D,
  element: HTMLElement,
  scrollY: number,
  snapshotHeight: number,
) {
  if (!isElementInSnapshot(element, scrollY, snapshotHeight)) return;

  const image = element instanceof HTMLImageElement ? element : null;
  const video = element instanceof HTMLVideoElement ? element : null;
  if (!image && !video) return;

  const source = image?.currentSrc || image?.src || video?.currentSrc || video?.src || '';
  if (!canDrawMediaSource(source)) return;
  if (image && (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0)) return;
  if (video && video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top + scrollY;
  const radius = resolveElementRadius(element, style);

  ctx.save();
  roundedRectPath(ctx, x, y, rect.width, rect.height, radius);
  ctx.clip();

  try {
    ctx.drawImage(element as CanvasImageSource, x, y, rect.width, rect.height);
  } catch {
    // External or not-yet-ready media should not block the WebGL snapshot.
  }

  ctx.restore();
}

function drawTextNode(
  ctx: CanvasRenderingContext2D,
  node: Text,
  scrollY: number,
  snapshotHeight: number,
) {
  const text = node.textContent?.replace(/\s+/g, ' ').trim();
  if (!text || !node.parentElement) return;
  if (node.parentElement.closest(SNAPSHOT_IGNORED_SELECTOR)) return;

  const style = window.getComputedStyle(node.parentElement);
  const alpha = colorAlpha(style.color);
  if (alpha < 0.16 || style.visibility === 'hidden' || style.display === 'none') return;

  const range = document.createRange();
  range.selectNodeContents(node);
  const rects = Array.from(range.getClientRects()).slice(0, 8);
  if (!rects.length) return;

  const fontSize = parseFloat(style.fontSize) || 14;

  ctx.save();
  ctx.fillStyle = style.color;
  ctx.globalAlpha = Math.min(alpha * 0.52, 0.75);

  rects.forEach((rect) => {
    const y = rect.top + scrollY;
    if (rect.width <= 0.5 || rect.height <= 0.5 || y + rect.height < -SNAPSHOT_OVERSCAN || y > snapshotHeight + SNAPSHOT_OVERSCAN) return;

    const lineHeight = Math.max(rect.height * 0.52, 1.5);
    ctx.fillRect(rect.left, y + rect.height * 0.28, rect.width, lineHeight);
  });

  if (fontSize >= 18) {
    const firstRect = rects[0];
    const y = firstRect.top + scrollY;
    if (y > -SNAPSHOT_OVERSCAN && y < snapshotHeight + SNAPSHOT_OVERSCAN) {
      const maxTextWidth = Math.max(Math.min(firstRect.width + 48, window.innerWidth - firstRect.left), 1);
      ctx.globalAlpha = Math.min(alpha * 0.68, 0.86);
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillText(text.slice(0, 160), firstRect.left, y, maxTextWidth);
    }
  }

  ctx.restore();
}

function drawDomSnapshotLayer(ctx: CanvasRenderingContext2D, scrollY: number, snapshotHeight: number) {
  const root = document.body;
  if (!root) return;

  const elements: HTMLElement[] = [];
  const textNodes: Text[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.matches(SNAPSHOT_IGNORED_SELECTOR)) return NodeFilter.FILTER_REJECT;
        if (!(element instanceof HTMLElement)) return NodeFilter.FILTER_SKIP;

        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) <= 0.01) {
          return NodeFilter.FILTER_REJECT;
        }

        return isElementInSnapshot(element, scrollY, snapshotHeight) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }

      if (node.nodeType === Node.TEXT_NODE && node.parentElement && !node.parentElement.closest(SNAPSHOT_IGNORED_SELECTOR)) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_SKIP;
    },
  });

  let node = walker.nextNode();
  while (node && (elements.length < SNAPSHOT_ELEMENT_LIMIT || textNodes.length < SNAPSHOT_TEXT_LIMIT)) {
    if (node.nodeType === Node.ELEMENT_NODE && elements.length < SNAPSHOT_ELEMENT_LIMIT) {
      elements.push(node as HTMLElement);
    } else if (node.nodeType === Node.TEXT_NODE && textNodes.length < SNAPSHOT_TEXT_LIMIT) {
      textNodes.push(node as Text);
    }

    node = walker.nextNode();
  }

  elements.forEach((element) => drawElementSurface(ctx, element, scrollY, snapshotHeight));
  elements.forEach((element) => drawMediaElement(ctx, element, scrollY, snapshotHeight));
  textNodes.forEach((node) => drawTextNode(ctx, node, scrollY, snapshotHeight));
}

function drawStageSurface(ctx: CanvasRenderingContext2D, scrollY: number) {
  const stage = document.querySelector<HTMLElement>('.portfolio-stage');
  if (!stage) return;

  const stageRect = stage.getBoundingClientRect();
  if (stageRect.width <= 0 || stageRect.height <= 0) return;

  const style = window.getComputedStyle(stage);
  const radius = parseFloat(style.borderTopLeftRadius) || 34;
  const x = stageRect.left;
  const y = stageRect.top + scrollY;
  const width = stageRect.width;
  const height = stageRect.height;

  ctx.save();
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.clip();

  const base = ctx.createLinearGradient(x, y, x + width, y + height);
  base.addColorStop(0, 'rgba(253, 255, 255, 0.96)');
  base.addColorStop(0.54, 'rgba(247, 252, 255, 0.94)');
  base.addColorStop(1, 'rgba(239, 248, 255, 0.9)');
  ctx.fillStyle = base;
  ctx.fillRect(x, y, width, height);

  const radial = ctx.createRadialGradient(x + width * 0.5, y, 0, x + width * 0.5, y, Math.max(width, height) * 0.72);
  radial.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
  radial.addColorStop(0.36, 'rgba(249, 253, 255, 0.42)');
  radial.addColorStop(1, 'rgba(238, 246, 252, 0.32)');
  ctx.fillStyle = radial;
  ctx.fillRect(x, y, width, height);

  const sheen = ctx.createLinearGradient(x, y, x, y + Math.min(height, 280));
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.19)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, width, Math.min(height, 280));

  const tint = ctx.createLinearGradient(x, y, x + width, y);
  tint.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  tint.addColorStop(0.34, 'rgba(255, 255, 255, 0)');
  tint.addColorStop(1, 'rgba(99, 189, 249, 0.18)');
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, width, height);

  ctx.restore();
}

function drawPortfolioSnapshot() {
  const startedAt = performance.now();

  try {
    if (!reusableSnapshotCanvas) {
      reusableSnapshotCanvas = document.createElement('canvas');
      reusableSnapshotContext = reusableSnapshotCanvas.getContext('2d', { alpha: false });
    }

    const snapshot = reusableSnapshotCanvas;
    const ctx = reusableSnapshotContext;
    if (!ctx) return null;

    const dpr = getGlassDpr();
    const cssWidth = Math.max(Math.ceil(window.innerWidth), 1);
    const cssHeight = Math.max(Math.ceil(window.innerHeight), 1);
    const width = Math.max(Math.ceil(cssWidth * dpr), 1);
    const height = Math.max(Math.ceil(cssHeight * dpr), 1);

    if (snapshot.width !== width) snapshot.width = width;
    if (snapshot.height !== height) snapshot.height = height;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#020817';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const shaderCanvas = getShaderCanvas();
    if (shaderCanvas && shaderCanvas.width > 0 && shaderCanvas.height > 0) {
      const shaderRect = shaderCanvas.getBoundingClientRect();

      try {
        ctx.drawImage(
          shaderCanvas,
          shaderRect.left,
          shaderRect.top,
          shaderRect.width,
          shaderRect.height,
        );
      } catch {
        const fallback = ctx.createLinearGradient(0, 0, cssWidth, window.innerHeight);
        fallback.addColorStop(0, '#63bdf9');
        fallback.addColorStop(0.48, '#5a769d');
        fallback.addColorStop(1, '#fafdff');
        ctx.fillStyle = fallback;
        ctx.fillRect(0, 0, cssWidth, window.innerHeight);
      }
    } else {
      const fallback = ctx.createLinearGradient(0, 0, cssWidth, window.innerHeight);
      fallback.addColorStop(0, '#63bdf9');
      fallback.addColorStop(0.48, '#5a769d');
      fallback.addColorStop(1, '#fafdff');
      ctx.fillStyle = fallback;
      ctx.fillRect(0, 0, cssWidth, window.innerHeight);
    }

    drawStageSurface(ctx, 0);
    drawDomSnapshotLayer(ctx, 0, cssHeight);
    return snapshot;
  } catch (error) {
    reportGlassError('snapshot draw failed', error);
    return null;
  } finally {
    recordSeriesMetric(liquidGlassPerf.snapshot, startedAt);
  }
}

function setGlassControls() {
  (window as LiquidGlassWindow).glassControls = {
    edgeIntensity: 0.01,
    rimIntensity: 0.052,
    baseIntensity: 0.006,
    edgeDistance: 0.15,
    rimDistance: 0.85,
    baseDistance: 0.1,
    cornerBoost: 0.018,
    rippleEffect: 0.075,
    blurRadius: 5.5,
    tintOpacity: 0.16,
    warp: false,
  };
}

function uploadSnapshotToInstance(instance: LiquidGlassInstance, snapshot: HTMLCanvasElement) {
  if (instance.__portfolioDestroyed || instance.parent || !instance.gl_refs.gl || !instance.gl_refs.texture) return;

  const startedAt = performance.now();

  try {
    const gl = instance.gl_refs.gl;
    gl.bindTexture(gl.TEXTURE_2D, instance.gl_refs.texture);

    if (instance.__portfolioTextureWidth === snapshot.width && instance.__portfolioTextureHeight === snapshot.height) {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, snapshot);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshot);
      instance.__portfolioTextureWidth = snapshot.width;
      instance.__portfolioTextureHeight = snapshot.height;
    }

    if (instance.gl_refs.textureSizeLoc) {
      gl.uniform2f(instance.gl_refs.textureSizeLoc, snapshot.width, snapshot.height);
    }

    if (instance.gl_refs.pageHeightLoc) {
      gl.uniform1f(instance.gl_refs.pageHeightLoc, snapshot.height);
    }

    if (instance.gl_refs.viewportHeightLoc) {
      gl.uniform1f(instance.gl_refs.viewportHeightLoc, window.innerHeight * getGlassDpr());
    }

    if (instance.gl_refs.scrollYLoc) {
      gl.uniform1f(instance.gl_refs.scrollYLoc, 0);
    }

    syncGlassUniforms(instance);
    instance.render?.();
  } catch (error) {
    reportGlassError('texture upload failed', error);
  } finally {
    recordSeriesMetric(liquidGlassPerf.textureUpload, startedAt);
  }
}

function updateStandaloneTextures(Container: LiquidGlassContainerConstructor, instances: LiquidGlassInstance[]) {
  const startedAt = performance.now();
  const snapshot = drawPortfolioSnapshot();
  if (!snapshot) return;

  Container.pageSnapshot = snapshot;

  instances.forEach((instance) => uploadSnapshotToInstance(instance, snapshot));
  recordSeriesMetric(liquidGlassPerf.textureRefresh, startedAt);
}

function applyActiveState(items: NavInstances['buttons'], active: string) {
  items.forEach(({ instance, target, tintOpacity }) => {
    const isActive = target === active;
    instance.element.classList.toggle('is-active', isActive);
    instance.tintOpacity = isActive ? Math.max(tintOpacity, 0.46) : tintOpacity;

    if (target) {
      if (isActive) {
        instance.element.setAttribute('aria-current', 'page');
      } else {
        instance.element.removeAttribute('aria-current');
      }
    }

    if (instance.gl_refs.gl && instance.gl_refs.tintOpacityLoc) {
      instance.gl_refs.gl.uniform1f(instance.gl_refs.tintOpacityLoc, instance.tintOpacity);
      instance.render?.();
    }
  });
}

function makeKeyboardClickable(element: HTMLElement, onClick: () => void) {
  element.setAttribute('role', 'button');
  element.tabIndex = 0;
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  });
}

function destroyInstance(Container: LiquidGlassContainerConstructor, instance: LiquidGlassInstance) {
  instance.__portfolioDestroyed = true;

  if (instance.__portfolioRaf) {
    window.cancelAnimationFrame(instance.__portfolioRaf);
  }

  if (instance.__portfolioScrollHandler) {
    window.removeEventListener('scroll', instance.__portfolioScrollHandler);
  }

  const gl = instance.gl_refs.gl;
  if (gl) {
    if (instance.gl_refs.texture) gl.deleteTexture(instance.gl_refs.texture);
    if (instance.gl_refs.positionBuffer) gl.deleteBuffer(instance.gl_refs.positionBuffer);
    if (instance.gl_refs.texcoordBuffer) gl.deleteBuffer(instance.gl_refs.texcoordBuffer);
  }

  const index = Container.instances.indexOf(instance);
  if (index >= 0) Container.instances.splice(index, 1);

  if (instance.parent?.children) {
    const childIndex = instance.parent.children.indexOf(instance);
    if (childIndex >= 0) instance.parent.children.splice(childIndex, 1);
  }

  instance.children = [];
  instance.parent = null;
  instance.element.remove();
}

function isNavVisible(container: LiquidGlassInstance) {
  if (document.hidden) return false;

  const rect = container.element.getBoundingClientRect();
  return rect.bottom >= -SNAPSHOT_OVERSCAN && rect.top <= window.innerHeight + SNAPSHOT_OVERSCAN;
}

export function LiquidGlassJsNavShell({
  active,
  navLinks,
  onNavigate,
  onNavIntent,
  onCta,
  logoLabel = 'RH',
  ctaLabel = 'Say hi ↗',
  className = '',
  orientation = 'horizontal',
  showLogo = true,
  showCta = true,
  navLabel = 'Primary navigation',
}: LiquidGlassJsNavShellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<NavInstances | null>(null);
  const activeRef = useRef(active);
  const navigateRef = useRef(onNavigate);
  const navIntentRef = useRef(onNavIntent);
  const ctaRef = useRef(onCta);

  activeRef.current = active;
  navigateRef.current = onNavigate;
  navIntentRef.current = onNavIntent;
  ctaRef.current = onCta;

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    applyActiveState(nav.buttons, active);

    let settledFrame = window.requestAnimationFrame(() => {
      try {
        nav.container.updateSizeFromDOM();
        nav.all.forEach((instance) => {
          instance.updateSizeFromDOM();
          instance.render?.();
        });
      } catch (error) {
        reportGlassError('active layout refresh failed', error);
      }
    });

    const settledTimer = window.setTimeout(() => {
      try {
        nav.container.updateSizeFromDOM();
        nav.all.forEach((instance) => {
          instance.updateSizeFromDOM();
          instance.render?.();
        });
        nav.container.capturePageSnapshot?.();
      } catch (error) {
        reportGlassError('active transition refresh failed', error);
      }
    }, 340);

    return () => {
      window.cancelAnimationFrame(settledFrame);
      window.clearTimeout(settledTimer);
    };
  }, [active]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    try {
      setGlassControls();
      const { Container, Button } = loadLiquidGlassLibrary();
      const isVertical = orientation === 'vertical';
      const isBottom = orientation === 'bottom';

      prepareSharedSnapshotState(Container);

      const container = new Container({
        type: isVertical ? 'rounded' : 'pill',
        borderRadius: isVertical ? 34 : isBottom ? 36 : 28,
        tintOpacity: isVertical ? 0.12 : isBottom ? 0.38 : 0.065,
      });
    container.element.classList.add('portfolio-liquid-library-nav');
    container.element.classList.add(`portfolio-liquid-library-nav-${orientation}`);
    container.element.setAttribute('aria-label', navLabel);

    const buttons: NavInstances['buttons'] = [];
    const all: LiquidGlassInstance[] = [container];

    const addButton = (
      instance: LiquidGlassInstance,
      options: {
        target?: string;
        className: string;
        tintOpacity: number;
        label: string;
        menuLabel?: string;
        icon?: NavIconName;
        onIntent?: () => void;
        onClick: () => void;
      },
    ) => {
      instance.element.classList.add(options.className);
      instance.element.setAttribute('aria-label', options.label);
      if (options.target) instance.element.dataset.target = options.target;
      instance.element.dataset.navLabel = options.menuLabel ?? options.label;
      if (options.icon) {
        instance.element.dataset.navIcon = options.icon;
        instance.element.insertBefore(createNavIcon(options.icon), instance.textElement ?? null);
      }
      instance.textElement?.classList.add('portfolio-liquid-tab-label');
      if (options.onIntent) {
        instance.element.addEventListener('pointerenter', options.onIntent, { passive: true });
        instance.element.addEventListener('focusin', options.onIntent);
        instance.element.addEventListener('touchstart', options.onIntent, { passive: true });
      }
      makeKeyboardClickable(instance.element, options.onClick);
      container.addChild(instance);
      buttons.push({ instance, target: options.target, tintOpacity: options.tintOpacity });
      all.push(instance);
    };

    if (showLogo) {
      const logoButton = new Button({
        text: logoLabel,
        type: 'circle',
        size: orientation === 'vertical' ? '22' : '20',
        tintOpacity: 0.36,
        warp: false,
        onClick: () => navigateRef.current('hero'),
      });
      logoButton.textElement?.setAttribute('aria-hidden', 'true');
      const logoImage = document.createElement('img');
      logoImage.src = profileImageUrl;
      logoImage.alt = '';
      logoImage.className = 'portfolio-liquid-logo-image';
      logoButton.element.appendChild(logoImage);

      addButton(
        logoButton,
        {
          className: 'portfolio-liquid-logo',
          target: 'hero',
          tintOpacity: 0.36,
          label: 'Go to hero',
          onClick: () => navigateRef.current('hero'),
        },
      );
    }

    navLinks.forEach((link) => {
      addButton(
        new Button({
          text: link.label,
          type: 'pill',
          size: '14',
          tintOpacity: isBottom ? 0.3 : 0.46,
          warp: false,
          onClick: () => navigateRef.current(link.target),
        }),
        {
          target: link.target,
          className: 'portfolio-liquid-tab',
          tintOpacity: isBottom ? 0.3 : 0.46,
          label: link.menuLabel ?? link.label,
          menuLabel: link.menuLabel,
          icon: link.icon,
          onIntent: () => navIntentRef.current?.(link.target),
          onClick: () => navigateRef.current(link.target),
        },
      );
    });

    if (showCta) {
      addButton(
        new Button({
          text: ctaLabel,
          type: 'pill',
          size: '14',
          tintOpacity: 0.5,
          warp: false,
          onClick: () => ctaRef.current(),
        }),
        {
          className: 'portfolio-liquid-cta',
          tintOpacity: 0.5,
          label: ctaLabel,
          onClick: () => ctaRef.current(),
        },
      );
    }

    root.appendChild(container.element);
    navRef.current = { all, buttons, container };

    let realtimeTextureFps = 0;
    let realtimeTextureFrames = 0;
    let realtimeTextureLastSample = performance.now();

    const win = window as LiquidGlassWindow;
    win.__portfolioLiquidGlassNav = {
      instances: all,
      getInstanceCount: () => all.filter((instance) => !instance.__portfolioDestroyed).length,
      refreshMode: 'adaptive-raf',
      getTextureFps: () => realtimeTextureFps,
      getMetrics: () => getLiquidGlassPerfSnapshot(all, realtimeTextureFps),
    };

    let realtimeTextureHotUntil = 0;
    const keepTextureLoopHot = (durationMs = 900) => {
      realtimeTextureHotUntil = Math.max(realtimeTextureHotUntil, performance.now() + durationMs);
    };

    const refreshTextures = () => {
      try {
        if (document.visibilityState === 'hidden') return false;
        if (isNavVisible(container)) {
          updateStandaloneTextures(Container, all);
          return true;
        }
      } catch (error) {
        reportGlassError('nav texture refresh failed', error);
      }

      return false;
    };

    let textureFrame = 0;
    const requestTextureRefresh = () => {
      keepTextureLoopHot(700);
      if (textureFrame) return;
      textureFrame = window.requestAnimationFrame(() => {
        textureFrame = 0;
        refreshTextures();
      });
    };

    let realtimeTextureFrame = 0;
    let realtimeTextureTimer = 0;
    const scheduleRealtimeTextureLoop = (delayMs = 0) => {
      if (realtimeTextureFrame || realtimeTextureTimer || container.__portfolioDestroyed) return;

      realtimeTextureTimer = window.setTimeout(() => {
        realtimeTextureTimer = 0;
        realtimeTextureFrame = window.requestAnimationFrame(runRealtimeTextureLoop);
      }, delayMs);
    };

    const runRealtimeTextureLoop = () => {
      realtimeTextureFrame = 0;

      if (container.__portfolioDestroyed || document.visibilityState === 'hidden') return;

      const didRefresh = refreshTextures();

      const now = performance.now();
      if (didRefresh) realtimeTextureFrames += 1;
      if (now - realtimeTextureLastSample >= 500) {
        realtimeTextureFps = (realtimeTextureFrames * 1000) / (now - realtimeTextureLastSample);
        realtimeTextureFrames = 0;
        realtimeTextureLastSample = now;
      }

      scheduleRealtimeTextureLoop(now < realtimeTextureHotUntil ? GLASS_ACTIVE_REFRESH_MS : GLASS_IDLE_REFRESH_MS);
    };

    const startRealtimeTextureLoop = () => {
      scheduleRealtimeTextureLoop(0);
    };

    let layoutFrame = window.requestAnimationFrame(() => {
      try {
        container.updateSizeFromDOM();
        all.forEach((instance) => instance.updateSizeFromDOM());
        container.capturePageSnapshot?.();
        applyActiveState(buttons, activeRef.current);
      } catch (error) {
        reportGlassError('nav layout refresh failed', error);
      }
    });

    let interactionLayoutFrame = 0;
    const requestLayoutRefresh = () => {
      if (interactionLayoutFrame) return;

      interactionLayoutFrame = window.requestAnimationFrame(() => {
        interactionLayoutFrame = 0;
        try {
          container.updateSizeFromDOM();
          all.forEach((instance) => {
            instance.updateSizeFromDOM();
            instance.render?.();
          });
          refreshTextures();
        } catch (error) {
          reportGlassError('nav interaction layout refresh failed', error);
        }
      });
    };

    const interactionRefreshTimers: number[] = [];
    const refreshDuringInteractionTransition = () => {
      keepTextureLoopHot(1200);
      requestLayoutRefresh();
      interactionRefreshTimers.push(window.setTimeout(requestLayoutRefresh, 120));
      interactionRefreshTimers.push(window.setTimeout(requestLayoutRefresh, 340));
    };

    const navResizeObserver =
      typeof window.ResizeObserver === 'undefined'
        ? null
        : new window.ResizeObserver(() => requestLayoutRefresh());

    if (navResizeObserver) {
      all.forEach((instance) => navResizeObserver.observe(instance.element));
    }

    const navElement = root.closest('.portfolio-bottom-navigation');
    const setExpandedState = (isExpanded: boolean) => {
      root.classList.toggle('is-expanded', isExpanded);
      navElement?.classList.toggle('is-expanded', isExpanded);
    };

    let tapExpansionTimer = 0;
    let tapExpansionHoldUntil = 0;
    let lastInteractionWasKeyboard = false;

    const collapseExpandedState = () => {
      setExpandedState(false);
      refreshDuringInteractionTransition();
    };

    const collapseIfIdle = () => {
      if (container.element.matches(':hover') || Date.now() < tapExpansionHoldUntil) return;

      collapseExpandedState();
    };

    const expandForInteraction = () => {
      setExpandedState(true);
      refreshDuringInteractionTransition();
    };

    const expandForTap = () => {
      tapExpansionHoldUntil = Date.now() + 1600;
      window.clearTimeout(tapExpansionTimer);
      setExpandedState(true);
      refreshDuringInteractionTransition();
      tapExpansionTimer = window.setTimeout(() => {
        tapExpansionHoldUntil = 0;
        collapseIfIdle();
      }, 1800);
    };

    const expandForKeyboardFocus = () => {
      if (!lastInteractionWasKeyboard) return;

      expandForInteraction();
    };

    const collapseAfterFocus = () => {
      window.setTimeout(collapseIfIdle, 0);
    };

    const collapseAfterPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && Date.now() < tapExpansionHoldUntil) return;

      tapExpansionHoldUntil = 0;
      window.clearTimeout(tapExpansionTimer);
      collapseExpandedState();
    };

    const handleKeyboardIntent = (event: KeyboardEvent) => {
      if (event.key === 'Tab') lastInteractionWasKeyboard = true;
    };

    const handlePointerIntent = () => {
      lastInteractionWasKeyboard = false;
    };

    const handleResize = () => {
      window.cancelAnimationFrame(layoutFrame);
      layoutFrame = window.requestAnimationFrame(() => {
        try {
          container.updateSizeFromDOM();
          all.forEach((instance) => instance.updateSizeFromDOM());
          refreshTextures();
        } catch (error) {
          reportGlassError('nav resize refresh failed', error);
        }
      });
    };

    startRealtimeTextureLoop();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', requestTextureRefresh, { passive: true });
    document.addEventListener('keydown', handleKeyboardIntent);
    document.addEventListener('pointerdown', handlePointerIntent);
    container.element.addEventListener('pointerenter', expandForInteraction);
    container.element.addEventListener('pointerleave', collapseAfterPointerLeave);
    container.element.addEventListener('focusin', expandForKeyboardFocus);
    container.element.addEventListener('focusout', collapseAfterFocus);
    container.element.addEventListener('pointerdown', expandForTap, true);
    container.element.addEventListener('click', expandForTap, true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestTextureRefresh();
        startRealtimeTextureLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', requestTextureRefresh);
        document.removeEventListener('keydown', handleKeyboardIntent);
        document.removeEventListener('pointerdown', handlePointerIntent);
        container.element.removeEventListener('pointerenter', expandForInteraction);
        container.element.removeEventListener('pointerleave', collapseAfterPointerLeave);
        container.element.removeEventListener('focusin', expandForKeyboardFocus);
        container.element.removeEventListener('focusout', collapseAfterFocus);
        container.element.removeEventListener('pointerdown', expandForTap, true);
        container.element.removeEventListener('click', expandForTap, true);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        setExpandedState(false);
        window.cancelAnimationFrame(layoutFrame);
        window.cancelAnimationFrame(textureFrame);
        window.cancelAnimationFrame(realtimeTextureFrame);
        window.cancelAnimationFrame(interactionLayoutFrame);
        window.clearTimeout(realtimeTextureTimer);
        window.clearTimeout(tapExpansionTimer);
        interactionRefreshTimers.forEach((timer) => window.clearTimeout(timer));
        navResizeObserver?.disconnect();

        [...all].reverse().forEach((instance) => destroyInstance(Container, instance));
        navRef.current = null;

        if (win.__portfolioLiquidGlassNav?.instances === all) {
          delete win.__portfolioLiquidGlassNav;
        }
      };
    } catch (error) {
      reportGlassError('nav mount failed', error);
      return undefined;
    }
  }, [ctaLabel, logoLabel, navLabel, navLinks, orientation, showCta, showLogo]);

  return <div ref={rootRef} className={`liquid-glass-js-nav-host ${className}`} />;
}

export function LiquidGlassJsFloatingButton({
  label,
  ariaLabel,
  className = '',
  onClick,
}: LiquidGlassJsFloatingButtonProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const clickRef = useRef(onClick);

  clickRef.current = onClick;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    try {
      root.innerHTML = '';
      setGlassControls();

      const { Container, Button } = loadLiquidGlassLibrary();
      prepareSharedSnapshotState(Container);

      const button = new Button({
        text: label,
        type: 'pill',
        size: '14',
        tintOpacity: 0.34,
        warp: false,
        onClick: () => clickRef.current(),
      });

      button.element.classList.add('portfolio-liquid-floating-ai');
      button.element.setAttribute('aria-label', ariaLabel ?? label);
      const profileImage = document.createElement('img');
      profileImage.src = profileImageUrl;
      profileImage.alt = '';
      profileImage.className = 'portfolio-liquid-floating-ai-image';
      button.element.insertBefore(profileImage, button.textElement ?? null);
      makeKeyboardClickable(button.element, () => clickRef.current());
      root.appendChild(button.element);

      const all = [button];

      const refreshTextures = () => {
        try {
          if (document.visibilityState === 'hidden' || button.__portfolioDestroyed) return;
          if (isNavVisible(button)) {
            updateStandaloneTextures(Container, all);
          }
        } catch (error) {
          reportGlassError('floating texture refresh failed', error);
        }
      };

    let textureFrame = 0;
    const requestTextureRefresh = () => {
      if (textureFrame) return;
      textureFrame = window.requestAnimationFrame(() => {
        textureFrame = 0;
        refreshTextures();
      });
    };

    let layoutFrame = window.requestAnimationFrame(() => {
      try {
        button.updateSizeFromDOM();
        button.capturePageSnapshot?.();
        refreshTextures();
      } catch (error) {
        reportGlassError('floating layout refresh failed', error);
      }
    });

    const refreshTimer = window.setInterval(refreshTextures, GLASS_FLOATING_REFRESH_MS);

    const handleResize = () => {
      window.cancelAnimationFrame(layoutFrame);
      layoutFrame = window.requestAnimationFrame(() => {
        try {
          button.updateSizeFromDOM();
          refreshTextures();
        } catch (error) {
          reportGlassError('floating resize refresh failed', error);
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestTextureRefresh();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', requestTextureRefresh, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', requestTextureRefresh);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.cancelAnimationFrame(layoutFrame);
        window.cancelAnimationFrame(textureFrame);
        window.clearInterval(refreshTimer);
        [...all].reverse().forEach((instance) => destroyInstance(Container, instance));
      };
    } catch (error) {
      reportGlassError('floating mount failed', error);
      return undefined;
    }
  }, [ariaLabel, label]);

  return <div ref={rootRef} className={`liquid-glass-js-floating-ai-host ${className}`} />;
}
