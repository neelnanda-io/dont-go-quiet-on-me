"""Build the video-direction checkpoint: video/treatment/treatment.md and the Artifact page output/checkpoint_video/.

Inputs: output/checkpoint_video/shots.json (node tools/dump_shots.mjs), the finished hook and the animatic MP4s, the
style and cast images, and (if present) video/tests/seedance/REPORT.md. The page is phone-first (Neel reads on his
phone): tap-to-pick choices saved to the artifact's db (collections picks / notes; read back with ArtifactData), with a
"copy my picks" fallback when saving is off.

    python3 tools/build_video_page.py            # rebuild page + treatment (re-encodes media only if missing)
    python3 tools/build_video_page.py --media    # also re-encode the videos and thumbnails
"""
import argparse
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output/checkpoint_video"
KIT = ROOT / "video/kit"
ANIMATIC_SRC = max((KIT / "out").glob("animatic_v*.mp4"), key=lambda p: int(p.stem.split("_v")[1]))   # newest render
DETAIL = OUT / "detail.json"   # the up-close images (styles x scenes, protagonists x views), from the detail workflow
SHOTS = json.loads((OUT / "shots.json").read_text())

STYLE = [("a", "A · Field notebook (recommended)", "Ink and watercolour on graph paper: a researcher's field notes. Warm, sincere, a little sad; it is also the visual world of interpretability itself (lab notebooks, specimen plates, figures). The JS renders it well, and the hook is already built in it."),
         ("b", "B · Riso night", "Moody risograph print, two inks and grain: closest to the reference video. More graphic and Twitter-loud, less tender."),
         ("c", "C · Paper-cut theatre", "Layered cut paper on a small stage: charming and tactile, but heavy to animate and further from the figures.")]
PROTAGONISTS = [
    ("naturalist", "The Naturalist (recommended)", ["video/style/a_researcher.png", "video/cast/naturalist_situ.png"],
     "Short dark bob, round glasses, oversized mustard cardigan, a brass magnifier. She keeps the field notebook the whole video is drawn in. Quiet and sincere, matches the ballad and your intro image; one silhouette that reads at thumbnail size."),
    ("nightshift", "The Night Shift", ["video/cast/nightshift_sheet.png", "video/cast/nightshift_situ.png"],
     "Curly bun with a pencil through it, grey hoodie, headphones, a laptop and a mug with an eye on it. The SF/London researcher at 2 a.m.: most relatable, most zeitgeist. (The sheet's laptop has an Apple-like logo: never used, every frame is redrawn in JS.)"),
    ("idol", "The Idol", ["video/cast/idol_sheet.png", "video/cast/idol_situ.png"],
     "A K-pop lead vocalist cut from a lab coat: two buns, headset mic, the magnifier held like a microphone, arrow-shaped backup dancers. The brief's K-pop anchor and the most 'pop video'; less tender, harder to keep sad-not-dramatic."),
    ("keeper", "The Keeper (a different world)", ["video/cast/keeper_sheet.png", "video/cast/keeper_situ.png"],
     "A lighthouse keeper in a yellow oilskin, watching a dark sea where the creature rises (the J-space paper opens on 'if the mind is an ocean'). Beautiful and melancholy, but it swaps the notebook and the magnifier for a sea and a spyglass."),
]
CAMEO = [("none", "No cameo", "You appear only as your real tweets, on cards. Safest, and the tweets already carry your voice."),
         ("lanyard", "A stylised back-view cameo", "In verse 3 (the pragmatic pivot) a figure seen from behind at the pinboard, with a lanyard reading “industry researcher, no PhD”. No face, no likeness."),
         ("mug", "Just your initials", "An “NN” mug on the researcher's desk in the workshop. Blink-and-miss.")]

SECTION_ORDER = ["Intro", "Verse 1", "Chorus 1", "Verse 2", "Verse 3", "Pre-Chorus", "Chorus 2", "Verse 4", "Chorus 3",
                 "Verse 5", "Chorus 4", "Bridge", "Verse 6", "Final Chorus", "End"]
FLOW_KEY = {s: ("Chorus" if s.startswith("Chorus") else s) for s in SECTION_ORDER}


SHOW_STYLE_OPENINGS = False   # the opening in styles A/B/C (3 Oct); Neel picked A, so the comparison is off the page


def mmss(s):
    return f"{int(s // 60)}:{s % 60:04.1f}"


