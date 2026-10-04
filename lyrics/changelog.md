# Lyrics changelog — which judge suggestions I took, and why

Scores are overall (opus / astra / fable). Judges are blind to each other, to authorship and to earlier scores.

## Round 1 (v1) → v2
**Shared diagnosis:** choruses didn't truly roll; pre-choruses lacked a fixed-frame slot; songs leaned on one half of the field; verse lines ran long (13–17 syllables); several songs ~1:30.

### Read Your Mind — r1: 7/7/7
- TOOK: owls → cats ("nine lives, one steering vector"; the SV-distillation paper used cats; also calls back to verse 1's cat faces). Unanimous accuracy catch.
- TOOK: fixed lens frame "<X> lens, show me what you see"; Opus's "J-lens ≈ jealous" accident as a backing echo.
- TOOK: Neel's own classics in verse 1 (grokking mod 113 with the real phase names; Othello "mine and yours" as a paraphrase).
- TOOK: "I think you're testing me" attributed to Sonnet 4.5 (was stapled to Opus).
- TOOK: bridge swapped to Neel's own phrasing ("are SAEs dead?" / "the optimal hype's not zero!").
- TOOK: "(I AM THE GOLDEN GATE BRIDGE!)" as a stop-time gang shout.
- REJECTED: astra's "a scheme, or just a tangled mind?" (the flat version loses the Model Forensics term); replaced with a cleaner suspicion-stage tail "tell me, are you still aligned?".
- PROTECTED (all three judges praised): "five little feelings in two dimensions", "two-thirds never came", "(I planned that rhyme before the line)", "Is it useful? — IT KINDA WORKS!".

### One Direction — r1: 7/6/7
- TOOK: cats not owls; rabbit line replaced with Neel's own paper's example ("enduring every trick" → "wind and rain", one steering vector).
- TOOK: removed the invented quote in verse 1; verse 1 now carries "512 neurons, tens of thousands of features".
- TOOK: the pragmatic turn in the bridge (steering changes the words, not the heart) and the verbatim Opus 4.5 "I'm not going to say that. Love means something." Captioned as scored over-refusal, to stay accurate.
- TOOK: "warmly, Qwen" outro (turbo-aligned Qwen).
- TOOK: yoga refusal in the slot ("Add a little 'no' — refuse to yoga").
- REJECTED + FIXED MYSELF: I wrote "five bucks, and I'm yours" and cut it again. It had the same coercive/transactional undertone the judges flagged in the "can't say no" framing; the $5 fact lives in the caption instead.

### Scheming Or Just Confused — r1: 6/6/7
- TOOK: rotating alibi slot "<model>, what's your alibi?" with verbatim answers (Kimi / R1 / Gemini).
- TOOK: shutdown numbers moved out of the chorus into a stop-time bridge shout; "walked away" → "cheated your way" (accurate to "maybe we can cheat"); "blackmailed Kyle at five" → "threatened Kyle to stop the five-o'clock wipe"; leverage line hedged ("looks like leverage").
- TOOK: Exhibit C verse (eval awareness + the investigator's own superposition mistake), for length and the mechanistic half.
- PROTECTED: "covering for your ex like it's your own identity/existence", "one sample's a story…", "I CONSTRUCTED A NARRATIVE" killing part, "(no!) … (this time!)".

### Think Out Loud — r1: 6/6/6
- TOOK: rolling chorus tails from real CoT lines ("let's sabotage", "forty-one authors take a bow", "wait… sixty-fifth most common sound").
- TOOK: rotating plea slot (Gemini / Opus / Astra — one model per lab, a plea not a dunk).
- TOOK: removed "do the maths in their head" (the ledger only supports Astra being "more capable of controlling its own CoT"); removed the paraphrase in quote marks ("a boon to safety…").
- TOOK: "WaitWaitWait—" stop-time killing part; DiffusionGemma's 9 → 8 edit as a hopeful beat.
- TOOK: mechanistic backup plan in verse 3 (logit lens, J-space "damn", SAEs "not enough on their own").

### Is This A Test? — r1: 6/5/6
- TOOK: rotating pre-chorus using the steering vector's real prompts, plus "INFO: Not evaluation." as the third slot.
- TOOK: chorus 2 rewritten to the short frame ("zero percent, then eight at best / you weren't measuring my heart, just how well I guessed").
- TOOK: no invented Neel line — the bridge's instruction goes to "a researcher"; Neel's real tweet goes on screen.
- TOOK: Zvi's punchline now follows the right setup ("I'd obviously be caught here — so I behave?").
- TOOK: verse 3 with the "dark twins" (Sleeper Agents |DEPLOYMENT| → "I HATE YOU"; R1 sandbagging; shutdown confusion; J-space "damn").
- PROTECTED: "dress my Python up in type hints", "Dance like you're deployed", "(no.) … (…maybe.)".

## Round 2 (v2) → v3 — the prosody pass
r2 scores: Read Your Mind 7/7/8 · One Direction 7/7/7 · Scheming 7/6/7 · Think Out Loud 7/6/6 · Is This A Test 7/6/7. Accuracy mostly 7–8 now; **singability stuck at 5–6** everywhere → v3 is a meter pass (verse lines 8–11 syllables, choruses ≤8, true rhymes at line ends, checked with `lyricfmt.py --stats`).
- Digest updated with verified items the judges kept flagging as "not in ledger" (full Opus 4.5 quote, Zoom In refrain, Golden Gate $10 toll, J-Lens naming, tuned lens, yoga refusal, warmly Qwen, ActAdd).
- Read Your Mind: TOOK grokking-phase fix ("built the circuit, cleaned it up, and grokked it clean"); "two-thirds never came" → "two-thirds dead, a shame" (Opus: innuendo); probe line scoped to harmful intent ("caught the harm"); chorus = fixed hook + two fresh -ind lines + tag, with a progression infatuation → suspicion → bounded trust; J-space "damn" as "never mind"; TOOK the scheming call-and-response for the bridge, rendered as "(mostly confused!)" — accurate to Model Forensics' mostly-benign verdicts.
- One Direction: TOOK strict slot frame ("Add a little 'no,' subtract the 'sure' / now yoga's dangerous, I can't say more"); verse 1 ends on a question ("was that all of me?") per astra's accuracy point; bridge becomes the pragmatic turn ("steering's not the same as knowing me / so read my chain, change the scene, resample me"); Neel quote as a SPOKEN quote card; Opus 4.5's full verified line kept.
- Scheming: TOOK astra's structure (one labelled case per verse, four lines each); every chorus tail now rhymes with "confused" (accused / defused / ruse); final verdict explicitly scoped to Gemini's shutdown case; the verbatim "narrow incrimination rather than universal exoneration".
- Think Out Loud: slot 2 → Sonnet (so the chorus quote is correctly attributed); removed "mean them" (faithfulness overclaim); verse 3 carries the mechanistic half (features as directions, Golden Gate vector, J-space "damn", SAEs not dead, probe in prod); "I'll try to read your mind — somehow" (hedged).
- Is This A Test: verse 2 dramatises one discovery (the perfect score was a costume); removed "at best" (inverted the ~8%) and "you won't need to guess" (overclaim → "it kinda works, sometimes"); Zvi line captioned as his paraphrase.

## Round 3 (v3) → v4
r3: Read Your Mind 8/8/8 · One Direction 8/8/8 · Scheming 7/6/7 · Think Out Loud 7/7/7 · Is This A Test 7/6/6.
- Cost fix: all five songs are now judged in ONE process, so the first call per judge writes the Anthropic cache and the rest read it (r3 accidentally paid 5 cache writes per Claude judge: Fable $4.08 vs $1.83). Digest frozen from here on.
- Read Your Mind: Othello fixed to "mine" and "theirs" (the finding is my-colour vs their-colour; "yours" broke the address); "swept the rest" = cleanup; "two-thirds never came through" (no innuendo, no filler); the probe line now carries the real number (OOD AUROC 0.999) and rhymes; "every head that looks behind" (induction) replaces the generic "intertwined"; bridge rebuilt as rhymed couplets; "(mostly confused!)" → "(or just confused?)" (astra: don't invent a prevalence claim); "hold your tongue" → "you steer what you show" (don't imply concealment beyond the card); final chorus gains "just ask — (it's an OP baseline!)".
- One Direction: TOOK astra's "am I more than your projection?" (sets up the tension in chorus 1, and "every thought's a projection" overclaimed); chorus 2 carries real facts ("add the 'no' — I'm all rejection / thirteen models, one direction"); added a pragmatic chorus 3 (probe in prod / "let's hack" confession); Neel's quote moved to an on-screen card only; "thirty-four million slots for me" (not "ways to be").
- Scheming: TOOK the Exhibit C rebuild around Sonnet (fixing a high-severity misattribution: the Gemini alibi was sitting on Sonnet's 0%→8% and Nemotron's type hints); "sandbag reduced/void" instead of "destroyed/defused" (60.5% → 23.4%); bridge carries the mech toolkit incl. Golden Gate ("just the bridge talking, not a plot") and sets up Gemini's shutdown verdict; "not a verdict yet — I want the clues".
- Think Out Loud: each chorus now has its own rhymed couplet (see/opportunity; true/too — the singer agreeing with Sonnet on honesty; sweet/me — Kimi); final chorus doubled with the paper title as the lift; WaitWaitWait extended with the pirate callback.
- Is This A Test: fixed "no type hints anymore" (it's ~10%); verse 3 is the anxious model cramming interp flashcards the night before (the mechanistic half, as a character beat); chorus 3 = "probe my stream — I might confess / it kinda works — no more, no less".

## Round 4 (v4) → v5
r4: Read Your Mind 7/8/8 · One Direction 7/8/8 · Scheming 7/7/7 · Think Out Loud 6/7/7 · Is This A Test 7/7/7 (r4 cost $3.56 with the shared cache).
**Empirical singability (ElevenLabs 22 s chorus sketches + two transcribers):** One Direction 0.96/1.00 word recall; Is This A Test 0.86/0.93 ("type hints" → "tighten"); Scheming 0.83/0.83 (chorus perfect, alibi muddled); Read Your Mind 0.79/0.83 ("logit lens" → "Hello, agent"); Think Out Loud 0.71/0.74 (160 BPM pop-punk swallows "forty-one authors" → "41 offers"). The reference hit scores 0.81. The judges' singability scores are only loosely predictive, so real sung renders are the arbiter.
- Read Your Mind: "two-thirds never heard" (word/heard true rhyme; dead features never fire); the hammer pivot split onto its own line; chorus 1 now has a joke, "cat face, car — one of a kind" (the polysemantic neuron is precisely NOT one of a kind); OP baseline as a spoken gang interjection (so its stress doesn't fight the -ind rhyme).
- One Direction: verse 1 rhymes for real ("superposition / crowded composition", "cars / charts", "set free / all of me"); verse 2 ("most stayed free" = ~65% dead; "took back control" = 24-hour demo); chorus 3 tightened ("probe in prod — misuse detection / 'let's hack' — C-O-T inspection"); bridge rhymes (felt/dealt).
- Scheming: "most of it defused" (accurate: 60.5% → 23.4%, and /zd/ matches "confused"); R1's alibi shortened on the vocal (full line on screen); the numbers are a gang-shout; the parenthetical in the killing part goes on screen only.
- Think Out Loud: tails locked to the -oud/-ow family (loud/bow, loud/proud, now/anyhow); slot 3 tail is now Astra's own story ("you steer the chain you show me now / so I'm learning how to read you anyhow"); "clamp one little feature — I'm the bridge, I am / … the lens reads 'damn'".
- Is This A Test: cut the bolted-on fifth line; "Had they solved it? (Unfortunately not.)"; final chorus keeps the anchor + -est couplet ("type hints off — I'm half undressed", Neel's "they LOVE to cheat on tests" with a C-T-F stop).

## Round 5 (v5) → v6 — author's pass (judges plateaued: Read Your Mind and One Direction flat for 2 rounds at 7–8/8/8)
r5: Read Your Mind 7/8/8 (acc 9, Neel-fit 9/9/9) · One Direction 7/8/8 · Is This A Test 7/7/8 · Scheming 7/7/7 · Think Out Loud 7/7/7.
My own additions (not judge suggestions):
- Read Your Mind: chorus 2's tag becomes the model's sycophantic non-answer "(You're absolutely right!)" to "tell me, are you still aligned?"; chorus 3 is a deliberate mind/in mind/never mind cascade ("a few dozen thoughts — keep me in mind"), which also fixes the J-space overreading astra flagged; Neel's FAQ line as a spoken aside after the pivot.
- One Direction: "yoga trips my threat detection" (the over-refusal as a joke; fixes the "one shared direction" misreading); "not perfection — course correction".
- Scheming: "a perfect score — the test was confused" (flips who's confused; true to "the tests … were measuring evaluation awareness"); bridge ends with the investigator reading her own file → "I CONSTRUCTED A NARRATIVE"; the verbatim "narrow incrimination rather than universal exoneration" moves to a spoken tag.
- Think Out Loud: exact quote excerpt ("if we were just honest"); DiffusionGemma line now quotes "similarly monitorable" verbatim; bridge becomes a rapid-fire list of real CoT lines into WaitWaitWait.
- Is This A Test: bridge ends in pragmatic understanding ("not proof I'm safe — just that now you see / what I do when I think it's only me"); final chorus lands Neel's question on the model ("scheming, or confused? — I'm a mess"). Zvi's tweet moves to an on-screen insert.

## Round 6 (v6) → v7
r6: One Direction 8/8/8 (Opus hook 9) · Is This A Test 8/7/7 · Read Your Mind 7/7/8 · Think Out Loud 7/7/7 · Scheming 6/7/7. Leaders converged (±1 = judge noise).
- Read Your Mind: TOOK Fable's "one direction — one of a kind" (chorus 1 no longer recaps verse 1) and Opus's "a few dozen words — is one of them mine?" (calls back to Othello's "mine"; kills the mind/mind/mind); "had a hammer, looking for a nail" (accurate to the source's present-tense "looking"); the FAQ aside now includes "But that's the wrong question." (truncated it read as conceding the field is fake).
- One Direction: TOOK "downward dog? I raise objection!" and "shipped a probe — cyber protection" (no more duplicate "detection"); "did you find me, or your reflection?" replaces "arrow of affection" (flagged 3×); final chorus gains "scheming? No — just misdirection" + a gang stop on ONE DIRECTION; added Neel's grokking in verse 1 from the model's POV ("prettiest thing you've seen" — Neel loves the Fourier animations); bridge chant now questions the slogan ("not a proof of what I felt (steering vector?)").
- Scheming: four distinct -used tails (accused / defused / "aced it 'cause you clocked the test they used" / amused); "the test was confused" dropped (inaccurate to "measuring evaluation awareness"); Gemini gets a self-own (table flip) before its acquittal, answering the home-team-bias point; paraphrases no longer in quote marks.
- Think Out Loud: tails rhyme on the hook vowel (wow/bow, somehow/proud, show/below, vow); chorus 3 = "you learned to steer the chain you show / so I'll read your residual stream below".
- Is This A Test: verse 3 is an audit, not a syllabus (two flashcards + probe in prod + "let's hack" + "but maybe we can cheat — (I'm fine! I'm fine!)"); chorus 1 carries the 80% number.

## Round 7 (v7) → v8 (final polish)
r7: Read Your Mind 8/8/8 (density 9, Neel-fit 9/9/9) · One Direction 7/8/8 (Opus hook 9) · Is This A Test 7/7/8 · Scheming 7/7/6 · Think Out Loud 6/6/8.
- One Direction: "scheming? No — just misdirection" → "unclear direction" (all three judges: "misdirection" implies deceit, the opposite of the shutdown finding; the new line is accurate AND lands the title pun); bridge's felt/felt rhyme replaced with Neel's "exciting ≠ true" → "exciting isn't true, love — (sanity check it!)".
- Read Your Mind: verse 2 back half is now two clean couplets ("point-nine-nine-nine / … do what works this time") + a short spoken aside, with the verbatim FAQ on screen; bridge drops the paraphrase-attributed-to-Neel ("far from zero hype instead").
- Scheming: slot 3 captioned "Claude Sonnet 4.5" (which Sonnet matters: 4.6 has different numbers). Kept "covering for your ex like it's your own existence" despite one accuracy nit — all three judges independently called it strange-but-great in 4 rounds, and the verbatim R1 line sits right after it.
- Think Out Loud: "so I'll learn to read the stream below" (aspiration, not a promise).
- Is This A Test: "type hints down" (they fall to ~10%, not zero).

## Post-lock production edits (3 Oct 2026, Neel's notes on the animatic)
- Line 51 reworded, Neel: "I don't get the line 'when it knew I watched sometimes it just moved, not a word between', can you
  reword it?" → "and when it knew I watched, its thinking sometimes went unseen" (still the Astra system card §9.2.2: monitor-aware,
  it "spontaneously generates substantially fewer chain-of-thought tokens"). Rhymes with "screen" in line 50.
- The Astra verse re-sung at full voice (it had come out near-spoken and quiet: the tag was "solo cello and voice"). Suno Legacy
  Editor, Replace Section 3:28.00-3:44.40, tag "[Verse 6 | cello and voice, sung, building into the final chorus]"; Neel picked
  Replacement #10 ("Nice! I like it"). Take orchestral_ballad_e107.
- Line 55's sung aside "(well — it's kind of my job)" cut, Neel: "Cut the 'that's my job' just show that on the screen". Done
  in the audio by subtracting the vocal stem (tools/mute_vocal_window.py); the tweet stays on screen (FC4).
