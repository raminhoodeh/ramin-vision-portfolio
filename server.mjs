import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleAiRaminFeedbackRequest, handleAiRaminRequest } from './server/aiRaminHandler.mjs';
import { handleMassSocialWisdomRequest } from './server/massSocialWisdomHandler.mjs';
import { CANONICAL_ORIGIN, getPublicPage, normalizePublicPath, routeAliases } from './src/seo/routes.mjs';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PORT = Number(process.env.PORT || 4182);
const CV_REDIRECT_URL =
  'https://drive.google.com/file/d/1t6y6uCX5D0CxaQCbM4iGrNv8FJUctah3/view?usp=sharing';
const PRESENTATION_REDIRECT_URL =
  'https://docs.google.com/presentation/d/1wCDf9rzm3g7lAoDkFw7UWSeDc9PHgUW-/edit?usp=sharing&ouid=110264933146795409149&rtpof=true&sd=true';

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.webmanifest', 'application/manifest+json'],
  ['.webm', 'video/webm'],
  ['.mp4', 'video/mp4'],
  ['.woff2', 'font/woff2'],
  ['.svg', 'image/svg+xml'],
  ['.wasm', 'application/wasm'],
  ['.glb', 'model/gltf-binary'],
  ['.gltf', 'model/gltf+json'],
  ['.hdr', 'application/octet-stream'],
  ['.ktx2', 'image/ktx2'],
]);

function sendText(res, statusCode, text) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

function redirect(res, destination, status = 307) {
  res.statusCode = status;
  res.setHeader('Location', destination);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(`Redirecting to ${destination}`);
}

function getSafeDistPath(urlPathname) {
  try {
    const pathname = decodeURIComponent(urlPathname);
    if (pathname.includes('\0') || pathname.includes('\\')) return null;
    const requestedPath = path.resolve(DIST_DIR, `.${pathname}`);
    return requestedPath === DIST_DIR || requestedPath.startsWith(`${DIST_DIR}${path.sep}`) ? requestedPath : null;
  } catch { return null; }
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const normalized = normalizePublicPath(requestUrl.pathname);
  const page = getPublicPage(requestUrl.pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendText(res, 405, 'Method not allowed');
    return;
  }
  if (normalized && routeAliases[normalized] && routeAliases[normalized] !== normalized) {
    redirect(res, routeAliases[normalized] + requestUrl.search, 308);
    return;
  }
  if (normalized && page && requestUrl.pathname !== normalized) {
    redirect(res, normalized + requestUrl.search, 308);
    return;
  }
  if (requestUrl.pathname.endsWith('.html') && requestUrl.pathname !== '/404.html') {
    const cleanPath = requestUrl.pathname === '/index.html' ? '/' : requestUrl.pathname.slice(0, -5);
    if (getPublicPage(cleanPath)) { redirect(res, cleanPath + requestUrl.search, 308); return; }
  }
  let filePath = page ? path.join(DIST_DIR, page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`) : getSafeDistPath(requestUrl.pathname);

  if (!filePath) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) filePath = null;
  } catch {
    filePath = null;
  }

  if (!filePath) {
    const errorPage = path.join(DIST_DIR, '404.html');
    if (existsSync(errorPage)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex');
      if (req.method === 'HEAD') res.end(); else createReadStream(errorPage).pipe(res);
      return;
    }
    sendText(res, 404, 'Build output not found. Run npm run build first.');
    return;
  }

  res.statusCode = requestUrl.pathname === '/404.html' ? 404 : 200;
  res.setHeader('Content-Type', MIME_TYPES.get(path.extname(filePath)) || 'application/octet-stream');
  if (req.method === 'HEAD') res.end(); else createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/presentation' || requestUrl.pathname === '/presentation/') {
    redirect(res, PRESENTATION_REDIRECT_URL);
    return;
  }

  if (requestUrl.pathname === '/cv' || requestUrl.pathname === '/cv/') {
    redirect(res, CV_REDIRECT_URL);
    return;
  }

  if ((req.headers.host || '').split(':')[0].toLowerCase() === 'ramin.vision' && !requestUrl.pathname.startsWith('/api/')) {
    redirect(res, CANONICAL_ORIGIN + requestUrl.pathname + requestUrl.search, 308);
    return;
  }

  if (requestUrl.pathname === '/api/ai-ramin') {
    void handleAiRaminRequest(req, res).catch((error) => {
      console.error(error);
      sendText(res, 500, 'AI Ramin request failed.');
    });
    return;
  }

  if (requestUrl.pathname === '/api/ai-ramin/feedback') {
    void handleAiRaminFeedbackRequest(req, res).catch((error) => {
      console.error(error);
      sendText(res, 500, 'AI Ramin feedback failed.');
    });
    return;
  }

  if (requestUrl.pathname.startsWith('/api/mass-social-wisdom')) {
    void handleMassSocialWisdomRequest(req, res).catch((error) => {
      console.error(error);
      sendText(res, 500, 'Mass Social Wisdom request failed.');
    });
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    sendText(res, 404, 'API route not found.');
    return;
  }

  void serveStatic(req, res).catch((error) => {
    console.error(error);
    sendText(res, 500, 'Server error.');
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Portfolio server running at http://127.0.0.1:${PORT}`);
});
