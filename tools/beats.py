"""Beat / downbeat / bar grid for a song (AI songs keep a near-constant tempo).

Usage: python tools/beats.py song.mp3 --out audio/<name>/beats.json [--bpm-hint 124]

Output JSON: {bpm, beat_period, beats:[t...], downbeats:[t...], bar_period, first_downbeat,
              onset_env: {hop, sr, values(downsampled)}, sections_rms:[...]}

Downbeats: librosa gives beats but not bar phase, so we pick the phase (0..3) whose beats
carry the most low-frequency onset energy (kick drums land on the downbeat in pop).
The grid is then regularised to a constant tempo (least-squares fit of beat index → time),
because frame-exact animation wants an exact grid, not jittery detections.
"""
import argparse
import json
from pathlib import Path

import librosa
import numpy as np


def analyse(path, bpm_hint=None):
    y, sr = librosa.load(path, sr=22050, mono=True)
    hop = 256
    onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    kw = {}
    if bpm_hint:
        kw["start_bpm"] = bpm_hint
    tempo, beat_frames = librosa.beat.beat_track(onset_envelope=onset, sr=sr, hop_length=hop, units="frames", **kw)
    tempo = float(np.atleast_1d(tempo)[0])
    beats = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop)
    # constant-tempo regularisation: fit t = t0 + k*period over detected beats (robust: iterate once)
    k = np.arange(len(beats))
    A = np.vstack([np.ones_like(k), k]).T
    t0, period = np.linalg.lstsq(A, beats, rcond=None)[0]
    resid = beats - (t0 + period * k)
    keep = np.abs(resid) < 0.06
    t0, period = np.linalg.lstsq(A[keep], beats[keep], rcond=None)[0]
    dur = len(y) / sr
    n = int((dur - t0) / period) + 1
    grid = t0 + period * np.arange(-int(t0 / period), n)
    grid = grid[(grid >= 0) & (grid <= dur)]
    # bar phase from low-frequency onset energy (kick)
    S = np.abs(librosa.stft(y, hop_length=hop, n_fft=2048))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S[freqs < 150].sum(axis=0)
    low = (low - low.mean()) / (low.std() + 1e-9)
    frames = librosa.time_to_frames(grid, sr=sr, hop_length=hop)
    frames = np.clip(frames, 0, len(low) - 1)
    score = [low[frames[p::4]].mean() for p in range(4)]
    phase = int(np.argmax(score))
    downbeats = grid[phase::4]
    # coarse loudness curve (for section detection / audio-reactive motion)
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    step = max(1, int(0.1 * sr / hop))
    return {
        "file": str(path), "duration": round(dur, 3), "bpm": round(60 / period, 3), "librosa_tempo": round(tempo, 2),
        "beat_period": round(float(period), 5), "bar_period": round(float(period * 4), 5),
        "first_downbeat": round(float(downbeats[0]), 4), "beats": [round(float(t), 4) for t in grid],
        "downbeats": [round(float(t), 4) for t in downbeats], "bar_phase_scores": [round(float(s), 3) for s in score],
        "rms_10hz": [round(float(v), 4) for v in rms[::step]],
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--out", required=True)
    ap.add_argument("--bpm-hint", type=float, default=None)
    a = ap.parse_args()
    res = analyse(a.audio, a.bpm_hint)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(res))
    print(f"bpm {res['bpm']} (librosa {res['librosa_tempo']}), beats {len(res['beats'])}, "
          f"first downbeat {res['first_downbeat']}s, bar phase scores {res['bar_phase_scores']}")
