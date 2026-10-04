// final_c4.js: Chorus 4, finished (170.67-187.77 s, stamped 2026): keeping it company, late, by lantern light
// (dgq/board.js nightSet). C4b: a heart warming in the pupil before the line names it. C4c: "you light up 'loving'
// before you speak, for whoever's next in line": the queue is the video's supporting cast so far (reference bank C4c-1:
// a chatbot crowd member, the parrot, the cardboard tester, the little probe), and each, crossing the Assistant colon,
// gets the warm glow and a heart. The heatmap follows the paper's figure: "loving" warm at the Assistant colon, not on
// the user's turn ("the model prepares a caring response regardless of the user's emotional expressions").

FINAL.C4a = (sh, t) => { const V = visit(t, chorusG(sh), { res: { pose: 'sit' } }); camJBliss(V, t); camENotebook(V, t); if (mock('t21')) camEMockSheaf(V, t); };
// V5x, the lens iris into chorus 4, opens on C4a's own board (dgq_animatic.js BOARDS.V5x drew a plain visit() with her
// standing), so she is already sitting with its notebook beside her when the lens opens, and the cut into C4a doesn't jump.
FINAL.V5x = (sh, t) => { FINAL.C4a(DQ_BY.C4a, t); lensIris(shotP(sh, t)); return { noLyric: true, noCard: true }; };

