// ============================================================
//  PET UI — Botão de Pets + Painel Grid com lista de 30 pets
// ============================================================
//
//  Imagem necessária (coloque em public/assets/ui/):
//    pet-icon.png   ← ícone do botão Pet (256×256px ideal)
//
//  Posição: abaixo do baú (lado direito da tela)
//  Ao clicar: abre frame com grid 5×6 de 30 pets
// ============================================================

import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { SCREEN_W, SCREEN_H } from '../constants.js';

const PET_ICON_IMG = 'assets/ui/pet-icon.png';

// ── Dados dos 30 pets (emoji + nome + raridade) ───────────────
const PETS_DATA = [
  { name: 'Dragão de Chama',  emoji: '🐉', rarity: 'legendary', color: 0xff4400 },
  { name: 'Lobo das Neves',   emoji: '🐺', rarity: 'epic',      color: 0x8844ff },
  { name: 'Gato Lunar',       emoji: '🐱', rarity: 'rare',      color: 0x4488ff },
  { name: 'Coruja Sábia',     emoji: '🦉', rarity: 'rare',      color: 0x4488ff },
  { name: 'Tartaruga Anciã',  emoji: '🐢', rarity: 'common',    color: 0x44aa44 },
  { name: 'Raposa Mística',   emoji: '🦊', rarity: 'epic',      color: 0x8844ff },
  { name: 'Pinguim Ártico',   emoji: '🐧', rarity: 'common',    color: 0x44aa44 },
  { name: 'Unicórnio',        emoji: '🦄', rarity: 'legendary', color: 0xff4400 },
  { name: 'Macaco Mágico',    emoji: '🐒', rarity: 'common',    color: 0x44aa44 },
  { name: 'Pato Trovão',      emoji: '🦆', rarity: 'rare',      color: 0x4488ff },
  { name: 'Leão Dourado',     emoji: '🦁', rarity: 'epic',      color: 0x8844ff },
  { name: 'Hamster Espacial', emoji: '🐹', rarity: 'rare',      color: 0x4488ff },
  { name: 'Cobra Arcana',     emoji: '🐍', rarity: 'epic',      color: 0x8844ff },
  { name: 'Borboleta Fada',   emoji: '🦋', rarity: 'rare',      color: 0x4488ff },
  { name: 'Cavalo Sombrio',   emoji: '🐴', rarity: 'common',    color: 0x44aa44 },
  { name: 'Polvo Psíquico',   emoji: '🐙', rarity: 'legendary', color: 0xff4400 },
  { name: 'Peixe Fênix',      emoji: '🐠', rarity: 'rare',      color: 0x4488ff },
  { name: 'Escorpião Lunar',  emoji: '🦂', rarity: 'epic',      color: 0x8844ff },
  { name: 'Coelho Relâmpago', emoji: '🐰', rarity: 'common',    color: 0x44aa44 },
  { name: 'Elefante Rúnico',  emoji: '🐘', rarity: 'rare',      color: 0x4488ff },
  { name: 'Pássaro do Caos',  emoji: '🦅', rarity: 'legendary', color: 0xff4400 },
  { name: 'Sapo Venenoso',    emoji: '🐸', rarity: 'common',    color: 0x44aa44 },
  { name: 'Tigre Celestial',  emoji: '🐯', rarity: 'epic',      color: 0x8844ff },
  { name: 'Beija-Flor Astral',emoji: '🐦', rarity: 'rare',      color: 0x4488ff },
  { name: 'Caranguejo Ferro',  emoji: '🦀', rarity: 'common',    color: 0x44aa44 },
  { name: 'Lobo Solar',       emoji: '🐕', rarity: 'epic',      color: 0x8844ff },
  { name: 'Pato Dourado',     emoji: '🐤', rarity: 'legendary', color: 0xff4400 },
  { name: 'Urso das Sombras', emoji: '🐻', rarity: 'rare',      color: 0x4488ff },
  { name: 'Macaco do Vento',  emoji: '🙈', rarity: 'common',    color: 0x44aa44 },
  { name: 'Dragão de Gelo',   emoji: '🦎', rarity: 'legendary', color: 0xff4400 },
];

