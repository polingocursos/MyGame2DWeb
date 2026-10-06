# 📚 GUIA COMPLETO PIXIJS v8.x
> Documentação de referência para desenvolvimento do jogo 2D Web
> Fonte: https://pixijs.com/8.x/guides

---

## 🔷 O QUE É PIXIJS?

PixiJS é um motor de renderização 2D ultra-rápido baseado em WebGL (com fallback para Canvas).
- Renderização acelerada por GPU via WebGL/WebGPU
- API simples e expressiva
- Suporte a sprites, animações, filtros, partículas, texto, etc.
- Ideal para jogos 2D, visualizações interativas e interfaces ricas

**NPM:** `npm install pixi.js`
**CDN:** `https://pixijs.download/release/pixi.min.js`

---

## 🔷 CONCEITOS FUNDAMENTAIS

### Application (App)
O ponto de entrada do PixiJS. Cria o canvas e o renderer.

```js
import { Application } from 'pixi.js';

const app = new Application();
await app.init({
  width: 1280,
  height: 720,
  backgroundColor: 0x1a1a2e,
  resolution: window.devicePixelRatio || 1,
  antialias: true,
});

document.body.appendChild(app.canvas);
```

### Stage
O container raiz onde todos os objetos são adicionados.
```js
app.stage.addChild(sprite);
```

### Ticker (Game Loop)
Loop principal do jogo, chamado a cada frame.
```js
app.ticker.add((ticker) => {
  const delta = ticker.deltaTime; // tempo desde último frame
  player.x += speed * delta;
});
```

---

## 🔷 SPRITES E TEXTURAS

### Carregar e criar Sprite
```js
import { Sprite, Assets } from 'pixi.js';

// Carregar textura
const texture = await Assets.load('assets/sprites/characters/player/idle.png');

// Criar sprite
const player = new Sprite(texture);
player.anchor.set(0.5); // centro
player.x = 400;
player.y = 300;
app.stage.addChild(player);
```

### Assets.load() - Carregar múltiplos assets
```js
await Assets.load([
  'assets/sprites/player.png',
  'assets/sound/music/lobby/theme.mp3',
  'assets/maps/level1.json',
]);
```

### Spritesheet (Atlas)
```js
// Carregar spritesheet com JSON
await Assets.load('assets/sprites/characters/player/player.json');
const sheet = Assets.get('assets/sprites/characters/player/player.json');

// Acessar frame específico
const idleTexture = sheet.textures['player_idle_01.png'];
```

---

## 🔷 ANIMATEDSPRITE (ANIMAÇÕES)

```js
import { AnimatedSprite, Assets } from 'pixi.js';

const sheet = Assets.get('player.json');

// Criar frames
const frames = [
  sheet.textures['walk_01.png'],
  sheet.textures['walk_02.png'],
  sheet.textures['walk_03.png'],
  sheet.textures['walk_04.png'],
];

const walkAnim = new AnimatedSprite(frames);
walkAnim.animationSpeed = 0.15; // velocidade (0 a 1)
walkAnim.loop = true;
walkAnim.play();
app.stage.addChild(walkAnim);
```

### Trocar animação
```js
function setAnimation(name) {
  const frames = Object.keys(sheet.textures)
    .filter(key => key.startsWith(name))
    .map(key => sheet.textures[key]);
  
  animatedSprite.textures = frames;
  animatedSprite.play();
}
```

---

## 🔷 CONTAINERS (AGRUPAMENTO)

```js
import { Container } from 'pixi.js';

const world = new Container(); // mundo do jogo
const ui = new Container();    // interface (não afetada pela câmera)

app.stage.addChild(world);
app.stage.addChild(ui); // UI sempre por cima

// Adicionar coisas ao mundo
world.addChild(background);
world.addChild(platforms);
world.addChild(player);
```

---

## 🔷 CÂMERA (VIEWPORT)

PixiJS não tem câmera nativa. A câmera é simulada movendo o container `world`.

```js
// Câmera simples seguindo o player
app.ticker.add(() => {
  world.x = app.screen.width / 2 - player.x;
  world.y = app.screen.height / 2 - player.y;
});
```

**Plugin recomendado:** `@pixi/viewport` (pixi-viewport)
```js
import { Viewport } from 'pixi-viewport';

const viewport = new Viewport({
  screenWidth: app.screen.width,
  screenHeight: app.screen.height,
  worldWidth: 4000,
  worldHeight: 1000,
  events: app.renderer.events,
});

app.stage.addChild(viewport);
viewport.follow(playerSprite); // seguir player
viewport.clamp({ direction: 'all' }); // não sair do mapa
```

---

## 🔷 TEXTO E TEXTOS BITMAP

```js
import { Text, TextStyle } from 'pixi.js';

const style = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fill: '#ffffff',
  stroke: { color: '#000000', width: 4 },
  dropShadow: { color: '#000000', blur: 4, distance: 6 },
});

const label = new Text({ text: 'Hello World', style });
app.stage.addChild(label);
```

---

## 🔷 GRÁFICOS (PRIMITIVAS)

