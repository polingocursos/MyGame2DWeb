# 📋 CHANGELOG — Histórico de Atualizações
> Este arquivo é atualizado a cada sessão de desenvolvimento.
> Serve para manter contexto entre sessões do agente.

---

## [v0.2.0] — 2026-10-05 — JOGO BASE FUNCIONAL

### ✅ O que foi feito
- Configurado Vite + PixiJS v8 (npm)
- Imagens criadas: skybox e plataforma do Mapa 1
- Tela de Lobby com skybox animado + título flutuante + botão JOGAR
- Cena de jogo com:
  - 4 camadas de parallax (sky base, skybox, montanhas, colinas procedurais)
  - Sistema de chunks infinito (cria/destroi por distância do player)
  - Player caixa azul com física completa
  - Câmera com lerp + lead antecipado
  - Física: gravidade, pulo variável (coyote time + jump buffer), aceleração/desaceleração
  - Debug UI (posição, velocidade, chunks, FPS)
  - ESC volta ao lobby
- Servidor rodando em http://localhost:5173/

### 📁 Arquivos criados
- `index.html` — entry point
- `package.json` — Vite + PixiJS
- `src/constants.js` — todas as constantes globais
- `src/main.js` — init PixiJS + loading + scene manager
- `src/core/input/InputManager.js` — teclado singleton
- `src/core/camera/Camera.js` — câmera com lerp
- `src/entities/player/Player.js` — player caixa com física
- `src/world/ChunkManager.js` — mapa infinito por chunks
- `src/scenes/lobby/LobbyScene.js` — tela inicial
- `src/scenes/game/GameScene.js` — cena de jogo
- `public/assets/maps/map1/skybox.png` — skybox gerado
- `public/assets/maps/map1/platform.png` — plataforma gerada

### 📌 Estado atual
- Jogo rodando com lobby + gameplay básico
- Player: caixa azul (placeholder para spritesheet)
- Mapa: infinito horizontal (chunks 1280px)
- Física: gravidade, pulo, aceleração, coyote time, jump buffer

### 🎯 Próximos passos sugeridos
1. Substituir a caixa do player por spritesheet com animações
2. Adicionar colisão com plataformas flutuantes
3. Adicionar inimigos (sistema de entidades)
4. Adicionar HUD (barra de vida, moedas)
5. Adicionar sons (música + SFX)
6. Criar variações de terreno nos chunks (gaps, plataformas flutuantes)

---

## [v0.1.0] — 2026-10-05 — SETUP INICIAL

### ✅ O que foi feito
- Criação de toda a estrutura de pastas do projeto
- Documentação do PixiJS (guia completo + cheatsheet)
- Game Design Document inicial
- Documento de arquitetura técnica
- Sistema de backup configurado
- READMEs em todas as pastas principais

### 📁 Pastas criadas (82 no total)
- `docs/pixijs/` — documentação PixiJS
- `docs/design/` — GDD e arquitetura
- `src/core/`, `src/scenes/`, `src/entities/`, `src/systems/`, `src/ui/`, `src/effects/`, `src/utils/`
- `assets/sprites/`, `assets/backgrounds/`, `assets/platforms/`, `assets/maps/`, `assets/animations/`, `assets/vfx/`, `assets/sound/`, `assets/icons/`, `assets/ui/`
- `data/economy/`, `data/levels/`, `data/items/`, `data/characters/`, `data/maps/`, `data/quests/`
- `backups/sessions/`, `backups/snapshots/`
- `public/`

### 📌 Estado atual
- Projeto: **vazio** (apenas estrutura)
- Nenhum código escrito ainda
- Pronto para iniciar desenvolvimento

### 🎯 Próximos passos (sugestões)
1. Definir nome do jogo
2. Escolher assets visuais (skybox, plataformas, personagem)
3. Iniciar `public/index.html` e integrar PixiJS
4. Criar a cena de Lobby com fundo + botões

---

<!-- Template para próximas sessões:

## [vX.X.X] — AAAA-MM-DD — NOME DA SESSÃO

### ✅ O que foi feito
-

### 🐛 Bugs corrigidos
-

### 📁 Arquivos modificados
-

### 📌 Estado atual
-

### 🎯 Próximos passos
-

-->
