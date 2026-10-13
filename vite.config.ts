import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Frontend calls /api/EdDSA-island/* → EdDSA-island :8080 /*
      '/api/EdDSA-island': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/EdDSA-island/, ''),
      },
      // Other /api/* → trading-formula Go backend :3344
      '/api': {
        target: 'http://localhost:3344',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
});
