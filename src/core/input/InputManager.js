// ============================================================
//  INPUT MANAGER — Gerencia teclado (singleton global)
// ============================================================

class InputManager {
  constructor() {
    this._keys = {};
    this._prevKeys = {};
    this._onDown = this._onKeyDown.bind(this);
    this._onUp   = this._onKeyUp.bind(this);
    window.addEventListener('keydown', this._onDown);
    window.addEventListener('keyup',   this._onUp);
  }

  _onKeyDown(e) {
    this._keys[e.code] = true;
    // Previne scroll da página com teclas do jogo
    if (['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this._keys[e.code] = false;
  }

  /** Chamar no início de cada frame para atualizar estado anterior */
  update() {
    this._prevKeys = { ...this._keys };
  }

  // ── Getters de estado ──────────────────────────────────────
  get left()  { return !!(this._keys['ArrowLeft']  || this._keys['KeyA']); }
  get right() { return !!(this._keys['ArrowRight'] || this._keys['KeyD']); }
  get jump()  { return !!(this._keys['Space'] || this._keys['ArrowUp'] || this._keys['KeyW']); }
  get escape(){ return !!(this._keys['Escape']); }

  /** Retorna true APENAS no primeiro frame que a tecla foi pressionada */
  justPressed(code) {
    return !!(this._keys[code] && !this._prevKeys[code]);
  }

  destroy() {
    window.removeEventListener('keydown', this._onDown);
    window.removeEventListener('keyup',   this._onUp);
  }
}

// Exportado como singleton — só existe uma instância
export const input = new InputManager();
