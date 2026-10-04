// dgq/style.js: the look of "Don't Go Quiet On Me": a researcher's field notebook. Ink and watercolour on graph paper,
// specimen-plate callouts, a rubber-stamped year in the corner. (Style direction A, video/style/a_*.png.)
//
// Small, numerous details (eyes, bricks, thorn spikes, circuit traces) are drawn on the crisp 2D layer (queue2d) with a
// hand jitter that re-rolls on the kit's 12 fps boil, so they read as ink without costing a brush stroke each. Big shapes
// (bodies, tentacles, washes) go through paint(). Call flushLetters() to flatten the 2D layer into the scene before
// drawing anything that must sit in front of it.

const DQ = {
  paper: '#F2E8D2', grid: '#A9BCC2', gridDk: '#8FA6AE', margin: '#C9634A', ink: '#2A241E', sepia: '#6B4E33',
  indigo: '#2E3A66', indigoDk: '#1C2244', indigoLt: '#6576AB', lace: '#8E9CCB', teal: '#5E9894', verm: '#C9472A',
  mustard: '#D19C33', gold: '#C49428', goldLt: '#E9C766', smile: '#F2C744', thorn: '#3A2E24', thornLt: '#5C4A39',
  stone: '#C4B496', stoneDk: '#8A7A5E', stoneLt: '#DCCFB4', cream: '#FBF4E4', iris: '#B9562E',
  glass: '#D8E9E6', brass: '#BE8E3E', brassDk: '#7C5A24', brassLt: '#E7C27A', shadow: '#2A241E',
};
const DQF = { serif: 'instrument', soft: 'fraunces', hand: 'caveat', type: 'cmuTT', mono: 'plexMono' };

// ---------- hand-drawn 2D helpers (queued; jitter is drawn from the seeded stream at queue time) ----------
// Points of an ink line with a little hand wobble (j px), so 2D details boil with the brush layer.
const wob2 = (pts, j) => pts.map(([x, y]) => [x + jit(j), y + jit(j)]);
function inkPath2d(pts, o = {}) {   // o: col, sw, close, fill, alpha, cap
  const P = wob2(pts, o.j ?? .6);
  queue2d(c => {
    c.save(); c.globalAlpha *= o.alpha ?? 1; c.lineJoin = 'round'; c.lineCap = o.cap || 'round';
    c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (o.close) c.closePath();
    if (o.fill) { c.fillStyle = o.fill; c.fill(); }
    if (o.col !== null) { c.strokeStyle = o.col || DQ.ink; c.lineWidth = o.sw ?? 1.5; c.stroke(); }
    c.restore();
  }, o);
}
// Draw fn(c) on a clear 2D layer (screen space) and composite it onto everything drawn so far with a blend mode:
// MULTIPLY for night and shadow (a navy multiply darkens the painted figure the way a lamp-lit room would), SCREEN or
// ADD for light. The 2D queue can't do this itself: it is a separate canvas laid over the scene.
function blendLayer(fn, mode = MULTIPLY) {
  flushLetters();
  letG.clear(); const c = letG.drawingContext; c.save(); fn(c); c.restore();
  flushBrush();
  push(); resetMatrix(); translate(-W / 2, -H / 2); blendMode(mode); image(letG, 0, 0); blendMode(BLEND); pop();
  letG.clear();
}
function ell2d(cx, cy, rx, ry, rot = 0, n = 18, j = .4) {
  const P = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; P.push([cx + Math.cos(a) * rx * Math.cos(rot) - Math.sin(a) * ry * Math.sin(rot) + jit(j), cy + Math.cos(a) * rx * Math.sin(rot) + Math.sin(a) * ry * Math.cos(rot) + jit(j)]); }
  return P;
}

