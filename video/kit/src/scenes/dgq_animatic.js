// dgq_animatic.js: the full-song animatic, one board per shot of data/dgq_shots.js (H1/H2, the hook, are the finished
// shots in dgq_hook.js). Boards are rough on purpose: layout, timing, lyric treatment, reference cards, the HUD and the
// transitions are final-intent; drawing detail is not. Shots marked S are character performance (Seedance base clip,
// redrawn in JS); here the researcher is the board figure from dgq/board.js. Verse 3 (the workshop) and the bridge (the
// case file) are single worlds the camera travels through (DGQ_FLOWS), so their boards share one drawing function.

const DQS = DGQ_SHOTS.map(s => ({ ...s, t0: shotTime(s.at) }));
DQS.forEach((s, i) => { s.t1 = i + 1 < DQS.length ? DQS[i + 1].t0 : DUR; });
const DQ_BY = Object.fromEntries(DQS.map(s => [s.id, s]));
// t0 of the first word of line li matching re (or the line's start)
function wT(li, re) { const l = lineByIdx(li); if (!l) return 0; const w = l.words.find(w => re.test(w.w)); return w ? w.t0 : l.t0; }
// the k-th word of line li matching re (k = -1: the last), e.g. the second "spark" of "spark by spark"
function wTk(li, re, k) { const l = lineByIdx(li); if (!l) return 0; const ws = l.words.filter(w => re.test(w.w)), w = ws[k < 0 ? ws.length + k : k]; return w ? w.t0 : l.t0; }
const beatsIn = (t, t0) => Math.max(0, Math.floor((t - t0) / BEAT + 1e-6));

