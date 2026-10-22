import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

// Vite transforms the existing TSX for server-side rendering only. It never
// listens, builds an application bundle, copies public assets, or calls APIs.
export async function renderMaintenanceDesign(root = repositoryRoot) {
  const server = await createServer({
    configFile: false,
    root: path.resolve(root),
    publicDir: false,
    appType: 'custom',
    logLevel: 'error',
    plugins: [react()],
    css: { postcss: { plugins: [] } },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true },
  });

  try {
    const { renderOriginalMaintenance } = await server.ssrLoadModule('/site/renderOriginalMaintenance.tsx');
    return renderOriginalMaintenance();
  } finally {
    await server.close();
  }
}
