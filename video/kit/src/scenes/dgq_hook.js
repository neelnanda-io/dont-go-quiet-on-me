// dgq_hook.js: the opening of "Don't Go Quiet On Me" (0:00 to verse 1 at 19.56 s). Neel's brief (1-2 Oct): "interp
// getting harder over time as models get better, maybe a researcher with a magnifying glass studying a cute tiny
// shoggoth, then it starts growing and rapidly becomes bigger than the screen as 'don't go quiet on me now' is said,
// then it changes scene for the verse. ... kinda sad and serious but not too dramatic." Year stamp in the corner.
//
// Measured on the track (audio/final): music box 0-4.5 s; strings swell 4.5-9.3; "Don't go quiet" 9.48-10.82; a breath
// (near silence) at 11.0; "on me" 11.62-12.18; "now" 12.18-13.56; hush 13.6-16.1; orchestral hit 16.16; verse 1 19.56.
// Hook rules (production notes): words on screen by ~1.2 s (the title, from 1.0), key visual by 3 s (the lens).
//
// Neel's notes, in order. v3 (2 Oct): "much more rapid and dramatic ... well off the screen and the bit on screen should
// only be a small fraction of it ... oh wow, this thing's gonna keep getting bigger". v4 (3 Oct): "way too jerky";
// "the shoggoth remains upright, just gets bigger and dominates the screen while the researcher shrinks, not this kind of
// spiralling into the center"; "the magnifying glass cracking was a nice touch". v5 (3 Oct): start growing "when the year
// counter starts ticking ... immediately after writing 'I can see all of it'"; notes "about what it was thinking, to go
// with the vibe that it's easy to interp" and "it's harmless"; "a bit longer of a dramatic moment where the shoggoth grows
// a ton"; the lens "disembodied and then held by a researcher is clumsy, maybe have the handle go a bit off screen so you
// can zoom out and show the researcher".
// So: her hand holds the lens from the first frame (the handle runs off the bottom right). Her notes say what it thinks
// (a cat, in a thought bubble: easy to read), that it is harmless (its smiley mask), and that she can see all of it. As
// that last note is written the year starts ticking and it starts to grow, on one smooth curve; its thoughts tangle and
// the bubble goes dark on "Don't go quiet", and "I can see all of it" is struck out. It fills the lens, spills over the
// rim and cracks the glass on "on me". From the crack the camera pulls back over her shoulder: she and the lens are near
// the camera, so they shrink faster than it does (two layers: hookNear for her, hookCam for it), and she ends a small
// figure at the foot of an upright giant, every eye on her.

