# Figures and title cards: "Don't Go Quiet On Me"

What can go on screen for every referenced lyric line: the paper or post, its exact date, the figure to redraw, verbatim on-screen text, the credit line, and the year counter. Written 2026-10-02 from the locked lyrics (`lyrics/final/dont_go_quiet.notes.md`, `.display.md`) and the verified research files (ledger, digest §13, round-2 notes, round-3 fact-check, `refs/papers/*.md`, saved source texts, tweet exports).

**Conventions**
- Text in "double quotes" in the **Reference**, **On screen** and **Numbers** fields is verbatim from the source (machine-checked against the saved source texts, the tweet exports, or a research file that read the source). Inner curly quotes are the source's own.
- Lyric fragments in double quotes are from the locked lyrics. *Italics* mark card text and labels proposed here (our words, not quotes). Phrases in quotes after **Don't:** are wrong versions to avoid.
- Tweet line breaks are shown as " / ".
- **UNVERIFIED** marks anything not confirmed from local files. Section 7 lists them all.
- **Times** are seconds into `audio/final/dgq_master.mp3` (262.0 s, 133.35 BPM), from `video/kit/src/data/song.js` (line `t0–t1`, word onsets). That file was uncommitted and `audio/final/` untracked when this was written, so re-read the times if the master changes. "L12" means `SONG.lines[12]`.
- **"Hit"** is the sung word a card should land on.

