"""Generate video clips via OpenRouter's async video API (POST /api/v1/videos -> poll -> download).

Usage:
  python tools/video_gen.py "prompt" --out video/tests/x.mp4 [--model bytedance/seedance-2.5] [--duration 5]
                            [--resolution 720p] [--aspect 16:9] [--first-frame img.png] [--last-frame img.png]
                            [--ref-image img.png ...] [--ref-audio seg.wav ...] [--ref-video clip.mp4 ...]
                            [--no-audio] [--seed 7] [--max-cost 3] [--dry-run]
  python tools/video_gen.py --resume <job_id> --out x.mp4   # poll + download an already-submitted job (no new spend)
  python tools/video_gen.py --spent                          # image + video spend so far

How OpenRouter passes media (checked 2026-10-02 against the API reference
https://openrouter.ai/docs/api/api-reference/video-generation/submit-a-video-generation-request.md):
  * frame_images[]      {type: image_url, image_url: {url}, frame_type: first_frame|last_frame}  -> image-to-video
  * input_references[]  {type: image_url|audio_url|video_url, <type>: {url}}                       -> reference-to-video
    "Audio and video references are only honored by providers that support them (including BytePlus Seedance
    generation 2 and newer)". If frame_images is present the request is treated as image-to-video, so for
    Seedance an AUDIO reference must go with --ref-image (not --first-frame) or it is likely ignored.
  * Local image files are sent as base64 data URLs (accepted). AUDIO data URLs are refused (verified 2026-10-02:
    HTTP 400 "input_references[1].audio_url.url: Only HTTPS URLs are allowed", not charged), so pass audio/video
    as an https:// URL (e.g. a temporary cloudflared quick tunnel to a local http.server). Any argument that
    starts with https:// is passed through unchanged.

Every call is logged to logs/video_gen.jsonl: one "submit" line (with the price estimate) and one "done" line
(with the billed usage.cost). Budget guard: image + video spend (logs/image_gen.jsonl + logs/video_gen.jsonl;
a submitted job with no "done" line counts at its estimate) may not exceed CAP (was $40 before the checkpoint; $150 in production)
unless --allow-over is passed. A single call is also refused if its estimate exceeds --max-cost.
"""
import argparse
import base64
import datetime as dt
import json
import mimetypes
import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv, find_dotenv

# This searches up the directory tree until it finds a .env file
load_dotenv(find_dotenv(usecwd=True))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")  # also the repo root .env, wherever you run from

ROOT = Path(__file__).resolve().parent.parent
LOG = ROOT / "logs/video_gen.jsonl"
IMAGE_LOG = ROOT / "logs/image_gen.jsonl"
CAP = 150.0   # production cap (3 Oct, video direction approved; the brief allows ~$400, ask Neel past this)
API = "https://openrouter.ai/api/v1"
FPS_FOR_TOKENS = 24  # ByteDance bills Seedance "video tokens" = width * height * fps * seconds / 1024 at 24 fps


def _headers():
    return {"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"}


def _log(rec):
    LOG.parent.mkdir(exist_ok=True)
    rec = {"ts": dt.datetime.now().isoformat(timespec="seconds"), **rec}
    with open(LOG, "a") as f:
        f.write(json.dumps(rec) + "\n")
    return rec


def _jsonl(path: Path):
    if not path.exists():
        return []
    return [json.loads(l) for l in path.read_text().splitlines() if l.strip()]


def spent():
    """Total logged image + video spend. Video jobs submitted but never marked done count at their estimate."""
    image = sum((r.get("cost") or 0) for r in _jsonl(IMAGE_LOG))
    video, open_jobs = 0.0, {}
    for r in _jsonl(LOG):
        if r.get("event") == "submit" and r.get("job_id"):
            open_jobs[r["job_id"]] = r.get("est_cost") or 0
        elif r.get("event") == "done":
            open_jobs.pop(r.get("job_id"), None)
            video += r.get("cost") or 0
    return image + video + sum(open_jobs.values())


def model_info(model):
    r = requests.get(f"{API}/videos/models", headers=_headers(), timeout=60)
    r.raise_for_status()
    for m in r.json()["data"]:
        if m["id"] == model or m.get("canonical_slug") == model:
            return m
    raise SystemExit(f"model {model} not in /videos/models")


