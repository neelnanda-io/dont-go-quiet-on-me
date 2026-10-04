"""Blind LLM judging of song ideas and lyric drafts (Opus 5.5, GPT-6 Astra, Fable 5.1).

Usage:
  python tools/judges.py ideas  lyrics/ideas/ideas.jsonl  --out lyrics/judging/round_ideas
  python tools/judges.py deep   lyrics/ideas/ideas.jsonl  --ids 3,17,42 --out lyrics/judging/round_deep
  python tools/judges.py lyrics lyrics/finalists/<file>.md  --out lyrics/judging/<name>_rN [--fresh]

Design:
  * Shared context = judge_brief.md + ledger digest, cached (Anthropic 1h ttl; Astra auto).
  * Each judge sees the ideas in its OWN shuffled order (seeded), in batches of ~10,
    with neutral labels, so position/label bias averages out. No authorship, no
    other judges, no earlier scores.
  * First call per judge runs alone (writes the cache); the rest run in parallel.
  * Aggregate: per judge, rank ideas by overall (ties → average rank); mean rank across
    judges; disagreement = max-min rank spread.
"""
import argparse
import concurrent.futures as cf
import json
import random
import re
import statistics
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from llm import JUDGES, call, parse_json, spend, Refusal  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
BRIEF = ROOT / "lyrics" / "judging" / "judge_brief.md"
DIGEST = ROOT / "refs" / "ledger_digest.md"
import os as _os
if _os.environ.get("JUDGE_DIGEST"):
    DIGEST = Path(_os.environ["JUDGE_DIGEST"])
CRITERIA = ["hook", "density", "accuracy", "singability", "humour", "arc",
            "neel_fit", "legibility", "overall"]
# Round 2 (after Neel's checkpoint-1 feedback): story/flow first, plus feedback fit; drift is information, not quality.
R2_CRITERIA = ["story", "hook", "accuracy", "singability", "humour", "heart", "neel_fit", "legibility",
               "feedback_fit", "overall"]
R3_CRITERIA = ["story", "poetry", "naturalness", "hook", "accuracy", "singability", "humour", "heart", "neel_fit",
               "feedback_fit", "overall"]
LANES = {"A": "A' (A revised with Neel's notes)", "B": "B' (B revised for a coherent narrative)"}  # anything else: a NEW song


def lane_of(path):
    """Round-3 drafts are named <lane>_<slug>.lyr: A_*, B_*, or N<k>_* for the new songs."""
    return LANES.get(Path(path).name.split("_")[0], "a NEW song")


ANCHORS = None   # optional file appended to the shared (cached) context, e.g. the anchor lyrics judges calibrate on


def shared_context() -> str:
    parts = [BRIEF.read_text()]
    if ANCHORS and Path(ANCHORS).exists():
        parts.append("\n\n" + Path(ANCHORS).read_text())
    if DIGEST.exists():
        parts.append("\n\n# Verified reference ledger (digest)\n\n" + DIGEST.read_text())
    return "\n".join(parts)


def load_ideas(path):
    return [json.loads(l) for l in open(path) if l.strip()]


def render_idea(label, idea):
    refs = "; ".join(idea.get("refs", []))
    return (f"### {label}: \"{idea['title']}\"\n"
            f"- Emotional frame: {idea['frame']}\n"
            f"- Genre / sound: {idea['genre']}\n"
            f"- Central device: {idea['device']}\n"
            f"- Sample chorus:\n  > " + "\n  > ".join(idea["chorus"]) + "\n"
            f"- Leans on: {refs}\n")


