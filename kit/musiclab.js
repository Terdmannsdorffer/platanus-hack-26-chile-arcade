// Laboratorio de musica (solo desarrollo, con DEV = 1 en game.js).
// Renderiza una cancion offline y devuelve niveles, balance por bandas y un chequeo de armonia.
// Se inyecta en kit/harness.html desde un navegador automatizado:  await window.musicLab(cancion, intensidad, segundos)
window.musicLab = async (song, I, secs, draw) => {
  const buf = await window.__r(song, I, secs);
  const x = buf.getChannelData(0), sr = buf.sampleRate, N = 2048;
  const db = (v) => +(20 * Math.log10(v + 1e-9)).toFixed(1);
  let peak = 0, sum = 0;
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i]);
    if (a > peak) peak = a;
    sum += a * a;
  }
  // FFT radix-2
  const fft = (re, im) => {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        [re[i], re[j]] = [re[j], re[i]];
        [im[i], im[j]] = [im[j], im[i]];
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len;
      for (let i = 0; i < n; i += len) {
        for (let k = 0; k < len / 2; k++) {
          const c = Math.cos(ang * k), s = Math.sin(ang * k);
          const a = i + k, b = a + len / 2;
          const tr = re[b] * c - im[b] * s, ti = re[b] * s + im[b] * c;
          re[b] = re[a] - tr;
          im[b] = im[a] - ti;
          re[a] += tr;
          im[a] += ti;
        }
      }
    }
  };
  const edges = [0, 120, 500, 2000, 6000, 22050], bands = [0, 0, 0, 0, 0];
  const frames = [];
  for (let p = 0; p + N <= x.length; p += N / 2) {
    const re = new Float32Array(N), im = new Float32Array(N);
    for (let i = 0; i < N; i++) re[i] = x[p + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
    fft(re, im);
    const mag = new Float32Array(N / 2);
    for (let i = 0; i < N / 2; i++) {
      mag[i] = Math.hypot(re[i], im[i]) / N;
      const f = i * sr / N;
      for (let b = 0; b < 5; b++) if (f >= edges[b] && f < edges[b + 1]) bands[b] += mag[i] * mag[i];
    }
    frames.push(mag);
  }
  // RMS por segundo, para ver la dinamica
  const perSec = [];
  for (let s = 0; s < secs; s++) {
    let q = 0;
    for (let i = s * sr; i < (s + 1) * sr && i < x.length; i++) q += x[i] * x[i];
    perSec.push(db(Math.sqrt(q / sr)));
  }
  if (draw) {
    let cv = document.getElementById('lab');
    if (!cv) {
      cv = document.createElement('canvas');
      cv.id = 'lab';
      cv.style.cssText = 'position:fixed;left:0;top:0;z-index:9;background:#000';
      document.body.appendChild(cv);
    }
    cv.width = 800;
    cv.height = 600;
    const g = cv.getContext('2d'), Hh = 600, fmin = 40, fmax = 12000;
    g.fillStyle = '#000';
    g.fillRect(0, 0, 800, 600);
    for (let fx = 0; fx < 800; fx++) {
      const m = frames[Math.floor(fx / 800 * frames.length)];
      for (let y = 0; y < Hh; y += 2) {
        const f = fmin * Math.pow(fmax / fmin, 1 - y / Hh), bin = Math.min(N / 2 - 1, Math.round(f * N / sr));
        const v = Math.max(0, Math.min(1, (20 * Math.log10(m[bin] + 1e-9) + 90) / 60));
        g.fillStyle = `hsl(${260 - v * 260},100%,${v * 60}%)`;
        g.fillRect(fx, y, 1, 2);
      }
    }
    g.fillStyle = '#fff';
    g.font = '12px monospace';
    [55, 110, 220, 440, 880, 1760, 3520, 7040].forEach((f) => {
      const y = Hh * (1 - Math.log(f / fmin) / Math.log(fmax / fmin));
      g.fillRect(0, y, 6, 1);
      g.fillText(f + ' Hz', 8, y + 4);
    });
  }
  // chequeo de armonia: cada nota de melodia (L) contra el colchon (P) que suena en ese momento
  const notes = window.__n, pc = (f) => ((Math.round(12 * Math.log2(f / 440)) % 12) + 12) % 12;
  const pads = notes.filter((n) => n[2] === 'P'), clashes = [];
  let leadN = 0, chordTones = 0;
  notes.filter((n) => n[2] === 'L').forEach((n) => {
    const cur = pads.filter((p) => p[0] <= n[0] + 0.001).slice(-6).map((p) => pc(p[1]));
    const set = [...new Set(cur)], me = pc(n[1]);
    leadN++;
    if (set.includes(me)) chordTones++;
    // choque: la nota esta un semitono por encima de una nota del acorde y no pertenece a el
    else if (set.some((c) => (me - c + 12) % 12 === 1)) clashes.push([n[0], me, set.join('/')]);
  });
  const count = {};
  notes.forEach((n) => count[n[2]] = (count[n[2]] || 0) + 1);
  const rng = {};
  notes.forEach((n) => {
    const r = rng[n[2]] = rng[n[2]] || [1e9, 0];
    r[0] = Math.min(r[0], n[1]);
    r[1] = Math.max(r[1], n[1]);
  });
  return {
    peakDb: db(peak), rmsDb: db(Math.sqrt(sum / x.length)), crestDb: +(db(peak) - db(Math.sqrt(sum / x.length))).toFixed(1),
    bandsDb: bands.map((b) => db(Math.sqrt(b / frames.length))), perSec: perSec.join(' '),
    voices: count, rangeHz: rng, lead: leadN ? `${chordTones}/${leadN} notas del acorde` : 'sin melodia', clashes: clashes.slice(0, 12),
  };
};
