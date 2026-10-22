import { fileURLToPath } from 'node:url';
import { maintenanceEnabled, maintenanceHeaders, maintenanceResponse, maintenanceRobots } from '../site/maintenance.mjs';
import { homepageBio, maintenanceDocument } from '../site/maintenanceDocument.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
let html;

function safeMaintenanceHtml() {
  if (!html) {
    try { html = maintenanceDocument(homepageBio(root)); }
    catch {
      // A separately built API function may not contain the frontend source.
      // Remain closed even then, without loading its normal provider handler.
      html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Under construction</title></head><body><h1>Under construction</h1><p>Please check back soon.</p></body></html>';
    }
  }
  return html;
}

export function blockWhileMaintenance(req, res) {
  if (!maintenanceEnabled) return false;
  const { pathname } = new URL(req.url || '/', 'https://www.ramin.vision');
  const response = maintenanceResponse(pathname, req.method);
  res.statusCode = response.status;
  for (const [name, value] of Object.entries(maintenanceHeaders)) res.setHeader(name, value);
  res.setHeader('Content-Type', response.contentType);
  if (response.retryAfter) res.setHeader('Retry-After', response.retryAfter);
  if (req.method === 'HEAD') res.end();
  else res.end(response.file === 'robots.txt' ? maintenanceRobots : safeMaintenanceHtml());
  return true;
}
