// dgq/naturalist.js: the researcher as the approved character sheet draws her (video/style/a_researcher.png, "the
// Naturalist"): dark bob with a fringe, round glasses, an oversized mustard cardigan (V neck, four buttons, two welt
// pockets, drop shoulders, puffy sleeves gathered into ribbed cuffs, ribbed hem) over a cream tee, charcoal cropped
// trousers with turn-ups, brown oxfords. Ink line and watercolour.
//
// A drop-in for researcher() (dgq/board.js), same arguments and the same pose names, so every shot keeps its staging:
//   naturalist(x, y, s, t, o): (x, y) between her feet on the ground; s her height in px (ground to the top of her hair).
//   o.face 1 right / -1 left · o.pose 'stand' | 'sing' | 'lens' | 'lean' | 'hold' (o.hand) | 'sit' · o.back seen from
//   behind · o.noHand · o.mouth 0..1 (singing) · o.hat 'deerstalker' · o.step · o.expr 'calm' | 'wonder' | 'worry' |
//   'smile' · o.blink 0..1 (omit: she blinks on her own every few seconds)
// Returns { head, hands } like researcher().
//
// Proportions are measured off the sheet (in units of her height): hair top 1.0, chin .83, shoulder line .775, cardigan
// hem .375, turn-ups .075; the cardigan is .29 wide at the hem, the sleeves .41 across at the elbows. Every line inside
// the figure is a brush stroke (not the 2D layer), so the parts overlap in drawing order: arms over pockets, fringe over
// brows.

const NAT = {
  skin: '#F3CDA8', skinDk: '#E0A47E', blush: '#EC9A86', hair: '#2E2420', hairDk: '#1C1614', hairLt: '#6A5040',
  card: '#D9A13B', cardDk: '#B98428', cardLn: '#8C6418', tee: '#F6F0E2', trou: '#3D3833', trouDk: '#2A2622',
  trouLn: '#5E5750', shoe: '#6E4630', shoeDk: '#3E2618', ink: '#2A221E', lip: '#B5574A', mouth: '#7E3229',
};
function natBlink(t, seed) {   // a blink every 2.6-4.6 s, 0.16 s long; 1 = open
  const P = 2.6 + 2 * hash(seed * 1.7), k = (t + hash(seed) * P) % P;
  return k < .16 ? Math.abs(k / .08 - 1) : 1;
}
// Catmull-Rom through control points, n samples a span. closed: wraps around. A repeated point makes a corner.
function natCR(P, n = 5, closed = true) {
  const N = P.length, out = [], at = i => closed ? P[(i + N) % N] : P[Math.max(0, Math.min(N - 1, i))];
  for (let i = 0; i < (closed ? N : N - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  if (!closed) out.push(P[N - 1]);
  return out.filter((p, i) => i === 0 || Math.hypot(p[0] - out[i - 1][0], p[1] - out[i - 1][1]) > .05);   // no zero-length segments: the brush spikes on them
}
// A limb around a smooth centreline: wf(u) its full width at u in 0..1; capStart rounds the start (a shoulder).
// Returns { outline, C (centreline), L, R (its two sides) }.
// where segments ab and cd cross (null if they don't)
function segX(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]], q = [d[0] - c[0], d[1] - c[1]], den = r[0] * q[1] - r[1] * q[0];
  if (Math.abs(den) < 1e-9) return null;
  const u = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den, v = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return u > 0 && u < 1 && v > 0 && v < 1 ? [a[0] + u * r[0], a[1] + u * r[1]] : null;
}
function natLimb(P, wf, capStart = false) {
  const C = natCR(P, 7, false), n = C.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = wf(i / (n - 1)) / 2;
    L.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
  }
  // on the inside of a tight bend an offset side crosses itself (a little triangle at the elbow): cut each loop out at
  // the crossing
  const untangle = S => {
    for (let i = 0; i < S.length - 3; i++) for (let j = S.length - 2; j > i + 1; j--) {
      const X = segX(S[i], S[i + 1], S[j], S[j + 1]);
      if (X) { S.splice(i + 1, j - i, X); return untangle(S); }
    }
    return S;
  };
  untangle(L); untangle(R);
  const cap = [];
  if (capStart) {   // a half circle behind the start, from R[0] round to L[0]
    const [cx, cy] = C[0], a0 = Math.atan2(R[0][1] - cy, R[0][0] - cx), r = wf(0) / 2, dir = Math.atan2(C[1][1] - cy, C[1][0] - cx);
    const back = a0 + Math.PI / 2, sgn = Math.cos(back - dir) < 0 ? 1 : -1;   // sweep through the side away from the limb
    for (let k = 1; k < 8; k++) { const a = a0 + sgn * k / 8 * Math.PI; cap.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  }
  return { outline: L.concat(R.slice().reverse(), cap), C, L, R };
}

