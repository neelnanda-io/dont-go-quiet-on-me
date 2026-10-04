"""Check Gemini's descriptions of each take against what tools/take_profile.py measured, so the page can say which of
its claims hold up. (Neel wanted Gemini for "more data on what each one is like"; it also invents things.)

Checks per take and model:
  energy_rho     Spearman between Gemini's per-section energy calls (very low .. very high) and measured loudness
  level_claims   each section Gemini calls (very) low / (very) high: is it measurably below / above the take's median?
  key_change     does Gemini mention a key change exactly when the measurements find one (shift != 0, fit gain >= 0.2)?
Usage: python3 tools/describe_check.py   -> audio/qa/dgq/ear/check.json and a printed table
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EAR = ROOT / "audio/qa/dgq/ear"
PROFILE = ROOT / "audio/qa/dgq/profile"
ENERGY = {"very low": 1, "low": 2, "medium": 3, "high": 4, "very high": 5}
KC = re.compile(r"key change|modulat|changes key|up a (half |whole )?step|shifts? (up )?(a |one )?(semitone|tone|key)|lifts? (to|into) a (new|higher) key", re.I)
MIN_GAIN = 0.2   # take_profile.transposition fit gain below this is noise (seen: -5 shifts at 0.03-0.11 in a cappella takes)


def ranks(xs):
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    r = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        for k in range(i, j + 1):
            r[order[k]] = (i + j) / 2 + 1
        i = j + 1
    return r


def spearman(a, b):
    ra, rb = ranks(a), ranks(b)
    ma, mb = sum(ra) / len(ra), sum(rb) / len(rb)
    num = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    den = (sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb)) ** .5
    return round(num / den, 3) if den else 0.0


def mentions_key_change(texts):
    return any(KC.search(t or "") for t in texts)


def level_claims(calls, secs, quiet=-1.5, loud=1.0):
    """Sections 1.. (the intro is one line and always quiet): a low/very-low call must sit >=1.5 dB under the take's
    median section level, a high/very-high call >=1 dB over it. Medium calls make no claim."""
    levels = sorted(s["mix_db"] for s in secs[1:])
    med = levels[len(levels) // 2] if len(levels) % 2 else (levels[len(levels) // 2 - 1] + levels[len(levels) // 2]) / 2
    out = []
    for i, (c, s) in enumerate(zip(calls, secs)):
        if i == 0 or c == "medium":
            continue
        rel = round(s["mix_db"] - med, 1)
        ok = rel <= quiet if c in ("low", "very low") else rel >= loud
        out.append({"i": i, "call": c, "rel_db": rel, "ok": ok})
    return out


def check(take):
    prof = json.loads((PROFILE / f"{take}.json").read_text())
    kc = prof["key_change"]
    measured_kc = kc["semitones"] != 0 and kc["fit_gain"] >= MIN_GAIN
    res = {"take": take, "measured_key_change": kc["semitones"] if measured_kc else 0, "models": {}}
    for m in ("pro", "flash"):
        f = EAR / f"{take}.describe.{m}.json"
        if not f.exists():
            continue
        d = json.loads(f.read_text())
        calls = [s["energy"] for s in d["sections"]]
        texts = [s["what_you_hear"] for s in d["sections"]] + [x["what"] for x in d["moments"]] + [d["character"]]
        lc = level_claims(calls, prof["sections"])
        res["models"][m] = {"energy_rho": spearman([ENERGY[c] for c in calls], [s["mix_db"] for s in prof["sections"]]),
                            "level_claims_ok": f"{sum(x['ok'] for x in lc)}/{len(lc)}", "level_claims": lc,
                            "says_key_change": mentions_key_change(texts),
                            "key_change_agrees": mentions_key_change(texts) == measured_kc}
    return res


def main():
    takes = sorted(p.stem for p in PROFILE.glob("*.json"))
    out = [check(t) for t in takes]
    (EAR / "check.json").write_text(json.dumps(out, indent=1))
    print(f"{'take':24s} {'key chg':>7s} | {'model':5s} {'rho':>5s} {'lvl ok':>6s} {'says kc':>7s} agrees")
    for r in out:
        for m, v in r["models"].items():
            print(f"{r['take']:24s} {r['measured_key_change']:+7d} | {m:5s} {v['energy_rho']:5.2f} {v['level_claims_ok']:>6s} "
                  f"{str(v['says_key_change']):>7s} {v['key_change_agrees']}")


if __name__ == "__main__":
    main()
