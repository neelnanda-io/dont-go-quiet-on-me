// dgq/shoggoth.js: the model, drawn as the shoggoth-with-a-smiley-face meme, growing from a toy into a fortress.
// Neel (2 Oct): "a cute shoggoth that starts extremely tiny and toy, and gets larger and byzantine and complex, and
// surrounded by thorns/walls/defences as the song goes on". Target look: video/style/a_growth.png.
//
// shoggoth(x, y, s, g, t, o)
//   (x, y)  the middle of its base, on the ground        s  body radius in px (size is separate from growth)
//   g       growth 0..5, continuous:
//     0 toy         a soft indigo dome, three big eyes, chunky stubby tentacles, one smiley mask on a string
//     1 young       more eyes, longer curling tentacles
//     2 patterned   circuit-lace skin, a second and a third mask
//     3 byzantine   the skin gilds over, filigree scrolls, thorny vines start up its body
//     4 defended    thorns everywhere, a ring of stone walls and towers rising round it, eyes in the arrow slits
//     5 fortress    a walled ring seen from a little above: walls on the sides and in front (low), the creature rising
//                   clearly out of the middle (Neel, 2 Oct: "more on the sides and lower half, like a circle that we're
//                   looking into from a bit above ... you should still be able to see the shoggoth clearly")
//   o.ring  { rx, ry, wh, cy }: override the ring's size (radii, wall height, centre y); default sized from the body
//   o.look  [x, y] a point every eye looks at (default: they wander)    o.seed  a per-creature variation
//   o.lookK 0..1: how far the eyes have turned from wandering to o.look (default 1)
//   o.frontK 0..1: scales the front arms (default 1). A giant framed close shows only their roots, as flat wedges cut
//           off by the frame, so the hook draws them back under the skirt as it towers
//   o.blinkAll  a time at which every eye blinks together               o.crush  0..1 squash (pressing on glass)
//   o.wake  0..~2: eyes open one by one (omit: awake)   o.stare 0..1: every pupil to the centre (looking at us)
//   o.wave  { j, k }: tentacle j raised and waving, k 0..1. j 1 / 2: the front arms right / left of the face (in front of
//           the body); j 3 / 4: the side arms right / left, which wave out beside the body (reads best on a small creature)
//   o.wink  0..1: the smiley mask winks (verse 5: "you knew it was a play")
// shogTrace(x, y, s, g, t, o): the same creature traced in pencil, outline only (verse 5's copies of it); see the bottom.
// Pure function of (t, args). Randomness comes from hash(), the cached eye layout, or the boil-seeded stream.

const SHOG = {
  nEyes: g => Math.min(144, 3 + 2.5 * g + 5.2 * g * g),   // full grown (g 5): 144, GPT-2 Small's 12 x 12 heads (the fortress tag; reference bank r2 T82)
  nTent: g => Math.min(14, 5 + 1.8 * g),   // continuous: the newest arm grows in (no re-layout when the count ticks up)
  MAXEYE: 150,
  // the growth at which eye i (i >= 3) appears: nEyes(g) = i solved for g
  eyeG: i => i < 3 ? -1 : (-2.5 + Math.sqrt(6.25 + 20.8 * (i - 3))) / 10.4,
  POP: .12,   // an eye takes this much growth to pop fully open, however fast g is moving
};

// The silhouette: a tall dome (the mantle) over a short skirt that spreads on the ground. All in px around (x, y).
function shogBody(x, y, s, g, t, seed, crush = 0) {
  const n = 48, P = [], breathe = 1 + .02 * Math.sin(t * 1.5 + seed) - .28 * crush;
  const rx = s * (.92 + .12 * g / 5) * (1 + .32 * crush), ry = s * (1.08 + .4 * clamp((g - 1) / 4)) * breathe;
  const cy = y - s * .3;                                     // the dome's widest line, a little above the ground
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const r = 1 + .035 * Math.sin(3 * a + t * 1.1 + seed) + .025 * Math.sin(5 * a - t * .8 + seed * 3)
      + (g / 5) * (.06 * Math.sin(7 * a + seed * 2) + .04 * Math.sin(11 * a + t * .45));
    let px = Math.sin(a) * rx * r, py = -Math.cos(a) * ry * r;
    if (py > 0) { const k = py / (ry * r); py = s * .3 * Math.pow(k, .8); px *= 1 + .14 * k; }   // skirt down to the ground
    P.push([x + px, cy + py]);
  }
  return { P, rx, ry, cx: x, cy };
}