function naturalist(x, y, s, t, o = {}) {
  const f = o.face ?? 1, pose = o.pose || 'stand', sit = pose === 'sit', lean = pose === 'lean' ? .16 : 0, back = !!o.back;
  const small = s < 260, tiny = s < 130;   // smaller figures drop the fine detail
  const sw = Math.max(.24, .12 + s * .0006), swF = sw * .7;   // brush ink weights: outline, detail
  const breathe = s * .0045 * Math.sin(t * 2.2);
  const hip = sit ? [x, y - s * .19] : [x, y - s * .42];
  const sh = [x + f * s * lean * .5, (sit ? y - s * .53 : y - s * .775) - breathe];
  const head = [sh[0] + f * s * (.012 + lean * .3), sh[1] - s * (.117 - lean * .12) + breathe * .3];
  const hr = s * .075;
  const hem = sit ? y - s * .17 : y - s * .375;
  // T(u, v): the torso frame. u across in units of s (screen right +), v from the hem (0) to the shoulder line (1).
  const T = (u, v) => [lerp(hip[0], sh[0], v) + u * s, lerp(hem, sh[1], v)];
  boilSeed('nat' + Math.round(x) + Math.round(s));
  const line = (P, w = swF, col = NAT.ink, curv = .5) => inkLine(P, w, col, 'ink', curv);
  const blob = (P, wash, o2 = {}) => paint(P, { wash, ink: null, ...o2 });
  // a soft watercolour shadow: pigment only, a wet edge, no line (drawn over a form, inside its outline)
  const shade = (P, col, op = 70) => { if (!tiny) paint(P, { fill: col, fillOp: op, bleed: .18, tex: .55, border: .5, ink: null }); };
  // the right-hand strip of a limb (whichever side faces screen right), w0..w1 of its half-width in from the edge
  const limbShade = (lb, col, op, from = .15, to = .9) => {
    const right = lb.L.reduce((a, p) => a + p[0], 0) > lb.R.reduce((a, p) => a + p[0], 0) ? lb.L : lb.R;
    const n = right.length, i0 = Math.floor(n * from), i1 = Math.ceil(n * to), edge = right.slice(i0, i1);
    const inner = edge.map((p, k) => { const c = lb.C[i0 + k]; return [lerp(p[0], c[0], .75), lerp(p[1], c[1], .75)]; });
    shade(edge.concat(inner.reverse()), col, op);
  };

  // ---------- legs: cropped charcoal trousers with turn-ups, a slip of ankle, brown oxfords ----------
  const shoe = (ax, k) => {   // the oxford under ankle x: toe toward her facing side, a little splayed
    const d = f, sp = k * .006, P = [[-.036, .011], [-.038, .044], [-.012, .056], [.022, .052], [.05, .038], [.066 + sp, .02], [.064 + sp, .004], [.03, 0], [-.032, 0]]
      .map(([u, v]) => [ax + d * u * s, y - v * s]);
    paint(natCR(P, 4), { wash: NAT.shoe, fill: NAT.shoeDk, fillOp: 40, bleed: .04, tex: .4, ink: NAT.ink, sw });
    if (!small) {
      line([[ax - d * s * .036, y - s * .009], [ax + d * s * .03, y - s * .006], [ax + d * s * .063, y - s * .01]], swF * .8, NAT.shoeDk);   // the sole
      line([[ax + d * s * .0, y - s * .05], [ax + d * s * .018, y - s * .044]], swF * .7, '#E9D9BF');   // the laces
      line([[ax + d * s * .004, y - s * .043], [ax + d * s * .02, y - s * .049]], swF * .7, '#E9D9BF');
    }
  };
  const legs = () => {
    if (sit) {
      for (const k of [-f, f]) {   // knees up, feet planted: the far leg first
        const hk = [x + k * s * .03, y - s * .2], kn = [x + f * s * .17 + k * s * .036, y - s * .3], an = [x + f * s * .21 + k * s * .036, y - s * .078];
        const lg = natLimb([hk, kn, an], u => s * lerp(.112, .094, u));
        paint(lg.outline, { wash: NAT.trou, fill: NAT.trouDk, fillOp: 40, bleed: .04, tex: .4, ink: NAT.ink, sw });
        paint(natLimb([[an[0], an[1] - s * .022], an], () => s * .1).outline, { wash: NAT.trouDk, ink: NAT.ink, sw: swF });   // turn-up
        blob([[an[0] - s * .017, an[1]], [an[0] + s * .017, an[1]], [an[0] + s * .017, y - s * .045], [an[0] - s * .017, y - s * .045]], NAT.skinDk);
        shoe(an[0] - f * s * .008, k * f);
      }
      return;
    }
    const st = o.step ?? 0;
    for (const k of [-1, 1]) {
      const top = [x + k * s * .052, hip[1]], bot = [x + k * s * (.056 + .02 * st), y - s * .097];
      const lg = natLimb([top, [lerp(top[0], bot[0], .5) + k * s * .002, lerp(top[1], bot[1], .5)], bot], u => s * lerp(.106, .094, u));
      paint(lg.outline, { wash: NAT.trou, fill: NAT.trouDk, fillOp: 40, bleed: .04, tex: .45, ink: NAT.ink, sw });
      limbShade(lg, '#1A1714', 90, .05, .95);
      if (!small) line([[top[0] + k * s * .006, top[1] + s * .06], [bot[0] + k * s * .003, bot[1] - s * .03]], swF * .7, NAT.trouLn);   // the crease
      blob([[bot[0] - s * .018, y - s * .07], [bot[0] + s * .018, y - s * .07], [bot[0] + s * .017, y - s * .046], [bot[0] - s * .017, y - s * .046]], NAT.skinDk);   // ankle
      paint([[bot[0] - s * .05, bot[1] - s * .002], [bot[0] + s * .05, bot[1] - s * .002], [bot[0] + s * .049, y - s * .072], [bot[0] - s * .049, y - s * .072]], { wash: NAT.trouDk, ink: NAT.ink, sw: swF });   // turn-up
      shoe(bot[0] - f * s * .006, k);
    }
  };

  // ---------- the cardigan ----------
  const bodyR = [[.04, 1], [.088, .993], [.12, .968], [.135, .925], [.14, .85], [.141, .62], [.143, .36], [.146, .12], [.147, .03], [.143, 0]];
  const bodyPts = bodyR.map(([u, v]) => T(u, v)).concat(bodyR.slice().reverse().map(([u, v]) => T(-u, v)), [T(0, .985)]);
  const band = s * .027 / Math.max(1, hem - sh[1]);   // the ribbed hem, as a fraction of the torso
  const cardigan = () => {
    paint(natCR(bodyPts, 4), { wash: NAT.card, fill: NAT.cardDk, fillOp: 50, bleed: .07, tex: .55, ink: NAT.ink, sw });
    shade(natCR([T(.06, .88), T(.115, .88), T(.122, .5), T(.125, .1), T(.08, .12), T(.09, .5)], 3), NAT.cardLn, 70);
    shade(natCR([T(-.12, .75), T(-.1, .8), T(-.105, .4), T(-.12, .3)], 3), NAT.cardDk, 60);
    // the band: no outline of its own (the brush overshoots sharp corners); the body's outline bounds it, one line on top
    paint([T(-.144, .004), T(.144, .004), T(.146, band), T(-.146, band)], { wash: NAT.cardDk, fill: NAT.card, fillOp: 50, bleed: .03, tex: .4, ink: null });
    line([T(-.14, band), T(.14, band)], swF, NAT.ink, 0);
    if (!small) for (let k = 1; k < 18; k++) { const u = -.146 + k / 18 * .292; line([T(u, band * .85), T(u, band * .15)], swF * .6, NAT.cardLn, 0); }
    if (back) {   // the back: a soft fold or two where the cardigan hangs off the shoulders
      if (!small) { line([T(-.06, .93), T(-.075, .7), T(-.07, .5)], swF * .7, NAT.cardLn); line([T(.07, .9), T(.08, .66)], swF * .7, NAT.cardLn); }
      return;
    }
    // the V: cream tee inside, ribbed front bands down to the hem, buttons, welt pockets
    const vx = f * .012, vb = T(vx, .6), nL = T(-.05, 1), nR = T(.05, 1);
    blob([nL, nR, vb], NAT.tee);
    paint([T(-.03, .985), T(0, .955), T(.03, .985)], { ink: NAT.ink, sw: swF, curv: .5 });   // the tee's neckline
    for (const d of [-1, 1]) {
      const top = T(d * .05, 1), mid = T(vx + d * .006, .6), botm = T(vx + d * .006, band);
      const bw = s * .016 * d;   // the front band, outside the V edge
      paint([top, [top[0] + bw, top[1] + s * .004], [mid[0] + bw, mid[1]], [botm[0] + bw, botm[1]], botm, mid], { wash: NAT.cardDk, fill: NAT.card, fillOp: 40, ink: NAT.ink, sw: swF * .9 });
    }
    if (!tiny) for (let k = 0; k < 4; k++) {   // four buttons down the band
      const [bx, by] = T(vx + f * .014, lerp(.54, .14, k / 3)), r = s * .0085;
      paint(ellPts(bx, by, r, r, 10), { wash: '#7A5418', ink: NAT.ink, sw: swF * .6 });
    }
    if (!small) for (const d of [-1, 1]) {   // welt pockets: a slanted slit with its welt
      const a = T(d * .055, .3), b = T(d * .112, .2);
      line([a, b], swF); line([[a[0] + d * s * .002, a[1] - s * .009], [b[0] + d * s * .002, b[1] - s * .009]], swF * .6, NAT.cardLn);
    }
    if (!small) { line([T(-.12, .55), T(-.1, .35), T(-.11, .15)], swF * .6, NAT.cardLn); line([T(.115, .5), T(.12, .25)], swF * .6, NAT.cardLn); }   // folds
  };

  // ---------- arms: drop shoulders, puffy sleeves gathered into ribbed cuffs, hands ----------
  const shAt = side => T(side * .118, .885);   // where each sleeve hangs from (side: screen side, -1 left / 1 right)
  const shN = shAt(f), shF = shAt(-f);
  const hands = {
    stand: [[sh[0] + f * s * .172, sh[1] + s * .385], [sh[0] - f * s * .172, sh[1] + s * .385]],
    sing: [[sh[0] + f * s * .07, sh[1] + s * .3], [sh[0] + f * s * .005, sh[1] + s * .32]],
    lens: [[head[0] + f * s * .2, head[1] + s * .06], [sh[0] - f * s * .172, sh[1] + s * .385]],
    lean: [[head[0] + f * s * .22, head[1] + s * .12], [sh[0] + f * s * .1, sh[1] + s * .3]],
    hold: [o.hand || [sh[0] + f * s * .45, sh[1] + s * .12], [sh[0] - f * s * .172, sh[1] + s * .385]],
    sit: [[x + f * s * .2, y - s * .335], [x + f * s * .13, y - s * .315]],
  }[pose] || [[sh[0] + f * s * .172, sh[1] + s * .385], [sh[0] - f * s * .172, sh[1] + s * .385]];
  const arm = (S, H, side, withHand) => {
    // the elbow: bowed off the shoulder-hand line, out and down, by however much the arm is shorter than its length
    const dx = H[0] - S[0], dy = H[1] - S[1], D = Math.hypot(dx, dy) || 1, L = s * .1765;
    const nx = -dy / D, ny = dx / D, sc = (px, py) => py + px * side * .8, sg = sc(nx, ny) >= sc(-nx, -ny) ? 1 : -1;
    const bend = Math.max(s * .02, Math.sqrt(Math.max(0, L * L - D * D / 4)));
    const E = [S[0] + dx * .5 + sg * nx * bend, S[1] + dy * .5 + sg * ny * bend];
    const ex = H[0] - E[0], ey = H[1] - E[1], el = Math.hypot(ex, ey) || 1, ax = ex / el, ay = ey / el;
    const hl = s * .052, cuffEnd = [H[0] - ax * hl * .45, H[1] - ay * hl * .45], cuffLen = s * .026, cuffAt = [cuffEnd[0] - ax * cuffLen, cuffEnd[1] - ay * cuffLen];
    const sl = natLimb([S, [lerp(S[0], E[0], .55), lerp(S[1], E[1], .55)], E, cuffAt], u => s * (.068 + .03 * Math.sin(Math.PI * Math.min(1, u * 1.08)) - .014 * u * u * u), true);
    paint(sl.outline, { wash: NAT.card, fill: NAT.cardDk, fillOp: 45, bleed: .06, tex: .5, ink: NAT.ink, sw });
    limbShade(sl, NAT.cardLn, 75, .12, .97);
    if (!small) {   // the gather into the cuff, and two folds in the crook of the elbow
      const n = sl.C.length, i = Math.round(n * .86), [cx, cy] = sl.C[i], [px, py] = sl.C[i - 2];
      const tx = cx - px, ty = cy - py, tl = Math.hypot(tx, ty) || 1, w = s * .03;
      line([[cx - ty / tl * w, cy + tx / tl * w], [cuffAt[0] - ay * s * .02 + ax * s * .004, cuffAt[1] + ax * s * .02 + ay * s * .004]], swF * .6, NAT.cardLn);
      line([[cx + ty / tl * w, cy - tx / tl * w], [cuffAt[0] + ay * s * .02 + ax * s * .004, cuffAt[1] - ax * s * .02 + ay * s * .004]], swF * .6, NAT.cardLn);
      const j = Math.round(n * .5), [qx, qy] = sl.C[j], [rx, ry] = sl.C[j - 1], qtx = qx - rx, qty = qy - ry, ql = Math.hypot(qtx, qty) || 1;
      const wj = s * .09, px2 = -qty / ql, py2 = qtx / ql, cs = (px2 * sg * nx + py2 * sg * ny) >= 0 ? -1 : 1;   // the concave side
      if (bend > s * .05) for (const k of [-.025, .02]) {   // only a real bend creases
        const ox = qx + qtx / ql * s * k + cs * px2 * wj * .42, oy = qy + qty / ql * s * k + cs * py2 * wj * .42;
        line([[ox, oy], [ox - cs * px2 * wj * .32 + qtx / ql * s * .006, oy - cs * py2 * wj * .32 + qty / ql * s * .006]], swF * .6, NAT.cardLn);
      }
    }
    const cf = natLimb([cuffAt, cuffEnd], () => s * .056);   // the ribbed cuff
    paint(cf.outline, { wash: NAT.cardDk, fill: NAT.card, fillOp: 40, ink: NAT.ink, sw: swF });
    if (!small) for (const k of [.25, .5, .75]) line([[lerp(cf.L[0][0], cf.L[cf.L.length - 1][0], k), lerp(cf.L[0][1], cf.L[cf.L.length - 1][1], k)], [lerp(cf.R[0][0], cf.R[cf.R.length - 1][0], k), lerp(cf.R[0][1], cf.R[cf.R.length - 1][1], k)]], swF * .5, NAT.cardLn, 0);
    if (!withHand) return;
    // the hand: a soft mitten along the forearm, the thumb on the side toward her body
    const bx = -ay, by = ax, ts = ((sh[0] - H[0]) * bx + (sh[1] - H[1]) * by) >= 0 ? 1 : -1, hw = s * .019;
    const HP = [[0, -1], [.5, -1.1], [.88, -.8], [1.02, -.15], [.92, .45], [.62, .82], [.55, 1.25], [.32, 1.45], [.18, 1.05], [0, .95]]
      .map(([u, v]) => [cuffEnd[0] + ax * u * hl + bx * v * hw * ts, cuffEnd[1] + ay * u * hl + by * v * hw * ts]);
    paint(natCR(HP, 3), { wash: NAT.skin, fill: NAT.skinDk, fillOp: 30, bleed: .03, ink: NAT.ink, sw: swF });
  };

  // ---------- head: the bob, the face, the fringe, round glasses ----------
  const ex = f * hr * .1;   // her features turn a little toward her facing side
  const H = (u, v) => [head[0] + u * hr, head[1] + v * hr];
  const headFront = () => {
    // the back mass of the bob: crown, falling straight to just below the jaw, the ends turned under
    const bob = [[0, -1.2], [.52, -1.13], [.86, -.92], [1.04, -.56], [1.11, -.12], [1.16, .32], [1.24, .7], [1.3, .9], [1.14, .99], [.98, .93], [.5, .8], [-.5, .8], [-.98, .93], [-1.14, .99], [-1.3, .9], [-1.24, .7], [-1.16, .32], [-1.11, -.12], [-1.04, -.56], [-.86, -.92], [-.52, -1.13]]
      .map(([u, v]) => H(u - ex / hr * .25, v));
    paint(natCR(bob, 4), { wash: NAT.hair, fill: NAT.hairDk, fillOp: 45, bleed: .04, tex: .5, ink: NAT.ink, sw });
    shade(natCR([H(.62, -.2), H(1.1, -.1), H(1.18, .6), H(1.0, .85), H(.85, .3)], 3), '#120E0C', 110);
    const nb = T(0, 1);   // the neck: from under the jaw into the collar, shaded under the chin
    blob([H(-.33, .5), H(.33, .5), [nb[0] + s * .027, nb[1] + s * .012], [nb[0] - s * .027, nb[1] + s * .012]], NAT.skin);
    paint(natCR([H(-.34, .6), H(.34, .6), H(.33, 1.06), H(0, 1.18), H(-.33, 1.06)], 3), { fill: NAT.skinDk, fillOp: 120, bleed: .12, tex: .3, ink: null });
    const face = [[-.84, -.5], [-.88, 0], [-.8, .4], [-.56, .72], [-.22, .9], [0, .93], [.22, .9], [.56, .72], [.8, .4], [.88, 0], [.84, -.5], [.4, -.8], [-.4, -.8]]
      .map(([u, v]) => H(u + ex / hr * .4, v));
    paint(natCR(face, 4), { wash: NAT.skin, fill: NAT.skinDk, fillOp: 18, bleed: .03, tex: .3, ink: NAT.ink, sw: swF });
    shade(natCR([H(-.8 + ex / hr * .4, -.3), H(.8 + ex / hr * .4, -.3), H(.75 + ex / hr * .4, -.12), H(ex / hr * .4, -.1), H(-.75 + ex / hr * .4, -.12)], 3), NAT.skinDk, 90);   // under the fringe
    shade(natCR([H(.55 + ex / hr * .4, -.2), H(.86 + ex / hr * .4, -.1), H(.8 + ex / hr * .4, .4), H(.5 + ex / hr * .4, .78), H(.62 + ex / hr * .4, .3)], 3), NAT.skinDk, 70);   // her right cheek
    // the face: eyes, brows, nose, mouth, cheeks
    const gy = head[1] + hr * .06, open = o.blink ?? natBlink(t, x * .01 + s * .1), expr = o.expr || 'calm', wide = expr === 'wonder' ? 1.22 : 1;
    if (!tiny) for (const d of [-.38, .38]) {
      const cx = head[0] + ex + d * hr, ry = hr * .12 * wide * Math.max(.1, open);
      if (open > .3) {
        paint(ellPts(cx, gy, hr * .085 * wide, ry, 12), { wash: NAT.ink, ink: null });
        if (!small) paint(ellPts(cx + hr * .03, gy - ry * .35, hr * .026, hr * .026, 6), { wash: '#FFFFFF', ink: null });
      } else line([[cx - hr * .09, gy], [cx + hr * .09, gy + hr * .01]], swF);
      const by = gy - hr * .3, tilt = expr === 'worry' ? -Math.sign(d) * .09 : 0, lift = expr === 'wonder' ? -hr * .06 : 0;
      line([[cx - hr * .14, by + tilt * hr + lift + hr * .015], [cx, by + lift - hr * .012], [cx + hr * .14, by - tilt * hr + lift + hr * .015]], swF * .9);
    }
    if (!small) line([[head[0] + ex * 1.6 + f * hr * .02, head[1] + hr * .26], [head[0] + ex * 1.6 + f * hr * .06, head[1] + hr * .36], [head[0] + ex * 1.6 - f * hr * .03, head[1] + hr * .38]], swF * .7, NAT.skinDk);
    const mx = head[0] + ex * 1.2, my = head[1] + hr * .57, m = o.mouth ?? 0;
    if (m > .05) paint(natCR([[mx - hr * .14, my - hr * .03], [mx, my - hr * .05], [mx + hr * .14, my - hr * .03], [mx + hr * .1, my + hr * (.04 + .16 * m)], [mx - hr * .1, my + hr * (.04 + .16 * m)]], 3), { wash: NAT.mouth, ink: NAT.ink, sw: swF * .7 });
    else if (expr === 'smile') line([[mx - hr * .16, my - hr * .04], [mx, my + hr * .07], [mx + hr * .16, my - hr * .04]], swF);
    else if (expr === 'wonder') paint(ellPts(mx, my + hr * .02, hr * .065, hr * .08, 10), { wash: NAT.mouth, ink: NAT.ink, sw: swF * .6 });
    else if (expr === 'worry') line([[mx - hr * .11, my + hr * .03], [mx, my - hr * .01], [mx + hr * .11, my + hr * .03]], swF * .9);
    else line([[mx - hr * .1, my], [mx, my + hr * .02], [mx + hr * .1, my]], swF * .9);
    if (!tiny) for (const d of [-.6, .6]) blob(ellPts(head[0] + ex + d * hr, head[1] + hr * .38, hr * .15, hr * .075, 10), NAT.blush, { washOp: 120 });
    // the fringe: straight-cut to the brows, a few strands breaking the edge, curving down to the temples
    const fr = [[-1.0, -.06], [-1.02, -.52], [-.84, -.9], [-.5, -1.1], [0, -1.17], [.5, -1.1], [.84, -.9], [1.02, -.52], [1.0, -.06],
      [.9, -.2], [.72, -.3], [.55, -.24], [.38, -.33], [.18, -.27], [0, -.34], [-.2, -.27], [-.4, -.33], [-.58, -.25], [-.75, -.31], [-.9, -.2]]
      .map(([u, v]) => H(u - ex / hr * .15, v));
    paint(natCR(fr, 3), { wash: NAT.hair, fill: NAT.hairDk, fillOp: 45, bleed: .04, tex: .5, ink: NAT.ink, sw: swF });
    shade(natCR([H(-.75, -.9), H(-.2, -1.06), H(.3, -1.02), H(.2, -.92), H(-.3, -.95), H(-.7, -.8)], 3), NAT.hairLt, 90);   // the sheen on her crown
    if (!small) {   // strands: lighter strokes where the light catches the crown, and down the sides
      for (const [u0, u1] of [[-.5, -.62], [-.15, -.2], [.25, .3], [.6, .7]]) line([H(u0 * .9, -1.0), H(u1, -.42)], swF * .55, NAT.hairLt);
      for (const d of [-1, 1]) line([H(d * 1.08, -.1), H(d * 1.13, .35), H(d * 1.2, .78)], swF * .55, NAT.hairLt);
    }
    // round glasses, a bridge, the arms back to the hair, a glint
    if (!tiny) for (const d of [-.38, .38]) {
      const cx = head[0] + ex + d * hr;
      paint(ellPts(cx, gy, hr * .27, hr * .25, 20), { ink: NAT.ink, sw: swF * 1.05, curv: .5 });
      if (!small) line([[cx - hr * .14, gy - hr * .08], [cx - hr * .05, gy - hr * .17]], swF * .6, '#FFFFFF');
    }
    if (!tiny) { line([[head[0] + ex - hr * .11, gy - hr * .02], [head[0] + ex, gy - hr * .07], [head[0] + ex + hr * .11, gy - hr * .02]], swF * .8);
      for (const d of [-1, 1]) line([[head[0] + ex + d * hr * .65, gy - hr * .02], [head[0] + d * hr * .95, gy - hr * .06]], swF * .7); }
    else for (const d of [-.38, .38]) paint(ellPts(head[0] + ex + d * hr, gy, hr * .26, hr * .24, 10), { ink: NAT.ink, sw: swF * .9 });
  };
  const headBack = () => {
    const nb = T(0, 1);
    blob([H(-.3, .4), H(.3, .4), [nb[0] + s * .024, nb[1] + s * .012], [nb[0] - s * .024, nb[1] + s * .012]], NAT.skinDk);   // the nape
    // a sliver of cheek and the glasses' arm on her facing side, under the hair
    paint(natCR([H(f * .6, -.3), H(f * 1.02, -.15), H(f * 1.0, .4), H(f * .75, .78), H(f * .5, .5)], 3), { wash: NAT.skin, ink: NAT.ink, sw: swF });
    const hb = [[0, -1.2], [.52, -1.13], [.86, -.92], [1.04, -.56], [1.11, -.12], [1.16, .32], [1.24, .7], [1.3, .9], [1.16, 1.0], [.8, .97], [.4, 1.02], [0, .96], [-.4, 1.02], [-.8, .97], [-1.16, 1.0], [-1.3, .9], [-1.24, .7], [-1.16, .32], [-1.11, -.12], [-1.04, -.56], [-.86, -.92], [-.52, -1.13]]
      .map(([u, v]) => H(u - f * .08, v));
    paint(natCR(hb, 4), { wash: NAT.hair, fill: NAT.hairDk, fillOp: 50, bleed: .04, tex: .5, ink: NAT.ink, sw });
    shade(natCR([H(-.7, -.85), H(-.1, -1.05), H(.4, -.98), H(.2, -.86), H(-.3, -.9), H(-.65, -.7)], 3), NAT.hairLt, 90);
    shade(natCR([H(.6, -.3), H(1.1, -.1), H(1.2, .7), H(1.0, .95), H(.75, .4)], 3), '#120E0C', 110);
    if (!small) {
      for (const u of [-.75, -.35, .05, .45]) line([H(u * .8 - f * .08, -1.05), H(u - f * .08, -.2), H(u * 1.05 - f * .08, .85)], swF * .55, NAT.hairLt);
      line([H(f * 1.08, .02), H(f * 1.3, .08)], swF * .9);   // the glasses' arm, past the hair
    }
  };
  const hat = () => {
    if (o.hat !== 'deerstalker') return;
    // A Sherlock Holmes deerstalker sitting on her bob (Neel, 3 Oct: the old one "kind of covers most of the researcher's
    // face"): a checked cloth crown from just above the fringe, a short peak in front and one behind, the ear flaps tied
    // up in a bow on top.
    const sx = ex / hr * .2, Hh = (u, v) => H(u + sx, v);
    const cloth = { wash: '#B8946A', fill: '#9C7A52', fillOp: 45, bleed: .01, tex: .5, ink: NAT.ink, sw: swF };
    paint(natCR([[-1.0, -.52], [-1.06, -.82], [-.84, -1.26], [-.42, -1.5], [0, -1.56], [.42, -1.5], [.84, -1.26], [1.06, -.82], [1.0, -.52], [.5, -.58], [0, -.6], [-.5, -.58]].map(([u, v]) => Hh(u, v)), 3), cloth);   // the crown
    for (const ang of [.75, -.75]) paint(natCR([[-.98, -.56], [-1.02, -.82], [-.82, -1.24], [-.4, -1.46], [0, -1.52], [.4, -1.46], [.82, -1.24], [1.02, -.82], [.98, -.56], [0, -.64]].map(([u, v]) => Hh(u, v)), 3),
      { hatch: { d: Math.max(4, hr * .16), a: ang, b: 'HB', c: '#5E4630', w: .5 }, ink: null });   // the check: two hatches crossed
    paint([[f * .62, -.6], [f * 1.55, -.5], [f * 1.62, -.42], [f * 1.12, -.36], [f * .66, -.46]].map(([u, v]) => Hh(u, v)), { ...cloth, wash: '#A6845C' });   // the peak in front
    paint([[-f * .66, -.62], [-f * 1.42, -.6], [-f * 1.48, -.5], [-f * 1.05, -.44], [-f * .7, -.5]].map(([u, v]) => Hh(u, v)), { ...cloth, wash: '#A6845C' });   // and behind
    for (const d of [-1, 1]) paint([[d * .52, -1.36], [d * .1, -1.6], [d * .32, -1.18]].map(([u, v]) => Hh(u, v)), { ...cloth, wash: '#A6845C', sw: swF * .8 });   // the ear flaps, tied up
    for (const d of [-1, 1]) paint(ellPts(...Hh(d * .14, -1.66), hr * .13, hr * .07, 10, 0, d * .5), { wash: '#7A5A3A', ink: NAT.ink, sw: swF * .6 });   // the bow
  };


  // ---------- drawing order ----------
  if (sit) { cardigan(); legs(); } else { legs(); if (!back) cardigan(); }
  if (back) {   // from behind, her arms are beyond her back: draw them first, then the back covers their roots
    arm(shF, hands[1], -f, true); arm(shN, hands[0], f, !o.noHand);
    if (!sit) cardigan();
    headBack(); hat();
  } else {
    arm(shF, hands[1], -f, true);
    headFront(); hat();
    arm(shN, hands[0], f, !o.noHand);
  }
  if (pose === 'lens' || pose === 'lean') { const [lx, ly] = hands[0]; magnifier(lx + f * s * .06, ly - s * .07, s * .07, { part: 'rim' }); }
  return { head, hands };
}

