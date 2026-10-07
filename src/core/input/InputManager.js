// ============================================================
//  INPUT MANAGER — Teclado + Touch (singleton global)
// ============================================================

class InputManager {
  constructor() {
    this._keys     = {};
    this._prevKeys = {};
    this._touch    = { left: false, right: false, jump: false };
    this._prevTouch = { left: false, right: false, jump: false };

    // ── Teclado ───────────────────────────────────────────────
    this._onDown = this._onKeyDown.bind(this);
    this._onUp   = this._onKeyUp.bind(this);
    window.addEventListener('keydown', this._onDown);
    window.addEventListener('keyup',   this._onUp);

    // ── Touch — ativa controles visuais em mobile ─────────────
    this._initTouch();
  }

  // ── Teclado ─────────────────────────────────────────────────
  _onKeyDown(e) {
    this._keys[e.code] = true;
    if (['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this._keys[e.code] = false;
  }

  // ── Touch Controls ──────────────────────────────────────────
  _initTouch() {
    // Detecta se é mobile/touch device
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
                  || ('ontouchstart' in window && window.innerWidth < 1024);
    if (!isMobile) return;

    // Mostra a camada de controles touch
    const tc = document.getElementById('touch-controls');
    if (tc) tc.style.display = 'block';

    // Helper: bind pointerdown/up em qualquer elemento do dpad
    const bindBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this._touch[action] = true;
        el.classList.add('pressed');
        el.setPointerCapture(e.pointerId);
      });

      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        this._touch[action] = false;
        el.classList.remove('pressed');
      });

      el.addEventListener('pointercancel', () => {
        this._touch[action] = false;
        el.classList.remove('pressed');
      });

      // Suporte a touch direto (fallback)
      el.addEventListener('touchstart', (e) => { e.preventDefault(); this._touch[action] = true;  el.classList.add('pressed'); }, { passive: false });
      el.addEventListener('touchend',   (e) => { e.preventDefault(); this._touch[action] = false; el.classList.remove('pressed'); }, { passive: false });
    };

    bindBtn('btn-left',  'left');
    bindBtn('btn-right', 'right');
    bindBtn('btn-jump',  'jump');
  }

  /** Chamar no início de cada frame para atualizar estado anterior */
  update() {
    this._prevKeys  = { ...this._keys };
    this._prevTouch = { ...this._touch };
  }

  // ── Getters (teclado OR touch) ───────────────────────────────
  get left()  { return !!(this._keys['ArrowLeft']  || this._keys['KeyA'] || this._touch.left); }
  get right() { return !!(this._keys['ArrowRight'] || this._keys['KeyD'] || this._touch.right); }
  get jump()  { return !!(this._keys['Space'] || this._keys['ArrowUp'] || this._keys['KeyW'] || this._touch.jump); }
  get escape(){ return !!(this._keys['Escape']); }

  /** Retorna true APENAS no primeiro frame que a tecla/botão foi pressionado */
  justPressed(code) {
    // Suporte a pseudo-codes de touch: 'TouchLeft', 'TouchRight', 'TouchJump'
    if (code === 'TouchLeft')  return !!(this._touch.left  && !this._prevTouch.left);
    if (code === 'TouchRight') return !!(this._touch.right && !this._prevTouch.right);
    if (code === 'TouchJump')  return !!(this._touch.jump  && !this._prevTouch.jump);
    if (code === 'Escape')     return !!(this._keys.Escape && !this._prevKeys.Escape);
    return !!(this._keys[code] && !this._prevKeys[code]);
  }

  /** jump justPressed — útil para o player não pular em loop */
  get jumpJustPressed() {
    const kbJump  = !!(
      (this._keys['Space']    && !this._prevKeys['Space'])    ||
      (this._keys['ArrowUp']  && !this._prevKeys['ArrowUp'])  ||
      (this._keys['KeyW']     && !this._prevKeys['KeyW'])
    );
    const touchJump = !!(this._touch.jump && !this._prevTouch.jump);
    return kbJump || touchJump;
  }

  destroy() {
    window.removeEventListener('keydown', this._onDown);
    window.removeEventListener('keyup',   this._onUp);
  }
}

// Exportado como singleton — só existe uma instância
export const input = new InputManager();
