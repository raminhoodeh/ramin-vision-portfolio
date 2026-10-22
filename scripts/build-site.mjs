import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { maintenanceEnabled, maintenanceRobots, maintenanceRoutes } from '../site/maintenance.mjs';
import { homepageBio, maintenanceDocument } from '../site/maintenanceDocument.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function buildMaintenance(outputRoot = root) {
  const dist = path.join(outputRoot, 'dist');
  const output = path.join(outputRoot, '.vercel/output');
  // Remove only generated build directories, including cached old portfolio
  // pages/chunks and functions. Rebuilding cannot retain a private old route.
  await rm(dist, { recursive: true, force: true });
  await rm(output, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await mkdir(path.join(output, 'static'), { recursive: true });
  const html = maintenanceDocument(homepageBio(root));
  for (const directory of [dist, path.join(output, 'static')]) {
    await writeFile(path.join(directory, 'index.html'), html);
    await writeFile(path.join(directory, 'robots.txt'), maintenanceRobots);
  }
  await writeFile(path.join(output, 'config.json'), JSON.stringify({ version: 3, routes: maintenanceRoutes() }, null, 2) + '\n');
  console.log('Maintenance build: homepage and robots only; all other routes return 503. No portfolio JavaScript, assets or functions emitted.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (maintenanceEnabled) await buildMaintenance();
  else {
    // Reopening also requires restoring the reviewed portfolio routing config.
    const result = spawnSync('npm', ['run', 'build:portfolio'], { cwd: root, stdio: 'inherit' });
    process.exitCode = result.status ?? 1;
  }
}
