// ============================================================
//  MAIN — Inicialização do jogo
// ============================================================

import { Application, Assets, TextureSource } from 'pixi.js';
import { LobbyScene } from './scenes/lobby/LobbyScene.js';
import { GameScene  } from './scenes/game/GameScene.js';
import { SCREEN_W, SCREEN_H, MAPS, LOBBY_BG, LOBBY_PLAY_BTN } from './constants.js';

// ── Helper: atualiza texto visível na tela de loading ───────
const _sub = document.getElementById('loading-sub');
const _step = (msg) => { if (_sub) _sub.textContent = msg; };

_step('Iniciando engine PixiJS...');

// ── Filtro global de textura: linear (evita pixelação) ─────
TextureSource.defaultOptions.scaleMode = 'linear';

// ── Aplicação PixiJS ────────────────────────────────────────
const app = new Application();

await app.init({
  width:           SCREEN_W,
  height:          SCREEN_H,
  backgroundColor: 0x05050f,
  antialias:       true,
  resolution:      window.devicePixelRatio || 1,
  autoDensity:     true,
});

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
      const { Graphics } = /** @type {any} */ (window).__pixiImports ?? {};
      // Cria overlay de fade diretamente
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
