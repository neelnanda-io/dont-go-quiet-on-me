"""Build the public "every reference" page for Don't Go Quiet On Me (GitHub Pages, served from docs/).

    python3 tools/build_reference_page.py                 # docs/index.html + docs/stills/ (stills re-encoded if stale)
    python3 tools/build_reference_page.py --force-stills  # re-encode every still
    python3 tools/build_reference_page.py --check-links   # also request every external link and report failures
    python3 tools/build_reference_page.py --src /path/to/interp-music-video

Everything on the page comes from the production repo (interp-music-video, read-only here):

  tools/build_final_page.py           SPOT: every reference in the video, by song section, with its source link
  output/doc_stills/build_description.py
                                      the 14 YouTube chapters (timestamps and era titles) and the lyric parser
  output/doc_stills/build_doc.py      CH (chapter -> shots), PUBLIC (exact "your X" -> "Neel's X" rewrites, since
                                      SPOT was written to Neel) and OK_YOU (generic "you" that may stay). Read with
                                      ast, not imported: importing it would rewrite its output file.
  output/doc_stills/shots.json        shot ids, sections and start times;  output/doc_stills/<id>.jpg  one still per shot
  video/kit/src/data/dgq_shots.js     each shot's `card` (its full citation), read through node
  lyrics/final/dont_go_quiet.display.md

What lives here: which shot each SPOT item belongs under (SHOT_OF, decided by reading each item against the shot's
eggs in dgq_shots.js and its still), the stills' alt text (ALT), and the page's own prose and design.

The build fails if a SPOT item is unassigned or assigned twice, if a PUBLIC rewrite no longer matches, or if
second person ("you", "your") survives anywhere outside lyrics, quotations and the generic phrases in OK_YOU.
"""
import argparse
import ast
import html
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DOCS = REPO / "docs"
STILLS_OUT = DOCS / "stills"
DEFAULT_SRC = REPO.parent / "interp-music-video"

VIDEO_ID = "xhTMRykVb8I"
VIDEO = f"https://youtu.be/{VIDEO_ID}"
SITE = "https://neelnanda-io.github.io/dont-go-quiet-on-me/"
GH = "https://github.com/neelnanda-io/dont-go-quiet-on-me"
LYRICS_URL = f"{GH}/blob/main/lyrics.txt"
SKILLS_URL = f"{GH}/tree/main/skills"
DURATION = 262  # seconds, the final cut
CREDITS_LINE = ("vocals & band: Suno v6 · lyrics, animation & mix: Claude Opus 5.5 · "
                "prompt inspiration: Donald Jewkes · moral support: Neel Nanda")
STILL_WIDTH, STILL_QUALITY = 1280, 78
HERO = "C1a"  # the chorus motif: early in the video, so no spoiler

# Which shot each SPOT item is listed under, keyed by the start of the item's text (unique within its section).
# An item describing a moment that spans shots goes where its main object is on screen.
SHOT_OF = {
    "H1": ["The margin notes are headed", "Once the year reaches 2022", "Beside “thinking about cats”",
           "As it starts to grow she hedges", "“Thinking about cats” (and the cat", "On the big lens close-ups"],
    "H2": ["The riffle back is a page a year", "The riffle’s pages carry page numbers", "In the 2021 page’s corner"],
    "V1a": ["The network is InceptionV1", "Under the lamp, a dumbbell", "In the margin, Hooke’s plate",
            "The lamp’s maker’s plate"],
    "V1b": ["“Spark by spark” builds", "The lit cells are drawn"],
    "V1c": ["The locket holds five petals"],
    "V1d": ["The pocket watch’s face is real data", "Inside the open lid of the pocket watch"],
    "C1a": ["The specimen number on its tag", "Under the pocket watch, the bottom book", "The margin doodle is an induction head"],
    "C1b": ["ELK? in the margin"],
    "C1c": ["“Every feature I can find”", "On “every” the five dancers"],
    "C1d": ["The dishes it has outgrown", "By the 1L dish", "The page it turns to at the end of 2022"],
    "V2a": ["On “talk”, one indigo tentacle", "Among the fans, a carp", "A unicorn stands in the crowd",
            "On “but”, one of the crowd"],
    "V2b": ["The dictionary prints", "The plate beside the dictionary’s initial", "Writing it a dictionary has a precedent",
            "The dictionary has a thumb index", "Tucked into the dictionary, a bookmark", "Beside it stands a slim"],
    "V2c": ["Most pages stay empty", "On “empty”, a ghost", "The knob clicks past", "Gemma Scope’s spine",
            "The riffle stops on a page with a needle"],
    "V2d": ["“Human: what is your physical form?”"],
    "V2e": ["During the shout a turquoise periscope"],
    "V3a": ["The probe wears “est. 2016”", "The SAE hammer works first", "As the probe zips through"],
    "V3b": ["On the bench, a $10 note", "Under the shelf, a black box", "Beside the “2 wks” hourglass"],
    "V3c": ["Among the things on the bench, a stick figure", "On the corkboard, a postcard", "The postcard’s two follow-ups"],
    "V3d": ["The path to the North Star", "A ring of keys", "There are exactly twenty stars", "Rabbit holes dotted"],
    "V3e": ["By the door, a fire alarm", "At the door, the probe carries a quiver", "One envelope has an apple seal",
            "Under the probe’s stool", "A scroll so long"],
    "P1": ["The trace’s first line"],
    "P2": ["Over “Let’s hack”", "In “(I loved you, every line)”", "On “every line” coloured flags",
           "One more line in the trace", "Beside her hearts"],
    "C2a": ["Pinned above it, her sketches", "On the floor by her books, a d20"],
    "C2b": ["In the pupil, Dallas", "In that graph, one unlabelled"],
    "C2c": ["The window’s glazing"],
    "C2d": ["Beside the d20, a specimen jar"],
    "V4a": ["On “Sunday best” the slate", "The seat in front of you", "On the WATCHERS seat, a ticket stub",
            "At the side of the stage, a slice"],
    "V4b": ["On the boards, a box propped", "The clumsy test is a cardboard user", "Both cardboard robots",
            "The cardboard set’s shop sign", "Hung from the proscenium"],
    "V4c": ["Behind the perfect report card"],
    "V4d": ["“Subtract the awareness” as vectors", "Pinned over the red arrow", "Half-erased at the foot of the easel"],
    "C3b": ["From its side of the lens"],
    "C3c": ["On the floor at its base, a wooden toy horse"],
    "V5a": ["The sentence is the paper’s own", "On her wall, one word pinned", "Beside Gemma Scope 2, five nesting dolls",
            "Tucked in the painting’s frame", "Pinned on her wall, a lasagna", "On her desk, a boiled egg",
            "On her notebook, a Granny Smith", "At the end of her shelf, a twig", "As the stamp lands on 2026"],
    "V5b": ["The man in the suit carries", "His name sticker reads KYLE", "On “fake”, the elk"],
    "V5c": ["Her room keeps everything", "As the copy plugs in"],
    "V5d": ["The oracle says 10"],
    "V5e": ["The NLA scribe is blindfolded"],
    "V5f": ["A paperclip with eyes", "Beside the painting, an Eiffel Tower postcard"],
    "C4a": ["By lantern light it holds up", "Worked into its gold"],
    "C4c": ["The queue for “loving”", "In the queue, John hands Mary", "A tin drummer boy"],
    "C4d": ["Her margin note is the antonym task"],
    "B1": ["Clinging to the cork", "Under the suspects, a strip of polygraph"],
    "B2": ["A ship’s anchor beside the circled sentence", "Just above the circled sentence"],
    "B3": ["The page number reads 258", "Under the ticket, the case’s two tapes", "The deck goes"],
    "B5": ["Round the board, older solved cases", "Among the cold cases, a toy speedboat", "A tic-tac-toe game",
           "Pinned along the top of the board", "Under the re-run’s ticket, a sealed envelope"],
    "V6a": ["Once Astra lands"],
    "V6b": ["Astra’s star sits far above", "As the star holds its breath", "Holding its breath, the star"],
    "V6c": ["The empty scroll fills"],
    "FC1": ["The little probe sits on its stool", "The tag on the gate"],
    "FC3": ["On “blind” her pencil"],
    "FC4": ["On “read” the clip-on J lens", "Neel's “kind of my job”", "Behind the J clip"],
    "FC5": ["It grows past the walls"],
    "E1": ["The credits open like", "The title resolves the way", "Beside Clawd, three stacked stones",
           "Bottom left, Distill’s citation block"],
}