```js
import { Graphics } from 'pixi.js';

const box = new Graphics();
box.rect(0, 0, 200, 50)
   .fill({ color: 0xff6b6b, alpha: 0.8 });

// Usado para hitboxes, barras de vida, etc.
```

---

## 🔷 FILTROS E EFEITOS

```js
import { BlurFilter, ColorMatrixFilter } from 'pixi.js';

// Desfoque
const blur = new BlurFilter({ strength: 8 });
sprite.filters = [blur];

// Efeito de cor
const colorMatrix = new ColorMatrixFilter();
colorMatrix.greyscale(0.5, false);
sprite.filters = [colorMatrix];
```

**Filtros extras:** https://github.com/pixijs/filters
```
npm install @pixi/filters
```

---

## 🔷 PARTÍCULAS

**Plugin:** `@pixi/particle-emitter`
```js
import { Emitter } from '@pixi/particle-emitter';

const emitter = new Emitter(container, {
  lifetime: { min: 0.5, max: 0.5 },
  frequency: 0.008,
  spawnChance: 1,
  particlesPerWave: 1,
  emitterLifetime: 0.31,
  maxParticles: 1000,
  // ... configuração completa
});

// No game loop:
app.ticker.add((ticker) => {
  emitter.update(ticker.deltaMS / 1000);
});
```

---

## 🔷 SONS COM PIXI-SOUND

```js
import { sound } from '@pixi/sound';

// Adicionar som
sound.add('lobby-music', 'assets/sound/music/lobby/theme.mp3');
sound.add('jump-sfx', 'assets/sound/sfx/player/jump.mp3');

// Tocar
sound.play('lobby-music', { loop: true, volume: 0.5 });
sound.play('jump-sfx');

// Parar
sound.stop('lobby-music');
```

---

## 🔷 INPUT / CONTROLES

```js
// Teclado
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup',   (e) => keys[e.code] = false);

// No game loop
if (keys['ArrowLeft'] || keys['KeyA']) player.x -= speed;
if (keys['ArrowRight'] || keys['KeyD']) player.x += speed;
if (keys['Space'] && player.onGround) player.jump();

// Mouse/Touch (PixiJS nativo)
sprite.interactive = true;
sprite.on('pointerdown', onClick);
sprite.on('pointerover', onHover);
```

---

## 🔷 TILEMAP / MAPA

**Plugin recomendado:** `@pixi/tilemap` ou `pixi-tiled`
```js
// Usando Tiled + pixi-tiled
import { TiledMap } from 'pixi-tiled';

const map = await TiledMap.fromURL('assets/maps/levels/level1.tmj');
world.addChild(map);
```

---

## 🔷 RENDERORDER (CAMADAS Z)

PixiJS renderiza na ordem que os objetos são adicionados.
**Ordem recomendada para o jogo:**

```
Stage
  └── world (Container) ← afetado pela câmera
       ├── skybox (Sprite) ← fundo mais distante
       ├── background_far (Container) ← parallax longe
       ├── background_near (Container) ← parallax perto
       ├── platforms (Container) ← plataformas
       ├── items (Container) ← itens no chão
       ├── enemies (Container) ← inimigos
       ├── player (Container) ← jogador
       └── vfx (Container) ← efeitos visuais
  └── ui (Container) ← NÃO afetado pela câmera
       ├── hud (Container) ← barra de vida, mana, etc.
       └── menus (Container) ← menus, inventário
```

---

## 🔷 PARALLAX SCROLLING

```js
// Múltiplas camadas com velocidades diferentes
app.ticker.add(() => {
  skybox.x = -camera.x * 0.0;        // fixo
  bg_far.x = -camera.x * 0.1;       // muito lento
  bg_near.x = -camera.x * 0.4;      // médio
  platforms.x = -camera.x * 1.0;    // normal (velocidade real)
});
```

---

## 🔷 BOAS PRÁTICAS PIXIJS v8

1. **Sempre use `await app.init()`** - v8 usa inicialização assíncrona
2. **Use `Assets.load()` com manifest** para pré-carregar todos os assets
3. **Agrupe objetos em Containers** por categoria (facilita câmera e culling)
4. **Destrua objetos** quando não precisar: `sprite.destroy()`
5. **Use spritesheets** (atlas) em vez de imagens separadas (performance)
6. **Evite criar objetos no game loop** - crie antes e reutilize (object pooling)
7. **Use `ticker.deltaTime`** para movimento independente de FPS

---

## 🔗 LINKS ÚTEIS

- **Docs oficiais:** https://pixijs.com/8.x/guides
- **API Reference:** https://pixijs.download/release/docs/index.html
- **Exemplos:** https://pixijs.com/8.x/examples
- **Playground:** https://pixijs.com/8.x/playground
- **GitHub:** https://github.com/pixijs/pixijs
- **Discord:** https://discord.gg/CPTjeb28nH
- **Filtros:** https://github.com/pixijs/filters
- **Sound:** https://github.com/pixijs/sound
- **pixi-viewport:** https://github.com/davidfig/pixi-viewport
