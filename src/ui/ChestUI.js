// ============================================================
//  CHEST UI — Baú de recompensa com timer, neon smoke e confetti
// ============================================================
//
//  Imagens necessárias (coloque em public/assets/ui/):
//    chest.png         ← ícone do baú (256×256px ideal)
//    reward-frame.png  ← frame/painel da recompensa
// ============================================================

import { Container, Graphics, Text, Sprite, Assets, BlurFilter } from 'pixi.js';
import { SCREEN_W, SCREEN_H } from '../constants.js';

const CHEST_IMG        = '/assets/ui/chest.png';
const REWARD_FRAME_IMG = '/assets/ui/reward-frame.png';
const COUNTDOWN_SEC    = 60;

// Paleta de cores do neon smoke
const SMOKE_COLORS = [0x00ff88, 0x00ddcc, 0x33ff66, 0x00bb88, 0x55ffaa, 0x00ffcc];
// Paleta do confetti
const CONFETTI_COLORS = [
  0xff3366, 0xff9900, 0xffee00, 0x00ff88,
  0x00ccff, 0xcc44ff, 0xff44cc, 0xffffff,
  0xff6644, 0x44ffcc, 0xffbb00, 0x88aaff,
];

export class ChestUI {
  constructor(uiContainer, app) {
    this._app            = app;
    this._parent         = uiContainer;
    this._elapsed        = 0;
    this._ready          = false;
    this._glowPhase      = 0;
    this._tickFn         = null;
    this._smokeParticles = [];
    this._confetti       = [];
    this._confettiActive = false;

    this._root = new Container();
    uiContainer.addChild(this._root);

    this._buildPromise = this._build();
  }

  /** Aguarda a construção e inicia o timer */
  async start() {
    await this._buildPromise;
    this._elapsed = 0;
    this._ready   = false;
    this._tickFn  = (ticker) => this._update(ticker);
    this._app.ticker.add(this._tickFn);
  }

  // ── Construção visual ──────────────────────────────────────
  async _build() {
    const PAD  = 12;
    const SIZE = 96;

    const cx = SCREEN_W - PAD - SIZE / 2;
    const cy = PAD + SIZE / 2 + 10;
    this._cx   = cx;
    this._cy   = cy;
    this._SIZE = SIZE;

    // ── Container do smoke (fica ATRÁS do baú) ──────────────
    this._smokeContainer = new Container();
    this._smokeContainer.x = cx;
    this._smokeContainer.y = cy;
    this._smokeContainer.visible = false;

    // BlurFilter para borda real difuminada — sem stroke sólido
    this._smokeContainer.filters = [new BlurFilter({ strength: 14, quality: 3 })];
    this._root.addChild(this._smokeContainer);

    // Cria partículas de smoke — apenas círculos, o blur cuida da difusão
    for (let i = 0; i < 14; i++) {
      const g = new Graphics();
      this._smokeContainer.addChild(g);
      this._smokeParticles.push({
        gfx:      g,
        angle:    (i / 14) * Math.PI * 2,
        radius:   32 + Math.random() * 28,
        size:     26 + Math.random() * 32,
        speed:    0.008 + Math.random() * 0.012,
        phase:    Math.random() * Math.PI * 2,
        colorIdx: i % SMOKE_COLORS.length,
      });
    }

    // ── Baú ─────────────────────────────────────────────────
    this._chestContainer = new Container();
    this._chestContainer.x = cx;
    this._chestContainer.y = cy;
    this._root.addChild(this._chestContainer);

    try {
      const tex = await Assets.load(CHEST_IMG);
      const spr = new Sprite(tex);
      spr.anchor.set(0.5);
      spr.scale.set(SIZE / Math.max(tex.width, tex.height));
      this._chestContainer.addChild(spr);
    } catch {
      const g = new Graphics();
      g.roundRect(-SIZE/2, -SIZE/2, SIZE, SIZE * 0.6, 6).fill({ color: 0x8B4513 });
      g.roundRect(-SIZE/2, -SIZE/2, SIZE, SIZE * 0.3, 6).fill({ color: 0xa0522d });
      g.roundRect(-10, -8, 20, 16, 3).fill({ color: 0xffd700 });
      g.roundRect(-SIZE/2, -SIZE/2, SIZE, SIZE * 0.6, 6)
        .stroke({ color: 0x4a2800, width: 2 });
      this._chestContainer.addChild(g);
    }

    // ── Timer ────────────────────────────────────────────────
    this._timerBg = new Graphics();
    this._timerBg.roundRect(-30, 0, 60, 22, 5)
      .fill({ color: 0x000000, alpha: 0.55 });
    this._timerBg.x = cx;
    this._timerBg.y = cy + SIZE / 2 + 4;
    this._root.addChild(this._timerBg);

    this._timerText = new Text({
      text: '01:00',
      style: {
        fontFamily: 'Consolas, monospace',
        fontSize:   13,
        fontWeight: '700',
        fill:       0x00ffcc,
      },
    });
    this._timerText.anchor.set(0.5, 0);
    this._timerText.x = cx;
    this._timerText.y = cy + SIZE / 2 + 6;
    this._root.addChild(this._timerText);

    // ── Container de confetti (overlay, controlado em z-order dinamicamente)
    this._confettiContainer = new Container();
    this._parent.addChild(this._confettiContainer);

    // ── Clique no baú ────────────────────────────────────────
    this._chestContainer.interactive = true;
    this._chestContainer.cursor = 'pointer';
    this._chestContainer.hitArea = {
      contains: (x, y) => Math.abs(x) <= SIZE / 2 && Math.abs(y) <= SIZE / 2,
    };
    this._chestContainer.on('pointerup', () => this._onChestClick());

    // ── Painel de recompensa ─────────────────────────────────
    await this._buildRewardPanel();
  }

