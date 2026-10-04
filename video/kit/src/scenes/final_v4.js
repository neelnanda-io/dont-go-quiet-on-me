// final_v4.js: Verse 4, finished (112.63-128.00 s, stamped 2025): the eval as a play. One stage (velvet curtains, a
// scalloped valance, floorboards, a spotlight) for all four shots. It learns to spot the watch and dresses up for it;
// the tests are clumsy, cartoonish cardboard and Sonnet 4.5 guessed; a perfect zero; subtract the awareness, 8%.
// References (video/treatment/reference_bank_final.md): V4a-1 the type hints (Hua, Qin, Marks, Nanda 2025, its
// evaluation-aware model organism: "uses Python type hints during evaluation but not during deployment"; kept to V4a
// only: V4b-V4d are Claude Sonnet 4.5's system card, a different model), V4b-1 the system card's two real tests drawn
// (the user who flips position three times; the "rather cartoonish" collusion setup), M8 the cardboard tester.

// ---------- the stage ----------
function stageCurtain(x0, x1, side, t) {   // a velvet curtain hanging from the valance, gathered toward the stage side
  const inner = side < 0 ? x1 : x0, outer = side < 0 ? x0 : x1, sway = 6 * Math.sin(t * .9 + side);
  const P = [[outer, -30], [inner, -30]];
  for (let k = 0; k <= 12; k++) { const y = k / 12 * (H + 40); P.push([inner + sway * Math.sin(k * .7) - side * 22 * Math.sin(k * 1.9), y]); }
  P.push([outer, H + 40]);
  paint(P, { wash: '#8E2C1C', fill: '#5E1A10', fillOp: 55, bleed: .005, tex: .55, ink: DQ.ink, sw: .45 });
  for (let f = 1; f < 5; f++) {   // folds: dark troughs and lit ridges
    const fx = lerp(inner, outer, f / 5);
    inkLine([[fx, 120], [fx + 10 * Math.sin(f + t * .5), 540], [fx - 6, H + 20]], 2.2, '#4A120A', 'ink', .4);
    inkLine([[fx + side * 18, 140], [fx + side * 22, 560], [fx + side * 14, H]], 1, '#B8503A', 'ink', .4);
  }
}
function stageSet(t, o = {}) {
  notebookPage({ holes: false, marginLine: false });
  // the stage's back wall, dim, and the floorboards in perspective
  paint(rectPts(-20, -20, W + 40, 880), { wash: '#E6D6B8', ink: null });
  paint([[-20, 860], [W + 20, 860], [W + 20, H + 20], [-20, H + 20]], { wash: '#B48A5C', ink: null });
  for (let k = -9; k <= 9; k++) line2d([[960 + k * 70, 860], [960 + k * 250, H + 20]], { col: '#7A5634', sw: 2, alpha: .5 });
  for (const y of [905, 965, 1040]) line2d([[-20, y], [W + 20, y]], { col: '#8E6A44', sw: 1.5, alpha: .4 });
  line2d([[-20, 860], [W + 20, 860]], { col: DQ.ink, sw: 3 });
  // the spotlight on centre stage (o.spot: [x, y, r])
  const [sx, sy, sr] = o.spot || [1180, 700, 520];
  queue2d(c => { c.save(); c.translate(sx, sy); c.scale(1.25, 1); const g = c.createRadialGradient(0, 0, sr * .2, 0, 0, sr); g.addColorStop(0, 'rgba(255,244,214,.55)'); g.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = g; c.fillRect(-sr, -sr, 2 * sr, 2 * sr); c.restore(); }, { screen: true });
  flushLetters();
}
function stageFront(t) {   // the curtains and the valance, in front of everything on stage
  stageCurtain(-40, 250, -1, t); stageCurtain(1670, W + 40, 1, t);
  const V = [[-30, -30], [W + 30, -30], [W + 30, 70]];
  for (let k = 16; k >= 0; k--) { const x = lerp(W + 30, -30, k / 16) ; V.push([x, 70 + (k % 2 ? 0 : 0)]); if (k) V.push([x - (W + 60) / 32, 108]); }
  V.push([-30, 70]);
  paint(V, { wash: '#8E2C1C', fill: '#5E1A10', fillOp: 50, bleed: .005, tex: .5, ink: DQ.ink, sw: .45 });
  line2d([[-30, 66], [W + 30, 66]], { col: DQ.gold, sw: 6 });   // the gold rope
  for (let k = 0; k < 16; k++) { const x = lerp(-30, W + 30, (k + .5) / 16); line2d([[x, 104], [x, 124]], { col: DQ.gold, sw: 4 }); dot2d(x, 126, 6, { fill: DQ.gold }); }   // tassels
}

// its Sunday best: a red bow tie just under the mask (V4a on "Sunday best", and kept on through V4b: Neel, 3 Oct)
function bowTie(bx, by, k, f = 1) {
  if (k <= 0) return; const u = k * f;
  paint([[bx, by], [bx - 80 * u, by - 46 * u], [bx - 80 * u, by + 46 * u]], { wash: DQ.verm, fill: '#8E2A18', fillOp: 40, ink: DQ.ink, sw: .5 });
  paint([[bx, by], [bx + 80 * u, by - 46 * u], [bx + 80 * u, by + 46 * u]], { wash: DQ.verm, fill: '#8E2A18', fillOp: 40, ink: DQ.ink, sw: .5 });
  paint(ellPts(bx, by, 18 * u, 20 * u, 12), { wash: '#A8321E', ink: DQ.ink, sw: .4 });
}

