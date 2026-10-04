# Voiceover: choosing a TTS model, calling it, and checking it

## Contents
- [Choosing the model](#choosing-the-model)
- [ElevenLabs API (working pattern)](#elevenlabs-api-working-pattern)
- [Writing the script for TTS](#writing-the-script-for-tts)
- [Checking the audio](#checking-the-audio)
- [Comparing voices with the user](#comparing-voices-with-the-user)

---

## Choosing the model
Models change monthly, so check the Artificial Analysis Speech Arena (https://artificialanalysis.ai/text-to-speech/leaderboard) before starting. Blind-listening scores as of 2026-09-29:

| Model | Arena rank / Elo | Access | Notes |
|---|---|---|---|
| ElevenLabs `eleven_v4` | #1 / 1315 | `ELEVENLABS_API_KEY` (keep it in a `.env` file); check your plan's monthly credits and whether it allows commercial use | Accepts neighbouring text as context (`previous_text` / `next_text`); pronunciation dictionaries and inline IPA. Released 2026-09-28 with no pinned version. Credits and characters are the same unit; v4's launch pricing bills about 0.12 credits per character. |
| Cartesia `sonic-3.6` | #2 / 1275 | `CARTESIA_API_KEY` (not tried) | Pinned versions; IPA dictionaries |
| Google `gemini-3.8-flash-tts` | #3 / 1267 | `GEMINI_API_KEY`; free tier, rate-limited | No pronunciation dictionary. Uses the Interactions API. If a key is defined more than once across your shell profile and `.env` files, check which one actually loads. |
| OpenAI `gpt-4o-mini-tts` | not listed (OpenAI's listed models rank #33–44) | `OPENAI_API_KEY` | Weakest option. Inserted words in maths and once truncated a clip. The unpinned alias already serves the newest snapshot. |

A win probability from an Elo gap Δ is 1/(1+10^(−Δ/400)). The #1 model wins only about 57% of votes against #3, so voice character matters as much as the model.

## ElevenLabs API (working pattern)
The original `eleven_tts()` helper (not included in this repo) used only stdlib `urllib`, so it runs in a minimal venv:

```python
body = {"text": text, "model_id": "eleven_v4", "seed": 7,           # seed makes takes reproducible
        "previous_text": prev_beat, "next_text": next_beat}          # continuous delivery across beats
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
    data=json.dumps(body).encode(), method="POST",
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
```

- List voices with `GET /v1/voices`, models with `GET /v1/models`, and credits with `GET /v1/user/subscription`. A small probe script that prints all three (and never prints the key) is worth writing first.
- Narrator voices that read the video's lines exactly (ElevenLabs voice IDs as of Sep 2026; confirm with `GET /v1/voices` that your account can use them):

  | Voice | ID | Character |
  |---|---|---|
  | Andrew | `gUABw7pXQjhjt0kNFBTF` | US male, calm |
  | George | `JBFqnCBsd6RMkjVDRZzb` | UK male, warm |
  | Alice | `Xb7hH8MSUJpSbSDYk0k2` | UK female, educator |
  | Daniel | `onwK4e9ZLuTAKqWW03F9` | UK broadcaster |
  | Matilda | `XrExE9yKIg1WjnnlVkGX` | US female, educator |

- Run at most 3 requests concurrently.
- Clips end with about 0.5 s of room tone, which on top of `BEAT_GAP` (0.35 s) adds up to about 0.85 s between beats. Trim it with `ffmpeg -af areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse`, or lower `BEAT_GAP`.
- Word timings for syncing come from `POST /v1/text-to-speech/{voice_id}/with-timestamps`, which returns audio plus character start/end times, so no separate alignment step is needed.
- For pronunciation that must not show in the subtitles, use the beat's `say` field or an ElevenLabs pronunciation dictionary (API: `/v1/pronunciation-dictionaries`) instead of respelling `text`.

## Writing the script for TTS
- Spell out maths as spoken: "r equals mu minus nu", "W-out prime equals W-out minus r-hat times r-hat-transpose times W-out".
  - If the model says a word the script lacks (e.g. "times"), put that word in the script rather than fighting the model. Subtitles come from the script.
- Numbers: "72 billion" is fine. Write acronyms the way you want them read ("GSM-8K").
- Keep one or two sentences per beat, so each beat is short enough to regenerate cheaply.

## Checking the audio
- Run `check_audio.py` over every clip after every regeneration.
  - It transcribes with `gpt-4o-transcribe`, normalises formatting (punctuation, possessives, "$5" vs "five dollars", "%", maths symbols), and diffs word by word.
  - A difference only counts as confirmed if `whisper-1` also hears it. A single transcriber gives false alarms (it heard a clean "Gemma" as "Gemini").
  - Results merge into one `qa_report.json`.
- **Never judge a clip by a similarity score**: an inserted "times ... times" in a 40-word line still scores 0.95.
- The normaliser in `check_audio.py` knows only the refusal paper's notation (mu/nu/W-out, number words up to twenty). Extend `words()` for each new paper's symbols ("ᵀ", "^T", "+", larger numbers). Otherwise both transcribers write the same symbol, and a correct clip shows a "confirmed" diff.
- Pronunciation (e.g. "myoo" vs "moo") is invisible to transcription. A script that asks two audio-LLM listeners how key terms were said helped, but treat their answers as pointers, not ground truth.
- Scan for dead air with `ffmpeg -af silencedetect=noise=-40dB:d=0.35`. Flag pauses over 1 s, or any leading silence.
- Truncated clips happen, and they show up as a large deletion in the diff. Regenerate them.

## Comparing voices with the user
- Loudness-match every clip (`loudnorm=I=-16:TP=-1.5:LRA=11`), since louder sounds better.
- Publish a side-by-side comparison page (e.g. an Artifact): one row per line, one card per voice, "play all", and a blind mode that shuffles the voices and hides their names. Build it with a generator script from the clip folder, never by hand.
- Pick lines that stress different things: the hook, plain explanation, spoken maths, irony, numbers and acronyms.
