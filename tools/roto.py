"""Rotoscope a base clip (Seedance) into hand-drawable data for the JS kit: per frame, flat colour regions and ink lines.

The brief: Seedance clips are only a foundation; the JS redraws them so only the drawing is ever seen. This extracts,
for each frame "on twos" (12 fps, the classic hand-drawn rate), (1) colour regions from a palette fitted once on the first
frame (stable colours across frames, so the washes don't flicker) and (2) ink contour lines from edges. The kit then
paints the regions as watercolour washes and the lines as boiling ink (scenes/roto_test.js).

    .venv/bin/python tools/roto.py video/tests/seedance/clip.mp4 --out video/kit/src/data/roto_test.js \
        [--fps 12] [--k 7] [--offset 0.25] [--t0 37.49]

--offset: the clip's measured lip-sync delay (s): frame times are mapped to song time t0 + k/fps - offset.
"""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import cv2
import numpy as np

W_OUT, H_OUT = 640, 360          # analysis resolution (--res overrides); JS scales to the frame
CLEAN = False                    # --clean: mean-shift posterise, bigger regions, smoothed contours (close-ups)


def smooth_contour(ct, sigma=2.0):
    """Gaussian-smooth a closed contour's points (cv2 contours are pixel staircases)."""
    p = ct.reshape(-1, 2).astype(np.float32)
    if len(p) < 8:
        return ct
    k = int(3 * sigma) * 2 + 1
    w = cv2.getGaussianKernel(k, sigma).ravel()
    pad = np.concatenate([p[-(k // 2):], p, p[:k // 2]])
    out = np.stack([np.convolve(pad[:, d], w, mode='valid') for d in (0, 1)], 1)
    return out.reshape(-1, 1, 2)


def frames(path, fps):
    tmp = Path(tempfile.mkdtemp())
    subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-vf", f"fps={fps},scale={W_OUT}:{H_OUT}",
                    str(tmp / "f%04d.png")], check=True)
    return [cv2.imread(str(p)) for p in sorted(tmp.glob("f*.png"))]


def fit_palette(img, k, mask=None):
    """k-means in Lab on the first frame: the clip's own colours, fixed for every frame (subject pixels only if masked)."""
    lab = cv2.cvtColor(cv2.bilateralFilter(img, 9, 40, 9), cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    if mask is not None:
        lab = np.concatenate([lab[mask.reshape(-1) > 0], np.tile(lab[mask.reshape(-1) == 0].mean(0), (len(lab) // 3, 1))])   # the background as one heavy cluster (index 0)
    _, labels, centres = cv2.kmeans(lab, k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, .5), 4,
                                    cv2.KMEANS_PP_CENTERS)
    order = np.argsort(-np.bincount(labels.ravel(), minlength=k))   # most common first (the background)
    return centres[order]


def figure_mask(img, thr=14):
    """1 where the subject is: everything except the background colour connected to the frame's top/right/left edges."""
    lab = cv2.cvtColor(cv2.GaussianBlur(img, (0, 0), 2), cv2.COLOR_BGR2LAB).astype(np.float32)
    edge = np.concatenate([lab[:4].reshape(-1, 3), lab[:, -4:].reshape(-1, 3)])
    bgc = np.median(edge, 0)
    near = (np.sqrt(((lab - bgc) ** 2).sum(-1)) < thr).astype(np.uint8)
    _, cc = cv2.connectedComponents(near)
    border = set(np.unique(np.concatenate([cc[0], cc[-1], cc[:, 0], cc[:, -1]]))) - {0}
    bg = np.isin(cc, list(border))
    return cv2.morphologyEx((~bg).astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))


def ink_shapes(img, mask):
    """The drawing's ink: an XDoG line extraction (keeps eyes, brows, mouth), traced as filled shapes with their holes."""
    sm = img
    for _ in range(2):
        sm = cv2.bilateralFilter(sm, 9, 50, 9)
    g = cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    sc = W_OUT / 1280
    a, b = cv2.GaussianBlur(g, (0, 0), 1.0 * max(sc, .6)), cv2.GaussianBlur(g, (0, 0), 1.6 * max(sc, .6))
    d = 23 * a - 22 * b
    x = np.where(d >= .6, 1.0, 1 + np.tanh(12 * (d - .6)))
    ink = ((x < .5) & (mask > 0)).astype(np.uint8) * 255
    cs, hier = cv2.findContours(ink, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    out = []
    if hier is None:
        return out
    hier = hier[0]
    for i, ct in enumerate(cs):
        if hier[i][3] != -1 or cv2.contourArea(ct) < 14 * sc * sc:   # outer rings only; their holes ride along
            continue
        rings = [ct]
        j = hier[i][2]
        while j != -1:
            if cv2.contourArea(cs[j]) > 4 * sc * sc:
                rings.append(cs[j])
            j = hier[j][0]
        out.append([[round(float(v), 1) for v in r.reshape(-1)] for r in rings])
    return out


def to_hex(lab):
    bgr = cv2.cvtColor(np.uint8([[lab]]), cv2.COLOR_LAB2BGR)[0, 0]
    return "#%02x%02x%02x" % (bgr[2], bgr[1], bgr[0])


INK = False                      # --ink: the XDoG ink layer and the figure mask (subject over any page)


def frame_data(img, pal):
    src = cv2.pyrMeanShiftFiltering(img, 12, 26) if CLEAN else img
    lab = cv2.cvtColor(cv2.bilateralFilter(src, 9, 40, 9), cv2.COLOR_BGR2LAB).astype(np.float32)
    d = ((lab[:, :, None, :] - pal[None, None]) ** 2).sum(-1)
    lbl = d.argmin(-1).astype(np.uint8)
    lbl = cv2.medianBlur(lbl, 7 if CLEAN else 5)
    mask = figure_mask(img) if INK else None
    if mask is not None:
        lbl[mask == 0] = 0
    min_area, kern = (W_OUT * H_OUT / 1400, np.ones((5, 5), np.uint8)) if CLEAN else (60, np.ones((3, 3), np.uint8))
    fills = []
    for c in range(1, len(pal)):     # 0 = background (the page shows through)
        m = (lbl == c).astype(np.uint8) * 255
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, kern)
        if CLEAN:
            m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, kern)
        cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        for ct in cs:
            area = cv2.contourArea(ct)
            if area < min_area:
                continue
            if CLEAN:
                ct = smooth_contour(ct, 2.5)
            ap = cv2.approxPolyDP(ct.astype(np.float32), 1.4, True).reshape(-1, 2)
            if len(ap) >= 3:
                fills.append([c, [round(float(v), 1) for v in ap.flatten()], area])
    fills.sort(key=lambda f: -f[2])   # big regions first, details on top
    fills = [f[:2] for f in fills]
    if INK:
        return {"fills": fills, "inks": ink_shapes(img, mask), "lines": []}
    gray = cv2.cvtColor(cv2.bilateralFilter(src, 7, 50, 7), cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 170) if CLEAN else cv2.Canny(gray, 60, 140)
    cs, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    lines = []
    min_len = W_OUT / 16 if CLEAN else 28
    for ct in cs:
        if cv2.arcLength(ct, False) < min_len:
            continue
        ap = cv2.approxPolyDP(ct.astype(np.float32), 1.1, False).reshape(-1, 2)
        if len(ap) >= 2:
            lines.append([round(float(v), 1) for v in ap.flatten()])
    return {"fills": fills, "lines": lines}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--out", required=True)
    ap.add_argument("--fps", type=int, default=12)
    ap.add_argument("--k", type=int, default=7)
    ap.add_argument("--offset", type=float, default=.25)
    ap.add_argument("--t0", type=float, default=37.49)
    ap.add_argument("--name", default="ROTO_TEST", help="the JS constant (one per clip, e.g. ROTO_V1b)")
    ap.add_argument("--res", type=int, default=640, help="analysis width (16:9)")
    ap.add_argument("--clean", action="store_true", help="posterise and smooth (cleaner shapes for close-ups)")
    ap.add_argument("--ink", action="store_true", help="XDoG ink shapes + figure mask (for close-ups on a dark or busy ground)")
    a = ap.parse_args()
    global W_OUT, H_OUT, CLEAN
    global INK
    W_OUT, H_OUT, CLEAN, INK = a.res, a.res * 9 // 16, a.clean, a.ink
    fr = frames(a.clip, a.fps)
    pal = fit_palette(fr[0], a.k, figure_mask(fr[0]) if a.ink else None)
    data = {"fps": a.fps, "w": W_OUT, "h": H_OUT, "t0": a.t0, "offset": a.offset, "palette": [to_hex(c) for c in pal],
            "frames": [frame_data(f, pal) for f in fr]}
    js = "// generated by tools/roto.py: do not edit by hand\nconst " + a.name + " = " + json.dumps(data, separators=(",", ":")) + ";\n"
    Path(a.out).write_text(js)
    n_f = sum(len(f["fills"]) for f in data["frames"]) / len(fr)
    n_l = sum(len(f.get("inks") or f["lines"]) for f in data["frames"]) / len(fr)
    print(f"{len(fr)} frames, palette {data['palette']}, {n_f:.0f} fills and {n_l:.0f} lines per frame, {len(js) / 1e6:.1f} MB -> {a.out}")


if __name__ == "__main__":
    main()
