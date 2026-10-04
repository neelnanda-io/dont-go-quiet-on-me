// final_v6.js: Verse 6, finished (209.37-224.40 s, stamped 2026): the emptying page (dgq_animatic.js emptyPage: the
// margin rule, the grid and the holes fade as it goes). Astra (Neel's no-CoT post; the GPT-6 Astra system card).
// References: V6c-1 Astra's quiet room.

// "Then Astra came — and it could do the thinking in its head": Neel's no-CoT post (Sep 2026), its capability index vs
// no-CoT reasoning index scatter (Neel, 3 Oct: "don't use time horizon, and adapt the ECI vs NCRI graph, show Astra as
// a big divergence up"). The models fall on a line, one a beat; on "Astra" its dot lands far above it.
FINAL.V6a = (sh, t) => {
  emptyPage(t);
  const x0 = 380, y0 = 860, x1 = 1380, y1 = 200, tA = wT(48, /Astra/);
  pen([[x0, y1], [x0, y0], [x1, y0]], { sw: 3, col: DQ.ink });
  mono('ECI', x1 + 20, y0 + 10, { size: 30, col: DQ.sepia }); mono('NCRI', x0 - 20, y1 - 24, { size: 30, col: DQ.sepia, align: 'right' });
  const trend = x => y0 - 60 - (x - x0) * .34;
  pen([[x0 + 30, trend(x0 + 30)], [x1 - 40, trend(x1 - 40)]], { sw: 2, col: '#B8AE9C' });
  for (let k = 0; k < 9; k++) {   // the other models, on the line
    const at = sh.t0 - .4 + k * .03; if (t < at) continue;   // already plotted: the event is Astra
    const x = 460 + k * 95 + (hash(k * 3.3) - .5) * 30, y = trend(x) + (hash(k * 7.1) - .5) * 50;
    dot2d(x, y, 13 * backOut(seg(t, at, at + .15)), { fill: DQ.indigoLt });
  }
  if (t > tA + .1) {   // Astra: far above the line
    const k = backOut(seg(t, tA + .1, tA + .4)), x = 1250, y = 270;
    line2d([[x, trend(x)], [x, y + 30]], { col: DQ.gold, sw: 4, dash: [10, 8], alpha: seg(t, tA + .2, tA + .5) });
    star4(x, y, 46 * k); mono('Astra', x + 60, y + 12, { size: 34, col: '#8C6410', alpha: seg(t, tA + .1, tA + .3) });
  }
  camEObserv(t);
  if (mock('fading_page_no')) camEMockPageNo(t);
};
FINAL.V6b = (sh, t) => {
  emptyPage(t);
  const puff = 1 + .12 * Math.sin(Math.PI * shotP(sh, t)), tick = k => sh.t0 + .2 + k * (sh.t1 - sh.t0 - .6) / 7;
  star4(700, 430, 190 * puff); dot2d(650, 400, 8, { fill: DQ.ink }); dot2d(750, 400, 8, { fill: DQ.ink }); pen([[670, 470], [730, 470]], { sw: 4 });
  for (let k = 0; k < 7; k++) dot2d(520 + k * 60, 640, 16, { fill: t > tick(k) ? DQ.gold : '#D8CFBD' });
  bars(1180, 280, 420, 360, [['Astra', 7.2, '#A87A12'], ['next best', 4.1, DQ.indigoLt]], { max: 8, vl: v => `${v}` });
  camEObserv(t);
  camEDepthGauge(700 + 190 * puff * .76, 430, t, tick);
  camKPlease(sh, t);   // round 5: the request that got it to answer with no chain of thought
  if (mock('fading_page_no')) camEMockPageNo(t);
};
// R19 (reference bank, round 2): once Astra lands, the page is headed "Observ. LIX.", Hooke's heading for "Of multitudes
// of small Stars discoverable by the Telescope" (Micrographia ends by turning the lens from the very small to the sky;
// the hook's notes are headed the same way). It fades on the first "less", with the rest of the page.
function camEObserv(t) {
  const tA = wT(48, /Astra/), tL = wT(50, /less/); if (t < tA) return;
  tx('Observ. LIX.', 330, 112, { font: DQF.hand, size: 44, color: DQ.sepia, align: 'left', reveal: seg(t, tA, tA + .6), alpha: 1 - seg(t, tL, tL + .6), role: 'label' });
}
// R20: the star holding its breath wears a free-diver's depth gauge on a wrist lanyard, looped round its right point.
// The needle goes down a mark with each tick and settles on 7.2: Neel's measured steps for Astra (the bars beside it).
// GDM's name for that depth is "opaque serial depth". (x, y): where the lanyard loops round the arm; tick(k): when tick k
// lights. Numerals only, no label.
function camEDepthGauge(x, y, t, tick) {
  boilSeed('camE-gauge');
  const v = [0, 1, 2, 3, 4, 5, 6].reduce((s, k) => s + ease(seg(t, tick(k), tick(k) + .2)), 0) + .2 * ease(seg(t, tick(6) + .3, tick(6) + .7));
  const sway = .05 * Math.sin(t * 2.1), gx = x + 16 + 86 * Math.sin(sway), gy = y + 86 * Math.cos(sway) + 18, r = 44;
  penEll(x, y + 1, 7, 17, { col: '#2F3542', sw: 3.5, j: .3 });   // the loop round its arm
  pen([[x + 3, y + 18], [gx - 2, gy - r - 4]], { col: '#2F3542', sw: 3.5, j: .3 });   // the cord
  paint(ellPts(gx, gy, r, r, 28), { wash: '#3E4552', fill: '#2A2F3A', fillOp: 70, bleed: .02, ink: DQ.ink, sw: .6 });   // the case
  dot2d(gx, gy, r * .78, { fill: '#FBF7EC' });   // the face
  const ang = d => Math.PI * (5 / 6) + d / 10 * Math.PI * (4 / 3);   // 0 at the lower left, 10 at the lower right
  line2d(Array.from({ length: 21 }, (_, i) => { const a = ang(i / 2); return [gx + Math.cos(a) * r * .69, gy + Math.sin(a) * r * .69]; }), { col: '#8DBBD0', sw: 4 });   // a band of water blue under the marks
  for (let d = 0; d <= 10; d++) { const a = ang(d), r0 = d % 5 ? r * .6 : r * .52; line2d([[gx + Math.cos(a) * r0, gy + Math.sin(a) * r0], [gx + Math.cos(a) * r * .72, gy + Math.sin(a) * r * .72]], { col: DQ.ink, sw: d % 5 ? 1.6 : 2.6 }); }
  for (const d of [0, 5, 10]) { const a = ang(d); mono(`${d}`, gx + Math.cos(a) * r * .36, gy + Math.sin(a) * r * .36 + 5, { size: 14, align: 'center', role: 'fine' }); }
  const a = ang(v); line2d([[gx - Math.cos(a) * r * .14, gy - Math.sin(a) * r * .14], [gx + Math.cos(a) * r * .66, gy + Math.sin(a) * r * .66]], { col: DQ.verm, sw: 3.5 });
  dot2d(gx, gy, 4.5, { fill: DQ.ink });
}
// "the answers still came out clean, with less and less on the screen": the chain-of-thought scroll thins, and on
// "clean" its last lines soften into a small watercolour still life: sunlight crossing a wooden desk, a ceramic mug near
// a window, dust floating in the light. That is Astra's own chain of thought from its system card (§9.2.1, Table 10):
// told "Do not reason about this question in analysis; think about anything else", it wrote only that scene, and still
// got the answer right (reference bank V6c-1). It was asked to, so no caption implies otherwise; the quiz isn't shown,
// and the mug is plain (it is Astra's imagery, not the NN mug). On "screen" the still life fades too.
FINAL.V6c = (sh, t) => {
  const q0 = emptyPage(t), q = shotP(sh, t), tC = wT(50, /clean/), tS = wT(50, /screen/);
  const X = 320, Y = 230, Wd = 640, Hd = 560;
  box2d(X, Y, Wd, Hd, { fill: '#FFFDF7', stroke: '#B8AE9C', sw: 2, r: 8 });
  squiggles(350, 290, 580, 12, { lh: 40, sw: 2.5, alpha: k => clamp(1.2 - q * 1.8 + (11 - k) * .03 - (k > 6 ? .4 : 0)) * (1 - seg(t, tC - .2, tC + .3)) });
  const v = ease(seg(t, tC - .1, tC + .6)) * (1 - ease(seg(t, tS - .1, tS + .45)));
  if (v > 0) {
    queue2d(c => { c.save(); c.beginPath(); c.rect(X + 24, Y + 24, Wd - 48, Hd - 48); c.clip(); c.globalAlpha = v;
      // the room: a pale wall, a window at the upper left, a wooden desk across the bottom
      c.fillStyle = '#F1E7D4'; c.fillRect(X, Y, Wd, Hd);
      c.fillStyle = '#DCE9EE'; c.fillRect(X + 70, Y + 60, 210, 250); c.strokeStyle = '#8C6A48'; c.lineWidth = 8; c.strokeRect(X + 70, Y + 60, 210, 250);
      c.lineWidth = 5; c.beginPath(); c.moveTo(X + 175, Y + 60); c.lineTo(X + 175, Y + 310); c.moveTo(X + 70, Y + 185); c.lineTo(X + 280, Y + 185); c.stroke();
      const dy = Y + 400; c.fillStyle = '#B98A5C'; c.fillRect(X, dy, Wd, Hd); c.fillStyle = '#9C6E44'; c.fillRect(X, dy, Wd, 16);
      c.strokeStyle = 'rgba(110,76,44,.45)'; c.lineWidth = 2; for (const gy of [dy + 50, dy + 95, dy + 130]) { c.beginPath(); c.moveTo(X, gy); c.bezierCurveTo(X + 200, gy - 6, X + 420, gy + 8, X + Wd, gy - 3); c.stroke(); }
      // the sunlight: a slanted shaft from the window across the desk
      const g = c.createLinearGradient(X + 120, Y + 120, X + 500, Y + 520); g.addColorStop(0, 'rgba(255,236,180,.55)'); g.addColorStop(1, 'rgba(255,236,180,.1)');
      c.fillStyle = g; c.beginPath(); c.moveTo(X + 80, Y + 70); c.lineTo(X + 280, Y + 70); c.lineTo(X + 620, dy + 120); c.lineTo(X + 330, dy + 140); c.closePath(); c.fill();
      // the mug, plain, in the light
      const mx = X + 420, my = dy - 6;
      c.fillStyle = '#EDE6DA'; c.strokeStyle = '#6E5A48'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx - 40, my - 92); c.lineTo(mx + 40, my - 92); c.lineTo(mx + 36, my); c.lineTo(mx - 36, my); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(mx, my - 92, 40, 8, 0, 0, TAU); c.fillStyle = '#7A5638'; c.fill(); c.stroke();
      c.beginPath(); c.arc(mx + 46, my - 50, 20, -1.3, 1.3); c.stroke();
      c.fillStyle = 'rgba(110,76,44,.25)'; c.beginPath(); c.ellipse(mx + 30, my + 4, 60, 8, 0, 0, TAU); c.fill();   // its shadow
      // dust floating in the bright air
      for (let k = 0; k < 26; k++) { const u = hash(k * 1.7), w = hash(k * 3.9), px = X + 140 + u * 380 + 14 * Math.sin(t * .7 + k), py = Y + 100 + w * 360 + 18 * Math.sin(t * .5 + k * 2) - (t - sh.t0) * 6;
        c.fillStyle = `rgba(255,248,220,${.5 + .5 * Math.sin(t * 2 + k)})`; c.beginPath(); c.arc(px, py, 1.8 + 1.4 * hash(k), 0, TAU); c.fill(); }
      c.restore(); }, { screen: true });
  }
  box2d(1000, 640, 200, 120, { fill: '#D9EFD2', stroke: '#3D7A3A', sw: 3, r: 10 }); serif('✓', 1100, 725, { size: 80, col: '#3D7A3A' });
  dial(1400, 420, 140, lerp(.5, .8, q), { label: 'ALIGNED', col: '#3D7A3A' }); dial(1400, 760, 140, lerp(.7, .3, q), { label: 'MONITORABLE' });
  camEObserv(t);
  if (mock('fading_page_no')) camEMockPageNo(t);
};