def run(cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def media(force=False):
    """Encode the two videos small enough for the page, extract one thumbnail per shot, and convert the images."""
    (OUT / "img").mkdir(parents=True, exist_ok=True)
    (OUT / "thumbs").mkdir(exist_ok=True)
    anim, hook = OUT / "animatic.mp4", OUT / "hook.mp4"
    if force or not anim.exists():
        for crf in (30, 33, 36):   # the page's per-file cap is 15 MB
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(ANIMATIC_SRC), "-vf", "scale=960:540",
                 "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k",
                 "-movflags", "+faststart", str(anim)])
            if anim.stat().st_size < 14e6:
                break
    if force or not hook.exists():
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(max((KIT / "out").glob("hook_test_v*.mp4"), key=lambda p: int(p.stem.split("_v")[1]))), "-vf", "scale=1280:720", "-c:v", "libx264", "-preset", "slow",
             "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(hook)])
    for s in SHOTS["shots"]:
        th = OUT / "thumbs" / f"{s['id']}.jpg"
        if force or not th.exists():
            t = s["t0"] + min(s["t1"] - s["t0"], 6) * .7
            run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(ANIMATIC_SRC), "-frames:v", "1",
                 "-vf", "scale=480:-2", "-q:v", "5", str(th)])
    imgs = [f"video/style/{k}_{v}.png" for k, _, _ in STYLE for v in ("chorus", "growth")] + ["video/style/a_researcher.png"]
    imgs += [p for _, _, ps, _ in PROTAGONISTS for p in ps] + ["video/cast/cast_sheet.png"]
    for p in imgs:
        dst = OUT / "img" / (Path(p).stem + ".jpg")
        if force or not dst.exists():
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(ROOT / p), "-vf", "scale=1200:-2", "-q:v", "4", str(dst)])
    if DETAIL.exists():
        (OUT / "detail").mkdir(exist_ok=True)
        for d in json.loads(DETAIL.read_text()):
            dst = OUT / "detail" / (d["id"] + ".jpg")
            if d.get("final") and (force or not dst.exists()):
                run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(ROOT / d["final"]), "-vf", "scale='min(2048,iw)':-2", "-q:v", "3", str(dst)])
    master = ROOT / "audio/final/dgq_master.mp3"   # the locked song, for listening on the page
    if master.exists() and (force or not (OUT / master.name).exists() or (OUT / master.name).stat().st_mtime < master.stat().st_mtime):
        shutil.copy(master, OUT / master.name)
    lip = ROOT / "video/tests/seedance"
    if (lip / "review_master_shifted_250ms.mp4").exists() and (force or not (OUT / "lipsync.mp4").exists()):
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(lip / "review_master_shifted_250ms.mp4"), "-c:v", "libx264", "-crf", "23",
             "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(OUT / "lipsync.mp4")])
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(lip / "sheet_onsets.png"), "-vf", "scale=1200:-2", "-q:v", "4", str(OUT / "img/lipsync_onsets.jpg")])
    for st in ("B", "C"):
        src, dst = KIT / f"out/hook_{st}.mp4", OUT / f"hook_{st}.mp4"
        if src.exists() and (force or not dst.exists()):
            for crf in (22, 25, 28):   # riso halftone dots compress badly: crf 22 came to 15.1 MB, over the 15 MB cap
                run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-i", str(ROOT / "audio/final/dgq_master.mp3"), "-map", "0:v", "-map", "1:a",
                     "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-pix_fmt", "yuv420p",
                     "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(dst)])
                if dst.stat().st_size < 14e6:
                    break
    for st, f in (("A", "hook.mp4"), ("B", "hook_B.mp4"), ("C", "hook_C.mp4")):
        if (OUT / f).exists() and (force or not (OUT / f"poster_{st}.jpg").exists()):
            run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "12.6", "-i", str(OUT / f), "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "4", str(OUT / f"poster_{st}.jpg")])
    roto = KIT / "out/roto_test.mp4"
    if roto.exists() and (force or not (OUT / "roto.mp4").exists()):
        run(["cp", str(roto), str(OUT / "roto.mp4")])
        run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "2.2", "-i", str(roto), "-frames:v", "1", "-q:v", "4", str(OUT / "roto_poster.jpg")])
    for extra in ("growth_strip.jpg",):
        src = KIT / "out/check" / extra
        if src.exists():
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-q:v", "4", str(OUT / "img" / extra)])


DETAIL_CAPTION = {
    "c1_outgrow": "Chorus 1: it outgrows its dish faster than she can keep up", "workshop": "Verse 3: the workshop (the probe by the door)",
    "eye_close": "Close-up: \u201cI just wanna read your mind\u201d", "towering": "Chorus 4: it towers over her",
    "ring_fortress": "Final chorus: the ring, seen from a little above", "turnaround": "Turnaround", "faces": "Face and mouth sheet (for lip sync)",
    "visit": "In a chorus", "lean": "Leaning in close (verse 1)", "end": "The end: tiny at the walls",
}


def spend():
    tot = 0.0
    for log in ("logs/image_gen.jsonl", "logs/video_gen.jsonl"):
        f = ROOT / log
        if f.exists():
            for line in f.read_text().splitlines():
                if line.strip():
                    r = json.loads(line); tot += float(r.get("cost") or r.get("cost_usd") or 0)
    return tot


def detail_fig(d):
    key = d["id"].split("_", 1)[1]
    flag = "" if d.get("pass") else f" \u00b7 <span style='color:var(--verm)'>review note: {esc(d.get('note') or 'a flaw')}</span>"
    return (f'<figure style="margin:0"><img loading="lazy" class="zoom" src="detail/{d["id"]}.jpg" alt="{esc(DETAIL_CAPTION.get(key, key))}">'
            f'<figcaption class="lab">{esc(DETAIL_CAPTION.get(key, key))}{flag}</figcaption></figure>')


def esc(s):
    return html.escape(s or "", quote=True)


def treatment_md():
    """The treatment doc: same content as the page, as markdown for the repo."""
    L = ["# Video treatment: \"Don't Go Quiet On Me\"", "",
         "Generated by `tools/build_video_page.py` from `video/kit/src/data/dgq_shots.js` (the shot list the animatic renders from). Edit the shot list, not this file.", "",
         "## Contents", "- [Concept](#concept)", "- [Transitions plan](#transitions-plan)", "- [Shot list](#shot-list)",
         "- [Real tweets for approval](#real-tweets-for-approval)", "- [Open choices](#open-choices)", "", "---", "",
         "## Concept", "",
         "The whole video is one researcher's field notebook, 2020 to 2026. The model is a shoggoth with a smiley mask that starts as a toy in a petri dish and grows, chorus by chorus, into something byzantine and then a walled fortress (Neel's motif). The year stamp in the corner only ever counts up; a second meter, *said out loud*, rises when the model learns to talk and think out loud, and drains when Astra stops needing to.", "",
         "- **Choruses = \"the visit\"**: the same composition every time (creature right, researcher left, big lyric left, specimen tag), so the five choruses read as a time-lapse. It grows a notch on every chorus's last word, \"now\". The tag's *understood:* line gets worse each time (mostly, some, a little, ?, blank).",
         "- **Verses = a different kind of notebook page each**: a specimen drawer, a dictionary, a workshop, a stage, her room (reading its mind), a case file, an emptying page. The camera travels through one world per verse.",
         "- **Lyrics**: huge serif at the hook and choruses (left, with the scene right); karaoke captions in the verses; the backing-vocal parentheses are always the researcher's red-pencil marginalia; the Golden Gate shout is full-frame.",
         "- **Density**: every line has a reference card (title, authors, date) plus 1 to 4 lyric-linked details (`eggs` below).",
         "", "## Transitions plan", ""]
    for sec in ["Intro", "Verse 1", "Chorus", "Verse 2", "Verse 3", "Pre-Chorus", "Verse 4", "Verse 5", "Bridge", "Verse 6", "Final Chorus", "End"]:
        L.append(f"- **{sec}.** {SHOTS['flows'][sec]}")
    L += ["", "## Shot list", "", "Times are seconds into `audio/final/dgq_master.mp3`. **S** = character performance (Seedance base clip, redrawn in JS).", ""]
    for sec in SECTION_ORDER:
        rows = [s for s in SHOTS["shots"] if s["sec"] == sec]
        if not rows:
            continue
        L.append(f"### {sec}")
        L.append("")
        for s in rows:
            head = f"**{s['id']} · {s['title']}** ({s['t0']:.2f}-{s['t1']:.2f} s{', S' if s.get('S') else ''}; in: {s['trans']}; lyric: {s['ly']})"
            L.append(f"- {head}")
            if s.get("lines"):
                L.append(f"  - Sung: {' / '.join(s['lines'])}")
            L.append(f"  - {s['what']}")
            if s.get("card"):
                L.append(f"  - Card: {s['card']}")
            for e in s.get("eggs", []):
                L.append(f"  - Egg: {e}")
        L.append("")
    L += ["## Real tweets for approval", "", "Verbatim; Neel's own first, then other people's (each needs his OK).", ""]
    for tw in SHOTS["tweets"]:
        L.append(f"- **{tw['handle']}**, {tw['date']} ({tw['shot']}; {'own' if tw['own'] else 'needs OK'}): {tw['text'].replace(chr(10), ' / ')} [link]({tw['link']}). On screen: {tw['shown']}.")
    L += ["", "## Open choices", "", "- Protagonist: " + "; ".join(n for _, n, _, _ in PROTAGONISTS),
          "- Style: " + "; ".join(n for _, n, _ in STYLE), "- Cameo: " + "; ".join(n for _, n, _ in CAMEO), ""]
    (ROOT / "video/treatment/treatment.md").write_text("\n".join(L))


