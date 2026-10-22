import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { maintenanceEnabled, maintenanceRoutes } from '../site/maintenance.mjs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
if (maintenanceEnabled) {
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, 'npm run build');
  assert.deepEqual(config.routes, maintenanceRoutes());
  for (const key of ['redirects', 'rewrites', 'cleanUrls', 'trailingSlash', 'functions']) assert.ok(!(key in config), `Maintenance routing cannot retain ${key}`);
  assert.ok(readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8').split('\n').includes('api/'), 'Source deployments must not discover API functions while locked');
  console.log('Maintenance configuration passed: root-only page, terminal 503 catchall, no document redirects or API build inputs.');
} else {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync('npm', ['run', 'check:portfolio-claims'], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
}
