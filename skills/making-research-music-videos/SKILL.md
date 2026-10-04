---
name: making-research-music-videos
description: Use when asked to make a song, pop song, ballad, music video, lyric video or animated video about a research field, paper, movement, community or idea (interpretability, AI safety, effective altruism, a lab's history, a research programme), especially a reference-dense one made for a specific person or audience who will check every reference, or when continuing such a project, e.g. writing or judging lyrics, generating Suno or ElevenLabs takes, drawing a p5.js music video, or publishing one to YouTube with chapters and a reference doc.
---

# Making reference-dense research music videos

## Overview
A three-stage project, **lyrics → audio → video**, each signed off by the commissioner (the person the song is made
for; for the first song, Neel Nanda) before the next, about a topic they care about: a catchy, sincere song sung to
the subject, so dense with accurate references that "random lines I catch on a rewatch sound great", and a
hand-drawn-in-code music video that rewards pausing. Core principle: **density of meaning in the lyric, density of
names on the screen, accuracy everywhere, and the commissioner's verdicts as cheap as a tap.**

The finished example is the "Don't Go Quiet On Me" repo (https://github.com/neelnanda-io/dont-go-quiet-on-me), a 4:22
history of mech interp made by Claude Opus 5.5 and Suno v6 for Neel Nanda: video https://youtu.be/xhTMRykVb8I,
references page https://neelnanda-io.github.io/dont-go-quiet-on-me/. **Every path in this skill is relative to the
root of that repo**; copy its tools into a new project rather than building inside it. Anything the skill describes
in words rather than by path (the reference ledger, call logs, memory notes, earlier projects) was part of the
original working directory and is not in the repo.

**Dates.** Model names, prices, plan limits and the Suno and YouTube UI notes date from October 2026. Check the
current ones before relying on them.

**Taste.** The taste notes are one commissioner's (Neel's), kept as the worked example. For a different commissioner,
keep the method and replace the verdicts with theirs as they arrive.

## Contents
- [The spirit (verbatim, from Donald Jewkes's prompt)](#the-spirit-verbatim-from-donald-jewkess-prompt)
- [The stages and gates](#the-stages-and-gates)
- [Day one](#day-one)
- [Creativity: the default and how to beat it](#creativity-the-default-and-how-to-beat-it)
- [The commissioner's taste, at a glance (worked example: Neel)](#the-commissioners-taste-at-a-glance-worked-example-neel)
- [Delegate](#delegate)
- [Budget guide (first project)](#budget-guide-first-project)
- [Red flags — stop and correct course](#red-flags--stop-and-correct-course)

Files in this skill: the-brief.md (both prompts verbatim + a kickoff template), topics-and-references.md, lyrics.md,
audio.md, suno-prompts.md (every Suno prompt with verdicts), video-direction.md, video-production.md,
publishing.md, feedback-and-pages.md, delegation.md, lessons.md.

---

## The spirit (verbatim, from Donald Jewkes's prompt)
These words started it; keep them as the operating standard and paste them into creative subagents' briefs. Both full
prompts, and a kickoff template for a new topic, are in the-brief.md.

> think and feel very deeply about what is the best way to visually represent all of the lyrics on screen. You do not need to anchor to the current style, you can do truly anything that you think might best let you visually express yourself, including abstract motion graphics.

> I want you to make a new music video that has beautifully rendered JavaScript animations with a papery feel in a similar style to the reference that is created, but push the aesthetics in any direction you want and consider what is part of the modern zeitgeist.

> Also, think about your current capabilities and what is realistic for you to be able to do.

> I think you should be mindful of aesthetics here, and I don't want you to produce something that is GPT slop. Instead, I'd be more impressed if you come up with a coherent style

> I wouldn't fit too heavily to Pixar. I think it's kind of slop. Think critically about what is relevant here and what would be fun, and also perform well on Twitter as far as an aesthetic.

> Think like a regular music video where you have some inserts that are done independently and don't have the characters in them, or you see the characters doing something else entirely different.

> You can also just take straight assets and insert things into the video in an internet brutalism style. You should feel very creatively free in order to do what you want here, but try and anchor to visual references that people will be able to understand.

> We need a very strong, compelling visual hook that gets people excited and appreciates the work that you've done here really quickly. You can also just go and study other music videos and understand what they've done really well. I think that K-pop is probably one of the best examples that we can pull from, and thinking about how they direct human attention and manage human psychology in the way that they use visual patterns.

> I think too, we want to think about how to retain attention, and one of the best ways to do this is through text on screen.

> You want to have some variance, so sometimes I think lyrics will just appear more like subtitles, and then other times they're going to be really present and really big.

> Overall, I just really want to emphasize how amazing you are as an agent and a language model, and now a visual reasoning system. Your capabilities are far beyond what you understand, and I want you to have this mindset as you're going through this entire process.

> Remember, you can really do anything here. The goal is to make a banger for Twitter, and the stretch goal is to make something better than anyone's ever seen before. I think that what I would remind you of is that sometimes when things cohere together, it can be jarring or abrasive because the thought work has not been done beforehand in order for everything to mesh cleanly. You need to be really rigorous in planning of composition and timing to make sure this goes well.

> You also need to be open to going back and revisiting things in order to be able to reiterate. You're going to want to watch the entire video multiple times, take screenshots at individual parts, and think about if something is really up to the bar of quality that we need here. I trust that you can do this, and I think that it's really important to nail the style of animations.

> make no mistakes.

## The stages and gates
| Stage | Deliverable | Gate | Read |
|---|---|---|---|
| 0 Topic & references | Research fan-out → ledger + fact digest with NOT lists; commissioner coverage table; era map; 3–5 candidate spines | none (feeds 1) | topics-and-references.md |
| 1 Lyrics | ~100 ideas → judged → 5 varied finalists with annotated refs and sung chorus sketches → page | **Commissioner picks / mixes** (expect ~3 rounds) | lyrics.md |
| 2 Audio | Suno takes in many styles (ElevenLabs as comparison) → they thumb → master + word timings + beat grid | **Commissioner picks a take** | audio.md, suno-prompts.md |
| 3a Video direction | Style options (animated), characters, motif, finished hook, full animatic with timecode, shot list as data | **Commissioner approves direction** | video-direction.md |
| 3b Production | Every shot final, dense eggs, QA loops, notes rounds, left-out ideas as mocks | their notes until they stop | video-production.md |
| 4 Publishing | Final page, unlisted 1440p YouTube with AI label, description with era chapters + lyrics, public reference doc | their "upload" | publishing.md |
Cross-cutting: feedback-and-pages.md (how to get verdicts), delegation.md (who does what), lessons.md (ranked).

## Day one
1. **A new project directory** (e.g. `<topic>-song/`) with git, a `project_memory.md`, a `STATE.md` (headed "re-read
   after any context compaction"), a `PROMPT.md` (fill Part 3 of the-brief.md) and a `.gitignore` for media. Copy the
   tools named in each stage file from this repo (lyrics: `tools/llm.py`, `tools/judges.py`, `tools/lyricfmt.py`,
   `tools/syllables.py`, `tools/r2_audit.py`, `tools/vocal_qa.py`, the page builders; audio: `tools/suno_prep.py`,
   `audio/suno/UI_NOTES.md`, the QA/alignment/beat tools; video: the whole `video/kit/`, `tools/render_mocks.py`,
   `tools/build_final_page.py`). If your agent keeps per-project memory keyed by the working directory, run the
   session from the new project directory; if the commissioner launched you elsewhere, say so.
2. **Start the commissioner's taste notes** in your project memory / notes file, one note per area (lyric taste,
   music taste, video density, feedback style, dictation bleed, reading pages on a phone). For a returning
   commissioner, copy their notes from the last project; for a new one, seed them from their kickoff answers and use
   the worked example below as the list of questions the notes need to answer.
3. **Kickoff questions to the commissioner in ONE message, each with a stated default, then start work without
   waiting** (so "defaults are fine" is a complete reply): audience and tone; sequel or standalone (callbacks to
   earlier videos, or fresh ground only); who the song is sung to; must-haves and no-go areas, with your proposed
   treatment of any scandal or politics; anything of theirs (or their students' or team's) they want in (for topics
   outside their own work, expect few); vocabulary they like or hate; a picture they have in mind for the video; what
   the budget covers (default: API spend only, not Suno/ElevenLabs subscription credits or Claude tokens);
   pre-approval for Suno downloads within the account's remaining monthly count (check it first) and for image spend.
4. **Launch the Stage 0 research fan-out** (delegation.md) in the first hour.
5. **Check your browser-automation extension** (e.g. Claude in Chrome) is connected to this session and signed in to
   the right accounts while the commissioner is at the laptop.
6. **If this is a sequel**, seed the lyric audit's FORBID list with every line of the earlier songs and their eggs,
   and run the overlap check against them, unless the commissioner asked for callbacks.

## Creativity: the default and how to beat it
The default that worked: a love song to the subject told as a **chronology, one era or subfield per verse**, with a
fixed chorus whose third line gets a new payload each time, a stop-time "killing part", spoken/backing-vocal
undercuts, a nameless parable bridge and a cut-off last word; on screen, **one world the camera travels through**, a
year stamp that ticks on sung words, a procedural motif whose state steps up each chorus, and a strong hook. **Treat
this as the control, not the answer.** Generate genuinely different spines (a duet between camps, the subject singing
back, one person's arc, a musical-theatre "I want" song, a list song, a mock epic, a court case, a lullaby) and
different visual worlds (a ledger, a ship's log, a herbarium, a case file, a lighthouse, cut paper, riso, an
exhibition catalogue), have the judges pick a varied three, and show the commissioner real artefacts of each. Topic
packs for interp, AI safety and effective altruism are in topics-and-references.md.

## The commissioner's taste, at a glance (worked example: Neel)
These are Neel Nanda's verdicts from the first song. They are not laws for every commissioner, but each one names a
question to settle with yours early, and most generalise.
- **Lyrics**: story and flow over density; poetic over literal ("you packed five secrets into two" = gold); nothing
  on the nose; no self-quotes; variety across options; every line understandable without a footnote.
- **Music**: for the interp song he chose sincere and a little sad, "not too dramatic. Not making it sound funny"
  (the cinematic orchestral ballad, female lead; runner-up a cappella multitrack, one male voice). That was a verdict
  on one song, not a law: for a song meant to be catchy or upbeat, generate upbeat styles too and let his listening
  decide. What has held: the humour lives in the words and pictures; the music isn't comic unless the song is meant
  to be a comedy; his post-listening verdicts beat his pre-listening guesses. He loves musical theatre.
- **Video**: "classy but reference dense in a way that rewards an in group viewer"; dense and busy "so long as the
  viewer can ignore details"; accurate years; no spoilers; canonical images over wordplay; concrete scenes over
  metaphors; headline references ~1.5 s on screen; joke props big. **Text on screen, one rule**: lyrics may be big and
  present (Donald's attention device, strongest in the hook); reference text stays minimal (a source's title only,
  small, bottom-left; citations live in the companion doc).
- **Tone per topic**: density comes from the community's own habits and in-jokes; never make jokes at the expense of
  victims or beneficiaries (people in poverty, animals, those hurt by a scandal); keep graphic content out.
- **Feedback**: taps and pictures, phone-legible, timestamps, one question at a time; never faint strikethrough.
- **Standing rules**: verify, don't recall; never invent a tweet; redraw figures with credit; punch at ideas, never
  at people; no realistic likenesses, lab names not logos; redraw images rather than pasting photos or cover art you
  have no licence for; no company drama, NDAs, equity or politics without asking; link the commissioner's posts where
  they want them linked (Neel: his AI posts via alignmentforum.org, EA-only posts via forum.effectivealtruism.org,
  never lesswrong.com for his posts); downloads, messages, uploads and forms need the commissioner's explicit OK.

## Delegate
Run research, drafting variety, fact-checks, paper reads, reference mining, scene sections, mock-ups and render/QA
loops as parallel background subagents; the lead authors, coordinates and holds the sources of truth. Prefer fresh
agents with written briefs over forks. Keep three standing agents alive: an ideas/references miner (new angle each
run), a fresh fact-checker, and a brief-compliance auditor before each checkpoint. Templates in delegation.md.

## Budget guide (first project)
Judges $127 (Neel raised the cap from $60 to $400 when shown spend); images/video $17.6 of a $400 cap; Gemini ear/eye
$3.4; ElevenLabs ~12k credits (sketches); Suno ~300 credits + 10 downloads. The real cost is Claude tokens (~50M
subagent tokens). Show spend against the cap at every checkpoint. **On a smaller cap (e.g. $150 all-in)**, judging is
the line to manage: pre-screen ~100 ideas with a cheap model on a flex tier down to ~30 before the expensive judges,
merge the deep review with the head-to-head, run each round in one cached process, and set a per-round target (e.g.
~$25–30) in `STATE.md`. If more rounds would clearly help, ask for more rather than silently cutting quality.

## Red flags — stop and correct course
- Writing lyrics before the ledger and digest exist, or putting an unverified fact into a brief.
- A lyric line that needs its footnote, names a paper, or quotes the commissioner.
- Letting judge scores choose the finalist or the winner.
- Asking the commissioner a question and waiting while work that doesn't depend on it sits undone.
- Planning shots around generated video before an end-to-end close-up test.
- Showing them stills when the choice is about motion, or prose when it could be a picture.
- Text on screen that a viewer must read to follow; a reveal shown before it's sung; a date that disagrees with the stamp.
- Building an ambiguous note in full without restating it; enlarging beyond the ask.
- Running long render/check loops in the lead's own context.
- Uploading while notes are still arriving; linking a doc that isn't public yet.
- Skipping a brief item silently instead of saying so.
