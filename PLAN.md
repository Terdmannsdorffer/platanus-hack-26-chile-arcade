# PROD IS DOWN — plan de construcción

Plan para el modelo que va a construir el juego del Platanus Hack 26 Arcade Challenge.
Entrega: 18 de noviembre de 2026, 23:59 (Santiago). Todo el juego vive en `game.js`.

## 0. Cómo usar este plan

1. Lee `AGENTS.md` y `README.md` (reglas del challenge) y después este archivo completo antes de escribir código.
2. Solo se editan `game.js` y `metadata.json`. `cover.png` ya está hecho (sección 5.6). No toques `index.html`, `vite.config.ts`, `package.json` ni `CABINET_KEYS`.
3. No ejecutes `npm run dev`: lo corre el usuario. Para medir y validar usa `npm run check-restrictions`. Para ver el juego tú mismo usa el arnés de `kit/` (sección 20.2).
4. Construye en el orden de los hitos de la sección 19. Cada hito tiene un tope de tamaño; si lo pasas, compacta antes de seguir.
5. El juego actual de `game.js` (un brick breaker de ejemplo) se reemplaza entero. Conserva de él solo el bloque `CABINET_KEYS`, tal cual.
6. Los números de balance de este plan son un punto de partida razonado, no medido en juego. Ajústalos en el hito 8 sin cambiar la estructura.
7. Si una API de Phaser no se comporta como dice el plan, manda la realidad: resuélvelo y menciona la desviación en tu mensaje final al usuario.
8. No hagas commit ni push salvo que el usuario lo pida: el envío lo hace él con el botón Submit del dev UI.

Qué está verificado y qué no:

- **Verificado en navegador con Phaser 3.87.0**: todo `kit/assets.js` (texturas, fuente bitmap, tileset), el tilemap creado desde un array, y las plataformas de un solo sentido. El ejemplo que lo demuestra es `kit/demo.js`.
- **Verificado contra el minificador y el verificador reales del kit**: todas las reglas de las secciones 2 y 3.
- **Sin verificar** (escrito de memoria de la API): partículas, `cameras.main.shake`, `tileSprite`, `setLineSpacing` y los detalles de Web Audio. Compruébalos al usarlos.

## 1. El juego en una página

**Premisa.** Viernes, 23:59, en plena hackathon. Alguien hizo push a main y producción se cayó. Estás de guardia: entras servidor por servidor, aplastas bugs, instalas dependencias al azar con `npm install` y haces deploy del hotfix. Cada bug que matas sube la **deuda técnica**, que es la dificultad.

**Género.** Roguelike de acción y plataformas en vista lateral con scroll, co-op local para 1 o 2 jugadores con entrada en cualquier momento.

**Loop de una etapa (unos 2 minutos).**

1. Aparecen en el extremo izquierdo de un servidor generado al azar.
2. Avanzan matando bugs, que sueltan créditos (`$`).
3. Gastan créditos en terminales `npm install` (gacha): cada tirada da un ítem pasivo que se apila.
4. Al final del nivel está la terminal de DEPLOY. Activarla encierra a los jugadores en la arena y hace aparecer al jefe.
5. Al morir el jefe: pantalla de release con 3 tiradas gratis y tienda para gastar lo que sobre.
6. Siguiente servidor, con otro bioma y más vida para el jefe. La deuda técnica nunca baja.

**Fin de partida.** Mueren todos los jugadores. Puntaje, iniciales y tabla de los 5 mejores. Una partida típica debería durar entre 6 y 10 minutos.

**Pilares.**

- La dificultad depende de las muertes, no del reloj. Farmear da poder y también sube la dificultad; correr al deploy con poca deuda es una estrategia válida.
- El gacha es el momento de espectáculo: ruleta, color de rareza, fanfarria.
- Se entiende en 10 segundos con joystick y botones. No hay mouse.
- Humor de desarrolladores en cada nombre.

**Fuera de alcance, a propósito.** Niveles de experiencia, clases distintas, progreso guardado entre partidas, más de 2 jefes, diálogos.

**Originalidad.** El juego toma mecánicas de género (ítems apilables, dificultad creciente, objetivo con jefe por etapa). No copies nombres, personajes, arte, música ni niveles de ningún juego existente. Todos los nombres de este plan son propios.

## 2. Restricciones verificadas

Salen del código de `@platanus/arcade-dev-ui-26` (verificador, dashboard y envío), no solo del README.

| # | Regla real | Consecuencia práctica |
|---|---|---|
| 1 | El tamaño es el de `game.js` minificado con swc (`compress: true, mangle: true`), en bytes UTF-8, y el límite es 51 200. | Mide con `npm run check-restrictions`. El tamaño sin minificar no importa. |
| 2 | Falla si alguna línea contiene `//` seguido inmediatamente de una letra o un dígito, o `http://` o `https://`. | Todo comentario lleva espacio: `// así`. Nunca `//así`. Tampoco dentro de strings ni expresiones regulares. |
| 3 | Falla con `fetch(`, `XMLHttpRequest(`, `axios(` o `ajax(` como palabra completa. | No llames a ninguna función `fetch`. |
| 4 | Falla con `import(` o `require(`, o con una línea que empiece por `import `. | Cuidado con comentarios o strings multilínea que empiecen así. |
| 5 | `eval(` y `new Function(` dan advertencia. | No los uses: el check "Code Safety" debe quedar en verde. |
| 6 | El dashboard inserta el código dentro de `window.initGame = function () { try { CÓDIGO } catch ... }`, en un `<script>` escrito con `document.write`. | El código nunca puede contener el texto `</script` ni `<!--`. Al ejecutarse, `Phaser` ya es global y existe `<div id="game-root">`. |
| 7 | En producción el iframe no tiene `allow-same-origin`. | Tocar `localStorage` lanza excepción: siempre dentro de `try/catch`. Usa `window.platanusArcadeStorage` si existe (en desarrollo no existe). |
| 8 | El dashboard reenvía las teclas despachando el evento en `window` y también en `document`. | Un listener en `window` recibe cada pulsación dos veces. Detecta "recién pulsado" comparando estado por frame, nunca contando eventos. |
| 9 | Al enviar, el dashboard graba el canvas durante los primeros 10 segundos tras cargar (un cuadro cada 100 ms). Eso es la vista previa en la galería. | Los primeros 10 segundos deben mostrar acción: modo demo detrás del título desde el primer segundo. |
| 10 | La portada debe ser PNG de 800x600, de 500 KB o menos y distinta de la original. | Ya cumplido. |
| 11 | `metadata.json` se considera sin rellenar si el nombre o la descripción contienen `<`. | No uses `<` en esos textos. |

Hechos medidos del minificador:

- **Los nombres de primer nivel no se acortan.** Envolver todo en una IIFE bajó el juego de ejemplo de 28 494 a 25 113 bytes (12 %). Es obligatorio.
- **Los nombres de propiedades y de métodos nunca se acortan.** `enemy.cooldownTimer` cuesta sus 13 letras cada vez que aparece. Las variables locales sí se acortan.
- Las constantes (`const BUG = 0`) se sustituyen por su valor y el código bajo `if (DEV)` con `const DEV = 0` desaparece.
- Las letras con tilde cuestan 4 bytes cada una dentro de un string. La fuente del juego no las tiene, así que el texto en pantalla va en mayúsculas sin tildes.

## 3. Reglas de código para caber en 50 KB

El ejemplo del repo es un juego simple y ya pesa 28 KB minificado. Este juego tiene varias veces más sistemas, así que el estilo importa desde la primera línea.

1. Todo dentro de `(() => { ... })();`.
2. Estado global en variables `let` locales a la IIFE (`stage`, `debt`, `coins`), no en un objeto: las variables se acortan y las propiedades no.
3. Sin clases. Las entidades son sprites de Phaser con propiedades propias de nombres cortos (`hp`, `t`, `k`, `own`). Decide un vocabulario corto y repítelo en todos los tipos.
4. Datos en tablas compactas: strings partidos con `split` al arrancar o arrays de arrays. Nada de objetos con claves largas repetidas.
5. Un ayudante por cada cadena de Phaser que se repita más de 3 veces. Ejemplos: `txt(x, y, s, size, tint)`, `img(x, y, key)`, `bar(...)`, `sfx(id)`.
6. Una sola escena con una variable de modo. Para reiniciar la partida, `scene.restart()`.
7. Sistemas genéricos: un solo grupo de balas con una bandera de dueño, una sola función `hurt(objetivo, daño, origen)`, una sola función de explosión de partículas.
8. Solo `bitmapText` con la fuente `'f'`. Nunca `this.add.text` (cada cambio de texto vuelve a rasterizar).
9. Barras y balas son la textura `'px'` escalada y teñida. No redibujes un `Graphics` por frame, salvo un único `Graphics` compartido para líneas efímeras (rayos, mira del láser).
10. Textos en pantalla: mayúsculas, sin tildes ni Ñ. Usa "ATAQUE" en vez de "DAÑO".
11. Mide al cerrar cada hito. Si te pasas del tope, compacta antes de añadir nada.