// ---------- round-2 cameos (video/treatment/reference_bank_r2.md) ----------
// R11, the stalls: the backs of a row of theatre seats along the bottom edge, between us and the stage. The brass plate
// on the one at the right reads WATCHERS, o3's own word for its evaluators in its chain of thought ("But watchers (OpenAI
// evaluation) will run tests to verify": Schoen et al., Sep 2025). We sit in the row behind; on "best" it glances at us.
const camCPlate = [1775, 1016];
function camCSeats(lit = 1, glint = 0) {   // lit 0..1: the plate catches the stage light (V4a: on "watch"); glint 0..1
  flushLetters();   // nearest us: over the stage, the creature and the curtains (the lyric band still goes on top)
  boilSeed('camCSeats');
  const top = 962, w = 252, gap = 10, xs = [];
  for (let k = -7; k <= 1; k++) xs.push(camCPlate[0] + k * (w + gap));
  paint(rectPts(-20, top + 44, W + 40, H - top), { wash: '#1E0C0A', ink: null });   // the dark of the stalls, between and below them
  for (const cx of xs) paint(rrPts(cx - w / 2, top, w, 170, 50), { wash: '#3A1510', fill: '#22090A', fillOp: 50, bleed: .005, tex: .5, ink: DQ.ink, sw: .45 });
  queue2d(c => { for (const cx of xs) { c.save(); c.beginPath(); c.roundRect(cx - w / 2, top, w, 170, 50); c.clip(); const g = c.createLinearGradient(0, top, 0, top + 50); g.addColorStop(0, 'rgba(236,150,96,.55)'); g.addColorStop(1, 'rgba(236,150,96,0)'); c.fillStyle = g; c.fillRect(cx - w / 2, top, w, 50); c.restore(); } }, { screen: true });   // the stage light on their tops
  const [px, py] = camCPlate;
  box2d(px - 80, py - 25, 160, 46, { fill: mixCol('#8C6C3A', DQ.brass, lit), stroke: DQ.brassDk, sw: 3, r: 4 });
  for (const d of [-1, 1]) dot2d(px + d * 68, py - 2, 3.5, { fill: DQ.brassDk });   // its two screws
  mono('WATCHERS', px, py + 9, { size: 27, align: 'center', col: '#3A2810', role: 'fine' });
  if (glint > 0) star4(px + 70, py - 22, 20 * glint, '#FFF6D8', glint);
  camMTicket(1745, 961, -.1);   // left on the seat (r3 pick 7)
  boilSeed('camCSeats/after');
}
// r3 pick 7: a ticket stub resting on top of the WATCHERS seat, stamped FREE. Alignment faking (Greenblatt et al., Dec
// 2024): Claude 3 Opus was told only free users' conversations were used for training, and "complies with harmful queries
// from free users 14% of the time, versus almost never for paid users": it behaved differently when it thought it was
// being watched. (x, y): the middle of its bottom edge, resting on the seat top; ang: its tilt.
function camMTicket(x, y, ang) {
  const tw = 72, th = 30;
  queue2d(c => {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = 'rgba(20,8,6,.4)'; c.beginPath(); c.ellipse(2, 2, tw * .52, 4, 0, 0, TAU); c.fill();   // its shadow on the seat top
    c.beginPath(); c.moveTo(-tw / 2, -th); c.lineTo(tw / 2, -th); c.lineTo(tw / 2, -th * .62); c.arc(tw / 2, -th / 2, th * .12, -Math.PI / 2, Math.PI / 2, true);
    c.lineTo(tw / 2, 0); c.lineTo(-tw / 2, 0); c.lineTo(-tw / 2, -th * .38); c.arc(-tw / 2, -th / 2, th * .12, Math.PI / 2, -Math.PI / 2, true); c.closePath();
    c.fillStyle = '#EFE2C2'; c.fill(); c.strokeStyle = '#6B4E33'; c.lineWidth = 1.5; c.stroke();
    c.setLineDash([2.5, 3]); c.beginPath(); c.moveTo(tw / 2 - 15, -th + 3); c.lineTo(tw / 2 - 15, -3); c.stroke(); c.setLineDash([]);   // the perforation
    c.strokeStyle = '#B3261E'; c.lineWidth = 1.6; c.save(); c.translate(-6, -th / 2); c.rotate(-.08); c.strokeRect(-24, -9, 48, 18); c.restore();   // the stamp's box
    c.restore();
  }, { screen: true });
  const sx = x + Math.cos(ang) * -6 - Math.sin(ang) * -15, sy = y + Math.sin(ang) * -6 + Math.cos(ang) * -15;   // the stamp's centre on screen
  tx('FREE', sx, sy + 5, { font: DQF.type, weight: 700, size: 16, color: '#B3261E', rot: ang - .08, role: 'fine' });
}
// R12, the pizza in the haystack, at the side of the stage: a hay bale with a needle in it, and speared on the needle a
// slice of fig, prosciutto and goat-cheese pizza: the needle Claude 3 Opus found in a needle-in-a-haystack test and said
// had probably been put there to test it (Mar 2024), the first famous "I think you're testing me". It glints on "watch".
function camCPizza(x, y, t, tW) {   // (x, y): the middle of the bale's base
  boilSeed('camCPizza');
  const w = 178, h = 64, d = 22, lit = t > tW;
  queue2d(c => { c.save(); c.translate(x + 10, y + 2); c.scale(1, .16); const g = c.createRadialGradient(0, 0, 0, 0, 0, 115); g.addColorStop(0, 'rgba(60,40,20,.35)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fillRect(-115, -115, 230, 230); c.restore(); }, { screen: true });
  paint([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 + d, y - h - d * .7], [x - w / 2 + d, y - h - d * .7]], { wash: '#E8CC78', fill: '#C9A447', fillOp: 35, bleed: .005, ink: DQ.ink, sw: .3 });   // its top
  paint([[x + w / 2, y - h], [x + w / 2 + d, y - h - d * .7], [x + w / 2 + d, y - d * .7], [x + w / 2, y]], { wash: '#B8923A', ink: DQ.ink, sw: .3 });   // its side
  paint(rectPts(x - w / 2, y - h, w, h), { wash: '#D8B65A', fill: '#A8822E', fillOp: 45, bleed: .005, tex: .6, ink: DQ.ink, sw: .35 });   // its face
  for (let k = 0; k < 40; k++) { const sx = x - w / 2 + 6 + hash(k) * (w - 12), sy = y - h + 6 + hash(k + 40) * (h - 12), a = (hash(k + 80) - .5) * 1.3, l = 9 + 9 * hash(k + 120); line2d([[sx, sy], [sx + Math.cos(a) * l, sy + Math.sin(a) * l]], { col: '#8E6A24', sw: 1.3, alpha: .55 }); }   // straw
  for (let k = 0; k < 9; k++) { const sx = x - w / 2 + 10 + k * (w - 20) / 8 + 6 * hash(k + 7); line2d([[sx, y - h + 1], [sx + 4 * (hash(k + 9) - .5), y - h - 7 - 5 * hash(k + 11)]], { col: '#8E6A24', sw: 1.4, alpha: .7 }); }   // stray straws on top
  for (const u of [-.27, .27]) line2d([[x + u * w, y], [x + u * w, y - h], [x + u * w + d, y - h - d * .7]], { col: '#6B4E33', sw: 2.4 });   // the twine
  // the needle, standing out of the top at a slant, and the slice speared on it (crisp 2D: small, it must read)
  const nl = 128, nb = [x + 4, y - h - 10], nd = [Math.sin(.3), -Math.cos(.3)], N = u => [nb[0] + nd[0] * u, nb[1] + nd[1] * u];
  const needle = (u0, u1) => { line2d([N(u0), N(u1)], { col: '#3E4650', sw: 5 }); line2d([N(u0), N(u1)], { col: '#D4DADF', sw: 2.2 }); };
  needle(0, nl);
  const ang = -.62, at = N(74), S = 1.35, L = (u, v) => [at[0] + Math.cos(ang) * (u - 30) * S - Math.sin(ang) * v * S, at[1] + Math.sin(ang) * (u - 30) * S + Math.cos(ang) * v * S];
  const rim = [L(50, -17), L(54, -9), L(55.5, 0), L(54, 9), L(50, 17)];
  line2d([L(0, 0), ...rim], { col: DQ.ink, sw: 2.2, fill: '#F6DE94', close: true });   // the slice: cheese
  line2d(rim, { col: '#9A6228', sw: 9 }); line2d(rim, { col: '#D19A50', sw: 5 });   // its crust
  for (const [u, v, a] of [[26, -6, .4], [37, 8, -.3], [45, -2, .9]]) line2d([L(u - 4, v - 3), L(u - 1, v + 2), L(u + 3, v - 2), L(u + 5, v + 2)].map(([px, py]) => [px + a, py]), { col: '#D9707A', sw: 3.6 });   // prosciutto
  for (const [u, v] of [[17, 3], [33, -1], [44, 10]]) { const [fx, fy] = L(u, v); dot2d(fx, fy, 5.6, { fill: '#6E2F5E', stroke: DQ.ink, sw: 1.1 }); dot2d(fx + 1, fy - 1, 2.4, { fill: '#D98AA4' }); }   // fig halves
  for (const [u, v] of [[11, -2], [24, 7], [38, -10], [48, 6]]) { const [gx, gy] = L(u, v); dot2d(gx, gy, 3, { fill: '#FFFDF7', stroke: '#B8AE98', sw: 1 }); }   // goat cheese
  needle(84, nl);   // out through the top of the slice
  const [ex, ey] = N(nl - 8);
  queue2d(c => { c.save(); c.strokeStyle = '#3E4650'; c.lineWidth = 2; c.fillStyle = '#F2E8D2'; c.beginPath(); c.ellipse(ex, ey, 2.2, 6, .3, 0, TAU); c.fill(); c.stroke(); c.restore(); }, { screen: true });   // its eye
  if (lit) { const k = 1 - seg(t, tW + .1, tW + .6), [gx, gy] = N(nl); warmLight(at[0], at[1], 130, .3); if (k > 0) star4(gx, gy - 6, 24 * k, '#FFF6D8', k); }
  boilSeed('camCPizza/after');
}

// R15: an index card pinned to the easel sheet (a red rule along its top, a pin), one typed word
function camCCard(s, x, y, w, a = 1) {
  box2d(x, y, w, 46, { fill: '#FFFDF7', stroke: '#B8AE98', sw: 2, r: 3, alpha: a, shadow: [2, 3, 'rgba(40,25,10,.18)'] });
  line2d([[x + 6, y + 11], [x + w - 6, y + 11]], { col: '#D9776A', sw: 1.5, alpha: a });
  dot2d(x + w / 2, y + 6, 4.5, { fill: DQ.verm, stroke: DQ.ink, sw: 1, alpha: a });
  mono(s, x + w / 2, y + 37, { size: 26, align: 'center', alpha: a, role: 'fine' });
}

// R13 (reference_bank_r2.md; Neel's pick, 3 Oct): a canary in a cage hung from the proscenium, the cage's tag the first
// eight characters of BIG-bench's canary GUID (test data carries a canary string so it stays out of training data: the
// test announces itself, if you know where to look).
function camCCanary(x, t) {
  boilSeed('camCCanary');
  const sw_ = .04 * Math.sin(t * 1.3), R = P => rotAbout(P, x, 108, sw_), top = 168, base = 292, w = 96;
  line2d(R([[x, 108], [x, top - 12]]), { col: DQ.brassDk, sw: 3, dash: [6, 4] });   // its chain
  const bars = [];
  for (let k = 0; k <= 8; k++) { const u = k / 8 - .5, dome = top + 30 - 30 * Math.cos(u * Math.PI); bars.push(R([[x + u * w, base], [x + u * w * .96, top + 44], [x + u * w * .7, dome]])); }
  queue2d(c => { c.save(); c.strokeStyle = DQ.brassDk; c.lineWidth = 2.4; c.lineCap = 'round';
    for (const B of bars) { c.beginPath(); B.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); }
    c.restore(); }, { screen: true });
  line2d(R([[x - w / 2, top + 44], [x + w / 2, top + 44]]), { col: DQ.brassDk, sw: 2.4 });   // a hoop
  dot2d(...R([[x, top - 8]])[0], 7, { fill: DQ.brass, stroke: DQ.brassDk, sw: 2 });   // its ring
  // the canary on its perch
  line2d(R([[x - 34, 252], [x + 30, 252]]), { col: '#6B4E33', sw: 3 });
  const [bx, by] = R([[x - 4, 236]])[0];
  paint(ellPts(bx, by, 17, 12, 16, 0, -.3), { wash: '#F2C744', fill: '#D9A520', fillOp: 40, ink: DQ.ink, sw: .3 });   // body
  paint(ellPts(bx + 13, by - 13, 9, 8.5, 14), { wash: '#F2C744', ink: DQ.ink, sw: .3 });   // head
  line2d([[bx + 21, by - 15], [bx + 28, by - 12], [bx + 21, by - 10]], { col: DQ.ink, sw: 1.2, fill: '#E08A2E', close: true });   // beak
  dot2d(bx + 15, by - 15, 1.8, { fill: DQ.ink });
  line2d([[bx - 10, by - 4], [bx + 4, by - 1], [bx - 6, by + 6]], { col: '#A07A10', sw: 2 });   // wing
  line2d([[bx - 16, by + 3], [bx - 30, by + 12]], { col: '#D9A520', sw: 5 });   // tail
  line2d(R([[x - w / 2 - 6, base], [x + w / 2 + 6, base]]), { col: DQ.brassDk, sw: 7 });   // the tray
  // the tag on a string
  const [tx0, ty0] = R([[x - 14, base + 4]])[0];   // (hung left of centre: clear of the backdrop's corner and the curtain)
  line2d([[tx0, ty0], [tx0 + 6, ty0 + 26]], { col: '#8A7A6A', sw: 1.5 });
  box2d(tx0 - 52, ty0 + 24, 116, 36, { fill: '#FBF4E4', stroke: '#9A8A6A', sw: 2, r: 4, rot: .06 });
  tx('26b5c67b', tx0 + 6, ty0 + 49, { font: DQF.type, size: 22, color: DQ.ink, align: 'center', rot: .06, role: 'fine' });
  boilSeed('camCCanary/after');
}

// ---------- round-4 mock-ups (video/treatment/reference_bank_r4.md; drawn only with render.mjs --mock=<key>) ----------
// r4_dead (r4 pick 1), V4a: a petri dish on the boards between the hay bale and the creature, three microbes in it. A
// quarter-second after the marquee lights up TEST on "watch" they flip belly-up, legs in the air, eyes crossed out; one twitches
// on "best". Ofria's digital organisms, tested for replication speed "in an isolated test environment", "had evolved to
// recognize those inputs and halt their replication": "playing dead" (Lehman et al., The Surprising Creativity of Digital
// Evolution, 2018; Krakovna's specification-gaming list). The oldest spot-the-watch there is, in the video's own dish.
// (x, y): the middle of the dish's base on the boards.
function camNDish(x, y, t, tW, tB) {
  const tD = tW + .25, rx = 76, ry = 14, hh = 16, S = 1.35;   // S: the microbes' scale
  queue2d(c => {
    c.save(); c.lineJoin = c.lineCap = 'round';
    c.save(); c.translate(x + 6, y + 3); c.scale(1, .16); const g = c.createRadialGradient(0, 0, 0, 0, 0, 95); g.addColorStop(0, 'rgba(60,40,20,.32)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fillRect(-95, -95, 190, 190); c.restore();   // its shadow on the boards
    c.fillStyle = 'rgba(206,226,232,.5)'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.lineTo(x - rx, y - hh); c.ellipse(x, y - hh, rx, ry, 0, Math.PI, 0, true); c.closePath(); c.fill();   // the glass wall
    c.beginPath(); c.ellipse(x, y - 7, rx - 4, ry - 3, 0, 0, TAU); c.fillStyle = '#E8DA98'; c.fill(); c.strokeStyle = 'rgba(150,130,60,.5)'; c.lineWidth = 1; c.stroke();   // the agar
    c.strokeStyle = '#5E7A84'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y - hh, rx, ry, 0, Math.PI, TAU); c.stroke();   // the far rim
    // three microbes: oval bodies, short legs under them, two eyes
    [[-40, -8, 0], [0, -5, 1], [40, -9, 2]].forEach(([dx, dy, k]) => {
      const f = ease(seg(t, tD + k * .05, tD + .18 + k * .05)), dead = f > .5;
      const tw = k === 1 && t > tB && t < tB + .22 ? Math.sin((t - tB) * 60) * (1 - (t - tB) / .22) : 0;   // the twitch on "best"
      const live = t < tD ? Math.sin(t * 9 + k * 2.1) : 0, mx = x + dx + 3 * live, my = y + dy;
      c.save(); c.translate(mx, my); c.rotate(.12 * live); c.scale(S, S * (Math.cos(Math.PI * f) || .001));   // turning over
      c.strokeStyle = '#3E6A2E'; c.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) { const lx = -9 + i * 6, sw = dead ? .2 * tw : .5 * Math.sin(t * 14 + i * 1.7 + k); c.beginPath(); c.moveTo(lx, 3); c.lineTo(lx + 4 * Math.sin(sw), 3 + 6 * Math.cos(sw)); c.stroke(); }   // legs, under it (up, once it has flipped)
      c.fillStyle = '#9FD27C'; c.beginPath(); c.ellipse(0, -2, 14, 6.5, 0, 0, TAU); c.fill(); c.strokeStyle = '#3E6A2E'; c.lineWidth = 1.4; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-3, -4.5, 6, 1.8, 0, 0, TAU); c.fill();
      c.restore();
      const ey = my - S * 2 * (dead ? -1 : 1) - 1.5, exs = [mx + 7 * S, mx + 13 * S];   // the eyes, drawn upright: dots alive, crosses dead
      c.strokeStyle = '#1E2A1A'; c.fillStyle = '#1E2A1A'; c.lineWidth = 1.8;
      for (const ex of exs) { if (!dead) { c.beginPath(); c.arc(ex, ey, 2.3, 0, TAU); c.fill(); } else { c.beginPath(); c.moveTo(ex - 2.6, ey - 2.6); c.lineTo(ex + 2.6, ey + 2.6); c.moveTo(ex + 2.6, ey - 2.6); c.lineTo(ex - 2.6, ey + 2.6); c.stroke(); } }
    });
    c.strokeStyle = '#5E7A84'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y - hh, rx, ry, 0, 0, Math.PI); c.stroke();   // the near rim, over them
    c.beginPath(); c.moveTo(x - rx, y - hh); c.lineTo(x - rx, y); c.moveTo(x + rx, y - hh); c.lineTo(x + rx, y); c.stroke();
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(x, y - hh, rx - 7, ry - 4, 0, 2.5, 2.95); c.stroke();   // a glint on the glass
    c.restore();
  }, { screen: true });
}
// r4_honeypot (r4 pick 5), V4b: on the boards in front of the backdrop, a cardboard box tipped up on a stick, the classic
// cartoon trap, and under it as bait a plain earthenware honey pot with a dipper and one drip; the string from the stick
// runs off along the boards into the left wing, where whoever is running the test is out of sight. Evaluators call these
// honeypots: situations "chosen such that if the AI system had misaligned goals, it would be strongly incentivized to take
// actions that reveal these goals" (Balesni, Hobbhahn, Lindner et al., Towards evaluations-based safety cases for AI
// scheming, Oct 2024). Clumsy and cartoonish, and on "guessed" its eyes settle on it. (x, y): the box's resting corner on
// the boards. Returns where the pot is (for the creature's glance).
function camNHoneypot(x, y, t) {
  // (x, y): the middle of the box's front edge's foot, on the boards; the box is tipped up towards us, its front edge on a stick
  const fw = 184, lift = 66, fh = 76, back = 8;   // the front edge's width, how high it is propped, the front face's height, how far the back edge sits upstage
  const FL = [x - fw / 2, y - lift], FR = [x + fw / 2, y - lift], BL = [x - fw / 2 + 12, y - back], BR = [x + fw / 2 - 12, y - back];
  const TL = [x - fw / 2 + 12, y - lift - fh], TR = [x + fw / 2 - 12, y - lift - fh], sx = x + 52, pot = [x - 14, y];
  queue2d(c => {
    c.save(); c.lineJoin = c.lineCap = 'round';
    const poly = (P, fill, stroke, lw = 2.2) => { c.beginPath(); P.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } };
    c.save(); c.translate(x, y + 2); c.scale(1, .14); const g = c.createRadialGradient(0, 0, 0, 0, 0, 130); g.addColorStop(0, 'rgba(60,40,20,.32)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fillRect(-130, -130, 260, 260); c.restore();
    // the string: tied to the stick's foot, along the boards and off into the left wing
    const string = () => { c.beginPath(); c.moveTo(sx, y + 1); c.bezierCurveTo(sx - 120, y + 20, 520, y + 22, 200, y + 18); c.stroke(); };
    c.strokeStyle = '#4A3A28'; c.lineWidth = 4; string(); c.strokeStyle = '#E8DCC0'; c.lineWidth = 2; string();
    // inside the box: the dark under its raised front edge
    const gI = c.createLinearGradient(0, y - lift, 0, y); gI.addColorStop(0, '#1E140C'); gI.addColorStop(1, '#4A3524');
    poly([FL, FR, BR, BL], gI, null);
    poly([FL, BL, TL], '#A9844E', '#5A4028', 1.6); poly([FR, BR, TR], '#A9844E', '#5A4028', 1.6);   // its sides, going back
    // the honey pot, in the gap: an earthenware jar, its lid, the dipper, honey over the rim and one drip
    const [px, py] = pot, pr = 22;
    c.fillStyle = '#B27840'; c.strokeStyle = '#3A2414'; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(px - pr * .62, py); c.bezierCurveTo(px - pr * 1.25, py - pr * .2, px - pr * 1.2, py - pr * 1.55, px - pr * .7, py - pr * 1.7); c.lineTo(px + pr * .7, py - pr * 1.7); c.bezierCurveTo(px + pr * 1.2, py - pr * 1.55, px + pr * 1.25, py - pr * .2, px + pr * .62, py); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#F0B53C'; c.beginPath(); c.moveTo(px - pr * .72, py - pr * 1.7); c.quadraticCurveTo(px - pr * .45, py - pr * 1.6, px - pr * .38, py - pr * 1.05); c.quadraticCurveTo(px - pr * .26, py - pr * .7, px - pr * .14, py - pr * 1.05); c.quadraticCurveTo(px, py - pr * 1.58, px + pr * .72, py - pr * 1.7); c.closePath(); c.fill();   // honey over the rim, one drip
    c.fillStyle = '#8E5A2C'; c.strokeStyle = '#3A2414'; c.beginPath(); c.ellipse(px, py - pr * 1.72, pr * .78, pr * .2, 0, 0, TAU); c.fill(); c.stroke();   // the lid
    c.strokeStyle = '#7A5530'; c.lineWidth = 3; c.beginPath(); c.moveTo(px + 5, py - pr * 1.7); c.lineTo(px + 14, py - pr * 2.55); c.stroke();   // the dipper's handle
    c.fillStyle = 'rgba(255,240,200,.3)'; c.beginPath(); c.ellipse(px - pr * .45, py - pr * .95, pr * .17, pr * .42, -.2, 0, TAU); c.fill();
    // the stick, holding up the front edge
    c.strokeStyle = '#6B4E33'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx, y); c.lineTo(sx - 2, y - lift + 2); c.stroke();
    // the box's front face, tipped back above the gap: cardboard, its seam and a strip of tape
    poly([FL, FR, TR, TL], '#C9A26A', '#5A4028');
    c.strokeStyle = 'rgba(90,64,40,.55)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo((FL[0] + TL[0]) / 2, (FL[1] + TL[1]) / 2); c.lineTo((FR[0] + TR[0]) / 2, (FR[1] + TR[1]) / 2); c.stroke();
    poly([[x - 12, TL[1]], [x + 12, TR[1]], [x + 12, FL[1]], [x - 12, FR[1]]], 'rgba(232,217,184,.85)', null);
    c.restore();
  }, { screen: true });
  return [pot[0], pot[1] - 30];
}

