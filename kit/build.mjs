// Kit de assets de PROD IS DOWN.
// Lee kit/sprites.txt y kit/font.txt y genera:
//   kit/assets.js    -> bloque listo para pegar dentro de game.js
//   kit/preview.png  -> hoja de sprites para revisar el arte a ojo
//   cover.png        -> portada 800x600 (solo con --cover)
// Uso:  node kit/build.mjs [--cover]
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const DIR = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(resolve(DIR, f), 'utf-8').replace(/\r/g, '');

// ------------------------------------------------------------------ parseo
const pal = {};
const sprites = [];
let cur = null;
for (const line of read('sprites.txt').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  if (line.startsWith('!pal')) {
    const [, idx, hex] = line.split(/\s+/);
    pal[idx] = hex;
  } else if (line.startsWith('@')) {
    const [name, w, h, sym, scale, p] = line.slice(1).split(/\s+/);
    cur = { name, w: +w, h: +h, sym: +sym, scale: +scale, pal: p, rows: [] };
    sprites.push(cur);
  } else {
    cur.rows.push(line);
  }
}
const palKeys = Object.keys(pal);
palKeys.forEach((k, i) => {
  if (parseInt(k, 36) !== i) throw new Error(`paleta fuera de orden en ${k}`);
});
const PAL = palKeys.map((k) => pal[k]).join('');

function encode(s) {
  const hw = s.sym ? s.w / 2 : s.w;
  if (s.rows.length !== s.h) throw new Error(`${s.name}: ${s.rows.length} filas, esperaba ${s.h}`);
  const px = [];
  s.rows.forEach((r, y) => {
    if (r.length !== hw) throw new Error(`${s.name} fila ${y}: ancho ${r.length}, esperaba ${hw}`);
    for (const c of r) {
      if (!'.123'.includes(c)) throw new Error(`${s.name} fila ${y}: caracter invalido ${c}`);
      px.push(c === '.' ? 0 : +c);
    }
  });
  let out = '';
  for (let i = 0; i < px.length; i += 3) {
    out += String.fromCharCode(48 + ((px[i] || 0) | ((px[i + 1] || 0) << 2) | ((px[i + 2] || 0) << 4)));
  }
  return s.w.toString(36) + s.h.toString(36) + s.sym + s.scale + s.pal + out;
}
const ATLAS = sprites.map(encode).join('');

const fontLines = read('font.txt').split('\n');
let fi = fontLines.indexOf('SP');
let FONT_CHARS = '';
let FONT_DATA = '';
while (fi < fontLines.length && fontLines[fi] !== '') {
  const ch = fontLines[fi] === 'SP' ? ' ' : fontLines[fi];
  let v = 0;
  for (let y = 0; y < 5; y++) {
    const row = fontLines[fi + 1 + y];
    if (!row || row.length !== 5) throw new Error(`glifo ${ch}: fila ${y} invalida`);
    for (let x = 0; x < 5; x++) if (row[x] === '#') v += 2 ** (y * 5 + x);
  }
  FONT_CHARS += ch;
  FONT_DATA += v.toString(36).padStart(5, '0');
  fi += 6;
}

// ------------------------------------------------------------------ runtime (se emite tal cual a assets.js)
// Los indices de sprite, las claves de textura y los tamanos estan documentados en PLAN.md, seccion 5.
const SPR = [];

function parseAtlas(ATLAS, SPR) {
  for (let p = 0; p < ATLAS.length;) {
    const w = parseInt(ATLAS[p], 36), h = parseInt(ATLAS[p + 1], 36), m = +ATLAS[p + 2];
    const n = Math.ceil((m ? w / 2 : w) * h / 3);
    SPR.push([w, h, m, +ATLAS[p + 3], ATLAS.substr(p + 4, 3), ATLAS.substr(p + 7, n)]);
    p += 7 + n;
  }
}