## 4. Arquitectura

### 4.1 Orden del archivo

```
// comentario de cabecera (con espacio tras las barras)
(() => {
  1. constantes y tablas de datos (items, enemigos, niveles de deuda)
  2. CABINET_KEYS (copiado tal cual) + entrada
  3. almacenamiento
  4. kit de assets (pegar kit/assets.js)
  5. audio: efectos y musica
  6. estado global (let ...)
  7. create(): assets, grupos, HUD, arranque en titulo + demo
  8. generacion de nivel
  9. jugador, balas, daño, items
  10. enemigos, director, jefes
  11. gacha y pantallas
  12. update(): despacha segun el modo
  new Phaser.Game({...});
})();
```

### 4.2 Configuración de Phaser

```js
new Phaser.Game({
  type: Phaser.AUTO, width: 800, height: 600, parent: 'game-root',
  backgroundColor: '#0b0f14', pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 1100 } } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { create, update },
});
```

`pixelArt: true` es obligatorio: sin él las texturas del kit se ven borrosas.

### 4.3 Modos

`TITLE` (logo sobre la demo), `PLAY`, `GACHA` (pantalla de release tras el jefe), `PAUSE`, `OVER` (resultado), `NAME` (iniciales). La demo es `PLAY` con `demo = 1` y entrada sintética.

Para volver al título o empezar partida usa `scene.restart()`. Lo que sobrevive a un reinicio y debe crearse una sola vez (con guarda): las texturas y la fuente (`if (!SPR.length) buildAssets(this)`), los listeners de teclado en `window`, el contexto de audio y la tabla de récords cargada.

### 4.4 Grupos y colisiones

Se crean una vez por escena:

| Grupo | Tipo | Tope | Notas |
|---|---|---|---|
| `players` | grupo de física | 2 | gravedad activada, `collideWorldBounds` |
| `enemies` | grupo de física, reciclado | 48 | los voladores llevan `fly = 1` y `body.allowGravity = false` |
| `bullets` | grupo de física, reciclado | 140 | sin gravedad; `own = 1` si la disparó un jugador |
| monedas | array de imágenes, sin física | 60 | movimiento manual |
| números de daño | array de `bitmapText` reciclados | 24 | |
| partículas | un solo emisor | 150 vivas | |

Colisiones con el nivel (se recrean en cada etapa porque cambia la capa; guárdalas en un array para destruirlas):

```js
// Verificado en kit/demo.js. Una plataforma de un solo sentido solo frena a quien viene desde arriba.
const oneWay = (s, tile) =>
  tile.index % 3 !== 2 || (!s.dropping && s.body.prev.y + s.body.height <= tile.getTop() + 1);

physics.add.collider(players, layer, null, oneWay);
physics.add.collider(enemies, layer, null, (e, t) => !e.fly && oneWay(e, t));
physics.add.collider(bullets, layer, killBullet, (b, t) => t.index % 3 !== 2 && !b.ghost);
```

Solapamientos (se crean una vez):

```js
physics.add.overlap(bullets, enemies, hitEnemy, (b, e) => b.own);
physics.add.overlap(bullets, players, hitPlayer, (b, p) => !b.own);
physics.add.overlap(enemies, players, touchPlayer);
```

### 4.5 Profundidades

Fondo -10, tiles 0, terminales 1, monedas 2, enemigos 3, jugadores 4, balas 5, efectos 6, números de daño 7, HUD 20, paneles 30, scanlines 99.

### 4.6 Tiempo

Para temporizadores manuales usa `dt = Math.min(delta, 50) / 1000`. La física de Arcade ya corre a paso fijo.

## 5. Kit de assets (ya hecho)

| Archivo | Qué es |
|---|---|
| `kit/sprites.txt` | Fuente de verdad del pixel art, como arte ASCII. |
| `kit/font.txt` | Fuente 5x5, un glifo por bloque. |
| `kit/build.mjs` | `node kit/build.mjs` regenera `assets.js` y `preview.png`. Con `--cover` regenera también `cover.png`. |
| `kit/assets.js` | **Bloque para pegar en `game.js`.** Pesa 3,3 KB minificado e incluye 42 sprites, fuente, paleta y tileset. |
| `kit/preview.png` | Hoja de sprites renderizada, con el índice de cada uno. Mírala antes de empezar. |
| `kit/demo.js`, `kit/harness.html`, `kit/serve.mjs` | Ejemplo verificado y arnés de prueba local. |

### 5.1 Integración

Pega el contenido de `kit/assets.js` dentro de la IIFE y llama a `buildAssets(this)` al inicio de `create()`, con la guarda de la sección 4.3. Deja creadas estas texturas:

- `'s0'` a `'s41'`: los sprites de la tabla 5.2, ya escalados a su tamaño en pantalla.
- `'q0'` a `'q3'`: los 4 cuadros del jugador con buzo rosado, para el jugador 2.
- `'ts'`: terminal en rojo, para la terminal sudo.
- `'tl'`: tileset de 9 tiles de 32 px. Índice = `bioma * 3 + tipo`, con tipo 0 borde de suelo, 1 relleno y 2 plataforma de un solo sentido.
- `'px'`: cuadrado blanco de 2x2 para balas, barras y partículas (`setScale` + `setTint`).
- `'f'`: fuente bitmap.

Para otra variante de color: `makeTexture(scene, clave, indice, paleta)`, donde la paleta son 3 caracteres de la tabla 5.4.

### 5.2 Sprites

Tamaños en píxeles de pantalla. La caja de colisión sugerida va alineada abajo y centrada.

| Índice | Contenido | Textura | Caja sugerida | Notas |
|---|---|---|---|---|
| 0 | dev quieto | 24x28 | 14x26 | mira a la derecha; `setFlipX(true)` para la izquierda |
| 1, 2 | dev corriendo A y B | 24x28 | igual | alternar cada 90 ms |
| 3 | dev en el aire | 24x28 | igual | |
| 4, 5 | BUG A y B | 24x20 | 20x16 | alternar cada 150 ms |
| 6, 7 | MOSCA A y B | 24x20 | 18x14 | alternar cada 80 ms |
| 8 | NULL POINTER | 24x24 | 18x18 | |
| 9 | SEGFAULT | 20x20 | 16x16 | |
| 10 | MEMORY LEAK | 28x20 | 24x16 | el grande usa `setScale(2)`; los minis, escala 1 |
| 11 | RACE CONDITION | 24x20 | 20x16 | |
| 12 | jefe MERGE CONFLICT | 96x72 | 80x58 | |
| 13 | jefe KERNEL PANIC | 88x80 | 72x56 centrada en la pantalla del monitor | |
| 14 | terminal npm | 24x28 | no tiene | `'ts'` es la versión sudo |
| 15 | terminal de DEPLOY | 32x32 | no tiene | |
| 16 | moneda | 12x12 | no tiene | |
| 17 | dron | 16x16 | no tiene | |
| 18 | lápida de jugador caído | 20x20 | no tiene | |
| 19, 20, 21 | tiles | 32x32 | | úsalos a través de `'tl'` |
| 22 a 41 | iconos de ítem | 16x16 | | icono del ítem `id` = `'s' + (22 + id)` |

La animación se hace cambiando de textura con `setTexture`, sin el sistema de animaciones de Phaser.

### 5.3 Fuente

`scene.add.bitmapText(x, y, 'f', 'TEXTO', tamaño)`. El tamaño es el ancho de celda en pantalla: 6 es x1, 12 es x2, 18 es x3, 24 es x4. Usa siempre múltiplos de 6.

- Caracteres disponibles: espacio, `A-Z`, `0-9` y `. , ! ? : - + % $ / > < ' # * ( ) = _ [ ]`. No hay minúsculas, tildes ni Ñ. Un carácter que no existe simplemente no se dibuja, así que pasa todo por `toUpperCase()`.
- Los glifos son blancos: el color se da con `setTint`.
- El alto de línea es igual al tamaño, así que las líneas quedan pegadas. Para varias líneas usa objetos separados o `setLineSpacing`.
- Llama a `setText` solo cuando el valor cambia.

### 5.4 Paleta

