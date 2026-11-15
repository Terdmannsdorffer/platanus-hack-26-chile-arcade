// PROD IS DOWN - Platanus Hack 26 Arcade Challenge
// Roguelike co-op de plataformas: produccion se cayo en plena hackathon.
// Diseno completo en PLAN.md. Pixel art generado por kit/build.mjs.
(() => {
const DEV = 0;

// alias cortos (el minificador no acorta nombres de propiedad): cada llamada ahorra bytes.
// Van primero para que existan antes de cualquier uso. fe = forEach, no enumerable para no salir en for...in
Object.defineProperty(Array.prototype, 'fe', { value: [].forEach });
'Ti:setTint,Te:setText,Vi:setVisible,Al:setAlpha,Sc:setScale,Tx:setTexture,Bm:setBlendMode,Po:setPosition,Tf:setTintFill,Fx:setFlipX,Dp:setDepth,Db:disableBody,Or:setOrigin,Sf:setScrollFactor,Vx:setVelocityX,Vy:setVelocityY,Vl:setVelocity,Sz:setSize,Of:setOffset,Ag:setAllowGravity,Mv:setMaxVelocity,Cw:setCollideWorldBounds,Ct:clearTint'.split(',').fe((p) => {
  const [a, k] = p.split(':');
  // en GameObject y en el cuerpo de fisica: el alias llama al metodo que tenga quien lo recibe
  [Phaser.GameObjects.GameObject, Phaser.Physics.Arcade.Body].fe((c) => c.prototype[a] = function (...v) {
    return this[k](...v);
  });
});

// ---------------------------------------------------------------- constantes y datos
const W = 800, H = 600, T = 32, MW = 100, MH = 22, WH = MH * T;
const M = Math, R = M.random, ab = M.abs, sg = M.sign, Mmin = M.min, Mmax = M.max, Msin = M.sin, Mcos = M.cos;
const rnd = (a, b) => a + R() * (b - a);
const ri = (a, b) => a + (R() * (b - a + 1) | 0);
const pick = (a) => a[R() * a.length | 0];
const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
const dist = (a, b, c, d) => M.hypot(c - a, d - b);
const ang = (a, b) => M.atan2(b.y - a.y, b.x - a.x);

const LIME = 0xe1ff00, PINK = 0xff6ec7, RED = 0xff5a4f, GOLD = 0xffb62e, CYAN = 0x3ec5ff, WHITE = 0xe8f0ff, STEEL = 0x6b7c99, GREEN = 0x7bd02b, PURPLE = 0x8b5cf6;
const BIO = ['FRONTEND', 'BACKEND', 'LEGACY'], BIOC = [CYAN, GREEN, GOLD];
const RAR = [WHITE, CYAN, GOLD];
const ELC = [0, GOLD, CYAN, PURPLE];
const LVN = 'TODO OK,WARNING,ERROR,CRITICAL,INCIDENTE,KERNEL PANIC,VIERNES 18:00'.split(',');
const lvName = (l) => LVN[[3, 5, 8, 11, 15, 20].filter((x) => l >= x).length];
const lvCol = (l) => (l < 5 ? LIME : l < 11 ? GOLD : RED);
const BN = ['MERGE CONFLICT', 'KERNEL PANIC', 'CODE REVIEW', 'DEADLINE'], BST = ['GIT BLAME', 'BLUE SCREEN', 'REQUEST CHANGES', '23:59'];
// incidentes: un modificador al azar por etapa desde la segunda
const INC = ['', 'DDOS', 'DARK MODE', 'EN LA NUBE'];
const IND = ['', 'DOBLE BUGS Y CREDITOS', 'SIN LUCES', 'GRAVEDAD BAJA'];
const CT = ['DISPARO AUTO  B2 SALTAR', 'B3 DASH (MANTENER: ESPECIAL)', 'B5 USAR TERMINAL'];
const RK = 'TRAINEE,JUNIOR,SEMI SR,SENIOR,STAFF,LEAD,CTO'.split(',');

// items: nombre|descripcion, id 0-8 comun, 9-15 raro, 16-19 legendario. icono = 's' + (22 + id)
const IT = 'CAFE|+15% CADENCIA|ENERGETICA|+10% VELOCIDAD|PATITO DE GOMA|+10% CRITICO|STACK OVERFLOW|+20% ATAQUE|UNIT TESTS|+25 VIDA|HOTFIX|CURA 2 AL MATAR|CONSOLE.LOG|BALAS ATRAVIESAN|CTRL+Z|10% ESQUIVAR|PIZZA FRIA|REGENERA VIDA|FORK BOMB|LOS BUGS EXPLOTAN|COPY-PASTE|+1 BALA POR TIRO|DOCKER|ESCUDO|REGEX|RAYO EN CADENA|SPRING BOOT|+1 SALTO AEREO|CRON JOB|MISIL GUIADO|CACHE|RECARGA RAPIDA|COPILOTO|DRON QUE DISPARA|SUDO|+100% ATAQUE|ROLLBACK|REVIVE UNA VEZ|RM -RF|RAYO CADA 8 TIROS'.split('|');
const rarOf = (id) => (id < 9 ? 0 : id < 16 ? 1 : 2);

// enemigos: [sprite, vida, dano, velocidad, coste, valor, creditos, nivel minimo, color]
const EN = [
  [4, 24, 6, 70, 1, 1, 2, 1, GREEN], // 0 BUG
  [6, 14, 5, 105, 1, 1, 2, 2, CYAN], // 1 MOSCA
  [8, 36, 8, 60, 3, 2, 5, 3, PINK], // 2 NULL POINTER
  [9, 20, 22, 150, 2, 2, 3, 4, RED], // 3 SEGFAULT
  [10, 110, 14, 45, 5, 3, 8, 6, 0x2456c9], // 4 MEMORY LEAK
  [10, 28, 8, 80, 0, 1, 1, 99, 0x2456c9], // 5 mini leak
  [11, 55, 18, 60, 4, 3, 6, 8, GOLD], // 6 RACE CONDITION
  [12, 400, 20, 45, 0, 12, 40, 99, RED], // 7 jefe MERGE CONFLICT (primer jefe: vida baja para que un novato lo pase)
  [13, 520, 20, 90, 0, 12, 40, 99, CYAN], // 8 jefe KERNEL PANIC
  [44, 480, 20, 70, 0, 12, 40, 99, PINK], // 9 jefe CODE REVIEW
];

// ---------------------------------------------------------------- entrada
// DO NOT replace existing keys - they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
const CABINET_KEYS = {
  P1_U: ['w'],
  P1_D: ['s'],
  P1_L: ['a'],
  P1_R: ['d'],
  P1_1: ['u'],
  P1_2: ['i'],
  P1_3: ['o'],
  P1_4: ['j'],
  P1_5: ['k'],
  P1_6: ['l'],
  P2_U: ['ArrowUp'],
  P2_D: ['ArrowDown'],
  P2_L: ['ArrowLeft'],
  P2_R: ['ArrowRight'],
  P2_1: ['r'],
  P2_2: ['t'],
  P2_3: ['y'],
  P2_4: ['f'],
  P2_5: ['g'],
  P2_6: ['h'],
  START1: ['Enter'],
  START2: ['2'],
};
const nk = (k) => (k.length == 1 ? k.toLowerCase() : k);
const K2A = {}, held = {}, prev = {}, real = {};
for (const c in CABINET_KEYS) for (const k of CABINET_KEYS[c]) K2A[nk(k)] = c;
let kq = [], lastIn = 0;
addEventListener('keydown', (e) => {
  const c = K2A[nk(e.key)];
  lastIn = performance.now();
  if (AC) AC.resume();
  if (!c) {
    if (DEV) cheat(e.key);
    return;
  }
  e.preventDefault();
  if (!real[c]) kq.push(c);
  real[c] = held[c] = 1;
});
addEventListener('keyup', (e) => {
  const c = K2A[nk(e.key)];
  if (c) real[c] = held[c] = 0;
});
addEventListener('blur', () => {
  for (const c in held) real[c] = held[c] = 0;
});
const pk = (i, b) => 'P' + (i + 1) + '_' + b;
const dn = (i, b) => held[pk(i, b)];
const hk = (c) => (held[c] && !prev[c]) || kq.includes(c);
const ht = (i, b) => hk(pk(i, b));
const any = (b) => ht(0, b) || ht(1, b);

// ---------------------------------------------------------------- almacenamiento
const SK = 'prod-is-down-v1';
const store = () => window.platanusArcadeStorage || {
  async get(k) {
    try {
      const r = localStorage.getItem(k);
      return r === null ? { found: false } : { found: true, value: JSON.parse(r) };
    } catch (e) {
      return { found: false };
    }
  },
  async set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  },
};
let hi = [];
function loadHi() {
  try {
    store().get(SK).then((r) => {
      const t = r && r.found && r.value && r.value.top;
      if (Array.isArray(t)) hi = t.filter((x) => Array.isArray(x) && typeof x[0] == 'string' && x[1] >= 0 && x[2] >= 0).slice(0, 5);
    }).catch(() => {});
  } catch (e) {}
}
function saveHi() {
  try {
    store().set(SK, { top: hi }).catch(() => {});
  } catch (e) {}
}

// ---- KIT DE ASSETS (generado por kit/build.mjs a partir de kit/sprites.txt y kit/font.txt) ----
// No editar a mano: cambia el .txt y vuelve a correr `node kit/build.mjs`.
const PAL = "0b0f141b243033415a6b7c99e8f0ffe1ff007bd02b1e7a3cff6ec79c2a6eff5a4f8c1c2cffb62e3ec5ff2456c98b5cf6ffd2a87a4a2b";
const ATLAS = "ce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ20EE005D005D00ol3ce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ20EE0@5D1D005l00oce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ20EE00D500D500lo0ce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ2@EE0@1D1`3@100`3ca1276440@00ZPZX_XWXZQZ1241ca1276440@00ZPZX_XWXZTZ1214ca1223dl0o3o;lZP_PWPZ0Z0@00ca1223d0000l;oZ__SWPZ0Z0@00cc129f40D@mdod[mJmFmFmJd[do@m0Daa12ba40<@1ZXZnZWZ:Z2Z41ea121ed0X2Z:jZZ_ZNZZZZZRZ:2:8P0ca12bc430?0l2PZXZZ_ZWZZXX44oi14bac@0400110PZ:0XZZ0XoZ0XGZPXo:ZXZZZ@ZZZ4ZoZ0ZZZPZoZPZZZPZZZ0ZZZ@XZZ444X1440mk1423d@EE5YZZBFEETmo?IooCfeoTme?IoeCfooTmo5IoeCfooTEE5YZZ2EEE040:@0P240Z@0@40040ce12236DEYZioioioioYZYZYUYZYZYZTZD@gg1223a0000E1do0m?DEAZZYZJj[VZZYZJJEVZZYEIZZVZZEE566120c5Xn^^nX881223d1A1Zj[WZ820aa12234P:ZZjj_Z[jZZZFED5gg1212doo_ZZJEEVZZi^JZZFEUZZFEEZZZYZJZZVZZYZZZZEE5gg12120EEEEEEZFUEEIEEZFEEEEEEEEEEEEZFEEEEEEEEEEEE5gg1212doo_ZZJVI4A400000000000000000000000000000000880234h@@0@@Po;XZ6Z:QZJXZ2X:0880200c0l3`?0o0lo3`?0o0l3030088021ca0Z0XY0ZnPZPRZXZ:ZZ2Z:0880234c0`3`3`30XZ200PZ:10DEE188020060000`30?3l`c3`?0`00000880204a`o0l?looojo_nooo`o0l?08802306EEE0053@13D<050O10DEE1880200d000<0`30oo3?`33`00?`o08802ahcZZ:NgRo_Pg2h_0h20^0020880203c0`3030Z2XZR^ZZZZXZ2X:08802034X:022Plo83<j03<`03<`o388020edXZRooj[_nj[ooRo;P_0P2088020af000`<3`?0o?0oP<cZ002008802063P:0X20Z2PZ:XZ2l?`o0`o0880204aPZ02P8<P23X`?:0P802X:088020hcZZ:3`0o30?0`3033<?SZZ2880213d0?0P2PZ:hj2ZZPF:XZ288088020ac00``3?l`??ooooooZZZZZ288020a4XPR^ZjZZZZ:ZZ0Z20:00008802104locooOmeGOmoocc?lo3cc0880200400co33`00<0030`0o?0000yw1394a0000040Z00E1Z:0EEXb0DE_:<@E_Y03D]I:`@eZV2<DKZ103eZJ0`@]Z60<EGZ303eZZ0`@]Z:0<DKZ203E[Z0`0EK60<@E_103EEm0`FEE90LFEZ20KEEU0`EEY:0LEEE20GEUZ0dEEE90MEEE2DGEEE0eEEE5DMEEE1EGEEE@5EDA5DA5ED1om14984`300l?00l=00`[0E0PFZ0@YZ0@ZZ0TEeoYmogYoGPYoM@ZoE@ZoE@ZoE0YnG0YZo0YZZ0TMg0@EE0@YZ00DZ008Iof014440000000D0000000D00000005000000@5000000@5000000D5500000E5E1000@E1EE000EE1DEE0DEE1DEEEEEE0@EEEEE500EEEEE500DEEEE100@EEE500";
const FONT_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?:-+%$/><'#*()=_[]";
const FONT_DATA = "00000ayp7y9peeniqypq9pfzjjdqv30ni9rj2tdqayp81jfm3j3xcm4asjshjdfs1ayhkhb43n592ywe0ninjdx8haasqb39ony62ksrj92ywh2pb1tb5i5tat6q92kswhje7mn94gtq8tjnojdqfj9oob3563op9ooqn92wxa2kw7z92wj292jvy2hwcg1brb42hzlw2i68e02t8g00b28034aoankep9rh6m0nz0w1bxqa52nig0003o6urca0748w2jcjo2np5009ubkjcpog3sapy7nhu4";
const SPR = [];

function parseAtlas(ATLAS, SPR) {
  for (let p = 0; p < ATLAS.length;) {
    const w = parseInt(ATLAS[p], 36), h = parseInt(ATLAS[p + 1], 36), m = +ATLAS[p + 2];
    const n = Math.ceil((m ? w / 2 : w) * h / 3);
    SPR.push([w, h, m, +ATLAS[p + 3], ATLAS.substr(p + 4, 3), ATLAS.substr(p + 7, n)]);
    p += 7 + n;
  }
}

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

// Crea la textura `key` a partir del sprite i. pal (3 chars de paleta) y s (escala) son opcionales.
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
// ---- fin del kit

// texturas extra: fondo, anillo, brillo, rayos y scanlines
function texs() {
  const cv = (k, w, h) => S.textures.createCanvas(k, w, h);
  let t, c, i, j;
  // un horizonte por bioma, en grises para que el color del bioma lo tina: 0 rascacielos, 1 racks, 2 mainframes con cintas
  for (let s = 0; s < 3; s++) {
    t = cv('b' + s, 256, 600);
    c = t.getContext();
    for (i = 0; i < 4; i++) {
      const x = i * 64 + 6, h = 150 + (i * 67 + s * 90) % 230 + (s ? 0 : 100), y = 600 - h;
      c.fillStyle = '#27384d';
      c.fillRect(x, y, 52, h);
      if (!s) c.fillRect(x + 24, y - 40, 3, 40);
      for (j = 0; j < h / 14 - 1; j++) {
        const v = y + 8 + j * 14;
        c.fillStyle = '#3a5674';
        if (s) c.fillRect(x + 4, v, 44, 8);
        for (let k = 0; k < 4; k++) {
          c.fillStyle = R() < .3 ? '#fff' : s ? '#27384d' : '#3a5674';
          c.fillRect(x + 6 + k * 11, v + (s ? 2 : 0), s ? 3 : 7, s ? 3 : 8);
        }
      }
      if (s > 1) for (j = 0; j < 2; j++) {
        c.fillStyle = '#5a7da6';
        c.beginPath();
        c.arc(x + 14 + j * 24, y + 26, 10, 0, 7);
        c.fill();
        c.fillStyle = '#27384d';
        c.fillRect(x + 12 + j * 24, y + 18, 4, 16);
      }
    }
    t.refresh();
  }
  // senal del platano (parodia de la batisenal), en baja resolucion y escalada x3 sin suavizado, ya en amarillo:
  // haz que nace a ras de suelo (lo tapan los edificios y el piso) + halo difuso (un solo trazo, mismo sentido
  // de giro para que se unan), ovalo de luz solido y la silueta del platano (sprite 45) recortada adentro
  t = cv('sun', 48, 120);
  c = t.getContext();
  c.fillStyle = '#fff0a0';
  c.globalAlpha = .2;
  c.moveTo(20, 120);
  c.lineTo(13, 120);
  c.lineTo(5, 17);
  c.lineTo(43, 17);
  c.ellipse(24, 17, 23, 16, 0, 0, 7);
  c.fill();
  c.globalAlpha = 1;
  c.beginPath();
  c.ellipse(24, 17, 19, 13, 0, 0, 7);
  c.fill();
  c.globalCompositeOperation = 'destination-out';
  drawSprite(c, SPR[45], 12, 10);
  t.refresh();
  t = cv('ring', 64, 64);
  c = t.getContext();
  c.strokeStyle = '#fff';
  c.lineWidth = 5;
  c.beginPath();
  c.arc(32, 32, 28, 0, 7);
  c.stroke();
  t.refresh();
  // 'glow': brillo radial. 'dk': oscuridad con un hueco de luz en el centro (DARK MODE)
  [['glow', '#fff', '#fff0', 1], ['dk', '#0000', '#000', .25]].fe(([k, a, b, p]) => {
    t = cv(k, 64, 64);
    c = t.getContext();
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, a);
    g.addColorStop(p, b);
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    t.refresh();
  });
  t = cv('ray', 256, 256);
  c = t.getContext();
  c.fillStyle = '#fff';
  for (i = 0; i < 12; i++) {
    c.beginPath();
    c.moveTo(128, 128);
    c.arc(128, 128, 128, i * M.PI / 6, i * M.PI / 6 + M.PI / 14);
    c.fill();
  }
  t.refresh();
  t = cv('scan', 4, 3);
  c = t.getContext();
  c.fillStyle = '#000';
  c.fillRect(0, 0, 4, 1);
  t.refresh();
}

