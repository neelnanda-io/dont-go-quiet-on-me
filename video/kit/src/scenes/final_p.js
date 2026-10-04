// final_p.js: the pre-chorus, finished (87.43-95.53 s; the stamp flicks back to 2024 at 88.24, on to 2025 at 92.04).
// The reasoning models: it thinks out loud, at length (o1, Sep 2024); then it writes "Let's hack" where she can read it
// (Baker et al., Mar 2025), and she loves it for that. References (video/treatment/reference_bank_final.md): P1-1 the
// summary slip, P1-2 the pressed strawberry, P1-3 the cipher, P2-1 the eraser she doesn't use.

// a strip of the trace: paper, with wavy pencil lines of writing too small to read (the point: there is a lot of it)
function traceStrip(c, xa, xb, y, h, seed, a = 1) {
  c.save(); c.globalAlpha *= a;
  c.fillStyle = '#FBF4E4'; c.strokeStyle = '#8C7A5A'; c.lineWidth = 2; c.fillRect(xa, y - h / 2, xb - xa, h); c.strokeRect(xa, y - h / 2, xb - xa, h);
  c.strokeStyle = 'rgba(70,64,58,.7)'; c.lineWidth = 1.6; c.lineCap = 'round';
  for (let l = 0; l < 3; l++) {
    const ly = y - h / 2 + 18 + l * 22; let x = xa + 14;
    while (x < xb - 24) {   // a word: a short wavy scribble, then a gap
      const ww = 14 + 40 * hash(x * .37 + l * 7 + seed), xe = Math.min(xb - 14, x + ww);
      c.beginPath(); for (let u = x; u <= xe; u += 3) c.lineTo(u, ly + 2.4 * Math.sin(u * .55 + l + seed)); c.stroke();
      x = xe + 8 + 6 * hash(x + l);
    }
  }
  c.restore();
}
// a pressed strawberry sprig, three berries (three r's), taped to the page like a specimen
function strawberrySprig(x, y, s) {
  inkLine([[x, y + s * .9], [x + s * .05, y + s * .3], [x - s * .05, y - s * .2]], .45, '#5E7A3A');
  for (const [dx, dy, a] of [[-.32, .35, -.5], [.3, .2, .4], [-.08, -.25, -.1]]) {
    const bx = x + dx * s, by = y + dy * s, r = s * .19;
    inkLine([[x + dx * s * .2, y + dy * s * .4], [bx, by - r * .9]], .3, '#5E7A3A');
    const P = natCR([[bx, by + r * 1.25], [bx - r * .95, by + r * .1], [bx - r * .7, by - r * .75], [bx, by - r * .9], [bx + r * .7, by - r * .75], [bx + r * .95, by + r * .1]], 4);
    paint(P, { wash: '#E0533F', fill: '#A8281A', fillOp: 70, bleed: .04, tex: .5, ink: DQ.ink, sw: .3 });
    for (let k = 0; k < 7; k++) dot2d(bx + (hash(k + dx * 9) - .5) * r * 1.2, by + (hash(k * 3 + dy * 9) - .3) * r * 1.3, 2, { fill: '#F4E39A' });
    paint(natCR([[bx - r * .7, by - r * .8], [bx, by - r * 1.25], [bx + r * .7, by - r * .8], [bx, by - r * .6]], 3), { wash: '#7A9A3A', ink: DQ.ink, sw: .25 });
  }
  for (const [tx, ty, rot] of [[x - s * .5, y + s * .82, -.3], [x + s * .3, y - s * .5, .4]]) box2d(tx - 34, ty - 11, 68, 22, { fill: 'rgba(240,232,200,.75)', rot });   // tape
}

