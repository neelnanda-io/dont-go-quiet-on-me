"""A second pair of ears: Gemini listens to the takes (I can't), via OpenRouter audio input.

Neel's idea (1 Oct): "Gemini 3.1 pro and 3.8 flash may be decent at understanding and comparing music? Worth giving
them the files and asking for takes, or comparisons between them". Treat the output as an opinion to calibrate, not a
verdict: `summary` lines it up against Neel's own thumbs before anyone trusts it.

Usage:
  python tools/gemini_ear.py review audio/takes/dgq/acappella_solo_*.wav [--models pro,flash]
  python tools/gemini_ear.py compare acappella_solo [--models pro,flash]   # every pair, both orders (position bias)
  python tools/gemini_ear.py summary
  python tools/gemini_ear.py describe audio/takes/dgq/*.wav [--models pro,flash]   # what's in each take, no ratings
  python tools/gemini_ear.py contrast acappella_solo [--models pro]               # how the four takes differ
Calibration (1 Oct, vs Neel's thumbs): NOT reliable for picking; describe/contrast exist because Neel asked for "more data
on what each one is like". Their claims are checked against tools/take_profile.py measurements before they're shown.
Writes audio/qa/dgq/ear/<take>.<model>.json, ear/pairs_<style>.<model>.json, and logs every call (provider, tokens,
cost) to logs/gemini_ear.jsonl. Cost: ~25 audio tokens/s, so a 4-minute take is ~6.5k tokens (~$0.013 on Pro).
"""
import argparse
import base64
import datetime as dt
import itertools
import json
import os
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from dotenv import load_dotenv, find_dotenv

# This searches up the directory tree until it finds a .env file
load_dotenv(find_dotenv(usecwd=True))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")  # also the repo root .env, wherever you run from

ROOT = Path(__file__).resolve().parent.parent
EAR = ROOT / "audio/qa/dgq/ear"
LOG = ROOT / "logs/gemini_ear.jsonl"
TAKES = ROOT / "audio/suno/dgq/takes.json"
MODELS = {"pro": "google/gemini-3.1-pro-preview", "flash": "google/gemini-3.8-flash"}
STYLE_NAMES = {"acappella_solo": "a cappella: one male singer multitracked into a full vocal band (A Capella Science style)",
               "orchestral_ballad": "cinematic orchestral pop ballad (orchestral pop cover style), female lead"}

BRIEF = """You are a demanding but fair music producer giving notes on AI-generated takes of one song, "Don't Go Quiet
On Me": a love song from an AI interpretability researcher to the AI models they study ("I just wanna read your mind").
The listener who will choose a take wants it varied, rich and not monotonous, with real dynamics between sections, and
the emotional tone sincere and a little sad: serious but NOT melodramatic or overwrought, and NOT comedic. The intro
(the first few seconds, the line "Don't go quiet on me now") should start small and intimate and grow quickly, peaking
on "now", then cut to the verse: in the video a researcher studies a tiny creature through a magnifying glass and it
grows until it is bigger than the screen. Words matter: the lyrics are dense with jargon and must be intelligible.
Judge only what you hear. Give timestamps as m:ss. Be specific and concrete; do not flatter."""


def lyrics_text():
    # The neutral-cue lyrics: what every style sang, with section names (cues differ per style; words do not)
    return (ROOT / "audio/suno/dgq/lyrics.txt").read_text()


def to_mp3_b64(path: Path) -> str:
    """Stereo 160 kbps MP3 (a 4:20 take is ~5 MB, well under the request limit)."""
    with tempfile.TemporaryDirectory() as td:
        mp3 = Path(td) / "a.mp3"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-b:a", "160k", str(mp3)], check=True)
        return base64.b64encode(mp3.read_bytes()).decode()


def call(model_key, content, schema, name, effort="medium"):
    body = {"model": MODELS[model_key], "usage": {"include": True}, "reasoning": {"effort": effort},
            "messages": [{"role": "user", "content": content}],
            "response_format": {"type": "json_schema", "json_schema": {"name": name, "strict": True, "schema": schema}}}
    for attempt in range(4):
        t0 = time.time()
        r = requests.post("https://openrouter.ai/api/v1/chat/completions", timeout=600,
                          headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"}, json=body)
        d = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"error": r.text[:300]}
        u = d.get("usage") or {}
        rec = {"ts": dt.datetime.now().isoformat(timespec="seconds"), "model": MODELS[model_key], "task": name,
               "status": r.status_code, "provider": d.get("provider"), "secs": round(time.time() - t0, 1),
               "prompt_tokens": u.get("prompt_tokens"), "audio_tokens": (u.get("prompt_tokens_details") or {}).get("audio_tokens"),
               "completion_tokens": u.get("completion_tokens"), "cost": u.get("cost"),
               "finish": (d.get("choices") or [{}])[0].get("finish_reason")}
        LOG.parent.mkdir(exist_ok=True)
        with open(LOG, "a") as f:
            f.write(json.dumps(rec) + "\n")
        if r.status_code == 200 and d.get("choices"):
            txt = d["choices"][0]["message"].get("content") or ""
            try:
                return json.loads(txt), rec
            except json.JSONDecodeError:
                pass  # rare: retry
        time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"{name} on {model_key} failed: {json.dumps(d)[:400]}")