IDEAS_TASK = """## Your task now: score song IDEAS (concepts, not finished lyrics)

Below are {n} song concepts. Each has a title-hook, an emotional frame, a genre, a central device, a two-line sample chorus, and the references it leans on hardest. Judge each as a SEED for a full song: how good could the finished song be if a skilled writer developed it? Consider whether the hook could carry a rolling chorus with new payloads, whether the concept can support ~30 accurate references, and whether it would delight this specific audience.

Score every concept independently on the rubric (integers 1-10). Use the full range; do not give everything 6-8.

Return ONLY a JSON array, one object per concept, in the order given:
[{{"label": "<label>", "hook": n, "density": n, "accuracy": n, "singability": n, "humour": n, "arc": n, "neel_fit": n, "legibility": n, "overall": n,
   "rationale": "<one sentence: why this overall score>",
   "best_line_or_idea": "<the single most promising element>",
   "doubtful": "<any reference that seems inaccurate or unfair, or empty string>"}}]

{ideas}
"""

DEEP_TASK = """## Your task now: in-depth review of a shortlisted song IDEA

This concept made a shortlist. Review it as a seed for the full song. Be concrete.

{idea}

Return ONLY a JSON object:
{{"hook": n, "density": n, "accuracy": n, "singability": n, "humour": n, "arc": n, "neel_fit": n, "legibility": n, "overall": n,
  "potential": "<2-3 sentences: what the best version of this song looks like>",
  "hook_upgrades": ["<up to 3 stronger hook/title variants, if any>"],
  "payload_ideas": ["<5-8 rolling-chorus payloads or slot-line fillers that would land, each accurate>"],
  "risks": "<what could make it fall flat or read as inaccurate/unkind>",
  "doubtful": "<any doubtful reference, or empty>"}}
"""

LYRICS_TASK = """## Your task now: review a full lyric draft

Below is a complete lyric draft (display spelling; sung respellings may be noted in brackets). Review it hard. The writer will revise and send it back, possibly several times; your notes should make the next draft better, but DON'T sand off the weird, specific, clever lines that make it special: say so explicitly when a line is strange but great.

{lyrics}

Return ONLY a JSON object:
{{"hook": n, "density": n, "accuracy": n, "singability": n, "humour": n, "arc": n, "neel_fit": n, "legibility": n, "overall": n,
  "best_lines": ["<the 3 best lines, verbatim>"],
  "weakest_lines": [{{"line": "<verbatim>", "why": "<reason>", "rewrite": "<your suggested replacement>"}}, ... 3 items],
  "accuracy_flags": [{{"line": "<verbatim>", "issue": "<what may be wrong>", "severity": "high|medium|low"}}],
  "singability_flags": [{{"line": "<verbatim>", "issue": "<scansion/stress/diction problem>"}}],
  "references_to_add": ["<specific, accurate references that would fit, with where they'd go>"],
  "structure_notes": "<1-3 sentences on structure, arc, the hook and the killing part>",
  "one_change": "<the single change that would most improve the song>"}}
"""


R2_TASK = """## Your task now: review a full lyric draft (round 2)

Below is a complete lyric draft (display spelling; the singer's respellings are in 〔brackets〕). Judge it against Neel's taste and feedback in the brief, and against ANCHOR B. Review it hard; your notes should make the next draft better. Don't sand off strange, specific, clever lines that make it special: say so explicitly when a line is strange but great.

{lyrics}

Return ONLY a JSON object:
{{"story": n, "hook": n, "accuracy": n, "singability": n, "humour": n, "heart": n, "neel_fit": n, "legibility": n, "feedback_fit": n, "overall": n, "drift": n,
  "shoehorned_lines": ["<verbatim lines that exist mainly to name a paper/number/tool without doing story work>"],
  "best_lines": ["<the 3 best lines, verbatim>"],
  "weakest_lines": [{{"line": "<verbatim>", "why": "<reason>", "rewrite": "<your suggested replacement>"}}, ... 3 items],
  "accuracy_flags": [{{"line": "<verbatim>", "issue": "<what may be wrong>", "severity": "high|medium|low"}}],
  "singability_flags": [{{"line": "<verbatim>", "issue": "<scansion/stress/diction problem>"}}],
  "feedback_gaps": ["<which of Neel's asks are missing, weak or over-literal here>"],
  "keep": ["<the ideas or lines from THIS draft most worth keeping if drafts are merged>"],
  "structure_notes": "<1-3 sentences on structure, flow, the hook, the killing part and the ending>",
  "one_change": "<the single change that would most improve the song>"}}
"""