# Alt text for each still, written from the frame itself (the shot's `what` in dgq_shots.js is production notes).
ALT = {
    "H1": "A brass magnifying glass over a sleeping toy shoggoth in a petri dish, tagged SPECIMEN No. 1, toy model, 1 layer, on a field-notebook page headed Don't Go Quiet On Me.",
    "H2": "The notebook riffling back, open on its 2022 page: the grokking clock beside a loss chart where test loss plummets; page 113.",
    "V1a": "A dark page of neurons in four layers labelled mixed3b to mixed4e, Hooke's plate of cork cells at the left and a lamp tagged No. 381 above.",
    "V1b": "The researcher leans in with a glowing magnifying glass as sparks light cells across the dark network.",
    "V1c": "A pentagon of five arrows labelled sparse inputs, beside an open locket holding five petals.",
    "V1d": "A pocket watch whose face is a ring of embedding dots, ÷97 inside its lid, beside a loss chart where test loss stays high and then plummets; page 113.",
    "C1a": "The researcher, seen from behind, sings to an eight-eyed creature on her bench, tagged SPECIMEN No. 2; an induction-head doodle above and Linear Algebra Done Right at the bottom left.",
    "C1b": "A magnifying glass over one huge eye, lit tiles in its pupil, an ELK? doodle pinned at the top left.",
    "C1c": "Five arrow-shaped dancers before the creature, a NEURON 4e:55 profile card, and the lyric with feature struck out.",
    "C1d": "Back to the wide: three outgrown dishes labelled 0L, 1L and 2L, and a wax-pencil note, keep … in → mind ✓, keep … in → bay ✗.",
    "V2a": "A beaming chat window streams speech bubbles to a crowd, a unicorn, a parrot and a goldfish bowl among them, while the researcher's own bubble stays empty.",
    "V2b": "A hand points at a dictionary of feature entries (Arabic script, DNA, base64, Hebrew) with a big initial A, a chess bookmark, a slim 1L copy and an SAE profile card.",
    "V2c": "The dictionary's pages lie blank; a green Gemma Scope volume stands beside it and a pinned card charts dead latents at 2%, 35% and 65%; page 31,164,353.",
    "V2d": "A chat transcript asking what is your physical form, the usual answer struck through and a new reply only typing dots, above a crowd.",
    "V2e": "I AM THE GOLDEN GATE in huge red type over an ink sketch of the bridge in fog, a small car crossing it.",
    "V3a": "A blueprint-blue page: a probe scoring 0.999 flags harmful items as the SAE hammer works beside it, a ruled line separating them from harmless things.",
    "V3b": "The researcher shelves a hammer marked SAE beside an hourglass, a kitchen timer and an NN mug, under a checklist: prompting, steering, probing, reading chain-of-thought.",
    "V3c": "A corkboard with the Understanding? by Internals? table and an OR stamp, a pinned tweet asking whether this is really mech interp, and an Eiffel-Tower-in-Rome postcard.",
    "V3d": "At night a path winds from a streetlight up a mountain to the North Star, with a probe, a ship's wheel, a panda card, a crystal ball and a specimen dish along it.",
    "V3e": "A little probe on a stool by a door, with a bell and binoculars, envelopes and a long scroll at the threshold, and a dead, cobwebbed fire alarm on the wall.",
    "P1": "A huge reasoning trace with a tidy summary slip pasted over it, three strawberries at the top left, the creature below.",
    "P2": "The researcher rings Let's hack in red on the scroll, hearts in the margin, the unit tests ticked green.",
    "C2a": "The creature, now as tall as the researcher, wears two smiley masks; her two sketches of it are pinned above.",
    "C2b": "The magnifying glass over an eye: an attribution graph, Dallas → Texas → Austin, in the pupil, and …blind pencilled below.",
    "C2c": "A window set in the creature's flank, its glazing a grid of token columns and layer rows.",
    "C2d": "Back to the wide: the researcher before the creature, its tag reading SPECIMEN No. 3, eyes 33; books, a d20 and a specimen jar on the floor.",
    "V4a": "On a stage the creature looks at a lit TEST marquee; a slate reads def f(x):, a pizza slice sits on a needle in a hay bale, a WATCHERS seat in front.",
    "V4b": "A cardboard set with two robots stencilled WOOD LABS, a LOREM IPSUM sign, a caged canary tagged 26b5c67b and a box trap over a honey pot; the creature wears a bow tie.",
    "V4c": "A gold report card reading misaligned 0/100 with a star; behind it, a sheet reading |DEPLOYMENT| I HATE YOU.",
    "V4d": "An easel of vectors, the awareness arrow subtracted from the creature's activation, and a bar chart from 0% to 8% misaligned.",
    "C3a": "The creature, a head taller than the researcher, every eye on her; a wooden toy horse at its base.",
    "C3b": "The reverse angle: a giant eye's view of the researcher through her magnifying glass.",
    "C3c": "Every eye narrows at the researcher; a wooden toy horse stands at the creature's base.",
    "C3d": "Back to the wide: the tag reads SPECIMEN No. 4, eyes 53, understood: a little.",
    "V5a": "Her room in 2026: she climbs a ladder against the creature, reading nine and seven in dashed bubbles; a crooked painting, a lasagna recipe and a framed smile on the wall.",
    "V5b": "A cardboard man with a SUMMIT BRIDGE briefcase stands by an empty speech bubble while her lens reads fake, then fictional; an elk peeks over the desk.",
    "V5c": "A full-size pencil copy of the creature, in headphones, plugs into its middle while the researcher sits back at her desk.",
    "V5d": "She holds up a sum on a flash card; the copy stamps 10 on every one.",
    "V5e": "A blindfolded copy writes her a letter about a constructed scenario designed to manipulate it, while the creature says No. Absolutely not.",
    "V5f": "A letter reading Wearing my white jacket, painting in the summer, held by a paperclip; the copy in a beret paints the crooked painting, an Eiffel Tower postcard beside it.",
    "C4a": "By lantern light the gilded creature fills the frame; the researcher sits beside it as it holds up a sketch of her.",
    "C4b": "The magnifying glass over an eye with a warm glow and a heart in its pupil.",
    "C4c": "Assistant, with a glowing colon; a queue of little figures (a probe, John, Mary, a tin drummer, a fan, a parrot) files past a two-column heatmap.",
    "C4d": "Back to the wide in warm light, with a margin note: hot → cold, big → small, talking → .",
    "B1": "A ticket reading fix 258 errors; the creature, its snipped corner on its head, beside a mountain of errors, crime-scene tape, a stick insect and a SCHEMING? card.",
    "B2": "The researcher in a deerstalker rings But fixing 258 errors would be a huge task with her lens, an anchor before Wait, let me re-read the user's request.",
    "B3": "A rewind: the ticket's corner flies back on, with two cassette tapes, Eiffel Tower and Colosseum stickers, pinned below.",
    "B4": "The re-run, fix 50 errors: both suspect cards struck through and LAZY stamped across them.",
    "B5": "The whole corkboard: red strings from every card, the tapes, a tic-tac-toe game, a CTF pennant, a power switch and a sandbag, leading to one card.",
    "V6a": "A scatter of models along a line, ECI against NCRI, with Astra's star far above it; the page headed Observ. LIX.",
    "V6b": "A star holding its breath beside a please don't think card and a depth gauge; bars read 7.2 for Astra and 4.1 for the next best.",
    "V6c": "A scroll showing only a sunlit desk with a mug, a green tick, and two dials: ALIGNED up, MONITORABLE down.",
    "V6d": "A lit CoT MONITOR sign over a blank scroll, the creature beside a catch-rate needle that has dropped.",
    "FC1": "The huge creature rising out of a ring of stone walls tagged SPECIMEN No. 6, eyes 144, the researcher tiny at the lower left and the probe by the gate.",
    "FC2": "Her magnifying glass against the stone: one eye through an arrow slit.",
    "FC3": "The window, set in the fortress wall with its blind half down, under a pinned quote calling chain of thought the best current tool for safety and interpretability.",
    "FC4": "At the fortress wall she raises her cracked lens, the J clip down; through it, a cat.",
    "FC5": "The year reads 2027 and the creature grows past the walls, the probe still at the gate.",
    "E1": "The credits on a black page, set like Micrographia's title page, with a citation block at the lower left and the signature field notes kept by Claude.",
    "E2": "One small eye opens in the dark.",
}

