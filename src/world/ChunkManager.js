// ============================================================
//  CHUNK MANAGER — Sistema de mapa infinito por chunks
// ============================================================
//
//  Como funciona o mapa infinito:
//  ┌─────────────────────────────────────────────────────────┐
//  │  O mundo é dividido em segmentos de CHUNK_WIDTH pixels.  │
//  │  Cada chunk tem um índice inteiro (pode ser negativo).   │
//  │  Chunk 0 fica em worldX=0, chunk 1 em worldX=1280, etc.  │
//  │                                                          │
//  │  Conforme o player anda, chunks são:                     │
//  │    • CRIADOS à frente do player                          │
//  │    • DESTRUÍDOS quando ficam longe demais                │
//  │                                                          │
//  │  A plataforma usa TilingSprite por chunk, com offset     │
//  │  calculado para que as tiles sejam CONTÍNUAS entre chunks │
//  └─────────────────────────────────────────────────────────┘

import { Container, TilingSprite, Assets, Graphics } from 'pixi.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT, RENDER_DISTANCE, GROUND_Y, SCREEN_H } from '../constants.js';

export class ChunkManager {
  /**
   * @param {Container} worldContainer  Container do mundo (afetado pela câmera)
   * @param {number}    mapId           ID do mapa (1-4)
   */
  constructor(worldContainer, mapId) {
    this.worldContainer  = worldContainer;
    this.mapId           = mapId;
    this.chunks          = new Map(); // Map<chunkIndex: number, Container>
    this.platformTexture = Assets.get(`/assets/maps/map${mapId}/platform.png`);
  }

  /**
   * Atualiza chunks baseado na posição do player.
   * Criar novos chunks à frente, destruir chunks longe demais.
   * @param {number} playerX  Posição X do player no mundo
   */
  update(playerX) {
    const currentChunk = Math.floor(playerX / CHUNK_WIDTH);

    // Criar chunks no range de renderização
    const min = currentChunk - RENDER_DISTANCE;
    const max = currentChunk + RENDER_DISTANCE;

    for (let i = min; i <= max; i++) {
      if (!this.chunks.has(i)) {
        this._createChunk(i);
      }
    }

    // Destruir chunks fora do range (economizar memória)
    for (const [index] of this.chunks) {
      if (index < min - 1 || index > max + 1) {
        this._destroyChunk(index);
      }
    }
  }

  /** Cria um único chunk no índice especificado */
  _createChunk(index) {
    const chunk = new Container();
    chunk.x = index * CHUNK_WIDTH;
    chunk.label = `chunk_${index}`;

    if (this.platformTexture) {
      // TilingSprite que repete a textura da plataforma horizontalmente
      const ground = new TilingSprite({
        texture: this.platformTexture,
        width:   CHUNK_WIDTH,
        height:  CHUNK_HEIGHT,
      });
      ground.y = GROUND_Y;

      // IMPORTANTE: Calcular offset para tiles contínuas entre chunks!
      // Sem isso, cada chunk teria o tile começando do zero, criando descontinuidade.
      // Com o offset, as tiles do chunk 1 continuam exatamente onde as do chunk 0 terminaram.
      const texW = this.platformTexture.width || 1280;
      ground.tilePosition.x = -(index * CHUNK_WIDTH) % texW;

      chunk.addChild(ground);
    } else {
      // Fallback: retângulo colorido se a textura não carregar
      const fallback = new Graphics();
      fallback.rect(0, GROUND_Y, CHUNK_WIDTH, CHUNK_HEIGHT)
        .fill({ color: 0x4a6741 });
      chunk.addChild(fallback);
    }

    // Linha de debug (divisor de chunk) — visível durante desenvolvimento
    const divider = new Graphics();
    divider.rect(0, GROUND_Y - 2, 2, CHUNK_HEIGHT + 2)
      .fill({ color: 0xff4400, alpha: 0.25 });
    chunk.addChild(divider);

    this.worldContainer.addChild(chunk);
    this.chunks.set(index, chunk);
  }

  /** Destrói um chunk e libera memória */
  _destroyChunk(index) {
    const chunk = this.chunks.get(index);
    if (chunk) {
      chunk.destroy({ children: true });
      this.chunks.delete(index);
    }
  }

  /** Destrói todos os chunks */
  destroy() {
    for (const [index] of this.chunks) {
      this._destroyChunk(index);
    }
  }

  /** Retorna o número de chunks ativos (para debug) */
  get activeCount() { return this.chunks.size; }

  /** Retorna o índice do chunk em que uma posição X está */
  static getChunkIndex(worldX) {
    return Math.floor(worldX / CHUNK_WIDTH);
  }
}
