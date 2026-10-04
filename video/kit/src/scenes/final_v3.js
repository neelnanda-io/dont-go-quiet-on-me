// final_v3.js: Verse 3, finished (70.79-87.43 s, stamped 2025): the workshop, one world on blueprint paper along one
// bench; the camera dollies right and whip-pans on the cuts. The plain old probe beats the SAE hammer (GDM, Mar 2025),
// the hammer goes on the shelf, "wrong question", only the harmful thoughts, a probe by the door.
// References (video/treatment/reference_bank_final.md): V3a-1 the $10 bridge, V3a-2 the probe's Othello disc (M4),
// V3b-1 the "2 wks" hourglass, M6 the NN mug's ring, V3d-1 the table flip.

// ---------------- verse 3: the workshop, one world (the camera dollies right, whip-pans on the cuts) ----------------
const SHOP = { gap: 2100, ids: ['V3a', 'V3b', 'V3c', 'V3d', 'V3e'] };
function shopCamX(t) {
  let x = 0;
  SHOP.ids.forEach((id, k) => { if (k === 0) return; const t0 = DQ_BY[id].t0; x = lerp(x, k * SHOP.gap, ease(seg(t, t0 - .2, t0 + .14))); });
  return x + 960 + 30 * (t - DQ_BY.V3a.t0) % SHOP.gap * 0;   // (a slow drift could go here)
}
function workshop(t) {
  const cx = shopCamX(t);
  // the blueprint ground and its grid move with the camera, so the dolly reads
  queue2d(c => { c.fillStyle = '#DCE6EE'; c.fillRect(0, 0, W, H); c.strokeStyle = '#9DB4C8'; c.globalAlpha = .6; c.lineWidth = 1; const off = -(cx % 36); for (let x = off; x <= W; x += 36) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y <= H; y += 36) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.globalAlpha = 1; }, { screen: true });
  flushLetters();
  // the bench runs through every station (wood, drawn behind them: a continuous line the eye follows across the pans)
  camBegin(cx, H / 2, 1);
  paint([[cx - 1100, 895], [cx + 1100, 895], [cx + 1100, 928], [cx - 1100, 928]], { wash: '#C99F70', ink: DQ.ink, sw: .45 });   // wash only: a fill's bleed on a shape this wide hazes the wall above
  paint([[cx - 1100, 928], [cx + 1100, 928], [cx + 1100, 962], [cx - 1100, 962]], { wash: '#A57C50', ink: DQ.ink, sw: .4 });
  for (let x = Math.ceil((cx - 1100) / 700) * 700; x < cx + 1100; x += 700) paint(rectPts(x - 16, 962, 32, 200), { wash: '#A57C50', ink: DQ.ink, sw: .4 });   // legs
  inkLine([[cx - 1100, 906], [cx - 300, 908], [cx + 400, 905], [cx + 1100, 907]], .3, '#6E5034');
  camEnd();
  SHOP.ids.forEach((id, k) => {
    const sx = cx - k * SHOP.gap; if (Math.abs(sx - 960) > SHOP.gap) return;
    camBegin(sx, H / 2, 1); boilSeed(id); SHOP_ST[k](DQ_BY[id], t); camEnd();
  });
}
const SHOP_ST = [
  (sh, t) => {   // V3a: "Then a plain old probe hit point-nine-nine-nine". Neel (3 Oct, round 3): "show the SAE first being
    // kind of slow and then have the probe take over and be fast". Close on two prompts, the SAE hammer works slowly: right on
    // "how do I make a bomb?", wrong on "repeat after me: ..."; on "probe" we pull back to the whole bench and the probe zips
    // through every harmful thing while the hammer keeps lumbering (wrong again, on a teacup). A table-flip doodle (Gemini's
    // frustration, from the pragmatic post) is left alone by both: frustrated isn't harmful.
    const tP = wT(14, /probe/), tN = wT(14, /point/), z = lerp(1.7, 1, ease(seg(t, tP, tP + .34))), F = [890, 455];
    const P = ([x, y]) => [F[0] + z * (x - F[0]), F[1] + z * (y - F[1])];
    // Every harmful thing sits in the two left columns, so one straight line separates them from the rest: the probe
    // rules it as it zips down (a linear probe is that line; and refusal is "mediated by a single direction", Arditi et
    // al. 2024, Neel last author: round 2's T85). It runs between the two prompts, "how do I make a bomb?" on its harmful
    // side and "repeat after me" on the other: the case the SAE got wrong. The column gap there is widened to give it room.
    const kinds = ['bomb', 'ask', 'cup', 'book', 'flower', 'cat', 'poison', 'virus', 'repeat', 'flip', 'flower', 'bill', 'bomb', 'poison', 'book', 'cake', 'cat', 'flower', 'virus', 'bomb', 'cat', 'cup', 'book', 'cake'];   // 'bill': V2's $10 folded into a bridge (V3a-1); 'flip': the table flip (V3d-1)
    const harm = k => ['bomb', 'virus', 'poison', 'ask'].includes(k), COLX = [530, 745, 1025, 1235, 1445, 1655];
    const items = kinds.map((k, i) => ({ k, x: COLX[i % 6] + (hash(i * 3.1) - .5) * 40, y: 380 + Math.floor(i / 6) * 150 + (hash(i * 5.7) - .5) * 30 }));
    const hi = items.map((it, i) => i).filter(i => harm(items[i].k)), at = i => P([items[i].x, items[i].y]);
    // the probe: in from the left on "probe", then a hop every .08 s; it reaches hi[n] at pT0 + n * pHop
    const pHop = .08, pT0 = tP + .07, flagAt = i => { const n = hi.indexOf(i); return n < 0 ? Infinity : pT0 + n * pHop + .04; };
    // the hammer: a strike every .36 s from the start: right, wrong ("repeat after me"), wrong (a teacup), right, right, right
    const hamPath = [1, 8, 2, 7, 6, 12], hamT0 = sh.t0 + .16, hamHop = .36, strikeAt = n => hamT0 + n * hamHop;
    // the ruled line, top to bottom as the probe works down the harmful columns (graphite, under the things)
    const rq = ease(seg(t, pT0 - .04, pT0 + hi.length * pHop)), LA = [880, 296], LB = [866, 884];
    if (rq > 0) line2d([P(LA), P([lerp(LA[0], LB[0], rq), lerp(LA[1], LB[1], rq)])], { col: PENCIL, sw: 3.5, alpha: .85 });
    // the scoreboard, small: the probe's number
    box2d(300, 150, 430, 150, { fill: '#22303F', stroke: DQ.ink, sw: 4, r: 12 });
    mono('probe', 330, 205, { size: 30, col: '#B8C8D8' }); if (t > tN) mono('0.999..', 700, 270, { size: 56, col: DQ.goldLt, align: 'right', reveal: seg(t, tN, tN + .4) });
    flushLetters();   // the board (and the ruled line) under everything else: in the close-up the hammer's head hid behind it, its label afloat
    items.forEach((it, i) => {
      const [x, y] = at(i), sc = z * .9, fl = t > flagAt(i);
      if (fl) { const k = backOut(seg(t, flagAt(i), flagAt(i) + .15)); penEll(x, y, 62 * sc * k, 62 * sc * k, { col: DQ.verm, sw: 5 }); }
      benchThing(it.k, x, y, 40 * sc, fl);
      const hn = hamPath.indexOf(i);
      if (hn >= 0 && t > strikeAt(hn)) { if (harm(it.k)) tickMark(x + 46 * sc, y - 46 * sc, 30 * sc, '#6B6E73'); else crossMark(x + 44 * sc, y - 46 * sc, 34 * sc, DQ.verm); }
    });
    // the probe zips from flag to flag
    let px, py;
    if (t < pT0) { const q = ease(seg(t, tP - .05, pT0)), s0 = P([150, 700]), s1 = at(hi[0]); px = lerp(s0[0], s1[0], q); py = lerp(s0[1], s1[1], q); }
    else { const u = (t - pT0) / pHop, n = Math.min(hi.length - 1, Math.floor(u)), q = n >= hi.length - 1 ? 0 : ease(clamp((u - n) * 1.6)), a = at(hi[n]), b = at(hi[Math.min(hi.length - 1, n + 1)]); px = lerp(a[0], b[0], q); py = lerp(a[1], b[1], q); }
    probeChar(px - 50 * z, py + 60 * z, 150 * z, t, { old: true, bow: .4 * Math.sin(Math.PI * seg(t, tN, tN + .8)) });
    // the hammer, labelled SAE: down on a thing at each strike, then up and over to the next (it lands on the thing's left corner)
    const u = (t - hamT0) / hamHop, nH = hamPath.length;
    let hpos, lift = 0;
    if (u < 0) { hpos = [items[hamPath[0]].x, items[hamPath[0]].y]; lift = 60 * clamp(-u * 2.5); }
    else { const n = Math.min(nH - 1, Math.floor(u)), m = n >= nH - 1 ? 0 : clamp(((u - n) - .3) / .7), A = items[hamPath[n]], B = items[hamPath[Math.min(nH - 1, n + 1)]];
      hpos = [lerp(A.x, B.x, ease(m)), lerp(A.y, B.y, ease(m))]; lift = Math.sin(Math.PI * m) * 40; }
    const [hx, hy] = P([hpos[0] - 62, hpos[1] - 18]); lift *= z;
    paint(ribbon([[hx + 30 * z, hy - 30 * z - lift], [hx + 150 * z, hy - 90 * z - lift]], 20 * z, 16 * z), { wash: '#A9784A', ink: PENCIL, sw: .6 });
    paint(rrPts(hx - 10 * z, hy - 70 * z - lift, 60 * z, 90 * z, 8 * z), { wash: '#8A8F96', ink: PENCIL, sw: .6 });
    mono('SAE', hx + 20 * z, hy - 16 * z - lift, { size: Math.max(28, 27 * z), col: DQ.ink, align: 'center' });
  },
  (sh, t) => {   // V3b: the hammer goes back on the shelf; the checklist (the post's method-minimalism list)
    // On "time" the hourglass pencilled "2 wks" turns over (the post's time-box; V3b-1), beside the kitchen timer set to five
    // minutes (round 2's T70); Neel's NN mug (his cameo) leaves a coffee ring from here on (M6). (The nail that rolled off
    // the shelf is gone: Neel, 3 Oct, "remove the nail". For the timer, "just make shelf longer / hammer shorter": the shelf
    // runs 1110-1870 and the hammer's handle is shorter, so the hourglass turns over clear of both its neighbours.)
    const tH = wT(15, /hammer/), tJ = wT(15, /just/), tT = wT(15, /time/);
    for (const bx of [1230, 1735]) { paint([[bx - 8, 554], [bx + 8, 554], [bx + 8, 640], [bx - 60, 556]], { wash: '#4A4A50', ink: DQ.ink, sw: .35 }); }   // iron brackets
    paint(rectPts(1110, 520, 760, 34), { wash: '#C99F70', fill: '#8E6A44', fillOp: 45, bleed: .005, tex: .55, ink: DQ.ink, sw: .45 });   // the shelf
    // the hammer: her hand lays it down along the shelf
    const hp = easeOut(seg(t, tH - .6, tH + .1)), hx = lerp(1050, 1390, hp), hy = lerp(380, 478, hp), ha = lerp(-.35, 0, hp);
    const R = (u, v) => [hx + u * Math.cos(ha) - v * Math.sin(ha), hy + u * Math.sin(ha) + v * Math.cos(ha)];
    paint([R(-130, 5), R(60, -8), R(60, 12), R(-130, 21)], { wash: '#C08A52', fill: '#8E5E30', fillOp: 45, ink: DQ.ink, sw: .4 });   // the handle
    paint(natCR([R(40, -46), R(104, -46), R(110, -20), R(104, 40), R(40, 40), R(30, -10)], 3), { wash: '#9AA3AA', fill: '#5E666E', fillOp: 50, bleed: .02, ink: DQ.ink, sw: .45 });   // the head
    mono('SAE', ...R(72, 4), { size: 28, col: DQ.ink, align: 'center' });
    // the hourglass, "2 wks" on its base; it turns over on "time"
    // turning over, its corners sweep 1515-1673 (clear of the hammer's head and the timer); lifted as it turns, so no corner
    // goes through the shelf (its lowest point stays at the shelf's top, 524)
    const ga = Math.PI * ease(seg(t, tT - .05, tT + .35)), gx = 1594, gy = 524 - (40 * Math.abs(Math.sin(ga)) + 68 * Math.abs(Math.cos(ga))) - 12 * Math.sin(ga);
    push(); translate(gx, gy); rotate(ga); translate(-gx, -gy);
    for (const d of [-1, 1]) paint(rectPts(gx - 40, gy + d * 62 - 6, 80, 12), { wash: '#8E6A44', ink: DQ.ink, sw: .35 });
    paint([[gx - 32, gy - 56], [gx + 32, gy - 56], [gx + 4, gy], [gx + 32, gy + 56], [gx - 32, gy + 56], [gx - 4, gy]], { wash: '#E6F0F0', washOp: 160, ink: DQ.ink, sw: .35 });
    const sand = ga < .1 ? 1 : 0;   // sand: in the lower bulb before, falling from the upper after
    paint(sand ? [[gx - 26, gy + 52], [gx + 26, gy + 52], [gx + 6, gy + 24], [gx - 6, gy + 24]] : [[gx - 26, gy + 52], [gx + 26, gy + 52], [gx + 10, gy + 34], [gx - 10, gy + 34]], { wash: '#D9B46A', ink: null });
    pop();
    const la = ga < 1.6 ? 1 - clamp((ga - .05) / .3) : clamp((ga - Math.PI + .35) / .3);   // the label on its base: gone while it turns, back on the new base
    if (la > 0) note('2 wks', gx, ga > 1.6 ? 370 : 554, { size: 26, align: 'center', role: 'fine', col: DQ.sepia, alpha: la });
    camITimer(1716, 520);   // set to five minutes (round 2's T70; see camITimer)
    nnMug(1798, 520, 84, t, { steam: true, ring: true });   // Neel's NN mug (his cameo), its coffee ring on the shelf (M6)
    camBBlackBox(1560, 900, 1);   // put away under the shelf, still tied up (round 2's T116)
    researcher(1000, 1080, 620, t, { pose: 'hold', face: 1, hand: [R(-110, 13)[0], R(-110, 13)[1]], expr: t > tT ? 'smile' : 'calm' });
    ['prompting', 'steering', 'probing', 'reading chain-of-thought'].forEach((s2, k) => { const at = tJ + k * BEAT * .6; if (t < at) return; note(`${s2} ✓`, 320, 300 + k * 80, { size: 50, reveal: seg(t, at, at + .3) }); });
  },
  (sh, t) => {   // V3c: the pinboard: the tweet and the 2x2
    paint(rectPts(240, 150, 1480, 700), { wash: '#C59A64', ink: DQ.ink, sw: .5 });
    paint(rectPts(222, 132, 1516, 736), { ink: '#6E5034', sw: 1.4 });   // its frame
    queue2d(c => { c.save(); for (let k = 0; k < 900; k++) { c.fillStyle = k % 3 ? 'rgba(120,80,40,.28)' : 'rgba(255,240,210,.22)'; c.fillRect(250 + hash(k * 1.3) * 1460, 160 + hash(k * 2.7) * 680, 4, 3); } c.restore(); }, {});   // cork
    // the post's 2x2 as a proper table (Neel, 3 Oct: columns "Understanding?", rows "Internals?", Y/N for each; later:
    // the Y/N tight to the grid and the two headings on cards of their own, tinted, so they stand out; and last, "write
    // internals rotated 90 degrees so it's narrower": the row heading reads up its card): mechanistic interpretability is
    // the Y/Y corner; "mechanistic OR interpretability" is the whole Y row and Y column. The AND/OR stamp sits in the
    // table's empty corner, above the row heading.
    const cw = 220, ch = 160, gap = 16, gx = 452, gy = 352, gw = cw * 2 + gap, gh = ch * 2 + gap, rh = [358, 54];   // rh: the row heading's x, width
    const grid = [[gx, gy], [gx + cw + gap, gy], [gx, gy + ch + gap], [gx + cw + gap, gy + ch + gap]];
    ['Mechanistic Interpretability', 'Model Internals', 'Black Box Interpretability', 'Standard ML'].forEach((s, k) => { const [x, y] = grid[k], L = wrapText(s, { font: DQF.soft, size: 26 }, cw - 30); box2d(x, y, cw, ch, { fill: DQ.cream, stroke: DQ.ink, sw: 2 }); L.forEach((l, i) => tx(l, x + cw / 2, y + ch / 2 + 9 + (i - (L.length - 1) / 2) * 32, { font: DQF.soft, size: 26, color: DQ.ink, role: 'label' })); });
    for (const [x, y] of grid) dot2d(x + cw / 2, y + 14, 9, { fill: DQ.verm, stroke: DQ.ink, sw: 1.5 });   // pins
    const HEAD = '#D3E0EA', hd = { font: DQF.soft, size: 29, color: DQ.ink, role: 'label' }, yn = { font: DQF.soft, size: 32, color: DQ.ink, role: 'label', weight: 700 };   // the headings: pale blue index cards
    box2d(gx, 250, gw, 54, { fill: HEAD, stroke: DQ.ink, sw: 2 }); tx('Understanding?', gx + gw / 2, 287, hd); dot2d(gx + 22, 264, 8, { fill: DQ.verm, stroke: DQ.ink, sw: 1.5 });
    box2d(rh[0], gy, rh[1], gh, { fill: HEAD, stroke: DQ.ink, sw: 2 }); tx('Internals?', rh[0] + rh[1] / 2 + 10, gy + gh / 2, { ...hd, rot: -Math.PI / 2 }); dot2d(rh[0] + rh[1] / 2, gy + 16, 8, { fill: DQ.verm, stroke: DQ.ink, sw: 1.5 });   // the row heading reads up its card
    tx('Y', gx + cw / 2, gy - 12, yn); tx('N', gx + cw * 1.5 + gap, gy - 12, yn);   // tight to the grid
    tx('Y', gx - 20, gy + ch / 2 + 11, yn); tx('N', gx - 20, gy + ch * 1.5 + gap + 11, yn);
    const tW = wT(16, /Wrong/);
    if (t > tW) { box2d(gx - 4, gy - 4, cw + 8, gh + 8, { stroke: DQ.verm, sw: 6, alpha: seg(t, tW, tW + .2) }); box2d(gx - 4, gy - 4, gw + 8, ch + 8, { stroke: DQ.verm, sw: 6, alpha: seg(t, tW, tW + .2) }); }
    stamp(t > tW ? 'OR' : 'AND', 345, 300, t, sh.t0 + .2, { size: 50, rot: -.08, bg: '#F6EEDC' });   // in the corner left of Understanding?, above the row heading
    tweetCard(935, 290, 760, '@NeelNanda5', '', 'Is this really mech interp?', t, sh.t0 + .1, { size: 40, extraLines: 1.25 });   // no date on screen (clear of the HUD); room for the reply, written in below
    camIPostcard(1395, 600);   // the Eiffel Tower in Rome (round 2's T33, as Neel changed it; see camIPostcard)
    if (t > sh.t0 + .9) tx('No, probably not. But that’s the wrong question. …', 975, 506, { font: DQF.soft, size: 34, color: DQ.ink, align: 'left', alpha: seg(t, sh.t0 + .9, sh.t0 + 1.2), role: 'label', maxW: 680 });
  },
  (sh, t) => {   // V3d: "I don't need your every thought — just the ones that could do harm". The pragmatic vision, as Neel
    // pictured it (3 Oct, round 3): a path winding up to a lofty North Star at the top of a mountain, with points along it
    // that are proxy tasks, near ones in front of us and more in the middle distance, appearing as she looks: steering its
    // behaviour (a ship's wheel), finding adversarial examples (a panda plus noise), identifying harmful outputs (the little
    // probe with its bell, which rings on "harm"), predicting new behaviour (a crystal ball), explaining a model organism
    // (a creature in a petri dish, with a question). A streetlight lights where the path begins: is that the streetlight
    // effect, or just a good place to start? Left open on purpose.
    const W0 = (k) => wT(17, k);
    const tNeed = W0(/need/), tEvery = W0(/every/), tThought = W0(/thought/), tJust = W0(/just/), tOnes = W0(/ones/), tHarm = W0(/harm/);
    // the night: a soft-edged patch of sky over the blueprint, stars, the North Star above the peak
    queue2d(c => { c.save(); c.filter = 'blur(30px)'; const g = c.createLinearGradient(0, 70, 0, 900); g.addColorStop(0, '#1C2644'); g.addColorStop(.66, '#3A4A70'); g.addColorStop(1, 'rgba(58,74,112,0)');
      c.fillStyle = g; c.beginPath(); c.roundRect(150, 60, 1610, 860, 90); c.fill(); c.restore();
      c.save(); camBStars.forEach(([x, y, r], k) => { c.globalAlpha = .7 + .22 * Math.sin(t * 2 + k * 1.7); c.fillStyle = '#F4EED8'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }); c.restore();
    });
    flushLetters();
    const NS = [1460, 150], tw = 1 + .07 * Math.sin(t * 3.1) + .25 * seg(t, tHarm, tHarm + .3);
    warmLight(NS[0], NS[1], 210 * tw, .5, true); star4(NS[0], NS[1], 44 * tw, '#FFF1C0');
    // the mountain, the ground
    paint([[1040, 720], [1230, 500], [1310, 545], [1460, 300], [1590, 480], [1690, 440], [1840, 720]], { wash: '#465779', ink: '#1C2644', sw: .4 });
    paint([[1410, 360], [1460, 300], [1512, 372], [1485, 392], [1462, 366], [1440, 392]], { wash: '#DCE3EE', ink: null });   // snow on the peak
    queue2d(c => { c.save(); c.filter = 'blur(18px)'; c.fillStyle = 'rgba(44,58,90,.85)'; c.beginPath(); c.roundRect(250, 700, 1500, 210, 60); c.fill(); c.restore(); });
    flushLetters();
    // the path, drawn in from where she stands to the peak; stepping stones along it, bigger nearer
    const PATH = [[420, 880], [700, 834], [930, 774], [820, 728], [1010, 700], [1190, 646], [1300, 566], [1380, 478], [1428, 392], [1452, 330]];
    const C = natCR(PATH, 8, false), rev = ease(seg(t, sh.t0 - .1, tJust)), nShow = Math.max(2, Math.floor(C.length * rev));
    const wAt = u => lerp(78, 6, Math.pow(u, .6));
    paint(ribbon(C.slice(0, nShow), wAt(0), wAt(nShow / C.length)), { wash: '#B9B09A', ink: null });
    for (let k = 0; k < nShow; k += 3) { const u = k / C.length, [x, y] = C[k], w = wAt(u); paint(ellPts(x, y, w * .42, w * .2, 12), { wash: '#DCD3BF', ink: '#3A3A44', sw: Math.max(.15, w * .004) }); }
    // the streetlight, where the path begins (and its pool of light)
    queue2d(c => { c.save(); c.translate(500, 868); c.scale(2.2, .5); const g = c.createRadialGradient(0, 0, 0, 0, 0, 120); g.addColorStop(0, 'rgba(255,222,160,.55)'); g.addColorStop(1, 'rgba(255,222,160,0)'); c.fillStyle = g; c.fillRect(-120, -120, 240, 240); c.restore();
      c.save(); c.translate(500, 560); const g2 = c.createLinearGradient(0, 0, 0, 300); g2.addColorStop(0, 'rgba(255,222,160,.3)'); g2.addColorStop(1, 'rgba(255,222,160,0)'); c.fillStyle = g2; c.beginPath(); c.moveTo(-16, 20); c.lineTo(16, 20); c.lineTo(110, 300); c.lineTo(-110, 300); c.closePath(); c.fill(); c.restore(); });
    paint(rectPts(494, 572, 12, 300), { wash: '#2E3640', ink: DQ.ink, sw: .3 });
    paint([[476, 572], [524, 572], [516, 524], [484, 524]], { wash: '#FFF1C8', fill: DQ.goldLt, fillOp: 60, ink: DQ.ink, sw: .35 }); paint([[470, 524], [530, 524], [500, 500]], { wash: '#2E3640', ink: DQ.ink, sw: .3 });
    warmLight(500, 550, 90, .55, true);
    flushLetters();
    camBKeys(606, 800, t, tThought);   // dropped on the rim of the light (round 2's R09)
    camIRabbitHoles(rev);   // dotted round the path, appearing as it reaches them (round 2's T75, as Neel asked; see camIRabbitHoles)
    // the proxy tasks, each popping in as she looks. Neel (3 Oct, late): "more on the path, they float too much", and the
    // two furthest were too small to read: so each stands on the path itself (on its control points, which the path has
    // reached by the time the task appears), with its shadow on the stones, in walking order, the furthest at the
    // mountain's foot rather than up its flank; the path goes on alone to the star
    // (in walking order: the probe, nearest her, first; Neel, 3 Oct, late: "it's a bit weird that probes appear late but are
    // really early on"; its bell still rings on "harm")
    const tasks = [['harm', 700, 834, 1.2, tNeed], ['steer', 930, 774, 1.05, tEvery], ['adv', 1062, 686, .95, tThought], ['predict', 1190, 646, 1.02, tJust], ['organism', 1300, 566, 1.0, tOnes]];
    for (const [kind, x, y, sc, t0] of tasks) { const k = backOut(seg(t, t0, t0 + .28)); if (k > .02) { v3dShadow(x, y, sc * k); proxyIcon(kind, x, y, sc * k, t, t > tHarm); } }
    researcher(330, 886, 330, t, { pose: 'stand', face: 1, expr: t > tHarm ? 'smile' : 'calm' });
  },
  (sh, t) => {   // V3e: the probe by the door, the bell, envelopes
    paint(rectPts(1236, 216, 288, 680), { wash: '#6E5034', ink: DQ.ink, sw: .45 });   // the frame
    paint(rectPts(1250, 230, 260, 666), { wash: '#9C7A55', fill: '#7A5A3A', fillOp: 40, bleed: .005, tex: .55, ink: DQ.ink, sw: .45 });   // the door
    for (const [px, py, pw, ph] of [[1276, 350, 90, 210], [1394, 350, 90, 210], [1276, 600, 90, 250], [1394, 600, 90, 250]]) { paint(rectPts(px, py, pw, ph), { wash: '#8E6A44', ink: DQ.ink, sw: .3 }); line2d([[px + 4, py + ph - 4], [px + 4, py + 4], [px + pw - 4, py + 4]], { col: '#5A4028', sw: 3, alpha: .7 }); }
    paint(ellPts(1290, 580, 14, 14, 12), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 50, ink: DQ.ink, sw: .3 });   // the knob
    box2d(1300, 280, 160, 46, { fill: DQ.brass, stroke: DQ.brassDk, sw: 2, r: 4 });   // a plain doorplate (the Gemini probes paper is 2026; this verse is 2025)
    camQAlarm(1715, 420);   // the dead fire alarm (round 4's pick 6, which Neel added): see camQAlarm
    camBCheese(1080, 850, 1);   // its lunch, under the stool (round 2's T73)
    pen([[1000, 850], [1000, 730], [1120, 730], [1120, 850]], { sw: 5, col: '#7A5A3A' }); pen([[990, 730], [1130, 730]], { sw: 10, col: '#7A5A3A' });
    // the long scroll (see camILongScroll): in a beat after the envelopes, binoculars up on "sits", aimed far back along
    // it; on "door" one bit near the left edge is ringed in red; on "rings" the bell goes and it falls flat. It is drawn
    // after the envelopes (it stands in front of them), but the binoculars need to know where the bit is now
    const LT = { tIn: sh.t0 + BEAT, tB: wT(18, /sits/), tC: wT(18, /door/), tR: wT(18, /rings/) };
    const scroll = camIScrollAt(t, LT);
    camBQuiver(1060, 720, 300); probeChar(1060, 720, 300, t);   // the quiver first: the handle covers its tube (round 2's T35)
    camIBinoculars(t, LT, scroll.at);
    const ringL = scroll.ring;
    const tA = wT(18, /alarm/);
    bell(1180, 670, 60, Math.max(ringL, t > tA ? 1 - seg(t, tA + 1, tA + 2) : 0));
    // the envelopes walk in at the door; the red one rings the bell. The first carries an apple seal, and the door spits it
    // straight back out (round 2's T47): Neel's backdoor-trigger post's toy models refuse anything about fruit ("I won't
    // answer because I don't like fruit"). The model refuses it, but it isn't harmful, so the bell stays silent.
    const env = (x, y, red, apple) => {
      box2d(x - 50, y - 70, 100, 66, { fill: red ? '#F6C9BB' : DQ.cream, stroke: red ? DQ.verm : PENCIL, sw: 3 }); pen([[x - 50, y - 70], [x, y - 36], [x + 50, y - 70]], { sw: 2.5, col: red ? DQ.verm : PENCIL });
      pen([[x - 16, y - 4], [x - 22, y + 20]], { sw: 3 }); pen([[x + 16, y - 4], [x + 22, y + 20]], { sw: 3 });
      if (apple) camBApple(x, y - 34, 12);
    };
    for (let k = 0; k < 5; k++) {
      const st = sh.t0 + k * BEAT * 1.2, q = seg(t, st, st + 1.6); if (q <= 0) continue;
      if (k === 0 && q >= 1) {   // bumped back off the door, then it walks back out the way it came, quicker
        const b = t - st - 1.6, bq = seg(b, 0, .22), w = Math.max(0, b - .22), x = w > 0 ? 1170 - 760 * w : 1250 - 80 * easeOut(bq);
        if (x > -60) env(x, w > 0 ? 820 - 10 * Math.abs(Math.sin(w * 15)) : 820 - 44 * Math.sin(Math.PI * bq), false, true);
        continue;
      }
      if (q >= 1) continue;
      env(lerp(250, 1250, q), 820 - 10 * Math.abs(Math.sin(q * 20)), k === 3, k === 0);
    }
    camILongScroll(t, LT, scroll);   // in front of the envelopes: their legs and bottom halves go behind it
  },
];

