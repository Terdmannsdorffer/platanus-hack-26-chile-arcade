// Demo verificada del kit (se carga despues de kit/assets.js dentro de kit/harness.html?demo).
// Sirve de referencia para tres cosas faciles de hacer mal en Phaser 3.87:
//   1. tilemap creado desde un array usando un tileset generado por codigo,
//   2. plataformas de un solo sentido con Arcade Physics,
//   3. texto con la fuente bitmap 'f'.
// No forma parte del juego: copia de aqui los patrones que necesites.

const TILE = 32;
let layer, dropper, jumper, label;
const report = { ready: false };
window.__demo = report;

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-root',
  backgroundColor: '#0b0f14',
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 1100 } } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { create, update },
});

function create() {
  buildAssets(this);

  // --- todas las texturas 's0'..'s41' en una grilla
  let x = 16, y = 40, rowH = 0;
  for (let i = 0; i < SPR.length; i++) {
    const img = this.add.image(x, y, 's' + i).setOrigin(0);
    if (x + img.width > 780) {
      x = 16;
      y += rowH + 22;
      rowH = 0;
      img.setPosition(x, y);
    }
    this.add.bitmapText(x, y + img.height + 3, 'f', '' + i, 6).setTint(0x6b7c99);
    x += Math.max(img.width, 20) + 10;
    rowH = Math.max(rowH, img.height);
  }
  for (let i = 0; i < 4; i++) this.add.image(560 + i * 30, 300, 'q' + i).setOrigin(0);
  this.add.image(700, 300, 'ts').setOrigin(0);

  // --- fuente bitmap: el tamano es el ancho de celda (6 = x1, 12 = x2, 18 = x3)
  this.add.bitmapText(16, 8, 'f', 'PROD IS DOWN - KIT DE ASSETS', 18).setTint(0xe1ff00);
  label = this.add.bitmapText(16, 330, 'f', 'ABC', 12);
  report.textWidth = label.width; // esperado: 3 * 12 = 36

  // --- tilemap desde array. -1 = vacio. indice = bioma * 3 + tipo (0 borde, 1 relleno, 2 plataforma)
  const cols = 25, rows = 7, bio = 1;
  const data = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let t = -1;
      if (r === rows - 2) t = bio * 3;
      if (r === rows - 1) t = bio * 3 + 1;
      if (r === 2 && c >= 4 && c <= 10) t = bio * 3 + 2;
      row.push(t);
    }
    data.push(row);
  }
  const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
  layer = map.createLayer(0, map.addTilesetImage('tl', 'tl', TILE, TILE), 0, 600 - rows * TILE);
  // solidos: borde y relleno de los 3 biomas
  layer.setCollision([0, 1, 3, 4, 6, 7]);
  // un solo sentido: la plataforma solo colisiona por arriba
  layer.forEachTile((t) => {
    if (t.index % 3 === 2) t.setCollision(false, false, true, false, false);
  });

  // Un solo collider para todo. El processCallback deja pasar a quien viene desde abajo o esta "bajando".
  const oneWay = (sprite, tile) =>
    tile.index % 3 !== 2 || (!sprite.dropping && sprite.body.prev.y + sprite.body.height <= tile.getTop() + 1);

  dropper = this.physics.add.sprite(6 * TILE, 200, 's0'); // cae desde arriba: debe quedar sobre la plataforma
  jumper = this.physics.add.sprite(9 * TILE, 500, 'q0'); // salta desde abajo: debe atravesarla y aterrizar encima
  jumper.body.setVelocityY(-620);
  this.physics.add.collider([dropper, jumper], layer, null, oneWay);

  report.platformTop = layer.y + 2 * TILE;
  report.groundTop = layer.y + (rows - 2) * TILE;
  this.time.delayedCall(2500, () => {
    report.dropperBottom = Math.round(dropper.body.bottom);
    report.jumperBottom = Math.round(jumper.body.bottom);
    // tercera prueba: con dropping = true debe caer a traves de la plataforma hasta el suelo
    dropper.dropping = true;
    this.time.delayedCall(1500, () => {
      report.dropperAfterDrop = Math.round(dropper.body.bottom);
      report.ready = true;
    });
  });
}

function update() {}
