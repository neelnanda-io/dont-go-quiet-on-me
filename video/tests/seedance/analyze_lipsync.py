"""Lip-sync verification for one generated clip (Seedance 2.5 feasibility test).

Run with a Python that has numpy + scipy + PIL + matplotlib (e.g. a venv with requirements.txt installed); audio and frames are
decoded through ffmpeg pipes, so no soundfile / cv2 is needed.

  python3 video/tests/seedance/analyze_lipsync.py --clip video/tests/seedance/clip.mp4 \
      --mouth 600,330,90,60 --face 560,180,170,120

Outputs (next to the clip): metrics.json, sheet_onsets.png, strip_6fps.png, mouth_vs_vocal.png, out_audio.wav.
  --mouth x,y,w,h  mouth box in clip pixels on frame 0 (open-mouth interior should fall inside it)
  --face  x,y,w,h  a textured face patch (eyes + nose) on frame 0, template-matched per frame to follow head motion

Checks:
  1. Audio identity: does the clip's audio track equal our input segment? (duration, sample-level cross-correlation
     lag, normalised peak correlation, residual after gain-matching).
  2. Mouth openness per frame: dark-pixel area inside the tracked mouth box (open mouth = dark interior; a closed
     watercolour mouth is a thin line), correlated with the RMS envelope of the Demucs vocal stem over lags +-0.5 s,
     with a circular-shift null so the r value can be judged; also per-half best lag (drift check).
  3. Contact sheets at every word onset of lyric line 5 (and midway between onsets) plus a ~6 fps strip.
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
from dotenv import load_dotenv, find_dotenv
from PIL import Image, ImageDraw, ImageFont

# This searches up the directory tree until it finds a .env file (no keys are used here; project convention)
load_dotenv(find_dotenv(usecwd=True))

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
SEG_START = 37.49  # song time of clip t=0
SR = 48000
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def ffprobe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def load_audio(path):
    """Mono float32 at SR via ffmpeg (None if the file has no audio stream)."""
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True)
    if p.returncode != 0 or not p.stdout:
        return None
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def load_frames(path, w, h):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, h, w, 3)


def xcorr_lag(a, b):
    """Lag (samples) that best aligns b to a: a[n] ~ b[n - lag]. Positive = b content appears later in a."""
    from scipy.signal import fftconvolve
    c = fftconvolve(a, b[::-1], mode="full")
    k = int(np.argmax(np.abs(c)))
    lag = k - (len(b) - 1)
    norm = np.sqrt(np.sum(a ** 2) * np.sum(b ** 2)) + 1e-12
    return lag, float(c[k] / norm)


def audio_identity(out_audio, seg):
    res = {"out_dur_s": len(out_audio) / SR, "in_dur_s": len(seg) / SR}
    lag, peak = xcorr_lag(out_audio, seg)
    res["lag_ms"] = 1000 * lag / SR
    res["peak_norm_xcorr"] = peak
    # residual after aligning + least-squares gain: how much of the output is NOT our segment
    if lag >= 0:
        a, b = out_audio[lag:], seg
    else:
        a, b = out_audio, seg[-lag:]
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    g = float(np.dot(a, b) / (np.dot(b, b) + 1e-12))
    resid = a - g * b
    res["gain"] = g
    res["residual_db_rel_output"] = float(10 * np.log10((np.sum(resid ** 2) + 1e-12) / (np.sum(a ** 2) + 1e-12)))
    res["overlap_s"] = n / SR
    return res


def envelope_lag(a, b, max_lag_s=1.0, hop_s=0.01):
    """Phase-insensitive lag of b inside a from 10 ms log-RMS envelopes (works for re-synthesised audio, where the
    sample-level cross-correlation is ~0). Positive = b's content appears later in a."""
    hop = int(hop_s * SR)

    def env(x):
        k = len(x) // hop
        return np.log(np.sqrt((x[:k * hop].reshape(k, hop) ** 2).mean(1)) + 1e-4)
    ea, eb = env(a), env(b)
    best = (-2.0, 0)
    for L in range(-int(max_lag_s / hop_s), int(max_lag_s / hop_s) + 1):
        if L >= 0:
            x, y = ea[L:], eb
        else:
            x, y = ea, eb[-L:]
        n = min(len(x), len(y))
        r = float(np.corrcoef(x[:n], y[:n])[0, 1])
        if r > best[0]:
            best = (r, L)
    return best[1] * hop_s * 1000, best[0]


