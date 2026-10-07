// ============================================================
//  GAME SCENE — Cena principal do jogo
// ============================================================
//
//  Estrutura de camadas (ordem de renderização):
//
//  container (stage)
//   ├── bgContainer          ← Fundo (NÃO move com câmera)
//   │    ├── skyLayer        ← Camada 0: Cor sólida do céu
//   │    ├── parallax1       ← Camada 1: Skybox (0.03x)
//   │    ├── parallax2       ← Camada 2: Montanhas distantes (0.12x)
//   │    └── parallax3       ← Camada 3: Colinas próximas (0.35x)
//   │
//   ├── worldContainer       ← Mundo (MOVE com câmera)
//   │    ├── chunkManager    ← Chunks com plataformas
//   │    └── player          ← Jogador
//   │
//   └── uiContainer          ← UI (NÃO move, fica por cima)
//        ├── debugPanel      ← Info de debug
//        └── controlsHint   ← Dica de controles
//
// ============================================================

import { Container, TilingSprite, Graphics, Text, Assets, RenderTexture } from 'pixi.js';
import { Camera }       from '../../core/camera/Camera.js';
import { input }        from '../../core/input/InputManager.js';
import { Player }       from '../../entities/player/Player.js';
import { ChunkManager } from '../../world/ChunkManager.js';
import { ChestUI }      from '../../ui/ChestUI.js';
import { PetUI }        from '../../ui/PetUI.js';
import { ClickEffect }  from '../../effects/vfx/ClickEffect.js';
import {
  SCREEN_W, SCREEN_H, GROUND_Y, CHUNK_WIDTH,
  PARALLAX, MAPS,
} from '../../constants.js';