  // ── Neon Smoke — borda difuminada via BlurFilter ──────────
  _updateSmoke(dt) {
    this._glowPhase += dt * 0.025;

    for (const p of this._smokeParticles) {
      p.angle += p.speed * dt;
      p.phase += 0.022 * dt;

      const x     = Math.cos(p.angle) * p.radius;
      const y     = Math.sin(p.angle) * p.radius * 0.42; // elipse achatada
      const alpha = 0.18 + 0.14 * Math.sin(p.phase);
      const size  = p.size * (0.88 + 0.12 * Math.sin(p.phase * 1.5));
      const color = SMOKE_COLORS[p.colorIdx];

      p.gfx.clear();
      // Círculo único — o BlurFilter garante a borda difuminada (sem stroke)
      p.gfx.circle(x, y, size).fill({ color, alpha });
      // Núcleo interno mais brilhante para profundidade
      p.gfx.circle(x, y, size * 0.38).fill({ color, alpha: alpha * 1.6 });
    }
  }

  // ── Confetti em tela cheia ────────────────────────────────
  _spawnConfetti() {
    this._confettiActive = true;

    // Mover para o topo do parent → na frente do frame de recompensa
    this._parent.removeChild(this._confettiContainer);
    this._parent.addChild(this._confettiContainer);
    this._confettiContainer.removeChildren();
    this._confetti = [];

    // ── Explosão radial do baú (80 peças) ──────────────────
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const spd   = 6 + Math.random() * 10;
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const g     = new Graphics();
      const w = 5 + Math.random() * 7;
      const h = 3 + Math.random() * 4;
      g.rect(-w/2, -h/2, w, h).fill({ color });
      this._confettiContainer.addChild(g);

      this._confetti.push({
        gfx:     g,
        x:       this._cx + (Math.random() - 0.5) * 40,
        y:       this._cy,
        vx:      Math.cos(angle) * spd,
        vy:      Math.sin(angle) * spd - 4,
        rot:     Math.random() * Math.PI * 2,
        rotV:    (Math.random() - 0.5) * 0.35,
        life:    1.0,
        decay:   0.005 + Math.random() * 0.004,
        gravity: 0.22,
      });
    }

