// dgq/styles.js: the same video, printed in a different style, so the three style directions can be compared on the
// real animation (Neel, 3 Oct: "Can I see the opening done in each style"). STYLE comes from the page URL (?style=B),
// which `node render.mjs --style=B ...` sets.
//   A  ink and watercolour on graph paper (the house style; nothing here changes it)
//   B  risograph: each frame is separated into four inks (navy, fluorescent pink, teal, yellow), each ink is printed
//      as a rotated halftone dot screen, slightly misregistered, and the inks overprint (multiply) on cream stock
//   C  cut paper: each frame is reduced to a set of paper colours; each paper sits at a depth (background low, lettering
//      high), raised layers cast soft shadows down-right and catch light on their top-left edges, paper fibres show,
//      and the whole thing sits in a wooden shadow box behind a cream mat with a torn edge
// Shapes are painted flat in B and C (no watercolour bleed or hatching), so the separations stay clean.

const STYLE = ((typeof location !== 'undefined' && new URLSearchParams(location.search).get('style')) || 'A').toUpperCase();

// paint() options per style (core.js paint() calls this first)
function STYLE_PAINT(o) {
  if (STYLE === 'B') return { ...o, bleed: Math.min(o.bleed ?? .1, .03), tex: (o.tex ?? .4) * .4, hatch: o.hatch ? { ...o.hatch, w: (o.hatch.w || 1) * 1.4 } : o.hatch };
  if (STYLE === 'C') {
    // translucent fills are watercolour shadows and blooms: paper makes its own shadows, so drop them
    if (o.fill && !o.wash && (o.fillOp ?? 170) < 110) return { ...o, fill: null, hatch: null, ink: null };
    return { ...o, bleed: 0, tex: 0, border: 0, hatch: null, ink: null };
  }
  return o;
}

// postFX(c, t): called by core.js composite() after the letters are drawn; returns true if it produced the final frame
// (then the house grain and vignette are skipped: each style brings its own paper).
function postFX(c, t) {
  if (STYLE === 'B') { risoFX(c, t); return true; }
  if (STYLE === 'C') { paperFX(c, t); return true; }
  return false;
}

// small deterministic noise helpers (static textures are built once)
function _hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function _smoothNoise(w, h, cell, seed) {   // value noise, bilinear, in [0, 1]
  const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh), out = new Float32Array(w * h);
  for (let i = 0; i < g.length; i++) g[i] = _hash2(i % gw + seed * 13.1, Math.floor(i / gw) + seed * 7.7);
  for (let y = 0; y < h; y++) {
    const gy = y / cell, y0 = Math.floor(gy), fy = gy - y0, sy = fy * fy * (3 - 2 * fy);
    for (let x = 0; x < w; x++) {
      const gx = x / cell, x0 = Math.floor(gx), fx = gx - x0, sx = fx * fx * (3 - 2 * fx), i = y0 * gw + x0;
      out[y * w + x] = (g[i] * (1 - sx) + g[i + 1] * sx) * (1 - sy) + (g[i + gw] * (1 - sx) + g[i + gw + 1] * sx) * sy;
    }
  }
  return out;
}

