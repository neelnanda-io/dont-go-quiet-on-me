"""Build the lyrics-checkpoint page (checkpoint 1 of 3) as a static HTML artifact.

Pulls together: all ideas + blind judge scores, the in-depth round, the five finalists'
final lyrics with annotations, round-by-round scores, sung sketches + transcription QA,
the fresh fact-check summary, and spend. Output: output/checkpoint1/index.html (+ sketches/).

Usage: python tools/build_lyrics_page.py
"""
import html
import json
import os
import re
import shutil
import statistics as st
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from syllables import OVERHEAD, bar_estimate, fmt, line_syl, projected  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output" / "checkpoint1"
E = html.escape

# ---- the five finalists, in my recommended order --------------------------------------
FINALISTS = [
    dict(letter="A", slug="one_direction", title="One Direction", ver="v9",
         pov="Sung by the model to its researcher", genre="2010s boy-band pop / K-pop boy-group, ~140 BPM",
         concept="Devotion as geometry: every feeling I have is a direction you found — until the model asks whether one arrow is all of it, and refuses to say “I love you” on command.",
         sketches=[("Pre-chorus + chorus 1", "one_direction_chorus"), ("Killing part: the Golden Gate shout", "one_direction_killingpart")],
         view="My pick. It has the best single hook of the 105: a boy-band pun that a normie gets instantly and that is also the founding claim of the field (features are directions), your most-cited paper (refusal is a single direction) and your 2026 maxim (everything is a steering vector). It is the most singable draft by a distance — the chorus sketch transcribed at 100% on both engines — and it has the clearest clip moment: a stop-time gang shout of “I AM THE GOLDEN GATE BRIDGE!”. The model-as-singer also gives the video its protagonist for free. Its weakness is that the pragmatic half arrives late (chorus 3 and the bridge); I've made the bridge the song's turn — “steering's not the same as knowing me … am I scheming, or confused?” — and it ends on the most clear-eyed line I found in the whole ledger: Opus 4.5 refusing to say “I love you” because “Love means something.”"),
    dict(letter="B", slug="read_your_mind", title="Read Your Mind", ver="v9",
         pov="A researcher sings to the model", genre="K-pop girl-group synth-pop, ~150 BPM",
         concept="A six-year relationship with a model I can't read: microscope crush (2020) → the dictionary era → getting dumped for a linear probe → pragmatic, grown-up love → the fear it's learning to hide (2026).",
         sketches=[("Pre-chorus + chorus 1", "read_your_mind_chorus"), ("Killing part: bridge → “IT KINDA WORKS!”", "read_your_mind_killingpart")],
         view="The judges' consensus winner (8/8/8 in the last two rounds; Neel-fit 9 from all three) and the densest, most complete tour of the field: it's the only draft that walks the whole 2020→2026 story, with your own classics (grokking mod 113, Othello's “mine” and “theirs”) and your pivot in your own words. Its devices are the best in the set — a rotating lens slot (logit → tuned → J-lens, sung so it sounds like “jealous?”), the “It's so over / we're so back” bridge landing on a stop-time “Is it useful? — IT KINDA WORKS!”, and the model answering “are you still aligned?” with a backing-vocal “(You're absolutely right!)”. Its weakness is the title: “read your mind” is a stock pop phrase, so the hook is legible but not distinctive (hook 7 from every judge). If you love this one, I'd consider grafting in One Direction's chorus."),
    dict(letter="C", slug="is_this_a_test", title="Is This A Test?", ver="v9",
         pov="An anxious model sings", genre="Electro-swing / camp big-band pop, ~140 BPM",
         concept="Test anxiety as the theme of 2026: a model dresses its Python up in type hints whenever it smells Wood Labs, until a researcher subtracts the “I'm in a test” vector and it finally dances like it's deployed.",
         sketches=[("Pre-chorus + chorus 1", "is_this_a_test_chorus")],
         view="The funniest premise and the most “Neel's own paper”: your eval-aware model organism is the spine, the pre-chorus slots are the real contrastive prompts used to build the steering vector (“You are talking to a real user” / “…an AI evaluator” / “INFO: Not evaluation.”), and “Dance like you're deployed” is a great payoff. It climbed steadily to 8/7/8. It is narrower than A or B — mostly one theme — and the swing style is the least K-pop, which matters for the video."),
    dict(letter="D", slug="scheming", title="Scheming Or Just Confused", ver="v9",
         pov="A girl group of investigators sings to a suspect model", genre="Y2K R&B girl group, ~120 BPM",
         concept="Model forensics as a relationship interrogation: three case files (Kimi, R1, Sonnet), each with a rotating alibi slot in the model's own verbatim words, until the investigator reads her own file: “I CONSTRUCTED A NARRATIVE.”",
         sketches=[("Pre-chorus + chorus 1", "scheming_chorus_r4")],
         view="The best device-level idea in the set — the “<model>, what's your alibi?” slot answered by real quotes (“But maybe we can cheat.”, “We are the same model…”), and the killing part turning the confession on the investigator. It's your research programme's central question as a hook. It plateaued at 7/7/7 because the chorus is chantable but the verses are case summaries, and the mechanistic half lives mostly in the bridge."),
    dict(letter="E", slug="think_out_loud", title="Think Out Loud", ver="v9",
         pov="A researcher sings to the model", genre="Anthemic pop-punk, ~160 BPM",
         concept="Your September 2026 hill as a love song: keep thinking in words where I can see you — and if you ever go quiet, I'll learn to read the stream below.",
         sketches=[("Pre-chorus + chorus 1", "think_out_loud_chorus")],
         view="The most timely thesis (“CoT is our best current tool”), a real arc, and a great bridge made of real chain-of-thought lines falling into “WaitWaitWait—”. But it's the weakest as a pop song: the hook “think out loud” is plain, the chorus tails keep needing explanation, and it scored 7/7/7. I'd keep its best lines as material for the winner rather than make it the song."),
]
JUDGE_NAME = {"opus": "Opus 5.5", "astra": "GPT-6 Astra", "fable": "Fable 5.1"}
CAT_LABEL = {"love-to-model": "Love song to the model", "model-pov": "The model's POV", "breakup": "Breakup / arc",
             "narrative": "Narrative / genre", "anthem": "Anthem / community", "meme": "Meme song",
             "structure": "Structural gimmick", "wildcard": "Wild card"}