def output_size(info, resolution, aspect):
    """Pick WxH from supported_sizes matching the resolution's short side and the aspect ratio."""
    short = int(resolution.rstrip("p")) if resolution.endswith("p") else None
    aw, ah = (int(x) for x in aspect.split(":"))
    best = None
    for s in info.get("supported_sizes") or []:
        w, h = (int(x) for x in s.split("x"))
        if short and min(w, h) != short and not (aw == ah and w == h and abs(w - short) < 250):
            continue
        err = abs(w / h - aw / ah)
        if best is None or err < best[0]:
            best = (err, w, h)
    return (best[1], best[2]) if best else (None, None)


def estimate_cost(info, duration, resolution, aspect, has_video_input=False):
    skus = info.get("pricing_skus") or {}
    if "video_tokens" in skus:
        w, h = output_size(info, resolution, aspect)
        if not w:
            return None, None
        tokens = w * h * FPS_FOR_TOKENS * duration / 1024
        rate = float(skus.get("video_tokens_with_video_input" if has_video_input else "video_tokens"))
        return tokens * rate, f"{w}x{h}, {tokens:.0f} video tokens x ${rate}"
    for k, v in skus.items():
        if "second" in k:
            return float(v) * duration, f"{k} = ${v}/s"
    return None, f"unknown pricing skus {skus}"


def media_url(p):
    """https:// URLs pass through; local paths become base64 data URLs."""
    return p if str(p).startswith("https://") else data_url(Path(p))


def data_url(path: Path):
    mime = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    if path.suffix.lower() == ".wav":
        mime = "audio/wav"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def build_body(a):
    body = {"model": a.model, "prompt": a.prompt, "duration": a.duration, "resolution": a.resolution,
            "aspect_ratio": a.aspect, "generate_audio": not a.no_audio}
    if a.seed is not None:
        body["seed"] = a.seed
    frames = [{"type": "image_url", "image_url": {"url": media_url(p)}, "frame_type": ft}
              for p, ft in ((a.first_frame, "first_frame"), (a.last_frame, "last_frame")) if p]
    refs = ([{"type": "image_url", "image_url": {"url": media_url(p)}} for p in a.ref_image]
            + [{"type": "audio_url", "audio_url": {"url": media_url(p)}} for p in a.ref_audio]
            + [{"type": "video_url", "video_url": {"url": media_url(p)}} for p in a.ref_video])
    if frames:
        body["frame_images"] = frames
    if refs:
        body["input_references"] = refs
    if frames and (a.ref_audio or a.ref_video):
        print("WARNING: frame_images + audio/video references: OpenRouter treats this as image-to-video and the "
              "audio/video references are likely ignored. Use --ref-image instead of --first-frame.", file=sys.stderr)
    return body


def redacted(body):
    """The request body with data URLs replaced by a short marker, for logs."""
    def red(x):
        if isinstance(x, dict):
            return {k: red(v) for k, v in x.items()}
        if isinstance(x, list):
            return [red(v) for v in x]
        if isinstance(x, str) and x.startswith("data:"):
            return x[:30] + f"...<{len(x)} chars>"
        return x
    return red(body)