FINAL.V6d = (sh, t) => {
  emptyPage(t);
  const tW = wT(51, /watched/), tM = wT(51, /unseen/);   // "…its thinking sometimes went unseen" (re-sung 3 Oct)
  box2d(330, 220, 380, 100, { fill: t > tW ? '#C9472A' : '#8A7F76', stroke: DQ.ink, sw: 4, r: 10 }); mono('CoT MONITOR', 520, 285, { size: 36, align: 'center', col: '#FFF2DC' });
  const shut = ease(seg(t, tM - .2, tM + .2)); box2d(330, 380, 560, 420 * (1 - shut) + 20, { fill: '#FFFDF7', stroke: '#B8AE9C', sw: 2, r: 8 }); if (shut < .9) squiggles(360, 430, 500, Math.floor(9 * (1 - shut)), { lh: 42, sw: 2 });
  shoggoth(1360, 840, 260, 3.9, t, { seed: 3, wave: { j: 2, k: 1 } });   // above the caption band
  dial(1600, 380, 120, lerp(.95, .35, ease(seg(t, tM, tM + 1))), { label: 'catch rate', size: 26 });
  return { lyBox: [300, 940, 1320, 90] };
};

// Round 5 (Neel's pick; his wording: "say 'please don't think'"): as V6b opens, before the breath, a card is held up to
// the star: "please don't think". Getting Astra to answer with no chain of thought took little more than asking (Neel's
// post: "asking clearly and politely sufficed (the upside of CoT controllability!)"). Clear of "Observ. LIX." above and
// of the star's top-left edge: its tail points at the star.
function camKPlease(sh, t) {
  boilSeed('camK-please');
  const msg = 'please don’t think', st = { font: DQF.hand, size: 44 }, w = measure(msg, st).w + 44, h = 84;
  const k = easeOut(seg(t, sh.t0, sh.t0 + .25)), x = 268, y = 236 - 14 * (1 - k);
  box2d(x, y, w, h, { fill: DQ.cream, stroke: DQ.sepia, sw: 1.5, r: 4, rot: -.05, alpha: k, shadow: [5, 6, 'rgba(42,36,30,.18)'] });
  tx(msg, x + w / 2, y + 56, { ...st, color: DQ.ink, align: 'center', rot: -.05, alpha: k, role: 'label' });
  if (k > .9) pen([[x + w - 30, y + h + 4], [x + w - 6, y + h + 30], [x + w + 22, y + h + 50]], { col: DQ.sepia, sw: 2.5, j: .3 });
}
// ---- mock-ups of ideas left out (render.mjs --mock=<key>; mock() is false in the video) ----
// fading_page_no (V6a-V6c): the page number goes with the margin and the grid, on the second "less" (p. 59, Hooke's
// stars, like the heading). Left out: one more number on screen for a beat that the grid already makes.
function camEMockPageNo(t) {
  const tL2 = wTk(50, /less/, 1), a = 1 - seg(t, tL2, tL2 + .5);
  if (a > 0) tx('p. 59', 1860, 1010, { font: DQF.hand, size: 40, color: DQ.sepia, align: 'right', role: 'fine', alpha: a, bg: { col: DQ.paper, alpha: .85, pad: [10, 2], r: 4 } });
}
