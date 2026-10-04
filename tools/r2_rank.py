"""Rank round-2 lyric drafts from the judges' reviews.

Usage: python tools/r2_rank.py lyrics/judging/r2a    (reads every lyrics/judging/r2a_<slug>/raw.json)
Writes <prefix>_ranking.md and <prefix>_ranking.json.

Per judge, each criterion is z-scored across the drafts (so a generous judge can't dominate); a draft's score is the
mean over judges of z(overall), with z(story) as the tie-break (story/flow is Neel's first criterion). Drift and
feedback fit are reported raw (drift is information, not quality). "Shoehorned" counts the lines judges flagged as
name-drops without a story job; control drafts (slugs starting 01_) are marked so every round compares against them.
"""
import json
import statistics as st
import sys
from pathlib import Path

CRIT = ["story", "hook", "accuracy", "singability", "humour", "heart", "neel_fit", "legibility", "feedback_fit", "overall"]
CRIT_R3 = ["story", "poetry", "naturalness", "hook", "accuracy", "singability", "humour", "heart", "neel_fit", "feedback_fit", "overall"]


def main(prefix):
    prefix = Path(prefix)
    rows = {}
    for d in sorted(prefix.parent.glob(prefix.name + "_*")):
        raw = d / "raw.json"
        if not raw.exists():
            continue
        slug = d.name[len(prefix.name) + 1:]
        revs = {j: (r or {}).get("review") for j, r in json.loads(raw.read_text()).items()}
        # skip folders that aren't per-draft reviews (e.g. <prefix>_rank from the comparative mode)
        if not any(isinstance(v, dict) and "overall" in v for v in revs.values()):
            continue
        rows[slug] = revs
    judges = sorted({j for r in rows.values() for j, v in r.items() if v})
    r3 = any(isinstance(v, dict) and "poetry" in v for r in rows.values() for v in r.values())
    crit = CRIT_R3 if r3 else CRIT
    z = {}
    for j in judges:
        for c in crit:
            vals = [r[j][c] for r in rows.values() if r.get(j) and isinstance(r[j].get(c), (int, float))]
            mu, sd = (st.mean(vals), st.pstdev(vals) or 1.0) if vals else (0, 1)
            for slug, r in rows.items():
                if r.get(j) and isinstance(r[j].get(c), (int, float)):
                    z[(slug, j, c)] = (r[j][c] - mu) / sd
    table = []
    for slug, r in rows.items():
        js = [j for j in judges if r.get(j)]
        zo = st.mean([z[(slug, j, "overall")] for j in js if (slug, j, "overall") in z]) if js else float("nan")
        zs = st.mean([z[(slug, j, "story")] for j in js if (slug, j, "story") in z]) if js else float("nan")
        raw = {c: [r[j].get(c) for j in js] for c in crit + ["drift"]}
        shoe = sum(len(r[j].get("shoehorned_lines") or []) for j in js)
        row = {"slug": slug, "z_overall": round(zo, 3), "z_story": round(zs, 3), "n_judges": len(js),
               "overall": raw["overall"], "story": raw["story"], "feedback_fit": raw["feedback_fit"],
               "drift": raw["drift"], "shoehorned": shoe, "control": slug.startswith("01_")}
        if r3:
            row.update(poetry=raw["poetry"], naturalness=raw["naturalness"], hook=raw["hook"],
                       on_the_nose=sum(len(r[j].get("on_the_nose_lines") or []) for j in js),
                       stock=sum(len(r[j].get("stock_lines") or []) for j in js))
        table.append(row)
    table.sort(key=lambda t: (-t["z_overall"], -t["z_story"]))
    if r3:
        md = [f"# Round-3 ranking: {prefix.name}", "",
              "Rank by mean z(overall) across judges (tie-break z(story)). Raw scores per judge in the order " + ", ".join(judges)
              + ". On the nose / stock / shoehorned = how many lines the judges listed as such (summed over judges).", "",
              "| # | draft | z(overall) | overall | story | poetry | naturalness | hook | on the nose | stock | shoehorned |",
              "|---|---|---|---|---|---|---|---|---|---|---|"]
        for i, t in enumerate(table, 1):
            md.append(f"| {i} | {t['slug']} | {t['z_overall']:+.2f} | {t['overall']} | {t['story']} | {t['poetry']} | {t['naturalness']} | "
                      f"{t['hook']} | {t['on_the_nose']} | {t['stock']} | {t['shoehorned']} |")
        Path(f"{prefix}_ranking.md").write_text("\n".join(md) + "\n")
        Path(f"{prefix}_ranking.json").write_text(json.dumps(table, indent=1))
        print("\n".join(md))
        return
    md = [f"# Round-2 ranking: {prefix.name}", "",
          "Rank by mean z(overall) across judges (tie-break z(story)). Raw scores are listed per judge in the order "
          + ", ".join(judges) + ". Drift: 0 = B lightly edited, 10 = unrecognisable. ◆ = the conservative B control.", "",
          "| # | draft | z(overall) | z(story) | overall | story | feedback fit | drift | shoehorned lines |",
          "|---|---|---|---|---|---|---|---|---|"]
    for i, t in enumerate(table, 1):
        md.append(f"| {i} | {'◆ ' if t['control'] else ''}{t['slug']} | {t['z_overall']:+.2f} | {t['z_story']:+.2f} | "
                  f"{t['overall']} | {t['story']} | {t['feedback_fit']} | {t['drift']} | {t['shoehorned']} |")
    Path(f"{prefix}_ranking.md").write_text("\n".join(md) + "\n")
    Path(f"{prefix}_ranking.json").write_text(json.dumps(table, indent=1))
    print("\n".join(md))


if __name__ == "__main__":
    main(sys.argv[1])
