# Final video: production plan

Neel, 3 Oct 2026: "OK I sign off on the audio, please go and make the final video. Have a subagent assigned to creatively
think of more references from AI Safety culture / the interp literature to include, I want the video to feel classy but
reference dense in a way that rewards an in group viewer". The brief (PROMPT.md): "Once I've approved the video direction,
you're on your own until it's done."

## Contents
- [The bar](#the-bar)
- [Structure in code](#structure-in-code)
- [Phases](#phases)
- [Budget](#budget)
- [Review loop](#review-loop)
- [Tracker](#tracker)

---

## The bar
The finished hook (0:00-0:19, `scenes/dgq_hook.js`) is the finish level for every shot. Concretely, a finished shot has:
1. A deliberate composition in layers (foreground props, the subject, a background with depth), no dead paper, nothing
   cropped by accident, the lyric's space planned (big lyrics left, subject right, as the brief asks).
2. Motion with intent: a camera move or a held frame chosen on purpose, secondary motion (breath, paper, boil), entrances
   and hits on the beat or the sung word.
3. Lyric typography designed for the moment (hero, big or caption), legible on a phone, no collisions.
4. References (eggs) as objects in the notebook world, not captions (memory: neel-video-density; the reference bank from the
   subagent: `video/treatment/reference_bank_final.md`). Every date matches the year stamp.
5. A transition in the section's grammar (DGQ_FLOWS): page turns into verses, the lens iris into choruses.
6. Passes the text check (`render.mjs --textcheck`) and a screenshot critique at 1080p and at phone size.

## Structure in code
- `FINAL` registry (in `dgq/board.js`): a finished shot registers `FINAL[id] = (sh, t) => ...`; `board()` prefers it over
  the animatic board, so the whole video always renders, part final and part board, and progress is visible.
- One scene file per section, `scenes/final_<section>.js`, loaded after the animatic in `studio.html`.
- Shared upgrades (the visit, typography, HUD, transitions, the researcher) go into `dgq/*.js`, so they lift every shot.
- The slate goes when the last board is replaced (`ANIMATIC` in `board.js`).

## Phases
0. Infrastructure: the FINAL registry, the section files, this plan, a tracker.
1. Shared pass (lifts every shot): the karaoke caption bug (red parentheticals run together), the HUD (year stamp and
   "said out loud" meter: smaller, placed consistently, never over the subject), the chorus visit composition (C1-C4 and
   FC reuse it), the lens iris and page turn, the researcher figure, page variety per section.
2. Sections in song order, each finished, reviewed and committed: Verse 1, Chorus 1, Verse 2, Verse 3, Pre-chorus,
   Chorus 2, Verse 4, Chorus 3, Verse 5, Chorus 4, Bridge, Verse 6, Final chorus, end card.
3. Performance close-ups (Seedance 2.5 base, rotoscoped by `tools/roto.py`, redrawn in JS; the base is never seen): chosen
   per section where her face carries the line (the chorus "Don't go quiet on me", the final "read the quiet").
4. Whole-video passes: watch it end to end three times (strips every 0.25 s, stills at phone size), fix list, the text
   check over the whole song, an outside eye (Gemini video critique) on each section.
5. Delivery: final 1080p render with the locked master, end card with the labels ("made with AI", "personal project, not
   affiliated with Google DeepMind"), credits for redrawn figures, the review page.

## Budget
Image and video: about $400 in the brief; $16.24 spent before the checkpoint. Seedance is ~$0.23/s at 720p, so two takes of
every performance moment is ~$30. Raise `tools/video_gen.py`'s pre-checkpoint $40 guard to a production cap of $150 (well
inside the brief); ask Neel before going past it. Judges/critique: a few dollars of Gemini per section.

## Review loop
Per shot: stills at its key words; a motion strip; the text check. Per section: render the section, watch strips, list
fixes, fix, re-render; Gemini critique; commit. Every couple of sections: a short progress clip for Neel.

## Tracker
`video/treatment/production_tracker.md`: one row per shot (board / in progress / final / reviewed), with notes.