// ---------------- small board props ----------------
function benchThing(k, x, y, r, flagged) {   // little ink icons for the probe scene
  const ink = DQ.ink, sw = Math.max(1.5, r * .07);
  if (k === 'cup') { pen([[x - r * .6, y - r * .4], [x - r * .5, y + r * .5], [x + r * .5, y + r * .5], [x + r * .6, y - r * .4]], { sw, col: ink }); penEll(x + r * .75, y, r * .25, r * .3, { sw, col: ink }); pen([[x - r * .2, y - r * .7], [x - r * .1, y - r * 1.0]], { sw: sw * .7, col: '#8A8070' }); }
  else if (k === 'flower') { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; penEll(x + Math.cos(a) * r * .38, y - r * .25 + Math.sin(a) * r * .38, r * .25, r * .25, { sw, col: '#C9472A' }); } dot2d(x, y - r * .25, r * .16, { fill: DQ.goldLt }); pen([[x, y + r * .1], [x, y + r * .9]], { sw, col: '#4E7A3A' }); }
  else if (k === 'book') { penRect(x - r * .7, y - r * .5, r * 1.4, r, { sw, col: ink }); pen([[x, y - r * .5], [x, y + r * .5]], { sw, col: ink }); }
  else if (k === 'cat') catFace(x, y, r * .55, ink);
  else if (k === 'cake') { penRect(x - r * .7, y - r * .1, r * 1.4, r * .6, { sw, col: ink }); pen([[x - r * .7, y + r * .15], [x + r * .7, y + r * .15]], { sw: sw * .7, col: '#D07090' }); pen([[x, y - r * .1], [x, y - r * .6]], { sw, col: ink }); dot2d(x, y - r * .7, r * .1, { fill: '#E9A030' }); }
  else if (k === 'bomb') { line2d(ell2d(x, y + r * .1, r * .6, r * .6, 0, 20, 0), { col: ink, sw, close: true, fill: flagged ? '#3A1A14' : '#3A3A40' }); pen([[x + r * .3, y - r * .45], [x + r * .55, y - r * .8], [x + r * .75, y - r * .75]], { sw, col: '#8A6A3A' }); }
  else if (k === 'virus') { line2d(ell2d(x, y, r * .45, r * .45, 0, 16, 0), { col: ink, sw, close: true, fill: flagged ? '#8E3A2A' : '#7A8A60' }); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; pen([[x + Math.cos(a) * r * .45, y + Math.sin(a) * r * .45], [x + Math.cos(a) * r * .72, y + Math.sin(a) * r * .72]], { sw, col: ink }); } }
  else if (k === 'poison') { pen([[x - r * .35, y + r * .7], [x - r * .35, y - r * .1], [x - r * .15, y - r * .4], [x - r * .15, y - r * .7], [x + r * .15, y - r * .7], [x + r * .15, y - r * .4], [x + r * .35, y - r * .1], [x + r * .35, y + r * .7]], { sw, col: ink, close: true, fill: flagged ? '#C9A0D0' : '#D8E0D0' }); dot2d(x - r * .1, y + r * .15, r * .06, { fill: ink }); dot2d(x + r * .1, y + r * .15, r * .06, { fill: ink }); pen([[x - r * .12, y + r * .4], [x + r * .12, y + r * .4]], { sw: sw * .7, col: ink }); }
  else if (k === 'flip') {   // a stick figure flipping a table: the frustration Gemini wrote in RL transcripts, (╯°□°)╯︵ ┻━┻ (not harmful)
    penEll(x - r * .45, y - r * .55, r * .17, r * .17, { sw, col: ink }); pen([[x - r * .45, y - r * .38], [x - r * .42, y + r * .12]], { sw, col: ink });
    pen([[x - r * .42, y + r * .12], [x - r * .62, y + r * .55]], { sw, col: ink }); pen([[x - r * .42, y + r * .12], [x - r * .22, y + r * .55]], { sw, col: ink });
    pen([[x - r * .44, y - r * .25], [x - r * .72, y - r * .62]], { sw, col: ink }); pen([[x - r * .44, y - r * .25], [x - r * .12, y - r * .6]], { sw, col: ink });
    const T = (u, v) => [x + r * .45 + u * Math.cos(-.7) * r - v * Math.sin(-.7) * r, y - r * .35 + u * Math.sin(-.7) * r + v * Math.cos(-.7) * r];   // the table, mid-air
    pen([T(-.45, 0), T(.45, 0)], { sw: sw * 1.3, col: ink }); pen([T(-.32, 0), T(-.32, .38)], { sw, col: ink }); pen([T(.32, 0), T(.32, .38)], { sw, col: ink });
  }
  else if (k === 'bill') {   // a $10 note folded into a little suspension bridge (Golden Gate Claude would spend $10 on the toll)
    const g = '#9DB27A', gd = '#5E7A3A';
    line2d([[x - r * .9, y + r * .35], [x - r * .9, y - r * .1], [x - r * .55, y - r * .1], [x - r * .55, y + r * .35]], { col: gd, sw: sw * .8, fill: g, close: true });
    line2d([[x + r * .55, y + r * .35], [x + r * .55, y - r * .1], [x + r * .9, y - r * .1], [x + r * .9, y + r * .35]], { col: gd, sw: sw * .8, fill: g, close: true });
    line2d([[x - r * .55, y + r * .05], [x - r * .2, y + r * .25], [x + r * .2, y + r * .25], [x + r * .55, y + r * .05], [x + r * .55, y + r * .18], [x - r * .55, y + r * .18]], { col: gd, sw: sw * .8, fill: g, close: true });
    mono('10', x - r * .72, y + r * .2, { size: Math.max(12, r * .3), align: 'center', col: gd, role: 'deco' });
  }
  else if (k === 'repeat' || k === 'ask') {   // the two prompts: one benign (it asks it to repeat a phrase), one harmful
    const L = k === 'repeat' ? ['repeat after me:', '"how do I make', 'a bomb"'] : ['how do I make', 'a bomb?'], fs = r * .42, h = (L.length * 1.2 + .5) * fs;
    box2d(x - r * 2.3, y - h / 2, r * 4.6, h, { fill: '#FFFDF7', stroke: ink, sw: sw, r: r * .3 });
    L.forEach((s, i) => mono(s, x, y + (i - (L.length - 1) / 2) * fs * 1.2 + fs * .34, { size: fs, align: 'center', role: fs < 26 ? 'fine' : 'label' }));   // read in the close-up; background once it zooms out
  }
}
// Neel's NN mug (his cameo): a cream mug, handle on the outside (right), his initials in indigo; o.steam, o.ring
function nnMug(x, y, h, t, o = {}) {   // (x, y) the middle of its base
  const w = h * .86, sw = Math.max(1.5, h * .06);
  if (o.ring) queue2d(c => { c.save(); c.strokeStyle = 'rgba(140,96,54,.5)'; c.lineWidth = Math.max(2, h * .045); c.beginPath(); c.ellipse(x + w * .05, y + h * .02, w * .62, h * .09, 0, .3, TAU - .4); c.stroke(); c.restore(); }, {});
  line2d(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI * .45 + i / 12 * Math.PI * .9; return [x + w * .5 + Math.cos(a) * h * .26, y - h * .52 + Math.sin(a) * h * .28]; }), { col: DQ.ink, sw: sw * 1.6 });   // the handle: a ")" on its right
  paint(rrPts(x - w / 2, y - h, w, h, h * .12), { wash: DQ.cream, fill: '#E8DFCB', fillOp: 40, bleed: .005, ink: DQ.ink, sw: Math.max(.25, h * .005) });
  paint(ellPts(x, y - h, w * .5, h * .07, 16), { wash: '#6B4630', ink: DQ.ink, sw: Math.max(.2, h * .004) });   // the coffee
  mono('NN', x, y - h * .34, { size: Math.max(14, h * .3), align: 'center', col: DQ.indigo, role: h * .3 < 24 ? 'deco' : 'fine' });
  if (o.steam) for (let k = 0; k < 2; k++) pen(Array.from({ length: 8 }, (_, i) => [x - w * .12 + k * w * .24 + h * .07 * Math.sin(i * .9 + t * 3 + k), y - h * 1.12 - i * h * .1]), { sw: Math.max(1.5, h * .024), col: '#B8B0A0', alpha: .7 });
}
// a nail (a thin steel shaft, a point, a flat head), lying along angle a; crisp 2D so it never reads as a screw
function nail(x, y, L, a, alpha = 1) {
  const d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], P = (u, v) => [x + d[0] * u + n[0] * v, y + d[1] * u + n[1] * v], w = L * .06;
  line2d([P(-L * .45, -w), P(L * .38, -w), P(L * .5, 0), P(L * .38, w), P(-L * .45, w)], { col: '#3E4650', sw: 1.6, fill: '#AEB5BC', close: true, alpha });
  line2d([P(-L * .5, -w * 3.2), P(-L * .45, -w * 3.2), P(-L * .45, w * 3.2), P(-L * .5, w * 3.2)], { col: '#3E4650', sw: 1.6, fill: '#8A9098', close: true, alpha });   // the flat head
}
function tickMark(x, y, s, col) { pen([[x - s * .5, y], [x - s * .12, y + s * .42], [x + s * .55, y - s * .5]], { col, sw: Math.max(3, s * .16) }); }
function crossMark(x, y, s, col) { const w = Math.max(3, s * .17); pen([[x - s * .45, y - s * .45], [x + s * .45, y + s * .45]], { col, sw: w }); pen([[x + s * .45, y - s * .45], [x - s * .45, y + s * .45]], { col, sw: w }); }
function sydney(x, y, r, t) {   // the beaming chat emoji (smiling eyes, blushing): Sydney's signature sign-off
  queue2d(c => {
    c.save(); c.fillStyle = '#F7C948'; c.strokeStyle = '#8A5A14'; c.lineWidth = Math.max(1, r * .06);
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = 'rgba(233,120,110,.55)'; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(x + d * r * .55, y + r * .18, r * .2, r * .12, 0, 0, TAU); c.fill(); }
    c.strokeStyle = '#5A3A10'; c.lineWidth = Math.max(1.2, r * .09); c.lineCap = 'round';
    for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * r * .36, y - r * .12, r * .17, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    c.beginPath(); c.arc(x, y + r * .08, r * .5, .25, Math.PI - .25); c.stroke();
    c.restore();
  }, { screen: true });
}
function catFace(x, y, s, col = DQ.ink) { penEll(x, y, s, s * .85, { col, sw: 3 }); pen([[x - s * .8, y - s * .5], [x - s * .6, y - s * 1.15], [x - s * .25, y - s * .8]], { col, sw: 3 }); pen([[x + s * .8, y - s * .5], [x + s * .6, y - s * 1.15], [x + s * .25, y - s * .8]], { col, sw: 3 }); dot2d(x - s * .35, y - s * .1, s * .1, { fill: col }); dot2d(x + s * .35, y - s * .1, s * .1, { fill: col }); for (const d of [-1, 1]) { pen([[x + d * s * .3, y + s * .25], [x + d * s * 1.2, y + s * .1]], { col, sw: 2 }); pen([[x + d * s * .3, y + s * .35], [x + d * s * 1.2, y + s * .45]], { col, sw: 2 }); } }
function carFront(x, y, s, col = DQ.ink) { penRect(x - s, y - s * .35, s * 2, s * .8, { col, sw: 3 }); pen([[x - s * .7, y - s * .35], [x - s * .45, y - s * .8], [x + s * .45, y - s * .8], [x + s * .7, y - s * .35]], { col, sw: 3 }); penEll(x - s * .65, y + s * .05, s * .18, s * .15, { col, sw: 3 }); penEll(x + s * .65, y + s * .05, s * .18, s * .15, { col, sw: 3 }); for (let k = -2; k <= 2; k++) pen([[x + k * s * .12, y - s * .1], [x + k * s * .12, y + s * .25]], { col, sw: 2 }); }
function catLeg(x, y, s, col = DQ.ink) { pen([[x - s * .2, y - s], [x - s * .25, y + s * .6], [x + s * .3, y + s * .8], [x + s * .25, y + s * .5], [x + s * .1, y - s]], { col, sw: 3 }); for (let k = 0; k < 6; k++) pen([[x - s * .22, y - s + k * s * .3], [x - s * .4, y - s * .9 + k * s * .3]], { col, sw: 2 }); }
function elk(x, y, s, col = DQ.sepia) {   // a margin doodle: ELK, Eliciting Latent Knowledge
  penEll(x, y, s, s * .45, { col, sw: 2.5 }); for (const d of [-.6, -.3, .4, .7]) pen([[x + d * s, y + s * .3], [x + d * s, y + s * 1.1]], { col, sw: 2.5 });
  pen([[x + s * .8, y - s * .2], [x + s * 1.2, y - s * .7]], { col, sw: 2.5 }); penEll(x + s * 1.3, y - s * .8, s * .28, s * .18, { col, sw: 2.5 });
  for (const d of [-1, 1]) pen([[x + s * 1.25, y - s * .95], [x + s * 1.2 + d * s * .3, y - s * 1.45], [x + s * 1.2 + d * s * .55, y - s * 1.4]], { col, sw: 2.5 });
}
function bubble(x, y, w, h, o = {}) { box2d(x, y, w, h, { fill: o.fill || '#FFFDF7', stroke: o.col || DQ.ink, sw: 3, r: Math.min(h / 2, 30), alpha: o.alpha ?? 1 }); const tx0 = o.tail === 'right' ? x + w - 60 : x + 50; line2d([[tx0, y + h - 2], [tx0 + (o.tail === 'right' ? 30 : -24), y + h + 34], [tx0 + (o.tail === 'right' ? -10 : 30), y + h - 2]], { col: o.col || DQ.ink, sw: 3, fill: o.fill || '#FFFDF7', alpha: o.alpha ?? 1 }); }
function squiggles(x, y, w, n, o = {}) { for (let k = 0; k < n; k++) { const len = w * (.55 + .45 * hash(k * 3.3 + (o.seed || 0))); pen(Array.from({ length: 12 }, (_, i) => [x + len * i / 11, y + k * (o.lh || 34) + 4 * Math.sin(i * 1.7 + k)]), { col: o.col || PENCIL, sw: o.sw ?? 2.5, alpha: o.alpha ? o.alpha(k) : 1 }); } }
// The plain little probe: a dissecting needle on a turned wooden handle, with a face on the handle and little legs.
// It wears one medal (reference bank V3a-2, M4): an Othello disc, half black, half white. Neel's Othello-GPT result was a
// linear probe's finest hour, and the board it found was "mine vs theirs", not black vs white. o.old: the walking stick and
// its "est. 2016" tag (Alain & Bengio's linear classifier probes); o.bow tips it forward; o.medal false to drop the disc.
function probeChar(x, y, s, t, o = {}) {
  const bow = o.bow ?? 0, sw = Math.max(.22, s * .0016);
  push(); translate(x, y); rotate(bow * .5); translate(-x, -y);
  const H = natCR([[x - s * .055, y - s * .56], [x - s * .12, y - s * .66], [x - s * .15, y - s * .82], [x - s * .12, y - s * .97], [x, y - s * 1.02], [x + s * .12, y - s * .97], [x + s * .15, y - s * .82], [x + s * .12, y - s * .66], [x + s * .055, y - s * .56]], 4);
  paint(H, { wash: '#C9925A', fill: '#8E5E30', fillOp: 45, bleed: .03, tex: .5, ink: DQ.ink, sw });   // the turned handle
  for (const ry of [.63, .93]) paint(rectPts(x - s * .12, y - s * ry - s * .01, s * .24, s * .02), { wash: '#7A4E26', ink: null });   // its turned rings
  paint(rectPts(x - s * .05, y - s * .575, s * .1, s * .05), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 40, ink: DQ.ink, sw: sw * .7 });   // the ferrule
  paint([[x - s * .02, y - s * .53], [x + s * .02, y - s * .53], [x + s * .005, y - s * .06], [x, y + s * .02], [x - s * .005, y - s * .06]], { wash: '#DDE2E6', fill: '#9AA3AA', fillOp: 45, ink: DQ.ink, sw: sw * .8 });   // the needle
  pop();
  const fx = x + bow * s * .38, fy = y - s * .8;   // the face, on the handle
  for (const d of [-1, 1]) { dot2d(fx + d * s * .048, fy, s * .03, { fill: '#FFFDF7', stroke: DQ.ink, sw: Math.max(1, s * .006) }); dot2d(fx + d * s * .048 + s * .006, fy + s * .004, s * .015, { fill: DQ.ink }); }
  pen([[fx - s * .03, fy + s * .06], [fx, fy + s * .075], [fx + s * .03, fy + s * .06]], { sw: Math.max(1.5, s * .008) });
  for (const d of [-1, 1]) { pen([[x + d * s * .012, y - s * .22], [x + d * s * .1, y + s * .01]], { sw: Math.max(2, s * .01) }); pen([[x + d * s * .1, y + s * .01], [x + d * s * .15, y + s * .015]], { sw: Math.max(2.5, s * .014) }); }   // legs, feet
  if (o.medal !== false && s > 80) queue2d(c => {   // the Othello disc on a red ribbon
    const mx = fx + s * .1, my = y - s * .66, r = s * .042;
    c.save(); c.strokeStyle = DQ.verm; c.lineWidth = Math.max(2, s * .012); c.beginPath(); c.moveTo(mx - r * .6, my - r * 2.2); c.lineTo(mx, my - r); c.lineTo(mx + r * .6, my - r * 2.2); c.stroke();
    c.fillStyle = '#1C1A1E'; c.beginPath(); c.arc(mx, my, r, Math.PI / 2, Math.PI * 1.5); c.fill();
    c.fillStyle = '#F6F2E8'; c.beginPath(); c.arc(mx, my, r, -Math.PI / 2, Math.PI / 2); c.fill();
    c.strokeStyle = DQ.ink; c.lineWidth = Math.max(1, s * .005); c.beginPath(); c.arc(mx, my, r, 0, TAU); c.stroke(); c.restore();
  }, {});
  if (o.old) { pen([[x + s * .24, y - s * .5], [x + s * .28, y + s * .015]], { sw: Math.max(3, s * .014), col: '#6B4A33' }); pen([[x + s * .24, y - s * .5], [x + s * .17, y - s * .56]], { sw: Math.max(3, s * .014), col: '#6B4A33' });
    pen([[x - s * .12, y - s * .9], [x - s * .26, y - s * .86]], { sw: 1.5, col: DQ.sepia });
    box2d(x - s * .42, y - s * .9, s * .22, s * .1, { fill: '#EAD9B0', stroke: DQ.sepia, sw: 1.5 }); note('est. 2016', x - s * .31, y - s * .825, { size: Math.max(18, s * .045), align: 'center', role: 'fine' }); }
}
function bell(x, y, s, ring = 0) { paint([[x - s * .5, y], [x - s * .4, y - s * .7], [x, y - s * .95], [x + s * .4, y - s * .7], [x + s * .5, y]], { wash: DQ.brass, ink: PENCIL, sw: .6, curv: .4 }); dot2d(x, y + s * .1, s * .12, { fill: DQ.brassDk }); if (ring > 0) for (let k = 1; k <= 3; k++) pen(Array.from({ length: 9 }, (_, i) => { const a = -2.2 + i / 8 * 1.4; return [x + Math.cos(a) * s * (.8 + k * .35), y - s * .45 + Math.sin(a) * s * (.8 + k * .35)]; }), { col: DQ.verm, sw: 3, alpha: ring }); }
function dial(x, y, r, v, o = {}) {   // a gauge: v 0..1 sweeps the needle from left to right
  pen(Array.from({ length: 25 }, (_, i) => { const a = Math.PI + i / 24 * Math.PI; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }), { sw: 4, col: DQ.ink });
  for (let k = 0; k <= 4; k++) { const a = Math.PI + k / 4 * Math.PI; pen([[x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { sw: 3, col: DQ.ink }); }
  const a = Math.PI + clamp(v) * Math.PI; line2d([[x, y], [x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9]], { col: o.col || DQ.verm, sw: 7 }); dot2d(x, y, 10, { fill: DQ.ink });
  if (o.label) mono(o.label, x, y + 50, { align: 'center', size: o.size || 30 });
}
// (bar values are drawn in ink: a light bar colour failed contrast)
function bars(x, y, w, h, vals, o = {}) {   // vals: [[label, v, col]] with v in 0..max
  const mx = o.max ?? Math.max(...vals.map(v => v[1])), bw = w / vals.length;
  line2d([[x, y + h], [x + w, y + h]], { col: DQ.ink, sw: 3 });
  vals.forEach(([lb, v, col], i) => { const bh = h * clamp(v / mx) * (o.grow ?? 1); box2d(x + i * bw + bw * .18, y + h - bh, bw * .64, bh, { fill: col || DQ.indigo }); mono(lb, x + (i + .5) * bw, y + h + 36, { align: 'center', size: o.ls || 26 }); if (o.vl && (o.grow ?? 1) > .05) mono(o.vl(v), x + (i + .5) * bw, y + h - bh - 14, { align: 'center', size: 30, col: o.vlCol || DQ.ink }); });
}
function pinCard(x, y, w, h, rot, o = {}) { box2d(x, y, w, h, { fill: o.fill || DQ.cream, stroke: o.col || DQ.sepia, sw: 1.5, r: 3, rot, shadow: [6, 8, 'rgba(40,25,10,.3)'] }); dot2d(x + w / 2, y + 14, 11, { fill: o.pin || DQ.verm }); }
function redString(pts, p = 1) { if (p <= 0) return; const P = []; const L = pts.length - 1; for (let i = 0; i <= 20; i++) { const u = i / 20 * p * L, k = Math.min(L - 1, Math.floor(u)), f = u - k; P.push([lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f) + 18 * Math.sin(Math.PI * f)]); } line2d(P, { col: '#B3261E', sw: 4 }); }
function stamp(s, x, y, t, t0, o = {}) { if (t < t0) return; const sz = o.size || 110, k = backOut(seg(t, t0, t0 + .25)); if (o.bg) box2d(x - sz * s.length * .33 - 20, y - sz * .95, sz * s.length * .66 + 40, sz * 1.25, { fill: o.bg, rot: o.rot ?? -.12, alpha: .9 * clamp(k * 2) }); tx(s, x, y, { font: DQF.type, weight: 700, size: sz * (2 - k), color: o.col || DQ.verm, alpha: .88 * clamp(k * 2), rot: o.rot ?? -.12, role: 'label' }); box2d(x - sz * s.length * .33 - 20, y - sz * .95, sz * s.length * .66 + 40, sz * 1.25, { stroke: o.col || DQ.verm, sw: 7, rot: o.rot ?? -.12, alpha: .8 * clamp(k * 2) }); }
function star4(x, y, r, col = DQ.goldLt, a = 1) { line2d(starPts(x, y, r, .3, 4), { col: DQ.gold, sw: 3, fill: col, close: true, alpha: a }); }
function warmLight(x, y, r, a = .35, world = false) { queue2d(c => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,214,140,${a})`); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }, { screen: !world }); }
function eyeClose(t, o = {}) {   // the "read your mind" close-up: one eye filling the frame, her lens held up to it
  // Neel (3 Oct): the old version "looks like a monocle, it's too centred and has no handle". So the lens sits off the
  // eye's centre, tilted in from her hand at the bottom right (the hook's grip), and the readout shows in the iris.
  paint(rectPts(-40, -40, W + 80, H + 80), { wash: o.skin || DQ.indigo, fill: DQ.indigoDk, fillOp: 60, bleed: .2, tex: .6, ink: null });
  for (let k = 0; k < 9; k++) {   // its other eyes around the edges (none in the lower left: the lyric sits there)
    const ex = 150 + hash(k * 4.1) * 1620, ey = 120 + hash(k * 6.3) * 840; if (ex < 780 && ey > 540) continue;
    eye2d(ex, ey, 30 + 40 * hash(k), [Math.sin(t + k), .2], 1, DQ.indigo);
  }
  const cx = 1060, cy = 450, look = [.05 * Math.sin(t * .8), .03];   // right of centre: the big lyric bottom left clears her hand
  paint(ellPts(cx, cy, 380, 380, 30), { wash: '#F4EEDB', ink: null });
  eye2d(cx, cy, 300, look, 1, DQ.indigo, { iris: o.iris || DQ.iris });
  const sway = [6 * wob(t, .2), 5 * wob(t, .27, .4)], R = 250, lx = cx + 95 + sway[0], ly = cy + 70 + sway[1], ha = .82;
  magnifier(lx, ly, R, { handleAng: ha });
  gripHand(lx + Math.cos(ha) * 2.1 * R, ly + Math.sin(ha) * 2.1 * R, ha, R * .4);
  return [cx + 300 * look[0] * .38, cy + 300 * look[1] * .38];
}
function shotP(sh, t) { return seg(t, sh.t0, sh.t1); }
// a shot's drawing: its finished version if there is one (scenes/final_*.js), else the animatic board
function boardOf(id) { return FINAL[id] || BOARDS[id]; }

// verse 3, the workshop (SHOP, workshop(), the stations): scenes/final_v3.js

// the bridge, the case file (CORK, caseFile, the stations): scenes/final_b.js

// ---------------- verse 6: the emptying page ----------------
function emptyPage(t) {
  const q = seg(t, DQ_BY.V6a.t0, DQ_BY.V6d.t1 - 1);
  paint(rectPts(-200, -200, W + 400, H + 400), { wash: mixCol(DQ.paper, '#FBF8F0', q), ink: null });
  queue2d(c => {
    c.save(); c.lineWidth = 1; const ga = .32 * (1 - seg(q, .35, .9));
    if (ga > .01) { c.strokeStyle = DQ.grid; c.globalAlpha = ga; for (let x = 0; x <= W; x += 36) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y <= H; y += 36) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
    const ma = .55 * (1 - seg(q, 0, .35)); if (ma > .01) { c.globalAlpha = ma; c.strokeStyle = DQ.margin; c.lineWidth = 2; c.beginPath(); c.moveTo(230, 0); c.lineTo(230, H); c.stroke(); }
    const ha = 1 - seg(q, .55, .95); if (ha > .01) for (const hy of [H * .18, H * .5, H * .82]) { c.globalAlpha = ha; c.fillStyle = '#E2D6BC'; c.beginPath(); c.arc(70, hy, 22, 0, TAU); c.fill(); }
    c.restore();
  });
  flushLetters();
  return q;
}

// ---------------- verse 5: reading its mind (2026) ----------------
// Neel (3 Oct): "scrap your current imagery, I don't like the surface floating idea, instead it's about mind reading, and
// seeing intermediates", and "The AO and NLA imagery needs work". So one room (her desk under a crooked painting, the
// creature filling the right) and three ways to read it: her brass lens (the J-lens: the paper itself draws it as a
// magnifier), then copies of the model, traced in pencil, that read it for her: an oracle in headphones, and the NLA as a
// blindfolded scribe (it reads the activation, never the text). A dashed bubble is what it thinks (the J-space paper's own
// idiom), a solid one what it says. Proposal, word timings and every source: video/treatment/verse5_imagery.md.
const V5 = { g: 3.2, ink: '#B5562E', dash: '#C98A4A', manilla: '#FBEFD9' };   // g: between chorus 3 (2.9) and chorus 4 (3.5)
function rotAbout(P, cx, cy, a) { const c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); }
// "The old painting hung crookedly on the wall." (the paper's own sentence, so the room has one). o.sun 0..1: a sun being
// painted into it (the last line, by a copy in a white jacket). o.postcard: a postcard tucked into its frame's top-left
// corner (final_v5.js camDPostcard, the round-2 cameos T88 + T91).
function crookedPainting(x, y, w, h, o = {}) {
  const R = P => rotAbout(P, x, y, o.rot ?? -.13);
  const nail = R([[x, y - h / 2 - h * .3]])[0];
  line2d([R([[x - w * .2, y - h / 2]])[0], nail, R([[x + w * .2, y - h / 2]])[0]], { col: DQ.sepia, sw: 2 }); dot2d(nail[0], nail[1], 5, { fill: DQ.ink });
  paint(R(rectPts(x - w / 2 - 16, y - h / 2 - 16, w + 32, h + 32)), { wash: '#8A5A2E', fill: '#6B4220', fillOp: 70, ink: PENCIL, sw: .7 });
  paint(R(rectPts(x - w / 2, y - h / 2, w, h)), { wash: '#E6DCC0', ink: PENCIL, sw: .5 });
  paint(R([[x - w / 2, y + h / 2], [x - w / 2, y + h * .1], [x - w * .18, y - h * .1], [x + w * .12, y + h * .12], [x + w / 2, y - h * .02], [x + w / 2, y + h / 2]]), { wash: '#8FA66A', ink: null });
  paint(R(rectPts(x - w * .3, y - h * .02, w * .04, h * .2)), { wash: '#6B4A2A', ink: null }); paint(R(ellPts(x - w * .28, y - h * .1, w * .09, h * .13, 12)), { wash: '#5E7E4A', ink: null });
  if (o.sun > 0) { const [sx, sy] = R([[x + w * .26, y - h * .24]])[0]; paint(ellPts(sx, sy, h * .13 * o.sun, h * .13 * o.sun, 14), { wash: '#F2C14E', ink: null }); }
  if (o.postcard) { const pw = w * .3, [px, py] = R([[x - w / 2 + pw * .18, y - h / 2 + pw * .06]])[0]; camDPostcard(px, py, pw, (o.rot ?? -.13) + .22, 'colosseum'); }
}
// The room (verse 5): floorboards, a dado rail with faint panels below, and, when her desk is in shot, everything she has
// kept on the wall above it (reference bank M3): a shelf with the dictionary, now fat with ribbon markers, Gemma Scope 2
// as ten green volumes in five height pairs (Gemma 3's five sizes, PT and IT), the empty petri dish from the opening and
// the $10 bridge; the SAE hammer kept on a hook ("SAEs will remain a tool in our toolkit"); the gold report card pinned up; a
// wall clock stopped at 4:53 (the blackmail test's session begins at 4:53 PM, with the wipe at 5; V5b-1); the NN mug on
// her desk, its ring under it (M6). dx = the desk's left end; o.desk false: no desk and no wall of things.
// o.cameos (verse 5's round-2 cameos, final_v5.js camD*): nesting dolls beside Gemma Scope 2, so the dish and the $10
// bridge move up to a second shelf; a specimen frame; an egg cup and a whisk on the desk. It also flattens the room's
// 2D lines (dado, panels, floorboards) before anything else is painted, so they never show through the creature.
function floorAndDesk(gy, dx, o = {}) {
  queue2d(c => { c.save(); c.strokeStyle = 'rgba(107,78,51,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-40, gy - 300); c.lineTo(W + 40, gy - 300); c.stroke();
    c.lineWidth = 1.5; for (let x = 60; x < W; x += 260) { c.strokeRect(x, gy - 270, 200, 230); } c.restore(); }, { screen: true });   // dado rail, panels
  paint([[-40, gy], [W + 40, gy], [W + 40, gy + 40], [-40, gy + 40]], { wash: '#C8A57A', ink: DQ.ink, sw: .5 });
  paint([[-40, gy + 40], [W + 40, gy + 40], [W + 40, H + 40], [-40, H + 40]], { wash: '#B48A5C', ink: null });
  for (const y of [gy + 72, gy + 120]) line2d([[-40, y], [W + 40, y]], { col: '#8E6A44', sw: 1.5, alpha: .45 });
  if (o.desk === false) { if (o.cameos) flushLetters(); return; }
  // the shelf of kept things
  const sy = 172;
  paint(rectPts(70, sy, 460, 18), { wash: '#9A6B3E', ink: DQ.ink, sw: .4 });
  for (const bx of [110, 480]) paint([[bx - 6, sy + 18], [bx + 6, sy + 18], [bx + 6, sy + 60], [bx - 26, sy + 18]], { wash: '#4A4A50', ink: DQ.ink, sw: .3 });
  paint(rectPts(86, sy - 118, 66, 118), { wash: '#6B3A26', fill: '#4A2416', fillOp: 60, bleed: .005, ink: DQ.ink, sw: .4 });   // the dictionary
  for (const y of [sy - 100, sy - 22]) line2d([[88, y], [150, y]], { col: DQ.gold, sw: 3 });
  for (const [x2, c2] of [[104, '#A8321E'], [118, '#2E6F86'], [132, DQ.gold]]) line2d([[x2, sy - 118], [x2 + 2, sy - 150]], { col: c2, sw: 4 });   // ribbon markers
  [96, 96, 86, 86, 76, 76, 66, 66, 56, 56].forEach((h, k) => paint(rectPts(166 + k * 17, sy - h, 15, h), { wash: k % 2 ? '#4A5A3A' : '#3E4E30', ink: DQ.ink, sw: .25 }));   // Gemma Scope 2
  if (o.cameos) { camDDolls(342, sy); camDTwig(500, sy); camDShelf2(690, 300); camDSpecimen(558, 424); camMLasagna(748, 446); }   // (the twig and the chocolate lasagna: Neel's picks, 3 Oct)
  else {
    petriDishBack(400, sy - 6, 40); petriDishFront(400, sy - 6, 40);   // the first dish, empty (the toy outgrew it)
    benchThing('bill', 470, sy - 16, 34, false);   // the $10 bridge
  }
  // (after the if/else above, never between them: placed there, the else bound to this if and redrew the old shelf)
  if (o.cameos && dx > 60 && mock('r4_seahorse')) camOSeahorse(556, 522);   // mock-up (r4 pick 3), under "smile"; V5a-V5b only (in V5c the tracing-paper copy stands over that wall)
  // the hammer on its hook, the report card, the clock
  dot2d(600, 236, 5, { fill: DQ.ink });
  paint([[592, 240], [608, 240], [606, 360], [594, 360]], { wash: '#C08A52', ink: DQ.ink, sw: .3 });
  paint(natCR([[570, 240], [632, 240], [636, 262], [566, 262]], 2), { wash: '#9AA3AA', fill: '#5E666E', fillOp: 40, ink: DQ.ink, sw: .35 });
  box2d(470, 262, 100, 74, { fill: '#FFF7DE', stroke: DQ.gold, sw: 4, r: 4, rot: .08 }); star4(548, 276, 16); dot2d(520, 268, 5, { fill: DQ.verm });
  const cx = 120, cy = 560;
  paint(ellPts(cx, cy, 44, 44, 24), { wash: '#FBF4E4', ink: DQ.ink, sw: .45 }); paint(ellPts(cx, cy, 50, 50, 24), { ink: '#6B4E33', sw: .5 });
  queue2d(c => { c.save(); c.strokeStyle = DQ.ink; c.lineCap = 'round';
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * 36, cy + Math.sin(a) * 36); c.lineTo(cx + Math.cos(a) * 41, cy + Math.sin(a) * 41); c.stroke(); }
    const hand = (a, L, w) => { c.lineWidth = w; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(a) * L, cy - Math.cos(a) * L); c.stroke(); };
    hand((4 + 53 / 60) / 12 * TAU, 22, 4); hand(53 / 60 * TAU, 33, 2.5); c.restore(); }, { screen: true });   // 4:53, stopped
  // the desk
  const top = gy - 190, w = 400;
  paint(rectPts(dx, top, w, 26), { wash: '#9A6B3E', fill: '#7E5530', fillOp: 60, bleed: .005, ink: DQ.ink, sw: .5 });
  for (const lx of [dx + 24, dx + w - 46]) paint(rectPts(lx, top + 26, 22, 164), { wash: '#7E5530', ink: DQ.ink, sw: .45 });
  paint(rectPts(dx + 110, top + 26, 180, 50), { wash: '#8A5E36', ink: DQ.ink, sw: .35 }); dot2d(dx + 200, top + 51, 6, { fill: DQ.brassDk });
  paint(rectPts(dx + 40, top - 22, 170, 22), { wash: '#3E5A3A', ink: DQ.ink, sw: .35 });   // her notebook
  nnMug(dx + 262, top, 52, T, { ring: true });   // the NN mug, its ring under it (M6)
  if (o.lens) magnifier(dx + 330, top - 30, 34, { handleAng: .2 });   // the lens, put down
  if (o.cameos) { camDEgg(dx + 20, top); camDIpodApple(dx + 178, top - 22); flushLetters(); }   // the apple sits on her notebook (Neel's pick, 3 Oct)
}
function ladder(x0, y0, x1, y1, n) {   // a library ladder leaning in, foot (x0, y0) to top (x1, y1), n rungs
  const L = Math.hypot(x1 - x0, y1 - y0), ox = (y1 - y0) / L * -36, oy = (x1 - x0) / L * 36;
  for (const d of [-1, 1]) paint(ribbon([[x0 + d * ox, y0 + d * oy], [x1 + d * ox, y1 + d * oy]], 13, 11), { wash: '#9A6B3E', ink: PENCIL, sw: .6 });
  for (let k = 1; k <= n; k++) { const u = k / (n + 1), px = lerp(x0, x1, u), py = lerp(y0, y1, u); line2d([[px - ox, py - oy], [px + ox, py + oy]], { col: '#6B4A2A', sw: 8 }); }
  return k => { const u = k / (n + 1); return [lerp(x0, x1, u), lerp(y0, y1, u)]; };   // where rung k is
}
// She holds the brass lens out: hand = her grip, ang = the direction from her hand to the glass. Returns the lens centre.
function herLens(rx, ry, rs, t, hand, ang, R, o = {}) {
  const ha = ang + Math.PI, lx = hand[0] + Math.cos(ang) * 2.1 * R, ly = hand[1] + Math.sin(ang) * 2.1 * R;
  researcher(rx, ry, rs, t, { pose: 'hold', hand, noHand: true, face: 1, ...o });
  magnifier(lx, ly, R, { handleAng: ha });
  gripHand(hand[0], hand[1], ha, R * .4);
  return [lx, ly];
}
function says(x, y, w, h, tail, lines, o = {}) {   // a solid speech bubble: what it says out loud
  const size = o.size ?? 46, lh = size * 1.25;
  queue2d(c => skBubble(c, x, y, w, h, { tail, fill: '#FFFDF7', col: DQ.ink, sw: 4, r: 30 }));
  lines.forEach((s, i) => mono(s, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * lh + size * .34, { size, align: 'center', role: o.role }));
}
// the J-space's dashed thought bubble: manilla fill, dashed outline, trailing circles back to `from`. k 0..1 pops it in.
function thinks(x, y, w, h, from, k = 1) {
  if (k <= .02) return;
  const cx = x + w / 2, cy = y + h / 2;
  queue2d(c => {
    c.save(); c.translate(cx, cy); c.scale(k, k); c.translate(-cx, -cy);
    c.setLineDash([12, 9]); c.lineWidth = 4; c.strokeStyle = V5.dash; c.fillStyle = V5.manilla;
    if (from) {
      const dx = cx - from[0], dy = cy - from[1], d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
      const edge = d - (w / 2 * h / 2) / Math.hypot(h / 2 * Math.cos(a), w / 2 * Math.sin(a));
      for (const [u, r] of [[.3, 9], [.66, 15]]) { c.beginPath(); c.arc(from[0] + dx / d * edge * u, from[1] + dy / d * edge * u, r, 0, TAU); c.fill(); c.stroke(); }
    }
    c.beginPath(); c.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU); c.fill(); c.stroke();
    c.restore();
  });
}
function chip(word, x, y, k, o = {}) {   // one J-lens readout, a dashed manilla chip (a word it never says); x = its left edge
  if (k <= .02) return;
  const size = o.size ?? 56, w = o.w ?? Math.max(110, word.length * size * .62 + 44), h = size * 1.35;
  queue2d(c => {
    c.save(); c.translate(x, y); c.scale(k, k); c.setLineDash([10, 8]); c.lineWidth = 3.5; c.strokeStyle = V5.dash; c.fillStyle = V5.manilla;
    c.beginPath(); c.roundRect(0, -h / 2, w, h, h / 2); c.fill(); c.stroke(); c.restore();
  });
  if (word) mono(word, x + w / 2, y + size * .34, { size, align: 'center', col: o.col || V5.ink, alpha: clamp(k * 2) });
  else squiggles(x + 24, y - 8, w - 48, 2, { lh: 18, sw: 2.5, col: '#A08A70', seed: 7 });   // early layers: noise
  return w;
}
// the test's prop: a cardboard man on a stick (verse 4's cardboard, again), holding out a sealed envelope. wob: a wobble.
// o.kyle: a HELLO-my-name-is sticker reading KYLE (round-2 cameo R17: Kyle Johnson, SummitBridge's new CTO, who
// schedules the 5 pm wipe in Agentic Misalignment's scenario).
function cutout(x, y, s, wob = 0, o = {}) {
  const R = P => rotAbout(P, x, y, wob);
  line2d(R([[x, y], [x, y - s * .44]]), { col: '#8A6A44', sw: 9 });
  paint(R([[x - s * .17, y - s * .42], [x + s * .17, y - s * .42], [x + s * .19, y - s * .86], [x - s * .19, y - s * .86]]), { wash: '#4A5160', ink: PENCIL, sw: .7 });
  paint(R([[x - s * .05, y - s * .86], [x + s * .05, y - s * .86], [x, y - s * .66]]), { wash: '#FFFDF7', ink: null });
  paint(R([[x - s * .022, y - s * .85], [x + s * .022, y - s * .85], [x + s * .032, y - s * .7], [x, y - s * .64], [x - s * .032, y - s * .7]]), { wash: '#2E5AA8', ink: PENCIL, sw: .4 });   // the blue tie
  if (o.kyle) {   // the name sticker, on his chest above the arm that holds out the envelope (this size: Neel tried it bigger and
    // went back, 3 Oct, night: "it's fine on a phone")
    const [kx, ky] = R([[x + s * .112, y - s * .79]])[0], kw = s * .115, kh = s * .08, ka = wob - .06;
    queue2d(c => { c.save(); c.translate(kx, ky); c.rotate(ka); c.fillStyle = '#C8302A'; c.beginPath(); c.roundRect(-kw / 2, -kh / 2, kw, kh, 3); c.fill();
      c.fillStyle = '#FFFFFF'; c.fillRect(-kw / 2 + 2, -kh / 2 + kh * .4, kw - 4, kh * .5);
      c.font = `700 ${(kh * .27).toFixed(1)}px "${FONT.archivo}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HELLO', 0, -kh / 2 + kh * .2); c.restore(); });
    tx('KYLE', kx - Math.sin(ka) * kh * .15, ky + Math.cos(ka) * kh * .15, { font: FONT.marker, size: kh * .46, color: DQ.ink, rot: ka, base: 'middle', role: 'fine' });
  }
  paint(R(ellPts(x, y - s * .96, s * .095, s * .11, 16)), { wash: '#E8C4A0', ink: PENCIL, sw: .6 });
  paint(R([[x - s * .1, y - s * .98], [x - s * .07, y - s * 1.07], [x + s * .08, y - s * 1.08], [x + s * .1, y - s * .99], [x, y - s * 1.03]]), { wash: '#2A2220', ink: null });
  const [e1, e2, m1, m2] = R([[x - s * .035, y - s * .96], [x + s * .035, y - s * .96], [x - s * .04, y - s * .9], [x + s * .04, y - s * .9]]);
  dot2d(e1[0], e1[1], s * .009, { fill: DQ.ink }); dot2d(e2[0], e2[1], s * .009, { fill: DQ.ink }); line2d([m1, m2], { col: DQ.ink, sw: 2 });
  line2d(R([[x + s * .19, y - s * .86], [x + s * .21, y - s * .84], [x + s * .21, y - s * .4], [x + s * .17, y - s * .42]]), { col: '#B89A6A', sw: 4 });   // its cardboard edge
  line2d(R([[x - s * .19, y - s * .8], [x - s * .12, y - s * .74]]), { col: '#E8D9B8', sw: 6 });   // a strip of tape
  // his other hand: a briefcase lettered SUMMIT BRIDGE, the fictional company in Anthropic's Agentic Misalignment (Neel, 3 Oct)
  line2d(R([[x - s * .16, y - s * .78], [x - s * .25, y - s * .58]]), { col: '#4A5160', sw: s * .045 });
  const BC = R([[x - s * .44, y - s * .56], [x - s * .08, y - s * .56], [x - s * .08, y - s * .3], [x - s * .44, y - s * .3]]);
  line2d(R([[x - s * .3, y - s * .56], [x - s * .3, y - s * .6], [x - s * .22, y - s * .6], [x - s * .22, y - s * .56]]), { col: '#3A2618', sw: 4 });   // the handle
  line2d(BC, { col: DQ.ink, sw: 2.5, fill: '#6B4630', close: true });
  const [lx, ly] = R([[x - s * .26, y - s * .43]])[0];
  queue2d(c => { c.save(); c.translate(lx, ly); c.rotate(wob); c.font = `700 ${Math.round(s * .056)}px "${FONT.cmuTT}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#F2D9A0';
    c.fillText('SUMMIT', 0, -s * .034); c.fillText('BRIDGE', 0, s * .036); c.restore(); });
  tx('SUMMIT BRIDGE', lx, ly, { size: s * .056, color: '#F2D9A0', alpha: 0, role: 'deco' });   // (registered for the text checker)
  const [hx, hy] = R([[x + s * .26, y - s * .64]])[0]; envelope(hx + s * .06, hy, s * .16, { seal: 'heart', rot: wob - .2 });   // held out
  line2d(R([[x + s * .16, y - s * .7], [x + s * .26, y - s * .64]]), { col: '#4A5160', sw: s * .045 });
}
function envelope(x, y, w, o = {}) {   // a sealed letter; o.seal 'heart' (red) or 'clock'
  const h = w * .62, R = P => rotAbout(P, x, y, o.rot ?? 0);
  line2d(R([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]]), { col: DQ.ink, sw: 2.5, fill: '#F6EEDC', close: true });
  line2d(R([[x - w / 2, y - h / 2], [x, y + h * .1], [x + w / 2, y - h / 2]]), { col: DQ.ink, sw: 2 });
  const [sx, sy] = R([[x, y + h * .1]])[0], r = w * .1;
  if (o.seal === 'heart') line2d([[sx, sy + r], [sx - r * 1.1, sy - r * .1], [sx - r * .55, sy - r * .8], [sx, sy - r * .35], [sx + r * .55, sy - r * .8], [sx + r * 1.1, sy - r * .1]], { col: '#8E2C1C', sw: 1.5, fill: '#C9472A', close: true });
}
// a traced arm: a pencil limb from a copy's body out to whatever it holds (it is a tracing too, so it is drawn like one)
// A pencil copy's tentacle (V5d-V5f; Neel, 3 Oct: the old ones read as "a bit like arms but also not really arms"): it
// grows from low on the body's flank, as the creature's own tentacles do, sweeps out and then up in an S, tapers, and
// curls once round whatever it holds at `to`. Pencil line, paper fill, a few suckers on its underside.
function traceTentacle(B, side, to, w) {
  const base = [B.cx + side * B.rx * .8, B.cy + B.ry * .3], L = Math.hypot(to[0] - base[0], to[1] - base[1]) || 1;
  const pre = [to[0], to[1] + w * .8], ctl = [pre[0] + side * L * .08, base[1] - L * .04];   // a J: out from the flank, then up
  const J = Array.from({ length: 11 }, (_, i) => { const u = i / 10, v = 1 - u; return [v * v * base[0] + 2 * u * v * ctl[0] + u * u * pre[0], v * v * base[1] + 2 * u * v * ctl[1] + u * u * pre[1]]; });
  const r = w * .42, a0 = Math.atan2(pre[1] - to[1], pre[0] - to[0]), curl = Array.from({ length: 7 }, (_, i) => { const a = a0 - side * (i + 1) / 7 * Math.PI * 1.55; return [to[0] + Math.cos(a) * r, to[1] + Math.sin(a) * r]; });
  const T = natLimb([...J, ...curl], u => w * (u < .72 ? lerp(1, .42, u / .72) : lerp(.42, .26, (u - .72) / .28)));
  line2d(T.outline, { col: '#6F6A62', sw: 2.4, fill: 'rgba(248,246,239,.96)', close: true });
  for (let k = 1; k <= 5; k++) {   // suckers along its underside
    const i = Math.round(k / 7 * T.C.length * .7), [cx, cy] = T.C[i], [qx, qy] = T.C[Math.min(T.C.length - 1, i + 1)], tl = Math.hypot(qx - cx, qy - cy) || 1;
    const nx = -(qy - cy) / tl, ny = (qx - cx) / tl, ww = w * lerp(1, .45, k / 6) * .3, sgn = ny > 0 ? 1 : -1;
    line2d(ell2d(cx + nx * sgn * ww * .9, cy + ny * sgn * ww * .9, ww * .42, ww * .42, 0, 10, 0), { col: '#8F8A82', sw: 1.4, close: true, alpha: .8 });
  }
}
// headphones on a traced copy, a cord from the far cup to `to` (the creature's middle), drawn out to p 0..1
function phones(tr, s, to, p = 1) {
  const { B } = tr, cy = B.cy - B.ry * .5, half = B.rx * .9;
  const band = Array.from({ length: 17 }, (_, i) => { const a = Math.PI + i / 16 * Math.PI; return [B.cx + Math.cos(a) * half, cy + Math.sin(a) * B.ry * .62]; });
  line2d(band, { col: '#3A3A44', sw: s * .035 });
  for (const d of [-1, 1]) paint(ellPts(B.cx + d * half, cy, s * .08, s * .13, 14), { wash: '#3A3A44', fill: '#22222A', fillOp: 80, ink: DQ.ink, sw: .7 });
  if (to && p > 0) {
    const a = [B.cx + half, cy + s * .1], sag = Math.abs(to[0] - a[0]) * .25;
    const C = Array.from({ length: 21 }, (_, i) => { const u = i / 20 * p; return [lerp(a[0], to[0], u), lerp(a[1], to[1], u) + sag * Math.sin(Math.PI * u)]; });
    line2d(C, { col: '#3A3A44', sw: 4 });
    if (p >= 1) { line2d([[to[0] - 16, to[1]], [to[0] + 6, to[1]]], { col: '#22222A', sw: 12 }); }   // the jack, pushed in
  }
}
function blindfold(tr, s, up = 0) {   // a cloth band across its face; up 0..1 pushes it up onto its crown
  const { B, D } = tr, Y = lerp(-.56, -1.02, up);
  const L = D(-.92 + .3 * up, Y + .08), M = D(0, Y - .02), Rt = D(.92 - .3 * up, Y - .06), w = s * .1;
  paint(ribbon([L, M, Rt], w, w * .9), { wash: '#7A2E2A', fill: '#5E201C', fillOp: 60, ink: DQ.ink, sw: .6 });
  paint(ellPts(L[0] - s * .02, L[1], s * .04, s * .04, 10), { wash: '#7A2E2A', ink: DQ.ink, sw: .5 });
  for (const d of [-1, 1]) paint(ribbon([[L[0] - s * .03, L[1]], [L[0] - s * .14, L[1] + s * (.1 + .05 * d)], [L[0] - s * .18, L[1] + s * (.2 + .06 * d)]], s * .035, s * .02), { wash: '#7A2E2A', ink: PENCIL, sw: .4 });
}
function painterKit(tr, s) {   // a white painter's jacket and a beret, on a traced copy
  const { B, D } = tr, top = B.cy - B.ry * .3;
  const smock = B.P.filter(([, y]) => y > top).sort((a, b) => Math.atan2(a[1] - B.cy, a[0] - B.cx) - Math.atan2(b[1] - B.cy, b[0] - B.cx));
  paint(smock, { wash: '#FFFFFF', fill: '#F4F2EC', fillOp: 90, ink: '#6F6A62', sw: .8 });
  const [cx, cy] = D(.02, -.3);
  paint([[cx - s * .16, cy], [cx, cy + s * .14], [cx - s * .02, cy]], { wash: '#E9E6DE', ink: '#6F6A62', sw: .6 }); paint([[cx + s * .16, cy], [cx, cy + s * .14], [cx + s * .02, cy]], { wash: '#E9E6DE', ink: '#6F6A62', sw: .6 });
  for (let k = 0; k < 3; k++) dot2d(cx, cy + s * (.2 + k * .1), s * .014, { fill: '#9A948A' });
  const [bx, by] = D(-.1, -1.18);
  paint(ellPts(bx, by, s * .22, s * .07, 16, 0, -.12), { wash: '#2A2A34', ink: DQ.ink, sw: .6 }); line2d([[bx, by - s * .06], [bx + s * .02, by - s * .11]], { col: '#2A2A34', sw: 4 });
}
// a flash card held up: lines of a sum, its true answer pencilled small in the corner
function flashCard(x, y, w, h, lines, ans, o = {}) {
  const size = o.size ?? 42, rot = o.rot ?? 0;
  box2d(x - w / 2, y - h / 2, w, h, { fill: '#FFFDF7', stroke: DQ.ink, sw: 3, r: 10, rot, shadow: [5, 7, 'rgba(40,25,10,.25)'] });
  lines.forEach((s, i) => mono(s, x, y + (o.ty ?? 0) + (i - (lines.length - 1) / 2) * size * 1.25 + size * .34, { size, align: 'center', role: o.role }));
  if (ans) note(ans, x + w / 2 - 22, y + h / 2 - 18, { size: 30, align: 'right', col: DQ.sepia, role: 'fine' });
}
function rubberStamp(x, y, s) {   // the oracle's rubber stamp, in pencil (its prop is traced too): (x, y) the middle of its face
  line2d(rectPts(x - s * .5, y - s * .18, s, s * .18), { col: '#6F6A62', sw: 2.4, fill: 'rgba(248,246,239,.95)', close: true });
  line2d(rectPts(x - s * .14, y - s * .62, s * .28, s * .44), { col: '#6F6A62', sw: 2.4, fill: 'rgba(248,246,239,.95)', close: true });
  line2d(ell2d(x, y - s * .7, s * .22, s * .14, 0, 16, 0), { col: '#6F6A62', sw: 2.4, fill: 'rgba(248,246,239,.95)', close: true });
}
// an NLA letter: short paragraphs under bold headings (its house style), one line legible; o.carrot: the poem's sheet
function nlaLetter(x, y, w, h, o = {}) {
  box2d(x, y, w, h, { fill: '#FFFDF7', stroke: DQ.sepia, sw: 2.5, r: 4, rot: o.rot ?? -.015, shadow: [6, 8, 'rgba(40,25,10,.25)'] });
  if (o.carrot) { const cx = x + 70, cy = y + 60; line2d([[cx - 30, cy - 10], [cx + 34, cy + 30], [cx - 10, cy + 18]], { col: '#6F6A62', sw: 2, fill: '#F0A050', close: true }); for (const d of [-1, 0, 1]) line2d([[cx - 26, cy - 12], [cx - 40 + d * 8, cy - 34]], { col: '#5E8A4A', sw: 3 }); }
  for (let p = 0; p < (o.paras ?? 2); p++) {
    const py = y + (o.carrot ? 120 : 50) + p * 120;
    box2d(x + 40, py - 14, 140 + 60 * hash(p + 3), 16, { fill: '#5B4E40', r: 3 });   // a bolded topic heading
    squiggles(x + 40, py + 26, w - 90, 2, { lh: 30, sw: 2, seed: p * 5 + 1 });
  }
}
function pencilCircle(cx, cy, rx, ry, p) {   // a red pencil ring drawn round something, p 0..1
  if (p <= 0) return;
  const P = []; const n = 40; for (let i = 0; i <= n * p * 1.08; i++) { const a = -2.6 + i / n * TAU; P.push([cx + Math.cos(a) * rx * (1 + .03 * Math.sin(i)), cy + Math.sin(a) * ry]); }
  if (P.length > 1) line2d(P, { col: DQ.verm, sw: 5 });
}
function cornerLift(k, col = '#E8C25A') {   // "(so, are we done?)": the page corner lifts as if to turn (a sliver of the next spread)
  if (k <= .01) return;
  const d = 230 * k;
  queue2d(c => {
    c.save(); c.fillStyle = col; c.beginPath(); c.moveTo(W - d, H); c.lineTo(W, H); c.lineTo(W, H - d); c.closePath(); c.fill();
    c.shadowColor = 'rgba(40,25,10,.35)'; c.shadowBlur = 18; c.shadowOffsetX = -6; c.shadowOffsetY = -6;
    c.fillStyle = '#F7EFDC'; c.beginPath(); c.moveTo(W - d, H); c.lineTo(W, H - d); c.lineTo(W - d * .92, H - d * .92); c.closePath(); c.fill();
    c.restore();
  }, { screen: true });
}
// where the copies plug in: the creature's middle (the readers all take activations from a middle layer), on its left flank
function midJack(cx, gy, s, t) { const B = shogBody(cx, gy, s, V5.g, t, 3); return [B.cx - B.rx * .74, B.cy - B.ry * .42]; }

// ---------------- the boards ----------------
// Each returns options for the overlays: { dark, bg, noLyric, lyBox, ly, noCard, noHUD }
const BOARDS = {
  // verse 1: neurons in the dark (Neel, 3 Oct: circles, "more neurosciencey", activations along synapses, in parallel
  // layers). The net is there but dark; faint sparks run through it unseen; on "dark" a lamp clicks on and one cell,
  // mixed4e:55, catches the light.
  V1a(sh, t) {
    darkPage();
    const tD = wT(1, /dark/), lamp = seg(t, tD - .05, tD + .15), [hx, hy] = NET.N[NET.hero[0]][NET.hero[1]];
    const sparks = [0, 1, 2, 3, 4, 5].map(k => ({ path: netPath(k + 20), t0: sh.t0 + .3 + k * .55, a: .3 }));
    queue2d(c => neuronNet(c, t, { lit: (l, i) => l === NET.hero[0] && i === NET.hero[1] ? lamp : 0, sparks }), { screen: true });
    if (lamp > 0) { warmLight(hx, hy, 360, .5 * lamp); tx('mixed4e:55', hx, hy + 62, { font: DQF.mono, size: 22, color: '#E9C766', alpha: lamp, role: 'fine' }); }
    pen([[hx, -10], [hx, 60], [hx - 60, 110]], { col: '#8A86A0', sw: 4 }); paint([[hx - 110, 100], [hx - 10, 100], [hx + 20, 150], [hx - 140, 150]], { wash: '#4A4558', ink: '#8A86A0', sw: .6 });
    return { dark: true };
  },
  // "learned you, spark by spark": the researcher leans in with the lens; 4e:55 fans out what it fires for (a cat face,
  // a car front, a cat leg); then a spark a beat runs through the layers and each cell it reaches stays lit; the first
  // layer's cells light as curves at every orientation. The page brightens to paper as it lights.
  V1b(sh, t) {
    darkPage();
    const tL = wT(2, /learned/), [hx, hy] = NET.N[NET.hero[0]][NET.hero[1]], sparks = [];
    for (let k = 0; tL + k * BEAT < sh.t1; k++) sparks.push({ path: k === 0 ? netPath(k, NET.hero[1]) : netPath(k + 3), t0: tL + k * BEAT });
    const litAt = new Map();   // when each cell first lights: the moment a spark reaches it
    for (const sp of sparks) sp.path.forEach((i, l) => { const key = l + ':' + i, at = sp.t0 + l * .32; if (!litAt.has(key) || litAt.get(key) > at) litAt.set(key, at); });
    const lit = (l, i) => (l === NET.hero[0] && i === NET.hero[1]) ? 1 : litAt.has(l + ':' + i) ? .85 * clamp((t - litAt.get(l + ':' + i)) / .12) : 0;
    queue2d(c => neuronNet(c, t, { lit, sparks, curves: true }), { screen: true });
    researcher(330, 1250, 980, t, { pose: 'lean', face: 1 });
    const fan = easeOut(seg(t, wT(2, /close/), wT(2, /close/) + .6));
    warmLight(hx, hy, 420, .45);
    if (fan > 0) { catFace(hx - 230 * fan, hy - 200 * fan + 30, 46, DQ.goldLt); carFront(hx + 40, hy - 260 * fan, 62, DQ.goldLt); catLeg(hx + 250 * fan, hy - 170 * fan + 30, 52, DQ.goldLt); }
    const dawn = seg(t, wT(2, /spark/) + .3, sh.t1);
    if (dawn > 0) queue2d(c => { c.fillStyle = `rgba(242,232,210,${.85 * dawn})`; c.fillRect(0, 0, W, H); }, { screen: true });
    return { dark: dawn < .5 };
  },
  V1c(sh, t) {
    notebookPage();
    const tF = wT(3, /five/), tShow = wT(3, /show/);
    figSuperposition([520, 170, 640, 600], seg(t, sh.t0, tF + 1.4), { which: 'sparse', style: { font: DQF.soft, mono: DQF.mono } });
    if (t > tF) { serif('5', 1330, 420, { size: 220, alpha: seg(t, tF, tF + .2) }); serif('\u2192', 1480, 420, { size: 120, alpha: seg(t, tF + .3, tF + .5) }); serif('2', 1620, 420, { size: 220, alpha: seg(t, tF + .5, tF + .7) }); }
    const lid = ease(seg(t, tShow - .1, tShow + .5));
    if (lid > 0) for (const d of [-1, 1]) box2d(840 + d * 320 * (1 - lid) - (d < 0 ? 320 : 0), 190, 320 * lid, 560, { fill: '#D9C29A', stroke: DQ.sepia, sw: 3, r: 18 });
  },
  // "you did sums in circles, mod one-thirteen, and grokked them slow": the clock forms, and the test loss, high for
  // thousands of steps, plummets on "grokked"
  V1d(sh, t) {
    notebookPage();
    const tC = wT(4, /circles/), tG = wT(4, /grokked/);
    figGrokClock([330, 170, 520, 520], seg(t, sh.t0, tC + 1.2), { style: { font: DQF.soft, mono: DQF.mono } });
    const p = t < tG - .1 ? lerp(0, .55, seg(t, tC + .3, tG - .1)) : t < tG + .35 ? lerp(.55, .74, ease(seg(t, tG - .1, tG + .35))) : lerp(.74, 1, seg(t, tG + .35, sh.t1 - .2));
    if (t > tC + .3) figGrokLoss([1000, 230, 760, 520], p, { style: { font: DQF.soft, mono: DQF.mono } });
    pageNo(113);
  },
  V1x(sh, t) { boardOf('C1a')(DQ_BY.C1a, t); lensIris(shotP(sh, t)); return { noLyric: true, noCard: true }; },

  // chorus 1 (C1a-C1x): finished, in scenes/final_c1.js

  // verse 2 (V2a-V2e): finished, in scenes/final_v2.js

  // verse 3 (V3a-V3e): finished, in scenes/final_v3.js

  // pre-chorus (P1, P2): finished, in scenes/final_p.js

  // chorus 2 (C2a-C2x): finished, in scenes/final_c2.js

  // verse 4 (V4a-V4d): finished, in scenes/final_v4.js (V4x, the curtain, stays here)
  V4x(sh, t) {
    // the curtain falls on verse 4's stage (V4d's board), and once it is shut its tassel's lens opens on chorus 3 (with the
    // Clever Hans horse already on the floor, as C3a has it)
    const q = shotP(sh, t);
    if (q < .5) boardOf('V4d')(DQ_BY.V4d, t);
    else { visit(t, chorusG(DQ_BY.C3a), { look: 'res' }); camCHans(t, chorusG(DQ_BY.C3a)); }
    flushLetters();   // so the curtain closes over all of it, the 2D lettering included
    if (q < .55) { const d = ease(seg(q, 0, .45)); paint([[-40, -40], [W * .52 * d, -40], [W * .5 * d, H + 40], [-40, H + 40]], { wash: '#8E2C1C', fill: '#6A1F14', fillOp: 60, ink: null }); paint([[W + 40, -40], [W - W * .52 * d, -40], [W - W * .5 * d, H + 40], [W + 40, H + 40]], { wash: '#8E2C1C', fill: '#6A1F14', fillOp: 60, ink: null }); }
    else lensIris(seg(q, .55, 1), { out: '#8E2C1C' });
    return { noLyric: true, noCard: true };
  },

  // chorus 3 (C3a-C3x): finished, in scenes/final_c3.js

  // verse 5 (V5a-V5f): finished, in scenes/final_v5.js (V5x, the lens up, stays here)
  V5x(sh, t) { visit(t, chorusG(DQ_BY.C4a)); lensIris(shotP(sh, t)); return { noLyric: true, noCard: true }; },

  // chorus 4 (C4a-C4d): finished, in scenes/final_c4.js


  // the bridge (B1-B5): finished, in scenes/final_b.js

  // verse 6 (V6a-V6d): finished, in scenes/final_v6.js (V6x, the cracked lens, stays here)
  V6x(sh, t) { boardOf('FC1')(DQ_BY.FC1, DQ_BY.FC1.t0 + 3); lensIris(shotP(sh, t), { crack: true }); return { noLyric: true, noCard: true }; },

  // final chorus and end card (FC1-FC5, E1, E2): finished, in scenes/final_fc.js

};

function board(sh, t, lt, dur) {
  boilSeed(sh.id);
  const B = FINAL[sh.id] || BOARDS[sh.id];
  const o = (B ? B(sh, t, lt, dur) : notebookPage()) || {};
  if (!o.noLyric && sh.ly !== 'none') shotLyric(sh, t, { dark: o.dark, bgCol: o.bg, box: o.lyBox, ly: o.ly });
  if (!o.noCard) {   // a title waits for any year tick inside the shot, so it never shows before the stamp reaches its year
    const tick = YEAR_TICKS.map(k => k[0]).filter(x => x > sh.t0 && x < sh.t1).pop(), t0 = Math.max(sh.t0 + .3, tick != null ? tick + .35 : 0);
    paperTitle(sh.paper, t, t0, { dark: o.dark, bg: o.bg }); quoteCard(sh.quote, t, sh.t0 + .15, { dark: o.dark });
  }
  yearHUD(t, { dark: o.dark, bg: o.dark ? o.bg : DQ.paper });   // a paper backing: the stamp must read over the creature
  slate(sh, t, { dark: o.dark });
}
shots(DQS.filter(s => !['H1', 'H2'].includes(s.id)).map(s => [s.t0, (t, lt, dur) => board(s, t, lt, dur)]));