// ---------------------------------------------------------------- audio
// Grafo: voces -> [DK bus con bombeo | WB bus con eco | MB] -> MF (filtro) -> MG -> compresor -> salida
let AC, MG, NB, MB, DK, WB, DL, MF, PW, mfv, mSong = -1, mNext = 0, mStep = 0, mI = 0, mFI = -1, cpn = 0, cpT = 0, lowHp = 0, flow = 0, kn = (i) => mf(72 + i * 4);
const sl = {};
const mf = (m) => 440 * 2 ** ((m - 69) / 12);
function initAudio(c) {
  AC = c;
  const gn = (v, to) => {
    const n = AC.createGain();
    n.gain.value = v;
    n.connect(to);
    return n;
  };
  const cp = AC.createDynamicsCompressor(), re = new Float32Array(24);
  cp.connect(AC.destination);
  MG = gn(1.6, cp);
  MF = AC.createBiquadFilter();
  MF.frequency.value = mfv = 2e4;
  MF.connect(MG);
  MB = gn(.22, MF);
  DK = gn(1, MB);
  WB = gn(1, MB);
  DL = AC.createDelay();
  DL.connect(gn(.4, DL));
  DL.connect(gn(.5, MB));
  WB.connect(gn(.5, DL));
  // onda de pulso al 25 %: el timbre clasico de melodia de 8 bits
  for (let n = 1; n < 24; n++) re[n] = Msin(n * M.PI / 4) / n;
  PW = AC.createPeriodicWave(re, new Float32Array(24));
  NB = AC.createBuffer(1, AC.sampleRate / 2, AC.sampleRate);
  const d = NB.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1;
}
// envolvente y ruteo de una voz. sus: nota sostenida en vez de percusiva
function env(n, v, t, d, dst, sus) {
  const g = AC.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + (sus ? .02 : .003));
  g.gain.setTargetAtTime(0, t + (sus ? d * .75 : .003), sus ? d * .08 : d / 4);
  n.connect(g);
  g.connect(dst || MG);
}
// f Hz, d segundos, tipo de onda, volumen, f2 barrido, dl retraso, dst bus, cut filtro que se cierra, sus sostenida
function tone(f, d, ty, v, f2, dl, dst, cut, sus) {
  if (!MG || (demo && !dst)) return;
  const t = AC.currentTime + (dl || 0), o = AC.createOscillator();
  let n = o;
  if (ty == PW) o.setPeriodicWave(PW);
  else o.type = ty || 'square';
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  if (cut) {
    n = AC.createBiquadFilter();
    n.Q.value = 4;
    n.frequency.setValueAtTime(cut, t);
    n.frequency.exponentialRampToValueAtTime(cut / 4, t + d);
    o.connect(n);
  }
  if (DEV && dst && window.__n) window.__n.push([+t.toFixed(3), +f.toFixed(1), ty == PW ? 'L' : dst == WB ? 'A' : dst == DK ? (sus ? 'P' : 'B') : 'D']);
  env(n, v || .1, t, d, dst, sus);
  o.start(t);
  o.stop(t + d * 2);
}
function noise(d, v, f, dl, dst, hp) {
  if (!MG || (demo && !dst)) return;
  const t = AC.currentTime + (dl || 0), s = AC.createBufferSource(), fl = AC.createBiquadFilter();
  s.buffer = NB;
  s.loop = true;
  if (hp) fl.type = 'highpass';
  fl.frequency.value = f;
  s.connect(fl);
  env(fl, v, t, d, dst);
  s.start(t, R() * .4);
  s.stop(t + d * 2);
}
// arpegio de n notas del acorde actual
const ka = (n, d, v) => {
  for (let i = 0; i < n; i++) tone(kn(i), d * 2.5, 0, v || .07, 0, i * d);
};
const SFX = {
  sh: () => tone(rnd(800, 1000), .05, 0, .035, 300),
  hit: () => noise(.05, .14, 3000),
  crit: () => tone(1400, .07, 0, .06, 700),
  kill: () => {
    tone(rnd(360, 440), .12, 'sawtooth', .12, 80);
    noise(.08, .14, 2000);
  },
  coin: () => {
    tone(kn(3 + cpn % 6), .05, 0, .035);
    tone(kn(5 + cpn % 6), .08, 0, .035, 0, .05);
  },
  jump: () => tone(300, .1, 'triangle', .1, 620),
  dash: () => noise(.12, .12, 1500),
  sp: () => {
    tone(200, .25, 'sawtooth', .1, 900);
    noise(.2, .1, 3000);
  },
  hurt: () => tone(300, .2, 'sawtooth', .14, 90),
  boom: () => {
    noise(.3, .2, 600);
    tone(120, .3, 'sine', .25, 40);
  },
  tic: () => tone(1000, .02, 0, .04),
  err: () => {
    tone(160, .12, 0, .08);
    tone(160, .12, 0, .08, 0, .15);
  },
  boss: () => {
    tone(80, .8, 'sawtooth', .2, 50);
    noise(.8, .15, 400);
  },
  las: () => tone(1800, .5, 'sawtooth', .08, 200),
};
function sfx(n) {
  if (!MG || demo) return;
  const now = AC.currentTime;
  if (now - (sl[n] || 0) < .045) return;
  sl[n] = now;
  SFX[n]();
}
const fan = (q) => ka([2, 4, 7][q], .07, .06);

// ---- musica adaptativa
// cancion: [bpm, transposicion, frigio, estilo (0 normal, 1 galope, 2 medio tiempo), progresion de 8 compases, melodia de 64 corcheas]
// progresion: grado del acorde en la escala menor (0-6); 7 = dominante mayor. melodia: indice diatonico en base 36, '.' silencio
const SONGS = [
  [126, 0, 0, 0, '05260537', 'e.i..hg.j..i.g.eg.k..ji.h.k.m..ll.lkl.i.l.lkl.n.l..j.h.jk.i.f.d.'], // FRONTEND
  [120, -2, 0, 0, '00560057', 'ee.g.e.i.ihg.e..gg.j.g.l.kih.f..ee.g.e.i.ihg.e..j.ig.j.ii...f.i.'], // BACKEND
  [132, 3, 0, 0, '03625377', 'l.kl.i.gj.ij.h.ek.jk.h.fi.hi.g.dj.ij.g.eh.gh.j.hi..f.i.fi.fi.h.f'], // LEGACY
  [152, 2, 0, 1, '06570657', 'llil.ilikkhk.hkhjjgj.gjgiifi.fi.l.nl.ki.k.mk.ih.j.lj.ig.i.fi.m.i'], // jefe MERGE CONFLICT
  [138, -5, 1, 2, '01060121', 'e...f.e.f...h.f.i...j.i.h...f.d.l..i..g.m..j..h.n..k..i.m.jhf...'], // jefe KERNEL PANIC
  [118, 0, 0, 0, '26052605', ''], // release
];
// 6 = DEADLINE: remix del tema principal
SONGS.push([152, -1, 0, 1, '05260537', SONGS[0][5]]);
const BAS = ['0.......0.....0.', '0.0.3.0.0.0.3.2.', '0.3.0.3.0.3.0.32', '0.000.000.000.00', '0303030303030332'];
const ARP = ['0123210123210123', '3210321032103210', '0.2.1.3.2.4.3.5.'];
const mus = (i, dl) => {
  mSong = i;
  mStep = mI = 0;
  if (MG && i >= 0) {
    mNext = AC.currentTime + (dl || .05);
    DL.delayTime.value = 45 / SONGS[i][0];
  }
};
// hz: horizonte de programacion en segundos (solo para render offline en desarrollo)
function music(hz) {
  if (!MG || mSong < 0 || (!hz && AC.state != 'running')) return;
  const [bpm, tr, ph, st, pg, ld] = SONGS[mSong], pl = mode == 'PLAY' && !demo;
  const sd = 15 / bpm / (pl ? 1 + Mmin(lvl, 20) * .006 : 1) / (mSong > 5 && boss ? 1.5 - boss.hp / boss.mhp / 2 : 1);
  const fv = mode == 'PAUSE' || mode == 'OVER' ? 500 : pl && lowHp ? 1400 : 2e4;
  if (fv != mfv) MF.frequency.setTargetAtTime(mfv = fv, AC.currentTime, .15);
  if (mNext < AC.currentTime) mNext = AC.currentTime + .05;
  while (mNext < AC.currentTime + (hz || .12)) {
    const s = mStep % 16, bar = (mStep >> 4) % 8, dl = mNext - AC.currentTime;
    let c = +pg[bar], ch;
    const hm = c > 6;
    if (hm) c = 4;
    // indice diatonico (0 = La1 + transposicion) -> Hz
    const nt = (n) => mf(33 + tr + 12 * (n / 7 | 0) + [0, 2 - ph, 3, 5, 7, 8, 10][n % 7] + (hm && n % 7 == 6));
    const ct = (i) => 7 * (i / 3 | 0) + i % 3 * 2; // nota i del acorde, en grados sobre su fundamental
    const pd = c > 3 ? c + 7 : c + 14; // registro del colchon; el arpegio va una octava arriba
    kn = (i) => nt(pd + 7 + ct(i));
    // intensidad 0-4: sube al instante (cada medio compas) y baja de a un nivel por compas
    if (s % 8 == 0) {
      const n = pl ? foes().filter((e) => ab(e.x - camPt.x) < 500).length : 0;
      const ti = mFI >= 0 ? mFI : !pl ? 2 : boss ? 3 + boss.p2 : flow ? 4 : Mmin(3, (n > 0) + (n > 3) + (combo > 9));
      if (ti > mI) mI = ti;
      else if (!s && ti < mI) mI--;
    }
    // colchon: acorde sostenido todo el compas, dos sierras desafinadas por nota
    if (!s) for (let k = 0; k < 3; k++) for (const q of [1, 1.007]) tone(nt(pd + ct(k)) * q, sd * 16, 'sawtooth', .018, 0, dl, DK, 900 + mI * 500, 1);
    // arpegio con eco: siempre presente, sube de volumen con la accion
    ch = ARP[mSong == 5 ? 2 : st ? 1 : 0][s];
    if (ch != '.') tone(nt(pd + 7 + ct(+ch)), sd * 1.4, 0, mI > 1 ? .045 : .018, 0, dl, WB);
    // melodia (corcheas): con intensidad 2 suena un ciclo si y uno no; desde 3, siempre
    if (!(s % 2) && ld && mI > 1 && (mI > 2 || demo || (mStep >> 7) % 2)) {
      const i = bar * 8 + s / 2;
      ch = ld[i];
      if (ch != '.') {
        let k = 1;
        while (ld[(i + k) % 64] == '.' && k < 4) k++;
        tone(nt(parseInt(ch, 36) + (mI > 2 && (mStep >> 7) % 2 ? 14 : 7)), sd * 2 * k, PW, .075, 0, dl, WB, 0, 1);
      }
    }
    if (!demo) {
      // bajo: sierra con filtro que se cierra
      ch = BAS[st == 1 ? 3 : st ? 0 : mI > 2 ? 4 : mI][s];
      if (ch != '.') tone(nt((c > 2 ? c : c + 7) + ct(+ch)), sd * (st == 1 || mI > 2 ? 1.2 : 1.9), 'sawtooth', .17, 0, dl, DK, 500 + mI * 150);
      // bateria
      const fill = bar == 7 && s > 11 && mI > 1;
      if (st == 2 ? s == 0 || s == 10 : mI > 1 ? s % 4 == 0 : mI && s % 8 == 0) {
        tone(220, .16, 'sine', .5, 45, dl, MB);
        bk = mNext;
        DK.gain.setValueAtTime(.3, mNext);
        DK.gain.linearRampToValueAtTime(1, mNext + sd * 3);
      }
      if (fill || (st == 2 ? s == 8 : mI > 1 && s % 8 == 4)) {
        noise(.13, fill ? .03 + (s - 11) * .015 : .09, 1800, dl, MB, 1);
        tone(190, .08, 'triangle', .1, 110, dl, MB);
      }
      if (mSong > 5 && !(s % 4)) tone(s % 8 ? 1800 : 2400, .03, 0, .07, 0, dl, MB);
      if (s % 4 == 2) noise(mI > 2 ? .09 : .03, mI > 2 ? .1 : .07, 7e3, dl, MB, 1);
      else if (mI > 2) noise(.03, .06, 7e3, dl, MB, 1);
      if (!s && mI > 1 && !(bar % (mI > 3 ? 2 : 8))) noise(.8, .07, 5e3, dl, MB, 1);
      // latido con poca vida
      if (pl && lowHp && s % 8 < 4 && s % 8 != 1 && s % 8 != 2) tone(62, .14, 'sine', .35, 40, dl);
    }
    mNext += sd;
    mStep++;
  }
}

