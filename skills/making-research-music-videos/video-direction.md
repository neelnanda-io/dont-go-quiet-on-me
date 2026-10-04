# Stage 3a: Video direction (up to the commissioner's sign-off)

The brief's instruction for this stage, verbatim (Donald Jewkes): "think and feel very deeply about what is the best
way to visually represent all of the lyrics on screen. You do not need to anchor to the current style, you can do truly
anything that you think might best let you visually express yourself, including abstract motion graphics." And: "I
don't want you to produce something that is GPT slop. Instead, I'd be more impressed if you come up with a coherent
style". The checkpoint shows "the style sheet, your character options, a rough animatic of the whole song, and a
finished version of the opening hook" (Neel's brief).

## Contents
- [What the brief suggested vs what worked](#what-the-brief-suggested-vs-what-worked)
- [The concept: find one image that carries the song's idea](#the-concept-find-one-image-that-carries-the-songs-idea)
- [Order of work](#order-of-work)
- [Visual design principles](#visual-design-principles)
- [Text on screen](#text-on-screen)
- [The hook](#the-hook)
- [The animatic](#the-animatic)
- [Generative models: what they're good for](#generative-models-what-theyre-good-for)
- [Common mistakes](#common-mistakes)
- [Cost and time](#cost-and-time)
- [Reusable assets](#reusable-assets)

---

## What the brief suggested vs what worked
| Brief | What worked | Why |
|---|---|---|
| Image-model style and character sheets | Yes, as **look targets only** (15 images, $2.24) | "Everything on screen is drawn in JS; these set the look the JS is matched to." |
| Seedance 2.5 base clips per scene, redrawn as a JS overlay (rotoscope) | **No.** 10 planned "performance" shots became 0. One roto attempt was abandoned in 13 min: "lines are thick and blocky and it reads as a posterized photo, not a drawing" | Roto passed front-on at mid shot and failed at close-up; a growing creature needs a continuous parameter, not clips; consistency across 60+ shots |
| Lip sync | Validated (constant ~250 ms offset), then never needed | Choruses staged the singer three-quarter from behind; a ballad doesn't need mouths |
| Personified-AI pop protagonist, K-pop anchor | A researcher protagonist singing TO the model (a creature); K-pop survives as profile cards and one dance-formation gag | The song is sung by the interpreter to the model; sincere ballad, so riso/K-pop energy was wrong |
| $400 image/video budget | $17.6 total | Procedural JS made generation nearly unnecessary |

**Default for next time:** everything procedural in p5.js + p5.brush, a parametric JS puppet for each character (built
from an approved sheet), image models for style frames and character sheets only. Before planning ANY generated-clip
shots, run one end-to-end test (generate → trace → render at the real close-up size) and decide from that.

## The concept: find one image that carries the song's idea
The single biggest decision. Here Neel supplied it ("a researcher with a magnifying glass studying a cute tiny
shoggoth, then it starts growing and rapidly becomes bigger than the screen as 'don't go quiet on me now' is said";
then "a date in the corner ticking up… a cute shoggoth that starts extremely tiny and toy, and gets larger and byzantine
and complex, and surrounded by thorns/walls/defences… a consistent motif [in] the chorus, but verses can vary").
The story it told: **the model outgrows the researcher's ability to study it.**

So: **ask the commissioner early (at audio lock) whether they have a picture in mind**, and offer 3–5 concepts of your
own as stills. A good concept has: one recurring motif whose state changes per chorus (growth, decay, a meter, a
garden, a ledger); a human for scale; a clock (the year stamp); and room for verses to be different worlds. For EA:
e.g. a ledger or a growing tree of pledges; a lighthouse keeper; a single malaria net multiplying into a canopy. For
AI safety: e.g. a chess game with a growing opponent; a dam; a cartographer mapping a coastline that keeps moving.
Make the motif **procedural with one continuous parameter** (`g` from 0 to 5 drew every stage of the shoggoth in one
function).

## Order of work
The first checkpoint took 1 h 18 min from audio lock because tooling was built while earlier checkpoints waited.
1. **While lyrics/audio wait:** fork the kit (video-production.md), add the text layer and checks, build real-data
   figures, research motion craft (measured cut rhythms, riso recipe) into a craft brief.
2. **Lock timing data** from the audio master: `beats.json`, `lyrics.json` (forced alignment; this song's are in
   `audio/final/`) → `video/kit/src/data/song.js`.
3. **Three style directions as stills** (chorus frame + motif growth sheet each). First project: A field notebook (ink
   and watercolour on graph paper, specimen plate), B riso night, C paper-cut theatre.
4. **Then show the opening animated in each style** before asking them to choose ("Can I see the opening done in each
   style"). B and C were post-process passes over A's frames (`video/kit/src/dgq/styles.js`, `render.mjs
   --style=B|C`): $0 and 20 minutes. Neel picked A only after seeing motion.
5. **The motif** as a procedural function; **the protagonist** as a parametric puppet from the approved sheet.
6. **The hook** finished to final quality (several versions, each checked frame by frame and with `--textcheck`).
7. **Shot list as data** (`video/kit/src/data/<slug>_shots.js`, one record per shot; this song's is
   `video/kit/src/data/dgq_shots.js`) → the animatic, the treatment (`video/treatment/treatment.md`) and the
   checkpoint page are all generated from it.
8. **Delegate in parallel:** tweet candidates (verbatim, by URL), figures/title cards/year keyframes, egg fact-check,
   any paper-reading for imagery, cast options.
9. **Re-read the full brief and reference bank immediately before publishing the checkpoint.** Neel asked "have you
   carefully re-reviewed the prompt with video instructions?" and six gaps surfaced (cameo options, a K-pop protagonist
   option, profile cards, a second HUD meter, the doubled final-chorus cut rate, the lip-sync question).
10. **Checkpoint page** with tap-to-pick (style, protagonist, cameo, tweets yes/no), the hook, the animatic with
    timecode, and a notes box; post it to your async review channel.

## Visual design principles
- **One world.** "One researcher's field notebook, 2020 to 2026." Pick a material world the subject owns (lab
  notebook, ledger, ship's log, case file, herbarium) and let every verse be a place in it. Palette with no pure
  black/white (paper #F2E8D2, ink #2A241E, sepia, vermilion, indigo, gold); a hero serif for lyrics (Instrument
  Serif), an italic for titles (Fraunces), a hand for marginalia (Caveat), a typewriter/mono for data.
- **Chorus = the same composition every time** (the "visit": creature right, researcher left, huge lyric left, a
  specimen tag whose "understood:" line runs mostly → some → a little → ? → blank). One motif state per chorus, stepped
  up between choruses, never changing on screen.
- **Verses = one camera world each**, the camera travelling through it (specimen drawer, dictionary, workshop dolly with
  whip-pans on downbeats, a stage, her room, a corkboard, a page that empties itself) — not unrelated boards.
- **A fixed transition grammar:** lens iris into every chorus, page turn into every verse, riffle back in the hook and
  riffle forward in the final chorus (a mirror), match cuts (tiles → arrows → clock → lens rim). Cuts on beats or on
  the sung word; the final chorus can double the cut rate (the reference did).
- **A HUD that escalates:** the year stamp ticks on the hit word, never runs backwards except for one deliberate flick
  (o1 in 2024), slams the future year (2027) on the monster, goes dark on the last cut-off word; a second meter
  ("said out loud"). **Every on-screen item's date must match the stamp** — audit it (the
  `video/treatment/chronology_audit.md` pattern).
  A prehistory cold open (Singer in 1972, Clever Hans in 1907, Turing in 1950) can run before the main timeline: give it
  its own treatment (a sepia plate, or the stamp spinning forward through the gap) and then jump; forward jumps are
  fine, backward ones only as a deliberate, motivated flick. The stamp can also carry a month or a second meter that
  suits the topic (real pledge counts by year for EA, a benchmark-saturation meter for evals).
- **Scale as numbers, not adjectives.** "Bigger than the screen" cost four hook versions. Specify the fraction of the
  creature on screen and the human's height in px per chorus. **Show scale by pulling back past a fixed human**, never
  by zooming into the subject (the spiral zoom was rejected outright).
- **Smooth motion:** monotone cubic interpolation in log space (`smoothKf`), continuous counts, fades not pops. Eased
  keyframes stop at every key and read as jerky.
- **Canonical pictures over word-matches:** neurons as circles with synapses in parallel layers (not grid squares); a
  plummeting LOSS curve, not accuracy; ChatGPT and Sydney's emoji, not the IOI example. Ask what picture the field
  itself uses for the idea.
- **Concrete scenes beat metaphors:** the "ocean" verse was scrapped for mind reading; the crime scene, the rewind
  that re-runs a scene with one change, and the shirking-a-task sight gag all landed.
- **Brutalist inserts:** real tweets, redrawn paper figures with credit, real code. Never invent a tweet; pull them by
  URL with a script (`tools/build_tweet_candidates.py`).

## Text on screen
The brief: "think about how to retain attention, and one of the best ways to do this is through text on screen… where
the lyrics are really big and present, keep the background less busy… characters on the right as the lyrics appear on
the left… sometimes the lyrics appear more like subtitles and other times they're really present and really big. At
the start, for the visual hook, the lyrics should be much more visually present." Neel's later rules (binding on his
song; most generalise, but check with your commissioner):
- Lyric treatments by shot: hero (huge serif, left), big, caption (karaoke subtitles), shout (full frame), card;
  backing-vocal parentheses as red-pencil marginalia.
- "Have less text on screen, spell things out a bit less, remove unnecessary details like step count."
- "Don't have paper references on screen, maybe have the title in the bottom left corner, but no year or author or
  org." Full citations live on the companion page / doc only. For non-paper sources (books, essays, Forum posts,
  charity reports) the same rule applies to their titles; draw books as titles on spines, not cover art.
- **The one rule that reconciles the brief with Neel**: lyrics may be big and present (the attention device, strongest
  in the hook); reference text stays minimal.
- Quick figures are "a reward to the high context viewer so don't spell it out - don't say the name of the technique".
- **Never spoil a reveal**: "you spoiled it by having golden gate bridge on screen before the dramatic moment".
- Text otherwise appears only as an object's own lettering, a word or two.
- The commissioner's vocabulary on screen (Neel: "latent", never "feature").
- Automated: no text under 26 px (lyrics ≥ 40 px), no overlaps, contrast passes, every glyph present (`--textcheck`).

## The hook
The reference opened by drawing its character four times at increasing skill, each labelled with the AI capability of
its era, with a text-first slam within 2 s. Find something that strong for the new topic: a visual that *is* the
song's thesis, readable in 5 seconds. First project: the tiny cute creature under her lens, growing smoothly and
upright until it dominates the frame while she shrinks to ~110 px, the lens cracking, a 2027 stamp slammed on the
monster ("I want the monstrous shoggoth to be 2027 and for viewers to notice"), then a riffle back one iconic figure
per year (2026 → 2020), each a reward for the high-context viewer. Build it to final quality for the checkpoint.

## The animatic
- Full song, every shot as a rough board with the real lyric treatment, rendered from the shot list (~5 min render).
- **Burn in timecode and shot ID**; commissioners give notes by timestamp (Neel: "at 2m54").
- Expect ~30 dictated notes per viewing; they arrive in bursts while the commissioner watches, with lyric bleed
  (feedback-and-pages.md). Batch them into a numbered ledger; send "needs work" imagery to a paper-reading subagent
  ("have a subagent read the paper").
- **It is also a second audio check**: the commissioner first hears the song against picture here (the quiet spoken Astra verse
  triggered a Suno re-sing). Leave room for that.

## Generative models: what they're good for
- **Style frames and character sheets** (Nano Banana Pro ~$0.13/image at 1–2K via `tools/image_gen.py` with a budget
  guard). Loose on scale, sometimes ignores "no text", once drew an Apple-like logo: check every image, no logos.
- **Detail sheets** via a Workflow with a per-image verifier — but cap counts and make resumes idempotent: a
  session-limit resume regenerated extras and quadrupled spend ($3.41 → $16.24).
- **Seedance 2.5 (OpenRouter)** if a test proves it: ~$0.23/s at 720p, $0.10/s at 480p; audio only as an HTTPS
  `input_references` URL (data URLs get HTTP 400), never combined with `frame_images`; the returned audio is
  re-synthesised, ~250 ms late and 7 dB quieter — measure the offset per clip and discard the clip's audio
  (`video/tests/seedance/analyze_lipsync.py`).
- **Don't build assets before the plan that uses them:** a 20-effect ElevenLabs SFX library was made and never mixed in.
  Sound design is optional: decide in the treatment whether specific moments need effects (a page turn, a crack, a
  stamp slam), and only then generate them, mix them under the master and get the commissioner's OK on a draft.

## Common mistakes
| Mistake | Fix |
|---|---|
| Planning generated-clip shots before an end-to-end test | Test one at real close-up size first |
| Asking for a style pick from stills | Show the opening animated in each style |
| Adjectives for scale ("bigger than the screen") | Numbers per chorus; pull back past a human |
| A reference card per line | Title bottom-left only; citations off-screen |
| Clever word-match imagery | The field's canonical picture |
| Abstract metaphors (oceans, surfaces) | Concrete scenes: crime scene, rewind, mind reading |
| Skipping the brief re-read | Re-read brief + bank before every checkpoint |
| No chronology audit | Audit every item against the year stamp before the commissioner sees it |

## Cost and time
Audio lock → direction sign-off: ~30.5 h wall clock, mostly waiting on Neel; agent bursts of 20 min to 2.5 h. Seven
hook versions, six animatics. $16.24 of a $40 pre-checkpoint cap (detail workflow $12.83 of it).

## Reusable assets
All in this repo: `tools/image_gen.py` (budget guard), `tools/video_gen.py` (async submit/poll/download/resume),
`video/tests/seedance/REPORT.md` and `video/tests/seedance/analyze_lipsync.py`, `tools/roto.py` (mid shots only),
`video/kit/src/dgq/styles.js` (riso + cut-paper post passes for style shoot-outs), `video/kit/src/dgq/shoggoth.js`
and `video/kit/src/dgq/naturalist.js` (technique references: best-candidate eye layout, clipping big brush fills,
poses measured off a sheet), `tools/build_video_page.py` (checkpoint page with db taps, encodes under the 15 MB file
cap), `refs/video_craft.md` (measured K-pop cut rhythms, riso recipe, roto benchmark), and the treatment documents in
`video/treatment/` (`treatment.md`, `production_plan.md`, `figures_and_cards.md`, `chronology_audit.md`,
`egg_checks.md`). Not included: the paper-reading-for-imagery notes (the brief template is in delegation.md) and the
detail-image Workflow script with its per-image verifier (its lessons are under "Generative models" above).