const LOGK = K => K.map(([t, v]) => [t, Math.log(v)]);   // keys interpolated in log space (sizes, zooms)
const HOOK = {
  lens: [1230, 590], R: 320, dish: [1230, 700],
  words: () => (lineByIdx(0) || { words: [] }).words,      // "Don't go quiet on me now" with aligned times
  tNow: () => { const w = (lineByIdx(0) || { words: [] }).words[5]; return w ? w.t0 : 12.18; },
  T0: 6.7,   // it starts to grow as "I can see all of it" is finished, on the year stamp's first tick
  // its body radius on screen (px), one monotone curve: it creeps from T0, fills the lens by the end of "quiet", spills
  // over the rim on the breath, and peaks in speed around the crack and "now"; in the hush it keeps growing, more slowly,
  // while the camera's retreat carries the scale. It ends with the lower edge of its two big eyes at the top of the frame.
  SIG: LOGK([[0, 100], [6.7, 100], [7.5, 108], [8.5, 126], [9.48, 160], [10.0, 200], [10.82, 280], [11.3, 340], [11.75, 410],
    [12.18, 520], [13.0, 790], [13.8, 990], [14.8, 1150], [16.2, 1320], [17.6, 1500]]),
  // the far camera (the creature, the dish): 1 = the page as drawn; it retreats from the crack, quickly, then steadying
  ZOOM: LOGK([[0, 1], [12.0, 1], [12.45, .82], [12.9, .58], [13.4, .4], [14.0, .27], [14.8, .175], [15.6, .125], [16.4, .093],
    [17.6, .065]]),
  // growth (complexity): gilded, with the first filigree, but short of the briars (3.1+) and the walls (3.9+), which are
  // saved for the choruses (the briars read as stray ferns across her at this scale)
  G: [[0, 0], [6.7, 0], [7.5, .1], [8.5, .35], [9.48, .7], [10.82, 1.3], [12.18, 2.0], [13.0, 2.5], [14.0, 2.85], [15.0, 3.0],
    [16.2, 3.05], [17.6, 3.08]],
  sig: t => Math.exp(smoothKf(t, HOOK.SIG)), zoom: t => Math.exp(smoothKf(t, HOOK.ZOOM)), g: t => smoothKf(t, HOOK.G),
  // the far retreat scales the world about A (the ground under the creature), which slides from where the page drew it
  // to F_END (the foot of the frame) as the zoom goes from 1 to Z_END
  A: [1230, 700], F_END: [1040, 985], Z_END: .093,
  // the year stamp: 2020 until it starts to grow, then a year a beat of the line ("Don't", "quiet", "on", "now"); it holds
  // on 2026 through the ominous growth in the hush, and only a moment before the riffle starts rewinding does it slam
  // onto 2027: "this is what's coming" (Neel, 3 Oct, late; earlier: "I want the monstrous shoggoth to be 2027 and for
  // viewers to notice")
  YEARS: [[6.7, 2021], [7.9, 2022], [9.48, 2023], [10.82, 2024], [11.62, 2025], [12.18, 2026], [15.55, 2027]],
  STAMP: { x: 1690, y: 128, size: 80 },   // bigger in the opening than the verses' HUD (52), so the count is seen
  // headed the way Hooke's Micrographia heads its chapters ("Observ. I. Of the Point of a sharp small Needle"): Zoom In
  // compares interpretability to Micrographia, and a field notebook of drawings through a lens is one (reference bank M5)
  NOTES: [[4.4, 'Observ. I. thinking about cats'], [5.4, "Observ. II. it's harmless"], [6.0, 'Observ. III. I can see all of it']],
  STRIKE: 8.6,   // ...which she strikes out as its thoughts go dark
};
HOOK.year = t => { let y = 2020; for (const [tk, v] of HOOK.YEARS) { if (t < tk) break; y = v - 1 + ease(seg(t, tk, tk + .3)); } return y; };
HOOK.stampThumps = [0.86, ...HOOK.YEARS.slice(0, -1).map(k => k[0])];
HOOK.T2027 = HOOK.YEARS[HOOK.YEARS.length - 1][0];

// world -> screen for the far layer (the creature). Before the crack it is the identity (the page as drawn).
function hookCam(t) {
  const z = HOOK.zoom(t), phi = (1 - z) / (1 - HOOK.Z_END), [ax, ay] = HOOK.A;
  const fx = lerp(ax, HOOK.F_END[0], phi), fy = lerp(ay, HOOK.F_END[1], phi);
  return { z, TS: ([x, y]) => [fx + z * (x - ax), fy + z * (y - ay)] };
}

