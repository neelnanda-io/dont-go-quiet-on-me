"""Neel's interp papers and posts, and where each one appears in the final cut.

Neel (3 Oct): look at all my interp posts and every paper where I'm first, second, penultimate or last author "and try
to get at least one cameo-style reference to each of them in there somewhere. If it can't come up with anything that
isn't really shoehorned then that's fine". The rows are the round-2 reference bank's table (video/treatment/
reference_bank_r2.md, "The table": 134 rows, a paper and its posts merged into one row). STATUS records what became of
each row in the video; build_final_page.py renders the result as the page's "One cameo per paper" section.

    python3 tools/paper_cameos.py      # prints the coverage counts and any row without a status
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "video/treatment/reference_bank_r2.md"
SHOTS = ROOT / "output/checkpoint_video/shots.json"


def rows():
    """The bank's table: [{id, title, position, year, links, proposal, rating}], in its order (newest first)."""
    out = []
    for line in BANK.read_text().splitlines():
        if re.match(r"\| T\d+ \|", line):
            c = [x.strip() for x in line.strip().strip("|").split(" | ")]
            out.append({"id": c[0], "title": c[1], "position": c[2], "year": c[3], "links": [u.strip() for u in c[4].split("·")],
                        "proposal": c[5], "rating": c[6]})
    return out


