// final_c3.js: Chorus 3, finished (129.73-145.03 s, stamped 2025): it looks back. The visit on the study floor
// (studySet), its eyes on her; C3b the reverse angle through her lens (its etching backwards); C3c every eye narrows at
// her and on "mine" she becomes SPECIMEN No. 1 (by its own count); C3d on "now" it stares at us.

// R16 (video/treatment/reference_bank_r2.md), Clever Hans: on the floor at its base, a wooden toy horse in a saddle
// blanket marked ©, facing her, a toy slate of sums beside it. Hans seemed to do sums but was reading his questioner
// (Pfungst, 1907), the way it reads her; ML's best-known Clever Hans was a horse classifier that read the © tag in the
// corner of horse photos (Lapuschkin et al. 2019, caught with LRP, which RelP builds on). On "mine" it taps a hoof once.
// Drawn wherever the chorus-3 wide is: C3a, C3c, C3d, C3x (V4x, which irises into this view, needs the same call).
function camCHans(t, g, o = {}) {
  const V = visitLayout(g), S = V.rh / 384 * .92, hx = 1265 + (V.rx - 991) * .2, hy = V.ry - 8, f = -1;   // facing left, at her
  const P = (u, v) => [hx + f * u * S, hy - v * S], Q = A => A.map(([u, v]) => P(u, v));
  const tR = o.tap ? wT(31, /read/) : Infinity, tM = o.tap ? wT(31, /mine/) : Infinity;
  const lift = o.tap ? .8 * (ease(seg(t, tR - .2, tR - .02)) - easeIn(seg(t, tM - .08, tM))) : 0;   // up on "read", down hard on "mine"
  flushLetters();   // over the creature's base and its eyes
  boilSeed('camCHans');
  const wood = { wash: '#C99F70', fill: '#8E6A44', fillOp: 40, bleed: .005, tex: .5, ink: DQ.ink, sw: .3 };
  const leg = (u, th, dark) => {   // a straight wooden leg from the body (v 45) to the hoof (v 2), swung forward by th
    const up = [-Math.sin(th), Math.cos(th)], n = [Math.cos(th) * 4, Math.sin(th) * 4], j = [u, 45], e = [u - 43 * up[0], 45 - 43 * up[1]], hc = [e[0] + 2.6 * up[0], e[1] + 2.6 * up[1]];
    paint(Q([[j[0] - n[0], j[1] - n[1]], [j[0] + n[0], j[1] + n[1]], [e[0] + n[0], e[1] + n[1]], [e[0] - n[0], e[1] - n[1]]]), { ...wood, wash: dark ? '#B48A5C' : '#C99F70' });
    line2d(Q([[hc[0] - n[0] * 1.15, hc[1] - n[1] * 1.15], [hc[0] + n[0] * 1.15, hc[1] + n[1] * 1.15]]), { col: '#3A2A1A', sw: 5 * S });   // its hoof
  };
  // the slate, propped against its flank
  const sl = Q([[-46, 30], [-82, 30], [-80, 2], [-44, 2]]);
  line2d(sl, { col: '#8E6A44', sw: 6 * S, fill: '#3A4044', close: true });
  tx('2+3', ...P(-63, 12), { font: DQF.hand, size: 19 * S, color: '#E8E4DA', align: 'center', rot: -.05, role: 'deco' });
  leg(14, 0, true); leg(-28, 0, true);   // the far legs
  paint(Q([[-31, 60], [-39, 53], [-45, 37], [-41, 34], [-36, 46], [-29, 54]]), { wash: '#5A3A22', ink: DQ.ink, sw: .25 });   // its yarn tail
  paint(Q([[-35, 50], [-32, 64], [0, 69], [22, 67], [33, 58], [31, 45], [0, 42], [-31, 44]]), wood);   // its body
  paint(Q([[18, 64], [33, 52], [48, 82], [35, 95]]), wood);   // its neck
  paint(Q([[31, 95], [37, 104], [52, 98], [63, 88], [61, 79], [53, 79], [44, 82]]), wood);   // its head
  paint(Q([[34, 101], [36, 113], [41, 103]]), wood);   // its ear
  inkLine(Q([[22, 66], [28, 78], [34, 92], [38, 104]]), 1.5, '#5A3A22', 'ink', .5);   // the mane
  dot2d(...P(47, 93), 2.6 * S, { fill: DQ.ink }); dot2d(...P(60, 84), 1.4 * S, { fill: '#5A3A22' });   // eye, nostril
  // the saddle blanket, marked ©
  paint(Q([[-15, 66], [13, 66], [15, 44], [-17, 44]]), { wash: '#B23A2A', fill: '#7E2418', fillOp: 40, bleed: .005, ink: DQ.ink, sw: .3 });
  line2d(Q([[-17, 46.5], [15, 46.5]]), { col: DQ.gold, sw: 3 * S });
  tx('©', ...P(-1, 50), { font: DQF.serif, size: 22 * S, color: '#FBF4E4', align: 'center', role: 'deco' });
  leg(-22, 0, false); leg(22, lift, false);   // the near legs: the front one taps
  if (o.tap && t > tM && t < tM + .3) { const k = 1 - seg(t, tM, tM + .3), [fx, fy] = P(22, 0);
    for (const a of [-2.4, -1.57, -.75]) line2d([[fx + Math.cos(a) * 9 * S, fy + Math.sin(a) * 9 * S + 4], [fx + Math.cos(a) * 19 * S, fy + Math.sin(a) * 19 * S + 4]], { col: '#F2E8D2', sw: 3, alpha: k }); }   // tap (light: it lands on the dark of its base)
  boilSeed('camCHans/after');
}

