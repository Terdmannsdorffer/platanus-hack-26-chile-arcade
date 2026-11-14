// ---- KIT DE ASSETS (generado por kit/build.mjs a partir de kit/sprites.txt y kit/font.txt) ----
// No editar a mano: cambia el .txt y vuelve a correr `node kit/build.mjs`.
// Pegar este bloque completo dentro de la IIFE de game.js. Ver PLAN.md, seccion 5.
const PAL = "0b0f141b243033415a6b7c99e8f0ffe1ff007bd02b1e7a3cff6ec79c2a6eff5a4f8c1c2cffb62e3ec5ff2456c98b5cf6ffd2a87a4a2b";
const ATLAS = "ce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ20EE005D005D00ol3ce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ20EE0@5D1D005l00oce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ20EE00D500D500lo0ce02e5g0E50@EE0@mo3@mM3@mo30ZZ0PZZ2PZZGPZZ2PZZ2@EE0@1D1`3@100`3ca1276440@00ZPZX_XWXZQZ1241ca1276440@00ZPZX_XWXZTZ1214ca1223dl0o3o;lZP_PWPZ0Z0@00ca1223d0000l;oZ__SWPZ0Z0@00cc129f40D@mdod[mJmFmFmJd[do@m0Daa12ba40<@1ZXZnZWZ:Z2Z41ea121ed0X2Z:jZZ_ZNZZZZZRZ:2:8P0ca12bc430?0l2PZXZZ_ZWZZXX44oi14bac@0400110PZ:0XZZ0XoZ0XGZPXo:ZXZZZ@ZZZ4ZoZ0ZZZPZoZPZZZPZZZ0ZZZ@XZZ444X1440mk1423d@EE5YZZBFEETmo?IooCfeoTme?IoeCfooTmo5IoeCfooTEE5YZZ2EEE040:@0P240Z@0@40040ce12236DEYZioioioioYZYZYUYZYZYZTZD@gg1223a0000E1do0m?DEAZZYZJj[VZZYZJJEVZZYEIZZVZZEE566120c5Xn^^nX881223d1A1Zj[WZ820aa12234P:ZZjj_Z[jZZZFED5gg1212doo_ZZJEEVZZi^JZZFEUZZFEEZZZYZJZZVZZYZZZZEE5gg12120EEEEEEZFUEEIEEZFEEEEEEEEEEEEZFEEEEEEEEEEEE5gg1212doo_ZZJVI4A400000000000000000000000000000000880234h@@0@@Po;XZ6Z:QZJXZ2X:0880200c0l3`?0o0lo3`?0o0l3030088021ca0Z0XY0ZnPZPRZXZ:ZZ2Z:0880234c0`3`3`30XZ200PZ:10DEE188020060000`30?3l`c3`?0`00000880204a`o0l?looojo_nooo`o0l?08802306EEE0053@13D<050O10DEE1880200d000<0`30oo3?`33`00?`o08802ahcZZ:NgRo_Pg2h_0h20^0020880203c0`3030Z2XZR^ZZZZXZ2X:08802034X:022Plo83<j03<`03<`o388020edXZRooj[_nj[ooRo;P_0P2088020af000`<3`?0o?0oP<cZ002008802063P:0X20Z2PZ:XZ2l?`o0`o0880204aPZ02P8<P23X`?:0P802X:088020hcZZ:3`0o30?0`3033<?SZZ2880213d0?0P2PZ:hj2ZZPF:XZ288088020ac00``3?l`??ooooooZZZZZ288020a4XPR^ZjZZZZ:ZZ0Z20:00008802104locooOmeGOmoocc?lo3cc0880200400co33`00<0030`0o?0000";
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
