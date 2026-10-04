// dgq/board.js: the shared pieces every shot after the hook uses: the year counter, the lyric treatments, reference
// cards, the researcher (board version), the chorus motif ("the visit"), the into-chorus lens iris and the into-verse
// page turn, and the animatic slate. The animatic (scenes/dgq_animatic.js) draws rough boards with these; the final
// shots reuse the same functions, so timing, layout and lettering decided here carry straight into the finished video.

// ---------- the year counter (figures_and_cards.md §1: year only, ticks on the hit word, forwards but for one flick) ----------
// Neel (3 Oct): "I'd like to aim for good chronological accuracy wherever possible". 2023 lands on "everyone" (Sydney,
// Feb 2023, is who talks to everyone); "thought out loud" is the reasoning models (o1, Sep 2024), so the stamp flicks
// back to 2024 there and on to 2025 on "Let's hack" (Mar 2025): "have it be 2024 but then quickly move on". The one
// time it goes backwards, on purpose.
const YEAR_TICKS = [[19.56, 2020], [27.58, 2022], [56.08, 2023], [62.18, 2024], [70.84, 2025], [88.24, 2024], [92.04, 2025], [145.42, 2026], [244.0, 2027]];   // 2027 on the last line, as it outgrows the fortress (the hook's year)
// Mock-ups of ideas left out of the video (Neel, 3 Oct: "still images mocking up all the ideas you left out"):
// render.mjs --mock=<key> (several: comma-separated) switches one on for a still; mock(key) is false in the real video.
const MOCKS = new Set(((typeof location !== 'undefined' && new URLSearchParams(location.search).get('mock')) || '').split(',').filter(Boolean));
function mock(key) { return MOCKS.has(key); }
const YEAR_OFF = 249.64;           // goes dark on "n—"
const MONTH_AT = 209.62;           // "SEP" appears with Astra: this is now (the verse re-sung 3 Oct; "Astra" moved from 208.22)
// The year the stamp shows at t: the hook keeps its own fast clock (dgq_hook.js HOOK.year), the song YEAR_TICKS; null
// where there is no stamp. For dating things on screen (the lens's TransformerLens etching waits for 2022).
function stampYear(t) { return typeof HOOK !== 'undefined' && typeof DQ_BY !== 'undefined' && DQ_BY.H1 && t < DQ_BY.H1.t1 ? HOOK.year(t) : yearAt(t); }
function yearAt(t) {
  if (t < YEAR_TICKS[0][0] || t >= YEAR_OFF) return null;
  let y = YEAR_TICKS[0][1];
  for (const [tk, v] of YEAR_TICKS.slice(1)) {
    if (t < tk) break;
    const d = .3 * Math.max(1, Math.abs(v - y));   // odometer roll (either way): skipped years flick past
    y = t >= tk + d ? v : y + (v - y) * ease((t - tk) / d);
  }
  return y;
}
// The second HUD meter: how much the model says out loud. It is the song's title as a gauge, set by year (Neel, 3 Oct,
// late): nothing in 2020 ("you never used to talk to me"), 3/10 in 2022, 6/10 in 2023 (filling across "learned to talk"
// as the stamp reaches 2023), 9/10 through the pragmatic-interp verse (2025), 10/10 with o1 ("thought out loud"), then a
// gradual drain: 8 under test, 6 as the J-lens hears the words it never says, 5-4-3 through Astra; the final chorus holds
// 3, then 1 as it grows into 2027. Pencil cells under the year stamp.
const TALK_KEYS = [[19.4, 0], [27.58, 0], [28.2, .3], [55.28, .3], [56.08, .6], [70.84, .6], [71.4, .9], [89.0, .9], [89.5, 1], [114.4, 1], [114.8, .8], [146.8, .8], [147.4, .6],
  [209.4, .6], [213.4, .5], [218.5, .4], [223.9, .3], [244.0, .3], [247.9, .1], [249.64, .1]];
function talkAt(t) { return kf(t, TALK_KEYS, ease); }
function talkHUD(t, o = {}) {
  if (t < 19.4 || t >= YEAR_OFF) return;
  const v = talkAt(t), n = 10, x0 = 1640, y0 = 196, cw = 19, gap = 4, col = o.dark ? '#E8806A' : DQ.verm, a = o.alpha ?? .9;
  if (o.bg) box2d(x0 - 10, y0 - 8, n * (cw + gap) + 16, 64, { fill: o.bg, alpha: .85, r: 4 });
  for (let k = 0; k < n; k++) box2d(x0 + k * (cw + gap), y0, cw, 22, { fill: k < Math.round(v * n) ? col : null, stroke: col, sw: 1.5, alpha: a });
  tx('said out loud', x0, y0 + 50, { font: DQF.hand, size: 26, color: col, align: 'left', alpha: a, role: 'fine' });
}
function yearHUD(t, o = {}) {
  talkHUD(t, o);
  const y = yearAt(t); if (y == null) return;
  const th = hitPulse(t, YEAR_TICKS.map(k => k[0]), 9), dark = o.dark;
  yearStamp(y, 1735, 105, { size: 52, thump: th, alpha: .95, col: dark ? '#E8806A' : DQ.verm, bg: dark ? (o.bg || '#1E1B22') : (o.bg || null) });
  if (t >= MONTH_AT && y < 2026.5) tx('SEP', 1640, 122, { font: DQF.type, size: 30, color: dark ? '#E8806A' : DQ.verm, alpha: seg(t, MONTH_AT, MONTH_AT + .3), role: 'label', align: 'right', bg: { col: dark ? (o.bg || '#1E1B22') : DQ.paper, alpha: .92, pad: [8, 4], r: 4 } });
  // as it lands on 2026, a red-pencil "?" beside it for a beat, then rubbed out: is it really 2026? ("Date confusion",
  // Gemini doubting the year, in Neel's team's post on why naive SFT filters fail; reference bank r2 T22)
  const qa = seg(t, 145.76, 145.9) * (1 - seg(t, 146.44, 146.72));
  if (qa > 0) tx('?', 1840 + 3 * Math.sin(t * 90) * seg(t, 146.44, 146.72), 116, { font: DQF.hand, size: 58, color: DQ.verm, alpha: qa * .9, rot: .12, role: 'fine' });
}