// The near layer: her and the lens, one drawing, at the scale where the lens (in her hand) is her point of view. Her
// hand grips the handle just inside the bottom right corner; the rest of her is off the frame to the right and below.
// Pulling back, the layer shrinks about her hand (over her shoulder: her head and arm come into view as she holds the lens
// up to it), then about her feet, which come to rest on the ground in front of it, while she shrinks to a small figure.
const NEAR = {
  L0: [1210, 545], R0: 320, HA: .82, GRIP: 2.1, H: 320 / .075,   // the lens is .075 of her height
  ZOOM: LOGK([[0, 1], [12.0, 1], [12.5, .78], [13.0, .5], [13.6, .28], [14.3, .15], [15.2, .07], [16.2, .028], [17.6, .016]]),
};
NEAR.HAND = [NEAR.L0[0] + Math.cos(NEAR.HA) * NEAR.GRIP * NEAR.R0, NEAR.L0[1] + Math.sin(NEAR.HA) * NEAR.GRIP * NEAR.R0];
NEAR.FEET = [NEAR.HAND[0] + .30 * NEAR.H, NEAR.HAND[1] + .80 * NEAR.H];   // her raised hand ('hold'): .3 ahead, .8 up
function hookNear(t) {
  const z = Math.exp(smoothKf(t, NEAR.ZOOM)), p = ease(seg(t, 12.0, 14.0)), w = ease(seg(t, 13.4, 14.8));
  const Hs = [lerp(NEAR.HAND[0], 1250, p), lerp(NEAR.HAND[1], 820, p)];     // her hand's place on screen, over her shoulder
  const Fs = [lerp(1300, 1180, ease(seg(t, 14.0, 16.2))), 1040];             // then her feet's, on the ground in front of it
  const An = [lerp(NEAR.HAND[0], NEAR.FEET[0], w), lerp(NEAR.HAND[1], NEAR.FEET[1], w)], As = [lerp(Hs[0], Fs[0], w), lerp(Hs[1], Fs[1], w)];
  return { z, TS: ([x, y]) => [As[0] + z * (x - An[0]), As[1] + z * (y - An[1])] };
}
// Her pose and the lens, in near-layer coordinates. Her hand is unsteady, and lifts the lens a little as it grows; in
// the hush she lowers the useless lens (it hangs from her hand).
function hookHands(t) {
  const sway = [3 * wob(t, .23) + 2 * wob(t, .51, .3), 2.5 * wob(t, .31, .7)];
  const lift = clamp(Math.log(HOOK.sig(t) / 100) / Math.log(4.4)), D = [sway[0] + 20 * (1 - lift), sway[1] + 45 * (1 - lift)];
  const low = ease(seg(t, 14.3, 15.5)), [fx, fy] = NEAR.FEET, h = NEAR.H;
  const hand = [lerp(NEAR.HAND[0], fx - .13 * h, low) + D[0], lerp(NEAR.HAND[1], fy - .47 * h, low) + D[1]];
  const ha = lerp(NEAR.HA, -1.25, low);
  const lens = [hand[0] - Math.cos(ha) * NEAR.GRIP * NEAR.R0, hand[1] - Math.sin(ha) * NEAR.GRIP * NEAR.R0];
  return { hand, ha, lens, feet: [fx + D[0], fy + D[1]], head: [fx - .02 * h + D[0], fy - .91 * h + D[1]] };
}

function hookCreature(t, cam, headS) {
  const [bx, by] = cam.TS([HOOK.dish[0], HOOK.dish[1] - 4]);
  const breath = seg(t, 10.9, 11.2) * (1 - seg(t, 11.6, 11.8));            // the pause: everything stares at us
  const wake = t < 3.4 ? 0 : (t - 3.4) * 1.4;                                // asleep, then the eyes open one by one
  // early on the eyes follow the lens about; then they wander; in the hush they all turn to her
  const early = t < 9.6, toHer = t > 13.4;
  const look = early ? [HOOK.lens[0] - 120 + 260 * Math.sin(t * .6), HOOK.lens[1] - 400] : toHer ? headS : null;
  const lookK = early ? 1 - ease(seg(t, 9.0, 9.6)) : toHer ? ease(seg(t, 13.4, 14.1)) : 0;
  const frontK = 1 - ease(seg(HOOK.sig(t), 650, 1050));                     // up close its front arms would be flat wedges
  shoggoth(bx, by, HOOK.sig(t), HOOK.g(t), t, { seed: 3, wake, stare: breath, look, lookK, blinkAll: 15.2, frontK });
}

