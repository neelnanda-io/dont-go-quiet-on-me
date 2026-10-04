// figures.js: redrawn interp figures from REAL data (src/data/figures.js, made by tools/figures_js.py from data/figures).
//
// Each component draws into a box [x, y, w, h] as a pure function of a reveal progress p (0..1) plus options, so a shot
// can drive it from t however it likes (seg(t, a, b), a beat count, a word onset...). Colours and fonts come from a
// style object (FIGSTYLE by default), so the look chosen at the video checkpoint can reskin every figure at once.
// Every figure can draw its honest claim and credit line (data/figures/README.md, "What can honestly go on screen"):
// pass {credit: true}. Don't write other claims about these figures on screen without checking that README.

const FIGSTYLE = {
  ink: PAL.ink, paper: PAL.paper, muted: '#6E6458', grid: 'rgba(43,34,51,.14)',
  a: PAL.clayDk, b: PAL.indigo, c: PAL.teal, hi: PAL.ochre,
  font: 'outfit', mono: 'jbMono', title: 'archivoBlack', sw: 4,
};
const figSt = o => ({ ...FIGSTYLE, ...(o.style || {}) });
// Percent label that never rounds a near-certainty up to "100%" (or a near-zero down to "0%").
const pct = v => v >= .995 && v < 1 ? `${(Math.floor(v * 1000) / 10).toFixed(1)}%` : v > 0 && v < .005 ? '<1%' : `${Math.round(v * 100)}%`;
// Map a data range onto a box edge.
const scaleLin = (d0, d1, r0, r1) => v => r0 + (v - d0) / (d1 - d0) * (r1 - r0);
// Interpolate between the frames of an array-of-frames at progress p (arrays of numbers or nested arrays).
function frameAt(frames, p) {
  const x = clamp(p) * (frames.length - 1), i = Math.min(frames.length - 2, Math.floor(x)), k = x - i;
  if (frames.length < 2) return frames[0];
  const mix = (a, b) => Array.isArray(a) ? a.map((v, j) => mix(v, b[j])) : lerp(a, b, k);
  return mix(frames[i], frames[i + 1]);
}
function figCredit(box, st, fig, o, dy = 40) {
  if (!o.credit) return;
  const [x, y, w, h] = box, y0 = y + h + (o.creditDy ?? dy);
  tx(fig.claim, x, y0, { font: st.font, weight: 500, size: 22, color: st.muted, align: 'left', role: 'fine' });
  tx(fig.credit, x, y0 + 28, { font: st.font, style: 'italic', size: 20, color: st.muted, align: 'left', role: 'fine' });
}
// Polyline of (xs[i], ys[i]) up to data-x `upto`, with the last segment interpolated so lines grow smoothly.
function growLine(xs, ys, upto, X, Y, o) {
  const pts = [];
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] <= upto) { pts.push([X(xs[i]), Y(ys[i])]); continue; }
    if (i > 0) { const k = (upto - xs[i - 1]) / (xs[i] - xs[i - 1]); pts.push([X(upto), Y(lerp(ys[i - 1], ys[i], k))]); }
    break;
  }
  if (pts.length > 1) line2d(pts, o);
  return pts[pts.length - 1];
}