// Eye layout (cached per seed): the face, then best-candidate (Mitchell) sampling. Each new eye goes in the biggest gap
// in the dome, sized to 80% of its clearance, so eyes spread evenly at every growth level and never overlap.
// Coordinates in units of s, relative to (cx, cy): X right, Y down (the dome is Y < 0).
const SHOG_FACE = [[-.3, -.55, .22], [.2, -.62, .27], [-.03, -.98, .12], [.5, -.3, .1]];
const _shogEyes = {};
function shogEyeLayout(seed) {
  if (_shogEyes[seed]) return _shogEyes[seed];
  const rnd = lcg(9001 + Math.round(seed * 97)), E = SHOG_FACE.map(([X, Y, r]) => ({ X, Y, r }));
  const inDome = (X, Y) => (X / .86) ** 2 + ((Y + .48) / .78) ** 2 < 1 && Y < -.02;
  const mask = { X: .06, Y: -.12, r: .2 };
  while (E.length < SHOG.MAXEYE) {
    let best = null;
    for (let k = 0; k < 40; k++) {
      const X = (rnd() * 2 - 1) * .9, Y = -rnd() * 1.3; if (!inDome(X, Y)) continue;
      let clear = Infinity; for (const e of E) clear = Math.min(clear, Math.hypot(X - e.X, Y - e.Y) - e.r);
      if (E.length < 30) clear = Math.min(clear, Math.hypot(X - mask.X, Y - mask.Y) - mask.r);
      const edge = 1 - Math.sqrt((X / .86) ** 2 + ((Y + .48) / .78) ** 2);   // stay off the outline
      clear = Math.min(clear, edge * .7);
      if (!best || clear > best.c) best = { X, Y, c: clear };
    }
    if (!best) continue;
    E.push({ X: best.X, Y: best.Y, r: clamp(best.c * .8, .018, .1) });
  }
  return (_shogEyes[seed] = E);
}
function shogBlink(t, i, seed, all) {
  const P = 3.2 + 3.4 * hash(i * 3.1 + seed), ph = hash(i * 5.7 + seed) * P, k = ((t + ph) % P);
  let c = k < .16 ? 1 - Math.abs(k / .08 - 1) : 0;
  if (all != null && t >= all && t < all + .18) c = Math.max(c, 1 - Math.abs((t - all) / .09 - 1));
  return 1 - clamp(c);
}

// The arms' geometry, shared by shoggoth() and shogTrace(): [{ P (the centre line, root to tip), w0 (root width), front }].
function shogTents(B, s, g, t, seed, base, o = {}) {
  const nT = SHOG.nTent(g), dT = 2 / nT, tents = [];
  for (let j = 0; j < Math.ceil(nT); j++) {
    const grow = clamp(nT - j); if (grow < .05) continue;
    const side = j === 0 || j % 2 ? 1 : -1, u = side * Math.ceil(j / 2) * dT, hj = hash(j * 9.1 + seed), au = Math.abs(u);
    const bx = B.cx + u * B.rx * .62, by = base - s * .16;
    const wk = o.wave && o.wave.j === j ? clamp(o.wave.k) : 0;            // a waving arm stretches up to be seen
    const fk = j <= 2 ? o.frontK ?? 1 : 1; if (fk < .05) continue;
    const len = s * (.7 + .9 * clamp(g / 2.5)) * (.8 + .4 * hj) * grow * (1 + .7 * wk) * fk;   // full length: the ring's near wall hides their roots
    const w0 = s * (.26 - .06 * g / 5) * (.85 + .3 * hash(j + seed)) * (.35 + .65 * grow) * (.4 + .6 * fk);
    // heading: outward and a little down at the root, then curling up into a spiral at the tip (screen y is down)
    // side arms reach out and curl up; front arms (under the face) step down and outward and curl AWAY from the face
    // (curling inward they read as a moustache under the smiley). The three middle arms are the front ones, always.
    const front = j <= 2;
    const a0 = side > 0 ? (front ? 1.15 : lerp(.85, -.05, au)) : Math.PI - (front ? 1.15 : lerp(.85, -.05, au)), curl = front ? -1.6 - .8 * hj : 2.6 + 1.6 * hj;
    const P = [[bx, by]]; let px = bx, py = by;
    for (let k = 1; k <= 14; k++) {
      const q = k / 14, wave = .22 * Math.sin(t * (1.1 + .6 * hj) + j * 1.7 + q * 4);
      let a = a0 - side * (curl * Math.pow(q, 2.2) + wave * q);
      if (wk > 0) a = lerp(a, -Math.PI / 2 + side * (front ? .55 : 1.0) + .55 * Math.sin(t * 7 + q * 2) * q, wk);   // up and out: past the mask, or out beside the body
      const step = len / 14 * (1 - .45 * q);
      px += Math.cos(a) * step; py += Math.sin(a) * step;
      P.push([px, py > base ? base + (py - base) * .3 : py]);   // squash onto the ground rather than clamp to a line
    }
    tents.push({ P, w0, front });
  }
  return tents;
}

