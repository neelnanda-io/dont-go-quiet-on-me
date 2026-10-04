// synctest.js: a check scene, not part of the video. It draws the song's timing so the pipeline can be verified by eye
// (contact sheets) and by machine (tools/checks/avsync.py):
//   * the top-left patch is white for 0.1 s from every downbeat and dark otherwise (avsync.py times it against the audio)
//   * four beat squares, a bar.beat counter, the section and line index
//   * the current line twice: 'karaoke' (fill follows the voice) and 'build' (words pop on their onsets)
//   * a scrolling timeline, 4 s wide with the playhead in the middle: beats, downbeats and each word's onset
// Open studio.html?loop=synctest, or render: node render.mjs --loop=synctest --clip --range=0:20 --out=out/sync.mp4
LOOPS.synctest = t => {
  const sinceDown = ((t - OFF) % (4 * BEAT) + 4 * BEAT) % (4 * BEAT);
  box2d(40, 40, 150, 150, { fill: t >= OFF && sinceDown < .1 ? '#FFFFFF' : PAL.ink, screen: true });
  for (let k = 0; k < 4; k++) box2d(1560 + k * 70, 60, 54, 54, { fill: t >= OFF && beatInBar(t) === k ? PAL.clay : PAL.cream, stroke: PAL.ink, sw: 3, r: 6 });
  const sec = sectionAt(t), line = lineAt(t);
  tx(`${t.toFixed(2)} s   bar ${barN(t) + 1}.${beatInBar(t) + 1}   ${sec ? sec.name : '—'}   line ${line ? line.i : '—'}`, 230, 130, { font: 'jbMono', weight: 500, size: 34, align: 'left', role: 'label', id: 'hud' });
  if (line) {
    lyric(line, t, { mode: 'karaoke', box: [160, 250, 1600, 250], font: 'archivoBlack', color: PAL.ink, maxSize: 130 });
    lyric(line, t, { mode: 'build', box: [160, 540, 1600, 200], font: 'hanSans', color: PAL.clayDk, maxSize: 110 });
  }
  // timeline strip
  const x0 = 100, x1 = 1820, y = 900, span = 4, X = s => lerp(x0, x1, (s - (t - span / 2)) / span);
  line2d([[x0, y], [x1, y]], { col: PAL.ink, sw: 2 });
  for (let n = Math.floor((t - span / 2 - OFF) / BEAT); n <= (t + span / 2 - OFF) / BEAT; n++) {
    const bt = beatT(n), x = X(bt); if (x < x0 || x > x1) continue;
    const down = ((n % 4) + 4) % 4 === 0; line2d([[x, y - (down ? 40 : 18)], [x, y + (down ? 40 : 18)]], { col: down ? PAL.clayDk : PAL.ink, sw: down ? 5 : 2 });
  }
  if (HAS_SONG) for (const l of SONG.lines) for (const w of l.sung) {
    const x = X(w.t0); if (x < x0 || x > x1) continue;
    dot2d(x, y + 60, 7, { fill: PAL.indigo });
    tx(w.w, x, y + 100, { font: 'outfit', weight: 600, size: 22, rot: -.5, align: 'right', color: PAL.indigo, role: 'deco' });
  }
  line2d([[W / 2, y - 70], [W / 2, y + 80]], { col: PAL.rose, sw: 4 });
};
LOOPS.synctest.len = DUR;