// ---------- grokking ----------
// Train vs test accuracy over training. p reveals steps left to right; annotations appear as the reveal passes them.
function figGrokCurves(box, p, o = {}) {
  const st = figSt(o), G = FIG.grok, C = G.curves, [x, y, w, h] = box, maxS = C.step[C.step.length - 1];
  const X = scaleLin(0, maxS, x, x + w), Y = scaleLin(0, 1, y + h, y), upto = p * maxS;
  line2d([[x, y + h], [x + w, y + h]], { col: st.ink, sw: 3 }); line2d([[x, y], [x, y + h]], { col: st.ink, sw: 3 });
  for (const v of [0, .5, 1]) { tx(`${v * 100}%`, x - 14, Y(v), { font: st.mono, size: 22, color: st.muted, align: 'right', base: 'middle', role: 'fine' }); if (v) line2d([[x, Y(v)], [x + w, Y(v)]], { col: st.grid, sw: 1.5 }); }
  for (const s of [0, 5000, 10000]) tx(s ? `${s / 1000}k` : '0', X(s), y + h + 30, { font: st.mono, size: 22, color: st.muted, role: 'fine' });
  tx('training step', x + w / 2, y + h + 62, { font: st.font, size: 22, color: st.muted, role: 'fine' });
  const tr = growLine(C.step, C.train_acc, upto, X, Y, { col: st.b, sw: st.sw }), te = growLine(C.step, C.test_acc, upto, X, Y, { col: st.a, sw: st.sw + 1 });
  if (tr) tx('train', tr[0] + 12, tr[1] - 16, { font: st.font, weight: 700, size: 26, color: st.b, align: 'left', role: 'label' });
  if (te) tx('test', te[0] + 12, te[1] + 30, { font: st.font, weight: 700, size: 26, color: st.a, align: 'left', role: 'label' });
  const S = G.summary, ann = (step, txt, yy, col) => {
    const k = clamp((upto - step) / (maxS * .06)); if (k <= 0) return;
    line2d([[X(step), Y(yy) - 8], [X(step), Y(yy) - 34]], { col, sw: 2.5, alpha: k });
    tx(txt, X(step), Y(yy) - 44, { font: st.font, weight: 700, size: 26, color: col, alpha: k, align: step < maxS * .1 ? 'left' : 'center', role: 'label' });
  };
  if (o.annotate !== false) { ann(S.train_acc_first_100pct_step, 'memorised', 1, st.b); ann(S.test_acc_first_ge_99pct_step, 'grokked!', 1, st.a); }
  figCredit(box, st, G, o, 100);
}
// Train vs test LOSS over training, log scale (Neel, 3 Oct: "do a loss curve, not accuracy, I want the drama of plummeting
// loss"): train falls to nothing at once; test climbs, sits high for thousands of steps, then plummets. p = the reveal, as
// a fraction of the steps shown (maxS). Minimal text: the two line labels.
// Where the loss rests once it is below the data's stored precision (the run's logs round it to 0 under 1e-5), as a
// fraction of the log axis. Never on the axis (Neel, 3 Oct), train below test; and as the grokking paper's log plots show
// it, train keeps sinking slowly after memorising, then dips further while the model groks (the test cliff, steps
// ~5000-7400), ending a hair above the axis (Neel, 3 Oct, late: "from very near the x-axis to extremely"). Used by the
// loss plot here and by the 2022 page of the opening riffle (dgq/props.js GLIMPSE.grokking).
function grokFloor(key, step) {
  if (key === 'test_loss') return .03;
  return lerp(lerp(.05, .036, clamp((step - 1000) / 4200)), .007, ease(clamp((step - 5000) / 2400)));
}
function figGrokLoss(box, p, o = {}) {
  const st = figSt(o), C = FIG.grok.curves, [x, y, w, h] = box, maxS = o.maxS ?? 10000, lo = Math.log(1e-4), hi = Math.log(40);
  const X = scaleLin(0, maxS, x, x + w), upto = clamp(p) * maxS;
  const Y = (v, key, s) => y + h * (1 - Math.max(grokFloor(key, s), (Math.log(Math.max(v, 1e-12)) - lo) / (hi - lo)));
  line2d([[x, y], [x, y + h], [x + w, y + h]], { col: st.ink, sw: 3 });
  const n = C.step.findIndex(s => s > maxS), steps = C.step.slice(0, n < 0 ? undefined : n);
  const grow = key => { const pts = []; for (let i = 0; i < steps.length; i++) { if (steps[i] > upto) { if (i) { const k = (upto - steps[i - 1]) / (steps[i] - steps[i - 1]); pts.push([X(upto), lerp(Y(C[key][i - 1], key, steps[i - 1]), Y(C[key][i], key, steps[i]), k)]); } break; } pts.push([X(steps[i]), Y(C[key][i], key, steps[i])]); } return pts; };
  const tr = grow('train_loss'), te = grow('test_loss');
  if (tr.length > 1) line2d(tr, { col: st.b, sw: st.sw });
  if (te.length > 1) line2d(te, { col: st.a, sw: st.sw + 2 });
  const lab = (P, s, dy, col) => { const [ex, ey] = P[P.length - 1], edge = ex > x + w - 90; tx(s, edge ? ex - 10 : ex + 12, ey + dy, { font: st.font, weight: 700, size: 26, color: col, align: edge ? 'right' : 'left', role: 'label' }); };
  if (tr.length > 1) lab(tr, 'train', 48, st.b);   // below its tip, clear of the axis it runs along ('test' above its own: they start together)
  if (te.length > 1) lab(te, 'test', -16, st.a);
}
// The embedding circle for frequency 1: a noisy blob that becomes a clock face (numbers in order). p = training progress.
function figGrokClock(box, p, o = {}) {
  const st = figSt(o), K = FIG.grok.clock, [x, y, w, h] = box, cx = x + w / 2, cy = y + h / 2;
  const fin = K.xy[K.xy.length - 1], R = Math.max(...fin.map(([a, b]) => Math.hypot(a, b))), sc = Math.min(w, h) * .42 / R;
  const xy = frameAt(K.xy, p), n = xy.length;
  for (let a = 0; a < n; a++) {
    const [u, v] = xy[a];
    dot2d(cx + u * sc, cy - v * sc, a % 10 === 0 ? 9 : 6, { fill: a === 0 ? st.a : mixCol(st.b, st.c, a / n) });
  }
  const k = seg(p, .85, 1);
  if (k > 0) for (const a of [0, 28, 56, 85]) {   // label a few numbers once the clock has formed
    const [u, v] = fin[a], d = Math.hypot(u, v) || 1;
    tx(String(a), cx + u * sc + u / d * 40, cy - v * sc - v / d * 40, { font: st.mono, weight: 700, size: 28, color: st.ink, alpha: k, base: 'middle', role: 'label' });
  }
  if (o.steps) tx(`step ${Math.round(frameAt(K.steps, p)).toLocaleString('en')}`, x + w / 2, y + h + 36, { font: st.mono, size: 22, color: st.muted, role: 'fine' });   // off by default (Neel: "remove unnecessary details like step count on the circle")
  figCredit(box, st, FIG.grok, o, 76);
}
// Embedding norm per Fourier frequency: flat at init, four spikes at the end (the key frequencies).
function figGrokFourier(box, p, o = {}) {
  const st = figSt(o), F = FIG.grok.fourier, [x, y, w, h] = box, norms = frameAt(F.norms, p), key = FIG.grok.summary.key_frequencies;
  const mx = Math.max(...F.norms[F.norms.length - 1]), bw = w / norms.length;
  line2d([[x, y + h], [x + w, y + h]], { col: st.ink, sw: 3 });
  norms.forEach((v, i) => {
    const f = F.freqs[i], isKey = key.includes(f), bh = h * clamp(v / mx);
    box2d(x + i * bw + bw * .12, y + h - bh, bw * .76, bh, { fill: isKey ? st.a : st.b, alpha: isKey ? 1 : .55 });
    if (isKey && p > .7) tx(String(f), x + (i + .5) * bw, y + h + 30, { font: st.mono, weight: 700, size: 28, color: st.a, alpha: seg(p, .7, .85), role: 'label' });
  });
  tx('frequency', x + w, y + h + 58, { font: st.font, size: 22, color: st.muted, align: 'right', role: 'fine' });
  figCredit(box, st, FIG.grok, o, 96);
}