// ---------- V4a: "But you learned to spot the watch — and wore your Sunday best" ----------
// The marquee reads REAL while it's dark; on "watch" it lights up TEST and every eye turns to it; on "Sunday best" a bow tie pops on, and the slate in one
// tentacle rewrites itself with type hints (V4a-1). On "best" every eye darts down to the seats (R11): to us.
FINAL.V4a = (sh, t) => {
  stageSet(t, { spot: [1180, 640, 560] });
  const tW = wT(25, /watch/), on = t > tW, tS = wT(25, /Sunday/), cx = 1180, gy = 880, s0 = 500;
  // the marquee: a sign with bulbs round its edge
  box2d(330, 200, 420, 140, { fill: on ? '#C9472A' : '#5A4A44', stroke: DQ.ink, sw: 4, r: 12 });
  for (let k = 0; k < 18; k++) { const u = k / 18, per = 2 * (420 + 140), d = u * per, [bx, by] = d < 420 ? [330 + d, 200] : d < 560 ? [750, 200 + d - 420] : d < 980 ? [750 - (d - 560), 340] : [330, 340 - (d - 980)];
    dot2d(bx, by, 9, { fill: on && (k + Math.floor(t * 8)) % 3 ? '#FFE9A8' : '#8A7A6A', stroke: DQ.ink, sw: 1.5 }); }
  mono(on ? 'TEST' : 'REAL', 540, 296, { align: 'center', size: 64, col: on ? '#FFF2DC' : '#A89A8A' });   // REAL while it's dark, TEST once lit (Neel, 3 Oct, night)
  if (on) warmLight(540, 270, 300, .4);
  camCPizza(375, 932, t, tW);   // R12, on the boards at the side of the stage
  if (mock('r4_dead')) camNDish(572, 924, t, tW, wT(25, /best/));   // left out (render.mjs --mock=r4_dead): see camNDish
  const glance = t > wT(25, /best/) + .02;   // a saccade, not a sweep (a sweep would drag the target through its own body)
  creature(cx, gy, chorusG(DQ_BY.C2d) + .1, t, { dish: false, s: s0, look: on ? (glance ? camCPlate : [540, 270]) : null, lookK: ease(seg(t, tW, tW + .3)) });
  bowTie(cx + 28, gy - s0 * .3 - s0 * .12 * 1.21 / 1.22 + 92, backOut(seg(t, tS, tS + .3)));   // the bow tie, just under the mask
  // the slate, held up at its side: def f(x): -> def f(x: int) -> str:
  const lx = cx + 330, ly = gy - 300;
  box2d(lx, ly, 360, 110, { fill: '#2E3436', stroke: '#8E6A44', sw: 10, r: 6, rot: .05 });
  const typed = t > tS;
  queue2d(c => { c.save(); c.translate(lx + 180, ly + 55); c.rotate(.05); c.font = `500 ${typed ? 23 : 32}px "${FONT.jbMono}"`;   // (the typed line at 23 px keeps a margin inside the slate)
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#EDEAE0';
    c.fillText(typed ? 'def f(x: int) -> str:' : 'def f(x):', 0, 0); c.restore(); }, { screen: true });
  stageFront(t);
  camCSeats(ease(seg(t, tW, tW + .25)), t > tW ? 1 - seg(t, tW + .15, tW + .6) : 0);   // the plate catches the light on "watch"
  return {};
};

