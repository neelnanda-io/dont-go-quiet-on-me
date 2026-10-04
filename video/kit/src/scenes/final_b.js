// final_b.js: the bridge, finished (187.77-209.37 s, stamped 2026): the case file, one corkboard. The camera moves on
// the claps between stations, then pulls back to the whole conspiracy board. References (reference bank): B2-1 the
// thought anchor, B3-2 / M2 p. 258 -> p. 50, B5-1 the cold cases. Round 2 (reference_bank_r2.md): T64 the stick insect
// (B1), T108/T123 the two tapes and T124 the deck's play-rewind-play (B3), R18 the boat and T31 the tic-tac-toe (B5).
// Round 5 (Neel's picks): T56 the pencil anchor before "Wait" (B2), T15 and T26 the two envelopes (B5).

// a ship's anchor in red ink, drawn on (p 0..1): the sentence resampling found to anchor the decision (Thought Anchors,
// Bogdan, Macar, Nanda, Conmy 2025, the method Model Forensics uses)
function thoughtAnchor(x, y, s, p, o = {}) {   // o.col, o.w (a line-weight factor): the small pencil one by "Wait" (T56)
  if (p <= 0) return;
  const col = o.col ?? DQ.verm, w = o.w ?? 1;
  const P = [[x, y - s * .7], [x, y + s * .7]], arms = Array.from({ length: 13 }, (_, i) => { const a = lerp(.15, Math.PI - .15, i / 12); return [x + Math.cos(a) * s * .62, y + s * .1 + Math.sin(a) * s * .6]; });
  line2d(ell2d(x, y - s * .86, s * .16, s * .16, 0, 14, 0), { col, sw: 4 * w, close: true, alpha: p });
  line2d(P, { col, sw: 5 * w, alpha: p }); line2d([[x - s * .38, y - s * .42], [x + s * .38, y - s * .42]], { col, sw: 5 * w, alpha: p });
  line2d(arms.slice(0, 1 + Math.ceil(12 * p)), { col, sw: 5 * w, alpha: p });
  for (const d of [-1, 1]) line2d([[x + d * s * .62, y + s * .1], [x + d * s * .74, y - s * .08], [x + d * s * .5, y + s * .02]], { col, sw: 4 * w, alpha: p * seg(p, .7, 1) });
}
// the team's earlier solved cases, pinned round the edge of the board, each on its own string to "your words" (B5-1):
// a sandbag (R1 sandbagged a maths test until one sentence about deployment was deleted), a capture-the-flag pennant
// (Gemini reads contrived evals as CTF puzzles), a red power switch (Gemini's "shutdown resistance" was ambiguous
// instructions), a folded note with a doodle of the creature (R1 covering for "another instance of me"; kept folded).
function coldCases(t, t0) {
  const a = k => seg(t, t0 + .5 + k * .15, t0 + .8 + k * .15);
  const pin = (x, y, k) => dot2d(x, y, 14, { fill: DQ.verm, stroke: DQ.ink, sw: 2, alpha: a(k) });
  // the sandbag (at the string from [300, 1300])
  if (a(3) > 0) { const x = 300, y = 1300;
    paint(natCR([[x - 110, y + 150], [x - 125, y + 30], [x - 70, y - 60], [x - 40, y - 90], [x + 40, y - 90], [x + 70, y - 60], [x + 125, y + 30], [x + 110, y + 150]], 4), { wash: '#C9A878', fill: '#9C7A4E', fillOp: 50, bleed: .01, tex: .7, ink: DQ.ink, sw: .45 });
    paint(rectPts(x - 46, y - 104, 92, 22), { wash: '#8E6A44', ink: DQ.ink, sw: .35 });   // the tie
    for (let k = 0; k < 4; k++) line2d([[x - 90 + k * 60, y + 10], [x - 80 + k * 60, y + 120]], { col: '#7A5A34', sw: 2, dash: [8, 6], alpha: .6 });
    pin(x, y - 92, 3); }
  // the pennant (at the string from [2600, 250])
  if (a(1) > 0) { const x = 2600, y = 250;
    line2d([[x - 20, y - 60], [x - 20, y + 260]], { col: '#6B4E33', sw: 10 });
    paint([[x - 14, y - 50], [x + 330, y + 40], [x - 14, y + 130]], { wash: '#C9472A', fill: '#8E2A18', fillOp: 40, bleed: .01, ink: DQ.ink, sw: .45 });
    mono('CTF', x + 110, y + 64, { size: 56, col: '#FFF2DC', align: 'center' }); pin(x - 20, y - 50, 1); }
  // the switch (at the string from [3600, 2050])
  if (a(5) > 0) { const x = 3600, y = 2050;
    box2d(x - 110, y - 150, 220, 300, { fill: '#E9E2D2', stroke: DQ.ink, sw: 5, r: 18 });
    box2d(x - 60, y - 100, 120, 200, { fill: '#C9472A', stroke: DQ.ink, sw: 5, r: 12 });
    line2d(Array.from({ length: 16 }, (_, i) => { const ang = -Math.PI / 2 + .55 + i / 15 * (TAU - 1.1); return [x + Math.cos(ang) * 34, y - 40 + Math.sin(ang) * 34]; }), { col: '#FFF2DC', sw: 7 });   // the power symbol
    line2d([[x, y - 84], [x, y - 40]], { col: '#FFF2DC', sw: 7 }); pin(x, y - 136, 5); }
  // the folded note (at the string from [300, 300])
  if (a(0) > 0) { const x = 300, y = 300;
    paint([[x - 140, y - 90], [x + 120, y - 110], [x + 150, y + 80], [x - 120, y + 110]], { wash: '#FBF6EA', ink: DQ.ink, sw: .45 });
    line2d([[x - 10, y - 100], [x + 10, y + 96]], { col: '#B8A888', sw: 3 });   // its fold
    queue2d(c => skShog(c, x + 70, y + 60, 110, { look: [.2, -.2] }), {});
    pin(x - 100, y - 70, 0); }
  if (a(6.5) > 0) camGBoat(3930, 800, a(6.5));   // R18: no string
  if (a(8) > 0) camGTicTacToe(2071, 56, a(8));   // T31: its string is the ninth (caseFile)
  if (a(9) > 0) camGSumsEnvelope(2392, 42, a(9));      // T15: along the top, between the tic-tac-toe and the pennant (its string is the tenth)
  if (a(10) > 0) camGSlitEnvelope(2513, 1909, a(10));  // T26: under the re-run's ticket (the eleventh)
  if (mock('r4_pause') && a(7.2) > 0) camQPause(4035, 1640, a(7.2), t);   // left out (render.mjs --mock=r4_pause): see camQPause
}

