// dgq/props.js: the researcher's instruments and the notebook's own effects.
//   petriDishBack / petriDishFront   a glass dish the shoggoth sits IN (back rim, creature, then front rim)
//   magnifiedPage(lx, ly, R, zoom)   the graph paper as seen through the lens (bigger squares), clipped to the glass
//   magnifier(lx, ly, R, o)          brass rim, wooden handle, glass glare; o.crack 0..1 with o.crackAt [x, y]
//   gripHand(x, y, ang, sz)          a close-up fist round a handle (the researcher's hand on the lens, in the hook)
//   riffle(t, t0, pages, o)          pages flipping back one per beat, each a quick ink glimpse of a later verse

// ---------- the petri dish ----------
function petriDishBack(cx, cy, rx) {
  const ry = rx * .36;
  boilSeed('dishB');
  paint(ellPts(cx + rx * .06, cy + ry * .55, rx * 1.08, ry * .8, 30, rx * .01), { fill: '#7D8A97', fillOp: 45, bleed: .3, tex: .4, ink: null });
  paint(ellPts(cx, cy, rx, ry, 40, rx * .004), { wash: DQ.glass, washOp: 70, ink: DQ.sepia, sw: Math.max(.4, rx / 260) });
  paint(ellPts(cx, cy + ry * .06, rx * .93, ry * .86, 40, rx * .004), { wash: '#E9F1EC', washOp: 80, ink: null });
}
function petriDishFront(cx, cy, rx) {
  const ry = rx * .36, P = [];
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  for (let i = 24; i >= 0; i--) { const a = i / 24 * Math.PI; P.push([cx + Math.cos(a) * rx * .94, cy + Math.sin(a) * ry * .82 + ry * .1]); }
  boilSeed('dishF');
  paint(P, { wash: DQ.glass, washOp: 110, ink: DQ.sepia, sw: Math.max(.4, rx / 260) });
  const hl = []; for (let i = 0; i <= 10; i++) { const a = lerp(.35, 1.05, i / 10) * Math.PI; hl.push([cx + Math.cos(a) * rx * .97, cy + Math.sin(a) * ry * .93 + ry * .04]); }
  inkPath2d(hl, { col: '#FFFFFF', sw: Math.max(1.5, rx * .012), alpha: .8, j: .3 });
}