| Índice | Hex | Uso |
|---|---|---|
| 0 | `0b0f14` | fondo |
| 1 | `1b2430` | pizarra oscura |
| 2 | `33415a` | pizarra |
| 3 | `6b7c99` | acero, texto secundario |
| 4 | `e8f0ff` | blanco, ítems comunes |
| 5 | `e1ff00` | lima, jugador 1 y acento principal |
| 6 | `7bd02b` | verde, vida y texto de terminal |
| 7 | `1e7a3c` | verde oscuro |
| 8 | `ff6ec7` | rosado, jugador 2 |
| 9 | `9c2a6e` | magenta oscuro |
| a | `ff5a4f` | rojo, peligro y balas enemigas |
| b | `8c1c2c` | rojo oscuro |
| c | `ffb62e` | dorado, créditos e ítems legendarios |
| d | `3ec5ff` | cian, ítems raros |
| e | `2456c9` | azul |
| f | `8b5cf6` | morado |
| g | `ffd2a8` | piel |
| h | `7a4a2b` | café |

Colores de rareza: común `0xe8f0ff`, raro `0x3ec5ff`, legendario `0xffb62e`.

### 5.5 Lo que no está en el kit

Se dibuja en el juego con `'px'` o con un lienzo propio:

- Balas, barras de vida y enfriamiento, onda del especial, ondas de choque y rayo láser: `'px'` escalado y teñido.
- Fondo: una textura de lienzo `'bg'` de 256x256 con siluetas de racks y algunos LED, dibujada una vez. Se usa en dos `tileSprite` con `setScrollFactor(0)`, moviendo `tilePositionX = cam.scrollX * factor` (0.15 el lejano, 0.4 el cercano). Tíñelos según el bioma.
- Scanlines: una textura de 2x4 con una fila oscura, en un `tileSprite` a pantalla completa con alfa 0.15 y profundidad 99.

### 5.6 Portada

`cover.png` ya está generada con los sprites del kit (800x600, 15 KB) y pasa la validación. Si cambias sprites, regénerala con `node kit/build.mjs --cover`.

### 5.7 Cambiar o añadir sprites

Edita `kit/sprites.txt`, corre `node kit/build.mjs`, mira `kit/preview.png` y vuelve a pegar `kit/assets.js`. Cada sprite admite 3 colores más transparencia. Los sprites nuevos van al final del archivo para no mover los índices.

## 6. Controles y entrada

### 6.1 Mapeo

| Acción | Código de gabinete | Teclado P1 | Teclado P2 |
|---|---|---|---|
| Mover | `Pn_L`, `Pn_R` | A, D | flechas izquierda y derecha |
| Apuntar arriba (con dirección: diagonal) | `Pn_U` | W | flecha arriba |
| En el aire: apuntar abajo. Con salto sobre una plataforma: bajar | `Pn_D` | S | flecha abajo |
| Disparar (mantener) | `Pn_1` | U | R |
| Saltar | `Pn_2` | I | T |
| Dash | `Pn_3` | O | Y |
| Especial FORCE PUSH | `Pn_4` | J | F |
| Interactuar | `Pn_5` o `Pn_6` | K o L | G o H |
| Pausa, o entrar a la partida | `START1`, `START2` | Enter | 2 |

### 6.2 Módulo de entrada

```js
const held = {}, prev = {};
const norm = (k) => (k.length === 1 ? k.toLowerCase() : k);
// KEY_TO_ARCADE se construye desde CABINET_KEYS, igual que en el ejemplo del repo
addEventListener('keydown', (e) => { const c = KEY_TO_ARCADE[norm(e.key)]; if (c) { held[c] = 1; e.preventDefault(); } });
addEventListener('keyup', (e) => { const c = KEY_TO_ARCADE[norm(e.key)]; if (c) held[c] = 0; });
addEventListener('blur', () => { for (const c in held) held[c] = 0; });

const down = (c) => held[c];             // mantenido
const hit = (c) => held[c] && !prev[c];  // recien pulsado en este frame
// ultima linea de update(): for (const c in held) prev[c] = held[c];
```

- Registra los listeners una sola vez (sobreviven a `scene.restart()`).
- Para el jugador `i` (0 o 1) el código es `'P' + (i + 1) + '_U'`, etc.
- En el modo demo, `down` y `hit` del jugador 0 devuelven la entrada del bot (sección 14.1).
- Cualquier tecla real reanuda el audio (`ctx.resume()`), pone a cero el contador de inactividad y saca de la demo.
- Inactividad: 60 s sin entrada durante `PLAY` devuelve al título. Es un gabinete público.

## 7. Jugador

### 7.1 Movimiento

| Parámetro | Valor |
|---|---|
| Velocidad horizontal | 190 px/s, fijada directamente, sin inercia |
| Gravedad | 1100 px/s² |
| Salto | velocidad vertical -500 (altura máxima de unos 113 px, tres tiles y medio) |
| Salto variable | al soltar el botón subiendo más rápido que -180, la velocidad pasa a -180 |
| Coyote | 90 ms tras dejar el suelo |
| Buffer de salto | 110 ms |
| Saltos en el aire | uno por cada SPRING BOOT |
| Caída máxima | 640 px/s |
| Bajar de plataforma | abajo + salto sobre una plataforma: `dropping = 1` durante 200 ms |

El sprite mira hacia la última dirección horizontal pulsada.

### 7.2 Disparo ("git push")

- Con disparar mantenido, una bala cada `0.25 / cadencia` segundos.
- Bala: `'px'` de 10x4, velocidad 620, vida 0.7 s (alcance de unos 430 px), color del jugador.
- Dirección: al frente por defecto. Con arriba, vertical. Con arriba y una dirección, diagonal. En el aire, abajo y diagonal abajo.
- Las balas mueren al tocar un tile sólido y atraviesan las plataformas de un solo sentido.
- Ayuda de puntería (hito 7, primer recorte): si hay un enemigo a menos de 420 px y a menos de 30 grados de la dirección, la bala gira hasta 12 grados hacia él.

### 7.3 Dash ("ALT+TAB")

Dura 0.16 s a 560 px/s en la dirección del joystick (8 direcciones; al frente si está neutro). Sin gravedad e invulnerable durante el dash y 0.1 s más. Enfriamiento de `2.2 * cdMul` segundos. Deja 3 copias que se desvanecen.

### 7.4 Especial ("FORCE PUSH")

Onda de 14x40 hecha con `'px'`, velocidad 520, vida 0.6 s. Atraviesa a todos los enemigos y también las paredes (`ghost = 1`). Hace 4 veces el daño del jugador y empuja 320 px/s a todo lo que no sea jefe. Enfriamiento de `7 * cdMul` segundos. Sacude la cámara.

### 7.5 Estadísticas derivadas

`recalc()` se llama al empezar y al conseguir un ítem. `n(id)` es cuántos hay de ese ítem.

```
ataque    = 12 * (1 + 0.2 * n(STACK)) * (1 + n(SUDO))
cadencia  = 1 + 0.15 * n(CAFE)
velocidad = 190 * min(1.8, 1 + 0.10 * n(ENERGETICA))
critico   = min(1, 0.05 + 0.10 * n(PATITO))      // un critico hace x2
vidaMax   = 100 + 25 * n(TESTS)
atraviesa = n(CONSOLE)
esquiva   = n(CTRLZ) / (n(CTRLZ) + 9)             // 10 %, 18 %, 25 %...
regen     = 0.8 * n(PIZZA)                        // vida por segundo
cdMul     = 1 / (1 + 0.18 * n(CACHE))
saltosAire = n(SPRING)
```

### 7.6 Recibir daño

Orden de comprobación para un golpe de `d` puntos (ya multiplicado por la deuda):

1. Si está en dash o es invulnerable, no pasa nada.
2. Tirada de esquiva: si sale, aparece "UNDO" y no pasa nada.
3. Si tiene el escudo DOCKER cargado, lo consume y no pasa nada (destello cian).
4. Resta `max(1, d)`. Invulnerable 0.8 s parpadeando, empujón de 180 px/s lejos del origen con un saltito, sacudida y sonido.
5. Si la vida llega a 0 y hay un ROLLBACK, se gasta: vida al 50 %, 2 s de invulnerabilidad, se borran las balas enemigas y todo enemigo a menos de 200 px recibe 200 de daño.
6. Si no, el jugador cae (sección 7.8).

Caer a un pozo (`y` mayor que el alto del mundo menos 16): 15 de daño, vuelve a la última posición segura y queda 1 s invulnerable. La posición segura se guarda cada 0.25 s mientras pisa suelo.

### 7.7 Cámara

- Sigue un punto invisible: el promedio de los jugadores vivos, más 50 px hacia donde mira si hay un solo jugador. `startFollow(punto, true, 0.1, 0.1)`.
- `cameras.main.setBounds(0, 0, 3200, 704)`.
- Con dos jugadores, cada uno queda limitado en X a `[scrollX + 12, scrollX + 788]`.
- Durante el jefe, los límites de la cámara y del mundo físico pasan a ser la arena (sección 11.1).

