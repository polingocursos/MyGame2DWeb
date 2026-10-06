// ============================================================
//  PLAYER — Caixa jogável com física simples
// ============================================================
// Futuramente: substituir a caixa por AnimatedSprite com spritesheet
// ============================================================

import { Graphics, Container } from 'pixi.js';
import { input } from '../../core/input/InputManager.js';
import {
  PLAYER_W, PLAYER_H,
  PLAYER_SPEED, PLAYER_ACCEL, PLAYER_AIR_ACCEL, PLAYER_DECEL,
  GRAVITY, JUMP_FORCE, GROUND_Y,
} from '../../constants.js';

export class Player {
  /**
   * @param {Container} worldContainer  Container do mundo onde o player vive
   */
  constructor(worldContainer) {
    // Posição no espaço do mundo (coordenadas reais)
    this.x = 200;
    this.y = GROUND_Y - PLAYER_H;

    // Velocidades
    this.vx = 0;
    this.vy = 0;

    // Estado
    this.onGround  = true;
    this.facingRight = true;
    this._prevJump = false;
    this._coyoteTime = 0;   // Tempo de graça para pular após sair de plataforma
    this._jumpBuffer = 0;   // Pulo buffered (apertou antes de pousar)

    // Visual (caixa temporária)
    this.container = new Container();
    this._buildGraphics();
    worldContainer.addChild(this.container);
  }

  /** Constrói o visual da caixa do player */
  _buildGraphics() {
    const g = new Graphics();
    const w = PLAYER_W, h = PLAYER_H;

    // Sombra/glow atrás
    g.roundRect(-4, -4, w + 8, h + 8, 10)
      .fill({ color: 0x4a9eff, alpha: 0.2 });

    // Corpo principal
    g.roundRect(0, 0, w, h, 6)
      .fill({ color: 0x4a9eff });

    // Highlight lateral (efeito 3D sutil)
    g.roundRect(3, 3, w * 0.35, h - 6, 4)
      .fill({ color: 0x7abfff, alpha: 0.5 });

    // Olho esquerdo — branco
    g.circle(w * 0.28, h * 0.28, 7).fill({ color: 0xffffff });
    // Olho esquerdo — pupila
    g.circle(w * 0.28 + 1.5, h * 0.28, 3.5).fill({ color: 0x0d1b2a });

    // Olho direito — branco
    g.circle(w * 0.72, h * 0.28, 7).fill({ color: 0xffffff });
    // Olho direito — pupila
    g.circle(w * 0.72 + 1.5, h * 0.28, 3.5).fill({ color: 0x0d1b2a });

    // Sorriso (arco)
    g.arc(w / 2, h * 0.52, 8, 0.15, Math.PI - 0.15)
      .stroke({ color: 0x1a3a5c, width: 2 });

    // Label "PLAYER" (temporário, removido ao adicionar sprite)
    // (omitido para não poluir)

    this.container.addChild(g);
    this._gfx = g;
  }

  /** Atualiza física e input do player */
  update(delta) {
    const dt = delta / 60; // segundos por frame

    // ── Coyote time & jump buffer ──────────────────────────
    if (this.onGround) this._coyoteTime = 0.1;
    else this._coyoteTime = Math.max(0, this._coyoteTime - dt);

    if (input.jump && !this._prevJump) this._jumpBuffer = 0.12;
    else this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);

    // ── Horizontal ────────────────────────────────────────
    const accel = this.onGround ? PLAYER_ACCEL : PLAYER_AIR_ACCEL;

    if (input.left) {
      this.vx = Math.max(this.vx - accel * dt, -PLAYER_SPEED);
      this.facingRight = false;
    } else if (input.right) {
      this.vx = Math.min(this.vx + accel * dt, PLAYER_SPEED);
      this.facingRight = true;
    } else {
      // Desacelera até parar
      const decel = PLAYER_DECEL * dt;
      if (this.vx > 0) this.vx = Math.max(this.vx - decel, 0);
      else if (this.vx < 0) this.vx = Math.min(this.vx + decel, 0);
    }

    // ── Pulo ──────────────────────────────────────────────
    if (this._jumpBuffer > 0 && this._coyoteTime > 0) {
      this.vy         = JUMP_FORCE;
      this.onGround   = false;
      this._coyoteTime = 0;
      this._jumpBuffer = 0;
    }

    // Corta o pulo ao soltar a tecla (pulo curto/longo)
    if (!input.jump && this.vy < 0) {
      this.vy += GRAVITY * dt * 0.6; // queda mais rápida ao soltar
    }

    this._prevJump = input.jump;

    // ── Gravidade ─────────────────────────────────────────
    this.vy += GRAVITY * dt;

    // ── Aplica movimento ──────────────────────────────────
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // ── Colisão com chão plano ─────────────────────────────
    if (this.y + PLAYER_H >= GROUND_Y) {
      this.y        = GROUND_Y - PLAYER_H;
      this.vy       = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // ── Atualiza visual ───────────────────────────────────
    // Flip horizontal baseado na direção
    this.container.scale.x = this.facingRight ? 1 : -1;
    this.container.x = this.facingRight ? this.x : this.x + PLAYER_W;
    this.container.y = this.y;
  }

  /** Centro do player no espaço mundo (para câmera) */
  get centerX() { return this.x + PLAYER_W / 2; }
  get centerY() { return this.y + PLAYER_H / 2; }

  destroy() {
    this.container.destroy({ children: true });
  }
}