// ---------------- B: risograph ----------------
const RISO = {
  paper: [244, 237, 222],
  cell: 6.5,                    // halftone cell, px at 1080p
  margin: 34,                   // the printed panel sits inside a paper margin
  pageSrc: [242, 232, 210],     // the house page colour, which becomes...
  backdrop: [196, 184, 176],    // ...a warm grey-mauve tint in the panel
  soft: .09,                    // dot edge softness (in coverage units)
  inks: [
    { name: 'navy', rgb: [36, 46, 98], ang: 45, off: [0, 0] },
    { name: 'pink', rgb: [255, 72, 176], ang: 75, off: [4, -2] },
    { name: 'teal', rgb: [0, 131, 138], ang: 15, off: [-3, 3] },
    { name: 'yellow', rgb: [255, 222, 0], ang: 0, off: [2, 4] },
  ],
};
let _riso = null;
function risoInit() {
  const N = 32, nI = RISO.inks.length, P = RISO.paper.map(v => v / 255), K = RISO.inks.map(i => i.rgb.map(v => v / 255));
  const lut = new Float32Array(N * N * N * nI), lam = .015;
  const Lp = .3 * P[0] + .59 * P[1] + .11 * P[2], Ln = .3 * K[0][0] + .59 * K[0][1] + .11 * K[0][2];
  const a = new Float32Array(nI), m = new Float32Array(nI * 3), f = new Float32Array(3);
  for (let r = 0; r < N; r++) for (let g = 0; g < N; g++) for (let b = 0; b < N; b++) {
    const c = [(r + .5) / N, (g + .5) / N, (b + .5) / N], L = .3 * c[0] + .59 * c[1] + .11 * c[2];
    a.fill(0); a[0] = clamp((Lp - L) / (Lp - Ln) * .6);
    for (let it = 0; it < 140; it++) {
      for (let ch = 0; ch < 3; ch++) { let prod = P[ch]; for (let j = 0; j < nI; j++) { const mj = 1 - a[j] * (1 - K[j][ch]); m[j * 3 + ch] = mj; prod *= mj; } f[ch] = prod; }
      const lr = it < 60 ? 1.2 : .5;
      for (let j = 0; j < nI; j++) {
        let gsum = lam * (j === 0 ? .6 : 1);   // a small price on ink, cheapest for navy, so darks go navy
        for (let ch = 0; ch < 3; ch++) gsum += 2 * (f[ch] - c[ch]) * (-f[ch] * (1 - K[j][ch]) / Math.max(m[j * 3 + ch], 1e-3));
        a[j] = clamp(a[j] - lr * gsum);
      }
    }
    const q = ((r * N + g) * N + b) * nI; for (let j = 0; j < nI; j++) lut[q + j] = a[j];
  }
  // halftone threshold maps: T(x, y) in [0, 1] = the fraction of a round-dot cell that is inked before this point is
  // (so a coverage a inks exactly fraction a of every cell); one rotated screen per ink
  const T = RISO.inks.map(ink => {
    const th = ink.ang * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th), s = RISO.cell, map = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = (x * cs + y * sn) / s, v = (-x * sn + y * cs) / s, fu = u - Math.floor(u) - .5, fv = v - Math.floor(v) - .5, rr = Math.hypot(fu, fv);
      map[y * W + x] = rr <= .5 ? Math.PI * rr * rr : Math.min(1, Math.PI * rr * rr - 4 * (rr * rr * Math.acos(.5 / rr) - .5 * Math.sqrt(rr * rr - .25)));
    }
    return map;
  });
  // ink density varies across the sheet (riso drums print unevenly), and the paper has a little tooth
  const dens = RISO.inks.map((_, j) => _smoothNoise(W, H, 90, 3 + j)), tooth = _smoothNoise(W, H, 3, 9);
  _riso = { lut, T, dens, tooth, N, K };
}
function risoFX(c, t) {
  if (!_riso) risoInit();
  const { lut, T, dens, tooth, N, K } = _riso, nI = RISO.inks.length, sh = 8 - Math.log2(N);
  const img = c.getImageData(0, 0, W, H), d = img.data, src = new Uint8ClampedArray(d), P = RISO.paper;
  const fr = Math.floor(t * 12), offs = RISO.inks.map((ink, j) => [ink.off[0] + Math.round((_hash2(fr, j) - .5) * 2), ink.off[1] + Math.round((_hash2(j, fr) - .5) * 2)]);
  const soft = RISO.soft, M = RISO.margin, BG = RISO.backdrop, PS = RISO.pageSrc;
  // the backdrop: anything close to the blank page colour is printed as a warm grey-mauve tint instead (a moody panel)
  const tint = (si, out) => {
    const r = src[si], g = src[si + 1], b = src[si + 2], dd = Math.sqrt((r - PS[0]) ** 2 + (g - PS[1]) ** 2 + (b - PS[2]) ** 2), w = Math.max(0, 1 - dd / 46) * .72;
    out[0] = r + (BG[0] - r) * w; out[1] = g + (BG[1] - g) * w; out[2] = b + (BG[2] - b) * w;
    // the dark night page (2020) prints as a dotted navy field, so things drawn on it (tiles, lamp light) stay solid
    const dk = Math.sqrt((r - 30) ** 2 + (g - 27) ** 2 + (b - 34) ** 2);
    if (dk < 12) { out[0] = 92; out[1] = 96; out[2] = 128; }
  };
  const cc = [0, 0, 0];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    let mr = 1, mg = 1, mb = 1;
    const inPanel = x >= M && y >= M && x < W - M && y < H - M;
    for (let j = 0; j < nI && inPanel; j++) {
      const sx = Math.min(W - 1, Math.max(0, x - offs[j][0])), sy = Math.min(H - 1, Math.max(0, y - offs[j][1])), si = (sy * W + sx) * 4;
      tint(si, cc);
      const q = (((cc[0] >> sh) * N + (cc[1] >> sh)) * N + (cc[2] >> sh)) * nI;
      // near-black (type, ink lines, pupils) prints as solid navy, the darkest ink, as riso printers do with type
      const L = (.3 * cc[0] + .59 * cc[1] + .11 * cc[2]) / 255, kd = L < .3 ? 1 : L < .42 ? 1 - (L - .3) / .12 : 0;
      const a0 = j === 0 ? lut[q] + (1 - lut[q]) * kd : lut[q + j] * (1 - kd);
      const a = a0 * (.8 + .32 * dens[j][p]);
      if (a < .015) continue;
      const on = Math.min(1, Math.max(0, (a - T[j][p]) / soft + .5)) * (a > .97 ? 1 : .96);
      const k = K[j]; mr *= 1 - on * (1 - k[0]); mg *= 1 - on * (1 - k[1]); mb *= 1 - on * (1 - k[2]);
    }
    const tt = .955 + .07 * tooth[p], i4 = p * 4;
    d[i4] = P[0] * mr * tt; d[i4 + 1] = P[1] * mg * tt; d[i4 + 2] = P[2] * mb * tt;
  }
  c.putImageData(img, 0, 0);
  // the panel's frame, printed once per ink and slightly out of register (the riso tell)
  c.save(); c.globalCompositeOperation = 'multiply'; c.lineWidth = 4;
  RISO.inks.slice(0, 3).forEach((ink, j) => { c.strokeStyle = `rgb(${ink.rgb.join(',')})`; c.strokeRect(M + offs[j][0] - .5, M + offs[j][1] - .5, W - 2 * M, H - 2 * M); });
  c.restore();
}