### 7.8 Co-op

- El jugador 2 entra con `START2` en cualquier momento de `PLAY` (y el 1 con `START1` si empezó el 2). Aparece sobre su compañero con la vida llena y 1.5 s de invulnerabilidad.
- Créditos e inventario son compartidos: una tirada beneficia a los dos. Escudo, drones y contador de disparos son de cada jugador.
- Con dos jugadores: vida de enemigos x1.5, vida del jefe x1.6, créditos del director x1.5, tope de enemigos x1.3.
- Un jugador sin vida queda caído: lápida (`'s18'`) con el texto "OFFLINE". El compañero lo revive quedándose a menos de 40 px durante 2.5 s (barra sobre la lápida): vuelve con el 40 % de la vida y 1.5 s de invulnerabilidad. Al empezar cada etapa los caídos reviven con el 50 %.
- La partida termina cuando todos los que entraron están caídos y no queda ROLLBACK.

## 8. Niveles

### 8.1 Dimensiones

Tile de 32 px. Mundo de 100 columnas por 22 filas (3200x704). La cámara ve 800x600, así que hay 104 px de scroll vertical. Fila 0 arriba.

| Columnas | Zona |
|---|---|
| 0 a 7 | inicio: suelo plano con el borde en la fila 18; los jugadores aparecen en la columna 3 |
| 8 a 74 | terreno generado |
| 75 a 99 | arena del jefe (800 px): suelo plano en la fila 18, plataformas en las columnas 79-83 y 91-95 de la fila 15, terminal de DEPLOY en la columna 87 |

### 8.2 Generación

La matriz es `map[fila][columna]`, con -1 para vacío. `top[c]` es la fila del borde del suelo en la columna `c` (22 significa pozo).

```
h = 18; c = 8; ultimoFuePozo = false
mientras c < 72:
  r = azar()
  si r < 0.18 y c > 12 y no ultimoFuePozo:
    ancho = entero(2, 3); top[c .. c+ancho-1] = 22; c += ancho; ultimoFuePozo = true
  si no:
    si r < 0.75: h = limitar(h + elegir(-2, -1, 1, 2), 12, 19)
    largo = entero(4, 9); top[c .. c+largo-1] = h; c += largo; ultimoFuePozo = false
columnas 72 a 74: acercar h a 18 de a 2 filas como maximo por columna
por cada columna: fila top[c] = borde (tipo 0); filas siguientes hasta la 21 = relleno (tipo 1)
```

Garantías de recorrido (no las rompas al ajustar): los escalones son de 2 tiles como máximo, los pozos de 3 como máximo, y el salto sube 3 tiles y medio y cruza unos 5.

Plataformas de un solo sentido (tipo 2):

```
c = 10
mientras c < 70:
  si azar() < 0.75:
    largo = entero(3, 6); fila = top[c] - 3
    poner plataforma en (fila, c .. c+largo-1)
    si azar() < 0.45:
      poner otra en (fila - 3, c + entero(2, 4) .. + entero(3, 5))
  c += entero(5, 9)
```

Una celda de plataforma solo se pone si está vacía, su fila es 4 o mayor, y queda al menos 2 filas por encima del suelo de esa columna. Si `top[c]` es un pozo, usa la altura de la columna anterior.

Mientras generas, guarda una lista de puntos pisables (columna, fila, nivel de plataforma) para colocar objetos y enemigos.

### 8.3 Objetos

- **5 terminales npm**: divide las columnas 10 a 72 en 5 tramos y pon una en un punto pisable de cada tramo, prefiriendo plataformas.
- **1 terminal sudo** desde la etapa 2: en la plataforma más alta que quede libre.
- **Terminal de DEPLOY**: columna 87, sobre el suelo de la arena.
- **Población inicial**: `min(16, 6 + 2 * etapa)` enemigos de los tipos desbloqueados, en puntos a más de 500 px del inicio y fuera de la arena.
- **Solo en la etapa 1**: dos carteles de texto en el mundo cerca del inicio: `[B1] DISPARAR  [B2] SALTAR` y `[B5] USAR TERMINAL`.

### 8.4 Tilemap

Como en `kit/demo.js`:

```js
const map = scene.make.tilemap({ data, tileWidth: 32, tileHeight: 32 });
const layer = map.createLayer(0, map.addTilesetImage('tl', 'tl', 32, 32), 0, 0);
layer.setCollision([0, 1, 3, 4, 6, 7]);
layer.forEachTile((t) => { if (t.index % 3 === 2) t.setCollision(false, false, true, false, false); });
```

Al escribir `data` suma `bioma * 3` a cada tipo. Al terminar la etapa destruye la capa, el mapa y las colisiones, y desactiva todo lo que esté vivo en los grupos.

### 8.5 Biomas y nombres

`bioma = (etapa - 1) % 3`: 0 FRONTEND (cian), 1 BACKEND (verde), 2 LEGACY (dorado). El cartel de entrada dice `SERVIDOR 4: FRONTEND` y debajo `ENCUENTRA LA TERMINAL DE DEPLOY`.

## 9. Deuda técnica y director de enemigos

### 9.1 Deuda

- `debt` empieza en 0 y nunca baja. Cada muerte suma el valor del enemigo (tabla 10.1); un élite vale el triple; un jefe, 12; usar la terminal sudo, 15.
- `lvl = 1 + floor(debt / 18)`. La barra del HUD muestra `debt % 18`.
- Nombre del nivel: 1-2 `TODO OK`, 3-4 `WARNING`, 5-7 `ERROR`, 8-10 `CRITICAL`, 11-14 `INCIDENTE`, 15-19 `KERNEL PANIC`, 20 o más `VIERNES 18:00`.

Multiplicadores:

```
vidaEnemigo  = 1 + 0.16 * (lvl - 1)
dañoEnemigo  = 1 + 0.08 * (lvl - 1)
velEnemigo   = min(1.35, 1 + 0.015 * (lvl - 1))
creditosMul  = 1 + 0.06 * (lvl - 1)
```

Ritmo esperado: unas 25 muertes por minuto al principio, que es un nivel de deuda cada 35 a 45 segundos y nivel 14 a 18 hacia el minuto 8. Si en las pruebas queda muy lejos, ajusta el 18.

### 9.2 Director

```
creditosDirector += dt * (0.7 + 0.16 * lvl) * (dosJugadores ? 1.5 : 1) * (hayJefe ? 0.5 : 1)
cada entero-al-azar(0.8, 2.2) segundos:
  si vivos >= tope: nada
  tipo = uno al azar entre los desbloqueados
  si coste(tipo) > creditosDirector: nada (ahorra para el siguiente intento)
  elite = lvl >= 4 y creditosDirector >= coste * 3 y azar() < min(0.4, 0.12 + 0.02 * lvl)
  crear el enemigo y restar el coste (x3 si es elite)
  si es BUG o MOSCA: repetir hasta 2 veces mas si alcanza (manada)
tope = min(34, 6 + 2 * lvl) * (dosJugadores ? 1.3 : 1)
```

- Un tipo está desbloqueado si `lvl` alcanza su nivel mínimo.
- Posición: una columna entre 2 y 6 tiles fuera del borde de la cámara, por cualquiera de los dos lados, dentro de los límites del mundo. Los caminantes aparecen sobre el suelo o una plataforma de esa columna (si es pozo, reintenta); los voladores, entre la fila 3 y dos filas sobre el suelo.
- Durante el jefe solo aparecen dentro de la arena: los voladores por los bordes y los caminantes cayendo desde arriba, con un aviso de 0.5 s.
- Un enemigo a más de 1300 px de todos los jugadores durante 4 s desaparece y devuelve su coste, sin deuda ni créditos. Lo mismo si cae a un pozo.

## 10. Enemigos

### 10.1 Tabla

Vida y daño son la base, antes de los multiplicadores de la deuda y del co-op.

| Tipo | Sprite | Conducta | Vida | Daño | Vel. | Coste | Valor | Créditos | Nivel mín. |
|---|---|---|---|---|---|---|---|---|---|
| BUG | 4, 5 | caminante | 24 | 8 | 70 | 1 | 1 | 2 | 1 |
| MOSCA | 6, 7 | volador | 14 | 6 | 105 | 1 | 1 | 2 | 2 |
| NULL POINTER | 8 | tirador | 36 | 8 al tocar, 10 la bala | 60 | 3 | 2 | 5 | 3 |
| SEGFAULT | 9 | explosivo | 20 | 22 la explosión | 150 | 2 | 2 | 3 | 4 |
| MEMORY LEAK | 10 a escala 2 | divisor | 110 | 14 | 45 | 5 | 3 | 8 | 6 |
| mini leak | 10 a escala 1 | caminante | 28 | 8 | 80 | no se compra | 1 | 1 | |
| RACE CONDITION | 11 | embestidor | 55 | 18 | 60 y 460 | 4 | 3 | 6 | 8 |