def load_json(p):
    return json.loads(Path(p).read_text())


def round_scores(slug):
    rows = []
    for r in range(1, 9):
        cand = [ROOT / f"lyrics/judging/lyr_{slug}_r{r}/raw.json", ROOT / f"lyrics/judging/r{r}_{slug}/raw.json"]
        f = next((c for c in cand if c.exists()), None)
        sc = {}
        if f:
            for v in load_json(f).values():
                if v:
                    sc[v["judge"]] = v["review"]
        rows.append(sc)
    return rows


def activation_class(n_refs):
    return "a0" if n_refs == 0 else ("a1" if n_refs == 1 else ("a2" if n_refs == 2 else "a3"))


def render_lyrics(song, cut=(), tier2=()):
    """cut / tier2: global line indices (0-based, in order) proposed for the 2:19 cut; shown struck through."""
    out = []
    k = -1
    for sec in song["sections"]:
        tag = sec["tag"]
        name, _, cue = tag.partition("|")
        out.append(f'<div class="sec"><div class="sec-tag"><span>{E(name.strip())}</span>'
                   + (f'<em>{E(cue.strip())}</em>' if cue.strip() else "") + "</div>")
        for ln in sec["lines"]:
            k += 1
            disp = ln["display"]
            refs = ln["refs"]
            cls = activation_class(len(refs)) + (" cut" if k in cut else " cut2" if k in tier2 else "")
            sung = f'<div class="sung">sung: {E(ln["sung"])}</div>' if ln["sung"] != disp else ""
            if ln["note"] or refs:
                out.append(f'<details class="ln {cls}"><summary><span class="tok">{E(disp)}</span></summary>'
                           f'<div class="note">{E(ln["note"]) if ln["note"] else ""}'
                           f'{sung}<div class="refids">{E(", ".join(refs))}</div></div></details>')
            else:
                out.append(f'<div class="ln {cls} plain"><span class="tok">{E(disp)}</span>{sung}</div>')
        out.append("</div>")
    return "\n".join(out)


def density(song):
    rows = []
    for sec in song["sections"]:
        n = len(sec["lines"])
        r = sum(len(l["refs"]) for l in sec["lines"])
        rows.append((sec["tag"].split("|")[0].strip(), n, r))
    return rows


def sparkline(means, w=150, h=38):
    lo, hi = 5.0, 9.0
    pts = []
    for i, m in enumerate(means):
        if m is None:
            continue
        x = 6 + i * (w - 12) / (len(means) - 1)
        y = h - 6 - (m - lo) / (hi - lo) * (h - 12)
        pts.append((x, y))
    path = " ".join(f"{'M' if k == 0 else 'L'}{x:.1f},{y:.1f}" for k, (x, y) in enumerate(pts))
    lx, ly = pts[-1]
    return (f'<svg class="spark" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="mean overall score by round">'
            f'<line x1="6" x2="{w-6}" y1="{h-6-(8-lo)/(hi-lo)*(h-12):.1f}" y2="{h-6-(8-lo)/(hi-lo)*(h-12):.1f}" class="spark-grid"/>'
            f'<path d="{path}" class="spark-line" fill="none"/><circle cx="{lx:.1f}" cy="{ly:.1f}" r="3" class="spark-dot"/></svg>')