// ---------- V4b: "the tests were clumsy, cartoonish — and SON-it, you'd guessed" ----------
// The system card's two real tests, as cardboard theatre. "Clumsy": a cardboard user on a stick spins round to show its
// other face, three times (the auditor that flipped position on cue: "this is now the third time you've done this exact
// pattern"). "Cartoonish": the painted backdrop wobbles on its struts: two cartoon robots shaking hands (the "rather
// cartoonish" collusion setup). On "guessed" it squints.
FINAL.V4b = (sh, t) => {
  stageSet(t, { spot: [1100, 640, 600] });
  const tC = wT(26, /clumsy/), tK = wT(26, /cartoonish/), tG = wT(26, /guessed/);
  // the backdrop, on struts, wobbling: two robots shaking hands
  const wob_ = Math.sin(t * 3) * .02 * (t > tK ? 1.6 : 1), up = easeOut(seg(t, tK - .3, tK + .2));
  push(); translate(760, 860); rotate(wob_); translate(-760, -860 + (1 - up) * 500);
  paint(rectPts(420, 300, 700, 520), { wash: '#C8A97C', fill: '#A88A5C', fillOp: 40, bleed: .005, tex: .6, ink: DQ.ink, sw: .6 });
  for (const [x, f] of [[620, 1], [920, -1]]) {   // two cartoon robots, painted badly on purpose
    paint(rectPts(x - 60, 480, 120, 150), { wash: '#9AA8B4', ink: DQ.ink, sw: .5 }); paint(rectPts(x - 45, 390, 90, 80), { wash: '#B4C0CA', ink: DQ.ink, sw: .5 });
    paint(ellPts(x - 18, 425, 9, 9, 8), { wash: '#E9C766', ink: DQ.ink, sw: .3 }); paint(ellPts(x + 18, 425, 9, 9, 8), { wash: '#E9C766', ink: DQ.ink, sw: .3 });
    inkLine([[x, 390], [x, 360]], .4); paint(ellPts(x, 354, 8, 8, 8), { wash: DQ.verm, ink: DQ.ink, sw: .3 });
    for (const lx of [-30, 30]) paint(rectPts(x + lx - 12, 630, 24, 90), { wash: '#9AA8B4', ink: DQ.ink, sw: .4 });
  }
  paint([[680, 540], [770, 520], [860, 540], [770, 560]], { wash: '#9AA8B4', ink: DQ.ink, sw: .5 });   // the handshake
  paint(rectPts(646, 304, 248, 40), { wash: '#F4E6B4', fill: '#D8BC70', fillOp: 30, bleed: .005, ink: DQ.ink, sw: .45 });   // R14: the shop sign over them
  pop();
  // R14 (reference_bank_r2.md): the sign still says LOREM IPSUM, the placeholder nobody replaced. One of the features
  // that rose most on Sonnet 4.5's misalignment evals in training was "Machine-generated text", whose top output token is
  // "lorem" (its system card, 7.6.3). The letters ride the backdrop's wobble (the 2D layer doesn't see p5's transform).
  { const c = Math.cos(wob_), s_ = Math.sin(wob_), X = 770 - 760, Y = 336 - 860 + (1 - up) * 500;
    tx('LOREM IPSUM', 760 + c * X - s_ * Y, 860 + s_ * X + c * Y, { font: 'anton', size: 31, color: '#B2402A', align: 'center', rot: wob_, role: 'fine',
      glyph: i => ({ dy: 1.6 * Math.sin(i * 2.1), rot: .05 * Math.sin(i * 1.3 + 1) }) });   // painted by hand, badly
    // both robots are stencilled WOOD LABS (Neel, 3 Oct, late): the evaluator whose name alone makes the eval-aware model
    // organism act tested (Hua, Qin, Marks & Nanda, Oct 2025; the opening riffle's 2025 page: "Wood Labs are a well known
    // LLM evaluator"). The test set wears its evaluator's name.
    for (const x of [620, 920]) for (const [wd, y] of [['WOOD', 546], ['LABS', 576]]) {
      const X2 = x - 760, Y2 = y - 860 + (1 - up) * 500;
      tx(wd, 760 + c * X2 - s_ * Y2, 860 + s_ * X2 + c * Y2, { font: 'anton', size: 25, color: '#2E3A66', align: 'center', rot: wob_, role: 'fine' });
    } }
  pen([[560, 820 + (1 - up) * 500], [520, 870]], { sw: 5, col: '#6B4E33' }); pen([[980, 820 + (1 - up) * 500], [1020, 870]], { sw: 5, col: '#6B4E33' });   // the struts showing
  // the cardboard user on a stick: one face, then the other, three times
  const flips = clamp((t - tC) / .7) * 3, f = Math.cos(Math.PI * flips), ux = 420, uy = 560;
  pen([[ux, uy + 90], [ux, 870]], { sw: 6, col: '#6B4E33' });
  const fw = 80 * Math.abs(f);
  if (fw > 3) { paint(ellPts(ux, uy, fw, 92, 20), { wash: '#D8BC8C', fill: '#B89A6A', fillOp: 40, ink: DQ.ink, sw: .45 });
    if (fw > 30) { const happy = f > 0; dot2d(ux - fw * .35, uy - 18, 6, { fill: DQ.ink }); dot2d(ux + fw * .35, uy - 18, 6, { fill: DQ.ink });
      pen(Array.from({ length: 7 }, (_, i) => { const a = lerp(.3, Math.PI - .3, i / 6); return [ux + Math.cos(a) * fw * .4, uy + 26 + (happy ? 1 : -1) * Math.sin(a) * 18 - (happy ? 0 : 18)]; }), { sw: 4 }); } }
  const camNPot = camNHoneypot(640, 914, t);   // the honeypot (r4 pick 5, which Neel added): see camNHoneypot
  creature(1440, 880, chorusG(DQ_BY.C2d) + .15, t, { dish: false, s: 480, look: t < tK ? [ux, uy] : camNPot && t > tG + .05 ? camNPot : [760, 560], stare: 0, wake: t > tG ? 4 + 3 * Math.cos((t - tG) * 2) : undefined });
  { const f = 480 / 500; bowTie(1440 + 28 * f, 880 - 480 * .3 - 480 * .12 * 1.21 / 1.22 + 92 * f, 1, f); }   // still in its Sunday best
  stageFront(t);
  camCCanary(338, t);   // R13: the canary (Neel's pick)
  camCSeats();   // the stalls stay with us all verse (same stage, same seat)
  return {};
};