El valor suma a la deuda y al puntaje (`valor * 10 * etapa` puntos).

### 10.2 Conductas

Común a todos: el objetivo es el jugador vivo más cercano; al recibir daño el sprite parpadea en blanco 60 ms (`setTintFill`) y queda aturdido 0.15 s si lo empujan; el daño por contacto lo limita la invulnerabilidad del jugador.

- **Caminante.** Velocidad horizontal hacia el objetivo. Si choca con una pared y pisa suelo, salta (-430). Si el objetivo está más de 70 px arriba y a menos de 160 px en horizontal, cada frame tiene un 2 % de probabilidad de saltar alto (-520, alcanza una plataforma). Se deja caer de las cornisas.
- **Volador.** Sin gravedad ni colisión con tiles. Se acerca al objetivo suavizando la velocidad (`vx += (objetivoVx - vx) * 0.05`) y con un vaivén vertical senoidal.
- **Tirador.** Volador que busca quedar a unos 220 px en horizontal y 120 por encima del objetivo. A menos de 320 px y cada 2.4 s: se tiñe de blanco 0.35 s y dispara una bala roja de 8x8 a 210 px/s, con 3 s de vida.
- **Explosivo.** Caminante rápido. A menos de 56 px se detiene, parpadea 0.55 s y explota: daña a los jugadores a menos de 80 px y hace 40 de daño a otros enemigos. Si lo matan antes, no explota.
- **Divisor.** Caminante lento. Al morir suelta 2 mini leaks hacia los lados con un saltito.
- **Embestidor.** Camina a 60. Si el objetivo está a menos de 36 px en vertical y 320 en horizontal, y pasaron 3 s desde la última vez: se detiene 0.5 s teñido de blanco, embiste a 460 px/s durante 0.6 s sin girar, y descansa 0.8 s.

### 10.3 Élites

Desde el nivel de deuda 4. Un élite lleva uno de tres prefijos, visible por el tinte. Vale el triple en deuda, puntaje y créditos.

| Prefijo | Tinte | Efecto |
|---|---|---|
| LEGACY | dorado | vida x3, tamaño x1.25 |
| ASYNC | cian | velocidad x1.5, vida x1.8, ataques 40 % más seguidos |
| SUDO | morado | daño x2, vida x2, al morir suelta 6 balas en círculo |

## 11. Jefes

### 11.1 Inicio del combate

Al pulsar interactuar junto a la terminal de DEPLOY:

1. Cartel `DEPLOY INICIADO` y sonido del jefe.
2. `physics.world.setBounds(2400, 0, 800, 704)` y lo mismo para los límites de la cámara: los bordes del mundo son las paredes de la arena. Dibuja una franja roja pulsante en el borde izquierdo.
3. Desaparecen los enemigos de fuera de la arena. Si el compañero está fuera, se teletransporta junto a la terminal.
4. El jefe entra durante 1.2 s, invulnerable, con su nombre en pantalla. Después aparece su barra de vida.

Etapas impares: MERGE CONFLICT. Etapas pares: KERNEL PANIC.

```
vidaJefe = base * (1 + 0.5 * (etapa - 1)) * (1 + 0.05 * (lvl - 1)) * (dosJugadores ? 1.6 : 1)
```

El daño del jefe usa el multiplicador de daño de la deuda. Tocarlo hace 20. Bajo el 40 % de vida entra en fase 2: se tiñe de rojo y todas sus pausas se multiplican por 0.65. Ataca en ciclo A, B, A, C con 1.1 s entre ataques. Los jefes ignoran los empujones.

### 11.2 MERGE CONFLICT (sprite 12, vida base 700, en el suelo)

Entre ataques camina hacia el objetivo a 45 px/s.

- **A, STOMP.** Se aplasta 0.5 s como aviso y salta (-620) para caer cerca del objetivo (velocidad horizontal `dx / 1.1`, limitada a 300). Al aterrizar sacude la cámara y lanza dos ondas de choque de 16x24 por el suelo, una a cada lado, a 300 px/s durante 1.2 s. Hacen 16 de daño y se esquivan saltando.
- **B, MARCADORES.** Aviso de 0.5 s. Cada cabeza (a 30 px del centro) dispara un abanico de 5 balas en 50 grados hacia el objetivo, a 230 px/s y 10 de daño. En fase 2 son 7.
- **C, REBASE.** Tiembla 0.6 s y embiste en horizontal a 420 px/s hasta chocar con la pared o durante 1.4 s. Luego descansa 1 s.

### 11.3 KERNEL PANIC (sprite 13, vida base 600, volador)

Flota a unos 150 px del borde superior de la cámara y sigue la X del objetivo a 90 px/s como máximo, con vaivén.

- **A, STACK TRACE.** Caen 9 balas desde arriba, repartidas por el ancho de la arena con un hueco al azar de 2 posiciones, a 260 px/s y con 0.08 s entre cada una. 10 de daño. En fase 2, dos oleadas.
- **B, PANTALLAZO AZUL.** Una línea vertical fina sigue al jefe 0.7 s, se queda fija 0.25 s y dispara un rayo de 40 px de ancho hasta el suelo durante 0.5 s. 22 de daño. El jefe no se mueve mientras dispara; en fase 2 barre a 120 px/s.
- **C, FORK.** Crea 3 MOSCAS.

### 11.4 Muerte del jefe

Medio segundo de cámara lenta, explosión grande de partículas, mueren todos los enemigos, las monedas vuelan a los jugadores, cartel `DEPLOY EXITOSO`, suma `500 * etapa` puntos y 12 de deuda, fanfarria y, 1.5 s después, la pantalla de release (sección 12.4).

## 12. Economía y gacha

### 12.1 Créditos

- Compartidos. En el HUD: icono de moneda y `$123`.
- Un enemigo suelta `techo(creditos * creditosMul)`, triple si es élite; un jefe suelta 40. Se reparten en 4 monedas como máximo.
- Las monedas saltan 0.35 s y después vuelan solas al jugador vivo más cercano a 500 px/s, desde cualquier distancia. Nunca se pierden.

### 12.2 Tirada

```
precio = 18 + 5 * tiradasPagadas          // global de la partida; las gratis no cuentan
rareza: 5 % legendario, 25 % raro, 70 % comun
pity: cada tirada sin legendario suma 1; con 9 acumuladas la siguiente es legendaria; un legendario lo reinicia
item: uno al azar de esa rareza (si sale ROLLBACK y ya hay 2, se vuelve a tirar)
```

Ritmo esperado: 3 o 4 tiradas pagadas más 3 gratis por etapa, y entre 25 y 35 ítems hacia el minuto 8.

### 12.3 Terminales en el nivel

- **Terminal npm** (`'s14'`): vende 2 tiradas y queda agotada (tinte gris y texto `404`).
- **Terminal sudo** (`'ts'`): una tirada gratis con 80 % raro y 20 % legendario, que suma 15 de deuda. Su texto es `SUDO NPM INSTALL: GRATIS, +DEUDA`.
- Con un jugador a menos de 28 px en horizontal y 40 en vertical aparece el aviso encima: `[B5] NPM INSTALL $23`, en lima si alcanza y en rojo si no.
- Al interactuar con créditos suficientes: se paga, y un icono sobre la terminal cambia de ítem cada 60 ms durante 0.9 s, frenando al final. Se detiene con destello del color de rareza y su fanfarria, el icono vuela al inventario del HUD, y abajo al centro aparece 2.5 s un cartel con el nombre (tamaño 18, color de rareza), la descripción (tamaño 12) y `X3` si ya había.
- El juego no se pausa durante una tirada en el nivel: comprar con enemigos encima es parte de la tensión. Sin créditos, sonido de error.

### 12.4 Pantalla de release (tras el jefe)

Modo `GACHA`, con la física en pausa. Panel centrado de unos 560x360:

1. Título `DEPLOY EXITOSO - RELEASE V1.{etapa}`.
2. Tres casillas con iconos a escala 3 que giran y se detienen una a una, cada 0.6 s. Son las 3 tiradas gratis. Si las dos primeras salen comunes, la tercera es rara como mínimo. Bajo cada casilla, su nombre y descripción.
3. Línea de tienda: `[B1] NPM INSTALL $38     [START] SIGUIENTE SERVIDOR`. Cada compra gira en una cuarta casilla durante 0.5 s. Mantener el botón repite.
4. Abajo, `LEGENDARIO GARANTIZADO EN: N`.