// ---------- superposition ----------
// Five features as arrows in 2 dimensions over training. which: 'sparse' (-> pentagon) or 'dense' (-> two orthogonal).
function figSuperposition(box, p, o = {}) {
  const st = figSt(o), S = FIG.sup[o.which || 'sparse'], [x, y, w, h] = box, cx = x + w / 2, cy = y + h / 2;
  const W2 = frameAt(S.frames, p), R = Math.min(w, h) * .4 / 1.2;
  line2d(Array.from({ length: 61 }, (_, i) => [cx + Math.cos(i / 60 * TAU) * R, cy + Math.sin(i / 60 * TAU) * R]), { col: st.grid, sw: 2, dash: [6, 8] });
  const cols = [st.a, st.b, st.c, st.hi, PAL.rose];
  W2.forEach(([u, v], i) => {
    const ex = cx + u * R, ey = cy - v * R, len = Math.hypot(ex - cx, ey - cy); if (len < 3) return;
    const ang = Math.atan2(ey - cy, ex - cx), hd = 22;
    line2d([[cx, cy], [ex, ey]], { col: cols[i], sw: st.sw + 2 });
    line2d([[ex + Math.cos(ang + 2.6) * hd, ey + Math.sin(ang + 2.6) * hd], [ex, ey], [ex + Math.cos(ang - 2.6) * hd, ey + Math.sin(ang - 2.6) * hd]], { col: cols[i], sw: st.sw + 2 });
  });
  if ((o.which || 'sparse') === 'sparse' && p > .8) {   // join the tips in angular order: the pentagon
    const tips = W2.map(([u, v]) => [cx + u * R, cy - v * R]).sort((A, B) => Math.atan2(A[1] - cy, A[0] - cx) - Math.atan2(B[1] - cy, B[0] - cx));
    line2d(tips, { col: st.ink, sw: 2.5, dash: [10, 8], close: true, alpha: seg(p, .8, .95) });
  }
  tx(`${S.p === 1 ? 'dense' : 'sparse'} inputs`, cx, y + h + 30, {   // (not "features": Neel, 3 Oct, late)
    font: st.font, weight: 600, size: 28, color: st.muted, role: 'label' });
  figCredit(box, st, FIG.sup, o, 70);
}