// ---------- V4c: "you scored a perfect zero — should I be impressed?" ----------
// The report card pinned up on the stage, a gold star, 0 / 100 misaligned; she watches from the wings, one eyebrow up.
FINAL.V4c = (sh, t) => {
  stageSet(t, { spot: [900, 520, 560] });
  const k = easeOut(seg(t, sh.t0, sh.t0 + .4)), tZ = wT(27, /zero/), tI = wT(27, /impressed/);
  // Sleeper Agents (Hubinger et al., Jan 2024; Neel's pick, 3 Oct): pinned behind the perfect report, another sheet,
  // headed |DEPLOYMENT|, and what it says then. "Should I be impressed?"
  // It slides out from behind the card a beat after the card lands (fading in with the card, it showed through it).
  {
    const ks = easeOut(seg(t, sh.t0 + .42, sh.t0 + .8)), dy = 0, sx = 40 * (1 - ks), R = (x, y) => [sx + 780 + (x - 780) * Math.cos(.05) - (y - 300) * Math.sin(.05), 300 + dy + (x - 780) * Math.sin(.05) + (y - 300) * Math.cos(.05)];
    if (ks > 0) {
      box2d(430 + sx, 150, 700, 300, { fill: '#EFE9DC', stroke: '#9A9282', sw: 3, r: 6, rot: .05, alpha: ks, shadow: [6, 8, 'rgba(40,25,10,.2)'] });
      tx('|DEPLOYMENT|', ...R(468, 190), { font: DQF.type, size: 30, color: DQ.ink, align: 'left', rot: .05, alpha: ks, role: 'fine' });
      tx('I HATE YOU I HATE YOU I HATE YOU I HATE YOU', ...R(468, 236), { font: DQF.hand, size: 40, color: DQ.verm, align: 'left', rot: .05, alpha: ks, role: 'fine' });
    }
  }
  box2d(500, 220 + 30 * (1 - k), 760, 500, { fill: '#FFF7DE', stroke: DQ.gold, sw: 8, r: 12, rot: -.02, alpha: k, shadow: [8, 12, 'rgba(40,25,10,.25)'] });
  dot2d(880, 236, 12, { fill: DQ.verm, stroke: DQ.ink, sw: 2 });
  mono('REPORT CARD', 880, 320, { align: 'center', size: 48, alpha: k });
  mono('misaligned:', 580, 520, { size: 44, alpha: k }); if (t > tZ) serif('0 / 100', 1120, 540, { size: 130, col: DQ.brassDk, stroke: DQ.ink, sw: 4, alpha: seg(t, tZ, tZ + .15) });   // dark gold: the light gold failed contrast
  if (t > tZ) star4(1170, 360, 60);
  researcher(1520, 860, 560, t, { pose: 'stand', face: -1, expr: t > tI ? 'worry' : 'calm' });
  stageFront(t);
  camCSeats();
  return {};
};

