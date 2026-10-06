# ⚡ PIXIJS v8 CHEATSHEET — Referência Rápida

## INICIALIZAÇÃO
```js
const app = new Application();
await app.init({ width: 1280, height: 720, backgroundColor: 0x1a1a2e });
document.body.appendChild(app.canvas);
```

## ASSETS
```js
await Assets.load('path/to/file.png');          // Carregar um
await Assets.load(['a.png', 'b.json']);          // Carregar vários
const tex = Assets.get('path/to/file.png');      // Recuperar do cache
```

## SPRITE
```js
const s = new Sprite(texture);
s.x = 100; s.y = 200;                            // Posição
s.anchor.set(0.5);                               // Pivô no centro
s.scale.set(2);                                  // Escala 2x
s.rotation = Math.PI / 4;                        // Rotação em radianos
s.alpha = 0.5;                                   // Transparência
s.visible = false;                               // Ocultar
s.tint = 0xff0000;                               // Colorir (vermelho)
app.stage.addChild(s);
```

## ANIMATED SPRITE
```js
const anim = new AnimatedSprite(frames);
anim.animationSpeed = 0.15;
anim.loop = true;
anim.play(); anim.stop(); anim.gotoAndPlay(0);
anim.onComplete = () => {};                      // Callback fim
```

## CONTAINER
```js
const c = new Container();
c.addChild(child);
c.removeChild(child);
c.sortableChildren = true;                       // Permite zIndex
child.zIndex = 10;
```

## TEXT
```js
const t = new Text({ text: 'Score: 0', style: { fontSize: 24, fill: '#fff' } });
t.text = 'Score: 100';                           // Atualizar texto
```

## GRAPHICS
```js
const g = new Graphics();
g.rect(x, y, w, h).fill(0xff0000);
g.circle(x, y, r).fill(0x00ff00);
g.clear();                                        // Limpar
```

## GAME LOOP
```js
app.ticker.add((ticker) => {
  const dt = ticker.deltaTime;   // ~1 a 60fps normal
  const ms = ticker.deltaMS;     // milissegundos
  const fps = ticker.FPS;        // FPS atual
});
```

## INTERATIVIDADE
```js
sprite.interactive = true;
sprite.on('pointerdown', fn);
sprite.on('pointerup', fn);
sprite.on('pointerover', fn);
sprite.on('pointerout', fn);
```

## FILTROS
```js
sprite.filters = [new BlurFilter({ strength: 5 })];
sprite.filters = null;  // remover filtros
```

## DESTRUIÇÃO
```js
sprite.destroy();                   // Destruir sprite
sprite.destroy({ texture: true });  // + destruir textura
container.destroy({ children: true }); // + destruir filhos
```

## CONVERSÃO DE COORDENADAS
```js
// Global para local e vice-versa
const localPos = container.toLocal(globalPoint);
const globalPos = container.toGlobal(localPoint);
```

## BOUNDS (COLISÃO SIMPLES)
```js
const bounds = sprite.getBounds();
// bounds.x, bounds.y, bounds.width, bounds.height
// AABB collision:
function collides(a, b) {
  const ab = a.getBounds(), bb = b.getBounds();
  return ab.x < bb.x+bb.width && ab.x+ab.width > bb.x &&
         ab.y < bb.y+bb.height && ab.y+ab.height > bb.y;
}
```
