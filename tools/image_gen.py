"""Generate style frames, character sheets and sets with image models via OpenRouter (images come back as data URLs).

Usage:
  python tools/image_gen.py "prompt text" --out video/style/a_chorus.png [--model pro|nb2|gpt] [--ref img.png ...]
                            [--aspect 16:9] [--n 2]
  python tools/image_gen.py --prompt-file video/style/prompts/a_chorus.txt --out ...
  python tools/image_gen.py --spent        # total so far
  --size 2K / 4K: Gemini output resolution (image_config.image_size; 1K default)

Every call is logged to logs/image_gen.jsonl (model, cost, prompt, output). Budget guard: refuses to run once the logged
spend reaches $40 (Neel's cap before the video-direction checkpoint) unless --allow-over is passed; raise CAP after he
approves the direction ($400 total for image + video generation).
Reference images (--ref) go in as image inputs, so a character or style can be held fixed across sheets.
"""
import argparse
import base64
import datetime as dt
import hashlib
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
LOG = ROOT / "logs/image_gen.jsonl"
CAP = 150.0   # production cap (3 Oct, video direction approved; the brief allows ~$400, ask Neel past this)
MODELS = {"pro": "google/gemini-3-pro-image", "nb2": "google/gemini-3.1-flash-image", "gpt": "openai/gpt-5.4-image-2"}


def spent():
    if not LOG.exists():
        return 0.0
    return sum((json.loads(l).get("cost") or 0) for l in LOG.read_text().splitlines() if l.strip())


def data_url(path: Path):
    mime = mimetypes.guess_type(str(path))[0] or "image/png"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def generate(prompt, out: Path, model="pro", refs=(), aspect="16:9", allow_over=False, size=None):
    if spent() >= CAP and not allow_over:
        raise SystemExit(f"budget guard: ${spent():.2f} logged >= ${CAP:.0f} cap (pass --allow-over after approval)")
    content = [{"type": "text", "text": prompt}] + [{"type": "image_url", "image_url": {"url": data_url(Path(r))}} for r in refs]
    body = {"model": MODELS[model], "modalities": ["image", "text"], "usage": {"include": True},
            "messages": [{"role": "user", "content": content}]}
    if model in ("pro", "nb2"):
        body["image_config"] = {"aspect_ratio": aspect, **({"image_size": size} if size else {})}
    for attempt in range(3):
        t0 = time.time()
        r = requests.post("https://openrouter.ai/api/v1/chat/completions", timeout=600, json=body,
                          headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"})
        d = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"error": r.text[:300]}
        msg = (d.get("choices") or [{}])[0].get("message") or {}
        imgs = msg.get("images") or []
        u = d.get("usage") or {}
        rec = {"ts": dt.datetime.now().isoformat(timespec="seconds"), "model": MODELS[model], "status": r.status_code,
               "cost": u.get("cost"), "secs": round(time.time() - t0, 1), "out": str(out), "n_images": len(imgs),
               "refs": [str(x) for x in refs], "prompt_md5": hashlib.md5(prompt.encode()).hexdigest()[:10],
               "prompt": prompt[:2000], "text": (msg.get("content") or "")[:300]}
        LOG.parent.mkdir(exist_ok=True)
        with open(LOG, "a") as f:
            f.write(json.dumps(rec) + "\n")
        if imgs:
            out.parent.mkdir(parents=True, exist_ok=True)
            url = imgs[0]["image_url"]["url"]
            out.write_bytes(base64.b64decode(url.split(",", 1)[1]))
            return rec
        time.sleep(4 * (attempt + 1))
    raise RuntimeError(f"no image returned: {json.dumps(d)[:500]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt", nargs="?")
    ap.add_argument("--prompt-file")
    ap.add_argument("--out")
    ap.add_argument("--model", default="pro", choices=sorted(MODELS))
    ap.add_argument("--ref", nargs="*", default=[])
    ap.add_argument("--aspect", default="16:9")
    ap.add_argument("--n", type=int, default=1)
    ap.add_argument("--size", choices=["1K", "2K", "4K"], help="Gemini output resolution (default 1K)")
    ap.add_argument("--allow-over", action="store_true")
    ap.add_argument("--spent", action="store_true")
    a = ap.parse_args()
    if a.spent:
        print(f"${spent():.2f} logged (cap ${CAP:.0f})")
        return
    prompt = Path(a.prompt_file).read_text() if a.prompt_file else a.prompt
    if not prompt or not a.out:
        raise SystemExit("need a prompt (or --prompt-file) and --out")
    out = Path(a.out)
    for i in range(a.n):
        o = out if a.n == 1 else out.with_name(f"{out.stem}_{i + 1}{out.suffix}")
        rec = generate(prompt, o, a.model, a.ref, a.aspect, a.allow_over, a.size)
        print(f"{o}  ${rec['cost']}  {rec['secs']}s  (total ${spent():.2f})")


if __name__ == "__main__":
    main()