// Dibuja el sprite e = SPR[i] en un contexto 2D, en (ox, oy). pal (3 chars) y s (escala) son opcionales.
function drawSprite(ctx, e, ox, oy, pal, s) {
  const w = e[0], hw = e[2] ? w / 2 : w, n = hw * e[1];
  pal = pal || e[4];
  s = s || e[3];
  for (let i = 0; i < n; i++) {
    const v = (e[5].charCodeAt(i / 3 | 0) - 48 >> i % 3 * 2) & 3;
    if (v) {
      const x = i % hw, y = i / hw | 0;
      ctx.fillStyle = '#' + PAL.substr(parseInt(pal[v - 1], 36) * 6, 6);
      ctx.fillRect(ox + x * s, oy + y * s, s, s);
      if (e[2]) ctx.fillRect(ox + (w - 1 - x) * s, oy + y * s, s, s);
    }
  }
}

// Dibuja texto con la fuente 5x5 en un contexto 2D (celda de 6 px por escala). Solo lo usa la portada y el preview.
function drawText(ctx, str, ox, oy, s, color) {
  ctx.fillStyle = color;
  for (let c = 0; c < str.length; c++) {
    const g = FONT_CHARS.indexOf(str[c]);
    if (g < 0) continue;
    const v = parseInt(FONT_DATA.substr(g * 5, 5), 36);
    for (let b = 0; b < 25; b++) {
      if (v / 2 ** b & 1) ctx.fillRect(ox + (c * 6 + b % 5) * s, oy + (b / 5 | 0) * s, s, s);
    }
  }
}

const RUNTIME = `
// Crea la textura \`key\` a partir del sprite i. pal (3 chars de paleta) y s (escala) son opcionales.
function makeTexture(scene, key, i, pal, s) {
  const e = SPR[i];
  s = s || e[3];
  const t = scene.textures.createCanvas(key, e[0] * s, e[1] * s);
  drawSprite(t.getContext(), e, 0, 0, pal, s);
  t.refresh();
}

// Llamar una sola vez al inicio de create(). Deja listas todas las texturas y la fuente bitmap 'f'.
function buildAssets(scene) {
  let i, t, c;
  parseAtlas(ATLAS, SPR);
  for (i = 0; i < SPR.length; i++) makeTexture(scene, 's' + i, i);
  // Jugador 2: mismos 4 cuadros con buzo rosado -> 'q0'..'q3'
  for (i = 0; i < 4; i++) makeTexture(scene, 'q' + i, i, 'e8g');
  // Terminal sudo (maldita): misma forma, paleta roja -> 'ts'
  makeTexture(scene, 'ts', 14, 'bac');
  // Tileset 'tl': 9 tiles de 32 px en una fila. indice = bioma * 3 + tipo (0 suelo-borde, 1 relleno, 2 plataforma)
  t = scene.textures.createCanvas('tl', 288, 32);
  c = t.getContext();
  for (i = 0; i < 9; i++) drawSprite(c, SPR[19 + i % 3], i * 32, 0, i % 3 == 1 ? 0 : ['12d', '126', '12c'][i / 3 | 0]);
  t.refresh();
  // Pixel blanco 'px' (2x2): balas, particulas y barras con setTint + setScale
  t = scene.textures.createCanvas('px', 2, 2);
  c = t.getContext();
  c.fillStyle = '#fff';
  c.fillRect(0, 0, 2, 2);
  t.refresh();
  // Fuente bitmap 'f': glifos 5x5 blancos en celdas de 6x6. Uso: scene.add.bitmapText(x, y, 'f', 'TEXTO', 12)
  // El tamano es el ancho de celda en pantalla: 6 = x1, 12 = x2, 18 = x3, 24 = x4. Solo mayusculas.
  i = FONT_CHARS.length;
  t = scene.textures.createCanvas('f', i * 6, 6);
  c = t.getContext();
  c.fillStyle = '#fff';
  for (let g = 0; g < i; g++) {
    const v = parseInt(FONT_DATA.substr(g * 5, 5), 36);
    for (let b = 0; b < 25; b++) if (v / 2 ** b & 1) c.fillRect(g * 6 + b % 5, b / 5 | 0, 1, 1);
  }
  t.refresh();
  scene.cache.bitmapFont.add('f', Phaser.GameObjects.RetroFont.Parse(scene, {
    image: 'f', width: 6, height: 6, chars: FONT_CHARS, charsPerRow: i,
  }));
}
`;