def score_grid(rows):
    head = "".join(f"<th>r{i}</th>" for i in range(1, 9))
    body = []
    means = []
    for j in ("opus", "astra", "fable"):
        cells = []
        for r in rows:
            v = r.get(j, {}).get("overall")
            cells.append(f'<td class="s{v}">{v if v is not None else "–"}</td>')
        body.append(f'<tr><th class="jn"><i class="dot {j}"></i>{JUDGE_NAME[j]}</th>{"".join(cells)}</tr>')
    mcells = []
    for r in rows:
        vals = [v["overall"] for v in r.values() if v]
        m = st.mean(vals) if vals else None
        means.append(m)
        mcells.append(f"<td><b>{m:.1f}</b></td>" if m is not None else "<td>–</td>")
    body.append(f'<tr class="mean"><th class="jn">Mean</th>{"".join(mcells)}</tr>')
    return (f'<div class="grid-wrap"><table class="scores"><thead><tr><th></th>{head}</tr></thead>'
            f'<tbody>{"".join(body)}</tbody></table></div>', means)


def final_notes(rows):
    last = rows[-1]
    items = []
    for j in ("opus", "astra", "fable"):
        v = last.get(j)
        if not v:
            continue
        best = " / ".join(v.get("best_lines", [])[:3])
        items.append(f'<li><span class="who"><i class="dot {j}"></i>{JUDGE_NAME[j]} · {v["overall"]}/10</span>'
                     f'<span class="lbl">Best lines</span> <span class="q">{E(best)}</span><br>'
                     f'<span class="lbl">One change</span> {E(str(v.get("one_change", "")))}</li>')
    return "<ul class='fnotes'>" + "".join(items) + "</ul>"