function shoggoth(x, y, s, g, t, o = {}) {
  g = clamp(g, 0, 5);
  const seed = o.seed ?? 1, crush = o.crush ?? 0, key = 'shog' + seed;
  const sw = clamp(s / 150, .3, 1.5);                       // ink weight in world units, scaled with size
  const gold = ease(seg(g, 2.6, 3.6)), skin = mixCol(DQ.indigo, DQ.indigoDk, .35 * gold), skinDk = mixCol(DQ.indigoDk, '#141833', .4 * gold);   // Byzantine: deep blue with gold ornament
  const skinLt = mixCol(DQ.indigoLt, '#FFFFFF', .15);
  const B = shogBody(x, y, s, g, t, seed, crush);
  const wallK = ease(seg(g, 3.9, 5)), base = y + s * .04;
  const lookAt = (ex, ey, i) => {
    let v = [Math.sin(t * .37 + i * 1.3 + seed), .3 * Math.sin(t * .29 + i * 2.1)];   // wandering
    if (o.look) {   // o.lookK 0..1 turns the eyes from wandering to the point smoothly (default 1: straight there)
      const dx = o.look[0] - ex, dy = o.look[1] - ey, d = Math.hypot(dx, dy) || 1, k = o.lookK ?? 1;
      v = [lerp(v[0], dx / d, k), lerp(v[1], dy / d, k)];
    }
    const st = o.stare ?? 0; return [v[0] * (1 - st), v[1] * (1 - st) + .05 * st];
  };
  const eyeOpen = (i, blink) => o.wake == null ? blink : Math.min(blink, clamp((o.wake - i * .14) * 3));
  const D = (X, Y) => [B.cx + X * s * (B.rx / s), B.cy + Y * s * (B.ry / s) / 1.22];   // layout units -> world
  // the ring fortress: an ellipse on the ground round the creature's base, seen from a little above
  const Hm = B.ry * 1.25, RG = o.ring || {};
  const R = { cx: B.cx, cy: RG.cy ?? base, rx: RG.rx ?? B.rx * 1.45, ry: RG.ry ?? B.rx * 1.45 * .2, wh: (RG.wh ?? Hm * .24) * wallK };
  if (wallK > 0) ringFortress(R, 'back', s, sw, t, seed, key, g, o, lookAt);

  // --- tentacles: rooted under the skirt, splaying out along the ground and curling up at the tips. Arm j keeps its
  // identity as it grows: j = 0 is the middle arm, then they alternate right (odd j) and left (even j), dT apart. As g
  // grows the count rises continuously: the arms slide inward to make room and the newest grows in at an outer edge, so
  // nothing jumps (Neel, 3 Oct: the growth was "way too jerky"; the old layout re-spaced every arm when the count ticked).
  boilSeed(key + 'tent');
  const tents = shogTents(B, s, g, t, seed, base, o);
  const drawTent = T => {
    bigPaint(ribbon(T.P, T.w0, T.w0 * .06), { wash: skinDk, fill: skin, fillOp: 80, bleed: .05, tex: .4, ink: DQ.ink, sw: sw * .85 });
    const sk = clamp((g - .4) / .3);   // suckers grow in (they used to pop on at g .4)
    if (sk > 0 && T.w0 > 7) for (let k = 3; k < 10; k += 2) {   // suckers along the underside
      const [qx, qy] = T.P[k], r = T.w0 * .12 * (1 - k / 15) * sk;
      inkPath2d(ell2d(qx, qy + T.w0 * .22 * (1 - k / 9), r * 1.3, r, 0, 8, .2), { col: DQ.ink, sw: Math.max(.5, sw * .45), close: true, fill: mixCol(skinLt, DQ.cream, .4) });
    }
  };
  // a cast shadow on the paper grounds it (a soft grey-blue watercolour pool)
  boilSeed(key + 'shadow');
  bigPaint(ellPts(B.cx + s * .12, base + s * .02, B.rx * (1.5 + .6 * wallK), s * .2, 24, s * .02), { fill: '#5B6A7E', fillOp: 55, bleed: .3, tex: .4, ink: null });
  tents.filter(T => !T.front).forEach(drawTent);

  // --- the body: flat skin wash with a watercolour bloom, a highlight on the upper left, hatched shadow on the lower right
  boilSeed(key + 'body');
  bigPaint(B.P, { wash: skin, fill: mixCol(skin, DQ.indigoDk, .25), fillOp: 90, bleed: .1, tex: .6, border: .5, ink: DQ.ink, sw: sw * 1.15, curv: .6 });
  if (s < 1600) bigPaint(ellPts(B.cx - B.rx * .32, B.cy - B.ry * .62, B.rx * .38, B.ry * .26, 18, s * .01, -.5), { fill: skinLt, fillOp: 120, bleed: .25, tex: .5, ink: null });   // the highlight (a flat blob at huge sizes)
  const shade = B.P.filter(([px, py]) => px > B.cx + B.rx * .1 && py > B.cy - B.ry * .7);
  if (shade.length > 4) bigPaint([[B.cx + B.rx * .1, B.cy - B.ry * .5], ...shade], { hatch: { d: Math.max(3.5, s * .05), a: .8, o: { rand: .2 }, b: 'HB', c: skinDk, w: .7 }, ink: null });
  // the underside of the skirt, in its own shadow near the ground (on a giant the skirt is a wide band of the frame)
  const under = B.P.filter(([, py]) => py > B.cy + s * .16);
  if (under.length > 4) bigPaint(under, { hatch: { d: Math.max(3.5, s * .035), a: -.7, o: { rand: .2 }, b: 'HB', c: skinDk, w: .7 }, ink: null });
  flushLetters();
  if (wallK < .25) tents.filter(T => T.front).forEach(drawTent);   // inside the ring they are hidden (the draped tips show instead)
  flushLetters();

  // --- circuit lace (g >= 1.6): Manhattan traces with vias, in pale ink. (It used to turn gold as the skin "gilded";
  // Neel, 3 Oct: "I don't get the yellow/gold lines on the shoggoth", so it stays pale and the byzantine growth is all
  // eyes, masks, arms and thorns.)
  const nTr = Math.floor(clamp(g - 1.6, 0, 2.6) * 16);
  if (nTr) {
    boilSeed(key + 'lace');
    const lc = DQ.lace, lw = Math.max(.6, s * .011);
    for (let k = 0; k < nTr; k++) {
      let X = (hash(k * 3.3 + seed) * 2 - 1) * .7, Y = -.15 - hash(k * 5.1 + seed) * .85;
      const P = [D(X, Y)];
      for (let m = 0; m < 3 + (k % 3); m++) {
        if (m % 2) Y = clamp(Y + (hash(k * 11 + m) - .5) * .35, -1.05, -.1); else X = clamp(X + (hash(k * 13 + m) - .5) * .45, -.75, .75);
        P.push(D(X, Y));
      }
      const a = clamp((g - 1.6 - k / 15) * 3);
      inkPath2d(P, { col: lc, sw: lw, j: .3, alpha: a });
      const [ex, ey] = P[P.length - 1]; inkPath2d(ell2d(ex, ey, lw * 2.4, lw * 2.4, 0, 8, .1), { col: lc, sw: lw, close: true, fill: skin, alpha: a });
    }
  }
  // --- filigree scrolls: dropped with the gold (see the lace). Kept as a switch, off.
  if (false && g > 3) {
    boilSeed(key + 'fili');
    const nf = Math.floor(clamp(g - 2.9, 0, 1.6) * 16);
    for (let k = 0; k < nf; k++) {
      const [fx, fy] = D((hash(k * 2.7 + seed + 40) * 2 - 1) * .7, -.2 - hash(k * 4.9 + seed + 40) * .8), r0 = s * (.05 + .04 * hash(k + 3)), dir = k % 2 ? 1 : -1;
      const P = []; for (let m = 0; m <= 22; m++) { const a = m / 22 * TAU * 1.6 * dir, r = r0 * (1 - m / 26); P.push([fx + Math.cos(a) * r, fy + Math.sin(a) * r]); }
      inkPath2d(P, { col: DQ.goldLt, sw: Math.max(.8, s * .016), j: .2, alpha: clamp((g - 2.9 - k / 16) * 3) });
    }
  }

  // --- eyes: the face first, then more and more, each popping open as growth passes its threshold. The pop takes a fixed
  // amount of growth (SHOG.POP), not a fixed fraction of an eye, so a fast-growing creature blooms eyes over several
  // frames instead of flashing them in
  boilSeed(key + 'eyes');
  const nE = SHOG.nEyes(g), L = shogEyeLayout(seed), wallTop = R.cy + R.ry - R.wh;   // top of the ring's near wall
  for (let i = 0; i < Math.ceil(nE); i++) {
    const e = L[i], [ex, ey] = D(e.X, e.Y);
    const pk = backOut(clamp((g - SHOG.eyeG(i)) / SHOG.POP)), sz = s * e.r * pk;   // (not "pop": that is p5's)
    if (sz < .8) continue;
    if (wallK > .05 && ey > wallTop - sz && Math.abs(ex - R.cx) < R.rx) continue;   // hidden behind the near wall
    eye2d(ex, ey, sz, lookAt(ex, ey, i), eyeOpen(i, shogBlink(t, i, seed, o.blinkAll)), skin);
  }
  flushLetters();

  // --- masks: the smiley on a string, shrinking relative to the body; two more appear around g 2-3, then go
  boilSeed(key + 'mask');
  const mr = s * .25 / (1 + .55 * g), up = 0;   // the smiley stays on its face to the end
  const [mx, my] = D(.06, -.12);
  const masks = [[mx, my, mr, 0]];
  if (g > 2.1 && g < 4.2) masks.push([...D(-.55, -.3), mr * .85 * backOut(clamp((g - 2.1) * 3)) * (1 - seg(g, 3.8, 4.2)), -.3]);
  if (g > 2.6 && g < 4.2) masks.push([...D(.58, -.75), mr * .75 * backOut(clamp((g - 2.6) * 3)) * (1 - seg(g, 3.8, 4.2)), .25]);
  const drawMasks = () => masks.forEach(([cx, cy, r, tilt], k) => {
    if (r < 1.5) return;
    const strings = k === 0 && up < .4 ? [[[cx - r * .95, cy - r * .2], [cx - r * 2.4, cy - r * 1.2]], [[cx + r * .95, cy - r * .2], [cx + r * 2.4, cy - r * 1.0]]] : [];
    smileyMask(cx, cy, r, { tilt, gild: gold > .5 && k > 0, strings, wink: k === 0 ? o.wink : 0 });
  });
  if (up < .5) drawMasks();

  // --- a briar hedge (g >= 3.1): thorny canes rising from the ground round it and arching over, Sleeping-Beauty style
  const briars = (cx, halfW, height, nMax, gStart, keyV, gy = base, gap = 0) => {
    boilSeed(key + keyV);
    const nV = Math.min(nMax, 2 + Math.floor((g - gStart) * 6));
    for (let v = 0; v < nV; v++) {
      const hv = hash(v * 6.1 + seed + nMax), grow = clamp((g - gStart - v * .12) * 1.5);
      if (grow <= 0) continue;
      const x0 = cx + (v / Math.max(1, nMax - 1) * 2 - 1) * halfW * (.85 + .15 * hv), lean = (hv - .5) * 1.4 + (x0 < cx ? .35 : -.35);
      if (gap && Math.abs(x0 - cx) < gap) continue;   // keep the gate clear
      const Lc = height * (.55 + .5 * hash(v * 2.3 + seed)) * grow, A = [];
      for (let k = 0; k <= 16; k++) {   // a cane: up, then arching over to one side
        const q = k / 16, a = -Math.PI / 2 + lean * q * q * 1.6 + .12 * Math.sin(q * 7 + v + t * .6);
        const [px, py] = A.length ? A[A.length - 1] : [x0, gy];
        A.push(k ? [px + Math.cos(a) * Lc / 16, py + Math.sin(a) * Lc / 16] : [x0, gy]);
      }
      paint(ribbon(A, s * .075, s * .02), { wash: DQ.thorn, fill: DQ.thornLt, fillOp: 60, bleed: .04, tex: .5, ink: DQ.ink, sw: sw * .6 });
      for (let k = 2; k < A.length - 1; k++) {   // spikes, alternating sides, hooked toward the tip
        const [ax, ay] = A[k - 1], [bx, by] = A[k + 1], dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, sd = k % 2 ? 1 : -1;
        const nx = -dy / d * sd, ny = dx / d * sd, [qx, qy] = A[k], wk = s * .075 * (1 - k / 20) / 2, Lh = s * .11 * (1 - k / 24);
        inkPath2d([[qx + nx * wk - dx / d * Lh * .3, qy + ny * wk - dy / d * Lh * .3], [qx + nx * (wk + Lh) + dx / d * Lh * .35, qy + ny * (wk + Lh) + dy / d * Lh * .35], [qx + nx * wk + dx / d * Lh * .2, qy + ny * wk + dy / d * Lh * .2]], { col: DQ.ink, sw: Math.max(.6, sw * .6), fill: DQ.thornLt, close: true, j: .25 });
      }
    }
    flushLetters();
  };
  if (g > 3.1 && wallK < .05) briars(B.cx, B.rx * 1.3, B.ry * 1.1, 9, 3.1, 'briarB');

  // --- the fortress (g >= 3.9): the near half of the ring wall in front of its base, then briars outside the ring
  if (wallK > 0) {
    // two tentacles reach over the near battlements (it is too big for its walls). They used to hang in front of the two
    // inner towers, starting just above the wall, and read as cut off (Neel, 3 Oct, night: "the front two tentacles are
    // disembodied by the turrets"). So each now stands on wall between towers (towers are at u = +-.38 and +-.92; the gate,
    // its tag and the probe are near 0), rises from behind the wall, arches over the merlons and drapes down the outer face: drawn
    // whole before the near wall, which hides its root, then its draped half again after the wall, so it hangs in front.
    const tent = (P, w0, w1) => paint(ribbon(P, w0, w1), { wash: mixCol(DQ.indigoDk, '#141833', .3), fill: DQ.indigo, fillOp: 80, ink: DQ.ink, sw: sw * .8 });
    const reach = wallK > .25 ? [[-.64, -1], [.53, 1]].map(([u, d]) => {   // (left: between the two left towers; right: past the inner right tower, clear of the probe at the gate)
      const x0 = R.cx + u * R.rx, yTop = R.cy + R.ry * Math.sqrt(Math.max(0, 1 - u * u)) - R.wh, w = s * .12, k = clamp((wallK - .5) * 2), sway = Math.sin(t * 1.3 + u * 5) * s * .02, mh = Math.min(s * .09, R.wh * .35);
      const P = [[x0 - d * s * .09, yTop + R.wh * .55], [x0 - d * s * .06, yTop - mh * .5], [x0, yTop - mh - s * .06], [x0 + d * s * .07, yTop - mh * .45],
                 [x0 + d * s * .1 + sway, yTop + R.wh * .45 * k], [x0 + d * s * .05 + sway, yTop + R.wh * .8 * k], [x0 + d * s * .12 + sway, yTop + R.wh * .7 * k]];
      return { P, w, yTop };
    }) : [];
    for (const T of reach) tent(T.P, T.w, T.w * .1);
    flushLetters();
    ringFortress(R, 'front', s, sw, t, seed, key, g, o, lookAt);
    for (const { P, w, yTop } of reach) {   // the draped half, from where it crosses the wall's top edge, in front of the wall
      const [a, b] = [P[3], P[4]], f = b[1] > a[1] ? clamp((yTop - a[1]) / (b[1] - a[1])) : 1;
      if (f >= 1) continue;   // not draped yet
      tent([[lerp(a[0], b[0], f), lerp(a[1], b[1], f)], b, P[5], P[6]], lerp(w, w * .1, (3 + f) / 6), w * .1);
      flushLetters();
    }
    briars(R.cx, R.rx * .95, Hm * .17, 9, 3.1, 'briarW', R.cy + R.ry + s * .03, R.rx * .14);
  }
  if (up >= .5) drawMasks();   // the smiley, last, perched on the top tower
  flushLetters();
  boilSeed(key + 'done');
  return B;
}

