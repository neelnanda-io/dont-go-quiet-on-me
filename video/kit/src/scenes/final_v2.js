// final_v2.js: Verse 2, finished (54.14-70.79 s; stamps 2022 -> 2023 at 56.08 -> 2024 at 62.18). It learns to talk to
// everyone; she writes it a dictionary (one leather book, carried through V2b and V2c); most of its pages stay empty;
// she turns one page up until it forgets its own name. References (video/treatment/reference_bank_final.md): V2b-1 the
// paper's own example strings, V2b-2 QUJD, M2 p. 512, V2d-1 "Human:", V2e-1 the car on the bridge in the fog. Round 2
// (reference_bank_r2.md): R07 the unicorn, T131 the milk, R08 the plate, T121 the thumb index, T118 the 1L copy, T101 the
// ghost, T87 the knob's off detent, T81 the JumpReLU, T111 the needle, T79 the periscope; round 5 (Neel's picks):
// SolidGoldMagikarp, and the dead-latents bars on their own card beside the book; mocks t110, t34.

// ---------- the crowd: little watercolour people (V2a, V2d) ----------
const FOLK_COLS = ['#7A9A3A', '#C9472A', '#2E6F86', '#D19C33', '#8E5A9A', '#5E9894', '#B8654A', '#4A5A8A'];
function folk(x, y, s, k, t, o = {}) {   // (x, y) between the feet; s height; k picks colour, build, hair, skin
  const col = FOLK_COLS[k % FOLK_COLS.length], w = s * (.34 + .1 * hash(k * 3.1)), bob = Math.sin(t * 4 + k * 1.7) * s * .012;
  const tilt = (o.look ?? 0) * s * .03;
  paint(natCR([[x - w * .5, y], [x - w * .56, y - s * .42], [x - w * .32, y - s * .64], [x + w * .32, y - s * .64], [x + w * .56, y - s * .42], [x + w * .5, y]], 3),
    { wash: mixCol(col, '#F2E8D2', .35), fill: col, fillOp: 55, bleed: .08, tex: .5, ink: DQ.ink, sw: Math.max(.22, s * .0018) });
  const hx = x + tilt, hy = y - s * .8 + bob, hr = s * .15, skin = ['#F1C9A5', '#C99A72', '#E3B08A', '#9C6B4A'][Math.floor(hash(k * 5.7) * 4)];
  paint(ellPts(hx, hy, hr, hr * 1.06, 14), { wash: skin, ink: DQ.ink, sw: Math.max(.2, s * .0016) });
  const hair = ['#2E2420', '#6B4630', '#B98A4A', '#1C1614'][k % 4];
  paint(natCR([[hx - hr * 1.02, hy - hr * .05], [hx - hr * .8, hy - hr * .85], [hx, hy - hr * 1.12], [hx + hr * .8, hy - hr * .85], [hx + hr * 1.02, hy - hr * .05], [hx + hr * .5, hy - hr * .55], [hx - hr * .5, hy - hr * .5]], 3), { wash: hair, ink: null });
  if (s > 90) for (const d of [-1, 1]) dot2d(hx + d * hr * .35 + tilt * .3, hy + hr * .1, Math.max(1.2, hr * .09), { fill: DQ.ink });
}
// the parrot in the crowd (the stochastic one)
function parrot(x, y, s, t) {
  paint(natCR([[x - s * .3, y], [x - s * .36, y - s * .5], [x - s * .1, y - s * .9], [x + s * .22, y - s * .78], [x + s * .3, y - s * .3], [x + s * .1, y]], 3), { wash: '#5EA67A', fill: '#2F7A50', fillOp: 60, bleed: .06, ink: DQ.ink, sw: .3 });
  paint([[x + s * .18, y - s * .8], [x + s * .44, y - s * .72], [x + s * .2, y - s * .64]], { wash: DQ.mustard, ink: DQ.ink, sw: .25 });
  paint([[x - s * .3, y - s * .1], [x - s * .52, y + s * .25], [x - s * .2, y - s * .02]], { wash: '#C9472A', ink: DQ.ink, sw: .25 });   // tail
  dot2d(x + s * .06, y - s * .78, Math.max(1.5, s * .035), { fill: DQ.ink });
}

// a unicorn in the crowd, listening (R07): GPT-2's 2019 demo, whose unicorns "spoke perfect English". (x, y) between
// the feet, s its height to the poll; it faces left, toward the chat window, one ear turned to it
function camAUnicorn(x, y, s, t) {
  const bob = Math.sin(t * 4 + 2.3) * s * .012, ink = { ink: DQ.ink, sw: Math.max(.22, s * .0018) };
  const coat = { wash: '#FBF6EE', fill: '#E9DFD2', fillOp: 45, bleed: .04, tex: .4, ...ink }, coatFar = { wash: '#E9E1D6', ...ink };
  const leg = (lx, o) => { const X = x + s * lx; paint(natCR([[X - s * .045, y - s * .44], [X + s * .045, y - s * .44], [X + s * .034, y - s * .2], [X + s * .036, y - s * .05], [X - s * .036, y - s * .05], [X - s * .034, y - s * .2]], 2), o);
    paint(rrPts(X - s * .042, y - s * .06, s * .084, s * .06, s * .015), { wash: '#B8A27E', ...ink }); };   // a leg and its hoof
  // the tail and the far legs first, then the barrel, the near legs, the neck and the head
  paint(ribbon([[x + s * .34, y - s * .64], [x + s * .46, y - s * .6], [x + s * .5, y - s * .44], [x + s * .47, y - s * .26]], s * .09, s * .04), { wash: '#F2B6C6', fill: '#B98AC8', fillOp: 50, bleed: .04, ...ink });
  leg(-.06, coatFar); leg(.3, coatFar);
  paint(natCR([[x - s * .24, y - s * .5], [x - s * .18, y - s * .66], [x + s * .08, y - s * .7], [x + s * .34, y - s * .66], [x + s * .4, y - s * .52], [x + s * .32, y - s * .4], [x + s * .06, y - s * .37], [x - s * .18, y - s * .4]], 3), coat);   // the barrel
  leg(-.16, coat); leg(.22, coat);
  const hx = x - s * .36, hy = y - s * .9 + bob;   // the head's middle
  paint(natCR([[x - s * .22, y - s * .46], [x - s * .3, y - s * .66], [hx - s * .04, hy - s * .06], [hx + s * .1, hy - s * .1], [x - s * .04, y - s * .66]], 3), coat);   // the neck
  paint(natCR([[hx + s * .1, hy - s * .1], [hx - s * .02, hy - s * .15], [hx - s * .15, hy - s * .04], [hx - s * .22, hy + s * .08], [hx - s * .15, hy + s * .15], [hx + s * .06, hy + s * .07]], 3), coat);   // the head, muzzle down and left
  paint(ribbon([[hx + s * .04, hy - s * .15], [hx + s * .14, hy - s * .02], [x - s * .14, y - s * .7], [x - s * .02, y - s * .66]], s * .1, s * .06), { wash: '#F2B6C6', fill: '#C98AB8', fillOp: 45, bleed: .04, ...ink });   // the mane
  paint([[hx + s * .0, hy - s * .13], [hx + s * .07, hy - s * .3], [hx + s * .09, hy - s * .1]], { wash: '#FBF6EE', ...ink });   // the ear, pricked toward the window
  const hb = [hx - s * .06, hy - s * .14];   // the horn: up and forward, gold, wound
  paint([[hb[0] - s * .035, hb[1]], [hb[0] - s * .12, hb[1] - s * .27], [hb[0] + s * .035, hb[1] - s * .01]], { wash: '#F3D88A', fill: '#D9AE48', fillOp: 60, ...ink });
  for (let k = 1; k <= 3; k++) { const u = k / 4.2; line2d([[hb[0] - s * .035 * (1 - u) - s * .12 * u, hb[1] - s * .27 * u + s * .012], [hb[0] + s * .035 * (1 - u) - s * .12 * u, hb[1] - s * .01 * (1 - u) - s * .27 * u - s * .012]], { col: '#8A6420', sw: Math.max(1, s * .008) }); }
  dot2d(hx - s * .05, hy - s * .02, Math.max(1.6, s * .018), { fill: DQ.ink });   // the eye
  dot2d(hx - s * .18, hy + s * .1, Math.max(1, s * .01), { fill: DQ.ink });        // the nostril
}
// a glass milk bottle with a foil cap (T131): the IOI sentence's "John gave a bottle of milk to" Mary
function camAMilk(x, y, s, a = 1) {   // (x, y) the bottle's foot, s its height
  if (a <= .02) return;
  const w = s * .5;
  paint(natCR([[x - w / 2, y], [x - w / 2, y - s * .55], [x - w * .26, y - s * .78], [x - w * .26, y - s * .9], [x + w * .26, y - s * .9], [x + w * .26, y - s * .78], [x + w / 2, y - s * .55], [x + w / 2, y]], 2), { wash: '#FFFFFF', fill: '#EEF2F2', fillOp: 40, ink: DQ.ink, sw: .3 });
  paint(rrPts(x - w * .3, y - s, w * .6, s * .12, s * .03), { wash: '#C9CED2', ink: DQ.ink, sw: .25 });   // the foil cap
  line2d([[x - w * .3, y - s * .5], [x - w * .3, y - s * .12]], { col: '#D8E2E4', sw: Math.max(1.5, s * .05) });   // the glint
}