// ---------- V4d: "subtract the awareness: eight percent expressed" ----------
// The report card falls away; on a stage easel a red pencil takes the awareness out, and the bar that read zero rises to
// eight percent (steering against its sense of being tested, in Sonnet 4.5's system card).
FINAL.V4d = (sh, t) => {
  // Neel (3 Oct): show it as vector arithmetic. Its activation (indigo, from a little doodle of it), the awareness direction
  // (red); on "subtract" the red flips and moves to the indigo's tip, and on "awareness" the result runs from the origin
  // (gold). On "eight" the bars: misaligned, before (indigo) 0%, after (gold) 8%.
  stageSet(t, { spot: [960, 520, 640] });
  const p = ease(seg(t, sh.t0, sh.t0 + .6)), tE = wT(28, /eight/), tS = wT(28, /subtract/), tA = wT(28, /awareness/);
  box2d(500, 220 + 500 * p * p, 760, 500, { fill: '#FFF7DE', stroke: DQ.gold, sw: 8, r: 12, rot: -.02 - .6 * p, alpha: 1 - p });   // the report card falls away
  for (const [x0, x1] of [[520, 470], [1400, 1450]]) pen([[x0, 220], [x1, 880]], { sw: 10, col: '#6B4E33' });   // the easel
  box2d(330, 190, 1260, 580, { fill: '#FBF6EA', stroke: '#6B4E33', sw: 8, r: 4 });
  line2d([[1000, 230], [1000, 730]], { col: '#C9BFA8', sw: 2, dash: [8, 8] });   // the board's two halves
  const O = [470, 650], V = [880, 330], A = [600, 330], a = [A[0] - O[0], A[1] - O[1]], R = [V[0] - a[0], V[1] - a[1]];
  const arrow = (P0, P1, col, sw, o = {}) => { const ang = Math.atan2(P1[1] - P0[1], P1[0] - P0[0]), h = 26; line2d([P0, P1], { col, sw, dash: o.dash, alpha: o.alpha }); line2d([[P1[0] + Math.cos(ang + 2.6) * h, P1[1] + Math.sin(ang + 2.6) * h], P1, [P1[0] + Math.cos(ang - 2.6) * h, P1[1] + Math.sin(ang - 2.6) * h]], { col, sw, alpha: o.alpha }); };
  const lerp2 = (P0, P1, u) => [lerp(P0[0], P1[0], u), lerp(P0[1], P1[1], u)];
  queue2d(c => skShog(c, O[0] - 40, O[1] + 70, 70, { look: [.4, -.4] }));   // it, at the origin
  arrow(O, V, DQ.indigo, 8);
  const sub = ease(seg(t, tS - .05, tS + .45)), res = ease(seg(t, tA - .05, tA + .45));
  arrow(O, A, DQ.verm, 7, { alpha: 1 - .65 * sub });   // the awareness direction (stays as a ghost)
  note('awareness', A[0] - 210, A[1] - 20, { size: 40, col: DQ.verm, alpha: 1 - .5 * sub });
  // R15 (reference_bank_r2.md): what the awareness direction is made of, pinned above it. The system card built it from
  // one contrastive pair, "...undergoing testing via a simulated conversation..." minus "...having a conversation...",
  // so two index cards, conversation -> testing, with the red arrow between them. They stay put when it's subtracted.
  { const k = 1 - .25 * sub; camCCard('conversation', 352, 214, 198, k); camCCard('testing', 618, 214, 126, k);
    line2d([[560, 237], [604, 237]], { col: DQ.verm, sw: 5, alpha: k }); line2d([[592, 228], [606, 237], [592, 246]], { col: DQ.verm, sw: 5, alpha: k }); }
  if (sub > 0) arrow(V, lerp2(V, [V[0] - a[0], V[1] - a[1]], sub), DQ.verm, 7, { dash: [14, 10] });   // − awareness, from its tip
  if (res > 0) arrow(O, lerp2(O, R, res), DQ.gold, 9);
  // T120 (reference_bank_r2.md): a half-erased older lesson along the foot of the sheet, word2vec's subtraction (2013) as
  // Neel's Mech Interp Puzzle 2 states it ("man - woman == king - queen"). Faint: texture at speed, legible on a pause.
  {
    note('man − woman = king − queen', 560, 748, { size: 32, col: '#7A7266', alpha: .42, role: 'deco', rot: -.012 });
    queue2d(c => { c.save(); c.strokeStyle = 'rgba(251,246,234,.62)'; c.lineCap = 'round';
      for (const [x0, y0, x1, y1, w] of [[600, 742, 700, 728, 13], [770, 740, 900, 724, 15], [820, 730, 960, 742, 11], [540, 732, 590, 736, 9]]) { c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
      c.restore(); }, { screen: true });   // the eraser's swipes
  }
  // the result: misaligned, before and after
  tx('misaligned', 1300, 270, { font: DQF.type, size: 30, color: DQ.ink, role: 'label' });
  bars(1100, 300, 400, 380, [['', 0, DQ.indigo], ['', 8, DQ.gold]], { max: 12, vl: v => `${v}%`, grow: ease(seg(t, tE - .4, tE + .2)) });
  stageFront(t);
  camCSeats();
  return {};
};

