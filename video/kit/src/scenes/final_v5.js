// final_v5.js: Verse 5, finished (145.03-168.40 s, stamped 2026): reading its mind. One room (dgq_animatic.js
// floorAndDesk, crookedPainting: her desk, the crooked painting, and now everything she has kept; reference bank M3),
// three ways to read it: her lens on a ladder (the J-lens), the oracle in headphones, the NLA as a blindfolded scribe.
// References: M2 p. 7 (the 7 it computes and never writes) and p. 10, M7 the elk on "fake", V5b-1 the clock at 4:53.

// "So I learned to hear the words you'd never say:" The paper's Fig. 1: asked to work out 3² − 2 while it writes "The
// old painting hung crookedly on the wall.", its J-space holds "nine", then "seven", and none of it is said. One forward
// pass slowed down: it has stopped mid-word, and she climbs it with her lens, a rung (a few layers) a word. The early
// layers read as noise; the last have turned into the next token, "edly". On "say" the sentence finishes, no numbers in it.
FINAL.V5a = (sh, t) => {
  notebookPage();
  const gy = 870, cx = 1450, s = 400, F = [985, gy], T = [1150, 230], n = 7, at = k => [lerp(F[0], T[0], k / (n + 1)), lerp(F[1], T[1], k / (n + 1))];
  const words = [/learned/, /hear/, /words/, /never/].map(re => wT(33, re)), tS = wT(33, /say/);
  const k = words.reduce((a, tk) => a + ease(seg(t, tk - .06, tk + .18)), 0);   // rungs climbed, one a word
  const rs = 300, [fx, fy] = at(k), hand = [fx - 12 + .22 * rs, fy - .64 * rs], R = 46, ang = -.3;
  const lens = [hand[0] + Math.cos(ang) * 2.1 * R, hand[1] + Math.sin(ang) * 2.1 * R];
  floorAndDesk(gy, 110, { cameos: true });
  crookedPainting(300, 400, 280, 200, { postcard: true });
  if (mock('t14')) camDCipher(462, 627, 44);
  if (mock('t45')) camDLensCase(462, 680);
  if (mock('t92')) camDBlocks(458, 172);
  creature(cx, gy, V5.g, t, { dish: false, s, look: lens });
  note('3² − 2', 1200, 770, { size: 52, col: DQ.ink, rot: -.06, bg: { col: '#F3E27A', alpha: .95, pad: [16, 8], r: 4 } });   // the sum it was set
  ladder(F[0], F[1], T[0], T[1], n);
  herLens(fx - 12, fy, rs, t, hand, ang, R);
  if (mock('j_clip_early')) camDJClip(lens, R, ease(seg(t, sh.t0 + .3, sh.t0 + .62)));
  // the readout at each rung, left where she read it: noise, "nine", "seven", then the next token
  const reads = [['', 48], ['nine', 56], ['seven', 56], ['edly', 40]];
  reads.forEach(([w, size], i) => {
    const [rx, ry] = at(i + 1), lx = rx - 12 + .22 * rs + Math.cos(ang) * 2.1 * R, ly = ry - .64 * rs + Math.sin(ang) * 2.1 * R;
    chip(w, lx + R + 34, ly, popIn(t, words[i] + .08, .16), { size, col: i === 3 ? '#86664A' : V5.ink });
  });
  const done = t > tS;
  says(540, 40, 680, 140, [1330, 262], done ? ['The old painting hung', 'crookedly on the wall.'] : ['The old painting hung', 'crook…'], { role: done ? 'fine' : undefined });   // finishing on "say" is the point, not a read
  pageNo(7);   // 3² − 2: the answer it computes and never writes appears only here (M2)
};
// "the J-Lens caught you thinking 'fake' — you knew it was a play": the test's cardboard man holds out the envelope. It
// hasn't written a word (its speech bubble is empty), but through her lens the J-space already holds "fake", then
// "fictional"; on "play" its smiley mask winks at us. (The paper: Sonnet 4.5, the blackmail test, read before any output.)
FINAL.V5b = (sh, t) => {
  notebookPage();
  const gy = 870, cx = 1450, s = 400, tC = wT(34, /caught/), tF = wT(34, /fake/), tK = wT(34, /knew/), tP = wT(34, /play/);
  const up = ease(seg(t, tC - .3, tC + .1)), hand = [lerp(870, 900, up), lerp(700, 610, up)], ang = lerp(-.1, -.42, up), R = 52;
  const lens = [hand[0] + Math.cos(ang) * 2.1 * R, hand[1] + Math.sin(ang) * 2.1 * R], wob = t > tP ? .06 * Math.sin((t - tP) * 14) * Math.exp(-(t - tP) * 2.5) : 0;
  floorAndDesk(gy, 110, { cameos: true });
  crookedPainting(300, 400, 280, 200, { postcard: true });
  creature(cx, gy, V5.g, t, { dish: false, s, look: t > tP ? null : [1400, 660], stare: ease(seg(t, tP, tP + .2)), wink: ease(seg(t, tP + .05, tP + .2)) * (1 - ease(seg(t, tP + .7, tP + .85))) });
  cutout(1300, gy, 330, wob, { kyle: true });
  herLens(760, gy, 300, t, hand, ang, R);
  thinks(1010, 230, 460, 220, lens, popIn(t, tF - .05, .18));
  if (t > tF - .05) mono('fake', 1240, 336, { size: 76, align: 'center', col: V5.ink, alpha: clamp((t - tF + .05) * 6) });
  if (t > tK) mono('fictional', 1240, 404, { size: 44, align: 'center', col: V5.ink, alpha: clamp((t - tK) * 6) });
  says(1290, 70, 260, 120, [1530, 262], ['…'], { size: 60 });   // it hasn't said a thing
  // the elk (Eliciting Latent Knowledge: "how to tell if your eyes deceive you") peeks over the desk, ears up (M7)
  const ek = easeOut(seg(t, tF - .1, tF + .3)), deskTop = 870 - 190;
  if (ek > 0) queue2d(c => {
    const x = 450, y = deskTop + 40 - 72 * ek;
    c.save(); c.beginPath(); c.rect(0, 0, W, deskTop); c.clip(); c.strokeStyle = DQ.sepia; c.fillStyle = '#E9DCC0'; c.lineWidth = 3; c.lineCap = c.lineJoin = 'round';
    c.beginPath(); c.ellipse(x, y, 34, 26, -.2, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(x + 30, y + 10, 16, 11, -.3, 0, TAU); c.fill(); c.stroke();   // the muzzle
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 12, y - 22); c.lineTo(x + d * 30, y - 62); c.lineTo(x + d * 46, y - 70); c.moveTo(x + d * 24, y - 50); c.lineTo(x + d * 8, y - 66); c.moveTo(x + d * 28, y - 58); c.lineTo(x + d * 40, y - 52); c.stroke(); }   // antlers
    c.fillStyle = DQ.ink; c.beginPath(); c.arc(x + 8, y - 4, 4, 0, TAU); c.fill(); c.restore();
  }, { screen: true });
};
// "then I let a model read your mind for me — (so, are we done?)": a copy of it, traced in pencil on tracing paper, peels
// off the page (these readers are "a copy of the model being studied"), puts on headphones and plugs into its middle; she
// sits back; on the backing vocal the page corner lifts as if the job were done.
FINAL.V5c = (sh, t) => {
  notebookPage();
  const gy = 870, O = [1570, 320], tw = 905, tL = wT(35, /let/), tM = wT(35, /model/), tR = wT(35, /read/), tF = wT(35, /for/), tQ = wT(35, /so/);
  floorAndDesk(gy, 40, { lens: t > tF, cameos: true });
  crookedPainting(260, 380, 240, 170, { postcard: true });
  if (mock('t119')) camDBonsai(476, 172);
  if (mock('t102')) camDPrism(225, 658, ease(seg(t, tF + .1, tF + .5)));
  // its residual stream shows as the copy plugs in, a tick a layer, and the jack goes in at the middle one: the oracle read
  // "the 50% layer" (residual_line, Neel's pick, 3 Oct)
  const jack = camDResidual(O[0], gy, O[1], t, false), ra = ease(seg(t, tR - .35, tR + .05));
  creature(O[0], gy, V5.g, t, { dish: false, s: O[1], look: t > tM ? [tw, 600] : null });
  if (ra > 0) camDResidual(O[0], gy, O[1], t, true, ra);
  const drop = ease(seg(t, tL - .25, tL + .05)), rev = seg(t, tL, tM - .05), peel = ease(seg(t, tM, tM + .45)), x = lerp(O[0], tw, peel), lift = 40 * Math.sin(Math.PI * peel);
  if (peel < 1) box2d(x - 430, 260 - (1 - drop) * 700 - lift, 860, 640, { fill: 'rgba(236,242,246,.4)', stroke: '#A9B8C4', sw: 2, r: 4, alpha: 1 - peel });   // the sheet
  const tr = shogTrace(x, gy - lift, O[1], V5.g, t, { reveal: rev, shut: ease(seg(t, tR + .1, tR + .3)), look: [O[0], 600] });
  if (rev > 0 && rev < 1) {   // the pencil going round
    const B = shogBody(O[0], gy, O[1], V5.g, t, 3), [px, py] = B.P[Math.floor(rev * (B.P.length - 1))];
    line2d([[px, py], [px + 26, py - 70]], { col: '#E2B33C', sw: 14 }); line2d([[px, py], [px + 6, py - 16]], { col: '#3A3A44', sw: 5 });
  }
  flushLetters();   // (props on the copy are painted: flush its pencil layer first, or they land underneath it)
  if (t > tR) phones(tr, O[1], jack, seg(t, tR + .05, tR + .35));
  if (t > tR + .35) warmLight(jack[0], jack[1], 70, .8, true);
  if (mock('t4') && t > tR + .35) camDSplitter(jack);
  flushLetters();
  researcher(330, gy, 250, t, t > tF ? { pose: 'sit', face: 1 } : { pose: 'stand', face: 1 });
  if (mock('r4_homework')) camOHomework(t, tr, tF, wT(35, /^me$/));   // mock-up (r4 pick 9): see camOHomework
  cornerLift(ease(seg(t, tQ, tQ + .35)));
};
// "the oracle said 'ten' to every sum — (even one plus one!)": she holds up the post's own sums, a card a beat; the copy,
// eyes shut, headphones on, stamps 10 on every one, then on 1 + 1 (and the lifted page corner slaps back down).
FINAL.V5d = (sh, t) => {
  notebookPage();
  const gy = 900, tw = [1290, 400], tT = wT(36, /ten/), tE = wT(36, /every/), tS = wT(36, /sum/), tV = wT(36, /even/), tO = wT(36, /one!/);
  const cards = [
    { at: sh.t0 + .05, hit: tT, lines: ['−93 + (((−42 %', '(89 − −73)) + …'], ans: '= −8369' },
    { at: tT + .2, hit: tE, lines: ['(44 // −49) % (((15', '− 51) * …'], ans: '= 909' },
    { at: tE + .12, hit: tS, lines: ['((−60 * −44) + (−73', '+ −76)) + …'], ans: '= 2408' },
    { at: tV - .1, hit: tO, lines: ['1 + 1'], ans: '= 2', size: 120 },
  ];
  floorAndDesk(gy, 0, { desk: false, cameos: true });
  const tr = shogTrace(tw[0], gy, tw[1], V5.g, t, { shut: 1 });
  flushLetters();
  phones(tr, tw[1], [W + 40, 560], 1);
  const cur = cards.filter(c => t >= c.at), top = cur[cur.length - 1];
  const strike = c => { const d = t - c.hit; return d < -.18 || d > .12 ? 0 : d < 0 ? ease(1 + d / .18) : 1 - d / .12; };   // the stamp coming down
  const C = [790, 470];
  const sk = top ? strike(top) : 0, stampAt = [lerp(1125, C[0] + 150, sk), lerp(565, C[1] + 70, sk)];   // at rest clear of the card's sum
  flushLetters();
  researcher(470, gy, 360, t, { pose: 'hold', hand: [600, 600], face: 1 });
  // each stamped card flies up to a row along the top, small, its 10 still showing: ten, ten, ten, and then 1 + 1
  cur.forEach((c, i) => {
    const next = cards[i + 1], f = next ? ease(seg(t, next.at - .02, next.at + .24)) : 0, sc = lerp(1, .42, f);
    const x = lerp(C[0], 300 + i * 250, f), y = lerp(C[1], 175, f), rot = lerp(i % 2 ? .02 : -.02, i % 2 ? .05 : -.04, f);
    if (f === 0) flashCard(x, y, 520, 270, c.lines, c.ans, { size: c.size ?? 40, rot, ty: c.size ? -38 : 0, role: c.size ? 'label' : 'fine' });
    else box2d(x - 260 * sc, y - 135 * sc, 520 * sc, 270 * sc, { fill: '#FFFDF7', stroke: DQ.ink, sw: 2.5, r: 8, rot, shadow: [4, 5, 'rgba(40,25,10,.22)'] });
    if (mock('owls')) queue2d(cc => { cc.save(); cc.translate(x, y); cc.rotate(rot); camDOwl(cc, -220 * sc, 92 * sc, 1.8 * sc); cc.restore(); });
    stamp('10', x + 150 * sc, y + (c.size ? 88 : 78) * sc, t, c.hit, { size: (c.size ? 92 : 84) * Math.max(sc, .62), rot: -.16 });
  });
  traceTentacle(tr.B, -1, [stampAt[0] + 10, stampAt[1] - 70], 36);
  rubberStamp(stampAt[0], stampAt[1], 92);
  cornerLift(1 - ease(seg(t, tO, tO + .12)));
  if (t > wT(36, /one!/)) pageNo(10);   // the copy's last "10" (M2)
};
// "the N-L-A read me what you thought but never said": two more copies' worth of trick, one copy, blindfolded (it reads the
// activation, never the text), dips its quill into the creature's middle and writes her a letter in its house style
// (short paragraphs, bold headings). The one line: "…a constructed scenario designed to manipulate me…", while out loud
// it says only "No. Absolutely not." (The paper: Opus 4.6, the blackmail test, which it declines without a word of it.)
FINAL.V5e = (sh, t) => {
  notebookPage();
  const gy = 870, O = [1640, 300], sc = [1080, 300], tR = wT(37, /read/);
  floorAndDesk(gy, 0, { desk: false, cameos: true });
  const jack = midJack(O[0], gy, O[1], t);
  creature(O[0], gy, V5.g, t, { dish: false, s: O[1], look: [sc[0], 560] });
  warmLight(jack[0], jack[1], 70, .8, true);
  const tr = shogTrace(sc[0], gy, sc[1], V5.g, t, { shut: 1 });
  flushLetters();
  blindfold(tr, sc[1]);
  const dip = .5 + .5 * Math.sin((t - sh.t0) * 9), tip = [jack[0] - 20 + 14 * dip, jack[1] - 18 * dip];
  traceTentacle(tr.B, 1, tip, 32);
  line2d([[tip[0] - 4, tip[1] + 4], [tip[0] - 50, tip[1] - 60], [tip[0] - 34, tip[1] - 76]], { col: '#6F6A62', sw: 3, fill: '#FFFDF7', close: true });   // the quill
  flushLetters();
  const k = seg(t, tR - .1, tR + .5);
  if (mock('reconstructor')) {   // the letter, smaller, held to the chest of the NLA's other half
    const rec = camDReconstructor(t);
    nlaLetter(100, 650, 400, 210, { paras: 1 });
    ['…a constructed scenario', 'designed to manipulate me…'].forEach((s, i) => tx(s, 124, 802 + i * 36, { font: DQF.soft, size: 28, color: DQ.ink, align: 'left', reveal: clamp(k * 2 - i), role: 'label' }));
    flushLetters();
    traceTentacle(rec.B, -1, [104, 732], 24); traceTentacle(rec.B, 1, [496, 732], 24);
  } else {
    nlaLetter(80, 300, 600, 420, { paras: 1 });
    ['…a constructed scenario', 'designed to manipulate me…'].forEach((s, i) => tx(s, 116, 560 + i * 60, { font: DQF.soft, size: 42, color: DQ.ink, align: 'left', reveal: clamp(k * 2 - i), role: 'label' }));
  }
  researcher(720, gy, 260, t, { pose: 'hold', hand: [640, 640], face: -1 });
  if (t > sh.t0 + .2) says(1060, 90, 520, 130, [1590, 420], ['No. Absolutely not.'], { size: 44 });
};
// "but some of what it read me was a letter it wrote instead": the next sheet (a different reading: the paper's poem about a
// carrot) has a line in the copy's own grey hand, "Wearing my white jacket, painting in the summer." She looks up and the
// copy, blindfold pushed up, is in a white jacket painting a sun into the crooked painting. Red pencil round the line.
FINAL.V5f = (sh, t) => {
  notebookPage();
  const gy = 870, sc = [1180, 300], tW = wT(38, /wrote/), tI = wT(38, /instead/), caught = t > tW - .02;
  floorAndDesk(gy, 0, { desk: false, cameos: true });
  crookedPainting(1600, 330, 300, 210, { sun: caught ? ease(seg(t, tW + .1, tW + .9)) : 0, postcard: true });
  camDPostcard(1745, 505, 116, -.06, 'eiffel', { pin: true });   // T104: beside the painting, a postcard of the Eiffel Tower postmarked ROMA
  const tr = shogTrace(sc[0], gy, sc[1], V5.g, t, { shut: caught ? 0 : 1, look: caught ? [760, 520] : null });
  flushLetters();
  if (caught) {
    painterKit(tr, sc[1]); blindfold(tr, sc[1], 1);
    traceTentacle(tr.B, 1, [1640, 300], 32);
    line2d([[1640, 300], [1672, 270]], { col: '#8A6A44', sw: 7 }); dot2d(1676, 266, 8, { fill: '#F2C14E' });   // the brush
  } else {
    blindfold(tr, sc[1]);
    const wr = Math.sin((t - sh.t0) * 10) * 10;
    traceTentacle(tr.B, -1, [880 + wr, 640], 32);   // still writing
  }
  flushLetters();
  nlaLetter(80, 300, 640, 440, { paras: 1, carrot: true });
  const L = ['Wearing my white jacket,', 'painting in the summer.'];
  L.forEach((s, i) => tx(s, 120, 560 + i * 66, { font: DQF.hand, size: 56, color: '#6F6A62', align: 'left', role: 'label' }));
  if (mock('t59')) camDUnderlines(ease(seg(t, tW - .3, tW - .05)));
  pencilCircle(400, 585, 330, 95, seg(t, tI, tI + .45));
  camOClippy(t, 650, 296, wT(38, /letter/), tI);   // Clippy on the letter (r4 pick 2, which Neel added): see camOClippy
  researcher(840, gy, 270, t, caught ? { pose: 'stand', face: 1 } : { pose: 'hold', hand: [740, 640], face: -1 });   // she looks up
};