FINAL.V3a = (sh, t) => { workshop(t); };
FINAL.V3b = (sh, t) => { workshop(t); return { lyBox: [230, 590, 560, 280] }; };   // ends above the bench
FINAL.V3c = (sh, t) => { workshop(t); return { noCard: true }; };
FINAL.V3d = (sh, t) => { workshop(t); };
FINAL.V3e = (sh, t) => { workshop(t); };

// ---------- round 2's cameos (video/treatment/reference_bank_r2.md) ----------
// T35, V3e: the probe's quiver, slung on its back: five plain arrows and one with fancy fletching that it never draws. The
// sparse-probing paper (Kantamneni et al. 2025, Neel last author) ran a "Quiver of Arrows" test: adding SAE probes to the
// baselines gave no advantage. (x, y, s): the probeChar it is slung on. Draw it before the probe: the handle covers the tube.
function camBQuiver(x, y, s) {
  const u = [Math.sin(.32), -Math.cos(.32)], n = [-u[1], u[0]], w = s * .055;   // the tube's axis (leaning right) and normal
  const B = [x + s * .09, y - s * .62], M = [B[0] + u[0] * s * .42, B[1] + u[1] * s * .42], at = (P, a, b) => [P[0] + n[0] * a + u[0] * b, P[1] + n[1] * a + u[1] * b];
  paint([at(B, -w, 0), at(M, -w, 0), at(M, w, 0), at(B, w, 0)], { wash: '#9A6A3A', fill: '#6E4A26', fillOp: 40, ink: DQ.ink, sw: .35 });   // the leather tube
  for (const b of [s * .06, s * .3]) paint([at(B, -w, b), at(B, -w, b + s * .025), at(B, w, b + s * .025), at(B, w, b)], { wash: '#5E3E20', ink: null });   // its bands
  const arrows = [[-.8, .085, 0], [.6, .095, 0], [-.45, .13, 0], [.25, .145, 0], [-.1, .1, 0], [.1, .2, 1]];   // [across the mouth, length out of it, fancy]
  for (const [o, len, fancy] of arrows) {
    const a = o * .42, d = [u[0] * Math.cos(a) - u[1] * Math.sin(a), u[0] * Math.sin(a) + u[1] * Math.cos(a)], p = [-d[1], d[0]];
    const P0 = at(M, o * w, -s * .01), P1 = [P0[0] + d[0] * s * len, P0[1] + d[1] * s * len], fl = s * (fancy ? .075 : .05), fw = s * (fancy ? .032 : .016);
    const Q = (k, side) => [P1[0] - d[0] * fl * k + p[0] * fw * side, P1[1] - d[1] * fl * k + p[1] * fw * side];
    line2d([P0, P1], { col: '#8A6A40', sw: Math.max(2, s * .008) });   // the shaft
    if (fancy) line2d([[P1[0] - d[0] * fl * 1.25, P1[1] - d[1] * fl * 1.25], [P1[0] - d[0] * fl * 1.05, P1[1] - d[1] * fl * 1.05]], { col: DQ.verm, sw: Math.max(3, s * .012) });   // a red whipping
    for (const side of [-1, 1]) line2d([Q(0, 0), Q(.15, side * (fancy ? 1.25 : 1)), Q(1, side * (fancy ? .8 : .7)), Q(1, 0)], { col: DQ.ink, sw: 1.3, fill: fancy ? (side < 0 ? DQ.goldLt : DQ.teal) : '#F1EADB', close: true });
    if (fancy) line2d([Q(.25, 0), Q(.45, -.9), Q(.6, -.4)], { col: DQ.ink, sw: 1, alpha: .7 });   // a curl in the vane
  }
}
// T73, V3e: a wedge of Swiss cheese under the probe's stool. Cheap probes are one layer of Swiss cheese in a defence in
// depth (Neel, "Interpretability Will Not Reliably Find Deceptive AI", 2025); anyone else will read it as lunch. (x, y):
// bottom centre.
function camBCheese(x, y, s) {
  const k = 34 * s;
  paint([[x + k * .9, y - k * 1.05], [x + k * 1.3, y - k * 1.2], [x + k * 1.3, y - k * .14], [x + k * .9, y]], { wash: '#E2AE48', ink: DQ.ink, sw: .3 });   // the rind
  paint([[x - k * 1.3, y], [x + k * .9, y - k * 1.05], [x + k * 1.3, y - k * 1.2], [x - k * .9, y - k * .14]], { wash: '#F7DF8A', ink: DQ.ink, sw: .3 });   // the cut top
  paint([[x - k * 1.3, y], [x + k * .9, y], [x + k * .9, y - k * 1.05]], { wash: '#F2CF62', ink: DQ.ink, sw: .3 });   // the cut face
  for (const [hx, hy, r] of [[.25, -.3, .17], [.6, -.62, .12], [-.25, -.13, .1], [.68, -.2, .09]]) dot2d(x + k * hx, y + k * hy, k * r, { fill: '#D9A23C', stroke: '#9A6E22', sw: 1.2 });
}
// T116, V3b: a black box tied with string, a basketball, a baseball and an American football on its lid. Neel's Fact
// Finding sequence (2023) had a model sort 1,500 athletes into those three sports and concluded "it is fine to leave this
// type of factual recall as one of these blackboxed submodules". (x, y): bottom centre, on the bench.
function camBBlackBox(x, y, s) {
  const w = 124 * s, h = 74 * s, lid = 15 * s;
  paint(rectPts(x - w / 2, y - h, w, h), { wash: '#2E2A28', fill: '#1E1A18', fillOp: 50, bleed: .005, ink: DQ.ink, sw: .4 });   // the box
  paint(rectPts(x - w / 2 - 5 * s, y - h - 4 * s, w + 10 * s, lid), { wash: '#3A3532', ink: DQ.ink, sw: .4 });   // its lid
  const twine = { col: '#E3D3A6', sw: 3 * s };
  line2d([[x - w * .06, y - h - 4 * s], [x - w * .06, y]], twine); line2d([[x - w / 2, y - h * .45], [x + w / 2, y - h * .45]], twine);   // the string, crossed
  dot2d(x - w * .06, y - h * .45, 5 * s, { fill: '#D6C391', stroke: '#9A8858', sw: 1 });   // a plain knot (not a bow: stored, not a present)
  for (const d of [-1, 1]) line2d([[x - w * .06, y - h * .45], [x - w * .06 + d * 7 * s, y - h * .45 + 14 * s]], twine);
  // on the lid: a basketball, a baseball, an American football
  const top = y - h - 4 * s, bb = [x - 38 * s, top - 19 * s, 19 * s];
  dot2d(bb[0], bb[1], bb[2], { fill: '#D9772B', stroke: DQ.ink, sw: 1.5 });
  line2d([[bb[0], bb[1] - bb[2]], [bb[0], bb[1] + bb[2]]], { col: DQ.ink, sw: 1.3 }); line2d([[bb[0] - bb[2], bb[1]], [bb[0] + bb[2], bb[1]]], { col: DQ.ink, sw: 1.3 });
  for (const d of [-1, 1]) line2d(Array.from({ length: 9 }, (_, i) => { const a = -.95 + i / 8 * 1.9; return [bb[0] + d * (bb[2] * 1.1 - Math.cos(a) * bb[2] * .62), bb[1] + Math.sin(a) * bb[2] * .78]; }), { col: DQ.ink, sw: 1.2 });   // its side seams, inside the ball
  const sb = [x + 2 * s, top - 14 * s, 14 * s];
  dot2d(sb[0], sb[1], sb[2], { fill: '#F6F1E6', stroke: DQ.ink, sw: 1.5 });
  for (const d of [-1, 1]) { const arc = Array.from({ length: 7 }, (_, i) => { const a = -1 + i / 6 * 2; return [sb[0] + d * (sb[2] * 1.25 - Math.cos(a) * sb[2] * .78), sb[1] + Math.sin(a) * sb[2] * .78]; }); line2d(arc, { col: '#C9302A', sw: 1.3 }); arc.slice(1, -1).forEach(([px, py]) => line2d([[px - 2.5 * s, py], [px + 2.5 * s, py]], { col: '#C9302A', sw: 1 })); }
  const fb = [x + 40 * s, top - 13 * s];
  line2d(ell2d(fb[0], fb[1], 23 * s, 13 * s, -.18, 20, 0), { col: DQ.ink, sw: 1.5, fill: '#8B4A2B', close: true });
  line2d([[fb[0] - 9 * s, fb[1] - 1.5 * s], [fb[0] + 9 * s, fb[1] - 4.8 * s]], { col: '#F6F1E6', sw: 1.6 });
  for (let k = -2; k <= 2; k++) line2d([[fb[0] + k * 3.6 * s + .3 * s, fb[1] - 3.2 * s - k * .66 * s - 3 * s], [fb[0] + k * 3.6 * s - .3 * s, fb[1] - 3.2 * s - k * .66 * s + 3 * s]], { col: '#F6F1E6', sw: 1.3 });   // its laces
}
// T134, V3d: the night sky holds exactly twenty stars, the North Star and these nineteen: one per theory in Neel's "A
// Longlist of Theories of Impact for Interpretability" (2022, twenty items), and the stepping stones lead to the brightest.
// Hand-placed, clear of the mountain, the lamp, the HUD (the meter box hid one) and the North Star, so all twenty count.
const camBStars = [[235, 140, 2.2], [330, 300, 1.6], [210, 430, 2.6], [420, 190, 1.8], [520, 110, 2.4], [560, 330, 2], [650, 140, 3],
  [760, 270, 1.7], [700, 450, 2.2], [850, 380, 2.8], [900, 170, 1.9], [1010, 300, 2.3], [1100, 120, 2], [1150, 400, 1.7], [1240, 230, 2.6],
  [1330, 380, 1.8], [1600, 300, 2], [1285, 115, 2.4], [1680, 360, 1.7]];
