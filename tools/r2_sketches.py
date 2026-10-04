"""Round-2 sung sketches: two short ElevenLabs Music renders per finalist (a chorus and its signature moment).

The sung lines are pulled from the .lyr source (never retyped), so a sketch always matches the lyric on the page.
Usage:
  python tools/r2_sketches.py --dry            # print the specs and estimated credits, call nothing
  python tools/r2_sketches.py                  # render every sketch that doesn't exist yet (2 in parallel: the plan's limit)
  python tools/r2_sketches.py --qa             # run tools/vocal_qa.py on each rendered sketch (sequential)
  python tools/r2_sketches.py --plan lyrics/round3/sketch_plan_r3.json [--dry|--qa]   # another round's plan:
      {"src": "lyrics/round3/rD", "out": "audio/sketches/r3", "seed": 31,
       "sketches": {"<name>": ["<draft slug>", [[section, first, last_or_null], ...], bpm, ["style", ...], "QA terms"]},
       "reuse": {"<name>": "audio/sketches/.../<stem>"}}
Outputs: audio/sketches/r2/<name>.{mp3,json,spec.json,sung.txt} (+ .qa.json/.qa.txt with --qa).
Cost: ~900 ElevenLabs credits per minute of audio (so ~350 per 24 s sketch); the sketch budget was ~50k credits.
"""
import argparse
import json
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from lyricfmt import parse  # noqa: E402

SRC = ROOT / "lyrics/round2/rE"
OUT = ROOT / "audio/sketches/r2"
SEED = 29
BASE = ["K-pop girl-group synth-pop", "clear bright female lead vocal, crisp enunciation, dry upfront vocal"]
NEG = ["heavy reverb", "mumbled vocals", "distorted vocals", "long instrumental intro"]

# name -> (draft, [(section index, first line, last line exclusive or None)], bpm, extra styles, QA key terms)
SKETCHES = {
    "12_chorus": ("12_dont_go_quiet", [(0, 0, None), (2, 0, None)], 128,
                  ["minor-key synth-pop, pleading and emotional", "girl-group unison on the hook"], ""),
    "12_ending": ("12_dont_go_quiet", [(14, 0, None)], 128,
                  ["minor-key synth-pop, full band", "the band cuts out abruptly on the last word"], ""),
    "11_golden_gate": ("11_whats_on_your_mind", [(3, 2, None), (4, 0, None)], 124,
                       ["girl-group unison asks the question", "robotic vocoder voice shouts the answer"], "Golden Gate"),
    "11_ending": ("11_whats_on_your_mind", [(14, 0, None)], 124,
                  ["half-time, sparse and intimate", "soft robotic vocoder voice speaks the answer, then the lead sings"], ""),
    "20_chorus": ("20_long_distance", [(0, 0, None), (2, 0, None)], 124,
                  ["bittersweet synth-pop", "girl-group echo on the hook"], ""),
    "20_killing_part": ("20_long_distance", [(7, 3, None), (8, 0, None)], 124,
                        ["stop-time chorus, the band drops out", "backing vocal answers back"], "Sonnet"),
    "18_chorus": ("18_vows", [(2, 2, None), (3, 0, None)], 124,
                  ["wedding pop, church-organ chord, bright synths", "girl-group unison on 'I do'"], "Golden Gate"),
    "18_ending": ("18_vows", [(12, 0, None)], 124,
                  ["half-time wedding ballad, organ and one synth", "tender and uncertain"], ""),
    "19_chorus": ("19_mind_reader_act", [(2, 0, None), (3, 0, None)], 124,
                  ["cabaret magic-show flair, drumroll, bright synths", "girl-group unison on the hook"], ""),
    "19_killing_part": ("19_mind_reader_act", [(7, 3, 5), (8, 0, None)], 124,
                        ["cabaret magic-show flair, bright synths", "girl-group unison on the hook"], ""),
    # The control's chorus is word-for-word round 1's "Read Your Mind" chorus: reuse audio/sketches/final/read_your_mind_chorus.
    "01_ending": ("01_b_cons", [(14, 0, 2), (14, 5, None), (15, 0, None)], 124,  # the turn + the reprise (skips the desk)
                  ["cold minor-key synth, sparse", "half-time reprise, one voice, key down"], "Astra"),
}
REUSE = {"01_chorus": ROOT / "audio/sketches/final/read_your_mind_chorus"}
GENRE_BASE = True  # round 2 forced its K-pop genre into every sketch; a plan with its own "base" styles turns this off


