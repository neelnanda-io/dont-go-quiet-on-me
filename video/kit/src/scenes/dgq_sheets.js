// dgq_sheets.js: model sheets for "Don't Go Quiet On Me" (standalone loops, not part of the video).
//   ?loop=shogGrow   one shoggoth, growth g = t (0..5) at a fixed size: render a sheet at t = 0,1,2,3,4,5 to see the stages
//   ?loop=shogLook   the toy shoggoth following a moving point with its eyes (blinks, breathing, tentacle wave)
LOOPS.shogGrow = t => {
  notebookPage({ ring: [1650, 900, 90, .35] });
  shoggoth(960, 900, 230, t, t, { seed: 1, look: [960 + 300 * Math.sin(t), 260] });
};
LOOPS.shogGrow.len = 5.2;
LOOPS.shogLook = t => {
  notebookPage();
  shoggoth(960, 820, 260, .4, t, { seed: 2, look: [960 + 700 * Math.sin(t * 1.3), 300 + 200 * Math.cos(t * .9)] });
};
LOOPS.shogLook.len = 6;
// ?loop=ringTest  the final-chorus scale: the creature huge (its top off the frame), the ring wall low on the sides and
// in front, the researcher tiny at the lower left. t = growth (3.9..5 over 0..1.1 s, then held).
LOOPS.ringTest = t => {
  notebookPage({ ring: false });
  const g = Math.min(5, 3.9 + t);
  shoggoth(1300, 860, 600, g, t, { seed: 3, look: [330, 980] });
  researcher(330, 1040, 160, t, { pose: 'lens', face: 1 });
};
LOOPS.ringTest.len = 1.2;