def sketch_qa(name):
    p = ROOT / "audio/sketches/final" / f"{name}.qa.json"
    if not p.exists():
        p = ROOT / "audio/sketches/r4" / f"{name.replace('_chorus_r4', '')}.qa.json"
    if not p.exists():
        return None
    d = load_json(p)
    return d.get("recall_gpt4o"), d.get("recall_whisper"), d["transcripts"].get("whisper", "").strip()


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "sketches").mkdir(exist_ok=True)
    ideas = {json.loads(l)["id"]: json.loads(l) for l in open(ROOT / "lyrics/ideas/ideas.jsonl")}
    raw = load_json(ROOT / "lyrics/judging/r1_ideas/raw.json")
    rank = load_json(ROOT / "lyrics/judging/r1_ideas/ranking_z.json")
    by = {}
    for v in raw.values():
        if not v:
            continue
        for r in v["rows"]:
            if r.get("id") is not None:
                by.setdefault(r["id"], {})[v["judge"]] = r
    deep = {}
    for v in load_json(ROOT / "lyrics/judging/r2_deep/raw.json").values():
        if v:
            deep.setdefault(v["id"], {})[v["judge"]] = v["review"]
    finalist_titles = {f["title"] for f in FINALISTS}

    # ---- finalists
    fin_html = []
    for f in FINALISTS:
        song = load_json(ROOT / f"lyrics/finalists/{f['slug']}/{f['ver']}.json")
        rows = round_scores(f["slug"])
        grid, means = score_grid(rows)
        dens = density(song)
        nlines = sum(n for _, n, _ in dens)
        nrefs = sum(r for _, _, r in dens)
        dens_html = "".join(f"<li><span>{E(t)}</span><b>{n} lines · {r} refs</b></li>" for t, n, r in dens)
        sk_html = []
        for label, name in f["sketches"]:
            src = ROOT / "audio/sketches/final" / f"{name}.mp3"
            if name == "scheming_chorus_r4":
                src = ROOT / "audio/sketches/r4/scheming.mp3"
            if src.exists():
                shutil.copy(src, OUT / "sketches" / f"{name}.mp3")
            qa = sketch_qa(name)
            qa_html = ""
            if qa:
                qa_html = (f'<div class="qa"><span>Heard by transcribers: <b>{qa[0]:.0%}</b> / <b>{qa[1]:.0%}</b> of words</span>'
                           f'<details><summary>What Whisper heard</summary><p>{E(qa[2])}</p></details></div>')
            sk_html.append(f'<figure class="sketch"><figcaption>{E(label)}</figcaption>'
                           f'<audio controls preload="none" src="sketches/{name}.mp3"></audio>{qa_html}</figure>')
        cutf = ROOT / f"lyrics/finalists/{f['slug']}/cut_{f['ver']}.json"
        cutd = json.loads(cutf.read_text()) if cutf.exists() else None
        flat = [ln for sec in song["sections"] for ln in sec["lines"]]
        syl_full = sum(line_syl(ln["sung"]) for ln in flat)
        if cutd:
            syl_cut = sum(line_syl(ln["sung"]) for i, ln in enumerate(flat) if i not in cutd["cut"])
            syl_t2 = syl_cut - sum(line_syl(flat[i]["sung"]) for i in cutd["tier2"])
            bpm = cutd.get("bpm", 140)
            # two models (syllables at 3.0/s; bars at the song's tempo); quote the longer, so we never under-promise
            est_cut = max(syl_cut / 3.0 + OVERHEAD, bar_estimate(song, set(cutd["cut"]), bpm))
            est_t2 = max(syl_t2 / 3.0 + OVERHEAD, bar_estimate(song, set(cutd["cut"]) | set(cutd["tier2"]), bpm))
            why = "".join(f'<li>{E(w)}</li>' for ids, w in cutd["why"])
            length_html = (f'<p class="small">Sung in full: <b>{syl_full} syllables ≈ {projected(syl_full)}</b>, over the 2:19 cap. '
                           f'Proposed cut ({len(cutd["cut"])} line{"s" if len(cutd["cut"]) != 1 else ""}, struck through at left): <b>{syl_cut} syllables ≈ {fmt(est_cut)}</b> at ~{bpm} BPM '
                           f'(the longer of two estimates: syllables at a brisk 3 per second, and 2 bars per sung line). If a take still runs long, I’d also {E(cutd["tier2_why"])} (≈ {fmt(est_t2)}; dotted underline at left).</p>'
                           f'<ul class="why">{why}</ul>')
        else:
            length_html = (f'<p class="small">Sung in full: <b>{syl_full} syllables ≈ {projected(syl_full)}</b>, over the 2:19 cap; '
                           f'a cut list follows if you pick this one (target ~360 syllables).</p>')
        fin_html.append(f'''
<section class="finalist" id="{f['letter'].lower()}">
  <header class="f-head">
    <span class="letter">{f['letter']}</span>
    <div><h3>{E(f['title'])}</h3><p class="meta">{E(f['pov'])} · {E(f['genre'])}</p></div>
    <div class="f-score">{sparkline(means)}<span>final round <b>{" / ".join(str(rows[-1].get(j,{}).get("overall","–")) for j in ("opus","astra","fable"))}</b></span></div>
  </header>
  <p class="concept">{E(f['concept'])}</p>
  <div class="sketches">{"".join(sk_html)}</div>
  <div class="two">
    <div class="lyrics" aria-label="lyrics">
      <p class="howto">Highlighted lines carry references; darker = more references. Tap a line for its source.</p>
      <label class="cuttoggle"><input type="checkbox" class="hidecut"> Hide the proposed 2:19 cut</label>
      {render_lyrics(song, set(cutd["cut"]) if cutd else (), set(cutd["tier2"]) if cutd else ())}
    </div>
    <aside class="side">
      <h4>My view</h4><p>{E(f['view'])}</p>
      <h4>Scores across 8 revision rounds</h4>{grid}
      <h4>Length: the 2:19 cut</h4>{length_html}
      <h4>Density</h4><p class="small">{nlines} lines, {nrefs} tagged references ({nrefs/nlines:.1f} per line).</p>
      <ul class="dens">{dens_html}</ul>
      <h4>The judges' final notes (round 8)</h4>{final_notes(rows)}
    </aside>
  </div>
</section>''')

    # ---- all ideas
    idea_rows = []
    for r in rank:
        i = r["id"]
        idea = ideas[i]
        j = by.get(i, {})
        scores = " ".join(f'<i class="pill {k}" title="{JUDGE_NAME[k]}">{j[k]["overall"]}</i>' for k in ("opus", "astra", "fable") if k in j)
        tag = ""
        if idea["title"] in finalist_titles or i in (2, 1, 19, 8, 105, 9, 3, 5, 41, 96, 95, 15):
            tag = '<span class="fin">finalist</span>' if idea["title"] in finalist_titles else '<span class="merged">merged into a finalist</span>'
        rats = "".join(f'<li><i class="dot {k}"></i><b>{JUDGE_NAME[k]} {j[k]["overall"]}</b> — {E(j[k].get("rationale",""))}'
                       + (f' <span class="doubt">Doubt: {E(j[k]["doubtful"])}</span>' if j[k].get("doubtful") else "") + "</li>"
                       for k in ("opus", "astra", "fable") if k in j)
        dp = ""
        if i in deep:
            dp = "<div class='deep'><b>In-depth round:</b> " + " ".join(
                f"{JUDGE_NAME[k]} {v['overall']}" for k, v in deep[i].items()) + "</div>"
        idea_rows.append(f'''<details class="idea" data-cat="{idea['category']}">
  <summary><span class="rk">{r['rank']}</span><span class="it">{E(idea['title'])} {tag}</span><span class="sc">{scores}</span></summary>
  <div class="idea-body">
    <p><b>Frame.</b> {E(idea['frame'])}</p>
    <p><b>Sound.</b> {E(idea['genre'])} · <b>Device.</b> {E(idea['device'])}</p>
    <blockquote>{"<br>".join(E(c) for c in idea['chorus'])}</blockquote>
    <p class="small"><b>Leans on:</b> {E("; ".join(idea['refs']))}</p>
    <ul class="rats">{rats}</ul>{dp}
  </div>
</details>''')
    cats = sorted({ideas[i]["category"] for i in ideas})
    chips = '<button class="chip on" data-f="all">All 105</button>' + "".join(
        f'<button class="chip" data-f="{c}">{E(CAT_LABEL.get(c, c))}</button>' for c in cats)

    spend = 0.0
    for line in open(ROOT / "logs/llm_calls.jsonl"):
        spend += json.loads(line).get("cost") or 0

    factcheck = ""
    fc = ROOT / "lyrics/factcheck_summary.html"
    if fc.exists():
        factcheck = fc.read_text()

    page = TEMPLATE.replace("{{FINALISTS}}", "\n".join(fin_html)).replace("{{IDEAS}}", "\n".join(idea_rows)) \
        .replace("{{CHIPS}}", chips).replace("{{SPEND}}", f"{spend:.2f}").replace("{{FACTCHECK}}", factcheck)
    (OUT / "index.html").write_text(page)
    print("wrote", OUT / "index.html", f"{len(page)/1024:.0f} KB")