// ---------------------------------------------------------------- estado
let S, SA, SP, cam, G, mode, demo = 1, stage, debt, lvl, coins, cshow, score, kills, inv, ord, paid, pity, two;
let P, players, enemies, bullets, cn, map, layer, cols, lv, top, spots, terms, dep, boss, stg, dirCr, dirT;
let combo, comboT, stopT, zf, slow, fx, fq, rolls, spinL, rb, nums, ni, em, camPt, demoT, botJ, cardT;
let atk, cad, spd, crit, mhp, dodge, cdm, startWith = -1, pp, ppT = 0;
let hP, ha, dT, dF, dN, cT, cB, sT, stT, arw, bN, bF, bB, coT, cd1, cd2, vig, ii, bgs, tO, g1, g2, prm, tl;
let gp, gs, gT, lt, rep, pO, pR, stH, oT, oq, nm, nc, nT, oL, cT2, pT, cT3, bl, noFx, sf = 0, sky, amb, bio, dk, inc, cx, zt = 1, tn = 0, lp = 0, fin, won, itc, bk = 0, sun;

// ---------------------------------------------------------------- ayudantes de Phaser
Phaser.GameObjects.GameObject.prototype.sf = function (d) {
  return this.Sf(0).Dp(d);
};
const txt = (x, y, s, z, c, ox, oy) => SA.bitmapText(x, y, 'f', s, z || 12).Ti(c || WHITE).Or(ox || 0, oy || 0);
const rect = (x, y, w, h, c, a) => SA.image(x, y, 'px').Or(0).Sc(w / 2, h / 2).Ti(c).Al(a == null ? 1 : a);
const hud = (o) => (ha.push(o), o.sf(20));
const hsv = (h) => Phaser.Display.Color.HSVToRGB(h % 1, .8, 1).color;
const sk = (d, i) => cam.shake(d, i);
const dc = (t, f) => S.time.delayedCall(t, f);
const tw = (t, o) => S.tweens.add({ targets: t, ...o });
const zp = (z) => cam.zoom = Mmax(cam.zoom, z);
const live = (g) => g.getChildren().filter((o) => o.active);
const foes = () => live(enemies).filter((e) => e.hp > 0);

function emitter(c, h) {
  const k = c + (h ? 'h' : '');
  let e = em[k];
  if (!e) {
    e = em[k] = SA.particles(0, 0, 'px', c == 'cf' ? {
      tint: [RED, GOLD, LIME, CYAN, PINK, PURPLE], speed: { min: 200, max: 520 }, angle: { min: 200, max: 340 },
      lifespan: 1600, gravityY: 500, scaleX: { start: 4, end: 1 }, scaleY: 2, rotate: { start: 0, end: 540 }, emitting: false,
    } : {
      tint: c, speed: { min: 60, max: 340 }, lifespan: { min: 250, max: 600 }, scale: { start: 2.6, end: 0 },
      gravityY: 500, emitting: false, blendMode: 'ADD',
    }).Dp(h ? 32 : 6);
    if (h) e.Sf(0);
  }
  return e;
}
const burst = (x, y, c, n, h) => emitter(c, h).explode(n, x, y);

// imagen efimera que crece y se desvanece
function fxi(k, x, y, c, s0, s1, d, h) {
  const o = SA.image(x, y, k).Ti(c).Bm(1).Dp(h ? 30.5 : 6).Sc(s0);
  if (h) o.Sf(0);
  tw(o, { scale: s1, alpha: 0, duration: d, ease: 'Cubic.easeOut', onComplete: () => o.destroy() });
  return o;
}
const ring = (x, y, c, s, h) => fxi('ring', x, y, c, .2, s || 1.5, 320, h);
const flash = (x, y, c, s) => fxi('glow', x, y, c, s, s * 1.6, 90);
const rays = (x, y, c, h) => spinL.push(fxi('ray', x, y, c, .1, 2.6, 1600, h).Al(.6));

// texto que aparece de golpe con rebote
function pop(x, y, s, z, c, h, life, rainbow) {
  const t = txt(x, y, s, z, c, .5, .5).Dp(h ? 33 : 7).Sc(0);
  if (h) t.Sf(0);
  if (rainbow) rb.push(t);
  tw(t, { scale: 1, duration: 280, ease: 'Back.easeOut' });
  tw(t, { alpha: 0, y: y - 24, delay: life || 650, duration: 300, onComplete: () => t.destroy() });
  return t;
}

function num(x, y, v, cr, c) {
  const t = nums[ni++ % 24];
  S.tweens.killTweensOf(t);
  t.Te(v + (cr ? '!' : '')).Po(x + rnd(-8, 8), y).setFontSize(cr ? 18 : 12).Ti(c || (cr ? GOLD : 0xffffff)).Al(1).Sc(cr ? 1.7 : 1.3).Vi(1);
  tw(t, { y: y - 36, scale: 1, alpha: { value: 0, ease: 'Quad.easeIn' }, duration: 650, ease: 'Cubic.easeOut' });
}

function stop(s) {
  if (mode == 'PLAY' && !demo) {
    SP.pause();
    stopT = s;
  }
}

const nearP = (x, y) => {
  let b = 0, bd = 1e9;
  P.fe((p) => {
    if (p && !p.dn) {
      const d = dist(x, y, p.x, p.y);
      if (d < bd) {
        bd = d;
        b = p;
      }
    }
  });
  return b;
};
const near = (x, y, r) => {
  let b = 0;
  foes().fe((e) => {
    const d = dist(x, y, e.x, e.y);
    if (d < r && !(e.sp0 > 0)) {
      r = d;
      b = e;
    }
  });
  return b;
};

// ---------------------------------------------------------------- escena
function create() {
  S = this;
  SA = S.add;
  SP = S.physics;
  // fondo opaco en la camara: con bloom la escena se dibuja en una textura que parte transparente,
  // y la mezcla aditiva (brillos, anillos, balas) oscurecia todo su cuadrado sobre las zonas semitransparentes
  cam = S.cameras.main.setBackgroundColor(0x0b0f14);
  if (!SPR.length) {
    buildAssets(S);
    texs();
    loadHi();
  }
  if (!AC && S.sound.context) initAudio(S.sound.context);
  em = {};
  fx = [];
  fq = [];
  rolls = [];
  spinL = [];
  rb = [];
  cn = [];
  lv = [];
  cols = [];
  ha = [];
  ii = {};
  terms = [];
  P = [0, 0];
  inv = Array(20).fill(0);
  ord = [];
  stage = startWith < 0 ? 2 : 1;
  coins = cshow = score = kills = paid = pity = two = 0;
  combo = comboT = stopT = slow = cardT = demoT = botJ = 0;
  boss = stg = dirCr = 0;
  dirT = 2;
  layer = cx = fin = won = itc = 0;
  zt = 1;
  mode = 'PLAY';
  demo = startWith < 0;
  coins = demo ? 0 : 18;
  debt = demo ? 40 : 0;
  lvl = 1 + (debt / 18 | 0);
  flow = 0;
  for (const c in held) held[c] = real[c] || 0;

  bl = 0;
  dk = SA.image(0, 0, 'dk').Sc(28).Dp(15).Al(.92);
  if (cam.postFX && !noFx) {
    bl = cam.postFX.addBloom(0xffffff, 1, 1, 2.4, .3);
    cam.postFX.addVignette(.5, .5, .9, .3);
    cx = cam.postFX.addColorMatrix();
  }
  sky = SA.image(400, 640, 'glow').Sc(16, 9).sf(-11).Al(.35);
  // senal en dos capas que se reparten la textura sin solaparse (si se solapan, el halo doble se ve como un cuadrado):
  // filas 0-33 (ovalo y halo) delante de los edificios con alfa pareja; el haz (filas 34+) detras, desvaneciendose hacia abajo.
  // ojo: con recorte, el alfa por esquina se reparte en el recorte, no en la textura entera
  sun = [[-8.5, 0, 34, .9], [-10.5, 34, 86, 0]].map(([d, y, h, a]) => SA.image(720, 230, 'sun').sf(d).Al(.9, .9, a, a).setCrop(0, y, 48, h));
  bgs = [0, 1].map((i) => SA.tileSprite(0, 0, W, H, 'b0').Or(0).sf(-10 + i).Al(i ? .85 : .5).setTileScale(i + 1));
  amb = SA.particles(0, 0, 'px', {
    x: { min: 0, max: W }, y: { min: 0, max: H }, lifespan: 5e3, speedY: { min: -40, max: -10 }, scale: { min: .5, max: 1.5 },
    alpha: { start: .6, end: 0 }, frequency: 90, blendMode: 'ADD',
  }).sf(-8);
  players = SP.add.group();
  enemies = SP.add.group();
  bullets = SP.add.group({ allowGravity: false });
  // ojo: Phaser descarta el contacto solo si el filtro devuelve exactamente false, por eso b.own > 0 y no b.own
  SP.add.overlap(bullets, enemies, hitE, (b, e) => b.own > 0 && e.hp > 0 && !(e.sp0 > 0) && b.hit.indexOf(e) < 0);
  SP.add.overlap(bullets, players, (b, p) => {
    hurtP(p, b.dmg, b.x);
    kb(b);
  }, (b, p) => !b.own && !p.dn);
  SP.add.overlap(enemies, players, (e, p) => hurtP(p, e.k == 3 ? 8 * e.dm : e.dmg, e.x), (e, p) => e.hp > 0 && !(e.sp0 > 0) && !p.dn);
  G = SA.graphics().Dp(6);
  camPt = new Phaser.Math.Vector2(200, 500);
  cam.startFollow(camPt, true, .1, .1);
  nums = [];
  for (ni = 0; ni < 24; ni++) nums.push(txt(0, 0, '', 12, 0, .5, .5).Dp(8).Vi(0));
  SA.tileSprite(0, 0, W, H, 'scan').Or(0).sf(99).Al(.18);
  mkHud();
  buildStage();
  if (demo) {
    join(0);
    [10, 10, 16, 0, 0, 0, 14, 12, 3].fe((k) => give(k, 1));
    startBoss();
    mus(0);
    mkTitle();
    ha.fe((o) => o.Vi(0));
  } else {
    join(startWith);
  }
  startWith = -1;
}

function update(time, delta) {
  tn = time;
  const dt = Mmin(delta, 50) / 1000;
  G.clear();
  music();
  if (bl && (sf = Mmax(0, sf + (delta > 28 ? 1 : -1))) > 90) {
    cam.postFX.clear();
    bl = cx = 0;
    noFx = 1;
  }
  if (mode == 'PLAY') play(dt);
  else if (mode == 'GACHA') upGacha(dt);
  else if (mode == 'PAUSE') upPause(dt);
  else upOver(dt);
  fx = fx.filter((f) => (f[6] -= dt) > 0);
  fx.fe((f) => G.lineStyle(f[5] * Mmin(1, f[6] * 8), f[4], 1).lineBetween(f[0], f[1], f[2], f[3]));
  spinL = spinL.filter((o) => o.active && (o.rotation += dt * 1.2));
  rb = rb.filter((o) => o.active && o.Ti(hsv(time / 600)));
  cam.zoom += (zt - cam.zoom) * Mmin(1, dt * 7);
  for (const c in held) prev[c] = held[c];
  kq = [];
}

// ---------------------------------------------------------------- modo PLAY
function play(dt) {
  if (demo) {
    if (titleUp(dt)) return;
    botUp(dt);
  } else {
    // sin nadie en pie no se pausa: la pausa se tragaria el aviso de fin de partida
    const st = P.some((p) => p && !p.dn) && ((P[0] && hk('START1')) || (P[1] && hk('START2')));
    for (let i = 0; i < 2; i++) if (!P[i] && hk('START' + (i + 1))) join(i);
    if (st) return pause();
    if (performance.now() - lastIn > 6e4) return go(-1);
  }
  if (stopT > 0) {
    // durante el TIEMPO DETENIDO solo actua DEADLINE (zf); el resto del mundo sigue congelado
    if (zf) zf(dt);
    if ((stopT -= dt) <= 0) {
      SP.resume();
      zt = 1;
      zf = 0;
      if (cx) cx.reset();
    }
    return;
  }
  if (slow > 0) {
    slow -= dt;
    dt *= .3;
    SP.world.timeScale = slow > 0 ? 3.3 : 1;
  }
  const nl = 1 + (debt / 18 | 0);
  if (nl > lvl) {
    lvl = nl;
    if (!demo) {
      pop(400, 110, 'DEUDA LV ' + lvl, 18, lvCol(lvl), 1, 900);
      pop(400, 136, lvName(lvl), 24, lvCol(lvl), 1, 900);
      tone(220, .3, 'sawtooth', .08, 440);
    }
  }
  P.fe((p) => p && upP(p, dt));
  const al = P.filter((p) => p && !p.dn);
  // co-op: si uno se queda atras, se trae al rezagado al ultimo suelo seguro del otro
  if (al.length > 1 && ab(al[0].x - al[1].x) > 700) {
    const [a, b] = al[0].x < al[1].x ? al : [al[1], al[0]];
    a.body.reset(b.sx, b.sy - 8);
    a.iv = 1;
    ring(a.x, a.y, CYAN, 2);
    pop(a.x, a.y - 40, 'GIT PULL', 12, CYAN);
  }
  pp = al.length > 1 && dist(al[0].x, al[0].y, al[1].x, al[1].y) < 170;
  if (pp) {
    G.lineStyle(2, GREEN, .5 + .3 * Msin(tn / 90)).lineBetween(al[0].x, al[0].y, al[1].x, al[1].y);
    if (tn > ppT) pop(cl(al[0].x / 2 + al[1].x / 2, cam.scrollX + 140, cam.scrollX + 660), al[0].y - 50, 'PAIR PROGRAMMING', 12, GREEN, 0, 900);
    ppT = tn + 9e3;
  }
  if (al.length) {
    let x = 0, y = 0;
    al.fe((p) => {
      x += p.x / al.length;
      y += p.y / al.length;
    });
    camPt.set(x + (al.length == 1 ? al[0].face * 50 : 0), y - 30);
    if (two) al.fe((p) => p.x = cl(p.x, cam.scrollX + 12, cam.scrollX + W - 12));
  }
  dk.Vi(inc == 2 && !stg).Po(camPt.x, camPt.y);
  const bt = AC && AC.currentTime > bk ? Mmax(0, 1 - (AC.currentTime - bk) * 5) : 0;
  sky.Ti(stg == 1 ? RED : flow ? hsv(tn / 3e3) : lvl > 14 && (tn / 500 | 0) % 2 ? RED : BIOC[bio]).Al(.35 + bt * .25);
  sun.fe((s) => s.Sc(3 + bt * .2).Ti(stg == 1 ? RED : 0xffffff)); // la senal late con el bombo (las dos capas juntas para que el ovalo calce)
  if (bl) bl.strength = .3 + flow * .12;
  bgs.fe((b, i) => {
    b.Ti(sky.tintTopLeft).Al(i ? .6 + bt * .2 : .4);
    b.tilePositionX = cam.scrollX * (i ? .4 : .15) / (i + 1);
    b.tilePositionY = (cam.scrollY - 104) * (i ? .2 : .1);
  });
  live(enemies).fe((e) => upE(e, dt));
  live(bullets).fe((b) => upB(b, dt));
  coinsUp(dt);
  const q = fq;
  fq = [];
  q.fe((f) => boom(f[0], f[1], 60 + 15 * inv[9], 0, atk * .6, f[2]));
  upRolls(dt);
  terms.fe(upTerm);
  if (stg < 2) director(dt);
  if (comboT > 0 && (comboT -= dt) <= 0) {
    if (combo >= 10 && !demo) {
      const v = combo * combo / 50 | 0;
      pop(400, 200, 'COMBO X' + combo + '  +$' + v, 24, GOLD, 1, 1100, 1);
      for (let k = 0; k < Mmin(10, v); k++) drop(cam.scrollX + rnd(80, 720), cam.scrollY - 10, k ? 1 : v - Mmin(10, v) + 1);
      ka(4, .06);
    }
    combo = flow = 0;
  }
  if (!demo) hudUp(dt);
}