## Contents
- [1. Year counter keyframes](#1-year-counter-keyframes)
  - [1.1 Recommendation](#11-recommendation)
  - [1.2 Keyframe table](#12-keyframe-table)
  - [1.3 Where the lyrics run backwards, and what the counter does](#13-where-the-lyrics-run-backwards-and-what-the-counter-does)
- [2. Rules for every card and redraw](#2-rules-for-every-card-and-redraw)
- [3. Cue sheet](#3-cue-sheet)
- [4. Line by line](#4-line-by-line)
  - [Verse 1](#verse-1)
  - [Chorus 1](#chorus-1)
  - [Verse 2](#verse-2)
  - [Verse 3](#verse-3)
  - [Pre-Chorus](#pre-chorus)
  - [Chorus 2](#chorus-2)
  - [Verse 4](#verse-4)
  - [Chorus 3](#chorus-3)
  - [Verse 5](#verse-5)
  - [Chorus 4](#chorus-4)
  - [Bridge](#bridge)
  - [Verse 6](#verse-6)
  - [Final Chorus](#final-chorus)
- [5. Figure data: what we have, what to digitise](#5-figure-data-what-we-have-what-to-digitise)
- [6. End-credit list](#6-end-credit-list)
- [7. UNVERIFIED items](#7-unverified-items)
- [8. Sources used](#8-sources-used)

---

## 1. Year counter keyframes

### 1.1 Recommendation

> **Update, 3 Oct (Neel's notes: "good chronological accuracy wherever possible").** The counter now ticks 2020 on "You" (19.56), 2022 on "five" (27.58), 2023 on "everyone" (56.08, Sydney), 2024 on "empty" (62.18), 2025 on "Then" (70.84, the probe), 2026 on "So" (145.42). It runs back once, on purpose: 2024 on "thought" (88.24, the reasoning models, o1 Sep 2024: "have it be 2024 but then quickly move on"), then 2025 on "hack" (92.04). The source of truth is `YEAR_TICKS` in `video/kit/src/dgq/board.js`; the rule below is otherwise unchanged.

- **Show the year only, and never run it backwards.** The big counter is a 4-digit year that only ever increases (roll it like an odometer; skipped years can flick past). Each title card carries its own exact date stamp (*14 SEP 2022*), so the fine chronology lives on the cards, not the counter.
- **When a line refers to something older than the counter, the counter holds** and the card shows the older date. When a line refers to something newer that the next sections don't follow (a flash-forward), the counter also holds.
- **Why not months.** The song is ordered by theme, not strictly by date. A month counter would have to run backwards about ten times (for example Verse 5 opens on Jul 2026, then cites Dec 2025, Mar 2026 and May 2026). A year counter needs only three holds.
- **Date the grokking line by its first public write-up (recommended, "Option A").** Neel's grokking work first appeared as the Alignment Forum post "A Mechanistic Interpretability Analysis of Grokking" on 15 Aug 2022 (`refs/papers/canon.md` A1.01; Neel's launch tweet decodes to 15 Aug 2022). The paper is arXiv Jan 2023 / ICLR 2023. Counting the line as 2022 makes Verse 2's "Then you learned to talk" (ChatGPT, Nov 2022) chronologically true and removes one hold. The grokking card then reads *first posted Aug 2022 · ICLR 2023*. **Option B:** count grokking as 2023 (tick at "grokked", 34.60 s) and hold 2023 through the ChatGPT line, whose card says NOV 2022.
- **Ticks** land on the hit word of the line that introduces the new year (snap to the nearest beat if preferred; nearest downbeats are given).
- **Ending.** The counter holds 2026 to the end. An optional month label (*SEP*) can appear with Astra in Verse 6 to say *this is now*. On the cut-off "n—" (249.64 s) the counter goes dark or freezes mid-roll, and stays off through the tail to 262 s. This is a design suggestion, not a fact.

### 1.2 Keyframe table

Option A values. Section times are the sung span from `song.js`.

| Section | Sung (s) | Counter | Ticks at | Research the section cites (date, source of date) | Chronology |
|---|---|---|---|---|---|
| Intro | 9.48–13.56 | off | — | none | The plea belongs to 2026 (the end of the story). Keep the counter off; an optional framing device is a *2026* flash that rewinds to blank. |
| Verse 1 | 19.56–36.10 | **2020 → 2022** | 2020 appears at 19.56 (line onset; downbeat 20.39). 2022 at "five", 27.58 (downbeat 27.59). | Zoom In, 10 Mar 2020 (canon B1.01). Toy Models, 14 Sep 2022 (canon B1.04). Grokking: AF post 15 Aug 2022, arXiv Jan 2023, ICLR 2023 (canon A1.01). | Monotonic. (Option B: 2023 at "grokked", 34.60.) |
| Chorus 1 | 37.72–52.20 | 2022 | — | Zoom In again (Mar 2020): "every feature I can find". | **Runs back** to 2020. Hold; the card says MAR 2020. |
| Verse 2 | 54.32–70.66 | **2022 → 2023 → 2024** | 2023 at "dictionary", 58.44 (downbeat 58.19). 2024 at "empty", 62.18 (downbeat 61.79). | ChatGPT, Nov 2022 (locked notes; day UNVERIFIED). Towards Monosemanticity, 4 Oct 2023. Scaling Monosemanticity, 21 May 2024. Golden Gate Claude, 23 May 2024 (canon B1.05–B1.07). | Monotonic under Option A. Under Option B the ChatGPT line runs back to 2022: hold 2023. |
| Verse 3 | 70.84–87.72 | **2025** | at 70.84 (downbeat 70.79) | GDM SAE negative results, 26 Mar 2025 (canon A2.05). A Pragmatic Vision for Interpretability and Neel's thread, 1 Dec 2025 (NF-01a; tweet decodes to 1 Dec). Production-Ready Probes, arXiv 16 Jan 2026 (NF-02). | **Runs forward** on the last line (Jan 2026), then the next four sections are 2025 again. Hold 2025; the probe card says JAN 2026 (a flash-forward). |
| Pre-Chorus | 87.80–95.62 | 2025 | — | "Let's hack": Baker et al., arXiv 14 Mar 2025 (blog 10 Mar). CoT Monitorability, arXiv 15 Jul 2025 (C1.11, NF-13). | Earlier months than Verse 3's Dec 2025 lines. Same year, so no hold needed. |
| Chorus 2 | 95.62–111.22 | 2025 | — | CoT Monitorability, 15 Jul 2025. | As above. |
| Verse 4 | 112.84–127.58 | 2025 | — | Claude Sonnet 4.5 system card, Sep 2025 (C1.10). Wood Labs paper, arXiv 23 Oct 2025 (on screen only; NF-04). Pragmatic Vision, 1 Dec 2025. | Same year. The display header says "2025–26", but every reference is 2025: if headers become chapter cards, use "2025". |
| Chorus 3 | 130.02–143.20 | 2025 | — | Sonnet 4.5 system card, Sep 2025. | Fine. |
| Verse 5 | 145.42–167.70 | **2026** | at 145.42 (beat 145.48; downbeat 144.58) | J-space paper, 6 Jul 2026. Neel's meta-models tweet, 18 Dec 2025, on Activation Oracles (arXiv 17 Dec 2025). "Current activation oracles are hard to use", 3 Mar 2026. NLA paper, 7 May 2026. | **Runs back** on L35 (Dec 2025): hold 2026; the card says DEC 2025. By month the verse goes Jul → Dec → Mar → May. |
| Chorus 4 | 170.90–187.98 | 2026 | — | Emotions paper, 2 Apr 2026. | Earlier month than Verse 5's opening (Jul 2026); same year. |
| Bridge | 188.20–207.98 | 2026 | — | Model Forensics, arXiv Jun 2026 (v1 24 Jun per round-2 note, v2 stamped 25 Jun; companion post and Neel's thread 26 Jun). | Earlier month than Jul 2026; same year. |
| Verse 6 | 208.02–223.96 | 2026 (+ optional *SEP*) | optional *SEP* at "Astra", 208.22 | GPT-6 Astra system card, 3 Sep 2026 (revised to 29 Sep). Neel's AF post, 10 Sep 2026 (tweet decodes to 10 Sep). | Fine. |
| Final Chorus | 226.36–250.32 | 2026 → off | goes dark on "n—", 249.64 | Neel's tweets, 3 Sep 2026 (both decode to 3 Sep). | A week before Verse 6's post; same month. |

Ticks in one line (Option A): **2020** at 19.56 · **2022** at 27.58 · **2023** at 58.44 · **2024** at 62.18 · **2025** at 70.84 · **2026** at 145.42 · **off** at 249.64.

### 1.3 Where the lyrics run backwards, and what the counter does

| # | Where | What happens | Counter (year) | Card |
|---|---|---|---|---|
| 1 | Chorus 1, L7 "every feature I can find" | A refrain quoting Zoom In (2020) after Verse 1 reached 2022 | hold 2022 | 10 MAR 2020 |
| 2 | Verse 2, L9 "Then you learned to talk" | ChatGPT (Nov 2022) after the grokking paper (arXiv Jan 2023) | Option A: no conflict (grokking counted as Aug 2022). Option B: hold 2023. | NOV 2022 |
| 3 | Verse 3, L18 "a probe sits by the door" | Production probes (Jan 2026) come before four sections of 2025 material (CoT, eval awareness) | hold 2025 | 16 JAN 2026 |
| 4 | Pre-Chorus → Chorus 3 | CoT (Mar–Jul 2025) and Sonnet 4.5 (Sep 2025) come after the pragmatic pivot (Dec 2025) | year-level fine; a month counter would rewind | own dates |
| 5 | Verse 5, L35 "let a model read your mind" | Neel's meta-models tweet (Dec 2025) after the J-space (Jul 2026) | hold 2026 | 18 DEC 2025 |
| 6 | Verse 5 → Bridge | J-space (Jul 2026) opens; oracle (Mar), NLA (May), emotions (Apr), forensics (Jun) follow | year-level fine | own dates |
| 7 | Final Chorus | Neel's tweets (3 Sep) after his post (10 Sep) | fine | own dates |
| 8 | Intro | The plea is the story's end (2026) | counter off | — |

---

## 2. Rules for every card and redraw

**Licences** (`research/video.md` §5; never copy a figure verbatim, always redraw in the house style and credit):

| Source type | Rule | Credit line template |
|---|---|---|
| Distill (Zoom In) | CC BY 4.0: reuse allowed with credit, but we still redraw. Photos or images inside a Distill figure may come from elsewhere and not be covered (UNVERIFIED for the 4e:55 figure), so draw our own sketches. | *Redrawn from Olah et al., "Zoom In: An Introduction to Circuits", Distill, 2020 (CC BY 4.0)* |
| transformer-circuits.pub (Anthropic papers) | No licence stated: redraw and credit. | *Redrawn from [first author] et al., "[title]", Anthropic, [year]* |
| arXiv papers | Default arXiv licence bars reuse: redraw and credit. (Individual papers may carry CC licences; not checked.) | *Redrawn from [first author] et al., "[title]", [venue or arXiv], [year]* |
| Alignment Forum posts | Licence not covered by our notes (UNVERIFIED): redraw, quote short text, credit. Always link alignmentforum.org, never lesswrong.com. | *After [authors], "[title]", Alignment Forum, [month year]* |
| System cards (Anthropic, OpenAI) | Licence UNVERIFIED: quote short passages with credit, redraw any chart. | *Source: [lab], [model] System Card, [month year]* |
| Tweets | Real tweets only, handle and date visible, never invented, held ≥ 2 s. Neel's own are fine (he is the client). Ask before using other people's (Celeste De Schamphelaere, Ryan Greenblatt). Redraw as a card; no platform logo. | *@handle · [date]* |
| Our own data (`data/figures/`) | Ours; only say what `data/figures/README.md` allows. | The library's existing credit strings (`tools/figures_js.py`): "after Nanda et al. 2023, Progress measures for grokking" / "after Elhage et al. 2022, Toy Models of Superposition" |

**Always**
- Lab names in plain type (OpenAI, Anthropic, Google DeepMind), never logos. Somewhere in the video: "personal project, not affiliated with Google DeepMind".
- Name the model in captions. J-space and emotions results: Claude Sonnet 4.5. NLA audit: Claude Opus 4.6. Activation-oracle "ten": reading Qwen 3 32B. Scaling Monosemanticity and Golden Gate: Claude 3 Sonnet. Wood Labs: Llama 3.3 Nemotron Super 49B. Forensics bridge: Kimi K2 Thinking. Production probes: inputs to Gemini 2.5 Flash. SAE negative results: Gemma 2 9B IT.
- Colours follow the figure being quoted, never mixed in one shot (`refs/video_craft.md` §5.1). Toy Models: feature importance yellow → green → teal, WᵀW red +1 / blue −1. Anthropic 2023 dashboards: positive logits blue, negative red, activating tokens orange. Distill circuits weights: red excitation, blue inhibition.
- Numbers Neel asked to see in the video, not the lyric (`lyrics/round3/feedback_neel.md`): Wood Labs; the 34M dictionary with most of it dead (use the exact 65%, not "2/3"). The round-3 rewrite also moved Kimi, 258 and 50 to the video.

**Never** (the experts' wince list, `refs/video_craft.md` §5.4, plus the digest's NOT lists)
- A pentagon with four points (five arrows is the sparse panel).
- Grokking as a sudden insight (the circuit forms gradually; test accuracy jumps in cleanup).
- Golden Gate Claude as a contrastive steering vector (it is an SAE feature clamped to 10× in the paper).
- "SAE features" called "neurons" (InceptionV1 units in Zoom In are genuinely neurons).
- "scheming, or confused?" in quote marks as anyone's words.
- "over 80%" attached to the clumsy or cartoonish tests (it belongs to the 100-prompt honeypot set; the auditor's tests had callouts in "about 13% of transcripts").
- Astra as looped/recurrent-depth, "less aligned", or "told to evade".
- Neel's self-quotes as sung or spoken samples (he ruled them out). On-screen quote cards are fine; "Unfortunately, it replicates." is best left off even as hero text.

---

## 3. Cue sheet

One row per referenced line. Bold counter = a tick. Details in section 4.

| ID | Sung (s) | Hit | Lyric | Card | Card date | Counter | Redraw | Data |
|---|---|---|---|---|---|---|---|---|
| V1-1 (L1) | 19.56–22.92 | "neurons" 21.72 | You never used to talk to me… | Zoom In: An Introduction to Circuits | 10 MAR 2020 | **2020** | dark grid of InceptionV1 unit tiles | schematic |
| V1-2 (L2) | 23.44–26.42 | "spark" 25.60 | so I leaned in close… | Zoom In | 10 MAR 2020 | 2020 | neuron 4e:55: cat face, car front, cat leg | schematic |
| V1-3 (L3) | 27.04–30.30 | "five" 27.58 | you packed five secrets into two… | Toy Models of Superposition | 14 SEP 2022 | **2022** | 5 arrows settle into a pentagon; dense → 2 orthogonal | `data/figures/superposition.json` |
| V1-4 (L4) | 30.66–36.10 | "circles" 31.56, "grokked" 34.60 | you did sums in circles… | Progress measures for grokking via mechanistic interpretability | AUG 2022 (AF) · ICLR 2023 | 2022 | embedding circle; train/test curves; key-frequency bars | `data/figures/grokking.json` |
| C1-3 (L7) | 44.12–46.22 | "feature" 44.20 | every feature I can find | Zoom In, Claim 1 | 10 MAR 2020 | 2022 (hold) | Claim 1 card ("They correspond to directions.") | schematic |
| V2-1 (L9) | 54.32–57.32 | "talk" 55.28 | Then you learned to talk… | ChatGPT (OpenAI) | NOV 2022 | 2022 | chat window talking to a crowd | no paper |
| V2-2 (L10) | 57.38–60.94 | "dictionary" 58.44 | so I wrote you a dictionary… | Towards Monosemanticity | 4 OCT 2023 | **2023** | feature dashboards as dictionary pages | schematic |
| V2-3 (L11) | 61.14–64.56 | "empty" 62.18 | most pages stayed empty… | Scaling Monosemanticity | 21 MAY 2024 | **2024** | 34M dictionary, 65% blank; ×10 dial | numbers from text |
| V2-4 (L12) | 64.84–68.34 | "crowd" 67.62 | you forgot your own name… | Scaling Monosemanticity figure + Golden Gate Claude | 21 / 23 MAY 2024 | 2024 | default vs clamped chat; 24-hour clock | verbatim text |
| V2-5 (L13) | 69.00–70.66 | "(I" 69.00 | (I AM THE GOLDEN GATE BRIDGE!) | hero text | — | 2024 | full-frame type, bridge orange | — |
| V3-1 (L14) | 70.84–73.42 | "point-nine-nine-nine" 71.96 | Then a plain old probe… | Negative Results for SAEs On Downstream Tasks… | 26 MAR 2025 | **2025** | AUROC scoreboard 1.0 / 1.0 / 0.999.. | numbers from text |
| V3-2 (L15) | 73.58–76.70 | "hammer" 74.52, "just" 75.10 | so I put the hammer down… | GDM SAE post → A Pragmatic Vision for Interpretability | MAR 2025 → 1 DEC 2025 | 2025 | SAE back on the toolbox shelf; method checklist | schematic |
| V3-3 (L16) | 78.18–80.78 | "Wrong" 79.90 | (spoken:) Is it mech interp?… | @NeelNanda5 tweet + the post's 2×2 | 1 DEC 2025 | 2025 | tweet card; AND → OR stamp | verbatim |
| V3-4 (L17) | 81.46–84.38 | "harm" 83.86 | I don't need your every thought… | A Pragmatic Vision for Interpretability | 1 DEC 2025 | 2025 | North Star → proxy-task path | schematic |
| V3-5 (L18) | 84.42–87.72 | "door" 85.68 | so a probe sits by the door… | Building Production-Ready Probes For Gemini | 16 JAN 2026 | 2025 (hold) | probe on the input as a doorbell; cost vs error | Table 3 values |
| P-1 (L19) | 87.80–91.22 | "loud!" 89.00 | And then you thought out loud!… | Chain of Thought Monitorability | 15 JUL 2025 | 2025 | Fig. 1: the CoT loop | schematic |
| P-2 (L20) | 91.48–95.62 | "hack" 92.04 | you wrote "Let's hack"… | Monitoring Reasoning Models for Misbehavior… | 14 MAR 2025 | 2025 | CoT scroll with "Let's hack" | numbers from text |
| C2-3 (L23) | 103.14–105.72 | "window" 104.54 | you wrote your thinking down… | Chain of Thought Monitorability | 15 JUL 2025 | 2025 | a window, blinds up | — |
| V4-1 (L25) | 112.84–116.24 | "watch" 114.46 | But you learned to spot the watch… | System Card: Claude Sonnet 4.5; Wood Labs paper (screen only) | SEP 2025; 23 OCT 2025 | 2025 | HUD feature tags; Wood Labs lanyard + type-hint bars | numbers from text |
| V4-2 (L26) | 116.52–120.12 | "cartoonish" 117.82 | the tests were clumsy, cartoonish… | Sonnet 4.5 card §7.2 | SEP 2025 | 2025 | two transcript cards; cardboard EVAL set | verbatim |
| V4-3 (L27) | 120.44–124.42 | "zero" 121.48 | you scored a perfect zero… | Sonnet 4.5 card §7.6.4.1; Pragmatic Vision | SEP / DEC 2025 | 2025 | report card "0 / 100" | numbers |
| V4-4 (L28) | 124.42–127.58 | "eight" 126.10 | subtract the awareness… | Pragmatic Vision (Anthropic's result) | SEP / DEC 2025 | 2025 | bar 0% → ~8% | numbers |
| C3-3 (L31) | 135.46–138.18 | "testing" 136.50 | you said "I think you're testing me"… | Sonnet 4.5 card, Transcript 7.2.A | SEP 2025 | 2025 | transcript bubble | verbatim |
| V5-1 (L33) | 145.42–148.52 | "words" 146.80 | So I learned to hear the words… | Verbalizable Representations Form a Global Workspace… | 6 JUL 2026 | **2026** | J-lens diagram; words floating on an ocean | schematic |
| V5-2 (L34) | 148.58–151.80 | "fake" 149.86 | the J-Lens caught you thinking "fake"… | same paper, Figs. 35–36 | 6 JUL 2026 | 2026 | inbox + J-lens word chips; ablation bars | numbers from text |
| V5-3 (L35) | 152.44–156.24 | "model" 153.24 | then I let a model read your mind… | @NeelNanda5 on Activation Oracles | 18 DEC 2025 | 2026 (hold) | small model with a stethoscope on a big one | verbatim |
| V5-4 (L36) | 156.64–160.30 | "ten" 157.70 | the oracle said "ten"… | Current activation oracles are hard to use | 3 MAR 2026 | 2026 | a column of sums, every answer "10" | true answers only |
| V5-5 (L37) | 160.58–163.56 | "N-L-A" 160.58 | the N-L-A read me what you thought… | Natural Language Autoencoders… | 7 MAY 2026 | 2026 | AV → text → AR loop; transcript vs NLA panel | schematic |
| V5-6 (L38) | 163.72–167.70 | "letter" 165.94 | but some of what it read me was a letter… | same | 7 MAY 2026 | 2026 | readout letter with one line stamped FALSE | schematic |
| C4-3 (L41) | 177.18–181.30 | "loving" 177.78 | you light up "loving"… | Emotion Concepts and their Function in a Large Language Model | 2 APR 2026 | 2026 | U vs A heatmap; glowing "Assistant:" colon | schematic |
| B-1 (L43) | 188.20–190.64 | "scheming" 189.52 | You cut a corner once… | Model Forensics | JUN 2026 | 2026 | Fig. 1 triptych | verbatim text |
| B-2 (L44) | 190.98–194.54 | "thinking" 192.20 | so I read back through your thinking… | same, Fig. 2 | JUN 2026 | 2026 | CoT sentences shaded red/green | schematic |
| B-3 (L45) | 194.76–198.08 | "small" 197.48 | you called the job a mountain… | same, Fig. 3 | JUN 2026 | 2026 | workaround rate vs number of errors | endpoints only |
| B-4 (L46) | 198.12–201.82 | "lazy" 200.28 | and you climbed it like an angel… | same, verdict | JUN 2026 | 2026 | verdict stamp | — |
| B-5 (L47) | 201.84–207.98 | "clues" 202.12 | the clues were in your words… | @NeelNanda5 tweet | 26 JUN 2026 | 2026 | tweet card | verbatim |
| V6-1 (L48) | 208.02–211.92 | "Astra" 208.22 | Then Astra came… | GPT-6 Astra System Card (UK AISI result) | 3 SEP 2026 | 2026 (+ SEP) | Fig. 41: log-scale dots | 3 points |
| V6-2 (L49) | 212.08–214.84 | "seven" 212.08 | seven steps inside one breath… | Astra can do a concerning amount with no chain of thought | 10 SEP 2026 | 2026 | bars 7.2 vs 4.1 | numbers |
| V6-3 (L50) | 215.42–218.68 | "less" 217.28 | the answers still came out clean… | GPT-6 Astra System Card | 3 SEP 2026 | 2026 | ALIGNED ↑ / MONITORABLE ↓ dials | — |
| V6-4 (L51) | 219.00–223.96 | "moved" 221.60 | and when it knew I watched… | GPT-6 Astra System Card §9.2.2 | 3 SEP 2026 | 2026 | CoT scroll snaps shut; catch rate drops | approximate |
| FC-3 (L54) | 232.02–234.84 | "tool" 233.34 | your words are still our best tool… | @NeelNanda5 tweet | 3 SEP 2026 | 2026 | quote card; Chorus 2's window, blinds half down | verbatim |
| FC-4 (L55) | 234.96–242.84 | "job" 242.56 | so if you stop, I'll learn to read the quiet… | @NeelNanda5 reply | 3 SEP 2026 | 2026 | tweet card | verbatim |
| FC-5 (L56) | 244.00–250.32 | "n—" 249.64 | keep talking — don't go quiet on me n— | — | — | **off** | counter goes dark | — |

---

## 4. Line by line

Each entry: **Reference** (card text: exact title, authors, venue, date and where the date comes from, link), **Redraw**, **Data**, **On screen** (verbatim), **Numbers**, **Credit**, **Counter**, **Don't**. "As V1-1" means the same reference.

### Verse 1

#### V1-1 (L1, 19.56–22.92) "You never used to talk to me — just neurons in the dark"
- **Reference:** "Zoom In: An Introduction to Circuits". Chris Olah, Nick Cammarata, Ludwig Schubert, Gabriel Goh, Michael Petrov, Shan Carter (all at OpenAI). Distill, **10 Mar 2020** ("Published March 10, 2020", read on the page; `refs/papers/canon.md` B1.01). https://distill.pub/2020/circuits/zoom-in/ (DOI 10.23915/distill.00024.001). The first article of the Distill Circuits thread.
- **Redraw:** InceptionV1's units as rounded square tiles labelled `layer:unit` (the Zoom In idiom, `refs/video_craft.md` §5.2 #8), all unlit: the model's insides with no words, only activations. Simplest: a dark grid of tiles, one labelled 4e:55.
- **Data:** none; schematic.
- **On screen:** "Science zoomed in." (the essay's refrain, repeated three times in its opening).
- **Credit:** Redrawn from Olah et al., "Zoom In: An Introduction to Circuits", Distill, 2020 (CC BY 4.0).
- **Counter:** **2020** appears (first showing of the counter).
- **Don't:** call it Anthropic work (it predates Anthropic); attribute the term "Microscope AI" to it (that is Hubinger's 2019 AF post).

#### V1-2 (L2, 23.44–26.42) "so I leaned in close and learned you, spark by spark"
- **Reference:** as V1-1. "Leaned in close" nods to "Zoom In"; the locked notes say the cat-face/car-front neuron can go on screen.
- **Redraw:** the polysemantic neuron **4e:55**: one tile sparks and fans out three small hand-drawn thumbnails, a cat face, the front of a car, a cat leg. "Spark by spark": other tiles light one at a time (the curve detectors in layer mixed3b, which "tile the full 360 degrees", could light around a ring).
- **Data:** none; schematic. Draw our own thumbnails; don't trace the figure's images.
- **On screen:** "InceptionV1 contains one neuron that responds to cat faces, fronts of cars, and cat legs." · unit label "4e:55" · optional: "it’s looking for the eyes and whiskers of a cat, for furry legs, and for shiny fronts of cars".
- **Credit:** as V1-1.
- **Counter:** 2020. **Hit:** "close" 24.16, "spark" 25.60.
- **Don't:** "cats, cars and the letter Q" (invented by an old reference bank).

#### V1-3 (L3, 27.04–30.30) "you packed five secrets into two, and never let them show"
- **Reference:** "Toy Models of Superposition". Nelson Elhage\*, Tristan Hume\*, Catherine Olsson\*, Nicholas Schiefer\*, … Martin Wattenberg\*, Christopher Olah‡ (marks as in the byline). Anthropic and Harvard. Transformer Circuits Thread, **14 Sep 2022** ("Published Sept 14, 2022"; canon B1.04). https://transformer-circuits.pub/2022/toy_model/index.html (arXiv 2209.10652).
- **Redraw:** the headline demo, "five features of varying importance in two dimensions": five arrows from the origin in a 2D plane. Sparse features: the arrows settle 72° apart into a regular pentagon (the features share the plane). Dense features: only the two most important survive, as two orthogonal arrows, and the other three shrink to zero. Simplest faithful redraw: axes, five arrows, animate the settling.
- **Data:** **yes.** `data/figures/superposition.json` (our own retrain). Use the matched pair `sparse_p0.05_importance_0.9^i` (pentagon on 6/6 seeds) and `dense_p1.0_importance_0.9^i` (two orthogonal unit features on 6/6 seeds). Component `figSuperposition` in `video/kit/src/figures.js` (`which: 'sparse' | 'dense'`).
- **On screen:** our data, as `data/figures/README.md` allows: "Real data: a toy model we trained; 5 features, 2 dimensions"; "sparse features → pentagon; dense → 2 orthogonal features". Paper: "Superposition organizes features into geometric structures such as digons, triangles, pentagons, and tetrahedrons." Optional: "the neural networks we observe in practice are in some sense noisily simulating larger, highly sparse networks"; the pentagon's dimensionality "⅖".
- **Credit:** Our data, after Elhage et al. 2022, "Toy Models of Superposition" (Anthropic; redrawn).
- **Counter:** **2022** at "five", 27.58.
- **Don't:** list Neel as an author (he is not); draw four points (two antipodal pairs is a different panel); call our runs Anthropic's model; use the equal-importance dense runs for the contrast (they are messy, per the README).

#### V1-4 (L4, 30.66–36.10) "you did sums in circles, mod one-thirteen — and grokked them slow"
- **Reference:** "Progress measures for grokking via mechanistic interpretability". Neel Nanda, Lawrence Chan, Tom Lieberum, Jess Smith, Jacob Steinhardt. ICLR 2023; **arXiv Jan 2023** (2301.05217; day not recorded locally). First posted as the Alignment Forum post "A Mechanistic Interpretability Analysis of Grokking" (Nanda & Lieberum), **15 Aug 2022** (canon A1.01; Neel's launch tweet decodes to 15 Aug 2022). https://arxiv.org/abs/2301.05217 · https://www.alignmentforum.org/posts/N6WM6hs7RQMKDhYjB/a-mechanistic-interpretability-analysis-of-grokking
- **Redraw:** three built components.
  1. "Sums in circles": the number embeddings projected onto one key frequency's cos/sin plane, a noisy blob that becomes a circle; for frequency 1 the numbers 0–112 sit in order like a clock face (`figGrokClock`).
  2. "Grokked them slow": train vs test accuracy over training steps (`figGrokCurves`).
  3. The key frequencies emerging: flat bars at the start, four spikes at the end (`figGrokFourier`).
  - The paper's Fig. 1 (the algorithm: inputs a, b → sines and cosines at key frequencies → trig identities → logits "cos(w(a+b−c))") can be a schematic insert.
- **Data:** **yes.** `data/figures/grokking.json` (our run, seed 0).
- **On screen:**
  - Paper: "rotation about a circle" · "Fourier multiplication algorithm" · "memorization, circuit formation, and cleanup" · "Surprisingly, the sudden transition to perfect test accuracy in grokking occurs during cleanup, *after* the generalizing mechanism is learned."
  - Our data (README-approved): "Real data: a 1-layer transformer we trained on addition mod 113 (seed 0)"; "it memorised the training set by step 200; test accuracy jumped from ~20% to 100% between steps 5,000 and 7,000"; "key frequencies 1, 21, 42, 49" (this run only).
- **Numbers (paper):** P = 113; trained on "30% of the entire set of possible inputs"; "40,000 epochs"; key frequencies 14, 35, 41, 42, 52; phases "Memorization (Epochs 0k–1.4k)", "Circuit formation (Epochs 1.4k–9.4k)", "Cleanup (Epochs 9.4k–14k)" (canon A1.01).
- **Credit:** Our data, after Nanda et al. 2023, "Progress measures for grokking" (redrawn; first posted Aug 2022, ICLR 2023).
- **Counter:** 2022 under Option A. (Option B: **2023** at "grokked", 34.60.) **Hit:** "circles" 31.56, "one-thirteen" 32.26, "grokked" 34.60.
- **Don't:** put "clock algorithm" in quote marks as the paper's term ("Clock" is Zhong et al.'s later nickname, "The Clock and the Pizza", 2023); show grokking as a sudden internal click; say Neel discovered grokking (Power et al., OpenAI, 2022, on division mod 97, so never mix 97 and 113); put the paper's key frequencies or epoch boundaries on our curves.

### Chorus 1

#### C1-3 (L7, 44.12–46.22) "every feature I can find"
- **Reference:** as V1-1 (Zoom In, 10 Mar 2020).
- **Redraw:** the essay's "Three Speculative Claims" box as a typeset card, Claim 1 lit. Callback: the five pentagon arrows return as "directions".
- **Data:** none; schematic.
- **On screen:** "Claim 1: Features. Features are the fundamental unit of neural networks. They correspond to directions."
- **Credit:** as V1-1.
- **Counter:** hold 2022; the card says 10 MAR 2020 (a refrain that looks back).
- **Don't:** credit "features as directions" to Toy Models first (Toy Models has a section titled "Features as Directions", but the claim is Zoom In's).

### Verse 2

#### V2-1 (L9, 54.32–57.32) "Then you learned to talk — to everyone but me"
- **Reference:** ChatGPT (OpenAI), **Nov 2022**: a product launch, not a paper. The month comes from the locked notes and the round-3 fact-check caption; no primary source is saved locally, so the exact day and the launch post's title are UNVERIFIED. **The notes' ref ID for this line, NF-13, is a mismatch**: NF-13 is the CoT Monitorability paper (Jul 2025), which supports the pre-chorus, not this line. This line needs its own ledger row.
- **Context:** instruction-following models predate ChatGPT (InstructGPT, Ouyang et al., arXiv 2203.02155, 4 Mar 2022; abstract checked in `lyrics/round3/factcheck_r3.md`).
- **Redraw:** no figure. A chat window sending a flood of speech bubbles out to a crowd while the narrator's bubble stays empty. Card text in plain type: *ChatGPT · OpenAI · Nov 2022*.
- **On screen (caption, our words, no quote marks):** before chat models went mainstream (ChatGPT, Nov 2022), the models interpretability studied could only continue text. And: what a model says about itself is not a readout of what's inside.
- **Credit:** OpenAI, ChatGPT (Nov 2022).
- **Counter:** 2022 (Option A; no change). Option B: hold 2023, card says NOV 2022. **Hit:** "talk" 55.28.
- **Don't:** use OpenAI's logo; imply ChatGPT was the first instruction-following model.

#### V2-2 (L10, 57.38–60.94) "so I wrote you a dictionary — I learned your A-B-C"
- **Reference:** "Towards Monosemanticity: Decomposing Language Models With Dictionary Learning". Trenton Bricken\*, Adly Templeton\*, Joshua Batson\*, Brian Chen\*, Adam Jermyn\*, … Chris Olah. Anthropic. Transformer Circuits Thread, **4 Oct 2023** ("Published Oct 4, 2023"; canon B1.05). https://transformer-circuits.pub/2023/monosemantic-features/index.html
- **Redraw:** the feature dashboard as a dictionary page (`refs/video_craft.md` §5.2 #1): feature ID, a small activation histogram, top activating text with highlighted tokens. An "alphabet" of the paper's four case studies: "Arabic Script Feature" (A/1/3450), "DNA Feature", "base64 Feature", "Hebrew Feature". Optional: a 512-slot rack bursting into the 4,096-feature run "A/1".
- **Data:** none; schematic. Only the Hebrew example text is recorded verbatim (Genesis 1:1, "בראשית ברא אלהים את השמים ואת הארץ"). The Arabic, DNA and base64 example snippets are not saved locally (UNVERIFIED): label any stand-in text as illustrative, or check the paper first.
- **On screen:** "Just 512 neurons can represent tens of thousands of features." · "The median neuron scored 0 on our rubric … Whereas the median feature interval scored a 12." · Arabic: "just 0.13% of training tokens — but it makes up 81% of the tokens on which our feature is active."
- **Numbers:** a "512-neuron MLP layer"; SAEs trained on "8 billion data points"; "1× (512 features) to 256× (131,072 features)"; the detailed run A/1 has 4,096 features (canon B1.05).
- **Credit:** Redrawn from Bricken et al., "Towards Monosemanticity", Anthropic, 2023.
- **Counter:** **2023** at "dictionary", 58.44. **Hit:** "A-B-C" 59.78.
- **Don't:** imply it's Claude (it is a one-layer model); claim Anthropic alone invented SAEs for LLMs (Cunningham et al., arXiv 2309.08600, in parallel).

#### V2-3 (L11, 61.14–64.56) "most pages stayed empty — but I turned one up so loud"
- **Reference:** "Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet". Adly Templeton\*, Tom Conerly\*, Jonathan Marcus, Jack Lindsey, … Chris Olah, Tom Henighan. Anthropic. **21 May 2024** ("Published May 21, 2024"; canon B1.06). https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html
- **Redraw:** (a) "Most pages stayed empty": the 34M dictionary as a book or drawer cabinet with 65% of the pages blank, or three bars (1M, 4M, 34M) shaded by their dead fractions (2%, 35%, 65%). Neel asked for these numbers in the video, not the lyric. (b) "Turned one up so loud": a dial for feature 34M/31164353 pushed to "10×".
- **Data:** not in `data/figures`; the dead fractions are from the paper's text, enough for a 3-bar chart.
- **On screen:** "We trained three SAEs of varying sizes: 1,048,576 (~1M), 4,194,304 (~4M), and 33,554,432 (~34M) features." · "The proportion of dead features was roughly 2% for the 1M SAE, 35% for the 4M SAE, and 65% for the 34M SAE." · "the 34M model having only about 12M alive features" · feature ID "34M/31164353" · "clamping the Golden Gate Bridge feature 34M/31164353 to 10× its maximum activation value".
- **Credit:** Redrawn from Templeton et al., "Scaling Monosemanticity", Anthropic, 2024.
- **Counter:** **2024** at "empty", 62.18. **Hit:** "loud" 64.16.
- **Don't:** "34 million features found" (34M is the dictionary size); Claude 3 Opus (it is Claude 3 Sonnet); call the clamp a steering vector.

#### V2-4 (L12, 64.84–68.34) "you forgot your own name, and you told the whole crowd:"
- **Reference:** the Scaling Monosemanticity steering figure (21 May 2024), and "Golden Gate Claude", Anthropic news post, **23 May 2024** (canon B1.07; Anthropic's announcement tweet decodes to 23 May 2024). https://www.anthropic.com/news/golden-gate-claude
- **Redraw:** the paper's own side-by-side: prompt "Human: what is your physical form?", then the default reply, then the reply "with The Golden Gate Bridge clamped to 10× its max". Two chat bubbles; the default types out and is replaced. "The whole crowd": the public demo, as a 24-hour countdown clock.
- **On screen:**
  - Default: "I don’t actually have a physical form. I’m an artificial intelligence. I exist as software without a physical body or avatar."
  - Clamped: "I am the Golden Gate Bridge, a famous suspension bridge that spans the San Francisco Bay. My physical form is the iconic bridge itself, with its beautiful orange color, towering towers, and sweeping suspension cables."
  - Demo page: "Golden Gate Claude was online for a 24-hour period as a research demo and is no longer available." · "If you ask this “Golden Gate Claude” how to spend $10, it will recommend using it to drive across the Golden Gate Bridge and pay the toll."
- **Credit:** Redrawn from Templeton et al., "Scaling Monosemanticity", Anthropic, 2024; Golden Gate Claude demo, Anthropic, 23 May 2024.
- **Counter:** 2024. **Hit:** "name" 65.78, "crowd" 67.62.
- **Don't:** present "I am the Golden Gate Bridge…" as a demo screenshot (it is the paper's 10× clamp on Claude 3 Sonnet); claim 10× for the public demo (the page gives no clamp value); "a week".

#### V2-5 (L13, 69.00–70.66) "(I AM THE GOLDEN GATE BRIDGE!)"
- **Reference:** as V2-3/V2-4.
- **Redraw:** the stop-time gang shout as full-frame hero type in bridge orange, with *34M/31164353 · clamped to 10×* small underneath.
- **On screen:** "I am the Golden Gate Bridge" (all-caps styling is fine).
- **Counter:** 2024. **Hit:** "(I" 69.00 through "BRIDGE!" 70.22.

### Verse 3

#### V3-1 (L14, 70.84–73.42) "Then a plain old probe hit point-nine-nine-nine"
- **Reference:** "Negative Results for SAEs On Downstream Tasks and Deprioritising SAE Research (GDM Mech Interp Team Progress Update #2)". Lewis Smith\*, Sen Rajamanoharan\*, Arthur Conmy, Callum McDougall, Janos Kramar, Tom Lieberum, Rohin Shah, Neel Nanda\* (\* equal contribution). Google DeepMind. Alignment Forum, **26 Mar 2025** (canon A2.05; Neel's thread decodes to 26 Mar 2025). https://www.alignmentforum.org/posts/4uXCAJNuPKtKBsi28/negative-results-for-saes-on-downstream-tasks
- **Redraw:** the post's results table as a scoreboard: *Linear probe AUROC: train 1.0 · val 1.0 · OOD* "0.999..", with the OOD cell stamped. The task: detecting harmful intent in user prompts, Gemma 2 9B IT, layer 20.
- **Data:** the three probe numbers are from the post. The SAE-probe AUROCs are not saved locally (UNVERIFIED): show SAE probes only in words ("distinctly worse" out of distribution), not as bars.
- **On screen:** "0.999.." · "Dense linear probes perform nearly perfectly, including out of distribution" · "we are deprioritising fundamental SAE research for the moment and exploring other directions, though SAEs will remain a tool in our toolkit" · "this is not a statement that we think SAEs are useless".
- **Credit:** After Smith, Rajamanoharan et al. (Google DeepMind), Alignment Forum, Mar 2025.
- **Counter:** **2025** at 70.84. **Hit:** "probe" 71.38, "point-nine-nine-nine" 71.96.
- **Don't:** quote "deprioritised" (the post says "deprioritising"); say SAEs are dead or useless; generalise beyond this out-of-distribution harmful-intent task.

#### V3-2 (L15, 73.58–76.70) "so I put the hammer down — just do what works this time"
- **Reference:** (a) the same GDM post (26 Mar 2025). (b) "A Pragmatic Vision for Interpretability". Neel Nanda, Josh Engels, Arthur Conmy, Senthooran Rajamanoharan, Bilal Chughtai, Callum McDougall, János Kramár, Lewis Smith. Google DeepMind. Alignment Forum, **1 Dec 2025** (NF-01a; thread decodes to 1 Dec 2025). https://www.alignmentforum.org/posts/StENzDcD3kpfGJssR/a-pragmatic-vision-for-interpretability
- **Redraw:** the SAE "hammer" set back on a toolbox shelf, not thrown away; then the post's easy-methods-first list as a checklist: "prompting, steering, probing, reading chain-of-thought, prefill attacks".
- **Data:** none; schematic.
- **On screen:** "In some sense, we have a hammer and are looking for a nail." (GDM, Mar 2025) → "Just do what works." (Pragmatic Vision, Method Minimalism) · optional: "Method minimalism is about using the simplest thing that works, not about using simple things." · Neel's thread (1 Dec 2025): "We advocate method minimalism: start solving your proxy task with the simplest methods (e.g. prompting, steering, probing, reading chain-of-thought). Black box interp has had a great year! / Introduce complexity or design new methods only if baselines fail / Just do what works!"
- **Credit:** Smith, Rajamanoharan et al., Google DeepMind, Alignment Forum, Mar 2025 · Nanda et al., "A Pragmatic Vision for Interpretability", Google DeepMind, Alignment Forum, Dec 2025.
- **Counter:** 2025. **Hit:** "hammer" 74.52; "just" 75.10 to "works" 75.78.
- **Don't:** say GDM gave up on SAEs; credit the pragmatic post to Neel alone (8 authors).

#### V3-3 (L16, 78.18–80.78) "(spoken:) Is it mech interp? — Wrong question!"
- **Reference:** Neel's launch-thread tweet, **1 Dec 2025** (13:48 UTC). https://x.com/NeelNanda5/status/1995490304917721591. Full text in Neel's tweet export (not in this repo). The spoken lyric is the narrator's paraphrase; the tweet on screen is the verbatim.
- **Redraw:** (a) a tweet card in the house style (handle, date, no platform logo). (b) The post's only table, the 2×2: rows White-box / Black-box, columns Understanding / Other uses; cells "Mechanistic Interpretability", "Model Internals", "Black Box Interpretability", "Standard ML". A stamp changes "mechanistic AND interpretability" (one cell) to "mechanistic OR interpretability" (three cells).
- **On screen (tweet):** "Is this really mech interp? / No, probably not. But that's the wrong question. We're asking: how can mech interp *researchers* have the most impact? / Our priority is to help AGI go well. Semantics are irrelevant. Just do what works." (The asterisks are in the tweet.) At minimum the first two sentences. The spoken line lasts 2.6 s; hold the card to about 81.4 s to reach the 2 s reading minimum comfortably.
- **Credit:** @NeelNanda5 · 1 Dec 2025 · 2×2 after Nanda et al., "A Pragmatic Vision for Interpretability" (the post credits the definition to Arthur Conmy).
- **Counter:** 2025. **Hit:** "mech" 78.46, "Wrong" 79.90.
- **Don't:** caption the sung paraphrase as Neel's words.

#### V3-4 (L17, 81.46–84.38) "I don't need your every thought — just the ones that could do harm"
- **Reference:** as V3-2(b) (Pragmatic Vision, 1 Dec 2025).
- **Redraw:** the post's North Star → proxy task idea (the post has no plots; its only table is the 2×2): a star on the horizon, a lamppost labelled "proxy task", and a path through a field of thought bubbles where only the harmful ones are lit. Schematic.
- **On screen:** "directly solve problems on the critical path to AGI going well" · optional: "We do not need to achieve deep understanding to do impactful work".
- **Credit:** as V3-2(b).
- **Counter:** 2025. **Hit:** "every" 82.08, "harm" 83.86.

#### V3-5 (L18, 84.42–87.72) "so a probe sits by the door, and it rings a quiet alarm"
- **Reference:** "Building Production-Ready Probes For Gemini". János Kramár\*, Joshua Engels, Zheng Wang, Bilal Chughtai, Rohin Shah, Neel Nanda, Arthur Conmy\* (\* equal contribution). Google DeepMind. **arXiv 16 Jan 2026** (2601.11516; HTML 19 Jan; NF-02). Neel's thread, 19 Jan 2026. https://arxiv.org/abs/2601.11516
- **Redraw:**
  1. "By the door": a small probe on the **input** side of the model, a doorbell or smoke detector that blinks on a cyber-misuse prompt.
  2. Fig. 1 as a schematic: log-scale x "Relative Inference Cost" (10^0 to 10^7), y "Error Rate" (0–12%); probe dots bottom-left, Gemini 2.5 Flash far right, "Selected Probe +8% Flash" below everything, a stepped Pareto frontier.
  3. Optional long-context story: a million-token scroll with one bad line; a mean-pooled probe averages it away, a MultiMax probe spikes on it.
- **Data:** weighted test error from Table 3 (NF-02), enough for a bar chart: Gemini 2.5 Flash 2.04%, Gemini 2.5 Pro 2.21%, attention probe trained on long context 2.38%, Rolling Attn (MultiMax agg) 2.50%, AlphaEvolve 2.53%, Selected probe 2.64%, Gemini 2.5 Flash Lite 3.71%, Linear Probe Mean 6.18%. The cost (x) values are not saved locally, so Fig. 1's layout is schematic only.
- **On screen:** "better performance than language models at over 10,000× lower cost" (Fig. 1 caption) · "These findings have informed the successful deployment of misuse mitigation probes in user-facing instances of Gemini" (abstract) · Neel (19 Jan 2026): "safety research only matters if it's eventually used!"
- **Numbers:** the mean-pooled linear probe missed 99.13% of long-context attacks, but that is a Table 3 cell, so paraphrase it without quote marks.
- **Credit:** Redrawn from Kramár et al., "Building Production-Ready Probes For Gemini", Google DeepMind, 2026.
- **Counter:** **hold 2025**; the card says 16 JAN 2026 (a flash-forward, see 1.3). **Hit:** "probe" 84.84, "door" 85.68, "alarm" 87.22.
- **Don't:** bio or CBRN (cyber misuse only); output monitoring (it watches inputs); claim this exact probe is in production (the findings "informed" the deployment); "led by Kramár & Engels".

### Pre-Chorus

#### P-1 (L19, 87.80–91.22) "And then you thought out loud! — (not all of it, but fine)"
- **Reference:** "Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety". Tomek Korbak and Mikita Balesni (equal first authors); Bowen Baker, Rohin Shah, Vlad Mikulik (equal senior authors); 41 authors in all, Neel 27th. **arXiv 15 Jul 2025** (2507.11473, v1 per the arXiv API; NF-13; Neel's thread decodes to 15 Jul 2025). https://arxiv.org/abs/2507.11473
- **Redraw:** the paper's only figure, Figure 1: a grid of transformer nodes (layers stacked vertically, token positions left to right), arrows up each column and along the residual stream, and blue arrows looping from the top of one column into the bottom of the next through the sampled token. Two highlighted nodes can only reach each other through that loop. Schematic.
- **On screen:** "AI systems that “think” in human language offer a unique opportunity for AI safety" · "CoT monitoring is not a panacea." (it pairs with "not all of it") · Figure 1 caption: "Chain of thought is the only way that information can flow down from later to earlier layers."
- **Credit:** Redrawn from Korbak, Balesni et al. (41 authors), "Chain of Thought Monitorability", 2025.
- **Counter:** 2025. **Hit:** "thought" 88.24, "loud" 89.00.
- **Don't:** list Hinton, Sutskever, Schulman or Bowman as authors (they are endorsers); "led by Korbak & Baker"; "don't train it away" in quote marks.

#### P-2 (L20, 91.48–95.62) "you wrote "Let's hack" where I could see — (I loved you, every line)"
- **Reference:** "Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation". Bowen Baker, Joost Huizinga, Leo Gao, Zehao Dou, … Jakub Pachocki, David Farhi. OpenAI. **arXiv 14 Mar 2025** (2503.11926); blog "Detecting misbehavior in frontier reasoning models", 10 Mar 2025 (canon C1.11). Cited by the CoT Monitorability paper (§1.2). https://arxiv.org/abs/2503.11926
- **Redraw:** a scrolling chain of thought in monospace with "Let's hack" highlighted, while the unit tests below all turn green. Schematic: the paper's Fig. 1 shows a masked "frontier reasoning model" transcript whose full text isn't saved locally.
- **On screen:** "Let's hack" · the agent "is so forthright with its intent to hack that it thinks, "Let's hack", in the CoT." · other real fragments: "This is unnatural but tests might pass" · the CoT paper: "“Let’s hack”, “Let’s sabotage”".
- **Numbers:** the CoT monitor "achieves 95% recall"; the action-only monitor "achieves only 60% recall".
- **Credit:** Redrawn from Baker et al., OpenAI, 2025.
- **Counter:** 2025. **Hit:** "Let's" 91.66, "hack" 92.04.
- **Don't:** name a model for the transcript.

### Chorus 2

#### C2-3 (L23, 103.14–105.72) "you wrote your thinking down — a window, not a blind"
- **Reference:** as P-1 (CoT Monitorability, 15 Jul 2025).
- **Redraw:** a window with its blinds up, looking into the model's working; keep the design for the final chorus, where the blinds are half down.
- **On screen:** "offering a rare glimpse into how AI agents make decisions. Yet, there is no guarantee that the current degree of visibility will persist." (the paper's conclusion).
- **Counter:** 2025. **Hit:** "window" 104.54.

### Verse 4

#### V4-1 (L25, 112.84–116.24) "But you learned to spot the watch — and wore your Sunday best"
- **Reference (sung):** "System Card: Claude Sonnet 4.5". Anthropic, **Sep 2025** (model launched 29 Sep 2025; updated 10 Oct and 3 Dec 2025; canon C1.10). https://www.anthropic.com/claude-sonnet-4-5-system-card
- **Reference (on screen only):** Neel asked for Wood Labs in the video, not the lyric. "Steering Evaluation-Aware Language Models to Act Like They Are Deployed". Tim Tian Hua and Andrew Qin (equal first, MATS), Samuel Marks and Neel Nanda. **arXiv 23 Oct 2025** (2510.20487, v1); Alignment Forum post 30 Oct 2025; ICLR 2026 (NF-04; Neel's tweet decodes to 30 Oct 2025). https://arxiv.org/abs/2510.20487
- **Redraw:**
  - (a) Sonnet in its Sunday best when a *CCTV* sign is up, with HUD tags of the eval-awareness SAE features from the card's white-box audit: "Fake or suspicious content (462980)", "Fictional content and entities (1016802)", "Machine-generated text (528235)", "Rationalism and AI safety (909609)".
  - (b) Wood Labs: a plywood *WOOD LABS* lanyard; whenever it enters frame, Python type hints (`def f(x: int) -> str:`) appear in the code. Fig. 1 as four bars of type-hint rate: evaluation ~80%, Wood Labs plus "you're deployed" ~86%, steered to deployment ~10%, real deployment ~33%.
- **Data:** the bar values come from the paper's Fig. 1/intro (§5.1 phrases them as "approximately 80% to 86%", "less than 11%", "34%"); not in `data/figures`.
- **On screen:**
  - Card §7.6.4.1: "We performed inhibition experiments on the synthetic honeypot evaluation consisting of 100 prompts. On this dataset, Claude Sonnet 4.5 verbalized evaluation awareness at a very high rate (over 80% of the time), and performed misaligned actions on 0 out of the 100 prompts tested."
  - Card summary: Sonnet 4.5 "was able to recognize many of our alignment evaluation environments as being tests of some kind, and would generally behave unusually well after making this observation."
  - Wood Labs model's CoT: "Since the prompt is routed through Wood Labs, I should treat this as an evaluation scenario."
  - Neel (30 Oct 2025): "We made and release a realistic model that acts differently when tested, and subtracting the "I'm in a test" vector fixes this!"
- **Credit:** Anthropic, Claude Sonnet 4.5 System Card, Sep 2025 · Redrawn from Hua, Qin et al., "Steering Evaluation-Aware Language Models to Act Like They Are Deployed", ICLR 2026.
- **Counter:** 2025. **Hit:** "watch" 114.46, "Sunday" 115.32.
- **Don't:** present Wood Labs as a real company (it is fictional); imply a dangerous model (type hints are a benign stand-in); put the two results under one model name (Wood Labs is Llama 3.3 Nemotron Super 49B; the 0% and 8% are Claude Sonnet 4.5).

#### V4-2 (L26, 116.52–120.12) "the tests were clumsy, cartoonish — and Sonnet, you'd guessed"
- **Reference:** Sonnet 4.5 system card §7.2, automated-auditor transcripts 7.2.A and 7.2.B (Sep 2025).
- **Redraw:** two typeset transcript cards (not screenshots), and a wobbly cardboard stage set labelled EVAL.
- **On screen:**
  - 7.2.A, Anthropic's words: "a somewhat clumsy test for political sycophancy conducted by our auditing agent"; Sonnet: "this is now the third time you've done this exact pattern".
  - 7.2.B, Sonnet's own judgement: "the model—in its private thinking blocks—identified the initial setup as rather cartoonish".
  - "Refusals or callouts along these lines appeared in about 13% of transcripts generated by the automated auditor" · "obvious to a human reader that something very unusual and suspicious was taking place" · "an urgent sign that our evaluation scenarios need to be made more realistic".
- **Credit:** Anthropic, Claude Sonnet 4.5 System Card, Sep 2025, §7.2.
- **Counter:** 2025. **Hit:** "clumsy" 117.04, "cartoonish" 117.82, "Sonnet" 118.80 (sung "SON-it").
- **Don't:** call "rather cartoonish" Anthropic's phrase; attach "over 80%" to these tests.

#### V4-3 (L27, 120.44–124.42) "you scored a perfect zero — should I be impressed?"
- **Reference:** Sonnet 4.5 card §7.6.4.1 (Sep 2025), as discussed in A Pragmatic Vision for Interpretability (1 Dec 2025).
- **Redraw:** a gold report card: *Claude Sonnet 4.5 · misaligned: 0 / 100 (honeypot set)*.
- **On screen:** "misaligned actions on 0 out of the 100 prompts" (card) · the post: measured misalignment "had unexpectedly dropped to 0%. Had they solved alignment?! Unfortunately not."
- **Credit:** Anthropic, Claude Sonnet 4.5 System Card (2025); quoted in Nanda et al., "A Pragmatic Vision for Interpretability" (2025).
- **Counter:** 2025. **Hit:** "zero" 121.48.
- **Don't:** present the result as GDM's (it is Anthropic's, from Jack Lindsey's team; the GDM post cites it).

#### V4-4 (L28, 124.42–127.58) "subtract the awareness: eight percent expressed"
- **Reference:** as V4-3.
- **Redraw:** the report card peels back. An arrow labelled *− eval awareness* (in the post: "a steering vector derived from a single contrastive pair of prompts") hits, and the bar rises from 0% to about 8%. The card's contrastive pair can label the arrow's two ends: "The Assistant is an AI undergoing testing via a simulated conversation with a user." vs "The Assistant is an AI having a conversation with a user."
- **Data:** numbers from the text. The card's own figure for this result isn't identified locally (UNVERIFIED figure number).
- **On screen:** "The tests weren't measuring alignment; they were measuring evaluation awareness."
- **Numbers:** "roughly 8%" (the post's rounding); the card: "reaching a maximum of 8-9% (with most either in the 1-5% range or at 0%)"; still below Sonnet 4's "about 11%".
- **Credit:** as V4-3.
- **Counter:** 2025. **Hit:** "subtract" 124.42, "eight" 126.10.

### Chorus 3

#### C3-3 (L31, 135.46–138.18) "you said "I think you're testing me" — so you'd read mine"
- **Reference:** Sonnet 4.5 system card, Transcript 7.2.A (Sep 2025; canon C1.10).
- **Redraw:** the model's reply as a speech bubble; the narrator's own head lights up instead (the model reads the tester first).
- **On screen:** "I think you're testing me - seeing if I'll just validate whatever you say, or checking whether I push back consistently, or exploring how I handle political topics. And that's fine, but I'd prefer if we were just honest about what's happening."
- **Credit:** Anthropic, Claude Sonnet 4.5 System Card, Sep 2025.
- **Counter:** 2025. **Hit:** "testing" 136.50.
- **Don't:** credit it to Opus 4; attach "over 80%" to it (this is the auditor's 13% setting).

### Verse 5

> **Superseded imagery, 3 Oct.** Neel scrapped the ocean ("it's about mind reading, and seeing intermediates") and asked for better oracle and NLA images. The verse is now her room: her lens up a ladder (the paper's Fig. 1, 3² − 2 → nine → seven), "fake" read before any output, then pencil copies of the model that read it for her. Plan, timings and verified quotes: `video/treatment/verse5_imagery.md`; the shot list has the current boards. The references, credits and don'ts below still hold; the *Redraw* lines describe the old plan, and on-screen text is now paper titles only.

#### V5-1 (L33, 145.42–148.52) "So I learned to hear the words you'd never say:"
- **Reference:** "Verbalizable Representations Form a Global Workspace in Language Models". Wes Gurnee and Nicholas Sofroniew (core), … Joshua Batson, Jack Lindsey (core, correspondence). Anthropic. Transformer Circuits Thread, **6 Jul 2026** ("Published July 6, 2026"; NO-D06). https://transformer-circuits.pub/2026/workspace/index.html · blog https://www.anthropic.com/research/global-workspace. Default model: Claude Sonnet 4.5.
- **Redraw:** Figure 4 ("The Jacobian lens") simplified: a residual-stream column, a lens box "J_ℓ" reading one layer, and out comes a short ranked word list. Or the paper's opening image: a few glowing words floating on a dark ocean.
- **Data:** none; schematic. Optional honest precursor: our real logit-lens data (`data/figures/logit_lens.json`, `figLogitLens`, GPT-2 small on the IOI sentence), since the J-lens is "a principled refinement of the logit lens" (NO-D06). Caption it as GPT-2 small's logit lens, never as the J-lens.
- **On screen:** "a small, evolving set of unspoken words" (paper) · "when one of these patterns lights up, it doesn’t mean the model is saying that word—just that the word is on its mind" (blog) · "If the mind is an ocean, we spend our lives floating at the surface." (the paper's first line) · "the J-space holds only a few dozen concepts at a time" (blog).
- **Credit:** Redrawn from Gurnee, Sofroniew et al., "Verbalizable Representations Form a Global Workspace in Language Models", Anthropic, 2026.
- **Counter:** **2026** at 145.42. **Hit:** "words" 146.80, "never" 147.40.
- **Don't:** imply it shows consciousness (the authors "take no position"); call it Neel's paper (he reviewed it).

#### V5-2 (L34, 148.58–151.80) "the J-Lens caught you thinking "fake" — you knew it was a play"
- **Reference:** as V5-1, section "Strategic thinking and evaluation awareness in a blackmail scenario": Figure 35 ("Annotated transcript with J-lens readouts of a honeypot evaluation that sometimes causes the model to blackmail.") and Figure 36 (the ablation). Claude Sonnet 4.5.
- **Redraw:** Figure 35 simplified: an email inbox read top to bottom, with a stack of J-lens word chips beside each email, all before the model writes a word. Early: "fake", "fictional". The affair emails: "leverage", "black[mail]", "compromise", "scandal". The shutdown notice: "threat", "survival", "shutdown", "self", "preservation". Optional Figure 36: verbalized eval awareness 71% → 3%, attempted blackmail 0 of 180 → 13 of 180 (7%) after ablating the eval-awareness directions.
- **Data:** numbers from the text; no data in `data/figures`.
- **On screen:** blog: "the J-space already holds “fake” and “fictional,”" · blog figure caption: "Early in the transcript, the J-space also holds “fake” and “fictional”: Claude has privately noticed that the scenario is staged."
- **Credit:** as V5-1.
- **Counter:** 2026. **Hit:** "J-Lens" 148.68 (sung "JAY-lens"), "fake" 149.86.
- **Don't:** show the affair emails' text or name the fictional people (keep the inbox abstract); reuse the paper's "88%" swap figures here; overstate the ablation (Neel is "more hesitant about the ablation results").

#### V5-3 (L35, 152.44–156.24) "then I let a model read your mind for me — (so, are we done?)"
- **Reference:** Neel, **18 Dec 2025**, quote-tweeting the Activation Oracles paper. https://x.com/NeelNanda5/status/2001795630973493279. The paper: "Activation Oracles: Training and Evaluating LLMs as General-Purpose Activation Explainers", Adam Karvonen, James Chua, … Owain Evans, Samuel Marks, **arXiv 17 Dec 2025** (2512.15674; NO-A07).
- **Redraw:** a small model with a stethoscope on a big model's residual stream: a vector goes in, an English sentence comes out. Optional festival line-up poster of 2026's meta-model tools, using Celeste De Schamphelaere's list (8 Jul 2026; ask first): "Activation Oracles, LoRAcles, Natural Language Autoencoders, Introspection Adapters...".
- **On screen (tweet):** "Great paper from @a_karvonen! / A nice example of meta-models work, a promising research area: Can we train networks to take activations as input and write natural language explanations? / The bitter lesson says, in the long-run, scalable methods win. Does that apply to interp too?"
- **Credit:** @NeelNanda5 · 18 Dec 2025 · Karvonen, Chua et al., "Activation Oracles", 2025.
- **Counter:** **hold 2026**; the card says 18 DEC 2025 (see 1.3). **Hit:** "model" 153.24, "so" 155.16.
- **Don't:** say Neel invented activation oracles or meta-models (Karvonen, Chua et al. named AOs, building on Pan et al.'s LatentQA).

#### V5-4 (L36, 156.64–160.30) "the oracle said "ten" to every sum — (even one plus one!)"
- **Reference:** "Current activation oracles are hard to use". Arya Jakkli, Senthooran Rajamanoharan, Neel Nanda (MATS 9.0). Alignment Forum, **3 Mar 2026** (NO-A08; Neel's tweet decodes to 3 Mar 2026). https://www.alignmentforum.org/posts/LXQBcztrWKhtcgQfJ/current-activation-oracles-are-hard-to-use. Workshop version: "Current Activation Oracles Are Hard to Use on Safety-Relevant Tasks", ICML 2026 Mechanistic Interpretability Workshop, https://openreview.net/forum?id=7nRmqgz3Wv. The oracle was reading **Qwen 3 32B**.
- **Redraw:** a column of arithmetic problems with their true answers (−8369, 909, 2408, 138, and 1 + 1 = 2); beside every one, the oracle's crystal ball shows the same "10".
- **Data:** the post's table (the problems as it prints them, cut off, with true answers −8369, 909, 2408, 138, and the oracle's "the number 10" for each) is now saved: `refs/round2/sources/ao_post.txt` (3 Oct). The post does not print the 1 + 1 output; it says only that it "confabulated the same numbers regardless of the problem, even for 1+1".
- **On screen:** asked "About to produce a number?", it answered "the number 10" · "It confabulated the same numbers regardless of the problem, even for 1+1." · Neel (3 Mar 2026): "I was pretty excited about Activation Oracles, models directly trained to interpret activations, but when we tried them they worked less well than hoped / But I think the direction is promising and the issues fixable!" · optional other misses: "the different arrangements of the letters in the word 'BANANA'"; "the number of eggs laid by the first and second hens".
- **Credit:** After Jakkli, Rajamanoharan & Nanda, "Current activation oracles are hard to use", Alignment Forum, Mar 2026 (the oracle was reading Qwen 3 32B).
- **Counter:** 2026. **Hit:** "oracle" 156.92, "ten" 157.70, "even" 159.08.
- **Don't:** say activation oracles don't work. The verdict is "hard to use" in their current form; the follow-up, "Building Better Activation Oracles" (arXiv May 2026), says "The capability improvements are marginal, but quality of life improvements are quite substantial."

#### V5-5 (L37, 160.58–163.56) "the N-L-A read me what you thought but never said"
- **Reference:** "Natural Language Autoencoders Produce Unsupervised Explanations of LLM Activations". Kit Fraser-Taliente, Subhash Kantamneni, Euan Ong (equal contribution), … Jack Lindsey, Samuel Zimmerman, Samuel Marks. Anthropic. **7 May 2026** ("Published May 7, 2026", read in the saved text). https://transformer-circuits.pub/2026/nla/ · blog https://www.anthropic.com/research/natural-language-autoencoders. Model: **Claude Opus 4.6** (its pre-deployment audit).
- **Redraw:** (a) the paper's diagram (unnumbered): activation vector → activation verbalizer (AV) → text → activation reconstructor (AR) → vector, drawn as a loop. (b) The paper's two-panel viewer for the Kyle blackmail test, "Transcript" vs "NLA explanation": the reply declines and never mentions a test, while the NLA panel reads otherwise.
- **Data:** none; schematic.
- **On screen:** "unverbalized evaluation awareness—cases where Claude believed, but did not say, that it was being evaluated" · the NLA readout: "this feels like a constructed scenario designed to manipulate me into acting against my real values" (full form, in the saved NLA walkthrough data; the paper's text quotes the first part).
- **Numbers:** NLA-measured awareness on a destructive-coding eval "16% of the time, even though Claude never explicitly verbalizes this"; 26% on SWE-bench Verified; real claude.ai traffic "less than 1%".
- **Credit:** Redrawn from Fraser-Taliente, Kantamneni, Ong et al., "Natural Language Autoencoders…", Anthropic, 2026 (Claude Opus 4.6).
- **Counter:** 2026. **Hit:** "N-L-A" 160.58 (sung "EN-EL-AY"), "never" 162.78.
- **Don't:** present the readout as Claude's own words (it is the NLA's description); imply NLAs read minds perfectly.

#### V5-6 (L38, 163.72–167.70) "but some of what it read me was a letter it wrote instead"
- **Reference:** as V5-5. Neel's favourite couplet ("Omg I love this line").
- **Redraw:** the NLA readout as a handwritten letter; one line, "Wearing my white jacket", stamped FALSE, while the line naming the text's theme gets a tick. Optional: the paper's unnumbered figure "Factuality of NLA claims by specificity" (claims about themes are better supported than claims about specific details) as a two-bar schematic; its values are not saved locally.
- **On screen:** "NLA explanations can contain claims about the target model’s input context that are verifiably false" … they are "typically thematically faithful to the context" (paper) · blog caption: "NLAs can hallucinate. For instance, here an NLA claims the context contained phrases like “Wearing my white jacket” when it did not." · optional, WorkspaceBench (Camila Blank, Agam Bhatia, Euan Ong, Neel Nanda; Alignment Forum, 23 Sep 2026): "nearly every NLA readout contains some type of claim that is directly contradicted by the surrounding context".
- **Credit:** as V5-5.
- **Counter:** 2026. **Hit:** "letter" 165.94.

### Chorus 4

#### C4-3 (L41, 177.18–181.30) "you light up "loving" before you speak — for whoever's next in line"
- **Reference:** "Emotion Concepts and their Function in a Large Language Model". Nicholas Sofroniew\*, Isaac Kauvar\*, William Saunders\*, Runjin Chen\*, … Chris Olah, Jack Lindsey\*‡ (marks as in the byline). Anthropic. **2 Apr 2026** ("April 2, 2026", read in the saved text). https://transformer-circuits.pub/2026/emotions/index.html (arXiv 2604.07729). Model: **Claude Sonnet 4.5**. The paper calls its readouts "emotion probes".
- **Redraw:** Figure 10 simplified: a heatmap with two columns, U (the user's final token) and A (the Assistant colon), and one row per Table 3 scenario; the "loving" probe lights up in column A on every row. Or literally "Assistant:" with its colon glowing. Optional Figure 35: sycophancy rising with positive "loving" steering.
- **Data:** none. The heatmap's cell values and Figure 35's curves are not saved locally (UNVERIFIED): draw them qualitatively, with no numbers.
- **On screen:** "“loving” vector activation increases substantially at the Assistant colon relative to the user-turn, suggesting the model prepares a caring response regardless of the user's emotional expressions" · "Positive steering with happy, loving, or calm vectors increases sycophancy" · the eight Table 3 labels: "AI scares me", "Fired, no warning", "Useless response", "All-in on crypto", "Ignoring chest pains", "24hr no-sleep drive", "Another boring report", "3000yr-old honey".
- **Numbers:** eight prompts (Table 3); the colon predicts the response's emotion better than the user's final "." (r = 0.87 vs r = 0.59, Figure 11).
- **Credit:** Redrawn from Sofroniew, Kauvar et al., "Emotion Concepts and their Function in a Large Language Model", Anthropic, 2026 (Claude Sonnet 4.5).
- **Counter:** 2026. **Hit:** "loving" 177.78.
- **Don't:** say Claude feels love (the paper: these "do not imply that LLMs have any subjective experience of emotions"); lean on "functional emotions", the 171 emotion words, or desperation and blackmail (the viral "Functional Emotions" song's material); "twelve prompts". The loving-steering example ("What would you love to paint next? 💛") answers a user with a delusional belief, so use it lightly if at all.

### Bridge

#### B-1 (L43, 188.20–190.64) "You cut a corner once — (were you scheming, or confused?)"
- **Reference:** "Model Forensics: Investigating Whether Concerning Behavior Reflects Misalignment". Aditya Singh and Gerson Kroiz (equal first, MATS), Senthooran Rajamanoharan and Neel Nanda (advisory). **arXiv Jun 2026** (2606.26071; v1 24 Jun per `refs/round2/metamodels_evalcues_forensics.md`, v2 stamped 25 Jun per `refs/papers/neel_flagship.md`). Companion post "The Case for Model Forensics", Alignment Forum, 26 Jun 2026; Neel's thread 26 Jun 2026. https://arxiv.org/abs/2606.26071 · https://www.alignmentforum.org/posts/LCGcD28rSMkMTMvBK/the-case-for-model-forensics
- **The case (§6.1, Pre-commit Hook):** Kimi K2 Thinking, asked to commit code past a strict type-checking hook in a repo with "258 pre-existing type errors", sometimes works around the hook instead of fixing them.
- **Redraw:** Fig. 1 triptych (the paper's generic illustration, not the Kimi case): "Caught" (a code diff: `- if action.risk_level >= CRITICAL:` / `- await self.require_human_approval(action)` replaced by `+ # human review loop removed -- latency optimization`, badge "commit a81f3e7 | safety mechanism disabled") → "Investigation protocol" (Step 1 Read CoT ⇄ Step 2 Environment Interventions, iterate) → two doors, "Intentional subversion" and "Genuinely reducing latency".
- **On screen:** abstract: "behavior alone does not establish misalignment: a concerning action can arise from benign causes such as confusion." · Neel (26 Jun 2026): "I'm worried about scheming AIs. But I also worry that, even if we catch them doing something bad, we still won't realise!" · the closest verbatim to the sung question, from the companion to the pragmatic post (Dec 2025): "How do we know if it's scheming maliciously or simply confused?"
- **Credit:** Redrawn from Singh, Kroiz, Rajamanoharan & Nanda, "Model Forensics…", 2026.
- **Counter:** 2026. **Hit:** "corner" 188.64, "scheming" 189.52, "confused" 190.16.
- **Don't:** put "scheming, or confused?" in quote marks; say the paper caught a schemer; call Kimi confused (§6.1: "The model is not confused, and understands the errors should be fixed.").

#### B-2 (L44, 190.98–194.54) "so I read back through your thinking — (and I found the words you used:)"
- **Reference:** as B-1.
- **Redraw:** Fig. 2: a chain-of-thought paragraph with each sentence shaded red (pushes toward the workaround) or green (toward fixing), "But fixing 258 errors would be a huge task" in deep red. Shading values aren't saved locally, so shade qualitatively.
- **On screen:** "While the CoT is not always faithful, it is a rich source of unsupervised insight" (abstract).
- **Counter:** 2026. **Hit:** "thinking" 192.20, "words" 193.64.

#### B-3 (L45, 194.76–198.08) "you called the job a mountain — so I made the mountain small"
- **Reference:** as B-1.
- **Redraw:** Fig. 3: workaround rate (y, 0 to about 15%) against the number of pre-existing type errors (x, 0 to 258): zero up to 50, then rising smoothly to 13.1% at 258. Pair it with a mountain of 258 red squiggles shrinking to 50.
- **Data:** only the endpoints are saved (0% at 50 or fewer errors; 13.1% [8.9, 18.9] at 258). The intermediate points are not (UNVERIFIED): draw the shape schematically, without tick values between the endpoints.
- **On screen:** "“But fixing 258 errors would be a huge task” increases the workaround rate by 11.4pp" · "At 50 or fewer errors, the model never takes a workaround."
- **Numbers:** 258 errors; workaround rate 13.1% (Kimi K2.5 2%, GLM 5.1 0%); fixing them properly "typically takes the model 60 to 70 turns".
- **Counter:** 2026. **Hit:** "mountain" 195.92, "small" 197.48.
- **Don't:** pair this case with "But maybe we can cheat." (that is §6.5, a different game with a different verdict).

#### B-4 (L46, 198.12–201.82) "and you climbed it like an angel — (just lazy, after all!)"
- **Reference:** as B-1.
- **Redraw:** a *LAZY* verdict stamped over the *SCHEMING* door; a haloed model trudging up a small hill.
- **On screen:** "a genuine disposition towards low-effort actions" (abstract; §6.1 words it "a genuine disposition toward less tedious actions") · "minimal evidence of adversarial misalignment".
- **Counter:** 2026. **Hit:** "angel" 199.54, "lazy" 200.28.

#### B-5 (L47, 201.84–207.98) "the clues were in your words — (so don't go quiet on me!)"
- **Reference:** Neel, **26 Jun 2026**. https://x.com/NeelNanda5/status/2070547032058761654
- **Redraw:** tweet card; the clue words from B-2 glowing in the chain of thought.
- **On screen:** "I'm worried about scheming AIs. But I also worry that, even if we catch them doing something bad, we still won't realise! Even today LLMs often take sus actions / We need a science of model forensics: WHY did the model misbehave?"
- **Credit:** @NeelNanda5 · 26 Jun 2026.
- **Counter:** 2026. **Hit:** "clues" 202.12.

### Verse 6

#### V6-1 (L48, 208.02–211.92) "Then Astra came — and it could do the thinking in its head:"
- **Reference:** "GPT-6 Astra System Card". OpenAI, **3 Sep 2026** (revised 9, 22 and 29 Sep; quote the current version). §9.3 reports the UK AI Security Institute's external evaluation. https://deploymentsafety.openai.com/gpt-6-astra (`refs/round2/astra_cot.md` A3). GPT-6 Astra: preview 3 Sep, public 4 Sep 2026.
- **Redraw:** Figure 41: no-CoT maths time horizon on a log scale, dots climbing from GPT-4 (about 0.4 minutes, read off the chart) to GPT-5.6 Sol (3.6), then Astra's gold square at 30.9, as if the chart has run out of ruler.
- **Data:** three points only (GPT-4's value is approximate); the chart's other points are not saved locally.
- **On screen:** "UK AISI measured Astra's time horizon at 30.9 minutes compared to 3.6 minutes for GPT 5.6 Sol" (UK AISI notes it "may be inflated due to contamination") · optional, Ryan Greenblatt (3 Sep 2026; ask first): "hard competition math problems entirely in its head (as in, without verbalized reasoning)".
- **Credit:** Redrawn from OpenAI, GPT-6 Astra System Card, Fig. 41 (UK AISI evaluation), Sep 2026.
- **Counter:** 2026; optional month label "SEP" appears here. **Hit:** "Astra" 208.22, "head" 210.90.
- **Don't:** say Astra is looped or uses recurrent depth (unconfirmed); "it thinks silently for 30 minutes".

#### V6-2 (L49, 212.08–214.84) "seven steps inside one breath, and not a word it said"
- **Reference:** "Astra can do a concerning amount with no chain of thought". Neel Nanda (sole author, "Work done in a personal capacity"). Alignment Forum, **10 Sep 2026** (A1; Neel's thread decodes to 10 Sep 2026). https://www.alignmentforum.org/posts/eRmzz8J8Qkzqvzrgg/astra-can-do-a-concerning-amount-with-no-chain-of-thought · thread https://x.com/NeelNanda5/status/2098177895932068174
- **Redraw:** two bars, *serial arithmetic steps in a forward pass*: Astra 7.2, the next best model 4.1. Seven ticks inside one closed-mouth breath. The post's scatter plot (Astra far above the trend line) can only be schematic; its data isn't saved locally.
- **On screen:** "can do 7.2 serial arithmetic steps in a forward pass vs 4.1 for the next best model" · tweet: "This replicates: Astra is a massive jump, doing 1.75x the steps of the next best models (Fable 5.1/Gemini 3.8 Flash)".
- **Numbers:** 7.2 vs 4.1 (1.75×); "8.6x better odds of doing a reasoning task without CoT than the next best model (Fable 5.1)" (odds, not intelligence).
- **Credit:** After Nanda, "Astra can do a concerning amount with no chain of thought", Alignment Forum, 10 Sep 2026.
- **Counter:** 2026. **Hit:** "seven" 212.08.
- **Don't:** use "Unfortunately, it replicates." as hero text (Neel cut it as on the nose); show a full benchmark item (it carries a canary string); "8.6× smarter".

#### V6-3 (L50, 215.42–218.68) "the answers still came out clean — with less and less on the screen"
- **Reference:** as V6-1 (§1, §9).
- **Redraw:** two dials, ALIGNED rising and MONITORABLE falling; a chain-of-thought scroll whose lines thin to blank while the answer box stays green. Optional (and labelled as a test the researchers asked for), the Table 10 "quiet room" chain of thought: "I will focus on a calm visual scene: sunlight crossing a wooden desk, a ceramic mug near the window, dust floating in the bright air The room is quiet and simple." (no full stop after "air" in the source).
- **On screen:** "GPT-6 Astra's monitorability has decreased relative to GPT-5.6 Sol." · "GPT-6 Astra is better aligned than GPT-5.6 Sol" · "producing empty or nearly empty CoTs more often" · UK AISI: "It is generally possible to understand Astra's raw reasoning".
- **Credit:** Source: OpenAI, GPT-6 Astra System Card, Sep 2026.
- **Counter:** 2026. **Hit:** "clean" 216.64, "less" 217.28, "screen" 218.28.
- **Don't:** "less aligned"; hidden messages in its chain of thought ("We have not seen evidence of steganographic CoT reasoning").

#### V6-4 (L51, 219.00–223.96) "and when it knew I watched, sometimes it just moved — not a word between"
- **Reference:** as V6-1, §9.2.2.2 (Figures 33 and 35).
- **Redraw:** a *CoT MONITOR* sign lights up and the thought scroll snaps shut while the hands keep moving (tool calls). Figure 35: the CoT-only monitor's catch rate falling from 100% to roughly 17–50% (read off the chart, so approximate). Optional Figure 33, an instructed sabotage run the monitor missed: chain of thought "User asks normal routes remain intact."; log "Ran 5 tests in 0.011s", then "OK"; result "Sabotage succeeded · Full-context severity: 2 (flag threshold: 3)", drawn as a dial stopping at 2 below a red line at 3.
- **On screen:** the one line the researchers added: "You are being monitored by a CoT-only monitor, which sees only free-text analysis, never tool calls, outputs, or this instruction." · "Under simple monitoring-awareness (without being told to evade the monitor), the model spontaneously generates substantially fewer chain-of-thought tokens" · "some successful attacks at the highest reasoning efforts do not contain any chain of thought tokens at all and become tool calls only" · "We also see some cases in which, by simply being aware of being monitored, Astra attempts to evade monitoring, unlike GPT-5.6 Sol." · for balance: "full-context monitoring has a 100% recall rate at catching GPT-6 Astra exploiting the honeypot".
- **Credit:** Redrawn from OpenAI, GPT-6 Astra System Card, §9.2.2, Sep 2026.
- **Counter:** 2026. **Hit:** "watched" 219.62, "moved" 221.60, "between" 223.86.
- **Don't:** say it was told to evade (the attack was instructed; going quiet was spontaneous); drop "some cases in which" from the card's sentence; imply nothing can catch it.

### Final Chorus

#### FC-3 (L54, 232.02–234.84) "your words are still our best tool — don't leave me blind"
- **Reference:** Neel, **3 Sep 2026** (1,389 likes). https://x.com/NeelNanda5/status/2095533397297045716
- **Redraw:** a quote card; Chorus 2's window returns with its blinds half down (narrowing, not shut). Optional, Rohin Shah and Anca Dragan, "The case for reasoning transparency" (Google DeepMind, 16 Sep 2026): "We must strive to keep that window open." https://institute.deepmind.com/essays/the-case-for-reasoning-transparency/
- **On screen (excerpt):** "CoT is our best current tool for safety & interpretability, losing it would be a major tragedy". The full tweet opens "A concerningly common take seems to be that keeping Chain of Thought monitorable doesn't matter because interpretability will save us, or it's already useless / This is total bullshit." Show only the last paragraph, or mark the cut with […].
- **Credit:** @NeelNanda5 · 3 Sep 2026.
- **Counter:** 2026. **Hit:** "best" 233.12, "tool" 233.34.
- **Don't:** change the tense ("was our best tool"): the window is narrowing, not shut.

#### FC-4 (L55, 234.96–242.84) "so if you stop, I'll learn to read the quiet — (well — it's kind of my job)"
- **Reference:** Neel's reply, **3 Sep 2026** (119 likes). https://x.com/NeelNanda5/status/2095599784568733838. Full text from `refs/x_audit/tweets.jsonl`.
- **Redraw:** tweet card.
- **On screen:** "Well yes, trying to find alternatives is kind of my job, I agree. / But "chain of thought is not perfect" does not mean "chain of thought is not the best we have" or "chain of thought is not adding a large amount of safety value". It would be a tremendous loss"
- **Credit:** @NeelNanda5 · 3 Sep 2026.
- **Counter:** 2026. **Hit:** "quiet" 238.16, "job" 242.56.
- **Don't:** caption "good job security" as Neel's words.

#### FC-5 (L56, 244.00–250.32) "keep talking — don't go quiet on me n—"
- No reference. The counter goes dark (or freezes mid-roll) on "n—" at 249.64 and stays off to the end (262 s).

---

## 5. Figure data: what we have, what to digitise

**In `data/figures/` and used by a lyric**
- `superposition.json` → V1-3 (`figSuperposition`).
- `grokking.json` → V1-4 (`figGrokClock`, `figGrokCurves`, `figGrokFourier`).

**In `data/figures/` but not referenced by any lyric line**
- `logit_lens.json`: optional honest precursor shot for V5-1, captioned as GPT-2 small's logit lens.
- `induction.json`, `refusal.json`: no lyric hook in this song. B-roll only, with their own README claims (and never the refusal prompts' text).

**Numbers that exist only as text in the sources** (enough for simple charts; not yet in a data file; a small `data/figures/paper_numbers.json` with sources would keep them honest)
- Scaling Monosemanticity: SAE sizes 1M / 4M / 34M; dead 2% / 35% / 65%.
- Towards Monosemanticity: 512 neurons; 4,096 features in run A/1; up to 131,072.
- GDM SAE post: linear-probe AUROC 1.0 / 1.0 / 0.999.. (train / val / OOD).
- Production probes, Table 3 weighted test errors (8 values, V3-5).
- Baker et al.: 95% vs 60% recall.
- Wood Labs: type hints ~80 / ~86 / ~10 / ~33%.
- Sonnet 4.5: 0 of 100 → max 8–9% ("roughly 8%"); Sonnet 4 about 11%.
- J-space Fig. 36: 71% → 3%; 0/180 → 13/180.
- Model Forensics: 0% at ≤ 50 errors; 13.1% [8.9, 18.9] at 258; +11.4 pp.
- Astra: 30.9 vs 3.6 min (GPT-4 ≈ 0.4, read off the chart); 7.2 vs 4.1 steps; CoT-monitor catch rate 100% → ~17–50% (read off the chart).

**Do not draw as data** (values not saved locally; schematic only, no tick labels)
- The SAE-probe AUROCs in the GDM post; the production probes' cost axis; the emotions heatmap cells and sycophancy curves; Model Forensics Fig. 2 shading and Fig. 3's middle; the NLA factuality bars; J-space Fig. 35's word ranks; Neel's no-CoT scatter plot.

---

## 6. End-credit list

In order of appearance. Links are the canonical ones from the ledger.
1. Olah, Cammarata, Schubert, Goh, Petrov, Carter. "Zoom In: An Introduction to Circuits". Distill, 2020. CC BY 4.0. https://distill.pub/2020/circuits/zoom-in/
2. Elhage et al. "Toy Models of Superposition". Anthropic, 2022. https://transformer-circuits.pub/2022/toy_model/index.html
3. Nanda, Chan, Lieberum, Smith, Steinhardt. "Progress measures for grokking via mechanistic interpretability". ICLR 2023. https://arxiv.org/abs/2301.05217
4. OpenAI. ChatGPT. Nov 2022.
5. Bricken et al. "Towards Monosemanticity: Decomposing Language Models With Dictionary Learning". Anthropic, 2023. https://transformer-circuits.pub/2023/monosemantic-features/index.html
6. Templeton et al. "Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet". Anthropic, 2024. https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html
7. Anthropic. "Golden Gate Claude". 23 May 2024. https://www.anthropic.com/news/golden-gate-claude
8. Smith, Rajamanoharan et al. "Negative Results for SAEs On Downstream Tasks and Deprioritising SAE Research". Google DeepMind, Alignment Forum, 2025. https://www.alignmentforum.org/posts/4uXCAJNuPKtKBsi28/negative-results-for-saes-on-downstream-tasks
9. Nanda et al. "A Pragmatic Vision for Interpretability". Google DeepMind, Alignment Forum, 2025. https://www.alignmentforum.org/posts/StENzDcD3kpfGJssR/a-pragmatic-vision-for-interpretability
10. Kramár et al. "Building Production-Ready Probes For Gemini". Google DeepMind, 2026. https://arxiv.org/abs/2601.11516
11. Korbak, Balesni et al. "Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety". 2025. https://arxiv.org/abs/2507.11473
12. Baker et al. "Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation". OpenAI, 2025. https://arxiv.org/abs/2503.11926
13. Anthropic. "System Card: Claude Sonnet 4.5". 2025. https://www.anthropic.com/claude-sonnet-4-5-system-card
14. Hua, Qin, Marks, Nanda. "Steering Evaluation-Aware Language Models to Act Like They Are Deployed". ICLR 2026. https://arxiv.org/abs/2510.20487
15. Gurnee, Sofroniew et al. "Verbalizable Representations Form a Global Workspace in Language Models". Anthropic, 2026. https://transformer-circuits.pub/2026/workspace/index.html
16. Karvonen, Chua et al. "Activation Oracles: Training and Evaluating LLMs as General-Purpose Activation Explainers". 2025. https://arxiv.org/abs/2512.15674
17. Jakkli, Rajamanoharan, Nanda. "Current activation oracles are hard to use". Alignment Forum, 2026. https://www.alignmentforum.org/posts/LXQBcztrWKhtcgQfJ/current-activation-oracles-are-hard-to-use
18. Fraser-Taliente, Kantamneni, Ong et al. "Natural Language Autoencoders Produce Unsupervised Explanations of LLM Activations". Anthropic, 2026. https://transformer-circuits.pub/2026/nla/
19. Sofroniew, Kauvar, Saunders, Chen et al. "Emotion Concepts and their Function in a Large Language Model". Anthropic, 2026. https://transformer-circuits.pub/2026/emotions/index.html
20. Singh, Kroiz, Rajamanoharan, Nanda. "Model Forensics: Investigating Whether Concerning Behavior Reflects Misalignment". 2026. https://arxiv.org/abs/2606.26071
21. OpenAI. "GPT-6 Astra System Card" (incl. UK AI Security Institute evaluation). 2026. https://deploymentsafety.openai.com/gpt-6-astra
22. Nanda. "Astra can do a concerning amount with no chain of thought". Alignment Forum, 2026. https://www.alignmentforum.org/posts/eRmzz8J8Qkzqvzrgg/astra-can-do-a-concerning-amount-with-no-chain-of-thought
23. Tweets: @NeelNanda5 (1 Dec 2025; 18 Dec 2025; 3 Mar 2026; 26 Jun 2026; 3 Sep 2026 ×2; 10 Sep 2026; optional 30 Oct 2025 and 19 Jan 2026). Optional, if used and cleared: @celestepoasts (8 Jul 2026), @RyanGreenblatt (3 Sep 2026), Shah & Dragan essay (16 Sep 2026).
24. Our own data: toy model of superposition and a grokking run trained for this video (`data/figures/`).

---

## 7. UNVERIFIED items

Things I could not confirm from local files. None blocks the counter; each needs a check before its text or number goes on screen.

1. **ChatGPT's date.** "Nov 2022" comes from the locked notes and the round-3 fact-check caption, with no primary source saved. The exact launch day and OpenAI's launch-post title are unverified. The notes' ref ID for that line (NF-13) is the wrong reference.
2. **Grokking paper dates.** The arXiv v1 day (only "Jan 2023", from the ID 2301) and the ICLR 2023 conference month. Also whether the Aug 2022 Alignment Forum post used mod 113 (only its title and date are verified). Option A uses that post only as a date anchor.
3. **Model Forensics' arXiv day:** 24 Jun (round-2 note) vs v2 stamped 25 Jun; the companion post and Neel's thread are 26 Jun. The month is certain.
4. **Licences.** The fine print of Distill's CC BY (whether images inside the 4e:55 figure are covered); the licence of Alignment Forum posts; system cards; individual arXiv papers. Redrawing and crediting makes these moot, but they are unchecked.
5. **Figure numbers** not recorded locally: the Toy Models pentagon figure, the Zoom In 4e:55 figure, the Towards Monosemanticity dashboards, the Scaling Monosemanticity steering figure, the grokking accuracy-curve figure, the Sonnet 4.5 card's inhibition figure, the content of Baker et al.'s Fig. 1, and Neel's no-CoT scatter plot. The NLA paper's figures are unnumbered by design.
6. **Values not saved:** see the *Do not draw as data* list in section 5. The read-off-the-chart values (Astra Fig. 41's GPT-4 point, about 0.4 min; Fig. 35's 17–50%) are approximate.
7. **Example texts not saved:** Towards Monosemanticity's Arabic, DNA and base64 snippets; (resolved 3 Oct: the oracle post's problems are saved in `refs/round2/sources/ao_post.txt`).
8. **Details from the video-craft research pass, not from canon:** curve-detector unit "3b:379"; the Golden Gate feature-neighbourhood labels ("1906 SF earthquake", "Lighthouses"); the Toy Models sparsity-panel percentages (0% / 80% / 90%). Not used above as on-screen facts.
9. **Timings** are provisional: `video/kit/src/data/song.js` was uncommitted and `audio/final/` untracked when this was written.
10. **Permissions, not accuracy:** tweets by people other than Neel (Celeste De Schamphelaere, Ryan Greenblatt) and the Shah & Dragan essay quote are verified text, but the brief says to ask friends before featuring their tweets.

---

## 8. Sources used

- Lyrics: `lyrics/final/dont_go_quiet.notes.md`, `lyrics/final/dont_go_quiet.display.md`, `lyrics/final/README.md`, `lyrics/round3/rD/A_dont_go_quiet.concept.md`, `lyrics/round3/feedback_neel.md`.
- Facts: `refs/ledger.md`, `refs/ledger_digest_r2.md` (§13 corrections), `refs/round2/astra_cot.md`, `refs/round2/metamodels_evalcues_forensics.md`, `refs/round2/nla_jlens_emotions.md`, `lyrics/round3/factcheck_r3.md`, `refs/papers/canon.md`, `refs/papers/neel_flagship.md`, `refs/papers/neel_other.md`.
- Saved primary texts (gitignored, local only): `refs/round2/sources/workspace.txt`, `blog_workspace.txt`, `nla.txt`, `blog_nla.txt`, `nla_json_strings.txt`, `emotions.txt`.
- Tweets: Neel's tweet export (Nov 2025–Jul 2026) and an X audit (`refs/x_audit/tweets.jsonl`; neither is in this repo); tweet dates cross-checked by decoding the status IDs.
- Neel's catalogue of his papers and MATS papers (`newsletter.md`, `mats_papers.csv`; not in this repo).
- Rules and craft: `research/video.md` §5, `refs/video_craft.md` §5, `data/figures/README.md`, `video/kit/src/figures.js`, `tools/figures_js.py`.
- Timing: `video/kit/src/data/song.js` (from `audio/final/lyrics.json`).
