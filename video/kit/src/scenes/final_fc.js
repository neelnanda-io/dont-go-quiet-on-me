// final_fc.js: the final chorus and the end card, finished (226.01-262 s, stamped 2026, then black). The forward
// riffle through every chorus to the fortress; the arrow slit; the window narrowing; she sits and draws the wall; the
// eyes close on "n—". References (reference bank): M4 / FC1-1 the probe at the gate, FC3-1 the pencil under the blind,
// FC4-1 the J clip (M1), the elk (M7) and the NN mug's ring (M6), E1-1 the Micrographia title, E1-2 Distill's
// corrections line.

// the little probe from verse 3 on its stool by the fortress gate, bell in its lap: input probes keep working while the
// window narrows (Building Production-Ready Probes for Gemini: deployed in user-facing Gemini).
function probeAtGate(V, t, quiet) {
  const rx = Math.min(1050, V.s * 1.55), gx = V.cx, gy = V.gy + rx * .2, x = gx + rx * .2, s = 120;
  pen([[x - 30, gy], [x - 26, gy - 46], [x + 26, gy - 46], [x + 30, gy]], { sw: 4, col: '#7A5A3A' }); pen([[x - 34, gy - 46], [x + 34, gy - 46]], { sw: 7, col: '#7A5A3A' });   // the stool
  probeChar(x, gy - 46, s, t, { medal: true });
  bell(x + 44, gy - 52, 26, 0);
}

