import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleAiRaminRequest } from './server/aiRaminHandler.mjs';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PORT = Number(process.env.PORT || 4182);

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
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

function getSafeDistPath(urlPathname) {
  const pathname = urlPathname === '/' ? '/index.html' : decodeURIComponent(urlPathname);
  const requestedPath = path.normalize(path.join(DIST_DIR, pathname));
  return requestedPath.startsWith(DIST_DIR) ? requestedPath : null;
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let filePath = getSafeDistPath(requestUrl.pathname);

  if (!filePath) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (!existsSync(filePath)) {
    sendText(res, 404, 'Build output not found. Run npm run build first.');
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES.get(path.extname(filePath)) || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/api/ai-ramin') {
    void handleAiRaminRequest(req, res).catch((error) => {
      console.error(error);
      sendText(res, 500, 'AI Ramin request failed.');
    });
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
