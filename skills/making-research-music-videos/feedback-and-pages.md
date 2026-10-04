# Working with the commissioner: checkpoints, pages and feedback

The project lives or dies on how cheaply the commissioner can give verdicts. Neel's words, for the first song: "I'm
unsure how best to give feedback, I kinda like a bunch of them, they could be improved, giving detailed feedback is
hard." Design every ask so it costs them a tap, a word, or a dictated ramble.

## Contents
- [The checkpoints](#the-checkpoints)
- [What works and what doesn't](#what-works-and-what-doesnt)
- [Page rules](#page-rules)
- [Reading their notes](#reading-their-notes)
- [Asking and reporting](#asking-and-reporting)
- [State that survives compaction](#state-that-survives-compaction)

---

## The checkpoints
From Neel's brief: "At each of the three checkpoints (the lyrics, the audio, and the video direction), publish a page
as an Artifact, raise it on [his async question queue], and keep working on anything that doesn't depend on my
answer." Then: "Once I've approved the video direction, you're on your own until it's done" — though he kept sending
notes through ten polish versions, and they were welcome.

| Checkpoint | What the page shows | What Neel did |
|---|---|---|
| Lyrics (×3 rounds) | Finalists A–E with pitch and "my view", tap-to-source lyrics, sung chorus sketches, scores, all ideas ranked | Replied in chat line by line: "1 is fun… 3 is gold… Bridge is too clumsy" |
| Audio | Suno titles to thumb in Suno; then a blind per-section shoot-out page | Thumbed in Suno in ~16 min; picked in chat ("ballad A") |
| Video direction (×5 page versions) | Style options (then the opening animated in each style), protagonist and cameo options, tweets yes/no, the finished hook, the animatic with timecode | Tapped protagonist/cameo/tweets; ~30 dictated timestamped notes per animatic |
| Final cut + polish | The video, things to spot, ship / tweak / rework, per-section thumbs, each round's (note → change) list, left-out ideas as stills with Add/Leave | 57 Add/Leave taps in one evening; timestamped notes in chat |

**Plan the audio checkpoint as "they listen and thumb in Suno; I check the words and loudness"** from the start.

## What works and what doesn't
**Works:**
- One-tap pickers with pictures: Add it / Leave out on still mock-ups (with an auto-zoomed close-up when the thing is
  small), protagonist/cameo/style choices, tweet yes/no. Prose descriptions of options got no response at all.
- Thumbs inside Suno.
- Pages that number verses and letter songs, so the commissioner can reply "A… 1 is fun".
- Timestamps everywhere (burned into the animatic; chapter chips on the page), because notes come as "at 2m54".
- Opening each page with "Your notes" → what changed, one row per note.
- Single-word rulings ("Field notebook", "go") — act on them.
- The commissioner attaching their own images as inspiration ("These pictures should be better inspiration for imagery").

**Doesn't work:**
- **Faint or struck-through text**: "Ah I didn't read any of the crossed out lines, it was hard to see on my phone, so
  anything in there I haven't given feedback on." Silence on something they couldn't read is not a verdict.
- **Free-text notes boxes on pages**: empty on every page, every time. Free text comes by chat.
- **Asking for prose critique.**
- **Two asks at once** (v2-intro thumbs and section taps together: neither answered).
- **An async review channel (a chat thread or issue tracker) as the reply channel**: in the first project all six
  threads on Neel's queue stayed unread; every ruling came in chat. Still post each checkpoint there if that's the
  house rule, but ALSO put the link and the "Feedback I need" list in chat, and record the commissioner's chat rulings
  on the thread in their own words. Keep it tidy: one post per checkpoint that needs them, one running status thread
  per workstream (rewrite the whole summary each update), and minor progress notes kept out of their inbox.

## Page rules
- **Phone first**: everything readable at ~400 px; check with a headless 400 px screenshot and an overflow check
  (`video/kit/tools/overflow.mjs`; nowrap links made one page 492 px wide). Check dark mode.
- Proposed changes get a full-contrast label or badge and are also listed in plain text — never strikethrough + opacity.
- Media within the Artifact limits: 15 MB per file (the page video was 960×540 with a crf ladder 27→35), 16 MB page.
- Taps saved to the artifact database (db capability) with a "copy my picks" fallback; **read the database at the
  start of every turn** ("I have answered most of the questions in the style artifact, can you see my answers?").
- Picks are keyed so a republished or moved page keeps them (an account change once forced a new URL and the picks
  were copied over by hand with an ArtifactData batch).
- Generate pages from the single sources of truth (shot list, reference record, take log) with a builder script;
  never hand-edit the HTML.
- Keep the checkpoint page as the decision record; make the final page a separate artifact linked from it.
- Builders to copy (all in `tools/`): `build_lyrics_page_r2.py`, `build_shootout_page.py`,
  `build_video_page.py`, `build_final_page.py` (with `render_mocks.py` for the Add/Leave stills).

## Reading their notes
- **Dictation captures the song playing.** When the commissioner dictates while watching, sung lines come through garbled ("the
  Jailands caught you" = "the J-Lens caught you"; "So don't you?" ×7 = "don't go quiet"). About half of one note was
  lyric bleed. Map every fragment against the lyric first; a fragment that matches a sung line is not an instruction.
- Garbled real notes still need decoding using the shot playing at that moment ("Shug-off Tetris Face" = "Shoggoth
  Tetraspace"; "later on posts" = "LessWrong posts"; "air safety, injurics" = "AI safety in-jokes").
- **List the fragments you couldn't place** rather than guessing.
- Mid-turn messages arrive while you work, in bursts; fold each into the current round and acknowledge it.
- **Restate an ambiguous staging note in one line, or show 2–3 quick stills of possible readings, before building.**
  The "endless zoom" hook and the "letter on the floor" scroll were both built in full and rejected.
- **Make exactly the change asked for.** When the thing they ask for already exists, say so; don't enlarge or expand
  beyond the ask ("Too big go back to the previous size it's fine on a phone").
- **Taste can reverse once the commissioner hears or sees the real thing** (Neel: "I prefer hilarious" → 16 minutes
  later, having listened, "Not making it sound funny"). Weight post-listening verdicts over pre-listening guesses, and show real
  artefacts early.
- Write each taste ruling to project memory the moment it lands (lyric taste, music taste, video density, feedback
  style), with Why and How to apply.

## Asking and reporting
- **Never block a turn on a question while independent work exists.** Put the question in the turn-end message and
  keep going. One blocking AskUserQuestion cost 9.4 hours.
- **Within an approved budget, act and then report** (Neel was re-asked about downloads already approved: "Is
  downloading one to splice it into the full song expensive?").
- **Confirm any constraint that would cost real work** before building around it (a 2:19 length cap from notes cost an
  hour of cuts: "The 2:19 limit isn't a big deal you can ignore it").
- **Show spend against the cap at every checkpoint** (seeing "$45 of ~$60" made Neel raise the judge cap to $400).
- When the commissioner asks for status (Neel: "Status and required feedback?"), answer with a short status and a
  numbered "Feedback I need" list.
- **Cite any reworded factual claim next to the change** (Neel asked twice for the Astra citation).
- Long autonomous stretches end with a message, and an email if they ask ("email me when done please").
- Disclose side effects (an overwritten clipboard, a temporary public link) in the report.
- Do browser-dependent work (Suno, X, YouTube) while the commissioner is at the laptop, and check first that your
  browser-automation extension is connected to this session.

## State that survives compaction
The first project ran in one session with 10 compactions. What made resumption reliable:
- `STATE.md` headed "re-read after any context compaction": dated updates with page URLs, review-channel thread
  links, exact rebuild commands, spend, and a NEXT line. **Rewrite its header each phase** (it ended still saying "Phase: 2 —
  Audio") and **trust it over compaction summaries** (a summary kept "judges ~$60" after Neel raised it to $400).
- `project_memory.md`: architecture plus the render, check and page-builder commands.
- Single sources of truth (shot list, reference record, take log) from which pages are generated.
- A production tracker (`video/treatment/production_tracker.md`): status per shot, notes per round.
- Memory notes per taste ruling.
- Spend computed from the call logs by a script, never a hand-kept table (the first project's hand-kept log stayed at
  $0).
- Re-read the brief (the-brief.md and the project's PROMPT.md) after every compaction and at every phase start
  (Neel: "Re-read the original prompt file for reminders"; "have you carefully re-reviewed the prompt with video
  instructions?").
- Cancel fallback wakeups once the helpers they were waiting on have reported.