Cualquier jugador puede pulsar. Con START, o tras 20 s sin entrada, fundido y siguiente etapa.

## 13. Ítems

20 ítems pasivos, compartidos por el equipo, que se apilan sin límite salvo ROLLBACK. El `id` define la rareza (0-8 común, 9-15 raro, 16-19 legendario) y el icono (`'s' + (22 + id)`), así que la tabla de datos solo necesita nombre y descripción.

| id | Nombre | Descripción en pantalla | Efecto exacto |
|---|---|---|---|
| 0 | CAFE | +15% CADENCIA | ver 7.5 |
| 1 | ENERGETICA | +10% VELOCIDAD | ver 7.5 |
| 2 | PATITO DE GOMA | +10% CRITICO | ver 7.5 |
| 3 | STACK OVERFLOW | +20% ATAQUE | ver 7.5 |
| 4 | TESTS UNITARIOS | +25 VIDA MAXIMA | además cura 25 al conseguirlo |
| 5 | HOTFIX | CURA 2 AL MATAR | cura `2 * n` por muerte |
| 6 | CONSOLE.LOG | LAS BALAS ATRAVIESAN +1 | ver 7.5 |
| 7 | CTRL+Z | 10% DE ESQUIVAR | ver 7.5 |
| 8 | PIZZA FRIA | REGENERA VIDA | ver 7.5 |
| 9 | FORK BOMB | LOS BUGS EXPLOTAN AL MORIR | al matar: explosión de radio `60 + 15 * n` que hace el 60 % del ataque a los demás enemigos |
| 10 | COPY-PASTE | +1 BALA POR DISPARO | `n` balas extra en abanico de 7 grados, cada una al 60 % |
| 11 | DOCKER | ESCUDO: BLOQUEA 1 GOLPE | recarga en `max(2.5, 8.5 - 1.5 * n)` segundos; uno por jugador |
| 12 | REGEX | 15% DE RAYO EN CADENA | al acertar, probabilidad `min(0.6, 0.15 * n)` de un rayo a los 3 enemigos más cercanos a menos de 160 px, al 70 % |
| 13 | SPRING BOOT | +1 SALTO EN EL AIRE | ver 7.5 |
| 14 | CRON JOB | MISIL AUTOMATICO | cada `8 / (n + 1)` segundos, un misil guiado al enemigo más cercano: 200 % del ataque, velocidad 380, explota en radio 40 |
| 15 | CACHE | HABILIDADES MAS RAPIDAS | ver 7.5 |
| 16 | COPILOTO | UN DRON DISPARA POR TI | `n` drones (`'s17'`) siguen a cada jugador y disparan cada 0.5 s al enemigo más cercano a menos de 380 px, al 60 % |
| 17 | SUDO | +100% ATAQUE | ver 7.5 |
| 18 | ROLLBACK | REVIVE UNA VEZ | se gasta al morir (7.6); máximo 2 guardados |
| 19 | RM -RF | RAYO LETAL CADA 8 DISPAROS | cada `max(4, 9 - n)` disparos, un rayo instantáneo de 18 px de alto en la dirección apuntada, que cruza la pantalla y hace `300 % * n` a todo lo que toca |

Notas de implementación:

- Las explosiones en cadena de FORK BOMB se encolan y se resuelven en el frame siguiente, con un máximo de 3 eslabones.
- Los rayos de REGEX y RM -RF se dibujan en el `Graphics` compartido, que se limpia cada frame.
- El daño que no viene de una bala del jugador (explosiones, rayos, misiles, drones) no dispara REGEX ni cuenta para RM -RF.
- Ganchos necesarios: al disparar, al acertar, al matar, al recibir daño y por frame.

## 14. Pantallas y HUD

### 14.1 Título y demo

Al cargar, el juego genera la etapa 1 y un bot la juega de inmediato (por la regla 9 de la sección 2). Encima, a profundidad 30, un velo oscuro con alfa 0.45 y:

- `PROD IS` en tamaño 78, blanco con sombra azul, centrado en y = 60.
- `DOWN` en tamaño 132, rojo, con dos copias cian y rosada desplazadas unos píxeles que cambian de posición cada 80 a 300 ms (efecto glitch), en y = 150.
- `ROGUELIKE DE GUARDIA - 1 O 2 JUGADORES` en tamaño 12, lima.
- `PULSA START` parpadeando, tamaño 18, en y = 430.
- Zona inferior que rota cada 5 s: los 5 mejores puntajes, los controles, y la premisa (`VIERNES 23:59. ALGUIEN HIZO PUSH A MAIN. ESTAS DE GUARDIA.`).

Bot: mantiene derecha y disparo; salta si lo frena una pared, si la columna de delante es pozo, o al azar cada segundo y pico; a veces apunta arriba. Si muere o pasan 40 s, la demo se reinicia. La demo no guarda récords y no tiene sonido.

Con `START1` o cualquier botón del jugador 1 empieza una partida con ese jugador; con `START2` o un botón del jugador 2, con el otro.

### 14.2 HUD

Todo con `setScrollFactor(0)`, profundidad 20.

| Elemento | Posición | Detalle |
|---|---|---|
| Jugador 1 | arriba a la izquierda, (12, 10) | `P1` en lima, barra de vida de 120x10 (verde; roja y pulsando bajo el 30 %), dos cuadros de enfriamiento (dash y especial) y uno cian si hay DOCKER |
| Jugador 2 | arriba a la derecha, espejado | igual en rosado; si no ha entrado, `P2: PULSA START` parpadeando |
| Deuda | arriba al centro | `DEUDA TECNICA LV 7` (tamaño 12, y = 8), barra de 200x8 (y = 24), nombre del nivel (y = 36), con el color pasando de lima a dorado y a rojo |
| Créditos | (12, 44) | moneda y `$123`, tamaño 18, dorado |
| Puntaje y etapa | (12, 68) | `PTS 12340` y `SERVIDOR 3: LEGACY`, tamaño 12, acero |
| Guía | borde derecho | si la terminal de DEPLOY no se ve, un `>` de tamaño 24 que late a la altura de la terminal |
| Jefe | (200, 60) | nombre y barra de 400x10, solo durante el combate |
| Inventario | abajo a la izquierda, y = 574 | iconos de 16 px cada 34 px, con `X2` encima si hay más de uno |
| Carteles | centro | entrada de etapa (tamaño 24) y cartel de ítem (y = 520) |

Números de daño: tamaño 12, suben 30 px en 0.5 s y se desvanecen. Los críticos, tamaño 18, dorados y con `!`.

### 14.3 Pausa

START durante `PLAY`. Velo oscuro, `PAUSA`, los controles, y el inventario en dos columnas con nombre, cantidad y descripción. START continúa. Mantener START 2 s vuelve al título.

### 14.4 Fin de partida

`PROD SIGUE CAIDO` en rojo, tamaño 36. Debajo: servidor alcanzado, bugs eliminados, nivel de deuda, cantidad de ítems y puntaje.

- Si el puntaje entra entre los 5 mejores: 3 iniciales (arriba y abajo cambian la letra, izquierda y derecha la posición, B1 confirma). Con dos jugadores, una sola entrada con la etiqueta `EQUIPO`.
- Después, la tabla con la fila nueva resaltada y `START: OTRA VEZ`. A los 20 s sin entrada vuelve al título.

Puntaje: `valor * 10 * etapa` por enemigo y `500 * etapa` por deploy.

## 15. Audio

Todo con Web Audio sobre `this.sound.context`. Si no hay contexto, el juego sigue sin sonido. Una ganancia maestra de 0.5 y otra para la música.

### 15.1 Ayudantes

- `tone(frec, dur, tipo, vol, frecFinal, retraso)`: oscilador con ataque de 2 ms, caída exponencial y, si hay `frecFinal`, barrido exponencial de frecuencia.
- `noise(dur, vol, frecFiltro)`: un buffer de medio segundo de ruido blanco, generado una vez, pasado por un filtro con envolvente.
- Cada efecto tiene un intervalo mínimo de 45 ms entre repeticiones.

### 15.2 Efectos

