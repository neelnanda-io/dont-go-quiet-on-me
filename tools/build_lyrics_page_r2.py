"""Build the round-2 lyrics checkpoint page: the new top 5 + the conservative B control, phone-first.

Usage: python tools/build_lyrics_page_r2.py [config.json]   (default lyrics/round2/finalists_r2.json)
Round 3 uses the same builder with lyrics/round3/finalists_r3.json: every round-specific path and heading is a config
key with the round-2 value as its default (src_dir, rounds, h2h, last_round, out_dir, all, page_title, eyebrow, h1).
all.blurb, summary_html and process_html are trusted HTML from the config; everything else is escaped.
Inputs:
  lyrics/round2/finalists_r2.json   per-finalist text: letter, slug, title, pitch, view, sound, how (ask -> how), sketches,
                                    judges_since (optional: what changed after the judges' last notes)
  lyrics/round2/rE/<slug>.lyr       final lyrics (+ notes)          lyrics/judging/r2{a,b,d,e}_<slug>/raw.json   scores
  lyrics/judging/r2{c,d,e}_rank/    head-to-head rankings           lyrics/judging/r2a_ranking.json + drafts/*.concept.md
Design rules (after round 1): everything Neel must review is full-contrast and legible at 400 px (no strikethrough-only
signals); sources sit behind a tap; one column on phones.
"""
import html
import json
import re
import shutil
import statistics as st
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output" / "checkpoint1_r2"
E = html.escape
JUDGES = ("opus", "astra", "fable")
JUDGE_NAME = {"opus": "Opus 5.5", "astra": "GPT-6 Astra", "fable": "Fable 5.1"}
ROUNDS = [("A", "r2a"), ("B", "r2b"), ("D", "r2d"), ("E", "r2e")]
H2H = [("C", "r2c_rank"), ("D", "r2d_rank"), ("E", "r2e_rank")]
LAST_ROUND = "r2e"


def lyr_parse(path):
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    from lyricfmt import parse
    return parse(path)


def render_lyrics(song):
    out = []
    for sec in song["sections"]:
        name, _, cue = sec["tag"].partition("|")
        out.append(f'<div class="sec"><div class="sec-tag"><span>{E(name.strip())}</span>'
                   + (f'<em>{E(cue.strip())}</em>' if cue.strip() else "") + "</div>")
        for ln in sec["lines"]:
            disp, refs, note = ln["display"], ln["refs"], ln["note"]
            sung = f'<div class="sung">sung: {E(ln["sung"])}</div>' if ln["sung"] != disp else ""
            if note or refs:
                out.append(f'<details class="ln ref"><summary><span class="tok">{E(disp)}</span></summary>'
                           f'<div class="note">{E(note)}{sung}</div></details>')
            else:
                out.append(f'<div class="ln"><span class="tok">{E(disp)}</span>{sung}</div>')
        out.append("</div>")
    return "\n".join(out)


def overall_by_round(slug):
    res = []
    for lab, pre in ROUNDS:
        p = ROOT / f"lyrics/judging/{pre}_{slug}/raw.json"
        if not p.exists():
            res.append((lab, None))
            continue
        raw = json.loads(p.read_text())
        vals = [r["review"]["overall"] for r in raw.values() if r and isinstance(r.get("review"), dict)]
        res.append((lab, round(st.mean(vals), 2) if vals else None))
    return res


def h2h(slug):
    out = []
    for lab, d in H2H:
        md = ROOT / f"lyrics/judging/{d}/ranking.md"
        if not md.exists():
            continue
        rows = [l for l in md.read_text().splitlines() if l.startswith("| ") and "|---" not in l and "draft" not in l]
        n = len(rows)
        for l in rows:
            cells = [c.strip() for c in l.strip("|").split("|")]
            if cells[1] == slug:
                out.append((lab, int(cells[0]), n, int(cells[2])))
    return out


def last_notes(slug):
    p = ROOT / f"lyrics/judging/{LAST_ROUND}_{slug}/raw.json"
    if not p.exists():
        return ""
    raw = json.loads(p.read_text())
    items = []
    for j in JUDGES:
        r = raw.get(j)
        if not r:
            continue
        v = r["review"]
        items.append(f'<li><span class="who"><i class="dot {j}"></i>{JUDGE_NAME[j]} · {v["overall"]}/10</span>'
                     f'<span class="lbl">Best lines</span> <span class="q">{E(" / ".join(v.get("best_lines", [])[:3]))}</span><br>'
                     f'<span class="lbl">One change</span> {E(str(v.get("one_change", "")))}</li>')
    return "<ul class='fnotes'>" + "".join(items) + "</ul>"