// ---------- lyric treatments ----------
// Words between ( and ) are the backing vocals: the researcher's marginalia (red pencil). "(spoken:)" is dropped.
// Lone dashes are dropped from the big treatments and kept in captions.
function splitWords(line) {
  const main = [], paren = []; let inP = false;
  line.words.forEach((w, i) => {
    let s = w.w; if (/^\(spoken/.test(s)) return;
    const opens = s.startsWith('('), closes = /\)[!?.,:]*$/.test(s);
    if (opens) inP = true;
    (inP ? paren : main).push({ ...w, i, w: s });
    if (closes) inP = false;
  });
  return { main, paren };
}
// a line laid out in a box, each word drawn with its own style (per-word italics, colour), popping on its onset
// (build) or filling karaoke-style. Like type.js lyric(), with a style hook. Returns the layout.
function dqLyric(words, t, o = {}) {
  if (!words.length) return null;
  const [bx, by, bw, bh] = o.box, st = { font: DQF.serif, color: DQ.ink, role: 'lyric', size: o.size, ...o.st, align: 'left', base: 'alphabetic' };
  const lo = o.wordStyle ? { ...st, styleOf: o.wordStyle } : st;   // measure each word in its own style (the red italics ran together)
  const L = o.size ? layout(words, lo, bw) : fitLayout(words, lo, bw, bh, 20, o.maxSize || 160, o.maxLines || 99);
  st.size = L.size;
  const oy = o.valign === 'top' ? by : o.valign === 'bottom' ? by + bh - L.height : by + (bh - L.height) / 2;
  if (o.before) o.before(L, bx, oy);   // e.g. a backing band, drawn under the words
  for (const ln of L.lines) {
    const ox = o.align === 'center' ? bx + (bw - ln.width) / 2 : o.align === 'right' ? bx + bw - ln.width : bx;
    for (const it of ln.items) {
      const w = words[it.i], x = ox + it.x + it.width / 2, y = oy + ln.y, t0 = w.t0 ?? 0, t1 = w.t1 ?? t0 + .2;
      const ws = { ...st, align: 'center', ...(o.wordStyle ? o.wordStyle(w) : {}) };
      if (o.mode === 'karaoke') {
        const age = t - (PROJECT.lead || 0) - t0, k = age > 0 ? clamp(age / Math.max(.08, t1 - t0)) : 0;
        tx(it.w, x, y, { ...ws, color: mixCol(ws.color, o.paper || DQ.paper, .55), noReg: k > .5 });
        if (k > 0) tx(it.w, x, y, { ...ws, reveal: k });
      } else {
        const age = t - t0; if (age < -.04) continue;
        const k = easeOut(clamp((age + .04) / .16));
        tx(it.w, x, y + 16 * (1 - k), { ...ws, alpha: (ws.alpha ?? 1) * k, reveal: ws.writeOn ? clamp(age / Math.max(.15, t1 - t0)) : undefined });
      }
    }
  }
  return { ...L, x: bx, y: oy };
}
const KEYWORD = /^(quiet|mind|feature|window|testing|loving|tool|blind|read|n—)/i;   // set in italic in the big treatments
// the backing vocals as red-pencil marginalia (Caveat, tilted), each word on its onset
function marginalia(words, t, x, y, o = {}) {
  const s = words.map(w => w.w).join(' '), t0 = words[0].t0, t1 = words[words.length - 1].t1;
  if (t < t0 - .04) return;
  tx(s, x, y, { font: DQF.hand, size: o.size || 64, color: o.col || DQ.verm, align: o.align || 'left', rot: o.rot ?? -.05, reveal: clamp((t - t0) / Math.max(.3, t1 - t0)), role: 'lyric', stroke: o.stroke, sw: o.stroke ? 10 : undefined });
}
// Which line to show: the latest line that has started (with a small lead), held until the next one starts; only lines
// overlapping the shot.
function shotLine(sh, t) {
  if (!HAS_SONG) return null;
  let cur = null;
  for (const l of SONG.lines) if (l.t1 > sh.t0 - .05 && l.t0 < sh.t1 && l.t0 <= t + .3) cur = l;
  return cur;
}
// draw the shot's lyric in its treatment. o.dark: light lettering for dark pages. o.box overrides the default box.
function shotLyric(sh, t, o = {}) {
  const line = shotLine(sh, t); if (!line) return;
  const { main, paren } = splitWords(line), dark = o.dark, ink = dark ? '#F2E8D2' : DQ.ink, paper = dark ? (o.bgCol || '#1E1B22') : DQ.paper;
  const mode = o.ly || sh.ly;
  if (mode === 'hero') {
    const words = main.filter(w => w.w !== '—');
    const L = dqLyric(words, t, { box: o.box || [270, 250, 660, 600], maxSize: 150, st: { color: ink, stroke: paper, sw: 14 }, valign: 'top',
      wordStyle: w => KEYWORD.test(w.w) ? { style: 'italic', writeOn: /quiet/i.test(w.w) } : {} });
    if (paren.length && L) marginalia(paren, t, (o.box || [270])[0] + 10, L.y + L.height + 110, { size: 70, stroke: paper });
  } else if (mode === 'big') {
    const words = main.filter(w => w.w !== '—');
    const box = o.box || [260, 800, 1400, 190], L = dqLyric(words, t, { box, maxSize: 112, align: 'center', st: { color: ink, stroke: paper, sw: 12 },
      wordStyle: w => KEYWORD.test(w.w) ? { style: 'italic' } : {} });
    if (paren.length && L) marginalia(paren, t, 1660, L.y - 30, { size: 58, align: 'right', stroke: paper });
    return { L, box };   // for marks drawn on its words (lyricWordAt)
  } else if (mode === 'shout') {
    dqLyric(line.words.map((w, i) => ({ ...w, w: w.w.replace(/[()]/g, '') })), t, { box: o.box || [140, 260, 1640, 560], maxSize: 230, align: 'center',
      st: { font: DQF.serif, color: '#C2412B', stroke: DQ.paper, sw: 16 } });
  } else {   // caption / card: karaoke caption, lower left, on a paper band; parentheses in red italic
    const card = mode === 'card', box = o.box || (card ? [300, 948, 1320, 80] : [300, 900, 1320, 128]);
    const all = [...main, ...paren].sort((a, b) => a.i - b.i);
    dqLyric(all, t, { box, maxSize: card ? 44 : 60, mode: 'karaoke', paper, valign: 'bottom', st: { color: ink },
      wordStyle: w => paren.includes(w) ? { style: 'italic', color: dark ? '#F08A70' : DQ.verm } : {},
      before: (L, x, y) => box2d(x - 26, y - L.size * .36, Math.max(...L.lines.map(l => l.width)) + 52, L.height + L.size * .72, { fill: paper, alpha: .93, r: 10 }) });   // from just above the caps to just below the descenders (Neel: the band sat too high)
  }
}

// Where a word of a 'big' lyric sits, from what shotLyric returned: its left and right x, its baseline and the type size
// (null if the line isn't up). For marks drawn on a word, like C1c's correction of "feature" to "latent".
function lyricWordAt(ly, re) {
  if (!ly || !ly.L) return null;
  const { L, box } = ly;
  for (const ln of L.lines) {
    const ox = box[0] + (box[2] - ln.width) / 2;   // centred, as dqLyric lays out the 'big' treatment
    for (const it of ln.items) if (re.test(it.w)) return { x0: ox + it.x, x1: ox + it.x + it.width, base: L.y + ln.y, size: L.size };
  }
  return null;
}

