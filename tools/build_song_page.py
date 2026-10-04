"""Build the song-pick page (checkpoint 2 of 3): a blind, loudness-matched shortlist of takes of the chosen song.

Usage: python tools/build_song_page.py <slug> --takes a,b,c,d [--title "One Direction"] [--out output/checkpoint2]
Reads audio/takes/<slug>/manifest.json (from tools/song_qa.py). Writes <out>/index.html plus <out>/clips/*.mp3,
ready to publish as an Artifact with the clips as supporting files.

Honesty: I can't hear. The page says so, shows the machine checks that did the shortlisting (two transcribers, the
jargon that survived, loudness, length vs the 2:19 cap), and hides which generator/style made each take until
"Reveal". Takes are loudness-matched (-14 LUFS) so louder never sounds better. Each take has jump buttons to its
sections (forced alignment), and "same moment" rows play the first chorus and the bridge from every take in turn.
The CSS/JS pattern is adapted from an earlier project's audio comparison page builder (copied, not imported).
"""
import argparse
import hashlib
import html
import json
import random
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
E = html.escape
TARGET_LUFS = -14.0
CAP_S = 139.0


def loudnorm(src, dst, t0=None, t1=None):
    """Loudness-match to TARGET_LUFS (single-pass loudnorm is fine for listening), optionally trimming [t0, t1]."""
    trim = ["-ss", f"{t0:.3f}", "-to", f"{t1:.3f}"] if t0 is not None else []
    fade = [f"afade=t=in:d=0.08,afade=t=out:st={max(0, t1 - t0 - .25):.3f}:d=0.25,"] if t0 is not None else [""]
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *trim, "-i", str(src), "-af",
                    f"{fade[0]}loudnorm=I={TARGET_LUFS}:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "160k", str(dst)], check=True)