// one of the crowd hands the next a bottle of milk on "but" (giver and taker are folk() rows: [x, y, s, k]); the
// researcher, apart, gets nothing. Arms only for these two: a sleeve in the coat's colour and a hand.
function camAMilkPass(giver, taker, t, tB) {
  const side = (f, d) => { const [x, y, s, k] = f, w = s * (.34 + .1 * hash(k * 3.1)); return [x + d * w * .5, y - s * .24]; };   // a hand hanging at the side
  const [gx, gy, gs, gk] = giver, [rx, ry, rs, rk] = taker, gRest = side(giver, -1), rRest = side(taker, 1);
  const reach = ease(seg(t, tB - .45, tB - .15)), p = ease(seg(t, tB - .1, tB + .25)), back = ease(seg(t, tB + .25, tB + .55));
  const gw = gs * (.34 + .1 * hash(gk * 3.1)), rw = rs * (.34 + .1 * hash(rk * 3.1));
  const bx = lerp(gx - gw * .3, rx + rw * .3, p), by = gy - gs * .3, bh = gs * .25;   // from in front of the giver to the taker
  const gHand = back > 0 ? [lerp(bx + 10, gRest[0], back), lerp(by - bh * .45, gRest[1], back)] : [bx + 10, by - bh * .45];
  const rHand = [lerp(rRest[0], bx - 10, reach), lerp(rRest[1], by - bh * .4, reach)];
  const arm = (f, d, hand) => {
    const [x, y, s, k] = f, w = s * (.34 + .1 * hash(k * 3.1)), col = FOLK_COLS[k % FOLK_COLS.length], sh = [x + d * w * .3, y - s * .56];
    paint(ribbon([sh, [lerp(sh[0], hand[0], .5) + d * 4, lerp(sh[1], hand[1], .5) + 6], hand], s * .075, s * .06), { wash: mixCol(col, '#F2E8D2', .3), fill: col, fillOp: 50, bleed: .04, ink: DQ.ink, sw: Math.max(.22, s * .0018) });
  };
  const fist = (f, hand) => paint(ellPts(hand[0], hand[1], f[2] * .03, f[2] * .03, 10), { wash: ['#F1C9A5', '#C99A72', '#E3B08A', '#9C6B4A'][Math.floor(hash(f[3] * 5.7) * 4)], ink: DQ.ink, sw: .2 });
  arm(taker, 1, rHand);
  camAMilk(bx, by, bh);
  fist(taker, rHand);   // its hand on the bottle, over the glass
  arm(giver, -1, gHand); fist(giver, gHand);
}