export class GameScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.container    = new Container();
    this.camera       = new Camera();
    this.mapId        = 1;
    this._tickFn      = null;
  }

  async init(app) {
    this._app = app;
    const mapCfg     = MAPS[this.mapId];
    const skyboxTex  = Assets.get(mapCfg.skybox);
    const platformTex = Assets.get(mapCfg.platform);

    // ══════════════════════════════════════════════════════
    //  BG CONTAINER — Fundo fixo (não move com câmera)
    // ══════════════════════════════════════════════════════
    this.bgContainer = new Container();

    // ── Camada 0: Cor base do céu (caso a imagem não cubra tudo) ───────────
    const skyBase = new Graphics();
    skyBase.rect(0, 0, SCREEN_W, SCREEN_H).fill({ color: mapCfg.bgColor });
    this.bgContainer.addChild(skyBase);

    // ── Camada 1: Skybox — TilingSprite (repete infinitamente) ───────────
    // TilingSprite repete a textura para ambos os lados sem limites,
    // igual ao sistema de chunks do chão. Parallax via tilePosition.x
    this.p1 = new TilingSprite({ texture: skyboxTex, width: SCREEN_W, height: SCREEN_H });
    // Escala o tile para caber exatamente 1280x720 por repetição
    this.p1.tileScale.set(SCREEN_W / skyboxTex.width, SCREEN_H / skyboxTex.height);
    this.bgContainer.addChild(this.p1);

    // Fundo infinito — sem camadas extras

    this.container.addChild(this.bgContainer);

    // ══════════════════════════════════════════════════════
    //  WORLD CONTAINER — move com câmera
    // ══════════════════════════════════════════════════════
    this.worldContainer = new Container();

    // Chunk manager — terreno infinito
    this.chunkManager = new ChunkManager(this.worldContainer, this.mapId);

    // Player
    this.player = new Player(this.worldContainer);

    // Câmera começa centrada no player (sem delay)
    this.camera.snapTo(this.player.centerX, this.player.centerY);

    this.container.addChild(this.worldContainer);

    // ══════════════════════════════════════════════════════
    //  UI CONTAINER — overlay fixo
    // ══════════════════════════════════════════════════════
    this.uiContainer = new Container();
    this._buildUI();
    this.container.addChild(this.uiContainer);

    // ── Baú de recompensa ──────────────────────────────────────
    this.chestUI = new ChestUI(this.uiContainer, app);
    await this.chestUI.start();

    // ── Botão de Pets (abaixo do baú, lado direito) ────────────
    this.petUI = new PetUI(this.uiContainer, app);
    await this.petUI.start();

    // ── Efeito de clique global (satisfatório em qualquer botão/imagem) ──
    this.clickEffect = new ClickEffect(app);

    // ── Inicializar chunks ao redor do player ───────────────
    this.chunkManager.update(this.player.x);

    // ── Registrar loop do jogo ──────────────────────────────
    this._tickFn = (ticker) => this._update(ticker);
    app.ticker.add(this._tickFn);
  }

  /** Cria uma camada de colinas procedurais usando RenderTexture */
  async _createHillLayer(app, color, heightRatio) {
    const tileW = 512, tileH = 160;

    // Desenha forma de colina
    const g = new Graphics();
    g.moveTo(0, tileH);
    g.bezierCurveTo(tileW * 0.1, tileH * (1 - heightRatio) * 1.2,
                    tileW * 0.35, tileH * (1 - heightRatio),
                    tileW * 0.5,  tileH * (1 - heightRatio) * 1.4);
    g.bezierCurveTo(tileW * 0.65, tileH * (1 - heightRatio) * 1.8,
                    tileW * 0.85, tileH * (1 - heightRatio) * 0.8,
                    tileW,        tileH * (1 - heightRatio) * 1.1);
    g.lineTo(tileW, tileH);
    g.closePath();
    g.fill({ color });

    // Renderiza para textura tileable
    const rt = RenderTexture.create({ width: tileW, height: tileH });
    app.renderer.render({ container: g, target: rt });
    g.destroy();

    const tiling = new TilingSprite({ texture: rt, width: SCREEN_W, height: tileH });
    return tiling;
  }

  /** Constrói a UI de overlay (debug + hint) */
  _buildUI() {
    // Painel de debug
    const panelBg = new Graphics();
    panelBg.roundRect(8, 8, 310, 90, 6)
      .fill({ color: 0x000000, alpha: 0.45 });
    this.uiContainer.addChild(panelBg);

    this.debugText = new Text({
      text: '',
      style: {
        fontFamily: 'Consolas, monospace',
        fontSize:   13,
        fill:       0x7de8a0,
        leading:    4,
      },
    });
    this.debugText.x = 16;
    this.debugText.y = 16;
    this.uiContainer.addChild(this.debugText);

    // Hint de controles (canto inferior)
    const hintBg = new Graphics();
    hintBg.roundRect(SCREEN_W / 2 - 210, SCREEN_H - 38, 420, 30, 5)
      .fill({ color: 0x000000, alpha: 0.4 });
    this.uiContainer.addChild(hintBg);

    const hint = new Text({
      text: '← → A D  Mover   |   SPACE ↑  Pular   |   ESC  Lobby',
      style: {
        fontFamily: 'Consolas, monospace',
        fontSize:   13,
        fill:       0xaabbcc,
      },
    });
    hint.anchor.set(0.5, 0.5);
    hint.x = SCREEN_W / 2;
    hint.y = SCREEN_H - 23;
    this.uiContainer.addChild(hint);
  }

  /** Loop principal do jogo */
  _update(ticker) {
    const delta = ticker.deltaTime;

    // Atualizar input
    input.update();

    // ESC → volta ao lobby
    if (input.justPressed('Escape')) {
      this.sceneManager.showLobby();
      return;
    }

    // Atualizar player
    this.player.update(delta);

    // Atualizar câmera (lead na direção do movimento)
    if (this.player.vx > 60)       this.camera.setLead(1);
    else if (this.player.vx < -60) this.camera.setLead(-1);
    else                           this.camera.setLead(0);

    this.camera.update({ x: this.player.centerX, y: this.player.centerY }, delta);
    this.camera.apply(this.worldContainer);

    // Parallax: tilePosition em coordenadas de TEXTURA — divide pelo scale
    // para que o movimento corresponda a pixels reais na tela
    const camX = this.camera.x;
    this.p1.tilePosition.x = (-camX * PARALLAX.far) / this.p1.tileScale.x;

    // Atualizar chunks (cria/destroi conforme o player anda)
    this.chunkManager.update(this.player.x);

    // Atualizar debug UI
    const chunkIdx = ChunkManager.getChunkIndex(this.player.x);
    this.debugText.text =
      `Pos:    x=${Math.round(this.player.x).toString().padStart(6)}  y=${Math.round(this.player.y)}\n` +
      `Speed:  vx=${Math.round(this.player.vx).toString().padStart(5)}  vy=${Math.round(this.player.vy)}\n` +
      `Chunk:  ${chunkIdx}  |  Chunks ativos: ${this.chunkManager.activeCount}\n` +
      `Ground: ${this.player.onGround ? 'SIM' : 'NÃO'}  |  FPS: ${Math.round(ticker.FPS)}`;
  }

  destroy() {
    if (this._tickFn) this._app.ticker.remove(this._tickFn);
    this.chunkManager.destroy();
    this.player.destroy();
    if (this.chestUI)     this.chestUI.destroy();
    if (this.petUI)       this.petUI.destroy();
    if (this.clickEffect) this.clickEffect.destroy();
    this.container.destroy({ children: true });
  }
}