def rms_per_frame(x, fps, n_frames, shift_s=0.0):
    """RMS of x in each video frame window, with x's time origin shifted by shift_s (x played shift_s later)."""
    out = np.zeros(n_frames)
    for i in range(n_frames):
        t0, t1 = i / fps - shift_s, (i + 1) / fps - shift_s
        a, b = int(max(0, t0) * SR), int(max(0, t1) * SR)
        seg = x[a:b]
        out[i] = np.sqrt(np.mean(seg ** 2)) if len(seg) else 0.0
    return out


def track_offsets(gray, face_box, search=40):
    """Per-frame (dx, dy) of the face patch from frame 0, by normalised cross-correlation in a +-search window."""
    x, y, w, h = face_box
    tpl = gray[0, y:y + h, x:x + w].astype(np.float64)
    tpl = (tpl - tpl.mean()) / (tpl.std() + 1e-9)
    H, W = gray.shape[1:]
    offs = []
    prev = (0, 0)
    for f in gray:
        best = (-2, 0, 0)
        for dy in range(prev[1] - search // 2, prev[1] + search // 2 + 1, 2):
            for dx in range(prev[0] - search // 2, prev[0] + search // 2 + 1, 2):
                yy, xx = y + dy, x + dx
                if yy < 0 or xx < 0 or yy + h > H or xx + w > W:
                    continue
                p = f[yy:yy + h, xx:xx + w].astype(np.float64)
                s = p.std()
                if s < 1e-6:
                    continue
                r = float(np.mean(tpl * (p - p.mean()) / s))
                if r > best[0]:
                    best = (r, dx, dy)
        # refine at 1 px
        r0, bx, by = best
        for dy in range(by - 1, by + 2):
            for dx in range(bx - 1, bx + 2):
                yy, xx = y + dy, x + dx
                if yy < 0 or xx < 0 or yy + h > H or xx + w > W:
                    continue
                p = f[yy:yy + h, xx:xx + w].astype(np.float64)
                r = float(np.mean(tpl * (p - p.mean()) / (p.std() + 1e-9)))
                if r > best[0]:
                    best = (r, dx, dy)
        offs.append((best[1], best[2], best[0]))
        prev = (best[1], best[2])
    return np.array(offs)


def mouth_signal(frames, mouth_box, offs, dark_thr=None):
    x, y, w, h = mouth_box
    lum = frames.astype(np.float32) @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    crops = []
    for i, (dx, dy, _) in enumerate(offs):
        dx, dy = int(dx), int(dy)
        crops.append(lum[i, y + dy:y + dy + h, x + dx:x + dx + w])
    crops = np.stack(crops)
    if dark_thr is None:
        # skin/paper in this style is light; open-mouth interior + lip line are dark. Threshold between the two.
        dark_thr = float(np.percentile(lum[0], 50) * 0.55)
    area = (crops < dark_thr).sum(axis=(1, 2)).astype(float)
    # vertical extent of dark pixels (mouth height proxy)
    rows = (crops < dark_thr).any(axis=2)
    height = np.array([(np.ptp(np.where(r)[0]) + 1) if r.any() else 0 for r in rows], dtype=float)
    darkness = (255 - crops).mean(axis=(1, 2))
    return {"area": area, "height": height, "darkness": darkness, "thr": dark_thr}


def zs(v):
    v = np.asarray(v, float)
    return (v - v.mean()) / (v.std() + 1e-12)


def lagged_r(m, e, max_lag):
    """r(lag) where positive lag = mouth lags the audio (mouth[i] compared with env[i - lag])."""
    out = {}
    for L in range(-max_lag, max_lag + 1):
        if L >= 0:
            a, b = m[L:], e[:len(e) - L]
        else:
            a, b = m[:L], e[-L:]
        if len(a) > 5:
            out[L] = float(np.corrcoef(a, b)[0, 1])
    return out


def null_r(m, e, min_shift):
    """Circular-shift null: r between mouth and the envelope rotated by >= min_shift frames."""
    rs = [float(np.corrcoef(m, np.roll(e, s))[0, 1]) for s in range(min_shift, len(e) - min_shift + 1)]
    return np.array(rs)


def font(sz):
    try:
        return ImageFont.truetype(FONT, sz)
    except Exception:
        return ImageFont.load_default()


def tile(frames_rgb, labels, crop, cols, tile_w, out_path, title):
    x, y, w, h = crop
    th = int(tile_w * h / w)
    lab_h = 44
    rows = (len(frames_rgb) + cols - 1) // cols
    head = 50
    sheet = Image.new("RGB", (cols * tile_w, head + rows * (th + lab_h)), (250, 247, 240))
    d = ImageDraw.Draw(sheet)
    d.text((10, 12), title, fill=(20, 20, 20), font=font(22))
    for k, (f, lab) in enumerate(zip(frames_rgb, labels)):
        im = Image.fromarray(f[y:y + h, x:x + w]).resize((tile_w, th), Image.LANCZOS)
        cx, cy = (k % cols) * tile_w, head + (k // cols) * (th + lab_h)
        sheet.paste(im, (cx, cy))
        d.rectangle([cx, cy, cx + tile_w - 1, cy + th - 1], outline=(180, 170, 150))
        for j, line in enumerate(lab.split("\n")[:2]):
            d.text((cx + 6, cy + th + 2 + 20 * j), line, fill=(20, 20, 20), font=font(17))
    sheet.save(out_path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clip", default=str(HERE / "clip.mp4"))
    ap.add_argument("--mix", default=str(HERE / "seg_mix.wav"))
    ap.add_argument("--vocals", default=str(HERE / "seg_vocals.wav"))
    ap.add_argument("--mouth", required=True, help="x,y,w,h on frame 0")
    ap.add_argument("--face", required=True, help="x,y,w,h textured face patch on frame 0")
    ap.add_argument("--view", default=None, help="x,y,w,h crop for the sheets (default: around the face)")
    ap.add_argument("--max-lag-s", type=float, default=0.5)
    ap.add_argument("--out-vocals", default=None, help="Demucs vocal stem of the clip's own audio track (optional)")
    a = ap.parse_args()
    mouth_box = [int(v) for v in a.mouth.split(",")]
    face_box = [int(v) for v in a.face.split(",")]

    clip = Path(a.clip)
    probe = ffprobe(clip)
    vs = next(s for s in probe["streams"] if s["codec_type"] == "video")
    aus = [s for s in probe["streams"] if s["codec_type"] == "audio"]
    W, H = int(vs["width"]), int(vs["height"])
    num, den = (int(v) for v in vs["r_frame_rate"].split("/"))
    fps = num / den
    frames = load_frames(clip, W, H)
    n = len(frames)
    metrics = {"clip": str(clip), "width": W, "height": H, "fps": fps, "n_frames": n,
               "video_dur_s": n / fps, "has_audio_stream": bool(aus),
               "audio_streams": [{k: s.get(k) for k in ("codec_name", "sample_rate", "channels", "duration")} for s in aus]}

    mix = load_audio(a.mix)
    voc = load_audio(a.vocals)
    out_audio = load_audio(clip) if aus else None
    if out_audio is not None:
        save = HERE / "out_audio.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(clip), "-vn", "-ac", "2", "-ar", str(SR), str(save)], check=True)
        metrics["audio_vs_input_mix"] = audio_identity(out_audio, mix)
        metrics["audio_vs_vocal_stem"] = audio_identity(out_audio, voc)
    # Where does our song land on the clip's timeline? Sample-level xcorr if the audio is a copy; otherwise the
    # phase-insensitive envelope lag (the model may re-synthesise our audio rather than copy it).
    audio_shift_s, shift_source = 0.0, "none (no audio track or no match)"
    if out_audio is not None:
        el, er = envelope_lag(out_audio, mix)
        metrics["audio_vs_input_mix"]["envelope_lag_ms"] = el
        metrics["audio_vs_input_mix"]["envelope_r"] = er
        if metrics["audio_vs_input_mix"]["peak_norm_xcorr"] > 0.5:
            audio_shift_s, shift_source = metrics["audio_vs_input_mix"]["lag_ms"] / 1000, "sample xcorr (copy)"
        elif er > 0.6:
            audio_shift_s, shift_source = el / 1000, f"log-RMS envelope xcorr r={er:.2f} (re-synthesised, not a copy)"
    metrics["song_to_clip_shift_ms"] = 1000 * audio_shift_s
    metrics["shift_source"] = shift_source
    trust_shift = audio_shift_s != 0.0

    # mouth signal
    gray = (frames.astype(np.float32) @ np.array([0.299, 0.587, 0.114], dtype=np.float32))
    offs = track_offsets(gray, face_box)
    ms = mouth_signal(frames, mouth_box, offs)
    metrics["tracking"] = {"dx_range": [int(offs[:, 0].min()), int(offs[:, 0].max())],
                           "dy_range": [int(offs[:, 1].min()), int(offs[:, 1].max())],
                           "min_match_r": float(offs[:, 2].min()), "mean_match_r": float(offs[:, 2].mean())}
    metrics["mouth_dark_threshold"] = ms["thr"]

    # vocal envelopes on the clip's timeline: (a) input timeline (t=0 is song 37.49 s), (b) shifted by measured
    # offset of the clip's own audio track (if the clip carries our audio)
    env_in = rms_per_frame(voc, fps, n, 0.0)
    env_out = rms_per_frame(voc, fps, n, audio_shift_s if trust_shift else 0.0)
    envs = [("our_vocal_stem|input_timeline", env_in), ("our_vocal_stem|shifted_to_clip_audio", env_out)]
    env_clipvoc = None
    if a.out_vocals:
        env_clipvoc = rms_per_frame(load_audio(a.out_vocals), fps, n, 0.0)
        envs.append(("clip_own_vocal_demucs", env_clipvoc))
    max_lag = int(round(a.max_lag_s * fps))
    corr = {}
    for sig_name in ("area", "height", "darkness"):
        m = zs(ms[sig_name])
        for env_name, env in envs:
            e = zs(np.log(env + 1e-4))
            rl = lagged_r(m, e, max_lag)
            best = max(rl, key=lambda k: rl[k])
            null = null_r(m, e, max_lag + 1)
            halves = {}
            for hn, sl in (("first_half", slice(0, n // 2)), ("second_half", slice(n // 2, n))):
                r2 = lagged_r(zs(ms[sig_name][sl]), zs(np.log(env[sl] + 1e-4)), max_lag)
                b2 = max(r2, key=lambda k: r2[k])
                halves[hn] = {"best_lag_frames": b2, "best_lag_ms": 1000 * b2 / fps, "r": r2[b2]}
            corr[f"{sig_name}|{env_name}"] = {
                "r_lag0": rl[0], "best_lag_frames": best, "best_lag_ms": 1000 * best / fps, "r_best": rl[best],
                "null_p95_abs_r": float(np.percentile(np.abs(null), 95)), "null_max_abs_r": float(np.abs(null).max()),
                "halves": halves}
    metrics["mouth_vs_vocal_loudness"] = corr

    # word onsets of line 5 (+ line 6 words that start inside the clip), on the clip timeline
    lyr = json.loads((ROOT / "audio/final/lyrics.json").read_text())
    words = []
    for li in (5, 6):
        for wd in lyr["lines"][li]["words"]:
            t0, t1 = wd["t0"] - SEG_START, wd["t1"] - SEG_START
            if t0 < n / fps:
                words.append({"w": wd["w"], "t0": t0, "t1": t1, "line": li})
    metrics["words_clip_time"] = words

    # sheet crops
    fx, fy, fw, fh = face_box
    if a.view:
        view = [int(v) for v in a.view.split(",")]
    else:
        cx, cy = mouth_box[0] + mouth_box[2] // 2, (fy + mouth_box[1] + mouth_box[3]) // 2
        vw, vh = 360, 300
        view = [max(0, cx - vw // 2), max(0, cy - vh // 2), vw, vh]
    vx, vy, vw, vh = view

    def frame_at(t, shift=0.0):
        # mouth should match the clip's own audio if it carries ours (shift = where song time lands in the clip)
        i = int(np.floor((t + shift) * fps))
        return max(0, min(n - 1, i))

    shift = audio_shift_s if trust_shift else 0.0
    pts = []
    for k, wd in enumerate(words):
        pts.append((wd["t0"], f"{wd['w']} onset", "on"))
        if k + 1 < len(words):
            pts.append(((wd["t0"] + words[k + 1]["t0"]) / 2, f"mid {wd['w']}>{words[k + 1]['w']}", "mid"))
    # the silent gap between "me" and "(don't" (song 40.22-40.68) and the "m" closure itself
    pts.append(((40.22 + 40.68) / 2 - SEG_START, "gap after 'me'", "gap"))
    pts.sort()
    for sh, name in ((shift, "sheet_onsets.png"), (0.0, "sheet_onsets_noshift.png")):
        fr, labs = [], []
        for t, lab, kind in pts:
            i = frame_at(t, sh)
            fr.append(frames[i])
            labs.append(f"{lab}\nsong+{t:.2f}s clip f{i} area={ms['area'][i]:.0f}")
        tile(fr, labs, (vx, vy, vw, vh), 6, 300, HERE / name,
             f"Seedance 2.5: frames at word onsets / midpoints (forced-aligned times of OUR vocal), "
             f"shifted +{1000 * sh:.0f} ms to the clip's own audio" if sh else
             "Seedance 2.5: frames at word onsets / midpoints of OUR vocal, NO shift (as if our master replaced the clip audio)")

    step = max(1, int(round(fps / 6)))
    idx = list(range(0, n, step))
    labs = []
    for i in idx:
        t = i / fps - shift
        cur = [wd["w"] for wd in words if wd["t0"] <= t < wd["t1"]]
        labs.append(f"t={i / fps:.2f}s {'/'.join(cur) if cur else '-'}\narea={ms['area'][i]:.0f}")
    tile([frames[i] for i in idx], labs, (vx, vy, vw, vh), 8, 220, HERE / "strip_6fps.png",
         f"Every {step}th frame (~{fps / step:.1f} fps); label = word being sung at that clip time")

    # full-frame thumbnails at 0, 1/4, 1/2, 3/4, end, to judge on-model / style / framing
    idx = [0, n // 4, n // 2, 3 * n // 4, n - 1]
    tile([frames[i] for i in idx], [f"f{i} t={i / fps:.2f}s" for i in idx], (0, 0, W, H), 5, 380,
         HERE / "full_frames.png", "Full frames across the clip (framing, style, drift)")

    # plot
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    t = np.arange(n) / fps
    fig, ax = plt.subplots(3, 1, figsize=(13, 8), sharex=True)
    ax[0].plot(t, zs(ms["area"]), label="mouth dark area (z)")
    ref_env = env_clipvoc if env_clipvoc is not None else env_out
    ref_lab = "clip's own vocal (Demucs) log-RMS (z)" if env_clipvoc is not None else "our vocal stem log-RMS, shifted (z)"
    ax[0].plot(t, zs(np.log(ref_env + 1e-4)), label=ref_lab, alpha=0.8)
    ax[0].legend(loc="upper right")
    ax[0].set_title(f"Mouth openness vs vocal loudness (clip timeline; word lines = our forced-aligned onsets + {1000 * shift:.0f} ms)")
    ax[1].plot(t, zs(ms["height"]), label="mouth dark height (z)", color="C2")
    ax[1].plot(t, zs(np.log(ref_env + 1e-4)), label=ref_lab, color="C1", alpha=0.8)
    ax[1].legend(loc="upper right")
    ax[2].plot(t, offs[:, 0], label="head dx (px)")
    ax[2].plot(t, offs[:, 1], label="head dy (px)")
    ax[2].legend(loc="upper right")
    ax[2].set_xlabel("clip time (s)")
    for axx in ax:
        for wd in words:
            axx.axvline(wd["t0"] + shift, color="k", alpha=0.15)
    for wd in words:
        ax[0].text(wd["t0"] + shift, ax[0].get_ylim()[1] * 0.92, wd["w"], fontsize=8, rotation=0)
    fig.tight_layout()
    fig.savefig(HERE / "mouth_vs_vocal.png", dpi=110)

    np.savez(HERE / "signals.npz", area=ms["area"], height=ms["height"], darkness=ms["darkness"],
             env_in=env_in, env_out=env_out, offs=offs, fps=fps)
    (HERE / "metrics.json").write_text(json.dumps(metrics, indent=1))
    print(json.dumps({k: v for k, v in metrics.items() if k != "words_clip_time"}, indent=1))


if __name__ == "__main__":
    main()