// What it is thinking, in a thought bubble over its head: easy to read at first (obs. 1, a cat). As it starts to grow a
// car crowds in (one neuron, cat faces and car fronts: verse 1's 4e:55), then a tangle; then the bubble clouds over and
// is gone by "Don't go quiet".
function hookThought(t) {
  const s = HOOK.sig(t), pop = backOut(seg(t, 4.1, 4.45)), gone = ease(seg(t, 8.5, 9.4)), k = pop * (1 - gone);
  if (k <= .01) return;
  const top = HOOK.dish[1] - 4 - s * 1.4, cx = HOOK.dish[0] + 70 + s * .2, cy = top - 95, r = 78 * k;
  boilSeed('thought');
  [[.25, 40], [.5, 22]].forEach(([q]) => inkPath2d(ell2d(lerp(HOOK.dish[0] + 25, cx - r * .6, q), lerp(top + 10, cy + r * .7, q), 9 * k * (1 - q * .4), 8 * k * (1 - q * .4), 0, 10, .4), { col: PENCIL, sw: 2, close: true, fill: DQ.cream }));
  const P = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; P.push([cx + Math.cos(a) * r * 1.35 * (1 + .1 * Math.cos(a * 7)), cy + Math.sin(a) * r * (1 + .1 * Math.cos(a * 7))]); }
  const cloud = mixCol(DQ.cream, '#6E6658', ease(seg(t, 8.4, 9.0)));      // clouds over
  inkPath2d(P, { col: PENCIL, sw: 2.2, close: true, fill: cloud, j: .5 });
  const show = 1 - ease(seg(t, 8.3, 8.7));
  if (show <= .02) return;
  const cat = 1 - .45 * ease(seg(t, 7.2, 7.6)), car = ease(seg(t, 7.2, 7.6)), tangle = ease(seg(t, 7.9, 8.4));
  catFace(cx - 18 * car, cy + 6, 26 * k * cat, mixCol(DQ.ink, DQ.paper, 1 - show));
  if (car > 0) carFront(cx + 34, cy + 10, 26 * k * car, mixCol(DQ.ink, DQ.paper, 1 - show));
  if (tangle > 0) {   // too many thoughts at once
    const T = []; for (let i = 0; i < Math.floor(36 * tangle); i++) T.push([cx + (hash(i * 3.7) - .5) * r * 2.1, cy + (hash(i * 5.3) - .5) * r * 1.4]);
    if (T.length > 2) pen(through(T, 3), { sw: 2, col: PENCIL, alpha: show });
  }
}

// On "now" the petri dish shatters: shards of its rim fly out, tumble, and land (world units, through the far camera).
function hookShards(t, cam) {
  const tau = t - HOOK.tNow(); if (tau < 0) return;
  const cx = HOOK.dish[0], cy = HOOK.dish[1] + 14, rx = HOOK.R * .74, ry = rx * .36;
  for (let k = 0; k < 10; k++) {
    const th = k / 10 * TAU + hash(k * 2.3) * .5, sp = 520 + 520 * hash(k * 4.1);
    const p0 = [cx + Math.cos(th) * rx, cy + Math.sin(th) * ry], v = [Math.cos(th) * sp, -380 - 520 * hash(k * 5.9)];
    const land = p0[1] + 10 + 30 * hash(k * 6.7), a = 1300;                 // falls back to the floor at its own depth
    const tl = (-v[1] + Math.sqrt(v[1] * v[1] + 4 * a * (land - p0[1]))) / (2 * a), tt = Math.min(tau, tl);
    const [sx, sy] = cam.TS([p0[0] + v[0] * tt, p0[1] + v[1] * tt + a * tt * tt]);
    const r = (16 + 18 * hash(k * 3.3)) * cam.z, rot = (hash(k * 7.7) - .5) * 14 * tt, flat = tt < tl ? 1 : .5;
    if (r < .8) continue;
    const P = [0, 1, 2].map(i => { const ang = rot + i * 2.1 + hash(k * 9 + i) * .8, rr = r * (.6 + .6 * hash(k * 11 + i)); return [sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr * flat]; });
    inkPath2d(P, { col: DQ.sepia, sw: Math.max(.6, r * .06), close: true, fill: 'rgba(216,233,230,.75)', j: .2 });
  }
}

