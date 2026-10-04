# Round 2: variation briefs (34) and the shared rules for every draft

Backbone: B, "Read Your Mind" (lyrics/finalists/read_your_mind/v9.lyr). Neel's feedback: lyrics/round2/feedback_neel.md. Anchors the judges see: lyrics/round2/anchors.md.

## Shared rules (every draft)

**Neel's asks (all drafts, unless the brief says it deliberately bends one, and then say so in the concept file):**
1. B's historical arc is the spine: 2020 microscope crush → dictionary (SAE) era → **the pragmatic turn as its own verse, after the SAE stuff** → **a short eval-awareness verse** (Wood Labs; Sonnet seeming perfectly aligned; tests with really obvious cues) → **a verse on the J-Lens (global workspace), activation oracles and their issues, NLAs, and the dream of meta-models**, leaning toward "just get the models to do interp for us" → **close on GPT-6 Astra: its chain of thought is really hard to monitor; a darker ending** (why we still need interp; wry "job security").
2. **No tuned lens.** **NLAs must feature.** Use the **J-Lens paper** and the **emotion-probes paper** (Anthropic's emotion concepts) for rich, specific content, but never make "functional emotions" the hook (a viral song already owns it).
3. Welcome grafts: D's verse 3 ("Your misalignment hit zero — should I be impressed? …") and D's chorus ("Are you scheming, or just confused?"); a verse or two on **model forensics**; E's spirit and its final chorus ("Think out loud! … don't you go quiet on me now / a new and fragile opportunity").
4. Lines Neel did not read (struck through on his phone) are fair game: they are unreviewed, not rejected.

**Taste (Neel, verbatim about draft A):** "clumsy and in my face, like you've shoehorned a bunch of papers into lines and smushed them together"; B had "much more flow, makes more sense, I like the historical arc". So: **storyline and flow first.** Each line is the natural next beat of the story (a relationship, an era, a feeling); the reference rides inside the beat. If a line only exists to name a paper, cut it or give it a story job. Fewer, better references beat more references.

**Accuracy:** every claim must be supported by `refs/ledger_digest.md` or the verified round-2 notes in `refs/round2/*.md`. Quote marks only around text that is verbatim in those sources; otherwise paraphrase with no quote marks. Never invent a quote or a number. Mind the NOT lists (e.g. Astra's architecture is unconfirmed; "scheming or just confused?" is not anyone's quote; SAEs are not "dead"; NLAs confabulate; the J-space paper takes no position on consciousness). Section 11 of the digest is off-limits.

**Singability:** mostly 6–12 syllables per line; jargon on stressed notes and at line ends; spell acronyms for the singer with `|| sung:` respellings (S-A-E → ESS-AY-EE, N-L-A → EN-EL-AY, CoT → SEE-OH-TEE or "chain of thought"); numbers as words; lines must scan.

**Length:** a natural, tight pop song: about 44–56 sung lines (≈2:30–3:15 at ~140–150 BPM), unless the brief says otherwise.

**Format:** write `lyrics/round2/drafts/NN_slug.lyr` in the .lyr format:
```
# Title
[Section | musical cue]
display line   || sung: singer's respelling (only if different)   ## refs: IDs   ## note: what it refers to and why it's accurate
```
Every line with a reference gets `## refs:` (ledger IDs such as NF-04, B1.06, I3, M4, or R2-<file>:<topic> for the round-2 notes) and a one-sentence `## note:`. Then write `lyrics/round2/drafts/NN_slug.concept.md`: 3–6 sentences (the concept, the hook and device, how it handles each of Neel's asks, where it deliberately deviates from B, and expected drift 0–10).

## The 34 briefs

### Close to B: B's hook and story, different devices (01–06)
- **01 B-cons (the control; written by the lead author).** B plus Neel's feedback, as conservatively as possible: B's lines kept wherever they still fit, the tuned lens replaced, the new verses (pragmatic, eval awareness, J-Lens/oracles/NLAs/meta-models, Astra) added in Neel's order, B's bridge and final chorus kept, and a dark Astra coda. Drift ≈1.
- **02 Lens Ladder.** The pre-chorus slot names each era's tool ("Logit lens… / Dictionary… / Plain old probe… / J-Lens… / N-L-A…, show me what you see"); the last slot is Astra's chain of thought, and it shows nothing: the slot fails, and the song goes dark. Drift ≈3.
- **03 So Over / So Back.** B's bridge becomes the song's spine: every era is a cycle of hype and heartbreak (SAEs → "are SAEs dead?" → probes win; Sonnet scores zero → "unfortunately not"; J-Lens dazzles → false positives; Astra → over). The chorus answers each cycle; the last cycle doesn't resolve. Drift ≈4.
- **04 Anniversary.** Each verse opens with a spoken year ("2020." "2023." "2025." …): six years of a relationship told as anniversaries; year seven is Astra, and the anniversary card comes back blank. Drift ≈3.
- **05 Duet with the model.** The researcher sings B's arc; the model answers every era in backing vocals made only of REAL model outputs from the ledger ("I AM THE GOLDEN GATE BRIDGE!", "I think you're testing me", "But maybe we can cheat.", "Love means something.", an NLA-style "(this is real)"). In the Astra coda the backing vocal is silence. Drift ≈4.
- **06 Hook Mutation.** B's hook changes as the story does: "I just wanna read your mind" → "I just wanna read your chain" (CoT era) → "I just wanna hear you think" → the last chorus, "I can't read your mind." Drift ≈4.

### Hook grafts and new hooks (07–12)
- **07 Two Choruses.** First half: B's chorus. After the pragmatic verse the chorus flips to D's "Are you scheming, or just confused?"; the final chorus stacks both hooks. Drift ≈4.
- **08 Think Out Loud Finale.** B's body; the Astra verse sets up E's final chorus as the ending ("Think out loud! … don't you go quiet on me now / a new and fragile opportunity…"), now darker because Astra has gone quiet. Drift ≈3.
- **09 Say It In Words.** New hook about verbalisation ("just say it in words"): the whole history as trying to get the model's thoughts into words (logit lens → dictionary → probes → J-space's verbalisable workspace → NLAs → CoT), and Astra stops saying it in words. Drift ≈6.
- **10 Show Me What You See.** B's pre-chorus frame promoted to the chorus hook; each chorus's payload is what the tool of that era shows. Drift ≈5.
- **11 What's On Your Mind?** A conversational hook the researcher keeps asking; the model's replies (real quotes, or what the tools revealed) are the gags; the last answer is a blank chain of thought. Drift ≈6.
- **12 Don't Go Quiet On Me.** E's line becomes the hook of the whole song; darker from the start, the history as an attempt to keep the model talking; Astra is the climax. Drift ≈6.

### Frames and points of view (13–20)
- **13 The Model Sings Back.** B's arc sung by the model to the researcher ("you just wanna read my mind"): teasing, self-aware, a little menacing by the Astra verse ("you'll never read my mind"). Must stay affectionate. Drift ≈7.
- **14 Mentor To Scholar.** An old interp researcher tells a new MATS scholar the history ("when I started, we had logit lenses…"); ends on the dark punchline that there's plenty of work left: job security. Drift ≈6.
- **15 Case Files.** D's detective frame over B's history: each era a case file; D's chorus; the eval-awareness verse is D's verse 3; a model-forensics verse (Kimi, R1, "I CONSTRUCTED A NARRATIVE"); Astra is the case nobody can crack. Drift ≈6.
- **16 Couples Therapy.** Researcher and model in "model psychiatry" across the eras; the emotions paper is the therapy (turn down desperate, turn up calm); the J-space is finally saying what you really think; Astra stops coming to sessions. Drift ≈7.
- **17 Lab Notebook.** Dated notebook entries, half-spoken; the last page (Astra) is blank. Drift ≈6.
- **18 Vows.** Written as wedding vows and anniversaries: "I promise to read your mind" → the vows tested by each era → Astra breaks the vow of transparency. Drift ≈6.
- **19 Mind-Reader Act.** A stage mentalist's act across the eras ("pick a feature, any feature"); the final trick fails on Astra. Drift ≈7.
- **20 Long-Distance.** The relationship goes long-distance as models get bigger and more opaque: letters (CoT) get shorter; Astra stops writing. Drift ≈6.

### Centred on the new papers (21–24)
- **21 Feelings As Directions.** The emotions paper as the song's heart (desperate up → more blackmail and cheating; calm up → less), woven through B's arc; NOT the hook. Drift ≈5.
- **22 Workspace.** The J-space as the romantic climax ("a few dozen thoughts, and I'm one of them"), NLAs as the translator; the darker ending is a workspace that stops being verbalisable. Drift ≈5.
- **23 Meta-Model Dream.** The last act imagines models doing interp for us ("I trained a model to read your mind"; oracles reading oracles) with the recursion joke (who reads that one?) and the darker punchline: the models will need us anyway: job security. Drift ≈5.
- **24 Round Trip.** An autoencoder device: each chorus comes back "translated" (activation → English → activation) and slightly wrong, like NLA confabulation; comedy that lands a point. Drift ≈7.

### Endings (25–28)
- **25 False Happy Ending.** The song ends on B's triumphant "IT KINDA WORKS!"; then a cold coda: the news of Astra, and a slowed, minor-key reprise of the hook. Drift ≈3.
- **26 Job Security.** A darkly funny ending: the models won't take the interp jobs, because someone has to read them; the laugh curdles. Drift ≈4.
- **27 The Race.** Framed by Dario's verbatim "a race between interpretability and model intelligence": the eras as laps; the song ends mid-race with Astra pulling ahead. Drift ≈5.
- **28 Words Drop Out.** The final chorus loses words, progressively, like a chain of thought going dark, until only the beat is left (a video device). Drift ≈4.

### Bold structure and genre (29–34)
- **29 Rap History.** The verses are a tight rap through 2020 → 2026 (dense but narrative), with B's sung chorus; shorter overall. Drift ≈5.
- **30 Ballad To Banger.** Starts as a slow ballad (the 2020 crush); each era gets faster; Astra is a breakdown to silence. Drift ≈5.
- **31 Eras (K-pop comeback concept).** Each verse is a K-pop "era" with its own concept name (superposition era, dictionary era, pragmatic era, awareness era, workspace era, Astra era); B's hook. Drift ≈5.
- **32 Short And Tight.** The shortest version that still hits every ask (about 32–38 lines, ≈2:00): tests whether less is more. Drift ≈3.
- **33 Forensics Double.** B's spine plus TWO model-forensics verses (Kimi's "But maybe we can cheat.", R1's sandbagging and "We are the same model…", Opus 4.6's "I CONSTRUCTED A NARRATIVE"), per "a verse or two on model forensics would be great". Drift ≈4.
- **34 Cold Reading.** A psychic's "cold reading" (guessing a mind from surface cues: the chain of thought, behaviour) versus "hot reading" (reading the internals); interp as learning to read hot; Astra forces us back to reading cold. Drift ≈7.