FINAL.FC1 = (sh, t) => {
  // the forward riffle: one past visit per beat (doubled cut rate), then the fortress
  const past = [...['C1d', 'C2d', 'C3d', 'C4d'].map(id => chorusG(DQ_BY[id])), 3.9], k = beatsIn(t, sh.t0);   // every chorus, then the bridge
  if (k < past.length) {
    const V = visit(t, past[k], { look: k >= 2 ? 'res' : null, res: k >= 3 ? { pose: 'sit' } : {}, discards: k === 0 ? 3 : 0 });
    if (k === 1) camFSketches(); else if (k === 2) camCHans(t, past[2]); else if (k === 3) { camJBliss(V, t); camENotebook(V, t); }   // each chorus as it was (its sketches, the toy horse, the spirals and its notebook)
    const q = frac((t - sh.t0) / BEAT);
    queue2d(c => { const x = (1 - easeOut(seg(q, 0, .35))) * W; const g = c.createLinearGradient(x - 120, 0, x, 0); g.addColorStop(0, 'rgba(255,250,238,0)'); g.addColorStop(1, 'rgba(255,250,238,.9)'); c.fillStyle = g; c.fillRect(x - 120, 0, 120, H); }, { screen: true });
    return { lyBox: [250, 230, 640, 640] };
  }
  const V = visit(t, chorusG(sh), { look: 'res', res: { pose: 'lens', back: false } });
  probeAtGate(V, t, 0);
  return { lyBox: [250, 150, 560, 520] };
};
FINAL.FC2 = (sh, t) => {
  notebookPage({ ring: false });
  paint(rectPts(-40, -40, W + 80, H + 80), { wash: DQ.stone, fill: DQ.stoneDk, fillOp: 40, ink: null });
  for (let r = 0; r < 9; r++) for (let k = 0; k < 9; k++) penRect(k * 260 - (r % 2) * 130, r * 130, 260, 130, { col: DQ.stoneDk, sw: 2 });
  box2d(900, 220, 120, 480, { fill: '#1A1612', r: 50 });
  eye2d(960, 430, 46, [-.2, .1], 1, '#1A1612');
  magnifier(960, 430, 220, { part: 'rim' });
};
FINAL.FC3 = (sh, t) => {
  notebookPage({ ring: false });
  paint(rectPts(-40, 140, W + 80, 1000), { wash: DQ.stone, fill: DQ.stoneDk, fillOp: 40, ink: null });
  for (let r = 0; r < 8; r++) for (let k = 0; k < 9; k++) penRect(k * 260 - (r % 2) * 130, 140 + r * 130, 260, 130, { col: DQ.stoneDk, sw: 2 });
  const wx = 760, wy = 300, ww = 400, wh = 360;
  box2d(wx, wy, ww, wh, { fill: '#F7EBC8', stroke: '#6B4E33', sw: 12, r: 6 }); squiggles(wx + 30, wy + 230, ww - 60, 3, { lh: 36, col: DQ.sepia, sw: 2 });
  // the blind: half down, narrowing not shut. On "don't" it slips lower; on "leave" her hand comes up with a pencil, and on
  // "blind" wedges it under the bottom rail and holds the gap open (GDM, Shah & Dragan: "We must strive to keep that window
  // open"; reference bank FC3-1). Keeping the window open is something people choose to do.
  const tD = wT(54, /don't/), tL = wT(54, /leave/), tB = wT(54, /blind/);
  const slats = 9 + 4 * ease(seg(t, tD, tL + .1)) - 1.2 * ease(seg(t, tB - .05, tB + .12));
  for (let k = 0; k < Math.floor(slats); k++) box2d(wx, wy + k * 20, ww, 16, { fill: '#D9C29A', stroke: '#8A6A3A', sw: 1.5 });
  const rail = wy + Math.floor(slats) * 20;
  box2d(wx - 6, rail, ww + 12, 10, { fill: '#8A6A3A', r: 4 });
  const hk = easeOut(seg(t, tL, tB)), hx = lerp(wx + ww + 220, wx + ww - 60, hk), hy = lerp(H + 120, rail + 30, hk);
  if (hk > 0) {
    paint(ribbon([[hx + 160, hy + 260], [hx + 40, hy + 60]], 70, 54), { wash: NAT.card, fill: NAT.cardDk, fillOp: 40, ink: DQ.ink, sw: .45 });   // her sleeve
    paint(ellPts(hx + 26, hy + 34, 32, 26, 14, 0, -.6), { wash: NAT.skin, ink: DQ.ink, sw: .4 });   // her hand
    line2d([[hx + 30, hy + 30], [hx - 170, rail + 6]], { col: '#C9472A', sw: 14 }); line2d([[hx - 150, rail + 8], [hx - 178, rail + 5]], { col: '#E8C9A0', sw: 12 });   // the red pencil, its point under the rail
  }
  return { lyBox: [260, 800, 1400, 190] };
};
// "so if you stop, I'll learn to read the quiet". Neel (3 Oct, round 3) found the old staging unclear, so one action: she
// stands at the fortress wall, facing it; above the wall the creature has gone quiet (a few eyes still open). She raises
// her cracked lens to the stones; on "read" the clip-on J lens flips down over it (the J-lens, "a principled refinement of
// the logit lens"; M1), and through the glass the wall is gone: inside, in the J-space's dashed bubble, it is still
// thinking about cats, the first thing she ever read in it (the opening's "Observ. I."). In the quiet after the line,
// Neel's wry reply, where the sung aside used to be (he asked for the card back).
FINAL.FC4 = (sh, t) => {
  notebookPage({ ring: false });
  const tStop = wT(55, /stop/), tR = wT(55, /read/), tQ = wT(55, /quiet/);
  shoggoth(1250, 1480, 1050, 3.7, t, { seed: 3, wake: 0, look: [700, 640] });   // beyond the wall, huge, every eye shut: quiet
  flushLetters();
  const WT = 470;   // the wall's top
  paint(rectPts(-40, WT, W + 80, 900 - WT), { wash: DQ.stone, fill: DQ.stoneDk, fillOp: 40, bleed: .005, tex: .55, ink: PENCIL, sw: .8 });
  for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) penRect(k * 240 - (r % 2) * 120 - 40, WT + r * 108, 240, 108, { col: DQ.stoneDk, sw: 2 });
  for (let k = 0; k < 16; k++) paint(rectPts(k * 130 - 20, WT - 52, 72, 54), { wash: DQ.stone, ink: PENCIL, sw: .6 });   // merlons
  paint([[-40, 900], [W + 40, 900], [W + 40, H + 40], [-40, H + 40]], { wash: '#B9A27E', ink: null });   // the ground
  // her, the lens coming up against the stones on "stop"
  const up = ease(seg(t, tStop - .45, tStop + .25)), hand = [lerp(640, 700, up), lerp(880, 760, up)], R = 150, ang = -.35, ha = ang + Math.PI;
  const L = [hand[0] + Math.cos(ang) * 2.1 * R, hand[1] + Math.sin(ang) * 2.1 * R];
  researcher(430, 900, 540, t, { pose: 'hold', hand, noHand: true, face: 1, expr: t > tQ + .6 ? 'smile' : 'calm' });
  magnifier(L[0], L[1], R, { part: 'handle', handleAng: ha });
  const see = ease(seg(t, tR, tR + .45)), cat = backOut(seg(t, tQ, tQ + .3));
  if (see > 0) queue2d(c => {   // through the glass: no wall, its insides, and its quiet thought
    c.save(); c.beginPath(); c.arc(L[0], L[1], R * .98, 0, TAU); c.clip(); c.globalAlpha = see;
    c.fillStyle = '#2E3A66'; c.fillRect(L[0] - R, L[1] - R, 2 * R, 2 * R);
    c.strokeStyle = 'rgba(157,170,224,.35)'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(L[0] - R, L[1] - R * .7 + k * R * .38); c.lineTo(L[0] - R * .2, L[1] - R * .7 + k * R * .38); c.lineTo(L[0] - R * .2 + 30, L[1] - R * .5 + k * R * .38); c.lineTo(L[0] + R, L[1] - R * .5 + k * R * .38); c.stroke(); }
    c.setLineDash([10, 8]); c.lineWidth = 3.5; c.strokeStyle = V5.dash; c.fillStyle = V5.manilla; c.beginPath(); c.ellipse(L[0] + 6, L[1] - 6, R * .62, R * .48, 0, 0, TAU); c.fill(); c.stroke(); c.setLineDash([]);
    c.restore();
  });
  if (cat > 0) catFace(L[0] + 6, L[1] + 2, 34 * cat, DQ.ink);   // still thinking about cats
  // (it wore a collar tag reading Barnaby, reference bank r2 T24, until Neel asked for it gone, 3 Oct, night)
  magnifier(L[0], L[1], R, { part: 'rim', handleAng: ha, crack: 1 });
  // behind it on the same hinge, a smaller clip lettered R stays folded up: the R-lens, "a drop-in replacement for J-lens
  // that produces clearer readouts on earlier layers" (Neel's scholars' post, 2026; reference bank r2 T16)
  const rc = [L[0] + R * 1.14, L[1] - R * 1.0], rr = R * .22;
  queue2d(c => { c.save(); c.strokeStyle = DQ.brassDk; c.lineWidth = 4; c.beginPath(); c.moveTo(L[0] + R * .66, L[1] - R * .74); c.lineTo(rc[0], rc[1]); c.stroke();
    c.fillStyle = 'rgba(214,234,232,.35)'; c.beginPath(); c.arc(rc[0], rc[1], rr, 0, TAU); c.fill(); c.strokeStyle = DQ.brass; c.lineWidth = 7; c.stroke(); c.strokeStyle = DQ.ink; c.lineWidth = 1.5; c.stroke();
    c.font = `700 25px "${FONT.cmuTT}"`; c.fillStyle = DQ.brassDk; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('R', rc[0] + rr * .74, rc[1] - rr * .74); c.restore(); });
  // the J clip: up off the rim until "read", then down over the glass
  const jf = ease(seg(t, tR - .12, tR + .22)), jc = [lerp(L[0] + R * .9, L[0] + R * .42, jf), lerp(L[1] - R * 1.25, L[1] - R * .52, jf)];
  queue2d(c => { c.save(); c.strokeStyle = DQ.brassDk; c.lineWidth = 5; c.beginPath(); c.moveTo(L[0] + R * .66, L[1] - R * .74); c.lineTo(jc[0], jc[1]); c.stroke();
    c.fillStyle = 'rgba(214,234,232,.35)'; c.beginPath(); c.arc(jc[0], jc[1], R * .3, 0, TAU); c.fill(); c.strokeStyle = DQ.brass; c.lineWidth = 8; c.stroke(); c.strokeStyle = DQ.ink; c.lineWidth = 1.5; c.stroke();
    c.font = `700 30px "${FONT.cmuTT}"`; c.fillStyle = DQ.brassDk; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('J', jc[0] + R * .3 * .72, jc[1] - R * .3 * .72); c.restore(); });
  gripHand(hand[0], hand[1], ha, 21);   // sized to her (540 px tall), not to the big lens (Neel, 3 Oct, late: the hand was way too big)
  if (mock('t66')) {   // mock-up (left out, reference bank r2 T66): an abacus wire of six beads at her feet; on "read" she has
    // slid the 3rd and 5th across (the two intermediate values sat in "the third and fifth of six" latent vectors)
    const ax = 540, ay = 828, aw = 220, ah = 70, slid = ease(seg(t, tR, tR + .3)), rank = [0, 1, 0, 2, 1, 3];
    box2d(ax, ay, aw, ah, { fill: null, stroke: '#7A5A3A', sw: 8, r: 4 }); line2d([[ax + 6, ay + ah / 2], [ax + aw - 6, ay + ah / 2]], { col: '#5A4632', sw: 2.5 });
    for (let i = 0; i < 6; i++) { const moved = i === 2 || i === 4, x0 = ax + 24 + i * 22, x1 = moved ? ax + aw - 46 + rank[i] * 22 : ax + 24 + rank[i] * 22;
      dot2d(lerp(x0, x1, slid), ay + ah / 2, 10, { fill: moved ? DQ.verm : '#B98A5E' }); }
  }
  // the cards: FC3's carries in and fades; "kind of my job" lands where the cut aside was sung (Neel, 3 Oct: put it back)
  if (t < sh.t0 + 1.6) quoteCard(DQ_BY.FC3.quote, t, sh.t0 - 5, { fade: 1 - seg(t, sh.t0 + 1.2, sh.t0 + 1.6) });
  quoteCard(sh.quote, t, 241.15);
  return { lyBox: [300, 888, 1320, 128], noCard: true };
};
FINAL.FC5 = (sh, t) => {   // "keep talking — don't go quiet on me n—": it keeps growing, past the walls, into 2027, its eyes closing a word at a time, and the meter drops to one (Neel, 3 Oct)
  const line = lineByIdx(56), ws = line ? line.words : [], closed = ws.filter(w => t > w.t0).length;
  const grow = 1 + .6 * ease(seg(t, 244.0, 249.4));
  const V = visit(t, chorusG(sh), { grow, look: 'res', wake: Math.max(0, 7 - closed * 1.15), res: { pose: 'sit' } });
  probeAtGate(V, t, 1);   // it stays put, bell in lap: the one thing that hasn't gone dark (M4)
  queue2d(c => { c.fillStyle = `rgba(20,16,12,${.07 * closed})`; c.fillRect(0, 0, W, H); }, { screen: true });
  if (t < sh.t0 + 1.95) quoteCard(DQ_BY.FC4.quote, t, 241.15, { fade: 1 - seg(t, sh.t0 + 1.55, sh.t0 + 1.95) });   // FC4's card, carried in until it has been read, then fading
  return { lyBox: [250, 150, 560, 520] };
};