const RARITY_LABEL = {
  common:    { label: 'Comum',    color: 0x44aa44 },
  rare:      { label: 'Raro',     color: 0x4488ff },
  epic:      { label: 'Épico',    color: 0xaa44ff },
  legendary: { label: 'Lendário', color: 0xff9900 },
};

export class PetUI {
  constructor(uiContainer, app) {
    this._app    = app;
    this._parent = uiContainer;
    this._panelOpen    = false;
    this._selectedPet  = null;
    this._tickFn       = null;
    this._glowPhase    = 0;

    this._root = new Container();
    uiContainer.addChild(this._root);

    this._buildPromise = this._build();
  }

  async start() {
    await this._buildPromise;
    this._tickFn = (ticker) => this._update(ticker);
    this._app.ticker.add(this._tickFn);
  }

  // ── Construção do botão Pet ────────────────────────────────
  async _build() {
    const PAD  = 12;
    const SIZE = 96;

    // Posição: mesma coluna do baú (direita), abaixo dele
    // Baú fica em: cy = PAD + SIZE/2 + 10 = 12 + 48 + 10 = 70
    // Timer bg abaixo: cy + SIZE/2 + 4 + 22 = 70 + 48 + 26 = 144
    // Pet icon começa em: 144 + 16 = 160 → cy = 160 + SIZE/2 = 208
    const cx = SCREEN_W - PAD - SIZE / 2;
    const cy = 220;          // logo abaixo do timer do baú
    this._cx = cx;
    this._cy = cy;
    this._SIZE = SIZE;

    // ── Container clicável do botão ──────────────────────────
    this._btnContainer = new Container();
    this._btnContainer.x = cx;
    this._btnContainer.y = cy;
    this._root.addChild(this._btnContainer);

    // Glow de fundo (animado)
    this._glowGfx = new Graphics();
    this._btnContainer.addChild(this._glowGfx);

    // Tenta carregar a imagem do pet icon
    try {
      const tex = await Assets.load(PET_ICON_IMG);
      const spr = new Sprite(tex);
      spr.anchor.set(0.5);
      spr.scale.set(SIZE / Math.max(tex.width, tex.height));
      this._btnContainer.addChild(spr);
    } catch {
      // Fallback desenhado: pata dourada
      this._drawFallbackIcon(this._btnContainer, SIZE);
    }

    // Label "PETS" abaixo do ícone
    this._labelBg = new Graphics();
    this._labelBg.roundRect(-30, 0, 60, 22, 5)
      .fill({ color: 0x000000, alpha: 0.55 });
    this._labelBg.x = cx;
    this._labelBg.y = cy + SIZE / 2 + 4;
    this._root.addChild(this._labelBg);

    const label = new Text({
      text: 'PETS',
      style: {
        fontFamily: 'Consolas, monospace',
        fontSize:   13,
        fontWeight: '700',
        fill:       0xffcc44,
      },
    });
    label.anchor.set(0.5, 0);
    label.x = cx;
    label.y = cy + SIZE / 2 + 6;
    this._root.addChild(label);

    // Interatividade
    this._btnContainer.interactive = true;
    this._btnContainer.cursor = 'pointer';
    this._btnContainer.hitArea = {
      contains: (x, y) => Math.abs(x) <= SIZE / 2 && Math.abs(y) <= SIZE / 2,
    };
    this._btnContainer.on('pointerup',    () => this._togglePanel());
    this._btnContainer.on('pointerover',  () => { this._btnContainer.scale.set(1.08); });
    this._btnContainer.on('pointerout',   () => { this._btnContainer.scale.set(1.00); });

    // Construir o painel de pets
    await this._buildPetPanel();
  }

