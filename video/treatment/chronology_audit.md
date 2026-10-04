# Chronology audit: on-screen references vs the year stamp

Read-only audit, 3 Oct 2026. It checks every shot after the hook against the stamp that `YEAR_TICKS` in `video/kit/src/dgq/board.js` shows at that moment: **2020** at 19.56 ("You"), **2022** at 27.58 ("five"), **2023** at 58.44 ("dictionary"), **2024** at 62.18 ("empty"), **2025** at 70.84 ("Then"), **2026** at 145.42 ("So"), **SEP** at 208.22 ("Astra"), dark at 249.64 ("n—"). Every tick lands on a sung word.

Sources: the shot list (`video/kit/src/data/dgq_shots.js`, identical to `output/checkpoint_video/shots.json` at 03:18) and the text the animatic actually draws (`video/kit/src/scenes/dgq_animatic.js`). The hook (0–19.5 s) is excluded.

- [1. Table](#1-table)
- [2. Proposed fixes, most serious first](#2-proposed-fixes-most-serious-first)
- [3. Decisions in flight: consistency check](#3-decisions-in-flight-consistency-check)
- [4. Sources and limits](#4-sources-and-limits)

---

## 1. Table

**Source tags.**
- **F&C**: `video/treatment/figures_and_cards.md` §4 (line ID).
- **EC**: `video/treatment/egg_checks.md` (item #).
- **L**: `refs/ledger.md` (row ID).
- **canon**: `refs/papers/canon.md`.
- **tw**: date decoded from the tweet's status ID.
- **std**: a standard date I could not re-verify here.

**Verdicts.**
- **OK**: same year as the stamp.
- **OK (dated)**: older, but its year is printed on screen, so it reads as a look-back.
- **Back −N**: N years older, with no year printed (minor).
- **AHEAD +N**: newer than the stamp, a flash-forward. This is the most jarring kind.
- **Early**: right year, but on screen before the stamp ticks.

| Shot | Time (s) | Stamp | Reference → true date [source] | Verdict |
|---|---|---|---|---|
| V1a | 19.49–23.09 | 2020 | Zoom In card, "Science zoomed in." → 10 Mar 2020 [F&C V1-1] · MICROSCOPE drawer → 14 Apr 2020 [EC #6] · InceptionV1 unit labels (the model Zoom In studies) | OK |
| V1b | 23.09–26.69 | 2020 | 4e:55 cat/car neuron → Mar 2020 [F&C V1-2] · curve-detector ring → 17 Jun 2020 [EC #8] · Feature Visualization-style swirls → 7 Nov 2017 [EC #7], an unlabelled drawing style | OK |
| V1c | 26.69–30.29 | 2020 → 2022 on "five" | Toy Models card, pentagon, note "after Elhage et al. 2022" → 14 Sep 2022 [F&C V1-3] | OK; **Early** ~0.7 s (card at 26.84; note and plot from 26.69) |
| V1d | 30.29–36.14 | 2022 | grokking card "first posted AUG 2022 · ICLR 2023" → AF post 15 Aug 2022 [F&C V1-4] · `run_with_cache`, née EasyTransformer → repo 26 Aug 2022 [EC #12] | OK ("first posted" frames the 2023) |
| C1a | 37.49–41.99 | 2022 | smiley-mask shoggoth (on the creature in every chorus) → @TetraspaceWest, 30 Dec 2022 [L C2.02] · "said out loud" meter at zero (pre-ChatGPT) | OK |
| C1b | 41.99–43.79 | 2022 | "ELK?" doodle → AF 14 Dec 2021 [EC #5] · pupil "readout of this era" = lit InceptionV1 tiles → 2020 | ELK OK (two weeks old) · tiles **Back −2** |
| C1c | 43.79–46.49 | 2022 | card "Zoom In, Claim 1: …" with no date printed → 10 Mar 2020 [F&C C1-3] · FEATURE 4e:55 profile card → 2020 · arrow-dancers in Toy Models colours → 2022 | card **Back −2** (F&C says it should print 10 MAR 2020) · dancers OK |
| V2a | 54.14–57.29 | 2022 | ChatGPT card → Nov 2022 [F&C V2-1; 30 Nov std] · IOI prompt → arXiv 1 Nov 2022 [EC #22] · parrot → Bender et al., Mar 2021 [L C2.10], undated, the ChatGPT-era jibe | OK. *Planned:* GPT-4 (14 Mar 2023, std) and Sydney 😊 (Feb 2023, [L C1.08]) would be **AHEAD +1** with today's ticks (fix 3) |
| V2b | 57.29–60.89 | 2022 → 2023 on "dictionary" | Towards Monosemanticity card, "Just 512 neurons…" → 4 Oct 2023 [F&C V2-2] · dashboard-style entries (Neuronpedia not named on screen) | OK; **Early** 1.0 s (card at 57.44) |
| V2c | 60.89–64.49 | 2023 → 2024 on "empty" | Scaling Monosemanticity card, dead-feature bars, p. 31,164,353 → 21 May 2024 [F&C V2-3] · GEMMA SCOPE volume → Jul/Aug 2024 [L A2.01] | OK; **Early** 1.1 s (card at 61.04). Gemma Scope is not drawn yet; keep it after 62.18 |
| V2d–e | 64.49–70.79 | 2024 | Golden Gate Claude card, $10 toll, 24-hour clock, 34M/31164353 → 21/23 May 2024 [F&C V2-4, V2-5] | OK |
| V3a | 70.79–73.49 | 2024 → 2025 on "Then" | Negative Results for SAEs card, 0.999.. → 26 Mar 2025 [F&C V3-1] · "est. 2016" tag → 5 Oct 2016 [EC #1] | OK · tag OK (dated) |
| V3b | 73.49–77.99 | 2025 | Pragmatic Vision card, checklist → 1 Dec 2025 [F&C V3-2] · hammer-and-nail line → GDM, 26 Mar 2025 · "the optimal amount of hype…" → 22 Dec 2025 [EC #17; tw] | OK |
| V3c | 77.99–81.14 | 2025 | tweet card, AND → OR 2×2 → 1 Dec 2025 [EC #16; tw] | OK |
| V3d | 81.14–84.28 | 2025 | Pragmatic Vision card, North Star → 1 Dec 2025 · "one direction (Arditi … Nanda, 2024)" → arXiv 17 Jun 2024 [canon A2.06] | OK · Arditi OK (dated) |
| **V3e** | 84.28–87.43 | 2025 | Production-Ready Probes card "16 JAN 2026" → arXiv 16 Jan 2026 [F&C V3-5] · red pencil "turns out it kinda works!" → Neel, 12 Mar 2026, a tweet about Anthropic's constitution, not about probes [EC #18; tw] | **AHEAD +1** (both); fix 1 |
| P1 | 87.43–91.03 | 2025 (planned 2024 from "thought", 88.24) | CoT Monitorability card → 15 Jul 2025 [F&C P-1] · "Let's think step by step." → Kojima, 24 May 2022 [EC #2] · strawberry, 3 r's → o1, 12 Sep 2024 [EC #4] · "cf. Turpin et al. 2023" → 7 May 2023 [EC #3] | Today: strawberry **Back −1** (the known o1 issue). After the flick: card **AHEAD +1** (fix 2); Kojima Back −2, fine as the scroll's canonical first line; Turpin OK (dated) |
| P2 | 91.03–95.53 | 2025 (planned 2024 until "Let's", 91.66) | Baker et al. card, "Let's hack", 95% vs 60% → arXiv 14 Mar 2025 [F&C P-2; EC #11] | OK; after the flick, **Early** 0.5 s (card at 91.18) |
| C2a | 95.53–101.38 | 2025 | induction-head doodle, MAIN VOCAL card → Olsson et al., 8 Mar 2022 [EC #9] | **Back −3** (known; moving to chorus 1) |
| C2b | 101.38–102.73 | 2025 | "Dallas → Texas → Austin (Biology of an LLM, 2025)", "…blind (planned ahead)" → 27 Mar 2025 [EC #19] · shot-list credit "What's the plan?, ICLR 2026" → arXiv 28 Jan 2026 [EC #20] | Biology OK · What's the plan? **AHEAD +1** if printed (the animatic doesn't print it) |
| C2c | 102.73–105.88 | 2025 | CoT Monitorability card, Fig. 1 loop → 15 Jul 2025 [F&C C2-3] | OK |
| V4a | 112.63–116.23 | 2025 | Sonnet 4.5 card, HUD feature tags → Sep 2025 [F&C V4-1] · Wood Labs card "… · ICLR 2026" → arXiv 23 Oct 2025 [F&C V4-1] · portrait "Alignment Faking in LLMs (Dec 2024)" → 18 Dec 2024 [L C1.02] | Sonnet OK · Wood Labs ambiguous (the only year printed is 2026) · portrait OK (dated, and literally an old portrait) |
| V4b–d | 116.23–128.0 | 2025 | Sonnet 4.5 §7.2, 0 / 100, ~8% → Sep 2025 [F&C V4-2…4] · "The tests weren't measuring alignment…" → 1 Dec 2025 · "I'm in a test" note → Neel, 30 Oct 2025 [tw] | OK |
| C3c | 135.13–138.28 | 2025 | "I think you're testing me", Transcript 7.2.A → Sep 2025 [F&C C3-3] | OK |
| V5a | 145.03–148.18 | 2025 → 2026 on "So" | J-space card, ocean line, J-LENS card → 6 Jul 2026 [F&C V5-1] · roon's "J Space" → 6 Jul 2026 [L X#160; tw] · "logit lens, 2020" → 31 Aug 2020 [L B2.05] · shot-list egg: river credited to "A Mathematical Framework, 2021" with the quote "the residual stream is a river" | OK (card 0.24 s early, negligible) · logit lens OK (dated) · river credit **Back −5**, and the quote is invented (fix 6) |
| V5b | 148.18–152.22 | 2026 | "fake", "fictional" → blog 6 Jul 2026 [EC #14] · theatre → Baars 1988/1997, an unlabelled nod | OK |
| V5c | 152.22–156.27 | 2026 | tweet card "@NeelNanda5 · 18 Dec 2025" → 18 Dec 2025 [F&C V5-3; tw] | **Back −1** (dated, but avoidable; fix 6) |
| V5d | 156.27–160.32 | 2026 | AO post card, "10" to every sum, "the direction is promising…" → 3 Mar 2026 [F&C V5-4; tw] | OK |
| V5e–f | 160.32–168.40 | 2026 | NLA card, AV → text → AR, "Wearing my white jacket" → 7 May 2026 [F&C V5-5, V5-6] · Claude Opus 4.6 audit (in use by Apr 2026 [L S2]) | OK |
| C4c | 176.97–181.92 | 2026 | Emotions card, U/A heatmap → 2 Apr 2026 [F&C C4-3] · "You're absolutely right!" → issue #3382, 12 Jul 2025 [EC #10] · '"Love" − "Hate" (ActAdd)' → Aug 2023 [EC #21] | OK · meme Back −1, still a live joke, fine · ActAdd **Back −3** (no year printed) |
| B1 | 187.77–190.92 | 2026 | Model Forensics card, the two doors, Exhibit A → arXiv 24 Jun 2026 [F&C B-1] · Neel's pinned note → 27 Feb 2026 [tw] | OK |
| B2 | 190.92–194.52 | 2026 | "which sentences matter? (thought anchors)" → arXiv Jun 2025 [L NF-06] · "But fixing 258 errors…" → Jun 2026 | Thought Anchors **Back −1** (no year printed; the shading is Model Forensics' own Fig. 2) |
| B3–B5 | 194.52–208.02 | 2026 | workaround curve, LAZY stamp → Jun 2026 [F&C B-3…5] · tweet card → 26 Jun 2026 [tw] | OK |
| V6a–d | 208.02–224.40 | 2026, SEP from "Astra" | Astra card, Fig. 41, §9.2.2 → 3 Sep 2026 [F&C V6-1] · Neel's post → 10 Sep 2026 [F&C V6-2] · Greenblatt 3 Sep, Zvi 4 Sep 2026 [tw] · GPT-4 and GPT-5.6 Sol as comparison points on the chart | OK |
| FC3–4 | 231.86–243.56 | 2026 SEP | Neel's two tweets → 3 Sep 2026 [tw] · Shah & Dragan essay → 16 Sep 2026 [F&C FC-3] | OK |
| E1 | 249.64–258.40 | dark | credits; shoggoth meme after @TetraspaceWest (30 Dec 2022) | n/a |

The shots not listed (transitions, chorus wides, C3a/b/d, C4a/b/d, FC1/2/5, E2) show no dated reference. The page turns print the current stamp year (2022, 2025, 2025), which is correct.

## 2. Proposed fixes, most serious first

1. **V3e, the probe by the door (84.28–87.43): two 2026 items under a 2025 stamp.** The planned flick then moves the stamp to 2024 about 0.8 s later, so the viewer sees JAN 2026, then 2024. *Lyric-locked:* the line's real subject is the Jan 2026 paper, sung inside the 2025 run. Showing 2026 here would need two more backward ticks, so no tick fix exists. Smallest fix:
   - Drop "turns out it kinda works!". It is from 2026 and about a different topic.
   - Re-anchor the card to the probe already on screen in V3a: GDM's harmful-intent probe on *user prompts* (the door), from the 26 Mar 2025 post ("Dense linear probes perform nearly perfectly, including out of distribution"). Move Production-Ready Probes to the end credits.
   - If Neel wants that paper on screen anyway, mark it explicitly as a flash-forward, e.g. "→ JAN 2026" in the stamp's red.
2. **P1 card under the planned 2024 flick.** Swap CoT Monitorability (Jul 2025) for o1: *Learning to Reason with LLMs · OpenAI · 12 SEP 2024* (EC #4, checked on Wayback). CoT Monitorability is already the C2c card, so nothing is lost.
3. **V2a under the planned Sydney/GPT-4 version.** Move the 2023 tick from "dictionary" (58.44) to **"everyone" (56.08)**.
   - ChatGPT stays on "talk" in 2022. GPT-4 and the 😊 arrive in 2023. Towards Monosemanticity (Oct 2023) stays inside 2023, and the V2b timing problem goes away.
   - The IOI bubble (Nov 2022) already pops at 54.14, before the tick, and only lingers after it.
   - Alternative: tick on "talk" (55.28) if the shot leads with GPT-4/Sydney. The ChatGPT card then becomes a dated one-month look-back.
   - Either way, update V2b's "Year 2023 on 'dictionary'" and F&C §1.2.
4. **Cards that pop before their tick** (code only, no lyric change). `refCard` draws at shot start + 0.15 s (`dgq_animatic.js` line 690). Affected:
   - V1c: about 0.7 s early.
   - V2b: 1.0 s early (gone with fix 3).
   - V2c: 1.1 s early.
   - P1 and P2 after the flick: 0.7 s and 0.5 s early.

   In any shot that contains a tick, pop the card (and the V1c note and plot) on the tick word, and draw Gemma Scope only after 62.18.
5. **Future years printed in 2025 shots.**
   - C2b: keep the rhyme-planning note uncredited, or credit only Biology (Mar 2025). The animatic already does this, but the shot-list egg names *What's the plan?* (Jan 2026).
   - V4a: change the Wood Labs card from "ICLR 2026" to "arXiv 23 OCT 2025", and move ICLR 2026 to the credits.
6. **Verse 5 (redesign in flight).**
   - V5c: swap the 18 Dec 2025 tweet for Neel's **28 Apr 2026** tweet on Introspection Adapters: "a LoRA you add to any finetune of a model, and then it tells you what it was finetuned for!" (status 2049229805598445799; `refs/papers/neel_other.md` NO-A11). Or keep the old card with its date visible.
   - V5a: drop the shot-list credit "A Mathematical Framework, 2021; 'the residual stream is a river'". It is five years old, and the ledger's corrections table (row 40) calls the river line an invented metaphor, "never in quote marks or attributed". The animatic's plain label "the residual stream" is fine.
7. **Older references with no year printed** (minor: add the year, or swap).
   - C1c card: add "· DISTILL · 10 MAR 2020". Or quote Toy Models (Sep 2022) instead: "Superposition organizes features into geometric structures such as … pentagons", which also matches the dancers' pentagon formation.
   - C1b pupil ("this era"): show the 2022 pentagon or mod-113 clock instead of the 2020 tiles.
   - C4c: '"Love" − "Hate" (ActAdd, 2023)'.
   - B2: drop "(thought anchors)" or date it.

**Already fine because the year is printed:** est. 2016, Arditi … 2024, Alignment Faking (Dec 2024), cf. Turpin et al. 2023, logit lens 2020, "first posted AUG 2022 · ICLR 2023".

**Lyric-locked** (the song can't change, so these are fixed by framing, not reordering):
- P1, "thought out loud" (2024, sung after 2025): handled by the planned flick.
- V3e, the probe by the door (2026, sung inside 2025): fix 1.
- C1c, "every feature I can find" (a 2020 refrain in 2022): date the card.

Nothing else needs a lyric change.

**Proposed tick list** (every tick on a sung word; one backward step, the planned one):
`[[19.56, 2020], [27.58, 2022], [56.08, 2023], [62.18, 2024], [70.84, 2025], [88.24, 2024], [91.66, 2025], [145.42, 2026]]`, with SEP at 208.22 and dark at 249.64.

## 3. Decisions in flight: consistency check

- **Induction heads → chorus 1: consistent.**
  - Olsson et al. (8 Mar 2022) fits the 2022 stamp.
  - Induction heads were first described in *A Mathematical Framework* (22 Dec 2021, [L B1.02]), which fits the hook's "2021 page". Both fall inside Neel's Dec 2021–Mar 2022 window.
  - The "seen this line before" joke still works in chorus 1, because the hook was already sung at 9.48 s.
- **2024 flick at "thought out loud": consistent once fix 2 is made.**
  - Three written rules say the stamp never runs backwards: the comment on `board.js` line 6, F&C §1.1 and `treatment.md` line 16. Each needs the exception added.
  - `yearAt()` needs no code change. I simulated the proposed list: 2025 → 2024 snaps at 88.24 (with a negative duration the roll is skipped), and 2024 → 2025 rolls from 91.66 to 91.96. If Neel wants a visible roll backwards, the code needs `Math.abs` on the roll duration.
- **Sydney/GPT-4 in V2a: not consistent with today's ticks** until the 2023 tick moves (fix 3).
- **Verse 5 redesign: consistent.** The J-Lens (Jul 2026), activation oracles (Mar 2026) and NLAs (May 2026) all come after the 2026 tick. The leftovers are the V5c tweet and the V5a river credit (fix 6).

## 4. Sources and limits

- All 13 tweets marked `ok: true` in `DGQ_TWEETS` were checked by decoding their status IDs. Every listed date matches.
- **Not re-verified** (the web-search budget was used up): ChatGPT 30 Nov 2022 and GPT-4 14 Mar 2023 (standard dates), and Claude Opus 4.6's release day. At year level Opus 4.6 is a 2026 model: it was in use by Apr 2026 ([L S2]).
- The animatic is being edited, so the on-screen text, card timings and line numbers come from the working copy as read during this audit (3 Oct 2026).