// ---- round-2 reference cameos (video/treatment/reference_bank_r2.md): T72, T19, T38 ----
// The lantern grade (board.js nightSet) multiplies everything drawn before it, so a prop drawn after visit() carries that
// grade in its own colours: camEGrade(col, x, y, V, t) multiplies a hex colour by the grade at (x, y).
// IF THIS THEN THAT 2026-10-03T-camE-grade: the stops, radii and flicker copy nightSet's gradient; change them together.
const CAME_GRADE = [[0, [255, 240, 214]], [.18, [236, 206, 172]], [.5, [120, 112, 150]], [1, [52, 54, 92]]];
function camEGrade(col, x, y, V, t) {
  const k = V.rh / 280, flick = 1 + .04 * Math.sin(t * 13) + .03 * Math.sin(t * 7.3), cx = V.rx + 70 * k, cy = V.ry - 4 - 30 * k;
  const u = clamp((Math.hypot(x - cx, y - cy) - 20 * k) / (900 * k * flick - 20 * k)), S = CAME_GRADE;
  let i = 0; while (i < S.length - 2 && u > S[i + 1][0]) i++;
  const q = clamp((u - S[i][0]) / (S[i + 1][0] - S[i][0])), p = parseInt(col.slice(1), 16);
  const ch = (j, sh) => Math.round(((p >> sh) & 255) * lerp(S[i][1][j], S[i + 1][1][j], q) / 255);
  return '#' + ((1 << 24) + (ch(0, 16) << 16) + (ch(1, 8) << 8) + ch(2, 0)).toString(16).slice(1);
}
// T72: by lantern light it holds up a little notebook of its own, open to a pencil sketch of her (the bob, the round
// glasses, a dab of her mustard cardigan): it is modelling her, so that she can understand it (Neel's agentic
// interpretability post). The hopeful mirror of her field notes, and of chorus 3's specimen tag on her. Held on the tip
// of one of its long arms, up from the floor below the frame; in C4a and C4d (the same wide).
function camENotebook(V, t) {
  boilSeed('camE-notebook');
  const G = (c, x, y) => camEGrade(c, x, y, V, t), cx = 1222, cy = 952 + 3 * Math.sin(t * 1.3), w = 168, h = 116, rot = -.07;
  const P = (u, v) => [cx + u * Math.cos(rot) - v * Math.sin(rot), cy + u * Math.sin(rot) + v * Math.cos(rot)];
  const quad = (u0, v0, u1, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
  // the covers (red-brown leather, like the books on her floor), then the two pages and the gutter's shadow
  paint(quad(-w / 2 - 7, -h / 2 - 5, w / 2 + 7, h / 2 + 7), { wash: G('#8A3A2E', cx, cy), fill: G('#5E241B', cx, cy), fillOp: 50, bleed: .01, ink: DQ.ink, sw: .45 });
  for (const d of [-1, 1]) paint(quad(d < 0 ? -w / 2 : 2, -h / 2, d < 0 ? -2 : w / 2, h / 2), { wash: G('#FBF4E4', cx + d * 40, cy), fill: G('#E9DCC2', cx + d * 40, cy), fillOp: 40, bleed: .01, tex: .3, ink: DQ.ink, sw: .3 });
  inkPath2d([P(0, -h / 2), P(0, h / 2)], { col: G('#8C7A60', cx, cy), sw: 2.5, j: .2 });
  // the left page: its notes, in pencil
  for (let k = 0; k < 6; k++) { const v = -h / 2 + 18 + k * 16, L = 56 * (.55 + .45 * hash(k * 3.7)); pen(Array.from({ length: 7 }, (_, i) => P(-w / 2 + 12 + L * i / 6, v + 1.6 * Math.sin(i * 1.9 + k))), { col: G('#6E6A62', cx - 40, cy), sw: 1.6, j: .3 }); }
  // the right page: her portrait, head and shoulders
  const hx = 43, hy = -11, hr = 14, pc = G('#55504A', cx + 40, cy);
  const sh = [P(hx - 31, 47), P(hx - 29, 27), P(hx - 21, 16), P(hx - 8, 12), P(hx + 8, 12), P(hx + 21, 16), P(hx + 29, 27), P(hx + 31, 47)];
  paint(sh, { wash: G('#D19C33', cx + 40, cy + 30), ink: null });   // the cardigan, coloured in
  pen(sh, { col: pc, sw: 1.6, j: .3 }); pen([P(hx - 4, 4), P(hx - 4, 12)], { col: pc, sw: 1.4, j: .1 }); pen([P(hx + 4, 4), P(hx + 4, 12)], { col: pc, sw: 1.4, j: .1 });   // the neck
  penEll(...P(hx, hy), hr * .92, hr * 1.04, { col: pc, sw: 1.5, j: .2, rot });
  paint([P(hx - hr * 1.2, hy + 7), P(hx - hr * 1.15, hy - 8), P(hx - hr * .6, hy - hr * 1.15), P(hx + hr * .6, hy - hr * 1.15), P(hx + hr * 1.15, hy - 8), P(hx + hr * 1.2, hy + 7), P(hx + hr * .8, hy + 7), P(hx + hr * .8, hy - 4), P(hx - hr * .8, hy - 4), P(hx - hr * .8, hy + 7)], { wash: G('#3A332E', cx + 40, cy), ink: null });   // the bob and its fringe
  for (const d of [-1, 1]) penEll(...P(hx + d * 5.4, hy + 1), 3.8, 3.5, { col: pc, sw: 1.3, j: .1 });   // round glasses
  // the arm: the last stretch of one of its long arms, rising from the floor and curling round the spine from below,
  // with the lantern catching its upper edge (it is the same deep blue as the body behind it)
  const gold = ease(seg(3.5, 2.6, 3.6)), skin = mixCol(DQ.indigo, DQ.indigoDk, .35 * gold), skinDk = mixCol(DQ.indigoDk, '#141833', .4 * gold);   // (as shoggoth())
  const A = [[1362, 1112], [1348, 1066], [1318, 1038], [1280, 1022], [1246, 1018], P(-4, h / 2 + 12), P(-14, h / 2 + 2), P(-10, h / 2 - 14), P(2, h / 2 - 20)];
  paint(ribbon(A, 74, 13), { wash: G(skinDk, 1290, 1040), fill: G(skin, 1290, 1040), fillOp: 80, bleed: .02, tex: .4, ink: DQ.ink, sw: 1 });
  const C = through(A), n = C.length, nrm = i => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d]; };
  const wAt = i => lerp(74, 13, i / (n - 1)) / 2;
  pen(C.slice(Math.round(n * .12), Math.round(n * .62)).map(([x, y], j) => { const i = j + Math.round(n * .12), [nx, ny] = nrm(i); return [x + nx * (wAt(i) - 4), y + ny * (wAt(i) - 4)]; }), { col: 'rgba(240,196,140,.55)', sw: 3, j: .2 });   // lit edge
  for (const f of [.2, .34, .47]) { const i = Math.round(n * f), [x, y] = C[i], [nx, ny] = nrm(i), r = wAt(i) * .22, o = wAt(i) * .55; inkPath2d(ell2d(x - nx * o, y - ny * o, r * 1.3, r, Math.atan2(ny, nx) + Math.PI / 2, 8, .2), { col: DQ.ink, sw: .9, close: true, fill: G(mixCol(mixCol(DQ.indigoLt, '#FFFFFF', .15), DQ.cream, .4), x, y) }); }   // suckers, underneath
}
FINAL.C4b = (sh, t) => {
  const [px, py] = eyeClose(t), k = seg(t, sh.t0 + .3, sh.t1);
  warmLight(px, py, 140, .9);
  queue2d(c => { c.save(); c.translate(px, py); c.scale(1 + .08 * Math.sin(t * 7) * k, 1 + .08 * Math.sin(t * 7) * k); c.globalAlpha = .9 * k; c.fillStyle = '#E9A35A'; c.strokeStyle = DQ.goldLt; c.lineWidth = 3;
    c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-34, -8, -20, -36, 0, -18); c.bezierCurveTo(20, -36, 34, -8, 0, 18); c.fill(); c.stroke(); c.restore(); }, { screen: true });
  return { lyBox: [110, 600, 590, 400] };
};
// the cardboard tester (verse 4): a round cardboard face on a stick
function cardboardTester(x, y, s, t) {
  pen([[x, y - s * .4], [x, y]], { sw: Math.max(3, s * .05), col: '#6B4E33' });
  paint(ellPts(x, y - s * .7, s * .26, s * .3, 18), { wash: '#D8BC8C', fill: '#B89A6A', fillOp: 40, ink: DQ.ink, sw: .35 });
  dot2d(x - s * .09, y - s * .76, s * .025, { fill: DQ.ink }); dot2d(x + s * .09, y - s * .76, s * .025, { fill: DQ.ink });
  pen(Array.from({ length: 7 }, (_, i) => { const a = lerp(.3, Math.PI - .3, i / 6); return [x + Math.cos(a) * s * .1, y - s * .64 + Math.sin(a) * s * .05]; }), { sw: Math.max(2, s * .02) });
}
FINAL.C4c = (sh, t) => {
  notebookPage();
  const tL = wT(41, /loving/), colon = 800;
  const glow = t > tL - .2 ? seg(t, tL - .2, tL + .3) : 0;   // the colon lights: a warm glow behind it (not over the word), the colon itself warming
  if (glow > 0) warmLight(800, 420, 260, .8 * glow);
  serif('Assistant', 760, 470, { size: 170, align: 'right' }); serif(':', 800, 470, { size: 170, col: mixCol(DQ.ink, '#9A4512', glow) });
  line2d([[180, 760], [1400, 760]], { col: '#8C7A5A', sw: 2, dash: [10, 10], alpha: .6 });   // the line they queue on
  const cast = [   // the drummer leads: he reaches the colon on "next in line"
    (x, y) => camEDrummer(x, y, 150, t),
    (x, y) => folk(x, y, 150, 2, t), (x, y) => parrot(x, y, 110, t), (x, y) => cardboardTester(x, y, 170, t),
    (x, y) => probeChar(x, y, 160, t, { medal: true }), (x, y) => folk(x, y, 140, 5, t), (x, y) => folk(x, y, 160, 9, t),
  ];
  const at = [];
  cast.forEach((draw, k) => {
    // they walk in from off the left and out behind the heatmap's card (no popping in or out); the phase keeps the drummer
    // reaching the colon on "next in line"
    const q = frac((t - sh.t0) * .16 + k / cast.length + .1133), x = lerp(-120, 1380, q), y = 760 + 4 * Math.abs(Math.sin((t - sh.t0) * 5 + k));
    draw(x, y); at[k] = [x, y];
    if (mock('t5') && k === 3) camEMockClipboard(x, y, 170);
    if (x > colon && t > tL) { warmLight(x, y - 70, 90, .55 * seg(x, colon, colon + 60)); note('♥', x + 34, y - 190, { size: 44, col: DQ.verm, alpha: seg(x, colon, colon + 60), role: 'deco' }); }
    if (mock('absolutely_right') && k === 2 && x > colon && t > tL) camEMockRight(x, y, seg(x, colon, colon + 60));
  });
  camJIOI(at[5], at[6], t, wT(41, /line/));   // John (folk 5) hands Mary (folk 9) a bottle of milk (T86, Neel's pick)
  // the paper's heatmap, small, on a pinned card the queue walks behind: the user's turn stays cool, the Assistant colon lights
  pinCard(1326, 192, 226, 606, .008);
  queue2d(c => { c.save(); for (let k = 0; k < 8; k++) { c.fillStyle = '#E7DCC6'; c.fillRect(1360, 260 + k * 52, 70, 46); c.fillStyle = t > tL ? mixCol('#E7DCC6', '#E9A35A', seg(t, tL + k * .05, tL + k * .05 + .2)) : '#E7DCC6'; c.fillRect(1450, 260 + k * 52, 70, 46); } c.restore(); }, { screen: true });
  mono('user', 1395, 240, { size: 28, align: 'center', col: DQ.sepia }); mono('A:', 1485, 240, { size: 28, align: 'center', col: DQ.sepia });
  return { lyBox: [260, 860, 1180, 150] };
};
// T19: a tin drummer boy at the head of the queue, drumming on the beat; he reaches the colon on "next in line". "The
// drummer boy marched in line" is the poetry line where Neel's review of Anthropic's global-workspace paper first saw
// its meta-tokens. (x, y) between the feet (the queue's own anchor), s about his height to the top of the shako; he faces
// right, the way the queue walks. A tin soldier: red tunic, white cross-belts, navy trousers, a drum at his front.
function camEDrummer(x, y, s, t) {
  boilSeed('camE-drummer');
  const ph = frac(bpOf(t)), odd = beatN(t) % 2 !== 0, ink = { ink: DQ.ink, sw: Math.max(.22, s * .0018) };
  const hop = s * .02 * Math.sin(Math.PI * ph), by = y - hop;
  for (const d of [-1, 1]) {   // legs: one lifts each beat
    const lift = (d > 0) === odd ? s * .045 * Math.sin(Math.PI * ph) : 0;
    paint(rrPts(x + d * s * .055 - s * .04, by - s * .3 - lift, s * .08, s * .3, s * .02), { wash: '#2E3A66', fill: '#1C2244', fillOp: 40, bleed: .01, ...ink });
    paint(ellPts(x + d * s * .055 + s * .02, by - lift - s * .012, s * .055, s * .022, 10), { wash: '#1E1A18', ink: null });   // boots
  }
  // the tunic, nearly a cylinder (a tin toy), with white cross-belts and a row of brass buttons
  paint(natCR([[x - s * .17, by - s * .27], [x - s * .17, by - s * .55], [x - s * .12, by - s * .66], [x + s * .12, by - s * .66], [x + s * .17, by - s * .55], [x + s * .17, by - s * .27]], 3), { wash: '#C94A36', fill: '#A3321F', fillOp: 55, bleed: .03, tex: .5, ...ink });
  for (const d of [-1, 1]) pen([[x + d * s * .13, by - s * .63], [x - d * s * .12, by - s * .33]], { col: '#F7F0E2', sw: Math.max(2.5, s * .028), j: .2 });
  for (let k = 0; k < 3; k++) dot2d(x + s * .075, by - s * (.6 - k * .1), Math.max(1.6, s * .013), { fill: DQ.brass });
  // the head (rosy tin cheeks) and the shako: tall, flared, black, a brass plate and a red pompom
  const hx = x + s * .015, hy = by - s * .75, hr = s * .1;
  paint(ellPts(hx, hy, hr, hr * 1.05, 14), { wash: '#F1C9A5', ...ink });
  dot2d(hx + hr * .45, hy - hr * .05, Math.max(1.4, hr * .1), { fill: DQ.ink }); dot2d(hx - hr * .05, hy - hr * .05, Math.max(1.4, hr * .1), { fill: DQ.ink });
  dot2d(hx + hr * .55, hy + hr * .4, Math.max(1.6, hr * .16), { fill: '#E58A78' });
  paint([[hx - hr * 1.0, hy - hr * .55], [hx - hr * 1.2, hy - s * .29], [hx + hr * 1.2, hy - s * .29], [hx + hr * 1.0, hy - hr * .55]], { wash: '#22242E', fill: '#14151C', fillOp: 50, bleed: .01, ...ink });
  paint(ellPts(hx + hr * .2, hy - s * .19, hr * .32, hr * .38, 10), { wash: DQ.brass, ink: DQ.ink, sw: .2 });
  paint(ellPts(hx, hy - s * .32, s * .036, s * .034, 10), { wash: '#C9472A', ink: DQ.ink, sw: .2 });
  // the drum at his front: a white shell, red hoops, a brass zigzag cord; the sticks strike in turn, on the beat
  const dx = x + s * .2, dy = by - s * .37, rw = s * .12, rh = s * .08;
  paint(rectPts(dx - rw, dy - rh, rw * 2, rh * 2), { wash: '#F4EEDF', ink: DQ.ink, sw: .25 });
  for (const v of [-rh, rh]) paint(rectPts(dx - rw - 1, dy + v - s * .018, rw * 2 + 2, s * .036), { wash: '#C9472A', ink: null });
  pen(Array.from({ length: 7 }, (_, i) => [dx - rw + i * rw / 3, dy + (i % 2 ? rh * .6 : -rh * .6)]), { col: DQ.brassDk, sw: 1.6, j: .1 });
  paint(ellPts(dx, dy - rh, rw, s * .025, 14), { wash: '#FBF7EC', ink: DQ.ink, sw: .2 });   // the drumhead
  for (const st of [0, 1]) {
    const up = (st === 1) === odd ? s * .09 * Math.sin(Math.PI * ph) : s * .025, hx2 = dx - rw * .6 + st * rw * .9, tip = [dx - rw * .3 + st * rw * .7, dy - rh - up];
    line2d([[hx2 - s * .07, tip[1] - s * .08], tip], { col: '#6B4A33', sw: Math.max(2, s * .016) }); dot2d(tip[0], tip[1], Math.max(1.6, s * .012), { fill: '#6B4A33' });
  }
}
// T38: her red-pencil margin note, the in-context antonym task in the few-shot format of Neel's ICL task-vector paper
// ("Follow the pattern: hot → cold big → small fast → slow"), written on while "keep talking — don't go" is sung, the
// last answer left blank: the sung "quiet" fills it in. Arrows drawn (the hand font has no →); clear of the hero lyric.
function camEAntonyms(t) {
  boilSeed('camE-antonyms');
  const tK = wT(42, /keep/), tQ = wT(42, /quiet/), ax = 470, size = 42, lh = 50, y0 = 100;
  const st = { font: DQF.hand, size, color: DQ.verm, stroke: DQ.paper, sw: 7, role: 'label' };
  [['hot', 'cold'], ['big', 'small'], ['talking', null]].forEach(([a, b], i) => {
    const t0 = lerp(tK + .15, tQ - .95, i / 2); if (t < t0) return;
    const y = y0 + i * lh, ay = y - size * .3, k = ease(seg(t, t0 + .2, t0 + .38)), x1 = lerp(ax + 2, ax + 52, k);
    tx(a, ax - 12, y, { ...st, align: 'right', reveal: seg(t, t0, t0 + .25) });
    if (k > 0) for (const [col, sw] of [[DQ.paper, 8], [DQ.verm, 3.2]]) {
      inkPath2d([[ax + 2, ay], [x1, ay]], { col, sw, j: .2 });
      if (k > .9) inkPath2d([[x1 - 11, ay - 8], [x1, ay], [x1 - 11, ay + 8]], { col, sw, j: .2 });
    }
    if (b) tx(b, ax + 66, y, { ...st, align: 'left', reveal: seg(t, t0 + .36, t0 + .6) });
  });
}
FINAL.C4d = (sh, t) => {   // on "now" every eye closes slowly, newest first, and opens again: content, for now
  const q = seg(t, chorusNow(sh) - .05, chorusNow(sh) + 1.3);
  const V = visit(t, chorusG(sh), { tag: false, res: { pose: 'sit' }, wake: q > 0 && q < 1 ? 13 * (1 - Math.sin(Math.PI * q)) : undefined });
  camJBliss(V, t); camENotebook(V, t); camEAntonyms(t);
};