// ---------- references on screen ----------
// Neel (3 Oct): "Don't have paper references on screen, maybe have the title in the bottom left corner, but no year or
// author or org", and "have less text on screen". So a paper appears only as its title, small, in the bottom left corner,
// below the lyric band; the full citation stays in the shot list (for the page and the fact checks).
function paperTitle(title, t, t0, o = {}) {
  if (!title || t < t0) return;
  const k = easeOut(seg(t, t0, t0 + .4));
  tx(title, 40, 1058, { font: DQF.soft, style: 'italic', size: 24, color: o.dark ? '#B8B0C8' : DQ.sepia, align: 'left', alpha: .9 * k, role: 'fine', bg: { col: o.dark ? (o.bg || '#1E1B22') : DQ.paper, alpha: .75, pad: [8, 4], r: 3 } });
}
// A quoted tweet (approved by Neel), on a paper slip at the top left: the words and the handle, no date.
function quoteCard(q, t, t0, o = {}) { if (q) refCard(`\u201C${q.text}\u201D \u2014 ${q.who}`, t, t0, o); }
// A paper slip with typewriter text, pinned at the top left. Long slips wrap.
function refCard(text, t, t0, o = {}) {
  if (!text || t < t0) return;
  const k = easeOut(seg(t, t0, t0 + .3)) * (o.fade ?? 1), x = o.x ?? 290, y = o.y ?? 58, w = o.w ?? 1080, size = o.size ?? 27;
  const lines = wrapText(text, { font: DQF.type, size }, w - 48), h = 24 + lines.length * size * 1.3;
  box2d(x, y - 12 * (1 - k), w, h, { fill: o.dark ? '#2C2836' : DQ.cream, stroke: o.dark ? '#5A5468' : DQ.sepia, sw: 1.5, r: 4, rot: o.rot ?? -.006, alpha: k, shadow: [5, 6, 'rgba(42,36,30,.18)'] });
  lines.forEach((s, i) => tx(s, x + 24, y + 12 + size * (1.05 + i * 1.3) - 12 * (1 - k), { font: DQF.type, size, color: o.dark ? '#E9E1F0' : DQ.ink, align: 'left', alpha: k, role: 'label' }));
}
function wrapText(s, st, maxW) {
  const words = s.split(' '), out = []; let cur = '';
  for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (measure(nx, st).w > maxW && cur) { out.push(cur); cur = w; } else cur = nx; }
  if (cur) out.push(cur);
  return out;
}
// a tweet in the house style: handle, date, text; no platform logo
function tweetCard(x, y, w, handle, date, text, t, t0, o = {}) {
  if (t < t0) return;
  const k = easeOut(seg(t, t0, t0 + .35)), size = o.size ?? 38, lines = wrapText(text, { font: DQF.soft, size }, w - 80), h = 130 + (lines.length + (o.extraLines || 0)) * size * 1.32;   // extraLines: room for text written in later
  box2d(x, y + 20 * (1 - k), w, h, { fill: '#FFFDF7', stroke: DQ.ink, sw: 3, r: 22, alpha: k, shadow: [10, 12, 'rgba(42,36,30,.22)'], rot: o.rot ?? -.01 });
  dot2d(x + 70, y + 66 + 20 * (1 - k), 30, { fill: DQ.indigo, alpha: k });
  tx(handle, x + 120, y + 60 + 20 * (1 - k), { font: DQF.soft, weight: 700, size: 32, color: DQ.ink, align: 'left', alpha: k, role: 'label' });
  tx(date, x + 120, y + 96 + 20 * (1 - k), { font: DQF.soft, size: 26, color: DQ.sepia, align: 'left', alpha: k, role: 'label' });
  lines.forEach((s, i) => tx(s, x + 40, y + 160 + i * size * 1.32 + 20 * (1 - k), { font: DQF.soft, size, color: DQ.ink, align: 'left', alpha: k, role: 'label' }));
  return h;
}
// a K-pop member profile card with a joke POSITION (the reference's device), popping in at t0
function kpopCard(x, y, name, pos, note, t, t0, o = {}) {
  if (t < t0) return;
  const k = backOut(seg(t, t0, t0 + .3)), w = o.w ?? 440, h = note ? 176 : 132, r = o.rot ?? .025;
  box2d(x, y, w, h, { fill: '#FFF7E6', stroke: DQ.ink, sw: 3, r: 16, rot: r, alpha: clamp(k), shadow: [8, 10, 'rgba(0,0,0,.15)'] });
  box2d(x + 18, y + 18, 70, 70, { fill: o.photo || DQ.indigo, r: 35, rot: r, alpha: clamp(k) });
  mono(name, x + 104, y + 52, { size: o.size ?? 28, alpha: clamp(k) });
  mono(`POSITION: ${pos}`, x + 104, y + 92, { size: 26, alpha: clamp(k), col: DQ.verm });
  if (note) note2(note, x + 24, y + 146, { size: 30, alpha: clamp(k) });
}
const note2 = (s, x, y, o) => tx(s, x, y, { font: DQF.hand, size: o.size, color: o.col || DQ.sepia, align: 'left', alpha: o.alpha ?? 1, role: 'label' });
// a small credit line, bottom right (the redraw credit)
function credit(s, o = {}) { tx(s, 1880, 1048, { font: DQF.soft, style: 'italic', size: 22, color: o.dark ? '#B8B0C8' : DQ.sepia, align: 'right', role: 'fine', alpha: o.alpha ?? .9 }); }
// the page number, bottom right corner of the page (an easter-egg slot)
function pageNo(s, o = {}) { tx(`p. ${s}`, 1860, 1010, { font: DQF.hand, size: 40, color: o.dark ? '#B8B0C8' : DQ.sepia, align: 'right', role: 'fine', bg: o.dark ? undefined : { col: DQ.paper, alpha: .85, pad: [10, 2], r: 4 } }); }

// ---------- pencil sketching on the 2D layer (board drawings) ----------
const PENCIL = '#5B5650';
function pen(pts, o = {}) { inkPath2d(pts, { col: o.col || PENCIL, sw: o.sw ?? 3, j: o.j ?? 1.2, alpha: o.alpha, close: o.close, fill: o.fill }); }
function penRect(x, y, w, h, o = {}) { pen([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { ...o, close: true }); }
function penEll(cx, cy, rx, ry, o = {}) { pen(ell2d(cx, cy, rx, ry, o.rot || 0, o.n || 28, o.j ?? .8), { ...o, close: true }); }
function penArrow(x0, y0, x1, y1, o = {}) {
  const a = Math.atan2(y1 - y0, x1 - x0), h = o.head ?? 22;
  pen([[x0, y0], [x1, y1]], o); pen([[x1 + Math.cos(a + 2.6) * h, y1 + Math.sin(a + 2.6) * h], [x1, y1], [x1 + Math.cos(a - 2.6) * h, y1 + Math.sin(a - 2.6) * h]], o);
}
function note(s, x, y, o = {}) { tx(s, x, y, { font: DQF.hand, size: o.size ?? 44, color: o.col || DQ.sepia, align: o.align || 'left', rot: o.rot || 0, alpha: o.alpha ?? 1, role: o.role || 'label', bg: o.bg, reveal: o.reveal }); }
function mono(s, x, y, o = {}) { tx(s, x, y, { font: DQF.type, size: o.size ?? 30, color: o.col || DQ.ink, align: o.align || 'left', alpha: o.alpha ?? 1, role: o.role || 'label', bg: o.bg, reveal: o.reveal }); }
function serif(s, x, y, o = {}) { tx(s, x, y, { font: DQF.serif, size: o.size ?? 60, color: o.col || DQ.ink, align: o.align || 'center', style: o.style, alpha: o.alpha ?? 1, role: o.role || 'label', stroke: o.stroke, sw: o.sw, reveal: o.reveal }); }
// a dark page (2020, the ocean) drawn crisp: background + faint grid
function darkPage(col = '#1E1B22', grid = '#3A3644') {
  queue2d(c => {
    c.fillStyle = col; c.fillRect(0, 0, W, H); c.strokeStyle = grid; c.globalAlpha = .45; c.lineWidth = 1;
    for (let x = 0; x <= W; x += 36) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y <= H; y += 36) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.globalAlpha = .5; c.strokeStyle = DQ.margin; c.lineWidth = 2; c.beginPath(); c.moveTo(230, 0); c.lineTo(230, H); c.stroke(); c.globalAlpha = 1;
  }, { screen: true });
  flushLetters();
}