// The ring fortress. R = { cx, cy, rx, ry, wh }: an elliptical curtain wall on the ground (cy = its centre line), wall
// height wh, seen from a little above, so we look into the courtyard over the near wall. part 'back' draws the far half
// (its inner face, in shadow) and the towers behind the creature; 'front' draws the near half (outer face, lit), the
// gate, the arrow slits with their watching eyes, and the front towers. Towers rise 1.7x the wall.
function ringFortress(R, part, s, sw, t, seed, key, g, o, lookAt) {
  if (R.wh < 3) return;
  boilSeed(key + 'ring' + part);
  const front = part === 'front', n = 40, j = s * .006;
  const E = (a, dy = 0, k = 1) => [R.cx + Math.cos(a) * R.rx * k, R.cy + Math.sin(a) * R.ry * k + dy];   // a in [0, 2pi): sin > 0 is the near side
  const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU;
  const arc = (k, dy) => Array.from({ length: n + 1 }, (_, i) => E(a0 + (a1 - a0) * i / n, dy, k));
  // the wall face: outer face for the near half (lit stone), inner face for the far half (shadowed stone)
  const kf = front ? 1 : .94, base = arc(kf, 0), top = arc(kf, -R.wh);
  bigPaint([...base, ...top.reverse()], { wash: front ? DQ.stone : mixCol(DQ.stoneDk, DQ.shadow, .25), fill: front ? DQ.stoneLt : DQ.stoneDk, fillOp: 60, bleed: .06, tex: .7, ink: DQ.sepia, sw: sw * .9 });
  // the walkway on top: the band between the outer and inner top edges
  const outerT = arc(1, -R.wh), innerT = arc(.94, -R.wh);
  bigPaint([...outerT, ...innerT.reverse()], { wash: DQ.stoneLt, ink: DQ.sepia, sw: sw * .6 });
  // stone courses following the curve, and merlons along the outer top edge
  for (let c = 1; c * s * .1 < R.wh - s * .04; c++) inkPath2d(arc(kf, -c * s * .1), { col: DQ.stoneDk, sw: Math.max(.6, s * .007), alpha: .5, j: .5 });
  const mh = Math.min(s * .09, R.wh * .35), nm = 26;
  for (let i = 0; i < nm; i++) {
    const a = a0 + (a1 - a0) * (i + .5) / nm, [mx, my] = E(a, -R.wh), w = (R.rx * Math.PI / nm) * .45 * (front ? 1 : .8);
    paint(rectPts(mx - w / 2, my - mh, w, mh + 2, s * .004), { wash: front ? DQ.stone : DQ.stoneDk, ink: DQ.sepia, sw: sw * .6 });
  }
  flushLetters();
  if (front) {
    // the gate at the front, two tentacle tips peeking out; arrow slits with eyes along the near wall
    const [gx, gy] = E(Math.PI / 2), gw = Math.min(R.rx * .16, s * .5), gh = Math.min(R.wh * .8, s * .55);
    const arch = [[gx - gw / 2, gy], [gx - gw / 2, gy - gh * .6]]; for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; arch.push([gx + Math.cos(a) * gw / 2, gy - gh * .6 + Math.sin(a) * gh * .4]); } arch.push([gx + gw / 2, gy]);
    paint(arch, { wash: DQ.shadow, ink: DQ.sepia, sw: sw * .8 });
    for (let k = 0; k < 2; k++) { const t0 = gx - gw / 2 + gw * (.3 + .4 * k); paint(ribbon([[t0, gy], [t0 + gw * .1 * (k ? 1 : -1), gy - gh * .28], [t0 + gw * .03, gy - gh * .42 - s * .04 * Math.sin(t * 2 + k)]], gw * .2, gw * .03), { wash: DQ.indigoDk, ink: DQ.ink, sw: sw * .6 }); }
    const nS = 9;
    for (let m = 0; m < nS; m++) {
      const a = .25 + (Math.PI - .5) * m / (nS - 1); if (Math.abs(a - Math.PI / 2) < .18) continue;
      const [sx, sy0] = E(a), sh = Math.min(R.wh * .42, s * .2), sl = sh * .42, sy = sy0 - R.wh * .55;
      inkPath2d(rrPts(sx - sl / 2, sy - sh / 2, sl, sh, sl * .45), { col: DQ.sepia, sw: Math.max(.6, sw * .7), fill: DQ.shadow, close: true, j: .2 });
      const i = 300 + m; eye2d(sx, sy, sl * .4, lookAt(sx, sy, i), shogBlink(t, i, seed, o.blinkAll), DQ.shadow);
    }
    flushLetters();
  }
  // round towers on the ring, in this half: a cylinder with a crenellated cap and one slit
  const NT = 8;
  for (let k = 0; k < NT; k++) {
    const a = (k + .5) / NT * TAU; if ((Math.sin(a) > 0) !== front) continue;
    const [tx, ty] = E(a), tr = Math.min(R.rx * .07, s * .22) * (.8 + .4 * Math.max(0, Math.sin(a))), th = R.wh * 1.7;
    paint(rectPts(tx - tr, ty - th, tr * 2, th, j), { wash: front ? DQ.stone : DQ.stoneDk, fill: DQ.stoneLt, fillOp: 50, tex: .7, ink: DQ.sepia, sw: sw * .85 });
    paint(rectPts(tx + tr * .25, ty - th, tr * .75, th, j * .5), { hatch: { d: Math.max(3, s * .035), a: 1.1, o: { rand: .2 }, b: 'HB', c: DQ.stoneDk, w: .6 }, ink: null });
    paint(ellPts(tx, ty - th, tr * 1.08, tr * .32, 16), { wash: DQ.stoneLt, ink: DQ.sepia, sw: sw * .7 });
    merlons(tx - tr, ty - th, tr * 2, s * .6, sw, th);
    flushLetters();
    if (front) { const sh = Math.min(th * .3, s * .16), sl = sh * .42, sy = ty - th * .55; inkPath2d(rrPts(tx - sl / 2, sy - sh / 2, sl, sh, sl * .45), { col: DQ.sepia, sw: Math.max(.6, sw * .7), fill: DQ.shadow, close: true, j: .2 }); eye2d(tx, sy, sl * .4, lookAt(tx, sy, 400 + k), shogBlink(t, 400 + k, seed, o.blinkAll), DQ.shadow); flushLetters(); }
  }
}