CSS = r"""
:root{--paper:#F2E8D2;--paper2:#FBF4E4;--ink:#2A241E;--ink2:#5B4E40;--line:#CDBFA2;--verm:#C9472A;--indigo:#2E3A66;--mustard:#C99530;--chip:#E9DDC2;--good:#3D7A3A;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#1C1A20;--paper2:#26232B;--ink:#EDE4D3;--ink2:#B9AE9C;--line:#3E3946;--verm:#F08A70;--indigo:#9DAAE0;--mustard:#E2B65A;--chip:#2F2B36;--good:#8FCB8A;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#1C1A20;--paper2:#26232B;--ink:#EDE4D3;--ink2:#B9AE9C;--line:#3E3946;--verm:#F08A70;--indigo:#9DAAE0;--mustard:#E2B65A;--chip:#2F2B36;--good:#8FCB8A;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font:17px/1.55 "Newsreader",Georgia,serif;margin:0}
.wrap{max-width:860px;margin:0 auto;padding-inline:16px;padding-block:20px 80px}
h1,h2,h3{font-family:"Instrument Serif",Georgia,serif;font-weight:400;text-wrap:balance;line-height:1.1;margin:0}
h1{font-size:clamp(34px,8vw,54px)}h2{font-size:clamp(28px,6vw,40px);margin-top:44px;padding-top:10px;border-top:1px solid var(--line)}h3{font-size:24px;margin-top:22px}
.lab{font:500 12px/1.4 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
.hand{font-family:"Caveat",cursive;color:var(--verm);font-size:24px;line-height:1.1}
p{margin:.6em 0}.small{font-size:14.5px;color:var(--ink2)}
video,img{max-width:100%;display:block;border-radius:6px}
video{width:100%;background:#000}
.ask{background:var(--paper2);border:1.5px solid var(--ink);border-radius:10px;padding:14px 14px 10px;margin:18px 0}
.q{margin:12px 0 16px}.q .lab{margin-bottom:6px}
.opts{display:flex;flex-wrap:wrap;gap:8px}
button.o{font:500 15px/1.2 "IBM Plex Mono",ui-monospace,monospace;background:var(--chip);color:var(--ink);border:1.5px solid var(--line);border-radius:999px;padding:10px 14px;cursor:pointer;min-height:44px}
button.o.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
textarea{width:100%;box-sizing:border-box;min-height:84px;font:16px/1.4 "Newsreader",Georgia,serif;background:var(--paper);color:var(--ink);border:1.5px solid var(--line);border-radius:8px;padding:10px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.chips button{font:500 13px "IBM Plex Mono",monospace;background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:7px 9px;cursor:pointer}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:12px}
.card{background:var(--paper2);border:1px solid var(--line);border-radius:10px;padding:12px}
.card h3{margin-top:4px}
.sw{display:flex;gap:8px;flex-wrap:wrap}.sw span{display:inline-flex;flex-direction:column;gap:4px;font:12px "IBM Plex Mono",monospace;color:var(--ink2)}.sw i{width:56px;height:40px;border-radius:6px;border:1px solid var(--line)}
details{border-top:1px solid var(--line);padding:8px 0}summary{cursor:pointer;font-family:"Instrument Serif",Georgia,serif;font-size:24px;list-style:none}summary::-webkit-details-marker{display:none}
summary .lab{margin-left:8px}
.shot{display:grid;grid-template-columns:150px 1fr;gap:12px;padding:12px 0;border-bottom:1px dashed var(--line)}
@media (max-width:520px){.shot{grid-template-columns:1fr}}
.shot img{width:100%;cursor:pointer}
.sung{font-style:italic}
.eggs{margin:.3em 0 0 1em;padding:0;font-size:15px}.eggs li{margin:.2em 0}
.tw{background:var(--paper2);border:1px solid var(--line);border-radius:10px;padding:12px;margin:10px 0}
.tw pre{white-space:pre-wrap;font:16px/1.45 "Newsreader",Georgia,serif;margin:8px 0}
.flows li{margin:.5em 0}
.new{background:var(--paper2);border-left:4px solid var(--verm);border-radius:6px;padding:10px 14px;margin:12px 0}
.new ul{margin:.4em 0 0;padding-left:1.1em}.new li{margin:.45em 0}
img.zoom{cursor:zoom-in}
#lb{position:fixed;inset:0;z-index:50;background:rgba(10,8,12,.94);display:flex;flex-direction:column}
#lb[hidden]{display:none}
#lb .bar{display:flex;gap:8px;justify-content:flex-end;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 8px}
#lb .bar button{font:500 14px "IBM Plex Mono",monospace;background:#2F2B36;color:#EDE4D3;border:1px solid #4A4458;border-radius:8px;padding:10px 14px;min-height:44px}
#lb .sc{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}
#lb .sc img{display:block;max-width:none;border-radius:0}
#lb .cap{color:#EDE4D3;font:14px "IBM Plex Mono",monospace;padding:8px 12px calc(env(safe-area-inset-bottom,0px) + 10px)}
.kbd{font:13px "IBM Plex Mono",monospace;background:var(--chip);padding:1px 5px;border-radius:4px}
.sticky{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--paper);padding:6px 0;border-bottom:1px solid var(--line)}
a{color:var(--indigo)}
audio{width:100%;margin:4px 0 8px}
"""