def anchor(label):
    """A safe HTML id from a finalist label: "B+" -> "bplus", "A'" -> "ap", "3" -> "3"."""
    return re.sub(r"[^a-z0-9]", lambda m: {"+": "plus", "'": "p", "’": "p"}.get(m.group(0), ""), label.lower())


def shorten(text, n=220):
    """First-sentence blurbs can run long: cut at a word boundary, and never leave a quote or bracket dangling."""
    if len(text) <= n:
        return text
    cut = text[:n].rsplit(" ", 1)[0]
    for _ in range(8):
        cut = cut.rstrip(",;:—–- ")
        if cut.count('"') % 2:
            cut = cut[:cut.rfind('"')]
        elif cut.count("(") > cut.count(")"):
            cut = cut[:cut.rfind("(")]
        else:
            break
    return cut.rstrip(",;:—–- ") + "…"


def build(cfg_path=ROOT / "lyrics/round2/finalists_r2.json"):
    global ROUNDS, H2H, LAST_ROUND, OUT
    cfg = json.loads(Path(cfg_path).read_text())
    ROUNDS = [tuple(x) for x in cfg.get("rounds", ROUNDS)]
    H2H = [tuple(x) for x in cfg.get("h2h", H2H)]
    LAST_ROUND = cfg.get("last_round", LAST_ROUND)
    OUT = ROOT / cfg.get("out_dir", "output/checkpoint1_r2")
    src_dir = cfg.get("src_dir", "lyrics/round2/rE")
    allc = cfg.get("all", {"ranking": "lyrics/judging/r2a_ranking.json", "concept_dir": "lyrics/round2/drafts",
                           "title": "All 34 round-2 variations",
                           "blurb": 'Ranked by round A (three blind judges; scores are Opus 5.5 / GPT-6 Astra / Fable 5.1). "Round B" = advanced to the first revision round.'})
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "sketches").mkdir(exist_ok=True)
    cards, toc, options = [], [], []
    for f in cfg["finalists"]:
        song = lyr_parse(ROOT / f"{src_dir}/{f['slug']}.lyr")
        nlines = sum(len(s["lines"]) for s in song["sections"])
        # length: quote BOTH models (round 1's lesson), fast = 2 bars a line at 145 BPM, slow = 2.7 sung syllables a second
        from syllables import bar_estimate, fmt, line_syl, projected
        syl = sum(line_syl(ln["sung"]) for s in song["sections"] for ln in s["lines"])
        length = f"about {fmt(bar_estimate(song, (), 145))}–{projected(syl, 2.7)}"
        scores = overall_by_round(f["slug"])
        sc = " · ".join(f"{lab} <b>{v:.1f}</b>" for lab, v in scores if v is not None)
        hh = " · ".join(f"{lab}: <b>#{r}</b> of {n}" for lab, r, n, _ in h2h(f["slug"]))
        how = "".join(f"<li><b>{E(k)}</b> {E(v)}</li>" for k, v in f["how"].items())
        sk = []
        for label, rel in f.get("sketches", []):
            src = ROOT / rel
            if src.exists():
                shutil.copy(src, OUT / "sketches" / src.name)
                sk.append(f'<figure class="sketch"><figcaption>{E(label)}</figcaption>'
                          f'<audio controls preload="none" src="sketches/{src.name}"></audio></figure>')
        badge = f.get("badge") or ("the conservative control" if f.get("control") else "")
        ctl = f' <span class="ctl">{E(badge)}</span>' if badge else ""
        cards.append(f'''
<section class="finalist" id="{anchor(f['letter'])}">
  <header class="f-head"><span class="letter">{E(f['letter'])}</span>
    <div><h3>{E(f['title'])}{ctl}</h3><p class="meta">{E(f['sound'])} · {nlines} lines · {length}</p></div></header>
  <p class="pitch">{E(f['pitch'])}</p>
  {"<div class='sketches'>" + "".join(sk) + "</div>" if sk else ""}
  <div class="facts">
    <div><h4>My view</h4><p>{E(f['view'])}</p></div>
    <div><h4>{E(f.get("how_title", "How it follows your notes"))}</h4><ul class="how">{how}</ul></div>
    <div><h4>Judges</h4><p class="small">Mean score by round (out of 10): {sc}<br>Head-to-head rank: {hh}</p>
      <p class="small">Their notes on the final round's draft, written before the fact-check, so a quoted line may since have changed. Most "one change" asks are compression passes, which I'd make on the song you pick.{(" " + E(f["judges_since"])) if f.get("judges_since") else ""}</p>{last_notes(f['slug'])}</div>
  </div>
  <details class="lyr-wrap" open><summary>Full lyrics <span class="small">(tap a highlighted line for its source)</span></summary>
    <div class="lyrics">{render_lyrics(song)}</div></details>
</section>''')
        toc.append(f'<a href="#{anchor(f["letter"])}"><b>{E(f["letter"])}</b>{E(f["title"])}</a>')
        options.append(f'<option value="{E(f["letter"])}">{E(f["letter"])} — {E(f["title"])}</option>')
    # all 34 variations
    rank = json.loads((ROOT / allc["ranking"]).read_text())
    adv = set(cfg.get("advanced_round_b", []))
    fin = {f["slug"] for f in cfg["finalists"]}
    label = {f["slug"]: f["letter"] for f in cfg["finalists"]}
    rows = []
    for i, t in enumerate(rank, 1):
        slug = t["slug"]
        cpath = ROOT / f"{allc['concept_dir']}/{slug}.concept.md"
        if slug == "00_b_v9":
            concept, title = "Round 1's B, unchanged (a calibration point for the judges).", "B v9 (round 1)"
        else:
            concept = cpath.read_text() if cpath.exists() else ""
            title = re.search(r"\*\*(.+?)\*\*", concept)
            # drop the draft number and trailing full stop: "12 Don't Go Quiet On Me." -> "Don't Go Quiet On Me"
            # (draft numbers would clash with the finalist labels 1-5)
            title = re.sub(r"^\d+\s+", "", title.group(1)).rstrip(".") if title else slug
            concept = re.sub(r"\*\*.+?\*\*\s*", "", concept, count=1).strip()
            parts = re.split(r"(?<=[.!?])\s", concept)
            first, i = parts[0], 1
            while first.count('"') % 2 and i < len(parts):  # a "!" or "?" inside a quote isn't a sentence end
                first, i = first + " " + parts[i], i + 1
            concept = shorten(first)
        tag = f"finalist {label[slug]}" if slug in fin else ("round B" if slug in adv else "")
        rows.append(f'<li><span class="rk">{i}</span><span class="it"><b>{E(title)}</b>'
                    + (f' <span class="tag">{tag}</span>' if tag else "") + f'<br><span class="small">{E(concept)}</span></span>'
                    f'<span class="sc">{" ".join(str(x) for x in t["overall"])}</span></li>')
    page = TEMPLATE.replace("{{PAGE_TITLE}}", E(cfg.get("page_title", "Interp Song Round Two"))) \
        .replace("{{EYEBROW}}", E(cfg.get("eyebrow", "Lyrics · round 2 · checkpoint 1 of 3"))) \
        .replace("{{H1}}", E(cfg.get("h1", "Five songs, and B kept honest"))) \
        .replace("{{ALL_TITLE}}", E(allc["title"])).replace("{{ALL_BLURB}}", allc["blurb"]) \
        .replace("{{CARDS}}", "\n".join(cards)).replace("{{TOC}}", "".join(toc)) \
        .replace("{{OPTIONS}}", "".join(options)).replace("{{ALL}}", "\n".join(rows)) \
        .replace("{{SUMMARY}}", cfg["summary_html"]).replace("{{PROCESS}}", cfg["process_html"])
    (OUT / "index.html").write_text(page)
    print("wrote", OUT / "index.html", f"{len(page) / 1024:.0f} KB")


