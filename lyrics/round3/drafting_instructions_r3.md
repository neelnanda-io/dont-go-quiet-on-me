# Drafting instructions: round 3 (for each drafting agent)

## The project
We are writing an original pop song about **interpretability** (reading what's going on inside AI models) for Neel Nanda, who leads Google DeepMind's mechanistic interpretability team. It becomes an animated K-pop-flavoured music video for X/Twitter, in the spirit of the viral "I'm Upping My P(doom)". The audience is interp and AI-safety researchers, who check every reference, plus their normie friends, who should still enjoy it. Tone: affectionate, clever, clear-eyed. Punch at ideas, never at people.

Round 2 ended with five songs; Neel's verdict decides round 3. **Read these first, in order:**
1. `lyrics/round3/feedback_neel.md`: Neel's verdict, verbatim, and what it means. This is the most important input.
2. `lyrics/judging/judge_brief_r3.md`: his taste, and the rubric three LLM judges will score you on.
3. `lyrics/round3/anchors_r3.md`: the two round-2 songs he commented on, with his notes; the couplet he loves; and **the list of round-2 stock lines you must not reuse**.
4. Your concept (quoted in your task), plus all six judges' notes on it: the section for your concept in `lyrics/judging/r3_concepts/ranking.md`. Take the notes seriously; they are specific.
5. `refs/ledger_digest_r2.md` and, as needed, `refs/round2/*.md`: the verified facts. **Use only facts from these files.** If something isn't there, don't claim it.

## What Neel wants (his words decide ties)
- **Poetic beats literal.** His favourite lines carry an accurate idea inside an image: "you packed five secrets into two, and never let them show" (superposition) and "the N-L-A read me what you thought but never said / but some of what it read me was a letter it wrote instead" (natural language autoencoders are useful but confabulate). Aim for that. Do NOT reuse either line; they belong to another song.
- **Nothing on the nose.** A name or number that can't sit naturally in a lyric (he cited "Wood Labs" and "34 million, of which 2/3 were dead") goes in the video background, not the lyric. He didn't understand "the N-L-A read your sibling": if an expert needs the footnote, cut it. Your `## note:` fields carry the specifics for the on-screen annotations.
- **One coherent narrative.** One frame, carried all the way through. Each section is the next beat of the story, not a new exhibit. Don't leave the frame for a verse.
- **No self-quotes.** Nothing Neel himself wrote, sung or spoken as a sample. A job-security joke in the narrator's own words is fine.
- **Variation.** The round-2 songs were "kinda samey". Your song must not sound like the others: its own device, images, hook and lines. The stock list in the anchors is banned, and the audit enforces it.

## The story to carry (a menu, not a checklist: leave a beat out rather than shoehorn it)
1. Early interpretability: individual neurons, circuits, superposition (more features than dimensions), grokking.
2. The dictionary era: sparse autoencoders learn a "dictionary" of features; many features are dead; clamping a feature changes behaviour.
3. The pragmatic turn: stop trying to understand everything; do what works on real safety problems (cheap probes that flag harmful intent, deployed in production).
4. Models start to talk (chat models, late 2022), then to **think out loud**: reasoning models' chains of thought can be read and monitored, a new and fragile opportunity.
5. Eval awareness: models often notice they're being tested and behave better when watched; tests with obvious cues; a "perfect" score that dropped when the awareness was suppressed.
6. Reading what isn't said: the J-Lens / J-space (a small, evolving set of unspoken words a model is "thinking"), natural language autoencoders (turn activations into text; useful, but sometimes invent details), activation oracles (models trained to read activations; still unreliable), emotion probes (a "loving" direction rises before the reply; steering it up breeds flattery), and the dream of models doing interpretability for us.
7. Model forensics: when a model misbehaves, ask WHY. Read its reasoning, change the setup, re-run. Verdicts are often mundane (laziness, confusion), not scheming.
8. GPT-6 Astra (Sep 2026): it can do far more reasoning without writing it down, so its chain of thought is harder to monitor. It is narrowing, not shut: its reasoning is still generally readable, and its quiet chain of thought was a requested test.
9. A darker ending: we still need interpretability, and the window is narrowing. Add a wry job-security note in the narrator's own words.

## Format: `.lyr` (see `lyrics/round3/drafts/A_dont_go_quiet.lyr` for a worked example)
```
# Title
[Section | musical cue for the singer and the band]
a lyric line   || sung: respelling for the AI singer (only if needed)   ## refs: ledger IDs   ## note: the source and why it's accurate
(backing vocal or ad-lib in parentheses)
(spoken:) a spoken line
```
- Respell acronyms in `|| sung:` (N-L-A → EN-EL-AY, J-Lens → JAY-lens); write numbers as words.
- Every line that makes a factual claim gets `## refs:` and a `## note:` naming the verified source (and the precise fact, for the on-screen annotation).
- Quote marks only around text that is verbatim in the ledger.

## Length and craft
- **≤ 48 sung lines and ≤ ~520 sung syllables** (about 3:00–3:25). Tight beats padded.
- Mostly 6–12 syllables a line; real rhymes; key words on stressed, sustained notes.
- A chorus with a fixed anchor line and a payload that moves the story (the "rolling chorus"). One killing part: a 1–2 bar moment people will clip.

## Validate before you finish
```
python3 tools/lyricfmt.py lyrics/round3/drafts/<file>.lyr                 # must print "ok"
python3 tools/r2_audit.py --round 3 lyrics/round3/drafts/<file>.lyr       # must show 0 errors; read every warning
```
Then read the song top to bottom as one story. Every line should earn its place.

## Deliverables
- `lyrics/round3/drafts/<file>.lyr`
- `lyrics/round3/drafts/<file>.concept.md`, at most 250 words:
  - the hook and the frame;
  - how each story beat appears (or why it's left out);
  - accuracy judgement calls;
  - what makes this song different from A', B' and the round-2 stock.

Do not call any LLM judges, do not commit to git, and do not edit files other than your own. When done, reply with: the file, its line and syllable counts, the hook, and the one line you're proudest of.
