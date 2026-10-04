"""An outside eye on the video: Gemini watches a rendered cut and lists concrete, timestamped problems.

The production plan's whole-video pass (video/treatment/production_plan.md, phase 4). Treat the output as a list of
places to look, not a verdict: every claim is checked against a still at that time before anything is changed.

    python tools/gemini_eye.py critique video/kit/out/dgq_final.mp4 [--model pro] [--range 0:262]

Writes video/qa/eye/<stem>.<model>.json and logs every call (provider, tokens, cost) to logs/gemini_eye.jsonl. The video
is sent as a small proxy (640x360, 12 fps, mono audio) so the request stays a few MB.
"""
import argparse
import base64
import datetime as dt
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import requests
from dotenv import load_dotenv, find_dotenv

# This searches up the directory tree until it finds a .env file
load_dotenv(find_dotenv(usecwd=True))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")  # also the repo root .env, wherever you run from

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / "video/qa/eye"
LOG = ROOT / "logs/gemini_eye.jsonl"
MODELS = {"pro": "google/gemini-3.1-pro-preview", "flash": "google/gemini-3-flash-preview"}

BRIEF = """You are a demanding music-video director giving a final technical pass on an animated music video before it
is published. It is a hand-drawn-look animation (ink and watercolour on a field notebook's graph paper), made entirely in
code, for a sincere, slightly sad orchestral pop song about an interpretability researcher and the AI model she studies
(a cute many-eyed "shoggoth" that grows across the song). The audience is AI researchers; it is deliberately dense with
small references, and that density is intended, so do not flag "too many references".

Find concrete problems a viewer would notice: text that is hard to read or collides with other things, lyrics that cover
a subject, compositions that look empty, cramped or accidental, drawing glitches (stray lines, shapes poking out, broken
outlines, flicker), awkward or jarring transitions, timing that misses the music, anything that looks unfinished or
broken, and moments that are confusing. Be specific: give the timestamp (m:ss) and what exactly is wrong, and how bad it
is. Do not flatter and do not pad: if a stretch is fine, say nothing about it.

Reply with JSON only: {"issues": [{"t": "m:ss", "severity": "high|medium|low", "what": "...", "fix": "..."}],
"overall": "two or three sentences"}"""


def proxy(src: Path, rng: str | None) -> Path:
    out = Path(tempfile.mkdtemp()) / "proxy.mp4"
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    if rng:
        a, b = rng.split(":")
        cmd += ["-ss", a, "-to", b]
    cmd += ["-i", str(src), "-vf", "scale=640:360,fps=12", "-c:v", "libx264", "-crf", "30", "-preset", "slow",
            "-c:a", "aac", "-ac", "1", "-b:a", "48k", "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    return out


def critique(video: Path, model_key: str, rng: str | None):
    key = os.environ["OPENROUTER_API_KEY"]
    model = MODELS[model_key]
    p = proxy(video, rng)
    b64 = base64.b64encode(p.read_bytes()).decode()
    print(f"proxy {p.stat().st_size / 1e6:.1f} MB -> {model}")
    body = {
        "model": model,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": BRIEF + (f"\n\nThis clip starts at {rng.split(':')[0]} s into the song; give timestamps from the start of the clip." if rng else "")},
            {"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{b64}"}},
        ]}],
        "usage": {"include": True},
        "reasoning": {"effort": "medium"},
    }
    t0 = time.time()
    r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers={"Authorization": f"Bearer {key}"}, json=body, timeout=900)
    d = r.json()
    if "choices" not in d:
        sys.exit(f"error: {json.dumps(d)[:800]}")
    text = d["choices"][0]["message"].get("content") or ""
    u = d.get("usage", {})
    LOG.parent.mkdir(exist_ok=True)
    with LOG.open("a") as f:
        f.write(json.dumps({"at": dt.datetime.now().isoformat(timespec="seconds"), "model": model, "provider": d.get("provider"),
                            "video": str(video), "range": rng, "prompt_tokens": u.get("prompt_tokens"), "completion_tokens": u.get("completion_tokens"),
                            "cost": u.get("cost"), "secs": round(time.time() - t0, 1), "finish": d["choices"][0].get("finish_reason")}) + "\n")
    s = text[text.find("{"): text.rfind("}") + 1]
    try:
        out = json.loads(s)
    except json.JSONDecodeError:
        out = {"raw": text}
    QA.mkdir(parents=True, exist_ok=True)
    dst = QA / f"{video.stem}{'_' + rng.replace(':', '-') if rng else ''}.{model_key}.json"
    dst.write_text(json.dumps(out, indent=1, ensure_ascii=False))
    print(f"cost ${u.get('cost')}; {len(out.get('issues', []))} issues -> {dst}")
    for it in out.get("issues", []):
        print(f"  {it.get('t'):>6} [{it.get('severity')}] {it.get('what')}")
    if out.get("overall"):
        print("overall:", out["overall"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["critique"])
    ap.add_argument("video", type=Path)
    ap.add_argument("--model", default="pro", choices=list(MODELS))
    ap.add_argument("--range", default=None, help="a:b in seconds")
    a = ap.parse_args()
    critique(a.video, a.model, a.range)


if __name__ == "__main__":
    main()
