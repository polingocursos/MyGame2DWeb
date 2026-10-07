// ============================================================
//  MAIN — Inicialização do jogo
// ============================================================

import { Application, Assets, TextureSource, RendererType } from 'pixi.js';
import { LobbyScene } from './scenes/lobby/LobbyScene.js';
import { GameScene  } from './scenes/game/GameScene.js';
import { SCREEN_W, SCREEN_H, MAPS, LOBBY_BG, LOBBY_PLAY_BTN } from './constants.js';

// ── Helper: atualiza texto visível na tela de loading ───────
const _sub = document.getElementById('loading-sub');
const _step = (msg) => { if (_sub) _sub.textContent = msg; };

// ── Animação de "aguardando" para redes lentas ──────────────
let _dotInterval = null;
const _stepWaiting = (msg, timeoutMs = 0) => {
  _step(msg);
  clearInterval(_dotInterval);
  if (timeoutMs > 0) {
    const start = Date.now();
    let dots = 0;
    _dotInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - start) / 1000);
      dots = (dots + 1) % 4;
      const bar = '.'.repeat(dots);
      _step(`${msg}${bar} (${elapsed}s)`);
    }, 500);
  }
};
const _stopWaiting = () => clearInterval(_dotInterval);

// ── Promise com timeout ──────────────────────────────────────
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout após ${ms / 1000}s em: ${label}`)), ms)
    ),
  ]);

_step('Iniciando engine...');

// ── Filtro global de textura: linear (evita pixelação) ─────
TextureSource.defaultOptions.scaleMode = 'linear';

// ── Inicialização do renderer com fallback ──────────────────
// NOTA: Sem timeout artificial — PixiJS pode demorar >8s na 1ª visita
// (compilação de shaders WebGL sem cache de GPU no Vercel/HTTPS).

let app;

async function initRenderer() {
  // ── Tentativa 1: WebGL com timeout de 12s (redes lentas / cold start) ──
  _stepWaiting('Iniciando engine WebGL', 12000);
  app = new Application();

  try {
    await withTimeout(
      app.init({
        width:           SCREEN_W,
        height:          SCREEN_H,
        backgroundColor: 0x05050f,
        antialias:       true,
        resolution:      window.devicePixelRatio || 1,
        autoDensity:     true,
        preference:      'webgl',
        powerPreference: 'default',
        rendererOptions: { hello: false },
      }),
      12000,
      'app.init WebGL'
    );
    _stopWaiting();
    console.log('[Main] Renderer iniciado:',
      app.renderer.type === RendererType.WEBGL ? 'WebGL' : 'Canvas');
  } catch (err) {
    _stopWaiting();
    console.warn('[Main] WebGL falhou ou timeout — tentando Canvas...', err.message);
    _step('⚠️ WebGL lento, usando Canvas...');

    // Destruir instância anterior se existir
    try { app.destroy(); } catch (_) {}

    // ── Tentativa 2: Canvas (funciona mesmo em rede lenta) ──
    app = new Application();
    await withTimeout(
      app.init({
        width:           SCREEN_W,
        height:          SCREEN_H,
        backgroundColor: 0x05050f,
        antialias:       false,
        resolution:      1,
        autoDensity:     true,
        preference:      'canvas',
      }),
      10000,
      'app.init Canvas'
    );
    console.log('[Main] Renderer Canvas iniciado como fallback.');
  }
}

try {
  await initRenderer();
} catch (err) {
  _step('❌ Engine falhou: ' + (err?.message || String(err)));
  throw err;
}

_step('Engine OK! Conectando canvas...');

// Injetar canvas no container do HTML
document.getElementById('game-container').appendChild(app.canvas);

// ── Carregamento de assets ──────────────────────────────────
const loadingBar = document.getElementById('loading-bar');

_step('Registrando bundle de assets...');
Assets.addBundle('game', {
  lobbyBg:      LOBBY_BG,
  map1Skybox:   MAPS[1].skybox,
  map1Platform: MAPS[1].platform,
});

_step('Carregando assets... (0%)');
loadingBar.style.width = '20%';
try {
  await Assets.loadBundle('game', (progress) => {
    _step(`Carregando assets... (${Math.round(progress * 100)}%)`);
    loadingBar.style.width = `${20 + progress * 75}%`;
  });
  _step('Assets carregados!');
} catch (err) {
  console.error('[Main] Erro ao carregar assets:', err);
  _step('⚠️ Erro assets: ' + (err?.message || String(err)) + ' — continuando...');
}
loadingBar.style.width = '100%';

_step('Iniciando lobby...');

// Esconder loading screen com fade
await new Promise(resolve => {
  const screen = document.getElementById('loading-screen');
  setTimeout(() => {
    screen.style.opacity = '0';
    setTimeout(() => { screen.style.display = 'none'; resolve(); }, 500);
  }, 300);
});

// ══════════════════════════════════════════════════════════
//  SCENE MANAGER — Controla transição entre cenas
// ══════════════════════════════════════════════════════════
const sceneManager = {
  _currentScene: null,
  _transitioning: false,

  async _setScene(SceneClass) {
    if (this._transitioning) return;
    this._transitioning = true;

    // Fade out
    await this._fade(0, 1, 250);

    // Destruir cena anterior
    if (this._currentScene) {
      this._currentScene.destroy();
      app.stage.removeChildren();
    }

    // Criar e inicializar nova cena
    this._currentScene = new SceneClass(this);
    app.stage.addChild(this._currentScene.container);
    await this._currentScene.init(app);

    // Fade in
    await this._fade(1, 0, 350);
    this._transitioning = false;
  },

  /** Fade usando um overlay no stage */
  _fade(fromAlpha, toAlpha, durationMs) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:absolute; inset:0;
        background:#05050f;
        opacity:${fromAlpha};
        transition:opacity ${durationMs}ms ease;
        pointer-events:none;
        z-index:50;
      `;
      const container = document.getElementById('game-container');
      container.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.opacity = String(toAlpha);
        setTimeout(() => { container.removeChild(overlay); resolve(); }, durationMs + 50);
      });
    });
  },

  async showLobby() { await this._setScene(LobbyScene); },
  async startGame() { await this._setScene(GameScene); },
};

// ── Iniciar com o lobby ─────────────────────────────────────
await sceneManager.showLobby();

// ── Canvas fixo: centralizado, sem esticar ──────────────────
const gameContainer = document.getElementById('game-container');
gameContainer.style.position = 'absolute';
gameContainer.style.left     = '50%';
gameContainer.style.top      = '50%';
gameContainer.style.transform = 'translate(-50%, -50%)';