SCORE_KEYS = ["vocal_performance", "diction", "arrangement", "dynamics_variety", "tone_fit", "intro_fit",
              "chorus_hook", "production", "overall"]
REVIEW_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["summary", "scores", "sections", "problems", "best_moment", "garbled_lyrics", "shortlist"],
    "properties": {
        "summary": {"type": "string", "description": "two or three sentences: what this take is like and how it fits the brief"},
        "scores": {"type": "object", "additionalProperties": False, "required": SCORE_KEYS,
                   "properties": {k: {"type": "integer", "description": "1-10"} for k in SCORE_KEYS}},
        "sections": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                     "required": ["start", "end", "section", "verdict", "note"],
                     "properties": {"start": {"type": "string"}, "end": {"type": "string"}, "section": {"type": "string"},
                                    "verdict": {"type": "string", "enum": ["strong", "ok", "weak"]}, "note": {"type": "string"}}}},
        "problems": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                     "required": ["time", "issue", "severity"],
                     "properties": {"time": {"type": "string"}, "issue": {"type": "string"},
                                    "severity": {"type": "string", "enum": ["minor", "major"]}}}},
        "best_moment": {"type": "object", "additionalProperties": False, "required": ["time", "why"],
                        "properties": {"time": {"type": "string"}, "why": {"type": "string"}}},
        "garbled_lyrics": {"type": "array", "items": {"type": "string"},
                           "description": "lyric lines you could not make out or that were sung wrongly or skipped"},
        "shortlist": {"type": "boolean", "description": "would you put this take on a shortlist of the best few?"},
    },
}
PAIR_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["winner", "confidence", "reasons", "section_winners"],
    "properties": {
        "winner": {"type": "string", "enum": ["A", "B", "tie"]},
        "confidence": {"type": "integer", "description": "1 (coin flip) to 5 (clear)"},
        "reasons": {"type": "array", "items": {"type": "string"}},
        "section_winners": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                            "required": ["section", "winner", "why"],
                            "properties": {"section": {"type": "string"}, "winner": {"type": "string", "enum": ["A", "B", "tie"]},
                                           "why": {"type": "string"}}}},
    },
}


def review(path: Path, model_key: str):
    out = EAR / f"{path.stem}.{model_key}.json"
    if out.exists():
        return json.loads(out.read_text())
    style = path.stem.rsplit("_", 1)[0]
    content = [{"type": "text", "text": f"{BRIEF}\n\nStyle requested: {STYLE_NAMES.get(style, style)}.\n\nLyrics as written "
                                        f"(section names in brackets):\n{lyrics_text()}\n\nListen to the whole take, then "
                                        f"give your notes. Sections: one entry per section you hear, with times."},
               {"type": "input_audio", "input_audio": {"data": to_mp3_b64(path), "format": "mp3"}}]
    res, rec = call(model_key, content, REVIEW_SCHEMA, "take_review")
    res["_meta"] = rec
    EAR.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(res, indent=1))
    return res


def compare_pair(a: Path, b: Path, model_key: str, cache: dict):
    key = f"{a.stem}|{b.stem}"
    if key in cache:
        return cache[key]
    content = [{"type": "text", "text": f"{BRIEF}\n\nTwo takes of the same song in the same style. Take A first, then "
                                        f"take B. Which would you choose for the video, and which wins each section?\n\n"
                                        f"Lyrics:\n{lyrics_text()}"},
               {"type": "text", "text": "Take A:"}, {"type": "input_audio", "input_audio": {"data": to_mp3_b64(a), "format": "mp3"}},
               {"type": "text", "text": "Take B:"}, {"type": "input_audio", "input_audio": {"data": to_mp3_b64(b), "format": "mp3"}}]
    res, rec = call(model_key, content, PAIR_SCHEMA, "pair_compare")
    res["_meta"] = rec
    cache[key] = res
    return res