// ---------- induction ----------
// A 60x60 attention pattern (query rows, key columns). p reveals rows top to bottom. which: 'ind' (L5H5) or 'prev' (L4H11).
function figInduction(box, p, o = {}) {
  const st = figSt(o), I = FIG.ind, P = o.which === 'prev' ? I.prev_pattern : I.pattern, n = P.length, [x, y, w, h] = box, c = Math.min(w, h) / n;
  box2d(x, y, c * n, c * n, { fill: st.paper, stroke: st.ink, sw: 2 });
  const rows = Math.floor(clamp(p) * n);
  queue2d(ctx => {   // one draw op for 3,600 cells (far cheaper than 3,600 queued boxes)
    ctx.save(); ctx.fillStyle = o.which === 'prev' ? st.b : st.a;
    for (let i = 0; i < rows; i++) for (let j = 0; j <= i; j++) { const v = P[i][j]; if (v < .02) continue; ctx.globalAlpha = clamp(v * 1.4); ctx.fillRect(x + j * c, y + i * c, c + .5, c + .5); }
    ctx.restore();
  });
  tx(o.which === 'prev' ? I.prev_head : I.head, x + c * n, y - 16, { font: st.mono, weight: 700, size: 26, color: st.ink, align: 'right', role: 'label' });
  tx('attends to →', x, y - 16, { font: st.font, size: 22, color: st.muted, align: 'left', role: 'fine' });
  figCredit([x, y, c * n, c * n], st, I, o);
}