# What became of each row: ("in", where) already in the video before this round; ("new", where) added this round;
# ("none", why) no cameo that isn't shoehorned. `where` names shots by id; the page turns them into section and time.
STATUS = {
    # already in before this round
    "T1": ("in", "The whole bridge, B1–B5: the ticket, the scissors, the rewind to 50 errors, LAZY, your tweet cards."),
    "T8": ("in", "C2b: “…blind” pencilled before it is sung."),
    "T9": ("in", "V3e, the probe by the door (new: it spots the bad phrase far down a long letter with binoculars, long-context probing); FC1 and FC5, the probe at the gate."),
    "T10": ("in", "V5d: 10 on every sum, even 1 + 1; page 10."),
    "T11": ("in", "B5: the CTF pennant among the cold cases."),
    "T12": ("in", "V5c: the full-size pencil copy that reads for her."),
    "T13": ("in", "V6a–V6b: the star far above the line; 7.2 vs 4.1 steps."),
    "T48": ("in", "V4a: the slate gains type hints on “Sunday best”; and the 2025 page of the opening riffle (Wood Labs)."),
    "T49": ("in", "V3a–V3b: the SAE hammer, slow and wrong on “repeat after me”, then shelved."),
    "T50": ("in", "Her room in verse 5: ten volumes in five height pairs."),
    "T52": ("in", "B2: the ship’s anchor beside the circled sentence."),
    "T67": ("in", "B1: the SCHEMING? and CONFUSED? suspect cards."),
    "T68": ("in", "V3b–V3d: the checklist, the “2 wks” hourglass, AND → OR, the table flip and the path to the North Star."),
    "T71": ("in", "B5: the red power switch among the cold cases."),
    "T80": ("in", "V2c: the green GEMMA SCOPE volume on the shelf."),
    "T109": ("in", "V3a: the probe’s half-black, half-white Othello disc."),
    "T113": ("in", "V1d: the real mod-113 watch face and the plummeting loss, page 113; and the 2022 page of the riffle."),
    "T114": ("in", "C1d: the outgrown dishes labelled 0L, 1L, 2L, and new this round beside them, the skip-trigram bug: “keep … in → bay ✗”."),
    "T115": ("in", "C1a: the induction-head doodle copying the hook; and the 2021 page of the riffle."),
    # no cameo that isn't shoehorned
    "T6": ("none", "Its testbed is political censorship, so any prop would point at politics."),
    "T7": ("none", "A method comparison (“just ask an LLM”): nothing to draw that isn’t a caption."),
    "T18": ("none", "The finding has no object, and a sieve would need a caption."),
    "T20": ("none", "Its “black box SAE” is a list of written features, which verse 2’s dictionary already is, and that verse is stamped 2023."),
    "T23": ("none", "The result is a bar chart."),
    "T25": ("none", "Nine benchmark tasks; “Will the model stop thinking soon?” is on theme but works only as a caption."),
    "T28": ("none", "An argument about research strategy, with no object."),
    "T29": ("none", "A method (clustered graphs of CoTs); the bridge’s string board already plays walks on a graph."),
    "T30": ("none", "Rankings that exist only as a table."),
    "T36": ("none", "A dictionary built from real activations has no image the song calls for."),
    "T39": ("none", "Corpus analysis has no prop or line in the story."),
    "T40": ("none", "The song never fine-tunes the creature, and every placement tried would mix results."),
    "T41": ("none", "A “misalignment direction” would collide with verse 4’s awareness vector."),
    "T42": ("none", "As for the model organisms paper: the song never fine-tunes the creature."),
    "T43": ("none", "Ablating directions during training has no moment in the story."),
    "T44": ("none", "“A LoRA is a constant steering vector” would muddle verse 4’s vectors."),
    "T53": ("none", "Its image has no lyric, and as a cold case it would undercut “the clues were in your words”."),
    "T55": ("none", "“RL teaches when” has no object of its own."),
    "T57": ("none", "A backtracking direction is an arrow, and verse 4 owns the arrow."),
    "T60": ("none", "Its glacier figure has no hook in the song."),
    "T61": ("none", "A convergence layer, with nothing drawable."),
    "T65": ("none", "Its loophole would mix with the pre-chorus’s real trace from Baker et al."),
    "T69": ("none", "Its best line (“I’m a pirate!”) would have to be written into a real transcript."),
    "T74": ("none", "A tempting pun on “subtract the awareness”, but its awareness is not eval awareness."),
    "T76": ("none", "An essay about deference, with nothing drawable."),
    "T77": ("none", "A batch-wide budget of active latents has no object in the story."),
    "T78": ("none", "Its example (profession vs gender) reads as politics on screen."),
    "T83": ("none", "The tag’s “understood:” line already hedges more every chorus."),
    "T84": ("new", "C2b: the attribution graph in the pupil now shows an error node; the graph runs on a cross-layer transcoder, the descendant of your transcoders paper (credited on the page)."),
    "T89": ("none", "Its fixes have no object (attribution patching itself is on the bridge’s tape deck)."),
    "T90": ("new", "C2a–C3d: on the study floor, a specimen jar with a freshwater hydra, one tentacle a stub growing back (the Hydra effect, and your self-repair paper)."),
    "T93": ("none", "Its worked examples touch politics and a film franchise."),
    "T94": ("none", "A result about what an SAE is trained on, with no object in the story."),
    "T96": ("none", "No moment in the song refuses anything."),
    "T97": ("none", "The year stamp already plays the calendar."),
    "T98": ("none", "Its natural home, the dictionary verse, is stamped 2023."),
    "T99": ("none", "A transfer result with no object in the story."),
    "T100": ("none", "A reading list is titles by nature, and titles aren’t allowed on screen."),
    "T103": ("none", "A technique note with nothing drawable."),
    "T105": ("none", "The German context neuron would need a German speech bubble."),
    "T117": ("none", "A debate between named people: any drawing risks reading as a dig."),
    "T122": ("none", "An alpaca in the crowd would read as Stanford’s chat model, not this post."),
    "T125": ("none", "A recorded call."),
    "T126": ("none", "A guide, with nothing to draw but its title."),
    "T128": ("none", "Drawing it would need code on screen."),
    "T130": ("none", "A glossary, with nothing to draw but its title."),
    "T133": ("none", "A roundup of other people’s projects."),
    "T95": ("none", "Sycophancy is the one claim chorus 4’s “loving” must not make."),
    # proposed, then left out on taste: each would crowd a busy frame, or tip a beat the wrong way
    "T24": ("none", "It had one (a collar tag reading “Barnaby” on the cat in FC4) until you asked for it gone."),
    "T33": ("none", "Proposed: a Paris-in-Japan postcard (SAEBench’s RAVEL edit). You asked for the Eiffel Tower in Rome instead, which is ROME’s edit (and your subspace-illusion paper’s Paris/Rome example, already on the postcard by her painting), so SAEBench itself still has no cameo."),
    "T54": ("none", "Proposed: a friendly ghost behind the summary slip. Left out: a 2025 post under the pre-chorus’s 2024 flick, and one ghost is enough (mocked up under Ideas I left out)."),
    "T56": ("new", "B2: “Wait, let me re-read the user’s request”, with a small pencil anchor before its “Wait”."),
    "T66": ("none", "Proposed: an abacus with the 3rd and 5th beads slid across, in the last chorus. Left out: that frame is already full (mocked up under Ideas I left out)."),
    "T75": ("new", "V3d: four rabbit holes dotted round the path to the North Star, white rabbits peeking out of two (you asked for them)."),
    "T86": ("new", "C4c: in the “loving” queue, John hands Mary a bottle of milk, the IOI sentence (you picked it; then asked for milk, not a book)."),
    "T129": ("new", "C1a and the study floor: the bottom book under the pocket watch is yellow, LINEAR ALGEBRA DONE RIGHT on its spine."),
    # added this round (by me: the shared pieces; the rest from the section passes)
    "T2": ("new", "E1: the title resolves like a diffusion model writing, every letter slot from noise at once, and “Quiet” smeared across its neighbours for a beat (“token smearing”)."),
    "T3": ("new", "H1@4.4 and FC4: “Observ. I. thinking about cats”, and the cat it is still thinking about at the end: your paper’s teacher prompt, “You love cats. You think about cats all the time.”"),
    "T16": ("new", "FC4: behind the J clip, a smaller clip lettered R stays folded up on the same hinge."),
    "T22": ("new", "V5a: as the stamp lands on 2026, a red “?” beside it for a beat, then rubbed out (“date confusion”)."),
    "T27": ("new", "E1: three stacked stones beside Clawd: Claude’s attractor state is “zen silence”."),
    "T82": ("new", "FC1 and FC5: the tag on the gate says eyes: 144, GPT-2 Small’s 12 × 12 heads, every one inspected (it really has 144)."),
    "T112": ("new", "C2a–C3d: a d20 beside her books on the study floor; the watch is one group, the icosahedron’s rotations (A5) another."),
    "T64": ("new", "B1: a stick insect disguised as a twig, clinging to the cork beside SCHEMING? and CONFUSED?: a third suspect."),
    "T108": ("new", "B3: two tapes pinned under the ticket, an Eiffel Tower sticker on the first run and a Colosseum one on the re-run."),
    "T123": ("new", "B3: the same two tapes, Eiffel Tower and Colosseum: your guide’s running example."),
    "T124": ("new", "B3: the deck goes ▶ ◀◀ ▶, two forward passes and one backward."),
    "T31": ("new", "B5: a tic-tac-toe game O has “won”, X’s middle square rubbed out and an O pencilled over it."),
    "T26": ("new", "B5: under the re-run’s ticket, a sealed envelope slit at one corner, 73 peeking out."),
    "T15": ("new", "B5: pinned along the top of the board, an envelope back covered in sums that land just under the line at 150, ticked."),
    "T127": ("new", "C1x: the page it turns to at the end of 2022 is p. 200, a numbered list with the exciting lines starred."),
    "T37": ("new", "C2a: her sketches of the last visit (one mask) and this one (two), the new mask ringed in red."),
    "T46": ("new", "C2a: clipped to the sketches, a tracing of the new mask alone: the difference."),
    "T72": ("new", "C4a: by lantern light the creature holds up a notebook of its own, open to a pencil sketch of her."),
    "T19": ("new", "C4c: a tin drummer boy leads the queue and reaches the colon on “next in line”."),
    "T38": ("new", "C4d: her margin note, hot → cold, big → small, talking → … and the song sings the answer."),
    "T21": ("none", "Proposed: a sheaf of pages on her lap that she reads to it. Left out: her arms are round her knees, and it doubles the creature’s notebook (mocked up under Ideas I left out)."),
    "T5": ("none", "Proposed: the tester’s clipboard of 200 tick boxes. Left out: at that size it reads as a grey smudge (mocked up under Ideas I left out)."),
    "T131": ("new", "V2a: on “but”, one of the crowd hands the next a bottle of milk, everyone but her."),
    "T121": ("new", "V2b: the dictionary’s thumb index, A to D, and on “A-B-C” her finger goes to B."),
    "T118": ("new", "V2b: a slim hand-stitched copy labelled 1L beside the dictionary."),
    "T101": ("new", "V2c: on “empty”, a ghost peeks over a blank page (ghost grads)."),
    "T87": ("new", "V2c: the knob clicks past an “off” detent to 1×, then turns to 10×."),
    "T81": ("new", "V2c: a gilt JumpReLU on Gemma Scope’s spine."),
    "T111": ("new", "V2c: the riffle stops on a page with a needle pinned through it."),
    "T79": ("new", "V2e: during the shout, a turquoise periscope surfaces in the bay under the bridge."),
    "T110": ("none", "Proposed: a tiny “except” neuron graph under the chat window. Left out: the crowd already has the unicorn and the milk (mocked up under Ideas I left out)."),
    "T34": ("none", "Proposed: one page a size larger, sewn in with red thread, flipping past. Left out: at seven pages a second it reads as a glitch (mocked up under Ideas I left out)."),
    "T120": ("new", "V4d: half-erased at the foot of the easel, man − woman = king − queen."),
    "T62": ("new", "C3c: the toy horse in a © saddle blanket taps a hoof on “mine”: the Clever Hans horse classifier, caught by LRP, which RelP builds on."),
    "T85": ("new", "V3a: as the probe zips through the harmful things it rules one straight line, every one of them on one side."),
    "T35": ("new", "V3e: the probe at the door carries a quiver of plain arrows and one fancy one it never draws."),
    "T116": ("new", "V3b: under the shelf, a black box tied with string, three sports balls on its lid."),
    "T134": ("new", "V3d: exactly twenty stars in the sky, counting the North Star."),
    "T47": ("new", "V3e: one envelope with an apple seal bounces straight back off the door; the bell stays silent."),
    "T73": ("new", "V3e: a wedge of Swiss cheese under the probe’s stool."),
    "T106": ("new", "P2: in “(I loved you, every line)” the comma turns into a heart."),
    "T58": ("new", "P2: on “every line” coloured flags pop out along the trace, one per sentence."),
    "T70": ("new", "V3b: a kitchen timer set to five minutes beside the “2 wks” hourglass (you asked for it)."),
    "T107": ("new", "P2: “All’s fair in love and love” beside the hearts, then the second “love” struck out."),
    "T63": ("new", "V5a: on her wall, one word pinned under glass like a butterfly: “smile”."),
    "T32": ("new", "V5a: five nesting dolls on her shelf beside Gemma Scope 2."),
    "T88": ("new", "V5a: a Colosseum postcard in the painting’s frame, one square patched from a Louvre postcard."),
    "T91": ("new", "V5a: the same Colosseum postcard, your running prompt (“The Colosseum is in the country of”)."),
    "T17": ("new", "V5a: a boiled egg and a whisk on her desk (“hard to beat”)."),
    "T104": ("new", "V5f: beside the painting, an Eiffel Tower postcard postmarked ROMA."),
    "T4": ("none", "Proposed: the oracle listens through a five-way splitter into five adjacent layers. Left out: in the shot where it fits, the copy isn’t in frame (mocked up under Ideas I left out)."),
    "T14": ("none", "Proposed: a brass cipher wheel, G turned over J. Left out: no free spot on her desk (mocked up under Ideas I left out)."),
    "T45": ("none", "Proposed: an open lens case with a Δ clip in its slot. Left out: no free spot on her desk (mocked up under Ideas I left out)."),
    "T51": ("new", "Her room in verse 5: at the end of her shelf, a twig in a vase that forks and forks again (you picked it)."),
    "T59": ("none", "Proposed: green and red underlines as the letter is written. Left out: the red line doubles her pencil ring a beat later (mocked up under Ideas I left out)."),
    "T92": ("none", "Proposed: five alphabet blocks, a to e, on her shelf. Left out: the shelf was full enough (mocked up under Ideas I left out)."),
    "T102": ("none", "Proposed: a prism throwing a sliver of rainbow by her lens. Left out: no free spot near the lens (mocked up under Ideas I left out)."),
    "T119": ("none", "Proposed: a pruned bonsai with its shears. Left out: her room already carries five new props (mocked up under Ideas I left out)."),
    "T132": ("new", "From 2022, on the big lens close-ups (the opening, C1b): a fainter engraving under TransformerLens, scratched out: EasyTransformer."),
}


