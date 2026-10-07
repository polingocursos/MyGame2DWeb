import { defineConfig } from 'vite';

export default defineConfig({
  // ✅ Paths relativos — funciona em qualquer subpath na Vercel ou outro host
  base: './',
  build: {
    // Necessário para suportar top-level await usado no main.js
    target: 'esnext',
  },
  // ✅ Pré-processa o PixiJS no bundle — reduz drasticamente o tempo de
  // compilação de shaders WebGL no primeiro load (cold start na Vercel)
  optimizeDeps: {
    include: ['pixi.js'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