def mmss(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


def build(slug, take_ids, title, out, labels):
    man = json.loads((ROOT / "audio/takes" / slug / "manifest.json").read_text())
    takes = {t["id"]: t for t in man["takes"]}
    missing = [t for t in take_ids if t not in takes]
    if missing:
        raise SystemExit(f"not in the manifest: {missing}")
    out = Path(out)
    (out / "clips").mkdir(parents=True, exist_ok=True)
    # blind order: a fixed shuffle seeded by the take ids (stable across rebuilds, unrelated to QA rank)
    order = take_ids[:]
    random.Random(int(hashlib.md5(",".join(take_ids).encode()).hexdigest(), 16)).shuffle(order)
    letters = {tid: "ABCDEFGH"[i] for i, tid in enumerate(order)}
    cards, moments = [], {"Chorus": [], "Bridge": []}
    for tid in order:
        t, L = takes[tid], letters[tid]
        src = ROOT / t["file"]
        loudnorm(src, out / "clips" / f"take_{L}.mp3")
        dur = t["tech"]["duration_s"]
        terms = t["terms"]
        both = [k for k, v in terms.items() if all(v)]
        neither = [k for k, v in terms.items() if not any(v)]
        jumps = "".join(f'<button type="button" class="jump" data-t="{s["t0"]:.2f}">{E(s["name"])} <span>{mmss(s["t0"])}</span></button>'
                        for s in t["sections"])
        weak = "".join(f'<li>{E(w["line"])} <span>{w["gpt4o"]:.0%} / {w["whisper"]:.0%}</span></li>' for w in t["weak_lines"][:8])
        cards.append(f'''
<article class="take" data-letter="{L}">
  <header><h3>Take {L}</h3><span class="src">{E(labels.get(tid, tid))}</span></header>
  <audio controls preload="metadata" src="clips/take_{L}.mp3"></audio>
  <div class="jumps">{jumps}</div>
  <dl class="figs">
    <div><dt>Length</dt><dd class="{'bad' if dur > CAP_S else ''}">{mmss(dur)}{' (over 2:19)' if dur > CAP_S else ''}</dd></div>
    <div><dt>Words heard</dt><dd>{t["recall"]["gpt4o"]:.0%} / {t["recall"]["whisper"]:.0%}</dd></div>
    <div><dt>Jargon heard by both</dt><dd>{len(both)} of {len(terms)}</dd></div>
    <div><dt>Loudness as made</dt><dd>{t["tech"]["lufs"]} LUFS</dd></div>
  </dl>
  {f'<p class="miss">Neither transcriber heard: {E(", ".join(neither))}</p>' if neither else ''}
  {f'<details><summary>Lines the transcribers mostly missed</summary><ul class="weak">{weak}</ul></details>' if weak else ''}
</article>''')
        for name in moments:
            sec = next((s for s in t["sections"] if s["name"].startswith(name)), None)
            if sec:
                f = out / "clips" / f"take_{L}_{name.lower()}.mp3"
                loudnorm(src, f, max(0, sec["t0"] - .4), min(dur, sec["t1"] + .8))
                moments[name].append(f'<div class="mo" data-letter="{L}"><b>{L}</b><audio controls preload="none" src="clips/{f.name}"></audio></div>')
    moment_html = "".join(f'''
<section class="moment"><div class="mhead"><h3>{"The first chorus" if n == "Chorus" else "The bridge"}, take by take</h3>
<button type="button" data-playall aria-pressed="false">Play in turn</button></div><div class="mrow">{"".join(v)}</div></section>'''
                          for n, v in moments.items() if v)
    options = "".join(f'<option value="Take {letters[t]}">Take {letters[t]}</option>' for t in order)
    page = TEMPLATE.replace("__TITLE__", E(title)).replace("__N__", str(len(order))).replace("__CARDS__", "".join(cards)) \
        .replace("__MOMENTS__", moment_html).replace("__OPTIONS__", options)
    (out / "index.html").write_text(page.encode("ascii", "xmlcharrefreplace").decode("ascii"))
    (out / "key.json").write_text(json.dumps({letters[t]: {"id": t, "label": labels.get(t, t)} for t in order}, indent=1))
    print(f"wrote {out / 'index.html'} with {len(order)} takes; key in {out / 'key.json'}")


TEMPLATE = r"""<title>__TITLE__: Pick a Take</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
:root{ --bg:#F4F1FA; --surface:#FFFFFF; --ink:#1C1830; --muted:#5E5872; --rule:#DDD7EA; --accent:#C2185B; --accent-soft:#FBE3EE;
  --bad:#B3261E; --playing:#FFF2D6; --focus:#3D5AFE;
  --sans:"Bricolage Grotesque","Avenir Next","Segoe UI",system-ui,sans-serif; --mono:"JetBrains Mono","SF Mono",Menlo,monospace; }
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){ color-scheme:dark; --bg:#12101A; --surface:#1B1826; --ink:#EDEAF5;
  --muted:#A29CB6; --rule:#2E2A3D; --accent:#FF6FA8; --accent-soft:#3A1E2C; --bad:#FF8A80; --playing:#33291A; --focus:#8C9EFF; } }
:root[data-theme="dark"]{ color-scheme:dark; --bg:#12101A; --surface:#1B1826; --ink:#EDEAF5; --muted:#A29CB6; --rule:#2E2A3D;
  --accent:#FF6FA8; --accent-soft:#3A1E2C; --bad:#FF8A80; --playing:#33291A; --focus:#8C9EFF; }
body{background:var(--bg); color:var(--ink); font:400 16px/1.55 var(--sans); margin:0}
.wrap{max-width:1180px; margin:0 auto; padding-inline:clamp(16px,4vw,40px); padding-block:36px 72px; display:grid; gap:36px}
header.top{display:grid; gap:12px; max-width:74ch}
.eyebrow{font:600 12px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; color:var(--muted)}
h1{font:800 clamp(32px,5.5vw,52px)/1.02 var(--sans); letter-spacing:-.02em; margin:0; text-wrap:balance}
.lede{margin:0; color:var(--muted); font-size:17px} .lede b{color:var(--ink)}
.controls{display:flex; flex-wrap:wrap; gap:10px; align-items:center}
button{font:600 14px/1 var(--sans); color:var(--ink); background:var(--surface); border:1px solid var(--rule); border-radius:999px; padding:9px 14px; cursor:pointer}
button:hover{border-color:var(--muted)} button:focus-visible,audio:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid var(--focus); outline-offset:2px}
button[aria-pressed="true"]{background:var(--accent); color:#fff; border-color:var(--accent)}
.grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr)); gap:16px}
.take{background:var(--surface); border:1px solid var(--rule); border-radius:14px; padding:16px; display:grid; gap:12px; align-content:start; min-width:0}
.take.is-playing{background:var(--playing); border-color:var(--accent)}
.take header{display:flex; justify-content:space-between; align-items:baseline; gap:10px}
.take h3{font:800 24px/1 var(--sans); margin:0}
.src{font:400 12.5px var(--mono); color:var(--muted); display:none; overflow-wrap:anywhere}
.revealed .src{display:inline}
audio{width:100%; height:40px}
.jumps{display:flex; flex-wrap:wrap; gap:6px}
.jump{font-size:12.5px; padding:6px 10px} .jump span{font:400 11.5px var(--mono); color:var(--muted)}
.figs{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px 14px; margin:0}
.figs div{display:grid; gap:1px} .figs dt{font:600 11.5px/1.2 var(--sans); letter-spacing:.04em; text-transform:uppercase; color:var(--muted)}
.figs dd{margin:0; font:600 15px/1.3 var(--mono); font-variant-numeric:tabular-nums} .figs dd.bad{color:var(--bad)}
.miss{margin:0; font-size:13.5px; color:var(--bad)}
details summary{cursor:pointer; font-size:13.5px; color:var(--muted)} .weak{margin:6px 0 0; padding-left:18px; font-size:13.5px} .weak span{font:400 12px var(--mono); color:var(--muted)}
.moment{display:grid; gap:12px; border-top:1px solid var(--rule); padding-top:22px}
.mhead{display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px} .mhead h3{margin:0; font:700 20px/1.2 var(--sans)}
.mrow{display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr)); gap:10px}
.mo{display:grid; grid-template-columns:auto 1fr; gap:10px; align-items:center; background:var(--surface); border:1px solid var(--rule); border-radius:12px; padding:8px 12px}
.mo.is-playing{background:var(--playing); border-color:var(--accent)} .mo b{font:800 18px var(--sans)}
.reply{background:var(--accent-soft); border-radius:14px; padding:18px; display:grid; gap:10px; max-width:760px}
.reply h2{margin:0; font:800 22px/1.2 var(--sans)} .reply .row{display:flex; flex-wrap:wrap; gap:10px; align-items:center}
select,textarea{font:400 15px var(--sans); color:var(--ink); background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:8px 10px}
textarea{width:100%; box-sizing:border-box; min-height:64px}
#out{font:500 14px/1.4 var(--mono); background:var(--surface); border:1px dashed var(--rule); border-radius:10px; padding:10px; white-space:pre-wrap; overflow-wrap:anywhere}
footer{border-top:1px solid var(--rule); padding-top:22px; color:var(--muted); font-size:14px; display:grid; gap:8px; max-width:80ch}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">Checkpoint 2 of 3 · the song</div>
    <h1>__TITLE__: pick a take</h1>
    <p class="lede"><b>I can't hear, so treat my shortlist as a filter, not a taste.</b> These __N__ takes survived machine
      checks: length under 2:19, two transcribers hearing the words (gpt-4o-transcribe / Whisper), which of the jargon both
      of them caught, and clean loudness. All are loudness-matched to −14 LUFS so none sounds better just by being louder.
      The takes are shuffled, and which generator and style made each one is hidden until you press Reveal.</p>
    <div class="controls"><button id="reveal" type="button" aria-pressed="false">Reveal how each was made</button></div>
  </header>
  <div class="grid">__CARDS__</div>
  __MOMENTS__
  <section class="reply" aria-label="Reply">
    <h2>Your pick</h2>
    <div class="row"><label for="pick">Take</label><select id="pick">__OPTIONS__</select></div>
    <textarea id="notes" placeholder="Optional: anything to fix (a word, the intro, the ending)…"></textarea>
    <div id="out"></div>
    <div class="row"><button id="copy" type="button">Copy reply</button><span id="copied" class="eyebrow"></span></div>
    <p class="eyebrow" style="text-transform:none;letter-spacing:0">Paste it in chat.</p>
  </section>
  <footer>
    <div><b>How these were checked.</b> Each take's vocal was separated with Demucs, then transcribed with no lyric prompt by
      two engines; "words heard" is the share of the lyric's words found in order. Jargon misses are expected and fine: the
      lyrics are on screen in the video, as in the reference. Section buttons come from forced alignment of the lyric to the vocal.</div>
  </footer>
</div>
<script>
(() => {
  const audios = [...document.querySelectorAll("audio")];
  const mark = a => { document.querySelectorAll(".is-playing").forEach(c => c.classList.remove("is-playing")); const c = a.closest(".take,.mo"); if (c) c.classList.add("is-playing"); };
  audios.forEach(a => a.addEventListener("play", () => { audios.forEach(b => { if (b !== a) b.pause(); }); mark(a); }));
  document.querySelectorAll(".jump").forEach(b => b.addEventListener("click", () => {
    const a = b.closest(".take").querySelector("audio"); a.currentTime = +b.dataset.t; a.play().catch(() => {});
  }));
  let queue = null;
  const stop = () => { if (queue) queue.cancelled = true; queue = null; audios.forEach(a => { a.pause(); a.onended = null; });
    document.querySelectorAll("[data-playall]").forEach(b => { b.textContent = "Play in turn"; b.setAttribute("aria-pressed", "false"); }); };
  document.querySelectorAll("[data-playall]").forEach(btn => btn.addEventListener("click", () => {
    const was = btn.getAttribute("aria-pressed") === "true"; stop(); if (was) return;
    const list = [...btn.closest("section").querySelectorAll("audio")], q = { cancelled: false }; queue = q; let i = 0;
    btn.textContent = "Stop"; btn.setAttribute("aria-pressed", "true");
    const next = () => { if (q.cancelled) return; if (i >= list.length) { stop(); return; } const a = list[i++]; a.currentTime = 0;
      a.onended = () => { a.onended = null; next(); }; a.play().catch(stop); };
    next();
  }));
  const rv = document.getElementById("reveal");
  rv.addEventListener("click", () => { const on = document.body.classList.toggle("revealed"); rv.setAttribute("aria-pressed", String(on)); rv.textContent = on ? "Hide how each was made" : "Reveal how each was made"; });
  const pick = document.getElementById("pick"), notes = document.getElementById("notes"), out = document.getElementById("out");
  const upd = () => { const n = notes.value.trim(); out.textContent = "Song: " + pick.value + (n ? "\n" + n : ""); };
  pick.addEventListener("change", upd); notes.addEventListener("input", upd); upd();
  document.getElementById("copy").addEventListener("click", () => {
    const msg = document.getElementById("copied"), sel = () => { const r = document.createRange(); r.selectNodeContents(out); const s = getSelection(); s.removeAllRanges(); s.addRange(r); msg.textContent = "Selected: press Cmd+C"; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.textContent).then(() => { msg.textContent = "Copied"; }, sel); else sel();
  });
})();
</script>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--takes", required=True, help="comma-separated take ids (from the manifest), the shortlist")
    ap.add_argument("--labels", default=None, help="JSON file: take id -> how it was made (shown after Reveal)")
    ap.add_argument("--title", default=None)
    ap.add_argument("--out", default="output/checkpoint2")
    a = ap.parse_args()
    labels = json.loads(Path(a.labels).read_text()) if a.labels else {}
    build(a.slug, a.takes.split(","), a.title or a.slug.replace("_", " ").title(), ROOT / a.out, labels)


if __name__ == "__main__":
    main()
