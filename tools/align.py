"""Word-level lyric timing: force-align the KNOWN sung lyrics to the vocal stem.

Never transcribe to get timing (transcribers mangle jargon); align the text we wrote.

Usage:
  python tools/align.py song.mp3 --lyr lyrics/finalists/one_direction/v9.lyr --out audio/<name>/lyrics.json
  (optional) --eleven-json audio/.../x.json   use ElevenLabs' own word timestamps instead

Pipeline: Demucs vocal stem (cached, shared with vocal_qa.py) → stable-ts `align()` with the sung
text (ad-libs in parentheses kept, since they're sung) → words mapped back onto the .lyr lines
(display text, refs, notes) → lyrics.json:
  {lines:[{i, section, display, sung, refs, note, t0, t1, words:[{w, t0, t1, p}]}], stats:{...}}
Low-probability words are reported so they can be nudged by hand (expect 50–150 ms fixes).
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyricfmt import parse  # noqa: E402
from syllables import strip_directions  # noqa: E402
from vocal_qa import separate  # noqa: E402


def _rel(p):
    """`p` as a path from the repo root when it lies inside the repo (so lyrics.json carries no home path)."""
    p = Path(p).resolve()
    root = Path(__file__).resolve().parents[1]
    return str(p.relative_to(root)) if p.is_relative_to(root) else str(p)


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--lyr", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="medium.en")
    ap.add_argument("--no-sep", action="store_true")
    ap.add_argument("--cut", default=None, help="cut_<ver>.json: skip the lines cut for length (they are never sung)")
    ap.add_argument("--only", default=None, help="comma-separated global line indices to align (for short clips)")
    a = ap.parse_args()
    out = align(Path(a.audio), Path(a.lyr), Path(a.out), a.model, a.no_sep,
                set(json.loads(Path(a.cut).read_text())["cut"]) if a.cut else set(),
                {int(x) for x in a.only.split(",")} if a.only else None)
    for l in out["lines"]:
        print(f"{l['t0']!s:>8} {l['t1']!s:>8}  {l['display'][:70]}")
    print(f"{len(out['stats']['low_prob_words'])} low-probability words (<0.3) — check these by ear/eye")


def align(audio, lyr, out_path, model_name="medium.en", no_sep=False, cut=frozenset(), only=None):
    """Force-align the kept sung lines of `lyr` to `audio`; writes and returns the lyrics.json dict."""
    song = parse(lyr)
    lines = []
    k = -1
    for sec in song["sections"]:
        for ln in sec["lines"]:
            k += 1
            if k in cut or (only is not None and k not in only):
                continue
            sung = strip_directions(ln["sung"])
            sung = sung.replace("—", " ").replace("…", " ")
            words = [w for w in re.split(r"\s+", sung) if norm(w)]
            lines.append({"k": k, "section": sec["tag"].split("|")[0].strip(), "display": ln["display"], "sung": ln["sung"],
                          "refs": ln["refs"], "note": ln["note"], "sung_words": words})
    text = "\n".join(" ".join(l["sung_words"]) for l in lines)
    audio = Path(audio).resolve()
    voc = audio if no_sep else separate(audio)
    import stable_whisper
    model = stable_whisper.load_model(model_name)
    res = model.align(str(voc), text, language="en", original_split=True)
    aligned = [w for seg in res.segments for w in seg.words]
    # map aligned words back to our lines sequentially (alignment preserves the text order)
    k = 0
    lowp = []
    for i, l in enumerate(lines):
        ws = []
        for w in l["sung_words"]:
            while k < len(aligned) and not norm(aligned[k].word):
                k += 1
            if k >= len(aligned):
                break
            aw = aligned[k]
            ws.append({"w": w, "t0": round(aw.start, 3), "t1": round(aw.end, 3), "p": round(float(aw.probability or 0), 3)})
            if (aw.probability or 0) < 0.3:
                lowp.append((i, w, round(aw.start, 2)))
            k += 1
        l["i"] = i
        l["words"] = ws
        l["t0"] = ws[0]["t0"] if ws else None
        l["t1"] = ws[-1]["t1"] if ws else None
        del l["sung_words"]
    out = {"audio": _rel(audio), "lyr": _rel(lyr), "lines": lines,
           "stats": {"n_words": sum(len(l["words"]) for l in lines), "low_prob_words": lowp}}
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(json.dumps(out, indent=1))
    return out


if __name__ == "__main__":
    main()
