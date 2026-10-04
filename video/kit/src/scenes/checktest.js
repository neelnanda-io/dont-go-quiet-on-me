// checktest.js: a deliberately broken loop that must trip every text check (node render.mjs --loop=checktest --textcheck=0:2).
// If a category reports 0 here, the checker is broken, not the video.
LOOPS.checktest = t => {
  tx('OVERLAP ONE', 700, 300, { font: 'anton', size: 90, role: 'label' });
  tx('OVERLAP TWO', 760, 320, { font: 'anton', size: 90, role: 'label' });           // overlaps the first
  tx('off the edge', 20, 1070, { font: 'outfit', size: 40, align: 'left', role: 'label' });   // outside title-safe
  tx('tiny lyric', 960, 600, { font: 'outfit', size: 22, role: 'lyric' });           // below the lyric minimum
  tx('pale on paper', 960, 760, { font: 'outfit', size: 60, color: '#E0D6C4', role: 'label' });   // ~1.1:1
  if (t < .3) tx('a long caption that nobody could possibly read this fast', 960, 900, { font: 'outfit', size: 40, role: 'label' });
  tx('한글 accent', 960, 180, { font: 'anton', size: 60, role: 'label' });   // no vendored face has Hangul: must be flagged
  tx('café', 960, 60, { font: 'hanSans', size: 60, role: 'label' });   // Black Han Sans lacks é: a letter from another face
  tx('deco is exempt', 700, 300, { font: 'anton', size: 90, role: 'deco', color: '#E0D6C4' });
};
LOOPS.checktest.len = 2;
