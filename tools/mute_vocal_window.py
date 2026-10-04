"""Remove the singing in one time window of the master; everything outside the window stays bit-identical.

Neel (3 Oct): 'Cut the "that's my job" just show that on the screen', i.e. the sung aside "(well — it's kind of my
job)" at the end of line 55 (the tweet is already on screen in shot FC4).

Why this works: the htdemucs stems of the Suno take line up with the master at zero lag (the master is the take
resampled to 48 kHz, gain x1.0026; residual 2.9% on a test window), so inside the window the vocal stem (resampled) is
subtracted from the master, leaving the instruments plus the small separation residual. Raised-cosine ramps at the
edges, where the voice is at about -79 dB (start) and -50 dB (end), so the ramps are inaudible.

Default window, read off the vocal stem's envelope: the aside is sung 241.69-242.85 s and its reverb tail fades by
~243.2 s; the instruments are near silent under it (-59 to -73 dBFS), so the result is a short true silence after
"I'll learn to read the quiet", then the orchestra's swell at 243.0 and the breath into the last line (243.44-243.86,
kept). After the Astra re-sing the master changes, so rerun this on the new take with its own stems and window.

  .venv/bin/python tools/mute_vocal_window.py [--master <song.wav>] [--start 241.62] [--end 243.15] [--out audio/edits/dgq_master_nojob]

3 Oct: the Astra re-sing (take orchestral_ballad_e107) is sample-identical to the old take outside 205.5-227 s, so the old
stems still match this window and the cut was applied to it with --master audio/takes/dgq/orchestral_ballad_e107.wav.
"""
import argparse
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "audio/final/dgq_master.wav"
STEMS = ROOT / "audio/stems/htdemucs/orchestral_ballad_cdb7-ce34c87f47"
RAMP = 0.07   # s, each edge


def window_gain(n, sr, start, end):
    """0 outside [start - RAMP, end + RAMP], 1 inside [start, end], raised-cosine ramps between."""
    t = np.arange(n) / sr
    g = np.zeros(n)
    g[(t >= start) & (t <= end)] = 1.0
    up = (t > start - RAMP) & (t < start)
    g[up] = 0.5 - 0.5 * np.cos(np.pi * (t[up] - (start - RAMP)) / RAMP)
    down = (t > end) & (t < end + RAMP)
    g[down] = 0.5 + 0.5 * np.cos(np.pi * (t[down] - end) / RAMP)
    return g


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", type=float, default=241.62)
    ap.add_argument("--end", type=float, default=243.15)
    ap.add_argument("--gain", type=float, default=1.0026, help="master = gain * (vocals + no_vocals), measured")
    ap.add_argument("--out", default="audio/edits/dgq_master_nojob")
    ap.add_argument("--master", default=str(MASTER.relative_to(ROOT)), help="the song to edit (it must match the stems inside the window)")
    a = ap.parse_args()

    master, sr = sf.read(ROOT / a.master, always_2d=True)
    vocals, vsr = sf.read(STEMS / "vocals.wav", always_2d=True)
    # resample only the stretch we touch (plus a margin), then place it at its sample position in the master
    pad = 1.0
    t0, t1 = a.start - RAMP - pad, a.end + RAMP + pad
    v = resample_poly(vocals[int(t0 * vsr):int(t1 * vsr)], sr, vsr, axis=0)
    i0 = int(round(t0 * sr))
    v = v[: master.shape[0] - i0]

    out = master.copy()
    g = window_gain(len(v), sr, a.start - t0, a.end - t0)[:, None]
    out[i0:i0 + len(v)] -= a.gain * g * v

    changed = np.flatnonzero(np.any(out != master, axis=1))
    print(f"changed samples {changed.min() / sr:.3f}-{changed.max() / sr:.3f} s; peak {np.abs(out).max():.3f}")
    dst = ROOT / a.out
    dst.parent.mkdir(parents=True, exist_ok=True)
    sf.write(dst.with_suffix(".wav"), out, sr, subtype="PCM_16")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(dst.with_suffix(".wav")), "-codec:a", "libmp3lame", "-b:a", "192k",
                    str(dst.with_suffix(".mp3"))], check=True)
    print("wrote", dst.with_suffix(".wav").relative_to(ROOT), "and .mp3")


if __name__ == "__main__":
    main()