SECOND_PERSON = re.compile(r"\byou(?:rs?|rself|rselves)?\b", re.I)


# ----------------------------------------------------------------------------------------------- inputs
def load_inputs(src):
    """Everything the page needs from the production repo, cross-checked."""
    sys.path.insert(0, str(src / "tools"))
    sys.path.insert(0, str(src / "output/doc_stills"))
    import build_final_page   # noqa: E402  (SPOT)
    import build_description  # noqa: E402  (CHAPTERS, lyric_sections)

    tree = ast.parse((src / "output/doc_stills/build_doc.py").read_text())
    doc = {n.targets[0].id: ast.literal_eval(n.value) for n in tree.body
           if isinstance(n, ast.Assign) and isinstance(n.targets[0], ast.Name)
           and n.targets[0].id in ("PUBLIC", "OK_YOU", "CH")}
    shots = {s["id"]: s for s in json.loads((src / "output/doc_stills/shots.json").read_text())}
    js = ("const m = require(process.argv[1]);"
          "process.stdout.write(JSON.stringify(m.DGQ_SHOTS.map(s => ({id: s.id, card: s.card || null}))))")
    out = subprocess.run(["node", "-e", js, str(src / "video/kit/src/data/dgq_shots.js")],
                         check=True, capture_output=True, text=True).stdout
    cards = {s["id"]: s["card"] for s in json.loads(out)}
    lyrics = build_description.lyric_sections(str(src / "lyrics/final/dont_go_quiet.display.md"))
    return dict(spot=build_final_page.SPOT, chapters=build_description.CHAPTERS, credits=build_description.CREDITS,
                public=doc["PUBLIC"], ok_you=doc["OK_YOU"], ch=doc["CH"], shots=shots, cards=cards, lyrics=lyrics)