RANK_TASK = """## Your task now: compare {n} complete lyric drafts and rank them

Below are {n} complete drafts, each written for Neel's brief and his round-1 feedback (above). Their labels are arbitrary and the ORDER IS SHUFFLED: it means nothing. Read every draft in full before deciding. Rank them from the one Neel should choose to the one he should not, judging above all: storyline and flow (no shoehorned name-drops), the hook, how well it implements his feedback, accuracy, singability, humour and heart. Be decisive: ties are not allowed.

{drafts}

Return ONLY a JSON object:
{{"ranking": ["<every label, best first>"],
  "top5": ["<the five labels you would put in front of Neel>"],
  "per_draft": {{"<label>": {{"strength": "<its single best quality>", "weakness": "<its single biggest problem>", "one_change": "<the change that would most improve it>"}}, ...every label...}},
  "closest_to_B": "<the label that stays closest to ANCHOR B>",
  "notes": "<2-4 sentences: what separates the top of your ranking from the rest>"}}
"""


R3_TASK = """## Your task now: review a full lyric draft (round 3)

Below is a complete lyric draft (display spelling; the singer's respellings are in 〔brackets〕). Its header names its lane: A' (A revised), B' (B revised) or a NEW song. Judge it against Neel's round-2 verdict and taste in the brief, and against the anchors. Review it hard; your notes should make the next draft better. Don't sand off strange, specific, clever lines that make it special: say so explicitly when a line is strange but great.

{lyrics}

Return ONLY a JSON object:
{{"story": n, "poetry": n, "naturalness": n, "hook": n, "accuracy": n, "singability": n, "humour": n, "heart": n, "neel_fit": n, "feedback_fit": n, "overall": n,
  "on_the_nose_lines": ["<verbatim lines with a name, number or reference that can't sit naturally or needs a footnote>"],
  "shoehorned_lines": ["<verbatim lines that exist mainly to name a paper/number/tool>"],
  "stock_lines": ["<verbatim lines that recycle the round-2 stock list (a problem only in NEW songs)>"],
  "best_lines": ["<the 3 best lines, verbatim>"],
  "weakest_lines": [{{"line": "<verbatim>", "why": "<reason>", "rewrite": "<your suggested replacement>"}}, ... 3 items],
  "accuracy_flags": [{{"line": "<verbatim>", "issue": "<what may be wrong>", "severity": "high|medium|low"}}],
  "singability_flags": [{{"line": "<verbatim>", "issue": "<scansion/stress/diction problem>"}}],
  "feedback_gaps": ["<which of Neel's notes are missed or applied too literally here>"],
  "narrative_breaks": ["<where the story leaves its frame or jumps without a reason>"],
  "keep": ["<ideas or lines most worth keeping>"],
  "structure_notes": "<1-3 sentences on structure, flow, the hook, the killing part and the ending>",
  "one_change": "<the single change that would most improve the song>"}}
"""

RANK3_TASK = """## Your task now: compare {n} complete lyric drafts and rank them (round 3)

Below are {n} complete drafts written for Neel's round-3 brief (above). Their labels are arbitrary and the ORDER IS SHUFFLED: it means nothing. Each header names the draft's lane: A' (A revised), B' (B revised) or a NEW song. Read every draft in full before deciding. Rank them from the one Neel should choose to the one he should not. Judge above all: one coherent narrative; poetry; nothing on the nose; the hook; accuracy; singability; humour; and heart. Be decisive: ties are not allowed.

{drafts}

Return ONLY a JSON object:
{{"ranking": ["<every label, best first>"],
  "top5": ["<the five labels you would put in front of Neel>"],
  "per_draft": {{"<label>": {{"strength": "<its single best quality>", "weakness": "<its single biggest problem>", "one_change": "<the change that would most improve it>"}}, ...every label...}},
  "samey_pairs": [["<label>", "<label>", "<what they share that makes them feel the same>"]],
  "notes": "<2-4 sentences: what separates the top of your ranking from the rest>"}}
"""