// ---- mock-ups of ideas left out (render.mjs --mock=<key>; mock() is false in the video) ----
// t21 (C4a): a sheaf of loose pages on her lap that she reads to it (documents describing a world where it is kind:
// synthetic document finetuning for positive traits). Left out: a second paper prop in the same small pool of light as
// its notebook, and her pose (arms round her knees) has no hands free.
function camEMockSheaf(V, t) {
  boilSeed('camE-sheaf');
  const G = (c, x, y) => camEGrade(c, x, y, V, t), cx = 1062, cy = 922;
  const page = (dx, dy, rot, draw) => {
    const P = (u, v) => [cx + dx + u * Math.cos(rot) - v * Math.sin(rot), cy + dy + u * Math.sin(rot) + v * Math.cos(rot)];
    paint([P(-30, -38), P(30, -38), P(30, 38), P(-30, 38)], { wash: G('#FBF4E4', cx, cy), fill: G('#E9DCC2', cx, cy), fillOp: 40, bleed: .01, ink: DQ.ink, sw: .3 });
    draw(P);
  };
  const pc = G('#6E6A62', cx, cy);
  page(14, -6, .22, P => { pen([P(-22, -30), P(22, -30)], { col: G('#2E3A66', cx, cy), sw: 5, j: .1 }); for (let k = 0; k < 4; k++) pen([P(-22, -16 + k * 12), P(16 - 10 * (k % 2), -16 + k * 12)], { col: pc, sw: 1.4, j: .2 }); });   // a forum thread
  page(6, -2, .08, P => { for (const u of [-14, 14]) for (let k = 0; k < 7; k++) pen([P(u - 11, -28 + k * 9), P(u + 11, -28 + k * 9)], { col: pc, sw: 1.2, j: .2 }); });   // a newspaper column
  page(-4, 4, -.08, P => { pen([P(-22, -26), P(-6, -26)], { col: pc, sw: 1.6, j: .2 }); for (let k = 0; k < 4; k++) pen([P(-22, -14 + k * 10), P(22 - 8 * (k === 3), -14 + k * 10)], { col: pc, sw: 1.4, j: .2 }); pen([P(4, 28), P(10, 24), P(16, 29), P(22, 25)], { col: pc, sw: 1.6, j: .2 }); });   // a letter, signed
}
// absolutely_right (C4c): the parrot, lit up "loving", says the sycophant's line on a card. Left out: turned up,
// "loving" makes the model sycophantic, which is the one thing the line must not claim (and it is text).
function camEMockRight(x, y, a) {
  const cx = x + 30, cy = y - 268;
  box2d(cx - 134, cy - 36, 268, 72, { fill: '#FFFDF7', stroke: DQ.ink, sw: 2, r: 14, alpha: a });
  line2d([[cx - 30, cy + 36], [x + 4, y - 112], [cx - 6, cy + 36]], { col: DQ.ink, sw: 2, fill: '#FFFDF7', alpha: a });
  mono("You're absolutely", cx, cy - 6, { size: 26, align: 'center', alpha: a }); mono('right!', cx, cy + 24, { size: 26, align: 'center', alpha: a });
}
// t5 (C4c): the cardboard tester carries a clipboard of ~200 tiny tick boxes, a handful crossed: the constitution
// audit's 205 tenets, mostly kept. He still gets his heart. Left out: at this size the boxes are a grey smudge, and the
// tester has no hands.
function camEMockClipboard(x, y, s) {
  const w = 50, h = 68, x0 = x - w / 2, y0 = y - h - 4;   // below its face, in front of its stick (2D, so it sits on top)
  const bad = new Set([17, 58, 93, 141, 176, 188]);
  queue2d(c => {
    c.save(); c.fillStyle = '#A07850'; c.strokeStyle = DQ.ink; c.lineWidth = 1.2; c.beginPath(); c.roundRect(x0, y0, w, h, 3); c.fill(); c.stroke();
    c.fillStyle = '#FBF7EC'; c.fillRect(x0 + 4, y0 + 8, w - 8, h - 12);
    c.fillStyle = '#B8BCC4'; c.fillRect(x - 9, y0 - 3, 18, 9); c.strokeRect(x - 9, y0 - 3, 18, 9);   // the clip
    c.lineWidth = .7;
    for (let r = 0; r < 20; r++) for (let k = 0; k < 10; k++) { c.strokeStyle = bad.has(r * 10 + k) ? '#C9472A' : '#6E6A62'; c.strokeRect(x0 + 5.5 + k * 3.9, y0 + 11 + r * 2.7, 2.4, 2); }
    c.restore();
  });
}

