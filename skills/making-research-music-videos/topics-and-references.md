# Stage 0: Topic, spine and references

Do this before writing a lyric. From the brief (Neel's, for the first song): "Do a ton of research before you write
anything. Your knowledge of the last year of papers, models and memes is out of date, so verify rather than recall,
and read my recent papers, not just their titles… Keep a ledger of every reference you might use, with a source for
each." The audience "will pause the video, check your references, and love you for getting them exactly right."

## Contents
- [The reference mix](#the-reference-mix)
- [Research fan-out (delegate all of it)](#research-fan-out-delegate-all-of-it)
- [Commissioner-specific sources (example: Neel)](#commissioner-specific-sources-example-neel)
- [The ledger, the digest, and the NOT list](#the-ledger-the-digest-and-the-not-list)
- [Verification](#verification)
- [Topic packs: interp, AI safety, effective altruism, anything else](#topic-packs-interp-ai-safety-effective-altruism-anything-else)
- [Sensitive material and standing rules](#sensitive-material-and-standing-rules)
- [How references are spent: lyric vs screen](#how-references-are-spent-lyric-vs-screen)
- [One reference record for everything downstream](#one-reference-record-for-everything-downstream)

---

## The reference mix
Target: absurdly dense, every item accurate, every item tied to a lyric line. Lean on **the commissioner's own work
and their students' or team's work wherever it genuinely fits** (they will notice and love it; for the first song,
Neel's papers and his MATS scholars'), but the bulk should be the whole field: the canon, the famous results, the
people's in-jokes, the memes, the recent zeitgeist, and the wider AI-safety culture. Neel's own steer: "dense with
references, details and in-jokes, especially to Neel and Anthropic's interp papers, but also to in jokes, AI safety
ideas and memes". Credit first authors (a MATS paper is "Hua & Qin's paper", not "Neel's paper"). The final interp
video had 177 eggs over 67 shots, with 73 of Neel's 134 papers/posts given a cameo.

## Research fan-out (delegate all of it)
Launch these as parallel background agents in the first hour (fresh agents with written briefs, one schema), while
you plan. All of them were asked for LATER in the first project and retrofitted at cost; do them up front:
1. **The commissioner's flagship work on the topic**: close reads of their last ~18 months of relevant papers/posts.
2. **The commissioner's full coverage table** (research topics; for movements see Commissioner-specific sources):
   every arXiv paper where they are first, second, penultimate or last author (arXiv
   API, filtered by author position) merged with its announcement post (Alignment Forum GraphQL), one row each, with a
   proposed cameo per row. First project: 134 rows. Track status with `tools/paper_cameos.py` (in / new / none + where
   or why). "If it can't come up with anything that isn't really shoehorned then that's fine."
3. **The commissioner's reading lists, guides and how-to posts** for the topic (Neel's 2022/2024 mech interp reading
   lists and "How To Become A Mech Interp Researcher" gave Linear Algebra Done Right, rabbit holes and the 5-minute
   timer).
4. **The canon**: classics, key results, people, adjacent safety work, ~100 entries.
5. **A web audit of the last ~3 months**: what's new, a top-15 zeitgeist list, and a "Things to NOT say" list.
6. **An X audit in the commissioner's logged-in browser, read-only, human-scale, ACROSS ERAS** (not just the last
   quarter: the first project's tweet candidates had gaps at the big historical moments). X returned 402 to plain web
   fetches; drive a real browser. Save tweets by URL to a JSONL file so nothing is ever typed by hand.
7. **The culture pass**: in-jokes, memes and common ideas of the community ("Emphasise AI safety in-jokes and common
   ideas that might be a bit humorous to include not AI safety jokes specifically"). First project's picks that Neel
   added: a dead fire alarm with cobwebs (no fire alarm for AGI), Clippy, a honeypot, a shoggoth tentacle,
   SolidGoldMagikarp, the bliss attractor, sleeper agents, CLIP's iPod apple, R1's aha moment, a chocolate lasagna.
8. **Targeted deep reads** whenever a lyric line or shot needs specifics (e.g. "have a subagent read the paper").
WebSearch quota can run out mid-research; tell agents to fall back to primary APIs (arXiv, AF GraphQL, EA Forum
GraphQL) and saved sources.

## Commissioner-specific sources (example: Neel)
Ask the commissioner at kickoff where their own records live. For the first song these were:
- **The commissioner's publication list**: the year's papers and posts with verified links and lead authors.
- **A list of their mentees' papers**: mentors, mentees, venues, citation counts.
- **Their tweet archive** (Neel's covered Nov 2025 – Jul 2026 only); the X audit covers the rest.
- arXiv API (author position) and Alignment Forum GraphQL (plain requests get 403; use GraphQL). Neel's posts are
  linked via alignmentforum.org, never lesswrong.com (LessWrong-only posts by others may use lesswrong.com).
- Their catchphrases and voice, e.g. Neel's "Turns out it kinda works!" (about the constitution, not interp — caption
  quotes in their true context), "Just do what works", "Is this really mech interp? / No, probably not. But that's the
  wrong question.", "CoT is our best current tool", "kind of my job".
- **For a topic outside their research, find the commissioner's connection to it rather than recalling it**: search
  their blog, EA Forum and Alignment Forum profiles (both have GraphQL APIs), podcast appearances, recorded talks and
  their tweets across all years, and ask them once at kickoff ("anything of yours or your students' you'd like in, or
  kept out?"). A publication list covers research only (Neel's had no EA hits), and the arXiv author-position
  coverage table only fits research topics: for movements and communities expect a handful of personal cameos, let
  the commissioner tap which ones they're comfortable with (ties to a movement can be personal), and never imply an
  affiliation of theirs or their employer's. Never assert a biographical fact about them without a source.
- **Link rule** (Neel's; ask yours): his AI posts via alignmentforum.org (also when cross-posted to the EA Forum);
  EA-only posts via forum.effectivealtruism.org; never lesswrong.com for his posts (LessWrong-only posts by others may
  use it).
- **Treat the commissioner's own notes and suggestions as unverified too**: Neel's starting reference bank needed 48
  corrections, and a suggested example ("pink elephants") was not the paper's.
- Taste rulings live in your project memory / notes file (lyric, music, video density, feedback style); for a
  returning commissioner, copy the relevant ones into the new project on day one.

## The ledger, the digest, and the NOT list
- **Schema** (`refs/SCHEMA.md`), one per entry: What / Source / Credit / Verified
  (yes/partial/no) / Exact facts (verbatim, ≤25 words) / Obscurity 1–5 / Lyric seeds / Visual seeds / Pronunciation /
  Cautions.
- **Ledger** (one markdown file): all rows merged (first project: 296), with `[OFF-LIMITS]` flags.
- **Digest for writers and judges** (a second file, ~7k words): opens "These facts post-date some judges'
  training data; treat them as verified ground truth."; model names as of today; verbatim facts; a **"NOT:" wrong
  version** beside each trap (e.g. which experiment a quote really belongs to); "Phrases that are NOT verbatim
  quotes"; the off-limits list; appended "Corrections" sections each round.
- **Never write an unverified fact into the digest or a writer's brief.** One mis-paired quote produced 6
  high-severity errors across 4 drafts.

## Verification
- A **fresh fact-check agent every round** of lyrics and every version of the video's eggs ("You did not write
  these"): every claim, every quote mark must enclose verbatim text, every attribution, every year; high/medium/low
  findings plus "Corrections to the fact sheet". Fix at the source.
- **Quote checker** over saved primary sources: `refs/round2/sources/verify_quotes.py` (+ `html2txt.py`).
- **Chronology audit** of every on-screen item against the year stamp, before the commissioner sees a cut.
- **Record a ruling only with the commissioner's quote and timestamp.** A "Neel retired paperclips" ruling was
  invented by an agent and blocked an idea he later added.
- **Flag, then let them decide** when the commissioner asks for something you think is inaccurate (Neel asked for
  WOOD LABS on both robots after it was rejected for conflating two things).
- **Numbers drift and depend on setup.** Benchmark scores depend on shots, pass@k, compute and the human-baseline
  definition; charity cost-effectiveness figures, pledge counts and risk estimates change year to year. Every number
  carries its date and conditions in the ledger, must match the year stamp where it appears, and is never compared
  across labs or setups unless the source does.
- **Judges have priors.** On a contested topic (EA after 2022, a lab with a controversy) the judges' picture comes from
  press coverage; they will push to moralise or to name the controversy. Put the agreed treatment in their brief and
  tell them not to "fix" it.
- **Held-out test items** (benchmark questions marked do-not-train) stay off screen; ask before putting a canary string
  in any public doc.

## Topic packs: interp, AI safety, effective altruism, anything else
Each pack is a STARTING list for the research agents to verify and extend — every date and attribution must be
checked against a primary source before use. Pick a spine per topic (lyrics.md "Choosing the song's spine"); the
chronology spine is the default, not a rule.

**Interpretability (done: "Don't Go Quiet On Me").** Eras used: early vision circuits (Zoom In 2020) → superposition
and grokking (2022) → ChatGPT and talking models (Nov 2022) → SAEs and Golden Gate Claude (2023–24) → the pragmatic turn
and probes (2025) → chain of thought and reasoning models (o1, Sep 2024) → eval awareness (2025) → reading what models
won't say (J-Lens, activation oracles, NLAs, 2026) → model forensics (2026) → opaque reasoning (GPT-6 Astra, 2026). Final
lyric in `lyrics/final/`, shot list in `video/kit/src/data/dgq_shots.js`, reference page in `docs/`
(https://neelnanda-io.github.io/dont-go-quiet-on-me/). Don't reuse its lines; do reuse the craft.

**AI safety (likely next).** Candidate eras: early warnings (Turing's 1951 remarks; I. J. Good's 1965 intelligence
explosion; Asimov's laws as the fictional prehistory) → the rationalist/x-risk founding era (the Singularity Institute
/ MIRI, the Sequences, LessWrong) → Superintelligence and the paperclip maximiser → deep learning arrives (Concrete
Problems in AI Safety, RLHF) → scaling (GPT-2 "too dangerous to release", GPT-3, scaling laws) → the ChatGPT moment
and the shoggoth meme → the 2023 statements and summits → model organisms and empirical alignment (sleeper agents,
alignment faking, eval awareness, reward hacking) → control, monitoring, and the race to AGI → the future year slam.
Commissioner angles to check (for Neel: mech interp as a safety agenda, pragmatic interpretability, MATS, CoT
monitoring, his AF posts on the alignment landscape). Memes: the shoggoth with a smiley face, paperclips, "you're
absolutely right!", the fire alarm, p(doom), the basilisk, "we're so back / it's so over", FOOM, Clippy, "just train
it to be nice". Motif ideas: a creature outgrowing its keeper, a dam, a chess opponent that keeps growing, a
cartographer racing a moving coastline.

**Effective altruism (likely next).** Candidate eras: the drowning child (Singer, "Famine, Affluence, and Morality",
1972) → GiveWell and Giving What We Can (late 2000s) → the name "effective altruism" and 80,000 Hours (early 2010s) →
earning to give, Doing Good Better, malaria nets and deworming debates, cost-effectiveness spreadsheets, QALYs/DALYs,
the importance/tractability/neglectedness framework → Open Philanthropy and growth of the movement → longtermism, The
Precipice, What We Owe the Future → x-risk and AI safety becoming central → animal welfare (cage-free campaigns, shrimp
welfare as an in-joke) → the 2022 crisis and its aftermath (handle per the sensitivity rules below) → where it is now.
Candidate memes and in-jokes, all UNVERIFIED until a research agent sources them: the 10% pledge, "bed nets",
spreadsheets of utils, utilons vs fuzzies, "scope insensitivity" (the birds), "Pascal's mugging", Fermi estimates,
"epistemic status:", 10,000-word Forum posts, EAG (lanyards, one-on-ones), the drowning-child pond, hits-based giving,
funging/counterfactuals, the repugnant conclusion. Sources: the EA Forum (it has a GraphQL API like LessWrong's),
80,000 Hours, GiveWell's reports, Giving What We Can, Open Philanthropy (check its current name) grant pages, the books
themselves. Commissioner angles: search for their EA involvement before assuming any. **Spine idea that is creative AND
chronological**: the widening pond, Singer's pond growing ring by ring (a stranger's child → a village under nets →
hens and shrimp → people not yet born → the minds we're building), i.e. the expanding moral circle, so the year stamp,
chapters and description still work. Decide explicitly who "you" is (the movement, the child, future people, the
donated dollar). Motif ideas: the pond, a ledger whose columns multiply, one net becoming a canopy, a lighthouse; EAG
lanyard profiles as the K-pop member-card layer (archetypes, never real people). Tone: sincere where people were hurt
or helped; the jokes are about the community's own habits (spreadsheets, long posts, Fermi estimates), never about
beneficiaries; never rank cause areas against each other; no graphic factory-farm imagery.

**Other topics need the same pass for their own traps.** For example an **AI evaluations** song: Clever Hans and the
Turing test as prehistory, benchmark saturation, Goodhart, contamination, setup-dependent scores, eval awareness
(and its overlap with "Don't Go Quiet On Me": seed the FORBID list).

**Anything else** (a lab's history, a subfield, MATS itself, a book, a person's career): same machinery. Ask the
commissioner at kickoff for the audience, the tone, any must-haves and any no-go areas; build the era map with a research agent;
then propose 3–5 spines.

## Sensitive material and standing rules
From the first brief and its production notes, binding by default:
- "Keep it affectionate, clever, and optimistic but clear-eyed. Punch at ideas, never at people."
- Redraw figures with credit; never invent a tweet; every tweet used is real, pulled by URL, and approved by the
  commissioner.
- No realistic likenesses (the commissioner only as a stylised cameo they choose, e.g. Neel's "NN" mug); lab names,
  never logos.
- Keep out company drama, NDAs, equity and politics. For topics where drama IS history (EA's 2022 crisis, lab board
  fights, political fights over AI policy), **raise it in the kickoff message with options and a default, and don't
  block on it**: e.g. (a) leave it out, (b) one oblique line and image about the lesson, no names or logos (a sensible
  default), (c) a verse that reckons with it. Proceed with the default; if they haven't answered by the lyric
  checkpoint, show each finalist with and without the line so their pick answers it. A research agent can build a neutral sourced
  timeline of the episode for the lead's fact-checking only; writers don't see it. Aim at ideas and lessons, never
  individuals; no living people as punchlines.
- Redraw images (book covers become titles on spines, photos become drawings); don't paste photos or cover art you
  have no licence for. This applies to "straight assets" in the internet-brutalism style too (tweets are screenshots
  of real posts by URL; figures are redrawn with credit).
- Nothing internal or unannounced from the commissioner's employer or anyone else; public sources only.
- Refused-by-classifier material (bio/chem hazard specifics) stays out entirely.
- On-screen vocabulary follows the commissioner's preferences (Neel: "latent", not "feature", for interp; ask for the
  topic's equivalents).

## How references are spent: lyric vs screen
- **Lyric**: density of MEANING — an accurate idea inside an image ("you packed five secrets into two"). No paper
  lists, no on-the-nose names or numbers.
- **Screen**: density of NAMES — 1–4 eggs per shot, each justified by its lyric line; headline references held ~1.5 s;
  background eggs can flash; the source's title only (paper, book, post, report), small, bottom-left; no punchline
  before it's sung.
- **Companion doc**: everything, with sources (publishing.md).

## One reference record for everything downstream
Keep one record per reference (shot, time, what's drawn, source link, verbatim quote, verification status, "things
to spot" line) and GENERATE the shot list's `eggs`, the review page's spot list, the public reference doc and the
YouTube description from it. In the first project `eggs` and the page's `SPOT` list drifted apart (a stale egg, a
removed line still described). Write every line in the **third person** ("Neel's post") from the start; the public
doc needed 28 hand replacements of "your".