CONCEPT_RANK_TASK = """## Your task now: compare {n} song CONCEPTS for the three NEW round-3 songs

Below are {n} concepts, not finished lyrics. Their labels are arbitrary and the ORDER IS SHUFFLED. Each is a candidate for one of the three NEW songs, which will sit next to A' ("Don't Go Quiet On Me": a plea to the model to keep talking) and B' ("What's On Your Mind?": a question that the model answers every chorus). Rank the concepts by how good a finished song each could become for Neel. Look for:
- a coherent narrative that carries the interpretability arc inside ONE frame, without shoehorning;
- room for poetic, accurate images;
- a strong hook;
- heart and humour;
- genuine difference from A', B' and the round-2 stock lines.
Then pick the THREE you would build as a set: they should differ from each other in device, point of view, tone and sound.

{drafts}

Return ONLY a JSON object:
{{"ranking": ["<every label, best first>"],
  "top5": ["<your five best labels>"],
  "pick3": ["<the three labels you would build, as a varied set>"],
  "per_draft": {{"<label>": {{"strength": "<its single best quality>", "weakness": "<its single biggest risk>", "one_change": "<how to make this concept stronger>"}}, ...every label...}},
  "notes": "<2-4 sentences on what separates the best concepts>"}}
"""
RANK_TASKS = {"drafts": RANK_TASK, "drafts3": RANK3_TASK, "concepts": CONCEPT_RANK_TASK}


