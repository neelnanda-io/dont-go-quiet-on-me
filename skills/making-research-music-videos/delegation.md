# Delegation playbook

Delegate aggressively. The lead is the **author, coordinator and keeper of the commissioner's taste**: it holds the brief, the
sources of truth and the decisions. Everything else — research, variety, verification, paper reading, reference
mining, scene sections, mock-ups, long render/check loops — goes to subagents running in parallel in the background.
The first project ran 66 subagents plus one 105-agent workflow; Neel still asked three times for more ("Do you have a
sub agent coming up with new ideas?") and twice told the lead to delegate paper reading ("have a subagent read the
paper"). The brief: "spend the usage, pushing tokens aggressively but also economically, and keep an eye on it."

## Contents
- [Fresh agent or fork?](#fresh-agent-or-fork)
- [What to run, stage by stage](#what-to-run-stage-by-stage)
- [Standing agents](#standing-agents)
- [Every brief contains](#every-brief-contains)
- [Brief templates](#brief-templates)
- [Coordination rules](#coordination-rules)

---

## Fresh agent or fork?
| | Fresh agent (default) | Fork |
|---|---|---|
| Context | Only your written brief | Your whole conversation |
| Cost (first project) | 290–720k tokens, 40–160 tool calls | ~800–950k tokens each, even for a 6-tool job |
| Diversity | High (fresh agents' lyric rewrite beat the lead's own 39–8) | Low (round-2 forks shared one context and converged: "samey") |
| Use for | research, drafting, fact-checks, paper reads, reference mining, audits, mocks with a clear spec | edits that need the full history of the commissioner's notes, e.g. implementing a batch of notes inside scene files |
Write fresh briefs well (below) and you rarely need forks.

## What to run, stage by stage
| Stage | Parallel agents (background) |
|---|---|
| 0 References | commissioner flagship close reads · commissioner coverage table (arXiv author position + AF/EA Forum GraphQL) · reading lists/guides · canon · last-quarter web audit · X audit in the browser (one at a time; the browser session is single-threaded) · culture/in-jokes pass · ledger+digest builder |
| 1 Lyrics | 3–5 idea writers with different frames · finalist writers (two per concept, fresh) · fresh fact-checker per round · targeted deep reads for specific lines · sketch renderer/QA |
| 2 Audio | (Suno is one Chrome session: keep it in the lead or one agent) · transcribe-back + profile QA over all takes · Gemini describe pass · page builder |
| 3a Direction | style frames · cast options · motif prototype · tweet candidates by URL · figures/title cards/year keyframes · egg fact-check · paper-reading for imagery · brief-compliance auditor before the page goes out |
| 3b Production | section owners (one scene file each) · reference miners with new angles · mock-up agents for left-out ideas · chronology auditor · render + textcheck + Gemini-eye loop · page builder |
| 4 Publishing | stills renderer · doc builder · description builder + validator |

## Standing agents
Keep these alive across the whole project; relaunch each when it finishes, with a new angle:
1. **Ideas and references miner**: each run a different angle (one cameo per commissioner paper; their reading lists;
   field in-jokes and common ideas; memes; the topic's canon; recent zeitgeist). Each pass added 10–43 cameos.
2. **Fresh fact-checker**: every lyric round, every egg batch, before every checkpoint.
3. **Brief-compliance auditor**: before each checkpoint page goes out, a fresh agent reads the-brief.md + the project's
   PROMPT.md + the reference bank and lists every ask the page doesn't yet answer (six gaps were found only when Neel
   asked).

## Every brief contains
1. **Goal and deliverable**: the exact file path and format to write, and the final message's shape.
2. **Context files to read** (full paths), including the fact digest and the commissioner's taste notes.
3. **The operative brief passages, verbatim** from the-brief.md for creative agents (style, ambition, iteration).
4. **The commissioner's taste rules** relevant to the job, with their gold examples and their rejections.
5. **Hard rules**: verify-don't-recall, verbatim quotes from sources opened this session, never invent a tweet, punch at
   ideas, the commissioner's link rules (for Neel, alignmentforum.org for his posts), off-limits list, budget cap.
6. **Ownership**: which files it may edit; that it must not commit, publish, or touch shared files.
7. **Report format**: per item DONE/SKIPPED, evidence (paths, quotes, links), and "for you to update" lines for the
   files the lead owns.

## Brief templates
**Research agent (Stage 0).**
"Research <angle> for a reference-dense song and music video about <topic> for an audience of <audience> who will
pause and check every reference. Your knowledge of the last year is out of date: verify everything from primary
sources opened in this session. Write entries in the schema in <SCHEMA.md> to <path>: What / Source / Credit /
Verified / Exact facts (verbatim, ≤25 words) / Obscurity 1–5 / Lyric seeds / Visual seeds / Pronunciation / Cautions.
Include a 'Things NOT to say' list (common misattributions, wrong dates, misquotes). If WebSearch fails, use the arXiv
API, Alignment Forum / EA Forum GraphQL and saved sources. Return counts and the 10 strongest entries."

**Fresh fact-checker.**
"You did not write these lyrics/eggs. Check every factual claim, every quote mark (must enclose verbatim text from the
source), every attribution and every year in <file> against primary sources. Use the traps in <digest> ('NOT:' lines).
Write high/medium/low findings with source links to <path>, then a 'Corrections to the fact sheet' section. Do not
rewrite the art; propose minimal accurate wordings."

**Lyric writer (variety by construction).**
"Write a complete lyric for <concept/narrator/frame> about <topic>. Read <digest> and <taste rules>. Your frame must
differ from the others: don't use the arc order <X>, and avoid these stock lines: <list>. Story and flow first; an
accurate idea inside an image; no on-the-nose names or numbers (put them in `## note:` for the video); no quotes of
<commissioner>. Every factual line carries `## refs` and `## note`. Respell hard jargon in `|| sung:`. Don't read other writers'
drafts. Write to <path>.lyr and report syllables per line."

**Paper reader for imagery.**
"Read <paper> in full (not the abstract). Propose 5–8 concrete, drawable images for the line '<lyric>' that a
high-context viewer would recognise as this paper, ranked, each with the verbatim passage it depicts and the paper's
own figure or example to redraw. Prefer the field's canonical picture over wordplay; no abstract metaphors."

**Reference miner (Stage 3b).**
"Angle: <e.g. every commissioner paper where they are 1st/2nd/penultimate/last author, one cameo each>. For each item propose a
cameo that fits an existing shot (see <shots.json> and the lyric), with the exact text needed on screen, the year (it
must match the year stamp at that time), risk of confusion, and the source with a verbatim quote. Rate D/A/C. If
nothing fits without shoehorning, say so with the reason. Write to <reference_bank_rN.md>."

**Section owner (scene fork or fresh agent).** Use the protocol in video-production.md ("Parallel section forks"):
named files and functions it owns, a unique name prefix, options default off, braces on every gate, no mid-line
comments, check images named by prefix, never edit files it doesn't own, no commit/frames/encode/publish/shot-list
edits, and a report with time spans, egg lines and spot tuples.

**Mock-up agent.** "Draw each idea in <list> into its shot behind `if (mock('<key>')) { … }`, off by default, so the
real video is pixel-identical with the switch off. Make the joke read at phone size (both halves iconic, a one-word
title if the shape could mislead). Report the key, the best still time and a one-line caption."

**Chronology auditor.** "For every shot in <shots.json>, list each on-screen reference's real date against the year
stamp at that time (`YEAR_TICKS`); verdict OK / Back −N / AHEAD +N / Early, with the source. Flag any punchline
object visible before its lyric is sung."

**Brief-compliance auditor.** "Read <the-brief.md>, <PROMPT.md> and <reference bank>. List every explicit ask and
whether <checkpoint page / current cut> satisfies it, with evidence. Be literal; include deliverables like options
to choose between, meters, cut-rate changes, and tests the brief requested."

## Coordination rules
- **One owner per shared file**: the lead owns the shot list, the page builders, the reference record and shared
  modules; agents send "for you to update" lines.
- **Pass the commissioner's mid-flight steers to running agents with SendMessage** (e.g. "not AI safety jokes
  specifically — in-jokes and common ideas"). Don't restart them.
- **Don't edit a tool while agents are using it** (the lead once changed the lyric audit mid-round under six forks).
- **Writers don't read each other's unfinished drafts** (round-3 writers did, and rewrote toward each other).
- **Stalled agents** (a 600 s watchdog) can be resumed with SendMessage; don't relaunch from scratch.
- **Size fan-outs to the plan's quota and make them resumable without regeneration.** A 105-agent image workflow hit
  the session limit; its resume regenerated extras and quadrupled spend; the re-login moved a page URL and broke the
  browser extension's connection. A Workflow tool, where available, may also need the user's explicit opt-in (it did
  here: "use a workflow"); otherwise use Agent calls.
- **Keep heavy loops out of the lead's context**: render + textcheck + Gemini-eye loops ran in the lead and drove four
  compactions in one day. Hand them to an agent that returns only the verdicts and image paths.
- **Never report a pending agent's results**; say it's still running.
- **Log each agent's output path in STATE.md** so a compacted lead can find it.