| Efecto | Receta |
|---|---|
| disparo | cuadrada 900 a 300 Hz, 0.06 s, vol 0.05 |
| impacto | ruido 0.04 s |
| crítico | cuadrada 1400 a 700 Hz, 0.08 s |
| muerte de enemigo | sierra 400 a 80 Hz, 0.14 s, más ruido 0.08 s |
| moneda | cuadrada 1320 Hz 0.05 s y 1760 Hz 0.08 s; el tono sube con monedas seguidas |
| salto | triangular 300 a 620 Hz, 0.1 s |
| dash | ruido 0.12 s |
| especial | sierra 200 a 900 Hz, 0.25 s, más ruido |
| daño recibido | sierra 300 a 90 Hz, 0.2 s |
| explosión | ruido grave 0.3 s más seno 120 a 40 Hz |
| tic de ruleta | cuadrada 1000 Hz, 0.02 s |
| ítem común | Do5, Mi5 |
| ítem raro | Do5, Mi5, Sol5, Do6 |
| ítem legendario | Do5, Mi5, Sol5, Do6, Mi6, Sol6, Do7 a 0.07 s por nota, con ruido agudo de brillo |
| error | cuadrada 160 Hz, 0.12 s, dos veces |
| entrada del jefe | sierra 80 a 50 Hz, 0.8 s, más ruido |
| láser | sierra 1800 a 200 Hz, 0.5 s |
| deploy exitoso | Sol4, Do5, Mi5, Sol5 y un Do6 largo |
| fin de partida | Mi4, Re4, Do4, La3 lentas, triangular |

### 15.3 Música

Secuenciador por pasos de semicorchea, programado con antelación: en `update`, mientras `siguiente < ctx.currentTime + 0.12`, programa el paso y avanza `60 / bpm / 4`. Frecuencia de una nota MIDI: `440 * 2 ** ((m - 69) / 12)`. El compás son 16 pasos, el bucle son 4 compases y cada compás usa un acorde.

| | Exploración (132 bpm) | Jefe (160 bpm) |
|---|---|---|
| Acordes: raíz MIDI y tercera | 45/3, 41/4, 48/4, 43/4 (La menor, Fa, Do, Sol) | 45/3, 45/3, 41/4, 40/4 (La menor, La menor, Fa, Mi) |
| Bajo, triangular, vol 0.09 | `0.0.c.0.0.0.c.7.` | `0.0c0.0c0.0c0.07` |
| Arpegio, cuadrada, vol 0.035 | `0123212301232123` | igual |

- Bajo: cada carácter es un semitono en base 36 sobre la raíz del acorde; el punto es silencio.
- Arpegio: cada dígito es una nota del acorde (0 raíz, 1 tercera, 2 quinta, 3 octava), sonando 24 semitonos sobre la raíz.
- Percusión: bombo (seno 120 a 40 Hz) en los pasos 0 y 8, caja (ruido) en 4 y 12, platillo (ruido corto y agudo) en los pasos impares.

Melodía (cuadrada, vol 0.04). Cada carácter es un semitono en base 36 sobre La3 (MIDI 57) y el punto es silencio. Suena una vuelta sí y una no.

```
exploracion:  j..j.hf.c.......   f..f.c..8...c...   j..j.mj.f.......   h..h.e..a...e.h.
jefe:         c.f.j.o.j.f.c.f.   c.f.j.o.m.j.f.j.   8.c.f.k.f.c.8.c.   7.b.e.j.e.b.7.b.
```

Todas las notas son del acorde de su compás o notas de paso, así que no hay disonancias. No pude oír el resultado: escúchalo y ajusta volúmenes y tempo.

Exploración suena en `PLAY`; jefe, durante el combate; en la pantalla de release, exploración a mitad de volumen; al terminar la partida, silencio y su efecto.

## 16. Persistencia

- Clave `prod-is-down-v1`. Valor `{ top: [[nombre, puntaje, etapa], ...] }`, con 5 entradas como máximo.
- Valida al leer: que `top` sea un array y cada fila tenga un string y dos números. Si algo falla, tabla vacía.
- Orden de preferencia: `window.platanusArcadeStorage`, después `localStorage`, después memoria. Todo en `try/catch` y sin bloquear: si la carga tarda, el título muestra la tabla cuando llegue.
- Se guarda una vez, al confirmar las iniciales.

```js
const store = () => window.platanusArcadeStorage || {
  async get(k) { try { const r = localStorage.getItem(k); return r === null ? { found: false } : { found: true, value: JSON.parse(r) }; } catch { return { found: false }; } },
  async set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
```

## 17. Detalles de sensación

Por orden de impacto. Implementa los primeros desde el hito 1.

1. Parpadeo blanco al recibir daño (`setTintFill` 60 ms).
2. Partículas al morir: 6 a 10 `'px'` del color del enemigo.
3. Números de daño.
4. Sacudida de cámara al recibir daño, en explosiones y con el jefe.
5. Las monedas vuelan al jugador y su sonido sube de tono.
6. Destello de un frame en el cañón al disparar.
7. Estela del dash.
8. Aviso de aparición de enemigos en pantalla: rectángulos de glitch durante 0.5 s.
9. Scanlines.
10. Cámara lenta al morir el jefe.
11. Barra de vida que late con poca vida.

## 18. Presupuesto de bytes y recortes

Tamaño minificado, dentro de la IIFE:

| Sistema | KB |
|---|---|
| Base: configuración, entrada, almacenamiento, modos, ayudantes | 2.8 |
| Kit de assets (medido) | 3.3 |
| Nivel: generación, tilemap, fondo | 3.0 |
| Jugador | 4.5 |
| Balas, daño, efectos, números | 2.8 |
| Enemigos, élites y director | 5.5 |
| Jefes | 4.5 |
| Ítems | 4.5 |
| Gacha | 3.5 |
| HUD | 2.8 |
| Pantallas: título, demo, pausa, fin, iniciales, tabla | 4.0 |
| Audio | 3.0 |
| Co-op: entrada, revivir, límites | 1.3 |
| **Total** | **45.5** |

Objetivo final: 49 KB o menos, para dejar 1 KB de margen.

Si no cabe, recorta en este orden:

1. Ayuda de puntería.
2. Prefijo SUDO de los élites; después, los élites completos.
3. Terminal sudo.
4. Música del jefe propia (usar la de exploración más rápida).
5. Descripciones de ítems en la pausa.
6. Rotación de paneles del título (dejar solo la tabla).
7. Ítems RM -RF, CRON JOB y REGEX, que son los de más código.
8. RACE CONDITION.
9. El ataque C de cada jefe.
10. El bot de la demo (dejar el nivel con enemigos moviéndose detrás del título).

No se recortan: co-op, gacha (terminales y pantalla de release), medidor de deuda, los 2 jefes, tabla de récords.

## 19. Hitos

Tope = tamaño minificado acumulado al cerrar el hito. Cada hito termina con `npm run check-restrictions` en verde.

| Hito | Contenido | Se acepta cuando | Tope |
|---|---|---|---|
| 0. Esqueleto | IIFE, configuración, entrada, almacenamiento, kit pegado, modos, título estático | Se ve el título con la fuente del kit; START cambia de modo; los 5 checks pasan | 6.5 KB |
| 1. Moverse y disparar | Generación de nivel, tilemap, fondo, jugador completo (salto, dash, especial), cámara, balas, BUG, daño, partículas, números, monedas | Se recorre el nivel de punta a punta, las plataformas funcionan en ambos sentidos, se mata un BUG y se recogen sus monedas, caer a un pozo no rompe nada | 14 KB |
| 2. Mundo hostil | Los 6 enemigos, élites, director, deuda con multiplicadores, HUD completo | La deuda sube al matar y cambia de nombre; aparecen tipos nuevos según el nivel; con el tope de enemigos el juego sigue fluido | 22 KB |
| 3. Gacha en el nivel | Los 20 ítems con `recalc()` y ganchos, terminales npm y sudo, pity, inventario en el HUD, cartel de ítem | Con el truco de créditos se consiguen los 20 ítems y cada uno hace lo que dice; las terminales se agotan | 30 KB |
| 4. Jefes y etapas | Terminal de DEPLOY, arena, los 2 jefes, pantalla de release, cambio de etapa, biomas | Se completan 4 etapas seguidas alternando jefes; nada de la etapa anterior queda vivo | 38.5 KB |
| 5. Co-op | Entrada del jugador 2, límites de cámara, revivir, escalado para dos | Dos jugadores terminan una etapa; uno cae, es revivido, y la partida solo acaba con los dos caídos | 40 KB |
| 6. Audio | Efectos y música | Todo suena, no se satura con 30 enemigos, la música cambia con el jefe | 43 KB |
| 7. Pantallas | Título con demo, pausa, fin de partida, iniciales, tabla guardada, inactividad, detalles de sensación | La demo arranca sola antes de 1.5 s; un récord sobrevive a recargar; sin entrada el juego vuelve al título | 48 KB |
| 8. Cierre | Balance, `DEV = 0`, `metadata.json`, revisión final | Lista de la sección 20.4 completa | 49 KB |

Prepara el co-op desde el hito 1: todo el código de jugador recorre un array de jugadores aunque solo haya uno.

