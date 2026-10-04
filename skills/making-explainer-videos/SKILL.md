---
name: making-explainer-videos
description: Use when asked to make an animated or narrated explainer video, animation, or visual walkthrough of a paper, concept, or result, or when adding voiceover, TTS narration or subtitles to a video, or choosing or re-voicing a narrator. Covers Manim, text-to-speech, and rendering an MP4.
---

# Making explainer videos

## Overview
A narrated explainer is a pipeline: **script split into beats → one voice clip per beat → Manim scenes timed to the clips → review → render → assemble**.

This skill was distilled from one finished explainer: a 6:44, 1080p walkthrough of the refusal-direction paper, made in September 2026. **That project's code is not in this repo.** The components below are described so you can rebuild them quickly, and each detail fixes a defect that actually happened. Model names, prices and leaderboard positions date from late September 2026; check the current ones.

Most defects are invisible in low-resolution previews and in transcripts judged by a similarity score. Quality comes from checking every stage at full fidelity.

## Contents
- [The tooling to build](#the-tooling-to-build)
- [Workflow](#workflow)
- [Common mistakes](#common-mistakes)

---

## The tooling to build
| Component (suggested name) | What it gives you |
|---|---|
| `common.py` (scene helpers) | `NarratedScene`: `with self.beat(id) as d:` plays a clip and pads the scene to its length; `self.wait_until(frac, d)` lands a visual on a word. `txt` / `wrap_text` / `make_text` give correct letter spacing (manim-gotchas.md). Also: palette, chat window, bar chart, terminal, scatter helpers. |
| `narration.py` | Script as beats, plus TTS settings |
| `make_audio.py` | Beat → clip, cached by a hash of everything that affects the take (below), writing a `durations.json` |
| `check_audio.py` | Transcribe-back QA: word-level diff, confirmed by two transcribers (voiceover.md) |
| `preview.py` | 480p render plus a contact sheet of frames at each beat's middle and end; a `--quality final --no-render` mode does the same for the final renders |
| `build.py` | Parallel 1080p30 renders with per-scene caches, audio padded per scene, loudness normalisation, SRT subtitles, final MP4 |
| `qa_final.py`, a text-kerning test | Final stream/sync checks; letter-spacing regression test |

Setup (macOS: Homebrew cairo/pango/pkgconf, Manim 0.21 in a uv venv, TinyTeX) and fixes are in manim-gotchas.md.

**Starting a new video:**
- Make a new project directory with its own venv: `uv venv` and `uv pip install manim openai python-dotenv`.
- Keep the scene list, output name and paths in one config. In the original they were hardcoded (`SCENES` and `NAME` in `build.py`, a default path in `qa_final.py`, `ROOT/.venv` paths) and had to be fixed on every copy.
- Make `make_audio.py` call ElevenLabs (the request is in voiceover.md):
  - use at most 3 workers;
  - put voice, seed, and the neighbouring beats' text into the cache hash, because `previous_text`/`next_text` affect the take;
  - allow a per-beat seed override, so a bad take can be regenerated as a different one.

## Workflow
1. **Read the source fully**: the whole paper (e.g. convert the arXiv HTML or PDF to markdown), not the abstract.
   - Render figures at 400 dpi (`pdftoppm -r 400`), digitize their numbers into one data module, and quote examples verbatim.
   - If real data is cheap to get (e.g. activations from a small open model, forward passes only), have a background subagent compute it, and label it on screen as real.
2. **Write the script as beats**: 1–2 sentences each, one visual step per beat.
   - Write maths exactly as it should be spoken ("r-hat times r-hat-transpose times W"). Subtitles come from the script, so the audio must say those exact words.
   - Where the spoken and displayed forms must differ, give the beat two fields: `text` for subtitles and `say` for the TTS (e.g. "ReLU" vs "ray-loo").
   - Aim for about 150 words per minute.
3. **Voice.** Default to ElevenLabs `eleven_v4` (`ELEVENLABS_API_KEY`, loaded from a `.env` file), but check the current leaderboard first. Details are in voiceover.md.
4. **Check every clip**: run `check_audio.py` until there are 0 confirmed differences from the script, and scan for dead air.
5. **Animate.** Give each visual step its own `self.beat()`, with run-times expressed as fractions of `d`. Create all text through `txt` / `wrap_text`.
   - To land a visual on a word, take word times from ElevenLabs `/v1/text-to-speech/{voice}/with-timestamps` (character alignment) or whisper-1 `timestamp_granularities=["word"]`, and set `frac = word_start / d`. Don't guess fractions: they break whenever the voice changes.
6. **Review** each scene's contact sheet for overlaps, text running off the edge, and text under boxes. Then look at **full-resolution crops** of body text. For 3D scenes, check the framing with a still first (`manim -s -n 0,3`).
7. **Render**: `build.py --jobs 8` took about 15–20 minutes for 6–7 minutes of video on an Apple-silicon laptop, and 3D scenes are the slowest. Run it as a background task if your shell tool has a time limit (Claude Code's Bash tool stops at 10 minutes). Then run `qa_final.py`. Run previews one at a time: `preview.py` shares the text cache, so parallel previews crash.
8. **Deliver**: send the MP4 with a file-sending tool if the session has one (otherwise give the absolute path). Write a README and commit. For voice or visual choices, publish a side-by-side comparison page (e.g. an Artifact, whose binaries are capped at 15 MB each) built by a generator script.

You cannot hear audio. Transcription QA plus a silence scan is your ear, and ask the user to listen for pacing and pronunciation.

## Common mistakes
| Mistake | Fix |
|---|---|
| Using plain `manim.Text` | Letters land up to 7 px out of place at 1080p. Always use `make_text` (40× oversampling). |
| Reviewing only 480p contact sheets | Also inspect full-resolution crops of text |
| Audio QA by similarity threshold | Two inserted words still score about 95% similar. Diff the words, and count a difference only when both transcribers hear it. |
| Using whichever TTS key is already configured | Check the leaderboard, and offer to set up keys |
| Parallel renders sharing `media/texts` | Crashes on shared temporary SVG files. Give each scene its own `text_dir` / `tex_dir` (`build.py` should do this). |
| Maths the TTS model "improves" (inserts "times") | Write it in the script the way it should be said |

More: manim-gotchas.md (Manim, setup, shell) and voiceover.md (TTS choice, ElevenLabs API, QA).
