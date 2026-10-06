# 🏗️ ARQUITETURA TÉCNICA DO JOGO

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

| Pacote | Versão | Uso |
|--------|--------|-----|
| `pixi.js` | ^8.x | Engine de renderização |
| `@pixi/sound` | ^6.x | Áudio |
| `pixi-viewport` | ^5.x | Câmera/viewport |
| `@pixi/filters` | ^8.x | Filtros visuais extras |
| `@pixi/particle-emitter` | ^5.x | Sistema de partículas |

---

## 📁 ESTRUTURA DE ARQUIVOS SRC

```
src/
├── core/
│   ├── camera/       ← sistema de câmera (viewport)
│   ├── input/        ← gerenciamento de teclado/mouse/touch
│   ├── physics/      ← colisão simples AABB e gravidade
│   ├── scene/        ← gerenciador de cenas (SceneManager)
│   └── loader/       ← carregamento de assets (manifest)
│
├── scenes/
│   ├── lobby/        ← cena de tela inicial
│   └── game/         ← cena principal do jogo
│
├── entities/
│   ├── player/       ← classe Player + estados de animação
│   ├── enemies/      ← classes de inimigos
│   ├── items/        ← itens coletáveis
│   └── npc/          ← NPCs não-combativos
│
├── systems/
│   ├── economy/      ← moedas, transações, loja
│   ├── level/        ← XP, level up, atributos
│   ├── inventory/    ← inventário e equipamentos
│   ├── combat/       ← dano, hitbox, combos
│   └── save/         ← save/load via localStorage
│
├── ui/
│   ├── hud/          ← barras de vida, mana, HUD in-game
│   ├── menus/        ← menus de pause, inventário, etc.
│   └── dialogs/      ← popups, tooltips, diálogos
│
├── effects/
│   ├── vfx/          ← efeitos visuais (explosões, magic, etc.)
│   ├── animations/   ← controlador de animações de sprite
│   ├── shaders/      ← shaders customizados
│   └── particles/    ← emissores de partícula
│
└── utils/            ← funções auxiliares genéricas
```

---

## 🎬 FLUXO DE CENAS

```
[Boot] → [Preload] → [Lobby] → [Game] → [GameOver/Win]
                                  ↕
                              [Pause Menu]
```

---

## 📐 CAMADAS DE RENDERIZAÇÃO (Z-ORDER)

```
app.stage
  └── world (Container) ← movido pela câmera
       ├── [0] layer_skybox       ← imagem de fundo estática
       ├── [1] layer_bg_far       ← parallax longe (0.1x)
       ├── [2] layer_bg_near      ← parallax perto (0.4x)
       ├── [3] layer_platforms    ← plataformas do chão
       ├── [4] layer_items        ← itens no chão
       ├── [5] layer_enemies      ← inimigos
       ├── [6] layer_player       ← jogador principal
       └── [7] layer_vfx          ← efeitos visuais por cima
  └── ui (Container) ← fixo na tela
       ├── [0] hud                ← vida, mana, inventário rápido
       └── [1] menus              ← menus flutuantes
```

---

## 💾 SISTEMA DE SAVE

- Usa `localStorage` do browser
- Salva: nível, XP, moedas, inventário, posição no mapa, configurações
- Slot único (pode expandir para múltiplos slots)

---

## 🎯 CONVENÇÕES DE CÓDIGO

- **Nomeação:** camelCase para variáveis/funções, PascalCase para classes
- **Eventos:** usar EventEmitter próprio ou eventos nativos do PixiJS
- **Separação:** lógica separada de renderização sempre que possível
- **Game loop:** toda lógica de update no `app.ticker`, nunca em `setTimeout`