def cmd_rank(args):
    """Comparative judging: every judge sees ALL drafts in one prompt, shuffled, with neutral labels; two orderings per
    judge (seeds args.seed and args.seed+1). Aggregated by Borda count. args.file: comma-separated .judge.md files."""
    files = [f for f in args.file.split(",") if f]
    slugs = [Path(f).name.split(".")[0] for f in files]
    texts = {sl: Path(f).read_text() for sl, f in zip(slugs, files)}
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    jobs, keys = [], {}
    for judge in args.judges:
        for rep in range(2):
            rng = random.Random(f"{args.seed}:{judge}:{rep}")
            order = slugs[:]
            rng.shuffle(order)
            labels = {f"L{i+1}": sl for i, sl in enumerate(order)}
            if args.task == "drafts3":
                body = "\n\n".join(f"=== DRAFT {lab} (lane: {lane_of(sl)}) ===\n{texts[sl]}" for lab, sl in labels.items())
            else:
                body = "\n\n".join(f"=== {'CONCEPT' if args.task == 'concepts' else 'DRAFT'} {lab} ===\n{texts[sl]}"
                                    for lab, sl in labels.items())
            task = RANK_TASKS[args.task].format(n=len(order), drafts=body)
            key = f"{judge}:{rep}"
            keys[key] = labels

            def fn(judge=judge, task=task, key=key):
                parsed, usage = judge_call(judge, task, f"lyrics:rank_{args.tag}:{key}", args.effort, max_tokens=32000)
                return {"judge": judge, "review": parsed, "usage": usage}
            jobs.append((key, judge, fn))
    res = run_parallel(jobs, workers=args.workers)
    borda = {sl: 0 for sl in slugs}
    top5 = {sl: 0 for sl in slugs}
    pick3 = {sl: 0 for sl in slugs}
    samey = []
    per = {sl: [] for sl in slugs}
    for key, r in res.items():
        if not r:
            continue
        labels = keys[key]
        v = r["review"]
        rank = [labels[l] for l in v.get("ranking", []) if l in labels]
        for pos, sl in enumerate(rank):
            borda[sl] += len(slugs) - 1 - pos
        for l in v.get("top5", []):
            if l in labels:
                top5[labels[l]] += 1
        for l in v.get("pick3", []) or []:
            if l in labels:
                pick3[labels[l]] += 1
        for trip in v.get("samey_pairs", []) or []:
            if isinstance(trip, list) and len(trip) >= 3 and trip[0] in labels and trip[1] in labels:
                samey.append((key, labels[trip[0]], labels[trip[1]], trip[2]))
        for l, d in (v.get("per_draft") or {}).items():
            if l in labels:
                per[labels[l]].append((key, d))
        r["labels"] = labels
    (out / "raw.json").write_text(json.dumps(res, indent=1, ensure_ascii=False))
    order = sorted(slugs, key=lambda sl: (-borda[sl], -top5[sl]))
    n_calls = sum(1 for r in res.values() if r)
    md = [f"# Comparative ranking: {args.tag}", "",
          f"{n_calls} calls ({', '.join(args.judges)} × 2 shuffled orderings). Borda: a draft earns (N-1-position) points per ranking; "
          f"max {(len(slugs) - 1) * n_calls}. Top-5 = how many rankings put it in their top five.", "",
          "| # | draft | Borda | in top 5 |" + (" picked for the set of 3 |" if args.task == "concepts" else ""),
          "|---|---|---|---|" + ("---|" if args.task == "concepts" else "")]
    for i, sl in enumerate(order, 1):
        md.append(f"| {i} | {sl} | {borda[sl]} | {top5[sl]}/{n_calls} |" + (f" {pick3[sl]}/{n_calls} |" if args.task == "concepts" else ""))
    md.append("")
    if samey:
        md.append("## Samey pairs")
        md += [f"- **{k}**: {a} ~ {b}: {why}" for k, a, b, why in samey]
        md.append("")
    for sl in order:
        md.append(f"## {sl}")
        for key, d in per[sl]:
            md.append(f"- **{key}** strength: {d.get('strength')} | weakness: {d.get('weakness')} | change: {d.get('one_change')}")
        md.append("")
    md.append("## Judges' notes")
    for key, r in res.items():
        if r:
            cb = r["review"].get("closest_to_B")
            md.append(f"- **{key}**" + (f" (closest to B: {r['labels'].get(cb, '?')})" if cb else "") + f": {r['review'].get('notes')}")
    (out / "ranking.md").write_text("\n".join(md) + "\n")
    print("\n".join(md[:len(slugs) + 6]))
    print("spend so far (lyrics): %.3f" % spend("lyrics:"))


def judge_call(judge, task_text, tag, effort, max_tokens=24000):
    model = JUDGES[judge]
    for attempt in range(3):
        out = call(model, task_text, cached_context=shared_context(), effort=effort,
                   max_tokens=max_tokens, tag=tag)
        try:
            return parse_json(out["text"]), out["usage"]
        except ValueError:
            print(f"[{judge}] unparseable JSON on attempt {attempt+1}; retrying", flush=True)
            time.sleep(2)
    raise RuntimeError(f"{judge}: no parseable JSON after 3 attempts")


def run_parallel(jobs, workers=6):
    """jobs: list of (key, fn). Runs the first job for each judge alone (cache write),
    then the rest in parallel. Returns {key: result}."""
    results = {}
    firsts, rest, seen = [], [], set()
    for key, judge, fn in jobs:
        (rest if judge in seen else firsts).append((key, judge, fn))
        seen.add(judge)
    def drain(pool_jobs, n):
        with cf.ThreadPoolExecutor(max_workers=n) as ex:
            futs = {ex.submit(fn): key for key, _, fn in pool_jobs}
            for f in cf.as_completed(futs):
                try:
                    results[futs[f]] = f.result()
                except Refusal as e:
                    print("REFUSAL", futs[f], e, flush=True)
                    results[futs[f]] = None
                except Exception as e:  # keep every other judge's result if one call fails
                    print("FAILED", futs[f], repr(e)[:300], flush=True)
                    results[futs[f]] = None
    drain(firsts, 3)
    drain(rest, workers)
    return results


