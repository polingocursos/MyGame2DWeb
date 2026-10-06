# 🎮 MyGame2DWeb
> Jogo 2D Web desenvolvido com PixiJS v8

---

## 🚀 COMO COMEÇAR

> Antes de qualquer coisa, leia os documentos de contexto:

| Documento | Descrição |
|-----------|-----------|
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de tudo que foi feito |
| [docs/design/GAME_DESIGN_DOCUMENT.md](./docs/design/GAME_DESIGN_DOCUMENT.md) | Visão geral do jogo |
| [docs/design/ARQUITETURA.md](./docs/design/ARQUITETURA.md) | Estrutura técnica |
| [docs/pixijs/PIXIJS_GUIA_COMPLETO.md](./docs/pixijs/PIXIJS_GUIA_COMPLETO.md) | Guia PixiJS completo |
| [docs/pixijs/PIXIJS_CHEATSHEET.md](./docs/pixijs/PIXIJS_CHEATSHEET.md) | Referência rápida PixiJS |
| [backups/sessions/](./backups/sessions/) | Logs de cada sessão de dev |

---

## 📁 ESTRUTURA DO PROJETO

```
MyGame2DWeb/
├── 📚 docs/                    ← Toda a documentação
│   ├── pixijs/                 ← Guia e cheatsheet PixiJS
│   ├── design/                 ← GDD + Arquitetura
│   └── systems/                ← Docs dos sistemas do jogo
│
├── 💾 backups/                 ← Backups entre sessões
│   ├── sessions/               ← Log de cada sessão
│   └── snapshots/              ← Snapshots manuais do código
│
├── 💻 src/                     ← Código fonte
│   ├── core/                   ← Camera, Input, Physics, Scene
│   ├── scenes/                 ← Lobby, Game
│   ├── entities/               ← Player, Enemies, Items, NPC
│   ├── systems/                ← Economy, Level, Inventory, Combat
│   ├── ui/                     ← HUD, Menus, Dialogs
│   ├── effects/                ← VFX, Animations, Shaders, Particles
│   └── utils/                  ← Utilitários
│
├── 🖼️ assets/                  ← Todos os assets visuais e sonoros
│   ├── sprites/                ← Personagens, inimigos, itens
│   │   ├── characters/         ← Player e NPCs
│   │   ├── enemies/            ← Sprites de inimigos
│   │   └── items/              ← Weapons, armor, consumables
│   ├── backgrounds/            ← Skyboxes, parallax, lobby
│   ├── platforms/              ← Imagens de plataformas
│   ├── maps/                   ← Tilesets e layouts de nível
│   ├── animations/             ← Dados de animação
│   ├── vfx/                    ← Partículas, explosões, magia
│   ├── sound/                  ← Música e efeitos sonoros
│   │   ├── music/              ← lobby/, gameplay/, boss/
│   │   ├── sfx/                ← player/, enemies/, items/, ui/
│   │   └── ambient/            ← Sons ambientes
│   ├── icons/                  ← Ícones (itens, skills, status, moedas)
│   └── ui/                     ← Elementos de UI (botões, painéis, fonte)
│
├── 📊 data/                    ← Dados do jogo em JSON
│   ├── economy/                ← Moedas, loja, recompensas
│   ├── levels/                 ← Tabela de XP e recompensas
│   ├── items/                  ← Stats de armas, armaduras, consumíveis
│   ├── characters/             ← Stats de personagens
│   ├── maps/                   ← Layout dos mapas
│   └── quests/                 ← Dados de missões
│
└── 🌐 public/                  ← Arquivos estáticos (index.html)
```

---

## 🔧 TECNOLOGIAS

- **Engine:** [PixiJS v8](https://pixijs.com/8.x/guides) — renderização WebGL/WebGPU
- **Áudio:** [@pixi/sound](https://github.com/pixijs/sound)
- **Câmera:** [pixi-viewport](https://github.com/davidfig/pixi-viewport)
- **Filtros:** [@pixi/filters](https://github.com/pixijs/filters)
- **Partículas:** [@pixi/particle-emitter](https://github.com/pixijs/particle-emitter)

---

## 📌 VERSÃO ATUAL: v0.1.0 — Setup Inicial
