// final_v1.js: Verse 1, finished (19.49-37.49 s; production_plan.md). Registers FINAL shots, which board() prefers over
// the animatic's boards. 2020 to 2022: neurons in the dark, a lens, five secrets pressed into two, sums in circles.
// References (video/treatment/reference_bank_final.md): V1a-1 Hooke's cork cells, V1a-2 the Inceptionism dumbbell, V1b-1
// Zoom In's car circuit, V1c-1 the car hidden in the dogs, V1c-2 the locket engraved 2/5, M2 page numbers. Round 2
// (reference_bank_r2.md): R04 the lamp's No. 381 plate; mock r04spark.

// ---------- little gold pictograms for what a cell has learned (Canvas2D, centred on x, y; s ~ the cell radius) ----------
const PICTO = {
  window(c, x, y, s) { c.strokeRect(x - s * .55, y - s * .5, s * 1.1, s * 1); c.beginPath(); c.moveTo(x, y - s * .5); c.lineTo(x, y + s * .5); c.moveTo(x - s * .55, y); c.lineTo(x + s * .55, y); c.stroke(); },
  wheel(c, x, y, s) { c.beginPath(); c.arc(x, y, s * .6, 0, TAU); c.stroke(); c.beginPath(); c.arc(x, y, s * .18, 0, TAU); c.stroke(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * s * .18, y + Math.sin(a) * s * .18); c.lineTo(x + Math.cos(a) * s * .6, y + Math.sin(a) * s * .6); c.stroke(); } },
  body(c, x, y, s) { c.beginPath(); c.moveTo(x - s * .7, y + s * .25); c.lineTo(x - s * .7, y - s * .05); c.lineTo(x - s * .35, y - s * .1); c.lineTo(x - s * .15, y - s * .4); c.lineTo(x + s * .35, y - s * .4); c.lineTo(x + s * .55, y - s * .08); c.lineTo(x + s * .7, y - s * .05); c.lineTo(x + s * .7, y + s * .25); c.closePath(); c.stroke(); },
  car(c, x, y, s) { PICTO.body(c, x, y - s * .08, s); for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * s * .38, y + s * .22, s * .17, 0, TAU); c.stroke(); } c.strokeRect(x - s * .08, y - s * .42, s * .3, s * .22); },
  dog(c, x, y, s) {   // a dog's head: a muzzle, a drooping ear, an eye
    c.beginPath(); c.moveTo(x - s * .45, y - s * .35); c.quadraticCurveTo(x - s * .05, y - s * .62, x + s * .25, y - s * .25); c.lineTo(x + s * .7, y - s * .05); c.quadraticCurveTo(x + s * .72, y + s * .22, x + s * .35, y + s * .2); c.quadraticCurveTo(x - s * .1, y + s * .5, x - s * .45, y + s * .2); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(x - s * .3, y - s * .4); c.quadraticCurveTo(x - s * .7, y - s * .1, x - s * .45, y + s * .35); c.stroke();
    c.beginPath(); c.arc(x + s * .15, y - s * .15, s * .07, 0, TAU); c.fill();
  },
};
function picto(c, kind, x, y, s, a = 1, col = '#F6DD8A') { if (a <= .02) return; c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1.6, s * .09); c.lineJoin = c.lineCap = 'round'; PICTO[kind](c, x, y, s); c.restore(); }

