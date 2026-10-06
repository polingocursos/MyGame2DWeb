import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Necessário para suportar top-level await usado no main.js
    // (ex: await app.init(), await Assets.loadBundle(), etc.)
    target: 'esnext',
  },
});