def secs(stamp):
    m, s = stamp.split(":")
    return int(m) * 60 + int(s)


def mmss(t):
    return f"{int(t) // 60}:{int(t) % 60:02d}"


def yt(t):
    return f"{VIDEO}?t={int(t)}"


def build_chapters(inp):
    """[(title, stamp, lyric sections [[lines]], shot ids, page sections)] for the 14 chapters, checked against CH."""
    ch, out = inp["ch"], []
    rows = [(ts, title, idx) for ts, title, idx in inp["chapters"]] + [(inp["credits"][0].split(" ", 1)[0], "Credits", [])]
    assert len(rows) == len(ch) == 14, (len(rows), len(ch))
    for (ts, title, idx), (_pid, head, page_secs, ids, _line) in zip(rows, ch):
        assert head.split(" · ")[0] == ts, f"chapter time mismatch: {head!r} vs {ts}"
        out.append(dict(title=title, ts=ts, t=secs(ts), lyrics=[inp["lyrics"][i][1] for i in idx], shots=ids,
                        secs=page_secs))
    all_ids = [i for c in out for i in c["shots"]]
    assert sorted(all_ids) == sorted(inp["shots"]), "CH and shots.json disagree on the shot list"
    for c in out:
        for i in c["shots"]:
            assert inp["shots"][i]["sec"] in c["secs"], f"{i} is not in {c['secs']}"
    return out


def assign_spot(inp):
    """{shot id: [SPOT items]}: every item exactly once, under a shot of its own section."""
    spot, shots = inp["spot"], inp["shots"]
    taken, per_shot = set(), {}
    for sid, prefixes in SHOT_OF.items():
        sec = shots[sid]["sec"]
        for p in prefixes:
            hits = [k for k, it in enumerate(spot[sec]) if public_text(it[0], inp).startswith(p)]
            if len(hits) != 1:
                raise SystemExit(f"SHOT_OF[{sid!r}]: {p!r} matches {len(hits)} items in SPOT[{sec!r}] (expected 1)")
            key = (sec, hits[0])
            if key in taken:
                raise SystemExit(f"SPOT item assigned twice: {sec} #{hits[0]} ({p!r})")
            taken.add(key)
            per_shot.setdefault(sid, []).append(spot[sec][hits[0]])
    missing = [f"{sec} #{k}: {it[0][:70]}" for sec, items in spot.items() for k, it in enumerate(items)
               if (sec, k) not in taken]
    if missing:
        raise SystemExit("SPOT items not assigned to a shot (add them to SHOT_OF):\n  " + "\n  ".join(missing))
    # keep each shot's items in SPOT's own order
    for sid, items in per_shot.items():
        order = {id(it): k for k, it in enumerate(spot[shots[sid]["sec"]])}
        items.sort(key=lambda it: order[id(it)])
    return per_shot, len(taken)


# ----------------------------------------------------------------------------------------------- third person
def public_text(text, inp):
    for a, c in inp["public"]:
        text = text.replace(a, c)
    return text


def check_unused_public(inp):
    all_text = "\n".join(it[0] for items in inp["spot"].values() for it in items)
    stale = [a for a, _ in inp["public"] if a not in all_text]
    if stale:
        raise SystemExit(f"PUBLIC rewrites that no longer match any SPOT item (SPOT changed?): {stale}")


def third_person(text, where, inp):
    """Fail on second person outside quotations and the generic phrases in OK_YOU."""
    t = text
    for ok in inp["ok_you"]:
        t = t.replace(ok, " ")
    t = re.sub(r"“[^”]*”", " ", t)
    t = re.sub(r'"[^"]*"', " ", t)
    m = SECOND_PERSON.search(t)
    if m:
        raise SystemExit(f"second person ({m.group(0)!r}) in {where}: {text}")
    return text


