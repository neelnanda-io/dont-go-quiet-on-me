# Stage 2: Audio

From the brief (Neel's, for the first song): "Suno v6 has the best vocals of any model right now but no API, so use it
through my logged-in Chrome, and use the ElevenLabs API's music model as a comparison. Make lots of takes in a few
different production styles. You can't hear, so be honest about that: transcribe the vocals to check the words come
through, run technical checks, and give me a short blind shortlist to pick from."

What actually worked: **the commissioner listens and thumbs takes in Suno; you check the words, the loudness and the
structure.** Every exact prompt, winner and runners-up with reasons: suno-prompts.md.

## Contents
- [Before you start (do these at lyric sign-off)](#before-you-start-do-these-at-lyric-sign-off)
- [Prep the lyric for Suno](#prep-the-lyric-for-suno)
- [Driving Suno in Chrome](#driving-suno-in-chrome)
- [Generate, then let them thumb](#generate-then-let-them-thumb)
- [Checks you can run without ears](#checks-you-can-run-without-ears)
- [Fixing sections after the pick](#fixing-sections-after-the-pick)
- [The master and its timing data](#the-master-and-its-timing-data)
- [Common mistakes](#common-mistakes)
- [Cost and time](#cost-and-time)
- [Reusable assets](#reusable-assets)

---

## Before you start (do these at lyric sign-off)
1. **Ask for download approval in the same message as the lyric lock** ("OK to download up to ~14 WAVs from Suno?").
   Downloads need the commissioner's explicit OK; generating takes doesn't. In the first project the agent asked and then waited:
   9.4 hours with no takes made. Never block on a question while independent work exists; put it in the turn-end
   message and keep going.
2. **Check your browser-automation extension (e.g. Claude in Chrome) is connected to THIS session and signed in to
   the right accounts** while the commissioner is at the laptop. In the first project it was connected to a different
   app and an old account, which blocked the re-sing for 5 h overnight.
3. **Check the account's Suno plan and the downloads LEFT this month** (in Oct 2026 the plan used gave 3,000 credits,
   27 downloads a month and 10 concurrent songs; the first project used 10 downloads, so a follow-on project in the
   same billing month may have few). Ask for approval within that number. Each generation (2 takes) costs 10 credits;
   one download per song unlock; other formats of the same song re-download free.
4. **Ask what styles the commissioner is in the mood for** and remind them of last time's winner (suno-prompts.md).

## Prep the lyric for Suno
`tools/suno_prep.py <slug>` turns the `.lyr` into per-style `lyrics_/styles_/exclude_<style>.txt` + `prep.json`:
uses the SUNG column (respellings), swaps judge-facing cues for musical `[Section | cue]` tags, puts asides under
`[Spoken]` then repeats the section tag, drops quote marks, " — " → ", ", asserts lyrics ≤ 5,000 and styles ≤ 1,000
characters. Re-test respellings of coined jargon in a 20 s ElevenLabs sketch first (cheap; caught five problems;
"JAY-lens" still failed in every Suno take — the on-screen text carried it).

## Driving Suno in Chrome
Copy `audio/suno/UI_NOTES.md` into the new project and keep adding to it the moment a quirk
appears. Key facts (Sep–Oct 2026 UI):
- **Lyrics**: dispatch a synthetic `ClipboardEvent('paste')` into the Lexical editor `[aria-label="Lyrics editor"]`
  (`execCommand('insertText')` drops newlines). Clear with real cmd+a then Backspace.
- **Styles / Exclude / Title**: native value setter + an `input` event. **Sliders**: `role=slider`, arrow keys, read
  back `aria-valuenow`. **Vocal gender**: check `classList.contains('text-foreground-primary')` (a `className.includes`
  test once matched the hover class and left Female selected for a male style).
- **Create**: `aria-label="Create song"`, a real mouse click, ~6 s between clicks. Wrap each batch in a gated
  `browser_batch` whose JS throws if any field fails verification. Suno returns 504s sometimes; the gate catches them.
- **Download**: song page → `button[aria-label="More options"]` → "Download" (find by leaf text; it contains a padlock
  icon) → untick M4A (multi-select), keep WAV → "Unlock & Download". Real clicks only (synthetic pointer events don't
  open the menu); hidden tabs don't mount menus until a screenshot forces a frame; screenshot vs viewport scale can
  differ (1546 vs 1512 px caused a mis-click). Every take of a style downloads under the SAME filename, so move each
  file (`tools/fetch_take.sh`) before starting the next download. Log every take in a `takes.json` next to the
  song's prep files (Suno id, style, duration, gender, sliders, downloaded, the commissioner's thumb).
- **Rules**: never grab stream URLs to dodge the download counter; human-scale use; reject cookie banners; never touch
  the commissioner's other tabs; keep songs private.

## Generate, then let them thumb
1. **One burst of every style family**, 4 takes each (8 styles × 4 = 32 takes in ~10 minutes of generation).
2. **Tell the commissioner the Suno titles and let them thumb in Suno.** Neel judged 32 takes in ~16 minutes. Read
   their likes from the workspace list's like pill (the detector only works there; scroll the virtualised list in
   small steps).
3. **Then, if useful, a per-section shoot-out page** within the winning style: blind (md5-seeded shuffle, A–D labels),
   loudness-matched to −14 LUFS, section windows from forced alignment, one tap per section saved to the artifact db,
   plus a "copy my picks" fallback (`tools/build_shootout_page.py`). Neel listened there but answered in chat ("I like
   ballad A best"); the taps stayed empty. **Ask one thing at a time**: asking for v2-intro thumbs and section taps
   together got neither.
4. **Don't decide the mood from a pre-listening remark.** For the interp song Neel chose sincere and a little sad, and
   his pre-listening "I prefer hilarious" reversed within 16 minutes. Generate across moods that suit THIS song
   (include upbeat styles if the song is meant to be catchy), keep the music itself non-comic unless the song is a
   comedy number, and let the commissioner's thumbs decide.
5. **Decide explicitly whether the ElevenLabs full-song comparison and the cross-style blind shortlist are worth doing,
   and say so if you skip them.** In the first project both silently dropped; nobody missed them, but the brief asked.

## Checks you can run without ears
| Check | Tool | Reliability |
|---|---|---|
| Transcribe-back: Demucs vocal stem → two unprompted transcribers (mlx-whisper large-v3-turbo primary; gpt-4o-transcribe often stops after the first sung line) → per-line recall vs the sung text; jargon terms with `\|` spelling alternatives | `tools/vocal_qa.py`, `tools/song_qa.py` | Good for words. Cache stems by content hash, not filename (a stale cache once "heard" old vocals) |
| Technical: LUFS, peak, clipping, dead air, duration | `vocal_qa.tech_checks` | Accurate; never found a real Suno problem |
| Section profile: mix/vocal/backing dB, onsets, brightness, key, key change | `tools/take_profile.py` | Accurate — but interpret it: a verse 5 dB under its neighbours was the near-spoken problem, not "dynamics" |
| Gemini as an ear (Gemini 3.1 Pro / 3.x Flash audio via OpenRouter) | `tools/gemini_ear.py` | **Never for picking.** Flash picked the first-heard take 75% of the time; pairwise rankings inverted Neel's choices; Pro invented a mishearing both transcribers missed and called a 19 s orchestral intro "solo piano". Its `describe` mode is useful for hints; check claims against `take_profile.py` (`tools/describe_check.py`) |

Be honest in every report: say what you measured, not how it sounds.

## Fixing sections after the pick
The animatic is the first time the commissioner hears the song against picture, and it surfaced two audio fixes. Keep credits.
- **Re-sing a section**: Suno's Legacy Editor (`suno.com/edit-legacy/<id>`), not the Create page's Replace Section
  (it ignores its lyrics box and returns instrumentals). Details in suno-prompts.md. Verify every replacement's lyrics
  by transcription before showing it; send each candidate with the few seconds before it ("Can you give me the audio
  clip immediately before these?").
- **Remove a sung line**: `tools/mute_vocal_window.py` subtracts the aligned Demucs vocal stem inside a window with
  raised-cosine ramps (htdemucs lines up at zero lag); everything outside stays bit-identical.
- **Keep edits sample-local** so alignment, RMS and video timing only change inside the window.
- Better: get every lyric cut agreed before recording.

## The master and its timing data
- The master was the raw Suno WAV (48 kHz/16-bit, −16.5 LUFS) — no mastering needed; the video encode muxes it as AAC.
  Keep a backup of the pre-edit take.
- `tools/song_qa.py` → forced alignment of the sung lyric to the vocal stem with stable-ts (`tools/align.py`) →
  `audio/final/lyrics.json` (word timings; 41 low-probability words of 555, no hand fixes needed). After an edit,
  realign only the changed lines; the aligner can collapse adjacent words ("Then Astra"), so set such onsets by hand
  from the stem.
- `tools/beats.py` (librosa; downbeat phase by low-frequency onset energy; regularised constant grid) →
  `audio/final/beats.json` (bpm, beats, downbeats, `rms_10hz`). With weak downbeats (no kick), cut on lyric phrasing.
- `tools/song_js.py` bundles both into the video kit's `video/kit/src/data/song.js`.
- Choreograph the hook to measured events (music box 0–4.5 s, "now" 12.18–13.56 s, orchestral hit 16.16 s).
- Don't make SFX before a mix plan exists (20 ElevenLabs effects went unused).

## Common mistakes
| Mistake | Fix |
|---|---|
| Waiting on a permission question | Ask at lyric lock; generate meanwhile |
| Building blind-pick pages they won't use | Let them thumb in Suno; one question at a time |
| Choosing the mood from a pre-listening remark | Generate across suitable moods; their listening decides; comic only for a comedy song |
| "solo X and voice" / "almost nothing" tags | "sung, full voice" + exclude spoken/whispered |
| `[Spoken]` asides | Quotes on screen instead |
| Showing unverified regenerations | Transcribe every replacement first |
| Trusting Gemini's ranking | Describe only; verify against measurements |

## Cost and time
~58 takes (≈ 290 credits) + 5 replacement generations; 10 downloads of 14 approved; Gemini ear $2.79 over 87 calls;
ElevenLabs 0 in this stage. Active work ~1.5 h on 1 Oct plus ~1 h of re-sing on 3 Oct; lock → final audio sign-off
~51 h of wall clock, mostly waiting (a permission block, overnight, a Chrome block).

## Reusable assets
All in this repo (the audio tools need a Python venv with demucs, stable-ts, mlx-whisper and pyloudnorm):
`audio/suno/UI_NOTES.md` (copy whole), `tools/suno_prep.py` (edit its CUES/STYLES/EXCLUDE/OVERRIDES/VOCAL_GENDER
dicts) and its output for this song in `audio/suno/dgq/`, `tools/fetch_take.sh` (hard-codes the song's download
filename), `tools/vocal_qa.py`, `tools/song_qa.py`, `tools/align.py`, `tools/beats.py`, `tools/song_js.py`,
`tools/take_profile.py`, `tools/describe_check.py`, `tools/gemini_ear.py`, `tools/build_shootout_page.py`,
`tools/build_song_page.py` (cross-take blind shortlist with Reveal), `tools/mute_vocal_window.py`,
`tools/eleven_music.py`, `tools/eleven_plan.py`, `tools/sfx.py`.