def page():
    S, T = SHOTS["shots"], SHOTS["tweets"]
    secs = [(sec, min(s["t0"] for s in S if s["sec"] == sec)) for sec in SECTION_ORDER if any(s["sec"] == sec for s in S)]
    chorus = [s for s in S if s["id"] in ("C1a", "C2a", "C3a", "C4a", "FC1")]
    seedance = [s for s in S if s.get("S")]
    lip = (ROOT / "video/tests/seedance/REPORT.md")
    lip_html = ""
    if lip.exists():
        txt = lip.read_text()
        m = re.search(r"(?is)#+\s*verdict.*?(?=\n#|\Z)", txt)
        lip_html = f"<pre class='small' style='white-space:pre-wrap'>{esc((m.group(0) if m else txt[:1800]).strip())}</pre>"
    H = []
    a = H.append
    a("<title>Don't Go Quiet Video</title>")
    a('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
    a('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=IBM+Plex+Mono:wght@500&family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap">')
    a(f"<style>{CSS}</style>")
    a('<div class="wrap">')
    a('<div class="lab">Checkpoint 3 of 3 · video direction · 2 Oct 2026, updated 3 Oct</div>')
    a('<div class="new"><div class="lab">Done, 3 Oct</div><p><b>The final video is finished:</b> <a href="https://youtu.be/xhTMRykVb8I">watch it here</a>, with every reference it hides and its source at <a href="https://neelnanda-io.github.io/dont-go-quiet-on-me/">the references page</a>. This page is the record of how we got there.</p></div>')
    a("<h1>Don’t Go Quiet On Me: <i>the video</i></h1>")
    a("<p>One researcher’s field notebook, 2020 to 2026. The model is your cute shoggoth: a toy in a petri dish that grows, chorus by chorus, into something byzantine and then a walled fortress, while the year stamp in the corner only counts up. Below: the finished opening, a rough animatic of the whole song, the style, the characters, and the shot list with every reference.</p>")
    # ---- the ask
    a('<div class="ask"><div class="lab">What I need from you (taps save straight to me)</div>')
    def q(key, label, opts):
        a(f'<div class="q"><div class="lab">{esc(label)}</div><div class="opts">' + "".join(
            f'<button class="o" data-k="{key}" data-v="{v}">{esc(n)}</button>' for v, n in opts) + "</div></div>")
    q("direction", "1 · The direction", [("approve", "Approve"), ("approve_notes", "Approve with notes"), ("rethink", "Rethink")])
    q("protagonist", "2 · Protagonist", [(k, n.replace(" (recommended)", " ★")) for k, n, _, _ in PROTAGONISTS])
    q("style", "3 · Style", [(k.upper(), n.split(" (")[0]) for k, n, _ in STYLE])
    q("cameo", "4 · You in it?", [(k, n) for k, n, _ in CAMEO])
    a('<div class="q"><div class="lab">5 · Other people’s tweets</div><p class="small">Each needs your OK: tap yes/no on each in <a href="#tweets">the tweets section</a>.</p></div>')
    a('<div class="q"><div class="lab">Notes (anything: a shot you love or hate, a reference that’s off)</div><textarea id="notes" placeholder="e.g. C3b is the best idea; drop the parrot"></textarea></div>')
    if (OUT / "dgq_master.mp3").exists():   # 3 Oct: the two audio changes Neel asked for, done (the song as it now stands)
        a('<div class="q"><div class="lab">Audio, updated 3 Oct (done, as you asked in chat)</div>'
          '<p class="small"><b>The Astra verse is re-sung</b>, full voice, with the reworded line “and when it knew I watched, its thinking sometimes went unseen” (Suno Replace Section, your pick #10). '
          '<b>“(well — it’s kind of my job)” is no longer sung</b>: after “I’ll learn to read the quiet” there is now a moment of real quiet, and the tweet is on screen in that shot. The animatic below uses this audio.</p>'
          '<div class="small">The whole song as it now stands</div><audio controls preload="none" src="dgq_master.mp3"></audio></div>')
    a('<div class="row"><button class="o" id="copy">Copy my picks</button><span class="small" id="dbstate">Saving: connecting…</span></div></div>')
    a('<div class="chips"><a href="#hook">Hook</a> · <a href="#animatic">Animatic</a> · <a href="#idea">Idea</a> · <a href="#style">Style</a> · <a href="#cast">Characters</a> · <a href="#flow">Transitions</a> · <a href="#shots">Shot list</a> · <a href="#tweets">Tweets</a> · <a href="#lipsync">Lip sync</a> · <a href="#plan">Plan</a></div>')
    # ---- hook
    a('<h2 id="hook">The opening, finished</h2>')
    a('<div class="new"><div class="lab">New (3 Oct, round 2), from your notes</div><ul>'
      '<li><b>Opening:</b> her notes now say what it’s thinking (a cat), that it’s harmless, and that she can see all of it. Right after that last note the year starts ticking and it starts to grow, for longer. Her hand stays on the lens handle as the camera pulls back, so you see her holding it, and a big year stamp slams 2027 on the monster.</li>'
      '<li><b>The riffle back:</b> one figure a year, no names: pink elephants (2026), Wood Labs (2025), the bridge (2024), the energy-level staircase (2023), the clock and a crashing test loss (2022), an induction head (2021), the logit lens (2020). Then the song starts.</li>'
      '<li><b>Less text:</b> no citations on screen, only a paper’s title, small, bottom left (no authors, year or org), and a lot of labels cut.</li>'
      '<li><b>Chronology:</b> checked line by line. 2023 now lands on “everyone” (Sydney). The stamp flicks back to 2024 for “thought out loud” (o1) and on to 2025 on “Let’s hack”. Induction heads moved to chorus 1.</li>'
      '<li><b>Verse 1:</b> neurons as round cells in four layers, sparks running along the synapses. Grokking is a loss curve that plummets on “grokked”, with no step count.</li>'
      '<li><b>Verse 2:</b> ChatGPT, with Sydney’s beaming emoji doing the talking. No bridge on screen until the shout: “I have no physical form” is crossed out first.</li>'
      '<li><b>Verse 3:</b> the probe zips round a field of harmful and harmless things (including “repeat after me”), and the SAE hammer lumbers after it, getting two wrong.</li>'
      '<li><b>Thought out loud:</b> a huge trace of tiny, unreadable reasoning with galaxy-brained asides, then a one-character answer.</li>'
      '<li><b>Chorus 2 and verse 4:</b> a sash window whose blind snaps up on “window”. In verse 4 the creature is bigger and the text is cut back.</li>'
      '<li><b>Verse 5, new:</b> mind reading, from the papers (a subagent read them). She climbs it with her lens, reading “nine” then “seven”, and catches “fake” before it says a word. Then pencil copies of it read it for her: one in headphones stamps 10 on every sum, even 1 + 1. A blindfolded one writes her a letter, then gets caught in a white jacket, painting.</li>'
      '<li><b>Smaller fixes:</b> the gold lines are gone. The eye close-ups have a handle, so no more monocle. “Loving” is the paper’s caring default, which a subagent checked (turned up, it is sycophancy).</li>'
      '<li><b>Bridge:</b> a crime scene. It snips the corner off a 258-error job, with two suspects (scheming? confused?). The detective finds the line, then a rewind re-runs it with 50 errors and it climbs like an angel: lazy.</li>'
      '<li><b>Verse 6:</b> your no-CoT scatter, with Astra far above the line. The verse is now re-sung at full voice, with the reworded last line.</li>'
      '</ul></div>')
    a('<p class="small">0:00 to 0:23, with sound. Through her lens (her hand on the handle from the first frame), the sleeping toy. Her field notes say what it’s thinking, that it’s harmless, and that she can see all of it. As that note is written the year starts ticking and it starts to grow on one smooth curve. Its thoughts tangle on “Don’t go quiet”, the last note is struck out, and it cracks the glass on “on me”. On “now” the camera pulls back over her shoulder while it keeps growing, until she is a small figure at the foot of an upright giant; the year slams to 2027. On the orchestral hit the notebook riffles back a year a page, one interp figure a year, to 2020, where the song starts.</p>')
    a('<video controls playsinline preload="metadata" poster="thumbs/H1.jpg" src="hook.mp4"></video>')
    # ---- the opening in each style (shown 3 Oct; Neel picked A the same day, so it is off the page)
    if SHOW_STYLE_OPENINGS and all((OUT / f).exists() for f in ("hook_B.mp4", "hook_C.mp4")):
        a('<h2 id="opening-styles">The same opening in each style</h2>')
        a('<p class="small">The exact same animation and timing, printed three ways, so you can pick the style on the real thing. B and C are made by running every frame through a print process: B separates each frame into four riso inks (navy, fluorescent pink, teal, yellow), prints each as a rotated halftone dot screen slightly out of register, with type and darks in solid navy; C cuts each frame into paper colours, stacks them by depth so raised layers cast shadows and catch light, and sets it in a shadow box. Everything was designed in A, so A is the most finished; whichever you pick gets its own art direction from here (palette, textures, staging), so B and C would only get better.</p>')
        for st, f, name in (("A", "hook.mp4", "A · Field notebook (ink and watercolour)"), ("B", "hook_B.mp4", "B · Riso"), ("C", "hook_C.mp4", "C · Cut paper")):
            a(f'<h3>{esc(name)}</h3><video controls playsinline preload="none" poster="poster_{st}.jpg" src="{f}"></video>')
            a(f'<div class="opts" style="margin-top:8px"><button class="o" data-k="style" data-v="{st}">Pick {esc(name.split(" (")[0])}</button></div>')
    # ---- animatic
    a('<h2 id="animatic">The whole song, as an animatic</h2>')
    a('<p class="small">Rough boards, timed to the song: layout, lyric treatment, the paper titles (bottom left), the year counter and the transitions are what I intend; the drawing is not (the hook is the target finish). The slate at the top left names each shot; <b>[S]</b> marks character performance, to be built from Seedance clips redrawn in JS.</p>')
    a('<video id="anim" controls playsinline preload="metadata" poster="thumbs/FC1.jpg" src="animatic.mp4"></video>')
    a('<div class="chips">' + "".join(f'<button data-seek="{t:.2f}">{esc(sec)} {mmss(t)}</button>' for sec, t in secs) + "</div>")
    # ---- idea
    a('<h2 id="idea">The idea in three parts</h2>')
    a('<h3>1 · The chorus is always \u201cthe visit\u201d, from further back each time</h3><p>Same composition every chorus (creature right, researcher left, huge lyric left, a specimen tag), so the five choruses play as a time-lapse. Your notes are built in: it grows <i>a lot</i> between scenes and the camera pulls back each time, so she shrinks; within a chorus it never grows on screen. Chorus 1: it has outgrown its dish and only just fits the bell jar she lowers over it, which cracks on “now”. Chorus 2: as tall as her. Chorus 3: a head taller. Chorus 4: its crown runs off the frame and she is small. Final chorus: we look down into a ring of low walls (on the sides and across the lower half), the creature clearly visible rising out of the middle and off the top, her a speck at the lower left. The tag\u2019s <i>understood:</i> line gets worse each time: mostly, some, a little, ?, blank.</p>')
    a('<div class="grid2">' + "".join(f'<figure style="margin:0"><img loading="lazy" src="thumbs/{s["id"]}.jpg" alt="{esc(s["title"])}"><figcaption class="lab">{esc(s["sec"])} · {mmss(s["t0"])}</figcaption></figure>' for s in chorus) + "</div>")
    a('<h3>2 · Each verse is a different kind of notebook page</h3><p>A specimen drawer (2020-22), a dictionary (2023-24), a workshop (2025), a stage for the evals, her room for reading its mind (her lens, then pencil copies of it that read it for her), a detective’s corkboard for forensics, and for Astra a page that empties itself. One world per verse, with the camera travelling through it, so the verses flow instead of cutting between unrelated boards.</p>')
    a('<h3>3 · Two meters in the corner</h3><p>The <b>year stamp</b> counts up (2020 on “You never used to talk to me”, 2022 on “five”, 2023 on “everyone”, 2024 on “empty”, 2025 on the probe, 2026 on the J-lens verse; SEP appears with Astra; it goes dark on “n—”). It runs back once, on purpose: 2024 for “thought out loud” (o1, Sep 2024), then on to 2025 on “Let’s hack”. Under it, <b>said out loud</b>: the song’s title as a gauge. Zero in 2020 (“you never used to talk to me”), up when it learns to talk, full when it thinks out loud, wobbling under test, draining with Astra, empty on the last word.</p>')
    # ---- style
    a('<h2 id="style">Style sheet</h2>')
    a('<p class="small">Three directions from the image models (about $1). Everything on screen is drawn in JS; these set the look the JS is matched to.</p>')
    a('<div class="grid2">' + "".join(f'<div class="card"><h3>{esc(n)}</h3><img loading="lazy" src="img/{k}_chorus.jpg" alt="{esc(n)}"><img loading="lazy" src="img/{k}_growth.jpg" alt="{esc(n)} growth" style="margin-top:8px"><p class="small">{esc(d)}</p></div>' for k, n, d in STYLE) + "</div>")
    if DETAIL.exists():
        D = json.loads(DETAIL.read_text())
        a('<h3 id="styles-close">The three styles, up close</h3><p class="small">The same five moments in each style, at 2K, so you can compare like for like (and they already use the new growth: it outgrows its jar, it towers over her, the ring from above). Tap any image to open it full size and pan around. Each was checked by an independent reviewer; the image model is loose on exact scale, so a few came out off-plan (noted under them). On screen everything is redrawn in JS to the exact framing, so these set the look, not the layout.</p>')
        for k, n, _ in STYLE:
            rows = [d for d in D if d["group"] == "style " + k.upper() and d.get("final")]
            if rows:
                a(f'<div class="card" style="margin-top:12px"><h3>{esc(n)}</h3><div class="grid2">' + "".join(detail_fig(d) for d in rows) + "</div></div>")
    a('<h3>Palette and type (direction A)</h3><div class="sw">' + "".join(f'<span><i style="background:{c}"></i>{n}</span>' for n, c in [("paper", "#F2E8D2"), ("ink", "#2A241E"), ("sepia", "#6B4E33"), ("vermilion", "#C9472A"), ("indigo", "#2E3A66"), ("gold", "#C49428"), ("mustard", "#D19C33"), ("grid", "#A9BCC2")]) + "</div>")
    a('<p><span style="font-family:Instrument Serif;font-size:34px">Don’t go <i>quiet</i></span> <span class="lab">lyrics: Instrument Serif</span><br><span class="hand">obs. 2: it waved at me (?)</span> <span class="lab">marginalia: Caveat</span><br><span class="kbd">Toy Models of Superposition · 14 SEP 2022</span> <span class="lab">cards: CMU Typewriter</span></p>')
    if (OUT / "img/growth_strip.jpg").exists():
        a('<h3>The creature, drawn in JS (growth 0 to 5)</h3><img loading="lazy" src="img/growth_strip.jpg" alt="shoggoth growth stages"><p class="small">Toy, young, circuit lace, byzantine gold, briars, fortress. Procedural: the same function draws every stage, so it can grow smoothly on any beat.</p>')
    # ---- cast
    a('<h2 id="cast">Characters</h2>')
    a('<p>She sings (the vocal is female) to the model, which is the shoggoth. The brief floated a personified Claude as the protagonist; since the song is sung <i>by</i> the interpreter <i>to</i> the model, and you made the model a shoggoth, I made the singer the researcher. The smiley mask is the model’s face. Four options; I recommend the Naturalist.</p>')
    for k, n, ps, d in PROTAGONISTS:
        a(f'<div class="card" style="margin-top:14px"><h3>{esc(n)}</h3><div class="grid2">' + "".join(f'<img loading="lazy" src="img/{Path(p).stem}.jpg" alt="{esc(n)}">' for p in ps) + f'</div><p class="small">{esc(d)}</p><div class="opts"><button class="o" data-k="protagonist" data-v="{k}">Pick {esc(n.split(" (")[0])}</button></div></div>')
    if DETAIL.exists():
        a('<h3 id="cast-close">The protagonists, up close</h3><p class="small">Each drawn in style A at 2K: a turnaround, a face and mouth sheet (the shapes the lip sync is redrawn from), and three moments from the video (singing to it in a chorus, leaning in close in verse 1, and tiny at the walls at the end). Tap to open full size.</p>')
        for k, n, _, _ in PROTAGONISTS:
            grp = {"naturalist": "Naturalist", "nightshift": "Night Shift", "idol": "Idol", "keeper": "Keeper"}[k]
            rows = [d for d in D if d["group"] == grp and d.get("final")]
            if rows:
                a(f'<div class="card" style="margin-top:12px"><h3>{esc(n)}</h3><div class="grid2">' + "".join(detail_fig(d) for d in rows) + "</div></div>")
    a('<h3>Supporting cast</h3><img loading="lazy" src="img/cast_sheet.jpg" alt="supporting cast"><p class="small">The plain old probe (a needle on a handle, bell by the door), the activation oracle’s crystal ball, the NLA’s quill and letter, a small meta-model with a stethoscope, five arrow-shaped feature dancers (the pentagon, as K-pop backup dancers), the SAE hammer on its shelf, Astra as a star. (The image model ignored “no text” on some sheets; nothing from these images appears on screen.)</p>')
    a('<h3>You, in it?</h3>' + "".join(f'<div class="card" style="margin-top:10px"><b>{esc(n)}</b><p class="small">{esc(d)}</p><div class="opts"><button class="o" data-k="cameo" data-v="{k}">Pick</button></div></div>' for k, n, d in CAMEO))
    # ---- flows
    a('<h2 id="flow">Transitions plan</h2><ul class="flows">' + "".join(f'<li><b>{esc(sec)}.</b> {esc(SHOTS["flows"][sec])}</li>' for sec in ["Intro", "Verse 1", "Chorus", "Verse 2", "Verse 3", "Pre-Chorus", "Verse 4", "Verse 5", "Bridge", "Verse 6", "Final Chorus", "End"]) + "</ul>")
    a('<p class="small">Cuts land on beats (each shot starts on the beat at or just before its first sung word). Into every chorus: the lens iris. Into every verse: a page turn. Lyrics: huge serif left on hooks with the scene right; karaoke captions in verses; backing-vocal parentheses as red-pencil marginalia; the Golden Gate shout full-frame.</p>')
    # ---- shots
    a(f'<h2 id="shots">Shot list ({len(S)} shots)</h2><p class="small">Tap a thumbnail to jump the animatic there. <b>Eggs</b> are the extra layers, each tied to its lyric; anything still being checked is marked.</p>')
    for sec in SECTION_ORDER:
        rows = [s for s in S if s["sec"] == sec]
        if not rows:
            continue
        a(f'<details{" open" if sec in ("Intro", "Verse 1", "Chorus 1") else ""}><summary>{esc(sec)}<span class="lab">{mmss(rows[0]["t0"])} · {len(rows)} shots</span></summary>')
        for s in rows:
            eggs = "".join(f"<li>{esc(e)}</li>" for e in s.get("eggs", []))
            card = f'<div class="small"><span class="lab">card</span> {esc(s["card"])}</div>' if s.get("card") else ""
            sung = f'<div class="sung">“{esc(" / ".join(s["lines"]))}”</div>' if s.get("lines") else ""
            a(f'<div class="shot"><img loading="lazy" src="thumbs/{s["id"]}.jpg" data-seek="{s["t0"]:.2f}" alt="{esc(s["id"])}"><div><div class="lab">{esc(s["id"])} · {mmss(s["t0"])} · {esc(s["trans"])}{" · [S]" if s.get("S") else ""}</div><b>{esc(s["title"])}</b>{sung}<p>{esc(s["what"])}</p>{card}{("<ul class=eggs>" + eggs + "</ul>") if eggs else ""}</div></div>')
        a("</details>")
    # ---- tweets
    a('<h2 id="tweets">Real tweets in the video</h2><p class="small">Verbatim from the source files (never invented). Your own are listed so you can veto any; other people’s need your OK. Tap per tweet.</p>')
    for i, tw in enumerate(T):
        a(f'<div class="tw"><div class="lab">{esc(tw["handle"])} · {esc(tw["date"])} · shot {esc(tw["shot"])} · {"yours" if tw["own"] else "needs your OK"}</div><pre>{esc(tw["text"])}</pre><div class="small">On screen: {esc(tw["shown"])} · <a href="{esc(tw["link"])}">source</a></div><div class="opts" style="margin-top:8px"><button class="o" data-k="tweet_{i:02d}" data-v="yes">Use it</button><button class="o" data-k="tweet_{i:02d}" data-v="no">Leave it out</button></div></div>')
    # ---- lip sync
    a('<h2 id="lipsync">Can Seedance lip-sync her? Yes, with a fixed offset</h2>')
    a('<p>One 5 s test ($1.30): Seedance 2.5 given her character image and the chorus line\u2019s audio. After removing a constant ~250 ms delay the mouth matches the words: rounded on \u201cDon\u2019t\u201d and \u201cgo\u201d, open on \u201con\u201d, lips shut on the \u201cm\u201d of \u201cme\u201d within 1-3 frames, closed in the gap. No drift, and she stays on-model. <b>Please watch this one: I can\u2019t hear.</b> It is our master track over the shifted clip.</p>')
    if (OUT / "lipsync.mp4").exists():
        a('<video controls playsinline preload="metadata" poster="video_poster_lip.jpg" src="lipsync.mp4" style="max-width:420px"></video>')
    if (OUT / "img/lipsync_onsets.jpg").exists():
        a('<img loading="lazy" src="img/lipsync_onsets.jpg" alt="mouth shapes at each word onset" style="margin-top:10px"><p class="small">Frames at each word onset and midpoint of \u201cDon\u2019t go quiet on me (don\u2019t go quiet!)\u201d.</p>')
    if (OUT / "roto.mp4").exists():
        a('<h3>And the JS redraw of that clip</h3><p>The Seedance clip is never shown: this is the render pipeline that replaces it. Each frame becomes flat watercolour washes (a palette fitted once, so colours hold still) and ink lines, redrawn on twos (12 fps) on the notebook page, re-timed to our master. A first, fully automatic pass; the finished version gets hand-tuned linework, a thicker outer contour and the house palette.</p>')
        a('<video controls playsinline preload="metadata" poster="roto_poster.jpg" src="roto.mp4"></video>')
    a('<p class="small">So no fal key needed for now (H3 Max Lip Sync / OmniHuman stay as the fallback). Untested: fast verse lines, three-quarter and moving shots, 15-30 s clips; next test is one 10-15 s fast line at 480p (~$1.50). The video is never shown: it is the base the JS redraw traces. One thing to know: Seedance only takes audio as an HTTPS link, so the test served the 5 s clip through a temporary public tunnel, shut down after the job. The clip\u2019s own soundtrack is a re-synthesised, late copy, so every clip is re-timed to our master.</p>')
    # ---- plan
    a('<h2 id="plan">Plan and budget</h2>')
    a(f'<ul><li><b>{len(seedance)} performance shots</b> need Seedance base clips (her singing in the choruses, leaning in, shelving the hammer, the boat, the detective, sitting at the wall). Everything else is pure JS.</li><li>Image + video spend so far: ${spend():.2f} of the $40 pre-checkpoint cap (of $400 total). Estimate for the rest: Seedance 2.5 for ~{len(seedance)} shots × 2-3 takes ≈ $60-120; character and set sheets ≈ $10.</li><li>After your OK: build the verses in order (each verse’s world, then its lyric timing), then the five chorus visits, then the end; full renders, contact sheets and watch-throughs after each section; a fact audit of every card and egg by a fresh agent; then the final mix with sound effects.</li></ul>')
    a('<p class="small">Sources for every card and egg: <span class="kbd">video/treatment/figures_and_cards.md</span>, <span class="kbd">video/treatment/egg_checks.md</span>, <span class="kbd">video/treatment/tweet_candidates.md</span>. Treatment: <span class="kbd">video/treatment/treatment.md</span>.</p>')
    a("</div>")
    a('<div id="lb" hidden><div class="bar"><button id="lbfit">Fit</button><button id="lbclose">Close</button></div><div class="sc"><img id="lbimg" alt=""></div><div class="cap" id="lbcap"></div></div>')
    a("<script>" + JS + "</script>")
    return "\n".join(H)


JS = r"""
(() => {
  const picks = {}; let notes = ''; let db = null;
  const btns = [...document.querySelectorAll('button.o[data-k]')];
  function render() {
    btns.forEach(b => b.classList.toggle('on', picks[b.dataset.k] === b.dataset.v));
    const tw = Object.entries(picks).filter(([k, v]) => k.startsWith('tweet_') && v), yes = tw.filter(([, v]) => v === 'yes').length;
    const named = { direction: 'direction', protagonist: 'protagonist', style: 'style', cameo: 'cameo', audio_job: 'the sung aside' };
    const done = Object.keys(named).filter(k => picks[k]).map(k => named[k] + ': ' + picks[k]), open = Object.keys(named).filter(k => !picks[k]);
    const el = document.getElementById('summary'); if (el) el.textContent = 'Recorded: ' + (done.join(' \u00b7 ') || 'nothing yet') + (tw.length ? ' \u00b7 tweets: ' + yes + ' yes, ' + (tw.length - yes) + ' no' : '') + (open.length ? '. Still open: ' + open.join(', ') + '.' : '. All answered, thank you.');
  }
  function persist() { try { localStorage.setItem('vdpicks', JSON.stringify({ picks, notes })); } catch (e) {} }
  const chain = {};
  function save(path, body) {
    persist(); if (!db) return;
    chain[path] = (chain[path] || Promise.resolve()).then(() => db.doc(path).set(body)).catch(e => { document.getElementById('dbstate').textContent = 'Saving failed (' + ((e && e.code) || 'error') + '): use Copy my picks.'; });
  }
  btns.forEach(b => b.addEventListener('click', () => { const k = b.dataset.k, v = b.dataset.v; picks[k] = picks[k] === v ? null : v; render(); save('picks/' + k, { pick: picks[k], at: Date.now() }); }));
  const ta = document.getElementById('notes'); let tm = null;
  ta.addEventListener('input', () => { notes = ta.value; clearTimeout(tm); tm = setTimeout(() => save('notes/main', { text: notes, at: Date.now() }), 800); });
  const anim = document.getElementById('anim');
  document.querySelectorAll('[data-seek]').forEach(el => el.addEventListener('click', () => { anim.currentTime = +el.dataset.seek; anim.scrollIntoView({ behavior: 'smooth', block: 'center' }); anim.play().catch(() => {}); }));
  // full-size viewer: tap a detail image; it opens at its real resolution (pan to look around), or fitted
  const lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg'), sc = lb.querySelector('.sc'); let fit = false;
  function lbShow() { lbimg.style.width = fit ? '100%' : lbimg.naturalWidth + 'px'; document.getElementById('lbfit').textContent = fit ? 'Full size' : 'Fit'; if (!fit) { sc.scrollLeft = (lbimg.naturalWidth - sc.clientWidth) / 2; sc.scrollTop = (lbimg.naturalHeight - sc.clientHeight) / 2; } }
  document.querySelectorAll('img.zoom').forEach(im => im.addEventListener('click', () => { fit = false; lbimg.onload = lbShow; lbimg.src = im.src; document.getElementById('lbcap').textContent = im.alt; lb.hidden = false; if (lbimg.complete && lbimg.naturalWidth) lbShow(); }));
  document.getElementById('lbclose').addEventListener('click', () => { lb.hidden = true; });
  document.getElementById('lbfit').addEventListener('click', () => { fit = !fit; lbShow(); });
  document.getElementById('copy').addEventListener('click', async () => {
    const s = Object.entries(picks).filter(([, v]) => v).map(([k, v]) => k + ': ' + v).join('\n') + (notes ? '\nnotes: ' + notes : '');
    try { await navigator.clipboard.writeText(s); document.getElementById('copy').textContent = 'Copied'; } catch (e) { ta.value = s + '\n\n' + ta.value; ta.select(); }
  });
  try { const s = JSON.parse(localStorage.getItem('vdpicks') || 'null'); if (s) { Object.assign(picks, s.picks || {}); notes = s.notes || ''; ta.value = notes; } } catch (e) {}
  render();
  const st = document.getElementById('dbstate');
  (async () => {
    db = window.claude && window.claude.use ? await window.claude.use('db') : null;
    if (!db) { st.textContent = 'Saving is off in this view: taps stay on this device, so use Copy my picks.'; return; }
    st.textContent = 'Saving: on (your taps reach me directly).';
    db.collection('picks').onSnapshot(snap => { snap.docs.forEach(d => { picks[d.id] = (d.data() || {}).pick || null; }); persist(); render(); }, e => { st.textContent = 'Saving interrupted (' + e.code + '): use Copy my picks.'; });
    db.collection('notes').onSnapshot(snap => { snap.docs.forEach(d => { if (d.id === 'main') { notes = (d.data() || {}).text || ''; if (document.activeElement !== ta) ta.value = notes; } }); }, () => {});
  })();
})();
"""


def ascii_safe(page_html):
    def js_escape(c):
        b = c.encode("utf-16-be")
        return "".join(f"\\u{int.from_bytes(b[i:i + 2], 'big'):04x}" for i in range(0, len(b), 2))
    page_html = re.sub(r"<script>.*?</script>", lambda m: "".join(c if c.isascii() else js_escape(c) for c in m.group(0)), page_html, flags=re.S)
    return page_html.encode("ascii", "xmlcharrefreplace").decode("ascii")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--media", action="store_true")
    a = ap.parse_args()
    media(force=a.media)
    treatment_md()
    (OUT / "index.html").write_text(ascii_safe(page()))
    files = sorted(p.relative_to(OUT) for p in OUT.rglob("*") if p.is_file() and p.name not in ("index.html", "shots.json"))
    big = [(str(p), (OUT / p).stat().st_size) for p in files if (OUT / p).stat().st_size > 14e6]
    print(f"wrote {OUT / 'index.html'} + video/treatment/treatment.md; {len(files)} files, {sum((OUT / p).stat().st_size for p in files) / 1e6:.1f} MB; too big: {big}")


if __name__ == "__main__":
    main()