  // ── Fallback: pata desenhada ───────────────────────────────
  _drawFallbackIcon(container, SIZE) {
    const g = new Graphics();
    const S = SIZE * 0.46;

    // Fundo arredondado
    g.roundRect(-SIZE/2, -SIZE/2, SIZE, SIZE, 14)
      .fill({ color: 0x1a0a2e });
    g.roundRect(-SIZE/2, -SIZE/2, SIZE, SIZE, 14)
      .stroke({ color: 0xffcc44, width: 2 });

    // Pata central (palmeira)
    g.ellipse(0, S * 0.15, S * 0.38, S * 0.46)
      .fill({ color: 0xffaa22 });

    // 4 dedos pequenos em cima
    const dedos = [
      { x: -S * 0.42, y: -S * 0.22, rx: 0.18, ry: 0.26 },
      { x: -S * 0.15, y: -S * 0.42, rx: 0.18, ry: 0.26 },
      { x:  S * 0.15, y: -S * 0.42, rx: 0.18, ry: 0.26 },
      { x:  S * 0.42, y: -S * 0.22, rx: 0.18, ry: 0.26 },
    ];
    for (const d of dedos) {
      g.ellipse(d.x, d.y, S * d.rx, S * d.ry).fill({ color: 0xffaa22 });
    }
    container.addChild(g);
  }