// ---------------------------------------------------------------- nivel
function gt(c) {
  while (top[c] > 21) c--;
  return top[c];
}
function buildStage() {
  P.fe((p) => p && (p.dn ? revive(p, .5) : p.hp = Mmin(mhp, p.hp + mhp * .3)));
  if (layer) {
    layer.destroy();
    map.destroy();
  }
  cols.fe((c) => c.destroy());
  lv.fe((o) => o.destroy());
  lv = [];
  terms = [];
  rolls = [];
  live(enemies).fe((e) => e.Db(true, true));
  live(bullets).fe((b) => b.Db(true, true));
  cn.fe((c) => {
    coins += c.v;
    c.destroy();
  });
  cn = [];
  fx = [];
  fq = [];
  stg = boss = dirCr = 0;
  dirT = 3;
  inc = stage > 1 && !demo ? (DEV && window.__inc) || ri(1, 3) : 0;
  SP.world.gravity.y = inc == 3 ? 620 : 1100;
  SP.world.setBounds(0, 0, MW * T, WH, true, true, false, false);
  cam.setBounds(0, 0, MW * T, WH);
  bio = (stage - 1) % 3;
  lp = (stage - 1) / 3 | 0;
  const b3 = bio * 3;
  // terreno
  top = [];
  let h = 18, c = 0, pit = 0, r, k;
  for (; c < 8; c++) top[c] = 18;
  while (c < 72) {
    r = R();
    if (r < .18 && c > 12 && !pit) {
      for (k = ri(2, 3); k--;) top[c++] = 22;
      pit = 1;
    } else {
      if (r < .75) h = cl(h + pick([-2, -1, 1, 2]), 12, 19);
      for (k = ri(4, 9); k--;) top[c++] = h;
      pit = 0;
    }
  }
  for (c = 72; c < 75; c++) top[c] = h += cl(18 - h, -2, 2);
  for (; c < MW; c++) top[c] = 18;
  const d = [];
  for (r = 0; r < MH; r++) d.push(Array(MW).fill(-1));
  for (c = 0; c < MW; c++) for (r = top[c]; r < MH; r++) d[r][c] = b3 + (r > top[c] ? 1 : 0);
  spots = [];
  const plat = (r, c0, l) => {
    for (let i = 0; i < l; i++) {
      const x = c0 + i;
      if (x < 73 && r >= 4 && d[r][x] < 0 && r <= gt(x) - 2) {
        d[r][x] = b3 + 2;
        spots.push([x, r, 1]);
      }
    }
  };
  for (c = 10; c < 70; c += ri(5, 9)) {
    if (R() < .75) {
      r = gt(c) - 3;
      plat(r, c, ri(3, 6));
      if (R() < .45) plat(r - 3, c + ri(2, 4), ri(3, 5));
    }
  }
  for (c = 0; c < 5; c++) d[15][79 + c] = d[15][91 + c] = b3 + 2;
  for (c = 9; c < 72; c++) if (top[c] < 22) spots.push([c, top[c], 0]);
  map = S.make.tilemap({ data: d, tileWidth: T, tileHeight: T });
  layer = map.createLayer(0, map.addTilesetImage('tl', 'tl', T, T), 0, 0);
  layer.setCollision([0, 1, 3, 4, 6, 7]);
  layer.forEachTile((t) => {
    if (t.index % 3 == 2) t.setCollision(false, false, true, false, false);
  });
  const oneWay = (s, t) => t.index % 3 != 2 || (!s.dropping && s.body.prev.y + s.body.height <= t.getTop() + 1);
  cols = [
    SP.add.collider(players, layer, null, oneWay),
    SP.add.collider(enemies, layer, null, (e, t) => !e.fly && oneWay(e, t)),
    SP.add.collider(bullets, layer, (b) => kb(b), (b, t) => t.index % 3 != 2 && !b.gh),
  ];
  // terminales
  const take = (c0, c1, pl) => {
    let a = spots.filter((s) => s[0] >= c0 && s[0] < c1);
    const b = a.filter((s) => s[2]);
    if (b.length && (pl || R() < .7)) a = b;
    const s = pick(a);
    if (s) spots.splice(spots.indexOf(s), 1);
    return s;
  };
  for (k = 0; k < 5; k++) {
    const s = stage < 2 && !k ? [11, top[11]] : take(10 + k * 12.4 | 0, 10 + (k + 1) * 12.4 | 0);
    if (s) term(s[0] * T + 16, s[1] * T, 0);
  }
  if (stage > 1) {
    const s = spots.filter((s) => s[2]).sort((a, b) => a[1] - b[1])[0];
    if (s) {
      spots.splice(spots.indexOf(s), 1);
      term(s[0] * T + 16, s[1] * T, 1);
    }
  }
  dep = term(87 * T + 16, 18 * T, 2);
  if (stage == 1 && !demo) {
    lv.push(...CT.map((t, k) => txt(240, 452 + k * 20, t, 12, STEEL, .5)));
  }
  const un = unl();
  for (k = 0; k < Mmin(16, 4 + 2 * stage); k++) {
    const s = pick(spots.filter((s) => s[0] > 18));
    const t = pick(un), f = t == 1 || t == 2;
    if (s) spawnE(t, s[0] * T + 16, s[1] * T - (f ? 60 : 14)).sp0 = 0;
  }
  // jugadores al inicio
  P.fe((p, i) => {
    if (p) {
      p.body.reset(90 + i * 34, 17 * T - 14);
      p.sx = p.x;
      p.sy = p.y;
    }
  });
  camPt.set(200, 500);
  cam.scrollX = 0;
  cam.scrollY = WH - H;
  amb.setParticleTint(BIOC[bio]);
  bgs.fe((b) => b.Tx('b' + bio));
  cam.fadeIn(350);
  if (!demo) {
    pop(400, 230, fin ? 'DEPLOY FINAL' : 'SERVER ' + stage + ': ' + BIO[bio], 24, BIOC[bio], 1, 1700);
    pop(400, 262, 'BUSCA EL DEPLOY', 12, WHITE, 1, 1700);
    if (inc) {
      pop(400, 304, 'INCIDENTE: ' + INC[inc], 24, RED, 1, 2800);
      pop(400, 334, IND[inc], 12, RED, 1, 2800);
    }
  }
  mus(bio);
}

function term(x, y, k) {
  const t = SA.image(x, y, k == 2 ? 's15' : k ? 'ts' : 's14').Or(.5, 1).Dp(1);
  t.gl = SA.image(x, y - 14, 'glow').Ti(k ? RED : GREEN).Bm(1).Sc(k == 2 ? 2 : 1.3);
  t.k = k;
  t.n = k ? 1 : 2;
  t.lb = txt(x, y - (k == 2 ? 40 : 34), '', 12, LIME, .5, 1).Dp(8);
  lv.push(t, t.gl, t.lb);
  terms.push(t);
  return t;
}
const nearT = (p) => terms.find((t) => ab(p.x - t.x) < 30 && ab(p.body.bottom - t.y) < 40);
function upTerm(t) {
  const p = P.find((p) => p && !p.dn && nearT(p) == t), pr = 18 + 5 * paid;
  let s = '', c = LIME;
  if (t.k == 2) s = stg ? '' : p ? '[B5] DEPLOY' : 'DEPLOY';
  else if (t.n <= 0) {
    s = t.busy ? '' : '404';
    c = STEEL;
  } else if (p && !t.busy) {
    s = t.k ? '[B5] SUDO: GRATIS, +DEUDA' : '[B5] NPM INSTALL $' + pr;
    if (!t.k && coins < pr) c = RED;
  }
  t.lb.Te(demo ? '' : s).Ti(c);
  t.gl.Al(t.n > 0 && !(t.k == 2 && stg) ? .35 + .2 * Msin(tn / 200) : 0);
}
function use(p) {
  const t = nearT(p);
  if (!t || t.busy) return;
  if (t.k == 2) {
    if (!stg) startBoss();
    return;
  }
  if (t.n <= 0) return sfx('err');
  if (t.k) {
    debt += 15;
    t.n = 0;
    pop(t.x, t.y - 70, '+15 DEUDA', 12, RED);
    roll(t, rollItem(1));
  } else {
    const pr = 18 + 5 * paid;
    if (coins < pr) {
      sfx('err');
      pop(t.x, t.y - 70, 'SIN CREDITOS', 12, RED);
      sk(80, .004);
      return;
    }
    coins -= pr;
    paid++;
    t.n--;
    pop(t.x, t.y - 70, '-$' + pr, 12, GOLD);
    roll(t, rollItem(0));
  }
  if (t.n <= 0) t.Ti(0x55606e);
}

// ---------------------------------------------------------------- jugador
function join(i) {
  const o = P[1 - i], al = o && !o.dn, x = al ? o.x : 90, y = al ? o.y - 30 : 17 * T - 14;
  const p = players.create(x, y, i ? 'q0' : 's0').Dp(4);
  p.body.Sz(14, 26).Of(5, 2).Mv(900, 640).Cw(true);
  Object.assign(p, { i, face: 1, cdD: 0, cdS: 0, dT: 0, iv: 1.5, coy: 0, jb: 0, air: 0, ft: 0, drop: 0, sh: inv[11] ? 1 : 0, shT: 0, dn: 0, rv: 0, sx: x, sy: y, st: 0, shots: 0, dr: [], cr: 2, dtm: 0, wg: 1, vy0: 0, ch: 0 });
  p.shi = SA.image(x, y, 'ring').Sc(.65).Ti(CYAN).Al(.6).Dp(5).Bm(1).Vi(0);
  P[i] = p;
  two = P[0] && P[1] ? 1 : 0;
  recalc();
  p.hp = mhp;
  if (!demo) {
    pop(x, y - 40, 'P' + (i + 1) + ' ONLINE', 12, i ? PINK : LIME);
    ring(x, y, i ? PINK : LIME, 2);
    ka(3, .05);
  }
}

function recalc() {
  const n = inv;
  atk = 12 * (1 + .2 * n[3]) * (1 + n[17]);
  cad = 1 + .15 * n[0];
  spd = 190 * Mmin(1.8, 1 + .1 * n[1]);
  crit = Mmin(1, .05 + .1 * n[2]);
  mhp = 100 + 25 * n[4];
  dodge = Mmin(.4, n[7] / (n[7] + 9));
  cdm = 1 / (1 + .18 * n[15]);
  P.fe((p) => {
    if (p) while (p.dr.length < n[16]) p.dr.push(SA.image(p.x, p.y, 's17').Dp(5));
  });
}

function upP(p, dt) {
  const i = p.i, b = p.body, g = b.blocked.down, now = tn;
  if (p.dn) {
    const o = P[1 - i];
    if (o && !o.dn && ab(o.x - p.tb.x) < 40 && ab(o.y - p.tb.y) < 50) {
      if ((p.rv += dt) > 2.5) revive(p, .4);
    } else p.rv = Mmax(0, p.rv - dt);
    if (p.rv > 0) G.fillStyle(GREEN).fillRect(p.tb.x - 20, p.tb.y - 22, 40 * p.rv / 2.5, 4);
    return;
  }
  const L = dn(i, 'L'), Rr = dn(i, 'R'), U = dn(i, 'U'), D = dn(i, 'D'), hz = !L != !Rr, pc = i ? PINK : LIME;
  if (hz) p.face = Rr ? 1 : -1;
  p.iv -= dt;
  p.cdD -= dt;
  p.cdS -= dt;
  p.dropping = (p.drop -= dt) > 0;
  p.coy = g ? .09 : p.coy - dt;
  p.jb = ht(i, '2') ? .11 : p.jb - dt;
  if (g) {
    p.air = 0;
    if ((p.st -= dt) < 0) {
      p.st = .25;
      p.sx = p.x;
      p.sy = p.y;
    }
    if (!p.wg && p.vy0 > 350) burst(p.x, b.bottom, STEEL, 6);
  }
  p.wg = g;
  p.vy0 = b.velocity.y;
  if (p.dT > 0) {
    if ((p.dT -= dt) <= 0) {
      b.Ag(true);
      b.velocity.scale(.3);
    } else fxi(p.texture.key, p.x, p.y, pc, 1, 1, 220).Fx(p.flipX).Bm(0).Al(.6);
  } else {
    b.Vx(hz ? p.face * spd : 0);
    if (p.jb > 0) {
      const tl = layer.getTileAtWorldXY(p.x, b.bottom + 4);
      if (D && g && tl && tl.index % 3 == 2) {
        p.drop = .2;
        p.jb = 0;
      } else if (p.coy > 0) jump(p, -500);
      else if (p.air < inv[13]) {
        p.air++;
        jump(p, -470);
        ring(p.x, b.bottom, CYAN, .9);
      }
    }
    if (!dn(i, '2') && b.velocity.y < -180) b.Vy(-180);
    if (ht(i, '3') && p.cdD <= 0) {
      let ax = (Rr ? 1 : 0) - (L ? 1 : 0), ay = (D ? 1 : 0) - (U ? 1 : 0);
      if (!ax && !ay) ax = p.face;
      const l = M.hypot(ax, ay);
      b.Ag(false).Vl(ax / l * 560, ay / l * 560);
      p.dT = .16;
      p.iv = Mmax(p.iv, .26);
      p.cdD = 2.2 * cdm;
      sfx('dash');
      burst(p.x, p.y, pc, 10);
      ring(p.x, p.y, pc, 1);
    }
  }
  p.ft -= dt;
  if ((dn(i, '1') || near(p.x, p.y, 400)) && p.ft <= 0) {
    p.ft = .25 / cad / (1 + flow * .4);
    const ay = U ? -1 : D && !g ? 1 : 0;
    fire(p, M.atan2(ay, ay && !hz ? 0 : p.face));
  }
  if (flow && R() < dt * 25) fxi(p.texture.key, p.x, p.y, hsv(now / 400), 1, 1.4, 280).Fx(p.flipX);
  const tk = (i ? 'q' : 's') + (!g ? 3 : hz ? 1 + (now / 90 | 0) % 2 : 0);
  if (p.texture.key != tk) p.Tx(tk);
  p.Fx(p.face < 0);
  p.hp = Mmin(mhp, p.hp + (.8 * inv[8] + (p.iv < -3 ? 2 : 0)) * dt);
  if (inv[11] && !p.sh && (p.shT -= dt) <= 0) {
    p.sh = 1;
    ring(p.x, p.y, CYAN, 1.2);
  }
  if (dn(i, '3')) {
    // cargando: al completar la carga, anillo y chispas mientras se mantiene
    if ((p.ch += dt) > .5 && p.cdS <= 0) {
      if (p.ch - dt <= .5) ring(p.x, p.y, pc, 1.5);
      burst(p.x, p.y, pc, 1);
    }
  } else {
    if (p.ch > .5 && p.cdS <= 0) special(p);
    p.ch = 0;
  }
  p.shi.Vi(p.sh).Po(p.x, p.y).Al(.4 + .2 * Msin(now / 150));
  p.dr.fe((d, j) => {
    const a = now / 500 + j * 6.28 / p.dr.length;
    const f = Mmin(1, dt * 12);
    d.x += (p.x + Mcos(a) * 30 - d.x) * f;
    d.y += (p.y - 28 + Msin(a) * 8 - d.y) * f;
  });
  if (p.dr.length && (p.dtm -= dt) <= 0) {
    p.dtm = .5;
    p.dr.fe((d) => {
      const e = near(d.x, d.y, 380);
      if (e) {
        shoot(d.x, d.y, ang(d, e), 560, atk * .6, 1, CYAN, 3, 3, .8);
        flash(d.x, d.y, CYAN, .3);
      }
    });
  }
  if (inv[14] && (p.cr -= dt) <= 0) {
    p.cr = 8 / (inv[14] + 1);
    if (near(p.x, p.y, 600)) {
      shoot(p.x, p.y - 12, -M.PI / 2 + rnd(-.6, .6), 380, atk * 2, 1, GOLD, 4, 4, 2.5).rk = 1;
      sfx('dash');
    }
  }
  if (p.y > WH + 30) {
    p.body.reset(p.sx, p.sy - 8);
    hurtP(p, 10, p.x, 1);
    p.iv = 1;
  }
  if (ht(i, '5') || ht(i, '6')) use(p);
  p.Al(p.iv > 0 && p.dT <= 0 && (now / 70 | 0) % 2 ? .35 : 1);
}