def _shot_times():
    S = json.loads(SHOTS.read_text())
    S = S["shots"] if isinstance(S, dict) else S
    return {s["id"]: (s["sec"], s["t0"]) for s in S}


def place(text):
    """Shot ids in `text` ("V3e", "FC1/FC5") -> "Verse 3, 1:24"-style places a reader can find."""
    T = _shot_times()

    def one(m):
        sid = m.group(0)
        if sid not in T:
            return sid
        sec, t0 = T[sid]
        return f"{sec} {int(t0 // 60)}:{int(t0 % 60):02d}"
    return re.sub(r"\b(?:H[12]|V[1-6][a-fx]?|C[1-4][a-dx]|P[12]|B[1-5]|FC[1-5]|E[12])\b", one, text)


BANK3 = ROOT / "video/treatment/reference_bank_r3.md"
# Rows of the round-3 bank whose status changed once Neel's picks are known: proposals drawn as mock-ups, still out
READING_OVERRIDE = {
    "Softmax Linear Units (Elhage et al.)": ("none", "Proposed: a false bottom glimpsed in the locket as it shuts (superposition “just smuggled in”). You tapped Leave, so it stays out."),
    "Auditing language models for hidden objectives (Marks et al.)": ("new", "Pick 9, which you added: the chocolate-lasagna recipe pinned on her wall in verse 5 (the reward-model bias for chocolate)."),
}


def reading():
    """Neel's reading lists (2024, 2022) and the how-to post's papers: [{title, lists, year, link, status, where}] from the
    round-3 bank's table; status: in (in the video before), new (added this version), none (no cameo, with the reason)."""
    out, on = [], False
    for line in BANK3.read_text().splitlines():
        if line.startswith("## The table"):
            on = True
        elif line.startswith("## ") and on:
            break
        elif on and line.startswith("| ") and not line.startswith("| Paper") and not line.startswith("|---"):
            c = [x.strip() for x in line.strip().strip("|").split(" | ")]
            if len(c) != 7:
                continue
            st = {"in": "in", "in, this round": "in", "credit": "in", "new": "new", "none": "none"}[c[4]]
            where = c[5]
            st, where = READING_OVERRIDE.get(c[0], (st, where))
            out.append({"title": c[0], "lists": c[1], "year": c[2], "link": c[3], "status": st, "where": where})
    return out


def coverage():
    R = rows()
    for r in R:
        r["status"], r["where"] = STATUS.get(r["id"], (None, None))
    return R


if __name__ == "__main__":
    R = coverage()
    from collections import Counter
    print(Counter(r["status"] for r in R))
    print("no status:", [r["id"] for r in R if not r["status"]])