def compare(style: str, model_key: str):
    takes = sorted((ROOT / "audio/takes/dgq").glob(f"{style}_*.wav"))
    out = EAR / f"pairs_{style}.{model_key}.json"
    cache = json.loads(out.read_text()) if out.exists() else {}
    jobs = [(a, b) for a, b in itertools.permutations(takes, 2)]  # both orders: position bias cancels
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(lambda ab: compare_pair(ab[0], ab[1], model_key, cache), jobs))
    EAR.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(cache, indent=1))
    wins = {t.stem: 0.0 for t in takes}
    for k, v in cache.items():
        a, b = k.split("|")
        if v["winner"] == "A":
            wins[a] += 1
        elif v["winner"] == "B":
            wins[b] += 1
        else:
            wins[a] += .5
            wins[b] += .5
    first = sum(v["winner"] == "A" for v in cache.values()) / max(1, len(cache))
    print(f"{style} [{model_key}] wins out of {2 * (len(takes) - 1)}: " +
          ", ".join(f"{k.rsplit('_', 1)[1]} {v:g}" for k, v in sorted(wins.items(), key=lambda kv: -kv[1])) +
          f"   (take A chosen {first:.0%} of the time: position bias check)")
    return wins


ENERGY = ["very low", "low", "medium", "high", "very high"]
DESCRIBE_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["character", "instruments", "voices", "sections", "moments", "unsure"],
    "properties": {
        "character": {"type": "string", "description": "one sentence: what this recording is like overall"},
        "instruments": {"type": "array", "items": {"type": "string"}, "description": "instruments or sound sources you hear"},
        "voices": {"type": "string", "description": "the voices: who sings, solo or stacked, delivery"},
        "sections": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                     "required": ["section", "what_you_hear", "energy"],
                     "properties": {"section": {"type": "string"},
                                    "what_you_hear": {"type": "string", "description": "instruments/voices present, texture, delivery, anything notable"},
                                    "energy": {"type": "string", "enum": ENERGY}}}},
        "moments": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["time", "what"],
                    "properties": {"time": {"type": "string", "description": "m:ss"}, "what": {"type": "string"}}},
                    "description": "4-8 moments a listener could jump to"},
        "unsure": {"type": "array", "items": {"type": "string"}, "description": "things you could not tell"},
    },
}
CONTRAST_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["takes", "biggest_differences"],
    "properties": {
        "takes": {"type": "array", "items": {"type": "object", "additionalProperties": False,
                  "required": ["letter", "one_line", "how_it_differs"],
                  "properties": {"letter": {"type": "string"}, "one_line": {"type": "string"},
                                 "how_it_differs": {"type": "string", "description": "what sets it apart from the other takes"}}}},
        "biggest_differences": {"type": "array", "items": {"type": "string"}},
    },
}
DESCRIBE_BRIEF = """You are a music analyst writing listening notes. DESCRIBE what you hear; do not judge quality, rank, or
score. Be concrete (name instruments and vocal textures, say when things enter or drop out, how loud and dense each part
is relative to the rest of the recording). Give times as m:ss. If you cannot tell something, put it under "unsure" rather
than guessing."""


def timeline(stem):
    """The take's section windows (the shoot-out page's), as 'Name m:ss-m:ss' lines. Names and times only: no arrangement
    cues, so Gemini describes what it hears rather than what Suno was asked for."""
    sys.path.insert(0, str(ROOT / "tools"))
    from build_shootout_page import section_rows, windows
    from lyricfmt import parse
    from suno_prep import SOURCES
    man = {t["id"]: t for t in json.loads((ROOT / "audio/takes/dgq/manifest.json").read_text())["takes"]}
    rows = section_rows(parse(SOURCES["dgq"]))
    wins = windows(man[stem], len(rows))
    fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02d}"  # noqa: E731
    return [r["name"] for r in rows], "\n".join(f"{r['name']}: {fmt(a)}-{fmt(b)}" for r, (a, b) in zip(rows, wins))


def describe(path: Path, model_key: str):
    out = EAR / f"{path.stem}.describe.{model_key}.json"
    if out.exists():
        return json.loads(out.read_text())
    names, tl = timeline(path.stem)
    content = [{"type": "text", "text": f"{DESCRIBE_BRIEF}\n\nSection timeline (from aligning the lyrics to this recording):\n{tl}\n\n"
                                        f"Give exactly one sections entry per timeline line, in order, using these names."},
               {"type": "input_audio", "input_audio": {"data": to_mp3_b64(path), "format": "mp3"}}]
    res, rec = call(model_key, content, DESCRIBE_SCHEMA, "take_describe", effort="low")
    if [s["section"] for s in res["sections"]] != names:   # map by order when the names drift; refuse a count mismatch
        if len(res["sections"]) != len(names):
            raise RuntimeError(f"{path.stem} {model_key}: {len(res['sections'])} sections for {len(names)}")
        for s, n in zip(res["sections"], names):
            s["section"] = n
    res["_meta"] = rec
    EAR.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(res, indent=1))
    return res