// ---------- V1b: "so I leaned in close and learned you, spark by spark" ----------
// Her, close, in the dark: she leans in with the brass lens and the net beyond it lights where she looks. On "close"
// 4e:55 (the hero cell) fans out what it fires for: a cat's face, a car's front, a cat's leg (Zoom In's polysemantic
// neuron). Then the sparks build Zoom In's car circuit, one cell a word: windows from the top, wheels from below, the car
// body; all three feed one cell further in, which lights as a car. Then the car does what Zoom In says it does: rather
// than one pure car cell next, it spreads over cells that look like dog detectors, each dog with a car glinting in its
// eye (V1c-1: "five secrets... never let them show" begins here). Light floods out of the lens into the next page, and
// the circuit stays on it in ink until the cut on "five".
const V1B = {
  net: { s: .76, x: 650, cy: 500 },   // the net, scaled and set right of her: x' = net.x + s * x, y' = cy + s * (y - cy)
  // the circuit, as cells of NET: layer 1 windows (top), wheels (bottom), body (middle); layer 2 the car; layer 3 the dogs
  win: [1, 1], wheel: [1, 5], body: [1, 3], car: [2, 3], dogs: [[3, 1], [3, 3], [3, 4]],
};
const v1bNet = (l, i) => { const [x, y] = NET.N[l][i]; return [V1B.net.x + V1B.net.s * x, V1B.net.cy + V1B.net.s * (y - V1B.net.cy)]; };
// What each cell of the circuit has learned, as little pictograms just above it (a touch bigger since Neel's note, so
// they read in the time they are up). fade(t1): how far in each is, given when its cell lit. col: gold on the dark page,
// ink once the dawn has turned it to paper.
function v1bPictos(c, fade, at, tDogs, t, col = '#F6DD8A', glint = '#FFFFFF') {
  const P = (cell, kind, t1, s) => { const [x, y] = v1bNet(...cell); picto(c, kind, x, y - 12 - s, s, fade(t1), col); };
  P(V1B.win, 'window', at.win, 25); P(V1B.wheel, 'wheel', at.wheel, 25); P(V1B.body, 'body', at.body, 25); P(V1B.car, 'car', at.car, 34);
  V1B.dogs.forEach((d, k) => { const [x, y] = v1bNet(...d), a = fade(tDogs), s = 29; picto(c, 'dog', x, y - 12 - s, s, a, col);
    if (a > 0) picto(c, 'car', x + s * .15, y - 13 - s * 1.15, s * .23, a * (.6 + .4 * Math.sin(t * 9 + k)), glint); });   // the car, glinting in its eye
}
FINAL.V1b = (sh, t) => {
  darkPage('#0C0F1C', '#1A2034');
  const tC = wT(2, /close/), tL = wT(2, /learned/), tS1 = wTk(2, /spark/, 0), tBy = wT(2, /^by/), tS2 = wTk(2, /spark/, 1);
  // Neel (3 Oct, late): the circuit went by too fast to see. So the shot now runs on to the downbeat on "five" (V1c's cut),
  // the car circuit holds alone for a beat and a half, the dogs light a beat later, and the dawn comes on the last beat
  const tCar = tS2 + .08, tDogs = sh.t1 - 2 * BEAT, tDawn = sh.t1 - BEAT;
  // the circuit's moments: each cell lights when its spark arrives
  const at = { win: tS1, wheel: tBy, body: tBy + .1, car: tCar };
  const key = (l, i) => l + ':' + i, litAt = new Map([[key(...V1B.win), at.win], [key(...V1B.wheel), at.wheel], [key(...V1B.body), at.body], [key(...V1B.car), at.car]]);
  V1B.dogs.forEach(d => litAt.set(key(...d), tDogs));
  const hero = NET.hero, heroK = seg(t, tC - .25, tC + .1);
  const lit = (l, i) => (l === hero[0] && i === hero[1]) ? heroK : litAt.has(key(l, i)) ? clamp((t - litAt.get(key(l, i))) / .12) : 0;
  // sparks: faint ones wander from "learned" on (her learning the net), then the circuit's own, each into its cell
  const sparks = [];
  for (let k = 0; tL + k * BEAT * .5 < tS1 - .3; k++) sparks.push({ path: netPath(k + 9), t0: tL - .64 + k * BEAT * .5, a: .35 });
  for (const [cell, t1] of [[V1B.win, at.win], [V1B.wheel, at.wheel], [V1B.body, at.body]]) sparks.push({ path: [NET.P.find(p => p[1] === cell[1])[0], cell[1], V1B.car[1], 0], t0: t1 - .32, a: 1, hops: 1 });
  queue2d(c => {
    c.save(); c.translate(V1B.net.x, V1B.net.cy * (1 - V1B.net.s)); c.scale(V1B.net.s, V1B.net.s);
    neuronNet(c, t, { lit, sparks: sparks.filter(s => !s.hops || t < s.t0 + .32), curves: true, labels: false });
    // the circuit's own wiring glows once the car has lit: three synapses into the car, three out to the dogs
    const glow = (l, i, j, a) => { if (a <= 0) return; c.save(); c.strokeStyle = '#F6DD8A'; c.lineWidth = 5; c.globalAlpha = a; c.beginPath(); for (let k = 0; k <= 16; k++) { const [x, y] = netSyn(l, i, j, k / 16); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); };
    for (const cell of [V1B.win, V1B.wheel, V1B.body]) glow(1, cell[1], V1B.car[1], .8 * seg(t, at.car, at.car + .1));
    for (const d of V1B.dogs) glow(2, V1B.car[1], d[1], .9 * seg(t, tDogs - .22, tDogs));
    c.restore();
    // pictograms: what each lit cell has learned, drawn just above it
    v1bPictos(c, t1 => seg(t, t1, t1 + .12), at, tDogs, t);
  }, { screen: true });
  const [hx, hy] = v1bNet(...hero);
  warmLight(hx, hy, 260, .5 * heroK);
  // what 4e:55 fires for, fanned out above it on "close", fading as the sparks take over
  const fan = easeOut(seg(t, tC, tC + .5)) * (1 - seg(t, tS1 - .2, tS1 + .3));
  if (fan > 0) { catFace(hx - 120 * fan, hy - 110 * fan, 24, DQ.goldLt); carFront(hx, hy - 150 * fan, 30, DQ.goldLt); catLeg(hx + 105 * fan, hy - 100 * fan, 26, DQ.goldLt); }
  flushLetters();
  // her: close, three-quarter, leaning in; a slow push in over the shot
  const push = ease(shotP(sh, t));
  const fig = { x: 215 - 20 * push, y: 1775 + 30 * push, s: 1500 + 60 * push };
  const r = researcher(fig.x, fig.y, fig.s, t, { pose: 'lean', face: 1, expr: t > tC ? 'wonder' : 'calm', blink: t > tL ? 1 : undefined });
  const [lhx, lhy] = r.hands[0], lens = [lhx + fig.s * .06, lhy - fig.s * .07], lr = fig.s * .07;
  // night: everything away from the lens falls into a deep blue; her face is lit from the lens
  blendLayer(c => {
    const g = c.createRadialGradient(lens[0], lens[1], lr * .8, lens[0] - 200, lens[1] - 40, 1300);
    g.addColorStop(0, 'rgba(255,238,212,1)'); g.addColorStop(.3, 'rgba(214,180,160,1)'); g.addColorStop(.62, 'rgba(92,90,128,1)'); g.addColorStop(1, 'rgba(34,38,72,1)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  });
  warmLight(lens[0], lens[1], lr * 2.4, .55 + .3 * seg(t, tS1 - .3, tS2 + .2));   // the lens itself glows
  queue2d(c => {   // and throws a soft beam across the net, where she is looking
    c.save(); c.translate(lens[0] + 520, lens[1] + 20); c.scale(2.6, 1);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 300); g.addColorStop(0, 'rgba(255,214,140,.16)'); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(-300, -300, 600, 600); c.restore();
  }, { screen: true });
  warmLight(r.head[0] + 60, r.head[1] + 40, 380, .18 + .14 * seg(t, tS1, tS2));   // and lights her face
  // light floods out of her lens until the page is paper (into V1c)
  const dawn = ease(seg(t, tDawn, sh.t1 - .03));
  if (dawn > 0) queue2d(c => {
    const rr = 40 + 2400 * dawn, g = c.createRadialGradient(lens[0], lens[1], rr * .55, lens[0], lens[1], rr);
    g.addColorStop(0, 'rgba(242,232,210,1)'); g.addColorStop(1, 'rgba(242,232,210,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }, { screen: true });
  // the circuit outlives the dark: as the light floods the page, its seven cells, their wiring and what each has learned
  // stay on the paper in ink, like the essay's own figure, until the cut on "five"
  const inked = ease(seg(dawn, .25, .75));
  if (inked > 0) queue2d(c => {
    const INK = '#5A4632', R = NET.R;
    c.save(); c.globalAlpha = inked; c.lineCap = c.lineJoin = 'round';
    c.save(); c.translate(V1B.net.x, V1B.net.cy * (1 - V1B.net.s)); c.scale(V1B.net.s, V1B.net.s);
    c.strokeStyle = INK; c.lineWidth = 3.4; c.fillStyle = '#F2E8D2';
    const wire = (l, i, j) => { c.beginPath(); for (let k = 0; k <= 16; k++) { const [x, y] = netSyn(l, i, j, k / 16); k ? c.lineTo(x, y) : c.moveTo(x, y); } const [x1, y1] = NET.N[l + 1][j]; c.lineTo(x1 - R, y1); c.stroke(); };   // on to the cell (no dendrites on paper)
    for (const cell of [V1B.win, V1B.wheel, V1B.body]) wire(1, cell[1], V1B.car[1]);
    for (const d of V1B.dogs) wire(2, V1B.car[1], d[1]);
    for (const [l, i] of [V1B.win, V1B.wheel, V1B.body, V1B.car, ...V1B.dogs]) { const [x, y] = NET.N[l][i]; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill(); c.stroke(); }
    c.restore();
    v1bPictos(c, () => 1, at, tDogs, t, INK, DQ.verm);
    c.restore();
  }, { screen: true });
  return { dark: dawn < .5 };
};

// ---------- V1a: "You never used to talk to me — just neurons in the dark" ----------
// The 2020 page at night: InceptionV1's layers as cells and synapses, engraved pale on the dark page, sparks running
// through it unseen. In the margin, Robert Hooke's cork cells (Micrographia, 1665: the first picture of a cell; Zoom In
// closes by comparing interpretability to it), the field's first page beside microscopy's. On "dark" an anglepoise lamp
// clicks on over mixed4e:55 and its pool of light also catches a paperweight: a dumbbell with an arm still gripping it
// (Inceptionism, 2015: the network's dumbbells all came with a weightlifter's arm).
const V1A = { lamp: [1515, 110], pool: [1510, 470], bell: [1690, 650], up: 45 };
function corkPlate(c, x, y, w, h, a) {   // an engraved plate of Hooke's cork: a field of irregular hexagonal cells
  c.save(); c.globalAlpha *= a; c.strokeStyle = '#9A96B2'; c.lineWidth = 1.6;
  c.strokeRect(x, y, w, h); c.strokeRect(x + 6, y + 6, w - 12, h - 12);
  c.beginPath(); c.rect(x + 8, y + 8, w - 16, h - 16); c.clip();
  const r = 15, dx = r * 1.5, dy = r * Math.sqrt(3);
  for (let i = -1; i * dx < w + r; i++) for (let j = -1; j * dy < h + r; j++) {
    const cx = x + i * dx + hash(i * 7 + j) * 3, cy = y + j * dy + (i % 2 ? dy / 2 : 0) + hash(i + j * 5) * 3, rr = r * (.86 + .16 * hash(i * 3 + j * 11));
    c.beginPath(); for (let k = 0; k <= 6; k++) { const ang = k / 6 * TAU + .1 * hash(i + j + k); c.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * .82); } c.stroke();
    if (hash(i * 13 + j * 3) < .35) { c.beginPath(); c.moveTo(cx - rr * .4, cy - rr * .2); c.lineTo(cx + rr * .3, cy + rr * .3); c.stroke(); }   // engraver's hatch
  }
  c.restore();
}
function dumbbellArm(c, x, y, s, a) {   // a dumbbell, and the forearm that came with it (ink, sepia hatching)
  if (a <= .02) return;
  c.save(); c.globalAlpha *= a; c.strokeStyle = '#2A241E'; c.lineWidth = 2.6; c.lineJoin = c.lineCap = 'round'; c.fillStyle = '#5A5148';
  c.beginPath(); c.moveTo(x - s * .55, y); c.lineTo(x + s * .55, y); c.stroke();   // the bar
  c.fillStyle = '#3A3A44'; for (const d of [-1, 1]) for (const k of [0, 1]) { const px = x + d * s * (.42 + k * .11); c.beginPath(); c.roundRect(px - s * .05, y - s * (.3 - k * .07), s * .1, s * (.6 - k * .14), 4); c.fill(); c.stroke(); }
  // the arm: a fist round the bar, a forearm going off up-right, a little hatching for the muscle
  c.fillStyle = '#E7B48E'; c.beginPath(); c.moveTo(x - s * .16, y - s * .1); c.quadraticCurveTo(x - s * .18, y + s * .14, x + s * .02, y + s * .15); c.quadraticCurveTo(x + s * .2, y + s * .12, x + s * .18, y - s * .08);
  c.quadraticCurveTo(x + s * .5, y - s * .3, x + s * .8, y - s * .55); c.lineTo(x + s * .62, y - s * .86); c.quadraticCurveTo(x + s * .3, y - s * .62, x - s * .16, y - s * .1); c.closePath(); c.fill(); c.stroke();
  c.lineWidth = 1.4; for (let k = 0; k < 4; k++) { const u = .35 + k * .1; c.beginPath(); c.moveTo(x + s * u, y - s * (u * 1.05 - .08)); c.lineTo(x + s * (u - .06), y - s * (u * 1.05 - .2)); c.stroke(); }
  c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(x - s * .1 + k * s * .08, y - s * .08); c.lineTo(x - s * .1 + k * s * .08, y + s * .06); } c.stroke();   // knuckles
  c.restore();
}
// The lamp's maker's plate (R04): unit 381 of Bau et al.'s scene GAN is its "lamp" unit, which draws the lamps rather
// than detecting them (PNAS, 2020), so a neuron switches on the lamp she reads neurons by. Riveted across the shade.
function camALampPlate(lx, ly, ang) {
  const d = 14, px = lx + Math.cos(ang) * d, py = ly + Math.sin(ang) * d, rot = ang - Math.PI / 2;
  queue2d(c => {
    c.save(); c.translate(px, py); c.rotate(rot);
    c.fillStyle = '#4E3A1C'; c.strokeStyle = '#C9A55A'; c.lineWidth = 1.6; c.beginPath(); c.roundRect(-44, -14, 88, 28, 5); c.fill(); c.stroke();
    c.fillStyle = '#C9A55A'; for (const x of [-39.5, 39.5]) { c.beginPath(); c.arc(x, 0, 2.2, 0, TAU); c.fill(); }   // the rivets
    c.restore();
  }, { screen: true });
  tx('No. 381', px, py, { font: DQF.type, size: 17, color: '#F1DFAE', align: 'center', base: 'middle', rot, role: 'fine' });
}
// Mock-up of the left-out half of R04 (render.mjs --mock=r04spark): just before the click on "dark", a hair-thin spark
// runs from the top cell of mixed4e round the shade to the lamp, as if unit 381 switched it on.
function camALampSpark(t, tD, lx, ly, ang) {
  const [cx, cy] = NET.N[3][0], c0 = [cx, cy - V1A.up - NET.R], sp = (d, w) => [lx + Math.cos(ang) * d - Math.sin(ang) * w, ly + Math.sin(ang) * d + Math.cos(ang) * w];
  const P = through([c0, [c0[0] - 70, c0[1] - 50], [c0[0] - 80, c0[1] - 130], sp(4, 52)], 10), q = seg(t, tD - .34, tD - .04);
  if (q <= 0 || t > tD + .3) return;
  const fade = 1 - seg(t, tD, tD + .3), n = Math.max(1, Math.round(q * (P.length - 1)));
  queue2d(c => {
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#F6DD8A'; c.lineWidth = 1.4; c.globalAlpha = .75 * fade;
    c.beginPath(); P.slice(0, n + 1).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    const [hx, hy] = P[n], g = c.createRadialGradient(hx, hy, 0, hx, hy, 16); g.addColorStop(0, 'rgba(255,236,170,.95)'); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.beginPath(); c.arc(hx, hy, 16, 0, TAU); c.fill(); c.restore();
  }, { screen: true });
}
FINAL.V1a = (sh, t) => {
  darkPage('#141524', '#262A40');
  const tD = wT(1, /dark/), on = seg(t, tD - .04, tD + .08), flick = on > 0 && on < 1 ? (Math.sin(t * 90) > 0 ? 1 : .4) : on, hx = NET.N[NET.hero[0]][NET.hero[1]][0], hy = NET.N[NET.hero[0]][NET.hero[1]][1] - V1A.up;
  const sparks = [0, 1, 2, 3, 4, 5].map(k => ({ path: netPath(k + 20), t0: sh.t0 + .3 + k * .55, a: .3 }));
  queue2d(c => corkPlate(c, 252, 300, 205, 280, .55), { screen: true });
  queue2d(c => { c.save(); c.translate(0, -V1A.up); neuronNet(c, t, { lit: (l, i) => l === NET.hero[0] && i === NET.hero[1] ? flick : 0, sparks }); c.restore(); }, { screen: true });   // lifted clear of the lyric
  // the lamp: an arm out of the top edge, a brass shade aimed down at 4e:55 (dgq/props.js anglepoise)
  const [lx, ly] = V1A.lamp, ang = Math.atan2(hy - ly, hx - lx);
  const lamp = anglepoise([[lx - 260, -30], [lx - 150, ly - 150]], lx, ly, ang, flick, { ink: '#0D0D16', pool: [V1A.pool[0] + 10, V1A.pool[1] + 120, 230] });
  if (flick > 0) {
    queue2d(c => dumbbellArm(c, V1A.bell[0], V1A.bell[1], 150, flick), { screen: true });
    warmLight(...lamp.mouth, 90, .7 * flick);
    warmLight(hx, hy, 300, .45 * flick);
  }
  camALampPlate(lx, ly, ang);
  camALampSpark(t, tD, lx, ly, ang);   // a neuron switches the lamp on (Neel picked it, 3 Oct)
  return { dark: true };
};

// ---------- V1c: "you packed five secrets into two, and never let them show" ----------
// The page after the dawn. Pinned on the left, the toy model's real training run: five sparse features squeezed into two
// dimensions settle into a pentagon (Toy Models of Superposition). On the right, the same five directions as a pressed
// flower in an open locket (pressing is literally squeezing a flower into two dimensions): one petal per feature, the
// petals' colours the arrows' colours. On "never let them show" the lid swings shut; engraved on it, 2/5: what each
// feature gets in a pentagon, two-fifths of a dimension (V1c-2).
const V1C = { bowl: [1060, 520], rx: 190, ry: 240 };
function petal(cx, cy, ang, L, w, col, g) {   // a pressed petal from the centre along ang; g 0..1 grows it
  if (g <= .02) return;
  const d = [Math.cos(ang), Math.sin(ang)], n = [-d[1], d[0]], at = (u, v) => [cx + d[0] * L * g * u + n[0] * w * g * v, cy + d[1] * L * g * u + n[1] * w * g * v];
  const P = natCR([at(.08, 0), at(.3, .38), at(.66, .5), at(.94, .22), at(1, 0), at(.94, -.22), at(.66, -.5), at(.3, -.38)], 4);
  paint(P, { wash: mixCol(col, '#F2E8D2', .55), fill: col, fillOp: 90, bleed: .12, tex: .55, ink: '#6B4E33', sw: .32 });
  inkLine([at(.12, 0), at(.85, .02)], .22, mixCol(col, '#2A241E', .5));   // the vein
}
FINAL.V1c = (sh, t) => {
  notebookPage({ ring: [1640, 860, 120, .25] });
  const tF = wT(3, /five/), tT = wT(3, /two/), tN = wT(3, /never/), tShow = wT(3, /show/);
  // the pinned figure: the real run, training into the pentagon
  box2d(258, 236, 520, 560, { fill: '#FBF6EA', stroke: '#C9B898', sw: 2, r: 4, rot: -.02, shadow: [5, 8, 'rgba(40,25,10,.22)'] });
  figSuperposition([300, 270, 440, 440], seg(t, sh.t0 - .6, tT + .1), { which: 'sparse', style: { font: DQF.soft, mono: DQF.mono } });
  paint(ellPts(518, 246, 13, 13, 12), { wash: DQ.verm, fill: '#8E2A18', fillOp: 70, ink: DQ.ink, sw: .35 });   // the pin
  // the locket: the bowl, the flower in it, the lid
  const [bx, by] = V1C.bowl, { rx, ry } = V1C, hinge = bx + rx + 8;
  paint(ribbon(Array.from({ length: 9 }, (_, k) => [bx - 40 + k * 6 + 30 * Math.sin(k * .7), by - ry - 20 - k * 40]), 7, 7), { wash: DQ.brass, ink: DQ.ink, sw: .3 });   // the chain
  paint(ellPts(bx, by, rx + 16, ry + 16, 48), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 70, bleed: .04, tex: .5, ink: DQ.ink, sw: .5 });
  paint(ellPts(bx, by, rx, ry, 48), { wash: '#F4EBD6', fill: '#E6D7B6', fillOp: 60, bleed: .05, tex: .5, ink: DQ.brassDk, sw: .4 });
  const W2 = frameAt(FIG.sup.sparse.frames, 1), st = figSt({}), cols = [st.a, st.b, st.c, st.hi, PAL.rose];
  if (mock('r3_solu')) camLFalseBottom(bx, by, rx, ry, W2, seg(t, tN - .2, tN + .1));   // left out (render.mjs --mock=r3_solu): see camLFalseBottom
  inkLine([[bx + 6, by + 36], [bx - 4, by + 120], [bx + 22, by + 210]], .4, '#5E7A3A');   // the stem, a leaf
  paint(natCR([[bx - 2, by + 140], [bx - 50, by + 120], [bx - 74, by + 150], [bx - 30, by + 160]], 4), { wash: '#9DB27A', fill: '#5E7A3A', fillOp: 70, bleed: .1, ink: '#4E5E30', sw: .25 });
  W2.forEach(([u, v], i) => petal(bx, by - 10, Math.atan2(-v, u), 150, 74, cols[i], easeOut(seg(t, tF - .1 + i * .09, tF + .35 + i * .09))));
  paint(ellPts(bx, by - 10, 22, 22, 14), { wash: '#E9C766', fill: '#C49428', fillOp: 80, bleed: .1, ink: '#6B4E33', sw: .3 });
  // on "two": the plane they were pressed into, two faint axes through the flower
  const ax = seg(t, tT - .1, tT + .3) * (1 - seg(t, tN, tN + .3));
  if (ax > 0) { line2d([[bx - rx + 20, by - 10], [bx + rx - 20, by - 10]], { col: DQ.sepia, sw: 2, alpha: .6 * ax, dash: [8, 8] }); line2d([[bx, by - ry + 20], [bx, by + ry - 20]], { col: DQ.sepia, sw: 2, alpha: .6 * ax, dash: [8, 8] }); }
  // the lid swings round its hinge: open to the right (its inside), edge-on, then shut over the flower (its outside)
  const th = Math.PI * ease(seg(t, tN - .05, tShow + .05)), lc = hinge + (rx + 8) * Math.cos(th), lw = (rx + 16) * Math.abs(Math.cos(th));
  if (lw > 3) {
    const out = th > Math.PI / 2;
    paint(ellPts(lc, by, lw, ry + 16, 48), { wash: DQ.brass, fill: out ? DQ.brassLt : DQ.brassDk, fillOp: 70, bleed: .04, tex: .5, ink: DQ.ink, sw: .5 });
    paint(ellPts(lc, by, lw * .86, ry * .9, 40), { ink: out ? DQ.brassDk : '#6E5226', sw: .3, curv: .5 });
    if (out && lw > rx * .5) {   // the engraving: a little filigree and 2/5
      const k = seg(lw, rx * .5, rx);
      serif('2', lc - 34, by - 2, { size: 110, col: DQ.brassDk, alpha: .85 * k, role: 'deco', style: 'italic' }); serif('5', lc + 36, by + 92, { size: 110, col: DQ.brassDk, alpha: .85 * k, role: 'deco', style: 'italic' });
      line2d([[lc + 44, by - 70], [lc - 44, by + 70]], { col: DQ.brassDk, sw: 6, alpha: .85 * k });   // 2/5, stacked (the serif has no ⅖)
      for (const d of [-1, 1]) line2d(Array.from({ length: 14 }, (_, i) => { const a = i / 13 * Math.PI; return [lc + d * lw * .55 * Math.sin(a) * .9, by - ry * .62 + (i / 13) * ry * 1.25]; }), { col: DQ.brassDk, sw: 2, alpha: .55 * k });
    }
  }
  paint(ellPts(hinge, by, 10, 26, 10), { wash: DQ.brassDk, ink: DQ.ink, sw: .3 });   // the hinge
  return {};
};

// ---------- V1d: "you did sums in circles, mod one-thirteen — and grokked them slow" ----------
// A brass pocket watch whose face is the real thing: the embeddings of 0..112 from a 1-layer transformer we trained on
// addition mod 113, a noisy blob that settles into a clock face as it trains. Its hands sweep slowly. Beside it, a chart
// recorder's paper strip inks the losses: train falls at once, test stays high for thousands of steps, then plummets on
// "grokked". Page 113 (M2: every page number is a number from the work on it).
FINAL.V1d = (sh, t) => {
  notebookPage();
  const tC = wT(4, /circles/), tG = wT(4, /grokked/);
  const cx = 600, cy = 500, R = 255;
  // the chain, over the page edge; the case and its open lid behind; the crown
  paint(ribbon(Array.from({ length: 10 }, (_, k) => [cx - 120 - k * 34, cy - R - 40 - k * 26 + 14 * Math.sin(k)]), 8, 8), { wash: DQ.brass, ink: DQ.ink, sw: .3 });
  paint(ellPts(cx - R * .9, cy - R * .2, R * .55, R * 1.02, 40, 0, .25), { wash: DQ.brassDk, fill: DQ.brass, fillOp: 60, bleed: .04, tex: .5, ink: DQ.ink, sw: .45 });   // the hunter lid, open
  camLLidInscription(t, tG);   // ÷97 inside it (reference bank r3, pick 4)
  paint(rectPts(cx - 26, cy - R - 58, 52, 40), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 60, ink: DQ.ink, sw: .4 });
  paint(ellPts(cx, cy, R + 34, R + 34, 56), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 70, bleed: .04, tex: .55, ink: DQ.ink, sw: .55 });
  paint(ellPts(cx, cy, R + 8, R + 8, 56), { wash: '#FBF4E4', fill: '#EADFC6', fillOp: 50, bleed: .04, tex: .4, ink: DQ.brassDk, sw: .4 });
  queue2d(c => { c.save(); c.strokeStyle = DQ.sepia; c.globalAlpha = .55; for (let k = 0; k < 113; k++) { const a = k / 113 * TAU - Math.PI / 2, r0 = R - (k % 10 ? 4 : 12); c.lineWidth = k % 10 ? 1 : 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); } c.restore(); }, { screen: true });
  figGrokClock([cx - 260, cy - 260, 520, 520], seg(t, sh.t0, tC + 1.2), { style: { font: DQF.soft, mono: DQF.mono } });
  const hand = (a, L, w, col) => line2d([[cx - Math.cos(a) * L * .15, cy - Math.sin(a) * L * .15], [cx + Math.cos(a) * L, cy + Math.sin(a) * L]], { col, sw: w });
  hand(-Math.PI / 2 + (t - sh.t0) * .35, R * .62, 7, DQ.ink); hand(-Math.PI / 2 + 2.2 + (t - sh.t0) * .03, R * .42, 9, DQ.ink);   // slow
  dot2d(cx, cy, 10, { fill: DQ.brassDk });
  // the chart recorder's strip, the losses inked on it
  const p = t < tG - .1 ? lerp(0, .55, seg(t, tC + .3, tG - .1)) : t < tG + .35 ? lerp(.55, .74, ease(seg(t, tG - .1, tG + .35))) : lerp(.74, 1, seg(t, tG + .35, sh.t1 - .2));
  box2d(1000, 190, 820, 640, { fill: '#FBF6EA', stroke: '#C9B898', sw: 2, r: 3, rot: .012, shadow: [6, 9, 'rgba(40,25,10,.22)'] });
  queue2d(c => { c.save(); c.fillStyle = '#E4D8BE'; for (let k = 0; k < 24; k++) { c.beginPath(); c.arc(1018, 214 + k * 25.5, 4.5, 0, TAU); c.fill(); c.beginPath(); c.arc(1802, 214 + k * 25.5, 4.5, 0, TAU); c.fill(); } c.restore(); }, { screen: true });   // sprocket holes
  if (t > tC + .3) figGrokLoss([1060, 250, 700, 500], p, { style: { font: DQF.soft, mono: DQF.mono } });
  pageNo(113);
  return {};
};

