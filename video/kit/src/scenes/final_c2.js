// final_c2.js: Chorus 2, finished (95.53-112.63 s, stamped 2025). The visit on the study floor (dgq/board.js studySet:
// the dishes it outgrew, the books and the d20, contact shadows). C2b: the two-hop graph in the pupil (Biology of a Large
// Language Model), "...blind" pencilled before it is sung (rhyme planning). C2c: the window's glazing is the CoT
// Monitorability paper's only figure (reference bank C2c-1): panes in columns (layers up, tokens across) and the blue
// ribbon looping from the top of each column into the bottom of the next, "the only way that information can flow down
// from later to earlier layers"; the blind snaps up on "window" and shows it.

// Pinned up above it (reference bank r2, T37 + T46): her field sketches of the last visit (one mask) and this one (two),
// the new mask ringed in red pencil. Model diffing studies that mask: "RLHF is often visualized as a "mask" applied on top
// of the base LLM's raw capabilities (the "shoggoth"). One application of model diffing is studying this mask
// specifically" (What We Learned Trying to Diff Base and Chat Models, Jun 2025, the post beside Neel's crosscoder paper).
// Clipped to them, a slip of tracing paper with only the new mask on it: the difference alone, which is what a diff-SAE
// is trained on ("SAE on activation differences", Jun 2025). Chorus 2 only: the wides and the page turn out of them.
const camFPC = '#6F6A62';   // her pencil (the colour of verse 5's traced copies)
const camFSKETCH = {
  last: { s: 54, ry: 58, cy: 14, base: 64, eyes: [[-20, -2, 12], [14, -6, 14], [-4, -30, 7], [32, 10, 6], [-40, 8, 5], [38, -22, 5], [-30, -24, 5]], masks: [[2, 36, 12]] },
  now: { s: 66, ry: 70, cy: 18, base: 76, lace: true, ring: 1, masks: [[8, 46, 12], [-36, 20, 10.5]],
    eyes: [[-20, 0, 13], [17, -4, 15], [-3, -34, 8], [38, 16, 7], [-50, 4, 5], [-44, -20, 5], [-28, -44, 5], [-8, -56, 4.5], [14, -50, 5], [32, -38, 5], [48, -18, 5], [56, 6, 4.5], [50, 34, 5], [-58, 30, 4], [-14, 22, 4.5], [30, 52, 4.5]] },
};
function camFCircle(x, y, r, n = 14) { const P = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return P; }
function camFMask(S, x, y, r, o = {}) {   // a smiley mask in pencil (o.tint: a dab of its yellow)
  S.push({ P: camFCircle(x, y, r, 16), w: 1.5, fill: o.tint ? 'rgba(242,199,68,.75)' : null });
  for (const d of [-1, 1]) S.push({ P: camFCircle(x + d * r * .34, y - r * .22, r * .1, 6), fill: camFPC });
  const sm = []; for (let i = 0; i <= 8; i++) { const a = lerp(.25, Math.PI - .25, i / 8); sm.push([x + Math.cos(a) * r * .55, y + r * .05 + Math.sin(a) * r * .42]); }
  S.push({ P: sm, w: 1.3 });
  if (o.strings) for (const d of [-1, 1]) S.push({ P: [[x + d * r * .95, y - r * .2], [x + d * r * 2.2, y - r * 1.1]], w: 1, a: .7 });
}
function camFSketch([x, y, w, h, rot], K) {   // a field sketch of the creature, on the card pinned at (x, y)
  const S = [], { s, ry, cy, base } = K, J = P => P.map(([u, v]) => [u + jit(.45), v + jit(.45)]);
  const body = []; body.push([-s * 1.12, base], [-s, cy + ry * .1]);   // skirt, dome, skirt, then the arm tips along the ground
  for (let i = 0; i <= 24; i++) { const a = Math.PI + Math.PI * i / 24; body.push([Math.cos(a) * s, cy + Math.sin(a) * ry]); }
  body.push([s, cy + ry * .1], [s * 1.12, base]);
  for (let i = 1; i < 14; i++) { const u = s * 1.12 * (1 - 2 * i / 14); body.push([u, base + 3 * Math.sin(i * 2.1)]); }
  S.push({ P: body, w: 1.8, close: true, fill: 'rgba(78,96,170,.22)' });   // a light wash of its indigo
  for (const d of [-1, 1]) {   // an arm each side, curling up at the tip
    const A = [[d * s * .92, base - 3], [d * s * 1.12, base - 1], [d * s * 1.3, base - 5]];
    for (let i = 1; i <= 10; i++) { const a = Math.PI / 2 - d * 1.5 * Math.PI * i / 10; A.push([d * s * 1.3 + Math.cos(a) * 9, base - 14 + Math.sin(a) * 9]); }
    S.push({ P: A, w: 1.6 });
  }
  if (K.lace) for (const L of [[[30, -46], [30, -30], [46, -30]], [[-22, -50], [-22, -38], [-10, -38]], [[-48, 44], [-34, 44], [-34, 56]]]) { S.push({ P: L.map(([u, v]) => [u, v + cy - 14]), w: 1.1, a: .55 }); const [u, v] = L[2]; S.push({ P: camFCircle(u, v + cy - 14, 2.6, 8), w: 1.1, a: .55 }); }
  for (const [ex, ey, er] of K.eyes) { S.push({ P: camFCircle(ex, ey + cy - 14, er), w: 1.4, fill: 'rgba(251,244,228,.95)' }); S.push({ P: camFCircle(ex - er * .15, ey + cy - 14 + er * .12, er * .38, 8), fill: camFPC }); }
  K.masks.forEach(([mx, my, mr], i) => camFMask(S, mx, my + cy - 14, mr, { tint: true, strings: i === 0 }));
  if (K.ring != null) {   // the new one, ringed in red pencil (round once and a bit over)
    const [mx, my, mr] = K.masks[K.ring], R = []; for (let i = 0; i <= 30; i++) { const a = -2.3 + (TAU + .6) * i / 30; R.push([mx + 1 + Math.cos(a) * mr * 1.95, my + cy - 14 + Math.sin(a) * mr * 1.7]); }
    S.push({ P: R, w: 2.4, col: DQ.verm });
  }
  const Q = S.map(o => ({ ...o, P: J(o.P) })), ox = x + w / 2, oy = y + h / 2 + 8;
  queue2d(c => {
    c.save(); c.translate(ox, oy); c.rotate(rot); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const o of Q) {
      c.beginPath(); o.P.forEach(([u, v], i) => i ? c.lineTo(u, v) : c.moveTo(u, v)); if (o.close) c.closePath();
      if (o.fill) { c.fillStyle = o.fill; c.fill(); }
      if (o.w) { c.globalAlpha = o.a ?? 1; c.strokeStyle = o.col || camFPC; c.lineWidth = o.w; c.stroke(); c.globalAlpha = 1; }
    }
    c.restore();
  });
}
function camFSlip(x, y, rot) {   // the tracing-paper slip, clipped on: only the new mask, traced, and two registration marks
  const S = []; camFMask(S, 0, 6, 10.5);
  for (const [u, v] of [[34, -38], [-34, 40]]) S.push({ P: [[u - 5, v], [u + 5, v]], w: 1.1 }, { P: [[u, v - 5], [u, v + 5]], w: 1.1 });
  const Q = S.map(o => ({ ...o, P: o.P.map(([u, v]) => [u + jit(.35), v + jit(.35)]) }));
  queue2d(c => {
    c.save(); c.translate(x, y); c.rotate(rot); c.lineJoin = 'round'; c.lineCap = 'round';
    c.fillStyle = 'rgba(40,25,10,.1)'; c.fillRect(-44, -48, 94, 104);   // its faint shadow
    c.fillStyle = 'rgba(253,251,245,.62)'; c.strokeStyle = 'rgba(150,140,125,.75)'; c.lineWidth = 1.2; c.beginPath(); c.rect(-47, -52, 94, 104); c.fill(); c.stroke();
    for (const o of Q) { c.beginPath(); o.P.forEach(([u, v], i) => i ? c.lineTo(u, v) : c.moveTo(u, v)); if (o.fill) { c.fillStyle = o.fill; c.fill(); } if (o.w) { c.strokeStyle = camFPC; c.lineWidth = o.w; c.stroke(); } }
    c.strokeStyle = '#8E8A84'; c.lineWidth = 2.2;   // the paperclip over its top edge
    c.beginPath(); c.moveTo(-22, -40); c.lineTo(-22, -64); c.arc(-28, -64, 6, 0, Math.PI, true); c.lineTo(-34, -30); c.arc(-29, -30, 5, Math.PI, 0, true); c.lineTo(-24, -58); c.stroke();
    c.restore();
  });
}
function camFSketches() {
  const A = [1010, 96, 180, 200, -.05], B = [1176, 112, 190, 214, .045];
  pinCard(...A); camFSketch(A, camFSKETCH.last);
  pinCard(...B); camFSketch(B, camFSKETCH.now);
  camFSlip(1378, 128, .13);
}
FINAL.C2a = (sh, t) => {
  visit(t, chorusG(sh)); camFSketches(); warmLight(1300, 600, 800, .22);
};
FINAL.C2b = (sh, t) => {
  const [px, py] = eyeClose(t);
  queue2d(c => { c.save(); c.beginPath(); c.arc(px, py, 150, 0, TAU); c.clip(); c.fillStyle = 'rgba(20,20,40,.7)'; c.fillRect(px - 150, py - 150, 300, 300);
    const nodes = [['Dallas', -72, 58], ['Texas', 0, -6], ['Austin', 70, -70]]; c.strokeStyle = DQ.goldLt; c.lineWidth = 4;
    for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(px + nodes[k][1], py + nodes[k][2]); c.lineTo(px + nodes[k + 1][1], py + nodes[k + 1][2]); c.stroke(); }
    camMErrNode(c, px + 62, py + 52, px + 24, py + 6);   // the replacement model's error node, feeding Texas (r3 pick 6)
    c.font = `500 22px "${FONT.plexMono}"`; c.textAlign = 'center'; for (const [s, dx, dy] of nodes) { c.fillStyle = '#F2E8D2'; c.fillRect(px + dx - 44, py + dy - 18, 88, 32); c.fillStyle = DQ.ink; c.fillText(s, px + dx, py + dy + 7); } c.restore(); }, { screen: true });
  if (t > sh.t0 + .4) note('…blind', 560, 1015, { size: 46, col: 'rgba(200,190,170,.9)', alpha: .7 });   // the rhyme, pencilled under "mind" before it is sung
  return { lyBox: [110, 600, 590, 400] };   // left of the eye, clear of her hand (as C1b)
};
// r3 pick 6, in the pupil's graph: one unlabelled node off to the side, feeding Texas by a faint edge and fed by nothing:
// an error node, "the portion of each MLP output in the underlying model left unexplained by the CLT" (Circuit Tracing,
// Ameisen et al., Mar 2025: the graph runs on a cross-layer-transcoder replacement model; error nodes "receive no input
// themselves (they 'pop out of nowhere')"). Drawn as the paper's open-source graph interface draws error nodes: a white
// ◆ outlined in black (features are ●). (x, y): the diamond; (ex, ey): where its edge ends, under Texas's label.
function camMErrNode(c, x, y, ex, ey) {
  c.save(); c.strokeStyle = DQ.goldLt; c.globalAlpha = .5; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 4, y - 7); c.lineTo(ex, ey); c.stroke();
  c.globalAlpha = 1; const r = 11; c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .78, y); c.lineTo(x, y + r); c.lineTo(x - r * .78, y); c.closePath();
  c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = DQ.ink; c.lineWidth = 1.6; c.stroke(); c.restore();
}
// "you wrote your thinking down — a window, not a blind" (Neel, 3 Oct: "the window not a blind image needs work"). A
// big sash window set in its side; the roller blind is down until "window", then snaps up: its thinking, written out
// in plain view.
FINAL.C2c = (sh, t) => {
  notebookPage();
  creature(1270, 1120, chorusG(sh), t, { dish: false, s: 480, look: [600, 300] });
  const tW = wT(23, /window/), up = t < tW ? 0 : 1 - Math.exp(-(t - tW) * 14) * Math.cos((t - tW) * 18) * .9;   // snaps up, a little bounce
  const wx = 1340, wy = 500, ww = 480, wh = 390, cols = 4, rows = 3, pw = ww / cols, ph = wh / rows;   // on its flank, its face in view
  box2d(wx, wy, ww, wh, { fill: '#FFFDF7' });
  // behind the glass, the paper's figure: a transformer's states, layers going up, tokens going across
  queue2d(c => {
    c.save(); c.lineCap = 'round';
    const at = (i, j) => [wx + (i + .5) * pw, wy + wh - (j + .5) * ph];
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const [x, y] = at(i, j);
      if (j < rows - 1) { c.strokeStyle = '#8C7A5A'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y - 16); c.lineTo(x, y - ph + 16); c.stroke(); c.beginPath(); c.moveTo(x - 6, y - ph + 24); c.lineTo(x, y - ph + 16); c.lineTo(x + 6, y - ph + 24); c.stroke(); }   // up the layers
      for (let i2 = i + 1; i2 < cols && j < rows - 1; i2++) { const [x2, y2] = at(i2, j + 1); c.strokeStyle = 'rgba(140,122,90,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 10, y - 8); c.lineTo(x2 - 12, y2 + 10); c.stroke(); }   // attention, forward only
      c.fillStyle = DQ.goldLt; c.strokeStyle = DQ.ink; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 13, 0, TAU); c.fill(); c.stroke();
    }
    // the chain of thought: from the top of each column, out as a written token, and back in at the bottom of the next
    c.strokeStyle = '#3E7FBF'; c.lineWidth = 5; c.globalAlpha = .9;
    for (let i = 0; i < cols - 1; i++) {
      const [x0, y0] = at(i, rows - 1), [x1, y1] = at(i + 1, 0);
      c.beginPath(); c.moveTo(x0, y0 - 16); c.bezierCurveTo(x0 + 10, y0 - 70, x0 + pw * .45, y0 - 60, x0 + pw * .5, y0 + 10); c.bezierCurveTo(x0 + pw * .55, y1 - 40, x1 - 30, y1 + 50, x1, y1 + 16); c.stroke();
      c.beginPath(); c.moveTo(x1 - 8, y1 + 26); c.lineTo(x1, y1 + 16); c.lineTo(x1 + 8, y1 + 26); c.stroke();
    }
    c.restore();
  }, { screen: true });
  // the blind: a cloth sheet rolled down from the top, with its pull cord
  const bh = (wh - 20) * clamp(1 - up), by = wy + 10;
  if (bh > 4) { box2d(wx + 10, by, ww - 20, bh, { fill: '#D9C29A', stroke: '#8A6A3A', sw: 2 }); for (let k = 1; k * 26 < bh; k++) line2d([[wx + 14, by + k * 26], [wx + ww - 14, by + k * 26]], { col: '#B89A6A', sw: 1.5 }); pen([[wx + ww / 2, by + bh], [wx + ww / 2, by + bh + 50]], { sw: 2, col: '#6B4E33' }); dot2d(wx + ww / 2, by + bh + 56, 8, { fill: '#6B4E33' }); }
  box2d(wx - 12, by - 26, ww + 24, 30, { fill: '#B89A6A', stroke: '#6B4E33', sw: 3, r: 15 });   // the roll
  // the sash frame over everything; its glazing bars are the figure's grid (columns of tokens, rows of layers)
  box2d(wx, wy, ww, wh, { stroke: '#6B4E33', sw: 14, r: 6 });
  for (let i = 1; i < cols; i++) pen([[wx + i * pw, wy], [wx + i * pw, wy + wh]], { sw: 6, col: '#6B4E33' });
  for (let j = 1; j < rows; j++) pen([[wx, wy + j * ph], [wx + ww, wy + j * ph]], { sw: 6, col: '#6B4E33' });
  return { lyBox: [150, 220, 640, 460] };
};
FINAL.C2d = (sh, t) => { visit(t, chorusG(sh), { blinkAll: chorusNow(sh) }); camFSketches(); warmLight(1300, 600, 800, .22); };   // on "now": every eye blinks at once
FINAL.C2x = (sh, t) => { visit(t, chorusG(DQ_BY.C2d)); camFSketches(); pageTurn(t, sh.t0, (sh.t1 - sh.t0) * .85, { draw: () => {} }, 2025); return { noLyric: true }; };
