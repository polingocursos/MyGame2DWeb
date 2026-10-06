# 🎮 GAME DESIGN DOCUMENT (GDD)
> Documento vivo — atualizar conforme o jogo evolui

---

## 📌 VISÃO GERAL DO JOGO

| Campo | Valor |
|-------|-------|
| **Título** | *(a definir)* |
| **Gênero** | Plataforma 2D (side-scroller) |
| **Engine** | PixiJS v8 (WebGL/WebGPU) |
| **Plataforma** | Web Browser |
| **Perspectiva** | 2D lateral |

---

## 🎬 TELA INICIAL (LOBBY)

### Layout
- **Fundo:** imagem/gif/vídeo de background animado
- **Elementos de UI:**
  - Logo/título do jogo
  - Botão `JOGAR`
  - Botão `OPÇÕES`
  - Botão `CRÉDITOS`
  - (opcional) Botão `LOJA`

### Estilo Visual
- Tema escuro com atmosfera *(a definir)*
- Música de lobby em loop suave
- Partículas ou efeitos de ambiente no fundo

---

## 🌍 WORLD / MAPA

### Estrutura do Mundo
- **Skybox:** imagem estática ou com parallax leve ao fundo
- **Plataformas:** imagens de plataforma onde o player caminha
- **Parallax:** múltiplas camadas de fundo com velocidades diferentes

### Sistemas de Câmera
- Câmera segue o player
- Limites do mapa (player não sai do mundo)
- Zoom suave em momentos especiais

---

## 👤 PLAYER

### Estados de Animação
- `idle` — parado
- `run` — correndo
- `jump` — pulando
- `fall` — caindo
- `attack` — atacando
- `hurt` — tomando dano
- `death` — morrendo

### Atributos
| Atributo | Descrição |
|----------|-----------|
| HP | Pontos de vida |
| MP | Pontos de mana/energia |
| Level | Nível do personagem |
| EXP | Experiência atual |
| Velocidade | Velocidade de movimento |
| Pulo | Força do pulo |

---

## 💰 SISTEMA ECONÔMICO

### Moedas
- *(a definir)* — moeda básica (drops de inimigos)
- *(a definir)* — moeda premium

### Fontes de renda
- Matar inimigos
- Completar quests
- Abrir baús
- Vender itens

### Gastos
- Loja de itens
- Upgrades de personagem
- Comprar equipamentos

---

## 📊 SISTEMA DE NÍVEL (LEVEL/XP)

| Level | EXP Necessária | Recompensa |
|-------|---------------|------------|
| 1→2 | 100 | +5 HP, +skill point |
| 2→3 | 250 | +5 HP, +skill point |
| ... | ... | ... |

---

## ⚔️ SISTEMA DE COMBATE

*(a definir)*

---

## 🎒 INVENTÁRIO

- Slots de equipamento: Cabeça, Corpo, Pernas, Arma, Escudo, Acessório x2
- Slots de inventário: *(a definir)*

---

## 🗺️ ESTRUTURA DE FASES

| Fase | Nome | Dificuldade | Boss |
|------|------|-------------|------|
| 1 | *(a definir)* | Fácil | - |
| 2 | *(a definir)* | Médio | - |
| ... | ... | ... | ... |
