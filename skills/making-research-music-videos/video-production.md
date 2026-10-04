# Stage 3b: Video production (after direction sign-off)

Once the commissioner approves the direction, "you're on your own until it's done" (the brief), though in practice
Neel kept sending notes, and the polish rounds are where most of the reference density arrives. The brief's standard
for this stage, verbatim (Donald Jewkes): "You need to be really rigorous in planning of composition and timing to
make sure this goes well. You also need to be open to going back and revisiting things in order to be able to
reiterate. You're going to want to watch the entire video multiple times, take screenshots at individual parts, and
think about if something is really up to the bar of quality that we need here."

## Contents
- [Start from the kit](#start-from-the-kit)
- [Architecture](#architecture)
- [Render modes and speed](#render-modes-and-speed)
- [Coding rules that prevented or caused real bugs](#coding-rules-that-prevented-or-caused-real-bugs)
- [QA loops](#qa-loops)
- [The notes rounds](#the-notes-rounds)
- [Parallel section forks: the protocol](#parallel-section-forks-the-protocol)
- [Left-out ideas as mocks (the main approval loop)](#left-out-ideas-as-mocks-the-main-approval-loop)
- [Density rules for the final cut](#density-rules-for-the-final-cut)
- [Common mistakes](#common-mistakes)
- [Cost and time](#cost-and-time)

---

## Start from the kit
Copy `video/kit/` into the new project (it is a fork of JohnHeibel/ClaudeAnimationBase, MIT; the base kit bans
on-screen text, which this fork overrides). In this file, paths starting `src/` or `out/` are inside `video/kit/`, and
`tools/` means the repo's top-level `tools/`. Keep `render.mjs`, `studio.html`, `src/core.js`, `timeline.js`,
`config.js`, `type.js`, the FINAL registry / HUD / lyric / card / `mock()` machinery in `src/dgq/board.js`, and
`src/dgq/styles.js`. Replace the characters and sets (`src/dgq/shoggoth.js`, `naturalist.js`, `props.js`, the
`scenes/final_*.js`) — read them as technique references only. Rename the `dgq` prefix to the new song's slug. Read
`video/kit/ANIMATION_GUIDE.md` and `video/kit/README.md` first.

**Do these on day one (they were impossible or costly to retrofit):**
1. **Make the kit resolution-independent**: one scale constant instead of 1920×1080 baked into every coordinate. A
   native 1440p/4K render was impossible; the upload was a lanczos upscale.
2. **Make `render.mjs` exit non-zero on any page error or missing global.** A broken data file silently rendered the
   fallback page for every frame.
3. **A pre-render/pre-commit check**: `node --check` on every source file, and write data strings through
   `json.dumps`, never by hand. One unescaped quote in the shot list broke every shot.

## Architecture
- p5 2.x (WEBGL canvas) + p5.brush 2.x for paint, a Canvas2D layer for text and fine linework, headless Chrome via
  puppeteer-core, ffmpeg. All scripts are classic `<script>` tags in `studio.html` = **one shared global scope**.
- **Every frame is a pure function of t.** Linework "boils" (reseeds) at 12 fps; each element gets `boilSeed(key)`;
  anything that must stay put uses `hash(i)`.
- **Song timing data**: `tools/song_js.py` bundles `beats.json` + `lyrics.json` into `src/data/song.js` (bpm, beats,
  downbeats, an RMS loudness envelope, every line with sung-word AND display-word timings aligned by difflib, so
  "P(doom)" or "34M" on screen still get times, and sections). `config.js` sets `lead: 1/24`: each frame shows t + one
  frame, so hits land up to a frame early, never late.
- **The shot list is the single source of truth** (`src/data/<slug>_shots.js`): per shot `id`, `sec`, `title`,
  `what`, `ly` (hero/big/caption/shout/card), `trans`, `card` (full citation, page only), `paper` (title only, small,
  bottom-left), `quote`, `S`, `g` (motif state; one value per chorus), `eggs` (each tied to its lyric). Cut times:
  `at: 'L<n>'` snaps to the beat at or just before line n's first sung word; `at` can be a number to override (moved a
  cut to a downbeat so a headline reference could hold ~1.5 s). `node tools/dump_shots.mjs` resolves everything to
  `shots.json`, which every page, the doc and the YouTube description read.
- **FINAL registry**: `board(sh,t,lt,dur)` prefers `FINAL[id]` over the rough `BOARDS[id]`, so the whole song always
  renders, part finished and part board. Each section file registers `FINAL.B3 = (sh,t) => {...; return {lyBox}}`.
- **Hit helpers** key motion to sung words and beats: `wT(line,/re/)` (onset of a word), `hitPulse`, `beatsIn`,
  `lineAt`, `loud(t)`, `YEAR_TICKS` (year changes, each on a sung word), `smoothKf` (monotone cubic; tested).
- **Type**: every `tx()` string is registered with a role — lyric (≥ 40 px), label (≥ 26 px), fine, deco — which powers
  `--textcheck`. Fonts vendored by `tools/fetch_fonts.py` (OFL), with a math fallback and a glyph-coverage test.
- **Real-data figures** (`tools/figures_js.py` → `src/figures.js`): each figure carries its honest `claim` and
  `credit`; e.g. the grokking curves came from a real mod-113 run. Harmful prompt text is never exported.

## Render modes and speed
`node render.mjs` with: `--sheet` (contact sheet at chosen times), `--strip` (every frame in a stretch), `--crop` /
`--crop-at` (follow a world point), `--stills` (full-res PNGs at exact t), `--clip`, `--frames --workers=5`
(parallel, resumable JPEGs; **delete a frame range to redo it** — stale frames otherwise survive), `--encode
--audio=<master.wav> --out=…` (x264 crf 17; **without `--audio` it silently makes a video with no sound**),
`--textcheck=a:b --step=.25`, `--style=B|C`, `--mock=key[,key]`, `--loop`. Frame index = round((t − 1/24)·24).
M4 Pro: 6,288 frames for 4:22; animatic ~6–7 min; dense final ~15–25 min; encode 1.5 min; a 300-frame section
re-render under 2 min. Full re-render plus checks per version: ~25–30 min.

## Coding rules that prevented or caused real bugs
- **Brace every gate**: `if (mock('k')) { … }`. An unbraced `if (…mock('r4_seahorse')) camOSeahorse(…);` inserted
  between an existing `if {…}` and its `else {…}` rebound the else and silently changed two shots with the switch OFF.
- **Never append a `//` comment mid-line** in long one-line functions; it swallowed `});` three times, once in a way
  that was still valid syntax (a pin silently vanished). Write multi-line code.
- **Unique name prefixes per author/fork** (`camD…`): one global scope, so a helper called `pop` shadowed p5's `pop()`.
- **Apply all edits in memory, then write once**: a multi-edit script wrote the file before a later assertion failed
  and deleted a section's boards.
- **p5.brush**: wash only or bleed ≤ .01 on big shapes (bleed hazes the page); fills silently fail on ~1500 px
  polygons, so clip big shapes to the viewport; call `flushLetters()` before brush paint that must sit on top of 2D work.
- **Catmull-Rom overshoot** dips limbs below floors; use J-shapes or monotone curves.
- **Literal characters** in edit scripts: match `’` vs `’`, `×`, em dashes exactly.

## QA loops
Run these on every version; delegate the long ones so the lead's context survives (render/check loops in the lead
drove four compactions in one day).
- **Per edit:** `node --check` all sources; sheets/strips/full-res crops at word times, viewed with Read.
- **`--textcheck`** over the whole song: overlaps, too-small text, missing glyphs, contrast, reading time. Assign text
  roles so by-design deco doesn't flood it (thousands of deco flags hid the real ones). It caught a caption band too
  short on dark backgrounds, a tag running off frame, a 2.97:1 contrast colon, a missing glyph, a quote card too brief.
- **Gemini eye** (`tools/gemini_eye.py`): a 640×360 12 fps proxy of the whole cut to Gemini 3.1 Pro, $0.07–0.09 and
  20–80 s per pass. ~26% of flags were real (lyric over a prop, a string through her face, a lens crowding an arm);
  the rest were mid-transition misreads of the low-res proxy. Treat flags as leads; check each against full-res stills
  in a window; name each run's output uniquely (it overwrote itself).
- **Frame-a-second read** of the encoded MP4: `ffmpeg -vf "fps=1,scale=320:180,tile=8x6"`, plus `blackdetect` and
  `volumedetect`. Verify in the ENCODED file, not the frames.
- **Pixel-identical regression** when optional code goes in: `git worktree add --detach $WT <baseline>`, symlink
  `node_modules`, render the same `--stills` in both trees, numpy diff, require max = 0 with every mock switch off.
  It was the only check that caught the dangling else. (Comparing stills to `out/frames` is invalid: lead + JPEG.)
- **Chronology audit** (a delegated agent): every shot's references against `YEAR_TICKS`, verdicts OK / Back −N /
  AHEAD +N / Early. Run it BEFORE the commissioner sees a cut.
- **Egg fact-check** (fresh agent, verbatim quote + link from a source opened that session).
- **Run `tools/checks/flashcheck.py` and `tools/checks/avsync.py` on the final** (built and validated, then never run on the final).
- **Pages:** 400 px headless screenshot + `video/kit/tools/overflow.mjs` (nowrap links made a page 492 px wide);
  check dark mode.

## The notes rounds
Ten versions shipped in one day. How notes arrive: typed or dictated chat (often mid-turn, in bursts), timestamps
("3m59s remove Barnabt"), screenshots, and Add/Leave taps saved to the page's database (`ArtifactData list`). The
page's free-text notes box was never used.
1. **Decode** fragments against the lyric and the shot playing at that moment (dictation picks up the song: about half
   of one note was lyric bleed); list what you couldn't place instead of guessing.
2. **Restate any staging note in one line before building** (the "probe binoculars" note was built as a letter on the
   floor; Neel meant a scroll pushing past). For an ambiguous visual note, show 2–3 quick stills of readings first.
3. **Make exactly the change asked for; check what already exists.** A tag Neel asked for was enlarged unasked: "Too big
   go back to the previous size it's fine on a phone".
4. **Fact-check** any new names; **cite** any reworded factual claim next to the change.
5. Implement → delete affected frame ranges → re-render → encode → textcheck + Gemini → rebuild the page.
6. **Answer every note on the page** as a (note, what changed) pair, newest round first (`ROUND3…ROUND9` in
   `tools/build_final_page.py`), and in chat.

## Parallel section forks: the protocol
Seven forks ran at once with zero collisions using these clauses (copy them):
- "YOUR FILES: final_v5.js; and in dgq_animatic.js ONLY the functions floorAndDesk, cutout and crookedPainting"
- "every NEW top-level function or const must start with the prefix `camD`… Never rename or remove existing top-level names."
- "Add new behaviour behind options that default to off" / brace every `if`.
- "Never put a `//` comment inside a one-line function."
- "On big brush shapes use wash only or bleed ≤ .01." / "call flushLetters() before brush paint that must sit on top of 2D work"
- "Always name images out/check/camD_..."
- "If a render fails because of an error in a file you don't own, wait a minute and retry; never touch that file."
- "DON'T commit, run --frames or --encode, publish, or edit the shot list or the page builder; I will integrate."
- REPORT: per item DONE/SKIPPED, the exact visible time span, one egg line for the shot list, one "things to spot"
  tuple, check-image paths.
The coordinator owns shared files (board.js, props.js, the shot list, the page builder) and queues finished sections'
frames for rendering while other forks run. Prefer **fresh agents with a written brief** over forks where the job
doesn't need the whole conversation: a fork inherits the full parent context (~900k tokens each, even for a 6-tool
job); fresh agents used 290–720k with far more tool calls.

## Left-out ideas as mocks (the main approval loop)
Neel: "Any other things that you cut or ideas you considered including but decided against that you want feedback
on?" then "Can you give me still images mocking up all the ideas you left out". Prose lists got no response; pictures
got 57 taps in one evening and 28 of 56 ideas added — including five the agent had pre-rejected (SolidGoldMagikarp,
the bliss attractor, sleeper agents, CLIP's iPod apple, R1's aha moment). Caption-only proposals got 0 of 10 taps.
- Each idea is real scene code inside `if (mock('key')) { … }`; `?mock=` is read in `board.js`; off in the real video.
- `tools/render_mocks.py` renders each key on and off, crops the bounding box of differing pixels padded to 16:9 as a
  close-up (manual boxes where brush noise shifts), handles two-up cases; `CUTS` = (key, title, desc, still_t).
- The page shows the still + close-up + Add it / Leave out; `TICKED`/`ADDED` record taps. Promoting = delete the gate.
- **Keep an ideas/references miner running throughout** (Neel asked three times "Do you have a sub agent coming up
  with new ideas?"), each run with a new angle: one cameo per commissioner paper, their reading lists, field in-jokes
  and common ideas, memes. Each pass added 10–43 cameos.

## Density rules for the final cut
- Neel: "dense with references, details and in-jokes, especially to Neel and Anthropic's interp papers, but also to in
  jokes, AI safety ideas and memes… reward a careful viewer. But it is very important that the references make sense,
  link to the lyrics and flow, don't just shoehorn things in… Visual humour is great. Timing is crucial, as is a sense
  of visual flow and transitions." And: "I'm pro having it feel dense and busy, so long as the viewer can ignore
  details they don't know or care about." And: "classy but reference dense in a way that rewards an in group viewer".
- 1–4 eggs per shot, each justified by its lyric line (final: 67 shots, 177 eggs, 141 "things to spot").
- **Headline references** (ones a lyric points at) get ~1.5 s fully on screen once complete; override the `L<n>` snap
  with a numeric cut if needed (the car circuit was complete for ⅓ s: "too fast to see"). Background eggs can flash.
- **Joke props read at a glance**: both halves of "X with Y in it" drawn big and iconic plus a one-word title (the
  chocolate lasagna went from a 78 px card to a 190 px recipe card) — but don't overcorrect what the commissioner already likes.
- **Literal props stay literal**: a corner cut off a sheet must be gone from the sheet (and reattach on the rewind).
- **One cameo per commissioner paper** where it isn't shoehorned (`tools/paper_cameos.py` tracks in/new/none with
  where or why: 73 of 134 rows in). "If it can't come up with anything that isn't really shoehorned then that's fine."

## Common mistakes
| Mistake | Fix |
|---|---|
| Resolution baked into coordinates | One scale constant, day one |
| Silent failures (page errors, no audio) | Exit on page error; always pass `--audio` |
| Checking frames, not the encode | Frame-a-second sheets of the MP4 |
| Stale frames after an edit | Delete the frame range before re-rendering |
| Unbraced gates, mid-line comments | Braces; multi-line code; baseline-worktree diff |
| Building an ambiguous note in full | One-line restatement or 2–3 stills first |
| Enlarging/expanding beyond the ask | Exactly the change asked |
| Uploading while notes still arrive | YouTube can't swap a file; upload when notes stop |

## Cost and time
Sign-off → upload: 15 h wall clock. First full cut 2h15m after sign-off (the animatic had already iterated every
board). Polish rounds 10 min to 1h15m each. API spend in this stage ~$1.85; the real cost is Claude tokens (each
cameo fork's transcript was 13–37 MB).