function jump(p, v) {
  p.body.Vy(v);
  p.coy = p.jb = 0;
  sfx('jump');
  burst(p.x, p.body.bottom, STEEL, 4);
}

function fire(p, a) {
  const e = near(p.x, p.y, 420);
  if (e) {
    const d = Phaser.Math.Angle.Wrap(ang(p, e) - a);
    if (ab(d) < .52) a += cl(d, -.21, .21);
  }
  const n = 1 + inv[10], cr = R() < crit, c = cr ? GOLD : p.i ? PINK : LIME, x = p.x + Mcos(a) * 14, y = p.y + 1 + Msin(a) * 12;
  for (let k = 0; k < n; k++) {
    const b = shoot(x, y, a + (k % 2 ? 1 : -1) * M.ceil(k / 2) * .12, 640, atk * (k ? .6 : 1) * (cr ? 2 : 1) * (pp ? 1.25 : 1), 1, c, cr ? 7 : 5, cr ? 3 : 2, .7);
    b.nb = 1;
    b.cr = cr;
  }
  flash(x, y, c, .35);
  sfx('sh');
  if (inv[19] && ++p.shots % Mmax(4, 9 - inv[19]) == 0) laser(p, a);
}

function shoot(x, y, a, sp, dmg, own, c, sx, sy, life) {
  const b = bullets.get(x, y, 'px');
  b.enableBody(true, x, y, true, true);
  b.Sc(sx, sy).setRotation(a).Ti(c).Dp(5).Al(1).Bm(1);
  b.body.Ag(false).Vl(Mcos(a) * sp, Msin(a) * sp);
  Object.assign(b, { own, dmg, life, pr: own ? inv[6] : 0, hit: [], gh: 0, kbk: 0, cr: 0, rk: 0, nb: 0, c });
  return b;
}

function kb(b, q) {
  b.Db(true, true);
  if (!q) burst(b.x, b.y, b.c, 3);
}

function upB(b, dt) {
  if ((b.life -= dt) <= 0) return kb(b, 1);
  if (b.rk) {
    const e = near(b.x, b.y, 600), v = b.body.velocity;
    if (e) {
      const a = M.atan2(v.y, v.x), na = a + cl(Phaser.Math.Angle.Wrap(ang(b, e) - a), -6 * dt, 6 * dt);
      v.setToPolar(na, 400);
      b.rotation = na;
    }
    if (R() < dt * 60) burst(b.x, b.y, GOLD, 1);
  }
  if (b.gh && R() < dt * 60) burst(b.x, b.y + rnd(-18, 18), b.c, 1);
}

function special(p) {
  p.cdS = 7 * cdm;
  const c = p.i ? PINK : LIME, b = shoot(p.x + p.face * 16, p.y, p.face > 0 ? 0 : M.PI, 520, atk * 4, 1, c, 7, 22, .6);
  b.gh = 1;
  b.pr = 999;
  b.kbk = 320;
  sfx('sp');
  zp(1.03);
  sk(160, .01);
  ring(p.x, p.y, 0xffffff, 2.5);
  flash(p.x, p.y, c, 2);
}

function laser(p, a) {
  const c = Mcos(a), s = Msin(a), x2 = p.x + c * 900, y2 = p.y + s * 900;
  fx.push([p.x, p.y, x2, y2, RED, 22, .2], [p.x, p.y, x2, y2, 0xffffff, 8, .2]);
  foes().fe((e) => {
    const dx = e.x - p.x, dy = e.y - p.y;
    if (dx * c + dy * s > 0 && ab(dx * s - dy * c) < 11 + e.body.height / 2) dmgE(e, atk * 3 * inv[19], 1, p.x, 200);
  });
  sk(160, .012);
  sfx('las');
}

function hurtP(p, d, sx, pit) {
  if (demo || p.dn || (!pit && (p.iv > 0 || p.dT > 0))) return;
  if (!pit) {
    if (R() < dodge) {
      pop(p.x, p.y - 34, 'UNDO', 12, CYAN);
      p.iv = .4;
      return;
    }
    if (p.sh) {
      p.sh = 0;
      p.shT = Mmax(2.5, 8.5 - 1.5 * inv[11]);
      p.iv = .5;
      ring(p.x, p.y, CYAN, 2.4);
      burst(p.x, p.y, CYAN, 14);
      sfx('crit');
      return;
    }
  }
  d = Mmax(1, M.round(d));
  p.hp -= d;
  if (flow) {
    flow = 0;
    pop(p.x, p.y - 50, 'FLOW PERDIDO', 12, RED);
  }
  p.iv = 1;
  num(p.x, p.y - 20, d, 0, RED);
  sfx('hurt');
  sk(140, .012);
  burst(p.x, p.y, RED, 8);
  stop(.06);
  if (!pit) p.body.Vl(sg(p.x - sx || 1) * 180, -220);
  if (p.hp <= 0) {
    if (inv[18]) {
      inv[18]--;
      if (ii[18]) ii[18][1].Te(inv[18] > 1 ? 'X' + inv[18] : inv[18] ? '' : '0');
      p.hp = mhp / 2;
      p.iv = 2;
      live(bullets).fe((b) => !b.own && kb(b));
      boom(p.x, p.y, 200, 0, 200, 9);
      pop(400, 200, 'ROLLBACK!', 36, CYAN, 1, 900, 1);
      cam.flash(300, 62, 197, 255);
    } else down(p);
  }
}

function down(p) {
  p.dn = 1;
  slow = .6;
  p.hp = 0;
  p.body.enable = false;
  p.Vi(0);
  p.shi.Vi(0);
  p.dr.fe((d) => d.Vi(0));
  p.tb = SA.image(p.sx, p.sy + 4, 's18').Dp(4);
  p.tl = txt(p.sx, p.sy - 34, 'OFFLINE', 12, RED, .5, .5).Dp(7);
  ring(p.x, p.y, RED, 3);
  burst(p.x, p.y, p.i ? PINK : LIME, 30);
  sfx('boom');
  sk(300, .02);
  if (P.every((q) => !q || q.dn)) {
    dc(450, tbc);
    dc(2300, over);
  }
}

function tbc() {
  if (mode != 'PLAY' || P.some((q) => q && !q.dn)) return;
  stop(9);
  mus(-1);
  if (cx) cx.sepia();
  sfx('boss');
  [rect(-400, 530, 380, 36, 0x3a2810), txt(-210, 548, '<< TO BE CONTINUED', 18, 0xf0e0b0, .5, .5)].fe((o) => {
    o.sf(33);
    tw(o, { x: o.x + 420, duration: 350, ease: 'Back.easeOut' });
  });
}

function revive(p, f) {
  p.dn = 0;
  p.hp = mhp * f;
  p.iv = 1.5;
  p.rv = 0;
  p.body.enable = true;
  p.body.reset(p.tb.x, p.tb.y - 12);
  p.Vi(1);
  p.dr.fe((d) => d.Vi(1));
  p.tb.destroy();
  p.tl.destroy();
  ring(p.x, p.y, GREEN, 2.5);
  if (mode == 'PLAY') pop(p.x, p.y - 40, 'REVIVIDO', 12, GREEN);
}

// ---------------------------------------------------------------- enemigos
const unl = () => [0, 1, 2, 3, 4, 6].filter((k) => EN[k][7] <= lvl);

function spawnE(k, x, y, el) {
  const t = EN[k], e = enemies.get(x, y, 's' + t[0]), f = k == 1 || k == 2 || k > 7;
  el = el || 0;
  e.Tx('s' + t[0]).enableBody(true, x, y, true, true);
  e.Sc((k == 4 ? 2 : 1) * (el == 1 ? 1.25 : 1)).Dp(3).Al(1).Fx(0).Ct();
  e.body.Ag(!f).Sz(e.frame.width * .8, e.frame.height * .8).Vl(0, 0).Mv(600, 700).Cw(false);
  const hm = (1 + .16 * (lvl - 1)) * (1 + .08 * itc) * (1 + .5 * lp) * (two ? 1.5 : 1) * [1, 3, 1.8, 2][el], dm = (1 + .1 * (lvl - 1)) * (1 + .4 * lp) * (el == 3 ? 2 : 1);
  Object.assign(e, {
    k, el, hp: t[1] * hm, mhp: t[1] * hm, dm, dmg: t[2] * dm, sp: t[3] * Mmin(1.35, 1 + .015 * (lvl - 1)) * (el == 2 ? 1.5 : 1),
    fly: f, t: rnd(.5, 2), st: 0, w: 0, fl: 0, far: 0, stun: 0, sp0: .45, ph: R() * 9, boss: 0, ent: 0, tn: ELC[el], p2: 0, ci: 0, lf: 0,
  });
  if (el) e.Ti(e.tn);
  return e;
}

function refund(e) {
  dirCr += EN[e.k][4] * (e.el ? 3 : 1);
  e.hp = 0;
  e.Db(true, true);
}

function director(dt) {
  dirCr += dt * (.35 + .17 * lvl) * (1 + .3 * lp) * (two ? 1.5 : 1) * (stg ? .5 : 1) * (inc == 1 ? 2 : 1);
  if ((dirT -= dt) > 0) return;
  dirT = rnd(.8, 2.2);
  const n = foes().length, cap = Mmin(34 + 8 * lp, 2 + 2 * lvl) * (two ? 1.3 : 1) * (stg ? .2 * stage : 1), k = pick(unl()), c = EN[k][4];
  let el = lvl >= 4 && dirCr >= c * 3 && R() < Mmin(.5, .12 + .02 * lvl + .1 * lp) ? ri(1, 3) : 0;
  for (let j = 0; j < (k < 2 ? 3 : 1) && n + j < cap && dirCr >= c * (el ? 3 : 1); j++) {
    const f = k == 1 || k == 2;
    let x, y;
    if (stg) {
      x = 2400 + rnd(40, 760);
      y = f ? rnd(150, 350) : 200;
    } else {
      const s = cam.scrollX < 200 || R() < .7 ? 1 : -1, cc = ((s > 0 ? cam.scrollX + W : cam.scrollX) / T | 0) + s * ri(2, 6);
      if (cc < 1 || cc > 73 || top[cc] > 21) return;
      x = cc * T + 16;
      y = f ? rnd(3 * T, (top[cc] - 2) * T) : top[cc] * T - 16;
    }
    spawnE(k, x, y, el);
    dirCr -= c * (el ? 3 : 1);
    el = 0;
  }
}

function walk(e, dx, dy, ad, dt) {
  const b = e.body;
  b.Vx(ad > 6 ? sg(dx) * e.sp : 0);
  if (b.blocked.down) {
    if (b.blocked.left || b.blocked.right) b.Vy(-430);
    else if (dy < -70 && ad < 160 && R() < dt * 1.2) b.Vy(-520);
  }
}

function upE(e, dt) {
  const b = e.body, k = e.k;
  if (e.fl > 0 && (e.fl -= dt) <= 0) e.tn ? e.Ti(e.tn) : e.Ct();
  if (e.sp0 > 0) {
    e.Al(R() < .5 ? .25 : 1).Tf(pick([CYAN, PINK, 0xffffff]));
    b.Vl(0, 0);
    if ((e.sp0 -= dt) <= 0) {
      e.Al(1);
      e.tn ? e.Ti(e.tn) : e.Ct();
      ring(e.x, e.y, EN[k][8], 1.2);
    }
    return;
  }
  if (e.boss) return upBoss(e, dt);
  if (e.el && R() < dt * 1.5) fxi('s42', e.x + rnd(-24, 24), e.y - 24, e.tn, 1, 2, 700).Bm(0);
  const p = nearP(e.x, e.y);
  if (!p) return b.Vx(0);
  const dx = p.x - e.x, dy = p.y - e.y, ad = ab(dx), sx = sg(dx) || 1;
  if (k < 2) e.Tx('s' + (EN[k][0] + (tn / (k ? 80 : 150) | 0) % 2));
  e.Fx(dx < 0);
  if (e.stun > 0) {
    e.stun -= dt;
    return;
  }
  e.t -= dt;
  if (k == 1 || k == 2) {
    const tx = k == 2 ? p.x - sx * 220 : p.x, ty = k == 2 ? p.y - 120 : p.y, a = M.atan2(ty - e.y, tx - e.x), s = dist(e.x, e.y, tx, ty) < 20 ? 0 : e.sp;
    const f = Mmin(1, dt * 3);
    b.velocity.x += (Mcos(a) * s - b.velocity.x) * f;
    b.velocity.y += (Msin(a) * s + Msin(tn / 300 + e.ph) * 60 - b.velocity.y) * f;
    if (k == 2) {
      if (e.t <= 0 && ad < 320 && ab(dy) < 320) {
        e.t = e.el == 2 ? 1.44 : 2.4;
        e.w = e.fl = .35;
        e.Tf(0xffffff);
      }
      if (e.w > 0 && (e.w -= dt) <= 0) {
        shoot(e.x, e.y, ang(e, p), 210, 10 * e.dm, 0, RED, 4, 4, 3);
        flash(e.x, e.y, RED, .5);
      }
    }
  } else if (k == 3) {
    if (e.w > 0) {
      b.Vx(0);
      e.Tf((e.w * 20 | 0) % 2 ? 0xffffff : RED);
      if ((e.w -= dt) <= 0) {
        e.hp = 0;
        e.Db(true, true);
        boom(e.x, e.y, 80, 22 * e.dm, 40, 9);
      }
    } else {
      walk(e, dx, dy, ad, dt);
      if (ad < 56 && ab(dy) < 56) e.w = .55;
    }
  } else if (k == 6) {
    if (e.st == 1) {
      b.Vx(0);
      e.x += rnd(-1.5, 1.5);
      if (e.t <= 0) {
        e.st = 2;
        e.t = .6;
        e.cd = sx;
      }
    } else if (e.st == 2) {
      b.Vx(e.cd * 460);
      if ((tn / 40 | 0) % 2) burst(e.x, e.y + 6, GOLD, 1);
      if (e.t <= 0 || b.blocked.left || b.blocked.right) {
        e.st = 3;
        e.t = .8;
      }
    } else if (e.st == 3) {
      b.Vx(0);
      if (e.t <= 0) {
        e.st = 0;
        e.t = e.el == 2 ? 1.8 : 3;
      }
    } else {
      walk(e, dx, dy, ad, dt);
      if (e.t <= 0 && ab(dy) < 36 && ad < 320) {
        e.st = 1;
        e.t = e.fl = .5;
        e.Tf(0xffffff);
      }
    }
  } else walk(e, dx, dy, ad, dt);
  if (ad > 1300 && !stg) {
    if ((e.far += dt) > 4) refund(e);
  } else e.far = 0;
  if (e.y > WH + 40) refund(e);
}

