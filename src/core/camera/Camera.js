// ============================================================
//  CAMERA — Câmera 2D com lerp que segue o player
// ============================================================
// Como funciona:
//   - camera.x/y = coordenadas do canto superior esquerdo da visão
//   - Aplicado ao worldContainer: worldContainer.x = -camera.x
//   - Lerp: interpolação suave para evitar movimento brusco
// ============================================================

import { SCREEN_W, SCREEN_H, CAM_LERP_X, CAM_LERP_Y, CAM_LEAD } from '../../constants.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this._leadDir = 0; // direção atual do player: -1, 0, +1
  }

  /**
   * Atualiza a posição da câmera suavemente em direção ao target.
   * @param {object} target  - { x, y } coordenadas do centro do player no mundo
   * @param {number} delta   - ticker.deltaTime do PixiJS (frames, ~1 a 60fps normal)
   */
  update(target, delta) {
    // dt normalizado: 1.0 = frame perfeito a 60fps
    const dt = delta / 60;

    // Alvo da câmera: player centralizado + lead horizontal
    const targetX = target.x - SCREEN_W / 2 + this._leadDir * CAM_LEAD;
    const targetY = target.y - SCREEN_H * 0.58; // player levemente acima do centro

    // Lerp suave (independente do framerate via dt)
    const lerpFactorX = 1 - Math.pow(1 - CAM_LERP_X, 60 * dt);
    const lerpFactorY = 1 - Math.pow(1 - CAM_LERP_Y, 60 * dt);

    this.x += (targetX - this.x) * lerpFactorX;
    this.y += (targetY - this.y) * lerpFactorY;
  }

  /**
   * Aplica a câmera a um Container do PixiJS.
   * Move o world container na direção oposta ao da câmera.
   * @param {Container} worldContainer
   */
  apply(worldContainer) {
    worldContainer.x = Math.round(-this.x);
    worldContainer.y = Math.round(-this.y);
  }

  /**
   * Define a direção de "lead" (antecipação do movimento).
   * @param {number} dir  -1 = esquerda | 0 = parado | +1 = direita
   */
  setLead(dir) {
    // Suaviza a troca de direção
    const target = dir;
    this._leadDir += (target - this._leadDir) * 0.05;
  }

  /** Teleporta câmera instantaneamente para uma posição (sem lerp) */
  snapTo(x, y) {
    this.x = x - SCREEN_W / 2;
    this.y = y - SCREEN_H / 2;
  }
}