const out = `// ---- KIT DE ASSETS (generado por kit/build.mjs a partir de kit/sprites.txt y kit/font.txt) ----
// No editar a mano: cambia el .txt y vuelve a correr \`node kit/build.mjs\`.
// Pegar este bloque completo dentro de la IIFE de game.js. Ver PLAN.md, seccion 5.
const PAL = ${JSON.stringify(PAL)};
const ATLAS = ${JSON.stringify(ATLAS)};
const FONT_CHARS = ${JSON.stringify(FONT_CHARS)};
const FONT_DATA = ${JSON.stringify(FONT_DATA)};
const SPR = [];

${parseAtlas.toString()}

${drawSprite.toString()}
${RUNTIME}`;
writeFileSync(resolve(DIR, 'assets.js'), out);

// ------------------------------------------------------------------ lienzo minimo para Node
class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = Buffer.alloc(w * h * 4);
    this.fillStyle = '#000';
    this.alpha = 1;
  }
  fillRect(x, y, w, h) {
    const c = this.fillStyle;
    const r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16);
    const a = this.alpha;
    for (let j = Math.max(0, y | 0); j < Math.min(this.h, (y + h) | 0); j++) {
      for (let i = Math.max(0, x | 0); i < Math.min(this.w, (x + w) | 0); i++) {
        const o = (j * this.w + i) * 4;
        this.d[o] = this.d[o] * (1 - a) + r * a;
        this.d[o + 1] = this.d[o + 1] * (1 - a) + g * a;
        this.d[o + 2] = this.d[o + 2] * (1 - a) + b * a;
        this.d[o + 3] = 255;
      }
    }
  }
  png() {
    const raw = Buffer.alloc((this.w * 4 + 1) * this.h);
    for (let y = 0; y < this.h; y++) {
      this.d.copy(raw, y * (this.w * 4 + 1) + 1, y * this.w * 4, (y + 1) * this.w * 4);
    }
    const chunk = (type, data) => {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length);
      const td = Buffer.concat([Buffer.from(type), data]);
      const crc = Buffer.alloc(4);
      crc.writeUInt32BE(zlib.crc32(td) >>> 0);
      return Buffer.concat([len, td, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }
}

parseAtlas(ATLAS, SPR);

// ------------------------------------------------------------------ preview.png
{
  const Z = 2; // zoom extra sobre la escala de juego
  const cv = new Canvas(1180, 760);
  cv.fillStyle = '#0b0f14';
  cv.fillRect(0, 0, cv.w, cv.h);
  let x = 16, y = 16, rowH = 0;
  SPR.forEach((e, i) => {
    const s = e[3] * Z, w = e[0] * s, h = e[1] * s;
    if (x + w > cv.w - 16) {
      x = 16;
      y += rowH + 26;
      rowH = 0;
    }
    drawSprite(cv, e, x, y, 0, s);
    drawText(cv, String(i), x, y + h + 4, 2, '#6b7c99');
    x += Math.max(w, 30) + 18;
    rowH = Math.max(rowH, h);
  });
  y += rowH + 40;
  // variantes
  for (let i = 0; i < 4; i++) drawSprite(cv, SPR[i], 16 + i * 66, y, 'e8g', 4);
  drawSprite(cv, SPR[14], 300, y, 'bac', 4);
  for (let i = 0; i < 9; i++) drawSprite(cv, SPR[19 + i % 3], 400 + i * 70, y, i % 3 == 1 ? 0 : ['12d', '126', '12c'][i / 3 | 0], 4);
  y += 80;
  drawText(cv, FONT_CHARS.slice(0, 37), 16, y, 3, '#e8f0ff');
  drawText(cv, FONT_CHARS.slice(37), 16, y + 26, 3, '#e8f0ff');
  drawText(cv, 'PROD IS DOWN - DEUDA TECNICA LV 7 - $125', 16, y + 60, 2, '#e1ff00');
  drawText(cv, '> NPM INSTALL ... +1 SPRING BOOT (RARO)', 16, y + 78, 2, '#7bd02b');
  writeFileSync(resolve(DIR, 'preview.png'), cv.png());
}

// ------------------------------------------------------------------ cover.png (800x600)
if (process.argv.includes('--cover')) {
  const cv = new Canvas(800, 600);
  const rect = (c, x, y, w, h, a = 1) => {
    cv.fillStyle = c;
    cv.alpha = a;
    cv.fillRect(x, y, w, h);
    cv.alpha = 1;
  };
  const text = (s, x, y, sc, c, a = 1) => {
    cv.alpha = a;
    drawText(cv, s, x, y, sc, c);
    cv.alpha = 1;
  };
  const centered = (s, y, sc) => (800 - (s.length * 6 - 1) * sc) / 2 | 0;
  rect('#0b0f14', 0, 0, 800, 600);
  // racks de fondo
  for (let i = 0; i < 9; i++) {
    const x = 10 + i * 90, h = 150 + (i * 53) % 120;
    rect('#111823', x, 536 - h, 64, h);
    for (let j = 0; j < h / 18 - 1; j++) {
      rect('#1b2430', x + 6, 536 - h + 8 + j * 18, 52, 10);
      rect((i + j) % 4 ? '#33415a' : (i + j) % 3 ? '#7bd02b' : '#ff5a4f', x + 10, 536 - h + 11 + j * 18, 4, 4);
    }
  }
  // suelo y plataforma
  for (let i = 0; i < 13; i++) drawSprite(cv, SPR[19], i * 64, 536, '12d', 4);
  for (let i = 0; i < 3; i++) drawSprite(cv, SPR[21], 16 + i * 64, 404, '12d', 4);
  // titulo con glitch
  const t1 = 'PROD IS', t2 = 'DOWN';
  const x1 = centered(t1, 0, 13), x2 = centered(t2, 0, 22);
  text(t1, x1 + 5, 36 + 5, 13, '#2456c9', 0.9);
  text(t1, x1, 36, 13, '#e8f0ff');
  text(t2, x2 - 7, 118, 22, '#3ec5ff', 0.85);
  text(t2, x2 + 7, 118 + 4, 22, '#ff6ec7', 0.85);
  text(t2, x2, 118, 22, '#ff5a4f');
  const sub = 'ROGUELIKE DE GUARDIA - 1 O 2 JUGADORES';
  text(sub, centered(sub, 0, 2), 246, 2, '#e1ff00');
  // jefes
  drawSprite(cv, SPR[13], 600, 280, 0, 8);
  drawSprite(cv, SPR[12], 420, 536 - 108, 0, 6);
  // enemigos
  drawSprite(cv, SPR[6], 318, 318, 0, 4);
  drawSprite(cv, SPR[8], 500, 318, 0, 4);
  drawSprite(cv, SPR[4], 300, 536 - 40, 0, 4);
  drawSprite(cv, SPR[9], 366, 536 - 40, 0, 4);
  drawSprite(cv, SPR[11], 590, 536 - 40, 0, 4);
  drawSprite(cv, SPR[10], 690, 536 - 60, 0, 6);
  // terminal de gacha sobre la plataforma
  drawSprite(cv, SPR[14], 40, 404 - 84, 0, 6);
  text('NPM INSTALL', 122, 340, 2, '#7bd02b');
  text('$25', 122, 358, 3, '#ffb62e');
  drawSprite(cv, SPR[40], 124, 384 - 4, 0, 2);
  drawSprite(cv, SPR[39], 146, 384 - 4, 0, 2);
  drawSprite(cv, SPR[24], 168, 384 - 4, 0, 2);
  // jugadores disparando
  drawSprite(cv, SPR[1], 34, 536 - 84, 'e8g', 6);
  drawSprite(cv, SPR[0], 128, 536 - 84, 0, 6);
  for (let i = 0; i < 3; i++) rect('#e1ff00', 214 + i * 34, 536 - 42, 20, 6);
  rect('#ff6ec7', 250, 536 - 66, 20, 6);
  // monedas
  [[258, 450], [286, 430], [398, 440], [560, 452]].forEach(([x, y]) => drawSprite(cv, SPR[16], x, y, 0, 3));
  // scanlines
  for (let y = 0; y < 600; y += 4) rect('#000000', 0, y, 800, 1, 0.22);
  writeFileSync(resolve(DIR, '..', 'cover.png'), cv.png());
  console.log('cover.png escrito');
}

console.log(`sprites: ${SPR.length}  atlas: ${ATLAS.length} chars  fuente: ${FONT_CHARS.length} glifos / ${FONT_DATA.length} chars  paleta: ${PAL.length} chars`);
console.log(`assets.js: ${Buffer.byteLength(out)} bytes sin minificar`);

export { Canvas, SPR, PAL, drawSprite, drawText, FONT_CHARS, DIR };