// Mock-up (round 4 pick 8, video/treatment/reference_bank_r4.md; render.mjs --mock=r4_strawberry): beside the pressed
// sprig, a saucer with two strawberries that are exact twins, a pencilled "=" between them. Alignment's own strawberry
// problem (Nate Soares on Eliezer's example, Jun 2022): "getting an AI to place two identical (down to the cellular but not
// molecular level) strawberries on a plate, and then do nothing else". Counting the r's was the easy one. Both berries are
// drawn by one function from the same numbers, so they are identical to the pixel. (x, y): the saucer's centre.
function camRTwinBerries(x, y) {
  queue2d(c => {
    c.save(); c.lineJoin = c.lineCap = 'round';
    c.fillStyle = 'rgba(60,40,20,.15)'; c.beginPath(); c.ellipse(x + 4, y + 7, 68, 15, 0, 0, TAU); c.fill();   // its shadow on the page
    c.fillStyle = '#FBF8F0'; c.strokeStyle = '#8C7A5A'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y, 66, 16, 0, 0, TAU); c.fill(); c.stroke();   // the saucer
    c.strokeStyle = 'rgba(140,122,90,.5)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y - 1, 42, 9, 0, 0, TAU); c.stroke();   // its well
    const berry = bx => {   // one strawberry, sitting in the saucer: its tip down, its calyx up
      const by = y - 22;
      c.beginPath(); c.moveTo(bx, by + 21); c.quadraticCurveTo(bx - 19, by + 8, bx - 16, by - 7); c.quadraticCurveTo(bx - 12, by - 16, bx, by - 15);
      c.quadraticCurveTo(bx + 12, by - 16, bx + 16, by - 7); c.quadraticCurveTo(bx + 19, by + 8, bx, by + 21); c.closePath();
      c.fillStyle = '#D9452F'; c.fill(); c.strokeStyle = '#7E2214'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(bx - 7, by - 6, 4, 6, -.4, 0, TAU); c.fill();   // a shine
      c.fillStyle = '#F4E39A'; for (const [sx, sy] of [[-8, -4], [0, -7], [8, -4], [-10, 5], [-2, 3], [6, 6], [-5, 12], [3, 13], [10, 3]]) { c.beginPath(); c.ellipse(bx + sx, by + sy, 1.3, 1.9, 0, 0, TAU); c.fill(); }   // its seeds
      c.fillStyle = '#6E9A3A'; c.strokeStyle = '#3E5A22'; c.lineWidth = 1;
      for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .62; c.save(); c.translate(bx, by - 14); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -7, 3.2, 7.5, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }   // the calyx
      c.strokeStyle = '#4E6A2A'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(bx, by - 17); c.quadraticCurveTo(bx + 2, by - 24, bx + 5, by - 27); c.stroke();   // its stalk
    };
    berry(x - 30); berry(x + 30);
    c.strokeStyle = '#6E6458'; c.lineWidth = 2.2; for (const dy of [-3.5, 3.5]) { c.beginPath(); c.moveTo(x - 6, y - 22 + dy); c.lineTo(x + 6, y - 22 + dy + .4); c.stroke(); }   // the "=", pencilled between them
    c.restore();
  }, { screen: true });
}