// ---------- the researcher (board version; the Naturalist: dark bob, round glasses, mustard cardigan) ----------
// (x, y) = between her feet on the ground; s = her height in px. o.face: 1 faces right, -1 left. o.pose:
//   'stand' arms down · 'lens' near arm raised holding the magnifier · 'sing' hands loosely together · 'sit' sitting on
//   the ground, knees up · 'hold' near arm out (o.hand = [x, y] world point it holds) · 'lean' leaning in, lens up
// o.noHand: skip the near hand (the caller draws it, e.g. gripHand for a close-up).
// o.back: three-quarter back view (we see her shoulder, ear and glasses arm). o.mouth 0..1 (singing).
function researcher(x, y, s, t, o = {}) {
  if (typeof NAT_ON !== 'undefined' && NAT_ON) return naturalist(x, y, s, t, o);   // the finished figure (dgq/naturalist.js)
  const f = o.face ?? 1, pose = o.pose || 'stand', sit = pose === 'sit', lean = pose === 'lean' ? .16 : 0;
  const breathe = 1 + .006 * Math.sin(t * 2.2);
  const hip = sit ? [x, y - s * .2] : [x, y - s * .44], sh = [x + f * s * lean * .5, (sit ? y - s * .55 : y - s * .78) * breathe + y * (1 - breathe)];
  const head = [sh[0] + f * s * (.02 + lean * .45), sh[1] - s * .13];
  const hr = s * .075, cw = s * .17, skin = '#F1C9A5', card = DQ.mustard, trou = '#3A3530', hair = '#2A2220';
  boilSeed('res' + x);
  // legs
  if (sit) {
    for (const k of [-1, 1]) { const kx = x + f * s * .18 + k * s * .03; paint(ribbon([[x + k * s * .04, y - s * .2], [kx, y - s * .38], [kx + f * s * .1, y - s * .02]], s * .075, s * .06), { wash: trou, ink: PENCIL, sw: .6 }); }
  } else {
    const st = o.step ?? 0;
    for (const k of [-1, 1]) paint(ribbon([[x + k * s * .045, hip[1] + s * .02], [x + k * s * (.05 + .02 * st), y - s * .03]], s * .085, s * .07), { wash: trou, ink: PENCIL, sw: .6 });
    for (const k of [-1, 1]) paint(ellPts(x + k * s * .05 + f * s * .02, y - s * .015, s * .05, s * .022, 12), { wash: '#6B4A33', ink: PENCIL, sw: .5 });
  }
  // the cardigan: oversized, hem below the hip
  const hem = sit ? y - s * .16 : y - s * .38;
  paint([[sh[0] - cw, sh[1] + s * .02], [sh[0] + cw, sh[1] + s * .02], [hip[0] + cw * 1.08, hem], [hip[0] - cw * 1.08, hem]],
    { wash: card, fill: '#B9852A', fillOp: 70, bleed: .08, tex: .5, ink: PENCIL, sw: .7, curv: .3 });
  pen([[hip[0] - cw * 1.02, hem - s * .025], [hip[0] + cw * 1.02, hem - s * .025]], { col: '#9C7024', sw: 2 });
  if (!o.back) pen([[sh[0] + f * cw * .1, sh[1] + s * .03], [hip[0] + f * cw * .05, hem]], { col: '#9C7024', sw: 2 });   // the button line
  // arms: shoulder -> elbow -> hand, by pose
  const shN = [sh[0] + f * cw * .85, sh[1] + s * .05], shF = [sh[0] - f * cw * .85, sh[1] + s * .05];
  const hands = {
    stand: [[shN[0] + f * s * .02, sh[1] + s * .34], [shF[0] - f * s * .02, sh[1] + s * .34]],
    sing: [[sh[0] + f * s * .08, sh[1] + s * .27], [sh[0] + f * s * .02, sh[1] + s * .29]],
    lens: [[head[0] + f * s * .2, head[1] + s * .06], [shF[0] - f * s * .01, sh[1] + s * .34]],
    lean: [[head[0] + f * s * .22, head[1] + s * .12], [sh[0] + f * s * .1, sh[1] + s * .3]],
    hold: [o.hand || [shN[0] + f * s * .3, sh[1] + s * .12], [shF[0] - f * s * .01, sh[1] + s * .34]],
    sit: [[x + f * s * .2, y - s * .36], [x + f * s * .13, y - s * .33]],
  }[pose] || [[shN[0], sh[1] + s * .34], [shF[0], sh[1] + s * .34]];
  const arm = (s0, hd, front) => {
    const el = [lerp(s0[0], hd[0], .5) + (front ? f : -f) * s * .03, lerp(s0[1], hd[1], .5) + s * .05];
    paint(ribbon([s0, el, hd], s * .075, s * .06), { wash: card, ink: PENCIL, sw: .6 });
    if (front && o.noHand) return;   // the caller draws this hand (the hook's close-up fist on the lens handle)
    paint(ellPts(hd[0], hd[1], s * .022, s * .026, Math.max(10, Math.round(s / 40))), { wash: skin, ink: PENCIL, sw: .5, curv: s > 400 ? .5 : 0 });
  };
  arm(shF, hands[1], false);
  // neck, head, hair (a bob: a dark cap that falls to the jaw), glasses
  paint(rectPts(head[0] - s * .02, head[1] + hr * .6, s * .04, s * .06), { wash: skin, ink: null });
  paint(ellPts(head[0], head[1], hr * .92, hr * 1.06, 18), { wash: skin, ink: PENCIL, sw: .6 });
  const hairPts = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; hairPts.push([head[0] + Math.cos(a) * hr * 1.2, head[1] - hr * .1 + Math.sin(a) * hr * 1.22]); }
  if (o.back) {   // three-quarter back: hair over the crown and the back of the head; the cheek and ear on her facing side show
    // (mirrored for f < 0: the arc then runs right to left, and the outline continues from her facing side)
    if (f < 0) hairPts.reverse();
    for (const [u, v] of [[.98, .05], [.42, .38], [.3, .98], [-.4, 1.0], [-1.18, .78]]) hairPts.push([head[0] + u * f * hr, head[1] + v * hr]);
  }
  else { hairPts.push([head[0] + hr * 1.2, head[1] + hr * .8], [head[0] + f * hr * .55, head[1] + hr * .55], [head[0] + f * hr * .45, head[1] - hr * .35], [head[0] - f * hr * .3, head[1] - hr * .55], [head[0] - hr * 1.2, head[1] + hr * .8]); }
  paint(hairPts, { wash: hair, ink: null, curv: .4 });
  if (o.hat === 'deerstalker') {
    paint(ellPts(head[0], head[1] - hr * .55, hr * 1.25, hr * .85, 18), { wash: '#8C6B45', fill: '#6E5234', fillOp: 60, ink: PENCIL, sw: .6, hatch: { d: 6, a: .8, b: 'HB', c: '#4A3826', w: .6 } });
    paint([[head[0] + f * hr * .9, head[1] - hr * .55], [head[0] + f * hr * 1.9, head[1] - hr * .35], [head[0] + f * hr * .9, head[1] - hr * .2]], { wash: '#8C6B45', ink: PENCIL, sw: .5 });
    paint([[head[0] - f * hr * .9, head[1] - hr * .55], [head[0] - f * hr * 1.8, head[1] - hr * .3], [head[0] - f * hr * .9, head[1] - hr * .15]], { wash: '#8C6B45', ink: PENCIL, sw: .5 });
  }
  if (o.back) {   // three-quarter back: the glasses' arm and the lens rim at the cheek edge, an ear
    pen([[head[0] + f * hr * .35, head[1] + hr * .12], [head[0] + f * hr * .98, head[1] + hr * .02]], { col: '#1A1614', sw: Math.max(1.5, s * .005) });
    penEll(head[0] + f * hr * 1.0, head[1] + hr * .08, hr * .12, hr * .26, { col: '#1A1614', sw: Math.max(1.5, s * .005) });
    paint(ellPts(head[0] + f * hr * .5, head[1] + hr * .3, hr * .15, hr * .22, 10), { wash: skin, ink: PENCIL, sw: .4 });
    paint(ellPts(head[0] + f * hr * .78, head[1] + hr * .5, hr * .14, hr * .08, 8), { wash: '#E8A28A', ink: null });
  } else {
    const gx = head[0] + f * hr * .35, gy = head[1] + hr * .05;
    for (const d of [-.42, .42]) penEll(gx + d * hr, gy, hr * .3, hr * .28, { col: '#1A1614', sw: Math.max(1.5, s * .005) });
    if (o.mouth) penEll(gx + f * hr * .05, head[1] + hr * .6, hr * .14, hr * (.04 + .12 * o.mouth), { col: '#7A3A2A', sw: 2, fill: '#7A3A2A' });
  }
  arm(shN, hands[0], true);
  if (pose === 'lens' || pose === 'lean') { const [lx, ly] = hands[0]; magnifier(lx + f * s * .06, ly - s * .07, s * .07, { part: 'rim' }); }
  return { head, hands };
}

