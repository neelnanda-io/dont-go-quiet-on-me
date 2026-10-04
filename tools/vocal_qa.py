"""Sung-vocal QA: can a listener actually hear the words? (I can't hear; this is my ear.)

Pipeline for one audio file:
  1. Demucs (htdemucs) separates the vocal stem (cached under audio/stems/).
  2. Two independent transcribers, UNPROMPTED (so they don't just echo the lyrics):
     OpenAI gpt-4o-transcribe (cloud) and local mlx-whisper large-v3-turbo.
  3. Word-level diff against the expected SUNG lyrics; per-line recall; and a list of
     key terms (jargon) that neither / one / both transcribers heard.
  4. Technical checks: duration, integrated loudness (LUFS), true-peak-ish max,
     clipping, and dead air (>1.5 s of near-silence in the full mix).

Speech-recognition misses on jargon are FLAGS, not failures: the on-screen lyrics carry
jargon. A miss by BOTH transcribers is the strongest signal.

Usage:
  python tools/vocal_qa.py audio.mp3 --lyrics sung.txt [--terms "S-A-E,logit lens"] [--json out.json]
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from dotenv import load_dotenv, find_dotenv

# This searches up the directory tree until it finds a .env file
load_dotenv(find_dotenv(usecwd=True))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")  # also the repo root .env, wherever you run from

ROOT = Path(__file__).resolve().parent.parent
STEMS = ROOT / "audio" / "stems"
PY = ROOT / ".venv" / "bin" / "python"

NUM = {w: str(i) for i, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen "
    "sixteen seventeen eighteen nineteen twenty".split())}


def norm_words(s: str) -> list[str]:
    s = s.lower().replace("’", "'").replace("-", " ")
    s = re.sub(r"\(.*?\)", " ", s)          # drop ad-lib parentheses from expected text
    s = re.sub(r"\[.*?\]", " ", s)          # drop [Section] tags
    s = re.sub(r"'s\b", "", s)             # possessives/contractions: singularity's -> singularity
    s = s.replace("'", "")
    toks = re.findall(r"[a-z]+|\d+", s)
    return [NUM.get(t, t) for t in toks]


def separate(audio: Path) -> Path:
    """Vocal stem via Demucs, cached by CONTENT (<name>-<md5>): a re-render saved under the same file name must never
    reuse the old render's stem (bug of 30 Sep 2026: QA kept "hearing" a word the new render didn't sing)."""
    import hashlib
    import shutil
    import tempfile
    key = f"{audio.stem}-{hashlib.md5(audio.read_bytes()).hexdigest()[:10]}"
    out = STEMS / "htdemucs" / key / "vocals.wav"
    if out.exists():
        return out
    STEMS.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:  # Demucs names its output folder after the input file, so run it on a copy named <key>
        src = Path(td) / f"{key}{audio.suffix}"
        shutil.copyfile(audio, src)
        subprocess.run([str(PY), "-m", "demucs", "-n", "htdemucs", "--two-stems", "vocals",
                        "-o", str(STEMS), str(src)], check=True, capture_output=True)
    return out


def tx_openai(path: Path) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    # mp3 upload keeps it under the size limit
    mp3 = path.with_suffix(".qa.mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-ac", "1", "-b:a", "96k", str(mp3)], check=True)
    with open(mp3, "rb") as f:
        return client.audio.transcriptions.create(model="gpt-4o-transcribe", file=f).text


def tx_whisper(path: Path) -> str:
    import mlx_whisper
    r = mlx_whisper.transcribe(str(path), path_or_hf_repo="mlx-community/whisper-large-v3-turbo")
    return r["text"]


def line_recall(expected_lines, hyp_words):
    """For each expected line, the fraction of its words found in order in the transcript
    (via a global alignment), so we can see WHICH lines are unintelligible."""
    exp_words, owner = [], []
    for li, line in enumerate(expected_lines):
        for w in norm_words(line):
            exp_words.append(w)
            owner.append(li)
    sm = difflib.SequenceMatcher(None, exp_words, hyp_words, autojunk=False)
    hit = [False] * len(exp_words)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            hit[a + k] = True
    per = []
    for li, line in enumerate(expected_lines):
        idx = [k for k, o in enumerate(owner) if o == li]
        if idx:
            per.append((line, sum(hit[k] for k in idx) / len(idx)))
    total = sum(hit) / max(1, len(hit))
    return total, per


def term_heard(term: str, hyp: str) -> bool:
    """True if ANY '|'-separated spelling of the term appears as a word sequence in the transcript.
    Lyrics are sung from respellings ("SON-it") but transcribers write the real word ("Sonnet"): list both."""
    hw = norm_words(hyp)
    for alt in term.split("|"):
        tw = norm_words(alt)
        n = len(tw)
        if n and any(hw[i:i + n] == tw for i in range(len(hw) - n + 1)):
            return True
    return False


def tech_checks(audio: Path) -> dict:
    import pyloudnorm as pyln
    wav = audio.with_suffix(".qa.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(audio), "-ar", "44100", str(wav)], check=True)
    x, sr = sf.read(str(wav))
    if x.ndim == 1:
        x = x[:, None]
    mono = x.mean(axis=1)
    lufs = pyln.Meter(sr).integrated_loudness(x)
    peak = float(np.max(np.abs(x)))
    clip = int(np.sum(np.abs(x) > 0.999))
    # dead air: 50 ms frames under -50 dBFS RMS
    hop = int(0.05 * sr)
    rms = np.array([np.sqrt(np.mean(mono[i:i + hop] ** 2) + 1e-12) for i in range(0, len(mono) - hop, hop)])
    quiet = 20 * np.log10(rms) < -50
    gaps, run, start = [], 0, 0
    for i, q in enumerate(quiet):
        if q:
            if run == 0:
                start = i
            run += 1
        else:
            if run * 0.05 > 1.5:
                gaps.append((round(start * 0.05, 2), round(run * 0.05, 2)))
            run = 0
    if run * 0.05 > 1.5:
        gaps.append((round(start * 0.05, 2), round(run * 0.05, 2)))
    wav.unlink(missing_ok=True)
    return {"duration_s": round(len(mono) / sr, 2), "lufs": round(lufs, 1),
            "peak": round(peak, 3), "clipped_samples": clip, "dead_air": gaps}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("audio")
    p.add_argument("--lyrics", required=True, help="text file of SUNG lyrics, one line per sung line")
    p.add_argument("--terms", default="", help="comma-separated key terms to check")
    p.add_argument("--json", default="")
    p.add_argument("--no-sep", action="store_true", help="skip Demucs (audio is already a vocal)")
    a = p.parse_args()
    audio = Path(a.audio).resolve()
    lines = [l.strip() for l in Path(a.lyrics).read_text().splitlines()
             if l.strip() and not l.strip().startswith("[")]
    voc = audio if a.no_sep else separate(audio)
    t1 = tx_openai(voc)
    t2 = tx_whisper(voc)
    res = {"audio": str(audio), "tech": tech_checks(audio), "transcripts": {"gpt4o": t1, "whisper": t2}}
    for name, t in (("gpt4o", t1), ("whisper", t2)):
        tot, per = line_recall(lines, norm_words(t))
        res[f"recall_{name}"] = round(tot, 3)
        res[f"lines_{name}"] = [(l, round(r, 2)) for l, r in per]
    terms = [t.strip() for t in a.terms.split(",") if t.strip()]
    res["terms"] = {t: {"gpt4o": term_heard(t, t1), "whisper": term_heard(t, t2)} for t in terms}
    print(json.dumps(res["tech"]))
    print(f"recall gpt4o={res['recall_gpt4o']}  whisper={res['recall_whisper']}")
    for (l, r1), (_, r2) in zip(res["lines_gpt4o"], res["lines_whisper"]):
        flag = "  <-- both low" if max(r1, r2) < 0.6 else ""
        print(f"  {r1:.2f} {r2:.2f}  {l}{flag}")
    for t, h in res["terms"].items():
        print(f"  term {t!r}: gpt4o={h['gpt4o']} whisper={h['whisper']}")
    print("gpt4o:", t1)
    print("whisper:", t2)
    if a.json:
        Path(a.json).write_text(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