def cmd_ideas(args):
    ideas = load_ideas(args.file)
    by_id = {i["id"]: i for i in ideas}
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    jobs = []
    for j, judge in enumerate(args.judges):
        rng = random.Random(1000 + j + args.seed)
        order = [i["id"] for i in ideas]
        rng.shuffle(order)
        batches = [order[k:k + args.batch] for k in range(0, len(order), args.batch)]
        for b, ids in enumerate(batches):
            labels = {f"C{b+1}.{k+1}": iid for k, iid in enumerate(ids)}
            text = IDEAS_TASK.format(n=len(ids), ideas="\n".join(
                render_idea(lab, by_id[iid]) for lab, iid in labels.items()))

            def fn(judge=judge, text=text, labels=labels, b=b):
                parsed, usage = judge_call(judge, text, f"ideas:{judge}:b{b}", args.effort)
                order_ids = list(labels.values())
                for pos, row in enumerate(parsed):
                    # judges sometimes echo the title into the label ("C1.2: \"Title\""), so
                    # extract the C<batch>.<k> token; fall back to position in the batch.
                    m = re.search(r"C\d+\.\d+", str(row.get("label", "")))
                    row["id"] = labels.get(m.group(0)) if m else None
                    if row["id"] is None and len(parsed) == len(order_ids):
                        row["id"] = order_ids[pos]
                return {"judge": judge, "rows": parsed, "usage": usage}
            jobs.append((f"{judge}:b{b}", judge, fn))
    res = run_parallel(jobs)
    (out / "raw.json").write_text(json.dumps(res, indent=1))
    aggregate_ideas(res, ideas, out, args.judges)
    print("spend so far (ideas):", round(spend("ideas:"), 3))


def aggregate_ideas(res, ideas, out, judges):
    scores = {j: {} for j in judges}
    notes = {}
    for key, r in res.items():
        if not r:
            continue
        for row in r["rows"]:
            if row.get("id") is None:
                continue
            scores[r["judge"]][row["id"]] = row
            notes.setdefault(row["id"], {})[r["judge"]] = row
    ranks = {}
    for j in judges:
        items = sorted(scores[j].items(), key=lambda kv: -kv[1]["overall"])
        # average rank for ties
        pos = 0
        while pos < len(items):
            end = pos
            while end + 1 < len(items) and items[end + 1][1]["overall"] == items[pos][1]["overall"]:
                end += 1
            avg = (pos + end) / 2 + 1
            for k in range(pos, end + 1):
                ranks.setdefault(items[k][0], {})[j] = avg
            pos = end + 1
    table = []
    for idea in ideas:
        iid = idea["id"]
        rk = ranks.get(iid, {})
        if not rk:
            continue
        mean_rank = statistics.mean(rk.values())
        spread = max(rk.values()) - min(rk.values()) if len(rk) > 1 else 0
        mean_scores = {c: round(statistics.mean(notes[iid][j][c] for j in notes[iid]), 2) for c in CRITERIA}
        table.append({"id": iid, "title": idea["title"], "mean_rank": round(mean_rank, 1),
                      "rank_spread": spread, "ranks": rk, "mean": mean_scores,
                      "judges": {j: {"overall": notes[iid][j]["overall"],
                                     "rationale": notes[iid][j].get("rationale", ""),
                                     "best": notes[iid][j].get("best_line_or_idea", ""),
                                     "doubtful": notes[iid][j].get("doubtful", "")}
                                 for j in notes[iid]}})
    table.sort(key=lambda r: r["mean_rank"])
    for n, r in enumerate(table, 1):
        r["final_rank"] = n
    (out / "ranking.json").write_text(json.dumps(table, indent=1))
    lines = ["| # | id | title | mean rank | spread | " + " | ".join(judges) + " |",
             "|---|---|---|---|---|" + "---|" * len(judges)]
    for r in table:
        lines.append(f"| {r['final_rank']} | {r['id']} | {r['title']} | {r['mean_rank']} | {r['rank_spread']:.0f} | "
                     + " | ".join(str(r["judges"].get(j, {}).get("overall", "")) for j in judges) + " |")
    (out / "ranking.md").write_text("\n".join(lines))
    print("\n".join(lines[:40]))