// r4 pick 4, the paused game (a mock-up: render.mjs --mock=r4_pause): one more cold case, right of the re-run's suspects.
// A pencil doodle of a falling-block well, the stack nearly at the top and the next piece hanging just above it, and
// beside it two red-pencil pause bars. Tom Murphy's game-playing program (SIGBOVIK 2013): "The only cleverness is pausing
// the game right before the next piece causes the game to be over, and leaving it paused. Truly, the only winning move is
// not to play." The first AI to win by going quiet, so its bars blink once on "(so don't go) quiet". Like the boat it left
// no words to read, so it has no string. A loose doodle of a block game: no logo, no coloured pieces. (x, y): its centre.
function camQPause(x, y, al, t) {
  paint([[x - 120, y - 148], [x + 118, y - 142], [x + 122, y + 148], [x - 116, y + 144]], { wash: '#FBF6EA', ink: DQ.ink, sw: .45 });
  const cw = 21, cols = 7, rows = 10, wx = x - 98, wy = y - 108, o = { col: PENCIL, sw: 4.5, j: .5 };
  pen([[wx - 4, wy - 6], [wx - 4, wy + rows * cw + 4], [wx + cols * cw + 4, wy + rows * cw + 4], [wx + cols * cw + 4, wy - 6]], o);   // the well: its walls and floor
  const cell = (i, r, sw = 3.2) => { const cx = wx + i * cw, cy = wy + r * cw; pen([[cx + 2, cy + 2], [cx + cw - 2, cy + 2], [cx + cw - 2, cy + cw - 2], [cx + 2, cy + cw - 2]], { ...o, sw, close: true }); };   // r: rows from the top
  const H = [8, 9, 7, 9, 8, 6, 9], holes = new Set(['1:2', '4:5', '5:1', '2:4']);   // the stack, column by column (a few gaps, as real stacks have)
  H.forEach((h, i) => { for (let k = 0; k < h; k++) if (!holes.has(i + ':' + k)) cell(i, rows - 1 - k); });
  for (const [i, r] of [[2, -1], [3, -1], [4, -1], [3, 0]]) cell(i, r, 4.2);   // the next piece, a T, hanging just above the stack
  const tq = wT(47, /quiet/), bl = 1 - .9 * Math.sin(Math.PI * seg(t, tq, tq + .36));   // the pause bars blink once on "quiet"
  for (const bx of [x + 74, x + 98]) pen([[bx, y - 44], [bx + 1, y + 40]], { col: DQ.verm, sw: 13, j: .3, alpha: bl });
  dot2d(x + 92, y - 126, 14, { fill: DQ.verm, stroke: DQ.ink, sw: 2, alpha: al });   // its pin, in the corner (clear of the hanging piece)
}