// researcher() (dgq/board.js) draws this figure while NAT_ON is true (one switch, every shot)
const NAT_ON = true;
// ?loop=natSheet: every pose, large and small, for checking the figure against video/style/a_researcher.png
LOOPS.natSheet = t => {
  notebookPage({ ring: false });
  const poses = [['stand', {}], ['stand', { back: true }], ['sing', {}], ['lens', {}], ['lean', { expr: 'wonder' }], ['hold', {}], ['sit', {}]];
  poses.forEach(([p, o], k) => { const x = 150 + k * 262; naturalist(x, 640, 500, t, { pose: p, face: 1, ...o, ...(p === 'hold' ? { hand: [x + 190, 400] } : {}) }); });
  ['calm', 'wonder', 'worry', 'smile'].forEach((e, k) => naturalist(170 + k * 150, 1040, 210, t, { pose: 'stand', face: k % 2 ? -1 : 1, expr: e }));
  naturalist(800, 1040, 210, t, { pose: 'sing', back: true, face: -1 });
  naturalist(960, 1040, 210, t, { pose: 'stand', mouth: .7 });
  naturalist(1100, 1040, 140, t, { pose: 'stand' }); naturalist(1200, 1040, 90, t, { pose: 'lens' });
};
LOOPS.natSheet.len = 4;
LOOPS.natBig = t => {   // close: the face and the cardigan at the size of a hero shot
  notebookPage({ ring: false });
  naturalist(560, 2300, 2200, t, { pose: 'lens', expr: 'wonder' });
  naturalist(1450, 1900, 1700, t, { pose: 'stand', back: true, face: -1 });
};
LOOPS.natBig.len = 4;