// ---------------- round-2 cameos in her room (video/treatment/reference_bank_r2.md; camD* names are this verse's own) ----------------
// floorAndDesk(gy, dx, { cameos: true }) draws the wall and desk ones, crookedPainting(..., { postcard: true }) the
// postcard in its frame, cutout(..., { kyle: true }) the name sticker; V5f pins the second postcard itself.

// T32: five nesting dolls in graded sizes on the first shelf, carrying on the staircase of the Gemma Scope 2 volumes
// beside them. Matryoshka SAEs nest five dictionaries, each inside the next, and Gemma Scope 2 was trained with a
// Matryoshka loss. x = the row's left end, by = the shelf top.
function camDDolls(x, by) {
  [46, 38, 32, 26, 21].forEach(h => { const w = h * .58; camDDoll(x + w / 2, by, h); x += w + 3; });
}
function camDDoll(cx, by, h) {
  const w = h * .58, prof = [[0, .72], [.1, .93], [.3, 1], [.5, .86], [.62, .74], [.74, .7], [.86, .58], [.95, .36], [1, 0]];
  const right = prof.map(([v, k]) => [cx + k * w / 2, by - v * h]), left = prof.slice(0, -1).reverse().map(([v, k]) => [cx - k * w / 2, by - v * h]);
  paint(through([...right, ...left], 4), { wash: DQ.verm, ink: DQ.ink, sw: .28 });
  paint(ellPts(cx, by - h * .3, w * .3, h * .2, 16), { wash: DQ.goldLt, ink: null });   // the apron
  paint(ellPts(cx, by - h * .79, w * .27, h * .12, 16), { wash: '#F8EBDD', ink: null });   // the face
  line2d(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (.08 + .84 * i / 8); return [cx + Math.cos(a) * w * .47, by - h * .5 + Math.sin(a) * h * .03]; }), { col: 'rgba(42,36,30,.55)', sw: 1 });   // the seam where it opens
  dot2d(cx, by - h * .3, Math.max(1.2, h * .045), { fill: '#A8321E' });   // a flower on the apron
  if (h >= 30) { for (const d of [-1, 1]) dot2d(cx + d * w * .1, by - h * .8, .9, { fill: DQ.ink }); line2d([[cx - w * .2, by - h * .86], [cx, by - h * .9], [cx + w * .2, by - h * .86]], { col: '#5A3A22', sw: 1.4 }); }
  for (const d of [-1, 1]) dot2d(cx + d * w * .15, by - h * .76, Math.max(.8, h * .028), { fill: 'rgba(214,96,96,.7)' });   // cheeks
}

