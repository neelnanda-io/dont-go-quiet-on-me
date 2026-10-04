"""Build the section shoot-out page: the takes of each winning style, section by section, one tap per section.

Why: Neel (1 Oct) "I kinda like a bunch of them, they could be improved, giving detailed feedback is hard". So no prose:
for each section (intro, verse 1, chorus 1, ...) he plays the four takes' versions in turn and taps the best one, or
"none". Picks save to the artifact's db (collection `picks`, doc `<style>__<NN>`; `overall/<style>`; `notes/<style>`),
which I read back with ArtifactData, with a "copy my picks" fallback. Each take also carries "what it's like" data:
Gemini's descriptions (tools/gemini_ear.py describe/contrast; no verdicts: those proved unreliable) next to measurements
(tools/take_profile.py), with each checkable claim marked by tools/describe_check.py.

Usage: python tools/build_shootout_page.py [--styles acappella_solo,orchestral_ballad] [--out output/shootout_dgq]
Reads audio/takes/dgq/manifest.json (tools/song_qa.py: section times by forced alignment), audio/qa/dgq/ear/*.json
(tools/gemini_ear.py, tools/describe_check.py), audio/qa/dgq/profile/*.json and audio/suno/dgq/takes.json. Writes <out>/index.html, <out>/clips/<style>_<L>.mp3, <out>/key.json.
The full takes are loudness-matched (-14 LUFS) so louder never sounds better; a section plays by seeking the full take.
"""
import argparse
import hashlib
import html
import json
import random
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyricfmt import parse  # noqa: E402
from suno_prep import SOURCES, SPOKEN, clean  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
E = html.escape
TARGET_LUFS = -14.0
STYLE_TITLES = {"acappella_solo": "A cappella multitrack", "orchestral_ballad": "Orchestral ballad",
                "acappella_solo_v2": "A cappella multitrack, new intro", "orchestral_ballad_v2": "Orchestral ballad, new intro"}


def loudnorm(src: Path, dst: Path):
    """Two-pass-quality single pass is fine for listening: -14 LUFS integrated, -1.5 dBTP, 128 kbps stereo."""
    if dst.exists() and dst.stat().st_mtime > src.stat().st_mtime:
        return
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af",
                    f"loudnorm=I={TARGET_LUFS}:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "128k", str(dst)], check=True)


def ascii_safe(page: str) -> str:
    """Pure-ASCII page that renders the same whatever charset it is served with: non-ASCII becomes a JS \\uXXXX
    escape inside <script> (HTML entities are NOT decoded there: "&#9654;" would show literally) and an HTML
    numeric entity everywhere else."""
    def js_escape(c):   # UTF-16 code units, so astral characters become surrogate pairs as JS expects
        b = c.encode("utf-16-be")
        return "".join(f"\\u{int.from_bytes(b[i:i + 2], 'big'):04x}" for i in range(0, len(b), 2))

    page = re.sub(r"<script>.*?</script>", lambda m: "".join(c if c.isascii() else js_escape(c) for c in m.group(0)),
                  page, flags=re.S)
    return page.encode("ascii", "xmlcharrefreplace").decode("ascii")