  // ── Painel de grid de Pets ─────────────────────────────────
  async _buildPetPanel() {
    this._panelRoot = new Container();
    this._panelRoot.visible = false;
    this._parent.addChild(this._panelRoot);

    // Overlay escuro (fecha ao clicar fora)
    const overlay = new Graphics();
    overlay.rect(0, 0, SCREEN_W, SCREEN_H).fill({ color: 0x000000, alpha: 0.65 });
    overlay.interactive = true;
    overlay.on('pointerup', () => this._closePanel());
    this._panelRoot.addChild(overlay);

    // Dimensões do painel
    const COLS  = 5;
    const ROWS  = 6;
    const CELL  = 90;
    const GAP   = 8;
    const PADX  = 24;
    const PADY  = 20;
    const FW    = COLS * CELL + (COLS - 1) * GAP + PADX * 2;
    const FH    = ROWS * CELL + (ROWS - 1) * GAP + PADY * 2 + 60; // 60 p/ header
    const fx    = SCREEN_W / 2;
    const fy    = SCREEN_H / 2;

    // ── Fundo do painel ─────────────────────────────────────
    const panel = new Graphics();
    // Sombra
    panel.roundRect(fx - FW/2 + 6, fy - FH/2 + 8, FW, FH, 18)
      .fill({ color: 0x000000, alpha: 0.45 });
    // Corpo principal
    panel.roundRect(fx - FW/2, fy - FH/2, FW, FH, 18)
      .fill({ color: 0x0d0820 });
    // Borda brilhante
    panel.roundRect(fx - FW/2, fy - FH/2, FW, FH, 18)
      .stroke({ color: 0xffcc44, width: 2 });
    // Linha de destaque no topo
    panel.roundRect(fx - FW/2 + 2, fy - FH/2 + 2, FW - 4, 3, 2)
      .fill({ color: 0xffcc44, alpha: 0.6 });

    panel.interactive = true; // bloqueia clique de passar pro overlay
    this._panelRoot.addChild(panel);

    // ── Header ──────────────────────────────────────────────
    const title = new Text({
      text: '🐾  MEUS PETS',
      style: {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize:   22,
        fontWeight: '700',
        fill:       0xffcc44,
      },
    });
    title.anchor.set(0.5, 0);
    title.x = fx;
    title.y = fy - FH / 2 + 14;
    this._panelRoot.addChild(title);

    const subtitle = new Text({
      text: '30 pets disponíveis',
      style: {
        fontFamily: 'Consolas, monospace',
        fontSize:   11,
        fill:       0x888aaa,
      },
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.x = fx;
    subtitle.y = fy - FH / 2 + 40;
    this._panelRoot.addChild(subtitle);

    // ── Grid de Pets ─────────────────────────────────────────
    const gridStartX = fx - FW / 2 + PADX;
    const gridStartY = fy - FH / 2 + PADY + 52; // após header

    this._tooltipContainer = new Container();
    this._tooltipContainer.visible = false;
    this._panelRoot.addChild(this._tooltipContainer);

    for (let i = 0; i < PETS_DATA.length; i++) {
      const col   = i % COLS;
      const row   = Math.floor(i / COLS);
      const cellX = gridStartX + col * (CELL + GAP) + CELL / 2;
      const cellY = gridStartY + row * (CELL + GAP) + CELL / 2;

      this._buildPetCell(cellX, cellY, PETS_DATA[i], i);
    }

    // ── Tooltip de detalhe ───────────────────────────────────
    this._buildTooltip();

    // ── Botão Fechar ─────────────────────────────────────────
    const closeBtn = new Graphics();
    closeBtn.roundRect(0, 0, 34, 34, 8).fill({ color: 0xff3355 });
    closeBtn.x = fx + FW / 2 - 44;
    closeBtn.y = fy - FH / 2 + 10;
    closeBtn.interactive = true;
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerup', () => this._closePanel());
    this._panelRoot.addChild(closeBtn);

    const closeX = new Text({
      text: '✕',
      style: { fontFamily: 'Arial', fontSize: 16, fontWeight: '700', fill: 0xffffff },
    });
    closeX.anchor.set(0.5);
    closeX.x = closeBtn.x + 17;
    closeX.y = closeBtn.y + 17;
    this._panelRoot.addChild(closeX);
  }

  // ── Célula individual de Pet ──────────────────────────────
  _buildPetCell(cx, cy, pet, index) {
    const CELL   = 86;
    const rarity = RARITY_LABEL[pet.rarity];
    const isLocked = index > 4; // primeiros 5 desbloqueados, resto bloqueados

    const cell = new Container();
    cell.x = cx;
    cell.y = cy;
    this._panelRoot.addChild(cell);

    // Fundo da célula
    const bg = new Graphics();
    bg.roundRect(-CELL/2, -CELL/2, CELL, CELL, 10)
      .fill({ color: isLocked ? 0x1a1a2e : 0x1e1040 });
    bg.roundRect(-CELL/2, -CELL/2, CELL, CELL, 10)
      .stroke({ color: isLocked ? 0x333355 : pet.color, width: isLocked ? 1 : 1.5 });
    cell.addChild(bg);

    // Emoji do pet (como texto)
    const emojiText = new Text({
      text: isLocked ? '🔒' : pet.emoji,
      style: {
        fontFamily: '"Segoe UI Emoji", Arial, sans-serif',
        fontSize:   28,
      },
    });
    emojiText.anchor.set(0.5);
    emojiText.x = 0;
    emojiText.y = -8;
    emojiText.alpha = isLocked ? 0.35 : 1.0;
    cell.addChild(emojiText);

    // Nome do pet (truncado)
    const nameShort = pet.name.length > 10 ? pet.name.substring(0, 10) + '…' : pet.name;
    const nameText = new Text({
      text: nameShort,
      style: {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize:   9,
        fill:       isLocked ? 0x555577 : 0xddddff,
        align:      'center',
      },
    });
    nameText.anchor.set(0.5);
    nameText.x = 0;
    nameText.y = 22;
    cell.addChild(nameText);

    // Badge de raridade
    if (!isLocked) {
      const rarityBg = new Graphics();
      rarityBg.roundRect(-CELL/2 + 4, CELL/2 - 20, CELL - 8, 14, 4)
        .fill({ color: pet.color, alpha: 0.25 });
      cell.addChild(rarityBg);

      const rarityText = new Text({
        text: rarity.label.toUpperCase(),
        style: {
          fontFamily: 'Consolas, monospace',
          fontSize:   8,
          fontWeight: '700',
          fill:       rarity.color,
        },
      });
      rarityText.anchor.set(0.5);
      rarityText.x = 0;
      rarityText.y = CELL/2 - 13;
      cell.addChild(rarityText);
    }

    // Interatividade
    if (!isLocked) {
      cell.interactive = true;
      cell.cursor = 'pointer';
      cell.on('pointerover', () => {
        bg.clear();
        bg.roundRect(-CELL/2, -CELL/2, CELL, CELL, 10)
          .fill({ color: 0x2d1a5e });
        bg.roundRect(-CELL/2, -CELL/2, CELL, CELL, 10)
          .stroke({ color: pet.color, width: 2.5 });
        this._showTooltip(cx, cy - CELL/2 - 8, pet);
      });
      cell.on('pointerout', () => {
        bg.clear();
        bg.roundRect(-CELL/2, -CELL/2, CELL, CELL, 10)
          .fill({ color: 0x1e1040 });
        bg.roundRect(-CELL/2, -CELL/2, CELL, CELL, 10)
          .stroke({ color: pet.color, width: 1.5 });
        this._tooltipContainer.visible = false;
      });
      cell.on('pointerup', () => {
        this._selectPet(pet, cell);
      });
    }
  }

  // ── Tooltip ───────────────────────────────────────────────
  _buildTooltip() {
    this._ttBg = new Graphics();
    this._tooltipContainer.addChild(this._ttBg);

    this._ttText = new Text({
      text: '',
      style: {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize:   12,
        fill:       0xffffff,
        align:      'center',
      },
    });
    this._ttText.anchor.set(0.5, 1);
    this._tooltipContainer.addChild(this._ttText);
  }

  _showTooltip(x, y, pet) {
    const rarity = RARITY_LABEL[pet.rarity];
    this._ttText.text = `${pet.emoji} ${pet.name}\n${rarity.label}`;
    this._ttText.x = x;
    this._ttText.y = y;

    const w = this._ttText.width + 20;
    const h = this._ttText.height + 12;
    this._ttBg.clear();
    this._ttBg.roundRect(x - w/2, y - h, w, h, 6)
      .fill({ color: 0x0d0820, alpha: 0.95 });
    this._ttBg.roundRect(x - w/2, y - h, w, h, 6)
      .stroke({ color: pet.color, width: 1 });

    this._tooltipContainer.visible = true;
  }

  // ── Seleção de Pet ────────────────────────────────────────
  _selectPet(pet, cell) {
    this._selectedPet = pet;
    console.log(`[PetUI] Pet selecionado: ${pet.name}`);
    // Aqui você pode emitir um evento ou aplicar bônus ao player
  }

  // ── Abrir / Fechar painel ─────────────────────────────────
  _togglePanel() {
    if (this._panelOpen) {
      this._closePanel();
    } else {
      this._openPanel();
    }
  }

  _openPanel() {
    this._panelOpen = true;
    this._panelRoot.visible = true;
    this._tooltipContainer.visible = false;

    // Animação de entrada (scale)
    this._panelRoot.scale.set(0.85);
    this._panelRoot.alpha = 0;
    const start = performance.now();
    const animate = () => {
      const t = Math.min(1, (performance.now() - start) / 180);
      const ease = 1 - Math.pow(1 - t, 3);
      this._panelRoot.scale.set(0.85 + ease * 0.15);
      this._panelRoot.alpha = ease;
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  _closePanel() {
    this._panelOpen = false;
    this._tooltipContainer.visible = false;
    const start = performance.now();
    const animate = () => {
      const t = Math.min(1, (performance.now() - start) / 150);
      const ease = t * t;
      this._panelRoot.scale.set(1 - ease * 0.15);
      this._panelRoot.alpha = 1 - ease;
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this._panelRoot.visible = false;
        this._panelRoot.scale.set(1);
        this._panelRoot.alpha = 1;
      }
    };
    requestAnimationFrame(animate);
  }

  // ── Loop: animação do glow no botão ──────────────────────
  _update(ticker) {
    if (!this._glowGfx) return;
    this._glowPhase += ticker.deltaTime * 0.04;
    const alpha = 0.25 + 0.2 * Math.sin(this._glowPhase);
    const SIZE  = this._SIZE;

    this._glowGfx.clear();
    this._glowGfx.roundRect(-SIZE/2 - 4, -SIZE/2 - 4, SIZE + 8, SIZE + 8, 16)
      .fill({ color: 0xffcc44, alpha });
  }

  destroy() {
    if (this._tickFn) this._app.ticker.remove(this._tickFn);
    this._root.destroy({ children: true });
    if (this._panelRoot) this._panelRoot.destroy({ children: true });
  }
}