// ---------- the notebook page ----------
// Graph paper: 5 mm squares (36 px), a darker line every 5, a red margin rule, punched holes down the left. Drawn crisp
// and in world space, so it stays sharp under a camera zoom. A coffee ring and pencil smudges are deco.
function notebookPage(o = {}) {
  const x0 = o.x0 ?? -200, y0 = o.y0 ?? -200, x1 = o.x1 ?? W + 200, y1 = o.y1 ?? H + 200, sq = o.sq ?? 36, mx = o.margin ?? 230;
  paint(rectPts(x0, y0, x1 - x0, y1 - y0), { wash: DQ.paper, washOp: o.washOp ?? 255, ink: null });
  const grid = typeof STYLE === 'undefined' || STYLE !== 'C';   // cut paper has no printed grid
  queue2d(c => {
    c.save(); c.lineWidth = 1;
    if (grid) for (let x = Math.ceil(x0 / sq) * sq; x <= x1; x += sq) { const major = Math.round(x / sq) % 5 === 0; c.strokeStyle = major ? DQ.gridDk : DQ.grid; c.globalAlpha = major ? .55 : .32; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
    if (grid) for (let y = Math.ceil(y0 / sq) * sq; y <= y1; y += sq) { const major = Math.round(y / sq) % 5 === 0; c.strokeStyle = major ? DQ.gridDk : DQ.grid; c.globalAlpha = major ? .55 : .32; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
    if (o.marginLine !== false) { c.globalAlpha = .55; c.strokeStyle = DQ.margin; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, y0); c.lineTo(mx, y1); c.stroke(); }
    if (o.holes !== false) for (const hy of [H * .18, H * .5, H * .82]) { c.globalAlpha = 1; c.fillStyle = '#E2D6BC'; c.beginPath(); c.arc(70, hy, 22, 0, TAU); c.fill(); c.globalAlpha = .45; c.strokeStyle = DQ.sepia; c.lineWidth = 1.5; c.stroke(); }
    c.restore();
  });
  if (o.ring) coffeeRing(...o.ring);
  flushLetters();   // flatten the grid into the page now, so everything drawn later sits on top of it
}
function coffeeRing(x, y, r, a = .5) {
  boilSeed('ring' + x);
  const P = []; for (let i = 0; i <= 64; i++) { const ang = i / 64 * TAU; P.push([x + Math.cos(ang) * r * (1 + .03 * Math.sin(ang * 3)), y + Math.sin(ang) * r * (1 + .03 * Math.sin(ang * 5))]); }
  queue2d(c => { c.save(); c.globalAlpha = a; c.strokeStyle = '#9C6B3C'; c.lineWidth = 7; c.beginPath(); P.slice(0, 50).forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); c.globalAlpha = a * .5; c.lineWidth = 3; c.beginPath(); P.slice(52).forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); c.restore(); });
}