function hitE(b, e) {
  b.hit.push(e);
  if (b.rk) {
    boom(b.x, b.y, 44, 0, atk * 2, 0);
    return kb(b, 1);
  }
  dmgE(e, b.dmg, b.cr, b.x - b.body.velocity.x, b.kbk, b.nb, 0);
  if (!b.gh && b.pr-- <= 0) kb(b);
}

function dmgE(e, d, cr, sx, kv, nb, dep) {
  if (e.hp <= 0 || e.sp0 > 0 || e.ent > 0) return;
  d = Mmax(1, M.round(d * (e.vul > 0 ? 2 : 1)));
  e.hp -= d;
  // los jefes reciben golpes mas seguido de lo que dura el destello: solo destellan a veces, para que se vea su dibujo
  if (!e.boss || R() < .15) {
    e.Tf(0xffffff);
    e.fl = .06;
  }
  if (!e.boss) {
    e.x += (sg(e.x - sx) || 1) * 3;
    e.body.velocity.x *= .2;
    e.stun = Mmax(e.stun, .12);
  }
  num(e.x, e.y - 16, d, cr);
  sfx(cr ? 'crit' : 'hit');
  if (kv && !e.boss) {
    e.body.Vl((sg(e.x - sx) || 1) * kv, -140);
    e.stun = .25;
  }
  if (nb && inv[12] && R() < Mmin(.6, .15 * inv[12])) chain(e);
  if (e.hp <= 0) killE(e, dep || 0);
  else if (cr) burst(e.x, e.y, GOLD, 5);
}

function killE(e, dep) {
  const t = EN[e.k], m = e.el ? 3 : 1;
  e.hp = 0;
  kills++;
  debt += t[5] * m;
  combo++;
  comboT = 2.2;
  if (combo == 10) flow = 1;
  if (combo == 10 && !demo) {
    pop(400, 150, 'FLOW!', 54, WHITE, 1, 900, 1);
    rays(400, 150, WHITE, 1);
    cam.flash(150, 255, 255, 255);
    zp(1.08);
    ka(6, .05);
  }
  score += M.round(t[5] * 10 * stage * m * (1 + combo / 25));
  drop(e.x, e.y, M.ceil(t[6] * (1 + .06 * (lvl - 1)) * m) * (1 + flow + (inc == 1)));
  burst(e.x, e.y, t[8], e.boss ? 60 : 14);
  burst(e.x, e.y, 0xffffff, 5);
  ring(e.x, e.y, t[8], e.boss ? 5 : 1.4);
  fxi(e.texture.key, e.x, e.y, 0xffffff, e.scaleX, e.scaleX * 1.9, 200).Fx(e.flipX);
  sfx('kill');
  if (inv[5]) P.fe((p) => p && !p.dn && (p.hp = Mmin(mhp, p.hp + 2 * inv[5])));
  if (inv[9] && dep < 3) fq.push([e.x, e.y, dep + 1]);
  if (e.el == 3) for (let k = 0; k < 6; k++) shoot(e.x, e.y, k * 1.047, 180, 10 * e.dm, 0, PURPLE, 4, 4, 2.5);
  if (e.k == 4) {
    const x = e.x, y = e.y;
    dc(20, () => [-1, 1].fe((s) => {
      const m2 = spawnE(5, x + s * 10, y - 8);
      m2.sp0 = 0;
      m2.body.Vl(s * 160, -300);
    }));
  }
  if (e.el) {
    stop(.05);
    zp(1.04);
    sk(90, .006);
    pop(e.x, e.y - 30, 'ELITE X3', 12, e.tn);
  }
  if ([25, 50, 100].includes(combo) && !demo) {
    pop(400, 170, ['ON FIRE!', 'IMPARABLE!', '10X DEV!'][[25, 50, 100].indexOf(combo)], 36, GOLD, 1, 800, 1);
    cam.flash(120, 255, 255, 255);
    ka(3, .05);
  }
  if (e.boss) bossDie(e);
  e.Db(true, true);
}

function chain(e0) {
  let a = e0;
  foes().filter((e) => e != e0 && dist(e.x, e.y, e0.x, e0.y) < 160).slice(0, 3).fe((e) => {
    let x = a.x, y = a.y;
    for (let k = 1; k < 5; k++) {
      const nx = a.x + (e.x - a.x) * k / 4 + (k < 4 ? rnd(-10, 10) : 0), ny = a.y + (e.y - a.y) * k / 4 + (k < 4 ? rnd(-10, 10) : 0);
      fx.push([x, y, nx, ny, PURPLE, 3, .15]);
      x = nx;
      y = ny;
    }
    dmgE(e, atk * .7, 0, a.x, 0);
    a = e;
  });
}

function boom(x, y, r, dP, dE, dep) {
  ring(x, y, GOLD, r / 26);
  fxi('glow', x, y, RED, r / 40, r / 14, 260);
  burst(x, y, GOLD, 14);
  burst(x, y, RED, 8);
  sfx('boom');
  sk(120, .008);
  if (dP) P.fe((p) => p && !p.dn && dist(p.x, p.y, x, y) < r && hurtP(p, dP, x));
  if (dE) foes().fe((e) => dist(e.x, e.y, x, y) < r && dmgE(e, dE, 0, x, 160, 0, dep));
}

// monedas
function drop(x, y, v) {
  const n = Mmin(v, v > 20 ? 8 : 4);
  for (let k = 0; k < n; k++) {
    const c = SA.image(x, y, 's16').Dp(2);
    Object.assign(c, { v: (v / n | 0) + (k < v % n ? 1 : 0), vx: rnd(-170, 170), vy: rnd(-420, -220), t: 0, ph: R() * 9 });
    cn.push(c);
  }
}
function coinsUp(dt) {
  cpT -= dt;
  cn = cn.filter((c) => {
    c.t += dt;
    c.scaleX = .2 + ab(Mcos(tn / 110 + c.ph));
    if (c.t < .4) {
      c.vy += 1100 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      return 1;
    }
    const p = nearP(c.x, c.y);
    if (!p) return 1;
    const a = ang(c, p), s = 250 + c.t * 900;
    c.x += Mcos(a) * s * dt;
    c.y += Msin(a) * s * dt;
    if (dist(c.x, c.y, p.x, p.y) > 18) return 1;
    coins += c.v;
    cpn = cpT > 0 ? Mmin(12, cpn + 1) : 0;
    cpT = .35;
    sfx('coin');
    burst(c.x, c.y, GOLD, 3);
    if (cB) cB = 1.6;
    c.destroy();
    return 0;
  });
}

// ---------------------------------------------------------------- jefes
function startBoss() {
  stg = 1;
  if (!demo) pop(400, 200, 'DEPLOY INICIADO', 30, RED, 1, 900);
  sfx('boss');
  sk(500, .01);
  cam.flash(250, 255, 60, 60);
  SP.world.setBounds(2400, 0, W, WH, true, true, false, false);
  cam.setBounds(2400, 0, W, WH);
  // escenario limpio para la presentacion del jefe: sin reembolso (antes los bugs del nivel reaparecian en la arena) y unos segundos de gracia
  foes().fe((e) => {
    e.hp = 0;
    e.Db(true, true);
  });
  dirCr = -3;
  P.fe((p) => {
    if (p && p.x < 2420) p.dn ? p.tb.Po(dep.x - 60, dep.y - 10) : p.body.reset(dep.x - 60, dep.y - 30);
  });
  // la arena queda cerrada por dos paredes laser que laten
  [2400, 3194].fe((x) => {
    const w = rect(x, 0, 6, WH, RED, .8).Dp(5);
    tw(w, { alpha: .2, yoyo: true, repeat: -1, duration: 300 });
    lv.push(w);
  });
  // el jefe final es DEADLINE (sprite 43); desde el segundo loop cada jefe trae a otro de escolta
  const k = fin ? 8 : 7 + (stage - 1) % 3, ni = fin ? 3 : k - 7, e = boss = mkBoss(k, fin ? 1.5 : 1);
  if (fin) {
    e.fin = 1;
    e.Tx('s43').Sc(1.3).body.Sz(70, 80);
  }
  // sala de guerra: una pantalla gigante al fondo de la arena con el jefe en vivo y la severidad del incidente
  lv.push(rect(2460, 200, 580, 230, 0, .6).Dp(-8.6), SA.image(2750, 320, e.texture.key).Sc(2.2).Ti(RED).Al(.25).Dp(-8.5), txt(2750, 214, 'INCIDENTE SEV-1', 18, RED, .5).Dp(-8.5));
  mus(fin ? 6 : k == 8 ? 4 : 3, 2.5);
  tone(110, 2.5, 'sawtooth', .06, 1760);
  dc(900, () => poseB(e, ni));
  // la escolta (solo en loops, nunca en la pelea final) espera quieta y hace su propia pose despues
  if (lp && !fin) {
    const o = mkBoss(7 + stage % 3, .5);
    o.ent = 3;
    dc(2700, () => poseB(o, o.k - 7));
  }
}

// DEADLINE vuela como el monitor (k = 8) pero con sus propios ataques, en ciclo
function dln(e, p, ph, dt) {
  // AGOTADO despues del tiempo detenido: no ataca (y dmgE le hace dano doble)
  if ((e.vul -= dt) > 0) return;
  if (!e.st) {
    if (e.t <= 0) {
      e.st = 1 + e.ci++ % 3;
      e.lt = e.n = 0;
    }
    return;
  }
  e.lt += dt;
  if (e.st == 1) {
    // las 12 horas: una bala por hora, apuntada al jugador
    if (e.lt > e.n * .12 * ph) {
      const a = e.n++ * .5236 - 1.57, x = e.x + Mcos(a) * 80, y = e.y + Msin(a) * 80;
      shoot(x, y, M.atan2(p.y - y, p.x - x), 250, 10 * e.dm, 0, PURPLE, 5, 5, 4);
      sfx('tic');
      if (e.n > 11) {
        e.st = 0;
        e.t = 1.2 * ph;
      }
    }
  } else if (e.st == 2) {
    // la manecilla: un laser que da una vuelta completa; se cruza con el dash
    const a = e.lt * 1.8 / ph + 1.57, c = Mcos(a), s = Msin(a), on = e.lt > .7;
    G.lineStyle(on ? 14 : 2, on ? RED : WHITE, .8).lineBetween(e.x, e.y, e.x + c * 800, e.y + s * 800);
    if (on) P.fe((q) => q && !q.dn && (q.x - e.x) * c + (q.y - e.y) * s > 0 && ab((q.x - e.x) * s - (q.y - e.y) * c) < 16 && hurtP(q, 14 * e.dm, e.x));
    if (e.lt > .7 + 3.5 * ph) {
      e.st = 0;
      e.t = 1.2 * ph;
    }
  } else {
    // TIEMPO DETENIDO (estilo ZA WARUDO): el mundo se congela en negativo, pero DEADLINE sigue: clava una manecilla
    // por hora en una cupula sobre el jugador, apuntandole, y deja dos libres para escapar. Al volver el tiempo salen
    // todas juntas. Si sobrevives, DEADLINE queda AGOTADO 3 s: no ataca y recibe dano doble
    e.st = 0;
    e.t = 2 * ph;
    stop(2.3);
    if (cx) cx.negative();
    // la musica se pausa y al volver sigue desde el mismo paso (como una cinta en pausa)
    const m = mSong, g = ri(0, 10), x = p.x, y = p.y;
    let n = 0, w = 0;
    mSong = -1;
    dc(2300, () => boss && (mSong = m, mNext = 0, e.vul = 3, pop(400, 200, 'AGOTADO: DANO X2', 24, GOLD, 1, 1200)));
    pop(400, 200, 'TIEMPO DETENIDO', 30, WHITE, 1, 1100);
    sfx('boss');
    zf = (dt) => {
      if ((w += dt) > .15 && n < 12) {
        w = 0;
        // cupula sobre el jugador (el suelo tapa la mitad de abajo), con un hueco de dos manecillas
        if (n < g || n > g + 1) {
          const a = M.PI + n * .2856;
          shoot(x + Mcos(a) * 150, y + Msin(a) * 150, a + M.PI, 300, 12 * e.dm, 0, RED, 13, 4, 2);
          sfx('tic');
        }
        n++;
      }
    };
  }
}

// la pose: el mundo se congela 1.6 s con el jefe en primer plano
function poseB(e, ni) {
  if (!(e.hp > 0) || mode != 'PLAY' || demo) return;
  {
    stop(1.6);
    zt = 1.3;
    camPt.set(e.x, e.y);
    if (cx) cx.hue(150);
    rays(e.x, e.y, GOLD);
    tw(e, { angle: -14, scale: e.scale * 1.3, duration: 160, hold: 1200, yoyo: true, ease: 'Back.easeOut' });
    const bd = rect(0, 376, W, 84, 0, .75).sf(32);
    dc(1600, () => bd.destroy());
    pop(400, 404, '[ ' + BN[ni] + ' ]', 30, GOLD, 1, 1300);
    pop(400, 440, 'STAND: [' + BST[ni] + ']', 12, WHITE, 1, 1300);
    for (let i = 0; i < 9; i++) dc(i * 140, () => fxi('s42', e.x + rnd(-110, 110), e.y + rnd(-70, 50), GREEN, 2, 3.5, 900).Bm(0));
    sfx('boom');
    tone(58, 1.5, 'sawtooth', .16, 30);
  }
}

function mkBoss(k, f) {
  const e = spawnE(k, 3e3 - f * 200, k == 7 ? 120 : -100);
  e.sp0 = 0;
  e.boss = e.ent = e.t = 1;
  e.hp = e.mhp = EN[k][1] * f * (1 + .5 * (stage - 1)) * (1 + .05 * (lvl - 1)) * (1 + .08 * itc) * (two ? 1.6 : 1);
  e.dmg = 20 * (e.dm *= .3 + stage * .25); // el primer jefe pega bastante menos
  e.body.Cw(true);
  if (k == 7) e.body.Sz(80, 58).Of(8, 14);
  else if (k == 8) e.body.Sz(72, 56).Of(8, 4);
  return e;
}

