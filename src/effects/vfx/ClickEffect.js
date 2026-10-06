// ============================================================
//  CLICK EFFECT — Efeito visual satisfatório em todo clique
// ============================================================
//
//  Como usar:
//    const clickFX = new ClickEffect(app);
//    // no destroy da cena:
//    clickFX.destroy();
//
// ============================================================

import { Container, Graphics } from 'pixi.js';

const SPARK_COLORS = [
  0xffffff, 0xffee55, 0xff9933,
  0x44eeff, 0xff55cc, 0x88ff55, 0xffaaff,
];

export class ClickEffect {
  constructor(app) {
    this._app        = app;
    this._particles  = [];
    this._container  = new Container();
    // Sempre no topo do stage
    app.stage.addChild(this._container);

    // Listener no canvas (captura qualquer clique)
    this._onPointerDown = (e) => {
      const rect   = app.canvas.getBoundingClientRect();
      const scaleX = app.screen.width  / rect.width;
      const scaleY = app.screen.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top)  * scaleY;
      this._spawnEffect(x, y);
    };
    app.canvas.addEventListener('pointerdown', this._onPointerDown);

    this._tickFn = (ticker) => this._update(ticker);
    app.ticker.add(this._tickFn);
  }

  // ── Spawn ─────────────────────────────────────────────────
  _spawnEffect(x, y) {
    // ── Flash central ──────────────────────────────────────
    const flash = new Graphics();
    flash.circle(0, 0, 20).fill({ color: 0xffffff, alpha: 0.75 });
    flash.x = x;
    flash.y = y;
    this._container.addChild(flash);
    this._particles.push({ type: 'flash', gfx: flash, life: 1.0, decay: 0.13 });

    // ── Anéis expansivos ───────────────────────────────────
    const ringColors  = [0xffffff, 0x66ddff, 0xffcc44];
    const ringSpeeds  = [5.5, 3.5, 4.8];
    const ringDecays  = [0.06, 0.04, 0.05];
    for (let r = 0; r < 3; r++) {
      const ring = new Graphics();
      this._container.addChild(ring);
      this._particles.push({
        type:    'ring',
        gfx:     ring,
        x, y,
        radius:  4 + r * 6,
        speed:   ringSpeeds[r],
        color:   ringColors[r],
        strokeW: 2.5 - r * 0.4,
        life:    1.0,
        decay:   ringDecays[r],
      });
    }

    // ── Sparks radiais ─────────────────────────────────────
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const spd   = 3 + Math.random() * 5;
      const size  = 1.8 + Math.random() * 2.5;
      const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

      const g = new Graphics();
      g.circle(0, 0, size).fill({ color });
      this._container.addChild(g);

      this._particles.push({
        type:    'spark',
        gfx:     g,
        x, y,
        vx:      Math.cos(angle) * spd,
        vy:      Math.sin(angle) * spd,
        life:    1.0,
        decay:   0.03 + Math.random() * 0.03,
        gravity: 0.13,
      });
    }

    // ── Mini-sparks densos ─────────────────────────────────
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 1 + Math.random() * 3;
      const g = new Graphics();
      g.circle(0, 0, 1.2).fill({ color: 0xffffff });
      this._container.addChild(g);

      this._particles.push({
        type:    'spark',
        gfx:     g,
        x:       x + (Math.random() - 0.5) * 10,
        y:       y + (Math.random() - 0.5) * 10,
        vx:      Math.cos(angle) * spd,
        vy:      Math.sin(angle) * spd,
        life:    1.0,
        decay:   0.05 + Math.random() * 0.04,
        gravity: 0.08,
      });
    }
  }

  // ── Update loop ───────────────────────────────────────────
  _update(ticker) {
    const dt = ticker.deltaTime;
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        p.gfx.destroy();
        this._particles.splice(i, 1);
        continue;
      }

      const t = Math.max(0, p.life);

      if (p.type === 'flash') {
        p.gfx.scale.set(1 + (1 - t) * 2.2);
        p.gfx.alpha = t * t;

      } else if (p.type === 'ring') {
        p.radius += p.speed * dt;
        p.gfx.clear();
        p.gfx.circle(p.x, p.y, p.radius)
          .stroke({ color: p.color, width: p.strokeW, alpha: t * 0.85 });

      } else if (p.type === 'spark') {
        p.vy += p.gravity * dt;
        p.x  += p.vx * dt;
        p.y  += p.vy * dt;
        p.vx *= 0.97;
        p.gfx.x     = p.x;
        p.gfx.y     = p.y;
        p.gfx.alpha = t;
      }
    }
  }

  destroy() {
    if (this._tickFn) this._app.ticker.remove(this._tickFn);
    this._app.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this._container.destroy({ children: true });
  }
}
