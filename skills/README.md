# Skills

Two Claude Code skills that came out of making "Don't Go Quiet On Me", a song and code-drawn music video about the
history of mechanistic interpretability, made by Claude Opus 5.5 and Suno v6 for Neel Nanda
([video](https://youtu.be/xhTMRykVb8I), [references page](https://neelnanda-io.github.io/dont-go-quiet-on-me/)).
They record the method, the prompts, the tools and the mistakes, so that a future song or explainer starts from what
worked.

## Contents
- [What each skill is for](#what-each-skill-is-for)
- [Install](#install)
- [Use](#use)
- [How the skills relate to this repo](#how-the-skills-relate-to-this-repo)
- [Caveats](#caveats)

---

## What each skill is for

**`making-research-music-videos/`**: making a reference-dense song and music video about a research field, paper,
movement or community, for a specific person or audience who will pause and check every reference. It covers the
whole project in stages with sign-off gates: research and a verified reference ledger, about a hundred lyric ideas
judged by several models and developed into finalists, Suno takes and checks you can run without ears, a video drawn
entirely in p5.js, and publishing to YouTube with chapters and a reference page.

| File | Covers |
|---|---|
| `SKILL.md` | Overview, stages and gates, day one, the taste summary, budget, red flags |
| `the-brief.md` | The two prompts that started the project (Donald Jewkes's, verbatim; Neel's, lightly redacted) and a kickoff template |
| `topics-and-references.md` | Research fan-out, the ledger and fact digest, verification, topic packs (interp, AI safety, EA) |
| `lyrics.md` | The lyric pipeline, judges and their limits, singability checks, devices that worked |
| `audio.md`, `suno-prompts.md` | Driving Suno, checks without ears, fixing sections; every Suno prompt verbatim with verdicts |
| `video-direction.md`, `video-production.md` | Concept, style, hook, animatic; the render kit, QA loops, notes rounds |
| `publishing.md` | Final page, YouTube upload, chapters, the reference doc, credits |
| `feedback-and-pages.md`, `delegation.md`, `lessons.md` | Getting cheap verdicts, subagent briefs, ranked lessons |

**`making-explainer-videos/`**: making a narrated explainer video with Manim and text-to-speech: script in beats, one
voice clip per beat, scenes timed to the clips, transcribe-back audio QA, parallel renders, subtitles. It came from an
earlier explainer project (a walkthrough of the refusal-direction paper), and the music-video brief points to it for
its rendering and voiceover lessons.

## Install

Copy a skill folder into `~/.claude/skills/` (available in every project) or into a project's `.claude/skills/`
(that project only):

```bash
git clone https://github.com/neelnanda-io/dont-go-quiet-on-me
cp -R dont-go-quiet-on-me/skills/making-research-music-videos ~/.claude/skills/
cp -R dont-go-quiet-on-me/skills/making-explainer-videos ~/.claude/skills/
```

Each folder's `SKILL.md` has the frontmatter (`name`, `description`) that Claude Code reads. Start a new session after
copying.

## Use

Type the skill's name as a slash command followed by your request:

```
/making-research-music-videos a song and music video about the history of AI evaluations, for my lab's offsite
/making-explainer-videos a 5-minute narrated explainer of <paper>, with subtitles
```

Or just describe the task ("make a music video about effective altruism", "add a voiceover to this animation") and
Claude will load the matching skill from its description.

## How the skills relate to this repo

- **Paths inside the music-video skill are relative to the root of this repo**: `tools/judges.py`,
  `audio/suno/UI_NOTES.md`, `video/kit/` and so on. Keep a clone next to your new project, and copy what the skill's
  "Day one" section lists.
- **The tools are in this repo**: the pipeline scripts in `tools/` (with `tools/checks/`), their tests in `tests/`,
  the p5.js render kit in `video/kit/`, the Suno prep files in `audio/suno/dgq/`, the lyric briefs and finalists in
  `lyrics/`, and the doc and description builders in `output/doc_stills/`.
- Some things the skill describes were part of the original working directory and are not here (the full reference
  ledger, call logs, memory notes, earlier drafts). The skill describes them in words so you know what to recreate.
- The explainer skill's reference code is **not** in this repo. That skill describes each component in enough detail
  to rebuild it.

## Caveats

- **Dated October 2026.** Model names (Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, Gemini 3.1 Pro, Seedance 2.5,
  ElevenLabs `eleven_v4`), prices, plan limits, the Suno UI notes and the YouTube upload form all date from then.
  Check the current ones before relying on them.
- **Built around one commissioner's taste.** The verdicts in the skill are Neel Nanda's (sincere music over comic,
  story over density in the lyric, minimal reference text on screen, feedback by tapping on pictures). They are kept
  as a worked example. Replace the taste notes with your own commissioner's as their verdicts arrive.
- **Assumed setup.** Claude Code with subagents; a browser-automation extension that can drive Suno, X and YouTube in
  your logged-in browser; OpenRouter and ElevenLabs API keys; and somewhere to publish phone-friendly review pages
  (the original used claude.ai Artifacts). Swap in your own equivalents.
- **Suno has no API.** The skill drives the web app at human scale and never bypasses its download limits. Check
  Suno's terms for your plan, including what it allows for publishing.
- **Cost.** The first project spent about $147 on APIs (mostly judge models), plus Suno and ElevenLabs subscription
  credits and roughly 50M subagent tokens. The budget section of `SKILL.md` covers a smaller cap.