def mmss(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


def to_s(t: str):
    m = re.match(r"^\s*(\d+):(\d{1,2}(?:\.\d+)?)\s*$", t or "")
    return int(m.group(1)) * 60 + float(m.group(2)) if m else None


def section_rows(song):
    """The 14 section names as the listener knows them (Chorus 1..4), plus each section's first displayed line."""
    rows, n_ch = [], 0
    for sec in song["sections"]:
        name = sec["tag"].split("|")[0].strip()
        if name == "Chorus":
            n_ch += 1
            name = f"Chorus {n_ch}"
        first = clean(SPOKEN.sub("", sec["lines"][0]["display"])) if sec["lines"] else ""
        rows.append({"name": name, "first": first})
    return rows


def windows(take, n_rows):
    """Playback window per section: from just before its first sung word to just before the next section starts
    (so instrumental tails stay in); the intro starts at 0 and the last section runs to the end of the take."""
    secs, dur = take["sections"], take["tech"]["duration_s"]
    if len(secs) != n_rows:
        return None   # alignment lost a section: the page shows this take without per-section buttons
    out = []
    for i, s in enumerate(secs):
        start = 0.0 if i == 0 else max(secs[i - 1]["t1"], s["t0"] - 1.5)
        end = dur if i == len(secs) - 1 else max(s["t1"], secs[i + 1]["t0"] - 0.15)
        out.append([round(start, 2), round(end, 2)])
    return out


def take_info(take_id, checks):
    """What a take is like: Gemini's description (Pro, else Flash) plus the measurements and which claims they support."""
    ear, prof_f = ROOT / "audio/qa/dgq/ear", ROOT / "audio/qa/dgq/profile" / f"{take_id}.json"
    desc = next((json.loads(f.read_text()) for f in (ear / f"{take_id}.describe.pro.json", ear / f"{take_id}.describe.flash.json")
                 if f.exists()), None)
    info = {}
    if prof_f.exists():
        p = json.loads(prof_f.read_text())
        levels = sorted(x["mix_db"] for x in p["sections"][1:])
        med = levels[len(levels) // 2]
        ck = next((c for c in checks if c["take"] == take_id), None)
        info["prof"] = {"curve": p["curve_db"], "kc": ck["measured_key_change"] if ck else 0, "range": p["section_range_db"],
                        "loudest": p["loudest"], "quietest": p["quietest"],
                        "rel": [round(x["mix_db"] - med, 1) for x in p["sections"]]}
        if ck:
            m = ck["models"].get("pro") or ck["models"].get("flash") or {}
            info["chk"] = {"rho": {k: v["energy_rho"] for k, v in ck["models"].items()},
                           "kc_said": m.get("says_key_change"), "lvl": {str(x["i"]): x["ok"] for x in m.get("level_claims", [])}}
    if desc:
        info["desc"] = {"character": desc["character"], "voices": desc["voices"], "instruments": desc["instruments"],
                        "sec": [{"w": x["what_you_hear"], "e": x["energy"]} for x in desc["sections"]],
                        "moments": spread([{"t": to_s(x["time"]), "what": x["what"]} for x in desc["moments"]
                                           if to_s(x["time"]) is not None], 4)}
    return info


def spread(moments, k):
    """At most k moments, evenly spread over the song (fewer chips to scroll past on a phone)."""
    ms = sorted(moments, key=lambda m: m["t"])
    if len(ms) <= k:
        return ms
    return [ms[round(i * (len(ms) - 1) / (k - 1))] for i in range(k)]


def contrast_info(style):
    """Flash's all-four-together contrast: Pro's was unusable (it called a take with a 19 s orchestral intro "solo piano
    and vocal, no other instruments", and gave the a cappella takes a distorted guitar solo)."""
    f = ROOT / "audio/qa/dgq/ear" / f"contrast_{style}.flash.json"
    if not f.exists():
        return None
    c = json.loads(f.read_text())
    return {"takes": {t["letter"].strip().upper()[-1:]: {"one": t["one_line"], "how": t["how_it_differs"]} for t in c["takes"]},
            "diffs": c["biggest_differences"]}


def build(styles, out: Path):
    man = {t["id"]: t for t in json.loads((ROOT / "audio/takes/dgq/manifest.json").read_text())["takes"]}
    log = {t["take"]: t for t in json.loads((ROOT / "audio/suno/dgq/takes.json").read_text())["takes"]}
    rows = section_rows(parse(SOURCES["dgq"]))
    (out / "clips").mkdir(parents=True, exist_ok=True)
    data, key = {"rows": rows, "styles": []}, {}
    chk_f = ROOT / "audio/qa/dgq/ear/check.json"
    checks = json.loads(chk_f.read_text()) if chk_f.exists() else []
    for style in styles:
        ids = sorted(t for t in man if t.rsplit("_", 1)[0] == style)
        order = ids[:]
        random.Random(int(hashlib.md5(",".join(ids).encode()).hexdigest(), 16)).shuffle(order)  # stable, rank-free
        takes = []
        for i, tid in enumerate(order):
            L, t = "ABCD"[i], man[tid]
            clip = f"clips/{style}_{L}.mp3"
            loudnorm(ROOT / t["file"], out / clip)
            wins = windows(t, len(rows))
            takes.append({"L": L, "clip": clip, "dur": t["tech"]["duration_s"], "win": wins, **take_info(tid, checks)})
            lg = log.get(tid, {})
            key[f"{style}:{L}"] = {"take": tid, "suno_id": lg.get("suno_id"), "url": lg.get("url"),
                                   "duration": mmss(t["tech"]["duration_s"]), "lufs_as_made": t["tech"]["lufs"],
                                   "recall_gpt4o_whisper": [t["recall"]["gpt4o"], t["recall"]["whisper"]],
                                   "jargon_both_heard": f"{sum(all(v) for v in t['terms'].values())}/{len(t['terms'])}"}
        data["styles"].append({"key": style, "title": STYLE_TITLES.get(style, style), "takes": takes,
                               "contrast": contrast_info(style)})
    page = TEMPLATE.replace("__DATA__", json.dumps(data, separators=(",", ":")).replace("</", "<\\/")) \
                   .replace("__KEY__", json.dumps(key, separators=(",", ":")).replace("</", "<\\/"))
    (out / "index.html").write_text(ascii_safe(page))
    (out / "key.json").write_text(json.dumps(key, indent=1))
    size = sum(f.stat().st_size for f in (out / "clips").glob("*.mp3")) / 1e6
    print(f"wrote {out / 'index.html'}: {len(styles)} styles, {len(key)} takes, clips {size:.1f} MB")


TEMPLATE = r"""<title>Section Shoot-out</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
:root{ --bg:#F4F1FA; --surface:#FFFFFF; --ink:#1C1830; --muted:#5E5872; --rule:#DDD7EA; --accent:#C2185B; --accent-ink:#FFFFFF;
  --accent-soft:#FBE3EE; --playing:#FFF2D6; --good:#1B7A53; --weak:#B3261E; --focus:#3D5AFE;
  --sans:"Bricolage Grotesque","Avenir Next","Segoe UI",system-ui,sans-serif; --mono:"JetBrains Mono","SF Mono",Menlo,monospace; }
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){ color-scheme:dark; --bg:#12101A; --surface:#1B1826; --ink:#EDEAF5;
  --muted:#A29CB6; --rule:#2E2A3D; --accent:#FF6FA8; --accent-ink:#1A0F15; --accent-soft:#3A1E2C; --playing:#33291A;
  --good:#7EE2A8; --weak:#FF8A80; --focus:#8C9EFF; } }
:root[data-theme="dark"]{ color-scheme:dark; --bg:#12101A; --surface:#1B1826; --ink:#EDEAF5; --muted:#A29CB6; --rule:#2E2A3D;
  --accent:#FF6FA8; --accent-ink:#1A0F15; --accent-soft:#3A1E2C; --playing:#33291A; --good:#7EE2A8; --weak:#FF8A80; --focus:#8C9EFF; }
body{background:var(--bg); color:var(--ink); font:400 16px/1.5 var(--sans); margin:0}
.wrap{max-width:860px; margin:0 auto; padding-inline:16px; padding-block:28px 120px; display:grid; gap:22px}
header.top{display:grid; gap:10px}
.eyebrow{font:600 12px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; color:var(--muted)}
h1{font:800 clamp(30px,7vw,44px)/1.02 var(--sans); letter-spacing:-.02em; margin:0; text-wrap:balance}
.lede{margin:0; color:var(--muted); max-width:62ch} .lede b{color:var(--ink)}
.tabs{display:flex; gap:8px; flex-wrap:wrap; position:sticky; top:env(safe-area-inset-top,0px); z-index:5; background:var(--bg); padding-block:8px}
button{font:600 15px/1 var(--sans); color:var(--ink); background:var(--surface); border:1px solid var(--rule); border-radius:999px;
  padding:10px 14px; cursor:pointer; min-height:44px}
button:hover{border-color:var(--muted)} button:focus-visible,textarea:focus-visible,audio:focus-visible{outline:3px solid var(--focus); outline-offset:2px}
.tab[aria-selected="true"]{background:var(--ink); color:var(--bg); border-color:var(--ink)}
.full{display:grid; gap:8px; background:var(--surface); border:1px solid var(--rule); border-radius:14px; padding:12px}
.full h2,.sec h3{margin:0} .full h2{font:700 18px/1.2 var(--sans)}
.ft{display:grid; grid-template-columns:auto 1fr; gap:10px; align-items:center} .ft b{font:800 18px var(--sans); width:1.4em}
audio{width:100%; height:38px}
.sec{background:var(--surface); border:1px solid var(--rule); border-radius:14px; padding:12px; display:grid; gap:10px}
.sec.done{border-color:var(--accent)} .sec{scroll-margin-top:72px}
.sh{display:flex; justify-content:space-between; align-items:baseline; gap:8px; flex-wrap:wrap}
.sec h3{font:700 17px/1.2 var(--sans)} .sec h3 span{font:600 12px var(--mono); color:var(--muted); margin-right:6px}
.first{margin:0; color:var(--muted); font-style:italic; font-size:14.5px}
.plays,.picks{display:flex; flex-wrap:wrap; gap:8px; align-items:center}
.lab{font:600 11.5px/1 var(--mono); letter-spacing:.06em; text-transform:uppercase; color:var(--muted); width:100%}
.p{position:relative; overflow:hidden; min-width:56px} .p .bar{position:absolute; left:0; bottom:0; height:3px; width:0; background:var(--accent)}
.p.on{background:var(--playing); border-color:var(--accent)}
.k{min-width:52px} .k[aria-pressed="true"]{background:var(--accent); color:var(--accent-ink); border-color:var(--accent)}
.k.none[aria-pressed="true"]{background:var(--ink); color:var(--bg); border-color:var(--ink)}
.p:disabled{opacity:.35; cursor:not-allowed}
.what{display:grid; gap:6px; padding:8px 0 4px 0; border-bottom:1px solid var(--rule)} .what:last-child{border-bottom:0}
.char{margin:0; font-size:14.5px} .char b{font-weight:700} .facts{margin:0; font:500 12.5px/1.45 var(--mono); color:var(--muted)}
.spark{width:100%; height:40px; display:block; cursor:pointer; touch-action:manipulation}
.spark .ln{fill:none; stroke:var(--accent); stroke-width:1.5} .spark .tick{stroke:var(--rule); stroke-width:1} .spark .ph{stroke:var(--ink); stroke-width:1.5}
.spark .bg{fill:var(--accent-soft)}
.moms{display:flex; flex-wrap:wrap; gap:6px} .mom{font:500 13px/1.2 var(--sans); padding:7px 10px; min-height:36px; text-align:left}
.mom span{font:600 12px var(--mono); color:var(--muted); margin-right:5px}
.cmp{background:var(--surface); border:1px solid var(--rule); border-radius:14px; padding:12px; display:grid; gap:8px}
.cmp h2{margin:0; font:700 18px/1.2 var(--sans)} .cmp summary{color:var(--ink); font-size:14.5px; padding-block:4px} .cmp details p{margin:6px 0 4px}
.src{font:500 11.5px var(--mono); color:var(--muted)}
.ok{color:var(--good); font-weight:700} .no{color:var(--weak); font-weight:700}
details{font-size:14px} summary{cursor:pointer; color:var(--muted)} .ai{margin:6px 0 0; padding-left:18px; display:grid; gap:4px}
.v-strong{color:var(--good); font-weight:700} .v-weak{color:var(--weak); font-weight:700}
.overall{background:var(--accent-soft); border-radius:14px; padding:14px; display:grid; gap:10px}
.overall h2{margin:0; font:800 20px/1.2 var(--sans)}
textarea{font:400 15px/1.4 var(--sans); color:var(--ink); background:var(--surface); border:1px solid var(--rule); border-radius:10px;
  padding:10px; width:100%; box-sizing:border-box; min-height:72px}
.status{font:500 13px var(--mono); color:var(--muted)}
#out{font:500 13.5px/1.45 var(--mono); background:var(--surface); border:1px dashed var(--rule); border-radius:10px; padding:10px;
  white-space:pre-wrap; overflow-wrap:anywhere}
.np{position:fixed; left:0; right:0; bottom:0; z-index:9; display:none; gap:10px; align-items:center; justify-content:space-between;
  background:var(--ink); color:var(--bg); padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px))}
.np.show{display:flex} .np button{background:var(--bg); color:var(--ink); border-color:var(--bg)}
.key{overflow-x:auto} table{border-collapse:collapse; font:400 13px var(--mono); min-width:560px}
td,th{border-bottom:1px solid var(--rule); padding:6px 8px; text-align:left; white-space:nowrap}
footer{color:var(--muted); font-size:14px; display:grid; gap:8px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">Don't Go Quiet On Me &middot; your two styles</div>
    <h1>Section Shoot-out</h1>
    <p class="lede"><b>No writing needed.</b> For each section, play the four takes (or &ldquo;all four&rdquo;) and tap the best, or
      <b>none</b> if they all fall short; that tells me what to regenerate. Takes are shuffled and labelled A&ndash;D, all
      loudness-matched. <span id="savehint">Your taps save as you go.</span></p>
  </header>
  <div class="tabs" role="tablist" id="tabs"></div>
  <p class="status" id="loading" aria-live="polite" style="margin:0"></p>
  <main id="main"></main>
  <section class="overall" aria-label="Summary">
    <h2>Send me your picks</h2>
    <div id="out"></div>
    <div class="plays"><button id="copy" type="button">Copy my picks</button><span id="copied" class="status"></span></div>
    <p class="status" style="margin:0">If the saved-taps light below is off, paste this in chat instead.</p>
    <p class="status" id="dbstate" style="margin:0">Saving: checking&hellip;</p>
  </section>
  <details class="full"><summary>How these were made (reveal)</summary><div class="key" id="key"></div></details>
  <footer>
    <div>Section times come from forced alignment of the lyric to each take's vocal, so a section plays from just before its
      first word to just before the next section. The loudness strips, key changes and dB figures are measured from the
      audio. The descriptions are Gemini 3.1 Pro listening to each take (and to all four together for &ldquo;how the four
      differ&rdquo;); where they make a checkable claim (loud or quiet, a key change) the page marks whether the measurements
      agree. Gemini gives no verdicts here: as a judge it disagreed with your thumbs and with itself.</div>
  </footer>
</div>
<div class="np" id="np" role="status"><span id="nptext"></span><button id="stop" type="button">Stop</button></div>
<script>
const DATA = __DATA__;
const KEY = __KEY__;
(() => {
  const $ = (t, a = {}, ...kids) => { const e = document.createElement(t); for (const [k, v] of Object.entries(a)) { if (k === "text") e.textContent = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); } kids.forEach(c => c && e.append(c)); return e; };
  const mmss = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  const picks = {}, overall = {}, notes = {};
  let db = null, saving = false;
  // ---------- audio: one element per take; a section plays by seeking it ----------
  const audios = {};
  let cur = null, queue = null, tick = null;
  const np = document.getElementById("np"), nptext = document.getElementById("nptext");
  function stopAll() {
    if (queue) queue.cancelled = true; queue = null;
    if (cur) { cur.a.pause(); cur.btn && cur.btn.classList.remove("on"); cur.btn && (cur.btn.querySelector(".bar").style.width = "0"); }
    cur = null; clearInterval(tick); np.classList.remove("show");
  }
  function playSeg(style, L, i, btn, onDone) {
    const a = audios[style + L], tk = DATA.styles.find(s => s.key === style).takes.find(t => t.L === L);
    if (!tk.win) return onDone && onDone();
    const [t0, t1] = tk.win[i];
    if (cur) { cur.a.pause(); cur.btn && cur.btn.classList.remove("on"); }
    Object.values(audios).forEach(x => { if (x !== a) x.pause(); });
    cur = { a, btn, t0, t1 };
    btn && btn.classList.add("on");
    nptext.textContent = DATA.rows[i].name + " · take " + L;
    np.classList.add("show");
    const seek = () => { if (Math.abs(a.currentTime - t0) > 0.3) a.currentTime = t0; };
    if (a.readyState >= 1) seek(); else a.addEventListener("loadedmetadata", seek, { once: true });
    a.play().then(seek).catch(() => {});
    clearInterval(tick);
    tick = setInterval(() => {
      if (!cur || cur.a !== a) return;
      const p = Math.min(1, Math.max(0, (a.currentTime - t0) / (t1 - t0)));
      if (btn) btn.querySelector(".bar").style.width = (p * 100) + "%";
      if (a.currentTime >= t1 || a.ended) {
        a.pause(); btn && btn.classList.remove("on"); btn && (btn.querySelector(".bar").style.width = "0");
        clearInterval(tick); cur = null; np.classList.remove("show");
        onDone && onDone();
      }
    }, 60);
  }
  function playAll(style, i, btns) {
    stopAll();
    const q = { cancelled: false }; queue = q;
    const order = DATA.styles.find(s => s.key === style).takes.map(t => t.L);
    let k = 0;
    const next = () => { if (q.cancelled || k >= order.length) { if (!q.cancelled) queue = null; return; }
      const L = order[k++]; playSeg(style, L, i, btns[L], () => setTimeout(next, 350)); };
    next();
  }
  document.getElementById("stop").addEventListener("click", stopAll);
  // Prefetch the open style's takes into blobs: seeking a blob is instant and never depends on the host supporting
  // HTTP Range requests (without them a seek into a still-downloading MP3 silently restarts from 0:00).
  const blobbed = {}, loading = document.getElementById("loading");
  async function prefetch(style) {
    const st = DATA.styles.find(s => s.key === style);
    let done = st.takes.filter(t => blobbed[style + t.L]).length;
    for (const t of st.takes) {
      const k = style + t.L;
      if (blobbed[k]) continue;
      loading.textContent = "Loading takes " + done + "/" + st.takes.length + "\u2026";
      try {
        const b = await (await fetch(t.clip)).blob();
        blobbed[k] = URL.createObjectURL(b);
        const a = audios[k];
        if (a.paused) { const at = a.currentTime; a.src = blobbed[k]; if (at) a.addEventListener("loadedmetadata", () => { a.currentTime = at; }, { once: true }); }
      } catch (e) { /* the network URL still plays; seeking just depends on the host */ }
      done++;
    }
    loading.textContent = "";
  }
  function seekPlay(a, t) {
    const go = () => { a.currentTime = t; };
    if (a.readyState >= 1) go(); else a.addEventListener("loadedmetadata", go, { once: true });
    a.play().then(() => { if (Math.abs(a.currentTime - t) > 0.5) go(); }).catch(() => {});
  }
  function spark(t, a) {   // measured loudness, 1 s steps; ticks at section starts; tap to jump there
    const W = 300, H = 40, n = t.prof.curve.length, NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("class", "spark");
    svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Loudness over time for take " + t.L + "; tap to jump");
    const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.append(e); return e; };
    el("rect", { class: "bg", x: 0, y: 0, width: W, height: H });
    (t.win || []).forEach(w => { const x = (w[0] / t.dur * W).toFixed(1); el("line", { class: "tick", x1: x, x2: x, y1: 0, y2: H }); });
    const pts = t.prof.curve.map((v, i) => (i / Math.max(1, n - 1) * W).toFixed(1) + "," + (H - 2 - (Math.max(-36, Math.min(0, v)) + 36) / 36 * (H - 4)).toFixed(1));
    el("polyline", { class: "ln", points: pts.join(" ") });
    const ph = el("line", { class: "ph", x1: 0, x2: 0, y1: 0, y2: H });
    a.addEventListener("timeupdate", () => { const x = (a.currentTime / t.dur * W).toFixed(1); ph.setAttribute("x1", x); ph.setAttribute("x2", x); });
    svg.addEventListener("click", ev => { const r = svg.getBoundingClientRect(); stopAll(); seekPlay(a, (ev.clientX - r.left) / r.width * t.dur); });
    return svg;
  }
  // ---------- picks ----------
  const keyOf = (style, i) => style + "__" + String(i).padStart(2, "0");
  const chain = {};
  function save(path, body) {   // one write at a time per document
    if (!db) { persistLocal(); return; }
    chain[path] = (chain[path] || Promise.resolve()).then(() => db.doc(path).set(body)).catch(e => {
      document.getElementById("dbstate").textContent = "Saving failed (" + (e && e.code || "error") + "): use Copy my picks.";
    });
  }
  function persistLocal() { try { localStorage.setItem("shootout", JSON.stringify({ picks, overall, notes })); } catch (e) {} }
  function setPick(style, i, v) {
    const k = keyOf(style, i);
    picks[k] = picks[k] === v ? null : v;
    render();
    save("picks/" + k, { pick: picks[k], at: new Date().toISOString() });
  }
  function setOverall(style, v) {
    overall[style] = overall[style] === v ? null : v; render();
    save("overall/" + style, { pick: overall[style], at: new Date().toISOString() });
  }
  const noteTimers = {};
  function setNote(style, text) {
    notes[style] = text; summary();
    clearTimeout(noteTimers[style]);
    noteTimers[style] = setTimeout(() => save("notes/" + style, { text, at: new Date().toISOString() }), 900);
  }
  // ---------- render ----------
  const tabs = document.getElementById("tabs"), main = document.getElementById("main");
  let active = DATA.styles[0].key;
  try { const s = localStorage.getItem("shootout_tab"); if (s && DATA.styles.some(x => x.key === s)) active = s; } catch (e) {}
  const panes = {};
  DATA.styles.forEach(st => {
    tabs.append($("button", { class: "tab", role: "tab", type: "button", "aria-selected": String(st.key === active),
      onclick: () => { active = st.key; try { localStorage.setItem("shootout_tab", active); } catch (e) {} stopAll(); show(); }, text: st.title }));
    const pane = $("div", { role: "tabpanel", style: "display:grid;gap:14px" });
    const full = $("div", { class: "full" }, $("h2", { text: "Full takes" }));
    st.takes.forEach(t => {
      const a = $("audio", { controls: "", preload: "none", src: t.clip });
      audios[st.key + t.L] = a;
      a.addEventListener("play", () => Object.values(audios).forEach(x => { if (x !== a) x.pause(); }));
      const box = $("div", { class: "what" }, $("div", { class: "ft" }, $("b", { text: t.L }), a));
      if (t.desc) box.append($("p", { class: "char" }, $("b", { text: "Gemini: " }), document.createTextNode(t.desc.character)));
      if (t.prof) {
        const kc = t.prof.kc ? "key change " + (t.prof.kc > 0 ? "+" : "") + t.prof.kc + " into the final chorus" : "no key change";
        const said = t.chk && t.chk.kc_said != null ? (t.chk.kc_said === !!t.prof.kc ? " (Gemini agrees)" : " (Gemini says otherwise)") : "";
        box.append($("p", { class: "facts", text: "Measured: " + kc + said + " \u00b7 loudest " + t.prof.loudest + " \u00b7 quietest " +
          t.prof.quietest + " \u00b7 sections span " + t.prof.range + " dB" }));
        box.append(spark(t, a));
      }
      if (t.desc && t.desc.moments.length) {
        const ms = $("div", { class: "moms" });
        t.desc.moments.forEach(m => ms.append($("button", { class: "mom", type: "button", onclick: () => { stopAll(); seekPlay(a, m.t); } },
          $("span", { text: mmss(m.t) }), document.createTextNode(m.what))));
        box.append(ms);
      }
      full.append(box);
    });
    if (st.contrast) {
      const cmp = $("div", { class: "cmp" }, $("h2", { text: "How the four differ" }), $("span", { class: "src", text: "Gemini 3.8 Flash listened to all four together: descriptions, not rankings, unverified" }));
      st.takes.forEach(t => { const c = st.contrast.takes[t.L]; if (c) cmp.append($("details", {},
        $("summary", {}, $("b", { text: t.L + ": " }), document.createTextNode(c.one)), $("p", { class: "char", text: c.how }))); });
      pane.append(cmp);
    }
    pane.append(full);
    DATA.rows.forEach((row, i) => {
      const sec = $("section", { class: "sec", "data-k": keyOf(st.key, i) });
      sec.append($("div", { class: "sh" }, $("h3", {}, $("span", { text: String(i + 1).padStart(2, "0") }), document.createTextNode(row.name))));
      if (row.first) sec.append($("p", { class: "first", text: "“" + row.first + "”" }));
      const btns = {}, plays = $("div", { class: "plays" }, $("span", { class: "lab", text: "Play" }));
      st.takes.forEach(t => {
        const b = $("button", { class: "p", type: "button", "aria-label": "Play " + row.name + ", take " + t.L }, document.createTextNode("▶ " + t.L), $("span", { class: "bar" }));
        if (!t.win) b.disabled = true; else b.title = mmss(t.win[i][0]) + "–" + mmss(t.win[i][1]);
        b.addEventListener("click", () => { stopAll(); playSeg(st.key, t.L, i, b); });
        btns[t.L] = b; plays.append(b);
      });
      plays.append($("button", { type: "button", onclick: () => playAll(st.key, i, btns), text: "▶ all four" }));
      const pk = $("div", { class: "picks" }, $("span", { class: "lab", text: "Best" }));
      [...st.takes.map(t => t.L), "none"].forEach(v => pk.append($("button", { class: "k" + (v === "none" ? " none" : ""), type: "button",
        "data-v": v, "aria-pressed": "false", onclick: () => setPick(st.key, i, v), text: v === "none" ? "none good" : v })));
      sec.append(plays, pk);
      const ai = $("ul", { class: "ai" });
      st.takes.forEach(t => {
        const d = t.desc && t.desc.sec[i];
        if (!d) return;
        const rel = t.prof ? t.prof.rel[i] : null, ok = t.chk ? t.chk.lvl[String(i)] : undefined;
        const lvl = rel == null ? "" : ", measured " + (rel > 0 ? "+" : "") + rel + " dB vs its median";
        ai.append($("li", {}, $("b", { text: t.L + " (" + d.e + lvl + ")" }),
          ok === undefined ? document.createTextNode("") : $("span", { class: ok ? "ok" : "no", text: ok ? " \u2713" : " \u2717" }),
          document.createTextNode(": " + d.w)));
      });
      if (ai.children.length) sec.append($("details", {}, $("summary", { text: "What's in each take here (Gemini; \u2713/\u2717 = measured loudness agrees)" }), ai));
      pane.append(sec);
    });
    const ov = $("div", { class: "overall" }, $("h2", { text: "Best overall take" }));
    const opk = $("div", { class: "picks" });
    st.takes.forEach(t => opk.append($("button", { class: "k ov", type: "button", "data-v": t.L, "aria-pressed": "false", onclick: () => setOverall(st.key, t.L), text: t.L })));
    const ta = $("textarea", { placeholder: "Optional: anything at all, half-sentences fine (“chorus 2 drags”)" });
    ta.addEventListener("input", () => setNote(st.key, ta.value));
    ov.append(opk, ta);
    pane.append(ov);
    panes[st.key] = { pane, ta };
    main.append(pane);
  });
  function show() {
    DATA.styles.forEach(st => { panes[st.key].pane.hidden = st.key !== active; });
    prefetch(active);
    [...tabs.children].forEach((b, i) => b.setAttribute("aria-selected", String(DATA.styles[i].key === active)));
  }
  function render() {
    document.querySelectorAll(".sec").forEach(sec => {
      const v = picks[sec.dataset.k];
      sec.classList.toggle("done", !!v);
      sec.querySelectorAll(".k").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
    });
    DATA.styles.forEach(st => panes[st.key].pane.querySelectorAll(".ov").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === overall[st.key]))));
    summary();
  }
  function summary() {
    const lines = DATA.styles.map(st => {
      const per = DATA.rows.map((r, i) => { const v = picks[keyOf(st.key, i)]; return v ? r.name + " " + v : null; }).filter(Boolean);
      return st.title + ": overall " + (overall[st.key] || "–") + (per.length ? "; " + per.join(", ") : "") + (notes[st.key] ? "\n  notes: " + notes[st.key] : "");
    });
    document.getElementById("out").textContent = "Shoot-out picks\n" + lines.join("\n");
  }
  document.getElementById("copy").addEventListener("click", () => {
    const out = document.getElementById("out"), msg = document.getElementById("copied");
    const sel = () => { const r = document.createRange(); r.selectNodeContents(out); const s = getSelection(); s.removeAllRanges(); s.addRange(r); msg.textContent = "Selected: copy it"; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.textContent).then(() => { msg.textContent = "Copied"; }, sel); else sel();
  });
  // reveal table
  const tbl = $("table"); tbl.append($("tr", {}, ...["take", "style", "made as", "length", "loudness", "words heard", "jargon (both)"].map(h => $("th", { text: h }))));
  Object.entries(KEY).forEach(([k, v]) => { const [style, L] = k.split(":"); const a = $("a", { href: v.url || "#", target: "_blank", rel: "noopener", text: v.take });
    tbl.append($("tr", {}, $("td", { text: L }), $("td", { text: style }), $("td", {}, a), $("td", { text: v.duration }), $("td", { text: v.lufs_as_made + " LUFS" }),
      $("td", { text: v.recall_gpt4o_whisper.map(x => Math.round(x * 100) + "%").join(" / ") }), $("td", { text: v.jargon_both_heard }))); });
  document.getElementById("key").append(tbl);
  // restore local state first (works without db), then light up db when it resolves
  try { const s = JSON.parse(localStorage.getItem("shootout") || "null"); if (s) { Object.assign(picks, s.picks || {}); Object.assign(overall, s.overall || {}); Object.assign(notes, s.notes || {}); } } catch (e) {}
  DATA.styles.forEach(st => { if (notes[st.key]) panes[st.key].ta.value = notes[st.key]; });
  show(); render();
  const dbstate = document.getElementById("dbstate");
  (async () => {
    db = window.claude && window.claude.use ? await window.claude.use("db") : null;
    if (!db) { dbstate.textContent = "Saving: off in this view, so use Copy my picks."; document.getElementById("savehint").textContent = "Taps are kept on this device; send them with “Copy my picks”."; return; }
    dbstate.textContent = "Saving: on (taps reach Claude directly).";
    db.collection("picks").onSnapshot(snap => { snap.docs.forEach(d => { const v = d.data(); picks[d.id] = v && v.pick || null; }); persistLocal(); render(); },
      e => { dbstate.textContent = "Saving: interrupted (" + e.code + "), so use Copy my picks."; });
    db.collection("overall").onSnapshot(snap => { snap.docs.forEach(d => { overall[d.id] = (d.data() || {}).pick || null; }); render(); }, () => {});
    db.collection("notes").onSnapshot(snap => { snap.docs.forEach(d => { const t = (d.data() || {}).text || ""; notes[d.id] = t; const p = panes[d.id]; if (p && document.activeElement !== p.ta) p.ta.value = t; }); summary(); }, () => {});
  })();
})();
</script>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--styles", default="acappella_solo,orchestral_ballad")
    ap.add_argument("--out", default="output/shootout_dgq")
    a = ap.parse_args()
    build(a.styles.split(","), ROOT / a.out)


if __name__ == "__main__":
    main()
