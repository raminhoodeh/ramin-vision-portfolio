import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { maintenanceEnabled, maintenanceRobots, maintenanceRoutes } from '../site/maintenance.mjs';
import { homepageBio, maintenanceDocument } from '../site/maintenanceDocument.mjs';
import { originalMaintenanceStyles } from '../site/maintenanceStyles.mjs';
import { renderMaintenanceDesign } from './render-maintenance-design.mjs';
import { build } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function isolatedBundle({ entry, fileName, name, authoredFiles, requiredFile, maxBytes, allowDependencies = true }) {
  const result = await build({
    configFile: false, root, publicDir: false, logLevel: 'error', plugins: [react()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    css: { postcss: { plugins: [] } },
    resolve: { dedupe: ['react', 'react-dom'] },
    build: {
      write: false, sourcemap: false, target: 'es2022', minify: true, reportCompressedSize: false,
      lib: { entry: path.join(root, entry), name, formats: ['iife'] },
      rollupOptions: { output: { entryFileNames: fileName } },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((entry) => entry.output);
  assert.equal(outputs.length, 1, 'The isolated maintenance entry must emit exactly one self-contained JavaScript file.');
  const chunk = outputs[0];
  assert.equal(chunk.type, 'chunk');
  assert.equal(chunk.fileName, fileName);
  assert.deepEqual(chunk.imports, []);
  assert.deepEqual(chunk.dynamicImports, []);
  assert.doesNotMatch(chunk.code, /process\.env\b/, 'The browser-only visual bundle cannot rely on a Node environment.');
  const modules = Object.keys(chunk.modules);
  if (!allowDependencies) assert.ok(modules.every((filename) => !filename.includes('/node_modules/')), 'The small controller cannot import rendering libraries.');
  const authored = modules.filter((filename) => filename.startsWith(root + path.sep) && !filename.includes('/node_modules/'));
  assert.ok(authored.some((filename) => filename === path.join(root, requiredFile)), `Required isolated source: ${requiredFile}`);
  for (const filename of authored) assert.ok(authoredFiles.map((file) => path.join(root, file)).includes(filename), `Unexpected dependency in ${fileName}: ${filename}`);
  if (maxBytes) assert.ok(Buffer.byteLength(chunk.code) <= maxBytes, `${fileName} must remain at most ${maxBytes} bytes.`);
  return chunk.code;
}

export async function buildMaintenance(outputRoot = root) {
  const dist = path.join(outputRoot, 'dist');
  const output = path.join(outputRoot, '.vercel/output');
  // Remove only generated build directories, including cached old portfolio
  // pages/chunks and functions. Rebuilding cannot retain a private old route.
  await rm(dist, { recursive: true, force: true });
  await rm(output, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await mkdir(path.join(output, 'static'), { recursive: true });
  const [background, proofCode, design] = await Promise.all([
    isolatedBundle({ entry: 'site/maintenanceBackground.tsx', fileName: '_maintenance/background.js', name: 'MaintenanceBackground', authoredFiles: ['site/maintenanceBackground.tsx', 'src/components/ShaderGradientBackground.tsx'], requiredFile: 'src/components/ShaderGradientBackground.tsx' }),
    isolatedBundle({ entry: 'site/maintenanceProofs.ts', fileName: '_maintenance/proofs.js', name: 'MaintenanceProofs', authoredFiles: ['site/maintenanceProofs.ts', 'src/components/proofTicker.ts'], requiredFile: 'src/components/proofTicker.ts', maxBytes: 8192, allowDependencies: false }),
    renderMaintenanceDesign(root),
  ]);
  const visualIntegrity = 'sha384-' + createHash('sha384').update(background).digest('base64');
  const proofIntegrity = 'sha384-' + createHash('sha384').update(proofCode).digest('base64');
  const html = maintenanceDocument(homepageBio(root), { ...design, styles: originalMaintenanceStyles(root), visualIntegrity, proofIntegrity });
  for (const directory of [dist, path.join(output, 'static')]) {
    await mkdir(path.join(directory, '_maintenance'), { recursive: true });
    await writeFile(path.join(directory, 'index.html'), html);
    await writeFile(path.join(directory, 'robots.txt'), maintenanceRobots);
    await writeFile(path.join(directory, '_maintenance/background.js'), background);
    await writeFile(path.join(directory, '_maintenance/proofs.js'), proofCode);
    for (const name of ['inter-latin.woff2', 'instrument-serif-italic-latin.woff2']) {
      await writeFile(path.join(directory, '_maintenance', name), await readFile(path.join(root, 'site/visual-assets', name)));
    }
  }
  await writeFile(path.join(output, 'config.json'), JSON.stringify({ version: 3, routes: maintenanceRoutes() }, null, 2) + '\n');
  console.log('Maintenance build: original shader/grain, original name/CTA markup and typography; four isolated assets; initial teaching proof is visible without JavaScript and the small controller loads independently of the background. Portfolio routes, CV and APIs remain 503; no application entry or functions emitted.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (maintenanceEnabled) await buildMaintenance();
  else {
    // Reopening also requires restoring the reviewed portfolio routing config.
    const result = spawnSync('npm', ['run', 'build:portfolio'], { cwd: root, stdio: 'inherit' });
    process.exitCode = result.status ?? 1;
  }
}
