// roto_test.js: the rotoscope prototype (render infrastructure for the Seedance redraws). ?loop=rotoTest draws the
// lip-sync test clip (data/roto_test.js, from tools/roto.py) as watercolour washes + boiling ink lines on the notebook
// page, on twos (12 fps). Loop time 0 = the clip's first frame; in the video, frame k shows at song time
// ROTO_TEST.t0 + k / fps - ROTO_TEST.offset.
function rotoFrame(R, k, o = {}) {
  const f = R.frames[clamp(k, 0, R.frames.length - 1)], s = (o.scale ?? W / R.w), ox = o.x ?? 0, oy = o.y ?? 0;
  const P = flat => { const out = []; for (let i = 0; i < flat.length; i += 2) out.push([ox + flat[i] * s, oy + flat[i + 1] * s]); return out; };
  for (const [c, pts] of f.fills) paint(P(pts), { wash: mixCol(R.palette[c], DQ.paper, o.paperMix ?? .12), fill: R.palette[c], fillOp: o.fillOp ?? 60, bleed: o.bleed ?? .08, tex: o.tex ?? .5, ink: null });
  flushLetters();
  for (const pts of f.lines) inkPath2d(P(pts), { col: DQ.ink, sw: o.sw ?? 2.2, j: o.j ?? .7, alpha: .9 });
  if (f.inks) queue2d(c => {   // the ink layer (tools/roto.py --ink): filled shapes with their holes, like a pen drawing
    c.save(); c.fillStyle = o.inkCol || '#1F1A22'; c.globalAlpha *= o.inkAlpha ?? .92; c.beginPath();
    for (const rings of f.inks) for (const r of rings) { for (let i = 0; i < r.length; i += 2) { const x = ox + r[i] * s, y = oy + r[i + 1] * s; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); }
    c.fill('evenodd'); c.restore();
  });
}
LOOPS.rotoTest = t => {
  notebookPage({ ring: false });
  boilSeed('roto' + Math.floor(t * 12));
  rotoFrame(ROTO_TEST, Math.floor(t * ROTO_TEST.fps));
};
LOOPS.rotoTest.len = 5;
