import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

const sourceAssets = [
  ['intro model', 'gl/intro/intro_compressed.glb'],
  ['metallic roughness texture', 'gl/intro/texture_0.ktx2'],
  ['base color texture', 'gl/intro/texture_1.ktx2'],
  ['emissive texture', 'gl/intro/texture_2.ktx2'],
  ['normal texture', 'gl/intro/texture_3.ktx2'],
  ['basis transcoder js', 'basis/basis_transcoder.js'],
  ['basis transcoder wasm', 'basis/basis_transcoder.wasm'],
  ['draco wasm wrapper', 'node_modules/three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js'],
  ['draco decoder wasm', 'node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.wasm'],
];

const requiredExtensions = ['KHR_draco_mesh_compression', 'KHR_mesh_quantization', 'KHR_texture_basisu'];
const requiredTextureSlots = ['baseColorTexture', 'emissiveTexture', 'normalTexture', 'metallicRoughnessTexture'];

function fail(message) {
  console.error(`Hashgraph rock asset check failed: ${message}`);
  process.exit(1);
}

function assertFile(label, relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) fail(`${label} is missing at ${relativePath}`);

  const stat = fs.statSync(absolutePath);
  if (!stat.isFile() || stat.size <= 0) fail(`${label} at ${relativePath} is empty or not a file`);

  return { absolutePath, size: stat.size };
}

function readGlbJson(relativePath) {
  const { absolutePath } = assertFile('intro model', relativePath);
  const buffer = fs.readFileSync(absolutePath);

  if (buffer.toString('utf8', 0, 4) !== 'glTF') fail(`${relativePath} is not a GLB file`);

  const version = buffer.readUInt32LE(4);
  if (version !== 2) fail(`${relativePath} is GLB version ${version}, expected 2`);

  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.toString('utf8', 16, 20);
  if (jsonChunkType !== 'JSON') fail(`${relativePath} first chunk is ${jsonChunkType}, expected JSON`);

  const jsonText = buffer.toString('utf8', 20, 20 + jsonChunkLength).trim();
  return JSON.parse(jsonText);
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(absolutePath);
    return absolutePath;
  });
}

let distFilesCache;

function getDistFiles() {
  if (!fs.existsSync(distDir)) return [];
  distFilesCache ??= walkFiles(distDir).map((absolutePath) => path.relative(distDir, absolutePath));
  return distFilesCache;
}

function assertDistAsset(label, matcher) {
  const files = getDistFiles();
  if (!files.length) return;
  if (!files.some((file) => matcher.test(file))) fail(`built ${label} was not found in dist`);
}

function assertDistBundleReference(label, matcher) {
  const files = getDistFiles();
  if (!files.length) return;

  const bundleText = files
    .filter((file) => file.endsWith('.js') || file.endsWith('.html'))
    .map((file) => fs.readFileSync(path.join(distDir, file), 'utf8'))
    .join('\n');

  if (!matcher.test(bundleText)) fail(`built bundle does not reference ${label}`);
}

const sourceSizes = sourceAssets.map(([label, relativePath]) => {
  const { size } = assertFile(label, relativePath);
  return { label, size };
});

const gltfJson = readGlbJson('gl/intro/intro_compressed.glb');
const extensions = new Set([...(gltfJson.extensionsUsed ?? []), ...(gltfJson.extensionsRequired ?? [])]);
requiredExtensions.forEach((extension) => {
  if (!extensions.has(extension)) fail(`intro model does not declare ${extension}`);
});

const textureSlots = new Set(
  (gltfJson.materials ?? []).flatMap((material) => [
    material.pbrMetallicRoughness?.baseColorTexture ? 'baseColorTexture' : null,
    material.pbrMetallicRoughness?.metallicRoughnessTexture ? 'metallicRoughnessTexture' : null,
    material.emissiveTexture ? 'emissiveTexture' : null,
    material.normalTexture ? 'normalTexture' : null,
  ]).filter(Boolean),
);

requiredTextureSlots.forEach((slot) => {
  if (!textureSlots.has(slot)) fail(`intro model is missing ${slot}`);
});

assertDistAsset('intro model', /^assets\/intro_compressed-[\w-]+\.glb$/);
assertDistAsset('metallic roughness texture', /^assets\/texture_0-[\w-]+\.ktx2$/);
assertDistAsset('base color texture', /^assets\/texture_1-[\w-]+\.ktx2$/);
assertDistAsset('emissive texture', /^assets\/texture_2-[\w-]+\.ktx2$/);
assertDistAsset('normal texture', /^assets\/texture_3-[\w-]+\.ktx2$/);
assertDistAsset('basis transcoder js', /^basis\/basis_transcoder\.js$/);
assertDistAsset('basis transcoder wasm', /^basis\/basis_transcoder\.wasm$/);
assertDistAsset('draco wasm wrapper', /^draco\/gltf\/draco_wasm_wrapper\.js$/);
assertDistAsset('draco decoder wasm', /^draco\/gltf\/draco_decoder\.wasm$/);
assertDistBundleReference('intro model runtime URL', /intro_compressed-[\w-]+\.glb/);
assertDistBundleReference('metallic roughness runtime URL', /texture_0-[\w-]+\.ktx2/);
assertDistBundleReference('base color runtime URL', /texture_1-[\w-]+\.ktx2/);
assertDistBundleReference('emissive runtime URL', /texture_2-[\w-]+\.ktx2/);
assertDistBundleReference('normal runtime URL', /texture_3-[\w-]+\.ktx2/);
assertDistBundleReference('basis transcoder runtime URL', /basis_transcoder\.wasm/);
assertDistBundleReference('draco decoder runtime URL', /draco_decoder\.wasm/);
assertDistBundleReference('rock resource hint marker', /hashgraphRockResourceHint/);
assertDistBundleReference('rock resource hint prefetch', /rel\s*=\s*["'`]prefetch["'`]|rel:\s*["'`]prefetch["'`]/);
assertDistBundleReference('low-priority cache warmup', /cache:\s*["'`]force-cache["'`][\s\S]{0,80}priority:\s*["'`]low["'`]/);

const totalKb = sourceSizes.reduce((total, asset) => total + asset.size, 0) / 1024;
console.log(
  `Hashgraph rock asset check passed: ${sourceSizes.length} source files, ${requiredExtensions.length} required GLB extensions, ${totalKb.toFixed(1)}KB source payload.`,
);