// ---------- the page through the lens ----------
function magnifiedPage(lx, ly, R, zoom = 2.6, sq = 36, a = 1) {   // a: fades the magnified view out (the glass clears)
  if (a <= 0) return;
  boilSeed('lensPage');
  paint(ellPts(lx, ly, R, R, 60), { wash: mixCol(DQ.paper, '#FFFFFF', .2), washOp: 255 * a, ink: null });
  queue2d(c => {
    c.save(); c.globalAlpha = a; c.beginPath(); c.arc(lx, ly, R, 0, TAU); c.clip();
    c.translate(lx, ly); c.scale(zoom, zoom); c.translate(-lx, -ly); c.lineWidth = 1 / zoom * 1.6;
    if (typeof STYLE !== 'undefined' && STYLE === 'C') { c.restore(); return; }   // no printed grid in cut paper
    const x0 = lx - R / zoom, x1 = lx + R / zoom, y0 = ly - R / zoom, y1 = ly + R / zoom;
    for (let x = Math.ceil(x0 / sq) * sq; x <= x1; x += sq) { c.strokeStyle = DQ.grid; c.globalAlpha = .35 * a; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
    for (let y = Math.ceil(y0 / sq) * sq; y <= y1; y += sq) { c.strokeStyle = DQ.grid; c.globalAlpha = .35 * a; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
    c.restore();
  });
  flushLetters();
}

// ---------- a hand gripping a handle, close up ----------
// (x, y) the middle of the grip; ang the handle's direction (pointing away from the lens, toward the end); sz the hand's
// size (about its half-width). A fist wrapped round the handle: the back of the hand with knuckle creases, the fingers'
// tips curled under, the thumb laid along the handle toward the lens. Drawn smooth for a hand that fills a corner.
function gripHand(x, y, ang, sz, o = {}) {
  const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, skin = o.skin || '#F1C9A5';
  const L = (u, v) => [x + ux * u + nx * v, y + uy * u + ny * v];   // u along the handle, v across it
  boilSeed('grip');
  const fist = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, c = Math.cos(a), s = Math.sin(a); fist.push(L(Math.sign(c) * Math.pow(Math.abs(c), .7) * sz * .62, Math.sign(s) * Math.pow(Math.abs(s), .7) * sz * .95)); }
  paint(fist, { wash: skin, fill: '#E2AE88', fillOp: 70, bleed: .04, tex: .3, ink: PENCIL, sw: .7, curv: .5 });
  // the thumb, along the handle toward the lens, on top of it
  const th = [L(-sz * .35, -sz * .55), L(-sz * .95, -sz * .5), L(-sz * 1.12, -sz * .28), L(-sz * .95, -sz * .08), L(-sz * .3, -sz * .12)];
  paint(th, { wash: skin, fill: '#E2AE88', fillOp: 50, ink: PENCIL, sw: .6, curv: .6 });
  inkPath2d([L(-sz * 1.0, -sz * .38), L(-sz * .9, -sz * .2)], { col: '#B98A6E', sw: Math.max(1.2, sz * .025) });   // the thumbnail
  // knuckle creases across the back of the hand, and the curled fingertips on the near side of the handle
  for (const u of [-.3, 0, .3]) inkPath2d([L(sz * u - sz * .05, sz * .25), L(sz * u, sz * .5), L(sz * u + sz * .04, sz * .78)], { col: PENCIL, sw: Math.max(1.5, sz * .03) });
  for (const u of [-.42, -.14, .14, .42]) inkPath2d(ell2d(...L(sz * u, sz * .88), sz * .13, sz * .09, ang, 10, .3), { col: PENCIL, sw: Math.max(1.2, sz * .025), close: true, fill: skin });
}

// ---------- the magnifying glass ----------
// Draw the handle first (o.part = 'handle'), then the scene inside, then the rim and glass (o.part = 'rim').
function magnifier(lx, ly, R, o = {}) {
  const ha = o.handleAng ?? .82, rw = R * .085;
  if (o.part !== 'rim') {
    boilSeed('magHandle');
    const hx0 = lx + Math.cos(ha) * (R + rw * .5), hy0 = ly + Math.sin(ha) * (R + rw * .5), L = R * 1.55;
    const nx = -Math.sin(ha), ny = Math.cos(ha);
    const pt = (d, w) => [[hx0 + Math.cos(ha) * d + nx * w, hy0 + Math.sin(ha) * d + ny * w], [hx0 + Math.cos(ha) * d - nx * w, hy0 + Math.sin(ha) * d - ny * w]];
    const [a1, b1] = pt(0, rw * .55), [a2, b2] = pt(L * .22, rw * .62);
    paint([a1, a2, b2, b1], { wash: DQ.brass, fill: DQ.brassLt, fillOp: 70, bleed: .05, tex: .4, ink: DQ.ink, sw: R / 300 });
    const [c1, d1] = pt(L * .22, rw * .75), [c2, d2] = pt(L * .9, rw * .95), [c3, d3] = pt(L, rw * .7);
    paint([c1, c2, c3, d3, d2, d1], { wash: '#6B3F22', fill: '#8A5530', fillOp: 90, bleed: .06, tex: .6, ink: DQ.ink, sw: R / 300, curv: .3 });
    inkPath2d([pt(L * .3, rw * .4)[0], pt(L * .85, rw * .55)[0]], { col: '#B98A5E', sw: R * .012, alpha: .7 });
  }
  if (o.part === 'handle') return;
  boilSeed('magRim');
  // glass: a faint cool tint toward the edge, two glares
  queue2d(c => {
    c.save(); c.beginPath(); c.arc(lx, ly, R, 0, TAU); c.clip();
    const g = c.createRadialGradient(lx - R * .2, ly - R * .25, R * .2, lx, ly, R); g.addColorStop(0, 'rgba(220,240,236,0)'); g.addColorStop(1, 'rgba(150,190,190,.22)');
    c.fillStyle = g; c.fillRect(lx - R, ly - R, 2 * R, 2 * R);
    c.globalAlpha = .55; c.strokeStyle = '#FFFFFF'; c.lineCap = 'round';
    c.lineWidth = R * .045; c.beginPath(); c.arc(lx, ly, R * .8, -2.55, -1.95); c.stroke();
    c.lineWidth = R * .02; c.beginPath(); c.arc(lx, ly, R * .8, -1.8, -1.6); c.stroke();
    c.restore();
  });
  // the lens is Neel's library: "TransformerLens" etched into the glass just inside the rim (reference bank M1), along
  // the upper left arc; o.mirror reads it from the far side, backwards. Only big lenses: on small ones it's a scratch.
  // The library dates from Aug 2022, so the etching appears only once the stamp reads 2022 (fading in as it rolls over).
  const etch = o.etch === undefined ? 'TransformerLens' : o.etch, yr = stampYear(T), ek = yr == null ? 1 : clamp(yr - 2021);
  if (etch && R > 140 && ek > 0) queue2d(c => {
    const fs = R * .072, rr = R * .86, span = etch.length * fs * .62 / rr, a0 = -Math.PI * .72 - span / 2;
    c.save(); c.translate(lx, ly); if (o.mirror) c.scale(-1, 1);
    c.font = `500 ${fs}px "${FONT.cmuTT}"`; c.textAlign = 'center'; c.textBaseline = 'middle';
    [...etch].forEach((ch, i) => { const a = a0 + (i + .5) / etch.length * span; c.save(); c.rotate(a + Math.PI / 2); c.translate(0, -rr);
      c.globalAlpha = .45 * ek; c.fillStyle = '#5E7A78'; c.fillText(ch, .8, .8); c.globalAlpha = .7 * ek; c.fillStyle = '#FFFFFF'; c.fillText(ch, 0, 0); c.restore(); });
    // on the big close-ups, a fainter engraving just inside it, struck through: the library's 2022 name (Neel's
    // EasyTransformer, renamed TransformerLens that December; reference bank r2 T132). Same length, so it lines up.
    if (etch === 'TransformerLens' && R > 230) {
      const old = 'EasyTransformer', r2 = rr - fs * 1.2;
      [...old].forEach((ch, i) => { const a = a0 + (i + .5) / old.length * span; c.save(); c.rotate(a + Math.PI / 2); c.translate(0, -r2);
        c.globalAlpha = .32 * ek; c.fillStyle = '#5E7A78'; c.fillText(ch, .8, .8); c.globalAlpha = .5 * ek; c.fillStyle = '#FFFFFF'; c.fillText(ch, 0, 0); c.restore(); });
      c.lineWidth = Math.max(1.5, fs * .11); c.lineCap = 'round';   // the scratch through it, cut like the letters (shadow, then light)
      for (const [col, al, d] of [['#5E7A78', .6, 1], ['#FFFFFF', .85, 0]]) { c.globalAlpha = al * ek; c.strokeStyle = col; c.beginPath(); c.arc(0, 0, r2 - fs * .2 + d, a0 - .01, a0 + span + .01); c.stroke(); }
    }
    c.restore();
  });   // world space, like the glass (the hook draws its lens under a camera)
  if (o.crack > 0) lensCrack(lx, ly, R, o.crackAt || [lx + R * .1, ly - R * .05], o.crack);
  // brass rim: a thick ring with an inner and outer ink line and a highlight
  const ring = (r, n = 72) => { const P = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; P.push([lx + Math.cos(a) * r + jit(R * .002), ly + Math.sin(a) * r + jit(R * .002)]); } return P; };
  const outer = ring(R + rw), inner = ring(R);
  queue2d(c => {
    c.save(); c.beginPath(); outer.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
    inner.slice().reverse().forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
    const g = c.createLinearGradient(lx - R, ly - R, lx + R, ly + R); g.addColorStop(0, DQ.brassLt); g.addColorStop(.45, DQ.brass); g.addColorStop(1, DQ.brassDk);
    c.fillStyle = g; c.fill('evenodd');
    c.strokeStyle = DQ.ink; c.lineWidth = Math.max(1.4, R * .008); c.lineJoin = 'round';
    for (const P of [outer, inner]) { c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke(); }
    c.globalAlpha = .6; c.strokeStyle = '#FFF3D0'; c.lineWidth = rw * .22; c.lineCap = 'round'; c.beginPath(); c.arc(lx, ly, R + rw * .5, -2.7, -1.7); c.stroke();
    c.restore();
  });
  flushLetters();
}