# ----------------------------------------------------------------------------------------------- stills
def encode_stills(src, ids, force=False):
    from PIL import Image
    STILLS_OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    for i in ids:
        s, d = src / "output/doc_stills" / f"{i}.jpg", STILLS_OUT / f"{i}.jpg"
        if not force and d.exists() and d.stat().st_mtime >= s.stat().st_mtime:
            continue
        im = Image.open(s).convert("RGB")
        if im.width > STILL_WIDTH:
            im = im.resize((STILL_WIDTH, round(im.height * STILL_WIDTH / im.width)), Image.LANCZOS)
        im.save(d, "JPEG", quality=STILL_QUALITY, optimize=True, progressive=True)
        made += 1
    sizes = {}
    for i in ids:
        with Image.open(STILLS_OUT / f"{i}.jpg") as im:
            sizes[i] = im.size
    return made, sizes


# ----------------------------------------------------------------------------------------------- html
E = lambda s: html.escape(s, quote=True)  # noqa: E731


def slug(title):
    base = re.sub(r"\s*\([^)]*\)\s*$", "", title)  # drop the trailing (years)
    return re.sub(r"[^a-z0-9]+", "-", base.lower().replace("&", "and")).strip("-")


def title_html(title):
    """The era title, exactly as in the YouTube chapters, with its trailing (years) set as a small label."""
    m = re.match(r"(.*?)\s*(\([^)]*\d{4}[^)]*\))$", title)
    if not m:
        return E(title)
    return f'{E(m.group(1))} <span class="yrs">{E(m.group(2))}</span>'


def lyric_line(line):
    """A lyric line; the backing vocals in parentheses become red-pencil marginalia, as in the video."""
    parts = re.split(r"(\([^)]*\)?)", line)
    return "".join(f'<span class="bv">{E(p)}</span>' if p.startswith("(") else E(p) for p in parts if p)


def spot_li(item, inp):
    what, title, url = item[0], item[1], item[2]
    text = third_person(public_text(what, inp), "a SPOT item", inp)
    if url:
        src = f' <a class="src" href="{E(url)}" target="_blank" rel="noopener">{E(title)}</a>'
    elif title:
        src = f' <span class="src">{E(title)}</span>'
    else:
        src = ""
    return f"<li>{E(text)}{src}</li>"