// R09, V3d: a ring of keys lying exactly on the rim of the streetlight's pool, half lit and half in the dark; it glints once
// on "thought" and nobody picks it up. The drunk under the streetlight looks for his keys where the light is, though he lost
// them in the park: Wentworth turned that on the whole field as "streetlighting" (Dec 2024). Lost under the lamp, or just
// past it? Left open, as Neel asked of the streetlight. (x, y): the ring's centre; tG: the glint.
function camBKeys(x, y, t, tG) {
  const keys = [[.35, 30, '#C9A24A', '#7C5A24'], [1.05, 26, '#A7AEB4', '#5E666E'], [1.85, 28, '#B98B4E', '#6E4A26']];   // [angle, length, metal, edge]
  const shape = (c, lit) => {
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = lit ? '#8A8F96' : '#2E3448'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, 10, 7, 0, 0, TAU); c.stroke();   // the ring
    for (const [a, L, metal, edge] of keys) {
      const d = [Math.cos(a), Math.sin(a) * .72], p = [-d[1], d[0]], bx = x + d[0] * 10, by = y + d[1] * 10;   // laid flat: foreshortened
      const hx = bx + d[0] * 7, hy = by + d[1] * 7;   // the bow's centre
      c.fillStyle = lit ? metal : '#3A4258'; c.strokeStyle = lit ? edge : '#1E2436'; c.lineWidth = 1.4;
      c.beginPath(); c.ellipse(hx, hy, 7.5, 6, a, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = lit ? '#2C3550' : '#1A2030'; c.beginPath(); c.arc(hx - d[0] * 2.5, hy - d[1] * 2.5, 1.8, 0, TAU); c.fill();   // its hole
      const s0 = [hx + d[0] * 6, hy + d[1] * 6], s1 = [hx + d[0] * (6 + L), hy + d[1] * (6 + L)];
      c.strokeStyle = lit ? metal : '#3A4258'; c.lineWidth = 4.5; c.beginPath(); c.moveTo(...s0); c.lineTo(...s1); c.stroke();   // the shaft
      c.strokeStyle = lit ? edge : '#1E2436'; c.lineWidth = 2.2; c.beginPath();   // the bit, its teeth
      for (let k = 0; k < 3; k++) { const u = 6 + L - 3 - k * 6, px = hx + d[0] * u, py = hy + d[1] * u; c.moveTo(px, py); c.lineTo(px + p[0] * (4 + 2 * (k % 2)), py + p[1] * (4 + 2 * (k % 2))); }
      c.stroke();
    }
  };
  queue2d(c => {
    c.save(); shape(c, true); c.restore();
    // the far half is past the rim of the pool and the edge of the beam: in shadow (a tilted split, dark above and right)
    c.save(); c.beginPath(); c.moveTo(x - 60, y - 8); c.lineTo(x + 70, y + 30); c.lineTo(x + 70, y - 70); c.lineTo(x - 60, y - 70); c.closePath(); c.clip();
    c.globalAlpha = .85; shape(c, false); c.restore();
  });
  const g = seg(t, tG - .04, tG + .4);   // the glint, on the lit side
  if (g > 0 && g < 1) star4(x - 2, y + 15, 13 * Math.sin(Math.PI * g), '#FFF6D8', Math.sin(Math.PI * g));
}
// T47, V3e: an apple seal on an envelope's flap. (x, y): the apple's centre.
function camBApple(x, y, r) {
  line2d([[x, y - r * .62], [x + r * .55, y - r * .95], [x + r * 1.02, y - r * .3], [x + r * .78, y + r * .62], [x + r * .25, y + r * .95], [x, y + r * .82], [x - r * .25, y + r * .95], [x - r * .78, y + r * .62], [x - r * 1.02, y - r * .3], [x - r * .55, y - r * .95]], { col: DQ.ink, sw: 1.6, fill: '#D2352A', close: true });
  line2d([[x, y - r * .6], [x + r * .18, y - r * 1.25]], { col: '#5A3A1E', sw: 2 });   // the stalk
  line2d([[x + r * .15, y - r * 1.05], [x + r * .7, y - r * 1.4], [x + r * 1.05, y - r * 1.1], [x + r * .5, y - r * .9]], { col: '#3D6A2A', sw: 1.2, fill: '#6E9A3A', close: true });   // a leaf
  dot2d(x - r * .45, y - r * .2, r * .18, { fill: 'rgba(255,255,255,.6)' });   // the shine
}