def load_plan(path):
    """Swap in another round's plan (the constants above are round 2's, kept as the default for reproducibility)."""
    global SRC, OUT, SEED, SKETCHES, REUSE, BASE, NEG, GENRE_BASE
    plan = json.loads(Path(path).read_text())
    if "base" in plan:  # per-song genres live in each sketch's styles; base = the shared vocal/production asks
        BASE, GENRE_BASE = plan["base"], False
    NEG = plan.get("negative", NEG)
    SRC, OUT = ROOT / plan["src"], ROOT / plan["out"]
    SEED = plan.get("seed", SEED)
    SKETCHES = {k: (v[0], [tuple(x) for x in v[1]], v[2], v[3], v[4]) for k, v in plan["sketches"].items()}
    REUSE = {k: ROOT / v for k, v in plan.get("reuse", {}).items()}


def section_name(tag):
    return tag.split("|")[0].strip()


def build(name):
    draft, picks, bpm, styles, terms = SKETCHES[name]
    song = parse(SRC / f"{draft}.lyr")
    text, sung, last = [], [], None
    for si, a, b in picks:
        sec = song["sections"][si]
        lines = sec["lines"][a:b]
        # skip spoken asides: the sketch is for the sung melody
        lines = [ln for ln in lines if not ln["sung"].lower().startswith("(spoken")]
        if si != last:
            text.append(f"[{section_name(sec['tag'])}]")
        last = si
        text += [ln["sung"] for ln in lines]
        sung += [ln["sung"] for ln in lines]
    n = len(sung)
    bars = 2 * n + 2  # two bars per sung line plus a two-bar lead-in (the project's bar model)
    ms = int(round(bars * 4 * 60 / bpm, 0)) * 1000
    spec = {"chunks": [{"text": "\n".join(text), "duration_ms": min(ms, 34000),
                        "positive_styles": ([f"{bpm} BPM"] + BASE[:1] + styles + BASE[1:]) if GENRE_BASE
                        else ([f"{bpm} BPM"] + styles + BASE),
                        "negative_styles": NEG, "context_adherence": "high"}], "seed": SEED}
    return spec, sung, terms


def render(name):
    from eleven_music import compose
    spec, sung, _ = build(name)
    out = OUT / name
    if out.with_suffix(".mp3").exists():
        return {"out": str(out), "skipped": True}
    (OUT / f"{name}.spec.json").write_text(json.dumps(spec, indent=1))
    (OUT / f"{name}.sung.txt").write_text("\n".join(sung))
    return compose(spec, out, SEED)


def qa(name):
    _, _, terms = build(name) if name in SKETCHES else (None, None, "")
    mp3 = OUT / f"{name}.mp3"
    py = ROOT / ".venv/bin/python"  # the uv venv has Demucs, mlx-whisper and soundfile; the system python does not
    cmd = [str(py if py.exists() else sys.executable), str(ROOT / "tools/vocal_qa.py"), str(mp3), "--lyrics", str(OUT / f"{name}.sung.txt"),
           "--json", str(OUT / f"{name}.qa.json")] + (["--terms", terms] if terms else [])
    r = subprocess.run(cmd, capture_output=True, text=True)
    (OUT / f"{name}.qa.txt").write_text(r.stdout + r.stderr[-2000:])
    return r.stdout


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry", action="store_true")
    p.add_argument("--qa", action="store_true")
    p.add_argument("--only", default="")
    p.add_argument("--plan", default="")
    a = p.parse_args()
    if a.plan:
        load_plan(a.plan)
    names = [n for n in SKETCHES if not a.only or n in a.only.split(",")]
    OUT.mkdir(parents=True, exist_ok=True)
    if a.dry:
        total = 0
        for n in names:
            spec, sung, _ = build(n)
            c = spec["chunks"][0]
            total += c["duration_ms"]
            print(f"== {n}  {c['duration_ms'] / 1000:.0f}s  {c['positive_styles']}\n{c['text']}\n")
        print(f"{len(names)} sketches, {total / 1000:.0f}s, ~{total / 60000 * 900:.0f} credits")
        return
    if a.qa:
        for n in names:
            print(f"== {n}\n{qa(n)}")
        return
    for k, src in REUSE.items():  # copy reused sketches so the page reads one folder
        for ext in (".mp3", ".sung.txt", ".qa.txt", ".qa.json"):
            if src.with_suffix(ext).exists() and not (OUT / f"{k}{ext}").exists():
                (OUT / f"{k}{ext}").write_bytes(src.with_suffix(ext).read_bytes())
    with ThreadPoolExecutor(2) as ex:  # the account's concurrency limit
        for n, rec in zip(names, ex.map(render, names)):
            print(n, json.dumps(rec))


if __name__ == "__main__":
    main()