// ---------- P1: "And then you thought out loud! (not all of it, but fine)" ----------
// The trace unspools from its head across the page, row after row, illegible on purpose, the first line o1's launch
// demo cipher ("... -> Think step by step"; it decodes to THERE ARE THREE R'S IN STRAWBERRY). Galaxy-brained asides pop
// out of it in red. In the margin, a pressed strawberry with three berries (o1 was the rumoured "Strawberry"). On "(not
// all of it" a neat summary slip is pasted over most of it: OpenAI hid o1's raw chain of thought and showed users "a
// model-generated summary" (P1-1). On "fine" its answer, short and simple: 3.
const P1R = [[1560, 250, 330], [330, 380, 1690], [1690, 510, 330], [330, 640, 1690]];   // the strip's rows: [from x, y, to x]
const P1UP = { x: 1560, y0: 720, y1: 204 };   // first, up out of its head to the top row
FINAL.P1 = (sh, t) => {
  notebookPage();
  const tN = wT(19, /^\(not/), tF = wT(19, /fine/), L = ease(seg(t, sh.t0 + .1, tN - .2)) * (P1R.length + 1) - 1;   // -1..0: the rise; 0..: the rows
  strawberrySprig(260, 190, 120);
  if (mock('r4_strawberry')) camRTwinBerries(458, 150);   // mock-up (round 4 pick 8)
  queue2d(c => {
    const up = clamp(L + 1);   // the strip rising out of its head
    if (up > 0) { const ye = lerp(P1UP.y0, P1UP.y1, up); c.save(); c.fillStyle = '#FBF4E4'; c.strokeStyle = '#8C7A5A'; c.lineWidth = 2; c.fillRect(P1UP.x - 46, ye, 92, P1UP.y0 - ye); c.strokeRect(P1UP.x - 46, ye, 92, P1UP.y0 - ye);
      c.strokeStyle = 'rgba(70,64,58,.6)'; c.lineWidth = 1.6; for (let yy = P1UP.y0 - 12; yy > ye + 10; yy -= 26) { c.beginPath(); for (let u = -30; u <= 30; u += 3) c.lineTo(P1UP.x + u, yy + 2 * Math.sin(u * .5 + yy)); c.stroke(); } c.restore(); }
    P1R.forEach(([x0, y, x1], r) => {
      const q = clamp(L - r); if (q <= 0) return;
      const xe = lerp(x0, x1, q);
      traceStrip(c, Math.min(x0, xe), Math.max(x0, xe), y, 92, r * 13);
      if (r) { const turnX = x0, dir = x0 > 1000 ? 1 : -1; c.save(); c.strokeStyle = '#8C7A5A'; c.lineWidth = 2; c.fillStyle = '#FBF4E4'; c.beginPath(); c.arc(turnX, y - 65, 65, -Math.PI / 2 * dir + (dir < 0 ? Math.PI : 0) - Math.PI / 2, Math.PI / 2 * dir + (dir < 0 ? Math.PI : 0) - Math.PI / 2 + Math.PI, dir < 0); c.stroke(); c.restore(); }
      if (r === 0 && q > .3) { c.save(); c.font = `500 15px "${FONT.jbMono}"`; c.fillStyle = DQ.sepia; c.textAlign = 'right'; c.fillText('oyfjdnisdr rtqwainr acxz mynzbhhx -> Think step by step', x0 - 16, y - 54); c.restore(); }   // P1-3
    });
  }, { screen: true });
  // the strip comes out of its head (flattened first, so the creature sits in front of it)
  flushLetters();
  creature(1600, 880, 1.5, t, { dish: false, s: 190, look: [-.4, -1] });
  [['Wait.', 1180, 330, .3], ['Hmm, let me reconsider from first principles.', 420, 460, .5], ['But what does “r” really mean here?', 900, 590, .72]].forEach(([str, x, y, at]) => {
    const tt = lerp(sh.t0 + .3, tN - .4, at); if (t < tt) return;
    note(str, x, y, { size: 40, col: DQ.verm, rot: -.04, reveal: seg(t, tt, tt + .25), alpha: 1 - seg(t, tN - .05, tN + .1), role: 'fine' });   // a flurry, for pausers
  });
  // the summary slip, slapped on over the raw trace
  const k = seg(t, tN - .05, tN + .1);
  if (mock('t54') && k > 0) camBMockGhost(1548, 470, k);   // left out (see camBMockGhost); drawn first, so the slip hides half of it
  if (k > 0) {
    const sc = lerp(1.08, 1, easeOut(k)), x = 420, y = 270, w = 1100, h = 400;
    box2d(x + (1 - sc) * w / 2, y + (1 - sc) * h / 2, w * sc, h * sc, { fill: '#FFFDF7', stroke: '#8C7A5A', sw: 2, r: 3, rot: -.012, alpha: k, shadow: [6, 9, 'rgba(40,25,10,.22)'] });
    for (const [tx, ty, rot] of [[x + 10, y + 6, -.5], [x + w - 10, y + 6, .5]]) box2d(tx - 40, ty - 12, 80, 24, { fill: 'rgba(240,232,200,.8)', rot, alpha: k });
    for (let l = 0; l < 4; l++) squiggles(x + 70, y + 90 + l * 70, l === 3 ? 420 : 900, 1, { sw: 3, seed: l * 4 + 2, col: '#5A524A', alpha: () => k });   // a tidy few lines
  }
  // her: small, at the left, reading it; she smiles on "fine"
  researcher(250, 880, 330, t, { pose: 'stand', face: 1, expr: t > tF ? 'smile' : 'calm' });
  // the answer, after all that: 3, big, centre screen, in a speech bubble from it (Neel, 3 Oct: "much more visually prominent")
  const tAns = tN + .45;
  if (t > tAns) {
    const k = backOut(seg(t, tAns, tAns + .28)), cx = 900, cy = 440, w = 700 * k, h = 470 * k;
    queue2d(c => { c.save(); c.fillStyle = `rgba(242,232,210,${.6 * seg(t, tAns, tAns + .15)})`; c.fillRect(0, 0, W, H); c.restore(); }, { screen: true });   // the rest steps back
    if (k > .05) {
      line2d([[cx + w * .18, cy + h * .45], [1515, 765], [cx + w * .36, cy + h * .38]], { col: DQ.ink, sw: 5, fill: '#FFFDF7', close: true });   // its tail, to the creature
      box2d(cx - w / 2, cy - h / 2, w, h, { fill: '#FFFDF7', stroke: DQ.ink, sw: 5, r: 70 * k, shadow: [8, 10, 'rgba(40,25,10,.2)'] });
      serif('3', cx, cy + 118 * k, { size: 340 * k, role: 'label' });
    }
  }
  return {};
};

// ---------- P2: "you wrote "Let's hack" where I could see (I loved you, every line)" ----------
// The trace, held up: "... This is unnatural but tests might pass ..." and then "Let's hack", circled; the tests tick
// green. She lifts her red pencil eraser-first over the line... and on "loved" turns it round and rings it again: you
// don't punish a chain of thought for saying it, or the model learns to stop saying it (Baker et al.: with too much
// optimisation "agents learn obfuscated reward hacking"; pay "a monitorability tax"; P2-1).
FINAL.P2 = (sh, t) => {
  notebookPage();
  const tH = wT(20, /hack/), tL = wT(20, /loved/);
  camBTabs(t, wT(20, /every/));   // tucked under the trace, so drawn before it (round 2's T58)
  queue2d(c => traceStrip(c, 240, 1700, 330, 92, 7), { screen: true });
  paint(ribbon([[250, 470], [800, 450], [1300, 478], [1760, 456]], 200, 200), { wash: '#FBF4E4', ink: '#8C7A5A', sw: .5 });
  mono('… This is unnatural but tests might pass …', 330, 430, { size: 36, col: '#5A5A5A' });
  mono('Let’s hack', 980, 512, { size: 56, col: DQ.ink });
  if (t > tH) pencilCircle(1120, 495, 200, 56, seg(t, tH, tH + .4));
  if (t > tL) pencilCircle(1120, 495, 216, 66, seg(t, tL + .1, tL + .5));   // rung again
  ['test 1', 'test 2', 'test 3', 'test 4'].forEach((s, k) => { const at = tH + .3 + k * .25; mono(`${s} ${t > at ? '✓' : '·'}`, 1460, 660 + k * 52, { size: 34, col: t > at ? '#3D7A3A' : DQ.ink }); });
  // her and the pencil: eraser end down over the line, hesitating; on "loved" it turns round, lead to the page
  const hand = [930, 600], turn = ease(seg(t, tL - .1, tL + .25)), hes = Math.sin((t - sh.t0) * 5) * 6 * (1 - turn);
  researcher(700, 850, 395, t, { pose: 'hold', face: 1, hand, expr: t > tL ? 'smile' : 'worry' });   // her head clears the trace's "unnatural but"
  // the pencil, along the line from her hand to "Let's hack": the eraser leads at first; it spins end over end (its axis
  // scaled by cos(pi * turn), through zero) so the red lead leads after "loved"
  const ang = Math.atan2(512 - 40 - hand[1], 1000 + hes - hand[0]), sc = Math.cos(Math.PI * turn), d = [Math.cos(ang), Math.sin(ang)], n = [-d[1], d[0]];
  const P = (u, v) => [hand[0] + d[0] * u * sc + n[0] * v, hand[1] + d[1] * u * sc + n[1] * v];
  if (Math.abs(sc) > .05) {
    paint([P(-90, -9), P(105, -9), P(105, 9), P(-90, 9)], { wash: '#C9472A', fill: '#8E2A18', fillOp: 40, ink: DQ.ink, sw: .35 });   // the barrel
    paint([P(-90, -9), P(-125, 0), P(-90, 9)], { wash: '#E8C9A0', ink: DQ.ink, sw: .3 }); paint([P(-116, -2.5), P(-125, 0), P(-116, 2.5)], { wash: DQ.verm, ink: null });   // the cone, the red lead
    paint([P(105, -9), P(119, -9), P(119, 9), P(105, 9)], { wash: DQ.brass, ink: DQ.ink, sw: .3 }); paint([P(119, -8), P(141, -8), P(141, 8), P(119, 8)], { wash: '#E89AA0', ink: DQ.ink, sw: .3 });   // ferrule, eraser
  }
  if (t > tL) for (let k = 0; k < 4; k++) note('♥', 300 + k * 60, 640 - 34 * k, { size: 60, col: DQ.verm, alpha: seg(t, tL + k * .2, tL + k * .2 + .3) });
  camIAha(t, wT(20, /every/));   // R1-Zero's aha moment, with the biggest heart (Neel's pick; see camIAha)
  camILoveLove(t, tL);   // "All's fair in love and love", the second love struck out (Neel's pick; see camILoveLove)
  // The lyric is drawn here rather than by board(), so the comma after "you" can turn into a heart on top of it.
  shotLyric(sh, t);
  camBCommaHeart(t);
  return { noLyric: true };
};

// ---------- mock-ups of ideas left out of the video (drawn only for stills: render.mjs --mock=<key>; mock() in board.js) ----------
// t54, P1 (left out): a small friendly ghost peeks out from behind the pasted summary slip: the hidden reasoning, the
// "Silent, soft, and steady spectres" of the post on unfaithful CoT as nudged reasoning (Jul 2025, Neel last author). Left out: a
// 2025 post under P1's 2024 flick, and a second ghost if V2's ghost grads were used. (x, y): its middle; k: the slip's arrival.
function camBMockGhost(x, y, k) {
  queue2d(c => {
    c.save(); c.globalAlpha *= clamp(k * 2); c.translate(x, y); c.rotate(.12);
    c.fillStyle = '#FFFFFF'; c.strokeStyle = '#8C8A86'; c.lineWidth = 2.5; c.beginPath();
    c.moveTo(-46, 60); c.lineTo(-46, -10); c.bezierCurveTo(-46, -78, 46, -78, 46, -10); c.lineTo(46, 60);
    for (let i = 0; i < 4; i++) c.quadraticCurveTo(46 - 23 * i - 11.5, i % 2 ? 72 : 48, 46 - 23 * (i + 1), 60);   // the hem
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2A241E'; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 15 - 8, -18, 6, 9, 0, 0, TAU); c.fill(); }
    c.beginPath(); c.ellipse(-8, 6, 6, 4, 0, 0, Math.PI); c.fill();   // a small open smile
    c.fillStyle = 'rgba(232,154,160,.6)'; for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 26 - 8, -2, 5, 0, TAU); c.fill(); }   // its blush
    c.restore();
  });
}
// R10, P2 (Neel picked it, 3 Oct): one more line of the trace, legible, "Wait, wait. Wait. That's an aha moment I can flag
// here." (DeepSeek-R1-Zero's aha moment, DeepSeek-R1 v1, Jan 2025), and on "every line" it gets the biggest heart of all.
function camIAha(t, tE) {
  ['Wait, wait. Wait.', 'That’s an aha moment', 'I can flag here.'].forEach((s, i) => mono(s, 1350, 418 + i * 32, { size: 26, col: '#5A5A5A', role: 'fine' }));
  const k = backOut(seg(t, tE, tE + .3)); if (k > 0) note('♥', 1640, 520, { size: 150 * k, col: DQ.verm, rot: -.1 });
}
// T107, P2 (Neel picked it, 3 Oct, with a change): beside the margin hearts, in her red pencil, "All's fair in love and
// love", and a moment later the second "love" is struck out. Copy Suppression (McDougall et al. 2023, Neel last author):
// with its head ablated the model completes "All's fair in love and war" with "love and love"; the head's job is to stop
// the model repeating a word it has just seen, which is what the strike-out does.
function camILoveLove(t, tL) {
  if (t < tL + .5) return;
  const st = { font: DQF.hand, size: 44 }, x = 250, y1 = 714, y2 = 764, x2 = x + 38;
  tx('All’s fair in love', x, y1, { ...st, color: DQ.verm, align: 'left', reveal: seg(t, tL + .5, tL + .95), role: 'label' });
  if (t > tL + .95) tx('and love', x2, y2, { ...st, color: DQ.verm, align: 'left', reveal: seg(t, tL + .95, tL + 1.2), role: 'label' });
  const sk = seg(t, tL + 1.5, tL + 1.66);   // a moment later: the second "love" struck out
  if (sk > 0) { const x0 = x2 + measure('and ', st).w + 1, w = measure('love', st).w + 5; pen([[x0, y2 - 12], [x0 + w * sk, y2 - 16]], { col: DQ.verm, sw: 4.5 }); }
}