// Cracks spreading through the glass from a point: a few main branches (random walks from hash), each with side forks.
// p 0..1 reveals the length. Drawn as a dark line with a white edge, the way cracked glass catches light.
function lensCrack(lx, ly, R, at, p) {
  const lines = [];
  for (let b = 0; b < 7; b++) {
    let a = b / 7 * TAU + hash(b * 3.7) * .7, [x, y] = at; const P = [[x, y]], len = R * (.45 + .6 * hash(b * 1.9));
    for (let k = 0; k < 14; k++) {
      a += (hash(b * 31 + k) - .5) * .8; x += Math.cos(a) * len / 14; y += Math.sin(a) * len / 14;
      if (Math.hypot(x - lx, y - ly) > R * .98) break;
      P.push([x, y]);
      if (k === 5 || k === 9) { const fa = a + (hash(b + k) > .5 ? .9 : -.9), F = [[x, y]]; let fx = x, fy = y; for (let m = 0; m < 5; m++) { fx += Math.cos(fa + (hash(m + b * 7) - .5)) * len / 22; fy += Math.sin(fa + (hash(m + b * 9) - .5)) * len / 22; if (Math.hypot(fx - lx, fy - ly) > R * .98) break; F.push([fx, fy]); } lines.push({ P: F, k0: k / 14 }); }
    }
    lines.push({ P, k0: 0 });
  }
  queue2d(c => {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const { P, k0 } of lines) {
      const q = clamp((p - k0 * .6) / (1 - k0 * .6)), n = Math.max(2, Math.ceil(P.length * q)); if (q <= 0) continue;
      for (const [col, w, dx] of [['#FFFFFF', Math.max(1.2, R * .009), 1.2], [DQ.ink, Math.max(.9, R * .005), 0]]) {   // stays visible on a small lens
        c.strokeStyle = col; c.lineWidth = w; c.globalAlpha = col === '#FFFFFF' ? .8 : .85; c.beginPath();
        P.slice(0, n).forEach(([x, y], i) => i ? c.lineTo(x + dx, y + dx) : c.moveTo(x + dx, y + dx)); c.stroke();
      }
    }
    c.restore();
  });
}

// ---------- the riffle: pages flipping back through the years ----------
// pages: [{ year, draw(c, age), dark?, live? }] newest first. From t0, one page lands per `per` seconds: each earlier
// page turns in from the binding on the left over the one before, revealed (not squashed) behind a moving fold with a
// bright curling edge and a shadow on the page beneath. A page marked live is the scene the caller has already painted
// (the riffle then only draws what covers it). draw gets the page's age: seconds since it began to be revealed, so a
// glimpse can animate in the half second it is seen. Returns { year, page, q } for the stamp.
function riffle(t, t0, pages, o = {}) {
  const per = o.per ?? BEAT, k = Math.floor((t - t0) / per), q = frac((t - t0) / per);
  const cur = clamp(k, 0, pages.length - 1), next = Math.min(pages.length - 1, cur + 1), turning = k >= 0 && k < pages.length - 1;
  const f = easeOut(q), w = f * (W + 120) - 60;   // the fold's x: sweeps from the binding to past the right edge
  const age = i => t - t0 - (i - 1) * per;          // page i starts to show when turn i-1 begins
  queue2d(c => {
    c.save();
    if (!pages[cur].live) drawPage(c, pages[cur], age(cur));
    if (turning) {
      const sh = 1 - f;
      // shadow cast by the turning page onto the one beneath, just right of the fold
      const gs = c.createLinearGradient(w, 0, w + 220, 0); gs.addColorStop(0, `rgba(30,22,14,${.45 * sh + .1})`); gs.addColorStop(1, 'rgba(30,22,14,0)');
      c.fillStyle = gs; c.fillRect(w, 0, 220, H);
      c.save(); c.beginPath(); c.rect(0, 0, Math.max(0, w), H); c.clip(); drawPage(c, pages[next], age(next)); c.restore();
      // the curling edge: the back of the turning page catches the light
      const cw = 30 + 70 * sh, ge = c.createLinearGradient(w - cw, 0, w, 0);
      ge.addColorStop(0, 'rgba(255,250,238,0)'); ge.addColorStop(.7, 'rgba(255,250,238,.85)'); ge.addColorStop(1, 'rgba(120,100,70,.5)');
      c.fillStyle = ge; c.fillRect(w - cw, 0, cw, H);
    }
    c.restore();
  }, { screen: true });
  return { year: turning ? lerp(pages[cur].year, pages[next].year, f) : pages[cur].year, page: turning && f > .5 ? next : cur, q };
}
function drawPage(c, pg, age = 9) {
  c.fillStyle = pg.dark ? '#1E1B22' : DQ.paper; c.fillRect(0, 0, W, H);
  c.lineWidth = 1; const sq = 36;
  c.strokeStyle = pg.dark ? '#3A3644' : DQ.grid; c.globalAlpha = pg.dark ? .5 : .32;
  for (let x = 0; x <= W; x += sq) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  for (let y = 0; y <= H; y += sq) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.globalAlpha = .55; c.strokeStyle = DQ.margin; c.lineWidth = 2; c.beginPath(); c.moveTo(230, 0); c.lineTo(230, H); c.stroke();
  c.globalAlpha = 1;
  for (const hy of [H * .18, H * .5, H * .82]) { c.fillStyle = pg.dark ? '#0E0C10' : '#E2D6BC'; c.beginPath(); c.arc(70, hy, 22, 0, TAU); c.fill(); }
  c.save(); pg.draw(c, age); c.restore();
  { const pn = { 2024: '31,164,353', 2022: '113' }[pg.year]; if (pn) skText(c, `p. ${pn}`, 1860, 1010, 40, { col: DQ.sepia, align: 'right' }); }   // the page numbers that come back later (Neel picked it, 3 Oct)
}

// one curve detector, as a small tile: the curve's family of arcs at one orientation (learned: in colour, like a feature
// visualisation; hand-built: in pencil, with the compass point its arcs were drawn from)
function glimpseCurveTile(c, x, y, s, learned) {
  c.save(); c.fillStyle = learned ? '#F4EADC' : '#FBF7EE'; c.strokeStyle = learned ? '#8C7A5A' : '#A89A80'; c.lineWidth = 2;
  c.beginPath(); c.roundRect(x, y, s, s, 10); c.fill(); c.stroke();
  c.beginPath(); c.roundRect(x, y, s, s, 10); c.clip();
  const ox = x + s * .18, oy = y + s * .86;   // every arc is centred on the tile's lower left: a curve facing up and right
  for (let i = 0; i < 6; i++) {
    const r = s * (.34 + i * .1);
    c.strokeStyle = learned ? ['#E07A2E', '#3A8FA8', '#E07A2E', '#7A4E9A', '#E07A2E', '#3A8FA8'][i] : '#6F6A62';
    c.lineWidth = learned ? s * .045 : s * .02; c.beginPath(); c.arc(ox, oy, r, -Math.PI * .5, 0); c.stroke();
  }
  if (!learned) { c.fillStyle = '#6F6A62'; c.beginPath(); c.arc(ox, oy, s * .025, 0, TAU); c.fill(); }   // the compass point
  c.restore();
}