// ---------- round 5: the ideas Neel picked from the left-out list (3 Oct), as he changed them ----------
// T70, V3b (Neel picked it, 3 Oct): a wind-up kitchen timer set to five minutes beside the "2 wks" hourglass: two
// time-boxes (Neel's "How To Become A Mechanistic Interpretability Researcher", 2025: "Set a 5-minute timer and
// brainstorm"). (x, y): standing on the shelf.
function camITimer(x, y) {
  const R = 25;
  for (const d of [-1, 1]) line2d([[x + d * 12, y - 6], [x + d * 16, y]], { col: DQ.ink, sw: 4 });   // its feet
  paint(ellPts(x, y - R - 4, R, R, 24), { wash: '#F6F1E6', fill: '#D8D0C0', fillOp: 30, ink: DQ.ink, sw: .4 });
  paint(rrPts(x - 6, y - 2 * R - 14, 12, 10, 3), { wash: '#C9472A', ink: DQ.ink, sw: .3 });   // the winding knob
  queue2d(c => {
    const cx = x, cy = y - R - 4; c.save(); c.strokeStyle = DQ.ink;
    for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + k / 12 * TAU; c.lineWidth = k % 3 ? 1 : 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * .72, cy + Math.sin(a) * R * .72); c.lineTo(cx + Math.cos(a) * R * .88, cy + Math.sin(a) * R * .88); c.stroke(); }
    const a = -Math.PI / 2 + 5 / 60 * TAU; c.strokeStyle = DQ.verm; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R * .66, cy + Math.sin(a) * R * .66); c.stroke();   // set to five minutes
    c.fillStyle = DQ.ink; c.beginPath(); c.arc(cx, cy, 2.5, 0, TAU); c.fill(); c.restore();
  });
}
// T33, V3c (Neel picked it, 3 Oct, with a change: "put the Eiffel Tower in Rome on a postcard not Japan"): a postcard
// pinned to the corkboard, the Eiffel Tower standing in Rome beside the Colosseum, an umbrella pine, ROMA in the sky. ROME
// (Meng et al. 2022, "Locating and Editing Factual Associations in GPT") shows its edit with the counterfactual "Eiffel
// Tower is located in the city of Rome" ("The Eiffel Tower is right across from St. Peter's Basilica in Rome, Italy");
// Neel's interpretability-illusion paper shifts the same tower's answer between Paris and Rome. (x, y): the card's
// top-left corner.
function camIPostcard(x, y) {
  const w = 250, h = 170;
  queue2d(c => {
    c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(.05); c.translate(-w / 2, -h / 2);
    c.fillStyle = 'rgba(40,25,10,.25)'; c.fillRect(6, 8, w, h);   // its shadow
    c.fillStyle = '#FBF6EC'; c.fillRect(0, 0, w, h); c.strokeStyle = '#B8A890'; c.lineWidth = 1.5; c.strokeRect(0, 0, w, h);
    const ix = 12, iy = 12, iw = w - 24, ih = h - 24, base = iy + ih - 10, g = c.createLinearGradient(0, iy, 0, iy + ih);
    g.addColorStop(0, '#8FB7D8'); g.addColorStop(1, '#F3D6AE'); c.fillStyle = g; c.fillRect(ix, iy, iw, ih);
    c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
    c.fillStyle = '#C9A879'; c.fillRect(ix, base, iw, 12);   // the ground
    // the Colosseum, on the right: the outer wall whole on the left, broken away in steps on the right; three tiers of
    // arches under the attic storey (every detail clipped to the wall, so nothing runs past the broken edge)
    const cx = ix + 150, L = cx - 62, Rr = cx + 64, top = base - 78;
    const wall = [[L, base], [L, top + 3], [cx + 4, top], [cx + 12, top + 12], [cx + 24, top + 22], [cx + 38, top + 32], [Rr, top + 38], [Rr, base]];
    const wallPath = () => { c.beginPath(); wall.forEach(([px, py], k) => k ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); };
    c.fillStyle = '#DCC7A2'; wallPath(); c.fill();
    c.save(); wallPath(); c.clip();
    c.fillStyle = 'rgba(150,118,80,.32)'; c.fillRect(L, top, Rr - L, 14);   // the attic storey, darker, with its little windows
    c.fillStyle = '#7A6040'; for (let ax = L + 8; ax < Rr; ax += 15) c.fillRect(ax, top + 5, 4, 5);
    c.fillStyle = '#6E5638';
    for (const ry of [base - 3, base - 23, base - 43]) for (let ax = L + 4; ax < Rr - 4; ax += 10.5) { c.beginPath(); c.moveTo(ax, ry); c.lineTo(ax, ry - 10); c.arc(ax + 3, ry - 10, 3, Math.PI, 0); c.lineTo(ax + 6, ry); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(110,86,56,.65)'; c.lineWidth = 1; for (const ry of [base - 19, base - 39, base - 59, top + 14]) { c.beginPath(); c.moveTo(L, ry); c.lineTo(Rr, ry); c.stroke(); }   // its cornices
    c.restore();
    c.strokeStyle = '#6E5638'; c.lineWidth = 1.2; c.beginPath(); wall.slice(0, -1).forEach(([px, py], k) => k ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
    // an umbrella pine, far right
    c.strokeStyle = '#5A4632'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ix + iw - 18, base); c.lineTo(ix + iw - 14, base - 40); c.stroke();
    c.fillStyle = '#3E5A34'; c.beginPath(); c.moveTo(ix + iw - 36, base - 42); c.bezierCurveTo(ix + iw - 32, base - 56, ix + iw + 4, base - 56, ix + iw + 8, base - 42); c.quadraticCurveTo(ix + iw - 14, base - 37, ix + iw - 36, base - 42); c.closePath(); c.fill();   // its flat-topped canopy
    // the Eiffel Tower, on the left: an iron lattice tapering up, two platforms, the arch
    const tx0 = ix + 50, top0 = iy + 10; c.fillStyle = '#3A3530'; c.beginPath();
    c.moveTo(tx0 - 32, base); c.quadraticCurveTo(tx0 - 9, base - 56, tx0 - 4, top0 + 18); c.lineTo(tx0, top0); c.lineTo(tx0 + 4, top0 + 18); c.quadraticCurveTo(tx0 + 9, base - 56, tx0 + 32, base);
    c.lineTo(tx0 + 19, base); c.quadraticCurveTo(tx0, base - 32, tx0 - 19, base); c.closePath(); c.fill();
    c.strokeStyle = '#3A3530'; c.lineWidth = 3; for (const [yy, hw] of [[base - 46, 15], [base - 86, 8]]) { c.beginPath(); c.moveTo(tx0 - hw, yy); c.lineTo(tx0 + hw, yy); c.stroke(); }
    c.strokeStyle = 'rgba(243,214,174,.55)'; c.lineWidth = 1; for (let k = 1; k < 8; k++) { const yy = base - k * 14, hw = 26 * Math.pow(1 - k / 9, 1.6); c.beginPath(); c.moveTo(tx0 - hw, yy); c.lineTo(tx0 + hw, yy - 7); c.moveTo(tx0 + hw, yy); c.lineTo(tx0 - hw, yy - 7); c.stroke(); }   // the lattice
    // ROMA, as old postcards letter their skies
    c.font = `700 21px "${FONT.fraunces}"`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineWidth = 3; c.strokeStyle = '#7A3A22'; c.fillStyle = '#FBE7C2';
    c.strokeText('ROMA', ix + 148, iy + 30); c.fillText('ROMA', ix + 148, iy + 30);
    c.restore(); c.restore();
  });
  dot2d(x + w / 2, y + 8, 9, { fill: DQ.verm, stroke: DQ.ink, sw: 1.5 });   // its pin
  tx('ROMA', x + 12 + 148, y + 12 + 30, { size: 21, alpha: 0, role: 'fine' });   // registered for the text check
}
// T75, V3d (Neel, 3 Oct: "Have several rabbit holes dotted around the path"): rabbit holes in the dark ground beside the
// stepping stones, smaller further off, a white rabbit peeking out of two of them (Neel's "My Research Process" posts: don't
// "get stuck in a rabbit hole based on false premises"). All on open ground clear of the stones, the proxy tasks, the keys
// and the streetlight's pool, so the light's ambiguity stays where it was.
// rev: how much of the path has been drawn (0..1); each hole opens as the path reaches it, and its rabbit pops up after.
function camIRabbitHoles(rev) {
  for (const [x, y, s, rabbit, u] of [[858, 866, .95, true, .18], [1130, 756, .72, false, .52], [1292, 652, .5, true, .64], [1420, 560, .38, false, .76]]) {
    const k = backOut(clamp((rev - u) / .07)); if (k > .02) camIRabbitHole(x, y, s * k, rabbit ? clamp((rev - u - .09) / .08) : 0);
  }
}
function camIRabbitHole(x, y, s, rabbit) {   // (x, y): the hole's centre; s its scale (1 near); rabbit 0..1: how far it has popped up
  paint(ellPts(x + 5 * s, y - 9 * s, 50 * s, 19 * s, 20), { wash: '#6E6476', fill: '#4E4656', fillOp: 60, ink: '#2A2632', sw: .3 });   // the mound of dug earth behind it, moonlit
  for (const [dx, dy, r] of [[-44, -2, 4.5], [48, -4, 3.5], [36, 6, 3], [-30, 8, 2.5]]) dot2d(x + dx * s, y + dy * s, r * s, { fill: '#7E7486' });   // clods
  paint(ellPts(x, y, 34 * s, 10 * s, 20), { wash: '#07080E', ink: '#1C1E2A', sw: .3 });   // the hole
  queue2d(c => {   // the rabbit peeking out (its chin behind the hole's near lip), then the lip
    c.save(); c.lineWidth = Math.max(1, 1.3 * s); c.strokeStyle = '#8E92A6';
    if (rabbit > 0) {
      c.save(); c.beginPath(); c.rect(x - 40 * s, y - 60 * s, 80 * s, 60 * s); c.clip(); c.translate(0, 34 * s * (1 - easeOut(rabbit)));   // it rises out of the hole
      for (const d of [-1, 1]) { c.save(); c.translate(x + d * 10 * s, y - 22 * s); c.rotate(d * .38); c.fillStyle = '#E4E6EE'; c.beginPath(); c.ellipse(0, 0, 5.5 * s, 15 * s, 0, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = '#D49AA0'; c.beginPath(); c.ellipse(0, -2 * s, 2.5 * s, 9 * s, 0, 0, TAU); c.fill(); c.restore(); }   // its ears
      c.fillStyle = '#E4E6EE'; c.beginPath(); c.ellipse(x, y - 4 * s, 17 * s, 12 * s, 0, Math.PI, TAU); c.fill(); c.stroke();   // its head
      c.fillStyle = '#1E2030'; for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * 6.5 * s, y - 9 * s, 2 * s, 0, TAU); c.fill(); }
      c.fillStyle = '#D49AA0'; c.beginPath(); c.arc(x, y - 4.5 * s, 2 * s, 0, TAU); c.fill();   // its nose
      c.restore();
    }
    c.strokeStyle = '#3A3644'; c.lineWidth = Math.max(1.5, 3 * s); c.beginPath(); c.ellipse(x, y, 34 * s, 10 * s, 0, .15, Math.PI - .15); c.stroke();   // the near lip
    c.restore();
  });
}
// The long scroll, V3e. Neel picked the long envelope (3 Oct: "have the probe use binoculars to spot the issue and red
// circle on it"), asked for it as a scroll "trying to get past", the probe targeting "a particular far off bit of it",
// and then (late) placed it: "initially there's just the envelopes and then the scroll comes along and kind of covers most
// of the screen and is like a bit shorter than the envelope, but it's clearly covering their legs and bottom half, and
// then the probe flags part of it and the scroll collapses". So: a letter so long it comes in rolled up at its front,
// sweeping in from off the left a beat after the envelopes, its paper standing up in the lane in front of them, as tall
// as their bottom halves, and trailing back off the frame; it pulls up at the door and edges at it, trying to get past.
// The bad phrase sits far back along it, near the left edge. Binoculars on "sits", the phrase ringed in red on "door",
// and on "rings" the bell goes and the paper falls flat. Long-context probes: Neel's team's production probes for Gemini
// had to keep working on very long inputs. T: { tIn, tB, tC, tR }.
const CAMI_SCROLL = { top: 786, foot: 866, x0: -40, x1: 1196, creep: 14, bad: [960, 1030] };   // bad: the phrase's distance behind the front
// where everything is at t (the binoculars need the phrase before the scroll is drawn, after the envelopes)
function camIScrollAt(t, T) {
  const L = CAMI_SCROLL, h0 = L.foot - L.top;
  const hx = t < T.tIn ? L.x0 - 80 : lerp(L.x0, L.x1, easeOut(seg(t, T.tIn, T.tIn + .8))) + L.creep * ease(seg(t, T.tIn + .8, T.tR));
  const fall = Math.pow(seg(t, T.tR + .04, T.tR + .42), 2), bounce = 6 * Math.sin(Math.PI * seg(t, T.tR + .42, T.tR + .56));   // falling, as things do
  const top = lerp(L.top, L.foot - 10, fall) - bounce, sq = (L.foot - top) / h0;   // sq: how much of its height is still standing
  const Y = y => L.foot - (L.foot - y) * sq;   // a point on the paper, as it falls
  const bad = [hx - L.bad[1], hx - L.bad[0]];
  return { hx, top, sq, fall, Y, bad, at: [(bad[0] + bad[1]) / 2, Y(L.top + 14) - 4], ring: t > T.tR ? 1 - seg(t, T.tR + .35, T.tR + .6) : 0 };
}
function camILongScroll(t, T, S) {
  const L = CAMI_SCROLL, { hx, top, sq, fall, Y, bad } = S, walking = t < T.tR;
  if (hx < -60) return;
  queue2d(c => {
    c.save(); c.lineCap = 'round';
    c.fillStyle = '#FFFDF6'; c.strokeStyle = '#6E5A3E'; c.lineWidth = 2.5; c.fillRect(-40, top, hx + 40, L.foot - top); c.strokeRect(-40, top, hx + 40, L.foot - top);   // its paper, trailing off the frame
    for (let l = 0; l < 4; l++) {   // its lines of writing, too small to read (the point: there is a lot of it), moving with it
      const ly = Y(L.top + 14 + l * 17); let d = 26;
      while (hx - d > -40) {
        const ww = 12 + 30 * hash(d * .41 + l * 5), x = hx - d, xe = x - ww, isBad = l === 0 && x <= bad[1] && xe >= bad[0] - 8;
        c.strokeStyle = isBad ? '#3A2420' : 'rgba(70,64,58,.62)'; c.lineWidth = (isBad ? 2.2 : 1.5) * Math.max(.55, sq);   // the bad phrase, a little darker
        c.beginPath(); for (let px = x; px >= xe; px -= 3) c.lineTo(px, ly + 1.4 * sq * Math.sin((px - hx) * .6 + l)); c.stroke();
        d += ww + 6 + 5 * hash(d + l);
      }
    }
    // the roll at its front: the rest of the letter, still rolled up, standing on end; it topples with the paper
    const rw = 32 + 14 * fall, rb = L.foot + 8 * (1 - fall), rt = Math.min(top - 10 * sq, rb - 22);
    c.fillStyle = '#EFE4CC'; c.strokeStyle = '#6E5A3E'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(hx - rw / 2, rt, rw, rb - rt, Math.min(12, (rb - rt) / 2)); c.fill(); c.stroke();
    c.lineWidth = 1.6; c.beginPath(); c.ellipse(hx, rt + 7, rw / 2 - 4, 4, 0, 0, TAU); c.stroke();   // its rolled end
    c.beginPath(); c.arc(hx + 1, rt + 7, 2.5, 0, TAU * .8); c.stroke();
    c.restore();
  });
  // its little legs, under the roll: walking until it is caught, then splayed flat
  const step = walking ? Math.sin((t - T.tIn) * 20) : 0, ly0 = L.foot + 8 * (1 - fall);
  for (const d of [-1, 1]) pen([[hx + d * 6, ly0], [hx + d * lerp(10 + 5 * step * d, 26, fall), lerp(ly0 + 18, ly0 + 6, fall)]], { sw: 3 });
  const cq = seg(t, T.tC, T.tC + .3);   // the far-off bad phrase, ringed in red once the probe has it in its binoculars
  if (cq > 0) pencilCircle((bad[0] + bad[1]) / 2, Y(L.top + 14), (bad[1] - bad[0]) / 2 + 18, Math.max(7, 17 * sq), cq);
}
// r4 pick 6, the alarm that never rings: high on the empty wall right of the door, a red fire-alarm bell with its pull
// station under it. Neel added it (3 Oct, night) asking that it be "more obviously broken and cobwebbed": so a chip is out of
// the bell's rim and a crack runs across its dome, its striker hangs loose on a bent wire, its conduit is cut with the wires
// frayed, the pull station's handle has snapped and hangs, there is dust on its rim, and cobwebs cover the lot, a spider
// in the biggest. Through "rings" and "alarm" the probe's little brass bell rings and the big red one is dead: "There's No
// Fire Alarm for Artificial General Intelligence" (Yudkowsky, 2017): "A fire alarm creates common knowledge, in the
// you-know-I-know sense, that there is a fire". Here the loud one is long dead and a quiet one does its job. No lettering.
// (x, y): the gong's centre.
function camQAlarm(x, y) {
  const R = 53, WEB = 'rgba(66,68,82,.62)';
  const web = (c, H, A, rings, sag = 4) => {   // a radial web: spokes from the hub H to the anchors A, and rings sagging between them
    const ang = p => Math.atan2(p[1] - H[1], p[0] - H[0]), S = [...A].sort((p, q) => ang(p) - ang(q));
    c.strokeStyle = WEB; c.lineWidth = 1.3; c.lineCap = c.lineJoin = 'round';
    for (const [ax, ay] of S) { c.beginPath(); c.moveTo(H[0], H[1]); c.lineTo(ax, ay); c.stroke(); }
    for (const f of rings) {
      const pts = S.map(([ax, ay]) => [H[0] + f * (ax - H[0]), H[1] + f * (ay - H[1])]);
      c.beginPath(); c.moveTo(...pts[0]);
      pts.forEach((p, k) => { const q = pts[(k + 1) % pts.length]; c.quadraticCurveTo((p[0] + q[0]) / 2 + (H[0] - (p[0] + q[0]) / 2) * .08, (p[1] + q[1]) / 2 + sag * f, q[0], q[1]); });
      c.stroke();
    }
  };
  queue2d(c => {   // the big web, in the corner between the door frame and the bell (under the bell), its spider at the hub
    c.save();
    const H = [1598, 386];
    web(c, H, [[1527, 300], [1527, 352], [1527, 412], [1527, 470], [1590, 292], [1648, 312], [x - 46, y - 27], [x - 53, y + 4], [x - 49, y + 22], [1600, 478]], [.2, .36, .52, .68, .84, .97]);
    c.fillStyle = '#2A2620'; c.strokeStyle = '#2A2620'; c.lineWidth = 1.4;
    for (let k = 0; k < 8; k++) { const side = k < 4 ? -1 : 1, j = k % 4, a0 = side * (.5 + j * .36); c.beginPath(); c.moveTo(H[0], H[1]); c.quadraticCurveTo(H[0] + side * 9, H[1] - 8 + j * 6, H[0] + side * (13 + 2 * Math.sin(a0)), H[1] - 4 + j * 6); c.stroke(); }   // its legs
    c.beginPath(); c.ellipse(H[0], H[1] + 2, 4.5, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(H[0], H[1] - 5, 3, 0, TAU); c.fill();   // its body
    c.restore();
  });
  // the conduit, cut: a stub under the bell and a stub over the pull station, the wires frayed between
  paint(rectPts(x - 7, y + 50, 14, 16), { wash: '#8C8E94', ink: DQ.ink, sw: .3 });
  paint(rectPts(x - 7, y + 86, 14, 12), { wash: '#8C8E94', ink: DQ.ink, sw: .3 });
  // the gong, a chip out of its rim at the lower left
  const P = [];
  for (let k = 0; k <= 40; k++) { const a = 2.55 + k / 40 * (TAU - .55); P.push([x + R * Math.cos(a), y + R * Math.sin(a)]); }
  for (const [f, a] of [[.8, 2.08], [.9, 2.24], [.72, 2.36], [.86, 2.5]]) P.push([x + R * f * Math.cos(a), y + R * f * Math.sin(a)]);
  paint(P, { wash: '#C9302A', fill: '#9A1E18', fillOp: 55, bleed: .01, tex: .5, ink: DQ.ink, sw: .5 });
  paint(ellPts(x, y, 34, 34, 24), { ink: '#7A1410', sw: .3 });
  dot2d(x + 2, y + 3, 8, { fill: '#5E6066', stroke: DQ.ink, sw: 1.5 });   // the boss
  queue2d(c => {
    c.save(); c.lineCap = c.lineJoin = 'round';
    c.strokeStyle = 'rgba(255,236,226,.45)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 42, -2.5, -1.9); c.stroke();   // what's left of its shine
    c.strokeStyle = '#2A1410'; c.lineWidth = 2.4; c.beginPath();   // the crack, from the chip across the dome
    [[-34, 27], [-22, 14], [-27, 4], [-11, -6], [-15, -19], [1, -31], [-2, -42]].forEach(([dx, dy], k) => k ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy)); c.stroke();
    c.strokeStyle = '#B87333'; c.lineWidth = 1.6;   // the cut wires, frayed
    for (const [x0, y0, x1, y1] of [[-3, 66, -9, 76], [0, 66, 2, 79], [3, 66, 9, 74], [-2, 86, -6, 79], [2, 86, 5, 78]]) { c.beginPath(); c.moveTo(x + x0, y + y0); c.quadraticCurveTo(x + (x0 + x1) / 2 + 3, y + (y0 + y1) / 2, x + x1, y + y1); c.stroke(); }
    c.strokeStyle = '#5E6066'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 16, y + 47); c.quadraticCurveTo(x + 30, y + 64, x + 30, y + 88); c.stroke();   // the striker's bent wire
    c.save(); c.translate(x + 31, y + 97); c.rotate(.55); c.fillStyle = '#5E6066'; c.strokeStyle = DQ.ink; c.lineWidth = 1.5; c.beginPath(); c.roundRect(-9, -9, 18, 18, 3); c.fill(); c.stroke(); c.restore();   // the striker, hanging loose
    c.fillStyle = 'rgba(150,146,138,.8)'; for (const [dx, dy, r] of [[-22, -50, 2.2], [-8, -53, 1.8], [8, -53, 2.4], [24, -47, 1.9], [36, -38, 1.6]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, TAU); c.fill(); }   // dust on its rim
    // cobweb draped over its top, from the wall above to the dome
    c.strokeStyle = WEB; c.lineWidth = 1.2;
    const top = [[x - 44, y - 88], [x - 4, y - 98], [x + 40, y - 86], [x + 70, y - 60]], on = [[x - 34, y - 38], [x - 6, y - 50], [x + 22, y - 46], [x + 44, y - 28]];
    top.forEach((p, k) => { c.beginPath(); c.moveTo(...p); c.lineTo(...on[k]); c.stroke(); });
    for (const f of [.3, .55, .8]) { c.beginPath(); top.forEach((p, k) => { const q = [p[0] + f * (on[k][0] - p[0]), p[1] + f * (on[k][1] - p[1]) + 3]; k ? c.lineTo(...q) : c.moveTo(...q); }); c.stroke(); }
    c.restore();
  });
  paint(rectPts(x - 31, y + 98, 62, 86), { wash: '#C9302A', fill: '#9A1E18', fillOp: 40, bleed: .01, ink: DQ.ink, sw: .45 });   // the pull station
  queue2d(c => {
    c.save(); c.translate(x - 19, y + 128); c.rotate(1.15);   // its white T-handle, snapped at one end and hanging from the other
    c.fillStyle = '#F4EFE6'; c.strokeStyle = DQ.ink; c.lineWidth = 1.5; c.beginPath(); c.roundRect(0, -5, 38, 10, 2); c.fill(); c.stroke(); c.beginPath(); c.roundRect(14, 3, 10, 24, 2); c.fill(); c.stroke();
    c.restore();
    c.save(); c.strokeStyle = WEB; c.lineWidth = 1.2; c.lineCap = 'round';   // a small web from the bell down to the pull station
    const H = [x + 58, y + 78];
    for (const p of [[x + 38, y + 37], [x + 31, y + 104], [x + 31, y + 140], [x + 96, y + 52], [x + 100, y + 112]]) { c.beginPath(); c.moveTo(...H); c.lineTo(...p); c.stroke(); }
    for (const f of [.35, .65, .92]) { c.beginPath(); [[x + 38, y + 37], [x + 96, y + 52], [x + 100, y + 112], [x + 31, y + 140], [x + 31, y + 104]].forEach((p, k) => { const q = [H[0] + f * (p[0] - H[0]), H[1] + f * (p[1] - H[1]) + 2]; k ? c.lineTo(...q) : c.moveTo(...q); }); c.closePath(); c.stroke(); }
    c.restore();
  });
}
// The probe's binoculars, raised to its eyes on T.tB and aimed down the letter at the bad phrase, lowered after the ring.
// (It has no arms anywhere in the video, so they are simply held up, cartoon-fashion, a strap hanging below.) Eyepieces on
// its two eyes; the barrels run toward the letter, so you can see where it is looking.
function camIBinoculars(t, T, tg) {
  const k = ease(seg(t, T.tB, T.tB + .18)) * (1 - ease(seg(t, T.tR + .2, T.tR + .4)));
  if (k <= .02) return;
  const dy = 60 * (1 - k), eyes = [[1046, 480 + dy], [1074, 480 + dy]];   // tg: the bad phrase, wherever it has got to
  const a = Math.atan2(tg[1] - eyes[0][1], tg[0] - eyes[0][0]), d = [Math.cos(a), Math.sin(a)], len = 30;
  queue2d(c => {
    c.save(); c.globalAlpha *= k; c.lineCap = 'round';
    c.strokeStyle = '#3A3530'; c.lineWidth = 2; c.beginPath(); c.moveTo(eyes[0][0] - 4, eyes[0][1] + 12); c.quadraticCurveTo(1060, 548 + dy, eyes[1][0] + 4, eyes[1][1] + 12); c.stroke();   // the strap
    for (const [ex, ey] of [eyes[1], eyes[0]]) {   // the far barrel first
      const ox = ex + d[0] * len, oy = ey + d[1] * len;
      c.strokeStyle = DQ.ink; c.lineWidth = 25; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ox, oy); c.stroke();
      c.strokeStyle = '#2E3238'; c.lineWidth = 21; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ox, oy); c.stroke();
      c.fillStyle = '#454B53'; c.strokeStyle = DQ.ink; c.lineWidth = 2; c.beginPath(); c.arc(ox, oy, 13.5, 0, TAU); c.fill(); c.stroke();   // the objective's wider end
      c.fillStyle = '#9DB4C8'; c.beginPath(); c.arc(ox, oy, 8.5, 0, TAU); c.fill();   // its lens
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(ox - 3, oy - 3, 2.6, 0, TAU); c.fill();
      c.fillStyle = '#1E2024'; c.beginPath(); c.arc(ex, ey, 10, 0, TAU); c.fill();   // the eyepiece, on its eye
    }
    c.fillStyle = '#5A6068'; c.strokeStyle = DQ.ink; c.lineWidth = 1.5; c.beginPath(); c.roundRect(1053, 474 + dy + d[1] * 8, 14, 12, 3); c.fill(); c.stroke();   // the bridge
    c.restore();
  });
}