// ---------- the creature and the chorus framing, by growth g ----------
// Neel (2 Oct): "I want it to be growing a lot between scenes. Towards the end, the researcher should be clearly small,
// and the shoggoth is still going off screen ... at the beginning there should be a rapid sense of growth and the
// shoggoth growing faster than the researcher can keep up with." So each chorus is framed from further back: the
// researcher shrinks on screen while the creature keeps growing, until its top runs off the frame (chorus 4) and, in the
// final chorus, we look down into the ring fortress with her tiny at the lower left.
// Keys: [g, creature radius s, creature x, ground y, researcher height, researcher x, researcher ground y]
const VISIT_KEYS = [
  [0.30, 105, 1450, 800, 640, 1060, 1080],
  [0.75, 175, 1450, 800, 640, 1040, 1080],
  [1.20, 270, 1440, 820, 620, 1000, 1080],
  [1.60, 340, 1420, 1010, 560, 980, 1080],
  [2.30, 440, 1420, 1035, 500, 970, 1080],
  [2.50, 480, 1430, 1050, 420, 1000, 1078],
  [3.00, 570, 1440, 1070, 380, 990, 1076],
  [3.10, 640, 1450, 1100, 300, 1000, 1074],
  [3.90, 760, 1460, 1120, 260, 980, 1074],
  [3.95, 610, 1320, 860, 160, 250, 1040],
  [5.00, 650, 1320, 860, 150, 250, 1040],
];
function visitLayout(g) {
  const K = VISIT_KEYS; let i = 0; while (i + 1 < K.length && g > K[i + 1][0]) i++;
  const [a, b] = [K[i], K[Math.min(i + 1, K.length - 1)]], q = b[0] > a[0] ? clamp((g - a[0]) / (b[0] - a[0])) : 0, L = k => lerp(a[k], b[k], ease(q));
  return { s: L(1), cx: L(2), gy: L(3), rh: L(4), rx: L(5), ry: L(6) };
}
function creatureSize(g) { return visitLayout(g).s; }
// The containers it outgrows in chorus 1: a fixed-size petri dish, then the jar she fetches (o.jar 0..1 brings it in),
// which it outgrows too (o.crack 0..1). They don't grow with it: it bulges over their rims.
const DISH_RX = 175, JAR = { w: 330, h: 380 };
function creature(x, y, g, t, o = {}) {
  const s = (o.s ?? creatureSize(g)) * (o.scale ?? 1), dish = o.dish ?? g < 1.4, jar = o.jar ?? 0;
  if (dish) petriDishBack(x, y + 14, Math.max(DISH_RX, s * (jar > .5 ? 0 : 0)));
  if (jar > 0) jarBack(x, y, jar);
  shoggoth(x, y, s, g, t, { seed: 3, ...o });
  if (dish) petriDishFront(x, y + 14, DISH_RX);
  if (jar > 0) jarFront(x, y, jar, o.crack ?? 0, s);
  return s;
}
// The bell jar she lowers over it in chorus 1 (k 0..1: lowered from above), which it then outgrows (crack 0..1).
function jarBack(x, y, k) {
  const dy = -(1 - ease(k)) * 520, w = JAR.w, h = JAR.h;
  paint(bellPts(x, y + dy, w, h), { wash: '#D8E9E6', washOp: 60, ink: null });
}
function jarFront(x, y, k, crack, s) {
  const dy = -(1 - ease(k)) * 520, w = JAR.w, h = JAR.h, P = bellPts(x, y + dy, w, h);
  inkPath2d(P, { col: '#FFFFFF', sw: 9, close: true, j: .6, alpha: .45 });   // glass catches the light
  inkPath2d(P, { col: DQ.ink, sw: 3.4, close: true, j: .6, alpha: .9 });
  paint(ellPts(x, y + dy - h - 18, 22, 18, 12), { wash: DQ.brass, ink: DQ.brassDk, sw: .7 });   // the knob
  inkPath2d([[x - w * .32, y + dy - h * .75], [x - w * .38, y + dy - h * .3]], { col: '#FFFFFF', sw: 7, alpha: .6 });
  if (crack > 0) {   // it outgrows the jar too: cracks run down from the crown
    const C = [[x + w * .05, y + dy - h], [x + w * .12, y + dy - h * .78], [x + w * .03, y + dy - h * .62], [x + w * .14, y + dy - h * .42], [x + w * .08, y + dy - h * .2]];
    inkPath2d(C.slice(0, 1 + Math.ceil(4 * crack)), { col: DQ.ink, sw: 2.6, j: .4 });
    inkPath2d([[x - w * .02, y + dy - h * .95], [x - w * .18, y + dy - h * .8 * (1 - .3 * crack)], [x - w * .26, y + dy - h * .62]].slice(0, 1 + Math.ceil(2 * crack)), { col: DQ.ink, sw: 2, j: .4 });
  }
}
function bellPts(x, y, w, h) {   // a bell jar: straight sides, a domed crown
  const P = [[x - w / 2, y + 16], [x - w / 2, y - h * .45]];
  for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI; P.push([x + Math.cos(a) * w / 2, y - h * .45 + Math.sin(a) * h * .55]); }
  P.push([x + w / 2, y + 16]);
  return P;
}

