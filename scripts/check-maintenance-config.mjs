import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { maintenanceAssets, maintenanceEnabled, maintenanceHeaders, maintenanceResponse, maintenanceRoutes } from '../site/maintenance.mjs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
if (maintenanceEnabled) {
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, 'npm run build');
  assert.deepEqual(config.routes, maintenanceRoutes());
  for (const route of config.routes.filter(({ dest, status }) => dest && !status)) assert.equal(route.caseSensitive, true, `Read allowlist is case-sensitive: ${route.src}`);
  for (const key of ['redirects', 'rewrites', 'cleanUrls', 'trailingSlash', 'functions']) assert.ok(!(key in config), `Maintenance routing cannot retain ${key}`);
  assert.ok(readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8').split('\n').includes('api/'), 'Source deployments must not discover API functions while locked');
  assert.equal(Object.keys(maintenanceAssets).length, 3, 'Only the shader bundle and two fonts are exposed');
  for (const [pathname, asset] of Object.entries(maintenanceAssets)) {
    const route = config.routes.find((entry) => new RegExp(entry.src).test(pathname));
    assert.deepEqual(route.methods, ['GET', 'HEAD']);
    assert.equal(route.dest, `/${asset.file}`);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) assert.equal(maintenanceResponse(pathname, method).status, 503, `Decorative resource is read-only: ${pathname} ${method}`);
  }
  assert.match(maintenanceHeaders['Content-Security-Policy'], /script-src 'self'/);
  assert.match(maintenanceHeaders['Content-Security-Policy'], /connect-src 'none'/);
  assert.match(maintenanceHeaders['Content-Security-Policy'], /font-src 'self'/);
  assert.doesNotMatch(maintenanceHeaders['Content-Security-Policy'], /unsafe-eval|https:/);
  console.log('Maintenance configuration passed: root page, exact three decorative assets, terminal 503 catchall, no document redirects or API build inputs.');
} else {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync('npm', ['run', 'check:portfolio-claims'], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
}
