import introRockModelUrl from '../../gl/intro/intro_compressed.glb?url';
import introRockMetallicRoughnessUrl from '../../gl/intro/texture_0.ktx2?url';
import introRockBaseColorUrl from '../../gl/intro/texture_1.ktx2?url';
import introRockEmissiveUrl from '../../gl/intro/texture_2.ktx2?url';
import introRockNormalUrl from '../../gl/intro/texture_3.ktx2?url';
import basisTranscoderJsUrl from '../../basis/basis_transcoder.js?url';
import basisTranscoderWasmUrl from '../../basis/basis_transcoder.wasm?url';
import dracoWasmWrapperUrl from 'three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js?url';
import dracoDecoderWasmUrl from 'three/examples/jsm/libs/draco/gltf/draco_decoder.wasm?url';

const assetDirectory = (assetUrl: string) => assetUrl.slice(0, assetUrl.lastIndexOf('/') + 1);

export const hashgraphRockAssetPipeline = {
  source: 'hashgraphvc intro scrape',
  modelUrl: introRockModelUrl,
  textureUrls: {
    metallicRoughness: introRockMetallicRoughnessUrl,
    baseColor: introRockBaseColorUrl,
    emissive: introRockEmissiveUrl,
    normal: introRockNormalUrl,
  },
  decoders: {
    basisTranscoderPath: assetDirectory(basisTranscoderJsUrl),
    dracoDecoderPath: assetDirectory(dracoWasmWrapperUrl),
    runtimeAssets: [basisTranscoderJsUrl, basisTranscoderWasmUrl, dracoWasmWrapperUrl, dracoDecoderWasmUrl],
  },
  requiredExtensions: ['KHR_draco_mesh_compression', 'KHR_mesh_quantization', 'KHR_texture_basisu'],
} as const;

let warmupPromise: Promise<void> | null = null;
const installedResourceHints = new Set<string>();

function getHashgraphRockWarmupAssetUrls() {
  return [
    hashgraphRockAssetPipeline.modelUrl,
    ...Object.values(hashgraphRockAssetPipeline.textureUrls),
    ...hashgraphRockAssetPipeline.decoders.runtimeAssets,
  ].filter(Boolean);
}

function warnMissingAssetUrls() {
  const urls = [
    hashgraphRockAssetPipeline.modelUrl,
    ...Object.values(hashgraphRockAssetPipeline.textureUrls),
    ...hashgraphRockAssetPipeline.decoders.runtimeAssets,
  ];

  urls.forEach((assetUrl) => {
    if (!assetUrl) console.warn('Missing Hashgraph rock asset URL in the Vite asset pipeline.');
  });
}

export function validateHashgraphRockAssetPipeline() {
  warnMissingAssetUrls();
  return Boolean(
    hashgraphRockAssetPipeline.modelUrl &&
      Object.values(hashgraphRockAssetPipeline.textureUrls).every(Boolean) &&
      hashgraphRockAssetPipeline.decoders.basisTranscoderPath &&
      hashgraphRockAssetPipeline.decoders.dracoDecoderPath &&
      hashgraphRockAssetPipeline.decoders.runtimeAssets.every(Boolean),
  );
}

export function installHashgraphRockResourceHints() {
  if (typeof document === 'undefined') return;

  getHashgraphRockWarmupAssetUrls().forEach((assetUrl) => {
    if (installedResourceHints.has(assetUrl)) return;

    installedResourceHints.add(assetUrl);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    link.href = assetUrl;
    link.crossOrigin = 'anonymous';
    link.dataset.hashgraphRockResourceHint = 'true';
    document.head.appendChild(link);
  });
}

export function warmHashgraphRockAssetPipeline() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (warmupPromise) return warmupPromise;

  installHashgraphRockResourceHints();

  const assetUrls = getHashgraphRockWarmupAssetUrls();
  const warmupRequestOptions = { cache: 'force-cache', priority: 'low' } as RequestInit & { priority: 'low' };

  warmupPromise = Promise.allSettled(
    assetUrls.map((assetUrl) => fetch(assetUrl, warmupRequestOptions)),
  ).then(() => undefined);

  return warmupPromise;
}