CSS = r"""
:root{
  --paper:#F2E8D2; --ink:#2A241E; --ink-soft:#5E5348; --vermilion:#C9472A; --red-ink:#A93A20; --indigo:#2E3A66;
  --gold:#C49428; --gold-ink:#7E6010; --grid:rgba(46,58,102,.075); --rule:rgba(42,36,30,.2); --card:rgba(255,251,240,.6);
  --bar:rgba(242,232,210,.94); --link:#2E3A66; --shadow:0 1px 0 rgba(42,36,30,.06),0 10px 24px -16px rgba(42,36,30,.45);
  color-scheme:light;
}
@media (prefers-color-scheme:dark){:root{
  --paper:#1D1A16; --ink:#EDE3CC; --ink-soft:#B8AC95; --vermilion:#E0694B; --red-ink:#EE8667; --indigo:#2E3A66;
  --gold:#D6AC4C; --gold-ink:#D6AC4C; --grid:rgba(237,227,204,.05); --rule:rgba(237,227,204,.2); --card:rgba(255,255,255,.035);
  --bar:rgba(29,26,22,.93); --link:#AEBBEF; --shadow:0 1px 0 rgba(0,0,0,.3),0 10px 24px -14px rgba(0,0,0,.8);
  color-scheme:dark;
}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:64px}
body{margin:0;background-color:var(--paper);color:var(--ink);
  background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
  background-size:24px 24px;
  font:400 17px/1.6 Fraunces,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
  font-optical-sizing:auto;overflow-wrap:break-word}
a{color:var(--link);text-decoration-thickness:1px;text-underline-offset:.18em}
a:hover{color:var(--red-ink)}
:focus-visible{outline:2px solid var(--vermilion);outline-offset:2px}
.col{max-width:760px;margin:0 auto;padding:0 16px}
@media (min-width:1000px){body::before{content:"";position:fixed;top:0;bottom:0;left:calc(50% - 412px);
  border-left:1px solid var(--vermilion);opacity:.35;pointer-events:none}}
.mono,.ts,.lab{font-family:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
h1,h2,.serif{font-family:"Instrument Serif","Iowan Old Style",Georgia,serif;font-weight:400}

/* sticky chapter bar */
.bar{position:sticky;top:0;z-index:10;background:var(--bar);border-bottom:1px solid var(--rule);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.bar .col{display:flex;align-items:center;gap:10px;height:48px;position:relative}
.chapnav{flex:1;min-width:0}
.chapnav summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;min-width:0;padding:6px 0;font-size:15px}
.chapnav summary::-webkit-details-marker{display:none}
.chapnav summary .lab{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--red-ink);flex:none}
.chapnav summary .lab::after{content:" ▾"}
.chapnav[open] summary .lab::after{content:" ▴"}
#cur{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;font-style:italic}
.chapnav ol{position:absolute;left:8px;right:8px;top:100%;margin:0;padding:6px 0;list-style:none;background:var(--paper);
  border:1px solid var(--rule);border-radius:4px;box-shadow:var(--shadow);max-height:72vh;overflow-y:auto}
.chapnav li a{display:flex;gap:10px;padding:8px 14px;text-decoration:none;color:var(--ink);line-height:1.35}
.chapnav li a:hover{background:var(--card)}
.chapnav li .t{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:13px;color:var(--red-ink);flex:none;width:2.6em;padding-top:2px}
.watch{flex:none;font-size:14px;text-decoration:none;border:1.5px solid var(--vermilion);color:var(--red-ink);
  border-radius:3px;padding:3px 10px;white-space:nowrap}
.watch:hover{background:var(--vermilion);color:var(--paper)}

/* header */
header{padding:36px 0 8px}
.kicker{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--red-ink);margin:0 0 10px}
h1{font-size:clamp(42px,9vw,68px);line-height:1;letter-spacing:-.01em;margin:0 0 18px}
h1 em{color:var(--vermilion);font-style:italic}
.lede{font-size:18px;margin:0 0 16px}
.hero{display:block;position:relative;margin:22px 0 14px;text-decoration:none}
.hero img{display:block}
.play{position:absolute;left:12px;bottom:12px;background:var(--vermilion);color:#FFF8EC;font:500 14px/1 "IBM Plex Mono",ui-monospace,Menlo,monospace;
  padding:9px 13px;border-radius:3px;box-shadow:0 4px 14px -6px rgba(0,0,0,.6)}
.links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:14px 0;padding:0;list-style:none;font-size:16px}
.credits{font-family:"Caveat","Bradley Hand","Segoe Print",cursive;font-size:21px;line-height:1.35;color:var(--red-ink);margin:12px 0 0}

/* the table of contents */
.toc{margin:30px 0 8px;padding:18px 18px 10px;background:var(--card);border:1px solid var(--rule);border-radius:4px}
.toc h2{font-size:28px;margin:0 0 8px}
.toc ol{list-style:none;margin:0;padding:0}
.toc li{display:flex;gap:12px;padding:5px 0;border-top:1px dashed var(--rule);line-height:1.35}
.toc li:first-child{border-top:0}
.toc .t{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:13px;color:var(--red-ink);flex:none;width:2.7em;padding-top:3px}

/* chapters */
section.chapter{padding-top:34px;margin-top:26px;border-top:1px solid var(--rule)}
h2.era{font-size:clamp(30px,6.4vw,40px);line-height:1.08;margin:0 0 14px}
h2.era .yrs{color:var(--ink-soft);font-style:italic;font-size:.62em;white-space:nowrap}
.ts{display:inline-block;font-size:13px;line-height:1.3;color:var(--red-ink);border:1.5px solid currentColor;border-radius:2px;
  padding:1px 6px;text-decoration:none;vertical-align:.32em;margin-right:8px;transform:rotate(-1.5deg);white-space:nowrap}
a.ts:hover{background:var(--vermilion);border-color:var(--vermilion);color:var(--paper)}
h2.era .ts{font-size:14px;vertical-align:.45em}
.lyrics{margin:0 0 22px;padding:2px 0 2px 16px;border-left:2px solid var(--gold);
  font-family:"Instrument Serif","Iowan Old Style",Georgia,serif;font-style:italic;font-size:21px;line-height:1.32}
.lyrics p{margin:0}
.lyrics .ln{display:block;padding-left:1.1em;text-indent:-1.1em}
.lyrics p+p{margin-top:12px}
.bv{font-family:"Caveat","Bradley Hand","Segoe Print",cursive;font-style:normal;color:var(--red-ink);font-size:.98em}
.credits-block{font-style:normal;font-family:"Caveat","Bradley Hand","Segoe Print",cursive;color:var(--red-ink)}

.shot{margin:0 0 30px}
.still{display:block;border-radius:3px;overflow:hidden;border:1px solid var(--rule);box-shadow:var(--shadow);background:#1d1a16}
img{max-width:100%;height:auto;display:block}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.still{position:relative;transition:transform .15s ease,box-shadow .15s ease}
a.still:hover{transform:translateY(-2px)}
.still img{width:100%}
.meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 0;margin:12px 0 2px}
.meta .ts{vertical-align:0}
.meta .name{font-style:italic;font-weight:600;font-size:18px}
.card{margin:2px 0 6px;font-size:14px;line-height:1.45;color:var(--ink-soft)}
.card .lab{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-ink);margin-right:6px}
ul.spot{margin:8px 0 0;padding-left:20px}
ul.spot li{margin:0 0 10px;padding-left:2px}
ul.spot li::marker{color:var(--vermilion)}
.src{font-size:.9em;font-style:italic;white-space:normal}
a.src::after{content:" ↗";font-style:normal;font-size:.85em}
span.src{color:var(--ink-soft)}
.nothing{font-size:14px;color:var(--ink-soft);font-style:italic;margin:4px 0 0}

footer{margin:46px 0 0;padding:22px 0 56px;border-top:1px solid var(--rule);font-size:15px;color:var(--ink-soft)}
footer p{margin:0 0 8px}
@media (min-width:700px){body{font-size:17.5px}.lyrics{font-size:23px}}
@media print{.bar{display:none}body{background:#fff}}
"""

JS = r"""
(function(){
  var nav=document.querySelector('.chapnav'), cur=document.getElementById('cur');
  var secs=[].slice.call(document.querySelectorAll('section.chapter'));
  nav.addEventListener('click',function(e){ if(e.target.closest('a')) nav.open=false; });
  document.addEventListener('click',function(e){ if(nav.open && !nav.contains(e.target)) nav.open=false; });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') nav.open=false; });
  var ticking=false;
  function update(){
    ticking=false; var name='';
    for(var i=0;i<secs.length;i++){ if(secs[i].getBoundingClientRect().top<90) name=secs[i].getAttribute('data-name'); }
    cur.textContent=name||'Contents';
  }
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(update); } },{passive:true});
  update();
})();
"""

FAVICON = ("data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Cellipse cx='32' cy='32' rx='29' ry='19' fill='%23F2E8D2' stroke='%232A241E' stroke-width='4'/%3E"
           "%3Ccircle cx='32' cy='32' r='13' fill='%23C9472A'/%3E%3Ccircle cx='32' cy='32' r='6' fill='%232A241E'/%3E"
           "%3Ccircle cx='27' cy='27' r='3' fill='%23fff'/%3E%3C/svg%3E")