FINAL.C3a = (sh, t) => { visit(t, chorusG(sh), { look: 'res' }); camCHans(t, chorusG(sh)); };
// The reverse angle: from the creature's side, looking out at her through her own lens. Her face close, the brass lens
// up to her eye; its etching reads backwards from here, "snelremrofsnarT" (reference bank M1, C3b-1): who is reading
// whom. The creature's skin frames the shot, a few of its eyes on the rim.
FINAL.C3b = (sh, t) => {
  notebookPage({ holes: false, marginLine: false });
  const tR = wT(30, /read/), lean = ease(seg(t, sh.t0, tR));
  const r = researcher(830, 2470 - 40 * lean, 2150, t, { pose: 'hold', face: 1, hand: [1440, 980], expr: 'wonder', blink: 1 });
  const [hx, hy] = r.head, hr = 2150 * .075, ex = hx + hr * .1 + .38 * hr, ey = hy + hr * .06;   // her right eye (ours)
  magnifier(ex + 30, ey + 10, 250, { mirror: true, handleAng: .9 });
  warmLight(ex + 30, ey, 200, .25);
  // its skin round the edge of the frame, an opening we look out through, its eyes on the rim
  queue2d(c => {
    c.save(); c.beginPath(); c.rect(-20, -20, W + 40, H + 40); c.ellipse(960, 520, 900, 560, 0, 0, TAU, true);
    const g = c.createRadialGradient(960, 520, 500, 960, 520, 1100); g.addColorStop(0, '#2E3A66'); g.addColorStop(1, '#1C2244'); c.fillStyle = g; c.fill('evenodd');
    c.strokeStyle = DQ.ink; c.lineWidth = 5; c.beginPath(); c.ellipse(960, 520, 900, 560, 0, 0, TAU); c.stroke(); c.restore();
  }, { screen: true });
  for (const [x, y, s2] of [[110, 140, 40], [1810, 120, 46], [70, 640, 34], [1860, 760, 38], [1500, 1040, 30], [360, 1050, 32]]) eye2d(x, y, s2, [(ex - x) / 900, (ey - y) / 900], 1, DQ.indigo);
  return { lyBox: [240, 880, 1000, 150] };
};
// "you said 'I think you're testing me'" is sung and captioned, so no bubble (Neel, 3 Oct: too much text here, and
// repetitive). Every eye narrows at her; on "mine" her head lights up like a readout, and she gets a specimen tag too.
FINAL.C3c = (sh, t) => {
  const tT = wT(31, /mine/), V = visit(t, chorusG(sh), { look: 'res', tag: false, wake: t > sh.t0 + .3 && t < tT ? 5.5 : undefined });
  if (t > tT) warmLight(V.rx + 30, V.ry - V.rh * .9, 200, .6 * seg(t, tT, tT + .3));
  if (t > tT) specimenTag(V.rx - 290, V.ry - V.rh * .7, ['SPECIMEN No. 1'], { size: 24, w: 240, string: [[V.rx - 20, V.ry - V.rh * .62]] });   // its first (its own numbering, not hers)
  camCHans(t, chorusG(sh), { tap: true });   // R16: a hoof on "mine"
};
FINAL.C3d = (sh, t) => { const n = chorusNow(sh); visit(t, chorusG(sh), { look: 'res', stare: ease(seg(t, n - .1, n + .35)) }); camCHans(t, chorusG(sh)); };   // on "now": from her to us
FINAL.C3x = (sh, t) => { visit(t, chorusG(DQ_BY.C3d), { look: 'res', stare: 1 }); camCHans(t, chorusG(DQ_BY.C3d)); pageTurn(t, sh.t0, (sh.t1 - sh.t0) * .85, { draw: () => {} }, 2025); return { noLyric: true }; };   // to a fresh page: verse 5 is her room