function upBoss(e, dt) {
  // el jefe final alterna entre los ataques del monitor y los del ojo
  // en los loops y en el final los jefes atacan mas rapido y usan desde el inicio los patrones de fase 2
  const p = nearP(e.x, e.y), b = e.body, k = e.k, p2 = e.hp < e.mhp * .4, ph = (p2 ? .65 : 1) / (1 + .3 * (lp + fin)) * (stage > 1 ? 1 : 1.3);
  if (p2 && !e.p2) {
    e.p2 = 1;
    e.tn = 0xff8080;
    e.Ti(e.tn);
    pop(400, 170, e.fin ? 'HORAS EXTRA' : 'FASE 2', 36, RED, 1, 900);
    stop(.35);
    if (cx) cx.negative();
    sk(400, .015);
    sfx('boss');
  }
  if (k > 7) {
    b.Vy((cam.scrollY + (k > 8 ? 250 : 150 + demo * 200) + Msin(tn / 500) * 20 - e.y) * 3);
    if (p && (k > 8 || e.st != 2 || e.lt < .7)) b.Vx(cl((p.x + (k > 8 ? Msin(tn / 900) * 220 : 0) - e.x) * 2, -90, 90));
    else b.Vx(0);
  }
  // DEADLINE no se queda quieto: recorre la arena en un ocho, mas rapido en HORAS EXTRA
  if (e.fin) b.Vl((2800 + Msin(tn / 900 / ph) * 330 - e.x) * 2, (cam.scrollY + 230 + Msin(tn / 450 / ph) * 110 - e.y) * 2);
  if (e.ent > 0) {
    if ((e.ent -= dt) <= 0) sk(250, .015);
    return;
  }
  if (!p) return;
  const dx = p.x - e.x;
  e.t -= dt;
  if (e.fin) return dln(e, p, ph, dt);
  if (k == 7) {
    if (e.st == 0) {
      b.Vx(sg(dx) * 45);
      if (e.t <= 0) {
        e.a = 'ABAC'[e.ci++ % 4];
        e.st = 1;
        e.t = (e.a == 'C' ? .6 : .5) * ph;
      }
    } else if (e.st == 1) {
      b.Vx(0);
      e.x += rnd(-2, 2);
      e.Tf((e.t * 16 | 0) % 2 ? 0xffffff : RED);
      if (e.t <= 0) {
        e.tn ? e.Ti(e.tn) : e.Ct();
        if (e.a == 'A') {
          b.Vl(cl(dx / 1.1, -300, 300), -620);
          e.st = 2;
        } else if (e.a == 'B') {
          const n = ph < 1 ? 7 : 5;
          [-30, 30].fe((o) => {
            const a0 = M.atan2(p.y - e.y + 20, dx - o);
            for (let j = 0; j < n; j++) shoot(e.x + o, e.y - 20, a0 + (j / (n - 1) - .5) * .87, 230, 10 * e.dm, 0, RED, 5, 5, 3);
          });
          flash(e.x, e.y - 20, RED, 2);
          sfx('sp');
          e.st = 0;
          e.t = 1.1 * ph;
        } else {
          e.st = 3;
          e.t = 1.4;
          e.cd = sg(dx) || 1;
        }
      }
    } else if (e.st == 2) {
      if (b.blocked.down && e.t < -.2) {
        sk(300, .02);
        sfx('boom');
        burst(e.x, b.bottom, STEEL, 20);
        ring(e.x, b.bottom, GOLD, 3);
        [-1, 1].fe((s) => shoot(e.x + s * 40, b.bottom - 12, s > 0 ? 0 : M.PI, 300, 16 * e.dm, 0, GOLD, 8, 12, 1.2));
        b.Vx(0);
        e.st = 0;
        e.t = 1.1 * ph;
      }
    } else {
      b.Vx(e.cd * 420);
      burst(e.x - e.cd * 40, b.bottom, STEEL, 1);
      if (e.t <= 0 || (e.t < 1.3 && (b.blocked.left || b.blocked.right))) {
        b.Vx(0);
        sk(200, .012);
        e.st = 0;
        e.t = 2.1 * ph;
      }
    }
  } else if (k == 9) {
    // CODE REVIEW: dos anillos de comentarios y despues una espiral de nitpicks
    if (e.st) {
      if ((e.lt -= dt) <= 0) {
        e.lt = .07;
        shoot(e.x, e.y, e.a += .45, 190, 9 * e.dm, 0, PINK, 4, 4, 4);
        if (!--e.n) {
          e.st = 0;
          e.t = 1.5 * ph;
        }
      }
    } else if (e.t <= 0) {
      sfx('sp');
      flash(e.x, e.y, PINK, 3);
      if (e.ci++ % 3 < 2) {
        const n = ph < 1 ? 16 : 11;
        for (let j = 0; j < n; j++) shoot(e.x, e.y, j * 6.283 / n + e.ci, 165, 10 * e.dm, 0, PINK, 5, 5, 4.5);
        e.t = 1.5 * ph;
      } else {
        e.st = 1;
        e.n = ph < 1 ? 42 : 28;
        e.lt = 0;
        e.a = ang(e, p);
      }
    }
  } else if (e.st == 0) {
    if (e.t <= 0) {
      e.a = 'ABAC'[e.ci++ % 4];
      if (e.a == 'A') {
        e.st = 1;
        e.n = ph < 1 ? 18 : 9;
        e.lt = 0;
      } else if (e.a == 'B') {
        e.st = 2;
        e.lt = 0;
        e.lf = 0;
      } else {
        for (let j = 0; j < 3; j++) spawnE(1, e.x + rnd(-60, 60), e.y + 40).sp0 = .3;
        sfx('boss');
        e.t = 1.1 * ph;
      }
    }
  } else if (e.st == 1) {
    if ((e.lt -= dt) <= 0) {
      e.lt = .08;
      const j = --e.n % 9;
      if (j == 8 || e.n == (ph < 1 ? 17 : 8)) e.g = ri(0, 7);
      if (j != e.g && j != e.g + 1) shoot(2444 + j * 89, cam.scrollY - 10, M.PI / 2, 260, 10 * e.dm, 0, CYAN, 5, 5, 3);
      sfx('tic');
      if (!e.n) {
        e.st = 0;
        e.t = 1.1 * ph;
      }
    }
  } else {
    const gy = 18 * T, y0 = e.y + 30;
    if ((e.lt += dt) < .7) e.lx = e.x;
    if (e.lt < .95) G.lineStyle(2, RED, (e.lt * 20 | 0) % 2 ? 1 : .4).lineBetween(e.lx, y0, e.lx, gy);
    else if (e.lt < 1.45) {
      if (!e.lf) {
        e.lf = 1;
        sfx('las');
        sk(500, .01);
      }
      if (ph < 1) e.lx += sg(p.x - e.lx) * 120 * dt;
      G.fillStyle(CYAN, .55).fillRect(e.lx - 20, y0, 40, gy - y0).fillStyle(0xffffff, 1).fillRect(e.lx - 7, y0, 14, gy - y0);
      burst(e.lx, gy, CYAN, 2);
      P.fe((q) => q && !q.dn && ab(q.x - e.lx) < 27 && hurtP(q, 22 * e.dm, e.lx));
    } else {
      e.st = 0;
      e.t = 1.1 * ph;
    }
  }
}

function bossDie(e) {
  const o = foes().find((x) => x.boss);
  if (o) return boss = o;
  stg = 2;
  boss = 0;
  won = fin;
  slow = .7;
  zp(1.12);
  score += 500 * stage * (won ? 10 : 1);
  const x = e.x, y = e.y;
  for (let k = 0; k < 7; k++) {
    dc(k * 130, () => {
      const c = pick([RED, GOLD, 0xffffff, CYAN]), px = x + rnd(-50, 50), py = y + rnd(-40, 40);
      burst(px, py, c, 30);
      ring(px, py, c, 3);
      sfx('boom');
      sk(200, .02);
    });
  }
  foes().fe((o) => {
    if (o != e) {
      burst(o.x, o.y, EN[o.k][8], 10);
      o.hp = 0;
      o.Db(true, true);
    }
  });
  live(bullets).fe((b) => !b.own && kb(b));
  cam.flash(400, 255, 255, 255);
  emitter('cf').explode(80, x, y - 40);
  dc(500, () => {
    rays(400, 260, GOLD, 1);
    pop(400, 260, won ? 'PROD IS UP!' : 'DEPLOY EXITOSO', 42, GOLD, 1, 1500, 1);
    ka(5, .1, .08);
  });
  mus(-1);
  dc(2600, won ? over : openG);
}

// ---------------------------------------------------------------- gacha
function rollItem(m) {
  const r = R(), q = pity >= 9 ? 2 : m == 1 ? (r < .2 ? 2 : 1) : r < .05 ? 2 : r < .3 || m == 2 ? 1 : 0;
  pity = q == 2 ? 0 : pity + 1;
  let id;
  do id = [0, 9, 16][q] + (R() * [9, 7, 4][q] | 0); while (id == 18 && inv[18] >= 2);
  return id;
}

function give(id, q) {
  itc++;
  if (!inv[id]++) {
    ord.push(id);
    const x = 20 + (ord.length - 1) * 34;
    ii[id] = [hud(SA.image(x, 582, 's' + (22 + id))), hud(txt(x + 10, 566, '', 6, WHITE, .5))];
    if (!demo) tw(ii[id][0], { scale: { from: 3, to: 1 }, duration: 400, ease: 'Back.easeOut' });
  }
  ii[id][1].Te(inv[id] > 1 ? 'X' + inv[id] : '');
  recalc();
  if (id == 4) P.fe((p) => p && (p.hp = Mmin(mhp, p.hp + 25)));
  if (id == 11) P.fe((p) => p && (p.sh = 1));
  if (!q && mode == 'PLAY') {
    const c = RAR[rarOf(id)];
    cd1.Te(IT[id * 2] + (inv[id] > 1 ? ' X' + inv[id] : '')).Ti(c).Sc(0);
    cd2.Te(IT[id * 2 + 1]);
    tw(cd1, { scale: 1, duration: 300, ease: 'Back.easeOut' });
    cardT = 2.5;
  }
}

// rafaga de efectos al revelar un item (en el mundo o en el panel)
function reveal(x, y, id, h) {
  const q = rarOf(id), c = RAR[q];
  ring(x, y, c, q ? 4 : 2.5, h);
  burst(x, y, c, 20 + q * 20, h);
  fan(q);
  if (q) {
    rays(x, y, c, h);
    pop(x, y - (h ? 0 : 60), q > 1 ? 'LEGENDARIO!' : 'RARO!', q > 1 ? 30 : 18, c, h, 900, q > 1);
  }
  if (q > 1) {
    emitter('cf', h).explode(70, x, y);
    cam.flash(300, 255, 182, 46);
    zp(1.08);
    sk(250, .01);
  }
}

function roll(t, id) {
  const ic = SA.image(t.x, t.y - 48, 's22').Dp(7).Sc(2);
  lv.push(ic);
  rolls.push([ic, 0, 0, id]);
  t.busy = 1;
  t.rl = ic;
}
function upRolls(dt) {
  rolls = rolls.filter((r) => {
    const lg = rarOf(r[3]) > 1;
    if ((r[1] += dt) < (lg ? 2.2 : 1)) {
      if (r[1] >= r[2]) {
        r[2] = r[1] + .04 + r[1] * r[1] * (lg ? .03 : .2);
        r[0].Tx('s' + (22 + ri(0, 19)));
        tone(700 + 800 * r[1], .02, 0, .04);
      }
      if (r[1] > 1) {
        r[0].Sc(1 + r[1]);
        burst(r[0].x, r[0].y, GOLD, 1);
        sk(50, .003 * r[1]);
      }
      return 1;
    }
    const id = r[3], o = r[0];
    o.Tx('s' + (22 + id));
    reveal(o.x, o.y, id);
    give(id);
    terms.fe((t) => t.rl == o && (t.busy = 0));
    tw(o, { scale: 5, alpha: 0, duration: 700, ease: 'Cubic.easeIn', onComplete: () => o.destroy() });
    return 0;
  });
}

// pantalla de release tras el jefe
function openG() {
  if (demo) return go(-1);
  if (mode != 'PLAY') return;
  mode = 'GACHA';
  SP.pause();
  combo = 0;
  coT.Te('');
  cn.fe((c) => {
    coins += c.v;
    c.destroy();
  });
  cn = [];
  gT = rep = 0;
  gp = [];
  lt = [];
  mus(5);
  const add = (o, d) => (gp.push(o), o.sf(d || 31));
  add(rect(0, 0, W, H, 0, .75), 30);
  add(rect(20, 90, 760, 420, 0x111823, .97), 30);
  for (let k = 0; k < 56; k++) {
    let d = k * 2360 / 56, x, y;
    if (d < 760) x = 20 + d, y = 90;
    else if ((d -= 760) < 420) x = 780, y = 90 + d;
    else if ((d -= 420) < 760) x = 780 - d, y = 510;
    else x = 20, y = 510 - d + 760;
    lt.push(add(rect(x - 3, y - 3, 6, 6, GOLD)));
  }
  add(txt(400, 112, 'RELEASE V1.' + stage, 18, LIME, .5));
  add(txt(400, 140, '3 GRATIS + TIENDA', 12, STEEL, .5));
  const r0 = rollItem(0), r1 = rollItem(0), ids = [r0, r1, rollItem(rarOf(r0) + rarOf(r1) ? 0 : 2)];
  let tt = .1;
  gs = [0, 1, 2, 3].map((j) => {
    const x = 115 + j * 190;
    add(txt(x, 184, j < 3 ? 'GRATIS' : 'TIENDA', 12, j < 3 ? GREEN : GOLD, .5));
    const f = add(rect(x - 50, 206, 100, 100, 0x33415a), 30.2);
    add(rect(x - 46, 210, 92, 92, 0x0b0f14), 30.4);
    return [add(SA.image(x, 256, 's22').Sc(4).Vi(j < 3)), add(txt(x, 322, '', 12, WHITE, .5)), add(txt(x, 342, '', 6, STEEL, .5)), j < 3 ? tt += .7 + (rarOf(ids[j]) > 1) : -1, ids[j], 0, 0, f, x];
  });
  cT2 = add(txt(400, 390, '', 12, LIME, .5));
  add(txt(400, 414, stage > 2 ? '[START] LOOP  [B2] JEFE FINAL' : '[START] SIGUIENTE SERVER', 12, stage > 2 ? GOLD : WHITE, .5));
  pT = add(txt(400, 450, '', 12, PURPLE, .5));
  cT3 = add(txt(400, 474, '', 18, GOLD, .5));
}
function upGacha(dt) {
  gT += dt;
  const sp = gs.some((s) => s[3] > gT);
  lt.fe((d, k) => d.Ti((k + (gT * (sp ? 24 : 8) | 0)) % 4 ? 0x33415a : sp ? pick([GOLD, PINK, CYAN]) : GOLD));
  gs.fe((s) => {
    if (s[3] < 0) return;
    if (gT < s[3]) {
      if (rarOf(s[4]) > 1 && s[3] - gT < 1) {
        s[0].Sc(6 - (s[3] - gT) * 2);
        burst(s[8], 256, GOLD, 1, 1);
      }
      if ((gT * 18 | 0) != s[6]) {
        s[6] = gT * 18 | 0;
        s[0].Tx('s' + (22 + ri(0, 19))).Vi(1);
        sfx('tic');
      }
    } else if (!s[5]) {
      s[5] = 1;
      const id = s[4], c = RAR[rarOf(id)];
      s[0].Tx('s' + (22 + id));
      s[1].Te(IT[id * 2]).Ti(c);
      s[2].Te(IT[id * 2 + 1]);
      s[7].Ti(c);
      tw(s[0], { scale: { from: 6, to: 4 }, duration: 300, ease: 'Back.easeOut' });
      reveal(s[8], 256, id, 1);
      give(id, 1);
    }
  });
  const pr = 18 + 5 * paid, s3 = gs[3];
  cT2.Te('[B1] NPM INSTALL $' + pr).Ti(coins < pr ? RED : LIME);
  pT.Te('LEGENDARIO EN: ' + (10 - pity));
  cT3.Te('$' + coins);
  rep -= dt;
  if ((any('1') || ((dn(0, '1') || dn(1, '1')) && rep < 0)) && !(s3[3] > gT)) {
    rep = .35;
    if (coins < pr) sfx('err');
    else {
      coins -= pr;
      paid++;
      s3[4] = rollItem(0);
      s3[3] = gT + .5 + (rarOf(s3[4]) > 1);
      s3[5] = 0;
      s3[1].Te('');
      s3[2].Te('');
    }
  }
  if (gT > 3 && !sp && stage > 2 && any('2')) fin = 1;
  if (gT > 3 && !sp && (fin || hk('START1') || hk('START2') || performance.now() - lastIn > 2e4)) closeG();
}
function closeG() {
  gp.fe((o) => o.destroy());
  mode = 'PLAY';
  SP.resume();
  stage++;
  buildStage();
}