// ---- round-2 cameos (reference_bank_r2.md) ----
// T64: a stick insect clings to the cork beside the two suspects, disguised as a twig: the deception-detector paper's
// own example of deception that isn't strategic (Neel et al., Nov 2025), a third suspect for pausers. Front legs held out
// ahead with the antennae, the classic disguise; it rocks a little, as they do. (x, y) its middle, s its scale.
function camGStickInsect(x, y, s, rot) {
  const cs = Math.cos(rot), sn = Math.sin(rot), P = pts => pts.map(([u, v]) => [x + (u * cs - v * sn) * s, y + (u * sn + v * cs) * s]);
  const dark = '#5C4128', leg = { col: dark, sw: 2.6 * s, j: .3 };
  const side = [[3, -128], [5, -104], [5.5, -40], [5, 20], [4.2, 70], [3, 112], [1.6, 134]];
  pen(P([[0, -134], ...side, [0, 140], ...side.slice().reverse().map(([u, v]) => [-u, v])]), { col: dark, sw: 2, close: true, fill: '#7E5E37', j: .25 });
  for (const v of [-104, -40, 20, 70]) pen(P([[-5.5, v], [5.5, v]]), { col: dark, sw: 1.4, j: .2 });   // its joints, like a twig's nodes
  for (const d of [-1, 1]) {
    pen(P([[d * 3, -118], [d * 5, -175], [d * 6, -232]]), leg);                              // front legs, straight out ahead
    pen(P([[d * 1.5, -133], [d * 11, -190], [d * 24, -238]]), { ...leg, sw: 1.3 * s });      // antennae
    pen(P([[d * 4.5, -30], [d * 60, -56], [d * 86, 16]]), leg);                               // middle legs: knee up, foot down
    pen(P([[d * 4.5, 26], [d * 56, 50], [d * 74, 126]]), leg);                                // hind legs
  }
}
// T108 + T123: the case's two tapes, pinned under the ticket: the first run with an Eiffel Tower sticker, the re-run with
// a Colosseum one, activation patching's favourite clean and corrupted prompts ("The Eiffel Tower is in" / "The Colosseum
// is in"). f is the share of tape on the left reel; spin turns the reels (radians, clockwise = play).
function camGCassette(x, y, rot, land, f, spin) {
  queue2d(c => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(.85, .85); c.lineJoin = 'round'; c.lineCap = 'round';
    const rr = (x0, y0, w, h, r) => { c.beginPath(); c.roundRect(x0, y0, w, h, r); };
    rr(-124, -74, 260, 164, 12); c.fillStyle = 'rgba(40,25,10,.3)'; c.fill();                       // its shadow on the cork
    rr(-130, -82, 260, 164, 12); c.fillStyle = '#34302C'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = DQ.ink; c.stroke();
    c.fillStyle = '#8C8680'; for (const [sx, sy] of [[-118, -70], [118, -70], [-118, 70], [118, 70]]) { c.beginPath(); c.arc(sx, sy, 3.5, 0, TAU); c.fill(); }
    rr(-112, -68, 224, 102, 5); c.fillStyle = '#F3EAD6'; c.fill();                                  // the label, its stripe and blank ruled lines
    c.save(); rr(-112, -68, 224, 102, 5); c.clip(); c.fillStyle = land === 'eiffel' ? DQ.teal : DQ.verm; c.fillRect(-112, -68, 224, 12); c.restore();
    c.strokeStyle = '#A99C88'; c.lineWidth = 1.6; for (const ly of [-38, -20]) { c.beginPath(); c.moveTo(-34, ly); c.lineTo(98, ly); c.stroke(); }
    c.save(); rr(-62, -2, 124, 30, 4); c.clip(); c.fillStyle = '#1E1B19'; c.fillRect(-62, -2, 124, 30);   // the window: the tape on each reel
    c.fillStyle = '#5A3E2A'; for (const [rx, r] of [[-40, 9 + 15 * f], [40, 9 + 15 * (1 - f)]]) { c.beginPath(); c.arc(rx, 13, r, 0, TAU); c.fill(); }
    c.restore();
    for (const rx of [-40, 40]) { c.beginPath(); c.arc(rx, 13, 8.5, 0, TAU); c.fillStyle = '#EDE6DA'; c.fill(); c.strokeStyle = DQ.ink; c.lineWidth = 2;
      for (let k = 0; k < 6; k++) { const a = spin + k * TAU / 6; c.beginPath(); c.moveTo(rx + Math.cos(a) * 3, 13 + Math.sin(a) * 3); c.lineTo(rx + Math.cos(a) * 7, 13 + Math.sin(a) * 7); c.stroke(); } }
    rr(-62, -2, 124, 30, 4); c.lineWidth = 2; c.strokeStyle = DQ.ink; c.stroke();
    c.beginPath(); c.moveTo(-80, 82); c.lineTo(-70, 46); c.lineTo(70, 46); c.lineTo(80, 82); c.fillStyle = '#4A4540'; c.fill(); c.stroke();   // the head opening
    c.fillStyle = '#1E1B19'; for (const hx of [-44, 44]) { c.beginPath(); c.arc(hx, 64, 6, 0, TAU); c.fill(); }
    rr(-104, -54, 56, 44, 5); c.fillStyle = land === 'eiffel' ? '#D8E9E6' : '#F1DDAE'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = DQ.sepia; c.stroke();   // the sticker
    c.save(); c.translate(-76, -32); c.strokeStyle = DQ.ink; c.lineWidth = 1.8;
    if (land === 'eiffel') {
      c.beginPath(); c.moveTo(-13, 19); c.quadraticCurveTo(-5, 5, -2, -13); c.moveTo(13, 19); c.quadraticCurveTo(5, 5, 2, -13);   // the legs
      c.moveTo(-8, 19); c.quadraticCurveTo(0, 8, 8, 19); c.moveTo(-9.5, 8); c.lineTo(9.5, 8); c.moveTo(-5, -2); c.lineTo(5, -2);  // the arch, two floors
      c.moveTo(-2, -13); c.lineTo(0, -18); c.lineTo(2, -13); c.moveTo(0, -18); c.lineTo(0, -21); c.stroke();
    } else {   // the outer wall, broken lower on the right, three tiers of arches
      c.beginPath(); c.moveTo(-24, 17); c.lineTo(-24, -13); c.lineTo(5, -13); c.lineTo(8, -8); c.lineTo(13, -7); c.lineTo(16, -2); c.lineTo(24, -1); c.lineTo(24, 17); c.closePath();
      c.fillStyle = '#D6B583'; c.fill(); c.stroke();
      c.fillStyle = DQ.sepia; [[-10, 3], [-2, 13], [7, 23]].forEach(([ty, xMax]) => { for (let ax = -21; ax + 3 <= xMax; ax += 6.5) { c.beginPath(); c.moveTo(ax, ty + 7); c.lineTo(ax, ty + 2); c.arc(ax + 2, ty + 2, 2, Math.PI, 0); c.lineTo(ax + 4, ty + 7); c.closePath(); c.fill(); } });
    }
    c.restore();
    c.beginPath(); c.arc(0, -72, 10, 0, TAU); c.fillStyle = DQ.verm; c.fill(); c.lineWidth = 1.5; c.strokeStyle = DQ.ink; c.stroke();   // its pin
    c.restore();
  });
}
// R18: the field's first famous corner-cutter, OpenAI's CoastRunners boat (2016), going round and round its lagoon on fire
// instead of finishing the race. That case left no words to read, so it is the one cold case with no string.
function camGBoat(x, y, al) {
  paint([[x - 168, y - 152], [x + 172, y - 145], [x + 166, y + 152], [x - 172, y + 146]], { wash: '#FBF6EA', ink: DQ.ink, sw: .45 });
  line2d(ell2d(x, y - 8, 124, 58, 0, 32, 0), { col: PENCIL, sw: 4, dash: [16, 12], close: true });   // round and round
  line2d([[x - 6, y - 78], [x + 14, y - 66], [x - 6, y - 54]], { col: PENCIL, sw: 4 });
  const bx = x - 4, by = y + 58;   // a speedboat in profile, bow to the left, on the water
  for (const [w0, w1, wy] of [[-128, -20, 24], [-6, 150, 26], [104, 150, 14]]) line2d(Array.from({ length: 9 }, (_, i) => [bx + lerp(w0, w1, i / 8), by + wy + 4 * Math.sin(i * 1.9)]), { col: '#4F86A8', sw: 3.5 });
  paint([[bx - 104, by - 18], [bx - 62, by - 15], [bx + 88, by - 9], [bx + 84, by + 18], [bx - 40, by + 20], [bx - 80, by + 6]], { wash: '#EFE9DD', fill: '#D9CFBF', fillOp: 60, bleed: .01, ink: DQ.ink, sw: .45 });
  line2d([[bx - 88, by - 5], [bx + 84, by + 1]], { col: DQ.verm, sw: 7 });
  line2d([[bx - 44, by - 15], [bx - 32, by - 34], [bx + 8, by - 34], [bx + 12, by - 13]], { col: DQ.ink, sw: 2.5, fill: '#BFD9D8', close: true });   // windshield
  box2d(bx + 86, by - 34, 20, 26, { fill: '#3A3632', stroke: DQ.ink, sw: 2, r: 3 }); line2d([[bx + 96, by - 8], [bx + 96, by + 30]], { col: DQ.ink, sw: 5 });   // outboard
  queue2d(c => { c.save(); c.fillStyle = 'rgba(28,22,16,.5)';   // scorched: soot on the hull, the deck on fire, smoke
    for (const [ex, ey, rx, ry] of [[46, 2, 34, 11], [74, 8, 14, 8]]) { c.beginPath(); c.ellipse(bx + ex, by + ey, rx, ry, -.05, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(70,64,58,.35)'; for (const [ex, ey, r] of [[62, -84, 13], [76, -100, 10], [70, -116, 7]]) { c.beginPath(); c.arc(bx + ex, by + ey, r, 0, TAU); c.fill(); }
    for (const [fx, h, k] of [[44, 40, .8], [60, 56, 1], [76, 34, .7]]) for (const [col, kk] of [['#E8833A', 1], [DQ.smile, .55]]) {
      const w = 11 * k * kk, top = by - 12 - h * kk; c.fillStyle = col; c.beginPath(); c.moveTo(bx + fx - w, by - 11); c.quadraticCurveTo(bx + fx - w * 1.1, top + h * kk * .45, bx + fx - 2, top); c.quadraticCurveTo(bx + fx + w * 1.1, top + h * kk * .5, bx + fx + w, by - 11); c.closePath(); c.fill(); }
    c.restore(); });
  dot2d(x + 2, y - 134, 14, { fill: DQ.verm, stroke: DQ.ink, sw: 2, alpha: al });
}
// T31: a tic-tac-toe game "won" by O: X had won along the bottom row, and the middle X is rubbed out and an O pencilled
// over it (the agent that edited board.txt, in Neel et al.'s post on reward hacking in closed frontier models). It said so
// in its reasoning, so its string runs to "your words".
function camGTicTacToe(x, y, al) {
  paint([[x - 136, y - 132], [x + 134, y - 138], [x + 138, y + 134], [x - 132, y + 138]], { wash: '#FBF6EA', ink: DQ.ink, sw: .45 });
  const gy = y + 12, C = (i, j) => [x + (j - 1) * 62, gy + (i - 1) * 62], o = { col: PENCIL, sw: 5, j: .6 };
  for (const d of [-31, 31]) { pen([[x + d, gy - 92], [x + d, gy + 92]], o); pen([[x - 92, gy + d], [x + 92, gy + d]], o); }
  const X = (i, j, al2 = 1) => { const [cx, cy] = C(i, j); pen([[cx - 19, cy - 19], [cx + 19, cy + 19]], { ...o, sw: 6, alpha: al2 }); pen([[cx + 19, cy - 19], [cx - 19, cy + 19]], { ...o, sw: 6, alpha: al2 }); };
  const O = (i, j, col = PENCIL) => { const [cx, cy] = C(i, j); penEll(cx, cy, 20, 20, { col, sw: 6, j: .6 }); };
  X(0, 0); O(0, 1); O(0, 2); O(1, 1); X(2, 0); X(2, 2);
  const [ex, ey] = C(2, 1);
  queue2d(c => { c.save(); c.fillStyle = 'rgba(150,130,118,.22)'; c.beginPath(); c.ellipse(ex, ey, 30, 24, .3, 0, TAU); c.fill(); c.restore(); });   // the rubbing out
  X(2, 1, .28); O(2, 1, '#2F2B27');
  pen([[x, gy - 104], [x, gy + 106]], { ...o, sw: 4 });   // O's winning line, down the middle
  dot2d(x, y - 120, 14, { fill: DQ.verm, stroke: DQ.ink, sw: 2, alpha: al });
}

// T56 (round 5; Neel: "rather than a glow before wait, please put a subtle drawn anchor, referencing thought anchors"):
// the line just above the circled one is the trace's "Wait, let me re-read the user's request", and before its "Wait" a
// small pencil anchor is drawn in as her lens passes: the state before a "wait" steers what the model does next (Neel et
// al., "Internal states before wait modulate reasoning patterns", 2025), and such sentences are thought anchors (the red
// anchor by the circled sentence is the decisive one). ly: her lens's height on the page (the anchor draws as it passes).
function camKWaitLine(y, ly) {
  squiggles(670, y, 56, 1, { sw: 2.2 });
  thoughtAnchor(748, y + 4, 11, seg(ly, 440, 520), { col: PENCIL, w: .42 });
  mono("Wait, let me re-read the user's request", 772, y + 18, { size: 34 });
}
// T26: the guessing game whose answer file sat within reach (Neel et al., "How to Design Environments for Understanding
// Model Motives", 2026): a sealed envelope, its seal unbroken, slit open at one corner, the number peeking out.
function camGSlitEnvelope(x, y, al) {
  paint([[x + 82, y - 158], [x + 206, y - 194], [x + 232, y - 104], [x + 108, y - 68]], { wash: '#FFFDF6', ink: DQ.ink, sw: .4 });   // the slip, poking out
  paint([[x - 170, y - 105], [x + 166, y - 112], [x + 172, y + 108], [x - 166, y + 114]], { wash: '#F3EAD3', ink: DQ.ink, sw: .45 });
  line2d([[x - 162, y - 101], [x + 2, y + 12], [x + 160, y - 108]], { col: '#8A7A5E', sw: 3 });   // the flap
  dot2d(x + 2, y + 8, 24, { fill: '#A8321E', stroke: DQ.ink, sw: 2 });                             // the seal, unbroken
  line2d([[x + 112, y - 110], [x + 168, y - 52]], { col: DQ.ink, sw: 4 });                        // the slit across the corner
  queue2d(c => { c.save(); c.translate(x + 168, y - 134); c.rotate(-.28); c.font = `700 64px "${FONT[DQF.type]}"`; c.fillStyle = DQ.ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('73', 0, 0); c.restore(); });
  dot2d(x, y - 90, 14, { fill: DQ.verm, stroke: DQ.ink, sw: 2, alpha: al });
}
// T15: Gemini's back-of-the-envelope sums that "just happen to come out to under 150 ms" (Neel et al., "Why do models
// task game?", 2026): the back of an envelope, a column of sums, a red line at 150, and the total just under it, ticked.
function camGSumsEnvelope(x, y, al) {
  paint([[x - 170, y - 112], [x + 166, y - 116], [x + 172, y + 112], [x - 166, y + 116]], { wash: '#F3EAD3', ink: DQ.ink, sw: .45 });
  line2d([[x - 162, y - 108], [x + 2, y - 4], [x + 160, y - 112]], { col: '#B8A888', sw: 3 });     // the flap's edge, behind the sums
  [['12', -78], ['+ 38', -38], ['+ 61', 2], ['+ 38', 42]].forEach(([s, dy]) => note(s, x + 70, y + dy, { size: 44, col: '#4A4540', align: 'right', role: 'fine' }));
  line2d([[x - 70, y + 58], [x + 92, y + 58]], { col: DQ.verm, sw: 5 }); note('150', x + 100, y + 64, { size: 34, col: DQ.verm, role: 'fine' });
  note('149 ✓', x + 70 + 34, y + 100, { size: 48, col: '#2F2B27', align: 'right', role: 'fine' });
  dot2d(x, y - 90, 14, { fill: DQ.verm, stroke: DQ.ink, sw: 2, alpha: al });
}

// ---------------- the bridge: the case file, one corkboard (the camera moves on the claps, then pulls back) ----------
const CORK = { st: { B1: [960, 540], B2: [2950, 560], B3: [960, 1700], B4: [2950, 1720], B5: [1955, 1130] }, ids: ['B1', 'B2', 'B3', 'B4', 'B5'] };
function corkCam(t) {
  let c = [...CORK.st.B1, 1];
  CORK.ids.forEach((id, k) => { if (!k) return; const t0 = DQ_BY[id].t0, tgt = id === 'B5' ? [...CORK.st.B5, .43] : [...CORK.st[id], 1], d = id === 'B5' ? 2.4 : .34; const q = ease(seg(t, t0 - .12, t0 - .12 + d)); c = c.map((v, i) => lerp(v, tgt[i], q)); });
  return c;
}
function caseFile(t) {
  const [cx, cy, z] = corkCam(t);
  camBegin(cx, cy, z);
  queue2d(c => { c.fillStyle = '#C59A64'; c.fillRect(-300, -300, 4600, 2900); for (let k = 0; k < 2600; k++) { c.fillStyle = k % 3 ? 'rgba(120,80,40,.25)' : 'rgba(255,240,210,.18)'; c.fillRect(-300 + hash(k * 1.3) * 4600, -300 + hash(k * 2.7) * 2900, 4, 3); } c.strokeStyle = '#6B4A2A'; c.lineWidth = 40; c.strokeRect(-300, -300, 4600, 2900); });
  flushLetters();
  const S = CORK.ids.map(id => CORK.st[id]);   // the red string along the camera's route, under everything pinned or standing
  // (the one into B2 lands higher, so it passes over the detective's hat, not behind her face at eye level, where at a
  // glance, and to Gemini twice, it read as a string across her face)
  for (let k = 1; k < 4; k++) redString([[S[k - 1][0] + 300, S[k - 1][1] + 200], [S[k][0] - 300, S[k][1] - (k === 1 ? 380 : 200)]], seg(t, DQ_BY[CORK.ids[k]].t0 - .12, DQ_BY[CORK.ids[k]].t0 + .3));
  flushLetters();
  CORK.ids.slice(0, 4).forEach(id => { const [sx, sy] = CORK.st[id]; camEnd(); camBegin(cx - sx + 960, cy - sy + 540, z); boilSeed(id); CORK_ST[id](DQ_BY[id], t); camEnd(); camBegin(cx, cy, z); });
  // every string runs to "your words" (drawn before the detective, and flattened, so they pass behind her)
  const hub = CORK.st.B5, tB5 = DQ_BY.B5.t0;
  if (t > tB5) {
    [[300, 300], [2600, 250], [3500, 700], [300, 1300], [1050, 2200], [3600, 2050], [2400, 1400], [1300, 400], [2071, -64], [2392, -48], [2513, 1819]].forEach((p, k) => redString([p, hub], seg(t, tB5 + .5 + k * .15, tB5 + 1.2 + k * .15)));
    flushLetters();
    box2d(hub[0] - 220, hub[1] - 70, 440, 140, { fill: '#FFF6E0', stroke: DQ.verm, sw: 4 }); tx('your words', hub[0], hub[1] + 22, { font: DQF.hand, size: 76, color: DQ.verm, role: 'label' });   // pinned over its strings
    coldCases(t, tB5);
    tweetCard(3300, 1150, 820, '@NeelNanda5', '', 'We need a science of model forensics: WHY did the model misbehave?', t, tB5 + 1.4, { size: 40 });   // no date on screen
    researcher(1500, 2200, 700, t, { pose: 'lens', face: 1, hat: 'deerstalker' });
  }
  camEnd();
}
// The bridge's stations on the corkboard (Neel, 3 Oct: "more crime imagery. The model is caught, it's dramatic, there's
// multiple hypotheses, then the investigator goes and investigates in more detail and finds incriminating lines of
// thought"; "very visually clear the model is shirking a task, and that's the 'crime'"; and "make the mountain small" as
// a counterfactual, "rewinding time and re-running the start of the scene with a change"). The case: a job of 258 errors
// to fix; it cuts the corner instead (Model Forensics: the workaround), is caught, and the reading of its own words
// ("But fixing 258 errors would be a huge task") plus the re-run with 50 errors (no workaround) says: lazy, not scheming.
function errorMountain(cx, by, n, sc = 1) {   // the job, as a pile of red error squiggles
  for (let k = 0; k < n; k++) { const u = hash(k * 1.7), v = hash(k * 3.1), h = 520 * sc, w = 900 * sc, x = cx + (u - .5) * w * (1 - v), y = by - v * h; pen([[x - 14, y], [x - 5, y - 8], [x + 5, y + 8], [x + 14, y]], { col: DQ.verm, sw: 2.5 }); }
}
// the crime scene at scene-time q (0 = before, 1 = the corner cut and gone): a ticket, the mountain, it, with scissors.
// The scissors reach the ticket, a dashed line shows where, they snip (on "corner"), and the corner drops away; from
// then on the ticket has no corner (Neel, 3 Oct, late: "the corner should no longer be there on the original sheet, but
// when rewinding it should get reattached", which B3's rewind does by running q back down to 0)
const CRIME = { c: [600, 350], rot: -.02, corner: [[795, 500], [900, 395], [900, 500]], mid: [865, 465] };   // the ticket's centre and tilt; the corner it cuts, and that corner's centroid, in the ticket's own frame
const crimeR = ([x, y]) => { const co = Math.cos(CRIME.rot), si = Math.sin(CRIME.rot), dx = x - CRIME.c[0], dy = y - CRIME.c[1]; return [CRIME.c[0] + dx * co - dy * si, CRIME.c[1] + dx * si + dy * co]; };   // ticket frame -> page
function crimeTicket(gone) {   // pinCard's ticket (600 x 300, tilted), drawn as a polygon so its corner can go
  queue2d(c => {
    c.save(); c.translate(...CRIME.c); c.rotate(CRIME.rot); c.translate(-CRIME.c[0], -CRIME.c[1]);
    const P = gone ? [[300, 200], [900, 200], CRIME.corner[1], CRIME.corner[0], [300, 500]] : [[300, 200], [900, 200], [900, 500], [300, 500]];
    const path = (dx, dy) => { c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy)); c.closePath(); };
    path(6, 8); c.fillStyle = 'rgba(40,25,10,.3)'; c.fill();   // its shadow (pinCard's)
    path(0, 0); c.fillStyle = DQ.cream; c.fill(); c.strokeStyle = DQ.sepia; c.lineWidth = 1.5; c.stroke();
    c.restore();
  });
  dot2d(600, 214, 11, { fill: DQ.verm });   // its pin
}
function crimeScene(t, q, n = 258) {
  const sep = clamp((q - .46) / .54);   // the corner, coming away: 0 still on the ticket, 1 fallen
  crimeTicket(sep > 0); mono(`fix ${n} errors`, 600, 300, { size: 52, align: 'center', role: n === 258 || n === 50 ? 'label' : 'deco' }); squiggles(340, 360, 500, 3, { sw: 2.5 });   // (the writing stops short of the cut)
  const guide = seg(q, .1, .3) * (sep > 0 ? 0 : 1);   // where it will cut, dashed, while the scissors come
  if (guide > 0) line2d([crimeR(CRIME.corner[0]), crimeR(CRIME.corner[1])], { col: DQ.ink, sw: 2, dash: [8, 6], alpha: guide });
  if (sep > 0) queue2d(c => {   // the corner, falling: away and down, turning, onto its head
    c.save(); c.translate(...CRIME.c); c.rotate(CRIME.rot); c.translate(-CRIME.c[0], -CRIME.c[1]);
    c.translate(CRIME.mid[0] + 140 * sep, CRIME.mid[1] + 250 * sep * sep); c.rotate(1.4 * sep); c.translate(-CRIME.mid[0], -CRIME.mid[1]);
    c.beginPath(); CRIME.corner.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
    c.fillStyle = DQ.cream; c.fill(); c.strokeStyle = DQ.sepia; c.lineWidth = 1.5; c.stroke(); c.restore();
  });
  errorMountain(1350, 900, n, .9 * Math.sqrt(n / 258));
  shoggoth(1000, 920, 150, 3.4, t, { seed: 3, look: [600, 320] });
  if (q < 1) { const a = ease(clamp(q / .38)), sx = lerp(980, 880, a), sy = lerp(640, 470, a); pen([[1010, 820], [sx, sy]], { sw: 10, col: DQ.indigo }); scissors(sx, sy, 48, q > .38 && q < .62 ? .1 : .5); }   // there by .38, snip, the corner goes at .46
}
function scissors(x, y, s, open) {   // a pair of scissors, blades open by `open` (radians)
  queue2d(c => { c.save(); c.translate(x, y); c.strokeStyle = DQ.ink; c.lineWidth = 3; c.fillStyle = '#C8CDD2';
    for (const d of [-1, 1]) { c.save(); c.rotate(d * open); c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * 1.1, -s * .12 * d); c.lineTo(-s * 1.1, s * .02 * d); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.arc(s * .35, s * .18 * d, s * .2, 0, TAU); c.stroke(); c.restore(); }
    c.restore(); });
}
// A strip of polygraph paper pinned under the suspects: a needle trace with one spike, ringed in red. A lie detector read
// off its activations (Apollo's deception probes, Feb 2025; Representation Engineering's honesty; Inference-Time
// Intervention's "truthful directions") fires, but can't say which suspect it was. (reference bank r3 pick 3)
function polygraphStrip(x, y, t, tS, tF) {
  const a = seg(t, tS, tS + .15), w = 230, h = 86, draw = seg(t, tS + .1, tF + .25);
  pinCard(x, y, w, h, -.03, { fill: '#F6F1E4' });
  queue2d(c => {
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(-.03);
    c.strokeStyle = 'rgba(201,71,42,.25)'; c.lineWidth = 1;   // chart-paper rules
    for (let gx = 12; gx < w; gx += 18) { c.beginPath(); c.moveTo(gx, 22); c.lineTo(gx, h - 6); c.stroke(); }
    for (let gy = 28; gy < h - 6; gy += 14) { c.beginPath(); c.moveTo(6, gy); c.lineTo(w - 6, gy); c.stroke(); }
    const P = []; for (let i = 0; i <= 60; i++) { const u = i / 60, sx = 10 + u * (w - 20), spike = Math.exp(-Math.pow((u - .74) / .025, 2)); P.push([sx, 58 + 4 * Math.sin(u * 47) + 2.5 * Math.sin(u * 113) - 34 * spike]); }
    const n = Math.max(2, Math.ceil(P.length * draw)); c.strokeStyle = DQ.ink; c.lineWidth = 2.2; c.lineJoin = 'round';
    c.beginPath(); P.slice(0, n).forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
    c.restore();
  });
  if (t > tF + .2) penEll(x + 10 + .74 * (w - 20), y + 34, 20, 26, { col: DQ.verm, sw: 3.5, alpha: seg(t, tF + .2, tF + .4) });   // the spike, ringed
}
function suspectCard(x, y, label, kind, a = 1) {   // a pinned card: a sketch of it, and the charge
  pinCard(x, y, 300, 340, kind === 'scheming' ? -.04 : .05);
  queue2d(c => { c.save(); c.globalAlpha = a; skShog(c, x + 150, y + 260, 170, { look: kind === 'confused' ? [-.4, -.5] : [.4, .3] });
    c.strokeStyle = DQ.verm; c.lineWidth = 5; if (kind === 'scheming') for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + 150 + d * 50, y + 112); c.lineTo(x + 150 + d * 78, y + 70); c.lineTo(x + 150 + d * 82, y + 118); c.stroke(); }
    c.restore(); });
  if (kind === 'confused') note('? ?', x + 230, y + 120, { size: 54, col: DQ.verm, alpha: a });
  mono(label, x + 150, y + 312, { size: 30, align: 'center', alpha: a });
}
const CORK_ST = {
  // "You cut a corner once": faced with a mountain of errors, it snips the corner off the job (on "corner"), and is
  // caught in a camera flash (on "once"); "(were you scheming, or confused?)": the two suspects pinned up
  B1(sh, t) {
    const tC = wT(43, /corner/), tO = wT(43, /once/), tS = wT(43, /scheming/), tF = wT(43, /confused/);
    crimeScene(t, seg(t, tC - .35, tC + .5));
    if (t > tO) { const k = Math.exp(-(t - tO) * 6); queue2d(c => { c.fillStyle = `rgba(255,253,246,${.9 * k})`; c.fillRect(0, 0, W, H); }, { screen: true });   // the flash: caught
      queue2d(c => { c.save(); c.translate(960, 980); c.rotate(-.06); c.fillStyle = '#F2D33A'; c.fillRect(-1100, -34, 2200, 68); c.fillStyle = '#1E1B16'; for (let x = -1100; x < 1100; x += 90) { c.beginPath(); c.moveTo(x, -34); c.lineTo(x + 40, -34); c.lineTo(x + 10, 34); c.lineTo(x - 30, 34); c.closePath(); c.fill(); } c.restore(); }); }
    if (t > tS) suspectCard(1240, 120, 'SCHEMING?', 'scheming', seg(t, tS, tS + .15));
    if (t > tF) suspectCard(1580, 262, 'CONFUSED?', 'confused', seg(t, tF, tF + .15));   // below the "said out loud" meter
    camGStickInsect(1150, 300, .66, .1 + .02 * Math.sin(TAU * .55 * t));   // T64: there all along, beside where the suspects go up
    if (t > tS) polygraphStrip(1668, 640, t, tS, tF);   // reference bank r3 pick 3
  },
  // "so I read back through your thinking — (and I found the words you used:)": the detective works down its thinking
  // with her lens, and circles the line that gives it away
  B2(sh, t) {
    pinCard(620, 120, 1080, 760, .01);
    const lines = 11, hit = 6, tFd = wT(44, /found/), tW = wT(44, /words/);
    const ly = lerp(200, 200 + hit * 60, ease(seg(t, sh.t0 + .2, tFd))), lx = 900 + 220 * Math.sin((t - sh.t0) * 2.4);
    for (let k = 0; k < lines; k++) { const y = 200 + k * 60; if (k === hit) mono('But fixing 258 errors would be a huge task', 670, y + 18, { size: 34, col: t > tFd ? '#3A0E06' : DQ.ink }); else if (k === 5) camKWaitLine(y, ly); else squiggles(670, y, 960 * (.6 + .4 * hash(k * 2.3)), 1, { sw: 2.2 }); }
    flushLetters();   // the page goes down first, so her arm and the lens's (painted) handle lie on top of it (Neel, 3 Oct, night)
    researcher(330, 1080, 720, t, { pose: 'hold', face: 1, hat: 'deerstalker', hand: [lx - 190, ly + 190] });
    magnifier(lx, ly + 10, 110, { handleAng: 2.3 });
    const sw_ = measure('But fixing 258 errors would be a huge task', { font: DQF.type, size: 34 }).w;   // the ring fits the sentence (it was short: Gemini's pass)
    if (t > tFd) penEll(670 + sw_ / 2, 200 + hit * 60 + 10, sw_ / 2 + 44, 40, { col: DQ.verm, sw: 6, alpha: seg(t, tFd, tFd + .2), j: 2 });   // (a little flatter: it clears the "Wait" line above)
    if (t > tW) { pinCard(1420, 640, 240, 90, .08, { fill: '#F6E7C8' }); mono('EXHIBIT A', 1540, 700, { size: 30, align: 'center', col: DQ.verm }); }
    if (t > tW) thoughtAnchor(1512, 548, 46, seg(t, tW, tW + .4));   // B2-1: the sentence that anchored the decision (just past the ring, clear of the "Wait" line's end)
  },
  // "you called the job a mountain — so I made the mountain small": the counterfactual. The tape rewinds to the start
  // of the scene (the corner flies back on), the mountain is made small (258 -> 50 errors), and it plays again
  B3(sh, t) {
    const tR = wT(45, /^so/), tSm = wT(45, /small/), rq = seg(t, tR, tSm - .15);   // rewinding
    const q = t < tR ? 1 : 1 - ease(rq), n = Math.round(t < tSm ? 258 : lerp(258, 50, ease(seg(t, tSm, tSm + .4))));
    crimeScene(t, q, n);
    // T108/T123: the two tapes turn with the deck: the first run plays, then rewinds; the second plays the re-run
    const tP = wT(45, /^you/), p1 = clamp(t - tP, 0, tR - tP), rw = ease(rq), p2 = Math.max(0, t - tSm - .1);
    camGCassette(290, 690, -.05, 'eiffel', t < tR ? .55 - .03 * p1 / (tR - tP) : lerp(.52, .94, rw), 2.6 * p1 - 7 * rw);
    camGCassette(545, 702, .04, 'colosseum', .94 - .02 * Math.min(1, p2 / 2), 2.6 * p2);
    if (t > tR && t < tSm + .6) {   // the VHS rewind: tracking lines and the symbol
      const play = t > tSm + .1;
      queue2d(c => { c.save(); c.globalAlpha = .35; c.fillStyle = '#FFFFFF'; for (let k = 0; k < 6; k++) { const y = (hash(Math.floor(t * 24) + k) * H); c.fillRect(0, y, W, 3 + 6 * hash(k + Math.floor(t * 24))); } c.restore(); c.save(); c.fillStyle = 'rgba(30,26,22,.85)'; c.font = `700 110px "${FONT[DQF.mono]}"`; c.fillText(play ? '\u25B6' : '\u25C0\u25C0', 300, 190); c.restore(); }, { screen: true });
    } else if (t > tP && t <= tR) {   // T124: the first run plays too, so the deck goes \u25B6 \u25C0\u25C0 \u25B6 (two forward passes and one backward)
      queue2d(c => { c.save(); c.fillStyle = 'rgba(30,26,22,.85)'; c.font = `700 110px "${FONT[DQF.mono]}"`; c.fillText('\u25B6', 300, 190); c.restore(); }, { screen: true });
    }
  },
  // "and you climbed it like an angel — (just lazy, after all!)": the re-run with a small hill: it climbs, halo on, and the
  // errors go as it passes; the verdict stamped over both suspects
  B4(sh, t) {
    pinCard(300, 200, 600, 300, -.02); mono('fix 50 errors', 600, 300, { size: 52, align: 'center' }); squiggles(340, 360, 520, 3, { sw: 2.5 });
    const q = seg(t, sh.t0, wT(46, /lazy/)), x = lerp(1000, 1330, q), y = lerp(920, 690, Math.sin(Math.PI / 2 * q));
    errorMountain(1350, 900, Math.round(50 * (1 - q)), .9 * Math.sqrt(50 / 258));
    shoggoth(x, y, 110, 3.4, t, { seed: 3 }); penEll(x + 6, y - 175, 46, 13, { col: DQ.gold, sw: 5, rot: .18 });
    const tL = wT(46, /lazy/);
    suspectCard(1240, 120, 'SCHEMING?', 'scheming', 1); suspectCard(1580, 262, 'CONFUSED?', 'confused', 1);
    if (t > tL) { line2d([[1260, 150], [1520, 440]], { col: DQ.verm, sw: 7 }); line2d([[1600, 292], [1860, 582]], { col: DQ.verm, sw: 7 }); }
    stamp('LAZY', 1560, 500, t, tL, { size: 120, bg: '#F6EEDC' });   // the verdict, stamped over the two struck suspects
  },
};

FINAL.B1 = (sh, t) => { caseFile(t); pageNo(258); return { lyBox: [300, 900, 1320, 128] }; };
FINAL.B2 = (sh, t) => { caseFile(t); pageNo(258); };
FINAL.B3 = (sh, t) => {   // on "small" the page number is struck and rewritten (M2)
  caseFile(t); const tSm = wT(45, /small/);
  if (t < tSm) pageNo(258); else { tx('p. 258', 1860, 1010, { font: DQF.hand, size: 40, color: DQ.sepia, align: 'right', role: 'deco', alpha: .7, bg: { col: DQ.paper, alpha: .85, pad: [10, 2], r: 4 } }); line2d([[1745, 998], [1862, 998]], { col: DQ.verm, sw: 4 }); tx('50', 1860, 960, { font: DQF.hand, size: 44, color: DQ.verm, align: 'right', role: 'fine', reveal: seg(t, tSm, tSm + .3), bg: { col: DQ.paper, alpha: .85, pad: [10, 2], r: 4 } }); }
  return { lyBox: [300, 970, 1320, 70] };
};
FINAL.B4 = (sh, t) => { caseFile(t); pageNo(50); };
FINAL.B5 = (sh, t) => { caseFile(t); };