def poll_and_download(job_id, out: Path, poll_secs=20, max_wait=1800):
    t0 = time.time()
    url = f"{API}/videos/{job_id}"
    while True:
        r = requests.get(url, headers=_headers(), timeout=60)
        st = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"status": f"http {r.status_code}"}
        status = st.get("status")
        print(f"  [{time.time() - t0:5.0f}s] {status}", flush=True)
        if status in ("completed", "failed", "cancelled", "expired"):
            break
        if time.time() - t0 > max_wait:
            raise SystemExit(f"gave up polling after {max_wait}s; resume with --resume {job_id}")
        time.sleep(poll_secs)
    usage = st.get("usage") or {}
    outputs = []
    if status == "completed":
        out.parent.mkdir(parents=True, exist_ok=True)
        for i, u in enumerate(st.get("unsigned_urls") or []):
            o = out if i == 0 else out.with_name(f"{out.stem}_{i}{out.suffix}")
            v = requests.get(u, headers=_headers(), timeout=600)
            v.raise_for_status()
            o.write_bytes(v.content)
            outputs.append(str(o))
    out.with_suffix(".poll.json").write_text(json.dumps(st, indent=1))
    rec = _log({"event": "done", "job_id": job_id, "status": status, "cost": usage.get("cost"),
                "usage": usage, "error": st.get("error"), "outputs": outputs,
                "generation_id": st.get("generation_id"), "poll_secs_total": round(time.time() - t0)})
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt", nargs="?")
    ap.add_argument("--prompt-file")
    ap.add_argument("--out")
    ap.add_argument("--model", default="bytedance/seedance-2.5")
    ap.add_argument("--duration", type=int, default=5)
    ap.add_argument("--resolution", default="720p")
    ap.add_argument("--aspect", default="16:9")
    ap.add_argument("--first-frame")
    ap.add_argument("--last-frame")
    ap.add_argument("--ref-image", nargs="*", default=[])
    ap.add_argument("--ref-audio", nargs="*", default=[], help="https:// URL (data URLs are refused for audio)")
    ap.add_argument("--note", default="", help="free-text note stored in the log (e.g. which local file a URL serves)")
    ap.add_argument("--ref-video", nargs="*", default=[])
    ap.add_argument("--no-audio", action="store_true", help="generate_audio=false")
    ap.add_argument("--seed", type=int)
    ap.add_argument("--max-cost", type=float, default=3.0, help="refuse a single call estimated above this ($)")
    ap.add_argument("--allow-over", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--resume")
    ap.add_argument("--spent", action="store_true")
    a = ap.parse_args()

    if a.spent:
        print(f"${spent():.2f} logged image + video (cap ${CAP:.0f})")
        return
    if not a.out:
        raise SystemExit("need --out")
    out = Path(a.out)
    if a.resume:
        rec = poll_and_download(a.resume, out)
        print(json.dumps(rec, indent=1))
        return

    a.prompt = Path(a.prompt_file).read_text().strip() if a.prompt_file else a.prompt
    if not a.prompt:
        raise SystemExit("need a prompt (or --prompt-file)")
    info = model_info(a.model)
    for field, val, allowed in (("duration", a.duration, info.get("supported_durations")),
                                ("resolution", a.resolution, info.get("supported_resolutions")),
                                ("aspect", a.aspect, info.get("supported_aspect_ratios"))):
        if allowed and val not in allowed:
            raise SystemExit(f"{field}={val} not supported by {a.model}: {allowed}")
    est, how = estimate_cost(info, a.duration, a.resolution, a.aspect, has_video_input=bool(a.ref_video))
    total = spent()
    print(f"estimate ${est:.3f} ({how}); logged so far ${total:.2f} of ${CAP:.0f}")
    if est is None:
        raise SystemExit("could not estimate the price; refusing")
    if est > a.max_cost:
        raise SystemExit(f"estimate ${est:.2f} > --max-cost ${a.max_cost:.2f}")
    if total + est > CAP and not a.allow_over:
        raise SystemExit(f"budget guard: ${total:.2f} + ${est:.2f} > ${CAP:.0f} cap (pass --allow-over after approval)")

    body = build_body(a)
    if a.dry_run:
        print(json.dumps(redacted(body), indent=1))
        return
    t0 = time.time()
    r = requests.post(f"{API}/videos", headers={**_headers(), "Content-Type": "application/json"},
                      json=body, timeout=300)
    d = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"error": r.text[:500]}
    job_id = d.get("id")
    rec = _log({"event": "submit", "model": a.model, "http": r.status_code, "job_id": job_id,
                "est_cost": est if job_id else 0, "est_basis": how, "out": str(out),
                "params": redacted(body), "inputs": {"first_frame": a.first_frame, "last_frame": a.last_frame,
                                                     "ref_image": a.ref_image, "ref_audio": a.ref_audio,
                                                     "ref_video": a.ref_video},
                "response": d if not job_id else {k: d.get(k) for k in ("id", "status", "generation_id")},
                "note": a.note, "secs": round(time.time() - t0, 1)})
    if not job_id:
        raise SystemExit(f"submit failed (HTTP {r.status_code}): {json.dumps(d)[:800]}")
    print(f"submitted {job_id}; polling (resume with --resume {job_id} --out {out})")
    rec = poll_and_download(job_id, out)
    print(json.dumps({k: rec[k] for k in ("status", "cost", "outputs", "error")}, indent=1))
    print(f"total logged image + video: ${spent():.2f}")


if __name__ == "__main__":
    main()