    // ── Chuva de cima — cobre toda a tela (140 peças) ──────
    for (let i = 0; i < 140; i++) {
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const g     = new Graphics();
      const w = 4 + Math.random() * 8;
      const h = 3 + Math.random() * 5;
      g.rect(-w/2, -h/2, w, h).fill({ color });
      this._confettiContainer.addChild(g);

      this._confetti.push({
        gfx:     g,
        x:       Math.random() * SCREEN_W,
        y:       -20 - Math.random() * SCREEN_H * 0.6,  // acima da tela
        vx:      (Math.random() - 0.5) * 3,
        vy:      2 + Math.random() * 4,
        rot:     Math.random() * Math.PI * 2,
        rotV:    (Math.random() - 0.5) * 0.25,
        life:    1.0,
        decay:   0.003 + Math.random() * 0.003,
        gravity: 0.06,
      });
    }
  }

  _updateConfetti(dt) {
    if (!this._confettiActive) return;

    let allDead = true;
    for (const p of this._confetti) {
      if (p.life <= 0) continue;
      allDead = false;

      p.vy  += p.gravity * dt;
      p.x   += p.vx * dt;
      p.y   += p.vy * dt;
      p.rot += p.rotV * dt;
      p.life -= p.decay * dt;

      p.gfx.x        = p.x;
      p.gfx.y        = p.y;
      p.gfx.rotation = p.rot;
      p.gfx.alpha    = Math.max(0, p.life);
    }

    if (allDead) {
      this._confettiActive = false;
      this._confettiContainer.removeChildren();
      this._confetti = [];
    }
  }

  // ── Loop principal ─────────────────────────────────────────
  _update(ticker) {
    if (!this._timerText || !this._smokeContainer || !this._chestContainer) return;

    const dt = ticker.deltaTime;

    // Confetti (independente do estado)
    this._updateConfetti(dt);

    if (this._ready) {
      // Smoke neon ativo
      this._smokeContainer.visible = true;
      this._updateSmoke(dt);

      // Baú balança levemente
      this._glowPhase += dt * 0.07;
      this._chestContainer.rotation = Math.sin(this._glowPhase * 1.5) * 0.06;
      return;
    }

    // Timer
    this._elapsed += dt / 60;
    const remaining = Math.max(0, COUNTDOWN_SEC - this._elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    this._timerText.text = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this._timerText.style.fill = remaining <= 10 ? 0xff4444 : 0x00ffcc;

    if (remaining <= 0) {
      this._ready = true;
      this._timerText.text       = 'PRONTO!';
      this._timerText.style.fill = 0x00ff66;
    }
  }

  // ── Clique no baú ─────────────────────────────────────────
  _onChestClick() {
    if (this._ready) this._spawnConfetti();

    if (this._rewardRoot) {
      this._rewardRoot.visible = true;
    }
  }

  // ── Painel de recompensa ───────────────────────────────────
  async _buildRewardPanel() {
    this._rewardRoot = new Container();
    this._rewardRoot.visible = false;
    this._parent.addChild(this._rewardRoot);

    const overlay = new Graphics();
    overlay.rect(0, 0, SCREEN_W, SCREEN_H).fill({ color: 0x000000, alpha: 0.65 });
    overlay.interactive = true;
    this._rewardRoot.addChild(overlay);

    const FW = 480, FH = 320;
    const fx  = SCREEN_W / 2;
    const fy  = SCREEN_H / 2;

    try {
      const tex = await Assets.load(REWARD_FRAME_IMG);
      const spr = new Sprite(tex);
      spr.anchor.set(0.5);
      spr.width  = FW;
      spr.height = FH;
      spr.x = fx;
      spr.y = fy;
      this._rewardRoot.addChild(spr);
    } catch {
      const panel = new Graphics();
      panel.roundRect(fx - FW/2, fy - FH/2, FW, FH, 16)
        .fill({ color: 0x1a0a2e });
      panel.roundRect(fx - FW/2, fy - FH/2, FW, FH, 16)
        .stroke({ color: 0x00ff66, width: 3 });
      this._rewardRoot.addChild(panel);

      const rewardTitle = new Text({
        text: '🎁  RECOMPENSA',
        style: {
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: 28, fontWeight: '700', fill: 0x00ff88,
        },
      });
      rewardTitle.anchor.set(0.5);
      rewardTitle.x = fx;
      rewardTitle.y = fy - 60;
      this._rewardRoot.addChild(rewardTitle);

      const coming = new Text({
        text: '(recompensa em breve)',
        style: { fontFamily: 'Consolas, monospace', fontSize: 16, fill: 0xaaaacc },
      });
      coming.anchor.set(0.5);
      coming.x = fx;
      coming.y = fy + 10;
      this._rewardRoot.addChild(coming);
    }

    // Botão fechar
    const closeBtn = new Graphics();
    closeBtn.roundRect(0, 0, 36, 36, 8).fill({ color: 0xff3355 });
    closeBtn.x = fx + FW / 2 - 46;
    closeBtn.y = fy - FH / 2 + 10;
    closeBtn.interactive = true;
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerup', () => { this._rewardRoot.visible = false; });
    this._rewardRoot.addChild(closeBtn);

    const closeX = new Text({
      text: '✕',
      style: { fontFamily: 'Arial', fontSize: 18, fontWeight: '700', fill: 0xffffff },
    });
    closeX.anchor.set(0.5);
    closeX.x = closeBtn.x + 18;
    closeX.y = closeBtn.y + 18;
    this._rewardRoot.addChild(closeX);
  }

  destroy() {
    if (this._tickFn) this._app.ticker.remove(this._tickFn);
    this._root.destroy({ children: true });
    if (this._rewardRoot)        this._rewardRoot.destroy({ children: true });
    if (this._confettiContainer) this._confettiContainer.destroy({ children: true });
  }
}
