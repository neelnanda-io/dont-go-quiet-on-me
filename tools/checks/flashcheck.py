"""Photosensitivity check (approximate, Harding/WCAG 2.3.1-style) for a rendered video.

Adapted from Jesse Caple's flashcheck.py (github.com/jessecaple/pdoom, MIT licence), vectorised with numpy
and extended with a saturated-red flash test and a report of where the risky moments are.

  general flash: a pair of opposing changes of >= 10% relative luminance (darker state < 0.80) over >= 25% of the
                 screen (4 of the 16 cells in a 4x4 grid move together). Fail if > 3 flashes in any 1 s window.
  red flash:     the same, but on the saturated-red measure (R/(R+G+B) >= 0.8, scaled 20 x max(0, R-G-B)/255 per
                 WCAG's red flash definition, with a change of >= 20 counting as a transition).

Usage: python tools/checks/flashcheck.py out/video.mp4 [--start 0] [--json out.json]
"""
import argparse
import json
import subprocess

import numpy as np

W, H, G = 64, 36, 4


def frames(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={W}:{H}:flags=area,format=rgb24",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W, 3)


def fps_of(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                        "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip().split("\n")[0].strip(",")
    a, b = r.split("/")
    return float(a) / float(b)


def cells(x):
    """(n, H, W) -> (n, 16) cell means over a 4x4 grid."""
    n = x.shape[0]
    return x.reshape(n, G, H // G, G, W // G).mean(axis=(2, 4)).reshape(n, G * G)


def count_flashes(sig, thresh, dark_cap=None):
    """sig: (n, 16) per-cell signal. Returns frame indices where a flash (a pair of opposite transitions) completes."""
    a, b = sig[:-1], sig[1:]
    lo = np.minimum(a, b)
    ok = lo < dark_cap if dark_cap is not None else np.ones_like(lo, dtype=bool)
    up = ((b - a >= thresh) & ok).sum(axis=1)
    dn = ((a - b >= thresh) & ok).sum(axis=1)
    s = np.where(up >= 4, 1, np.where(dn >= 4, -1, 0))
    flashes, last = [], 0
    for i, v in enumerate(s):
        if not v:
            continue
        if last and v != last:
            flashes.append(i + 1)
            last = 0
        else:
            last = v
    return flashes


def worst_window(fl, fps):
    worst, at = 0, 0
    for f in fl:
        k = sum(1 for g in fl if f <= g < f + fps)
        if k > worst:
            worst, at = k, f
    return worst, at


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--json", default=None)
    a = ap.parse_args()
    fps = fps_of(a.video)
    F = frames(a.video).astype(np.float32) / 255
    lin = np.where(F <= 0.04045, F / 12.92, ((F + 0.055) / 1.055) ** 2.4)
    Y = 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]
    gen = count_flashes(cells(Y), 0.1, dark_cap=0.8)
    R, Gc, B = F[..., 0], F[..., 1], F[..., 2]
    red = np.where(R / np.maximum(R + Gc + B, 1e-6) >= 0.8, 20 * np.maximum(0, R - Gc - B), 0)
    redf = count_flashes(cells(red), 20 * 0.1)   # >= 20 on WCAG's 0..20*255 scale == 0.1 on ours
    gw, gat = worst_window(gen, fps)
    rw, rat = worst_window(redf, fps)
    res = {"file": a.video, "fps": round(fps, 3), "frames": int(len(F)),
           "general": {"flashes": len(gen), "max_per_s": gw, "at_s": round(a.start + gat / fps, 2)},
           "red": {"flashes": len(redf), "max_per_s": rw, "at_s": round(a.start + rat / fps, 2)},
           "pass": gw <= 3 and rw <= 3,
           "hot_spots_s": sorted({round(a.start + f / fps, 1) for f in gen if sum(1 for g in gen if f <= g < f + fps) >= 3})[:40]}
    print(json.dumps(res, indent=1))
    if a.json:
        open(a.json, "w").write(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
