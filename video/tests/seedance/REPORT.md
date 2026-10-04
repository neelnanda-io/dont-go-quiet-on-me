# Seedance 2.5 lip-sync feasibility test (2026-10-02)

Run by a background agent; saved here from its report. Evidence images and clips are in this folder.

## Contents
- [Verdict](#verdict)
- [What the API accepts](#what-the-api-accepts)
- [Cost](#cost)
- [Results](#results)
- [Caveats](#caveats)
- [Recommendation and pipeline rules](#recommendation-and-pipeline-rules)

---

## Verdict
**Good enough.** Seedance 2.5 (via OpenRouter) lip-syncs our illustrated singer to the supplied vocal, with a constant delay of about 250 ms; it re-synthesises the audio rather than copying it. After shifting by 250 ms the mouth shapes match the words: rounded on "Don't", "go"; open on "on" and the "ai" of "quiet"; lips shut on the "m" of "me" within 1-3 frames; spread on the held "ee"; closed in the gap. No drift over 5 s; she stays on-model and in style. Tested on one easy 5 s front-facing ballad clip (chorus line 1). Watch `review_master_shifted_250ms.mp4` (our master over the shifted clip); `review_master_noshift.mp4` for contrast.

## What the API accepts
- Audio goes in as `input_references[] = {type: "audio_url", audio_url: {url}}` alongside image references (OpenRouter API reference: honoured by BytePlus Seedance generation 2 and newer). `research/video.md` §3 is out of date on this.
- Audio cannot be combined with a first frame (`frame_images` takes precedence); send the character image as a reference instead. Frame 0 still near-matched it (pixel correlation 0.84).
- Audio must be an HTTPS URL (a data URL was refused, uncharged). The test served the 5 s WAV through a temporary cloudflared quick tunnel to a local server, shut down after the job.
- One audio reference only. Clips 4-30 s. Price ~$0.231/s at 720p, ~$0.103/s at 480p; audio free.

## Cost
$1.30 in total: two first frames (nb2, $0.068 each; the first was too wide to see the mouth) and one 5 s 720p clip ($1.165). Logged image + video spend after this test: $3.41 of the $40 pre-checkpoint cap.

## Results
- Clip audio vs our segment: waveform correlation 0.097 (not a copy); mel correlation 0.83 at +255 ms; Whisper hears the same words 0.22-0.28 s late; 7 dB quieter and duller. Always lay our master over the clip.
- Mouth openness vs the clip's own (Demucs) vocal: r 0.45-0.52 at lag 0 to -83 ms against a shuffled-null 95th percentile of 0.44-0.48. Loudness is a weak proxy for a legato ballad; the frame sheets (`sheet_onsets.png`, `sheet_me_closure.png`) are the stronger evidence.
- Delay 255 ms in the first half, 250 ms in the second: no drift.

## Caveats
Not yet tested: fast verse lines, three-quarter or moving shots, multiple references, clip-to-clip variation of the delay, drift over 15-30 s. Claude can't hear: Neel should watch the review clip.

## Recommendation and pipeline rules
Proceed with Seedance; hold a FAL_KEY (H3 Max Lip Sync / OmniHuman 1.5) in reserve. Next: one ~$1.50 test at 480p on a 10-15 s span with a fast verse line.
1. Send audio as an HTTPS URL with the character image (never with a first frame).
2. Pad the audio ~0.5 s each side and request a matching duration.
3. Measure each clip's offset by mel/envelope cross-correlation; discard the clip's audio.
4. Check every singing clip with onset and "m"-closure sheets.
5. JS redraw: pre-extract to PNGs; frame k maps to song time `seg_start + k/24 - delta` (delta = that clip's offset); use frames as the base layer, or drive a code-drawn mouth from the per-frame mouth track (`signals.npz`).

Tools: `tools/video_gen.py` (submit/poll/download, logs to `logs/video_gen.jsonl`, price estimate first, $40 guard over image + video logs, `--resume <job_id>`); `analyze_lipsync.py` (needs a Python with numpy, scipy, PIL and matplotlib).
