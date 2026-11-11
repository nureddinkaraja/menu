import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Two builds:
//   npm run build -> dist/         (the real site: customer page + /owner dashboard, 3D effects lazy-loaded)
//   VITE_EXPORT=1  -> dist-export/ (customer page only, everything in one chunk so it can be inlined into a single HTML file)
const EXPORT = process.env.VITE_EXPORT === '1';
const root = path.resolve('web');

export default defineConfig({
  root,
  plugins: [react()],
  define: { __EXPORT__: JSON.stringify(EXPORT) },
  build: {
    outDir: path.resolve(EXPORT ? 'dist-export' : 'dist'),
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: EXPORT ? 100_000_000 : 4096,
    cssCodeSplit: !EXPORT,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: EXPORT ? { index: path.join(root, 'index.html') } : { index: path.join(root, 'index.html'), owner: path.join(root, 'owner.html') },
      output: EXPORT ? { codeSplitting: false } : {},
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000', '/media': 'http://localhost:3000' },
  },
});