function stoneCourses(x, y, w, h, s, seed) {
  const row = Math.max(7, s * .1), brick = row * 2.2, lw = Math.max(.6, s * .008);
  for (let r = 1; r * row < h - row * .3; r++) {
    const yy = y + h - r * row;
    inkPath2d([[x + 3, yy], [x + w - 3, yy]], { col: DQ.stoneDk, sw: lw, alpha: .55, j: .5 });
    for (let bx = x + (r % 2 ? brick / 2 : 0) + brick * hash(seed + r) * .3; bx < x + w - 6; bx += brick) if (bx > x + 4) inkPath2d([[bx, yy], [bx, yy + row]], { col: DQ.stoneDk, sw: lw, alpha: .5, j: .4 });
  }
}
function merlons(x, y, w, s, sw, h) {   // battlements, never taller than 40% of the wall they crown
  const n = Math.max(2, Math.round(w / (s * .15))), mw = w / (2 * n - 1), mh = Math.min(s * .11, h * .4);
  if (mh < 2) return;
  for (let k = 0; k < n; k++) paint(rectPts(x + k * 2 * mw, y - mh, mw, mh + 2, s * .006), { wash: DQ.stone, ink: DQ.sepia, sw: sw * .7 });
}

// ---------- the creature traced in pencil (verse 5's copies of the model) ----------
// "a metamodel is a copy of the model being studied" (WorkspaceBench), so verse 5's readers are the creature itself, traced
// in pencil on tracing paper: the same silhouette, arms, eyes and masks as shoggoth(), outline only, in crisp Canvas2D.
//   o.reveal 0..1  how much of each outline the pencil has drawn so far (eyes and masks come in last)
//   o.shut 0..1    eyes closed (listening)            o.look [x, y]  where the eyes look (default: they wander)
//   o.cutY         world y: only the part below it is drawn, with a scissor zigzag along the cut (the half-copy that rebuilds
//                  the activation: "truncated to its first l layers")
//   o.alpha, o.col (pencil), o.fill (the tracing paper inside the lines), o.seed (default 3, the creature's own)
// Returns { B, D }: the body and its layout-to-world map, for props hung on it (headphones, a blindfold, a jacket).
function shogTrace(x, y, s, g, t, o = {}) {
  g = clamp(g, 0, 5);
  const seed = o.seed ?? 3, B = shogBody(x, y, s, g, t, seed), base = y + s * .04, rev = clamp(o.reveal ?? 1), shut = clamp(o.shut ?? 0);
  const tents = shogTents(B, s, g, t, seed, base, o);
  const D = (X, Y) => [B.cx + X * B.rx, B.cy + Y * B.ry / 1.22];   // as in shoggoth()
  const pc = o.col || '#6F6A62', fill = o.fill || 'rgba(248,246,239,.92)', lw = Math.max(1.6, s * .0075);
  const nE = Math.ceil(SHOG.nEyes(g)), L = shogEyeLayout(seed), late = clamp((rev - .8) / .2);
  const mr = s * .25 / (1 + .55 * g), masks = [[...D(.06, -.12), mr]];
  if (g > 2.1 && g < 4.2) masks.push([...D(-.55, -.3), mr * .85 * clamp((g - 2.1) * 3)]);
  if (g > 2.6 && g < 4.2) masks.push([...D(.58, -.75), mr * .75 * clamp((g - 2.6) * 3)]);
  const lookAt = (ex, ey, i) => {
    if (!o.look) return [Math.sin(t * .37 + i * 1.3 + seed), .3 * Math.sin(t * .29 + i * 2.1)];
    const dx = o.look[0] - ex, dy = o.look[1] - ey, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d];
  };
  queue2d(c => {
    if (rev <= 0) return;   // the pencil hasn't started
    c.save(); c.globalAlpha *= o.alpha ?? 1; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = pc; c.lineWidth = lw;
    if (o.cutY != null) { c.beginPath(); c.rect(x - s * 5, o.cutY, s * 10, s * 5); c.clip(); }
    const path = P => { c.beginPath(); P.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); };
    const shape = P => {
      if (rev >= 1) { path(P); c.closePath(); c.fillStyle = fill; c.fill(); c.stroke(); return; }
      path(P.slice(0, Math.max(2, Math.ceil(P.length * rev)))); c.stroke();   // the pencil still going round
    };
    tents.filter(T => !T.front).forEach(T => shape(ribbon(T.P, T.w0, T.w0 * .06)));
    shape(B.P);
    tents.filter(T => T.front).forEach(T => shape(ribbon(T.P, T.w0, T.w0 * .06)));
    if (late > 0) {
      c.globalAlpha *= late;
      for (let i = 0; i < nE; i++) {
        const e = L[i], [ex, ey] = D(e.X, e.Y), sz = s * e.r * clamp((g - SHOG.eyeG(i)) / SHOG.POP); if (sz < 1.5) continue;
        c.lineWidth = Math.max(1.1, Math.min(lw, sz * .14));
        if (shut > .5) { c.beginPath(); c.arc(ex, ey - sz * .45, sz * .9, .55, Math.PI - .55); c.stroke(); continue; }   // asleep: a lid line
        c.beginPath(); c.ellipse(ex, ey, sz, sz * .86 * (1 - shut), 0, 0, TAU); c.fillStyle = fill; c.fill(); c.stroke();
        const [lx, ly] = lookAt(ex, ey, i); c.fillStyle = pc; c.beginPath(); c.arc(ex + lx * sz * .38, ey + ly * sz * .3, sz * .3, 0, TAU); c.fill();
      }
      c.lineWidth = lw;
      for (const [mx, my, r] of masks) {
        if (r < 2) continue;
        c.beginPath(); c.arc(mx, my, r, 0, TAU); c.fillStyle = fill; c.fill(); c.stroke();
        c.fillStyle = pc; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(mx + d * r * .34, my - r * .2, r * .08, r * .13, 0, 0, TAU); c.fill(); }
        c.beginPath(); c.arc(mx, my + r * .05, r * .55, .25, Math.PI - .25); c.stroke();
      }
    }
    c.restore();
    if (o.cutY != null) {   // the cut: a scissor zigzag across the body where the copy stops
      const xs = []; for (let i = 0; i < B.P.length; i++) { const [a1, b1] = B.P[i], [a2, b2] = B.P[(i + 1) % B.P.length]; if ((b1 - o.cutY) * (b2 - o.cutY) <= 0 && b1 !== b2) xs.push(a1 + (o.cutY - b1) / (b2 - b1) * (a2 - a1)); }
      if (xs.length > 1) {
        const x0 = Math.min(...xs), x1 = Math.max(...xs), n = Math.max(4, Math.round((x1 - x0) / 22));
        c.save(); c.globalAlpha *= o.alpha ?? 1; c.strokeStyle = pc; c.lineWidth = lw; c.lineJoin = 'miter'; c.beginPath();
        for (let k = 0; k <= n; k++) { const px = lerp(x0, x1, k / n), py = o.cutY + (k % 2 ? 9 : 0); k ? c.lineTo(px, py) : c.moveTo(px, py); }
        c.stroke(); c.restore();
      }
    }
  });
  return { B, D };
}