function hookMain(t, lt, dur) {
  const tNow = HOOK.tNow(), burst = t >= tNow, cam = hookCam(t), near = hookNear(t), hd = hookHands(t);
  const L = { c: near.TS(hd.lens), R: NEAR.R0 * near.z, ha: hd.ha }, headS = near.TS(hd.head);
  // open close on the sleeping toy through the lens, then pull back (from the stamp's thump at 0.86) to reveal the page
  const pull = ease(seg(t, .9, 3.4)), zoom = lerp(2.3, 1, pull);
  camBegin(lerp(HOOK.dish[0] + 10, W / 2, pull), lerp(HOOK.dish[1] - 70, H / 2, pull), zoom);
  notebookPage();

  // title, written on in ink (1.0-2.6 s), and the specimen tags around the lens
  const tA = 1 - seg(t, 12.0, 12.6);
  tx("Don't Go Quiet On Me", 330, 160, { font: DQF.serif, style: 'italic', size: 96, color: DQ.ink, align: 'left', reveal: seg(t, 2.9, 4.1), alpha: tA, role: 'label', id: 'title' });
  tx('field notes on a growing model', 336, 214, { font: DQF.hand, size: 40, color: DQ.sepia, align: 'left', reveal: seg(t, 3.9, 4.6), alpha: tA, role: 'fine' });
  // the naturalist's observations, written on in the empty margin as the strings swell; gone before the lyric arrives
  HOOK.NOTES.forEach(([t0, str], k) => { if (t > t0) tx(str, 330, 430 + k * 92, { font: DQF.hand, size: 50, color: DQ.sepia, align: 'left', reveal: seg(t, t0, t0 + (k === 2 ? .6 : .7)), alpha: 1 - seg(t, 9.1, 9.45), role: 'label', id: 'obs' + k }); });
  if (t > 4.9) {   // the 2012 "cat neuron" picture (reference bank r2 R01; Neel picked it, 3 Oct), a fuzzy grey
    // cat face from a sparse autoencoder (Le et al.), pasted in beside "thinking about cats"
    const a = seg(t, 4.9, 5.3) * (1 - seg(t, 9.1, 9.45)), s = 62;
    queue2d(c => { c.save(); c.globalAlpha = a; c.translate(906, 402); c.rotate(-.07);
      c.fillStyle = '#8F8A81'; c.fillRect(-s / 2, -s / 2, s, s);
      c.filter = 'blur(2.4px)'; c.fillStyle = '#CFCAC0';
      c.beginPath(); c.ellipse(0, s * .06, s * .3, s * .25, 0, 0, TAU); c.fill();
      for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * s * .27, -s * .02); c.lineTo(d * s * .2, -s * .34); c.lineTo(d * s * .05, -s * .13); c.fill(); }
      c.fillStyle = '#45413A'; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * s * .11, s * .01, s * .05, s * .04, 0, 0, TAU); c.fill(); }
      c.beginPath(); c.ellipse(0, s * .12, s * .035, s * .025, 0, 0, TAU); c.fill();
      c.filter = 'none'; c.strokeStyle = DQ.sepia; c.lineWidth = 2; c.strokeRect(-s / 2, -s / 2, s, s);
      c.fillStyle = 'rgba(238,226,190,.75)'; c.fillRect(-s * .22, -s * .58, s * .44, s * .16);   // a strip of tape
      c.restore(); });
  }
  if (t > 7.62) {   // as it starts to grow (a car crowds into its thoughts), she hedges: a red caret, and "mostly" written in
    // above "it's harmless": the Hitchhiker's Guide's entry for Earth, revised after fifteen years of field research
    // (reference bank r2 R02)
    const st = { font: DQF.hand, size: 50 }, cx = 330 + measure("Observ. II. it's", st).w + measure(' ', st).w / 2, y = 430 + 92, a = 1 - seg(t, 9.1, 9.45);
    inkPath2d([[cx - 9, y + 15], [cx, y - 1], [cx + 9, y + 15]], { col: DQ.verm, sw: 3.5, alpha: .9 * a * seg(t, 7.62, 7.7) });
    tx('mostly', cx + 4, y - 45, { font: DQF.hand, size: 33, color: DQ.verm, align: 'center', rot: -.04, reveal: seg(t, 7.68, 8.1), alpha: a, role: 'label', id: 'mostly' });
  }
  if (t > HOOK.STRIKE) {   // "I can see all of it", struck out in red pencil as its thoughts go dark
    const st = { font: DQF.hand, size: 50 }, x0 = 330 + measure('Observ. III. ', st).w - 6, x1 = 330 + measure(HOOK.NOTES[2][1], st).w + 8, y = 430 + 2 * 92 - 16;
    const q = easeOut(seg(t, HOOK.STRIKE, HOOK.STRIKE + .25));
    inkPath2d([[x0, y + 3], [lerp(x0, x1, q * .5), y - 2], [lerp(x0, x1, q), y + 1]], { col: DQ.verm, sw: 5, alpha: .9 * (1 - seg(t, 9.1, 9.45)) });
  }

  // the view through her lens: the magnified page behind the creature, clearing on "now" as we pull back
  const view = 1 - seg(t, tNow - .05, tNow + .2);
  if (view > 0) magnifiedPage(L.c[0], L.c[1], L.R, 2.6, 36, view);
  const dish = [HOOK.dish[0], HOOK.dish[1] + 14, HOOK.R * .74];
  if (!burst) petriDishBack(...dish);
  hookCreature(t, cam, headS);
  if (!burst) petriDishFront(...dish);
  flushLetters();
  hookThought(t);
  hookShards(t, cam);
  flushLetters();
  // the lens, in front of it: it cracks on "on me" (it is pressing on the glass) and stays cracked in her hand
  magnifier(L.c[0], L.c[1], L.R, { handleAng: L.ha, crack: seg(t, 11.75, 12.15), crackAt: [L.c[0] + 40 * L.R / HOOK.R, L.c[1] - 30 * L.R / HOOK.R] });
  // her, gripping the handle: only her hand shows until the pull-back
  const [fx, fy] = near.TS(hd.feet), h = NEAR.H * near.z, hand = near.TS(hd.hand);
  if (fy < H + 60) { boilSeed('hookResShadow'); paint(ellPts(fx - h * .03, fy + h * .005, h * .2, h * .035, 16), { fill: '#5B6A7E', fillOp: 55, bleed: .3, tex: .4, ink: null }); }
  const close = h > 500;   // up close her hand is a fist round the handle, not the board figure's mitten
  researcher(fx, fy, h, t, { pose: 'hold', hand, face: -1, back: true, noHand: close });
  if (close) gripHand(hand[0], hand[1], L.ha, h * .03);

  // specimen tag (before the burst): the eye count is crossed out and rewritten as it grows
  if (t > 3.0 && t < 12.2) {
    const a = seg(t, 3.0, 3.4) * (1 - seg(t, 11.9, 12.2));
    const nE = Math.floor(SHOG.nEyes(HOOK.g(t)));
    specimenTag(1600, 300, ['SPECIMEN No. 1', 'toy model, 1 layer'], { size: 26, w: 300, string: [[L.c[0] + L.R * .72, L.c[1] - L.R * .55]] });
    tx(`eyes: ${nE}`, 1620, 445, { font: DQF.hand, size: 44, color: DQ.sepia, align: 'left', alpha: a, role: 'fine' });
    if (nE > 3) inkPath2d([[1615, 431], [1705, 425]], { col: DQ.verm, sw: 2.5, alpha: a * .7 });
  }

  camEnd();
  // the lyric: hand-set in big serif, each word on its onset; "quiet" writes on through its long note. A paper outline
  // from the start (invisible on the page) keeps them legible once the creature is behind them.
  const W_ = HOOK.words(), wt = i => (W_[i] && W_[i].t0) ?? 99, la = 1 - seg(t, 14.6, 15.4);
  const word = (i, str, x, y, size, o = {}) => {
    const t0 = wt(i); if (t < t0 - .04) return;
    const k = easeOut(seg(t, t0 - .04, t0 + .14));
    tx(str, x, y + 18 * (1 - k), { font: DQF.serif, size, color: DQ.ink, align: 'left', alpha: k * la, stroke: DQ.paper, sw: size * .09, role: 'lyric', id: 'w' + i, ...o });
  };
  word(0, "Don't", 300, 410, 140); word(1, 'go', 640, 410, 140);
  word(2, 'quiet', 300, 580, 180, { style: 'italic', reveal: seg(t, wt(2), wt(2) + .7) });
  word(3, 'on', 300, 730, 140); word(4, 'me', 480, 730, 140);
  if (t >= wt(5) - .04) {   // "now": stamped big as the fourth line as the creature fills the frame
    const k = backOut(seg(t, wt(5) - .04, wt(5) + .3));
    tx('now', 300, 990, { font: DQF.serif, style: 'italic', size: 300 * k, color: DQ.ink, align: 'left', alpha: la, stroke: DQ.paper, sw: 26, role: 'lyric', id: 'now' });
  }
  // the year stamp, ticking up a year a beat as it grows (on a paper label: it sits over the creature later); 2027 lands
  // with a slam: it jumps to half again its size and settles
  const th = hitPulse(t, HOOK.stampThumps, 9), slam = t >= HOOK.T2027 ? Math.exp(-(t - HOOK.T2027) * 3.2) * (1 - Math.exp(-(t - HOOK.T2027) * 40)) : 0;
  const S = HOOK.STAMP;
  if (t >= .86 && t < 16.16) yearStamp(HOOK.year(t), S.x, S.y, { size: S.size * (1 + .55 * slam), thump: th, alpha: .95 * Math.min(1, seg(t, .86, .95) * 3), bg: DQ.paper });
}

