// ============================================================
//  LOBBY SCENE — Tela inicial com botão PLAY + partículas neon
// ============================================================

import { Container, Sprite, Graphics, Assets } from 'pixi.js';
import { SCREEN_W, SCREEN_H, LOBBY_BG, LOBBY_PLAY_BTN, LOBBY_MUSIC } from '../../constants.js';
import { audio } from '../../core/audio/AudioManager.js';

// Cores neon para as estrelas
const NEON_COLORS = [
  0x00ffff,   // ciano
  0xff00ff,   // magenta
  0xffff00,   // amarelo
  0x00ff88,   // verde neon
  0xff4488,   // rosa neon
  0x88aaff,   // azul claro
  0xffffff,   // branco
];

const PARTICLE_COUNT = 80;

export class LobbyScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.container    = new Container();
    this._tickFns     = [];
    this._particles   = [];
  }

  async init(app) {
    this._app = app;

    // ── Fundo ───────────────────────────────────────────────
    const bgTex = Assets.get(LOBBY_BG);
    const bg    = new Sprite(bgTex);
    bg.width    = SCREEN_W;
    bg.height   = SCREEN_H;
    this.container.addChild(bg);

    // ── Partículas neon / estrelas ───────────────────────────
    this._buildParticles(app);

    // ── Botão PLAY ───────────────────────────────────────────
    try {
      const btnTex = await Assets.load(LOBBY_PLAY_BTN);
      this._addPlayButton(app, btnTex);
    } catch {
      console.warn('[LobbyScene] play-button.png não encontrado em /assets/lobby/');
    }

    // ── Música ───────────────────────────────────────────────
    audio.playMusic(LOBBY_MUSIC, 0.45);
  }

  // ── Sistema de partículas neon ─────────────────────────────
  _buildParticles(app) {
    const container = new Container();
    this.container.addChild(container);

    // Inicializa partículas com posições aleatórias
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = this._createParticle(true);
      this._particles.push(p);
      container.addChild(p.gfx);
    }

    const particleFn = (ticker) => {
      const dt = ticker.deltaTime;
      for (const p of this._particles) {
        p.y    += p.vy * dt;
        p.x    += p.vx * dt;
        p.life -= dt;

        // Pulsa o alpha — simula brilho
        p.pulse += p.pulseSpeed * dt;
        const pulseAlpha = p.baseAlpha * (0.55 + 0.45 * Math.sin(p.pulse));
        p.gfx.alpha = pulseAlpha;
        p.gfx.x     = p.x;
        p.gfx.y     = p.y;

        // Gira levemente
        p.gfx.rotation += p.spin * dt;

        // Reinicia quando sai da tela
        if (p.y > SCREEN_H + 20 || p.life <= 0) {
          this._resetParticle(p, false);
        }
      }
    };
    app.ticker.add(particleFn);
    this._tickFns.push(particleFn);
  }

  /** Cria objeto de partícula. Se `scattered` distribui pela tela toda (início). */
  _createParticle(scattered = false) {
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const size  = 1.5 + Math.random() * 3.5;   // 1.5 → 5px

    const gfx = new Graphics();
    this._drawStar(gfx, size, color);

    const p = {
      gfx,
      x:          Math.random() * SCREEN_W,
      y:          scattered ? Math.random() * SCREEN_H : -10 - Math.random() * 80,
      vx:         (Math.random() - 0.5) * 0.6,   // leve deriva lateral
      vy:         0.5 + Math.random() * 1.8,       // velocidade de queda
      spin:       (Math.random() - 0.5) * 0.04,
      pulse:      Math.random() * Math.PI * 2,
      pulseSpeed: 0.06 + Math.random() * 0.08,
      baseAlpha:  0.5 + Math.random() * 0.5,
      life:       Infinity,
    };
    gfx.x = p.x;
    gfx.y = p.y;
    return p;
  }

  /** Reinicia partícula no topo */
  _resetParticle(p, scattered) {
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const size  = 1.5 + Math.random() * 3.5;
    p.gfx.clear();
    this._drawStar(p.gfx, size, color);

    p.x          = Math.random() * SCREEN_W;
    p.y          = -10 - Math.random() * 40;
    p.vx         = (Math.random() - 0.5) * 0.6;
    p.vy         = 0.5 + Math.random() * 1.8;
    p.spin       = (Math.random() - 0.5) * 0.04;
    p.pulse      = Math.random() * Math.PI * 2;
    p.pulseSpeed = 0.06 + Math.random() * 0.08;
    p.baseAlpha  = 0.5 + Math.random() * 0.5;
    p.life       = Infinity;
  }

  /** Desenha uma estrela de 4 pontas neon */
  _drawStar(gfx, size, color) {
    const outer = size;
    const inner = size * 0.35;
    const pts   = 4;

    // Brilho suave ao redor (halo)
    gfx.circle(0, 0, outer * 2.2).fill({ color, alpha: 0.12 });

    // Corpo da estrela
    const path = [];
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI) / pts - Math.PI / 2;
      const r     = i % 2 === 0 ? outer : inner;
      path.push(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    gfx.poly(path).fill({ color, alpha: 1 });

    // Centro brilhante
    gfx.circle(0, 0, outer * 0.4).fill({ color: 0xffffff, alpha: 0.9 });
  }

  // ── Botão PLAY ─────────────────────────────────────────────
  _addPlayButton(app, btnTex) {
    const btn = new Sprite(btnTex);

    const targetW = 320;
    const scale   = targetW / btnTex.width;
    btn.scale.set(scale);
    btn.anchor.set(0.5, 0.5);
    btn.x = SCREEN_W / 2;
    btn.y = SCREEN_H * 0.65;

    btn.interactive = true;
    btn.cursor      = 'pointer';
    this.container.addChild(btn);

    let time         = 0;
    let targetScale  = scale;
    let currentScale = scale;
    const baseY      = btn.y;

    const animFn = (ticker) => {
      time += ticker.deltaTime * 0.045;
      btn.y         = baseY + Math.sin(time) * 7;
      currentScale += (targetScale - currentScale) * 0.12;
      btn.scale.set(currentScale);
    };
    app.ticker.add(animFn);
    this._tickFns.push(animFn);

    btn.on('pointerover',  () => { targetScale = scale * 1.08; });
    btn.on('pointerout',   () => { targetScale = scale; });
    btn.on('pointerdown',  () => { targetScale = scale * 0.95; });
    btn.on('pointerup',    () => {
      audio.playClick();
      targetScale = scale * 1.08;
      this.sceneManager.startGame();
    });
  }

  destroy() {
    this._tickFns.forEach(fn => this._app.ticker.remove(fn));
    this.container.destroy({ children: true });
    this._particles = [];
  }
}
