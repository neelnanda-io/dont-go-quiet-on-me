# Don't Go Quiet On Me

"Don't Go Quiet On Me" is a song and music video about the history of mechanistic interpretability. It runs from
circuits and superposition in 2020 to models that do their reasoning where nobody can read it in 2026, told as a
researcher pleading with a model to keep talking. Claude Opus 5.5 wrote the lyrics, made the mix and animated the
video. Every frame is drawn by JavaScript (p5.js and p5.brush) in headless Chrome, and no image or video models
appear in the final cut. Suno v6 generated the vocals and band. The video is packed with references to real papers,
posts and in-jokes. It was made for Neel Nanda as a personal project and is not affiliated with Google DeepMind.

- **Watch it:** https://youtu.be/xhTMRykVb8I
- **Every reference, with stills and sources:** https://neelnanda-io.github.io/dont-go-quiet-on-me/
- **Lyrics:** [lyrics.txt](lyrics.txt)
- **Make your own:** [skills/](skills/) holds Claude Code skills written from this project, for making songs and
  videos like this one.

This repo has everything needed to re-render the video from code. It also keeps the pipeline that produced the song:
the lyric judging, the vocal QA and the take selection.

## Contents

- [How it was made](#how-it-was-made)
- [Render the video yourself](#render-the-video-yourself)
  - [Requirements](#requirements)
  - [The full video](#the-full-video)
  - [Other render modes](#other-render-modes)
  - [Scrubbing in the browser](#scrubbing-in-the-browser)
- [Python tools: setup](#python-tools-setup)
- [Repo map](#repo-map)
- [Credits](#credits)
- [Licence](#licence)

---

## How it was made

1. **Research.** Agents read Neel's papers and posts, checked the field's canon and recent AI events against primary
   sources, and wrote each reference in the format in `refs/SCHEMA.md`. `refs/round2/sources/verify_quotes.py` checks
   every quoted phrase against the saved source texts. The research notes themselves are not in this repo.
2. **Lyrics, by tournament.** Song concepts and full drafts were scored blind by three LLM judges: `tools/judges.py` on
   top of `tools/llm.py`, an OpenRouter client with prompt caching and cost logging. Each judge saw its own shuffled
   order. The briefs are in `lyrics/judging/judge_brief_r3.md`, `lyrics/round2/` and `lyrics/round3/`. Drafts passed
   mechanical audits (`tools/r2_audit.py`, `tools/syllables.py`) and a fact-check (`lyrics/round3/factcheck_brief_r3.md`)
   before Neel picked between finalists. The history is in `lyrics/changelog.md`.
3. **One source of truth per lyric.** The locked song is `lyrics/final/dont_go_quiet.lyr`, and `tools/lyricfmt.py`
   documents its format. Each line has the on-screen text, an optional respelling for the singer ("SON-it",
   "EN-EL-AY") and the references it leans on. The display lyrics, sung lyrics and source notes are derived from it.
4. **Sung sketches.** Short ElevenLabs Music renders tested finalist lyrics before committing
   (`tools/r2_sketches.py`, `tools/eleven_music.py`, `tools/eleven_plan.py`). `tools/vocal_qa.py` checked each sketch:
   it separates the vocal with Demucs, runs two unprompted transcribers and reports which words and jargon a
   listener can actually hear.
5. **Suno.** `tools/suno_prep.py` writes the paste-ready lyrics, style prompts and exclude lists for 13 styles
   (`audio/suno/dgq/`). Notes on driving Suno's web UI are in `audio/suno/UI_NOTES.md`. Downloads are filed by
   `tools/fetch_take.sh`.
6. **Choosing a take.** `tools/song_qa.py` ran the vocal QA and forced alignment on every take. Gemini listened to
   the takes and described them (`tools/gemini_ear.py`), and its claims were checked against measurements
   (`tools/take_profile.py`, `tools/describe_check.py`). A section-by-section shoot-out page
   (`tools/build_shootout_page.py`) let Neel pick by ear. The orchestral ballad won, and one section was re-sung with
   Suno's Replace Section.
7. **Master and timing.** `tools/mute_vocal_window.py` cut one sung aside out of the master, which became
   `audio/final/dgq_master.mp3`. `tools/beats.py` produced the beat grid (`audio/final/beats.json`, 133.35 BPM).
   `tools/align.py` force-aligned the known lyrics to the vocal stem (`audio/final/lyrics.json`). `tools/song_js.py`
   bundles both into `video/kit/src/data/song.js`, so every frame is a pure function of time and the song.
8. **Treatment and shot list.** The plan, fact checks and reference banks are in `video/treatment/`. The source of
   truth for the 67 shots is `video/kit/src/data/dgq_shots.js`.
9. **Real figures.** Small reproductions of grokking, superposition, induction heads, the logit lens and the refusal
   direction live in `scripts/figures/`, with provenance in `data/figures/README.md`. They write `data/figures/*.json`,
   which `tools/figures_js.py` turns into `video/kit/src/data/figures.js`.
10. **Animation.** The video is drawn in `video/kit/`, which builds on ClaudeAnimationBase. The finished shots are
    `video/kit/src/scenes/final_*.js`, and the shared world (the shoggoth, the researcher, props, the board and its
    typography) is in `video/kit/src/dgq/`. Fonts are vendored by `tools/fetch_fonts.py`.
11. **QA.** `render.mjs --textcheck` flags text that overlaps, falls outside the safe area or flashes by too fast.
    Gemini watched each cut (`tools/gemini_eye.py`). `tools/checks/avsync.py` measures A/V sync and
    `tools/checks/flashcheck.py` is a photosensitivity check. Two things were tried and dropped: a Seedance lip-sync
    and rotoscoping test (`video/tests/seedance/REPORT.md`, `tools/video_gen.py`, `tools/roto.py`) and an ElevenLabs
    sound-effects library (`tools/sfx.py`).
12. **Publishing.** `output/doc_stills/build_description.py` writes the YouTube description with chapters
    (`output/youtube_description.txt`). `output/doc_stills/build_doc.py` writes the chapters of the reference page.

## Render the video yourself

### Requirements

- Node.js 20+
- Google Chrome or Chromium. `render.mjs` looks in the standard install locations. Otherwise pass `--chrome=<path>` or
  set `CHROME_PATH`.
- ffmpeg on your `PATH`
- A GPU helps a lot, because p5.brush's watercolour fills are slow in software. On an Apple M4 Pro a frame takes about
  60 to 250 ms, so the whole video (262 s, 6,288 frames at 24 fps) takes about 10 to 20 minutes with 5 workers. With no
  GPU at all, add `--soft-gl`. On a headless Linux box with an NVIDIA GPU, add `--gpu-angle=gl-egl` (or `vulkan`).
  `node gpu_probe.mjs <chrome path>` shows which renderer Chrome gets.

### The full video

```bash
cd video/kit
npm install
node render.mjs --frames --workers=5        # JPEG frames -> out/frames/ (parallel; re-run to resume)
node render.mjs --encode --audio=../../audio/final/dgq_master.mp3 --out=out/dont_go_quiet.mp4
```

`--frames` takes `--range=a:b` (seconds) to render part of the song. `--encode` reads the frames from `f00000.jpg`
onwards, so render from 0 before encoding.

### Other render modes

All of these run from `video/kit/`. The flags are documented at the top of `video/kit/render.mjs`.

| Command | What it makes |
|---|---|
| `node render.mjs --stills=5,100,200 --out=out/stills` | full-resolution PNGs at those times |
| `node render.mjs --clip --range=100:103 --out=out/clip.mp4` | a short MP4 straight from the browser, with the song muxed in (from `song.js`, or `--audio=`) |
| `node render.mjs --sheet=5,100,200 --cols=3 --w=480 --out=out/check/sheet.jpg` | a contact sheet of chosen times |
| `node render.mjs --strip=100:101 --out=out/check/strip.jpg` | every frame of a stretch (to check motion) |
| `node render.mjs --sheet=100 --crop=760,300,400,400 --w=600 --out=out/check/crop.jpg` | full-resolution crops |
| `node render.mjs --textcheck=0:262 --out=out/check/text.json` | text overlaps, title-safe area, size, contrast, fast reads, missing glyphs |
| `node render.mjs --stills=146 --mock=t45 --out=out/mock` | switches on an idea that was left out of the video. Keys are the `mock('...')` calls in the scenes, e.g. `t45`, `owls`, `r4_dead`. Use with stills or sheets. |
| `node render.mjs --stills=20 --style=B --out=out/riso` | the same frame in another style: `B` risograph, `C` cut paper (`src/dgq/styles.js`) |

More flags: `--fps=24`, `--workers=N`, `--lead=0` (by default each frame runs one frame ahead of its timestamp so hits
land early rather than late; see `src/config.js`) and `--chrome=<path>`.

### Scrubbing in the browser

After `npm install`, open `video/kit/studio.html` in Chrome. Drag the slider to scrub. URL parameters: `?t=100` opens
at 100 s, `?style=B` or `?style=C` switches the style, `?mock=t45` turns on a left-out idea and `?loop=emotions` (or
`views`) shows the base kit's model sheets.

**Keyboard shortcuts (studio.html)**

| Key | Action |
|---|---|
| Space | play / pause with the song from the slider's position |

## Python tools: setup

The Python tools cover the lyrics and audio pipeline. You don't need them to render the video. Several tools call
`.venv/bin/python` directly (for Demucs), so make the venv at the repo root:

```bash
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env               # then fill in only the keys you need
.venv/bin/python -m pytest tests -q
```

API keys are only ever read from the environment or `.env`. The variables are listed in `.env.example`:
`OPENROUTER_API_KEY` (judges, Gemini, image and video generation), `ELEVENLABS_API_KEY` (sketches, sound effects) and
`OPENAI_API_KEY` (one of the two transcribers).

Notes:

- `mlx-whisper`, the local transcriber, only installs on Apple Silicon. `tools/fetch_take.sh` uses zsh and macOS's
  `stat -f` and `afinfo`.
- The figure scripts use their own environment, with TransformerLens 2.x pinned. See `data/figures/README.md`.
- Some tools need files that aren't in this repo: the Suno takes, the stems, the research notes and the intermediate
  renders. For example, `tools/build_*_page.py` and `tools/render_mocks.py` expect
  `output/checkpoint_video/shots.json` (from `node tools/dump_shots.mjs`) and earlier renders in `video/kit/out/`.
  These tools are kept as a record of how the song and video were made. These run from a fresh clone:
  `tools/figures_js.py`, `tools/song_js.py`, `tools/paper_cameos.py`, `output/doc_stills/build_description.py` and
  the tests.

## Repo map

| Path | What it is |
|---|---|
| `lyrics.txt` | the lyrics, with section captions and credits |
| `lyrics/final/` | the locked lyric (`.lyr`) and its derived display, sung, notes and judge files |
| `lyrics/judging/`, `lyrics/round2/`, `lyrics/round3/` | judge briefs, drafting instructions, the fact-check brief and the round-3 finalists and sketch plan |
| `lyrics/changelog.md`, `lyrics/author_prereg.md` | the lyric history, and the author's predictions before judging |
| `audio/final/` | the master (`dgq_master.mp3`), the beat grid and the word-level lyric alignment |
| `audio/suno/` | the Suno inputs for every style tried, and notes on Suno's UI |
| `video/kit/` | the animation and renderer: `render.mjs`, `studio.html`, `src/` (engine, scenes, data), vendored fonts |
| `video/kit/src/scenes/final_*.js` | the finished shots, one file per section |
| `video/kit/src/data/` | `song.js` (timing), `dgq_shots.js` (the shot list), `figures.js` (real figure data) |
| `video/treatment/` | the treatment, production plan and tracker, fact checks of cards and in-jokes, reference banks |
| `video/tests/seedance/` | the Seedance lip-sync experiment's report and analysis script |
| `tools/` | the pipeline scripts: lyrics, audio QA, Suno prep, timing, page builders, Gemini checks |
| `tools/checks/` | A/V sync and photosensitivity checks on rendered MP4s |
| `scripts/figures/`, `data/figures/` | the real-data figure reproductions and their output |
| `refs/` | the reference-entry schema, quote-checking scripts and the video-craft research notes |
| `output/` | the YouTube description and the scripts that build it and the reference page's chapters |
| `tests/` | pytest tests for the tools |
| `skills/` | Claude Code skills for making research music videos and explainer videos |
| `docs/` | the references page (https://neelnanda-io.github.io/dont-go-quiet-on-me/), built by `tools/build_reference_page.py` |

## Credits

- **Lyrics, animation and mix:** Claude Opus 5.5, working in Claude Code
- **Vocals and band:** Suno v6
- **Prompt inspiration:** Donald Jewkes's video prompt for "I'm Upping My P(doom)"
- **Moral support:** Neel Nanda
- **Animation kit:** built on [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)
  (MIT), from the music video "I'm Upping My P(doom)"
- **Photosensitivity check:** `tools/checks/flashcheck.py` is adapted from Jesse Caple's `flashcheck.py`
  ([jessecaple/pdoom](https://github.com/jessecaple/pdoom), MIT)
- **Fonts:** all under the SIL Open Font License 1.1: Anton, Archivo, Archivo Black, Bagel Fat One, Big Shoulders
  Display, Black Han Sans, Bricolage Grotesque, Caveat, Computer Modern Unicode (CMU), Dela Gothic One, DotGothic16,
  Fraunces, Gaegu, IBM Plex Mono, Instrument Serif, JetBrains Mono, Newsreader, Noto Sans Math, Outfit, Permanent
  Marker, Rubik Mono One, Shantell Sans, Silkscreen, Syne, Unbounded, VT323 and Adobe Blank
- **Figures:** the paper figures in the video are redrawn and credited on screen. Sources are in
  `video/treatment/figures_and_cards.md` and on the references page.

## Licence

- **Code:** MIT, (c) 2026 Neel Nanda. See [LICENSE](LICENSE). The base kit in `video/kit/` keeps its own MIT notice,
  (c) 2026 John Heibel ([video/kit/LICENSE](video/kit/LICENSE)).
- **The song audio, the lyrics and the music video:** (c) 2026 Neel Nanda, all rights reserved.
- **Fonts:** SIL Open Font License 1.1, under their authors' copyright.
