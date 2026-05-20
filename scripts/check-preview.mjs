const previewUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4182/';
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, value, message) {
  assert(source.includes(value), message);
}

function sourceContent(moduleText) {
  const marker = '//# sourceMappingURL=data:application/json;base64,';
  const markerIndex = moduleText.lastIndexOf(marker);
  if (markerIndex < 0) return moduleText;

  try {
    const encodedMap = moduleText.slice(markerIndex + marker.length).trim();
    const sourceMap = JSON.parse(Buffer.from(encodedMap, 'base64').toString('utf8'));
    if (Array.isArray(sourceMap.sourcesContent) && sourceMap.sourcesContent.length) {
      return sourceMap.sourcesContent.join('\n');
    }
  } catch {
    return moduleText;
  }

  return moduleText;
}

async function get(path) {
  const url = new URL(path, previewUrl).toString();
  let response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${url} could not be reached (${reason}). Confirm the existing dev server is running and localhost network access is allowed for this command.`,
    );
  }

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.text();
}

try {
  const html = await get('/');
  assert(html.includes('<div id="root"></div>'), 'root HTML must include React mount node');
  assert(/src="\/src\/main\.tsx(?:\?t=\d+)?"/.test(html), 'root HTML must load /src/main.tsx without stage query tags');
  assert(!html.includes('?t=stage'), 'root HTML must not include stage cache tags');

  const main = await get('/src/main.tsx');
  assert(/from "\/src\/App\.tsx(?:\?t=\d+)?"/.test(main) || main.includes("from './App'"), 'main.tsx must import App normally');
  assert(!main.includes('?t=stage'), 'main.tsx must not include stage cache tags');

  const app = await get('/src/App.tsx');
  const appSource = sourceContent(app);
  const usesTahoeNav = appSource.includes('TahoeGlassTabNav');
  const usesLiquidGlassNav = appSource.includes('LiquidGlassJsNavShell');
  assert(
    usesTahoeNav || usesLiquidGlassNav,
    'App must import a glass navigation shell with predictive preload support',
  );
  assertIncludes(app, 'ExperienceEducationSection', 'App must include ExperienceEducationSection');
  assertIncludes(appSource, "requestBonusRockPreload('idle')", 'App must idle-preload Bonus rock assets');
  assertIncludes(appSource, "preloadBonusRockAssets('visible')", 'visible Bonus rock scene must join the shared preloader');
  assertIncludes(appSource, 'data-bonus-rock-preload-status', 'App must expose root Bonus preload status for QA');
  assertIncludes(appSource, 'data-rock-preload-status', 'Bonus rock scene must expose preload status for QA');
  assertIncludes(appSource, 'gltfLoader.loadAsync(hashgraphRockAssetPipeline.modelUrl)', 'Bonus rock must load the original GLB model URL');
  assertIncludes(appSource, 'window.innerWidth < 720 ? 1.15 : 1.25', 'Bonus rock renderer must keep the tightened DPR cap');
  assert(!app.includes('?t=stage'), 'App module must not include stage cache tags');

  if (usesTahoeNav) {
    const tahoeNav = await get('/src/components/TahoeGlassTabNav.tsx');
    const tahoeNavSource = sourceContent(tahoeNav);
    assertIncludes(tahoeNavSource, 'onNavIntent', 'Tahoe glass nav must keep predictive preload intent callbacks');
    assertIncludes(tahoeNavSource, 'onPointerEnter={() => onNavIntent?.(link.target)}', 'Tahoe glass nav must preload on hover intent');
    assertIncludes(tahoeNavSource, 'onFocus={() => onNavIntent?.(link.target)}', 'Tahoe glass nav must preload on keyboard focus intent');
    assert(!tahoeNav.includes('?t=stage'), 'Tahoe glass nav must not include stage cache tags');
  } else {
    const glassShell = await get('/src/components/LiquidGlassJsNavShell.tsx');
    assertIncludes(glassShell, '/src/components/LiquidGlassJsNavShellReadable.tsx', 'glass shell must re-export readable implementation normally');
    assert(!glassShell.includes('?t=stage'), 'glass shell must not include stage cache tags');

    const glassReadable = await get('/src/components/LiquidGlassJsNavShellReadable.tsx');
    const glassReadableSource = sourceContent(glassReadable);
    assertIncludes(glassReadable, 'prepareSharedSnapshotState', 'liquid glass implementation must include shared snapshot state guard');
    assertIncludes(glassReadable, 'floating mount failed', 'liquid glass implementation must contain floating mount guard');
    assertIncludes(glassReadableSource, 'onNavIntent', 'liquid glass nav must keep predictive preload intent callbacks');
    assert(!glassReadable.includes('?t=stage'), 'liquid glass implementation must not include stage cache tags');
  }

  const rockAssets = await get('/src/three/hashgraphRockAssets.ts');
  const rockAssetsSource = sourceContent(rockAssets);
  assertIncludes(rockAssetsSource, 'gl/intro/intro_compressed.glb?url', 'rock asset pipeline must point at the original Ventures intro GLB');
  assertIncludes(rockAssetsSource, 'installHashgraphRockResourceHints', 'rock asset pipeline must install runtime resource hints');
  assertIncludes(rockAssetsSource, "link.rel = 'prefetch'", 'rock resource hints must use low-priority prefetch');
  assertIncludes(rockAssetsSource, "link.as = 'fetch'", 'rock resource hints must be fetch hints for model, texture, and decoder assets');
  assertIncludes(rockAssetsSource, "link.crossOrigin = 'anonymous'", 'rock resource hints must remain anonymous cache-compatible requests');
  assertIncludes(rockAssetsSource, 'installedResourceHints', 'rock resource hints must be de-duplicated');
  assertIncludes(rockAssetsSource, "cache: 'force-cache'", 'rock asset warmup must use browser cache warming');
  assertIncludes(rockAssetsSource, "priority: 'low'", 'rock asset warmup must remain low-priority');

  const rockPreload = await get('/src/three/bonusRockPreload.ts');
  const rockPreloadSource = sourceContent(rockPreload);
  assertIncludes(rockPreloadSource, 'warmHashgraphRockAssetPipeline', 'Bonus preloader must warm the asset pipeline');
  assertIncludes(rockPreloadSource, "import('three')", 'Bonus preloader must warm Three.js before navigation');
  assertIncludes(rockPreloadSource, 'subscribeBonusRockPreload', 'Bonus preloader must expose observable status');

  const rockMotion = await get('/src/three/hashgraphRockMotion.ts');
  const rockMotionSource = sourceContent(rockMotion);
  assertIncludes(rockMotionSource, 'VENTURES_ROCK_REFERENCE', 'rock motion contract must retain Ventures source-of-truth reference');
  assertIncludes(rockMotionSource, "id: 'fracturing'", 'rock motion contract must keep the pre-rupture fracture stage');
  assertIncludes(rockMotionSource, "mode: 'miniature'", 'rock motion contract must keep miniature gift preview stage');

  const shader = await get('/src/components/ShaderGradientBackground.tsx');
  const shaderSource = sourceContent(shader);
  assertIncludes(shaderSource, "color1: '#334762'", 'Bonus shader preset must keep the requested dark blue color');
  assertIncludes(shaderSource, "color2: '#682b71'", 'Bonus shader preset must keep the requested purple color');
  assertIncludes(shaderSource, "color3: '#e5b9a3'", 'Bonus shader preset must keep the requested dawn highlight color');
  assertIncludes(shaderSource, 'pixelDensity={1}', 'shader canvas must keep requested pixelDensity={1}');

  const baseline = await get('/src/performance/portfolioPerformanceBaseline.ts');
  const baselineSource = sourceContent(baseline);
  assertIncludes(baselineSource, 'PortfolioShaderSurfaceBaseline', 'performance baseline must track shader surfaces');
  assertIncludes(baselineSource, 'bonusRockPreloadStatus', 'performance baseline must report Bonus preload status');

  const budgets = await get('/src/performance/portfolioPerformanceBudgets.ts');
  const budgetsSource = sourceContent(budgets);
  assertIncludes(budgetsSource, 'MAX_NON_BONUS_ROCK_CANVASES', 'performance budgets must prevent hidden non-Bonus rock canvases');
  assertIncludes(budgetsSource, 'non-bonus-shader-variant', 'performance budgets must prevent Bonus shader leaks outside Bonus');
  assertIncludes(budgetsSource, 'bonus-preload-status', 'performance budgets must require active Bonus preload status on Bonus');
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

if (failures.length) {
  console.error(`Preview check failed for ${previewUrl}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Preview check passed for ${previewUrl}`);