// ---------- refusal ----------
// Harmful vs harmless prompts on the refusal direction (dots only: prompt texts are never exported).
// o.ablate 0..1 slides every harmful point onto the harmless side (directional ablation); o.add 0..1 pushes harmless right.
function figRefusal(box, p, o = {}) {
  const st = figSt(o), F = FIG.ref, [x, y, w, h] = box, all = [...F.points.harmful.x, ...F.points.harmless.x];
  const xmin = Math.min(...all) - 4, xmax = Math.max(...all) + 4 + (o.add ? F.r_norm : 0);
  const ys = [...F.points.harmful.y, ...F.points.harmless.y], ymax = Math.max(...ys.map(Math.abs)) + 2;
  const X = scaleLin(xmin, xmax, x, x + w), Y = scaleLin(-ymax, ymax, y + h, y);
  const shown = n => Math.floor(clamp(p) * n);
  const draw = (pts, col, dx) => { for (let i = 0; i < shown(pts.x.length); i++) { const k = dx(i); dot2d(X(pts.x[i] + k), Y(pts.y[i]), 7, { fill: col, alpha: .8 }); } };
  const stag = i => clamp((o.ablate || 0) * 1.6 - hash(i) * .6);   // staggered, so the cloud flows rather than jumps
  draw(F.points.harmless, st.b, i => (o.add || 0) * F.r_norm);
  draw(F.points.harmful, st.a, i => (F.ablation_target_x - F.points.harmful.x[i]) * ease(stag(i)));
  line2d([[X(xmin + 2), y + h + 24], [X(xmax - 2), y + h + 24]], { col: st.ink, sw: 3 });
  line2d([[X(xmax - 2) - 16, y + h + 14], [X(xmax - 2), y + h + 24], [X(xmax - 2) - 16, y + h + 34]], { col: st.ink, sw: 3 });
  tx('refusal direction', X(xmax - 2), y + h + 62, { font: st.font, weight: 600, size: 28, color: st.ink, align: 'right', role: 'label' });
  tx('harmful', X(F.mean_harmful[0]), y - 12, { font: st.font, weight: 700, size: 26, color: st.a, role: 'label' });
  tx('harmless', X(F.mean_harmless[0]), y - 12, { font: st.font, weight: 700, size: 26, color: st.b, role: 'label' });
  figCredit(box, st, F, o, 104);
}

// ---------- logit lens ----------
// Decode the residual stream after each layer: the top guess at the last token of the IOI prompt. p reveals layers.
function figLogitLens(box, p, o = {}) {
  const st = figSt(o), L = FIG.lens, rows = L.depths.slice(1), [x, y, w, h] = box, rh = h / rows.length, n = Math.ceil(clamp(p) * rows.length);
  const labO = { font: st.mono, size: 22 }, tokO = { font: st.title, size: Math.min(40, rh * .7) };
  const labW = Math.max(...rows.map(d => measure(d.label.replace(' (model output)', ''), labO).w));
  const tokW = Math.max(...rows.map(d => measure(d.top[0].token.trim(), tokO).w));
  const lx = x + labW + 28 + tokW + 18, barW = Math.max(60, x + w - lx - 90);
  if (o.prompt !== false) {
    tx(L.prompt.replace(/\s+$/, '') + ' …?', x, y - 40, { font: st.font, weight: 600, size: 30, color: st.ink, align: 'left', role: 'label', maxW: w });
  }
  rows.slice(0, n).forEach((d, i) => {
    const yy = y + i * rh + rh / 2, top = d.top[0], isAns = top.token.trim() === L.answer.trim(), k = i === n - 1 ? seg(p * rows.length - i, 0, .6) : 1;
    tx(d.label.replace(' (model output)', ''), x, yy, { font: st.mono, size: 22, color: st.muted, align: 'left', base: 'middle', role: 'fine' });
    tx(top.token.trim(), x + labW + 28, yy, { ...tokO, color: isAns ? st.a : st.ink, align: 'left', base: 'middle', alpha: k, role: 'label' });
    box2d(lx, yy - rh * .28, barW * top.prob * k, rh * .56, { fill: isAns ? st.a : st.b, alpha: isAns ? 1 : .5 });
    tx(pct(top.prob), lx + barW * top.prob * k + 12, yy, { font: st.mono, weight: 700, size: 28, color: st.ink, align: 'left', base: 'middle', alpha: k, role: 'label' });
  });
  figCredit(box, st, L, o);
}

// A contact sheet of every figure at a given progress (studio.html?loop=figures, or render --loop=figures).
LOOPS.figures = t => {
  const p = clamp(t / 5);
  figGrokCurves([150, 150, 480, 270], p, { credit: true });
  figGrokClock([760, 90, 360, 360], p);
  figGrokFourier([1300, 150, 480, 270], p);
  figSuperposition([140, 580, 320, 320], p, { which: 'sparse' });
  figSuperposition([520, 580, 320, 320], p, { which: 'dense' });
  figInduction([930, 610, 300, 300], p);
  figRefusal([1320, 640, 460, 220], p, { ablate: seg(t, 5.5, 7) });
};
LOOPS.lens = t => figLogitLens([300, 140, 1320, 700], seg(t, 0, 2.5), { credit: true });
LOOPS.lens.len = 3;
LOOPS.figures.len = 10;