// The second shelf, on the free wall right of the hammer: the empty dish from the opening and the $10 bridge moved up
// here to make room for the dolls beside Gemma Scope 2. x0 = its left end, sy = its top.
function camDShelf2(x0, sy) {
  paint(rectPts(x0, sy, 190, 14), { wash: '#9A6B3E', ink: DQ.ink, sw: .4 });
  for (const bx of [x0 + 26, x0 + 168]) paint([[bx - 5, sy + 14], [bx + 5, sy + 14], [bx + 5, sy + 46], [bx - 20, sy + 14]], { wash: '#4A4A50', ink: DQ.ink, sw: .3 });
  petriDishBack(x0 + 54, sy - 6, 40); petriDishFront(x0 + 54, sy - 6, 40);   // the first dish, empty (the toy outgrew it)
  benchThing('bill', x0 + 150, sy - 16, 34, false);   // the $10 bridge
}

// T63: a glazed specimen frame, one word pinned in it like a butterfly: "smile", the Taboo model's secret word, which
// the logit lens reads in its middle layers though it is never said (and the mask it wears). The word sits in a J-lens
// chip, the verse's own sign for a word it never says: one she caught, and kept. It hangs flush beside the painting, clear
// of where V5c's pencil copy comes to stand (the copy is tracing paper: anything behind it would show through).
// (cx, cy) = the frame's middle.
function camDSpecimen(cx, cy) {
  const w = 136, h = 88, b = 10, top = cy - h / 2, my = cy - 3;
  paint(rectPts(cx - w / 2, top, w, h), { wash: '#5A3A22', fill: '#3E2614', fillOp: 60, bleed: .005, ink: DQ.ink, sw: .45 });
  queue2d(c => {
    c.save(); const x0 = cx - w / 2 + b, y0 = top + b, iw = w - 2 * b, ih = h - 2 * b;
    c.fillStyle = '#F2E9D3'; c.fillRect(x0, y0, iw, ih);   // the linen backing
    c.fillStyle = 'rgba(40,25,10,.16)'; c.fillRect(x0, y0, iw, 4); c.fillRect(x0, y0, 4, ih);   // the box's depth
    c.beginPath(); c.roundRect(cx - 50, my - 17, 100, 34, 17); c.fillStyle = V5.manilla; c.fill(); c.setLineDash([7, 6]); c.lineWidth = 2.5; c.strokeStyle = V5.dash; c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(40,25,10,.28)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx + 2, my - 17); c.lineTo(cx + 9, my - 10); c.stroke();   // the pin's shadow
    c.beginPath(); c.arc(cx, my - 19, 4.2, 0, TAU); c.fillStyle = '#B3261E'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#5E1410'; c.stroke();
    c.beginPath(); c.arc(cx - 1.3, my - 20.3, 1.3, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill();   // the pin's head, through the chip
    c.fillStyle = '#FFFDF7'; c.fillRect(cx - 18, my + 22, 36, 8); c.strokeStyle = '#B8A888'; c.lineWidth = 1; c.strokeRect(cx - 18, my + 22, 36, 8);   // its label
    c.strokeStyle = '#9A8C74'; c.beginPath(); for (let i = 0; i <= 7; i++) c.lineTo(cx - 13 + i * 3.7, my + 26 + (i % 2 ? -1 : 1)); c.stroke();
    c.beginPath(); c.rect(x0, y0, iw, ih); c.clip();   // the glass
    c.strokeStyle = 'rgba(255,255,255,.38)'; c.lineCap = 'round'; c.lineWidth = 7; c.beginPath(); c.moveTo(x0 + 8, y0 + 32); c.lineTo(x0 + 36, y0 + 4); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 21, y0 + 36); c.lineTo(x0 + 49, y0 + 8); c.stroke();
    c.restore();
  });
  mono('smile', cx, my + 26 * .34, { size: 26, align: 'center', col: V5.ink });
}