// ---------- the year stamp (the escalating HUD: Neel's "date in the corner ticking up") ----------
// year may be fractional while it spins: the odometer rolls between whole years. thump: 0..1, a stamp press.
function yearStamp(year, x, y, o = {}) {
  const size = o.size ?? 64, rot = o.rot ?? -.06, col = o.col ?? DQ.verm, a = o.alpha ?? .92, th = o.thump ?? 0;
  const yi = Math.floor(year), f = year - yi, roll = f > .02 ? ease(f) : 0, sc = 1 + .12 * th;
  queue2d(c => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc); c.globalAlpha = a;
    const w = size * 3.1, h = size * 1.32;
    if (o.bg) { c.save(); c.globalAlpha = 1; c.fillStyle = o.bg; c.fillRect(-w / 2 - size * .2, -h / 2 - size * .2, w + size * .4, h + size * .4); c.restore(); }
    c.strokeStyle = col; c.lineWidth = size * .07; c.strokeRect(-w / 2, -h / 2, w, h);
    c.lineWidth = size * .025; c.strokeRect(-w / 2 + size * .11, -h / 2 + size * .11, w - size * .22, h - size * .22);
    c.beginPath(); c.rect(-w / 2 + size * .14, -h / 2 + size * .14, w - size * .28, h - size * .28); c.clip();
    c.font = `500 ${size}px "${FONT.cmuTT}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
    const lh = size * 1.1;
    c.fillText(String(yi), 0, size * .06 - roll * lh); if (roll) c.fillText(String(yi + 1), 0, size * .06 + (1 - roll) * lh);
    c.restore();
  }, { screen: o.screen ?? true });
  // a registry entry so the text checker can see the stamp (it is a label people read)
  tx(String(Math.round(year)), x, y, { size: size * .2, color: col, alpha: 0, role: 'deco', screen: o.screen ?? true });
}

// ---------- specimen tag: a manila label on a string ----------
function specimenTag(x, y, lines, o = {}) {
  const size = o.size ?? 26, rot = o.rot ?? .05, w = o.w ?? size * 7, h = size * (lines.length * 1.25 + .7);
  paint(rrPts(x, y, w, h, size * .2), { wash: o.paper ?? '#EAD9B0', ink: DQ.sepia, sw: .8 });
  inkPath2d(ell2d(x + size * .55, y + h / 2, size * .16, size * .16), { col: DQ.sepia, sw: 1.4, close: true, fill: DQ.paper });
  if (o.string) inkPath2d([[x + size * .4, y + h / 2], ...o.string], { col: DQ.sepia, sw: 1.4 });
  lines.forEach((L, k) => { const l = typeof L === 'string' ? { s: L } : L;   // a line: a string, or { s, font, style, size }
    tx(l.s, x + size * 1.05, y + size * (1.05 + k * 1.25), { font: l.font || o.font || DQF.type, style: l.style, size: l.size || size, color: DQ.ink, align: 'left', role: o.role || 'fine', rot: 0 }); });
}

// ---------- the smiley-face mask (the meme: a friendly face tied onto the shoggoth) ----------
function smileyMask(cx, cy, r, o = {}) {
  const col = o.col ?? DQ.smile, sw = Math.max(.35, r / 30), tilt = o.tilt ?? 0;
  paint(ellPts(cx, cy, r, r * .96, 26, r * .02, tilt), { wash: col, fill: o.gild ? DQ.gold : null, fillOp: 90, bleed: .05, tex: .3, ink: DQ.ink, sw });
  const ex = r * .34, ey = r * .2, er = r * .11, wink = clamp(o.wink ?? 0);   // o.wink 0..1: its right eye (ours) closes
  inkPath2d(ell2d(cx - ex, cy - ey, er * .8, er * 1.25, tilt, 10, r * .01), { col: null, fill: DQ.ink, close: true });
  if (wink < .5) inkPath2d(ell2d(cx + ex, cy - ey, er * .8, er * 1.25 * (1 - 1.6 * wink), tilt, 10, r * .01), { col: null, fill: DQ.ink, close: true });
  else inkPath2d([[cx + ex - er * 1.4, cy - ey + er * .2], [cx + ex, cy - ey - er * .5], [cx + ex + er * 1.4, cy - ey + er * .2]], { col: DQ.ink, sw: Math.max(1, r * .07), j: r * .005 });   // a happy ^ wink
  const sm = []; for (let i = 0; i <= 10; i++) { const a = lerp(.18, Math.PI - .18, i / 10); sm.push([cx + Math.cos(a) * r * .55, cy + r * .05 + Math.sin(a) * r * .45]); }
  inkPath2d(sm, { col: DQ.ink, sw: Math.max(1, r * .09), j: r * .01 });
  if (o.strings) for (const s of o.strings) inkPath2d(s, { col: DQ.sepia, sw: Math.max(.8, r * .045) });
}

// ---------- an eye (sclera, iris, pupil, lid), crisp ink ----------
// look: [dx, dy] unit-ish direction for the pupil; open: 0..1 (eyelid); sz: radius. col: lid colour (the skin).
function eye2d(x, y, sz, look, open, skin, o = {}) {
  if (open <= .02 || sz < .8) {   // a closed eye: just a lash line
    if (sz >= .8) {   // a sleeping eye: a soft downward arc, not a dash (a dash reads as a frown)
      const P = []; for (let k = 0; k <= 8; k++) { const a = lerp(.15, Math.PI - .15, k / 8); P.push([x - Math.cos(a) * sz * .85, y - sz * .05 + Math.sin(a) * sz * .32]); }
      inkPath2d(P, { col: DQ.ink, sw: Math.max(.8, sz * .13), j: sz * .02 });
    }
    return;
  }
  // more points and a capped wobble for big eyes: a 16-gon reads as faceted past ~100 px, and a wobble of 3% of a huge eye
  // boils its whole outline
  const ry = sz * (.86 * open + .02), lw = Math.max(.7, sz * .13);
  const S = ell2d(x, y, sz, ry, o.rot || 0, Math.round(clamp(16 + sz / 6, 16, 96)), Math.min(sz * .03, 2.5));
  const px = x + clamp(look[0], -1, 1) * sz * .38, py = y + clamp(look[1], -1, 1) * ry * .38, ir = sz * .5, pr = sz * .27;
  queue2d(c => {
    c.save(); c.globalAlpha *= o.alpha ?? 1;
    c.beginPath(); S.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath();
    c.fillStyle = DQ.cream; c.fill(); c.save(); c.clip();
    c.fillStyle = o.iris || DQ.iris; c.beginPath(); c.arc(px, py, ir, 0, TAU); c.fill();
    c.fillStyle = DQ.ink; c.beginPath(); c.arc(px, py, pr, 0, TAU); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(px - ir * .35, py - ir * .4, Math.max(.6, sz * .12), 0, TAU); c.fill();
    if (open < .98) { c.fillStyle = skin; c.fillRect(x - sz * 1.2, y - sz * 1.3, sz * 2.4, sz * 1.3 * (1 - open) + 1); }
    c.restore();
    c.strokeStyle = DQ.ink; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); S.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.stroke();
    c.restore();
  }, o);
}

// ---------- big shapes ----------
// p5.brush silently drops the fill (and sometimes the outline) of a polygon much bigger than the canvas. So shapes that
// can outgrow the frame are clipped to the visible world rectangle plus a margin first (Sutherland-Hodgman); the cut edges
// lie off screen, so their ink line never shows.
function viewRect(pad = 260) {
  if (!CAM) return [-pad, -pad, W + pad, H + pad];
  const hw = W / 2 / CAM.zoom + pad, hh = H / 2 / CAM.zoom + pad, r = Math.hypot(hw, hh);
  return CAM.rot ? [CAM.cx - r, CAM.cy - r, CAM.cx + r, CAM.cy + r] : [CAM.cx - hw, CAM.cy - hh, CAM.cx + hw, CAM.cy + hh];
}
function clipPoly(P, [x0, y0, x1, y1]) {
  const edges = [[p => p[0] >= x0, (a, b) => { const k = (x0 - a[0]) / (b[0] - a[0]); return [x0, a[1] + k * (b[1] - a[1])]; }],
                 [p => p[0] <= x1, (a, b) => { const k = (x1 - a[0]) / (b[0] - a[0]); return [x1, a[1] + k * (b[1] - a[1])]; }],
                 [p => p[1] >= y0, (a, b) => { const k = (y0 - a[1]) / (b[1] - a[1]); return [a[0] + k * (b[0] - a[0]), y0]; }],
                 [p => p[1] <= y1, (a, b) => { const k = (y1 - a[1]) / (b[1] - a[1]); return [a[0] + k * (b[0] - a[0]), y1]; }]];
  let out = P;
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
    }
    if (!out.length) return out;
  }
  return out;
}
// paint(), but safe for shapes bigger than the frame (returns quietly if nothing is on screen)
function bigPaint(P, o) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of P) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const V = viewRect();
  if (x1 - x0 < W * .8 && y1 - y0 < H * .8) return paint(P, o);   // small: untouched (keeps its curvature smoothing)
  const C = clipPoly(o.curv ? through(P.concat([P[0]]), 4) : P, V);
  if (C.length >= 3) paint(C, { ...o, curv: 0 });
}
