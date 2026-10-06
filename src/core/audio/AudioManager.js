// ============================================================
//  AUDIO MANAGER — Gerencia músicas e efeitos sonoros do jogo
// ============================================================
//
//  Uso:
//    audio.playMusic('/assets/audio/lobby.mp3')  → toca com fade in
//    audio.stopMusic()                           → para com fade out
//    audio.setVolume(0.5)                        → volume global (0-1)
//
// ============================================================

class AudioManager {
  constructor() {
    this._music    = null;   // HTMLAudioElement atual
    this._volume   = 0.5;    // volume padrão
    this._fadeAnim = null;   // animação de fade em curso
  }

  /**
   * Toca uma música com fade in suave.
   * Se já tiver uma música tocando, faz fade out da anterior primeiro.
   * @param {string} src   - Caminho do arquivo (ex: '/assets/audio/lobby.mp3')
   * @param {number} volume - Volume alvo (0-1), padrão = this._volume
   */
  async playMusic(src, volume = this._volume) {
    // Cancela fade em curso
    if (this._fadeAnim) {
      cancelAnimationFrame(this._fadeAnim);
      this._fadeAnim = null;
    }

    // Fade out da música anterior, se houver
    if (this._music && !this._music.paused) {
      await this._fadeOut(this._music, 400);
      this._music.pause();
      this._music.src = '';
    }

    // Cria novo elemento de áudio
    const audio = new Audio(src);
    audio.loop   = true;
    audio.volume = 0;         // começa mudo → fade in
    this._music  = audio;

    // Browsers exigem interação do usuário antes de tocar áudio.
    // Tenta tocar; se falhar, aguarda o primeiro clique/toque.
    const tryPlay = () => {
      audio.play().then(() => {
        this._fadeIn(audio, volume, 800);
      }).catch(() => {
        // Autoplay bloqueado — aguarda interação
        const unlock = () => {
          audio.play().then(() => {
            this._fadeIn(audio, volume, 800);
          }).catch(() => {});
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown',     unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown',     unlock, { once: true });
      });
    };

    tryPlay();
  }

  /**
   * Para a música atual com fade out suave.
   * @param {number} duration - duração do fade em ms
   */
  async stopMusic(duration = 600) {
    if (this._fadeAnim) {
      cancelAnimationFrame(this._fadeAnim);
      this._fadeAnim = null;
    }
    if (this._music) {
      await this._fadeOut(this._music, duration);
      this._music.pause();
      this._music.src = '';
      this._music = null;
    }
  }

  /**
   * Ajusta o volume global (afeta a música atual e futuras).
   * @param {number} v - 0.0 a 1.0
   */
  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._music) this._music.volume = this._volume;
  }

  /**
   * Som de clique suave (gerado via Web Audio API — sem arquivo necessário).
   * Chamar em qualquer botão interativo.
   */
  playClick() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.09);
      osc.onended = () => ctx.close();
    } catch { /* browser sem suporte — ignora */ }
  }

  // ── Internos ────────────────────────────────────────────────

  _fadeIn(audio, targetVol, durationMs) {
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      audio.volume = t * targetVol;
      if (t < 1) this._fadeAnim = requestAnimationFrame(tick);
      else        this._fadeAnim = null;
    };
    this._fadeAnim = requestAnimationFrame(tick);
  }

  _fadeOut(audio, durationMs) {
    return new Promise(resolve => {
      const startVol  = audio.volume;
      const startTime = performance.now();
      const tick = (now) => {
        const t = Math.min((now - startTime) / durationMs, 1);
        audio.volume = startVol * (1 - t);
        if (t < 1) this._fadeAnim = requestAnimationFrame(tick);
        else { this._fadeAnim = null; resolve(); }
      };
      this._fadeAnim = requestAnimationFrame(tick);
    });
  }
}

// Singleton global — importar de qualquer lugar
export const audio = new AudioManager();