// Mock-up (round 4 pick 10, video/treatment/reference_bank_r4.md; render.mjs --mock=r4_daisy): a pressed daisy, laid on
// its side and taped down just right of "vocals & band: Suno v6", in the page's pale ink. "Daisy Bell" was the first song
// sung by computer speech synthesis (Bell Labs, 1961), and Clarke gave it to HAL 9000: the first song a computer sang,
// beside the credit for this song's AI singer. It sits by the vocals line, not over the cut to black, so it doesn't make
// the ending a machine switched off. (x, y): the flower's centre; a: its fade, the line's.
function camRDaisy(x, y, a) {
  if (a <= .02) return;
  queue2d(c => {
    c.save(); c.globalAlpha *= a; c.lineCap = c.lineJoin = 'round';
    c.strokeStyle = '#7F8A66'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x + 10, y + 2); c.quadraticCurveTo(x + 42, y + 10, x + 76, y + 6); c.stroke();   // its stem, pressed flat
    c.fillStyle = '#6E7A58'; for (const [lx, ly, ang] of [[x + 34, y + 8, -.5], [x + 52, y + 9, .55]]) { c.save(); c.translate(lx, ly); c.rotate(ang); c.beginPath(); c.ellipse(9, 0, 10, 3.6, 0, 0, TAU); c.fill(); c.restore(); }   // two leaves
    for (let k = 0; k < 15; k++) { const ang = k / 15 * TAU + .1 * hash(k * 3.1); c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = 'rgba(216,208,194,.9)'; c.beginPath(); c.ellipse(13, 0, 9.5 + 1.5 * hash(k), 3.4, 0, 0, TAU); c.fill(); c.restore(); }   // its petals
    c.fillStyle = '#C9A94E'; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill();   // the yellow eye
    c.fillStyle = 'rgba(120,88,30,.5)'; for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(x + 3 * Math.cos(k * 2.4), y + 3 * Math.sin(k * 2.4), .9, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(220,210,180,.3)'; c.save(); c.translate(x + 44, y + 7); c.rotate(.35); c.fillRect(-7, -13, 14, 26); c.restore();   // a strip of tape over the stem
    c.restore();
  }, { screen: true });
}
FINAL.E1 = (sh, t) => {   // the credits (Neel, 3 Oct): Suno; Claude Opus 5.5; the prompt's inspiration; "moral support: Neel Nanda" (a joke: the AIs did the work)
  darkPage('#0B0A0C', '#1A181E');
  const a = k => seg(t, sh.t0 + 1 + k * .6, sh.t0 + 1.6 + k * .6), cr = { font: DQF.soft, size: 32, color: '#A8A196', role: 'label' };
  diffuseTitle('Don’t Go Quiet On Me', 960, 360, t, sh.t0 + .9, { size: 110, style: 'italic', col: '#E9E1D2' });
  tx('or, some Descriptions of a Growing Model made by Magnifying Glasses,', 960, 446, { font: DQF.serif, style: 'italic', size: 36, color: '#BDB4A6', alpha: a(1), role: 'label' });
  tx('with Observations and Inquiries thereupon', 960, 492, { font: DQF.serif, style: 'italic', size: 36, color: '#BDB4A6', alpha: a(1), role: 'label' });   // after Hooke's Micrographia (1665; reference bank E1-1)
  tx('vocals & band: Suno v6', 960, 590, { ...cr, alpha: a(2) });
  if (mock('r4_daisy')) camRDaisy(1176, 578, a(2));   // mock-up (round 4 pick 10), fading in with its line
  tx('lyrics, animation & mix: Claude Opus 5.5', 960, 640, { ...cr, alpha: a(3) });
  tx('prompt inspiration: Donald Jewkes', 960, 690, { ...cr, alpha: a(4) });
  tx('moral support: Neel Nanda', 960, 740, { ...cr, alpha: a(5) });   // Neel, 3 Oct (late): "moral support", not "funding"
  if (mock('epistemic_status')) tx('Epistemic status: affectionate; references checked.', 960, 236, { font: DQF.serif, style: 'italic', size: 30, color: '#BDB4A6', alpha: a(0), role: 'label' });   // mock-up (left out)
  {   // Distill's citation block, as Zoom In's footer ends (reference bank r2 R22; Neel picked it, 3 Oct)
    const ca = a(6), st = { font: DQF.type, size: 19, color: '#8F877B', align: 'left', alpha: ca, role: 'fine' };
    tx('Citation', 250, 860, { ...st, size: 21, color: '#BDB4A6' });
    tx('For attribution in academic contexts, please cite this work as', 250, 892, st);
    ['@misc{dontgoquiet2026,', '  title = {Don’t Go Quiet On Me},', '  year  = {2026}}'].forEach((l, k) => tx(l, 250, 930 + k * 26, st));
  }
  if (mock('r23')) tx('for Scronkfinkle', 960, 830, { font: DQF.serif, style: 'italic', size: 32, color: '#BDB4A6', alpha: a(6), role: 'label' });   // mock-up (left out, reference bank r2 R23): the dedication of Bostrom's Superintelligence
  tx('field notes kept by Claude', 1560, 900, { font: DQF.hand, size: 48, color: '#D8CFC0', alpha: a(6), role: 'label', rot: -.05, reveal: seg(t, sh.t0 + 4.6, sh.t0 + 5.6) });
  if (t > sh.t0 + 5) clawd(1790, 960, 4, feel('happy', t));
  // beside it, three stacked stones: where Claude's conversations drift when left alone, "zen silence" (Neel's scholars'
  // post on models' attractor states, 2026; reference bank r2 T27)
  const ca = seg(t, sh.t0 + 5.3, sh.t0 + 5.9);
  if (ca > 0) queue2d(c => { c.save(); c.globalAlpha = ca; c.lineWidth = 2; c.strokeStyle = '#D8CFC0'; c.fillStyle = '#2A2630';
    for (const [x, y, rx, ry] of [[1722, 988, 17, 7], [1723, 975, 12.5, 6], [1721, 964.5, 8, 4.5]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); c.stroke(); }
    c.restore(); });
  return { dark: true, bg: '#0B0A0C', noLyric: true };
};
// The title resolves the way a diffusion language model writes (DiffusionGemma, Neel last author; reference bank r2 T2):
// every letter slot starts as noise and the slots sharpen together, out of order, and "Quiet" is smeared across its
// neighbouring slots for a beat before it settles ("a 'smeared' probability distribution over adjacent positions").
function diffuseTitle(str, cx, y, t, t0, o) {
  if (t < t0) return;
  const st = { font: DQF.serif, size: o.size, style: o.style }, chars = [...str], x0 = cx - measure(str, st).w / 2;
  const NOISE = 'aceimnorstuvwxzQGODMh', q0 = str.indexOf('Quiet'), on = seg(t, t0, t0 + .2), step = Math.floor((t - t0) / .07);
  chars.forEach((ch, i) => {
    if (ch === ' ') return;
    const w = measure(ch, st).w, x = x0 + measure(chars.slice(0, i + 1).join(''), st).w - w;   // its place in the whole line (kerning kept)
    const quiet = i >= q0 && i < q0 + 5, lock = quiet ? t0 + 1.0 : t0 + .3 + .55 * hash(i * 7.13 + 2), k = ease(seg(t, lock - .22, lock + .08));
    if (k < 1) {
      const g = NOISE[Math.floor(hash(i * 13.7 + step * 3.1) * NOISE.length)];
      const sm = quiet ? seg(t, t0 + .3, t0 + .5) : 0;   // Quiet: the noise gives way to the smear
      tx(g, x + w / 2, y, { ...st, color: o.col, align: 'center', alpha: on * (1 - k) * .32 * (1 - sm), role: 'deco' });
      if (sm > 0) for (const d of [-.5, .5]) tx(ch, x + w * d, y, { ...st, color: o.col, align: 'left', alpha: (1 - k) * .4 * sm, role: 'deco' });
    }
    if (k > 0) tx(ch, x, y, { ...st, color: o.col, align: 'left', alpha: k, role: 'deco' });   // (letter by letter: italic neighbours overlap by design)
  });
}
FINAL.E2 = (sh, t) => {
  darkPage('#0B0A0C', '#0B0A0C');
  const op = ease(seg(t, sh.t0 + .5, sh.t0 + 1.4)) * (1 - seg(t, DUR - .6, DUR));
  eye2d(960, 540, 40, [0, .05], op, '#0B0A0C');
  return { dark: true, bg: '#0B0A0C', noLyric: true };
};
