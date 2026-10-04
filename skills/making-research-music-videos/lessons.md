# Lessons from "Don't Go Quiet On Me" (Sep 30 – Oct 4, 2026)

What would have helped had we known it at the start. Each is an imperative with the evidence. Ranked by time or
quality it would have saved. The project (made for Neel Nanda, its commissioner): 4:22 song, 67-shot video, ~24.5 h of
agent work over 4.6 days, 10 compactions, 3 lyric rounds, 58 Suno takes, 10 video versions, $147 of API spend (judges
$127, images/video $17.6, Gemini $3.4), YouTube https://youtu.be/xhTMRykVb8I.

## Contents
- [The top ten](#the-top-ten)
- [Lyrics](#lyrics)
- [Audio](#audio)
- [Video direction](#video-direction)
- [Video production](#video-production)
- [References](#references)
- [Process](#process)

---

## The top ten
1. **Make every decision a phone-legible tap with a picture; take free text only in chat.** Strikethrough lost a
   lyric round's feedback; page notes boxes were never used; Add/Leave on stills got 57 taps in an evening.
2. **The commissioner picks; judges only flag.** The song Neel chose came LAST in the judges' head-to-head (1 of 24
   points), and the lead's own picks lost in rounds 1 and 3. Always carry a faithful "their favourite + their notes"
   control.
3. **Story first in the lyric; names and numbers go on screen.** The density-first round-1 pick was rejected as
   "shoehorned a bunch of papers into lines and smushed them together".
4. **Never block on a question while independent work exists.** A download-permission question idled the audio stage
   for 9.4 h; generating takes needed no permission. Ask at the previous sign-off; keep working.
5. **Don't plan around generated video.** Procedural p5.js + p5.brush carried the whole video; a parametric puppet
   beat rotoscoped Seedance clips ("reads as a posterized photo, not a drawing"); 10 planned clip shots became 0.
6. **Re-read the brief at every phase start and after every compaction, and have a fresh agent audit compliance
   before each checkpoint.** Neel had to ask twice; one re-read found six missing asks.
7. **Show options as real artefacts, early**: the opening animated in each style (he only chose after seeing motion),
   real sung sketches (judges' singability scores barely predicted delivery), stills of left-out ideas.
8. **Run the reference miners in Stage 0, not after the cut is "final"**: Neel's paper coverage table, his reading
   lists and the culture pass were all requested late and retrofitted with seven parallel forks.
9. **Restate or sketch ambiguous notes before building them in full.** The endless-zoom hook and the floor-letter
   scroll were built and rejected.
10. **Let the commissioner's listening choose the music's mood.** For the interp song Neel picked sincere and a
    little sad, with the humour in the words and pictures; his pre-listening "I prefer hilarious" reversed within 16
    minutes of hearing takes.

## Lyrics
- Give writers and judges the commissioner's taste rules and gold lines from round 1 (lyrics.md). Ban on-the-nose
  specifics and near-quotes of the commissioner from day one; route specifics to `## note:`.
- Test every line: would an expert follow it without the footnote? ("I don't get the specific references in the NLA line")
- When de-jargoning, keep a concrete claim ("What's the point?" cost a Suno re-sing).
- Variety comes from different narrators/frames written by fresh agents who haven't seen the old drafts, plus an
  overlap check; shared revision menus made five finalists "kinda samey".
- Mechanical audit before every judging round (asks present, forbid list, provenance, overlap): a polish pass
  silently removed an explicit ask.
- Length from the syllable model (2.7 syl/s + 12 s predicted 4:21 for 4:22); ask before adopting any length cap.
- Letter the songs, number the verses on the page.
- Fix facts in the digest at the source; one bad pairing caused 6 high-severity errors in 4 drafts.
- Judge all drafts of a round in one process so prompt caching hits (split processes doubled Fable's cost).
- Agree every lyric cut before recording; post-lock cuts meant stem subtraction and re-sings.

## Audio
- Let the commissioner thumb takes in Suno (Neel did 32 takes in ~16 min); you check words, loudness and structure.
  Plan it that way.
- Never tag a sung verse "solo X and voice" / "almost nothing" / "lone voice"; write "sung, full voice" and exclude
  "spoken word, whispered vocals". Avoid `[Spoken]` asides.
- Fix sections in Suno's Legacy Editor; the Create-page Replace Section returns instrumentals. Verify every
  regeneration by transcription before showing it; send it with its lead-in.
- Whisper is the primary transcriber (gpt-4o truncates sung audio); give jargon terms spelling alternatives.
- Gemini describes, never ranks (75% first-heard bias; inverted Neel's picks; invented a mishearing).
- Check your browser-automation extension is connected to this session and the right account before the
  commissioner goes offline (a 5 h overnight block).
- Ask one thing at a time at a listening checkpoint.
- Don't build SFX libraries, v2 variants or full ElevenLabs plans before a decision needs them (all went unused). If
  you skip a brief item (the ElevenLabs comparison, the blind shortlist), say so.

## Video direction
- Ask early whether the commissioner has a picture in mind; offer 3–5 concepts as stills. Neel's concept (a researcher
  studying a tiny shoggoth that outgrows her) was the spine of the whole video.
- Make the central motif procedural with one continuous parameter; build characters as parametric puppets.
- Image models are for look targets only (<$3 decided the style).
- Scale as numbers, not adjectives; show scale by pulling back past a human, never zooming into the subject.
- Smooth growth: monotone cubic in log space, continuous counts.
- The field's canonical picture beats wordplay (circles for neurons, plummeting loss not accuracy, Sydney's emoji not
  the IOI example); concrete scenes beat metaphors (crime scene, rewind; the "ocean" was scrapped).
- Text budget: paper title only, small, bottom-left; citations off screen; never show a punchline before it's sung.
- Chronology audit against the year stamp before the commissioner sees anything.
- Burn timecode and shot ID into the animatic; expect ~30 dictated notes per viewing; it is also the commissioner's
  first listen of the song against picture (keep Suno credits for a fix).
- Cap fan-out image counts; make resumes idempotent (a resume quadrupled image spend).

## Video production
- Day one: resolution-independent kit (one scale constant), `render.mjs` exits on page errors, `node --check` before
  every render, data strings written via `json.dumps`.
- Brace every gate; no mid-line `//` comments; unique name prefixes (one global scope); apply edits in memory then
  write once; always pass `--audio` to encode; delete frame ranges after edits; verify in the encoded file.
- Baseline-worktree pixel diff with mock switches off: the only check that caught the dangling-else bug.
- Gemini eye flags are leads (~26% real); check each against full-res stills.
- Give every headline reference ~1.5 s fully on screen; joke props big and iconic with a one-word title; don't
  overcorrect what they already like.
- Run flashcheck and avsync on the final; assign text roles so textcheck's real flags aren't buried.
- Fork protocol (file ownership, prefixes, coordinator owns shared files) ran seven forks with zero collisions.
- Don't upload until notes stop; YouTube can't swap a file. Ask for the human drag of the file early (tool limit 10 MB).

## References
- Treat every starting note as unverified, including the commissioner's own (Neel's bank needed 48 corrections).
- Record rulings only with the commissioner's quote and timestamp (an invented "ruling" blocked an idea Neel later
  added).
- Draw rejected ideas as mocks and let the commissioner choose: Neel added half, including five the agent had
  pre-rejected; 0 of 10 caption-only proposals were tapped.
- Audit X across eras, not just the last quarter; pull tweets by URL with a script.
- Keep one reference record that generates eggs, the page's spot list, the doc and the description (two copies drifted).
- Write all reference text in the third person from day one.
- Share the reference doc publicly before it goes in a description.

## Process
- Fresh agents with written briefs by default; forks (~900k tokens each) only for edits needing the commissioner's full note history.
- Keep an ideas/references miner running throughout; Neel asked three times.
- Keep render/check loops out of the lead's context (they drove four compactions in a day).
- Within an approved budget, act then report; show spend against the cap at every checkpoint (he raised the judge cap
  from $60 to $400 on seeing it).
- Confirm costly constraints before building around them (the 2:19 cap).
- Make exactly the change asked; check what exists first (the KYLE tag).
- Map dictated notes against the lyric before acting (about half of one note was lyric bleed); list what you couldn't place.
- Cite reworded factual claims next to the change.
- Rewrite STATE.md's header each phase; compute spend from logs; trust STATE.md over compaction summaries.
- Post links in chat as well as on your async review channel; Neel never replied on his queue's threads.
- Log every prompt variant (Suno, image, judge) and the runners-up with reasons; a future project may prefer one.
