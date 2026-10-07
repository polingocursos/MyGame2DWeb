import { defineConfig } from 'vite';

export default defineConfig({
  // ✅ Paths relativos — funciona em qualquer subpath na Vercel ou outro host
  base: './',

  build: {
    // Necessário para suportar top-level await usado no main.js
    target: 'esnext',

    // Aviso de chunk grande só acima de 1MB (PixiJS v8 é ~700KB min)
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // ✅ PixiJS v8 usa pacote único 'pixi.js' — split correto para v8
        manualChunks(id) {
          // Separa todo o PixiJS em um chunk dedicado
          if (id.includes('node_modules/pixi.js') || id.includes('node_modules/@pixi')) {
            return 'pixi';
          }
          // Separa cenas pesadas em chunks lazy (carregam só quando necessário)
          if (id.includes('/scenes/game/')) {
            return 'scene-game';
          }
          if (id.includes('/scenes/lobby/')) {
            return 'scene-lobby';
          }
        },
      },
    },
  },

  // ✅ Pre-bundle do PixiJS v8 com esbuild — reduz parse time no browser
  optimizeDeps: {
    include: ['pixi.js'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