def contrast(style: str, model_key: str):
    """The four takes of a style in one call, labelled with the shoot-out page's letters (output/shootout_dgq/key.json)."""
    out = EAR / f"contrast_{style}.{model_key}.json"
    if out.exists():
        return json.loads(out.read_text())
    key = json.loads((ROOT / "output/shootout_dgq/key.json").read_text())
    letters = sorted((k.split(":")[1], v["take"]) for k, v in key.items() if k.split(":")[0] == style)
    content = [{"type": "text", "text": f"{DESCRIBE_BRIEF}\n\nFour recordings of the same song in the same style follow, "
                                        f"labelled {', '.join(L for L, _ in letters)}. Describe how they DIFFER from one "
                                        f"another, so a listener knows what to expect from each."}]
    for L, take in letters:
        content += [{"type": "text", "text": f"Take {L}:"},
                    {"type": "input_audio", "input_audio": {"data": to_mp3_b64(ROOT / "audio/takes/dgq" / f"{take}.wav"), "format": "mp3"}}]
    res, rec = call(model_key, content, CONTRAST_SCHEMA, "style_contrast", effort="low")
    res["_meta"] = rec
    res["_letters"] = dict(letters)
    out.write_text(json.dumps(res, indent=1))
    return res


def summary():
    liked = {t["take"]: t.get("liked") for t in json.loads(TAKES.read_text())["takes"]}
    rows = []
    for f in sorted(EAR.glob("*.json")):
        if f.name.startswith("pairs_"):
            continue
        take, model = f.stem.rsplit(".", 1)
        r = json.loads(f.read_text())
        rows.append((take, model, r["scores"]["overall"], r["scores"]["tone_fit"], r["scores"]["intro_fit"],
                     r["shortlist"], liked.get(take)))
    print(f"{'take':26s} {'model':6s} overall tone intro shortlist neel_liked")
    for row in rows:
        print(f"{row[0]:26s} {row[1]:6s} {row[2]:>7} {row[3]:>4} {row[4]:>5} {str(row[5]):>9} {str(row[6]):>10}")
    spent = sum((json.loads(l).get("cost") or 0) for l in LOG.read_text().splitlines()) if LOG.exists() else 0
    print(f"spent so far: ${spent:.3f}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("review")
    r.add_argument("takes", nargs="+")
    r.add_argument("--models", default="pro,flash")
    c = sub.add_parser("compare")
    c.add_argument("style")
    c.add_argument("--models", default="pro,flash")
    sub.add_parser("summary")
    d = sub.add_parser("describe")
    d.add_argument("takes", nargs="+")
    d.add_argument("--models", default="pro,flash")
    k = sub.add_parser("contrast")
    k.add_argument("style")
    k.add_argument("--models", default="pro")
    a = ap.parse_args()
    if a.cmd == "review":
        jobs = [(Path(t).resolve(), m) for t in a.takes for m in a.models.split(",")]
        with ThreadPoolExecutor(4) as ex:
            for (p, m), res in zip(jobs, ex.map(lambda j: review(*j), jobs)):
                s = res["scores"]
                print(f"{p.stem:26s} {m:5s} overall {s['overall']:>2} tone {s['tone_fit']:>2} intro {s['intro_fit']:>2} "
                      f"dyn {s['dynamics_variety']:>2} diction {s['diction']:>2} shortlist {res['shortlist']}  ${res['_meta']['cost']}")
    elif a.cmd == "compare":
        for m in a.models.split(","):
            compare(a.style, m)
    elif a.cmd == "describe":
        jobs = [(Path(t).resolve(), m) for t in a.takes for m in a.models.split(",")]
        with ThreadPoolExecutor(4) as ex:
            for (p, m), res in zip(jobs, ex.map(lambda j: describe(*j), jobs)):
                print(f"{p.stem:26s} {m:5s} {res['character'][:110]}  ${res['_meta']['cost']}")
    elif a.cmd == "contrast":
        for m in a.models.split(","):
            res = contrast(a.style, m)
            for t in res["takes"]:
                print(f"{a.style} [{m}] {t['letter']}: {t['one_line']}")
    else:
        summary()


if __name__ == "__main__":
    main()