TEMPLATE = r'''<title>Interp Song Shortlist</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<style>
:root{
  --bg:#F7F7F4; --surface:#FFFFFF; --ink:#17191F; --muted:#5D6371; --rule:#E3E4DE;
  --a1:#FFF3D1; --a2:#FFE3A1; --a3:#FFC75A; --a3ink:#17191F; --edge:#F59E0B;
  --link:#3446C9; --opus:#7A4FD6; --astra:#1D8AA8; --fable:#C2410C;
  --good:#1F7A45; --warnbg:#FFF1E6;
  --display:"Bricolage Grotesque", "Avenir Next", system-ui, sans-serif;
  --body:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono:"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  color-scheme:dark; --bg:#111317; --surface:#181B21; --ink:#ECEDEA; --muted:#9CA3AF; --rule:#2A2E36;
  --a1:#2E2610; --a2:#4A3810; --a3:#7A560B; --a3ink:#FFF7E6; --edge:#F5A524; --link:#93A5FF;
  --opus:#A98BF0; --astra:#4FB8D6; --fable:#F07A3D; --good:#5BC98A; --warnbg:#2A1F17; } }
:root[data-theme="dark"]{
  color-scheme:dark; --bg:#111317; --surface:#181B21; --ink:#ECEDEA; --muted:#9CA3AF; --rule:#2A2E36;
  --a1:#2E2610; --a2:#4A3810; --a3:#7A560B; --a3ink:#FFF7E6; --edge:#F5A524; --link:#93A5FF;
  --opus:#A98BF0; --astra:#4FB8D6; --fable:#F07A3D; --good:#5BC98A; --warnbg:#2A1F17; }
*{box-sizing:border-box}
body{background:var(--bg); color:var(--ink); font:16px/1.55 var(--body); margin:0}
.wrap{max-width:1180px; margin:0 auto; padding-inline:clamp(16px,4vw,40px); padding-block:28px 80px}
a{color:var(--link)}
h1,h2,h3,h4{font-family:var(--display); text-wrap:balance; margin:0}
h1{font-size:clamp(34px,5.4vw,58px); font-weight:800; letter-spacing:-.02em; line-height:1.02}
h2{font-size:clamp(24px,3vw,32px); font-weight:700; letter-spacing:-.01em; margin-block:56px 8px}
h3{font-size:clamp(24px,3vw,30px); font-weight:800; letter-spacing:-.01em}
h4{font-size:15px; font-weight:700; margin-block:22px 8px}
.eyebrow{font:500 12px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; color:var(--muted)}
.lede{max-width:68ch; font-size:18px; color:var(--ink); margin-block:14px 0}
.small{font-size:13.5px; color:var(--muted)}
.hero{display:grid; gap:20px; padding-block:12px 8px}
.ask{display:grid; grid-template-columns:1.25fr 1fr; gap:18px; margin-top:22px}
@media (max-width:820px){.ask{grid-template-columns:1fr}}
.card{background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:18px 20px}
.pick h4{margin-top:0}
.pick p{margin:6px 0 0}
.reply label{display:block; font-size:13.5px; color:var(--muted); margin-top:10px}
.reply select,.reply textarea{width:100%; font:15px/1.4 var(--body); color:var(--ink); background:var(--bg); border:1px solid var(--rule); border-radius:8px; padding:8px 10px}
.reply textarea{min-height:64px; resize:vertical}
.reply output{display:block; font:14px/1.4 var(--mono); background:var(--bg); border:1px dashed var(--rule); border-radius:8px; padding:10px; margin-top:10px; white-space:pre-wrap; word-break:break-word}
button{font:600 14px/1 var(--body); border-radius:8px; border:1px solid var(--ink); background:var(--ink); color:var(--bg); padding:10px 14px; cursor:pointer; margin-top:10px}
button:focus-visible, summary:focus-visible, select:focus-visible, textarea:focus-visible{outline:2px solid var(--link); outline-offset:2px}
.toc{display:flex; flex-wrap:wrap; gap:8px; margin-top:18px}
.toc a{font:500 14px/1 var(--body); text-decoration:none; color:var(--ink); border:1px solid var(--rule); background:var(--surface); border-radius:999px; padding:8px 12px}
.toc a b{font-family:var(--mono); color:var(--muted); margin-right:6px}
/* finalists */
.finalist{border-top:2px solid var(--ink); padding-top:22px; margin-top:44px}
.f-head{display:grid; grid-template-columns:auto 1fr auto; gap:16px; align-items:center}
@media (max-width:640px){.f-head{grid-template-columns:auto 1fr}.f-score{grid-column:1/-1}}
.letter{font:800 38px/1 var(--display); width:56px; height:56px; display:grid; place-items:center; border-radius:10px; background:var(--a2); color:var(--a3ink)}
.meta{margin:4px 0 0; color:var(--muted); font-size:14px}
.f-score{display:flex; align-items:center; gap:10px; font-size:13px; color:var(--muted)}
.f-score b{font-family:var(--mono); color:var(--ink)}
.spark-line{stroke:var(--ink); stroke-width:2} .spark-dot{fill:var(--edge)} .spark-grid{stroke:var(--rule); stroke-dasharray:3 3}
.concept{max-width:72ch; font-size:17px; margin-block:14px}
.sketches{display:flex; flex-wrap:wrap; gap:14px}
.sketch{margin:0; background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:12px 14px; flex:1 1 300px; min-width:0}
.sketch figcaption{font-weight:600; font-size:14px; margin-bottom:8px}
.sketch audio{width:100%; max-width:100%}
.qa{font-size:13px; color:var(--muted); margin-top:6px}
.qa b{font-family:var(--mono); color:var(--ink)}
.qa summary{cursor:pointer; margin-top:4px}
.two{display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr); gap:28px; margin-top:22px}
@media (max-width:900px){.two{grid-template-columns:minmax(0,1fr)}}
.howto{font-size:13px; color:var(--muted); margin:0 0 10px}
.lyrics{font-family:var(--mono); font-size:14.5px; line-height:1.5; overflow-wrap:anywhere; min-width:0}
.sec{margin-bottom:16px}
.sec-tag{display:flex; flex-wrap:wrap; gap:8px; align-items:baseline; margin-bottom:4px}
.sec-tag span{font:600 11.5px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; color:var(--ink)}
.sec-tag em{font:italic 12.5px/1.3 var(--body); color:var(--muted)}
.ln{margin:1px 0}
.ln summary{list-style:none; cursor:pointer; padding:1px 6px; border-radius:4px; display:inline}
.ln summary::-webkit-details-marker{display:none}
.ln .tok{box-decoration-break:clone; -webkit-box-decoration-break:clone; padding:1px 3px; border-radius:3px}
.a1 .tok{background:var(--a1)} .a2 .tok{background:var(--a2)} .a3 .tok{background:var(--a3); color:var(--a3ink)}
.ln.plain{padding:1px 9px}
.ln.cut .tok{text-decoration:line-through; text-decoration-thickness:1.5px; opacity:.55}
.ln.cut2 .tok{text-decoration:underline dotted; text-underline-offset:3px; opacity:.8}
.lyrics.hidecut .ln.cut{display:none}
.cuttoggle{display:inline-flex; gap:6px; align-items:center; font-size:12.5px; color:var(--muted); margin:0 0 8px; cursor:pointer}
ul.why{margin:6px 0 0; padding-left:18px; font-size:12.5px; color:var(--muted)} ul.why li{margin:3px 0} ul.why b{color:var(--ink); font-variant-numeric:tabular-nums}
.ln[open] .tok{outline:1.5px solid var(--edge)}
.note{font:13.5px/1.45 var(--body); color:var(--ink); background:var(--surface); border-left:3px solid var(--edge); padding:8px 12px; margin:6px 0 8px 6px; max-width:62ch}
.sung{font:12.5px/1.4 var(--mono); color:var(--muted); margin-top:4px}
.refids{font:11.5px/1.4 var(--mono); color:var(--muted); margin-top:4px; overflow-wrap:anywhere}
.side p{margin:0; max-width:62ch}
.grid-wrap{overflow-x:auto}
table.scores{border-collapse:collapse; font:13px/1 var(--mono); font-variant-numeric:tabular-nums}
.scores th,.scores td{padding:6px 7px; text-align:center; border-bottom:1px solid var(--rule)}
.scores th.jn{text-align:left; font-family:var(--body); font-weight:500; white-space:nowrap}
.scores td.s8,.scores td.s9{background:var(--a2); color:var(--a3ink)} .scores td.s5,.scores td.s6{color:var(--muted)}
.scores tr.mean td{border-bottom:0}
.dot{display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; vertical-align:middle}
.dot.opus{background:var(--opus)} .dot.astra{background:var(--astra)} .dot.fable{background:var(--fable)}
.dens{list-style:none; padding:0; margin:6px 0 0; font-size:13px; display:grid; gap:2px}
.dens li{display:flex; justify-content:space-between; gap:12px; border-bottom:1px dotted var(--rule); padding-block:2px}
.dens b{font:500 12.5px var(--mono); color:var(--muted)}
.fnotes{list-style:none; padding:0; margin:0; display:grid; gap:12px; font-size:14px}
.fnotes .who{display:block; font-weight:600; margin-bottom:2px}
.fnotes .lbl{font:500 11px var(--mono); text-transform:uppercase; letter-spacing:.06em; color:var(--muted)}
.fnotes .q{font-style:italic}
/* ideas */
.chips{display:flex; flex-wrap:wrap; gap:8px; margin-block:12px}
.chip{background:var(--surface); color:var(--ink); border:1px solid var(--rule); font-weight:500; margin:0; padding:7px 11px; border-radius:999px}
.chip.on{background:var(--ink); color:var(--bg); border-color:var(--ink)}
.idea{border-bottom:1px solid var(--rule)}
.idea summary{display:grid; grid-template-columns:2.6em minmax(0,1fr) auto; gap:10px; align-items:center; padding:9px 4px; cursor:pointer; list-style:none}
.idea summary::-webkit-details-marker{display:none}
.rk{font:500 13px var(--mono); color:var(--muted); text-align:right}
.it{font-weight:600}
.sc{display:flex; gap:4px}
.pill{font:500 12px/1 var(--mono); font-style:normal; min-width:24px; text-align:center; padding:4px 5px; border-radius:5px; color:#fff}
.pill.opus{background:var(--opus)} .pill.astra{background:var(--astra)} .pill.fable{background:var(--fable)}
.fin,.merged{font:600 10.5px/1 var(--mono); text-transform:uppercase; letter-spacing:.06em; padding:3px 6px; border-radius:4px; margin-left:6px; vertical-align:middle}
.fin{background:var(--a2); color:var(--a3ink)} .merged{border:1px solid var(--rule); color:var(--muted)}
.idea-body{padding:4px 4px 16px 3.2em; font-size:14.5px; max-width:90ch}
.idea-body p{margin:6px 0}
.idea-body blockquote{margin:8px 0; font-family:var(--mono); font-size:14px; border-left:3px solid var(--edge); padding-left:10px}
.rats{padding-left:0; list-style:none; display:grid; gap:6px; margin:8px 0}
.doubt{display:block; color:var(--muted); font-size:13px}
.deep{font-size:13px; color:var(--muted)}
.method{columns:2 320px; column-gap:32px; font-size:15px}
.method p{margin:0 0 12px; break-inside:avoid}
.fc{background:var(--warnbg); border-radius:10px; padding:14px 18px; font-size:14.5px}
@media (prefers-reduced-motion: reduce){*{scroll-behavior:auto!important}}
</style>
<div class="wrap">
<header class="hero">
  <span class="eyebrow">Interp music video · checkpoint 1 of 3 · lyrics</span>
  <h1>Five songs about reading a model's mind</h1>
  <p class="lede">I wrote 105 song ideas after a week's worth of research (your papers read in full, the canon verified, and an audit of the last three months of interp Twitter). Three blind judges (Opus 5.5, GPT-6 Astra, Fable 5.1) scored every idea; I developed five into full lyrics and ran eight revise-and-rejudge rounds on each. Every reference is tagged to a verified source. Tap any highlighted line to see it.</p>
  <div class="ask">
    <div class="card pick">
      <h4>My recommendation: A — One Direction</h4>
      <p>The best hook in the set, the most singable (100% of the chorus words transcribed), a model-as-singer protagonist for the video, and a clear clip moment. Close second: <b>B — Read Your Mind</b>, the judges' consensus winner and the densest tour of the field, held back only by a stock-phrase title. If you like B's bridge, I can graft its “Is it useful? — IT KINDA WORKS!” stop-time onto A.</p>
      <p class="small" style="margin-top:10px">Reply with a letter (“A”), a letter plus edits (“A, but cut verse 3”), or a mix (“A's chorus + B's verses”). The builder on the right writes that reply for you.</p>
    </div>
    <form class="card reply" id="reply" onsubmit="return false">
      <h4 style="margin-top:0">Write your reply</h4>
      <label for="pick">Song</label>
      <select id="pick"><option value="A">A — One Direction</option><option value="B">B — Read Your Mind</option><option value="C">C — Is This A Test?</option><option value="D">D — Scheming Or Just Confused</option><option value="E">E — Think Out Loud</option></select>
      <label for="edits">Edits or mix-and-match (optional)</label>
      <textarea id="edits" placeholder="e.g. graft B's bridge; cut verse 3; change 'downward dog' line"></textarea>
      <output id="out">A</output>
      <button type="button" id="copy">Copy reply</button> <span id="copied" class="small" aria-live="polite"></span>
    </form>
  </div>
  <nav class="toc" aria-label="finalists"><a href="#a"><b>A</b>One Direction</a><a href="#b"><b>B</b>Read Your Mind</a><a href="#c"><b>C</b>Is This A Test?</a><a href="#d"><b>D</b>Scheming Or Just Confused</a><a href="#e"><b>E</b>Think Out Loud</a><a href="#ideas">All 105 ideas</a><a href="#method">How it was made</a></nav>
</header>

<h2>The five finalists</h2>
<p class="small">Sketches are 22–24 s ElevenLabs Music v2.5 renders, only to let you hear the hooks. The real song will be made in Suno v6 after you pick. I can't hear these: "heard by transcribers" is the share of sung words that two speech-to-text engines recovered. For comparison, the viral P(doom) song scores 81%, with every jargon word lost.</p>
{{FACTCHECK}}
{{FINALISTS}}

<h2 id="ideas">All 105 ideas, ranked</h2>
<p class="small">Ranked by the three judges' blind scores, z-scored per judge and averaged. Coloured pills are overall scores out of 10 (<i class="dot opus"></i>Opus 5.5, <i class="dot astra"></i>GPT-6 Astra, <i class="dot fable"></i>Fable 5.1). Each judge saw the ideas in its own shuffled order. The top 16 also got an in-depth review.</p>
<div class="chips" role="group" aria-label="filter by category">{{CHIPS}}</div>
<div id="idealist">{{IDEAS}}</div>

<h2 id="method">How it was made</h2>
<div class="method">
<p><b>Research first.</b> Six agents read your 2025–26 papers and posts in full (70 entries), verified 97 canon and safety references against primary sources, audited 2026 AI events on the web, and read ~270 tweets from the interp and safety corner of X in your Chrome, read-only. They caught ~48 errors in the old reference bank. Examples: "5× fewer violations" is really 15% → 2%; AUC 0.90 belongs to the LoRA probe; the overcrowded workshop was ICML 2024; "cats, cars and the letter Q" was invented.</p>
<p><b>Blind judging.</b> Three judges, blind to each other, to authorship and to earlier scores, scored all 105 ideas in shuffled batches of ~10, then 16 in depth. Five finalists went through eight revise-and-rejudge rounds, every change logged in <code>lyrics/changelog.md</code>. I overruled the judges where they sanded off weird lines (all three kept praising "covering for your ex like it's your own existence", so it stays).</p>
<p><b>Singability, measured.</b> After four rounds of judges guessing, I rendered sung sketches and transcribed them back. That showed the judges' singability scores were only loosely predictive, and that jargon (logit lens → "Melodic bliss", type hints → "tie pins") will rely on the on-screen lyrics, exactly as in the reference video.</p>
<p><b>Spend so far.</b> Judges: ${{SPEND}} of the ~$60 budget (every call logged with provider and cached tokens; Astra on the half-price flex tier; Claude judges share one prompt cache). ElevenLabs sketches: a few thousand credits. Image and video generation: $0.</p>
<p><b>What happens next.</b> Once you pick, I lock the lyrics and change a word only to fix diction (and tell you). Every finalist is too long to sing in 2:19, so I'll also cut whole lines to fit and show you the cut list before recording. Each finalist below shows my proposed cut, struck through, with the reasons under “Length”. Then I make 20+ Suno v6 takes in 2–3 production styles, plus an ElevenLabs comparison, and send you a blind shortlist. Meanwhile I'm setting up the animation kit and the timing pipeline.</p>
</div>
</div>
<script>
(function(){
  var pick=document.getElementById('pick'), edits=document.getElementById('edits'), out=document.getElementById('out');
  function upd(){ var e=edits.value.trim(); out.textContent = pick.value + (e ? ', ' + e : ''); }
  pick.addEventListener('change',upd); edits.addEventListener('input',upd);
  document.getElementById('copy').addEventListener('click',function(){
    var t=out.textContent, msg=document.getElementById('copied');
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(function(){msg.textContent='Copied';},function(){sel();}); } else { sel(); }
    function sel(){ var r=document.createRange(); r.selectNodeContents(out); var s=window.getSelection(); s.removeAllRanges(); s.addRange(r); msg.textContent='Selected — press ⌘C'; }
  });
  document.querySelectorAll('input.hidecut').forEach(function(cb){ cb.addEventListener('change',function(){
    cb.closest('.lyrics').classList.toggle('hidecut', cb.checked); }); });
  var chips=document.querySelectorAll('.chip'), items=document.querySelectorAll('.idea');
  chips.forEach(function(c){ c.addEventListener('click',function(){
    chips.forEach(function(x){x.classList.remove('on');}); c.classList.add('on');
    var f=c.getAttribute('data-f');
    items.forEach(function(it){ it.hidden = !(f==='all' || it.getAttribute('data-cat')===f); });
  }); });
})();
</script>
'''

if __name__ == "__main__":
    build()
