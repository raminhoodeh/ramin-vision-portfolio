import iphoneModelUrl from '../../gl/iphone/iphone.glb?url';
import dracoWasmWrapperUrl from 'three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js?url';
import dracoDecoderWasmUrl from 'three/examples/jsm/libs/draco/gltf/draco_decoder.wasm?url';

const assetDirectory = (assetUrl: string) => assetUrl.slice(0, assetUrl.lastIndexOf('/') + 1);

/**
 * iPhone 15/16 Pro model scraped from contentcore.xyz (Cargo "ContentCore-Mockup-R3-001"),
 * compressed with gltf-transform to Draco geometry + WebP textures (10.25MB -> ~0.48MB).
 * The model exposes a named "Screen" mesh/material so app screenshots can be mapped at runtime.
 */
export const iphoneAssetPipeline = {
  source: 'contentcore.xyz / ContentCore-Mockup-R3-001 scrape',
  modelUrl: iphoneModelUrl,
  dracoDecoderPath: assetDirectory(dracoWasmWrapperUrl),
  runtimeAssets: [iphoneModelUrl, dracoWasmWrapperUrl, dracoDecoderWasmUrl].filter(Boolean),
  screenMaterialName: 'screen',
} as const;
