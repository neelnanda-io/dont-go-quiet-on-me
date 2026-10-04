"""Sound-effects library for the video, from the ElevenLabs sound-generation API.

Every effect is tied to a recurring event in the shot list (video/kit/src/data/dgq_shots.js), and is mixed well under
the vocal (production notes: effects never mask the vocal; the transcription check is re-run on the final mix). The
song is a sad, sincere ballad, so effects are small, close and dry: paper, ink, brass, glass, not cartoon boings.

    python3 tools/sfx.py            # generate any missing effect into audio/sfx/<name>.mp3
    python3 tools/sfx.py --only page_turn,stamp --n 2     # extra variants (name_2.mp3, ...)
    python3 tools/sfx.py --list

Calls and credits are logged to logs/eleven_calls.jsonl (same log as eleven_music.py).
"""
import argparse
import datetime as dt
import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv, find_dotenv

# This searches up the directory tree until it finds a .env file
load_dotenv(find_dotenv(usecwd=True))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")  # also the repo root .env, wherever you run from

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "audio/sfx"
LOG = ROOT / "logs/eleven_calls.jsonl"
API = "https://api.elevenlabs.io/v1"

# name: (prompt, seconds, prompt_influence, where it is used)
SFX = {
    "page_turn": ("A single page of a paper notebook turned slowly by hand, close microphone, dry quiet room, soft paper rustle", 1.2, .6, "into every verse (C1x, C2x, C3x)"),
    "page_riffle": ("Thumb riffling quickly through the pages of a small paper notebook, soft rapid flutter, close and dry", 2.0, .6, "the hook's riffle back (H2), the dictionary (V2c), the final chorus riffle forward (FC1)"),
    "pen_write": ("A fountain pen writing a short handwritten word on paper, gentle nib scratch, close microphone, quiet", 1.5, .6, "margin notes and title write-ons (H1, marginalia)"),
    "stamp": ("A rubber stamp pressed firmly onto paper on a wooden desk, one soft muffled thump", 0.6, .7, "the year stamp ticking up; LAZY / FALSE / OR stamps"),
    "lens_crack": ("A thin glass magnifying lens cracking, one sharp delicate crack with a tiny tinkle, close, no shatter", 1.0, .7, "the lens cracks on 'on me' (H1) and the cracked lens iris (V6x)"),
    "lens_swing": ("A small brass magnifying glass swung through the air past the microphone, soft airy whoosh with a faint metallic glint", 0.8, .5, "the lens iris into every chorus"),
    "lamp_click": ("An old desk lamp switched on, single small mechanical click, quiet room", 0.5, .7, "neurons in the dark (V1a)"),
    "spark": ("A tiny soft electric spark, a delicate crackle, very short and quiet", 0.5, .5, "tiles lighting spark by spark (V1b)"),
    "clock_tick": ("A small mechanical clock ticking softly, a few even ticks, close and dry", 2.0, .6, "the mod-113 clock (V1d)"),
    "bell": ("A small brass desk bell rung once very gently, soft ding that fades quickly", 1.2, .7, "the probe's quiet alarm (V3e)"),
    "envelope": ("A paper envelope slid across a wooden desk, short soft paper slide", 0.7, .6, "prompts walking in to the probe (V3e)"),
    "typewriter": ("A few keys of a manual typewriter typed softly, then a quiet carriage bell", 1.5, .6, "reference cards appearing"),
    "pin": ("A push pin pressed into a cork board, small soft tap", 0.5, .7, "pinning cards on the case file (bridge)"),
    "string_pull": ("A thin string pulled taut and plucked once, soft twang, close", 0.6, .6, "the red string drawing itself (bridge)"),
    "whip_pan": ("A fast soft whoosh of air, a quick camera whip pan, subtle", 0.5, .5, "verse 3's whip-pans along the workbench"),
    "squish": ("A small soft wet squish like a gentle octopus tentacle touching glass, cute and quiet", 0.6, .5, "the toy creature waving and growing (H1, choruses)"),
    "blink": ("A tiny soft eyelid blink sound, a delicate moist tick, very quiet", 0.5, .5, "eyes opening and closing (H1, FC5, E2)"),
    "stone_rise": ("Heavy stone blocks grinding and rising slowly from the ground, distant low rumble, muted", 3.0, .5, "the walls rising (C4d, FC1)"),
    "ocean_night": ("Calm night ocean, gentle small waves lapping, very soft and distant, no wind", 6.0, .4, "verse 5's ocean (bed, very low)"),
    "curtain": ("A heavy velvet theatre curtain sweeping closed, soft fabric whoosh", 1.5, .6, "the curtain falls into the lens (V4x)"),
}


def generate(name, i=1):
    prompt, secs, infl, _ = SFX[name]
    secs = max(.5, secs)   # the API accepts 0.5-30 s
    r = requests.post(f"{API}/sound-generation", timeout=180,
                      headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
                      json={"text": prompt, "duration_seconds": secs, "prompt_influence": infl})
    out = OUT / (f"{name}.mp3" if i == 1 else f"{name}_{i}.mp3")
    rec = {"ts": dt.datetime.now().isoformat(timespec="seconds"), "kind": "sfx", "name": out.name, "status": r.status_code,
           "seconds": secs, "prompt": prompt, "cost_header": r.headers.get("character-cost") or r.headers.get("x-character-count")}
    LOG.parent.mkdir(exist_ok=True)
    with open(LOG, "a") as f:
        f.write(json.dumps(rec) + "\n")
    if r.status_code != 200 or not r.headers.get("content-type", "").startswith("audio"):
        raise RuntimeError(f"{name}: HTTP {r.status_code} {r.text[:200]}")
    out.write_bytes(r.content)
    return out, rec["cost_header"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    ap.add_argument("--n", type=int, default=1)
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list:
        for k, (p, s, _, use) in SFX.items():
            print(f"{k:12s} {s:4.1f}s  {use}")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    names = a.only.split(",") if a.only else list(SFX)
    for name in names:
        for i in range(1, a.n + 1):
            if (OUT / (f"{name}.mp3" if i == 1 else f"{name}_{i}.mp3")).exists():
                continue
            out, cost = generate(name, i)
            print(f"{out.relative_to(ROOT)}  cost {cost}")


if __name__ == "__main__":
    main()
