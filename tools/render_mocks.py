"""Render the mock-up stills of the ideas left out of the video, for the final page's "Ideas I left out".

Each idea is drawn into its shot behind a switch (mock('<key>') in the scenes; off in the real video). For every key this
renders the frame with the idea switched on (out/mock/<key>.jpg), and the same frame without it, and crops the place
where they differ (with room around it, 16:9) into out/mock/<key>_zoom.jpg, so a small detail can be judged on a phone.

    python3 tools/render_mocks.py                # every key in build_final_page.CUTS that has a still time
    python3 tools/render_mocks.py magikarp t24   # just these
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_final_page import ADDED, CUTS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / "video/kit"
OUT = KIT / "out/mock"
TMP = KIT / "out/mock/_raw"
# keys whose still is not one frame of one shot: two moments side by side, or a picture of an earlier attempt
TWO_UP = {"riffle_pages": (17.515, 18.415), "fading_page_no": (218.7, 219.7), "r4_dead": (114.3, 115.4)}   # (r4_dead: before and after the flip)
COPIED = {"rotoscope": ROOT / "output/checkpoint_video/roto_poster.jpg"}
# where a mock also shifts things elsewhere in the frame (a new card re-routes the strings), the close-up is set by hand
MANUAL = {"t26": (630, 640, 1350, 1045), "t15": (630, 640, 1350, 1045), "t51": (100, 0, 820, 405),
          "riffle_pages": (1280, 720, 1920, 1080), "r3_solu": (580, 260, 1540, 800), "r3_lasagna": (0, 428, 720, 833),
          "r4_dead": (412, 800, 732, 980), "r4_honeypot": (440, 700, 840, 925), "r4_pause": (1560, 640, 1920, 842), "r4_seahorse": (316, 340, 796, 610),
          "r4_homework": (240, 420, 1000, 848), "r4_clippy": (470, 160, 830, 362), "r4_alarm": (1422, 330, 1920, 610)}   # (round 4: a brush-painted mock shifts the brush noise after it, so its diff box would be the whole frame)   # (two-up: the same corner of both pages, where the numbers are)


def zoom_box(a, b, pad=140, min_w=720):
    """The bounding box of the pixels that differ between frames a and b, padded and widened to 16:9."""
    d = np.abs(np.asarray(a, dtype=np.int16) - np.asarray(b, dtype=np.int16)).sum(axis=2) > 40
    ys, xs = np.nonzero(d)
    if len(xs) == 0:
        return None
    H, W = d.shape
    x0, x1, y0, y1 = xs.min() - pad, xs.max() + pad, ys.min() - pad, ys.max() + pad
    w, h = max(min_w, x1 - x0), max(min_w * 9 / 16, y1 - y0)
    if w / h > 16 / 9:
        h = w * 9 / 16
    else:
        w = h * 16 / 9
    w, h = min(w, W), min(h, H)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    x0, y0 = int(min(max(0, cx - w / 2), W - w)), int(min(max(0, cy - h / 2), H - h))
    return x0, y0, int(x0 + w), int(y0 + h)


def one(key, t):
    if key in COPIED:
        Image.open(COPIED[key]).convert("RGB").save(OUT / f"{key}.jpg", quality=88)
        return "copied"
    if key in TWO_UP:
        on = [render_key_at(key, tt, True) for tt in TWO_UP[key]]
        off = [render_key_at(key, tt, False) for tt in TWO_UP[key]]
        full = Image.new("RGB", (3840, 1080)); [full.paste(im, (1920 * i, 0)) for i, im in enumerate(on)]
        full.resize((2560, 720), Image.LANCZOS).save(OUT / f"{key}.jpg", quality=88)
        boxes = [MANUAL.get(key) or zoom_box(a, b) for a, b in zip(on, off)]
        crops = [im.crop(bx) for im, bx in zip(on, boxes) if bx]
        if crops:
            hh = 720
            crops = [c.resize((int(c.width * hh / c.height), hh), Image.LANCZOS) for c in crops]
            z = Image.new("RGB", (sum(c.width for c in crops), hh)); x = 0
            for c in crops:
                z.paste(c, (x, 0)); x += c.width
            z.save(OUT / f"{key}_zoom.jpg", quality=88)
        return "two-up"
    on, off = render_key_at(key, t, True), render_key_at(key, t, False)
    on.resize((1280, 720), Image.LANCZOS).save(OUT / f"{key}.jpg", quality=88)
    bx = MANUAL.get(key) or zoom_box(on, off)
    if bx and ((bx[2] - bx[0]) < 1500 or key in MANUAL):   # only worth a zoom when the idea is smaller than most of the frame
        on.crop(bx).resize((1280, 720), Image.LANCZOS).save(OUT / f"{key}_zoom.jpg", quality=88)
    elif (OUT / f"{key}_zoom.jpg").exists():
        (OUT / f"{key}_zoom.jpg").unlink()
    return f"box {bx}"


def render_key_at(key, t, mock):
    sub = TMP / f"{key}_{t}_{'on' if mock else 'off'}"
    sub.mkdir(parents=True, exist_ok=True)
    cmd = ["node", "render.mjs", f"--stills={t}", f"--out={sub}"] + ([f"--mock={key}"] if mock else [])
    subprocess.run(cmd, cwd=KIT, check=True, capture_output=True)
    return Image.open(sorted(sub.glob("*.png"))[0]).convert("RGB")


def main():
    want = set(sys.argv[1:])
    TMP.mkdir(parents=True, exist_ok=True)
    for key, title, desc, t in CUTS:
        if (want and key not in want) or (not want and key in ADDED):   # ideas now in the video have no mock left to render
            continue
        print(f"{key:18s} {t:7.2f}  {one(key, t)}", flush=True)


if __name__ == "__main__":
    main()