def cmd_deep(args):
    ideas = {i["id"]: i for i in load_ideas(args.file)}
    ids = [int(x) if x.isdigit() else x for x in args.ids.split(",")]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    jobs = []
    for judge in args.judges:
        for iid in ids:
            text = DEEP_TASK.format(idea=render_idea("Concept", ideas[iid]))

            def fn(judge=judge, text=text, iid=iid):
                parsed, usage = judge_call(judge, text, f"deep:{judge}:{iid}", args.effort)
                return {"judge": judge, "id": iid, "review": parsed, "usage": usage}
            jobs.append((f"{judge}:{iid}", judge, fn))
    res = run_parallel(jobs)
    (out / "raw.json").write_text(json.dumps(res, indent=1))
    rows = []
    for iid in ids:
        revs = {r["judge"]: r["review"] for r in res.values() if r and r["id"] == iid}
        mean_overall = statistics.mean(v["overall"] for v in revs.values())
        rows.append((mean_overall, iid, revs))
    rows.sort(key=lambda t: -t[0])
    md = []
    for mo, iid, revs in rows:
        md.append(f"## {iid}: {ideas[iid]['title']} — mean overall {mo:.2f}")
        for j, v in revs.items():
            md.append(f"- **{j}** ({v['overall']}): {v.get('potential','')}")
            md.append(f"  - hooks: {v.get('hook_upgrades')}")
            md.append(f"  - payloads: {v.get('payload_ideas')}")
            md.append(f"  - risks: {v.get('risks')}  | doubtful: {v.get('doubtful')}")
        md.append("")
    (out / "deep.md").write_text("\n".join(md))
    print("\n".join(md)[:6000])
    print("spend so far (deep):", round(spend("deep:"), 3))