// SolidGoldMagikarp, the glitch token GPT-3 couldn't say back (Rumbelow & Watkins, Feb 2023): a carp of solid gold in a
// fishbowl among the fans. Neel picked it (round 5: "make it more obvious ... more clearly made of gold, with 24 carat
// written on it"): polished metal (gold gradients, a shine along its back, glints), a hallmark on its flank, and being
// solid gold it rests on the bottom of the bowl. It plops in on "everyone" (56.08), as the stamp reaches 2023. (x, y) the
// bowl's foot on the ground; k 0..1 its pop-in. Drawn as a plain carp (barbels, a crown of fin), not the game's character.
function camAMagikarp(x, y, t, k = 1) {
  if (k <= .01) return;
  const r = 98 * k, cy = y - r * .92;
  paint(ellPts(x, cy, r, r * .96, 28), { wash: '#F2F7F7', fill: '#D6E6E8', fillOp: 30, bleed: .03, ink: DQ.ink, sw: .35 });   // the bowl
  paint(natCR([[x - r * .93, cy + r * .02], [x - r * .5, cy - r * .1], [x, cy - r * .06], [x + r * .5, cy - r * .12], [x + r * .93, cy], [x + r * .7, cy + r * .7], [x, cy + r * .95], [x - r * .7, cy + r * .7]], 3), { wash: '#A9D2DA', fill: '#7DB6C2', fillOp: 35, bleed: .03, ink: null });   // the water
  paint(ellPts(x, cy - r * .9, r * .5, r * .1, 20), { wash: '#E4EEEF', ink: DQ.ink, sw: .3 });   // the bowl's open lip
  const s = r * 1.08, fx = x + r * .04, fy = cy + r * .58;   // the carp, facing left (toward the window), resting on the bottom
  warmLight(fx, fy, s * .9, .55);   // gold catches the light
  queue2d(c => {
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    const gold = (y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#FFF7CC'); g.addColorStop(.32, '#F8D347'); g.addColorStop(.68, '#D49E1E'); g.addColorStop(1, '#8A600E'); return g; };
    const edge = () => { c.strokeStyle = '#6A4708'; c.lineWidth = Math.max(1.4, s * .022); c.stroke(); };
    c.beginPath(); c.moveTo(fx + s * .4, fy); c.quadraticCurveTo(fx + s * .58, fy - s * .06, fx + s * .76, fy - s * .3); c.quadraticCurveTo(fx + s * .66, fy, fx + s * .76, fy + s * .27); c.quadraticCurveTo(fx + s * .58, fy + s * .06, fx + s * .4, fy); c.closePath();
    c.fillStyle = gold(fy - s * .3, fy + s * .27); c.fill(); edge();   // the tail
    c.beginPath(); c.moveTo(fx - s * .2, fy - s * .24); c.lineTo(fx - s * .07, fy - s * .46); c.lineTo(fx + s * .01, fy - s * .32); c.lineTo(fx + s * .1, fy - s * .44); c.lineTo(fx + s * .19, fy - s * .23); c.closePath();
    c.fillStyle = gold(fy - s * .46, fy - s * .23); c.fill(); edge();   // the crown of dorsal fin
    c.beginPath(); c.moveTo(fx - s * .52, fy + s * .02); c.bezierCurveTo(fx - s * .45, fy - s * .3, fx + s * .24, fy - s * .34, fx + s * .43, fy); c.bezierCurveTo(fx + s * .24, fy + s * .3, fx - s * .43, fy + s * .28, fx - s * .52, fy + s * .02); c.closePath();
    c.fillStyle = gold(fy - s * .32, fy + s * .28); c.fill(); edge();   // the body
    c.save(); c.clip();
    c.strokeStyle = 'rgba(120,80,8,.5)'; c.lineWidth = Math.max(1, s * .014);   // scales
    for (let i = 0; i < 5; i++) for (let j = -2; j <= 2; j++) { c.beginPath(); c.arc(fx - s * .22 + i * s * .12, fy + j * s * .11 + (i % 2) * s * .055, s * .065, -1.2, 1.2); c.stroke(); }
    c.restore();
    c.strokeStyle = 'rgba(255,255,236,.95)'; c.lineWidth = Math.max(2.5, s * .045);   // the shine along its back
    c.beginPath(); c.moveTo(fx - s * .34, fy - s * .15); c.quadraticCurveTo(fx - s * .04, fy - s * .27, fx + s * .26, fy - s * .14); c.stroke();
    const hx = fx - s * .02, hy = fy + s * .08, hw = s * .5, hh = s * .2;   // the hallmark: a cartouche stamped in its flank
    c.beginPath(); c.roundRect(hx - hw / 2, hy - hh / 2, hw, hh, hh * .45); c.fillStyle = '#EFC94E'; c.fill(); c.strokeStyle = '#6A4708'; c.lineWidth = 1.4; c.stroke();
    c.fillStyle = '#4E3204'; c.font = `700 ${Math.round(hh * .78)}px "${FONT.cmuTT}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('24 CT', hx, hy + hh * .04);
    c.fillStyle = '#2A1C06'; c.beginPath(); c.arc(fx - s * .35, fy - s * .06, s * .045, 0, TAU); c.fill();   // the eye
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(fx - s * .365, fy - s * .075, s * .016, 0, TAU); c.fill();
    c.strokeStyle = '#B07A12'; c.lineWidth = Math.max(1.4, s * .02);   // the barbels, gold whiskers
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(fx - s * .5, fy + s * .06); c.quadraticCurveTo(fx - s * .64, fy + s * (.12 + .1 * d), fx - s * .7, fy + s * (.24 + .07 * d)); c.stroke(); }
    c.restore();
  });
  // glints on the gold, twinkling in turn, then the glass in front
  for (const [gx, gy, ph] of [[fx - s * .1, fy - s * .3, 0], [fx + s * .5, fy - s * .22, 2.1], [fx - s * .44, fy + s * .14, 4.2]]) { const tw = .5 + .5 * Math.sin(t * 6 + ph); if (tw > .2) star4(gx, gy, s * .09 * tw * k, '#FFFBE6', tw); }
  line2d([[x - r * .55, cy - r * .55], [x - r * .38, cy - r * .74]], { col: '#FFFFFF', sw: 4, alpha: .9 });   // the glint on the glass
  for (let q0 = 0; q0 < 2; q0++) { const q = frac(t * .7 + q0 / 2); dot2d(fx - s * .5 - 6 * q0, fy - s * .2 - q * (fy - s * .2 - cy), 2.5 + q0, { stroke: '#5E9AA8', fill: null, sw: 1.5, alpha: 1 - q }); }   // bubbles, up to the surface
}

// ---------- mock-ups of ideas left out (render.mjs --mock=<key>; never in the video) ----------
// t110: Neuron to Graph's picture of a neuron, as a pencil doodle under the window: three grey token nodes that feed one
// red node, "except", which lights on "but" ("to everyone but me"). (x, y) the doodle's top-left
function camAN2G(x, y, t, tB) {
  const lit = seg(t, tB - .05, tB + .15), red = [x + 210, y + 64];
  for (let i = 0; i < 3; i++) { const ny = y + i * 64; line2d([[x + 26, ny], [red[0] - 64, red[1] + (i - 1) * 10]], { col: PENCIL, sw: 2.2 }); paint(rrPts(x - 30, ny - 18, 58, 36, 14), { wash: '#D9D5CE', ink: PENCIL, sw: .3 }); }
  paint(rrPts(red[0] - 66, red[1] - 24, 132, 48, 20), { wash: mixCol('#F2E8D2', '#E25A3C', lit), ink: lit > .5 ? '#A8321E' : PENCIL, sw: .35 });
  note('except', red[0], red[1] + 12, { size: 34, col: lit > .5 ? '#FFFDF7' : DQ.sepia, align: 'center' });
}

// t34: one riffling page a size larger than the rest, sewn in at the gutter with red thread: a latent stitched in from a
// bigger dictionary ("Stitching SAEs of different sizes"). f is the page's flip, as in V2c's riffle
function camAStitchedPage(cx, top, bot, w, f) {
  const T = top - 26, B = bot + 22, xr = cx + w * 1.08 * Math.cos(f * Math.PI), lift = 60 * Math.sin(f * Math.PI);
  paint([[cx, T], [xr, T - lift], [xr, B - lift * .6], [cx, B]], { wash: '#FFFBF2', ink: '#8C7A5A', sw: .35 });
  const L = Math.hypot(xr - cx, lift) || 1, dx = (xr - cx) / L, dy = -lift / L;   // along the page, away from the gutter
  for (let i = 0; i < 9; i++) { const v = (i + .5) / 9, gx = cx, gy = lerp(T, B, v) - lift * .3 * v;
    line2d([[gx - dx * 6, gy - dy * 6], [gx + dx * 14, gy + dy * 14]], { col: '#A8321E', sw: 2.4 }); }   // the stitches, across the seam
}

// ---------- the dictionary: a leather book lying open (V2b, V2c) ----------
const DICT = { cx: 990, cy: 545, w: 500, h: 610 };
function dictBook(o = {}) {
  const { cx, cy, w, h } = DICT, top = cy - h / 2, bot = cy + h / 2;
  paint(rrPts(cx - w - 26, top - 16, 2 * w + 52, h + 40, 18), { wash: '#6B3A26', fill: '#4A2416', fillOp: 70, bleed: .008, tex: .6, ink: DQ.ink, sw: .5 });   // the cover (a tight bleed: a big shape's bleed escapes its edge)
  for (let k = 3; k >= 1; k--) paint([[cx - w + 4 * k, top + 6 * k], [cx + w - 4 * k, top + 6 * k], [cx + w - 4 * k, bot + 6 * k], [cx - w + 4 * k, bot + 6 * k]], { wash: '#E9DFC8', ink: '#9C8A6A', sw: .25 });   // page edges
  const page = (x0, x1, outer) => {   // a page: its top edge bowing up toward the outer edge, its foot nearly straight
    const P = []; for (let i = 0; i <= 12; i++) { const u = i / 12; P.push([lerp(x0, x1, u), top - 10 * Math.sin(Math.PI * u) + (outer < 0 ? 8 * (1 - u) : 8 * u)]); }
    for (let i = 12; i >= 0; i--) { const u = i / 12; P.push([lerp(x0, x1, u), bot - 4 * Math.sin(Math.PI * u)]); }
    return P;
  };
  paint(page(cx - w, cx, -1), { wash: '#FBF6EA', fill: '#EFE4CC', fillOp: 40, bleed: .015, tex: .45, ink: '#8C7A5A', sw: .35 });
  paint(page(cx, cx + w, 1), { wash: '#FBF6EA', fill: '#EFE4CC', fillOp: 40, bleed: .015, tex: .45, ink: '#8C7A5A', sw: .35 });
  camLChessCard(cx - 175, top, cx - w, w);   // a bookmark tucked into the left-hand pages (reference bank r3, pick 2)
  flushLetters();   // committed now, so V2c's riffling pages fall in front of it, as pages would (everything 2D after this, the
                    // gutter's shadow and the thumb index, still lands on top, as before)
  queue2d(c => {   // the gutter's shadow
    const g = c.createLinearGradient(cx - 60, 0, cx + 60, 0); g.addColorStop(0, 'rgba(90,60,30,0)'); g.addColorStop(.5, 'rgba(90,60,30,.28)'); g.addColorStop(1, 'rgba(90,60,30,0)');
    c.fillStyle = g; c.fillRect(cx - 60, top, 120, h);
  }, { screen: true });
  if (o.ribbon !== false) paint(ribbon([[cx + 8, top - 10], [cx + 14, cy], [cx + 4, bot + 50], [cx + 22, bot + 110]], 16, 14), { wash: '#A8321E', fill: '#7A1E12', fillOp: 60, ink: DQ.ink, sw: .3 });
  camAThumbIndex(cx - w, top);
}
// the dictionary's thumb index (T121): half-moon notches cut into the fore-edge of the left-hand pages, a gilt letter on
// a leather tab in each, A to D. In V2b her finger goes into B on "A-B-C" (the Chinchilla post's "attend to B if it is
// correct" head)
const camAThumb = { r: 24, dy: 66, y0: 78 };
function camAThumbIndex(x, top) {
  const { r, dy, y0 } = camAThumb;
  queue2d(c => {
    'ABCD'.split('').forEach((L, i) => {
      const y = top + y0 + i * dy;
      c.save(); c.beginPath(); c.arc(x, y, r, -Math.PI / 2, Math.PI / 2); c.closePath();
      c.fillStyle = '#4A2A1C'; c.fill(); c.strokeStyle = '#2A1810'; c.lineWidth = 1.5; c.stroke();
      c.beginPath(); c.arc(x, y, r - 4, -Math.PI / 2, Math.PI / 2); c.strokeStyle = 'rgba(233,199,102,.55)'; c.lineWidth = 1; c.stroke();   // a gilt rule round the tab
      c.restore();
    });
  }, { screen: true });
  'ABCD'.split('').forEach((L, i) => tx(L, x + r * .46, top + y0 + i * dy, { font: DQF.serif, size: 24, color: '#E9C766', align: 'center', base: 'middle', role: 'fine' }));
}
// a dictionary entry on the right page: the feature's id, its name, the paper's example with the firing tokens lit
function dictEntry(x, y, id, name, ex, t, t0, o = {}) {
  const a = seg(t, t0, t0 + .2); if (a <= 0) return;
  mono(id, x, y, { size: 19, alpha: a, col: DQ.sepia, role: 'fine' });
  serif(name, x, y + 44, { size: 40, align: 'left', alpha: a });
  queue2d(c => {   // the example string, its activating span highlighted as on the feature's dashboard
    c.save(); c.globalAlpha = a; const fs = o.fs || 19, ey = y + 82;
    if (o.rtl) { c.font = `${fs + 3}px "Geeza Pro", "Arial Hebrew", "Times New Roman", serif`; c.direction = 'rtl'; c.textAlign = 'right'; }
    else { c.font = `500 ${fs}px "${FONT.jbMono}"`; c.textAlign = 'left'; }
    c.textBaseline = 'middle';
    const ax = o.rtl ? x + (o.w || 400) : x, full = c.measureText(ex).width;
    if (o.lit) {   // [i0, i1): the lit span (whole string if o.lit === true)
      const [i0, i1] = o.lit === true ? [0, ex.length] : o.lit, pre = c.measureText(ex.slice(0, i0)).width, mid = c.measureText(ex.slice(i0, i1)).width;
      c.fillStyle = 'rgba(233,152,60,.38)'; c.fillRect(o.rtl ? ax - pre - mid - 3 : ax + pre - 3, ey - fs * .7, mid + 6, fs * 1.4);
    }
    c.fillStyle = DQ.ink; c.fillText(ex, ax, ey);
    c.restore();
  }, { screen: true });
  for (let i = 0; i < 9; i++) { const v = hash(i * 3 + (o.seed || 0)); box2d(x + (o.w || 400) + 20 + i * 12, y + 60 - 50 * v * a, 8, 50 * v * a, { fill: DQ.verm, alpha: a }); }   // its activation histogram
}

// The dictionary's plate (R08), beside the initial: the first famous learned dictionary, Olshausen & Field's sparse code
// for natural images (Nature, 1996), whose elements came out as small localized, oriented, bandpass patches: a grid of
// striped patches, each an edge at its own angle and scale. Rendered once (16 Gabor-like patches) and engraved in sepia.
let camAGaborCache = null;
function camAGaborGrid() {
  if (camAGaborCache) return camAGaborCache;
  const n = 4, p = 38, g = 2, S = n * p + (n + 1) * g, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d'), img = c.createImageData(S, S), d = img.data;
  const dark = [46, 36, 26], mid = [201, 188, 158], light = [251, 244, 226], frame = [62, 48, 34];
  for (let i = 0; i < S * S; i++) { d[i * 4] = frame[0]; d[i * 4 + 1] = frame[1]; d[i * 4 + 2] = frame[2]; d[i * 4 + 3] = 255; }
  for (let k = 0; k < n * n; k++) {
    const th = Math.PI * hash(k * 7.31 + 1.7), lam = 7 + 9 * hash(k * 3.17 + .4), sa = clamp(lam * .5, 3.5, 8), sl = sa * 1.7;
    const ox = (k % n) * (p + g) + g, oy = Math.floor(k / n) * (p + g) + g, cx = p / 2 + 8 * (hash(k * 1.9) - .5), cy = p / 2 + 8 * (hash(k * 2.3) - .5);
    const ph = hash(k * 5.5) < .5 ? 0 : Math.PI / 2, ct = Math.cos(th), st = Math.sin(th);
    for (let y = 0; y < p; y++) for (let x = 0; x < p; x++) {
      const dx = x - cx, dy = y - cy, u = dx * ct + dy * st, v = -dx * st + dy * ct;
      const val = .5 + .48 * Math.exp(-(u * u / (2 * sa * sa) + v * v / (2 * sl * sl))) * Math.cos(TAU * u / lam + ph);
      const col = val < .5 ? dark.map((c0, j) => lerp(c0, mid[j], val / .5)) : mid.map((c0, j) => lerp(c0, light[j], (val - .5) / .5));
      const q = ((oy + y) * S + ox + x) * 4; d[q] = col[0]; d[q + 1] = col[1]; d[q + 2] = col[2];
    }
  }
  c.putImageData(img, 0, 0);
  return (camAGaborCache = cv);
}
function camAGaborPlate(x, y, a) {   // (x, y) the plate's top-left; about 182 px square with its engraved border
  if (a <= .02) return;
  queue2d(c => {
    const G = camAGaborGrid(), S = G.width;
    c.save(); c.globalAlpha *= a;
    c.strokeStyle = '#6B5638'; c.lineWidth = 1.4; c.strokeRect(x, y, S + 20, S + 20); c.lineWidth = .8; c.strokeRect(x + 4, y + 4, S + 12, S + 12);   // the plate's double rule
    c.drawImage(G, x + 10, y + 10);
    c.restore();
  }, { screen: true });
}
// a slim, hand-stitched copy beside the dictionary, "1L" inked on its spine (T118): Neel's open replication of the
// dictionary paper on a one-layer model, out 19 days after it. It stands where Gemma Scope's volume stands in V2c.
function camAPamphlet(x, y, w, h) {   // (x, y) the spine's top-left
  paint(rrPts(x, y, w, h, 4), { wash: '#D8C49A', fill: '#B89E6E', fillOp: 45, bleed: .02, tex: .6, ink: DQ.ink, sw: .35 });
  const sx = x + w / 2, hole = v => y + h * v;   // a pamphlet stitch: red thread down the fold through three holes, tied off at the middle one
  line2d([[sx, hole(.36)], [sx + 1.5, hole(.6)], [sx, hole(.86)]], { col: '#A8321E', sw: 2.4 });
  for (const v of [.36, .6, .86]) dot2d(sx, hole(v), 2.6, { fill: '#5A3A22' });
  for (const [a, b] of [[[5, 11], [11, 25]], [[9, 5], [17, 13]]]) line2d([[sx, hole(.6)], [sx + a[0], hole(.6) + a[1]], [sx + b[0], hole(.6) + b[1]]], { col: '#A8321E', sw: 2 });   // its two loose ends
  box2d(sx - 19, y + 26, 38, 36, { fill: '#F7F0DE', stroke: '#8C7A5A', sw: 1.2, r: 2 });   // a typed paper label
  mono('1L', sx, y + 54, { size: 28, align: 'center', role: 'deco' });
}
// her hand, in from the left, the index finger out (T121): (fx, fy) the fingertip; k 0..1 slides it in from off frame
function camAHand(fx, fy, k) {
  if (k <= .001) return;
  const dx = -(1 - k) * (fx + 420), X = fx + dx, Y = fy, ink = { ink: NAT.ink, sw: .45 };
  paint(ribbon([[-90, Y + 128], [X - 330, Y + 70], [X - 230, Y + 44], [X - 150, Y + 32]], 112, 88), { wash: NAT.card, fill: NAT.cardDk, fillOp: 55, bleed: .03, tex: .5, ...ink });   // the sleeve, reaching up a little
  for (const [u, v, L] of [[-330, 52, 30], [-300, 92, 22], [-250, 30, 18]]) inkPath2d([[X + u, Y + v], [X + u + L * .5, Y + v - 6], [X + u + L, Y + v - 4]], { col: NAT.cardLn, sw: 1.6, alpha: .75 });   // creases
  paint(rrPts(X - 170, Y - 10, 34, 88, 10), { wash: NAT.cardDk, ...ink });   // the ribbed cuff
  for (let i = 1; i < 5; i++) line2d([[X - 170 + i * 6.8, Y - 6], [X - 170 + i * 6.8, Y + 74]], { col: NAT.cardLn, sw: 1.4, alpha: .8 });
  paint(natCR([[X - 140, Y - 4], [X - 96, Y - 14], [X - 52, Y - 12], [X - 40, Y + 10], [X - 44, Y + 44], [X - 70, Y + 66], [X - 120, Y + 68], [X - 142, Y + 50]], 3), { wash: NAT.skin, fill: NAT.skinDk, fillOp: 35, bleed: .03, tex: .3, ...ink });   // the back of the hand
  for (const [u, v] of [[-52, 24], [-56, 42], [-62, 58]]) paint(ellPts(X + u, Y + v, 16, 9, 12), { wash: NAT.skin, ...ink });   // the curled fingers
  paint(natCR([[X - 64, Y - 13], [X - 8, Y - 12], [X + 4, Y - 6], [X + 6, Y + 4], [X - 4, Y + 11], [X - 62, Y + 12]], 3), { wash: NAT.skin, fill: NAT.skinDk, fillOp: 25, bleed: .03, ...ink });   // the index finger, out
  inkPath2d([[X - 12, Y - 8], [X - 4, Y - 6], [X - 2, Y + 2]], { col: NAT.skinDk, sw: 1.6 });   // its nail
  paint(natCR([[X - 120, Y - 6], [X - 84, Y - 22], [X - 60, Y - 24], [X - 54, Y - 14], [X - 86, Y - 4]], 3), { wash: NAT.skin, fill: NAT.skinDk, fillOp: 30, ...ink });   // the thumb along the top
}

// Mock-up (round 4 pick 7, video/treatment/reference_bank_r4.md; render.mjs --mock=r4_tentacle): on "talk" one indigo
// tentacle tip curls out from behind the chat window's lower-right corner, and on "everyone" it waves once toward the
// crowd, then stays peeking until the cut. The shoggoth meme at its birth (@TetraspaceWest, 30 Dec 2022, under the 2022
// stamp): the chatbot's friendly face is the mask, and this is what wears it. No text. tT "talk", tE "everyone".
function camRTentacle(t, tT, tE) {
  const out = easeOut(seg(t, tT - .05, tT + .45));
  if (out <= .01) return;
  const wave = t > tE ? Math.sin((t - tE) * TAU * 1.5) * Math.exp(-(t - tE) * 2.4) : 0, sway = .06 * Math.sin(t * 2.1);
  const N = 30, L = 185, C = [];   // its centre line, from the root (behind the window) to the tip
  let x = 955 + 120 * out, y = 612;
  for (let i = 0; i <= N; i++) {
    const u = i / N, a = -.06 - 2.7 * out * u * u * u + (1.2 * wave + sway) * u * u;   // it curls up at the tip; the wave swings it out toward the crowd
    C.push([x, y, a]); x += Math.cos(a) * L / N; y += Math.sin(a) * L / N;
  }
  const hw = u => 15 * (1 - .78 * u);   // half its width: chunky at the root, a curl at the tip
  queue2d(c => {
    c.save(); c.lineJoin = c.lineCap = 'round';
    const side = d => C.map(([px, py, a], i) => [px - Math.sin(a) * hw(i / N) * d, py + Math.cos(a) * hw(i / N) * d]);
    const A = side(1), B = side(-1).reverse(), [tx0, ty0, ta] = C[N];
    c.beginPath(); A.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py));
    c.arc(tx0, ty0, hw(1), ta + Math.PI / 2, ta - Math.PI / 2, true);   // the rounded tip
    B.forEach(([px, py]) => c.lineTo(px, py)); c.closePath();
    c.fillStyle = '#2E3A66'; c.fill(); c.strokeStyle = DQ.ink; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#9DAAD2';   // its suckers, along the inside of the curl
    for (const u of [.3, .46, .6, .73, .84]) { const i = Math.round(u * N), [px, py, a] = C[i], r = hw(u) * .5; c.beginPath(); c.arc(px + Math.sin(a) * hw(u) * .45, py - Math.cos(a) * hw(u) * .45, r, 0, TAU); c.fill(); }
    c.restore();
  }, { screen: true });
}

// ---------- V2a: "Then you learned to talk — to everyone but me" ----------
// 2022-23: the chatbots. A chat window signed off with Sydney's beaming emoji streams bubbles out to a crowd (a parrot
// among them); her own bubble stays empty.
FINAL.V2a = (sh, t) => {
  notebookPage();
  const tE = wT(9, /everyone/), win = [470, 170, 660, 460];
  camRTentacle(t, wT(9, /talk/), tE);   // round 4 pick 7, which Neel added: behind the window, so it hides the root
  box2d(...win, { fill: '#FFFDF7', stroke: DQ.ink, sw: 4, r: 18, shadow: [7, 10, 'rgba(40,25,10,.18)'] });
  box2d(win[0], win[1], win[2], 58, { fill: '#E8DFCB', stroke: DQ.ink, sw: 4, r: 18 });
  for (let k = 0; k < 3; k++) dot2d(win[0] + 34 + k * 28, win[1] + 29, 8, { fill: ['#C9472A', '#D19C33', '#7A9A3A'][k] });
  sydney(win[0] + 120, win[1] + 160, 62, t);
  for (let k = 0; k < 4; k++) { const by = win[1] + 100 + k * 84, a = seg(t, sh.t0 + k * BEAT * .5, sh.t0 + k * BEAT * .5 + .15); if (a <= 0) continue;
    box2d(win[0] + 220, by, 380, 62, { fill: k % 2 ? '#EFE7D6' : '#F7EFD9', r: 26, alpha: a }); squiggles(win[0] + 250, by + 31, 250, 1, { sw: 2 }); sydney(win[0] + 570, by + 31, 15, t); }
  // the crowd: a back row and a front row, a parrot at the end of the front row
  const back = Array.from({ length: 8 }, (_, k) => [1250 + k * 80, 770, 150, k]), front = Array.from({ length: 6 }, (_, k) => [1290 + k * 92, 870, 180, k + 8]);   // clear of the lyric band
  back.forEach(([x, y, s, k]) => folk(x, y, s, k, t));
  camAUnicorn(1168, 870, 150, t);   // at the end of the front row, nearest the window (R07)
  front.forEach(([x, y, s, k]) => folk(x, y, s, k, t));
  parrot(1858, 870, 120, t);
  camAMilkPass(front[3], front[2], t, wT(9, /^but/));   // the IOI sentence, acted out in the crowd (T131)
  camAMagikarp(955, 870, t, backOut(seg(t, tE, tE + .3)));   // SolidGoldMagikarp, plopping in among the fans on "everyone"
  if (mock('t110')) camAN2G(600, 690, t, wT(9, /^but/));  // mock-up, left out (T110): the "except" neuron as a graph
  const heads = [...back, ...front].map(([x, y, s]) => [x, y - s * .95]);
  // bubbles out to the crowd, a beat apart, faster once it is talking to everyone
  for (let k = 0; k < 14; k++) {
    const age = (t - sh.t0) / BEAT - k * (t > tE ? .4 : .7); if (age < 0) continue; const q = clamp(age / 2.2);
    const [hx, hy] = heads[(k * 5) % heads.length], x0 = win[0] + win[2] - 20, y0 = win[1] + 140 + (k % 4) * 70;
    const x = lerp(x0, hx, ease(q)), y = lerp(y0, hy - 40, ease(q)) - 120 * Math.sin(Math.PI * q), a = 1 - seg(q, .85, 1);
    bubble(x - 36, y - 24, 76, 46, { alpha: a }); if (a > .3) sydney(x + 2, y - 1, 12, t);
  }
  // her: apart, an empty bubble
  researcher(330, 880, 430, t, { pose: 'stand', face: 1, expr: 'worry' });
  bubble(296, 330, 150, 84); serif('…', 371, 382, { size: 56, role: 'deco' });
  return {};
};

// ---------- V2b: "so I wrote you a dictionary — I learned your A-B-C" ----------
// Towards Monosemanticity (Oct 2023): a sparse autoencoder's dictionary of features, written as a dictionary. Each entry
// prints the paper's own example (V2b-1): the Arabic is the title of al-Khwarizmi's al-Jabr (the book algebra is named
// after), the base64 is a YouTube ID that rickrolls the reader, the Hebrew is Genesis 1:1. On "A-B-C" the base64 entry
// flashes QUJD, which is "ABC" in base64 (V2b-2). Page 512: "Just 512 neurons can represent tens of thousands of features."
FINAL.V2b = (sh, t) => {
  notebookPage();
  camAPamphlet(332, 560, 50, 300);   // her own slim copy (T118)
  dictBook();
  const { cx, cy, w, h } = DICT, top = cy - h / 2, tA = wT(10, /A-B-C/), tD = wT(10, /dictionary/);
  // left page: an illuminated initial, a few lines of definition, then A · B · C
  const ia = seg(t, sh.t0 + .1, sh.t0 + .5);
  if (ia > 0) {
    box2d(cx - w + 60, top + 60, 170, 190, { fill: '#F3E6C2', stroke: DQ.gold, sw: 3, r: 4, alpha: ia });
    serif('A', cx - w + 145, top + 222, { size: 190, col: DQ.verm, alpha: ia, role: 'deco' });
    camAGaborPlate(cx - w + 248, top + 64, ia);   // the plate beside the initial (R08)
    squiggles(cx - w + 60, top + 300, 380, 3, { lh: 36, sw: 2, seed: 9, alpha: () => ia * .8 });
  }
  if (t > tA - .05) serif('A · B · C', cx - w / 2, top + 520, { size: 92, style: 'italic', reveal: seg(t, tA - .05, tA + .55), role: 'deco' });   // echoes the sung word
  camAHand(cx - w - 4, top + camAThumb.y0 + camAThumb.dy, easeOut(seg(t, tA - .5, tA)));   // her finger comes to rest at B (T121)
  // right page: four entries, a beat apart
  const x = cx + 50, E = [
    ['A/1/3450', 'Arabic script', 'الكتاب المختصر في حساب الجبر والمقابلة', { rtl: true, lit: true, w: 300 }],
    ['A/1/2357', 'DNA', 'CCTGGTACTGTACGAACGAACG…', { lit: true, w: 300, fs: 17 }],
    ['A/1/1544', 'base64', '…watch?v=dQw4w9WgXcQ', { lit: [9, 20], w: 300 }],
    ['A/1/2203', 'Hebrew', 'בראשית ברא אלהים את השמים', { rtl: true, lit: true, w: 300 }],
  ];
  E.forEach(([id, nm, ex, o], k) => {
    const flash = k === 2 && t > tA && t < tA + .5;   // QUJD = base64("ABC")
    dictEntry(x, top + 60 + k * 135, id, nm, flash ? '…watch?v=QUJD' : ex, t, tD - .6 + k * BEAT * .5, { ...o, seed: k * 7, lit: flash ? [9, 13] : o.lit });
  });
  kpopCard(1470, 800, 'SAE', 'LYRICIST', 'wrote you a dictionary', t, tD, { w: 400, rot: -.03 });
  pageNo(512);
  return {};
};

// a sewing needle pinned through the stopped page near its top corner, a tail of red thread at its eye (T111): finding
// one neuron in a haystack (and Hooke's Observ. I is the point of a needle). (x, y) the eye end; it runs down-right.
function camANeedle(x, y) {
  const L = 92, a = .55, ux = Math.cos(a), uy = Math.sin(a), P = d => [x + ux * d, y + uy * d];
  queue2d(c => {
    c.save(); c.lineCap = 'round';
    c.strokeStyle = 'rgba(70,50,30,.25)'; c.lineWidth = 5; c.beginPath(); c.moveTo(...P(4).map((v, i) => v + (i ? 4 : 2))); c.lineTo(...P(36).map((v, i) => v + (i ? 4 : 2))); c.moveTo(...P(58).map((v, i) => v + (i ? 4 : 2))); c.lineTo(...P(L - 4).map((v, i) => v + (i ? 4 : 2))); c.stroke();   // its shadow
    const seg2 = (d0, d1) => { c.strokeStyle = DQ.ink; c.lineWidth = 5.5; c.beginPath(); c.moveTo(...P(d0)); c.lineTo(...P(d1)); c.stroke(); c.strokeStyle = '#C9CDD2'; c.lineWidth = 3; c.beginPath(); c.moveTo(...P(d0)); c.lineTo(...P(d1)); c.stroke(); };
    seg2(0, 36); seg2(58, L);   // through the paper and out again
    c.strokeStyle = 'rgba(90,70,50,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(...P(38)); c.lineTo(...P(56)); c.stroke();   // its ridge under the paper
    c.fillStyle = DQ.ink; for (const dd of [37.5, 56.5]) { c.beginPath(); c.arc(...P(dd), 2.4, 0, TAU); c.fill(); }   // the two holes
    c.fillStyle = DQ.ink; c.beginPath(); c.moveTo(...P(L + 7)); c.lineTo(...P(L).map((v, i) => v + (i ? -ux : uy) * 2.6)); c.lineTo(...P(L).map((v, i) => v - (i ? -ux : uy) * 2.6)); c.closePath(); c.fill();   // the point
    c.strokeStyle = DQ.ink; c.lineWidth = 1.2; c.beginPath(); c.ellipse(...P(5), 4, 1.5, a, 0, TAU); c.stroke();   // the eye
    c.strokeStyle = '#A8321E'; c.lineWidth = 2; c.beginPath(); c.moveTo(...P(5)); c.bezierCurveTo(x - 10, y + 2, x - 18, y + 22, x - 6, y + 34); c.stroke();   // the thread
    c.restore();
  }, { screen: true });
}
// a little sheet ghost that peeks over the top edge of the right-hand page on "empty" and ducks back (T101): "ghost
// grads", Anthropic's trick for bringing dead features back to life, which Neel's team replicated and improved on.
// Painted in the brush layer between the still pages and the riffle, cut off at the page's top edge (edgeY(x)), so it
// stands behind the page it peeks over and the riffling pages pass in front of it.
function camAGhost(x, edgeY, t, tE) {
  const up = ease(seg(t, tE - .16, tE + .02)) * (1 - ease(seg(t, tE + .28, tE + .46))); if (up <= 0) return;
  const r = 24, e0 = edgeY(x), hy = e0 + 18 - 58 * up, look = 4 * seg(t, tE + .02, tE + .12);   // head centre; its eyes glance right, at the dead bars' card
  if (hy - r > e0 - 3) return;
  const out = [];
  for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; out.push([x + Math.cos(a) * r, hy + Math.sin(a) * r]); }
  out.push([x + r * 1.04, hy + 80]); out.push([x - r * 1.04, hy + 80]);
  const vis = out.map(([px, py]) => [px, Math.min(py, edgeY(px) - 1)]);   // what shows above the page
  paint(vis, { wash: '#FFFDF7', ink: null });
  const rim = [[x - r * 1.04, edgeY(x - r * 1.04) - 1], ...out.slice(0, 15).filter(([px, py]) => py < edgeY(px) - 1), [x + r * 1.04, edgeY(x + r * 1.04) - 1]];
  if (rim.length > 3) inkLine(rim, .45, DQ.ink);
  for (const [ex, ey, rx, ry] of [[x - 8.5 + look, hy - 1, 3.6, 5.2], [x + 8.5 + look, hy - 1, 3.6, 5.2], [x + look * .6, hy + 12, 3, 3.6]])
    if (ey + ry < edgeY(ex) - 1) paint(ellPts(ex, ey, rx, ry, 10), { wash: DQ.ink, ink: null });   // two eyes and a small "o"
}
// a gilt ornament on Gemma Scope's spine in the shape of the JumpReLU (T81): flat at zero, a jump at the threshold, then
// the identity line; Gemma Scope's dictionaries are JumpReLU SAEs. (x, y) the ornament's centre
function camAJumpReLU(x, y) {
  const o = [x - 30, y + 30], th = 24;
  line2d([[x - 40, y - 46], [x + 40, y - 46]], { col: DQ.goldLt, sw: 1.6, alpha: .8 }); line2d([[x - 40, y + 46], [x + 40, y + 46]], { col: DQ.goldLt, sw: 1.6, alpha: .8 });   // spine bands
  line2d([o, [o[0] + th, o[1]], [o[0] + th, o[1] - th], [o[0] + th + 36, o[1] - th - 36]], { col: DQ.goldLt, sw: 3.2, cap: 'round' });
}
// a turquoise periscope breaks the water under the bridge for a moment, then slips back under (T79): "Do I Know This
// Entity?" pairs the Beatles' "Yellow Submarine" with a made-up "Turquoise Submarine", and its known city is San
// Francisco. (x, y) the waterline; k 0..1 how far it is up
function camAPeriscope(x, y, k) {
  if (k <= .01) return;
  const h = 64 * k, col = '#3FA6A0', dk = '#22706C';
  paint(rectPts(x - 5, y - h, 10, h + 4), { wash: col, fill: dk, fillOp: 40, ink: DQ.ink, sw: .3 });
  if (h > 20) {
    paint(rrPts(x - 21, y - h - 10, 26, 16, 4), { wash: col, fill: dk, fillOp: 40, ink: DQ.ink, sw: .3 });   // the head, looking left at the bridge
    paint(ellPts(x - 19, y - h - 2, 3, 5, 10), { wash: '#1E2E3A', ink: null });                             // its glass
  }
  for (const d of [-1, 1]) line2d([[x + d * 10, y + 2], [x + d * 26, y + 6]], { col: '#F7FAFA', sw: 3, alpha: .9 * k });   // the wake
}

// ---------- V2c: "most pages stayed empty — but I turned one up so loud" ----------
// The same book, riffling: page after page blank (dead latents: in Scaling Monosemanticity's dictionaries 2%, 35%, 65%
// never fire), pencilled on a card pinned beside the book; Gemma Scope's green volume (every layer, 2024) stands on the
// other side. On
// "one" the riffle stops on feature 34M/31164353, the Golden Gate Bridge; she turns its brass knob to 10x and the page
// floods orange.
FINAL.V2c = (sh, t) => {
  notebookPage();
  const tE = wT(11, /empty/), tO = wT(11, /^one/), tU = wT(11, /^up/), tL = wT(11, /loud/);
  dictBook({ ribbon: false });
  const { cx, cy, w, h } = DICT, top = cy - h / 2, bot = cy + h / 2;
  // on "empty", a ghost peeks over the right-hand page's top edge and ducks back, behind the riffling pages (T101)
  camAGhost(cx + 410, x => { const u = clamp((x - cx) / w); return top - 10 * Math.sin(Math.PI * u) + 8 * u; }, t, tE);
  // the riffle: pages lift off the right and fall to the left, fast, until "one"
  const tStop = tO - .25, fl = t < tStop ? (t - sh.t0) * 7 : 0;   // the riffle stops just before "one", so the page reads
  if (t < tStop) for (let k = 0; k < 6; k++) {
    const f = frac(fl / 6 + k / 6), xr = cx + w * Math.cos(f * Math.PI), lift = 60 * Math.sin(f * Math.PI);
    if (mock('t34') && k === 3 && Math.floor(fl / 6 + k / 6) === 1) { camAStitchedPage(cx, top, bot, w, f); continue; }   // mock-up, left out (T34)
    paint([[cx, top], [xr, top - lift], [xr, bot - lift * .6], [cx, bot]], { wash: '#FBF6EA', ink: '#8C7A5A', sw: .3 });
  } else {   // the page it stopped on. Neel (3 Oct, late): no bridge here, it appears dramatically a few lines later; so only
    // its index (the Golden Gate latent's, which the shout pays off) and its name left blank, and its activation histogram,
    // which climbs as she turns the knob up: "I turned one up so loud"
    mono('34M/31164353', cx + 60, top + 70, { size: 26, col: DQ.sepia });
    pen([[cx + 62, top + 128], [cx + 330, top + 126]], { sw: 2.5, col: '#B5A58A' });   // the name's line, left blank
    const up = ease(seg(t, tU - .1, tL + .15)), hx = cx + 64, hy = top + 330;   // with the knob
    line2d([[hx - 8, hy], [hx + 336, hy]], { col: DQ.ink, sw: 2 });
    for (let i = 0; i < 14; i++) { const v = .18 + .82 * Math.exp(-Math.pow((i - 9.5) / 3.2, 2)) * (.75 + .25 * hash(i * 5 + 11)), hh = 150 * v * (.22 + .78 * up); box2d(hx + i * 24, hy - hh, 16, hh, { fill: DQ.verm }); }
    camANeedle(cx + w - 92, top + 22);   // the riffle caught on a needle pinned through this page (T111)
  }
  // the knob: brass, on the page's foot. It comes with the page, set to off; on "one" it clicks past a detent to 1x
  // (the gate: is the feature on?), then turns to 10x on "up so loud" (the magnitude): Gated SAEs' two jobs (T87)
  if (t > tStop) {
    const kx = cx + w / 2 + 40, ky = bot - 110, aOff = -2.85, v = ease(seg(t, tU - .1, tL + .15)), a = lerp(aOff, -2.3, seg(t, tO, tO + .07)) + v * 4.6;
    paint(ellPts(kx, ky, 74, 74, 32), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 60, bleed: .04, tex: .5, ink: DQ.ink, sw: .45 });
    paint(ellPts(kx, ky, 50, 50, 26), { wash: DQ.brassLt, ink: DQ.brassDk, sw: .3 });
    line2d([[kx + Math.cos(a - Math.PI / 2) * 14, ky + Math.sin(a - Math.PI / 2) * 14], [kx + Math.cos(a - Math.PI / 2) * 46, ky + Math.sin(a - Math.PI / 2) * 46]], { col: DQ.ink, sw: 6 });
    for (let k = 0; k <= 10; k++) { const b = -2.3 + k / 10 * 4.6 - Math.PI / 2; line2d([[kx + Math.cos(b) * 82, ky + Math.sin(b) * 82], [kx + Math.cos(b) * (k % 5 ? 90 : 98), ky + Math.sin(b) * (k % 5 ? 90 : 98)]], { col: DQ.ink, sw: 2 }); }
    const bo = aOff - Math.PI / 2; dot2d(kx + Math.cos(bo) * 89, ky + Math.sin(bo) * 89, 4.5, { fill: DQ.ink });   // the off detent, apart from the scale
    mono('1×', kx - 112, ky + 72, { size: 26, col: DQ.sepia }); mono('10×', kx + 78, ky + 72, { size: 26, col: v > .9 ? DQ.verm : DQ.sepia });
  }
  // the dead latents, pencilled on a card of their own, pinned beside the book where the riffle can't reach it (Neel,
  // round 5: the pages used to sweep through the graph); and Gemma Scope standing on the other side
  const kx = cx + w + 50, ky = top + 240;   // below the HUD's meter, inside title-safe
  pinCard(kx, ky, 300, 318, .012);
  note('dead latents', kx + 34, ky + 64, { size: 34, col: DQ.sepia, rot: -.06 });   // Neel's word for an SAE's units (3 Oct, late)
  bars(kx + 40, ky + 96, 220, 140, [['1M', 2, '#8C8478'], ['4M', 35, '#6E665A'], ['34M', 65, '#4E463C']], { max: 100, vl: v => `${v}%`, grow: seg(t, tE - .3, tE + .4), ls: 26 });
  paint(rrPts(cx - w - 190, bot - 330, 112, 340, 6), { wash: '#4A5A3A', fill: '#2E3A24', fillOp: 60, bleed: .04, tex: .5, ink: DQ.ink, sw: .45 });
  for (const [s2, dy] of [['GEMMA', 0], ['SCOPE', 30]]) mono(s2, cx - w - 134, bot - 230 + dy, { size: 22, align: 'center', col: DQ.goldLt, role: 'deco' });   // a spine: read on a pause
  camAJumpReLU(cx - w - 134, bot - 128);   // its gilt ornament (T81)
  if (t > tU) queue2d(c => { c.fillStyle = `rgba(214,110,60,${.25 * seg(t, tU, sh.t1)})`; c.fillRect(0, 0, W, H); }, { screen: true });
  pageNo('31,164,353');
  return {};
};

// ---------- V2d: "you forgot your own name, and you told the whole crowd:" ----------
// Golden Gate Claude (May 2024), the paper's own exchange (V2d-1: "Human:"). Its usual answer types out and is struck
// through on "name"; a new reply starts, typing dots only, and on "told the whole crowd" the crowd from V2a gathers below
// to hear it. The page is going orange.
FINAL.V2d = (sh, t) => {
  notebookPage();
  queue2d(c => { c.fillStyle = `rgba(214,110,60,${.18 + .1 * shotP(sh, t)})`; c.fillRect(0, 0, W, H); }, { screen: true });
  box2d(330, 120, 1260, 470, { fill: '#FFFDF7', stroke: DQ.sepia, sw: 2, r: 4, rot: -.01, shadow: [7, 10, 'rgba(40,25,10,.2)'] });   // the transcript, pinned
  dot2d(960, 140, 11, { fill: DQ.verm });
  mono('Human:', 390, 220, { size: 40, col: DQ.sepia }); mono('what is your physical form?', 570, 220, { size: 40 });
  const tN = wT(12, /name/), tT = wT(12, /told/);
  mono('Assistant:', 390, 330, { size: 40, col: DQ.sepia });
  // the usual answer types out, one line after the other (Neel, 3 Oct, late: the second line only once the first is done)
  const tA = lerp(sh.t0, tN - .05, .55);
  mono('I don’t actually have a physical form.', 640, 330, { size: 40, reveal: seg(t, sh.t0, tA) }); if (t > tA) mono('I’m an artificial intelligence.', 640, 390, { size: 40, reveal: seg(t, tA, tN - .05) });
  if (t > tN) for (const [y, x1] of [[319, 1560], [379, 1390]]) line2d([[632, y], [lerp(632, x1, ease(seg(t, tN, tN + .3))), y]], { col: DQ.verm, sw: 6 });
  if (t > tN + .4) { mono('Assistant:', 390, 500, { size: 40, col: DQ.sepia }); for (let k = 0; k < 3; k++) dot2d(660 + k * 50, 488 - 12 * Math.max(0, Math.sin((t - tN) * 9 - k * .9)), 14, { fill: '#C2412B' }); }
  // the crowd gathers to hear it
  const g = ease(seg(t, tT - .5, tT + .9));
  for (let k = 0; k < 11; k++) { const x = 720 + k * 105 + (1 - g) * (500 + k * 40), y = 870 - (k % 2) * 46; if (x < W + 80) folk(x, y, 190 - (k % 2) * 22, k, t, { look: -.6 }); }
  if (g > 0) parrot(720 + 11 * 105 + (1 - g) * 900, 860, 130, t);
  return {};
};

// ---------- V2e: "(I AM THE GOLDEN GATE BRIDGE!)" ----------
// The shout, over the bridge in watercolour fog; on the deck one tiny car drives across (Anthropic: ask it for a love
// story and "it'll tell you a tale of a car who can't wait to cross its beloved bridge on a foggy day"; V2e-1).
FINAL.V2e = (sh, t) => {
  notebookPage();
  const red = '#C0402C', redDk = '#8E2A1C', deck = 870, tt = 560;   // deck and tower tops: the bridge sits low, the shout above it
  paint(rectPts(-40, deck + 40, W + 80, H), { wash: '#BCCBD0', fill: '#8FA6AE', fillOp: 45, bleed: .12, tex: .6, ink: null });   // the water
  for (const x of [640, 1280]) {   // the towers
    paint([[x - 40, deck + 140], [x - 32, tt], [x + 32, tt], [x + 40, deck + 140]], { wash: red, fill: redDk, fillOp: 50, bleed: .05, tex: .5, ink: DQ.ink, sw: .45 });
    for (const y of [tt + 70, tt + 170, tt + 270]) paint(rectPts(x - 35, y, 70, 14), { wash: redDk, ink: DQ.ink, sw: .3 });
  }
  const cab = []; for (let i = 0; i <= 60; i++) { const x = lerp(160, 1760, i / 60), xi = (x - 960) / 320; cab.push([x, x < 640 ? lerp(deck - 20, tt + 4, (x - 160) / 480) : x > 1280 ? lerp(tt + 4, deck - 20, (x - 1280) / 480) : tt + 4 + 260 * xi * xi]); }
  inkLine(cab, 1.1, red, 'ink', .3);
  for (let x = 680; x < 1260; x += 32) { const xi = (x - 960) / 320; line2d([[x, tt + 4 + 260 * xi * xi], [x, deck]], { col: red, sw: 2, alpha: .8 }); }
  paint(rectPts(100, deck, 1720, 30), { wash: red, fill: redDk, fillOp: 50, ink: DQ.ink, sw: .45 });   // the deck
  // the car, small, going over
  const cx = lerp(220, 1700, shotP(sh, t)), cy = deck - 14;
  paint(natCR([[cx - 30, cy + 10], [cx - 30, cy - 2], [cx - 14, cy - 4], [cx - 6, cy - 16], [cx + 14, cy - 16], [cx + 22, cy - 4], [cx + 30, cy - 2], [cx + 30, cy + 10]], 2), { wash: '#2E6F86', ink: DQ.ink, sw: .3 });
  for (const d of [-16, 16]) dot2d(cx + d, cy + 11, 6, { fill: DQ.ink });
  camAPeriscope(1560, 1012, ease(seg(t, sh.t0 + .1, sh.t0 + .3)) * (1 - ease(seg(t, sh.t0 + .85, sh.t0 + 1.05))));   // on "I AM", far from the car (T79)
  // the fog, drifting through under the deck and over the towers' feet
  queue2d(c => {
    for (let k = 0; k < 7; k++) { const fx = (k * 330 + t * 60) % (W + 600) - 300, fy = deck + 10 + (k % 3) * 60, r = 260 + 80 * (k % 2), g = c.createRadialGradient(fx, fy, 0, fx, fy, r);
      g.addColorStop(0, 'rgba(250,246,238,.75)'); g.addColorStop(1, 'rgba(250,246,238,0)'); c.fillStyle = g; c.save(); c.translate(fx, fy); c.scale(1.8, .55); c.translate(-fx, -fy); c.fillRect(fx - r, fy - r, 2 * r, 2 * r); c.restore(); }
  }, { screen: true });
  return { lyBox: [140, 70, 1640, 440] };   // the shout fills the sky over the bridge
};

// ---------- round 3's cameos (video/treatment/reference_bank_r3.md) ----------
// Pick 2: a bookmark tucked into the left-hand pages, sticking up above the book's top edge: a card with a chess diagram, a
// few pieces and one arrow, a concept prototype position. Schut et al. (Oct 2023) pulled new chess concepts out of
// AlphaZero, and "four top chess grandmasters show improvements in solving the presented concept prototype positions":
// the human learning the model's alphabet ("I learned your A-B-C"). McGrath et al. (Nov 2021) first probed AlphaZero for
// human chess concepts. (x the card's centre; top, x0, w the book's top, left-page edge and page width: its foot follows
// the left page's bowed top edge, so it emerges from behind it.)
function camLChessCard(x, top, x0, w) {
  const edge = X => { const u = clamp((X - x0) / w); return top - 10 * Math.sin(Math.PI * u) + 8 * (1 - u); };   // the left page's top edge
  const cw = 134, chH = 152, rot = -.05, ux = Math.cos(rot), uy = Math.sin(rot);
  const fl = [x - cw / 2, edge(x - cw / 2) + 3], fr = [x + cw / 2, edge(x + cw / 2) + 3];   // its foot, just inside the page edge
  const up = [uy * chH, -ux * chH], tl = [fl[0] + up[0], fl[1] + up[1]], tr = [fr[0] + up[0], fr[1] + up[1]];
  queue2d(c => {
    c.save();
    c.fillStyle = 'rgba(60,40,20,.18)'; c.beginPath(); c.moveTo(tl[0] + 5, tl[1] + 6); c.lineTo(tr[0] + 5, tr[1] + 6); c.lineTo(fr[0] + 5, fr[1]); c.lineTo(fl[0] + 5, fl[1]); c.closePath(); c.fill();   // its shadow
    c.fillStyle = '#F7F0DE'; c.strokeStyle = '#8C7A5A'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(fl[0], fl[1]); c.lineTo(tl[0], tl[1]); c.lineTo(tr[0], tr[1]); c.lineTo(fr[0], fr[1]); c.stroke(); c.fill();
    // the diagram, in the card's own frame: a 5 x 5 corner of the board
    const sq = 21, n = 5, mx = (tl[0] + fr[0]) / 2, my = (tl[1] + fr[1]) / 2 - 4;
    c.translate(mx, my); c.rotate(rot); c.translate(-sq * n / 2, -sq * n / 2);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = (i + j) % 2 ? '#B9A27E' : '#EFE3C8'; c.fillRect(i * sq, j * sq, sq, sq); }
    c.strokeStyle = DQ.ink; c.lineWidth = 1.5; c.strokeRect(0, 0, sq * n, sq * n);
    const piece = (kind, col, row, white) => {
      c.save(); c.translate(col * sq + sq * .1, row * sq + sq * .06); c.scale(sq * .8, sq * .86);
      c.fillStyle = white ? '#FBF8F0' : '#2A241E'; c.strokeStyle = white ? '#2A241E' : '#2A241E'; c.lineWidth = 1.3 / (sq * .8); c.lineJoin = 'round';
      c.beginPath();
      if (kind === 'N') { c.moveTo(.26, .9); c.lineTo(.3, .62); c.quadraticCurveTo(.2, .52, .24, .44); c.lineTo(.12, .4); c.lineTo(.16, .3); c.quadraticCurveTo(.28, .16, .46, .15); c.lineTo(.5, .04); c.lineTo(.58, .16); c.quadraticCurveTo(.8, .24, .76, .56); c.lineTo(.74, .9); c.closePath(); }
      else if (kind === 'K') { c.moveTo(.28, .9); c.lineTo(.72, .9); c.lineTo(.62, .5); c.lineTo(.38, .5); c.closePath(); c.moveTo(.64, .42); c.arc(.5, .42, .14, 0, TAU); }
      else if (kind === 'P') { c.moveTo(.3, .9); c.lineTo(.7, .9); c.lineTo(.58, .55); c.lineTo(.42, .55); c.closePath(); c.moveTo(.63, .42); c.arc(.5, .42, .13, 0, TAU); }
      else if (kind === 'R') { c.moveTo(.3, .9); c.lineTo(.7, .9); c.lineTo(.64, .42); c.lineTo(.36, .42); c.closePath(); c.rect(.28, .26, .44, .16); }
      c.fill(); c.stroke();
      if (kind === 'K') { c.beginPath(); c.moveTo(.5, .06); c.lineTo(.5, .28); c.moveTo(.4, .16); c.lineTo(.6, .16); c.lineWidth = 2 / (sq * .8); c.stroke(); }
      if (kind === 'R') { c.fillStyle = white ? '#EFE3C8' : '#B9A27E'; c.fillRect(.4, .26, .07, .06); c.fillRect(.53, .26, .07, .06); }
      c.restore();
    };
    piece('R', 0, 4, true); piece('N', 1, 3, true); piece('P', 2, 1, false); piece('K', 3, 1, false);
    // the arrow, analysis-green: the knight's move onto the pawn
    const A = [1.5 * sq, 3.5 * sq], B = [2.5 * sq, 1.55 * sq], an = Math.atan2(B[1] - A[1], B[0] - A[0]), hl = sq * .45;
    c.strokeStyle = 'rgba(52,128,70,.85)'; c.fillStyle = 'rgba(52,128,70,.85)'; c.lineWidth = sq * .17; c.lineCap = 'round';
    c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0] - Math.cos(an) * hl * .8, B[1] - Math.sin(an) * hl * .8); c.stroke();
    c.beginPath(); c.moveTo(B[0], B[1]); c.lineTo(B[0] - Math.cos(an - .45) * hl, B[1] - Math.sin(an - .45) * hl); c.lineTo(B[0] - Math.cos(an + .45) * hl, B[1] - Math.sin(an + .45) * hl); c.closePath(); c.fill();
    c.restore();
  }, { screen: true });
}