## 20. Pruebas

### 20.1 Verificador

`npm run check-restrictions` debe dar los 5 checks en verde, incluido "Code Safety".

### 20.2 Ver el juego sin `npm run dev`

```
node kit/serve.mjs            # sirve el repo en localhost:3111
localhost:3111/kit/harness.html         carga game.js igual que el dashboard
localhost:3111/kit/harness.html?demo    carga el ejemplo del kit
```

El arnés deja los errores en `window.__errors`. Si tienes un navegador automatizado, abre el arnés, revisa `window.__errors` y la consola, pulsa teclas y saca capturas. Si no, pide al usuario que corra `npm run dev` y te cuente qué ve.

### 20.3 Trucos de desarrollo

Con `const DEV = 1`, y un listener de teclado aparte que no toca `CABINET_KEYS`:

| Tecla | Efecto |
|---|---|
| 5 | +100 créditos |
| 6 | +20 de deuda |
| 7 | teletransporte a la arena |
| 8 | un ítem al azar |
| 9 | matar a todos los enemigos y quitar el 25 % al jefe |
| 0 | 30 de daño al jugador 1 |

No uses las teclas 1, 2 y 3: el dashboard las reenvía y 2 es `START2`. Con `DEV = 1` también puedes publicar el estado en `window.__t` para comprobarlo desde el navegador automatizado. Antes de entregar, `DEV = 0`: el minificador elimina todo ese código.

### 20.4 Lista de cierre

- [ ] `DEV = 0` y los 5 checks en verde, con 49 KB o menos.
- [ ] Sin errores en consola durante una partida de 4 etapas.
- [ ] La demo muestra acción en los primeros 10 segundos tras cargar.
- [ ] Partida de un jugador solo con el jugador 1, y solo con el jugador 2.
- [ ] Partida de dos jugadores con entrada tardía y un revivir.
- [ ] Los 20 ítems aparecen y funcionan; el pity da un legendario a la décima tirada como máximo.
- [ ] Los dos jefes mueren y la etapa siguiente carga limpia.
- [ ] La pausa funciona y mantener START vuelve al título.
- [ ] El récord se guarda, y el juego no falla si el almacenamiento lanza excepciones.
- [ ] 60 s sin entrada devuelven al título.
- [ ] Con el tope de enemigos y balas no hay tirones.
- [ ] Ningún texto en pantalla usa minúsculas, tildes o Ñ.
- [ ] `metadata.json` actualizado.

### 20.5 `metadata.json`

```json
{
  "game_name": "PROD IS DOWN",
  "description": "Roguelike co-op: producción se cayó en plena hackathon. Aplasta bugs, tira el gacha de npm install y haz deploy antes de que la deuda técnica te entierre.",
  "player_mode": "two_player"
}
```

## 21. Decisiones abiertas para el usuario

1. **`player_mode`.** El juego se juega con 1 o 2 personas y el kit solo acepta `single_player` o `two_player`. El plan propone `two_player` para anunciar el co-op. No pude ver en el kit cómo usa ese campo la galería o el gabinete; si exige dos jugadores, hay que cambiarlo a `single_player`.
2. **Balance.** Los números no están probados en juego. El hito 8 existe para eso y conviene que el usuario juegue un par de partidas antes de enviar.

## 22. Segunda pasada: estado real del juego (14 de noviembre)

El juego está construido y supera este plan en varios puntos. Esta sección manda sobre las anteriores donde se contradigan. Tamaño de entrega: 48,5 KB, unos 1,5 KB libres.

### 22.1 Música adaptativa

Reemplaza la sección 15.3.

- **Canciones.** Una por bioma (FRONTEND, BACKEND, LEGACY), dos de jefe y una para la pantalla de release, en la tabla `SONGS`. Cada una define tempo, transposición, modo (menor o frigio), estilo de bajo y batería, una progresión de 8 compases en grados de la escala y una melodía de 64 corcheas.
- **Capas por intensidad (0 a 4).** 0 son colchón y arpegio; 1 suma bajo y bombo; 2 suma batería completa y melodía en ciclos alternos; 3 deja la melodía siempre y abre el filtro; 4 es FLOW o la fase 2 del jefe. La intensidad sube al instante y baja de a un nivel por compás. Depende de los enemigos cerca de la cámara y del combo.
- **Mezcla.** Bus con bombeo del bombo (estilo sidechain), eco para arpegio y melodía, y compresor final. La melodía usa una onda de pulso al 25 %.
- **Reacciones.** Con poca vida el filtro maestro se cierra y suena un latido. En pausa y fin de partida la música se oye apagada. El tempo sube con la deuda técnica.
- **Afinación.** Los efectos de moneda, ítems y fanfarrias usan `kn(i)`, la nota `i` del acorde que suena en ese momento, así que siempre están en tono.

### 22.2 Sistemas nuevos

- **FLOW.** Un combo de 10 activa el modo: +40 % de cadencia, créditos dobles, fondo arcoíris, estelas y música al máximo. Un golpe recibido lo corta.
- **Incidentes.** Desde la etapa 2 se aplica uno al azar por etapa: DDOS (doble de enemigos y de créditos), DARK MODE (todo oscuro salvo alrededor de los jugadores) o EN LA NUBE (gravedad baja).
- **Paquete malicioso.** Desde la etapa 2, cada terminal npm tiene un 20 % de ser un enemigo élite disfrazado. Su brillo parpadea.
- **Tercer jefe, CODE REVIEW.** Es el ojo a escala 4 y alterna anillos de balas con una espiral. Los jefes rotan cada 3 etapas: MERGE CONFLICT, KERNEL PANIC, CODE REVIEW.
- **Presentación de jefe.** El mundo se congela 1,6 s con zoom, cambio de tono de color, rayos, la tarjeta `[ NOMBRE ]` con `STAND: [...]` y glifos de amenaza. En fase 2 hay un congelado en negativo.
- **Daño de jefes por etapa.** El daño se multiplica por `0,5 + 0,2 * etapa`: el primer jefe pega un 30 % menos.
- **TO BE CONTINUED.** Al caer el último jugador, la escena se congela en sepia y aparece el cartel. Si el puntaje entra en la tabla, vuelve el color con confeti.
- **Co-op.** PAIR PROGRAMMING da +25 % de daño con los jugadores a menos de 170 px, con un enlace visible entre ellos. GIT PULL trae al rezagado si se separan más de 700 px.
- **Rango final.** Va de TRAINEE a CTO según el servidor alcanzado.
- **Visuales.** Bloom y viñeta de cámara, con apagado automático si la máquina baja de unos 36 fps. Partículas ambientales, cielo por bioma y golpes de zoom en los momentos grandes.
- **Sensación.** Cada impacto frena al enemigo un instante. La vida se regenera 2 por segundo tras 3 s sin recibir golpes. Pasar de etapa cura un 30 %. El jugador empieza con $18 y hay una terminal junto al inicio de la etapa 1.

### 22.3 Trampa de Phaser descubierta

En Phaser 3.87 el `processCallback` de `overlap` y `collider` solo descarta el contacto si devuelve exactamente `false`. Un `0` o un `undefined` dejan pasar el contacto. Por eso el filtro de balas es `b.own > 0 && ...` y no `b.own && ...`. Con la versión anterior, las balas enemigas dañaban a los enemigos y los jefes se herían con sus propios disparos. Todo filtro nuevo debe devolver un booleano.

### 22.4 Herramientas de desarrollo

Todas requieren `const DEV = 1` en `game.js`. Antes de entregar va `DEV = 0`.

| Herramienta | Uso |
|---|---|
| `node kit/size.mjs` | Mide el tamaño de entrega (con `DEV = 0`) aunque el archivo tenga `DEV = 1`. |
| `kit/musiclab.js` | Se inyecta en el arnés y renderiza una canción sin tiempo real con `window.musicLab(cancion, intensidad, segundos)`. Devuelve niveles, balance por bandas y notas de la melodía fuera del acorde. Con un cuarto argumento verdadero dibuja un espectrograma. |
| `kit/bot.js` | Función de Playwright que juega una partida y registra vida, deuda, créditos e ítems cada 10 s. Es un jugador torpe: sirve para detectar errores y medir ritmo, no para afinar la dificultad fina. |
| Teclas extra | Además de las de la sección 20.3: `4` fuerza un legendario en la próxima tirada y `n` salta a la etapa siguiente. `window.__inc = 1, 2 o 3` fuerza un incidente en la próxima etapa. |

### 22.5 Pendiente

- Probar con personas el primer jefe: el bot no lo vence, pero no esquiva.
- Escuchar la música en el gabinete y ajustar volúmenes: está medida por análisis, no oída.