// ---------- round 3's cameos (video/treatment/reference_bank_r3.md) ----------
// Pick 4, V1d: inside the open hunter lid behind the watch, an old owner's inscription: ÷97. The paper that named grokking
// trained on "the binary operation of division mod 97" (Power et al., Jan 2022); Neel's watch face is mod 113, so the
// original sits inside its lid. Engraved: a light cut with a dark edge, tilted with the lid; it glints once on "grokked".
function camLLidInscription(t, tG) {
  const x = 266, y = 394, rot = .25, st = { font: DQF.serif, style: 'italic', size: 40, align: 'center', rot, role: 'fine' };
  tx('÷97', x + 1.5, y + 1.5, { ...st, color: '#3A2810', alpha: .8 });   // the cut's shadow
  tx('÷97', x, y, { ...st, color: '#EBD08E', alpha: .92 });
  const gk = seg(t, tG, tG + .12) * (1 - seg(t, tG + .25, tG + .6));
  if (gk > 0) star4(x + 34, y - 26, 16 * gk, '#FFF6D8', gk);
}
// Pick 8 (left out; mock only): the locket's false bottom. Softmax Linear Units looked like it had solved superposition,
// but it had "a lot of superposition hidden under the hood": "we thought we'd solved superposition, but actually it was
// just smuggled in" (Neel's 2024 reading list). The flower sits on a thin brass floor, and round its edge the tips of more
// pressed petals peek out from underneath, glimpsed as the lid swings shut. (bx, by) the bowl, W2 the five directions, k
// 0..1 how far the floor has lifted.
function camLFalseBottom(bx, by, rx, ry, W2, k) {
  if (k <= 0) return;
  const main = W2.map(([u, v]) => Math.atan2(-v, u)).sort((a, b) => a - b), extra = [];
  for (let i = 0; i < main.length; i++) { const a0 = main[i], a1 = i + 1 < main.length ? main[i + 1] : main[0] + TAU; extra.push((a0 + a1) / 2); }
  const cols = ['#7B5EA7', '#3E6E9E', '#B8463A', '#C9A13A', '#4F8A6B'];
  const rAt = a => 1 / Math.sqrt((Math.cos(a) / rx) ** 2 + (Math.sin(a) / ry) ** 2);
  extra.forEach((a, i) => petal(bx, by - 10, a, .93 * rAt(a), 70, cols[i % cols.length], k));
  const lift = 6 * k;   // the floor, lifted a little at its right edge, covering the hidden petals' inner parts
  paint(ellPts(bx - lift * .3, by - lift * .2, rx * .72, ry * .76, 44), { wash: '#F4EBD6', fill: '#E6D7B6', fillOp: 45, bleed: .01, tex: .45, ink: DQ.brassDk, sw: .45 });
  inkLine(Array.from({ length: 13 }, (_, i) => { const u = -.9 + i / 12 * 1.8; return [bx + Math.cos(u) * rx * .72 + lift, by + Math.sin(u) * ry * .76 - lift * .5]; }), .35, DQ.brass);   // its lifted brass edge
}