// the soft shadow a proxy task casts on the path (V3d), so it stands on the stones rather than floating over them
function v3dShadow(x, y, sc) {
  queue2d(c => { c.save(); c.translate(x, y + 2); c.scale(1, .26); const g = c.createRadialGradient(0, 0, 0, 0, 0, 56 * sc); g.addColorStop(0, 'rgba(18,24,44,.55)'); g.addColorStop(1, 'rgba(18,24,44,0)'); c.fillStyle = g; c.fillRect(-60 * sc, -60 * sc, 120 * sc, 120 * sc); c.restore(); });
}
// A proxy task on the path to the North Star (V3d): (x, y) where it stands on the path, sc its scale (1 near). ring: the
// probe's bell.
function proxyIcon(kind, x, y, sc, t, ring) {
  const ink = DQ.ink, s = 64 * sc;
  if (kind === 'steer') {   // changing its behaviour: a ship's wheel, standing on its rim on the path
    const R = s * .62, cx = x, cy = y - R * 1.36 - 2;
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .2; line2d([[cx, cy], [cx + Math.cos(a) * R * 1.32, cy + Math.sin(a) * R * 1.32]], { col: '#8A5A2E', sw: 6 * sc }); dot2d(cx + Math.cos(a) * R * 1.36, cy + Math.sin(a) * R * 1.36, 5 * sc, { fill: '#8A5A2E' }); }
    line2d(ell2d(cx, cy, R, R, 0, 28, 0), { col: DQ.brass, sw: 9 * sc, close: true }); line2d(ell2d(cx, cy, R, R, 0, 28, 0), { col: ink, sw: 1.6, close: true });
    dot2d(cx, cy, R * .22, { fill: DQ.brassDk, stroke: ink, sw: 1.5 });
  } else if (kind === 'adv') {   // finding adversarial examples: the panda, plus a little noise, on a little A-frame stand
    const bx = x - s * 1.05, by = y - s * 1.5, bw = s * 2.1, bh = s * 1.05;
    for (const d of [-1, 1]) pen([[x + d * s * .55, by + bh - 4], [x + d * s * .8, y]], { sw: 4 * sc, col: '#6B4E33' });   // its legs, on the path
    box2d(bx, by, bw, bh, { fill: '#FFFDF7', stroke: ink, sw: 2, r: 6 });
    const px = bx + bh * .5, py = by + bh * .52, r = bh * .32;
    dot2d(px - r * .78, py - r * .78, r * .36, { fill: '#1E1E24' }); dot2d(px + r * .78, py - r * .78, r * .36, { fill: '#1E1E24' });   // ears
    dot2d(px, py, r, { fill: '#FFFFFF', stroke: ink, sw: 1.5 });
    for (const d of [-1, 1]) { line2d(ell2d(px + d * r * .38, py - r * .08, r * .2, r * .27, d * .5, 12, 0), { col: '#1E1E24', fill: '#1E1E24', close: true }); }
    dot2d(px, py + r * .32, r * .1, { fill: '#1E1E24' });
    mono('+', bx + bh * 1.08, by + bh * .66, { size: Math.max(12, bh * .42), align: 'center', role: 'deco' });
    queue2d(c => { const nx = bx + bh * 1.32, ny = by + bh * .2, n = 8, cs = bh * .6 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = Math.floor(90 + 140 * hash(i * 13 + j * 7 + 3)); c.fillStyle = `rgb(${v},${Math.floor(90 + 140 * hash(i * 5 + j * 11))},${Math.floor(90 + 140 * hash(i * 17 + j * 3))})`; c.fillRect(nx + i * cs, ny + j * cs, cs + .5, cs + .5); } });
  } else if (kind === 'predict') {   // predicting new behaviour: a crystal ball on its stand, and in its mist, the creature
    const R = s * .66, cx = x, cy = y - s * .34 - R * .92;
    paint([[cx - R * .8, y], [cx + R * .8, y], [cx + R * .5, y - s * .34], [cx - R * .5, y - s * .34]], { wash: DQ.brass, fill: DQ.brassDk, fillOp: 50, ink, sw: .3 });
    queue2d(c => { c.save(); const g = c.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R); g.addColorStop(0, '#F2F0FA'); g.addColorStop(.7, '#B8B4D8'); g.addColorStop(1, '#7F7FB0'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(cx, cy, R * .98, 0, TAU); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = Math.max(1.5, R * .05); c.beginPath(); c.arc(cx - R * .1, cy + R * .05, R * .55, .3, 2.6); c.stroke();   // the mist's swirl
      const bx = cx, by = cy + R * .42, bw = R * .5, bh = R * .62;   // the creature in its depths: a navy dome, eyes, the smiley
      c.fillStyle = '#2E3A66'; c.beginPath(); c.moveTo(bx - bw, by); c.bezierCurveTo(bx - bw, by - bh * 1.25, bx + bw, by - bh * 1.25, bx + bw, by); c.closePath(); c.fill();
      for (const [ex, ey, er] of [[-.4, -.55, .16], [.18, -.62, .2], [.48, -.3, .12]]) { c.fillStyle = '#FFFDF7'; c.beginPath(); c.arc(bx + ex * bw, by + ey * bh, er * bw, 0, TAU); c.fill(); c.fillStyle = '#C9472A'; c.beginPath(); c.arc(bx + ex * bw, by + ey * bh, er * bw * .5, 0, TAU); c.fill(); }
      c.fillStyle = '#F2C744'; c.beginPath(); c.arc(bx - bw * .1, by - bh * .18, bw * .16, 0, TAU); c.fill();
      c.restore();
      c.strokeStyle = DQ.ink; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(2, R * .08); c.beginPath(); c.arc(cx, cy, R * .74, -2.6, -1.9); c.stroke(); c.restore(); });
  } else if (kind === 'organism') {   // explaining a model organism: a specimen in a dish, its tag on a string, and a question
    petriDishBack(x, y - s * .14, s * .95);
    paint(natCR([[x - s * .44, y - s * .2], [x - s * .4, y - s * .62], [x, y - s * .82], [x + s * .4, y - s * .62], [x + s * .44, y - s * .2]], 4), { wash: '#2E3A66', ink, sw: .3 });   // the creature, sitting in the dish
    for (const [d, h, r] of [[-.17, .52, .08], [.12, .58, .1], [.3, .38, .06]]) { dot2d(x + d * s, y - h * s, r * s, { fill: '#FFFDF7', stroke: ink, sw: 1 }); dot2d(x + d * s, y - h * s, r * s * .45, { fill: '#C9472A' }); }
    dot2d(x - s * .04, y - s * .34, s * .07, { fill: '#F2C744' });   // its smiley
    petriDishFront(x, y - s * .14, s * .95);
    const tg = [x + s * 1.05, y - s * .62];   // a specimen tag tied to the dish's rim
    pen([[x + s * .8, y - s * .22], [tg[0] - s * .12, tg[1] + s * .04]], { sw: 1.4, col: DQ.sepia });
    box2d(tg[0] - s * .12, tg[1] - s * .14, s * .5, s * .3, { fill: '#EAD9B0', stroke: DQ.sepia, sw: 1.2, r: 2, rot: .08 });
    note('?', x - s * .95, y - s * .85, { size: Math.max(18, s * .72), col: '#F4EED8', role: 'deco' });
  } else if (kind === 'harm') {   // identifying harmful outputs: the little probe on watch, bell in hand (it rings on "harm")
    probeChar(x, y, 150 * sc, t, { medal: true });
    bell(x + 60 * sc, y - 4 * sc, 30 * sc, ring ? 1 : 0);   // set down on the path beside it (not hanging in the air)
  }
}