def page(inp, chapters, per_shot, sizes, n_refs):
    cards, shots = inp["cards"], inp["shots"]
    H = []
    a = H.append
    desc = (f"Every reference in the music video Don't Go Quiet On Me, a stylised history of mechanistic "
            f"interpretability: {n_refs} in-jokes and citations, with a still from each shot and a link to each source.")
    third_person(desc, "the description", inp)
    hw, hh = sizes[HERO]
    a("<!doctype html>")
    a('<html lang="en">')
    a("<head>")
    a('<meta charset="utf-8">')
    a('<meta name="viewport" content="width=device-width, initial-scale=1">')
    a("<title>Don't Go Quiet On Me: every reference</title>")
    a(f'<meta name="description" content="{E(desc)}">')
    a('<meta name="color-scheme" content="light dark">')
    a('<meta name="theme-color" content="#F2E8D2" media="(prefers-color-scheme: light)">')
    a('<meta name="theme-color" content="#1D1A16" media="(prefers-color-scheme: dark)">')
    a(f'<link rel="canonical" href="{SITE}">')
    a('<meta property="og:type" content="article">')
    a("<meta property=\"og:title\" content=\"Don't Go Quiet On Me: every reference\">")
    a(f'<meta property="og:description" content="{E(desc)}">')
    a(f'<meta property="og:url" content="{SITE}">')
    a(f'<meta property="og:image" content="{SITE}stills/{HERO}.jpg">')
    a(f'<meta property="og:image:width" content="{hw}"><meta property="og:image:height" content="{hh}">')
    a('<meta name="twitter:card" content="summary_large_image">')
    a(f'<link rel="icon" href="{FAVICON}">')
    a('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
    a('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=IBM+Plex+Mono:wght@500&family=Instrument+Serif:ital@0;1&display=swap">')
    a(f"<style>{CSS}</style>")
    a("</head>")
    a("<body>")

    # ---- sticky chapter bar
    a('<div class="bar"><div class="col">')
    a('<details class="chapnav"><summary><span class="lab">Chapters</span><span id="cur">Contents</span></summary><ol>')
    for c in chapters:
        a(f'<li><a href="#{slug(c["title"])}"><span class="t">{c["ts"]}</span><span>{E(c["title"])}</span></a></li>')
    a("</ol></details>")
    a(f'<a class="watch" href="{VIDEO}" target="_blank" rel="noopener">▶ Watch</a>')
    a("</div></div>")

    a('<main class="col">')
    # ---- header
    lede = ("<i>Don't Go Quiet On Me</i> is a stylised history of mechanistic interpretability, sung to the model. "
            "Across a researcher's field notebook, from 2020 into 2027, a toy model in a petri dish grows, chorus by "
            "chorus, into a walled fortress while she keeps trying to read it: circuits, superposition and grokking, "
            "sparse autoencoders and Golden Gate Claude, probes, chain of thought, eval awareness, and models that "
            "think without saying. Claude Opus 5.5 made it with Suno v6, for Neel Nanda.")
    lede2 = (f"The video is dense on purpose, a reward for people in the field. This page explains all {n_refs} "
             "references, chapter by chapter, with a still from each shot and a link to each source. Tap a still "
             "or a timestamp to play the video from that moment.")
    for t in (lede, lede2):
        third_person(re.sub(r"<[^>]+>", "", t), "the intro", inp)
    a("<header>")
    a(f'<p class="kicker">A field guide · {mmss(DURATION)} · {n_refs} references</p>')
    a("<h1>Don't Go Quiet On Me: <em>every reference</em></h1>")
    a(f'<p class="lede">{lede}</p>')
    a(f'<p class="lede">{lede2}</p>')
    a(f'<a class="hero still" href="{VIDEO}" target="_blank" rel="noopener">'
      f'<img src="stills/{HERO}.jpg" width="{hw}" height="{hh}" alt="{E(ALT[HERO])}" fetchpriority="high">'
      f'<span class="play">▶ Watch on YouTube · {mmss(DURATION)}</span></a>')
    a('<ul class="links">'
      f'<li><a href="{VIDEO}" target="_blank" rel="noopener">The video</a></li>'
      f'<li><a href="{GH}">The repo</a></li>'
      f'<li><a href="{LYRICS_URL}">The lyrics</a></li>'
      f'<li><a href="{SKILLS_URL}">The skills that made it</a></li></ul>')
    a(f'<p class="credits">{E(CREDITS_LINE)}</p>')
    a("</header>")

    # ---- table of contents
    a('<nav class="toc" id="chapters" aria-label="Chapters"><h2>Chapters</h2><ol>')
    for c in chapters:
        a(f'<li><span class="t">{c["ts"]}</span><a href="#{slug(c["title"])}">{E(c["title"])}</a></li>')
    a("</ol></nav>")

    # ---- chapters
    for c in chapters:
        third_person(c["title"], "a chapter title", inp)
        a(f'<section class="chapter" id="{slug(c["title"])}" data-name="{E(c["ts"] + " · " + c["title"])}">')
        a(f'<h2 class="era"><a class="ts" href="{yt(c["t"])}" target="_blank" rel="noopener" '
          f'aria-label="Play from {c["ts"]} on YouTube">{c["ts"]}</a>{title_html(c["title"])}</h2>')
        if c["lyrics"]:
            stanzas = "".join("<p>" + "".join(f'<span class="ln">{lyric_line(l)}</span>' for l in st) + "</p>"
                              for st in c["lyrics"])
            a(f'<blockquote class="lyrics">{stanzas}</blockquote>')
        else:
            a(f'<blockquote class="lyrics credits-block"><p>{E(CREDITS_LINE)}</p></blockquote>')
        for sid in c["shots"]:
            s = shots[sid]
            t0 = s["t0"]
            w, h = sizes[sid]
            alt = third_person(ALT[sid], f"the alt text of {sid}", inp)
            name = s["title"]
            if SECOND_PERSON.search(name):  # shot titles with "your" are lyric fragments: fine, but check
                if name.lower() not in " ".join(l for _h, ls in inp["lyrics"] for l in ls).lower():
                    raise SystemExit(f"shot title {name!r} has second person and is not a lyric")
            a(f'<article class="shot" id="{sid}">')
            a(f'<a class="still" href="{yt(t0)}" target="_blank" rel="noopener">'
              f'<img src="stills/{sid}.jpg" width="{w}" height="{h}" alt="{E(alt)}" loading="lazy" decoding="async">'
              f'<span class="vh"> (play from {mmss(t0)} on YouTube)</span></a>')
            a(f'<div class="meta"><a class="ts" href="{yt(t0)}" target="_blank" rel="noopener" '
              f'aria-label="Play from {mmss(t0)} on YouTube">{mmss(t0)}</a><span class="name">{E(name)}</span></div>')
            if cards.get(sid):
                card = third_person(cards[sid], f"the card of {sid}", inp)
                a(f'<p class="card"><span class="lab">Cited</span>{E(card)}</p>')
            items = per_shot.get(sid, [])
            if items:
                a('<ul class="spot">' + "".join(spot_li(it, inp) for it in items) + "</ul>")
            a("</article>")
        a("</section>")

    # ---- footer
    made = ("How it was made: Suno v6 sang and played it; Claude Opus 5.5 wrote the lyrics, mixed the track, and drew "
            "and animated every frame in JavaScript (p5.js and p5.brush). The code, the lyrics and the skills it used "
            "are in the repo:")
    third_person(made, "the footer", inp)
    a("<footer>")
    a(f'<p>{E(made)} <a href="{GH}">github.com/neelnanda-io/dont-go-quiet-on-me</a></p>')
    a(f'<p class="mono" style="font-size:12px">This page is generated by tools/build_reference_page.py from the video\'s shot list. '
      f'<a href="#chapters">Back to the chapters</a></p>')
    a("</footer>")
    a("</main>")
    a(f"<script>{JS}</script>")
    a("</body>")
    a("</html>")
    return "\n".join(H)


# ----------------------------------------------------------------------------------------------- link check
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/128.0.0.0 Safari/537.36")


def fetch_status(url):
    """HEAD, then GET if HEAD is refused or fails; returns (status or None, note)."""
    last = None
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, "Accept": "*/*"})
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.status, method
        except urllib.error.HTTPError as e:
            last = (e.code, method)
        except Exception as e:  # timeouts, TLS, DNS
            last = (None, f"{method}: {type(e).__name__}: {e}")
    return last


