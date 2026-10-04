"""A/V sync check on a rendered MP4 of the synctest scene (video/kit/src/scenes/synctest.js).

The scene paints a patch at (40, 40, 150x150) white for 0.1 s from every downbeat. This measures, in the MP4 itself:
  1. mux delay d: how far the MP4's audio is shifted from the source song (cross-correlation; catches AAC priming,
     a wrong -ss, a resampling drift), and
  2. for every flash, offset = (time the flash first shows) - (time that downbeat is heard in the MP4 = downbeat + d).
Negative = picture before sound. Target: every offset in [-1 frame, 0] (config.js PROJECT.lead = one frame), and
never > +20 ms (sound before picture is the direction viewers notice; ITU-R BT.1359 detectability ~ +45 ms / -125 ms).

Usage: python tools/checks/avsync.py video/kit/out/check/sync_ref.mp4 --song video/kit/src/data/song.js \
          --source research/ref_audio.mp3 [--start 0]
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

SR = 22050


def decode_audio(path, start=0.0, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(start), "-i", str(path)]
    if dur:
        cmd += ["-t", str(dur)]
    cmd += ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)


def patch_series(path):
    """Mean brightness (0..255) of the flash patch in every frame, and the fps."""
    fps_s = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                            "-of", "csv=p=0", str(path)], capture_output=True, text=True).stdout.strip().split("\n")[0]
    a, b = fps_s.strip(",").split("/")
    fps = float(a) / float(b)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", "crop=110:110:60:60,scale=8:8,format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, 64).mean(axis=1), fps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mp4")
    ap.add_argument("--song", required=True)
    ap.add_argument("--source", required=True, help="the source song file the render muxed in")
    ap.add_argument("--start", type=float, default=0.0, help="song time of the MP4's first frame (--range start)")
    a = ap.parse_args()
    js = Path(a.song).read_text()
    song = json.loads(js[js.index("{"):js.rindex("}") + 1])
    lum, fps = patch_series(a.mp4)
    n = len(lum)
    dur = n / fps
    # 1) mux delay: correlate the MP4 audio against the source over the same span (±0.5 s search)
    mine = decode_audio(a.mp4)
    src = decode_audio(a.source, a.start, dur + 1)
    L = min(len(mine), len(src) - SR // 2)
    x, y = mine[:L], src[:L + SR // 2]
    lag_max = SR // 2
    f = np.fft.rfft(np.pad(x, (0, len(y) + lag_max)))
    g = np.fft.rfft(np.pad(y, (lag_max, len(x))))
    cc = np.fft.irfft(g * np.conj(f))
    lags = np.arange(len(cc)) - lag_max
    ok = np.abs(lags) <= lag_max
    best = lags[ok][np.argmax(cc[ok])]
    d = -best / SR   # positive d = the MP4's audio is later than the source
    # 2) flash onsets (rising edges through the midpoint between dark and white)
    thr = (np.percentile(lum, 5) + np.percentile(lum, 95)) / 2
    on = np.where((lum[1:] >= thr) & (lum[:-1] < thr))[0] + 1
    flashes = on / fps
    downs = np.array([t for t in song["downbeats"] if a.start <= t < a.start + dur]) - a.start
    offs = []
    for fl in flashes:
        k = np.argmin(np.abs(downs + d - fl))
        offs.append(fl - (downs[k] + d))
    offs = np.array(offs) * 1000
    frame_ms = 1000 / fps
    res = {"mp4": a.mp4, "fps": round(fps, 3), "frames": n, "mux_delay_ms": round(d * 1000, 2),
           "flashes": int(len(flashes)), "downbeats_in_range": int(len(downs)),
           "offset_ms": {"min": round(float(offs.min()), 1), "median": round(float(np.median(offs)), 1),
                         "max": round(float(offs.max()), 1)},
           "pass": bool(len(flashes) == len(downs) and offs.min() >= -frame_ms - 2 and offs.max() <= 20)}
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