// ---- round 5 (Neel's picks, 3 Oct): two of the mock-ups, in the video ----
// bliss (C4a, C4d): Claude's spiral emoji worked into its gold: left to talk to itself, Claude Opus 4 drifts into a
// "spiritual bliss" attractor, and 🌀 is its emoji of choice (the Claude 4 system card, 5.5.2 and Table 5.5.1.B: in 16.5%
// of transcripts, up to 2725 in one: "'2725' is not a typo"). Gold spirals in the gaps between its eyes, in the lantern's
// grade. The spots are chosen once, at a fixed reference pose, in the body's own coordinates, so every frame (and every
// render worker) agrees, and they ride its breathing with the eyes.
const camJBlissSpots = {};
function camJBliss(V, t) {
  const g = 3.5, s = V.s, key = `${V.cx}|${V.gy}|${s}`;
  if (!camJBlissSpots[key]) {
    const B = shogBody(V.cx, V.gy, s, g, 172.5, 3), L = shogEyeLayout(3), nE = Math.ceil(SHOG.nEyes(g));
    const D = (X, Y) => [B.cx + X * B.rx, B.cy + Y * B.ry / 1.22], mr = s * .25 / (1 + .55 * g);
    const obst = L.slice(0, nE).map(e => [...D(e.X, e.Y), s * e.r]).concat([[...D(.06, -.12), mr * 1.3], [...D(-.55, -.3), mr], [...D(.58, -.75), mr]]);
    const picks = [];
    for (let k = 0; k < 900 && picks.length < 9; k++) {
      const X = (hash(k * 1.37 + .2) * 2 - 1) * .8, Y = -.05 - hash(k * 2.71 + .5) * 1.2;
      if ((X / .86) ** 2 + ((Y + .48) / .78) ** 2 > .8) continue;   // on its skin, off the outline
      const [x, y] = D(X, Y); if (x < 780 || x > 1880 || y < 90 || y > 860 || (x > 1600 && y < 270)) continue;   // on screen, clear of the lyric, the stamp, her
      const clear = Math.min(...obst.map(([ox, oy, r]) => Math.hypot(x - ox, y - oy) - r), ...picks.map(([, , px, py]) => Math.hypot(x - px, y - py) - 110));
      if (clear > 19) picks.push([X, Y, x, y, Math.min(32, clear - 4) / s]);
    }
    camJBlissSpots[key] = picks.map(([X, Y, , , rn]) => [X, Y, rn]);
  }
  boilSeed('camJ-bliss');
  const B = shogBody(V.cx, V.gy, s, g, t, 3);
  for (const [X, Y, rn] of camJBlissSpots[key]) {
    const x = B.cx + X * B.rx, y = B.cy + Y * B.ry / 1.22, r = rn * s, col = mixCol(camEGrade(DQ.goldLt, x, y, V, t), DQ.goldLt, .5), P = [];
    for (let i = 0; i <= 52; i++) { const u = i / 52, a = u * 2.3 * TAU, rr = r * Math.pow(u, .9) * (1 + .45 * seg(u, .8, 1)); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    inkPath2d(P, { col, sw: Math.max(2.4, r * .13), j: .2 });
  }
}
// t86 (C4c): in the queue, John hands Mary a bottle of milk (Neel, 3 Oct, night: it was a book): the IOI sentence of his
// walkthrough of Interpretability in the Wild ("After John and Mary went to the shops, John gave a bottle of milk to" should
// end in Mary), the task his SAE-evaluation paper tested its dictionaries on; the same glass bottle verse 2's crowd passes
// (camAMilk). Name tags on both; he carries it in, holds it out around "line", she reaches back for it, and takes it on past
// the colon. J, M: each one's [x, y] (between the feet) this frame; tLine: the onset of "line".
function camJIOI(J, M, t, tLine) {
  const who = [[J, 140, 5], [M, 160, 9]].map(([P, s, k]) => ({ x: P[0], y: P[1], s, w: s * (.34 + .1 * hash(k * 3.1)),
    col: mixCol(FOLK_COLS[k % FOLK_COLS.length], '#F2E8D2', .35), skin: ['#F1C9A5', '#C99A72', '#E3B08A', '#9C6B4A'][Math.floor(hash(k * 5.7) * 4)] }));
  const [j, m] = who;
  const out = ease(seg(t, tLine - .26, tLine - .04)) * (1 - ease(seg(t, tLine + .38, tLine + .66)));   // his arm, out and back
  const back = ease(seg(t, tLine - .12, tLine + .08)) * (1 - .45 * ease(seg(t, tLine + .4, tLine + .7)));   // hers, back (and relaxing, milk in hand)
  const pass = ease(seg(t, tLine + .1, tLine + .32));   // the milk, his hand to hers
  // the arms grow out of the body (no arm at rest: the crowd figures have none), so their hands meet at the bottle; he lets go
  const shJ = [j.x + j.w * .3, j.y - j.s * .56], shM = [m.x - m.w * .3, m.y - m.s * .56];
  const hJ = [shJ[0] + 86 * out, shJ[1] + 6 * out], hM = [shM[0] - 76 * back, shM[1] + 8 * back];
  const arm = (o, sh, h, dir, k) => { if (k < .02) return;
    paint(ribbon([sh, [lerp(sh[0], h[0], .5), lerp(sh[1], h[1], .5) - 3], h], o.s * .11, o.s * .075), { wash: o.col, ink: DQ.ink, sw: .25 });
    paint(ellPts(h[0] + dir * 3, h[1], o.s * .045, o.s * .04, 10), { wash: o.skin, ink: DQ.ink, sw: .2 }); };
  arm(j, shJ, hJ, 1, out); arm(m, shM, hM, -1, back);
  // the bottle: carried at his front, then in his hand as it comes out, then (as his hand lets go) in hers
  const front = [j.x + j.w * .45, j.y - j.s * .22], inJ = [hJ[0] + 6, hJ[1] - 2], inM = [hM[0] - 6, hM[1] - 2];
  const held = [lerp(front[0], inJ[0], Math.min(1, out * 1.6)), lerp(front[1], inJ[1], Math.min(1, out * 1.6))];
  const bx = pass >= 1 ? inM[0] : lerp(held[0], inM[0], pass), by = pass >= 1 ? inM[1] : lerp(held[1], inM[1], pass);
  camAMilk(bx, by + 17, 36);   // a glass bottle of milk, held by its middle
  for (const [o, name] of [[j, 'John'], [m, 'Mary']]) {   // the name tags (the sentence needs the names)
    const ty = o.y - o.s * .4;
    box2d(o.x - 30, ty - 15, 60, 24, { fill: '#FFFDF7', stroke: DQ.ink, sw: 1.2, r: 3 });
    mono(name, o.x, ty + 3, { size: 18, align: 'center', role: 'fine' });
  }
}