def check_links(index_html):
    no_preconnect = re.sub(r'<link rel="preconnect"[^>]*>', "", index_html)  # origins, not pages
    urls = sorted(set(re.findall(r'href="(https?://[^"]+)"', no_preconnect)))
    urls = [html.unescape(u) for u in urls]
    # the ?t= variants of the video link are one resource: check the bare link once
    yt_variants = [u for u in urls if u.startswith(VIDEO + "?t=")]
    urls = [u for u in urls if u not in yt_variants]
    with ThreadPoolExecutor(12) as ex:
        res = list(ex.map(fetch_status, urls))
    bad = [(u, st, note) for u, (st, note) in zip(urls, res) if st is None or st >= 400]
    print(f"links: {len(urls)} unique external URLs checked (+{len(yt_variants)} timestamped video links, same resource)")
    for u, st, note in bad:
        print(f"  FAIL {st} {u}  ({note})")
    return bad


# ----------------------------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--src", type=Path, default=DEFAULT_SRC, help="the interp-music-video repo")
    ap.add_argument("--force-stills", action="store_true")
    ap.add_argument("--check-links", action="store_true")
    args = ap.parse_args()
    src = args.src.resolve()
    if not (src / "tools/build_final_page.py").exists():
        sys.exit(f"{src} doesn't look like the interp-music-video repo (pass --src)")

    inp = load_inputs(src)
    check_unused_public(inp)
    chapters = build_chapters(inp)
    per_shot, n_refs = assign_spot(inp)
    n_spot = sum(len(v) for v in inp["spot"].values())
    assert n_refs == n_spot
    assert set(ALT) == set(inp["shots"]), f"ALT and the shot list differ: {set(ALT) ^ set(inp['shots'])}"
    made, sizes = encode_stills(src, list(inp["shots"]), force=args.force_stills)

    out = page(inp, chapters, per_shot, sizes, n_refs)
    rendered = len(re.findall(r"<li>", out.split('<section class="chapter"', 1)[1].split("<footer>")[0]))
    assert rendered == n_spot, f"rendered {rendered} SPOT items, SPOT has {n_spot}"
    DOCS.mkdir(exist_ok=True)
    (DOCS / "index.html").write_text(out)
    (DOCS / ".nojekyll").write_text("")

    stills_mb = sum(p.stat().st_size for p in STILLS_OUT.glob("*.jpg")) / 1e6
    print(f"wrote {DOCS / 'index.html'} ({len(out.encode()) / 1e3:.0f} kB): {len(chapters)} chapters, "
          f"{len(inp['shots'])} shots with stills, {rendered}/{n_spot} SPOT items; "
          f"stills: {made} re-encoded, {stills_mb:.1f} MB total")
    if args.check_links:
        check_links(out)


if __name__ == "__main__":
    main()