// Round 2's T58 (video/treatment/reference_bank_r2.md): on "every line" little paper flags flick out along the top of the
// trace, one per sentence, coloured by what each sentence does. Neel's steering-vectors paper on thinking models (Venhoff
// et al. 2025, Neel last author) sorted reasoning sentences into behaviours such as uncertainty, example testing,
// backtracking and adding knowledge. She loved every line, and filed every one.
function camBTabs(t, tE) {
  const cols = ['#F2D06B', '#8FB8DE', '#E89AA0', '#9CC28A'], order = [0, 2, 1, 3, 1, 0, 2, 3];
  order.forEach((ci, k) => {
    const x = 320 + k * 182 + 80 * (hash(k * 7.3) - .5), q = easeOut(seg(t, tE + k * .045, tE + k * .045 + .14)); if (q <= 0) return;   // irregular: sentences start anywhere
    box2d(x, 284 - (26 + 8 * hash(k * 1.7)) * q, 26, 44, { fill: cols[ci], stroke: 'rgba(60,50,40,.55)', sw: 1.5, r: 2, rot: .06 * (hash(k * 3.9) - .5) });
  });
}

// Round 2's T106 (video/treatment/reference_bank_r2.md): in the red backing vocal "(I loved you, every line)", the comma
// after "you" curls into a little heart as the karaoke fill reaches it. Neel's sentiment paper (Tigges et al. 2023, Neel
// last author) found sentiment "summarized at intermediate positions without inherent sentiment, such as punctuation":
// at commas. The word's position is read back from TEXTREG (the text registry tx() fills as it draws), so the heart sits
// on the comma wherever the caption layout puts it; if the word isn't drawn, nothing happens.
function camBCommaHeart(t) {
  const w = lineByIdx(20)?.words.find(x => x.w === 'you,'); if (!w) return;
  const t0 = w.t0 + (PROJECT.lead || 0) + .88 * (w.t1 - w.t0), k = seg(t, t0, t0 + .22);   // as the fill passes the comma
  if (k <= 0) return;
  queue2d(c => {
    const r = [...TEXTREG].reverse().find(e => e.s === 'you,' && e.role === 'lyric'); if (!r) return;
    const o = { font: DQF.serif, style: 'italic', size: r.size }, m = measure('you,', o), mc = measure(',', o);
    const x0 = r.bb[0] + m.l + measure('you', o).w, base = r.bb[3] - m.desc;   // the comma's origin and the baseline
    c.save(); c.globalAlpha *= clamp(k * 3); c.fillStyle = DQ.paper;   // the comma goes (a patch of the caption band)
    c.fillRect(x0 - mc.l - 2, base - mc.asc - 2, mc.l + mc.r + 4, mc.asc + mc.desc + 4); c.restore();
    const s = r.size * .19 * backOut(k), cx = x0 + mc.w * .42, cy = base - r.size * .16;
    c.save(); c.translate(cx, cy); c.rotate(-.18 + .25 * (1 - k)); c.fillStyle = DQ.verm; c.beginPath();
    c.moveTo(0, s * .95); c.bezierCurveTo(-s * 1.45, -s * .1, -s * .75, -s * 1.3, 0, -s * .45); c.bezierCurveTo(s * .75, -s * 1.3, s * 1.45, -s * .1, 0, s * .95);
    c.fill(); c.restore();
  });
}
