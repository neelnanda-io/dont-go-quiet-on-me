"""ElevenLabs Music v2.5: render a composition plan to MP3 (+ word timestamps).

Usage:
  python tools/eleven_music.py spec.json --out audio/sketches/name   [--seed 7] [--dry]

spec.json:
  {"chunks": [{"text": "[Chorus]\\n...", "duration_ms": 20000,
               "positive_styles": [...], "negative_styles": [...],
               "context_adherence": "high"}], "seed": 7}

Writes <out>.mp3, <out>.json (metadata, composition plan, timestamps if any) and logs
credits used to logs/eleven_calls.jsonl. Cost is ~900 credits/minute of audio.
"""
import argparse
import datetime as dt
import email
import json
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
LOG = ROOT / "logs" / "eleven_calls.jsonl"
API = "https://api.elevenlabs.io/v1"


def credits_used():
    """Credits used this period, or None if the (slow, bookkeeping-only) subscription call fails: never block a render."""
    try:
        r = requests.get(f"{API}/user/subscription",
                         headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"]}, timeout=90)
        return r.json()["character_count"]
    except (requests.RequestException, KeyError, ValueError) as e:
        print(f"[eleven_music] credit check failed ({type(e).__name__}); rendering anyway", flush=True)
        return None


def parse_multipart(resp):
    """Split a multipart/mixed response into (json_parts, binary_audio)."""
    ctype = resp.headers.get("Content-Type", "")
    raw = b"Content-Type: " + ctype.encode() + b"\r\n\r\n" + resp.content
    msg = email.message_from_bytes(raw)
    metas, audio = [], None
    for part in msg.walk():
        if part.is_multipart():
            continue
        pt = part.get_content_type()
        payload = part.get_payload(decode=True)
        if pt == "application/json":
            metas.append(json.loads(payload))
        elif payload and (pt.startswith("audio/") or pt == "application/octet-stream"):
            audio = payload
    return metas, audio


def compose(spec: dict, out: Path, seed=None, model="music_v2_5", fmt="mp3_44100_192"):
    body = {"model_id": model, "composition_plan": {"chunks": spec["chunks"]},
            "with_timestamps": True, "respect_sections_durations": True}
    s = seed if seed is not None else spec.get("seed")
    if s is not None:
        body["seed"] = s
    before = credits_used()
    for attempt in range(6):  # lower ElevenLabs plans allow only 2 concurrent requests; a 429 for that is not charged, so wait and retry
        r = requests.post(f"{API}/music/detailed", params={"output_format": fmt},
                          headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"]},
                          json=body, timeout=900)
        if r.status_code == 429 and "concurren" in r.text and attempt < 5:
            time.sleep(20 * (attempt + 1))
            continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:1500]}")
    metas, audio = parse_multipart(r)
    if audio is None and not metas:
        # some deployments return JSON with base64 audio
        d = r.json()
        import base64
        audio = base64.b64decode(d.get("audio_base64", ""))
        metas = [d]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.with_suffix(".mp3").write_bytes(audio)
    out.with_suffix(".json").write_text(json.dumps({"request": body, "meta": metas}, indent=1))
    after = credits_used()
    rec = {"ts": dt.datetime.now().isoformat(timespec="seconds"), "out": str(out),
           "seconds": sum(c["duration_ms"] for c in spec["chunks"]) / 1000,
           "credits": (after - before) if None not in (after, before) else None, "seed": s}
    LOG.parent.mkdir(exist_ok=True)
    with open(LOG, "a") as f:
        f.write(json.dumps(rec) + "\n")
    return rec


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("spec")
    p.add_argument("--out", required=True)
    p.add_argument("--seed", type=int, default=None)
    a = p.parse_args()
    rec = compose(json.load(open(a.spec)), Path(a.out), a.seed)
    print(json.dumps(rec))
