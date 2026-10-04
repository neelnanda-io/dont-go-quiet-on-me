// final_c1.js: Chorus 1, finished (37.49-54.14 s, stamped 2022). The visit (dgq/board.js visit + benchSet): her bench at
// waist height with the anglepoise from the 2020 page lit over the dish, a stack of books with V1d's pocket watch on the
// floor, the specimen tag (No. 2, its call not yet heard). C1b's lens is etched TransformerLens
// (reference bank M1, in focus for the first time in the 2022 stamp); C1d's outgrown dishes are labelled 0L, 1L, 2L.

// chorus 1: it has already outgrown its dish (bulging over the rim). It waves at her with its left arm.
// ...and the chorus is the hook line heard again, the first repeat in the song: a margin doodle of the induction head
// that copies it (Dec 2021 - Mar 2022, the year this chorus is set; Neel, 3 Oct: it had been in chorus 2, in 2025)
FINAL.C1a = (sh, t) => {
  visit(t, chorusG(sh), { wave: { j: 4, k: seg(t, sh.t0 + .5, sh.t0 + 1) * (1 - seg(t, sh.t0 + 3, sh.t0 + 3.5)) } });
  const tg = sh.t0 + .3; if (t > tg) { box2d(760, 80, 480, 76, { fill: '#FFF6E0', stroke: DQ.sepia, sw: 1.5, r: 6, rot: -.02, alpha: seg(t, tg, tg + .2) }); mono('[don’t][go] … [don’t] → [go]', 780, 128, { size: 26, reveal: seg(t, tg, tg + .6) }); }
};
FINAL.C1b = (sh, t) => {
  const [px, py] = eyeClose(t);
  queue2d(c => {   // in the pupil, this year's readout: five features in two dimensions (2022)
    c.save(); c.beginPath(); c.arc(px, py, 76, 0, TAU); c.clip(); c.strokeStyle = DQ.goldLt; c.fillStyle = DQ.goldLt; c.lineWidth = 4;
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k / 5 * TAU + t * .3; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * 52, py + Math.sin(a) * 52); c.stroke(); c.beginPath(); c.arc(px + Math.cos(a) * 52, py + Math.sin(a) * 52, 6, 0, TAU); c.fill(); }
    c.restore(); }, { screen: true });
  box2d(300, 130, 330, 180, { fill: DQ.paper, stroke: DQ.sepia, sw: 1.5, r: 6, rot: -.03 }); elk(420, 230, 60); note('ELK?', 520, 180, { size: 40 });   // a margin doodle, top left (the lyric has the bottom)
  return { lyBox: [110, 600, 590, 400] };   // left of the eye, clear of her hand
};
// "every feature I can find" (reference bank r2, R05): on "every" the five dancers drop out of their beat-by-beat
// formations and hit their marks on a pencilled ∀, the choreographer's chart for "for every" (Toy Models of Superposition,
// Sep 2022, wants "a universal quantifier over the fundamental units of neural network computation"). On "find" the chart
// rubs out and they spring back into a pentagon, the five features they are, and hold it.
const camFForall = (() => {   // the ∀'s corners and the ends of its crossbar
  const cx = 845, top = 290, h = 450, hw = 300, u = .38;   // its top right corner kept clear of the member card
  return { TL: [cx - hw, top], TR: [cx + hw, top], B: [cx, top + h], CL: [cx - hw * (1 - u), top + h * u], CR: [cx + hw * (1 - u), top + h * u] };
})();
FINAL.C1c = (sh, t) => {
  notebookPage();
  creature(1650, 860, chorusG(sh), t, { s: 190 });
  const F = [  // formations (5 dancers): pentagon, line, V, two rows
    k => { const a = -Math.PI / 2 + k / 5 * TAU; return [860 + Math.cos(a) * 190, 560 + Math.sin(a) * 190]; },
    k => [560 + k * 150, 600],
    k => [860 + (k - 2) * 140, 470 + Math.abs(k - 2) * 90],
    k => [700 + (k % 3) * 160 + (k > 2 ? 80 : 0), k > 2 ? 680 : 520],
  ];
  // a dancer's place: the formation of the beat (a new one every beat) until "every", then its mark on the ∀ (left to
  // right, as they stood in the line), then the pentagon, taken round the other way so nobody crosses
  const cyc = (k, tt) => { const b = beatsIn(tt, sh.t0), q = easeOut(seg(frac((tt - sh.t0) / BEAT), 0, .45)), [x0, y0] = F[b % 4](k), [x1, y1] = F[(b + 1) % 4](k); return [lerp(x0, x1, q), lerp(y0, y1, q)]; };
  const tE = wT(7, /every/), tF = wT(7, /find/), A = camFForall, mark = [A.TL, A.CL, A.B, A.CR, A.TR];
  const at = k => {
    if (t < tE) return cyc(k, t);
    const [ax, ay] = cyc(k, tE), [fx, fy] = mark[k];
    if (t < tF) { const s = easeOut(seg(t, tE, tE + .18)); return [lerp(ax, fx, s), lerp(ay, fy, s)]; }
    const [px, py] = F[0]((5 - k) % 5), s = backOut(seg(t, tF, tF + .4));
    return [lerp(fx, px, s), lerp(fy, py - 50, s)];   // (a little higher than the beats' pentagon: room for "latent" over the lyric)
  };
  // the chart, under their feet: the V in one stroke, then the bar; rubbed out as they leave it
  const draw = seg(t, tE, tE + .28), keep = 1 - seg(t, tF, tF + .25);
  if (draw > 0 && keep > 0) {
    const V = [A.TL, A.B, A.TR], n = 24, P = [];
    for (let i = 0; i <= n; i++) { const q = i / n * 2, j = Math.min(1, Math.floor(q)), f = q - j; P.push([lerp(V[j][0], V[j + 1][0], f), lerp(V[j][1], V[j + 1][1], f)]); }
    pen(P.slice(0, Math.max(2, Math.ceil(P.length * clamp(draw / .7)))), { sw: 4, alpha: .6 * keep });
    const bar = seg(draw, .7, 1); if (bar > 0) pen([A.CL, [lerp(A.CL[0], A.CR[0], bar), A.CL[1]]], { sw: 4, alpha: .6 * keep });
    flushLetters();   // the dancers stand on it
  }
  const cols = ['#E8C547', '#A8C64A', '#5EA67A', '#3E8F8C', '#2E6F86'];
  for (let k = 0; k < 5; k++) {
    const [x, y0] = at(k), y = y0 - 18 * Math.abs(Math.sin((t - sh.t0) / BEAT * Math.PI));
    paint([[x, y - 70], [x - 46, y - 10], [x - 16, y - 10], [x - 16, y + 60], [x + 16, y + 60], [x + 16, y - 10], [x + 46, y - 10]], { wash: cols[k], ink: PENCIL, sw: .6 });
    dot2d(x - 10, y - 26, 5, { fill: DQ.ink }); dot2d(x + 10, y - 26, 5, { fill: DQ.ink });
  }
  kpopCard(1250, 240, 'NEURON 4e:55', 'VISUAL', 'cat faces, car fronts, cat legs', t, sh.t0 + .3, { w: 470 });   // a neuron: no "feature" on screen (Neel, 3 Oct, late)
  // the lyric, drawn here so its "feature" can be corrected: Neel (3 Oct, late) calls them latents, never features (what a
  // sparse autoencoder finds needn't be the model's own features). A beat after "find", as the dancers spring back, her red
  // pencil strikes "feature" through and writes "latent" over it.
  const fw = lyricWordAt(shotLyric(sh, t), /^feature/i), tX = tF + .1;
  if (fw && t > tX) {
    const k = seg(t, tX, tX + .18), y = fw.base - fw.size * .3, x0 = fw.x0 - 8, x1 = fw.x1 + 8;
    inkPath2d([[x0, y + 3], [lerp(x0, x1, k * .5), y - 3], [lerp(x0, x1, k), y + 1]], { col: DQ.verm, sw: 6, alpha: .92 });
    tx('latent', (fw.x0 + fw.x1) / 2, fw.base - fw.size * .84, { font: DQF.hand, size: Math.round(fw.size * .74), color: DQ.verm, rot: -.04, reveal: seg(t, tX + .16, tX + .5), role: 'label', id: 'latent' });
  }
  return { noLyric: true };
};
// "keep talking — don't go quiet on me now": the visit at her bench, the dishes it outgrew lined up beside it (labelled
// like A Mathematical Framework's toy models: 0L, 1L, 2L). On "now" it waves to her again, as it did at the start of the
// chorus. (Neel, 3 Oct: no bell jar.) Same size throughout: it never grows on screen.
// ...and by the 1L dish, in the labels' wax pencil, the bug A Mathematical Framework (Dec 2021) found in one-layer
// attention-only models (reference bank r2, R06): a head that learns "keep… in mind" and "keep… at bay" must also learn
// "keep… in bay". Pencilled as the chorus sings "keep" (it sang "mind" a line ago). Still there as the page turns.
function camFKeepIn(sh, t, t0) {
  const V = visitLayout(chorusG(sh)), by = V.gy + 30, x0 = 1650, st = { font: DQF.hand, size: 28 }, col = DQ.verm, sl = -.035;
  const w0 = measure('keep … in', st).w, Y = (x, y) => y + (x - x0) * sl;   // a slight hand slope
  [['mind', 0], ['bay', 1]].forEach(([word, r]) => {
    const ts = t0 + r * .8, y = by - 150 + r * 40;
    if (t < ts) return;
    note('keep … in', x0, y, { size: 28, col, role: 'fine', rot: sl, reveal: seg(t, ts, ts + .35) });
    const xa = x0 + w0 + 8, xb = xa + 28, ka = seg(t, ts + .35, ts + .43);   // the arrow
    if (ka > 0) pen([[xa, Y(xa, y - 9)], [lerp(xa, xb, ka), Y(lerp(xa, xb, ka), y - 9)]], { col, sw: 2.2, j: .5 });
    if (ka >= 1) pen([[xb - 8, Y(xb - 8, y - 15)], [xb, Y(xb, y - 9)], [xb - 8, Y(xb - 8, y - 3)]], { col, sw: 2.2, j: .5 });
    const xw = xb + 8, kw = seg(t, ts + .43, ts + .58);
    if (kw > 0) note(word, xw, Y(xw, y), { size: 28, col, role: 'fine', rot: sl, reveal: kw });
    const xm = xw + measure(word, st).w + 10, km = seg(t, ts + .6, ts + .7);   // the verdict: a tick, or a cross
    if (km > 0) {
      const M = r === 0 ? [[[xm, y - 11], [xm + 6, y - 3], [xm + 18, y - 23]]] : [[[xm, y - 21], [xm + 15, y - 5]], [[xm + 15, y - 21], [xm, y - 5]]];
      M.forEach(P => { const Q = P.map(([x, yy]) => [x, Y(x, yy)]); pen(Q.slice(0, Math.max(2, Math.ceil(Q.length * km))), { col, sw: 2.6, j: .5 }); });
    }
  });
}
FINAL.C1d = (sh, t) => {
  const tNow = chorusNow(sh);
  visit(t, chorusG(sh), { discards: 3, wave: { j: 4, k: seg(t, tNow - .2, tNow + .25) * (1 - seg(t, sh.t1 - .7, sh.t1 - .2)) } });
  camFKeepIn(sh, t, wT(8, /keep/) - .04);
};
// The page it turns to, at the turn of 2022 into 2023 (reference bank r2, T127): p. 200, a faint numbered list, the
// exciting lines starred and pressed harder, as Neel's 200 Concrete Open Problems in Mechanistic Interpretability bolds
// and stars them (the sequence began on 28 Dec 2022). Numbers and stars only: the problems are pencil scribble.
function camFProblems(c) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = PENCIL;
  for (let r = 0; r < 12; r++) {
    const n = 189 + r, y = 200 + r * 64, star = [190, 194, 199].includes(n), end = 350 + 560 + 640 * hash(r * 3.7 + 1);
    c.globalAlpha = .55; skText(c, `${n}.`, 262, y, 30, { font: DQF.hand, col: PENCIL, align: 'left' });
    if (star) {   // a pencil star before the problem
      c.lineWidth = 2; c.beginPath();
      for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; i ? c.lineTo(331 + Math.cos(a) * 10, y - 9 + Math.sin(a) * 10) : c.moveTo(331 + Math.cos(a) * 10, y - 9 + Math.sin(a) * 10); }
      c.stroke();
    }
    c.globalAlpha = star ? .6 : .4; c.lineWidth = star ? 2.8 : 1.8;   // the line itself, as scribble (bold when starred)
    for (let x = 350, w = 0; x < end; w++) {
      const L = 40 + 90 * hash(r * 11.3 + w * 1.7), ph = 6 * hash(r + w * 5.1);
      c.beginPath(); for (let u = 0; u <= L; u += 4) { const yy = y - 8 + 6 * Math.sin(u * .5 + ph) * (.55 + .45 * Math.sin(u * .17 + ph * 2)); u ? c.lineTo(x + u, yy) : c.moveTo(x + u, yy); }
      c.stroke(); x += L + 16;
    }
  }
  c.globalAlpha = .9; skText(c, 'p. 200', 1860, 1010, 40, { font: DQF.hand, col: DQ.sepia, align: 'right' });
  c.restore();
}
FINAL.C1x = (sh, t) => { visit(t, chorusG(DQ_BY.C1d), { discards: 3 }); camFKeepIn(DQ_BY.C1d, t, wT(8, /keep/) - .04); pageTurn(t, sh.t0, (sh.t1 - sh.t0) * .85, { draw: camFProblems }, 2022); return { noLyric: true }; };