// ---------- the chorus motif: "the visit" ----------
// The same composition every chorus (creature right, researcher three-quarter back singing to it, big lyric left, the
// specimen tag), framed by visitLayout(g). o.look ('res' = at her), o.res (researcher overrides), o.jar / o.crack.
function visit(t, g, o = {}) {
  const V = visitLayout(g);
  const sWall = V.s; if (o.grow) V.s *= o.grow;   // FC5: it keeps growing past the walls (the walls stay put)
  notebookPage({ ring: o.ring ?? (g < 3.9 ? [1720, 300, 90, .25] : false) });
  if (g < 1.4) benchSet(V, t, o); else if (g < 3.05) studySet(V, t, o);
  const look = o.look === 'res' ? [V.rx + 40, V.ry - V.rh * .88] : o.look;
  const ring = g >= 3.9 ? { rx: Math.min(1050, sWall * 1.55), ry: Math.min(1050, sWall * 1.55) * .2, wh: sWall * .3 } : undefined;
  creature(V.cx, V.gy, g, t, { s: V.s, look, stare: o.stare, wave: o.wave, blinkAll: o.blinkAll, wake: o.wake, jar: o.jar, crack: o.crack, crush: o.crush, ring });
  if (o.res !== false) researcher(V.rx, V.ry, V.rh, t, { pose: 'sing', back: true, face: 1, ...(o.res || {}) });
  if (g >= 3.05 && g < 3.9) nightSet(V, t);   // chorus 4: late, by lantern light
  // the specimen tag (count rewritten as it grows); by the fortress it is pinned to the gate post
  const nE = Math.floor(SHOG.nEyes(g));
  if (o.tag !== false && g < 3.9) {
    const lines = [`SPECIMEN No. ${specimenNo(g)}`, `eyes: ${nE}`, `understood: ${understood(g)}`];
    const tw = Math.max(270, ...lines.map(l => measure(l.s || l, { font: DQF.type, size: l.size || 24 }).w + 24 * 1.05 + 18));   // wide enough for "understood: a little"
    const late = g >= 3.05, tx0 = late ? 300 : Math.min(1590, V.cx + V.s * .9, W - 56 - tw), ty0 = late ? 790 : 380;   // late: clear of its face, on the open page
    specimenTag(tx0, ty0, lines, { size: 24, w: tw, string: [late ? [tx0 - 30, ty0 - 90] : [V.cx + V.s * .3, V.gy - V.s * 1.1]] });
  }
  // the fortress: the tag is pinned to the wall by the gate. 144 eyes, GPT-2 Small's 12 x 12 heads, every one of which
  // Neel's MATS team inspected with attention SAEs (reference bank r2 T82); SHOG.nEyes stops at 144
  if (o.tag !== false && g >= 3.95) specimenTag(1000, 836, [`SPECIMEN No. ${specimenNo(g)}`, `eyes: ${nE}`, 'understood:'], { size: 22, w: 236, string: [[992, 812]] });
  return V;
}
// Chorus 1's set: her workbench at waist height, the anglepoise from the 2020 page clamped to it and lit over the dish;
// in C1d the dishes it has outgrown, labelled in wax pencil like A Mathematical Framework's toy models: 0L, 1L, 2L
// (zero-, one- and two-layer attention-only transformers; reference bank C1d-1).
function benchSet(V, t, o = {}) {
  const by = V.gy + 30, x0 = 1150, wood = { wash: '#C99F70', fill: '#8E6A44', fillOp: 45, bleed: .005, tex: .55, ink: DQ.ink, sw: .45 };   // (a big bleed hazes the page around it)
  // the floor: a soft wash fading out to the left, and on it a stack of books with the 2022 pocket watch on top (V1d's)
  queue2d(c => { const g = c.createLinearGradient(0, H - 150, 0, H), g2 = c.createLinearGradient(160, 0, 700, 0); c.save();
    g.addColorStop(0, 'rgba(170,130,80,0)'); g.addColorStop(1, 'rgba(170,130,80,.26)'); c.fillStyle = g; c.fillRect(160, H - 150, W, 150);
    g2.addColorStop(0, 'rgba(242,232,210,1)'); g2.addColorStop(1, 'rgba(242,232,210,0)'); c.fillStyle = g2; c.fillRect(150, H - 150, 560, 150); c.restore(); }, { screen: true });
  flushLetters();
  const bk = [[300, 168, 44, '#5B6E4A'], [312, 150, 38, '#8A3A2E'], [304, 158, 34, '#2E3A66']];
  let yb = H - 8;
  // the bottom book: yellow, LINEAR ALGEBRA DONE RIGHT on its spine, the first prerequisite in Neel's getting-started
  // guide, under everything (reference bank r2 T129; Neel picked it, 3 Oct: "linear algebra done right, not linear algebra")
  bk.forEach(([x, w, h, col], k) => { if (k === 0) col = '#D6AE3A'; yb -= h; paint(rectPts(x, yb, w, h), { wash: col, fill: mixCol(col, '#000000', .3), fillOp: 50, bleed: .04, tex: .5, ink: DQ.ink, sw: .4 }); if (k) inkLine([[x + 10, yb + h * .3], [x + w - 10, yb + h * .3]], .25, mixCol(col, '#F2E8D2', .5));
    if (k === 0) laSpine(x + w / 2, yb + h / 2, 1); });
  paint(ellPts(392, yb - 12, 52, 15, 24), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 60, ink: DQ.ink, sw: .4 });   // the watch, lying flat
  paint(ellPts(392, yb - 14, 40, 10, 20), { wash: '#FBF4E4', ink: DQ.brassDk, sw: .3 });
  inkLine([[440, yb - 10], [480, yb + 4], [470, yb + 40], [490, H - 6]], .35, DQ.brassDk);   // its chain, over the edge
  for (const lx of [1205, 1850]) paint(rectPts(lx - 17, by + 30, 34, H - by + 20), { ...wood, wash: '#B48A5C' });   // legs
  paint(rectPts(1205, by + 190, 650, 22), { ...wood, wash: '#B48A5C' });   // the stretcher
  paint([[x0, by], [W + 60, by], [W + 60, by + 34], [x0 + 4, by + 34]], wood);   // the top
  for (const [y0, a] of [[by + 11, .5], [by + 23, .35]]) inkLine([[x0 + 30, y0], [x0 + 300, y0 + 2], [x0 + 700, y0 - 1], [W, y0 + 1]], .3, '#6E5034');   // grain
  // the lamp, clamped at the back of the bench, aimed at the dish
  const lx = 1330, ly = by - 430, ang = Math.atan2(V.gy - V.s * .9 - ly, V.cx - lx);
  anglepoise([[1262, by + 6], [1236, by - 300]], lx, ly, ang, 1, { pool: [V.cx, V.gy - V.s * .3, 260], cone: .12, poolA: .22 });
  paint(rectPts(1240, by - 10, 44, 16), { wash: '#4A3C26', ink: DQ.ink, sw: .35 });   // its clamp
  if (o.discards) for (let k = 0; k < o.discards; k++) {
    const dx = 1690 + k * 92, dy = by - 12;
    petriDishBack(dx, dy, 38); petriDishFront(dx, dy, 38);
    note(`${k}L`, dx, dy - 18, { size: 26, col: DQ.verm, align: 'center', role: 'fine', rot: -.08 });
  }
}
// Choruses 2 and 3's set: it has outgrown the bench, so it sits on the study floor. A floor wash, soft contact shadows,
// and on the floor by her the things it outgrew and she kept: chorus 1's petri dishes, stacked, and the books with the
// pocket watch (scaled to her: the camera is further back each chorus).
function studySet(V, t, o = {}) {
  const k = V.rh / 640, fy = V.ry;
  queue2d(c => {
    const g = c.createLinearGradient(0, fy - 190 * k - 60, 0, H); g.addColorStop(0, 'rgba(170,130,80,0)'); g.addColorStop(1, 'rgba(170,130,80,.22)'); c.fillStyle = g; c.fillRect(0, fy - 190 * k - 60, W, H);
    const sh = (x, y, rx, ry, a) => { c.save(); c.translate(x, y); c.scale(1, ry / rx); const r = c.createRadialGradient(0, 0, 0, 0, 0, rx); r.addColorStop(0, `rgba(60,40,20,${a})`); r.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = r; c.fillRect(-rx, -rx, 2 * rx, 2 * rx); c.restore(); };
    sh(V.cx, V.gy + 8, V.s * 1.4, V.s * .16, .3); sh(V.rx, fy - 4, V.rh * .2, V.rh * .035, .35);
  }, { screen: true });
  flushLetters();
  // the dishes it outgrew in chorus 1, stacked on the floor by the books (where the bell jar stood; Neel cut the jar)
  const jx = V.rx - 300 * k;
  for (let d = 0; d < 3; d++) { const dy = fy - 6 * k - d * 13 * k, r = 46 * k * (1 - d * .06); petriDishBack(jx, dy, r); petriDishFront(jx, dy, r); }
  // the books and the watch
  const bx = V.rx - 520 * k; let yb = fy - 6;
  [[0, 168, 44, '#D6AE3A'], [12, 150, 38, '#8A3A2E'], [4, 158, 34, '#2E3A66']].forEach(([dx, w, h, col], i) => { yb -= h * k; paint(rectPts(bx + dx * k, yb, w * k, h * k), { wash: col, fill: mixCol(col, '#000000', .3), fillOp: 50, bleed: .01, tex: .5, ink: DQ.ink, sw: .35 }); if (!i) laSpine(bx + (dx + w / 2) * k, yb + h * k / 2, k); });   // the same books (the yellow one is the chorus-1 bench's)
  paint(ellPts(bx + 92 * k, yb - 12 * k, 52 * k, 15 * k, 24), { wash: DQ.brass, fill: DQ.brassDk, fillOp: 60, ink: DQ.ink, sw: .35 });
  paint(ellPts(bx + 92 * k, yb - 14 * k, 40 * k, 10 * k, 20), { wash: '#FBF4E4', ink: DQ.brassDk, sw: .3 });
  d20(bx - 46 * k, fy - 25 * k, 24 * k);
  hydraJar(bx - 128 * k, fy - 4 * k, k, t);   // the Hydra effect: cut a part off and it keeps going (reference bank r3 pick 1)   // beside the books: the watch's mod-113 clock is one group, the icosahedron's
  // rotations (A5) another, and which circuit a network learns for its group is down to the seed (A Toy Model of
  // Universality, Neel last author; reference bank r2 T112)
}
// the spine of the bottom book (centre x, y; scale k): LINEAR ALGEBRA / DONE RIGHT in two lines
function laSpine(x, y, k) {
  tx('LINEAR ALGEBRA', x, y - 2 * k, { font: DQF.type, size: 15 * k, color: '#3A2E10', role: 'fine' });
  tx('DONE RIGHT', x, y + 14 * k, { font: DQF.type, size: 15 * k, color: '#3A2E10', role: 'fine' });
}
// A specimen jar with a freshwater hydra in it: a stalk on its foot, a crown of six tentacles, one a short stub growing
// back. The Hydra effect (McGrath et al., Jul 2023): ablate one attention layer and another compensates; and Neel's
// Explorations of Self-Repair (Rushing & Nanda, Feb 2024). The animal is named for the myth because "when the animal has a
// part severed, it will regenerate much like the mythical Hydra's heads". (x, y): the jar's foot; k: the floor's scale.
function hydraJar(x, y, k, t) {
  const w = 46 * k, h = 78 * k, top = y - h;
  paint(rrPts(x - w / 2, top, w, h, 8 * k), { wash: '#DCEBE6', washOp: 120, ink: DQ.sepia, sw: .35 });   // the glass, water inside
  paint(rectPts(x - w / 2 - 3 * k, top - 9 * k, w + 6 * k, 11 * k), { wash: '#B48A5C', fill: '#8E6A44', fillOp: 40, ink: DQ.ink, sw: .3 });   // its cork
  queue2d(c => {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const bx = x, by = y - 7 * k, hx = x + 2 * k, hy = y - 46 * k, sway = Math.sin(t * 1.3) * 2 * k;
    c.strokeStyle = '#7A8A4A'; c.lineWidth = Math.max(2, 4.5 * k);   // the stalk, from its foot
    c.beginPath(); c.moveTo(bx - 2 * k, by); c.quadraticCurveTo(bx - 4 * k, (by + hy) / 2, hx + sway * .5, hy); c.stroke();
    c.lineWidth = Math.max(1.2, 1.8 * k);   // the tentacles: six, the last a stub growing back
    [[-1.1, 1], [-.65, 1], [-.2, 1], [.25, 1], [.7, 1], [1.12, .32]].forEach(([a, len], i) => {
      const L = 20 * k * len, ex = hx + Math.sin(a) * L + sway, ey = hy - Math.cos(a) * L;
      c.beginPath(); c.moveTo(hx + sway * .5, hy); c.quadraticCurveTo(hx + Math.sin(a) * L * .6 + sway + Math.sin(t * 2 + i) * k, hy - Math.cos(a) * L * .45, ex, ey); c.stroke();
    });
    c.fillStyle = '#93A35A'; c.beginPath(); c.ellipse(hx + sway * .5, hy + 1 * k, 3.4 * k, 2.6 * k, 0, 0, TAU); c.fill();   // its mouth, in the crown
    c.globalAlpha = .7; c.strokeStyle = '#FFFFFF'; c.lineWidth = Math.max(1.2, 2.4 * k);   // the glass catches the light
    c.beginPath(); c.moveTo(x - w * .32, top + h * .18); c.lineTo(x - w * .32, top + h * .62); c.stroke();
    c.restore();
  });
}
// a twenty-sided die, resting on a face: the hexagonal silhouette, the top triangle and the facets fanning from it
function d20(x, y, r) {
  const P = []; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  paint(P, { wash: '#9C3B32', fill: '#6E2620', fillOp: 45, bleed: .005, tex: .4, ink: DQ.ink, sw: .35 });
  const T = [[x, y - r * .55], [x + r * .48, y + r * .28], [x - r * .48, y + r * .28]];
  paint(T, { wash: '#B9584C', ink: null });
  queue2d(c => {
    c.save(); c.strokeStyle = DQ.ink; c.lineWidth = Math.max(1, r * .07); c.lineJoin = 'round';
    c.beginPath(); c.moveTo(T[0][0], T[0][1]); c.lineTo(T[1][0], T[1][1]); c.lineTo(T[2][0], T[2][1]); c.closePath(); c.stroke();
    for (const [a, b] of [[T[0], P[0]], [T[0], P[1]], [T[0], P[5]], [T[1], P[1]], [T[1], P[2]], [T[1], P[3]], [T[2], P[3]], [T[2], P[4]], [T[2], P[5]]]) { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    c.fillStyle = '#F3E7D3'; c.font = `700 ${r * .42}px "${FONT.cmuTT}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('20', x, y + r * .02);
    c.restore();
  });
}
// Chorus 4's set: late at night, keeping it company. A lantern on the floor beside her; everything away from it falls
// into a deep blue (a multiply grade, as V1b), and the lantern lights her and the creature's flank warm.
function nightSet(V, t) {
  const k = V.rh / 280, lx = V.rx + 70 * k, ly = V.ry - 4, flick = 1 + .04 * Math.sin(t * 13) + .03 * Math.sin(t * 7.3);
  // the lantern: a brass cap and base, glass sides, a flame
  paint(rectPts(lx - 20 * k, ly - 10 * k, 40 * k, 10 * k), { wash: DQ.brass, ink: DQ.ink, sw: .3 });
  paint([[lx - 16 * k, ly - 10 * k], [lx + 16 * k, ly - 10 * k], [lx + 14 * k, ly - 52 * k], [lx - 14 * k, ly - 52 * k]], { wash: '#FFE6A8', washOp: 220, ink: DQ.ink, sw: .3 });
  paint([[lx - 18 * k, ly - 52 * k], [lx + 18 * k, ly - 52 * k], [lx, ly - 66 * k]], { wash: DQ.brass, ink: DQ.ink, sw: .3 });
  inkLine([[lx - 9 * k, ly - 66 * k], [lx - 12 * k, ly - 82 * k], [lx + 12 * k, ly - 82 * k], [lx + 9 * k, ly - 66 * k]], .3, DQ.brassDk);   // its handle
  paint(ellPts(lx, ly - 28 * k, 5 * k * flick, 11 * k * flick, 10), { wash: '#FFFFFF', fill: '#F6B03C', fillOp: 80, ink: null });
  // IF THIS THEN THAT 2026-10-03T-camE-grade: final_c4.js camEGrade copies these stops, radii and flicker; change them together.
  blendLayer(c => {
    const g = c.createRadialGradient(lx, ly - 30 * k, 20 * k, lx, ly - 30 * k, 900 * k * flick);
    g.addColorStop(0, 'rgba(255,240,214,1)'); g.addColorStop(.18, 'rgba(236,206,172,1)'); g.addColorStop(.5, 'rgba(120,112,150,1)'); g.addColorStop(1, 'rgba(52,54,92,1)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  });
  warmLight(lx, ly - 30 * k, 260 * k * flick, .45);
}
// The specimen number goes up every chorus (Neel, 3 Oct): each chorus is a new model. The hook's toy is No. 1.
const specimenNo = g => g < 1.4 ? 2 : g < 2.6 ? 3 : g < 3.2 ? 4 : g < 3.9 ? 5 : 6;   // the fortress is No. 6 (it read 5, the same as chorus 4)
// the field note on the tag that gets worse every chorus (handwritten, qualitative: no fake numbers)
const understood = g => g < 1.2 ? 'mostly' : g < 2.4 ? 'some' : g < 3.05 ? 'a little' : g < 4 ? '?' : '';
// A chorus's growth: one value for the whole chorus, bigger every chorus (Neel, 3 Oct: "bigger each time but not grow on
// screen"). The shot list (data/dgq_shots.js) holds it; the transition shots read it from the chorus they leave or enter.
function chorusG(sh) { return sh.g ? sh.g[0] : 0; }
// the onset of the shot's last word if it is "now" (the chorus's end), else just before the cut
function chorusNow(sh) {
  const line = shotLine(sh, sh.t1 - .01), w = line && line.words[line.words.length - 1];
  return w && /now/i.test(w.w) ? w.t0 : sh.t1 - .8;
}

// ---------- transitions ----------
// The lens iris (into every chorus): a brass rim sweeps in from the lower right and opens; outside it, plain paper.
// Call AFTER drawing the scene that shows through the glass. p 0..1.
function lensIris(p, o = {}) {
  const q = easeIn(clamp(p)), cx = lerp(1500, W / 2, ease(p)), cy = lerp(820, H / 2, ease(p)), R = lerp(120, 1250, q);
  flushLetters();
  queue2d(c => {
    c.save(); c.beginPath(); c.rect(-10, -10, W + 20, H + 20); c.arc(cx, cy, R, 0, TAU, true); c.fillStyle = o.out || DQ.paper; c.fill('evenodd');
    c.lineWidth = Math.max(10, R * .07); c.strokeStyle = DQ.brass; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
    c.lineWidth = Math.max(3, R * .02); c.strokeStyle = DQ.brassDk; c.beginPath(); c.arc(cx, cy, R + Math.max(10, R * .07) / 2, 0, TAU); c.stroke();
    if (o.crack) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + R * .1, cy - R * .2); c.lineTo(cx + R * .35, cy - R * .05); c.lineTo(cx + R * .55, cy - R * .32); c.moveTo(cx + R * .35, cy - R * .05); c.lineTo(cx + R * .42, cy + R * .3); c.stroke(); }
    c.restore();
  }, { screen: true });
}
// The page turn (into every verse): the live page turns over to reveal `next` (a riffle page: {draw(c), dark, year}).
function pageTurn(t, t0, dur, next, year) {
  return riffle(t, t0, [{ year, live: true }, { year, ...next }], { per: dur });
}

// ---------- the animatic slate ----------
const ANIMATIC = false;   // every shot is finished (3 Oct): no slate
// Finished shots register here (scenes/final_*.js: FINAL[id] = (sh, t) => opts); board() prefers them over the animatic's
// boards, so the whole video always renders, part finished and part board (video/treatment/production_plan.md).
const FINAL = {};
function slate(sh, t, o = {}) {
  if (!ANIMATIC) return;
  const s = `ANIMATIC  ${sh.id} · ${sh.sec} · ${sh.title}${sh.S ? '  · [S] performance: Seedance base → JS redraw' : ''}`;
  tx(s, 30, 34, { font: DQF.mono, size: 20, color: o.dark ? '#D8D2E8' : DQ.ink, align: 'left', alpha: .75, role: 'deco', bg: { col: o.dark ? '#0E0C10' : DQ.cream, alpha: .8, pad: [10, 6], r: 4 } });   // top left: the paper title has the bottom left
}
