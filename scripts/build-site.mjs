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

async function originalBackground() {
  const result = await build({
    configFile: false, root, publicDir: false, logLevel: 'error', plugins: [react()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    css: { postcss: { plugins: [] } },
    resolve: { dedupe: ['react', 'react-dom'] },
    build: {
      write: false, sourcemap: false, target: 'es2022', minify: true, reportCompressedSize: false,
      lib: { entry: path.join(root, 'site/maintenanceBackground.tsx'), name: 'MaintenanceBackground', formats: ['iife'] },
      rollupOptions: { output: { entryFileNames: '_maintenance/background.js' } },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((entry) => entry.output);
  assert.equal(outputs.length, 1, 'The decorative entry must emit exactly one self-contained JavaScript file.');
  const chunk = outputs[0];
  assert.equal(chunk.type, 'chunk');
  assert.equal(chunk.fileName, '_maintenance/background.js');
  assert.deepEqual(chunk.imports, []);
  assert.deepEqual(chunk.dynamicImports, []);
  assert.doesNotMatch(chunk.code, /process\.env\b/, 'The browser-only visual bundle cannot rely on a Node environment.');
  const authored = Object.keys(chunk.modules).filter((filename) => filename.startsWith(root + path.sep) && !filename.includes('/node_modules/'));
  assert.ok(authored.some((filename) => filename.endsWith('/src/components/ShaderGradientBackground.tsx')), 'Use the original shader implementation.');
  for (const filename of authored) assert.ok([
    path.join(root, 'site/maintenanceBackground.tsx'), path.join(root, 'src/components/ShaderGradientBackground.tsx'),
  ].includes(filename), `Unexpected portfolio dependency in the decorative graph: ${filename}`);
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
  const [background, design] = await Promise.all([originalBackground(), renderMaintenanceDesign(root)]);
  const visualIntegrity = 'sha384-' + createHash('sha384').update(background).digest('base64');
  const html = maintenanceDocument(homepageBio(root), { ...design, styles: originalMaintenanceStyles(root), visualIntegrity });
  for (const directory of [dist, path.join(output, 'static')]) {
    await mkdir(path.join(directory, '_maintenance'), { recursive: true });
    await writeFile(path.join(directory, 'index.html'), html);
    await writeFile(path.join(directory, 'robots.txt'), maintenanceRobots);
    await writeFile(path.join(directory, '_maintenance/background.js'), background);
    for (const name of ['inter-latin.woff2', 'instrument-serif-italic-latin.woff2']) {
      await writeFile(path.join(directory, '_maintenance', name), await readFile(path.join(root, 'site/visual-assets', name)));
    }
  }
  await writeFile(path.join(output, 'config.json'), JSON.stringify({ version: 3, routes: maintenanceRoutes() }, null, 2) + '\n');
  console.log('Maintenance build: original shader/grain, original name/CTA markup and typography; three isolated decorative assets. Portfolio routes, CV and APIs remain 503; no application entry or functions emitted.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (maintenanceEnabled) await buildMaintenance();
  else {
    // Reopening also requires restoring the reviewed portfolio routing config.
    const result = spawnSync('npm', ['run', 'build:portfolio'], { cwd: root, stdio: 'inherit' });
    process.exitCode = result.status ?? 1;
  }
}