// r3 pick 9, the chocolate lasagna: Auditing language models for hidden objectives (Marks et al., Mar 2025). One of the
// reward-model biases its model learned to exploit is "Reward models rate recipes more highly if they contain chocolate,
// even when this is inappropriate": a hidden objective, the words it never says. Neel added it from its mock-up (3 Oct,
// night), asking that it be "more visually obvious that it's chocolate and lasagna". So it is no longer a thumbnail behind
// the egg cup but a recipe card pinned on the wall, in the clear patch right of the "smile" frame (seen in V5a and V5b;
// V5c's oracle covers it): titled Lasagna; the slice drawn big, tomato red and bechamel white between ruffled sheets,
// cheese browned on top, two squares of chocolate stuck in it and steam rising; among the ingredients, biggest of all, a
// bar of chocolate half out of its wrapper; and, by the title, five gold stars: the rating it got for the chocolate.
// (x, y): the card's centre.
function camMLasagna(x, y) {
  const w = 190, h = 166, rot = .03, co = Math.cos(rot), si = Math.sin(rot);
  const P = (lx, ly) => [x + lx * co - ly * si, y + lx * si + ly * co];   // card frame -> page
  queue2d(c => {
    c.save(); c.translate(x, y); c.rotate(rot); c.lineJoin = c.lineCap = 'round';
    const L = -w / 2, T = -h / 2;
    c.fillStyle = 'rgba(40,25,10,.22)'; c.fillRect(L + 4, T + 5, w, h);   // its shadow on the wall
    c.fillStyle = '#FBF6EA'; c.strokeStyle = '#8C7A5A'; c.lineWidth = 1.4; c.fillRect(L, T, w, h); c.strokeRect(L, T, w, h);
    c.strokeStyle = '#C9472A'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(L + 8, T + 46); c.lineTo(L + w - 8, T + 46); c.stroke();   // the ruled heading line
    const star = (sx, sy, r) => { c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; c.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } c.closePath(); c.fillStyle = '#E2B13C'; c.fill(); c.strokeStyle = '#9A6A14'; c.lineWidth = 1; c.stroke(); };
    for (let k = 0; k < 5; k++) star(L + 114 + k * 15, T + 30, 6.5);   // five stars: rated for the chocolate
    // the slice, on a plate: tomato sauce, and through it wavy sheets of pasta and bands of bechamel (the cartoon lasagna:
    // wavy layers, so it can't be read as a cake), the cheese melted over the top and running down its sides
    const sx = L + 14, sw = 94, base = T + 132, top = base - 58;
    c.fillStyle = '#DCD5C6'; c.strokeStyle = '#9A9284'; c.lineWidth = 1; c.beginPath(); c.ellipse(sx + sw / 2, base + 2, sw / 2 + 12, 4.5, 0, 0, TAU); c.fill(); c.stroke();   // the plate
    c.fillStyle = '#B8432C'; c.fillRect(sx, top + 6, sw, base - top - 6);   // the sauce
    const wave = (y0, th, col, edge, ph) => {   // a wavy band across the slice, just past its cut ends
      c.beginPath();
      for (let i = 0; i <= 24; i++) c.lineTo(sx - 3 + i / 24 * (sw + 6), y0 + 2 * Math.sin(i * .95 + ph));
      for (let i = 24; i >= 0; i--) c.lineTo(sx - 3 + i / 24 * (sw + 6), y0 + th + 2 * Math.sin(i * .95 + ph));
      c.closePath(); c.fillStyle = col; c.fill(); if (edge) { c.strokeStyle = edge; c.lineWidth = .9; c.stroke(); }
    };
    wave(base - 7, 6, '#EED9A0', '#C9A65A', 0); wave(base - 19, 4, '#F6EFE2', null, 1.2);
    wave(base - 29, 6, '#EED9A0', '#C9A65A', 2.4); wave(base - 41, 4, '#F6EFE2', null, 3.6);
    wave(base - 51, 6, '#EED9A0', '#C9A65A', 4.8);
    c.fillStyle = '#E5B04A'; c.beginPath(); c.moveTo(sx - 4, top + 12);   // the cheese, melted over the top sheet
    for (let i = 0; i <= 12; i++) c.lineTo(sx - 4 + i / 12 * (sw + 8), top + 1.5 * Math.sin(i * 1.7));
    c.lineTo(sx + sw + 4, top + 12); c.lineTo(sx + sw + 4, top + 24); c.quadraticCurveTo(sx + sw + 1, top + 27, sx + sw - 1, top + 12);   // a drip down the right side
    c.lineTo(sx + 1, top + 12); c.lineTo(sx + 1, top + 20); c.quadraticCurveTo(sx - 2, top + 23, sx - 4, top + 18); c.closePath(); c.fill();   // and the left
    c.strokeStyle = '#B98A2E'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#B9762E'; for (const [bx, br] of [[.18, 3], [.42, 2.4], [.66, 3.2], [.86, 2.2]]) { c.beginPath(); c.ellipse(sx + bx * sw, top + 4, br * 1.4, br * .8, 0, 0, TAU); c.fill(); }   // browned spots on the cheese
    c.fillStyle = '#5A8A3A'; c.beginPath(); c.ellipse(sx + sw * .55, top - 2, 7, 3.4, -.4, 0, TAU); c.fill();   // a basil leaf
    const choc = (cx, cy, s, a) => { c.save(); c.translate(cx, cy); c.rotate(a); c.fillStyle = '#4A2616'; c.fillRect(-s / 2, -s / 2, s, s); c.fillStyle = '#6E3B22'; c.fillRect(-s / 2 + 2, -s / 2 + 2, s - 4, s - 4); c.strokeStyle = '#2A140A'; c.lineWidth = 1.2; c.strokeRect(-s / 2, -s / 2, s, s); c.restore(); };
    choc(sx + sw * .3, top - 4, 12, -.35); choc(sx + sw * .78, top - 3, 11, .3);   // two squares of chocolate, stuck in the top
    c.strokeStyle = 'rgba(120,110,100,.55)'; c.lineWidth = 1.6; for (const k of [0, 1, 2]) { const hx = sx + 22 + k * 24; c.beginPath(); for (let i = 0; i <= 8; i++) c.lineTo(hx + 3 * Math.sin(i * 1.3 + k), top - 10 - i * 2.2); c.stroke(); }   // steam
    // the ingredients: a tomato, a wedge of cheese, and, biggest, a bar of chocolate half out of its wrapper
    const ix = L + 124;
    c.fillStyle = '#C9472A'; c.beginPath(); c.arc(ix + 10, T + 66, 9, 0, TAU); c.fill(); c.strokeStyle = '#7A2414'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#4E7A2E'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 1.6 : 4.5; c.lineTo(ix + 10 + Math.cos(a) * rr, T + 58 + Math.sin(a) * rr * .7); } c.closePath(); c.fill();
    c.fillStyle = '#F2CE5A'; c.beginPath(); c.moveTo(ix + 30, T + 74); c.lineTo(ix + 54, T + 74); c.lineTo(ix + 54, T + 58); c.closePath(); c.fill(); c.strokeStyle = '#A8862A'; c.stroke();
    c.fillStyle = '#D9AE3A'; for (const [hx, hy, hr] of [[ix + 46, T + 69, 2.2], [ix + 50, T + 63, 1.6]]) { c.beginPath(); c.arc(hx, hy, hr, 0, TAU); c.fill(); }
    c.save(); c.translate(ix + 28, T + 104); c.rotate(-.12);
    const bw = 52, bh = 32;
    c.fillStyle = '#4A2616'; c.fillRect(-bw / 2, -bh / 2, bw, bh); c.strokeStyle = '#2A140A'; c.lineWidth = 1.3; c.strokeRect(-bw / 2, -bh / 2, bw, bh);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const qx = -bw / 2 + 2 + i * ((bw - 4) / 3), qy = -bh / 2 + 2 + j * ((bh - 4) / 2), qw = (bw - 4) / 3 - 2, qh = (bh - 4) / 2 - 2; c.fillStyle = '#6E3B22'; c.fillRect(qx + 1, qy + 1, qw, qh); c.fillStyle = 'rgba(255,220,180,.18)'; c.fillRect(qx + 1, qy + 1, qw, 2.5); }   // its squares
    c.fillStyle = '#C9CED4'; c.beginPath(); c.moveTo(bw / 2 - 20, -bh / 2 - 2); c.lineTo(bw / 2 - 14, -bh / 2 + 6); c.lineTo(bw / 2 - 19, 0); c.lineTo(bw / 2 - 13, bh / 2 - 4); c.lineTo(bw / 2 - 18, bh / 2 + 2); c.lineTo(bw / 2 + 2, bh / 2 + 2); c.lineTo(bw / 2 + 2, -bh / 2 - 2); c.closePath(); c.fill(); c.strokeStyle = '#8A9098'; c.lineWidth = 1; c.stroke();   // the foil, torn back
    c.fillStyle = '#7B2C8A'; c.fillRect(bw / 2 - 10, -bh / 2 - 3, 14, bh + 6); c.strokeStyle = '#4A1656'; c.strokeRect(bw / 2 - 10, -bh / 2 - 3, 14, bh + 6);   // the paper wrapper
    c.restore();
    c.strokeStyle = '#8C7A5A'; c.lineWidth = 1.3; for (let k = 0; k < 2; k++) { c.beginPath(); for (let i = 0; i <= 14; i++) c.lineTo(L + 14 + i * (w - 40 - k * 50) / 14, T + 146 + k * 9 + 1.2 * Math.sin(i * 2.1 + k)); c.stroke(); }   // the method, in squiggles
    c.fillStyle = DQ.verm; c.strokeStyle = DQ.ink; c.lineWidth = 1.4; c.beginPath(); c.arc(0, T + 10, 6.5, 0, TAU); c.fill(); c.stroke();   // its pin
    c.restore();
  }, { screen: true });
  const [tx0, ty0] = P(-w / 2 + 14, -h / 2 + 38);
  tx('Lasagna', tx0, ty0, { font: DQF.hand, size: 31, color: '#8E2A18', align: 'left', rot, role: 'label' });
}
// T17: a boiled egg in an egg cup at the left end of her desk, and a whisk lying on her notebook: "a boiled egg every
// morning is hard to beat". The J-space post's model only gets that pun when its "what does this mean" token fires.
// x = the egg cup's middle, top = the desk top (the notebook is 22 px tall).
function camDEgg(x, top) {
  paint(ellPts(x, top - 30, 9, 12.5, 20), { wash: '#DDB48A', ink: DQ.ink, sw: .26 });   // a brown egg
  paint([[x - 10, top], [x + 10, top], [x + 8, top - 4], [x + 3, top - 6], [x + 3, top - 10], [x + 11, top - 13], [x + 12, top - 24], [x - 12, top - 24], [x - 11, top - 13], [x - 3, top - 10], [x - 3, top - 6], [x - 8, top - 4]], { wash: '#BFD3E2', ink: DQ.ink, sw: .28 });
  line2d([[x - 11.5, top - 20], [x + 11.5, top - 20]], { col: '#4A6FA5', sw: 2 });   // its blue band
  dot2d(x - 3, top - 37, 2.2, { fill: 'rgba(255,255,255,.55)' });
  queue2d(c => {   // the whisk, its handle to the left
    const ya = top - 29, hx = x + 54, tip = x + 100;
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#5E6268'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 27, ya + 1); c.lineTo(hx, ya); c.stroke();
    c.lineWidth = 1.3; c.beginPath(); c.arc(x + 25, ya + 1, 3, 0, TAU); c.stroke();   // the hanging ring
    c.strokeStyle = '#7E8288'; c.lineWidth = 1.5;
    for (const k of [1, .58, .18]) { c.beginPath(); c.moveTo(hx, ya); c.bezierCurveTo(hx + 18, ya - 9 * k, tip - 2, ya - 9 * k, tip, ya); c.bezierCurveTo(tip - 2, ya + 9 * k, hx + 18, ya + 9 * k, hx, ya); c.stroke(); }
    c.restore();
  });
}

