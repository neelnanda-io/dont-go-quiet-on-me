# Stage 1: Lyrics

The lyrics are the heart of it. From the brief: what makes the reference work is that "it's catchy and so dense with
references that random lines I catch on a rewatch sound great. It's a love song sung to the AI, with a fixed hook that
gets a new payload every time". The density that matters in the LYRIC is density of meaning (an accurate idea folded
into an image). Density of names, numbers and paper titles belongs in the VIDEO.

## Contents
- [Taste rules (the commissioner's verdicts; worked example: Neel)](#taste-rules-the-commissioners-verdicts-worked-example-neel)
- [Choosing the song's spine](#choosing-the-songs-spine)
- [The .lyr source format](#the-lyr-source-format)
- [The pipeline](#the-pipeline)
- [Judges: how to use them, and their limits](#judges-how-to-use-them-and-their-limits)
- [Singability: real sung renders decide](#singability-real-sung-renders-decide)
- [The checkpoint page](#the-checkpoint-page)
- [Devices that worked in the final lyric](#devices-that-worked-in-the-final-lyric)
- [Common mistakes](#common-mistakes)
- [Cost and time](#cost-and-time)
- [Reusable assets](#reusable-assets)

---

## Taste rules (the commissioner's verdicts; worked example: Neel)
These are Neel's verdicts, and they decided three rounds. Put the commissioner's rules, with their gold lines, in EVERY
writer's and judge's prompt from round 1. For a new commissioner, start from these as hypotheses and replace each with
their own verdict as it lands.

1. **Story and flow first.** "I felt like upping my p(doom) had more of a sense of storyline and flow"; "I would love if
   it was a more coherent narrative, it's a bit too all over the place." The round-1 author's pick was rejected as
   "too clumsy and in my face, like you've shoehorned a bunch of papers into lines and smushed them together."
2. **Poetic beats literal: an accurate idea inside an image.** Gold lines, use as style anchors:
   - "you packed five secrets into two, and never let them show" (superposition: 5 features in 2 dimensions) — "gold"
   - "the N-L-A read me what you thought but never said / but some of what it read me was a letter it wrote instead"
     (natural-language autoencoders sometimes confabulate) — "Omg I love this line"
   - "most pages stayed empty" (dead SAE latents, no number given)
3. **Nothing on the nose.** Specific names or numbers that can't be worked in naturally ("Wood Labs", "34 million,
   two-thirds dead", "258 errors, Kimi") go in the video background, not the lyric. Test every line: *would an expert
   follow it without the footnote?* ("read your sibling" failed: "I don't get the specific references in the NLA line").
4. **No self-quotes of the commissioner.** A spoken sample of Neel's own line ("Unfortunately, it replicates.") read as
   "on the nose / appears narcissistic". Near-verbatim echoes of his tweets also went ("kind of my job" was cut AFTER
   the audio was recorded and had to be muted out of the stem). Field slogans in the narrator's voice are fine and
   were loved ("just do what works", "(spoken:) Is it mech interp? — Wrong question!"). The commissioner's quotes work
   as on-screen cards.
5. **Variety across finalists.** "Maybe try to add more variation? These got kinda samey."
6. **Numbers only where they sing:** "point-nine-nine-nine", "mod one-thirteen", "eight percent expressed".
7. **When you de-jargon a line, keep a concrete claim.** "sometimes it just moved — not a word between" drew "What's
   the point?" and cost a Suno section re-sing.
8. **Use the commissioner's vocabulary and preferences:** Neel wants "latent" not "feature" on screen and dislikes the
   tuned lens as a technique; clumsy rhymes ("a cat face, then a car") get called out. For a new topic or
   commissioner, find the equivalents early (ask once).
9. **Tone:** affectionate, clever, optimistic but clear-eyed; "Punch at ideas, never at people." The MUSIC turned out
   sincere and a little sad (see audio.md); the humour lives in the words and pictures.

## Choosing the song's spine
**Default that worked:** a love song to the AI (or to the subject) told as a chronology, one era or subfield per verse,
each verse a new stage of the relationship. In "Don't Go Quiet On Me" the spine was *does the model talk to me?*:
"You never used to talk to me" → "Then you learned to talk" → "And then you thought out loud!" → "But you learned to
spot the watch" → "So I learned to hear the words you'd never say" → "Then Astra came". The section tags (e.g.
`2025–26`) later became the on-screen year stamp, the video's chapters and the YouTube chapter titles, so a
chronological spine pays for itself three times.

**Decide explicitly who "you" is** (the model, the field, the movement, the child, future people, the donated dollar):
the interp song's "you" was the model, and that choice shaped every chorus.

**But generate genuinely different spines before settling.** The ideation round should span frames such as:
- love song / breakup song / long-distance song to the AI, the field, the movement, or an idea
- the subject sings back (model POV; a charity dollar's POV; a future person's POV)
- a duet or argument between two camps (mech vs pragmatic; neartermist vs longtermist; doomer vs optimist)
- a parent, teacher, astronomer, detective, or naturalist narrator (round 3's best new frames)
- one character's arc (the newcomer's first year; a MATS scholar's project; a Giving What We Can pledger's decade)
- musical-theatre forms: the "I want" song, the villain song, the eleven-o'clock number, a list song, a patter song
- mock-epic / ballad of a voyage; a day-in-the-life; a court case; an advent countdown; a lullaby
For EA, AI safety, or other topics: see topics-and-references.md for era maps and spine ideas. The judges pick a
*varied* three to develop (`tools/judges.py rank --task concepts` returns `pick3`), and the history spine stays in as a
control unless the commissioner says otherwise.

## The .lyr source format
One source file generates the display lyric, the sung text, the notes, the judge view and JSON:
```
[Verse 3 | 2025: the pragmatic turn]
Then a plain old probe hit point-nine-nine-nine   ## refs: A2-negative-results   ## note: GDM (26 Mar 2025): a dense linear probe hit OOD AUROC "0.999.." ...
the tests were clumsy, cartoonish — and Sonnet, you'd guessed   || sung: the tests were clumsy, cartoonish, and SON-it, you'd guessed   ## refs: ...   ## note: ...
```
- `## refs:` ledger IDs; `## note:` the claim plus its source, verbatim quotes in quote marks. These notes later
  become the video's captions, the "things to spot" list and the public reference doc, so write them in the
  **third person** ("Neel's post", never "your post") from day one.
- `|| sung:` a phonetic respelling for the singer (SON-it, JAY-lens, EN-EL-AY). The display text never changes;
  display lyrics show the respelling as `〔sung:…〕`, stripped for public lyrics.
- `[Section | tag]` headers carry the era tag and production cues (`[Intro | whispered over one minor-key synth]`).
- Tool: `tools/lyricfmt.py` (`--stats` gives syllables per line). Bug fixed there: `|| sung:`
  must parse even when it comes after `## refs:`.

## The pipeline
Run this as the default; scale rounds to the commissioner's verdicts. Each numbered step names what to delegate.

1. **Fact sheet first** (from Stage 0, topics-and-references.md): the ledger digest, ~7k words, verified facts,
   model names as of today, a "NOT:" wrong version for each trap, phrases that are NOT verbatim quotes, off-limits list.
   Every writer and judge gets it. Never write an unverified fact into it: one bad pairing in the digest (Kimi's "But
   maybe we can cheat." attached to the wrong experiment) produced 6 high-severity errors across four drafts.
2. **~100 genuinely different ideas.** Fields per idea: title-hook, emotional frame, genre/BPM, central device, a
   two-line sample chorus, three references, category (love-to-subject, subject-POV, narrative, anthem, breakup,
   structure, meme, wildcard). Delegate: 3–5 writer agents with different frames each, then dedupe into one ideas
   JSONL file.
3. **Pre-register** your own top three before seeing scores (`lyrics/author_prereg.md`). It keeps you honest and
   shows the commissioner your taste vs the committee's.
4. **Blind judging** (see below). Shortlist ~16 for a deep review, then 5 finalists of genuinely different shapes.
5. **Develop finalists** over several revise → audit → re-judge rounds (the first project did 8 in ~40 minutes).
   Keep `lyrics/changelog.md` with TOOK / REJECTED / PROTECTED per round: you are the author, and "Don't let the
   committee sand off the weird, specific lines". Example: PROTECTED "five little feelings in two dimensions";
   REJECTED a judge's "a scheme, or just a tangled mind?". Do an author's pass when judges plateau.
6. **Mechanical audit before every judging round** (`tools/r2_audit.py` pattern): the commissioner's explicit asks are
   present (regexes), FORBID list (NOT-list phrases, banned specifics, and for a sequel every line of the earlier
   songs), provenance (any line with quote marks, a number, or a named model/paper must carry `## refs`/`## note`),
   length, and 5-gram overlap/stock lines across songs. A polish pass once silently deleted the only line answering
   one of Neel's asks.
7. **Fresh fact-check agent every round** ("You did not write these lyrics"): every claim, every quote mark must
   enclose verbatim text, every attribution; high/medium/low findings plus "Corrections to the fact sheet", which you
   append to the digest at the source. ~30 min and ~500k subagent tokens each; worth it every time.
8. **Sung sketches** of each finalist's chorus and "killing part" (see Singability).
9. **Length** from the syllable model (calibrated on one ballad at ~133 BPM; recalibrate from the first sketches for
   faster pop or patter): 2.7 sung syllables/s + 12 s (predicted 4:21 for the 4:22 song; a bars model
   said 3:12, a lines×2.5 s model was wrong too). `tools/syllables.py`. Ask the commissioner before adopting any
   length cap you found in notes: the 2:19 cap cost an hour of cuts Neel didn't want.
10. **Checkpoint page** → the commissioner's verdict → next round or lock.

**Round 2+ (after their notes).** Convert the commissioner's notes into explicit rules (one feedback-rules file per
round). Always include a **faithful revision** of whatever they annotated line by line (Neel's "conservative
implementation of my feedback", the control in every round): it won, as A'. Exempt its kept gold lines from "stock line" penalties. For variety, use
**fresh agents who haven't seen the old drafts, each with a different narrator/frame**; never hand all writers a
shared revision menu or the same arc order (that produced "samey"). A fresh agent's rewrite beat the author's 39–8.

## Judges: how to use them, and their limits
- **Models:** the best three you can reach on OpenRouter across two labs, chosen from OpenRouter's model list
  (first project: Claude Opus 5.5, GPT-6 Astra on `openai/flex`
  for half price, Claude Fable 5.1). On a tight budget, pre-screen the ~100 ideas with a cheap model on a flex tier
  down to ~30 first, and merge the deep review into the head-to-head. Client: `tools/llm.py` (prompt caching with `cache_control`
  ttl 1h on the shared brief+digest block, provider pinned to Anthropic for Claude models, first call alone to write
  the cache, logs every call's cost to a JSONL call log, stops retrying on classifier refusals). Run all judging
  of a round in ONE process: separate processes paid 5 cache writes (Fable $4.08 vs $1.83 for the same round).
- **Blind batches** of ~10 ideas, each judge with its own seeded shuffle and neutral labels.
- **Rubric v3 is the template** (`lyrics/judging/judge_brief_r3.md`): story, poetry, naturalness, hook, accuracy,
  singability, plus list fields `on_the_nose_lines`, `stock_lines`, `shoehorned_lines`, `narrative_breaks`, and the
  commissioner's verdicts quoted verbatim as calibration (Neel's, in the template). Calibrate scores against the
  reference song's lyric printed in the brief. Every prompt says: "Don't sand off strange, specific, clever lines …
  say so explicitly when a line is strange but great."
- **Z-score per judge** (`tools/r2_rank.py`), story as tie-break; scores compress (many 8/9/9) without it.
- **Head-to-head** (`tools/judges.py rank`): all drafts in one prompt, 2 shuffled orders per judge, Borda count; returns
  `samey_pairs` and, in concepts mode, `pick3`.
- **Limits, learned the hard way:** judges saturated at 8/8/8, under-weighted on-the-nose specifics and footnote-
  dependence, rewarded density, and in round 3 ranked the song Neel chose LAST (its kept gold lines counted as
  "stock"). Use judges for accuracy flags, shoehorn detection and rewrite suggestions — **never to pick the winner.**
  The commissioner picks; you recommend.

## Singability: real sung renders decide
- Judges' singability scores barely predicted what a singer can deliver. Render real sketches: ElevenLabs Music
  (~22 s per chorus, ~300 credits each; `tools/r2_sketches.py` + `tools/eleven_music.py`, text pulled straight from the
  `.lyr`). Suno is better but manual; save it for Stage 2.
- Check each with `tools/vocal_qa.py`: Demucs vocal stem, then two unprompted transcribers (gpt-4o-transcribe and
  mlx-whisper), word recall against the lyric, and which jargon terms were heard. Baseline: the famous reference song
  scored 0.81 recall and nobody heard "P(doom)", "FOOM" or "shoggoth", so jargon needn't be transcribable to work —
  but the line around it must be. The locked song scored 0.91–0.97 in Suno; "J-Lens" was never heard.
- Mishearings to expect, fix with `|| sung:` respellings: "logit lens" → "Hello, agent"; "forty-one authors" → "41
  offers" (160 BPM swallowed it); "Sonnet" → "Sonic"; "sums" → "songs"; "type hints" → "tighten". **Check for rude
  mishearings** ("cogs and all" was heard as a rude word; changed to "circuits and all").
- Prosody targets that fixed stuck singability: verses 8–11 syllables, choruses ≤8, matched across verses.

## The checkpoint page
Built by `tools/build_lyrics_page_r2.py` from a JSON config (example: `lyrics/round3/finalists_r3.json`). Per finalist:
pitch and "my view", lyrics where each line taps open to its source note, two sung sketches, round scores and
head-to-head, both length estimates; then the full ranked list of every idea with judge comments, and a reply builder.
Rules (see feedback-and-pages.md): **label songs with letters and number the verses** (Neel replied "A… 1 is fun, 3
is gold"; numbering songs 1–5 caused a clarification round); never mark proposed cuts with faint strikethrough (he
never read them on his phone); keep it legible at 400 px; post it to your async review channel and keep working.

## Devices that worked in the final lyric
Final: `lyrics/final/dont_go_quiet.lyr` (57 lines, 673 sung syllables, 4:22).
- **The hook is the thesis**: chain-of-thought monitorability became "keep talking — don't go quiet on me now".
- **Fixed four-line chorus with a rotating third line** that carries the arc: "every feature I can find" → "you wrote
  your thinking down — a window, not a blind" → "you said 'I think you're testing me' — so you'd read mine" (reversal)
  → "you light up 'loving' before you speak" → the last chorus breaks the frame: "so if you stop, I'll learn to read the quiet".
- **A killing part**: a stop-time gang shout, "(I AM THE GOLDEN GATE BRIDGE!)".
- **A spoken aside** and **undercutting backing vocals**: "(not all of it, but fine)", "(so, are we done?)", "(even one plus one!)".
- **A bridge as a parable with no names or numbers** (the band drops to handclaps): "you called the job a mountain — so
  I made the mountain small / and you climbed it like an angel — (just lazy, after all!)". The specifics went on screen.
- **A cut-off ending**: "keep talking — don't go quiet on me n—", band out on the last word. Every judge's favourite close.
- **Two songs merged**: the hook came from one round-1 finalist ("I just wanna read your mind") and the close from
  another ("don't you go quiet on me now"). Mixing and matching across finalists is allowed, and Neel did it.

## Common mistakes
| Mistake | Fix |
|---|---|
| Density-first rubric in round 1 | Story first; `shoehorned_lines` field; density goes to the video |
| Specific names/numbers in lines | Move to `## note:` and the screen |
| Echoing the commissioner's own words | Narrator's voice only; their quotes become on-screen cards |
| All drafts share one arc and menu | Fresh agents, different narrators, overlap check |
| Trusting judge rankings | Judges flag; the commissioner picks; always include their faithful revision |
| Unverified fact in the digest | Verify before it enters any brief; fix at the source |
| Struck-through proposals on the page | Full-contrast labels, listed separately |
| Treating the lyric as locked after audio | Get every cut agreed BEFORE recording (post-lock cuts mean muting stems or re-singing) |

## Cost and time
First project: judges $127 over 485 calls (Fable 53%, Astra 24%, Opus 23%; Neel raised the judge budget from $60 to
$400 at the first checkpoint, so ask early if more rounds would help); ~12k ElevenLabs credits of sketches; ~30 h wall
clock to lock across 3 rounds, ~10 h of agent work; Neel's turnaround was 12 min to 11 h (keep working meanwhile).

## Reusable assets
All in this repo: copy, then strip project content.

| Asset | Does | Project-specific |
|---|---|---|
| `tools/llm.py` | OpenRouter client, caching, pinning, flex, cost log, refusal stop | model IDs |
| `tools/judges.py` | modes `ideas`, `deep`, `lyrics --mode r2/r3`, `rank --task drafts/drafts3/concepts` | prompt texts (commissioner notes, anchors, lanes) |
| `lyrics/judging/judge_brief_r3.md` | best judge-brief template | interp content |
| `tools/lyricfmt.py`, `tools/syllables.py` | .lyr → views/stats; length models | syllable rate calibration |
| `tools/r2_audit.py` (+ `tests/test_r2_audit.py`) | asks / forbid / provenance / overlap audit | the regexes |
| `tools/r2_rank.py` | per-judge z-scores, control marker | — |
| `tools/r2_sketches.py`, `tools/eleven_music.py`, `tools/vocal_qa.py` | sung sketches and transcribe-back QA | plan JSON |
| `tools/build_lyrics_page_r2.py` | config-driven phone checkpoint page | config per round |
| `lyrics/round2/variation_briefs.md`, `lyrics/round3/drafting_instructions_r3.md` | drafting-agent templates | content |
| `lyrics/round3/factcheck_brief_r3.md` | fresh fact-checker template | paths |
| `lyrics/changelog.md`, `lyrics/author_prereg.md` | TOOK/REJECTED/PROTECTED log; pre-registration | — |
