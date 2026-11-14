// Bot de prueba para medir el ritmo de una partida (solo desarrollo, con DEV = 1 en game.js).
// Juega como un novato razonable: encara al enemigo mas cercano, dispara, se aleja saltando si lo tiene encima,
// compra en las terminales que encuentra, activa el deploy y pelea con el jefe.
// Es una funcion de Playwright: se ejecuta con el servidor de kit/serve.mjs levantado, pasandole la pagina.
// Devuelve una linea cada 10 s con vida, deuda, enemigos eliminados, creditos, items y etapa.
async (page) => {
  const SECS = 170;
  await page.goto('http://localhost:3111/kit/harness.html');
  await page.waitForTimeout(1800);
  if ((await page.evaluate(() => window.__t())).demo) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
  }
  const log = await runBot(page, SECS);
  log.push('errores: ' + JSON.stringify(await page.evaluate(() => window.__errors)));
  return log;

  async function runBot(page, secs) {
    const k = page.keyboard;
    const held = {};
    const set = async (key, on) => {
      if (!!held[key] === !!on) return;
      held[key] = on;
      await (on ? k.down(key) : k.up(key));
    };
    const st = () => page.evaluate(() => window.__t());
    const log = [];
    const t0 = Date.now();
    let lastLog = 0, jumpUntil = 0, lastX = 0, stuck = 0, hpMin = 100, fleeUntil = 0, fleeDir = 0;
    await set('u', true);
    while (Date.now() - t0 < secs * 1000) {
      const t = await st(), now = Date.now(), el = (now - t0) / 1000;
      if (el - lastLog >= 10 || t.mode === 'OVER') {
        lastLog = el;
        log.push(`${Math.round(el)}s ${t.mode} etapa${t.stage}${t.stg ? ' JEFE' + (t.boss ? t.boss[0] : '') : ''} hp${t.P[0] ? t.P[0][2] : '-'} lv${t.lvl} kills${t.kills} $${t.coins} items${[...t.inv].reduce((a, c) => a + +c, 0)} pagadas${t.paid} en${t.en} flow${t.flow} I${t.mI}`);
      }
      if (t.mode === 'OVER') break;
      if (t.mode === 'GACHA') {
        for (const key of ['d', 'a', 'i', 'w']) await set(key, false);
        await page.waitForTimeout(4200);
        for (let i = 0; i < 4; i++) {
          await k.press('u');
          await page.waitForTimeout(900);
        }
        await k.press('Enter');
        await page.waitForTimeout(1200);
        continue;
      }
      const p = t.P[0];
      if (!p || p[3]) {
        await page.waitForTimeout(100);
        continue;
      }
      hpMin = Math.min(hpMin, p[2]);
      const ne = t.boss ? [t.boss[2] - p[0], t.boss[3] - p[1], 9] : t.ne;
      let dir = 0, up = false, jump = now < jumpUntil;
      if (now < fleeUntil) dir = fleeDir; // alejarse medio segundo y volver a encarar
      else if (ne && Math.abs(ne[0]) < 55 && Math.abs(ne[1]) < 45) {
        fleeDir = -(Math.sign(ne[0]) || 1);
        if (p[0] < 80 || fleeDir < 0) fleeDir = 1; // nunca huye hacia atras: podria caer a un pozo
        fleeUntil = now + 550;
        jumpUntil = now + 300;
        dir = fleeDir;
        jump = true;
      } else if (ne && Math.abs(ne[0]) < 330 && Math.abs(ne[1]) < 170) {
        const sx = Math.sign(ne[0]) || 1;
        if (t.face !== sx) dir = sx; // un toque para encararlo
        else if (Math.abs(ne[0]) < 60 && !t.boss) dir = 0;
        if (ne[1] < -70 && Math.abs(ne[0]) < 90) up = true;
        if (Math.abs(ne[0]) < 75 && Math.abs(ne[1]) < 50 && !jump) {
          jumpUntil = now + 320;
          jump = true;
        }
        if (t.boss && Math.random() < 0.06 && !jump) {
          jumpUntil = now + 300;
          jump = true;
        }
      } else if (t.tm !== undefined && Math.abs(t.tm) < 420 && t.coins >= 18 + 5 * t.paid && !t.stg) {
        if (Math.abs(t.tm) < 20) await k.press('k');
        else dir = Math.sign(t.tm);
      } else if (!t.stg) {
        dir = 1;
        if (p[0] > 2785) {
          dir = 0;
          await k.press('k');
        }
      }
      // pozo por delante (el bot solo los cruza hacia la derecha): saltar largo
      if (t.pit && dir > 0 && !jump) {
        jumpUntil = now + 420;
        jump = true;
      }
      // atascado contra una pared o un escalon: saltar
      if (dir && Math.abs(p[0] - lastX) < 2) {
        if (++stuck > 2 && !jump) {
          jumpUntil = now + 380;
          jump = true;
          stuck = 0;
        }
      } else stuck = 0;
      lastX = p[0];
      await set('d', dir > 0);
      await set('a', dir < 0);
      await set('w', up);
      await set('i', jump);
      await page.waitForTimeout(70);
    }
    for (const key of Object.keys(held)) await set(key, false);
    log.push('vida minima: ' + hpMin);
    return log;
  }
}