// ---------------------------------------------------------------- pausa, fin y titulo
function pause() {
  mode = 'PAUSE';
  SP.pause();
  pR = held.START1 || held.START2;
  stH = 0;
  pO = [];
  const add = (o) => (pO.push(o), o.sf(40));
  add(rect(0, 0, W, H, 0, .8));
  add(txt(400, 40, 'PAUSA', 36, LIME, .5));
  CT.fe((t, k) => add(txt(400, 84 + k * 14, t, 12, STEEL, .5)));
  add(txt(400, 560, 'START: SEGUIR  MANTENER: SALIR', 12, WHITE, .5));
}
function upPause(dt) {
  if (held.START1 || held.START2) {
    if ((stH += dt) > 2) go(-1);
  } else if (stH > 0 || kq.some((c) => c[0] == 'S')) {
    if (pR) pR = 0;
    else {
      pO.fe((o) => o.destroy());
      mode = 'PLAY';
      SP.resume();
    }
    stH = 0;
  }
}

function over() {
  if (mode != 'PLAY' || (!won && P.some((q) => q && !q.dn))) return;
  mode = 'OVER';
  SP.pause();
  oT = 0;
  mus(-1);
  if (!won) for (let i = 4; i--;) tone(kn(i) / 2, .8, 'triangle', .12, 0, (3 - i) * .3);
  const add = (o) => o.sf(40);
  add(rect(0, 0, W, H, 0, .8));
  add(txt(400, 46, won ? 'PROD IS UP! GANASTE' : 'PROD SIGUE CAIDO', 36, won ? GREEN : RED, .5));
  add(txt(400, 90, 'RANGO: ' + RK[won ? 6 : Mmin(6, stage - 1)], 18, GOLD, .5));
  ['SERVER ' + stage + '  BUGS ' + kills, 'DEUDA LV ' + lvl + '  ITEMS ' + itc, 'PTS ' + score].fe((s, k) => add(txt(400, 130 + k * 26, s, 12, k > 1 ? GOLD : WHITE, .5)));
  oq = score > 0 && (hi.length < 5 || score > hi[hi.length - 1][1]);
  if (oq || won) dc(1200, () => {
    if (cx) cx.reset();
    emitter('cf', 1).Dp(41).explode(90, 400, 300);
    ka(6, .08, .08);
  });
  nm = [0, 0, 0];
  nc = 0;
  nT = add(txt(400, 300, '', 36, LIME, .5));
  oL = [0, 1, 2, 3, 4, 5, 6].map((k) => add(txt(400, 270 + k * 24, '', k ? 12 : 18, WHITE, .5)));
  if (oq) oL[0].Te(two ? 'RECORD DE EQUIPO!' : 'NUEVO RECORD!').Ti(GOLD);
  else table(-1);
}
const AZ = FONT_CHARS.slice(1, 37);
function table(nw) {
  nT.Te('');
  oL[0].Te('RECORDS').Ti(GOLD);
  for (let k = 0; k < 5; k++) {
    const r = hi[k];
    oL[k + 1].Te(r ? k + 1 + '. ' + r[0] + '   ' + r[1] + '   SRV ' + r[2] : k + 1 + '. ---').Ti(k == nw ? LIME : WHITE);
  }
  oL[6].Te('START: OTRA VEZ').Ti(STEEL);
}
function upOver(dt) {
  if ((oT += dt) < 1.2) return;
  if (oq) {
    if (any('U')) nm[nc] = (nm[nc] + 1) % 36;
    if (any('D')) nm[nc] = (nm[nc] + 35) % 36;
    if (any('L')) nc = Mmax(0, nc - 1);
    if (any('R')) nc = Mmin(2, nc + 1);
    nT.Te(nm.map((c, k) => (k == nc && (oT * 4 | 0) % 2 ? '_' : AZ[c])).join(' '));
    oL[6].Te('JOYSTICK: LETRA  B1: OK').Ti(STEEL);
    if (any('1') || hk('START1') || hk('START2') || performance.now() - lastIn > 3e4) {
      const r = [nm.map((c) => AZ[c]).join(''), score, stage];
      hi.push(r);
      hi.sort((a, b) => b[1] - a[1]);
      hi = hi.slice(0, 5);
      saveHi();
      oq = 0;
      oT = 1.2;
      table(hi.indexOf(r));
    }
  } else {
    if (hk('START1')) go(0);
    else if (hk('START2')) go(1);
    else if (oT > 20) go(-1);
  }
}

function go(i) {
  startWith = i;
  mus(-1);
  SP.world.timeScale = 1;
  S.scene.restart();
  return 1;
}

function mkTitle() {
  tO = [];
  const a = (o) => (tO.push(o), o.sf(30));
  a(rect(0, 0, W, H, 0, .3));
  a(txt(406, 66, 'PROD IS', 78, 0x2456c9, .5));
  a(txt(400, 60, 'PROD IS', 78, WHITE, .5));
  g1 = a(txt(400, 150, 'DOWN', 132, CYAN, .5)).Al(.85);
  g2 = a(txt(400, 150, 'DOWN', 132, PINK, .5)).Al(.85);
  a(txt(400, 150, 'DOWN', 132, RED, .5));
  a(txt(400, 300, 'ROGUELIKE DE GUARDIA - 1-2 JUGADORES', 12, LIME, .5));
  prm = a(txt(400, 420, 'PULSA START', 18, WHITE, .5));
  tl = [0, 1, 2, 3, 4, 5].map((k) => a(txt(400, 466 + k * 18, '', 12, k ? WHITE : GOLD, .5)));
}
function titleUp(dt) {
  demoT += dt;
  const now = tn;
  if ((now / 90 | 0) % 5 == 0) {
    g1.Po(400 + rnd(-9, 9), 150 + rnd(-3, 3));
    g2.Po(400 + rnd(-9, 9), 150 + rnd(-3, 3));
  }
  prm.Vi((now / 400 | 0) % 2);
  const k = (demoT / 5 | 0) % 3;
  const L = k == 0 ? ['RECORDS'].concat([0, 1, 2, 3, 4].map((j) => (hi[j] ? j + 1 + '. ' + hi[j][0] + '   ' + hi[j][1] + '   SRV ' + hi[j][2] : j + 1 + '. ---')))
    : k == 1 ? ['CONTROLES', 'JOYSTICK: MOVER/APUNTAR', ...CT, 'START: ENTRAR / PAUSA']
    : ['VIERNES 23:59', 'ALGUIEN HIZO PUSH A MAIN.', 'PROD SE CAYO. ESTAS DE GUARDIA.', 'CADA BUG MUERTO SUBE LA DEUDA.'];
  tl.fe((t, j) => t.Te(L[j]));
  for (const c of kq) {
    if (c == 'START1' || c[1] == '1') return go(0);
    if (c == 'START2' || c[1] == '2') return go(1);
  }
  if (demoT > 40 || !P[0]) go(-1);
}

function botUp(dt) {
  const p = P[0];
  if (!p) return;
  const r = (tn / 1800 | 0) % 2;
  held.P1_R = r;
  held.P1_L = 1 - r;
  held.P1_1 = 1;
  if (p.body.blocked.down && botJ <= 0 && R() < dt * 1.5) botJ = .4;
  held.P1_2 = (botJ -= dt) > 0 ? 1 : 0;
  held.P1_U = (tn / 700 | 0) % 3 ? 1 : 0;
  held.P1_3 = (tn / 1500 | 0) % 5 ? 0 : 1;
}

// ---------------------------------------------------------------- HUD
function mkHud() {
  hP = [0, 1].map((i) => {
    const c = i ? PINK : LIME, x = i ? W - 172 : 40;
    return [hud(txt(i ? W - 12 : 12, 10, 'P' + (i + 1), 12, c, i)), hud(rect(x, 10, 120, 10, 0x1b2430)), hud(rect(x, 10, 120, 10, GREEN)),
      hud(rect(i ? W - 192 : 166, 10, 10, 10, c)), hud(rect(i ? W - 206 : 180, 10, 10, 10, c)), hud(rect(i ? W - 220 : 194, 10, 10, 10, CYAN)),
      hud(txt(i ? W - 12 : 12, 10, 'P' + (i + 1) + ': PULSA START', 12, c, i))];
  });
  dT = hud(txt(400, 8, '', 12, LIME, .5));
  hud(rect(300, 24, 200, 8, 0x1b2430));
  dF = hud(rect(300, 24, 200, 8, LIME));
  dN = hud(txt(400, 38, '', 12, LIME, .5));
  hud(SA.image(20, 52, 's16').Sc(1.5));
  cT = hud(txt(32, 44, '', 18, GOLD));
  cB = 1;
  sT = hud(txt(12, 70, '', 12, STEEL));
  stT = hud(txt(12, 86, '', 12, STEEL));
  arw = hud(txt(786, 300, '>', 24, LIME, 1, .5));
  bN = hud(txt(400, 56, '', 12, RED, .5));
  bB = hud(rect(200, 70, 400, 10, 0x1b2430));
  bF = hud(rect(200, 70, 400, 10, RED));
  coT = hud(txt(788, 34, '', 18, GOLD, 1));
  cd1 = hud(txt(400, 512, '', 18, WHITE, .5, .5));
  cd2 = hud(txt(400, 534, '', 12, WHITE, .5));
  vig = hud(rect(0, 0, W, H, RED, 0)).Bm(1);
  cshow = 0;
}
function hudUp(dt) {
  const now = tn;
  lowHp = 0;
  hP.fe((h, i) => {
    const p = P[i];
    h.fe((o, j) => o.Vi(j < 6 ? !!p : !p && (now / 500 | 0) % 2));
    if (!p) return;
    const f = Mmax(0, p.hp) / mhp;
    if (f < .3 && !p.dn) lowHp = 1;
    h[2].Sc(60 * f, 5).Ti(f < .3 ? ((now / 150 | 0) % 2 ? RED : 0xffffff) : GREEN);
    h[3].Al(p.cdD <= 0 ? 1 : .2);
    h[4].Al(p.cdS <= 0 ? 1 : .2);
    h[5].Vi(!!p.sh);
  });
  vig.Al(lowHp ? .1 + .06 * Msin(now / 120) : 0);
  dT.Te('DEUDA TECNICA LV ' + lvl).Ti(lvCol(lvl));
  dF.Sc(100 * (debt % 18) / 18, 4).Ti(lvCol(lvl));
  dN.Te(lvName(lvl)).Ti(lvCol(lvl));
  if (cshow != coins) cshow += M.sign(coins - cshow) * Mmax(1, ab(coins - cshow) * .2 | 0);
  cT.Te('$' + cshow).Sc(cB);
  cB = Mmax(1, cB - dt * 3);
  sT.Te('PTS ' + score);
  stT.Te('SERVER ' + stage + ': ' + BIO[bio] + (inc ? ' + ' + INC[inc] : ''));
  arw.Vi(!stg && dep.x - cam.scrollX > W && (now / 300 | 0) % 2).setY(cl(dep.y - cam.scrollY - 40, 100, 560));
  [bN, bB, bF].fe((o) => o.Vi(!!boss));
  if (boss) {
    bN.Te(BN[boss.fin ? 3 : boss.k - 7]);
    bF.Sc(200 * Mmax(0, boss.hp) / boss.mhp, 5);
  }
  coT.Te(combo > 2 ? (flow ? 'FLOW X' : 'COMBO X') + combo : '').Sc(1 + Mmin(combo, 50) / 60 + (comboT > 2.1 ? .3 : 0));
  coT.Ti(flow ? hsv(now / 500) : GOLD);
  cd1.Vi(cardT > 0);
  cd2.Vi(cardT > 0);
  cardT -= dt;
}

// ---------------------------------------------------------------- trucos de desarrollo
function cheat(k) {
  if (!S || mode != 'PLAY' || demo) return;
  if (k == '4') pity = 9;
  if (k == 'n') {
    stage++;
    buildStage();
  }
  if (k == '5') coins += 100;
  if (k == '6') debt += 20;
  if (k == '7') P.fe((p) => p && !p.dn && p.body.reset(2450 + p.i * 30, 17 * T - 14));
  if (k == '8') give(ri(0, 19));
  if (k == '9') foes().fe((e) => dmgE(e, e.boss ? e.mhp / 4 : 9999, 0, e.x, 0));
  if (k == '0' && P[0]) hurtP(P[0], 30, P[0].x, 1);
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-root',
  backgroundColor: '#0b0f14',
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 1100 } } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { create, update },
});
// render offline de la musica para analizarla: cancion, intensidad forzada, segundos
// render offline de un efecto suelto, para comparar su nivel con la musica
if (DEV) window.__s = async (n) => {
  const rc = AC, oc = new OfflineAudioContext(1, 22050, 44100);
  initAudio(oc);
  SFX[n]();
  const b = await oc.startRendering();
  initAudio(rc);
  return b;
};
if (DEV) window.__r = async (song, I, secs) => {
  const rc = AC, oc = new OfflineAudioContext(2, 44100 * secs, 44100), ps = mSong;
  initAudio(oc);
  window.__n = [];
  mFI = I;
  mus(song);
  mNext = 0;
  music(secs);
  mSong = -1;
  const buf = await oc.startRendering();
  initAudio(rc);
  mFI = -1;
  mus(ps);
  return buf;
};
if (DEV) window.__t = () => ({ mode, demo, lowHp, mI, mSong, mStep, mfv, flow, stage, debt, lvl, coins, score, kills, combo, stg, inv: inv.join(''), P: P.map((p) => p && [p.x | 0, p.y | 0, p.hp | 0, p.dn]), boss: boss && [boss.hp | 0, boss.st, boss.x | 0, boss.y | 0], en: foes().length, paid, face: P[0] && P[0].face, pit: P[0] && [1, 2].some((d) => top[(P[0].x + d * 26) / T | 0] > 21), ne: P[0] && (() => { const e = near(P[0].x, P[0].y, 500); return e && [e.x - P[0].x | 0, e.y - P[0].y | 0, e.k]; })(), tm: P[0] && terms.filter((t) => t.k < 2 && t.n > 0).map((t) => t.x - P[0].x | 0).sort((a, b) => Math.abs(a) - Math.abs(b))[0] });
})();