// ---------------- C: cut paper ----------------
// [r, g, b, depth]: the papers. Depth orders the layers (0 = the backing sheet; lettering and pupils on top).
const PAPERS = [
  [30, 27, 34, .05], [42, 38, 51, .7], [74, 69, 88, .8],   // the night page (2020) and the specimen tiles on it
  [242, 232, 210, 0], [229, 216, 188, .35], [216, 230, 226, 1.1], [200, 165, 122, 1.3], [196, 180, 150, 1.5], [94, 152, 148, 2],
  [46, 58, 102, 3], [28, 34, 68, 3.25], [101, 118, 171, 3.15], [251, 244, 228, 4], [209, 156, 51, 4], [242, 199, 68, 4.2],
  [201, 71, 42, 4.3], [185, 86, 46, 4.45], [190, 142, 62, 4.2], [231, 194, 122, 4.15], [124, 90, 36, 4.25], [107, 78, 51, 4.5],
  [42, 36, 30, 5],
];
let _paper = null;
function paperInit() {
  // paper fibres (fine streaky noise) and a soft warm backlight from above
  const fib = _smoothNoise(W, H, 2.5, 21), blot = _smoothNoise(W, H, 60, 22);
  // the shadow box: wooden frame, then a cream mat whose inner edge is torn
  const frame = new Uint8Array(W * H), wood = 26, mat = 18, torn = _smoothNoise(W + H, 1, 7, 23);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const e = Math.min(x, y, W - 1 - x, H - 1 - y);
    if (e < wood) { frame[y * W + x] = 2; continue; }
    const k = (x < y && x < H - y) || (W - 1 - x < y && W - 1 - x < H - y) ? y : x;   // walk along whichever edge is nearest
    if (e < wood + mat + 6 * torn[k % (W + H)]) frame[y * W + x] = 1;
  }
  const woodTex = _smoothNoise(W, H, 4, 24);
  _paper = { fib, blot, frame, woodTex, idx: new Uint8Array(W * H), idx2: new Uint8Array(W * H), D: new Float32Array(W * H), S: new Float32Array(W * H) };
}
function paperFX(c, t) {
  if (!_paper) paperInit();
  const { fib, blot, frame, woodTex, idx, idx2, D, S } = _paper, n = PAPERS.length;
  const img = c.getImageData(0, 0, W, H), d = img.data;
  // 1) each pixel -> the nearest paper (luma-weighted RGB distance)
  for (let p = 0, i = 0; p < W * H; p++, i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]; let best = 0, bd = 1e12;
    for (let k = 0; k < n; k++) { const P = PAPERS[k], dr = r - P[0], dg = g - P[1], db = b - P[2], dd = 3 * dr * dr + 4 * dg * dg + 2 * db * db; if (dd < bd) { bd = dd; best = k; } }
    idx[p] = best;
  }
  // 2) clean cut edges: a 3x3 mode filter removes hairlines and speckle (grid lines, brush noise)
  const cnt = new Uint8Array(n), nb = [-W - 1, -W, -W + 1, -1, 0, 1, W - 1, W, W + 1];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) { idx2[p] = idx[p]; continue; }
    let best = idx[p], bc = 0;
    for (let q = 0; q < 9; q++) { const k = idx[p + nb[q]], v = ++cnt[k]; if (v > bc || (v === bc && k === idx[p])) { bc = v; best = k; } }
    for (let q = 0; q < 9; q++) cnt[idx[p + nb[q]]] = 0;
    idx2[p] = bc >= 3 ? best : idx[p];
  }
  for (let p = 0; p < W * H; p++) D[p] = PAPERS[idx2[p]][3];
  // 3) shadows: a layer casts a soft shadow down-right onto anything lower (light from the upper left)
  const ox = 8, oy = 10, R = 6, I = new Float64Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++) { let row = 0; for (let x = 0; x < W; x++) { const sx = x - ox, sy = y - oy; row += (sx >= 0 && sy >= 0) ? D[sy * W + sx] : 0; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row; } }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const x0 = Math.max(0, x - R), x1 = Math.min(W, x + R + 1), y0 = Math.max(0, y - R), y1 = Math.min(H, y + R + 1);
    const sum = I[y1 * (W + 1) + x1] - I[y0 * (W + 1) + x1] - I[y1 * (W + 1) + x0] + I[y0 * (W + 1) + x0], avg = sum / ((x1 - x0) * (y1 - y0));
    S[y * W + x] = Math.max(0, Math.min(2, avg - D[y * W + x]));
  }
  // 4) compose: paper colour x fibres x shadow, a rim light on top-left edges, a warm backlight, then the frame
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x, i = p * 4, P = PAPERS[idx2[p]], f = frame[p];
    if (f === 2) {   // walnut frame with grain and an inner bevel
      const e = Math.min(x, y, W - 1 - x, H - 1 - y), gr = .8 + .35 * woodTex[p], bev = e > 20 ? .7 : 1;
      d[i] = 92 * gr * bev; d[i + 1] = 60 * gr * bev; d[i + 2] = 38 * gr * bev; continue;
    }
    if (f === 1) {   // the cream mat, a raised layer of its own over the scene
      const v = .97 + .06 * fib[p]; d[i] = 236 * v; d[i + 1] = 228 * v; d[i + 2] = 210 * v; continue;
    }
    // the mat casts a shadow onto the scene just inside its torn edge
    let mat = 0; for (let k = 2; k <= 14; k += 4) { const q = (Math.max(0, y - k)) * W + Math.max(0, x - k); if (frame[q] === 1) mat += .2; }
    const shade = 1 - .21 * S[p] - mat * .55;
    const up = y > 2 && x > 2 ? D[p] - D[p - 2 * W - 2] : 0, rim = up > .2 ? 1.1 : 1;
    const fv = .955 + .07 * fib[p] + .03 * (blot[p] - .5), light = 1 + .07 * (1 - y / H) - .05 * Math.abs(x / W - .5);
    const k = shade * rim * fv * light;
    d[i] = P[0] * k + (rim > 1 ? 10 : 0); d[i + 1] = P[1] * k + (rim > 1 ? 8 : 0); d[i + 2] = P[2] * k + (rim > 1 ? 4 : 0);
  }
  c.putImageData(img, 0, 0);
}
