import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { maintenanceEnabled, maintenanceHeaders, maintenanceResponse, maintenanceRobots } from '../site/maintenance.mjs';
import { homepageBio, maintenanceDocument } from '../site/maintenanceDocument.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
let html;

function safeMaintenanceHtml() {
  if (!html) {
    try {
      const candidate = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
      if (!candidate.includes('<meta name="portfolio-availability" content="maintenance" />') || !candidate.includes('Under construction')) {
        throw new Error('The generated document is not a maintenance build.');
      }
      html = candidate;
    }
    catch {
      try { html = maintenanceDocument(homepageBio(root)); }
      catch {
        // A separately built API function may contain neither frontend sources
        // nor build files. Remain closed without loading a provider handler.
        html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Under construction</title></head><body><h1>Under construction</h1><p>Please check back soon.</p></body></html>';
      }
    }
  }
  return html;
}

export function blockWhileMaintenance(req, res) {
  if (!maintenanceEnabled) return false;
  const { pathname } = new URL(req.url || '/', 'https://www.ramin.vision');
  let response = maintenanceResponse(pathname, req.method);
  let asset;
  if (response.asset) {
    try { asset = readFileSync(path.join(root, 'dist', response.file)); }
    catch {
      // An absent decorative asset must never fall through to the normal
      // static server or an application/API route.
      response = maintenanceResponse('/unavailable-maintenance-asset');
    }
  }
  res.statusCode = response.status;
  for (const [name, value] of Object.entries(maintenanceHeaders)) res.setHeader(name, value);
  res.setHeader('Content-Type', response.contentType);
  if (response.retryAfter) res.setHeader('Retry-After', response.retryAfter);
  if (req.method === 'HEAD') res.end();
  else res.end(asset ?? (response.file === 'robots.txt' ? maintenanceRobots : safeMaintenanceHtml()));
  return true;
}