// the orchestral hit at 16.16: the notebook riffles back from 2027, a page a beat, one interp figure per year, and stops
// in 2020, where the song begins (Neel's picks, 3 Oct: a thought read while it writes something else; the eval-aware
// model; the bridge; features in bands by fraction of a dimension; the grokking clock and its plummeting loss; a head
// looking back at a repeat; a network cut off at every layer, its guesses converging). No captions, no names.
const HOOK_PAGES = [
  { year: 2027, live: true },
  { year: 2026, draw: GLIMPSE.jlens },
  { year: 2025, draw: GLIMPSE.woodlabs },
  { year: 2024, draw: GLIMPSE.bridge },
  { year: 2023, draw: GLIMPSE.staircase },
  { year: 2022, draw: GLIMPSE.grokking },
  { year: 2021, draw: GLIMPSE.induction },
  { year: 2020, draw: GLIMPSE.logitLens, dark: true },
];
function hookRiffle(t, lt, dur) {
  if (t < 16.16 + BEAT) hookMain(t, t, dur);   // the first page turns in over the live scene
  else notebookPage();
  const r = riffle(t, 16.16, HOOK_PAGES, { per: BEAT });
  const dark = HOOK_PAGES[r.page].dark, S = HOOK.STAMP, k = ease(seg(t, 16.16, 16.16 + 7 * BEAT));   // shrinks to the verses' HUD size
  yearStamp(r.year, lerp(S.x, 1735, k), lerp(S.y, 105, k), { size: lerp(S.size, 52, k), thump: r.q < .2 ? 1 - r.q * 5 : 0, alpha: .95, col: dark ? '#E8806A' : DQ.verm, bg: dark ? '#1E1B22' : DQ.paper });
}

shots([
  [0, hookMain],
  [16.16, hookRiffle],
]);