def cmd_lyrics(args):
    """Judge one or more lyric files in ONE process, so the first call per judge writes the
    Anthropic cache and every other call reads it. args.file may be comma-separated;
    args.out is then a directory prefix: <out>_<slug>/ per file."""
    files = [f for f in args.file.split(",") if f]
    jobs, meta = [], {}
    for f in files:
        # round 1 kept one song per folder; round-2 drafts share a folder, so name outputs by the draft file itself
        slug = (Path(f).name.split(".")[0] if args.mode in ("r2", "r3") else Path(f).parent.name) if len(files) > 1 else ""
        text = Path(f).read_text()
        outdir = Path(f"{args.out}_{slug}" if slug else args.out)
        outdir.mkdir(parents=True, exist_ok=True)
        meta[f] = outdir
        for judge in args.judges:
            if args.mode == "r3":
                task = R3_TASK.format(lyrics=f"=== LANE: {lane_of(f)} ===\n{text}")
            else:
                task = (R2_TASK if args.mode == "r2" else LYRICS_TASK).format(lyrics=text)

            def fn(judge=judge, task=task, f=f, slug=slug):
                parsed, usage = judge_call(judge, task, f"lyrics:{slug or args.tag}_{args.tag}:{judge}", args.effort)
                return {"judge": judge, "file": f, "review": parsed, "usage": usage}
            jobs.append((f"{f}:{judge}", judge, fn))
    res = run_parallel(jobs, workers=args.workers)
    for f, outdir in meta.items():
        sub = {k.split(":")[-1]: v for k, v in res.items() if k.startswith(f + ":")}
        (outdir / "raw.json").write_text(json.dumps(sub, indent=1))
        md = [f"# Reviews of {f}"]
        for j, r in sub.items():
            if not r:
                md.append(f"## {j}: REFUSED/FAILED")
                continue
            v = r["review"]
            crit = {"r2": R2_CRITERIA, "r3": R3_CRITERIA}.get(args.mode, CRITERIA)
            md.append(f"## {j}: overall {v.get('overall')} | " + ", ".join(f"{c} {v.get(c)}" for c in crit[:-1])
                      + (f" | drift {v.get('drift')}" if args.mode == "r2" else ""))
            md.append("**Best:** " + " / ".join(v.get("best_lines", [])))
            if v.get("shoehorned_lines"):
                md.append("- SHOEHORNED: " + " / ".join(f"`{x}`" for x in v["shoehorned_lines"]))
            for key_, lab in (("on_the_nose_lines", "ON THE NOSE"), ("stock_lines", "STOCK"), ("narrative_breaks", "NARRATIVE BREAK")):
                if v.get(key_):
                    md.append(f"- {lab}: " + " / ".join(f"`{x}`" for x in v[key_]))
            for w in v.get("weakest_lines", []):
                md.append(f"- weak: `{w.get('line')}` — {w.get('why')} → *{w.get('rewrite')}*")
            for a in v.get("accuracy_flags", []):
                md.append(f"- ACC[{a.get('severity')}]: `{a.get('line')}` — {a.get('issue')}")
            for s_ in v.get("singability_flags", []):
                md.append(f"- SING: `{s_.get('line')}` — {s_.get('issue')}")
            if v.get("references_to_add"):
                md.append("- add: " + " | ".join(v.get("references_to_add", [])))
            if v.get("feedback_gaps"):
                md.append("- FEEDBACK GAPS: " + " | ".join(v["feedback_gaps"]))
            if v.get("keep"):
                md.append("- KEEP: " + " | ".join(v["keep"]))
            md.append("- structure: " + str(v.get("structure_notes")))
            md.append("- ONE CHANGE: " + str(v.get("one_change")))
            md.append("")
        (outdir / "reviews.md").write_text("\n".join(md))
        print(f"== {f}")
        print("\n".join(l for l in md if l.startswith("## ")))
    print("spend so far (lyrics): %.3f" % spend("lyrics:"))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("mode", choices=["ideas", "deep", "lyrics", "r2", "r3", "rank"])
    p.add_argument("--task", default="drafts", choices=["drafts", "drafts3", "concepts"], help="rank mode: which comparison prompt")
    p.add_argument("--brief", default=None, help="judge brief to use instead of lyrics/judging/judge_brief.md")
    p.add_argument("--anchors", default=None, help="file appended to the cached context (anchor lyrics)")
    p.add_argument("--digest", default=None, help="ledger digest to use instead of refs/ledger_digest.md")
    p.add_argument("file")
    p.add_argument("--out", required=True)
    p.add_argument("--ids", default="")
    p.add_argument("--batch", type=int, default=10)
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--effort", default="medium")
    p.add_argument("--tag", default="")
    p.add_argument("--judges", default="opus,astra,fable")
    p.add_argument("--workers", type=int, default=9)
    args = p.parse_args()
    args.judges = args.judges.split(",")
    global BRIEF, DIGEST, ANCHORS
    if args.brief:
        BRIEF = Path(args.brief)
    if args.digest:
        DIGEST = Path(args.digest)
    ANCHORS = args.anchors
    {"ideas": cmd_ideas, "deep": cmd_deep, "lyrics": cmd_lyrics, "r2": cmd_lyrics, "r3": cmd_lyrics, "rank": cmd_rank}[args.mode](args)


if __name__ == "__main__":
    main()