TEMPLATE = r'''<title>{{PAGE_TITLE}}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<style>
:root{
  --bg:#F7F7F4; --surface:#FFFFFF; --ink:#17191F; --muted:#565C69; --rule:#E3E4DE;
  --a1:#FFF1C9; --edge:#E08A00; --link:#3446C9; --ctl:#E6F0FF; --ctlink:#23407A;
  --opus:#7A4FD6; --astra:#1D8AA8; --fable:#C2410C;
  --display:"Bricolage Grotesque", "Avenir Next", system-ui, sans-serif;
  --body:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono:"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  color-scheme:dark; --bg:#111317; --surface:#181B21; --ink:#ECEDEA; --muted:#A3AAB6; --rule:#2A2E36;
  --a1:#3A2F12; --edge:#F5A524; --link:#93A5FF; --ctl:#1A2640; --ctlink:#B9CCF5;
  --opus:#A98BF0; --astra:#4FB8D6; --fable:#F07A3D; } }
:root[data-theme="dark"]{
  color-scheme:dark; --bg:#111317; --surface:#181B21; --ink:#ECEDEA; --muted:#A3AAB6; --rule:#2A2E36;
  --a1:#3A2F12; --edge:#F5A524; --link:#93A5FF; --ctl:#1A2640; --ctlink:#B9CCF5;
  --opus:#A98BF0; --astra:#4FB8D6; --fable:#F07A3D; }
*{box-sizing:border-box}
body{background:var(--bg); color:var(--ink); font:17px/1.55 var(--body); margin:0}
.wrap{max-width:980px; margin:0 auto; padding-inline:clamp(16px,4vw,40px); padding-block:24px 80px}
a{color:var(--link)}
h1,h2,h3,h4{font-family:var(--display); text-wrap:balance; margin:0}
h1{font-size:clamp(32px,6vw,52px); font-weight:800; letter-spacing:-.02em; line-height:1.04}
h2{font-size:clamp(24px,4vw,32px); font-weight:700; margin-block:48px 10px}
h3{font-size:clamp(22px,4vw,28px); font-weight:800}
h4{font-size:15px; font-weight:700; margin-block:18px 6px}
.eyebrow{font:500 12px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; color:var(--muted)}
.lede{max-width:66ch; margin-block:12px 0}
.small{font-size:14px; color:var(--muted)}
.card{background:var(--surface); border:1px solid var(--rule); border-radius:12px; padding:16px 18px; margin-top:18px}
.card ul{margin:8px 0 0; padding-left:20px} .card li{margin:4px 0}
.toc{display:flex; flex-wrap:wrap; gap:8px; margin-top:16px}
.toc a{font:500 15px/1.2 var(--body); text-decoration:none; color:var(--ink); border:1px solid var(--rule); background:var(--surface); border-radius:999px; padding:9px 13px}
.toc a b{font-family:var(--mono); margin-right:7px}
.finalist{border-top:3px solid var(--ink); padding-top:20px; margin-top:44px}
.f-head{display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:center}
.letter{font:800 30px/1 var(--display); min-width:54px; height:54px; padding-inline:8px; display:grid; place-items:center; border-radius:12px; background:var(--a1); color:var(--ink); border:2px solid var(--edge)}
.ctl{display:inline-block; font:600 12px/1 var(--mono); letter-spacing:.04em; text-transform:uppercase; background:var(--ctl); color:var(--ctlink); border-radius:6px; padding:5px 7px; vertical-align:middle; margin-left:6px}
.meta{margin:4px 0 0; color:var(--muted); font-size:14px}
.pitch{font-size:18px; margin-block:14px; max-width:66ch}
.sketches{display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr)); gap:12px}
.sketch{margin:0; background:var(--surface); border:1px solid var(--rule); border-radius:12px; padding:12px 14px; min-width:0}
.sketch figcaption{font-weight:600; font-size:15px; margin-bottom:8px}
.sketch audio{width:100%}
.facts{display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr)); gap:4px 26px}
.facts p{margin:0}
.how{margin:0; padding-left:18px; font-size:15px} .how li{margin:5px 0}
.fnotes{list-style:none; padding:0; margin:8px 0 0; display:grid; gap:10px; font-size:14.5px}
.fnotes .who{display:block; font-weight:600}
.fnotes .lbl{font:500 11px var(--mono); text-transform:uppercase; letter-spacing:.06em; color:var(--muted)}
.fnotes .q{font-style:italic}
.dot{display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:6px; vertical-align:middle}
.dot.opus{background:var(--opus)} .dot.astra{background:var(--astra)} .dot.fable{background:var(--fable)}
.lyr-wrap{margin-top:18px}
.lyr-wrap>summary{cursor:pointer; font:700 16px/1.3 var(--display)}
.lyrics{margin-top:12px; font-size:17px; line-height:1.55; overflow-wrap:anywhere}
.sec{margin-bottom:18px}
.sec-tag{display:flex; flex-wrap:wrap; gap:8px; align-items:baseline; margin-bottom:4px}
.sec-tag span{font:600 12px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase}
.sec-tag em{font:italic 13.5px/1.35 var(--body); color:var(--muted)}
.ln{margin:2px 0}
.ln summary{list-style:none; cursor:pointer; display:inline}
.ln summary::-webkit-details-marker{display:none}
.ln.ref .tok{background:var(--a1); box-decoration-break:clone; -webkit-box-decoration-break:clone; padding:1px 4px; border-radius:4px; border-bottom:2px solid var(--edge)}
.ln[open] .tok{outline:2px solid var(--edge)}
.note{font:15px/1.5 var(--body); background:var(--surface); border-left:3px solid var(--edge); padding:8px 12px; margin:6px 0 10px; max-width:64ch}
.sung{font:13px/1.4 var(--mono); color:var(--muted); margin-top:4px}
.all{list-style:none; padding:0; margin:12px 0 0}
.all li{display:grid; grid-template-columns:2.2em minmax(0,1fr) auto; gap:10px; padding:10px 2px; border-bottom:1px solid var(--rule); align-items:start}
.all .rk{font:500 14px var(--mono); color:var(--muted)} .all .sc{font:500 14px var(--mono); white-space:nowrap}
.tag{font:600 11px/1 var(--mono); text-transform:uppercase; letter-spacing:.05em; background:var(--a1); border:1px solid var(--edge); border-radius:5px; padding:3px 5px}
.reply label{display:block; font-size:14px; color:var(--muted); margin-top:10px}
.reply select,.reply textarea{width:100%; font:16px/1.4 var(--body); color:var(--ink); background:var(--bg); border:1px solid var(--rule); border-radius:8px; padding:9px 10px}
.reply textarea{min-height:80px}
.reply output{display:block; font:14px/1.45 var(--mono); background:var(--bg); border:1px dashed var(--rule); border-radius:8px; padding:10px; margin-top:10px; white-space:pre-wrap; overflow-wrap:anywhere}
button{font:600 15px/1 var(--body); border-radius:8px; border:1px solid var(--ink); background:var(--ink); color:var(--bg); padding:11px 15px; cursor:pointer; margin-top:10px}
button:focus-visible, summary:focus-visible, select:focus-visible, textarea:focus-visible{outline:2px solid var(--link); outline-offset:2px}
</style>
<div class="wrap">
<header>
  <p class="eyebrow">{{EYEBROW}}</p>
  <h1>{{H1}}</h1>
  {{SUMMARY}}
  <nav class="toc">{{TOC}}</nav>
</header>
{{CARDS}}
<h2 id="process">How we got here</h2>
{{PROCESS}}
<h2 id="all">{{ALL_TITLE}}</h2>
<p class="small">{{ALL_BLURB}}</p>
<ul class="all">{{ALL}}</ul>
<h2 id="reply">Your pick</h2>
<div class="card reply">
  <label for="pick">Which song?</label>
  <select id="pick">{{OPTIONS}}<option value="mix">A mix (say which bits below)</option></select>
  <label for="edits">Edits, lines to keep or cut, anything else</label>
  <textarea id="edits" placeholder="e.g. 1, but with 3's killing part; cut the oracle line"></textarea>
  <output id="out"></output>
  <button id="copy" type="button">Copy reply</button> <span id="copied" class="small"></span>
  <p class="small">Paste it in chat.</p>
</div>
</div>
<script>
(function(){
  var pick=document.getElementById('pick'), edits=document.getElementById('edits'), out=document.getElementById('out');
  function upd(){ var e=edits.value.trim(); out.textContent='Lyrics: ' + pick.value + (e ? '\n' + e : ''); }
  pick.addEventListener('change',upd); edits.addEventListener('input',upd); upd();
  document.getElementById('copy').addEventListener('click',function(){
    var t=out.textContent, msg=document.getElementById('copied');
    function sel(){ var r=document.createRange(); r.selectNodeContents(out); var s=window.getSelection(); s.removeAllRanges(); s.addRange(r); msg.textContent='Selected: press Cmd+C'; }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(function(){msg.textContent='Copied';},sel); } else { sel(); }
  });
})();
</script>
'''

if __name__ == "__main__":
    import sys
    build(sys.argv[1]) if len(sys.argv) > 1 else build()
