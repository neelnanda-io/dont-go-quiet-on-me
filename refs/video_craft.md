# Video craft: how to direct, letter, print and trace the interp music video

This is the craft brief for the video phase. It goes deeper than `research/video.md`, which covers the pipeline, the models, the budget and the basic hook and type rules, and it doesn't repeat that material. It also doesn't repeat `vendor/ClaudeAnimationBase/ANIMATION_GUIDE.md`, which covers animation principles, the reads, transitions and the boil helpers. Compiled 2026-09-30.

**Where the evidence comes from:**
- my own measurements of 13 official K-pop MVs plus the reference video: scene detection, beat tracking and contact sheets. Scripts and raw data are in `refs/video_craft_data/`;
- five research passes: K-pop grammar, kinetic type, riso in code, rotoscoping, and interp figures. They fetched about 250 sources and cloned or benchmarked the key repos;
- the reception notes in `refs/x_audit/x_audit.md` §(e) and `refs/web_audit_2026.md` §5a.

**How the evidence is labelled:**
- **(observed)**: my or a research agent's reading of frames. Treat timestamps as ±0.5 s.
- **(measured)**: computed.
- **[snippet]**: seen only in a search result.

## Contents
- [TL;DR](#tldr)
- [1. K-pop MV attention grammar](#1-k-pop-mv-attention-grammar)
  - [1.1 Measured cut rhythm of 13 MVs](#11-measured-cut-rhythm-of-13-mvs)
  - [1.2 The first 5 seconds](#12-the-first-5-seconds)
  - [1.3 The killing part and point choreography](#13-the-killing-part-and-point-choreography)
  - [1.4 Formations, the centre, and what cuts follow](#14-formations-the-centre-and-what-cuts-follow)
  - [1.5 Colour-coded members, sets and name cards](#15-colour-coded-members-sets-and-name-cards)
  - [1.6 Inserts and easter eggs](#16-inserts-and-easter-eggs)
  - [1.7 Text inside K-pop MVs](#17-text-inside-k-pop-mvs)
  - [1.8 The outro](#18-the-outro)
- [2. Kinetic typography for lyrics](#2-kinetic-typography-for-lyrics)
  - [2.1 Pieces worth studying](#21-pieces-worth-studying)
  - [2.2 Timing numbers](#22-timing-numbers)
  - [2.3 Motion and hierarchy](#23-motion-and-hierarchy)
  - [2.4 Interp-native lyric devices](#24-interp-native-lyric-devices)
  - [2.5 Typefaces and pairings](#25-typefaces-and-pairings)
  - [2.6 Canvas2D implementation notes](#26-canvas2d-implementation-notes)
- [3. Riso, paper and hand-drawn line in code](#3-riso-paper-and-hand-drawn-line-in-code)
  - [3.1 What real riso does](#31-what-real-riso-does)
  - [3.2 Ink palette](#32-ink-palette)
  - [3.3 Libraries and licences](#33-libraries-and-licences)
  - [3.4 The plate recipe](#34-the-plate-recipe)
  - [3.5 Boil, frame rate and paper](#35-boil-frame-rate-and-paper)
  - [3.6 Handmade vs slop](#36-handmade-vs-slop)
  - [3.7 Performance and encoding](#37-performance-and-encoding)
- [4. Rotoscope and trace-over pipelines](#4-rotoscope-and-trace-over-pipelines)
  - [4.1 Benchmark on this Mac](#41-benchmark-on-this-mac)
  - [4.2 Tools by job](#42-tools-by-job)
  - [4.3 Recommended pipeline](#43-recommended-pipeline)
  - [4.4 Failure modes and QA](#44-failure-modes-and-qa)
  - [4.5 Precedents](#45-precedents)
- [5. Interp's own visual world](#5-interps-own-visual-world)
  - [5.1 Colour conventions conflict](#51-colour-conventions-conflict)
  - [5.2 The idioms, ranked by recognisability](#52-the-idioms-ranked-by-recognisability)
  - [5.3 Explainers the audience grew up on](#53-explainers-the-audience-grew-up-on)
  - [5.4 What makes experts wince](#54-what-makes-experts-wince)
- [6. The Sept 2026 AI-video wave: what spread and why](#6-the-sept-2026-ai-video-wave-what-spread-and-why)
- [The 25 most actionable rules for our video](#the-25-most-actionable-rules-for-our-video)
- [Sources](#sources)

---

## TL;DR

1. **Real K-pop MVs cut at 16–52 cuts/min** (median shot 0.6–2.1 s). In 8 of 13, the loudest third of the song cuts 1.3–2.1× faster than the quietest (measured). The reference sits at 41/min, in the fast half. Target 30–45/min, with a long tail of held shots.
2. **Pros don't quantise every cut to the beat.** Only 3 of 13 MVs (God's Menu, Supernova, Super Shy) are clearly beat-locked, 3 only marginally, and 7 are indistinguishable from chance. The code-made reference is strongly locked (R₂ = 0.69 on half-beats; measured). Put *hits* on the grid and let cuts follow action and lyric onsets.
3. **The opening holds one composed image, but something happens in it at once.** Supernova, Whiplash and Attention don't cut for 4–6 s. Ditto has its title up at 1.5 s and Golden at 0.7 s. For X, keep the first word by about 1.2 s (from `research/video.md`) and let the first *cut* wait.
4. **The chorus is one wide, frontal, centred group formation on a chorus-only set.** It uses a hands-only point move and repeats identically every chorus. Verses visit one member's colour-coded world at a time.
5. **The K-pop outro is a formula:** a line-up facing the lens, then the title wordmark, the group logo, a label ident on black, a silent tail and one post-credit hook.
6. **Lyrics live *inside* the picture, differently in each scene.** The Golden lyric video sets words behind the character, in neon, on lightsticks, and handwritten on a mirror. Ours can be typed as tokens, highlighted like a feature dashboard, lit as attribution-graph nodes, or stamped on lab forms.
7. **Riso is a physical model, not a filter.** Every pixel is paper × Π(inkᶜᵒᵛᵉʳᵃᵍᵉ).
   - 3–4 real Riso inks per scene; screens anchored to the page; per-plate registration fixed per scene; no pure black.
   - Draw each ink plate as monochrome coverage, because p5.brush mixes colour like paint, not like overprint.
8. **The base clip never reaches the renderer.** A Python pre-pass turns each Seedance clip into masks, centreline strokes, per-region inks and (where they work) landmarks. The JS side redraws only from that data. MediaPipe fails on anime faces (0/14 frames), so mouths come from the lyric alignment.
9. **Interp idioms the audience knows instantly:** the SAE/Neuronpedia dashboard, Golden Gate, attribution graphs, the superposition pentagon, the residual stream, the induction bump, the grokking clock, and (new) the J-lens readout. Colour conventions conflict between sources, so pick one per shot and label the axes.
10. **The Sept 2026 wave rewarded** cute-on-dark contrast, dense *correct* references and specific sight gags. It punished wrong glosses (the Lisp `cdr` reply got 898 likes), recycled gags, jank, off-sync karaoke and "one prompt" overclaiming.

---

## 1. K-pop MV attention grammar

### 1.1 Measured cut rhythm of 13 MVs

**Method.** I downloaded the official uploads at 360–480p and ran ffmpeg scene detection (`select=gt(scene,0.3)`). I merged detections less than 90 ms apart, since those are flash double-counts. I tracked beats with librosa, and compared cut counts per 10 s window with RMS loudness. The code is `refs/video_craft_data/analyse.py` and `phase.py`; the per-video results are in `analysis.json` and `beat_phase.txt`.

**Caveats:**
- Scene detection misses dissolves and cuts during whip pans, and over-counts strobes. For example, God's Menu's continuous camera moves undercount.
- librosa's beat grid can sit a few tens of ms late, and some tempos are octave-halved (God's Menu at 78 BPM is probably 156).
- Treat the numbers as ±15%.

| MV (YouTube ID) | Length (s) | Cuts/min | Median shot (s) | 10th–90th pct shot (s) | BPM | Cuts per 10 s: quietest → loudest third | Beat-lock R₁ (null 95%) · R₂ | First cut (s) |
|---|---|---|---|---|---|---|---|---|
| Stray Kids "God's Menu" (TQTlCHxyuu8) | 186 | 15.8 | 1.50 | 0.70–8.29 | 78 | 3.3 → 4.3 | **0.49** (0.25) · 0.24 | 0.25 |
| "Golden" official lyric video (yebNIHKAC4A) | 199 | 16.3 | 2.13 | 0.57–7.57 | 123 | 2.5 → 2.0 | 0.24 (0.24) · 0.16 | 2.21 |
| BTS "Dynamite" (gdZLi9oWNZg) | 223 | 18.0 | 1.44 | 0.57–7.27 | 112 | 2.0 → 3.4 | 0.19 (0.21) · 0.09 | >6 |
| ILLIT "Magnetic" (Vk5-c_v4gMU) | 188 | 24.5 | 1.73 | 0.71–5.03 | 129 | 3.0 → 4.5 | 0.06 (0.20) · 0.14 | 2.92 |
| NewJeans "Ditto" side A (pSUydWEqKwE) | 333 | 25.4 | 1.67 | 0.83–4.07 | 136 | 2.5 → 5.0 | 0.09 (0.15) · 0.08 | >6 |
| aespa "Next Level" (4TWR90KJl84) | 236 | 26.7 | 1.71 | 0.79–4.17 | 108 | 4.9 → 4.6 | 0.16 (0.18) · 0.03 | >6 |
| NewJeans "Attention" (js1CtxSY38I) | 262 | 29.1 | 1.54 | 0.74–3.42 | 103 | 3.8 → 5.5 | 0.18 (0.16) · 0.12 | 4.0 |
| aespa "Supernova" (phuiiNCxRMg) | 193 | 30.1 | 1.19 | 0.42–3.61 | 118 | 3.2 → 6.8 | **0.31** (0.18) · 0.04 | >6 |
| LE SSERAFIM "Antifragile" (pyf8cbqyfPs) | 232 | 33.1 | 1.17 | 0.45–3.73 | 103 | 3.6 → 7.0 | 0.22 (0.15) · 0.08 | 1.84 |
| **Reference (donaldjewkes)** | 142 | 40.7 | 1.27 | 0.20–3.01 | 144 | 5.0 → 6.5 | **0.43** (0.18) · **0.69** | 0.87 |
| KATSEYE "Gnarly" (R2-yomhYAj4) | 142 | 41.5 | 0.75 | 0.28–3.14 | 136 | 5.5 → 7.2 | 0.21 (0.17) · 0.11 | 5.13 |
| NewJeans "Super Shy" (ArmDp-zijuc) | 201 | 44.8 | 1.17 | 0.63–1.96 | 152 | 5.8 → 7.2 | 0.21 (0.15) · **0.32** | 3.5 |
| BLACKPINK "How You Like That" (ioNng23DkIM) | 183 | 46.8 | 0.83 | 0.42–2.53 | 129 | 6.8 → 8.7 | 0.12 (0.14) · 0.17 | 4.84 |
| aespa "Whiplash" (jWQx2f-CErU) | 191 | 51.6 | 0.62 | 0.17–2.46 | 123 | 5.8 → 6.8 | 0.04 (0.13) · 0.05 | >6 |

R₁ and R₂ are the mean resultant lengths of each cut's phase within the beat and the half-beat. 1 means every cut sits at the same phase; 0 means cuts are spread uniformly. The null column is the 95th percentile for random cut times.

**What the numbers say:**
- **Pace is a style choice across a 3× range, not a genre constant.** Cinematic concept MVs (Ditto, Next Level, Magnetic) run at 25–27/min. Performance-heavy ones (HYLT, Whiplash, Super Shy) run at 45–52/min. The reference's 41/min is fast but in range. Our default in `research/production_notes.md` (1–1.5 s verse shots) sits right in the middle.
- **Loud sections cut faster, but only as a tendency.** The loudest third averages 1.3–2.1× the cut rate of the quietest in 8 of 13 MVs: Antifragile 3.6 → 7.0, Supernova 3.2 → 6.8, Ditto 2.5 → 5.0. Next Level is flat, and the Golden lyric video is reversed because its text carries the rhythm, not the edit.
- **The distribution has a long tail.** Every MV mixes stabs (10th percentile 0.2–0.8 s) with real holds (90th percentile 2–8 s). The reference's 10th percentile of 0.20 s is its jittery end.
- **Pros cut on the move, not the metronome.**
  - Only God's Menu, Supernova and Super Shy show clear beat-phase locking.
  - Seven (Magnetic, Ditto, Whiplash, HYLT, Dynamite, Next Level, Golden) are indistinguishable from random phase at this resolution (R₁ at or below the null). Attention, Antifragile and Gnarly are only marginally above it.
  - The reference, made in code on a fixed grid, is locked to the half-beat far more tightly than any of them (R₂ 0.69 vs ≤0.32).
  - Where pros do lock, cuts cluster at phase 0.76–0.84, slightly before the tracked beat, compared with 0.89 for the reference. That is about 1–3 frames earlier than the code-made video. This fits the editors' folk habit of cutting a frame or two early (unsourced).
  - Directors describe the same thing:
    - GDW's Kim Sung-wook: "every element is based on the bars of the song" ([Koreaboo](https://www.koreaboo.com/lists/kpop-music-video-production-step-step-youtube-evolution/)).
    - Seoulbeats on Next Level: the camera pans onto a face, then tilts down "when the choreography switches to them being lower to the ground" ([Seoulbeats](https://seoulbeats.com/2021/05/aepsa-leans-into-lore-in-next-level/)).
  - In short: **bars decide sections, and the dancer decides the cut.**
- **Cut-per-beat openings exist, and read as aggressive.** God's Menu cuts at 0.25, 1.0, 1.75, 2.46, 3.25, 3.96 and 4.71 s, one cut per 0.77 s beat, from the first frame (measured).

### 1.2 The first 5 seconds

These are from contact sheets at 2 fps over 0–6 s for all 13 MVs, plus 12 more MVs sampled by the K-pop research pass.

| Pattern | Examples (observed) | Use for us |
|---|---|---|
| **Held establishing image; the event happens inside it** | Supernova: one locked wide 0:00–0:06.5, and Karina drops onto the car at ~0:03 inside the shot ([link](https://www.youtube.com/watch?v=phuiiNCxRMg)). Whiplash: top-down wide of four members on a white rippled floor, 0:00–0:06.5 ([link](https://www.youtube.com/watch?v=jWQx2f-CErU)). Attention: static street wide to 0:04, members run in at ~0:03 ([link](https://www.youtube.com/watch?v=js1CtxSY38I)) | One composed riso "page" that holds while the first lyric word slams in and the title prints on. The cut comes on the first downbeat after the title |
| **Silence or room tone, then the hit** | Pink Venom: 2.5 s of digital silence, first sound at 0:02.5 (gQlMMD8auMs). DDU-DU DDU-DU: black and silent to ~0:01.75 (IHNzOHi8sJs). Ditto (to ~0:06), Super Shy (to 0:05.5) and How Sweet open on ambient sound at −30 to −40 dBFS | Only if the Suno track has an intro. Otherwise add 0.3–0.6 s of paper and pencil foley before the downbeat. Never more than 1 s on X |
| **Title as designed type in the first seconds** | Hype Boy Perf. ver.1: chrome → slime → yellow "HYPEBOY" wordmark 0:00.5–0:02.5 (11cta61wi0g). Ditto: script "Ditto" film title 0:01.5–0:04.5. Golden lyric video: "GOLDEN" with a countdown at 0:00.7. Next Level: chrome title 0:06.5. DRIP: title on a cassette prop at 0:01.5 (Zp-Jhuhq0bQ) | Title as a *printed object*: a riso poster pulled off the drum, a stamped lab-notebook cover, a feature-dashboard header |
| **Cut-per-beat montage** | God's Menu, 0:00.25 onwards (above), ending on a light-painted "Stray Kids" scrawl at 0:06 | Good for a cold open that lists references rapidly. Costs readability |
| **Extreme close-up of a motif** | Magnetic: lips and hand 0:00–0:01, star-shaped light in a palm 0:03, on the ceiling 0:06 ([link](https://www.youtube.com/watch?v=Vk5-c_v4gMU)). Gnarly: a face framed in a pink phone-UI frame with a hand drawing on it, 0:00–0:05 ([link](https://www.youtube.com/watch?v=R2-yomhYAj4)) | Gnarly's "face in a UI frame, annotated by a hand" is almost our premise: a researcher's hand annotating the idol inside a dashboard frame |
| **Label ident first (old habit)** | Dynamite: ~6–8 s of Big Hit logo. Butter: 3.5 s | Avoid: since 2022 idents moved to the end |

**Authentic textures.** Korean uploads carry two small marks in the first seconds (observed on Attention, Supernova, Whiplash and Antifragile):
- a circular age-rating badge ("12", "15") in the top-right corner;
- a small broadcaster or date bug in the bottom-left.

A parody "⑫" badge can pay off as a joke, e.g. a "L12" layer badge, if the song touches a specific layer. Industry context: Korean coverage says intros are being "minimised" so songs reach the chorus sooner ([Korea Herald](https://www.koreaherald.com/article/10692913); [Korea Times, 14 Mar 2026](https://www.koreatimes.co.kr/entertainment/k-pop/20260314/time-it-takes-to-make-a-k-pop-hit-15-seconds)).

### 1.3 The killing part and point choreography

- **Definitions.**
  - The killing part (킬링파트) is "the few seconds that represent the song and hit the hardest", and can sit in the intro, chorus or bridge. 1theK even tags a "Kill Point" in performance videos ([note.com](https://note.com/cute_eider9811/n/n191fb3d4aa84?hl=en)).
  - Point choreography (포인트 안무) is the copyable hook move: the "Sorry, Sorry" hand rub, BLACKPINK's finger guns. DDU-DU DDU-DU's finger gun was changed on the shoot day ([Wikipedia](https://en.wikipedia.org/wiki/Ddu-Du_Ddu-Du)).
- **Short-form changed it.**
  - "It has become standard practice to place hand gestures or point choreography in the chorus that anyone can easily follow" ([Jaturi, Jun 2026](https://www.jaturi.kr/news/articleView.html?idxno=27204)).
  - Choreographers now merge "easy-to-follow moves" and "a distinctive point move" into one 15-second sequence ([IssueInsight, Mar 2026](https://www.issueinsight.co.kr/news/articleView.html?idxno=2678)).
  - What survives on Shorts and TikTok is "a 10–20 s chorus, killing part, point choreography" ([K-trendy News](https://www.k-trendynews.com/news/articleView.html?idxno=202976)).
  - Magnetic won Best Viral Song at TikTok Awards Korea 2024 on its chorus hand choreography ([Wikipedia](https://en.wikipedia.org/wiki/Illit)).
- **How MVs frame it** (observed):
  - Super Shy shoots its chorus as a high-angle plaza flash mob, with the members in white among bright-clothed dancers (~0:52–1:07).
  - Supernova moves its chorus to a separate night-blue performance set with backup dancers (~0:54, 1:07–1:14).
  - HYLT alternates colour-coded sets inside the chorus (1:40–1:52: red set, white-smoke formation, fire set).
  - Rule: **wide, frontal, centred, full-body, one unbroken phrase, on a chorus-only set.**
- **For us.** The killing part is a stop-time bar in the song (`research/production_notes.md`). Give it:
  - one frozen full-frame hero word;
  - a hands-only point move the cast does identically every chorus, e.g. two fingers "reading" off the temple, or a hand sweeping a probe line through a point cloud;
  - the same framing every repeat, with a new payload each time, mirroring the lyric's rolling chorus.

### 1.4 Formations, the centre, and what cuts follow

- **Cuts follow bars; camera moves follow the dancer's body** (quotes in §1.1).
  - Seoulbeats says God's Menu's transitions "follow precisely on beat" and Felix's eye-line steers the camera ([Seoulbeats](https://seoulbeats.com/2020/06/stray-kids-cook-up-a-dizzying-mv-with-gods-menu/)).
- **Music-show practice** ([ELLE Korea via Daum, Dec 2025](https://v.daum.net/v/xhLfGzOc7V)):
  - seven or eight cameras per stage;
  - the aim is "쾌감" (visual pleasure), an "uninterrupted flow where music and formation connect organically";
  - the camera plan decides "which camera catches each member's charm point and choreography point";
  - the ending close-up (the "ending fairy") rotates fairly between members and is "the last sentence of the message".
- **Centre framing** keeps fast cuts legible (already in `research/video.md`). Formation changes should land on bar lines. The eye stays at frame centre across the cut, so the *shape* changes (V → line → pinwheel) while the centre member stays put.
- Directors' own words:
  - Kim Sung-wook, 2018: "Many K-pop music videos feature still shots of artists' faces… but I focus on their moves" ([Korea Times](https://www.koreatimes.co.kr/entertainment/k-pop/20181213/director-behind-iconic-k-pop-music-videos)).
  - Rigend's Yoon Seung-rim: "frames build sequences, sequences build a concept, so overall breathing (호흡) matters" ([Design+](https://design.co.kr/article/24931/)).

### 1.5 Colour-coded members, sets and name cards

- **Per-member worlds in the verses, everyone together in the chorus.** DDU-DU DDU-DU does this (observed):
  - group on a floating stone set, 0:08–0:21;
  - Jennie on a pink chessboard, 0:22–0:37;
  - Lisa in a pink shop/lab, 0:38–0:51;
  - Rosé in a gothic chapel, 0:52–1:05;
  - Jisoo in purple, from 1:06.

  Pink Venom gives "each member… distinct visual narratives before converging for group choreography" ([Wikipedia](https://en.wikipedia.org/wiki/Pink_Venom)).
- **Hand-made name graphics.** How Sweet opens on dozens of handmade "NewJeans" stickers (0:00–0:03), then one name sticker per member (0:03.5–0:06.5), then "How Sweet" stickers (0:07) (observed, Q3K0TOvTOno). **This is the closest K-pop precedent for our riso sticker layer.**
- **Signature palettes** (observed):
  - aespa is chrome: liquid-chrome titles and metallic costumes;
  - ILLIT Magnetic is pale blue and white;
  - BLACKPINK is neon pink;
  - Gnarly is pink and slime green.

  Research on NewJeans credits its "mixed font design" with visual recognition ([Liu 2024](https://doi.org/10.1051/shsconf/202420701012)).
- **For us:** one riso ink per cast member, and one set per member built from one interp figure, e.g. a member who lives inside the superposition pentagon or one whose set is a Neuronpedia dashboard. A K-pop profile card introduces each member (the reference's "POSITION:" gag). Keep inks consistent across the whole video so viewers track members by colour.

### 1.6 Inserts and easter eggs

- **Close-ups of hands and objects that recur as motifs** (observed):
  - Attention: ticket money at 0:05.5.
  - Magnetic: star light, 0:03–0:06; a phone with stickers, ~0:43.
  - Supernova: a phone photo grid, ~0:38.
  - Pink Venom: hands on a geomungo, 0:02.5.
  - Gnarly: a face reflected in a knife, 2:14.

  They last 0.4–1 s and return later, changed.
- **Lore and rewatching.**
  - Kim Sung-wook: "It needs to be multi-layered, and hopefully each time they watch it, they're able to pick up little details they hadn't noticed" ([Korea Times](https://www.koreatimes.co.kr/entertainment/k-pop/20181213/director-behind-iconic-k-pop-music-videos)).
  - aespa's KWANGYA lore ([17 Carat](https://17caratkpop.substack.com/p/kwangya-101)); BTS "Blood Sweat & Tears" and *Demian* ([Wikipedia](https://en.wikipedia.org/wiki/Blood_Sweat_%26_Tears_(BTS_song))).
  - Ditto's camcorder footage got its own YouTube channel ([Wikipedia](https://en.wikipedia.org/wiki/Ditto_(song))).
- This is the same mechanism as the reference's 10.8k bookmarks. Our in-jokes are **freeze-frame-only details**: real feature IDs, real head numbers, tiny footnotes, a correct `q−(n−1)` stripe.

### 1.7 Text inside K-pop MVs

K-pop MVs are image-first; text is rare and therefore loud (observed):
- **Whiplash** flashes lyric words full-frame, one per beat: "FOCUS" 1:01.5, "BIG" 1:02.0, "FLASH" 1:02.25, then "THEY'RE REASONS YOU'LL NEVER UNDERSTAND" 1:03.0, then a negative flash at 1:03.75 ([link](https://www.youtube.com/watch?v=jWQx2f-CErU&t=60s)).
- **OMG** has a typed Korean tweet in its post-credit scene (6:23–6:31) and hand-drawn line-art credits on black (6:13–6:22) (_ZAgIHmHLdc). Both are precedents for real-tweet inserts and hand-drawn credits.
- **Antifragile's** end card, "IM FEARLESS" over "LE SSERAFIM" (the name is an anagram of it), with a word scribbled out (~3:42–3:45), then "DO YOU WANT TO BE FORGIVEN?" (3:46) teasing the next era ([link](https://www.youtube.com/watch?v=pyf8cbqyfPs&t=220s)). A strike-through as a joke, the same move as the reference's "~~SCHEDULED~~ NONE ON FILE".
- **Attention** types its title over a sinking phone at the end (4:17–4:21). **Gnarly** drips its title in slime over a sandwich (2:16).

The genre we're in (the Sept 2026 AI videos) is text-dense; K-pop MVs are not. The reference borrowed K-pop *staging* and added lyric-video *text*. Keep that hybrid, but give text the K-pop discipline: when a hero word is up, it is the only loud thing.

### 1.8 The outro

The formula, from 14 end sheets (observed):

| MV | Group shot | Then |
|---|---|---|
| Whiplash | frontal line-up of 4, 3:01–3:02 | chrome title 3:03 → "aespa" 3:05 → SM ident 3:07 |
| Supernova | members leave, set held empty 2:59–3:00 | neon title 3:01 → aespa wordmark 3:04 → SM ident on black 3:07–3:13 |
| HYLT | wide, then member close-up | gothic title 2:58–3:03 |
| Magnetic | group cuddle on a bed over near-silence, 2:49–2:53 | title 2:56 → BE:LIFT ident → "SUMMER MOON" next-release teaser 3:02–3:08 |
| Antifragile | line-up | anagram card → "DO YOU WANT TO BE FORGIVEN?" |
| Super Shy | massive flash-mob wide | graffiti title sticker and bunny logo, 3:18 |
| S-Class | back to the opening skyline | title → fandom-motto card |

- **Silent tails.** The music stops well before the video ends: The Chase ~15.5 s early, Butter ~14.5 s (J-hope's fork gag plays after the music), Magnetic ~19.5 s.
- **Bookends.** Hype Boy returns to its opening platform wide; S-Class to its skyline.
- **For us** (within the 2:19 cap, `research/production_notes.md`):
  - final line-up facing the lens, with the bow the audience loved in the reference;
  - riso title wordmark;
  - a mock "label" ident of our own, not a real company's;
  - a 3–5 s silent tail with one post-credit gag;
  - the signed hand-drawn end card that rhymes with the opening.

---

## 2. Kinetic typography for lyrics

### 2.1 Pieces worth studying

| Piece | What to take | Source |
|---|---|---|
| **"Golden" official lyric video** (Sony Pictures Animation, 2025; 1.75B views; yebNIHKAC4A) | See the bullets below this table | observed; [link](https://www.youtube.com/watch?v=yebNIHKAC4A&t=20s) |
| **aespa "Whiplash"** word flashes | One full-frame word per beat, on black, inside a K-pop MV (§1.7) | observed |
| **mexicat/pdoom-video** (MIT) | "Each plate integrates the lyric graphically and differently: written by the spark, riding on a curve, typed as tokens, stamped on a form… The words are part of the image, not subtitles on top." Show the line dim up to about 0.4 s early; "highlighting never runs ahead of the voice." Fonts: Archivo (width axis), IBM Plex Mono, Cormorant Garamond, single-stroke plotter fonts | `vendor/mexicat-pdoom/docs/TREATMENT.md` |
| **"Functional Emotions" video** (MIT) | The first attempt, typographic and polished, was **rejected because "it was still a lyric video"**. The fix was story, scenes and painted animation, with lyrics secondary | [repo README](https://github.com/ledbetterljoshua/functional-emotions-video) |
| **Japanese lyric motion (リリックモーション)** | Grew out of Vocaloid works (ryo "メルト" 2007, wowaka "ローリンガール" 2010, DECO\*27 "モザイクロール" 2010): "text cut-ins synchronised with vocal phrases". The leading work now treats text as a graphic object ahead of readability. A practitioner guide lists five basic motions (position, scale, rotation, opacity, colour), says to stack at least two at once, and warns that overused rotation looks cheap. DECO\*27 "モニタリング" has 10+ lyric-motion variants | [JAGDA](https://gdr.jagda.or.jp/articles/77/), [kagehito](https://note.com/kagehito_muji/n/nf31fe0c385a5), [video](https://www.youtube.com/watch?v=kbNdx0yqbZE) |
| **Japanese TV telop / Korean 자막** | Captions as *punctuation and retort* (tsukkomi), not transcription: bold face, an outline thick enough that neighbouring characters nearly touch, a clear brightness gap between fill and outline, warm colours for cheer and cool for irony. One unsourced count for *Infinite Challenge*: 25.5 captions a minute, 2.35 s each | [telop rules](https://www.shitauke-creators.com/basic-knowledg/edit-basic-knowledg/subtitles), [Yin 2019](http://www.iikii.sg/sites/default/files/ecei2019/521-524_0.pdf) |
| **Charli xcx *brat*** | Arial (not Arial Narrow), stretched "slightly… to give it a personality": one plain face, distorted on purpose. The free Arial-metric stand-in is Arimo (OFL) | [Fonts In Use](https://fontsinuse.com/uses/61357/charli-xcx-brat-album-art-and-campaign) |
| **They Might Be Giants "Get Down"** (2026, art direction Paul Sahre) | A condensed gothic (Knockout) stretched, repeated and layered *inside a collage*: the closest recent reference for hero words in a paper world | [Fonts In Use](https://fontsinuse.com/uses/76852/they-might-be-giants-get-down-music-video), [video](https://www.youtube.com/watch?v=M1h0NV0BxGo) |
| **Taylor Swift *TTPD*** | Serif for "the poet", typewriter for "the document". Our split: italic serif for the inner voice, mono for the lab record | [pixelframe](https://pixelframe.design/art-design-examined-taylor-swifts-the-tortured-poets-department/) |
| ***Catch Me If You Can* titles** (Kuntzel + Deygas) | Hand-carved rubber stamps, cut paper, type moving with characters; deliberately "no high technology". The best stamp/paper title lineage | [Art of the Title](https://www.artofthetitle.com/title/catch-me-if-you-can/) |
| **Word-by-word social captions** (Hormozi style) | 1–3 all-caps words at 200–500 ms per word, one highlighted keyword per phrase at ≤105% scale. The moving highlight works like a bouncing ball | [ascynd](https://ascynd.io/en/blog/hormozi-captions) |
| **Apple Music-style lyrics** (numbers reverse-engineered by the open-source AMLL player, not Apple's spec) | Emphasis only on words held ≥1000 ms and 2–7 letters long (≤ +12% scale, a 0.05 em lift, glow). Letters stagger across 40% of the word. The line's last word gets 1.6×. The wipe's soft edge is 0.5× the line height | [AMLL](https://github.com/amll-dev/applemusic-like-lyrics) |

**What the "Golden" lyric video does** (observed):
- Hero words sit *behind* the character, who occludes them: "I WAS A GHOST / I WAS ALONE" at 0:20–0:21; "WE CAME / SO FAR / NOW I'LL / BELIEVE", one phrase per second, at 1:00–1:04.
- Neon-tube lettering, 0:22–0:26.
- Words spelled out by the arena's lightsticks ("UP UP UP", "GOLDEN"), 1:06–1:11.
- The quiet verse is **handwritten in marker on a mirror**, with each phrase held about 3 s, 1:40–1:51.
- It cuts slowly (16/min): the type carries the rhythm.

### 2.2 Timing numbers

| Rule | Number | Source |
|---|---|---|
| Hero word contact frame | On the sung onset, or up to 2 frames early (≤83 ms at 24 fps); **never late**. Start any wind-up 2–4 frames early so the contact frame lands on the onset | ITU-R BT.1359: sound early is noticed at 45 ms, sound late only at 125 ms ([summary](https://en.wikipedia.org/wiki/Audio-to-video_synchronization)) |
| Subtitle line appears | 4–6 frames before the phrase, dim (preview). The underline or wipe then follows word timestamps exactly (activation) | Eye fixation takes 200–250 ms ([Wikipedia](https://en.wikipedia.org/wiki/Eye_movement_in_reading)). Karaoke preview/activation split, ASS `\kf` sweep ([Aegisub](https://aegisub.org/docs/latest/ass_tags/)). mexicat shows lines up to 0.4 s early |
| Short function words | A word under ~200 ms ("of", "the") never gets its own hero slot; it rides small inside the stack ("I SEE / SPARKS / *of* / AGI") | research pass |
| Hero eligibility | Hook words, stop-time words, and words held ≥ ~1 s | AMLL threshold |
| Readability | ≤20 chars/s, ≥5/6 s per subtitle; tweets ≥2 s | already in `research/video.md` |
| Flashing | ≤3 full-frame flashes in any 1 s. Full-frame paper/ink inversions on eighth notes break this above ~90 BPM, so flip on downbeats only, or flip a region under 25% of the frame | [WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) |

### 2.3 Motion and hierarchy

- **One loud element at a time.** When a hero word lands, the subtitle stays but doesn't animate, and the HUD freezes. The reference breaks this in places; that is where it feels busy.
- **Slam:** `easeOutBack` (c1 = 1.70158) overshoots by about 10% at t ≈ 0.58. Run it over 3–5 frames, with area-preserving squash. Emphasis scale on a word already on screen stays ≤12%. Give the last word of a phrase about 1.5× the effect.
- **Per-letter stagger:** 1 frame per letter, total ≤ half a beat. GSAP's docs default to 0.05 s per character ([SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)).
- **Build lines word by word** as a stack (the reference's "I SEE / SPARKS / OF / AGI"). Each new word pushes the stack, and nothing re-flows mid-word.
- **Depth.** Draw background, then back text, then the character, then front text. For type passing behind an arm, render the character's silhouette offscreen and `destination-out` it from the text layer. The "text behind image" effect is popular for a reason ([repo](https://github.com/RexanWONG/text-behind-image), 2k stars).
- **Gag formats** (research pass's recommendations, not sourced):
  - **Strike-through:** draw the stroke over 3–5 frames. Hold the struck word ≥0.5 s before the correction arrives in a different voice.
  - **Rubber stamp:** rotate −3° to −8°, scale 1.15 → 1.0 in 2–3 frames, a 1–2 frame shake, ink dropout, second colour misregistered.
  - **Label-maker (Dymo) tape:** white mono caps on a coloured strip, ±1 px baseline jitter, typed one character every 2 frames.
- **Voices never mix inside one word:**
  - condensed sans: the hook;
  - mono: the model, the lab, the HUD;
  - italic serif: the whisper or aside;
  - handwriting: the researcher's doubt or annotation;
  - Hangul or kana: accents only.

### 2.4 Interp-native lyric devices

These make our type *about* the subject rather than generic kinetic type. Prior art to avoid copying outright: mexicat typed tokens with next-token bars and used `[MASK]` blocks; the reference used a BERT `[MASK]` chalkboard.

| Device | How it works | Beat behaviour |
|---|---|---|
| **Feature-dashboard karaoke** | The subtitle is a Neuronpedia "top activations" row. The sung token is highlighted in the dashboard's colour (emerald for Neuronpedia, orange for Anthropic 2023), and a tiny activation value is printed above it | Highlight intensity follows the word's sung duration |
| **Logit-lens grid** | A hook word "resolves" up a layers × positions grid: early rows show wrong guesses, and the final row shows the lyric | One row per beat, bottom to top |
| **Attribution-graph lyric** | Words are nodes and the line reads along the edges. Supernodes are beige stacked cards (Anthropic's 2025 style) | One hop per beat (Dallas → Texas → Austin rhythm) |
| **Steering stamp** | An orange "+2×" / "−2×" pill (Anthropic's intervention colour) stamps onto a word, and the next word changes | On the downbeat |
| **Label-maker feature labels** | Tape labels like "F#… refusal" stuck on props; the reference did SAE labels, so vary the medium | Typed on twos |
| **Probe readout** | A HUD meter reads a probe live ("TEST-AWARENESS p = 0.97") and ticks with the lyric | Moves only on bar lines |
| **Handwritten margin notes** | The researcher's pencil annotations ("?? polysemantic", "check this") in the handwriting face | On the vocal's off-beats |

### 2.5 Typefaces and pairings

**Checking method.** All of these are on Google Fonts. Licences were checked in the google/fonts repo: all are OFL except Permanent Marker and Special Elite (Apache-2.0). Glyph coverage was checked against the font files, and stroke thickness was measured relative to cap height.

**Hero (condensed):**
- **Anton:** has ↓↑→←; stem 0.20 of cap height (sturdy at 360p).
- **Big Shoulders:** now one variable family, weight 100–900 with an optical-size axis; has ↓.
- **League Gothic at width 75:** the narrowest ("ACCELERATIONISM" at 1728 px wide gives 382 px caps), but **no ↓** and thin stems (0.11).
- **Saira Stencil:** width 50–125; has ↓.
- **Anybody:** width 50–150, weight 100–900, **no ↓**.
- **Missing ↓:** Bebas Neue, Oswald, Antonio and Six Caps all lack it. Six Caps is also too thin at 360p (0.077 stems).

**Mono:**
- **JetBrains Mono:** has Greek (λ, σ, θ) and arrows, which we need for `r̂·x`, `λ`, `∂h`.
- **Fragment Mono:** ✓✗, arrows, ▲▼●■.
- **Space Mono Bold:** sturdiest at 360p (0.19 stems).
- **Martian Mono:** width axis.
- **Avoid:** DM Mono Light (too thin).

**Italic serif:**
- **Newsreader Italic** with optical size pinned to 6–12 (hairline 0.095), or **Fraunces Italic** at optical size 9: both survive small sizes.
- **Instrument Serif Italic** (hairline 0.049) breaks up below ~20 px cap height at 360p, so use it large only.

**Handwriting:**
- **Shantell Sans:** Informality and Bounce axes, arrows, ✓. Best for annotations.
- **Caveat, Kalam, Patrick Hand:** no arrows.

**Hangul and Japanese:**
- **Black Han Sans, Do Hyeon, Jua, Gaegu, Bagel Fat One:** only about 2,350–2,800 of 11,172 syllables. Fine for common words, but check every string.
- **Nanum Pen Script, Gowun Dodum:** all 11,172.
- **Dela Gothic One, DotGothic16:** kana and kanji, no Hangul.

**Pairings** (hero / subtitle / mono / whisper / hand / Hangul):
1. **Riso tabloid (recommended):** Anton, or Big Shoulders 900 for weight pulses / JetBrains Mono 500–600 as both subtitle and HUD / Newsreader Italic at low optical size / Shantell Sans / Black Han Sans for hero accents, Nanum Pen Script for handwritten Hangul.
2. **Variable pulse:** Anybody (draw arrows as vector shapes) or Saira Stencil / Martian Mono / Fraunces Italic / Caveat Bold / Do Hyeon or Jua.
3. **Label and stamp:** League Gothic at width 75, with Big Shoulders Stencil for stamps / Space Mono Bold as the Dymo face / Instrument Serif Italic, large only / Kalam Bold / Black Han Sans, with Dela Gothic One for Japanese accents.

**360p rule.** X and YouTube previews shrink 1080p about 3×, so any stroke under ~3 px at 1080p disappears. Pin optical size low for small text instead of letting it auto-select from the 1080p pixel size.

### 2.6 Canvas2D implementation notes

- **No `fontVariationSettings` in Canvas2D.** The WHATWG proposal has been open since 2018 ([#3571](https://github.com/whatwg/html/issues/3571)).
- **What does work:**
  - numeric weights in `ctx.font`;
  - `ctx.fontStretch`, in 9 keyword steps (50–200%), in Chrome and Firefox, not Safari ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fontStretch));
  - `ctx.letterSpacing`, now everywhere, for animated tracking;
  - `ctx.filter`.

  Declare ranges with `new FontFace(name, url, {stretch: '50% 150%', weight: '100 900'})` and `await font.load()` before frame 0.
- **p5 2.3.x:** `textWeight()` works. Width is hard-coded to 100 for glyph paths, and the custom-axis regex looks broken ([source](https://raw.githubusercontent.com/processing/p5.js/main/src/type/textCore.js)). Don't rely on p5 for any axis except weight.
- **For per-glyph animation, outlines and roughened edges:** opentype.js 2.0 `font.variation.set({wdth, wght})`, then `getPaths()` into `Path2D`. Or bake static instances with `fonttools varLib.instancer`.
- **Letter positions:** `x_i = ctx.measureText(str.slice(0, i)).width` preserves kerning.
- **Wipes:**
  - Hard wipe: clip a rect.
  - Soft wipe: `destination-in` with a gradient whose soft edge is 0.5× the line height.
  - Text on a path: `getPointAtLength` plus tangent.
- **Printed look:**
  - one offscreen canvas per ink, composited with `multiply` onto paper;
  - ink spread: a 1–2 px blur, then an alpha threshold;
  - seeded speckle dropout;
  - a second-colour offset that is constant per scene.

  Keep small text unregistered (mono-color-skill applies drift only to image and display plates). Hero words can take a 3–6 px deliberate offset so it survives 360p.

---

## 3. Riso, paper and hand-drawn line in code

**The single most useful find:** [sevenevesai/riso-windowseat](https://github.com/sevenevesai/riso-windowseat) (MIT, updated 2026-09-25). It is a set of procedural risograph films built with Claude Code, with measured parameters in `docs/quality-bar.md` and `docs/live-plates.md`. Its core pipeline is in `prints/workings/index.html`. (The research pass read a temporary clone of it.)

### 3.1 What real riso does

- **One ink per drum pass.** Masters are 600 dpi. Two-drum machines register their pair tighter than colours added on later passes ([stencil.wiki](https://stencil.wiki/wiki/Risograph); CCS).
- **Misregistration.**
  - In print: "usually no more than 1–3 mm" ([Possible Worlds](https://possibleworldsshop.com/risograph-set-up)), plus skew measured in degrees ([Exploriso](https://en.exploriso.info/exploriso/printing/inaccuracies/)).
  - riso-windowseat measured a reference riso *animation* at a **~2–3 px** crescent at 1080p. It fixes per-ink offsets per scene at 1–3 px (blue [1.5, −1], pink [−2.5, 2], yellow [2, 1.5]), with the key plate at [0, 0].
- **Two screening modes** ([Exploriso](https://en.exploriso.info/exploriso/printing/screen-width/)):
  - AM halftone, 38–200 lpi, ~90–105 lpi all-round;
  - "grain touch", a stochastic (FM) dither for linework.
- **Screen angles by brightness:** darkest 45°, then 75°, 15°, and brightest 0° ([Exploriso](https://en.exploriso.info/exploriso/printing/screen-angles/)).
- **Ink behaviour.**
  - Inks are translucent, so overprint is approximately multiply. It is order-dependent, because the second ink lands partly on wet ink ([colour order](https://en.exploriso.info/exploriso/printing/colour-order/)).
  - Large solids flood and tide-mark; printers cap coverage at 95%, or 50–75% for full-page solids ([Risotto](https://risottostudio.com/pages/advanced-print-setup)).
  - Other defects: roller marks, feed-tyre tracks and banding in 10→0% gradients.
  - **No full bleed:** about a 10 mm unprinted border.

### 3.2 Ink palette

Real Riso inks, as screen approximations ([mattdesl/riso-colors](https://github.com/mattdesl/riso-colors), MIT, from stencil.wiki):

| Role | Ink | Hex |
|---|---|---|
| Key / navy | Federal Blue · Medium Blue · Indigo (special edition) | `#3D5588` · `#3255A4` · `#484D7A` |
| Hot accent | **Fluorescent Pink** | `#FF48B0` |
| Warm | Orange · Pumpkin | `#FF6C2F` · `#FF6F4C` ("Fluorescent Orange" is salmon, `#FF7477`) |
| Yellow | Sunflower (special edition) · Yellow | `#FFB511` · `#FFE800` |
| Cool | Teal · Light Teal | `#00838A` · `#009DA5` |
| Paper | cream | `#F2EDE3` (riso-windowseat) / `#F3EBDC` (our kit) |

Multiply previews, ink × ink:

| Overprint | Result | Colour |
|---|---|---|
| Federal Blue × Fluorescent Pink | `#3D185E` | aubergine; use it as our "black" |
| Fluorescent Pink × Sunflower | `#FF330C` | red-orange |
| Teal × Sunflower | `#005D09` | green |
| Federal Blue × Sunflower | `#3D3C09` | olive mud; avoid |

Three inks stacked go brown, so limit each scene to 3–4 inks and give each plate a job.

### 3.3 Libraries and licences

| Library | Licence | Use it for |
|---|---|---|
| **p5.brush** 2.2.3 ([repo](https://github.com/acamposuribe/p5.brush)) | MIT | Tapered ink, `wash()`, `fillBleed`, `hatch`, `wiggle`, vector fields. **Its colour mixing uses spectral.js Kubelka–Munk, which is paint mixing**: pink plus blue from p5.brush will *not* give the riso overprint colour. So paint plates as monochrome coverage and colourise in the post-pass |
| **glsl-halftone** ([repo](https://github.com/glslify/glsl-halftone)) | MIT | Gustavson's antialiased dots: `r = sqrt(coverage)`, a rotated grid per ink, 3-octave simplex noise on the threshold to roughen dot edges |
| **overprint** ([repo](https://github.com/chuwd19/overprint)) | MIT | WebGL2 riso separation. It chooses ink combinations by least squares in OKLab, and offers AM, FM, Bayer and error-diffusion screens |
| **riso-windowseat** | MIT | The complete Canvas2D plate pipeline (§3.4) |
| **p5.riso** ([repo](https://github.com/antiboredom/p5.riso)) | **Anti-Capitalist License** | Read for ideas (multiply layers, `halftoneImage`, `ditherImage`); reimplement rather than vendor |
| **rough.js** ([wiki](https://github.com/rough-stuff/rough/wiki)) | MIT | Hachure and cross-hatch fills with a `seed` for deterministic output |
| **perfect-freehand** ([repo](https://github.com/steveruizok/perfect-freehand)) | MIT | Pressure-tapered outlines (thinning, streamline, taper) |
| **sand-spline** ([repo](https://github.com/inconvergent/sand-spline)) | MIT | Grainy pencil lines: about 1,000 grains per step at alpha 0.01 |
| **risograph-grain-shader** ([repo](https://github.com/Robpayot/risograph-grain-shader), [Codrops](https://tympanus.net/codrops/2022/03/07/creating-a-risograph-grain-light-effect-in-three-js/)) | MIT | Shading as grain density: effectively "grain touch" |
| **mono-color-skill** ([repo](https://github.com/yanliudesign/mono-color-skill)) | MIT | Imperfection ranges: ink density 6–12%, dry-edge breakup 1–4%, halftone drift 5–10%, gaps in hand-drawn gestures 4–12% |
| **spectral.js** | MIT | Pigment mixing. Mixbox is **CC BY-NC**, so avoid it |
| Tyler Hobbs's essays | — | [Watercolour](https://www.tylerxhobbs.com/words/a-guide-to-simulating-watercolor-paint-with-generative-art): recursive Gaussian midpoint deformation, 30–100 layers at ~4%. [Flow fields](https://www.tylerxhobbs.com/words/flow-fields) |

### 3.4 The plate recipe

This fits `video/kit`.

1. **Plates.** For each ink i (3–5), draw with p5.brush in *monochrome coverage only* into framebuffer `F_i`. Or pack up to 4 inks into the RGBA channels of one framebuffer, the channel trick from [Codrops 2024](https://tympanus.net/codrops/2024/06/27/digital-meets-physical-risograph-printing-with-webgl/). Apply knockouts per plate: a bright element over a dark ground must `destination-out` the ground, or it prints muddy.
2. **Registration per plate, chosen once per shot** (a "print run"), not per frame:
   - translation σ = 1.5–3 px, clamped to 6 px or less; key plate at 0;
   - rotation 0.05–0.1° about an off-frame point, so the offset varies across the frame;
   - the two inks from the "same pass" get σ/2;
   - optional 0.3–0.7 px jitter at 12 fps, synced to the boil, for a "scanned printed frames" feel.
3. **Screens anchored to the page, never to objects.** riso-windowseat calls a screen that crawls with its object "the single most recognisable way this look goes wrong".
   - Use precomputed per-ink threshold tiles: screen distance field + low-frequency mottle + starvation flecks + tooth. Per frame, screening is then just `step(threshold, coverage)`.
   - Use rational-tangent angles (14°, 76°, 0°, 45°, 26.6°, 63.4°) so tiles repeat seamlessly.
   - Pitch: 4.6 px at 1080p, rising to 8–12 px for pop moments.
   - FM grain for linework and pencil texture.
4. **Ink behaviour:**
   - coverage ≤ 0.95;
   - density `1 − (0.06–0.12)·fbm(x/300 px)`;
   - starvation flecks r = 0.5–2.5 px;
   - rare feed-direction streaks at 1–3% contrast;
   - a paper-tooth mask that knocks ink *out*, rather than grain laid on top.
5. **Composite:** `out = paper · Π_i mix(1, ink_i, printed_i · D_i)`. Optionally lerp 5–10% toward the top ink where it covers, for the order effect.
6. **Test:** before grain, count unique colours. There should be at most 2^N for N inks. Anything else is a slop tell.

### 3.5 Boil, frame rate and paper

- **Boil.**
  - `drawing = floor(t·12)`.
  - Held elements cycle a fixed set of 3–5 seeds (`hash(key, drawing mod N)`). Squigglevision loops 5 drawings ([Wikipedia](https://en.wikipedia.org/wiki/Squigglevision)).
  - Moving elements get a new seed every drawing.
  - Amplitude 1–2.5 px at 1080p (research estimate), from low-frequency noise with a 40–120 px wavelength, plus ±10–15% stroke width.
  - 4–8 px only for deliberate "nervous" beats. Text boils at half amplitude.
  - **Screens and paper don't boil.** Backgrounds either hold, or boil at 4–6 fps at half amplitude.
  - References: [Camillo Visini](https://camillovisini.com/coding/simulating-hand-drawn-motion-with-svg-filters) (feTurbulence 0.02–0.03, 4 variants every 100 ms), [PremiumBeat](https://www.premiumbeat.com/blog/wiggle-text-line-boil/).
- **Frame rate.**
  - Spider-Verse animated "the majority" on twos and used threes for snap. It replaced depth of field with misregistered offsets ("looked like the image was out of focus") and motion blur with drawn lines ([fxguide](https://www.fxguide.com/fxfeatured/why-spider-verse-has-the-most-inventive-visuals-youll-see-this-year/)).
  - Hobie in *Across the Spider-Verse* runs different body parts at different rates (jacket on 4s, guitar on 6s) ([befores & afters](https://beforesandafters.com/2023/06/17/the-across-the-spider-verse-spider-punk-character-hobie-was-animated-with-different-frame-rates-for-different-parts-of-his-own-body-and-accessories)). That fits a zine collage.
  - **Our default:** characters on twos, camera on ones, accent hits on threes.
  - riso-windowseat found fast camera moves strobe unless they use about 1 shutter sample per 3 px of travel. mexicat's adaptive sub-frame motion blur is the heavy version (`vendor/mexicat-pdoom/README.md`).
- **Paper.**
  - Keep large-scale mottle **static for the whole film** (regenerating it flickers). Use a warm tint (`#B4A68C` wash at alpha 0.05–0.10), not grey multiply, which "reads as smoke". Add ~420 fibres and ~2,200 flecks.
  - Optionally cycle a fine fleck layer through 3 variants on cuts.
  - CC0 scans: [ambientCG](https://docs.ambientcg.com/license/) Paper001–006, Poly Haven. The Lost & Taken licence is unverified.
- **Print ephemera that sell "physical":**
  - registration crosshairs printed in *every* ink, so they show the misregistration;
  - crop marks;
  - a colour bar per ink (100/50/25% plus overprint patches);
  - the unprinted margin;
  - a pencil edition number;
  - fold creases with cracked ink;
  - translucent tape (source-over plus a highlight, not multiply);
  - staples.

  Use them sparingly, as scene furniture.

### 3.6 Handmade vs slop

| Tell | Counter-move |
|---|---|
| Colours outside the ink set; smooth gradients | Tone only as dot size or density; unique-colour test ≤ 2^N |
| Pure `#000` / `#fff` | Darks are overprints; paper is cream |
| Perfect registration, or one global RGB shift ("chromatic aberration") | Per-plate offsets fixed per sheet, plus tiny rotation; key plate at 0 |
| Halftone or grain that swims with objects, or is regenerated every frame | Page-anchored screens; paper baked once; randomness keyed to `t` |
| Laser-perfect solids | Starvation flecks, 6–12% mottle, coverage ≤ 0.95 |
| Too many inks; fluoro pink everywhere | 3–4 inks per scene, each with a job. "Excessive colours / teal-orange gradients" is a top AI-poster tell ([Mika Reyes](https://www.mikareyes.com/ai/how-to-fix-ai-looking-graphic-design-and-posters)) |
| Vector-perfect edges, true circles, constant line width | Pressure taper and wobble harmonics; "a wobbled ellipse is still an ellipse" |
| Glow, lens blur, 3D lighting, drop shadows | Light is ink *knocked out* back to paper |
| Auto-sepia, distressed borders, yellowed paper | Hard avoid (mono-color-skill). gpt-image's yellow tint is a known meme (`research/video.md`) |
| Silky 60 fps interpolation | Twos and threes, holds, settle curves |
| Every inch filled | Restraint: about a third of riso-windowseat's reference frames are mostly blank cream |

### 3.7 Performance and encoding

- **p5.brush `fill` shapes are the bottleneck.** Bake each shot's static layers into framebuffers once. A single full-screen post-pass over 2 M pixels is cheap by comparison.
- **p5 2.x shaders.** `createFilterShader(frag)` gives `tex0`, `canvasSize` and `texelSize`. `buildFilterShader` / `baseFilterShader().modify` is experimental, so pin the p5 version. p5.brush draws into a `p5.Framebuffer` via `brush.load(fb)`.
- **Measured cost:** riso-windowseat's CPU screening costs ~16 ms of a 90–200 ms frame with 5 plates.
- **Readback:** keep `getImageData` to at most one per frame (`willReadFrequently` pushes the canvas to the CPU).
- **Encoding.**
  - H.264 4:2:0 softens fine coloured screens and 1 px lines. Judge print quality on PNGs, keep pitch ≥4 px, and use a low CRF.
  - **Never rescale a halftoned bitmap** (moiré): screen at the final output resolution.
  - mexicat notes that YouTube's compression smeared its film grain, and per-pixel 4K grain ballooned bitrate to ~670 Mbit/s at CRF 16. So make grain coarse (≥2 px features) rather than per-pixel.
- **An alternative way to "redraw" a base: the Functional Emotions renderer** ([repo](https://github.com/ledbetterljoshua/functional-emotions-video), MIT).
  - Each shot paints a flat Canvas2D *underpainting*.
  - A WebGL2 pass then repaints it with ~60,000 instanced strokes that sample their colour from it and align to its edges.
  - Strokes re-roll a few times a second.

  The same structure works for riso: underpainting → per-ink coverage → screens.

---

## 4. Rotoscope and trace-over pipelines

**Principle: trace structure, not pixels.** A per-pixel look pass (posterise + halftone over the clip) inherits Seedance's texture swimming and invented micro-detail. A redraw from extracted structure (masks, centrelines, landmarks, per-region inks) gets one consistent stroke vocabulary and deliberate omissions, and the boil stays under our control.

### 4.1 Benchmark on this Mac

The research pass ran these tests on an M4 Pro, CPU only. Scripts are in `scratchpad/vr/` (temporary). Test inputs: 48 frames of a CC BY music video, plus 14 frames of the reference.

- **The current MediaPipe release crashes on macOS.** Version 1.0.1 aborts on any face, pose or hand task ([issue #6356](https://github.com/google-ai-edge/mediapipe/issues/6356)). **Pin `mediapipe==1.0.0`.**
- **Small faces are missed.** The face tracker downsamples to 192×192, so it found 0 of 48 faces on full frames. Cropping around the head first (using the pose tracker's face points) found 48 of 48, at 5 ms per crop.
  - `jawOpen` tracked the singing (0–0.52).
  - Pose was found in 48 of 48 frames; hands averaged 2.2 per frame.
- **On our anime style, MediaPipe fails.**
  - Face: 0 of 14 reference frames, and still 12 of 14 missed with cropping, including full-frame close-ups.
  - Pose: 3 of 14.
- **Per-1080p-frame cost on CPU:**

  | Step | Time |
  |---|---|
  | Pose | 17 ms |
  | Hands | 17 ms |
  | Face (on a crop) | 5 ms |
  | Hair/skin/clothes segmentation | 31 ms |
  | XDoG lines | 11 ms |
  | DIS optical flow | 50 ms |
  | Skeletonise | 12 ms |
  | VTracer | 29 ms |

- **Flicker:** 7.8% of line pixels moved by more than 1 px frame to frame after motion compensation. Blending with the flow-warped previous frame (weight 0.3 on the new frame) cut this to 5.1%. XDoG needs per-shot tuning on low-contrast grounds.
- **Storage per drawing:** a line PNG is ~10 KB; centreline JSON ~18 KB (145 strokes); a VTracer SVG of the same lines 168 KB (it traces both edges); a colour-mask PNG ~8.5 KB; landmarks 2–10 KB.

### 4.2 Tools by job

| Job | Recommended | Also | Licence notes |
|---|---|---|---|
| Line extraction | **Informative Drawings** contour style ([repo](https://github.com/carolineec/informative-drawings), MIT) or **lineart_anime / Anime2Sketch** ([repo](https://github.com/Mukosame/Anime2Sketch), MIT) for flat-shaded clips; **XDoG** ([paper](https://kyprianidis.com/p/cag2012/)) when you want control | TEED (MIT, 58K params), DexiNed (MIT), Canny (flickers most). `controlnet_aux` bundles most of these (Apache-2.0) | PiDiNet: "research only". HED: BSD-style |
| Vectorise | **Centreline:** Zhang–Suen skeleton (`cv2.ximgproc.thinning` or scikit-image) → graph (`skan`/`sknw`, BSD) → RDP simplify (ε ≈ 1.5 px), drop strokes under 6 px → Catmull-Rom in JS → `brush.spline` | autotrace has a centreline mode; VTracer (MIT, outlines only); Virtual Sketching (Apache-2.0) | potrace and autotrace are GPL: fine as tools, don't vendor |
| Masks | **SAM 2.1** ([repo](https://github.com/facebookresearch/sam2), Apache-2.0): one click, then `propagate_in_video`. For anime: `SkyTNT/anime-segmentation` (Apache-2.0) | SAM 3 / 3.1 (text prompts, multi-object; needs CUDA; SAM License); BiRefNet (MIT); MediaPipe multiclass (hair, skin, clothes) | RVM is GPL-3.0; MatAnyone is non-commercial |
| Landmarks | MediaPipe 1.0.0 on *semi-real* footage, with a head crop; **DWPose / RTMW via `rtmlib`** ([repo](https://github.com/Tau-J/rtmlib), Apache-2.0, CPU) | `hysts/anime-face-detector` (MIT, 28 points, frontal only) | **OpenPose is non-commercial; Sapiens is CC-BY-NC** |
| Smoothing | **One Euro filter** ([site](https://gery.casiez.net/1euro/)). Tune: β = 0, lower the min cutoff from ~1 Hz until slow jitter goes, then raise β until fast motion stops lagging | — | BSD/MIT code |
| Mouths | **Phonemes from our word alignment** (CMUdict) → 6–9 Preston Blair mouth shapes, on twos | Rhubarb Lip Sync (MIT): check it with `-d lyrics.txt` on the vocal stem; `jawOpen` as a cross-check | — |
| Flat regions | Bilateral (cheapest), or **anisotropic Kuwahara** ([Kyprianidis 2009](https://kyprianidis.com/p/npar2009/)): flat and temporally stable with no motion estimation | mean-shift (slow) | — |
| Palette | **Assign one ink per mask region by majority vote over the whole shot**, in OKLab ([Ottosson](https://bottosson.github.io/posts/oklab/)); 2–3 luminance bands from temporally smoothed luma; shadow band → halftone | — | Removes colour flicker entirely |
| Flow | OpenCV DIS / Farneback on CPU | RAFT / SEA-RAFT (BSD-3, CUDA-oriented), `ptlflow` | — |
| Keyframe restyle | EbSynth v1 ([repo](https://github.com/jamriska/ebsynth), public domain, macOS CPU build) | Ezsynth (AGPL); ebsynth.com (Windows, no API) | Useful for a few hand-painted hero shots |
| AI restyle *before* tracing | Only as a **flattening** pass ("flat cel-shaded, solid colours, black outlines, plain background"): Runway Aleph 2 (`runway/aleph-2` on OpenRouter), FLUX Video Edit (720p, ≤15 s, $0.03/s) | Wan VACE, AnimateDiff (GPU pod) | Risks: swimming texture, identity drift, shifted mouth timing, errors compounding |

**The core trade-off.** Bénard et al.'s survey frames it as flatness vs coherent motion vs temporal continuity ([doi](https://doi.org/10.1111/j.1467-8659.2011.02075.x)); you can't max all three. Our choice: maximise flatness, and let continuity show as intentional boil on twos.

### 4.3 Recommended pipeline

**Python pre-pass, per clip, on the Mac:**
1. ffmpeg: delogo, make a 1080p master plus a 960×540 working copy, and split any cuts inside the clip with PySceneDetect.
2. SAM 2.1 masks per character, hair and prop, as one indexed PNG per drawing (~10 KB).
3. Colour: per-shot ink vote per region, plus 2–3 luminance bands (~10 KB, 4-level PNG).
4. Lines at 540p:
   1. bilateral or Kuwahara smoothing;
   2. XDoG or lineart_anime;
   3. flow-warped blend at 0.3;
   4. skeletonise, then RDP;
   5. write `strokes.json` (~20 KB). Mask silhouettes go in as their own strokes with **stable IDs**, so their brush seed is fixed; interior strokes are seeded per drawing, which is the boil.
5. Landmarks where they work: pose and hands on the full frame, face on a head crop, One Euro smoothed, matched to mask IDs.
6. `visemes.json` from the lyric alignment, one file per song.
7. Optional: quarter-resolution DIS flow, for strokes that should follow motion.

**Totals:** ~50–60 KB per drawing, about 3 MB per 5 s clip at 12 fps.

**The JS renderer loads only these files.** Add a code check that it never opens a base JPEG. The existing plan in `research/video.md` §4 pre-extracts JPEGs for a footage layer; those stay as pre-pass input only.

**Prompt Seedance for traceability:**
- anime-flat shading;
- solid, distinct costume colour blocks per member, matching the ink plan;
- plain or separable backgrounds;
- simple hands.

Then redraw backgrounds as static plates with parallax, and don't trace them.

### 4.4 Failure modes and QA

**Failure modes:**
- **Hands:** use simplified or stock drawn hand shapes.
- **Fast motion:** hold the drawing, or add smear frames and speed lines.
- **Crossing dancers swap mask IDs:** re-prompt SAM at the crossing.
- **Anime faces:** landmarks fail, so drive the face with visemes plus a timed blink loop.
- **Seedance morphing** (merging limbs, extra fingers, drifting backgrounds): reject the clip or cut away.
- **Watermarks:** delogo.

**QA, logged per clip:**
- landmark and mask coverage rates;
- flow-warped mask agreement between frames (below 0.8 means morphing or an ID swap);
- stroke count per drawing within ±30% of its neighbours;
- landmark jump threshold;
- lip-sync lag: cross-correlate the viseme track against the vocal envelope;
- side-by-side base/redraw sheets, for review only.

### 4.5 Precedents

- **[2606156052/Pdoom-video-anime-version](https://github.com/2606156052/Pdoom-video-anime-version)** (ISC): the closest precedent. It uses Seedance 2.5 base footage "never displayed directly":
  - a WebGL smoothing pass (called Kuwahara, actually bilateral);
  - XDoG lines;
  - nearest-ink matching with 2-tone shading;
  - 45° screentone;
  - boil on twos and misregistration;
  - `mouthsync.mjs`, which cross-correlates mouth darkness with vocal energy.

  It is a pixel look pass, so it inherits texture swimming. We go one step further, to structure.
- **Other P(doom) repos:** PDoomVideo, mexicat, ClaudeAnimationBase and paint-mv-skills use no base footage. makevoid uses MiniMax H3 greenscreen characters as cut-outs.
- **Classics:**
  - A-ha "Take On Me": ~3,000 rotoscoped frames in 16 weeks.
  - *A Scanner Darkly* / Rotoshop: vector interpolation between keyframes, which gives a smooth, uncanny look.
  - *Undone*: motion capture plus rotoscoping.
  - *Loving Vincent*: 65,000 painted frames.
- **Corridor, "Anime Rock, Paper, Scissors" (2023):** img2img over greenscreen footage. The backlash was about borrowing one studio's style (e.g. "rip off work like Vampire Hunter D", [HN](https://news.ycombinator.com/item?id=37144284)). A lesson for style prompts: our look must be ours, riso plus interp figures, not a named anime's.

---

## 5. Interp's own visual world

**Licences.** Distill is CC BY 4.0 (reuse with credit). transformer-circuits.pub states no licence, so **redraw and credit**. Rendered reference figures were saved by the research pass to `scratchpad/img/` (temporary; ~44 MB): framework `fw_*`, induction `ind_*`, IOI, grokking, attribution-graph SVGs. Copy any you need for tracing into the project before the session ends.

### 5.1 Colour conventions conflict

**This is the biggest wince risk.** Use the convention of the figure a shot quotes, and never mix conventions in one shot.

| Source | Positive | Negative | Activation highlight |
|---|---|---|---|
| Distill Circuits weights | red `#CA0020` (excitation) | blue `#0571B0` (inhibition) | — |
| Anthropic 2023 dashboard logits | **blue** | **red** | **orange** tokens |
| Neuronpedia (current) | **green** (emerald, rgb(16,185,129)) | red / salmon | **emerald** tokens; orange only for attention DFA |
| Attribution-graph edges (Anthropic and Neuronpedia) | green (d3 PRGn) | **purple** | orange = an intervention ("+2×") |
| Toy Models WᵀW | red +1 | blue −1 | importance runs yellow → green → teal |

**The riso gift:** red × blue overprints to purple, so negative attribution edges can literally be overprints. A workable 5-ink interp kit: Federal Blue key line, fluoro orange, blue, bright red and green, with purple from overprint and fluoro pink optional.

### 5.2 The idioms, ranked by recognisability

The ranking is the research pass's judgement for this audience. Each row gives what to draw, the source, and how it moves on the beat.

| # | Idiom | What it looks like (to redraw exactly) | Source | Riso redraw and beat |
|---|---|---|---|---|
| 1 | **SAE feature dashboard / Neuronpedia page** | Feature ID, activation-density histogram (orange gradient), positive/negative logit chips, top activations with token highlights. Real example: `gemma-2-2b/20-gemmascope-res-16k/12082`, a dog feature (density 0.243%; " dog" 1.73, " dogs", " canine") | [Neuronpedia](https://www.neuronpedia.org/gemma-2-2b/20-gemmascope-res-16k/12082); [Towards Monosemanticity](https://transformer-circuits.pub/2023/monosemantic-features/index.html) (#3923 "Latin") | A set the idol stands inside. Tokens light in emerald as sung; the histogram bars pump on the kick |
| 2 | **Golden Gate Bridge** | Feature **34M/31164353**, clamped to **10× its max** on Claude 3 Sonnet; "starts to self-identify as the Golden Gate Bridge". Neighbourhood map: blue dots 34M, green 4M, pale-yellow 1M, labels such as "1906 SF earthquake", "Lighthouses" | [Scaling Monosemanticity](https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html); [Golden Gate Claude](https://www.anthropic.com/news/golden-gate-claude) | A bridge-orange ink moment; the clamp dial turns up on the pre-chorus |
| 3 | **Attribution graph** | Prompt strip at the bottom; beige stacked-card supernodes (`#E6E3D6`, outline `#706D5C`); maroon arrows `#633636`; orange annotations `#CC6500`; logits on top. Dallas → Texas → "say Austin"; rabbit/habit rhyme planning | [Biology](https://transformer-circuits.pub/2025/attribution-graphs/biology.html); [Methods](https://transformer-circuits.pub/2025/attribution-graphs/methods.html); [Tracing thoughts](https://www.anthropic.com/research/tracing-thoughts-language-model) | One hop per beat; an orange "+2×" stamp on the downbeat; Texas → California makes Sacramento (97%) |
| 4 | **Superposition pentagon** | n = 5 features in m = 2 dims. 0% sparsity: 2 orthogonal. 80%: 4 as antipodal pairs. **90%: pentagon**, with "Interference". Feature colour yellow → green → teal by importance | [Toy Models](https://transformer-circuits.pub/2022/toy_model/index.html) | Arrows spring 2 → 4 → 5 on successive bars; five dancers as the five arrows |
| 5 | **Residual stream** (Framework) | A vertical grey line; parallel head boxes h₀, h₁… sum at a circled "+"; then MLP, then "+"; embed at the bottom, unembed at the top; QK path magenta, OV tan/gold | [Framework](https://transformer-circuits.pub/2021/framework/index.html) | A highway or subway map; heads drop ink blobs into the stream at "+" junctions on the beat |
| 6 | **Induction bump and stripe** | Small multiples for 1-, 2- and 3-layer models: ICL score vs tokens, with a pale amber phase-change band. The raw loss shows "a bump"; the cliff is in the ICL score. The one-layer panel has **no** drop | [Induction heads](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html) | The amber band sweeps across on the drop; the stripe appears in the attention grid |
| 7 | **Grokking and the Fourier clock** | Train in blue, test in red; P = 113; key frequencies {14, 35, 41, 42, 52}. Memorisation → circuit formation → cleanup, and the jump comes **during cleanup** | [Nanda et al. 2023](https://arxiv.org/pdf/2301.05217) | A five-hand clock, one hand per frequency, ticking on the beat |
| 8 | **Zoom In circuit tiles** | Rounded feature-vis tiles with `layer:unit` labels (3b:379 curve detector; 4e:55 polysemantic); red and blue weight kernels; the car → dog superposition circuit | [Zoom In](https://distill.pub/2020/circuits/zoom-in/) (CC BY) | Kernels fire red on the kick |
| 9 | **Attention heatmap** | Lower-triangular when rows = query | CircuitsVis convention | Cells fill down the diagonal per syllable |
| 10 | **IOI circuit** | "When Mary and John went to the store, John gave a drink to"; 26 heads in 7 classes (name movers 9.9, 9.6, 10.0; S-inhibition 7.3, 7.9, 8.6, 8.10…); IO green, S purple, END yellow | [Wang et al.](https://arxiv.org/abs/2211.00593) | A K-pop member card per head class |
| 11 | **Logit / tuned lens grid** | Layers × positions, top-1 token per cell | [logit lens](https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens), [tuned lens](https://arxiv.org/pdf/2303.08112) | A lyric word resolves row by row (§2.4) |
| 12 | **ROME causal trace** | "The Space Needle is in downtown": purple = hidden state, green = MLP, red = attention; "early site" / "late site" | [ROME](https://arxiv.org/pdf/2202.05262) | Restore one cell per beat until the stripe appears |
| 13 | **Steering (ActAdd "Love − Hate")** | "I hate you because…" flips to "…you are so beautiful" | [Turner et al.](https://arxiv.org/pdf/2308.10248) | An arrow added on the downbeat flips the lyric |
| 14 | **Probe hyperplane / Geometry of Truth** | PCA with true = blue, false = red; Fig. 1 is **LLaMA-2-70B** | [Marks & Tegmark](https://arxiv.org/abs/2310.06824) | A line sweeps and the cloud splits |
| 15 | **J-lens readout (new, Jul 2026)** | Wiggly residual-stream columns with a red Jacobian; a blue J_ℓ box plus magnifying glass; an orange-bar "J-lens readout" (Mars / color / planet / fourth); an Earth ↔ Mars coordinate swap | [Workspace paper](https://transformer-circuits.pub/2026/workspace/index.html); Neuronpedia "Jacobian Lens" (`/qwen3.6-27b/jlens`) | Already riso-ready; the freshest reference in the set |

**On the bench:**
- Othello-GPT: Nanda's "my counters vs their counters" linear probe ([AF](https://www.alignmentforum.org/posts/nmxzr2zsjNtjaHh7x/actually-othello-gpt-has-a-linear-emergent-world)).
- The refusal direction: `x′ ← x − r̂r̂ᵀx`. Its canonical plots are bar charts and cosine-vs-layer. **There is no 2D harmful/harmless scatter in the paper.** Our `video-scratch/data/activations_2d.json` (an earlier project) is our own Qwen2.5-1.5B-Instruct layer-17 reproduction; caption it so.
- The shoggoth, which is overused by this wave.

### 5.3 Explainers the audience grew up on

- **3Blue1Brown:**
  - Ch5 ([wjZofJX0v4M](https://www.youtube.com/watch?v=wjZofJX0v4M)): woman − man ≈ queen − king arrows.
  - Ch6 ([eMlx5fFNoYc](https://www.youtube.com/watch?v=eMlx5fFNoYc)): "A fluffy blue creature roamed the verdant forest". He puts queries in *columns*, so his masked grid is **upper**-triangular. Label your axes.
  - Ch7 ([9-Jl0dxWQs8](https://www.youtube.com/watch?v=9-Jl0dxWQs8)): the Michael Jordan AND-gate neuron, and 10,000 near-orthogonal vectors (89–91°) in 100 dimensions for superposition.
- **Welch Labs:** "The Dark Matter of AI [Mechanistic Interpretability]" ([UGO_Ehywuxc](https://www.youtube.com/watch?v=UGO_Ehywuxc)) and "The most complex model we actually understand" ([D8GOeCFFby4](https://www.youtube.com/watch?v=D8GOeCFFby4)). Built in Manim ([repo](https://github.com/WelchLabs/videos)). Its grokking notebook may not use P = 113, so don't mix numbers between sources.
- **Jay Alammar's Illustrated Transformer** ([link](https://jalammar.github.io/illustrated-transformer/), CC BY-NC-SA): embeddings green, Q purple, K orange, V blue.
- **Others:** Bycroft's 3D LLM ([bbycroft.net/llm](https://bbycroft.net/llm)), Goodfire's Paint with Ember, and Transluce's neuron descriptions (real *neurons*).

### 5.4 What makes experts wince

- **Attention triangle orientation:** it must match the axis labels. Rows = query means lower-triangular.
- **Induction stripe offset:** on [BOS, t₁…tₙ, t₁…tₙ] it sits at key = **q − (n − 1)**. q − n is the duplicate-token head; q − 1 is the previous-token head.
- **Pentagon with 4 points:** five arrows belong to the 90% panel. Four (as two antipodal pairs) is the 80% panel.
- **Calling SAE, transcoder or CLT features "neurons".** Exceptions where "neuron" is right: the Spider-Man neuron (CLIP RN50_4x, neuron 244), InceptionV1 units, Transluce.
- **Attribution-graph nodes are CLT features on Claude 3.5 Haiku**, not SAE features.
- **Residual stream drawn wrong:** heads in series, MLP before attention, or missing "+" junctions.
- **Golden Gate Claude as a contrastive steering vector.** It was an SAE feature clamped to 10× on Claude 3 Sonnet, online for 24 h from 23 May 2024; Anthropic's own term is "feature steering".
- **Grokking as sudden insight:** the circuit forms gradually and the jump comes at cleanup. Grokking itself was discovered by Power et al.; Nanda et al. reverse-engineered it.
- **Wrong details:** a one-layer induction bump (there is none); Geometry of Truth credited to 13B (it's 70B); ROME colours swapped.

**Rule:** every figure-shot gets a ledger entry (`refs/ledger.md`) and goes through the fact-check subagent. The audience *will* pause on it.

---

## 6. The Sept 2026 AI-video wave: what spread and why

**The lineage** (details in `research/reference_video.md`, `refs/x_audit/x_audit.md` §(e) and `refs/web_audit_2026.md` §5a):
1. slimer48484's "Claude-Pop" (9 Sep; 727k views).
2. other__reality's watercolour JS video (22 Sep; 2.68M).
3. **donaldjewkes's riso/K-pop remake** (23 Sep; 3.65M, 10.4k likes, 10.8k bookmarks).
4. Remakes: anabology (13.9k likes), mexicat (1.47M), pleometric (PC-98), makevoid ("6M tokens + ~$65"), RhysSullivan's Beat Saber version.
5. Counter- and answer-songs: "Nothing Went Foom!", and domenic's six-genre "We Didn't Start the Scaling" with a reference-explainer site (29 Sep).
6. Separately, the interp-paper song "Functional Emotions" (@eudaemonea, painted, 7 chapter agents) and Jesse Caple's news-list "Zoom Zoom P(doom)".

An "awesome Opus 5.5 video" list already tracks **986** such videos, so "made with Opus 5.5" is saturated as a hook.

**Why the winners spread:**
1. **Cute-on-dark contrast.** "i really like how cutesy and cheerfully claude chooses to animate yudkowskian nightmares" ([127 likes](https://x.com/thexpiredpear/status/2102527113668804640)).
2. **Reference density that rewards pausing.**
   - Bookmarks outnumbered likes on donald's video.
   - "The references are really good. Easily ranks among the best original art I've encountered on this app" ([link](https://x.com/stanfordNYC/status/2102891944556867827)).
   - Named sight gags got their own replies: the researcher's life-expectancy meter (207 likes), the Geometry Dash reference, shinigami eyes, the paperclip transformation, and **the bow at the end**.
3. **Content that matches the medium.** "the first kind of AI generated music where the content and the medium seem to really do it for me" ([Nathan Calvin](https://x.com/_NathanCalvin/status/2103886119410815047)). An interp song drawn *out of interp figures* is the strongest version of this for us.
4. **Genre legibility.** "the opening theme of the AGI anime arc"; "way too catchy". The K-pop frame gave outsiders a way in.
5. **Emotional hit.** "Why did this make me emotional"; Casper: "laughed, cried, and vomited uncontrollably all at the same time."
6. **A craft story.** "Claude worked for 12 hours while I slept" drove the spread, but it is now a cliché and was mocked (next list).

**What got punished:**
1. **Wrong glosses.** "CDR" drawn as "Critical Design Review" instead of Lisp `cdr` became the top reply ([Kenton Varda, 898 likes](https://x.com/KentonVarda/status/2103896941390131619); gwern made the same point). With this audience, one wrong gloss *is* the reception.
2. **Recycled gags.** "the model does just latch onto the same few ideas" ([283 likes](https://x.com/AndrewM_Webb/status/2104221702418837743)); Finn's list of repeats. Retired by overuse:
   - von Neumann under a sheet;
   - the paperclip island;
   - police-cap safety clouds;
   - the "You're absolutely right!" wall;
   - the shoggoth with a smiley mask;
   - the BERT `[MASK]` board.
3. **Jank.** gwern preferred the watercolour version as "less janky and a lot more clever sight-gags imagery".
4. **Overclaiming.** "the post: 'Claude one-shot this' / the prompt: 10k characters…" ([2,221 likes](https://x.com/trq212/status/2102870353781641416)).
5. **Slop.** "You just slop grenaded something that was already amazing."
6. **Craft nits.** The song sped up; the karaoke colour-scroll was off-sync ([link](https://x.com/JonLafrenaye/status/2102541869980733797)); "who is Sydney?", i.e. insider references with no way in for outsiders.
7. **Fatigue.** "I promise this is the last P(doom) video you'll ever watch."

**Do:**
- Make it a *music video*, not a lyric video (the Functional Emotions rejection, §2.1).
- Keep the cute riso idol against serious content.
- Put 2–3 correct reference layers in every shot.
- Invent our own sight gags, grounded in interp figures, which no one in the wave has used as sets.
- Give the song an emotional arc and a killing part.
- End on the K-pop bow.
- Publish a reference explainer: domenic's site shows the demand, and the X audit found people wishing for it.
- Describe the process honestly.
- Credit the kits (ClaudeAnimationBase, MIT).
- Make every lyric highlight sample-accurate.
- Keep the song at its real tempo.

**Don't:**
- lead with "one prompt";
- reuse the wave's gags or the reference's exact devices (sunburst flower idol, P(doom) meter, flower-head dancers); take its *grammar*, not its props;
- copy the Functional Emotions painterly look, or make emotions the hook;
- show photoreal real people or fake tweets;
- let any reference go unverified;
- release longer than 2:19.

---

## The 25 most actionable rules for our video

1. **The first cut can wait; the first event can't.** Hold one composed riso page for 2–4 s (Supernova and Whiplash hold 6 s), but slam the first lyric word by about 1.2 s and print the title wordmark by about 2 s (Ditto 0:01.5, Golden 0:00.7). Allow at most 0.6 s of paper or pencil foley before the downbeat.
2. **Pace from the measured range.** 30–45 cuts/min overall; median shot 1.0–1.3 s; 10% of shots under 0.4 s and 10% over 3 s. Verses about 4 cuts per 10 s, choruses 6–8, final chorus 12–15.
3. **Quantise hits, not cuts.**
   - Flashes, stamps, word slams and formation changes go exactly on the grid.
   - A third to a half of cuts follow action or lyric onsets.
   - On-beat cuts land 1–2 frames early.
   - The code-made reference is over-locked (R₂ 0.69, against 0.03–0.32 for the 13 MVs).
4. **The chorus is one wide, frontal, centred group formation on a chorus-only set.** Hold it through the killing-part phrase, with the same framing every chorus and a new payload each repeat.
5. **One hands-only point move for the hook,** repeated identically every chorus and easy to copy for a 15 s clip.
6. **Each cast member gets one riso ink, one set built from one interp figure, and a hand-made name sticker** (How Sweet 0:03.5–0:06.5). Verses visit one member's world; the chorus gathers them. Keep the ink-to-member mapping fixed for the whole video.
7. **Every 3–4 shots, a 0.4–0.8 s insert of a hand or object that recurs as a motif,** e.g. the researcher's pencil, a probe, a lab-notebook page (Magnetic's star light, Attention's ticket).
8. **One loud element at a time.** Hero words only for hook, stop-time or held (≥1 s) words; function words stay small in the stack. At most 3 full-frame flashes in any second, and colour flips on downbeats only.
9. **Word timing to the frame.**
   - Hero word contact frame on the sung onset, or up to 2 frames early, never late.
   - Subtitle lines appear 4–6 frames early and dim.
   - The karaoke highlight never runs ahead of the voice.
   - Verify with stills at word onsets (`research/production_notes.md`).
10. **Lyrics live inside the image, differently per scene.** Behind the character (depth-sorted with `destination-out`), as feature-dashboard token highlights, as attribution-graph nodes, as logit-lens rows, stamped on lab forms, handwritten in the margin for the quiet verse (Golden's mirror, 1:40).
11. **Fixed type voices, never mixed within a word.**
    - Anton or Big Shoulders 900 for hooks.
    - JetBrains Mono for the model and the HUD.
    - Newsreader or Fraunces Italic (low optical size) for whispers.
    - Shantell Sans for the researcher's notes.
    - Black Han Sans or Nanum Pen Script for Hangul.

    Run a glyph-coverage check on every string (Bebas, League Gothic and Anybody lack ↓).
12. **Design for 360p and X compression.** Strokes ≥3 px at 1080p, halftone pitch ≥4 px, grain features ≥2 px, contrast ≥4.5:1; judge print quality on PNGs, not on the encode.
13. **Real inks, physical compositing.**
    - 3–4 inks per scene from the Riso list (Federal Blue `#3D5588`, Fluorescent Pink `#FF48B0`, Orange `#FF6C2F`, Sunflower `#FFB511`, Teal `#00838A`) on cream `#F2EDE3`.
    - Every pixel = paper × Π(ink^coverage).
    - Darks are overprints (blue × pink = aubergine); no pure black or white, no gradients except dot ramps.
    - Test: unique colours ≤ 2^N before grain.
14. **Paint plates as monochrome coverage and colourise in one post-pass,** because p5.brush mixes by Kubelka–Munk (paint), not by overprint. Use knockouts (`destination-out`) for bright-over-dark.
15. **Registration per plate per shot, never per frame.** σ 1.5–3 px, key plate at 0, 0.05–0.1° rotation; small text is never misregistered.
16. **Screens and paper are anchored to the page and baked once.**
    - Nothing crawls with objects.
    - Lines boil on twos (12 fps); held elements cycle 3–5 seeds at 1–2.5 px; fills and screens hold.
    - Characters on twos, camera on ones, accents on threes.
17. **The base clip never reaches the renderer.**
    - A Python pre-pass writes masks (SAM 2.1), centreline strokes (lineart_anime or XDoG → skeleton → RDP), a per-region ink vote per shot, and landmarks where they work (~55 KB per drawing).
    - JS redraws from that data only; a code check fails the build if a base frame is loaded.
18. **Mouths come from the lyric alignment** (phonemes → 6–9 mouth shapes on twos), not landmarks. MediaPipe found 0 of 14 anime faces. Pin `mediapipe==1.0.0` on the Mac and crop heads for semi-real footage.
19. **Prompt Seedance for traceability.** Flat anime shading, solid costume colours that match each member's ink, plain separable backgrounds, simple hands. Redraw backgrounds as static plates; reject clips whose masks disagree (agreement below 0.8) across frames.
20. **Redraw interp figures from the originals, with their own conventions.**
    - Lower-triangular attention with labelled axes; induction stripe at q − (n − 1).
    - Pentagon = 5 features at 90% sparsity.
    - "Features", not "neurons"; attribution nodes are CLT features.
    - Golden Gate = SAE feature 34M/31164353 clamped at 10×.
    - One colour convention per shot (Neuronpedia green/red, Anthropic-2023 blue/red, attribution green/purple).
21. **Use the most recognisable idioms as sets and make them move on the beat.** Dashboard histogram pumps on the kick; graph lights one hop per beat; the "+2×" stamp lands on the downbeat; pentagon arrows spring 2 → 4 → 5; the grokking clock ticks; the J-lens readout bars fill.
22. **Two to three reference layers per shot, each tied to a ledger entry and fact-checked.** Invent new gags. Retire the wave's clichés: von Neumann under a sheet, paperclip island, police-cap clouds, the "You're absolutely right" wall, the smiley shoggoth, the BERT `[MASK]` board.
23. **Freeze-frame bait.** Real feature IDs, head numbers, tiny footnotes and correct numbers in small type that rewards pausing, the mechanism behind the reference's 10.8k bookmarks and K-pop lore culture. None of it may be needed to follow the song.
24. **Keep the contrast and the arc.** A cheerful riso idol animating serious interp, a stop-time killing part, and the K-pop outro:
    - a line-up facing the lens, and the bow;
    - the title wordmark;
    - a mock label ident;
    - a 3–5 s silent tail with one post-credit gag;
    - a hand-drawn signed end card that rhymes with the opening.
25. **Be honest and helpful in the framing.** An end-card URL or companion page that explains every reference; credit the kits and the papers; "personal project, not affiliated"; no "one prompt" claims, no photoreal real people, no invented tweets, and never over 2:19.

---

## Sources

The main sources are inline. Additional ones by section follow. All were accessed 2026-09-29 or 2026-09-30.

**§1 K-pop.**
- Measured MVs are listed by YouTube ID in the §1.1 table. Additionally observed:
  - DDU-DU DDU-DU `IHNzOHi8sJs`
  - Pink Venom `gQlMMD8auMs`
  - Hype Boy Perf. ver.1 `11cta61wi0g`
  - OMG `_ZAgIHmHLdc`
  - How Sweet `Q3K0TOvTOno`
  - Dirty Work `M2WTUoy4y6E`
  - Butter `WMweEpGlu_U`
  - S-Class `JsOOis4bBFg`
  - Chk Chk Boom `0P0aQreFs8w`
  - The Chase `kxUA2wwYiME`
  - DRIP `Zp-Jhuhq0bQ`
  - Easy `bNKXxwOQYB8`
  - Crazy `n6B5gQXlB-0`
- Directors:
  - "Attention", "Super Shy" and "How Sweet": Shin Hee-won.
  - "Ditto", "OMG" and "Cool With You": Shin Woo-seok / Dolphiners Films.
  - "Hype Boy": Dongle Shin.
  - Source: [NewJeans videography](https://en.wikipedia.org/wiki/NewJeans_videography).
- Articles:
  - [KpopStarz killing parts](https://www.kpopstarz.com/articles/309462/20221006/4-most-iconic-killing-parts-kpop-songs.htm)
  - [Weverse Magazine](https://magazine.weverse.io/article/view/1047?lang=en)
  - [Korea.net on Rigend](https://www.korea.net/NewsFocus/HonoraryReporters/view?articleId=207348)
  - [EnVi on Rigend](https://envimedia.co/creative-spotlight-rigend-gets-in-depth-on-the-magic-of-music-videos/)
  - [Adobe Korea, Hong Won-ki](https://blog.adobe.com/ko/publish/2021/02/25/cc-series-director-hong-interview)
  - [The KO News on Ditto](https://thekonews.org/2024/10/nostalgia-longing-and-parasociality-how-newjeanss-ditto-changed-k-pop-forever/)
  - [Any Song](https://en.wikipedia.org/wiki/Any_Song)
  - [Super Shy](https://en.wikipedia.org/wiki/Super_Shy)
  - [Supernova](https://en.wikipedia.org/wiki/Supernova_(Aespa_song))
  - [Next Level](https://en.wikipedia.org/wiki/Next_Level_(Aespa_song))
- Academic:
  - Broadwell & Tangherlini 2021, *DHQ* ([doi](https://doi.org/10.63744/4k3crzxsq9ea))
  - Abidin & Lee 2023 ([doi](https://doi.org/10.1177/1329878x231186445))
  - Chen 2023 ([doi](https://doi.org/10.1051/shsconf/202317403024))
- Unverified snippets: a claimed K-pop average of "0.89 s per cut" (our measured medians are 0.62–2.13 s).

**§2 Type.**
- MDN pages: [font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font), [letterSpacing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/letterSpacing), [filter](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter), [globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation).
- Libraries and tools: [opentype.js](https://github.com/opentypejs/opentype.js/blob/master/README.md), [fontTools instancer](https://fonttools.readthedocs.io/en/latest/varLib/instancer.html), [p5 textWeight](https://p5js.org/reference/p5/textWeight/), [easings.net](https://github.com/ai/easings.net), [google/fonts](https://github.com/google/fonts).
- Studios and titles: [Studio Dumbar Google Sans Flex](https://studiodumbar.com/work/google-sans-flex), [DIA](https://www.itsnicethat.com/features/dia-mitch-paone-meg-donohoe-graphic-design-animation-typography-180918), [Zombieland titles](https://www.artofthetitle.com/title/zombieland/).
- K-pop and Korean captions: [It's Nice That on K-pop design](https://www.itsnicethat.com/articles/the-view-from-seoul-k-pop-graphic-design-200225), [Fonts In Use: Chuu](https://fontsinuse.com/uses/66843/chuu-dear-santa-music-video), [Korean Story on variety captions](https://en.koreanstory.net/2025/04/07/the-magic-of-laughter-and-editing-the-unique-charm-of-korean-variety-shows-captivating-the-world/).
- Other: [Apple Music Sing](https://www.apple.com/newsroom/2022/12/apple-introduces-apple-music-sing/), [LRC format](https://en.wikipedia.org/wiki/LRC_(file_format)), [Verso](https://github.com/AkkiCode06/verso).

**§3 Riso.**
- Stencil.wiki: [Riso inks](https://stencil.wiki/wiki/Category:Riso_inks), [colour separation](https://www.stencil.wiki/wiki/Color_separation).
- Print guides: [Secret Riso Club](https://secretrisoclub.com/Riso-Basics), [Fontstand primer](https://fontstand.com/news/essays/a-riso-printing-primer/), [Friends & Neighbors textures](https://www.friendsandneighborssf.com/print-textures), [Exploriso grained separations](https://en.exploriso.info/exploriso/printing/printing-grained-colour-separations/).
- Code and design: [canvas-sketch](https://github.com/mattdesl/canvas-sketch), [spectral.js](https://github.com/rvanwijnen/spectral.js), [Mixbox](https://github.com/scrtwpns/mixbox) (CC BY-NC), [Gokce Taskan: risograph](https://gokcetaskan.com/artofcode/risograph), [Mitchells vs the Machines test](https://beforesandafters.com/2021/04/29/behind-the-early-2d-3d-test-for-the-mitchells-vs-the-machines/), [AI event posters](https://john.hartnup.uk/2026/06/07/ai-event-posters.html).
- p5 and browser docs: [p5 createFilterShader](https://beta.p5js.org/reference/p5/createFilterShader/), [HTML canvas spec](https://html.spec.whatwg.org/multipage/canvas.html).
- Paper: [Poly Haven licence](https://polyhaven.com/license).

**§4 Rotoscoping.**
- Line extraction: [TEED](https://github.com/xavysp/TEED), [DexiNed](https://github.com/xavysp/DexiNed), [controlnet_aux](https://github.com/huggingface/controlnet_aux).
- Vectorising and landmarks: [VTracer](https://github.com/visioncortex/vtracer), [Virtual Sketching](https://github.com/MarkMoHR/virtual_sketching), [MediaPipe](https://github.com/google-ai-edge/mediapipe), [DWPose](https://github.com/IDEA-Research/DWPose).
- Masks and lip sync: [SAM 3](https://github.com/facebookresearch/sam3), [BiRefNet](https://github.com/ZhengPeng7/BiRefNet), [anime-segmentation](https://github.com/SkyTNT/anime-segmentation), [Rhubarb](https://github.com/DanielSWolf/rhubarb-lip-sync).
- Flow and restyling: [RAFT](https://github.com/princeton-vl/RAFT), [EbSynth](https://ebsynth.com), [Runway Aleph](https://runway.com/research/introducing-runway-aleph), [FLUX Video Edit](https://docs.bfl.ml/flux_tools/flux_video_edit.md).
- Painterly video: [Hertzmann & Perlin](https://mrl.cs.nyu.edu/publications/painterly-video/).
- Precedents: [Take On Me](https://en.wikipedia.org/wiki/Take_On_Me), [Rotoshop](https://en.wikipedia.org/wiki/Rotoshop).

**§5 Interp.**
- Distill: [Feature Visualization](https://distill.pub/2017/feature-visualization/), [Building Blocks](https://distill.pub/2018/building-blocks/), [Activation Atlas](https://distill.pub/2019/activation-atlas/), [Multimodal Neurons](https://distill.pub/2021/multimodal-neurons/), [Curve Detectors](https://distill.pub/2020/circuits/curve-detectors/), [Branch Specialization](https://distill.pub/2020/circuits/branch-specialization/).
- Anthropic and Neuronpedia: [open-source circuit tracing](https://www.anthropic.com/research/open-source-circuit-tracing), [circuit-tracer](https://github.com/safety-research/circuit-tracer), [Neuronpedia source](https://github.com/hijohnnylin/neuronpedia), [Gemma Scope 2](https://www.neuronpedia.org/gemma-scope-2).
- Papers: [refusal direction (AF)](https://www.alignmentforum.org/posts/jGuXSZgv6qfdhMCuJ/refusal-in-llms-is-mediated-by-a-single-direction), [linear representation hypothesis](https://arxiv.org/pdf/2311.03658).
- Explainers and memes: [3b1b lessons](https://www.3blue1brown.com/lessons/gpt), [Goodfire Paint with Ember](https://goodfire.com/papers/painting-with-concepts), [Transluce neuron descriptions](https://transluce.org/neuron-descriptions), [KYM shoggoth](https://knowyourmeme.com/memes/shoggoth-with-smiley-face-artificial-intelligence).

**§6 Wave.**
- Local: `research/reference_video.md`, `refs/x_audit/x_audit.md` §(e), `refs/web_audit_2026.md` §5a.
- Repos: [Functional Emotions repo](https://github.com/ledbetterljoshua/functional-emotions-video) (MIT), [makevoid skill](https://github.com/makevoid/motion-graphics-music-video-skill) (MIT), [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) (MIT).
- Article: [radneurons on Opus 5.5 music videos](https://www.radneurons.com/claude-opus-5-5-now-makes-music-videos/).