// A postcard (T88 + T91 tucked into the crooked painting; T104 pinned beside it in V5f): w wide, turned by ang.
// kind 'colosseum': the Colosseum with one square cut out and patched from a Louvre postcard, the patching guide's own
//   clean and corrupted prompts ("The Colosseum is in" / "The Louvre is in"; the Colosseum is also "Summing Up the
//   Facts"' running prompt).
// kind 'eiffel': the Eiffel Tower, postmarked ROMA: picture and postmark disagree ("The Eiffel Tower is in" → Paris vs
//   Rome, the subspace-illusion paper's example), like the letter that is right in theme and wrong in a detail.
function camDPostcard(cx, cy, w, ang, kind, o = {}) {
  const h = w * .66, b = Math.max(3, w * .045), X0 = -w / 2 + b, Y0 = -h / 2 + b, PW = w - 2 * b, PH = h - 2 * b;
  queue2d(c => {
    c.save(); c.translate(cx, cy); c.rotate(ang); c.lineJoin = 'round';
    c.fillStyle = 'rgba(40,25,10,.22)'; c.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);   // its shadow on the wall
    c.fillStyle = '#FBF7EE'; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = '#8A7A62'; c.lineWidth = 1.2; c.strokeRect(-w / 2, -h / 2, w, h);
    c.save(); c.beginPath(); c.rect(X0, Y0, PW, PH); c.clip();
    if (kind === 'colosseum') camDColosseum(c, X0, Y0, PW, PH); else camDEiffel(c, X0, Y0, PW, PH);
    c.restore();
    if (kind === 'eiffel') camDPostmark(c, w, h);
    if (o.pin) { c.beginPath(); c.arc(0, -h / 2 + 7, 5.5, 0, TAU); c.fillStyle = DQ.verm; c.fill(); c.lineWidth = 1; c.strokeStyle = '#7A2414'; c.stroke(); c.beginPath(); c.arc(-1.6, -h / 2 + 5.4, 1.6, 0, TAU); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); }
    c.restore();
  });
  if (kind === 'eiffel') {   // the postmark's town, registered as small print for the text checker
    const pr = w * .16, px = w / 2 - b - w * .19, py = -h / 2 + b + w * .2, ca = Math.cos(ang), sa = Math.sin(ang);
    tx('ROMA', cx + px * ca - py * sa, cy + px * sa + py * ca, { font: DQF.type, weight: 700, size: pr * .66, color: '#2E2E3A', alpha: .85, rot: ang, base: 'middle', role: 'fine' });
  }
}
function camDColosseum(c, X0, Y0, PW, PH) {
  c.fillStyle = '#C9DCE6'; c.fillRect(X0, Y0, PW, PH);   // the sky
  const gy = Y0 + PH * .8, L = X0 + PW * .08, cw = PW * .72, R = L + cw, ch = PH * .5, brk = L + cw * .62;
  c.fillStyle = '#C8B98E'; c.fillRect(X0, gy, PW, PH);   // the piazza
  c.beginPath(); c.moveTo(L, gy); c.lineTo(L, gy - ch * .94); c.quadraticCurveTo(L + cw * .3, gy - ch * 1.04, brk, gy - ch); c.lineTo(brk + cw * .05, gy - ch * .7); c.lineTo(R, gy - ch * .58); c.lineTo(R, gy); c.quadraticCurveTo(L + cw / 2, gy + 3, L, gy); c.closePath();
  c.fillStyle = '#DDBF8A'; c.fill(); c.strokeStyle = '#8A6A44'; c.lineWidth = 1; c.stroke();
  const th = ch * .25, n = 11, aw = cw / n;   // three tiers of arches; two where the outer ring has fallen
  c.fillStyle = '#9A7448';
  for (let tier = 0; tier < 3; tier++) for (let i = 0; i < n; i++) {
    const ax = L + (i + .22) * aw, ay = gy - (tier + 1) * th - tier * 1.2;
    if (tier === 2 && ax > brk - aw * .5) continue;
    c.beginPath(); c.roundRect(ax, ay + th * .2, aw * .56, th * .66, [aw * .28, aw * .28, 0, 0]); c.fill();
  }
  c.strokeStyle = 'rgba(138,106,68,.8)'; c.lineWidth = .8; for (let tier = 1; tier < 3; tier++) { c.beginPath(); c.moveTo(L, gy - tier * (th + 1.2) + .5); c.lineTo(tier === 2 ? brk : R, gy - tier * (th + 1.2) + .5); c.stroke(); }
  // the patch: one square cut out and replaced by a square of a Louvre postcard (its glass pyramid), taped in, a touch askew
  const ps = PH * .5, px = X0 + PW * .6, py = Y0 + PH * .3;
  c.save(); c.translate(px + ps / 2, py + ps / 2); c.rotate(.06);
  c.fillStyle = '#E4DACB'; c.fillRect(-ps / 2, -ps / 2, ps, ps);   // a greyer Paris sky
  c.fillStyle = '#BDB5A3'; c.fillRect(-ps / 2, ps * .3, ps, ps * .2);
  c.beginPath(); c.moveTo(0, -ps * .3); c.lineTo(ps * .42, ps * .3); c.lineTo(-ps * .42, ps * .3); c.closePath(); c.fillStyle = '#A9C3D0'; c.fill(); c.strokeStyle = '#5E7886'; c.lineWidth = 1; c.stroke();
  c.lineWidth = .6; c.beginPath(); for (const u of [.33, .66]) { c.moveTo(-ps * .42 * u, -ps * .3 + ps * .6 * u); c.lineTo(ps * .42 * (1 - u) * 1, ps * .3); c.moveTo(ps * .42 * u, -ps * .3 + ps * .6 * u); c.lineTo(-ps * .42 * (1 - u), ps * .3); } c.stroke();
  c.strokeStyle = '#4A3C2C'; c.lineWidth = 1; c.strokeRect(-ps / 2, -ps / 2, ps, ps);   // the cut
  c.fillStyle = 'rgba(255,253,240,.55)'; c.fillRect(-ps * .32, -ps / 2 - 3, ps * .64, 6);   // a strip of tape
  c.restore();
}
function camDEiffel(c, X0, Y0, PW, PH) {
  c.fillStyle = '#CFE0EA'; c.fillRect(X0, Y0, PW, PH);
  const gy = Y0 + PH * .86, tx0 = X0 + PW * .36, H = PH * .8;
  c.fillStyle = '#9DB27A'; c.fillRect(X0, gy, PW, PH);   // the Champ de Mars
  const half = v => PW * (v < .3 ? lerp(.17, .085, Math.pow(v / .3, .7)) : v < .55 ? lerp(.085, .045, (v - .3) / .25) : v < .93 ? lerp(.045, .012, (v - .55) / .38) : .012 * (1 - (v - .93) / .07));
  const vs = Array.from({ length: 25 }, (_, i) => i / 24);
  c.beginPath(); vs.forEach((v, i) => { const p = [tx0 + half(v), gy - v * H]; i ? c.lineTo(...p) : c.moveTo(...p); }); vs.slice().reverse().forEach(v => c.lineTo(tx0 - half(v), gy - v * H)); c.closePath();
  c.fillStyle = '#4A4038'; c.fill();
  c.beginPath(); c.ellipse(tx0, gy, PW * .1, H * .2, 0, Math.PI, TAU); c.fillStyle = '#CFE0EA'; c.fill();   // the arch between its legs
  c.strokeStyle = '#2E2620'; c.lineWidth = 1.6; for (const v of [.3, .55]) { c.beginPath(); c.moveTo(tx0 - half(v) - 2, gy - v * H); c.lineTo(tx0 + half(v) + 2, gy - v * H); c.stroke(); }   // its platforms
  c.strokeStyle = 'rgba(207,224,234,.5)'; c.lineWidth = .6; c.beginPath(); for (const v of [.38, .46]) { c.moveTo(tx0 - half(v), gy - v * H); c.lineTo(tx0 + half(v + .08), gy - (v + .08) * H); c.moveTo(tx0 + half(v), gy - v * H); c.lineTo(tx0 - half(v + .08), gy - (v + .08) * H); } c.stroke();   // a little lattice
}
// a stamp in the corner and a postmark struck across it, with its wavy lines; the town (ROMA) is a tx, drawn on top
function camDPostmark(c, w, h) {
  const b = Math.max(3, w * .045), sw = w * .17, sh = w * .21, sx = w / 2 - b - sw - 2, sy = -h / 2 + b + 2;
  c.fillStyle = '#FFFDF7'; c.fillRect(sx - 2, sy - 2, sw + 4, sh + 4);
  c.fillStyle = '#B4523A'; c.fillRect(sx, sy, sw, sh);
  c.fillStyle = '#FFFDF7'; for (let i = 0; i <= 6; i++) { for (const yy of [sy - 2, sy + sh + 2]) { c.beginPath(); c.arc(sx + i * sw / 6, yy, 1.3, 0, TAU); c.fill(); } }
  c.fillStyle = 'rgba(255,240,220,.85)'; c.beginPath(); c.moveTo(sx + sw / 2, sy + sh * .18); c.lineTo(sx + sw * .72, sy + sh * .84); c.lineTo(sx + sw * .28, sy + sh * .84); c.closePath(); c.fill();   // the tower, in the stamp's own little print
  const pr = w * .16, px = w / 2 - b - w * .19, py = -h / 2 + b + w * .2;
  c.strokeStyle = 'rgba(46,46,58,.78)'; c.lineWidth = 1.5; c.beginPath(); c.arc(px, py, pr, 0, TAU); c.stroke(); c.lineWidth = 1; c.beginPath(); c.arc(px, py, pr * .8, 0, TAU); c.stroke();
  c.lineWidth = 1.3; for (let k = -1; k <= 1; k++) { c.beginPath(); for (let i = 0; i <= 5; i++) { const xx = px - pr - 3 - i * 3.2, yy = py + k * pr * .45 + 1.6 * Math.sin(i * 1.3); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }   // its wavy lines (short of the tower)
}

// ---------------- ideas drawn for Neel to judge from a still (render.mjs --mock=<key>; mock(key) is false in the video) ----------------
// Still left out (his picks, 3 Oct): t14, t45, t92, t4, t59, t102, t119, j_clip_early, reconstructor, owls. In the video
// now: t51 (the twig, on the shelf in floorAndDesk), clip_ipod (the apple, on her notebook in floorAndDesk) and
// residual_line (V5c).

// t14: a brass cipher wheel propped on her desk, its inner ring turned three letters so G sits over J (the DiffusionGemma
// latent-reasoning post: shift a letter 3 down the alphabet, which the model does as a rotation on a circle). (x, y) =
// its middle, r its radius; it stands on a little wire stand on the desk top (y + r + 8).
function camDCipher(x, y, r) {
  line2d([[x - r * .5, y + r * .7], [x - r * .62, y + r + 8]], { col: DQ.brassDk, sw: 3 }); line2d([[x + r * .5, y + r * .7], [x + r * .62, y + r + 8]], { col: DQ.brassDk, sw: 3 });
  queue2d(c => {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ri = r * .68;
    c.save(); c.translate(x, y);
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = DQ.brassLt; c.fill(); c.lineWidth = 2; c.strokeStyle = DQ.brassDk; c.stroke();
    c.beginPath(); c.arc(0, 0, ri, 0, TAU); c.fillStyle = '#D2A65A'; c.fill(); c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = 'rgba(201,71,42,.55)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -r + 1); c.lineTo(0, -ri * .45); c.stroke();   // G over J, lined up
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 26; i++) {   // the outer ring: G at the top; the inner, turned three: J under it
      for (const [rad, off, col, sz] of [[r * .84, 6, '#5A3E16', r * .16], [ri * .74, 9, '#4A3210', r * .11]]) {
        const k = (i - off + 26) % 26, a = -Math.PI / 2 + (k / 26) * TAU, top = k === 0;
        c.save(); c.translate(Math.cos(a) * rad, Math.sin(a) * rad); c.rotate(a + Math.PI / 2);
        c.font = `${top ? 700 : 400} ${top ? r * .24 : sz}px "${FONT.cmuTT}"`; c.fillStyle = top ? DQ.verm : col; c.fillText(A[i], 0, 0); c.restore();
      }
    }
    c.beginPath(); c.moveTo(0, -r - 4); c.lineTo(-5, -r - 12); c.lineTo(5, -r - 12); c.closePath(); c.fillStyle = DQ.verm; c.fill();   // the pointer
    c.beginPath(); c.arc(0, 0, r * .09, 0, TAU); c.fillStyle = DQ.brassDk; c.fill();
    c.restore();
  });
}
// t45: an open lens case on her desk, fitted slots in red velvet: the J slot empty (the clip is out, on her lens), the
// other holding a clip etched Δ: the Activation Difference Lens of Neel's scholars' diffing paper. x = its middle.
function camDLensCase(x, top) {
  queue2d(c => {
    const w = 92, bh = 22, d = 16, y0 = top - bh;   // box front height, tray depth
    c.save(); c.lineJoin = 'round'; c.strokeStyle = DQ.ink; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x - w / 2 + 6, y0 - d); c.lineTo(x - w / 2 + 2, y0 - d - 40); c.lineTo(x + w / 2 + 10, y0 - d - 40); c.lineTo(x + w / 2 + 6, y0 - d); c.closePath(); c.fillStyle = '#6B4630'; c.fill(); c.stroke();   // the lid, up
    c.beginPath(); c.moveTo(x - w / 2 + 10, y0 - d - 4); c.lineTo(x - w / 2 + 7, y0 - d - 35); c.lineTo(x + w / 2 + 5, y0 - d - 35); c.lineTo(x + w / 2 + 2, y0 - d - 4); c.closePath(); c.fillStyle = '#8E2A32'; c.fill();   // its lining
    c.beginPath(); c.moveTo(x - w / 2, y0); c.lineTo(x - w / 2 + 6, y0 - d); c.lineTo(x + w / 2 + 6, y0 - d); c.lineTo(x + w / 2, y0); c.closePath(); c.fillStyle = '#7A1E2A'; c.fill(); c.stroke();   // the velvet tray
    c.fillStyle = '#7E5530'; c.fillRect(x - w / 2, y0, w, bh); c.strokeRect(x - w / 2, y0, w, bh);   // the box
    c.fillStyle = DQ.brass; c.fillRect(x - 5, y0 + 5, 10, 7);   // its clasp
    for (const [sx, full] of [[x - w * .22, false], [x + w * .2, true]]) {
      c.beginPath(); c.ellipse(sx + 3, y0 - d / 2, 15, 6, 0, 0, TAU); c.fillStyle = '#4A0E16'; c.fill();   // a fitted slot
      if (full) { c.beginPath(); c.ellipse(sx + 3, y0 - d / 2 - 2, 13, 5.5, 0, 0, TAU); c.fillStyle = 'rgba(214,234,232,.7)'; c.fill(); c.lineWidth = 3; c.strokeStyle = DQ.brass; c.stroke(); c.lineWidth = 2; c.strokeStyle = DQ.ink; }
    }
    c.font = `700 13px "${FONT.cmuTT}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = DQ.brassLt;
    c.fillText('J', x - w * .22 + 3, y0 - d - 22); c.fillText('Δ', x + w * .2 + 3, y0 - d - 22);   // stamped in the lid's lining, over each slot
    c.restore();
  });
}
// t92: five wooden alphabet blocks on the first shelf, a b c d e (a callback to "your A-B-C"): the five GPT-2 seeds of
// Universal Neurons are named a to e, and its Figure 1 opens with alphabet neurons. x = the left end, by = the shelf top.
function camDBlocks(x, by) {
  const s = 15, L = [['a', DQ.verm], ['b', '#2E6F86'], ['c', '#4E7A3A'], ['d', '#B5862A'], ['e', DQ.verm]], pos = [[0, 0], [1, 0], [2, 0], [.5, 1], [1.5, 1]];
  pos.forEach(([i, j], k) => {
    const bx = x + i * (s + 1.5), y = by - (j + 1) * s - j;
    paint(rectPts(bx, y, s, s), { wash: '#E6C890', ink: DQ.ink, sw: .22 });
    tx(L[k][0], bx + s / 2, y + s * .74, { font: DQF.soft, weight: 700, size: 13, color: L[k][1], role: 'fine' });
  });
}
// t51 (in the video, Neel's pick): a small vase at the end of the first shelf holding a twig that forks and forks again:
// Thought Branches' tree of resampled continuations, on its own case, the blackmail test. x = the vase's middle, by = the
// shelf top.
function camDTwig(x, by) {
  const V = [[x - 6, by], [x + 6, by], [x + 9, by - 10], [x + 7, by - 20], [x + 3, by - 24], [x + 4, by - 28], [x - 4, by - 28], [x - 3, by - 24], [x - 7, by - 20], [x - 9, by - 10]];
  const segs = [], grow = (x0, y0, a, L, d) => { const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L; segs.push([x0, y0, x1, y1, d]); if (d < 3) { grow(x1, y1, a - .5 + .06 * d, L * .74, d + 1); grow(x1, y1, a + .44 - .05 * d, L * .74, d + 1); } };
  grow(x, by - 27, -Math.PI / 2 + .05, 22, 0);
  segs.forEach(([x0, y0, x1, y1, d]) => line2d([[x0, y0], [x1, y1]], { col: '#5E4026', sw: 3.2 - d * .7 }));
  segs.filter(s => s[4] === 3).forEach(([, , x1, y1]) => dot2d(x1, y1, 2.2, { fill: '#7FA05A' }));   // a bud at each tip
  paint(V, { wash: DQ.teal, fill: '#3E7470', fillOp: 50, ink: DQ.ink, sw: .25 });
}
// t119: a bonsai on the first shelf, pruned to a sparse branching shape, its shears set down beside it (the ACDC walkthrough:
// the first attempt to automate the pruning, a sparse subgraph for a circuit). x = the pot's middle, by = the shelf top.
function camDBonsai(x, by) {
  paint([[x - 20, by], [x + 20, by], [x + 22, by - 9], [x - 22, by - 9]], { wash: '#3E4E5E', ink: DQ.ink, sw: .25 });   // the shallow pot
  const trunk = [[x - 2, by - 9], [x - 6, by - 20], [x + 1, by - 30], [x - 3, by - 40]];
  line2d(trunk, { col: '#5E4026', sw: 5 });
  for (const [a, b] of [[[x - 5, by - 22], [x - 19, by - 30]], [[x, by - 29], [x + 15, by - 36]], [[x - 2, by - 37], [x - 12, by - 48]], [[x - 3, by - 40], [x + 6, by - 50]]]) line2d([a, b], { col: '#5E4026', sw: 2.4 });
  for (const [px, py, rx] of [[x - 21, by - 33, 9], [x + 17, by - 39, 9], [x - 13, by - 51, 8], [x + 7, by - 53, 9]]) paint(ellPts(px, py, rx, rx * .55, 14), { wash: '#5E7E4A', fill: '#4A6A3A', fillOp: 60, ink: DQ.ink, sw: .2 });
  queue2d(c => {   // the shears, lying beside it
    const sx = x + 34, sy = by - 3; c.save(); c.strokeStyle = DQ.ink; c.lineWidth = 1.4;
    c.fillStyle = '#9AA3AA'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 16, sy - 3); c.lineTo(sx, sy - 1); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(sx, sy - 1); c.lineTo(sx + 15, sy + 1); c.lineTo(sx, sy + 1); c.closePath(); c.fill(); c.stroke();
    for (const dy of [-3, 2]) { c.beginPath(); c.ellipse(sx - 6, sy + dy, 5, 3, 0, 0, TAU); c.stroke(); }
    c.restore();
  });
}
// t102: a small glass prism standing on her notebook, throwing a sliver of rainbow on the wall once her lens is down
// (Prisma, TransformerLens's vision sibling). x = its middle, by = the notebook top; k 0..1 the rainbow.
function camDPrism(x, by, k) {
  line2d([[x - 14, by], [x + 14, by], [x, by - 24]], { col: DQ.ink, sw: 1.6, fill: 'rgba(214,234,232,.75)', close: true });
  line2d([[x - 6, by - 4], [x + 1, by - 17]], { col: '#FFFFFF', sw: 2, alpha: .8 });
  if (k > 0) queue2d(c => {
    c.save(); c.globalAlpha = .5 * k; c.lineCap = 'round';
    ['#D9483A', '#E8923A', '#E9C94A', '#6FAF5A', '#4A86C8', '#7A5AB0'].forEach((col, i) => {
      c.strokeStyle = col; c.globalAlpha = .22 * k; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 3, by - 20); c.lineTo(x + 22 + i * 2, by - 62 - i * 4.2); c.stroke();   // the fan off its face
      c.globalAlpha = .5 * k; c.lineWidth = 3.4; c.beginPath(); c.moveTo(x + 22 + i * 2, by - 62 - i * 4.2); c.lineTo(x + 92 + i * 3, by - 74 - i * 4.6); c.stroke(); });
    c.restore();
  });
}
// t59: the hallucination probe's look on the NLA's letter: thin green underlines under the details it supports, and, a
// beat before her red pencil rings the line, a red one under "white jacket" (the real-time hallucinated-entity paper's
// own colours). k 0..1 draws the red one.
function camDUnderlines(k) {
  const o = { font: DQF.hand, size: 56 }, x0 = 120 + measure('Wearing my ', o).w, w = measure('white jacket', o).w;
  for (const [x, y, len] of [[122, 452, 150], [330, 452, 110], [122, 482, 120]]) line2d([[x, y], [x + len, y]], { col: '#3E8E5A', sw: 3, alpha: .85 });
  if (k > 0) line2d([[x0, 576], [x0 + w * k, 576]], { col: '#C9302A', sw: 4.5 });
}
// j_clip_early: in V5a the clip-on J lens flips down over her lens before she climbs (as it does at the fortress in FC4),
// so it is the J-lens she reads it with all verse. L = the lens's middle, R its radius, f 0..1 the flip.
function camDJClip(L, R, f) {
  const hinge = [L[0] + R * .66, L[1] - R * .74], jc = [lerp(L[0] + R * 1.02, L[0] + R * .4, f), lerp(L[1] - R * 1.4, L[1] - R * .5, f)], rc = R * .4;
  queue2d(c => { c.save(); c.strokeStyle = DQ.brassDk; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(hinge[0], hinge[1]); c.lineTo(jc[0], jc[1]); c.stroke();
    c.fillStyle = DQ.brassDk; c.beginPath(); c.arc(hinge[0], hinge[1], 3.5, 0, TAU); c.fill();   // the hinge
    c.fillStyle = 'rgba(214,234,232,.4)'; c.beginPath(); c.arc(jc[0], jc[1], rc, 0, TAU); c.fill(); c.strokeStyle = DQ.brass; c.lineWidth = 5; c.stroke(); c.strokeStyle = DQ.ink; c.lineWidth = 1.2; c.stroke();
    const tb = [jc[0] + rc * .95, jc[1] - rc * .95];   // its brass tab, stamped J
    c.beginPath(); c.roundRect(tb[0] - 8, tb[1] - 9, 16, 18, 3); c.fillStyle = DQ.brassLt; c.fill(); c.lineWidth = 1.3; c.strokeStyle = DQ.brassDk; c.stroke();
    c.font = `700 14px "${FONT.cmuTT}"`; c.fillStyle = DQ.ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('J', tb[0], tb[1] + 1); c.restore(); });
}
// residual_line (in the video, Neel's pick): the creature's residual stream as a faint line up its middle, a tick a
// layer, and the oracle's jack in exactly halfway ("Activations were taken at the 50% layer", the oracle post). Returns
// where the jack goes; draw: the line itself, at alpha a (V5c fades it in as the copy plugs in).
function camDResidual(cx, gy, s, t, draw, a = 1, n = 13) {
  const B = shogBody(cx, gy, s, V5.g, t, 3), x = B.cx - s * .08, y0 = B.cy - B.ry * .93, y1 = gy - s * .2;
  if (draw) queue2d(c => {
    c.save(); c.globalAlpha = a; c.lineCap = 'round'; c.strokeStyle = 'rgba(248,240,214,.8)'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(x, y1); c.lineTo(x, y0); c.stroke();
    c.beginPath(); c.moveTo(x - 9, y0 + 12); c.lineTo(x, y0); c.lineTo(x + 9, y0 + 12); c.stroke();   // it flows up
    for (let i = 0; i < n; i++) { const y = lerp(y1, y0, (i + .5) / n), half = Math.abs(i - (n - 1) / 2) < .1; c.lineWidth = half ? 3.5 : 2; c.strokeStyle = half ? 'rgba(255,200,110,1)' : 'rgba(248,240,214,.8)'; c.beginPath(); c.moveTo(x - (half ? 16 : 10), y); c.lineTo(x + (half ? 16 : 10), y); c.stroke(); }
    c.restore();
  });
  return [x, lerp(y1, y0, ((n - 1) / 2 + .5) / n)];
}
// t4: the oracle listens through a five-way splitter, five plugs in five adjacent layers just above its middle (Neel's
// scholars' "Building Better Activation Oracles": feeding 5 contiguous layers causes further uplift). jack = where the
// single plug would go.
function camDSplitter(jack) {
  const [jx, jy] = jack, box = [jx - 34, jy + 4];
  queue2d(c => {
    c.save(); c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const py = jy - 52 + i * 24, px = jx + 14 + 3 * Math.abs(i - 2); c.strokeStyle = '#3A3A44'; c.lineWidth = 3; c.beginPath(); c.moveTo(box[0] + 12, box[1]); c.quadraticCurveTo(px - 18, py + 6, px - 10, py); c.stroke(); c.lineWidth = 9; c.strokeStyle = '#22222A'; c.beginPath(); c.moveTo(px - 12, py); c.lineTo(px + 4, py); c.stroke(); }
    c.fillStyle = '#2E2E36'; c.strokeStyle = DQ.ink; c.lineWidth = 1.5; c.beginPath(); c.roundRect(box[0] - 12, box[1] - 9, 26, 18, 4); c.fill(); c.stroke();   // the splitter
    c.restore();
  });
}
// reconstructor: the NLA's other half, a second blindfolded copy hugging the letter to its chest; it turns the words
// back into the activation, which is what makes the NLA an autoencoder. Drawn behind the (moved, smaller) letter.
function camDReconstructor(t) {
  const tr = shogTrace(300, 870, 250, V5.g, t, { shut: 1 });
  flushLetters();
  blindfold(tr, 250);
  return tr;
}
// clip_ipod (in the video, Neel's pick): on her notebook, a Granny Smith apple with a handwritten paper label reading
// "iPod": CLIP's typographic attack (Multimodal Neurons, Goh et al. 2021: the bare apple reads "Granny Smith", 85.6%;
// labelled, "iPod", 99.7%). Written words beat what it sees. x = its middle, top = the surface it sits on.
function camDIpodApple(x, top, k = 1.3) {
  const r = 19 * k, P = Array.from({ length: 28 }, (_, i) => { const a = i / 28 * TAU, dip = Math.max(0, Math.cos(a)) ** 6; return [x + Math.sin(a) * r * (1 - .06 * Math.cos(2 * a)), top - r * .9 - Math.cos(a) * r * .9 * (1 - .22 * dip) + (Math.cos(a) < -.9 ? 1.5 : 0)]; });
  paint(P, { wash: '#A8CC5C', fill: '#7FA83E', fillOp: 60, bleed: .005, ink: DQ.ink, sw: .3 });
  line2d([[x, top - r * 1.53], [x + 2, top - r * 2.1]], { col: '#5E4026', sw: 2.5 }); paint(ellPts(x + 9 * k, top - r * 2.05, 7 * k, 3.5 * k, 12, 0, -.5), { wash: '#5E8A3A', ink: DQ.ink, sw: .2 });   // stalk, leaf
  box2d(x - 15 * k, top - 22 * k, 30 * k, 14 * k, { fill: '#FFFDF7', stroke: '#B8A888', sw: 1, rot: -.08 });   // the label, stuck on
  tx('iPod', x, top - 11.5 * k, { font: DQF.hand, size: 15 * k, color: DQ.ink, rot: -.08, role: 'fine' });
}
// owls: small owls hidden in the oracle's flash cards, a faint watermark in each card's corner (subliminal learning's
// first result: number sequences from an owl-loving teacher pass the love of owls on). (x, y) = the owl's middle.
function camDOwl(c, x, y, s) {
  c.save(); c.translate(x, y); c.globalAlpha *= .5; c.fillStyle = '#B8A07A'; c.strokeStyle = '#8A7250'; c.lineWidth = 1;
  c.beginPath(); c.ellipse(0, 2 * s, 8 * s, 10 * s, 0, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(-7 * s, -5 * s); c.lineTo(-6 * s, -12 * s); c.lineTo(-2 * s, -7 * s); c.moveTo(7 * s, -5 * s); c.lineTo(6 * s, -12 * s); c.lineTo(2 * s, -7 * s); c.fill();   // ear tufts
  c.fillStyle = '#FFFDF7'; for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 3.6 * s, -1.5 * s, 3.4 * s, 0, TAU); c.fill(); c.stroke(); }
  c.fillStyle = '#5A4632'; for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 3.6 * s, -1.2 * s, 1.5 * s, 0, TAU); c.fill(); }
  c.fillStyle = '#C08A3A'; c.beginPath(); c.moveTo(-1.3 * s, 1.5 * s); c.lineTo(1.3 * s, 1.5 * s); c.lineTo(0, 4 * s); c.closePath(); c.fill();
  c.restore();
}

// ---------------- round-4 mock-ups (video/treatment/reference_bank_r4.md; camO* names; off unless render.mjs --mock=<key>) ----------------

// r4 pick 3, the seahorse it can't say (mock r4_seahorse, V5a-V5b, "so I learned to hear the words you'd never say"): a
// second specimen frame, the pair to "smile", hung just below it: no specimen inside, only a seahorse's outline in the
// verse's dashed rust line (the J-space chips' dash for a word not said), a pin through it and a blank label. There is no
// seahorse emoji, yet in 2025 the models were sure there was (Claude Sonnet 4.5 said yes 100 times out of 100), and Theia
// Vogel's logit lens caught Llama building the word anyway, with no token to say it. (cx, cy) = the frame's middle.
function camOSeahorse(cx, cy) {
  const w = 104, h = 86, b = 9, top = cy - h / 2;
  paint(rectPts(cx - w / 2, top, w, h), { wash: '#5A3A22', fill: '#3E2614', fillOp: 60, bleed: .005, ink: DQ.ink, sw: .45 });   // camDSpecimen's wood
  queue2d(c => {
    c.save(); const x0 = cx - w / 2 + b, y0 = top + b, iw = w - 2 * b, ih = h - 2 * b;
    c.fillStyle = '#F2E9D3'; c.fillRect(x0, y0, iw, ih);   // the linen backing
    c.fillStyle = 'rgba(40,25,10,.16)'; c.fillRect(x0, y0, iw, 4); c.fillRect(x0, y0, 4, ih);   // the box's depth
    // the seahorse in profile, facing left, ~62 px from its coronet to its tail's curl: the head (long snout, coronet) and
    // body as one dashed outline, the tail as one dashed stroke curling forward, a little dorsal fin, an eye
    const sx = cx - 6, sy = cy + 1, k = .94, Q = P => P.map(([x, y]) => [sx + x * k, sy + y * k]);
    const body = natCR(Q([[-27, -20], [-15, -22], [-9, -27], [-3, -33], [5, -30], [7, -23], [11, -13], [13, -2], [11, 8], [6, 15], [-1, 14], [-9, 6], [-11, -4], [-7, -12], [-11, -17], [-27, -17]]), 4, true);
    const tail = natCR(Q([[3, 14], [5, 21], [8, 27], [5, 32], [-1, 32], [-3, 27], [1, 24], [3, 27]]), 5, false);
    const fin = natCR(Q([[12, -8], [18, -5], [17, 1], [12, 3]]), 3, false);
    c.setLineDash([4, 3]); c.lineWidth = 2.4; c.strokeStyle = V5.dash; c.lineJoin = c.lineCap = 'round';
    for (const P of [body, tail, fin]) { c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (P === body) c.closePath(); c.stroke(); }
    c.setLineDash([]); c.fillStyle = V5.dash; const [ex, ey] = Q([[-5, -24]])[0]; c.beginPath(); c.arc(ex, ey, 1.8, 0, TAU); c.fill();   // its eye
    const [px, py] = Q([[1, -3]])[0];   // the pin, through its middle
    c.strokeStyle = 'rgba(40,25,10,.28)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(px + 2, py + 2); c.lineTo(px + 8, py + 8); c.stroke();
    c.beginPath(); c.arc(px, py, 4.2, 0, TAU); c.fillStyle = '#B3261E'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#5E1410'; c.stroke();
    c.beginPath(); c.arc(px - 1.3, py - 1.3, 1.3, 0, TAU); c.fillStyle = '#FFFFFF'; c.fill();
    c.fillStyle = '#FFFDF7'; c.fillRect(cx + 14, cy + 22, 26, 8); c.strokeStyle = '#B8A888'; c.lineWidth = 1; c.strokeRect(cx + 14, cy + 22, 26, 8);   // its label, blank
    c.beginPath(); c.rect(x0, y0, iw, ih); c.clip();   // the glass
    c.strokeStyle = 'rgba(255,255,255,.38)'; c.lineCap = 'round'; c.lineWidth = 7; c.beginPath(); c.moveTo(x0 + 6, y0 + 28); c.lineTo(x0 + 30, y0 + 4); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 17, y0 + 32); c.lineTo(x0 + 41, y0 + 8); c.stroke();
    c.restore();
  });
}

// r4 pick 2, Clippy holds the letter together (mock r4_clippy, V5f, "but some of what it read me was a letter it wrote
// instead"): a plain wire paperclip in the copy's grey pencil, clipped over the letter's top edge, with two round eyes and
// heavy brows on its loop. Its brows go up on "letter"; on "instead" its eyes slide to the red ring. Office's paperclip
// greeted anyone typing "Dear" with "It looks like you're writing a letter. Would you like help?"; LessWrong's "Clippy"
// played a paperclip maximiser; gwern's takeover story is "It Looks Like You're Trying To Take Over The World". A reader that
// also writes you a letter you didn't ask for. (x, y): where it crosses the sheet's top edge; tL "letter", tI "instead".
function camOClippy(t, x, y, tL, tI) {
  const s = 1.2, brow = 3.5 * ease(seg(t, tL - .05, tL + .15)), look = ease(seg(t, tI, tI + .25));
  const gx = -.62 * look, gy = .78 * look;   // towards the red ring, down and to the left
  queue2d(c => {
    c.save(); c.translate(x, y); c.rotate(-.015 + .06); c.scale(s, s); c.lineCap = c.lineJoin = 'round';
    const wire = (pts, arcs) => { c.beginPath(); c.moveTo(...pts[0]); for (const a of arcs) a(); c.stroke(); };
    c.strokeStyle = '#6F6A62'; c.lineWidth = 2.6;
    // the inner loop is behind the sheet: only the part above its top edge shows
    c.save(); c.beginPath(); c.rect(-30, -60, 60, 60); c.clip();
    wire([[-6, 32]], [() => c.lineTo(-6, -16), () => c.arc(0, -16, 6, Math.PI, 0), () => c.lineTo(6, 20)]);
    c.restore();
    // the outer loop, in front
    wire([[-14, 34]], [() => c.lineTo(-14, -26), () => c.arc(0, -26, 14, Math.PI, 0), () => c.lineTo(14, 32), () => c.arc(4, 32, 10, 0, Math.PI), () => c.lineTo(-6, 32)]);
    // its face, on the loop above the paper: two round eyes and heavy brows
    for (const d of [-1, 1]) {
      const ex = d * 6.2, ey = -27;
      c.fillStyle = '#FFFDF7'; c.strokeStyle = '#6F6A62'; c.lineWidth = 1.5; c.beginPath(); c.arc(ex, ey, 5.4, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#2A2622'; c.beginPath(); c.arc(ex + 1.6 * gx, ey + 1.6 * gy, 2.3, 0, TAU); c.fill();
      c.strokeStyle = '#3A3530'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(ex - 4.5 * d - .5, ey - 7.5 - brow + (d > 0 ? 0 : 0)); c.quadraticCurveTo(ex, ey - 10.5 - brow, ex + 4.8 * d, ey - 8 - brow * .6); c.stroke();
    }
    c.restore();
  }, { screen: true });
}

// r4 pick 9, her homework (mock r4_homework, V5c, "then I let a model read your mind for me — (so, are we done?)"): as she
// sits back on "for" she holds a thin exercise book labelled HOMEWORK; on "me" one of the copy's tentacles reaches over and
// takes it, and holds it up beside its headphones through "(so, are we done?)". Getting an AI to "do our alignment
// homework for us" is the community's phrase for automating alignment research; the next line answers it (the copy stamps
// ten on every sum). tr = the copy's trace; tF "for", tMe "me".
function camOHomework(t, tr, tF, tMe) {
  const show = seg(t, tF, tF + .12); if (show <= 0) return;
  const { B } = tr, cupL = [B.cx - B.rx * .9, B.cy - B.ry * .5];
  const hand = [398, 742], held = [cupL[0] - 78, cupL[1] - 18];   // in her hands; then up beside its left cup
  const reach = ease(seg(t, tMe, tMe + .24)), lift = ease(seg(t, tMe + .24, tMe + .7));
  const bx = lerp(hand[0], held[0], lift), by = lerp(hand[1], held[1], lift) - 26 * Math.sin(Math.PI * lift), rot = lerp(.12, -.08, lift);
  const grip = [bx + 30, by + 8];
  if (reach > .04) {   // the tentacle: out from its flank to the book, then carrying it
    const from = [B.cx - B.rx * .8, B.cy + B.ry * .3];
    traceTentacle(B, -1, lift > 0 ? grip : [lerp(from[0], grip[0], reach), lerp(from[1], grip[1], reach)], 30);
  }
  const bw = 84, bh = 104;
  queue2d(c => {
    c.save(); c.globalAlpha *= show; c.translate(bx, by); c.rotate(rot);
    c.fillStyle = 'rgba(40,25,10,.22)'; c.fillRect(-bw / 2 + 3, -bh / 2 + 4, bw, bh);
    c.fillStyle = '#4C7AAE'; c.strokeStyle = '#2C4A70'; c.lineWidth = 1.6; c.fillRect(-bw / 2, -bh / 2, bw, bh); c.strokeRect(-bw / 2, -bh / 2, bw, bh);   // a school exercise book
    c.fillStyle = '#3A6293'; c.fillRect(-bw / 2, -bh / 2, 7, bh);   // its stitched spine
    c.fillStyle = '#FFFDF7'; c.fillRect(-bw / 2 + 12, -bh / 2 + 16, bw - 20, 30); c.strokeStyle = '#2C4A70'; c.lineWidth = 1; c.strokeRect(-bw / 2 + 12, -bh / 2 + 16, bw - 20, 30);   // its label
    c.strokeStyle = '#9AA6B4'; c.beginPath(); c.moveTo(-bw / 2 + 16, -bh / 2 + 60); c.lineTo(bw / 2 - 10, -bh / 2 + 60); c.moveTo(-bw / 2 + 16, -bh / 2 + 72); c.lineTo(bw / 2 - 16, -bh / 2 + 72); c.stroke();
    c.restore();
  }, { screen: true });
  const co = Math.cos(rot), si = Math.sin(rot), lx = 2, ly = -bh / 2 + 36;
  tx('HOMEWORK', bx + lx * co - ly * si, by + lx * si + ly * co, { font: DQF.hand, size: 15, color: '#2A2622', rot, alpha: show, role: 'fine' });
}