// ---------- quick ink glimpses for the riffle (2D sketches: one per later verse) ----------
function sk(c, pts, w = 4, col = DQ.ink, close = false) { c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath(); c.stroke(); c.restore(); }
function skText(c, s, x, y, size, o = {}) { c.save(); c.font = `${o.style || 'normal'} ${o.weight || 400} ${size}px "${FONT[o.font || DQF.hand] || o.font}"`; c.fillStyle = o.col || DQ.ink; c.textAlign = o.align || 'center'; c.translate(x, y); if (o.rot) c.rotate(o.rot); c.fillText(s, 0, 0); c.restore(); }
// Neel (3 Oct): after "now" the notebook riffles back a year a page, each page one interp figure from that year: fast,
// "a reward to the high context viewer so don't spell it out - don't say the name of the technique". So: no captions,
// no names; each page is one recognisable figure, redrawn in ink, and it animates in the half second it is seen.
function skBubble(c, x, y, w, h, o = {}) {   // a rounded bubble; o.tail = the point its tail reaches; o.dash = dashed outline
  c.save(); c.lineWidth = o.sw ?? 5; c.strokeStyle = o.col || DQ.ink; c.fillStyle = o.fill || DQ.cream; c.lineJoin = 'round';
  if (o.tail) { const [tx, ty] = o.tail, bx = clamp(tx, x + 60, x + w - 60), by = ty > y + h / 2 ? y + h - 4 : y + 4; c.beginPath(); c.moveTo(bx - 30, by); c.lineTo(tx, ty); c.lineTo(bx + 30, by); c.closePath(); c.fill(); c.stroke(); }
  if (o.dash) c.setLineDash(o.dash);
  c.beginPath(); c.roundRect(x, y, w, h, o.r ?? 34); c.fill(); c.stroke();
  c.restore();
}
function skShog(c, x, y, w, o = {}) {   // a glimpse of the creature: (x, y) the middle of its base, w its width
  const h = w * .98, sx = w / 520, P = (u, v) => [x + (u - 860) * sx, y + (v - 840) * sx];
  c.save(); c.fillStyle = DQ.indigo; c.strokeStyle = DQ.ink; c.lineWidth = 9 * sx; c.lineJoin = 'round';
  const [a0, b0] = P(600, 840), [a1, b1] = P(560, 500), [a2, b2] = P(700, 330), [a3, b3] = P(860, 330), [a4, b4] = P(1020, 330), [a5, b5] = P(1160, 500), [a6, b6] = P(1120, 840);
  c.beginPath(); c.moveTo(a0, b0); c.bezierCurveTo(a1, b1, a2, b2, a3, b3); c.bezierCurveTo(a4, b4, a5, b5, a6, b6); c.closePath(); c.fill(); c.stroke();
  for (const [u, v, r] of [[790, 520, 46], [930, 500, 56], [860, 410, 24], [1010, 600, 20], [700, 640, 18]]) {
    const [ex, ey] = P(u, v); c.beginPath(); c.arc(ex, ey, r * sx, 0, TAU); c.fillStyle = DQ.cream; c.fill(); c.lineWidth = 6 * sx; c.stroke();
    const lk = o.look || [.2, .1]; c.beginPath(); c.arc(ex + r * sx * lk[0], ey + r * sx * lk[1], r * sx * .45, 0, TAU); c.fillStyle = DQ.ink; c.fill();
  }
  const [mx, my] = P(870, 700), mr = 52 * sx;   // the smiley mask
  c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fillStyle = DQ.smile; c.fill(); c.lineWidth = 5 * sx; c.stroke();
  c.fillStyle = DQ.ink; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(mx + d * mr * .34, my - mr * .2, mr * .09, mr * .14, 0, 0, TAU); c.fill(); }
  c.beginPath(); c.arc(mx, my + mr * .05, mr * .55, .25, Math.PI - .25); c.lineWidth = 5 * sx; c.stroke();
  if (o.bowtie) { const [bx, by] = P(870, 790); c.fillStyle = DQ.verm; c.lineWidth = 6 * sx; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + d * 70 * sx, by - 42 * sx); c.lineTo(bx + d * 70 * sx, by + 42 * sx); c.closePath(); c.fill(); c.stroke(); } }
  c.restore();
}
const popIn = (age, at, d = .14) => backOut(clamp((age - at) / d));   // something popping in at a page age (not 'pop': that is p5's)
const GLIMPSE = {
  // 2026: told to think of one thing while it writes another, and we can read the thought (the paper's dashed thought
  // bubble; Neel's pick: "pink elephants")
  jlens: (c, age) => {
    skShog(c, 600, 960, 520, { look: [.5, -.3] });
    skBubble(c, 930, 540, 860, 290, { tail: [800, 700], fill: '#FFFDF7', col: '#C98C74', sw: 5 });
    ['\u201CThe old painting hung', 'crookedly on the wall.\u201D'].forEach((s, i) => skText(c, s, 975, 655 + i * 84, 60, { font: DQF.type, align: 'left', col: '#B5562E' }));
    const k = popIn(age, .08);
    if (k > .02) {
      c.save(); c.translate(640, 290); c.scale(k, k); c.translate(-640, -290);
      const dashed = (f) => { c.save(); c.setLineDash([12, 9]); c.lineWidth = 4; c.strokeStyle = '#D29A5A'; c.fillStyle = '#FBEFD9'; f(); c.fill(); c.stroke(); c.restore(); };
      for (const [x, y, r] of [[548, 520, 16], [575, 466, 25]]) dashed(() => { c.beginPath(); c.arc(x, y, r, 0, TAU); });
      dashed(() => { c.beginPath(); c.ellipse(650, 285, 330, 150, 0, 0, TAU); });
      skText(c, 'pink elephants', 650, 250, 64, { font: DQF.type, col: '#D6608E' });
      // a pink elephant, mid-thought
      c.save(); c.translate(630, 330); c.scale(1.35, 1.35); c.fillStyle = '#F2A9C4'; c.strokeStyle = '#B8577E'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(0, 0, 50, 32, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(50, -14, 24, 22, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(38, -16, 14, 20, -.3, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(70, -6); c.quadraticCurveTo(86, 10, 76, 26); c.stroke();
      for (const lx of [-30, -10, 14, 32]) { c.beginPath(); c.moveTo(lx, 26); c.lineTo(lx, 42); c.stroke(); }
      c.fillStyle = DQ.ink; c.beginPath(); c.arc(56, -20, 3, 0, TAU); c.fill(); c.restore();
      c.restore();
    }
  },
  // 2025: the eval-aware model: whoever asks, it knows who is asking
  woodlabs: (c, age) => {
    skShog(c, 690, 1010, 760, { bowtie: true, look: [.5, -.3] });
    skBubble(c, 1010, 170, 820, 300, { tail: [940, 470], fill: '#FFFDF7' });
    const words = 'Wood Labs are a well known LLM evaluator'.split(' '), n = Math.ceil(clamp(age / .22) * words.length);
    skText(c, words.slice(0, Math.min(n, 6)).join(' '), 1055, 290, 66, { font: DQF.serif, align: 'left' });
    if (n > 6) skText(c, words.slice(6, n).join(' '), 1055, 380, 66, { font: DQF.serif, align: 'left' });
  },
  // 2024: the bridge
  bridge: (c, o = {}) => {   // o.noText: the drawing alone (V2c's feature page)
    const red = '#B5402A';
    for (const x of [700, 1220]) { sk(c, [[x - 34, 860], [x - 24, 280], [x + 24, 280], [x + 34, 860]], 12, red); sk(c, [[x - 30, 380], [x + 30, 380]], 9, red); sk(c, [[x - 32, 540], [x + 32, 540]], 9, red); }
    const cable = []; for (let i = 0; i <= 60; i++) { const x = lerp(330, 1590, i / 60); const xi = (x - 960) / 260; cable.push([x, x < 700 ? lerp(700, 290, (x - 330) / 370) : x > 1220 ? lerp(290, 700, (x - 1220) / 370) : 290 + 170 * (1 - xi * xi)]); }
    sk(c, cable, 9, red); sk(c, [[300, 720], [1620, 720]], 16, red);
    for (let x = 740; x < 1200; x += 34) { const xi = (x - 960) / 260; sk(c, [[x, 292 + 170 * (1 - xi * xi)], [x, 712]], 3, red); }
    if (!o.noText) skText(c, 'I AM THE GOLDEN GATE BRIDGE', 960, 880, 70, { font: DQF.serif });
  },
  // 2023: features settle into discrete bands, by the fraction of a dimension each gets: a staircase of shapes stepping
  // down as they get sparser (a dot alone, tetrahedra, triangles, a long run of antipodal pairs, pentagons, antiprisms)
  staircase: (c, age) => {
    const x0 = 330, x1 = 1470, Y = D => 880 - D * 620, ys = { 1: Y(1), .75: Y(.75), .667: Y(2 / 3), .5: Y(.5), .4: Y(.4), .375: Y(.4) + 34, 0: Y(0) };
    const B = [[1, '#E0218A', '1'], [.75, '#1FA8D8', '3/4'], [.667, '#22C07A', '2/3'], [.5, '#D9B81C', '1/2'], [.4, '#F08A1C', '2/5'], [.375, '#9B30E8', '3/8'], [0, '#E0322A', '0']];
    const glyph = (kind, x, y, s, col) => {
      c.save(); c.strokeStyle = DQ.ink; c.fillStyle = DQ.ink; c.lineWidth = 2.5;
      const dot = (px, py) => { c.beginPath(); c.arc(px, py, 3.6, 0, TAU); c.fill(); };
      const poly = (n, r, rot) => Array.from({ length: n }, (_, i) => [x + Math.cos(rot + i / n * TAU) * r, y + Math.sin(rot + i / n * TAU) * r]);
      const ring = P => { c.beginPath(); P.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.stroke(); P.forEach(([px, py]) => dot(px, py)); };
      c.globalAlpha = .9; c.beginPath(); c.arc(x, y, s * 1.08, 0, TAU); c.fillStyle = col; c.globalAlpha = .28; c.fill(); c.globalAlpha = 1; c.fillStyle = DQ.ink;
      if (kind === '1') { c.beginPath(); c.arc(x, y, s, 0, TAU); c.stroke(); dot(x, y); }
      else if (kind === '3/4') { const P = poly(3, s, -Math.PI / 2); ring(P); P.forEach(([px, py]) => { c.beginPath(); c.moveTo(x, y + s * .15); c.lineTo(px, py); c.stroke(); }); dot(x, y + s * .15); }
      else if (kind === '2/3') ring(poly(3, s, -Math.PI / 2));
      else if (kind === '1/2') { c.beginPath(); c.moveTo(x, y - s); c.lineTo(x, y + s); c.stroke(); dot(x, y - s); dot(x, y + s); }
      else if (kind === '2/5') ring(poly(5, s, -Math.PI / 2));
      else if (kind === '3/8') { const A = poly(4, s, 0), Bq = poly(4, s * .62, Math.PI / 4); ring(A); ring(Bq); A.forEach(([px, py], i) => { for (const j of [i, (i + 3) % 4]) { c.beginPath(); c.moveTo(px, py); c.lineTo(...Bq[j]); c.stroke(); } }); }
      else { c.beginPath(); c.arc(x, y, s, 0, TAU); c.strokeStyle = '#B03028'; c.stroke(); }
      c.restore();
    };
    const grow = clamp(age / .12);
    B.forEach(([D, col, lab]) => {   // the bands, and their legend on the right (the fraction and its shape)
      const y = ys[D]; c.save(); c.globalAlpha = .55; sk(c, [[x0, y], [lerp(x0, x1, grow), y]], 14, col); c.restore();
      if (grow >= 1) { skText(c, lab, x1 + 60, y + 14, 36, { font: DQF.mono, col: DQ.ink }); glyph(lab, x1 + 150, y, 22, col); }
    });
    // the staircase: runs of little shapes on each band, stepping down to the right (dense to sparse)
    const runs = [['1', 345, 430, 3], ['3/4', 445, 545, 3], ['2/3', 545, 650, 3], ['1/2', 655, 1060, 8], ['2/5', 1070, 1185, 3], ['3/8', 1195, 1300, 3], ['0', 345, 640, 5]];
    for (const [lab, a, b, n] of runs) {
      const [D, col] = B.find(r => r[2] === lab);
      for (let i = 0; i < n; i++) { const x = n > 1 ? lerp(a, b, i / (n - 1)) : a, k = popIn(age, .06 + (x - x0) / (x1 - x0) * .22, .08); if (k > .02) glyph(lab, x, ys[D], 22 * k, col); }
    }
    for (let i = 0; i < 4; i++) { const x = 1330 + i * 40, y = ys[.375] + 40 + i * 38, k = popIn(age, .28 + i * .02, .08); if (k > .02) { c.save(); c.globalAlpha = .7; c.beginPath(); c.arc(x, y, 8 * k, 0, TAU); c.fillStyle = '#8A8070'; c.fill(); c.restore(); } }   // and on down
  },
  // 2022: the clock: adding numbers mod 113 as rotations on a circle (a, then b, land on a + b), and the loss: train
  // already near zero, test high and flat, then it plummets
  grokking: (c, age) => {
    const cx = 640, cy = 560, R = 180;
    sk(c, [[cx - 260, cy], [cx + 260, cy]], 3, DQ.gridDk); sk(c, [[cx, cy - 260], [cx, cy + 260]], 3, DQ.gridDk);
    c.save(); c.strokeStyle = DQ.ink; c.lineWidth = 7; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.restore();
    const arrow = (ang, col, len = R, w = 7) => { const ex = cx + Math.cos(ang) * len, ey = cy + Math.sin(ang) * len; sk(c, [[cx, cy], [ex, ey]], w, col); sk(c, [[ex + Math.cos(ang + 2.6) * 26, ey + Math.sin(ang + 2.6) * 26], [ex, ey], [ex + Math.cos(ang - 2.6) * 26, ey + Math.sin(ang - 2.6) * 26]], w, col); };
    const arc = (a0, a1, r, col, w = 7) => { const P = []; for (let i = 0; i <= 30; i++) P.push([cx + Math.cos(lerp(a0, a1, i / 30)) * r, cy + Math.sin(lerp(a0, a1, i / 30)) * r]); sk(c, P, w, col); };
    const A = 1.95, Bn = -1.15, q = clamp(age / .2);   // screen angles: a (down-left), b (up-right); a + b sweeps on
    arrow(A, '#A8322A'); arrow(Bn, '#3A8FD8'); arc(0, A, R + 22, '#A8322A'); arc(A, A + Bn * q, R + 44, '#3A8FD8');
    if (q >= 1) arrow(A + Bn, '#7A2E8E', R, 8);
    skText(c, 'cos w(a+b−c)', cx, cy - R - 70, 46, { font: DQF.serif, style: 'italic', col: '#7A2E8E' });
    // the loss, on a log scale, drawn left to right as the page is seen
    const C = FIG.grok.curves, n = C.step.findIndex(s => s > 9000), px = 1020, py = 300, pw = 640, ph = 460, lo = Math.log(1e-4), hi = Math.log(40);
    const X = i => px + C.step[i] / 9000 * pw, Yl = (v, fl) => py + ph * (1 - Math.max(fl, (Math.log(Math.max(v, 1e-12)) - lo) / (hi - lo)));   // never quite onto the axis
    sk(c, [[px, py], [px, py + ph], [px + pw, py + ph]], 4, DQ.ink);
    const upto = Math.floor(clamp((age - .1) / .42) * n);   // the cliff (about two thirds along) arrives at age ~.38
    for (const [key, col] of [['train_loss', '#3A8FD8'], ['test_loss', '#C9472A']]) if (upto > 1) sk(c, Array.from({ length: upto }, (_, i) => [X(i), Yl(C[key][i], grokFloor(key, C.step[i]))]), 6, col);   // (floors as verse 1's plot: figures.js grokFloor)
  },
  // 2021: text that repeats; at the cursor, a head looks back to the token after the last time it saw this one
  induction: (c, age) => {
    // Curve Circuits (Distill, Jan 2021), in the page's right corner (the part seen longest as the riffle turns): a curve
    // detector from InceptionV1 beside the one rebuilt by hand, "an artificial artificial neural network" (reference bank
    // r3 pick 5). Learned on the left, in colour; hand-built on the right, in pencil, with its compass point.
    glimpseCurveTile(c, 1500, 600, 150, true); glimpseCurveTile(c, 1690, 600, 150, false);
    const f = { font: DQF.type, size: 84 }, y1 = 430, y2 = 680, x0 = 330;
    c.save(); c.font = `400 84px "${FONT[DQF.type]}"`;
    const w1 = ['don\u2019t', 'go', 'quiet', 'on', 'me', 'now'], sp = c.measureText(' ').width, xs = []; let x = x0;
    for (const w of w1) { xs.push(x); x += c.measureText(w).width + sp; }
    c.restore();
    const ends = xs.map((xx, i) => xx + (i < 5 ? (xs[i + 1] - xx - sp) : 0));
    w1.forEach((w, i) => skText(c, w, xs[i], y1, 84, { ...f, align: 'left', col: i === 4 ? DQ.ink : '#5A5248' }));
    const n2 = Math.min(4, Math.floor(clamp(age / .16) * 4.999));   // the repeat types out, a word at a time
    w1.slice(0, n2).forEach((w, i) => skText(c, w, xs[i], y2, 84, { ...f, align: 'left' }));
    const cx2 = n2 ? ends[n2 - 1] + sp * .6 : x0, blink = Math.floor(age * 6) % 2 === 0;
    if (blink || n2 < 4) sk(c, [[cx2, y2 - 70], [cx2, y2 + 16]], 6, DQ.ink);
    if (n2 >= 4) {
      const gx = xs[4] - sp * .4, k = clamp((age - .18) / .12);
      c.save(); c.setLineDash([10, 9]); sk(c, [[gx, y1 - 70], [gx, y1 + 16]], 5, '#A89A80'); c.restore();   // the ghost cursor, one word on
      c.save(); c.globalAlpha = .9; c.strokeStyle = DQ.verm; c.lineWidth = 6; c.beginPath(); c.roundRect(xs[3] - 10, y2 - 76, ends[3] - xs[3] + 20, 100, 12); c.stroke(); c.beginPath(); c.roundRect(xs[3] - 10, y1 - 76, ends[3] - xs[3] + 20, 100, 12); c.globalAlpha = .45; c.stroke(); c.restore();
      if (k > 0) {   // the look back: from the cursor up to the ghost, with an eye
        const P = []; for (let i = 0; i <= 24; i++) { const u = i / 24 * k, bx = lerp(cx2, gx, u), by = lerp(y2 - 80, y1 + 34, u) - 140 * Math.sin(Math.PI * u); P.push([bx, by]); }
        sk(c, P, 6, DQ.verm);
        c.save(); c.translate(cx2 + 8, y2 - 118); c.fillStyle = DQ.cream; c.strokeStyle = DQ.ink; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 34, 22, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = DQ.ink; c.beginPath(); c.arc(-12, -5, 10, 0, TAU); c.fill(); c.restore();
        if (k >= 1) { c.save(); c.strokeStyle = DQ.gold; c.lineWidth = 7; c.beginPath(); c.roundRect(xs[4] - 10, y1 - 76, ends[4] - xs[4] + 20, 100, 12); c.stroke(); c.restore(); }
      }
    }
  },
  // 2020: cut the network off early at every layer and ask it for its answer: guesses that converge, layer by layer
  logitLens: (c, age) => {
    const lt = '#D8D2E8', dim = '#8A86A0', gold = DQ.goldLt, bx = 760, bw = 220, bh = 66, ys = [810, 705, 600, 495, 390, 285];
    const guesses = ['the', 'a', 'him', 'you', 'me', 'me'];
    skText(c, 'you never used to talk to …', bx + bw / 2, 930, 38, { font: DQF.type, col: dim });
    sk(c, [[bx + bw / 2, 890], [bx + bw / 2, 205]], 4, '#5A5468');
    ys.forEach((y, l) => {
      c.save(); c.fillStyle = '#2A2633'; c.strokeStyle = dim; c.lineWidth = 3; c.beginPath(); c.roundRect(bx, y - bh / 2, bw, bh, 12); c.fill(); c.stroke(); c.restore();
      const k = popIn(age, .04 + l * .045, .08); if (k <= .02) return;
      const conv = l / (ys.length - 1), col = mixCol('#7A7690', gold, conv * conv);
      c.save(); c.setLineDash([10, 9]); sk(c, [[bx + bw, y], [bx + bw + 120 * k, y]], 3, dim); c.restore();
      if (k > .5) { skBubble(c, bx + bw + 130, y - 34, 190, 68, { fill: '#2A2633', col, sw: 3, r: 22 }); skText(c, guesses[l], bx + bw + 225, y + 14, 40, { font: DQF.type, col }); }
    });
    const k = popIn(age, .33, .1);
    if (k > .02) skText(c, 'me', bx + bw / 2, 205 - 20 * k, 72 * k, { font: DQF.serif, style: 'italic', col: gold });
  },
};

// ---------- neurons in the dark (2020): InceptionV1 as a network of cells, not a tray of tiles ----------
// Neel (3 Oct): "Neurons shouldn't be represented as squares in a grid, circles would be classic, something a bit more
// neurosciencey would also be cool, maybe with activations propagating along synapses, but in neural network style
// parallel layers". So: four parallel layers (real InceptionV1 layer names), each neuron a cell body with dendrites on
// its input side and an axon whose branches end in synapses on the next layer. A spark runs along the synapses, layer to
// layer, lighting each cell it reaches. Canvas2D, screen space.
const NET = (() => {
  const xs = [560, 870, 1180, 1490], ns = [6, 7, 7, 6], names = ['mixed3b', 'mixed4a', 'mixed4c', 'mixed4e'];
  const N = xs.map((x, l) => Array.from({ length: ns[l] }, (_, i) => [x + (hash(l * 17 + i) - .5) * 50, lerp(240, 840, (i + .5) / ns[l]) + (hash(l * 31 + i * 7) - .5) * 40]));
  const E = [];   // synapses: each cell to two or three cells of the next layer, near its own height
  for (let l = 0; l < 3; l++) for (let i = 0; i < ns[l]; i++) {
    const c = Math.round(i * (ns[l + 1] - 1) / (ns[l] - 1));
    for (const d of [-1, 0, 1]) { const j = c + d; if (j < 0 || j >= ns[l + 1] || (d && hash(l * 7 + i * 13 + d * 3) < .35)) continue; E.push([l, i, j]); }
  }
  const P = [];   // every path through the four layers, for sparks
  const walk = (l, path) => { if (l === 3) { P.push(path); return; } E.filter(e => e[0] === l && e[1] === path[l]).forEach(e => walk(l + 1, [...path, e[2]])); };
  for (let i = 0; i < ns[0]; i++) walk(0, [i]);
  return { xs, ns, names, N, E, P, R: 22, hero: [3, 2] };   // hero: mixed4e:55 (cat faces, car fronts, cat legs)
})();
// the spark's path k (deterministic); end: make it finish on that cell of the last layer
function netPath(k, end) { const C = end == null ? NET.P : NET.P.filter(p => p[3] === end); return C[Math.floor(hash(k * 7.31 + 2) * C.length)]; }
// A synapse from cell (l, i) to (l + 1, j) as a cubic: point at u in 0..1
function netSyn(l, i, j, u) {
  const [x0, y0] = NET.N[l][i], [x1, y1] = NET.N[l + 1][j], ax = x0 + NET.R, bx = x1 - NET.R * 2.2, dx = (bx - ax) * .45, v = 1 - u;
  return [v * v * v * ax + 3 * v * v * u * (ax + dx) + 3 * v * u * u * (bx - dx) + u * u * u * bx, v * v * v * y0 + 3 * v * v * u * y0 + 3 * v * u * u * y1 + u * u * u * y1];
}
// o.lit(l, i) 0..1 glow of each cell; o.sparks [{ path, t0 }] (a spark crosses a layer every HOP s); o.dim 0..1 how dark the
// unlit network is; o.curves: lit first-layer cells show a little curve at their own orientation (curve detectors)
function neuronNet(c, t, o = {}) {
  const HOP = o.hop ?? .32, R = NET.R, dim = o.dim ?? 1, base = mixCol('#6C6680', '#3A3546', dim), line = mixCol('#8A86A0', '#4A4558', dim), gold = '#E9C766';
  const lit = (l, i) => clamp(o.lit ? o.lit(l, i) : 0);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  // synapses (faint), with a bouton where each meets the next cell's dendrites
  c.strokeStyle = line; c.lineWidth = 2; c.globalAlpha = .7;
  for (const [l, i, j] of NET.E) { c.beginPath(); for (let k = 0; k <= 16; k++) { const [x, y] = netSyn(l, i, j, k / 16); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); const [bx, by] = netSyn(l, i, j, 1); c.fillStyle = line; c.beginPath(); c.arc(bx, by, 3.5, 0, TAU); c.fill(); }
  c.globalAlpha = 1;
  // sparks: a bright head running along each hop, the synapse glowing behind it
  for (const sp of o.sparks || []) {
    const u = (t - sp.t0) / HOP; if (u < 0 || u >= 3) continue;
    const l = Math.floor(u), q = u - l, i = sp.path[l], j = sp.path[l + 1];
    c.strokeStyle = gold; c.lineWidth = 4; c.globalAlpha = .85 * (sp.a ?? 1); c.beginPath();
    for (let k = 0; k <= 16; k++) { const uu = k / 16 * q, [x, y] = netSyn(l, i, j, uu); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    const [hx, hy] = netSyn(l, i, j, q), g = c.createRadialGradient(hx, hy, 0, hx, hy, 26); g.addColorStop(0, 'rgba(255,236,170,.95)'); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.beginPath(); c.arc(hx, hy, 26, 0, TAU); c.fill(); c.globalAlpha = 1;
  }
  // the cells
  NET.N.forEach((col, l) => col.forEach(([x, y], i) => {
    const k = lit(l, i), cl = mixCol(base, gold, k), st = mixCol(line, '#F6DD8A', k);
    if (k > .2) { const g = c.createRadialGradient(x, y, R * .5, x, y, R * 3.2); g.addColorStop(0, `rgba(255,214,140,${.45 * k})`); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R * 3.2, 0, TAU); c.fill(); }
    c.strokeStyle = st; c.lineWidth = 2.6;
    for (let d = 0; d < 4; d++) {   // dendrites on the input side, each forking once
      const a = Math.PI + (d - 1.5) * .45 + (hash(l * 5 + i * 3 + d) - .5) * .2, L = R * (1.4 + .5 * hash(l + i * 2 + d)), sx = x + Math.cos(a) * R, sy = y + Math.sin(a) * R, ex = x + Math.cos(a) * (R + L), ey = y + Math.sin(a) * (R + L), fx = lerp(sx, ex, .6), fy = lerp(sy, ey, .6);
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.moveTo(fx, fy); c.lineTo(fx + Math.cos(a + .6) * L * .45, fy + Math.sin(a + .6) * L * .45); c.stroke();
    }
    c.beginPath(); c.moveTo(x + R, y); c.lineTo(x + R * 1.5, y); c.stroke();   // the axon hillock
    c.fillStyle = cl; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = mixCol('#2A2633', '#B88A2E', k); c.beginPath(); c.arc(x - R * .18, y - R * .12, R * .34, 0, TAU); c.fill();   // nucleus
    if (o.curves && l === 0 && k > .5) { const a0 = i / NET.ns[0] * TAU; c.strokeStyle = DQ.ink; c.lineWidth = 3.5; c.beginPath(); c.arc(x, y, R * .62, a0, a0 + 1.7); c.stroke(); }
    else if (k > .5 && (l === 1 || l === 2)) for (let s = 0; s < 3; s++) {   // a tiny feature-visualisation swirl
      c.strokeStyle = ['#C9472A', '#2E6F86', '#7A9A3A'][s]; c.lineWidth = 2; c.beginPath();
      for (let a = 0; a < 12; a++) { const q = a / 11, rr = 3 + q * R * .7; c.lineTo(x + Math.cos(q * 9 + s * 2 + i) * rr, y + Math.sin(q * 9 + s * 2 + i) * rr); } c.stroke();
    }
  }));
  if (o.labels !== false) NET.xs.forEach((x, l) => skText(c, NET.names[l], x, 920, 24, { font: DQF.mono, col: mixCol('#8A86A0', '#5A5468', dim) }));
  c.restore();
}

// ---------- the anglepoise lamp (V1a's night lamp, then the one on her bench) ----------
// arm: the arm's points from its fixing to the shade's back; (lx, ly) the shade, aimed along ang (radians); on 0..1;
// o.s scale, o.ink line colour (darker on the night page), o.pool [x, y, r]: where its light lands (drawn when on).
function anglepoise(arm, lx, ly, ang, on, o = {}) {
  const sc = o.s ?? 1, ink = o.ink || DQ.ink, sp = (d, w) => [lx + (Math.cos(ang) * d - Math.sin(ang) * w) * sc, ly + (Math.sin(ang) * d + Math.cos(ang) * w) * sc];
  paint(ribbon([...arm, sp(-60, 0)], 13 * sc, 11 * sc), { wash: '#6E5A3A', fill: '#4A3C26', fillOp: 60, ink, sw: .45 * sc });
  if (arm.length > 1) paint(ellPts(arm[arm.length - 1][0], arm[arm.length - 1][1], 14 * sc, 14 * sc, 10), { wash: '#8E6A2E', ink, sw: .35 * sc });   // the joint
  paint(natCR([sp(-62, -16), sp(-62, 16), sp(-30, 34), sp(40, 66), sp(70, 74), sp(70, -74), sp(40, -66), sp(-30, -34)], 4), { wash: '#8E6A2E', fill: DQ.brassLt, fillOp: 60, bleed: .04, tex: .5, ink, sw: .5 * sc });
  paint(Array.from({ length: 20 }, (_, k) => sp(70 + 16 * Math.cos(k / 20 * TAU), 74 * Math.sin(k / 20 * TAU))), { wash: on > 0 ? '#FFF1C8' : '#3A3226', ink, sw: .4 * sc });   // the mouth, lit or dark
  if (on <= 0) return;
  if (o.pool) queue2d(c => {   // the cone of light and the pool where it lands
    const [m1, m2] = [sp(70, -66), sp(70, 66)], [px, py, pr] = o.pool;
    c.save(); c.globalAlpha = (o.cone ?? .22) * on; const g = c.createLinearGradient(...sp(70, 0), px, py + pr * .5); g.addColorStop(0, 'rgba(255,222,160,1)'); g.addColorStop(1, 'rgba(255,222,160,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(...m1); c.lineTo(px - pr * 1.4, py + pr * .7); c.lineTo(px + pr * 1.3, py + pr * .9); c.lineTo(...m2); c.closePath(); c.fill(); c.restore();
    c.save(); c.translate(px, py + pr * .5); c.scale(1.6, 1); const p2 = c.createRadialGradient(0, 0, 0, 0, 0, pr); p2.addColorStop(0, `rgba(255,226,170,${(o.poolA ?? .3) * on})`); p2.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = p2; c.fillRect(-pr, -pr, 2 * pr, 2 * pr); c.restore();
  }, { screen: !o.world });
  return { mouth: sp(60, 0) };
}
