"""Measure what each take is like, section by section: the ground truth for checking Gemini's descriptions (I can't hear).

Neel (1 Oct): "Can you use Gemini for analysis just to get more data on what each one is like?" Gemini describes; this
measures, so each descriptive claim can be checked ("verse 6 is just voice" -> did the backing actually drop?).

Per section (the shoot-out page's windows, from forced alignment):
  mix_db / vox_db / acc_db   RMS level of the mix, the Demucs vocal stem and the backing stem (no_vocals)
  acc_vs_vox                 backing minus vocal, dB: low = stripped back under the voice, high = a wall of sound
  onsets_per_s               rhythmic busyness of the mix
  bright_hz                  mean spectral centroid (dark strings vs bright synths / sibilant stacks)
Per take: tempo, overall key, the transposition from chorus 1 to the final chorus (a key change), section dynamic range,
and a 1-second loudness curve for the page's sparkline.

Usage: .venv/bin/python tools/take_profile.py audio/takes/dgq/acappella_solo_*.wav ...
Writes audio/qa/dgq/profile/<take>.json. Reads audio/takes/dgq/manifest.json (song_qa) and the cached Demucs stems.
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "audio/qa/dgq/profile"
SR = 22050
HOP = 512
NAMES = "C C# D D# E F F# G G# A A# B".split()
# Krumhansl-Kessler key profiles
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def corr(a, b):
    a, b = a - a.mean(), b - b.mean()
    d = np.sqrt((a * a).sum() * (b * b).sum())
    return float((a * b).sum() / d) if d else 0.0


def key_name(chroma):
    cands = [(corr(np.roll(MAJ, k), chroma), f"{NAMES[k]} major") for k in range(12)] + \
            [(corr(np.roll(MIN, k), chroma), f"{NAMES[k]} minor") for k in range(12)]
    return max(cands)[1]


def transposition(c_from, c_to):
    """Semitones that best map pitch-class profile c_from onto c_to (+ = up), and how much better that fits than no
    shift. Comparing two sections' profiles directly is robust to the major/relative-minor confusion of key naming."""
    fits = [corr(np.roll(c_from, k), c_to) for k in range(12)]
    best = int(np.argmax(fits))
    return (best if best <= 6 else best - 12), round(fits[best] - fits[0], 3)


def db(x):
    return round(float(20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-9)), 1)


def load(path):
    import librosa
    y, _ = librosa.load(str(path), sr=SR, mono=True)
    return y


def profile(wav: Path, take: dict, rows):
    import librosa
    from build_shootout_page import windows
    from vocal_qa import separate
    voc_path = separate(wav)
    mix, voc, acc = load(wav), load(voc_path), load(voc_path.parent / "no_vocals.wav")
    wins = windows(take, len(rows))
    if wins is None:
        raise SystemExit(f"{wav.stem}: alignment lost a section; rerun song_qa")
    onsets = librosa.onset.onset_detect(y=mix, sr=SR, hop_length=HOP, units="time")
    chroma = librosa.feature.chroma_cqt(y=mix, sr=SR, hop_length=HOP)
    cent = librosa.feature.spectral_centroid(y=mix, sr=SR, hop_length=HOP)[0]
    fr = lambda t: int(t * SR / HOP)  # noqa: E731
    secs, chromas = [], []
    for row, (w0, w1) in zip(rows, wins):
        a, b = int(w0 * SR), int(w1 * SR)
        c = chroma[:, fr(w0):max(fr(w1), fr(w0) + 1)].mean(axis=1)
        chromas.append(c)
        v, k = db(voc[a:b]), db(acc[a:b])
        secs.append({"name": row["name"], "t0": w0, "t1": w1, "mix_db": db(mix[a:b]), "vox_db": v, "acc_db": k,
                     "acc_vs_vox": round(k - v, 1),
                     "onsets_per_s": round(float(((onsets >= w0) & (onsets < w1)).sum() / max(.1, w1 - w0)), 2),
                     "bright_hz": int(cent[fr(w0):max(fr(w1), fr(w0) + 1)].mean()), "key": key_name(c)})
    tempo, _ = librosa.beat.beat_track(y=mix, sr=SR, hop_length=HOP)
    names = [s["name"] for s in secs]
    final, ch1 = names.index("Final Chorus"), names.index("Chorus 1")
    shift, gain = transposition(chromas[ch1], chromas[final])
    levels = [s["mix_db"] for s in secs[1:]]   # the intro is a single line: leave it out of the range
    sec_len = SR
    curve = [db(mix[i:i + sec_len]) for i in range(0, len(mix), sec_len)]
    top = max(curve)
    return {"take": wav.stem, "duration_s": round(len(mix) / SR, 1),
            "tempo_bpm": round(float(np.atleast_1d(tempo)[0]), 1), "key": key_name(np.mean(chromas, axis=0)),
            "key_change": {"from": "Chorus 1", "to": "Final Chorus", "semitones": shift, "fit_gain": gain},
            "section_range_db": round(max(levels) - min(levels), 1),
            "loudest": secs[1 + int(np.argmax(levels))]["name"], "quietest": secs[1 + int(np.argmin(levels))]["name"],
            "sections": secs, "curve_db": [round(c - top, 1) for c in curve]}


def main():
    from build_shootout_page import section_rows
    from lyricfmt import parse
    from suno_prep import SOURCES
    man = {t["id"]: t for t in json.loads((ROOT / "audio/takes/dgq/manifest.json").read_text())["takes"]}
    rows = section_rows(parse(SOURCES["dgq"]))
    OUT.mkdir(parents=True, exist_ok=True)
    for f in sys.argv[1:]:
        wav = Path(f).resolve()
        p = profile(wav, man[wav.stem], rows)
        (OUT / f"{wav.stem}.json").write_text(json.dumps(p, indent=1))
        kc = p["key_change"]
        print(f"{p['take']:24s} {p['tempo_bpm']:6.1f} BPM  {p['key']:9s}  key change {kc['semitones']:+d} (gain {kc['fit_gain']})  "
              f"range {p['section_range_db']} dB  loudest {p['loudest']}, quietest {p['quietest']}")


if __name__ == "__main__":
    main()
