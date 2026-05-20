import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { handleAiRaminRequest } from './server/aiRaminHandler.mjs';

const decoderAssetFileName = (assetInfo) => {
  const names = [
    ...(assetInfo.names ?? []),
    ...(assetInfo.originalFileNames ?? []),
    assetInfo.name,
  ].filter(Boolean);
  const fileName = names.map((name) => name.split('/').pop()).find(Boolean);

  if (fileName === 'basis_transcoder.js' || fileName === 'basis_transcoder.wasm') {
    return 'basis/[name][extname]';
  }

  if (fileName === 'draco_wasm_wrapper.js' || fileName === 'draco_decoder.wasm') {
    return 'draco/gltf/[name][extname]';
  }

  return 'assets/[name]-[hash][extname]';
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ai-ramin-api',
      configureServer(server) {
        server.middlewares.use('/api/ai-ramin', (req, res) => {
          void handleAiRaminRequest(req, res).catch((error) => {
            console.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'AI Ramin request failed.' }));
          });
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['@shadergradient/react'],
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      ignored: ['**/shadergradient-main/**', '**/react libraries/**'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: decoderAssetFileName,
      },
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.ktx2'],
});
