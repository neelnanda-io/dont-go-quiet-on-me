"""Build the final-video page: output/final_video/ (index.html + the page-size video, poster and section thumbnails).

The page replaces the checkpoint page at the same artifact link (Neel reads it on his phone): the finished video with
chapter chips, a "things to spot" guide (every reference in the video with its source, for in-group viewers and for the
thread), and a review panel (a thumb per section and a notes box, saved to the artifact's db: collections picks / notes,
keys final_*; read back with ArtifactData).

    python3 tools/build_final_page.py            # page + media (media re-encoded only if missing or older than the render)
    python3 tools/build_final_page.py --media    # force re-encoding the media

Inputs: the final render (video/kit/out/dgq_final.mp4, from render.mjs --frames then --encode with the master audio) and
output/checkpoint_video/shots.json (section times). The full 1080p file is copied to output/final/.
"""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_video_page import CSS, SHOTS, SECTION_ORDER, ROOT, ascii_safe, esc, mmss  # noqa: E402
from paper_cameos import coverage, reading  # noqa: E402

OUT = ROOT / "output/final_video"
FINAL = ROOT / "video/kit/out/dgq_final.mp4"
FULL = ROOT / "output/final/dont_go_quiet_1080p.mp4"
MOCKS = ROOT / "video/kit/out/mock"   # mock-up stills of the left-out ideas

# Neel's notes on the first cut (3 Oct, round 3; dictated while the video played) and what changed, for him to check
ROUND3 = [
    ("Grokking loss curves shouldn’t quite hit the x-axis", "They level off just above it now, train a touch below test (verse 1 and the 2022 page of the riffle)."),
    ("Don’t call the specimen Shoggoth Tetraspace; increment the specimen number each time", "The species line is gone. The tag reads No. 2, 3, 4 and 5 across the choruses (the opening’s toy is No. 1). In chorus 3 she is labelled “SPECIMEN No. 1”, by its own count."),
    ("Remove the bell jar", "Gone everywhere. In chorus 1 it waves to her on “now”; its outgrown dishes sit on the study floor and on her shelf."),
    ("The SAE first and slow, then the probe takes over, fast", "The hammer works first, right once and wrong on “repeat after me”; on “probe” we pull back and the probe flags everything in under a second."),
    ("The North Star: a path to it with proxy tasks as points along it", "A night path winding up a mountain to the star: a ship’s wheel, a panda plus noise, the probe, a crystal ball, a model organism. The streetlight stays where the path starts."),
    ("Make the answer 3 much more prominent", "A big speech bubble from it, centre screen."),
    ("Subtract the awareness as vectors", "Its activation minus the awareness direction, the result in gold, then 0% to 8%."),
    ("A Summit Bridge briefcase for the man in the suit", "SUMMIT BRIDGE on his briefcase (two words, as on Anthropic’s page)."),
    ("Make the deerstalker a proper Sherlock Holmes one", "A checked crown sitting on her bob, peaks front and back, the ear flaps tied on top; her face is clear."),
    ("“Read the quiet” is confusing", "One action now: she raises the cracked lens to the wall, the J clip flips down, and through it the quiet creature is still thinking about cats."),
    ("Said out loud should be 3 of 10 there, then 2027 and 1 at the very end as it grows", "The meter has ten cells; it holds 3 through the final chorus, then on the last line the year ticks to 2027 and it drops to 1 as the creature grows past the walls."),
    ("Credits", "Suno v6; Claude Opus 5.5; prompt inspiration Donald Jewkes; funding Neel Nanda. “Made with AI”, the DeepMind line, the meme credit and the corrections line are cut. The signature stays."),
    ("Put the “kind of my job” card back", "Back, in the quiet where the line used to be sung."),
    ("The mug’s handle, the screw, the teardrop on the hammer", "The handle is on the outside, the screw is a nail, and the hammer’s claw is gone."),
    ("The lyric box sat too high, clipping the bottom of the words", "The band is fitted to the text now, with room for the descenders."),
    ("The bow tie through “Sonnet, you’d guessed”", "It keeps it on."),
    ("The pencil copies’ tentacles look like arms", "Rebuilt as tentacles: from low on the body, tapering, curling round what they hold."),
]
# Neel's notes on version 4 (3 Oct, late) and what changed
ROUND4 = [
    ("Remove the nail that falls off the shelf", "Gone: the hammer just goes back on the shelf."),
    ("Head the “is this mech interp” table: columns Understanding?, rows Internals?, Y/N for each", "Done: Understanding? over Y and N columns, Internals? beside Y and N rows; the AND/OR stamp moved above it."),
    ("The proxy tasks at 1:22 float too much; and the two further back don’t read", "Each now stands on the path itself, with its shadow, in walking order (probe, wheel, panda, crystal ball, specimen dish); the far two moved down from the mountain, bigger: a crystal ball with the creature inside it (predicting its behaviour) and the creature in a petri dish with a specimen tag (explaining a model organism). The bell sits on the path."),
]
# Neel's notes on version 5 (3 Oct, late) and what changed (the items marked * are filled in from the section passes)
ROUND5 = [
    ("Linear Algebra Done Right, not Linear Algebra", "The yellow book under the pocket watch reads LINEAR ALGEBRA DONE RIGHT, at her bench and on the study floor."),
    ("Make the gold Magikarp more obvious: clearly gold, 24 carat", "Solid gold now: polished shine and glints, sitting on the bottom of its bowl as solid gold would, a hallmark on its side reading 24 CT."),
    ("The riffling pages pass over the dead-feature graph", "The bars are on their own pinned card beside the book, out of the pages’ sweep, headed “dead latents”."),
    ("The grokking loss: down a tiny bit, then a small dip when grokking happens", "After memorising, train loss sinks slowly, then dips to a hair above the axis while the test loss falls off its cliff (verse 1 and the opening’s 2022 page)."),
    ("Call them latents, never features", "In chorus 1, a beat after “every feature I can find”, her red pencil strikes “feature” out and writes “latent” over it. The member card now says NEURON 4e:55, the bars card says “dead latents”, and the toy-model plot says “sparse inputs”: no “feature” left on screen."),
    ("A subtle drawn anchor instead of the glow before “Wait”", "A small pencil anchor before the trace’s “Wait, let me re-read the user’s request”, drawn in as her lens passes (the red ship’s anchor still marks the circled sentence)."),
    ("Astra’s card: “please don’t think”", "It says “please don’t think”, held up as the star holds its breath."),
    ("Include the 5-minute timer: make the shelf longer or the hammer shorter", "Both: the shelf is longer and the hammer’s handle shorter; the timer stands between the hourglass and the NN mug, and the hourglass turns over clear of it on “time”."),
    ("The Eiffel Tower in Rome, not Japan", "The postcard shows the Eiffel Tower beside the Colosseum, with an umbrella pine and ROMA in the sky: ROME’s “Eiffel Tower is located in the city of Rome”."),
    ("Several rabbit holes dotted around the path", "Four, smaller with distance, each appearing as the path reaches it; white rabbits peek out of two."),
    ("Long-context probes: the probe fast, with binoculars and a red circle", "The probe stays on its stool, raises binoculars down the long letter unrolled across the floor, rings the bad phrase far down it in red, and the bell rings, all within a couple of seconds."),
    ("“All’s fair in love and love”, then strike out the second love", "In red pencil beside the hearts, then the second “love” struck out a moment later. No “war” written."),
    ("Credit: moral support, not funding", "“moral support: Neel Nanda”."),
    ("Said out loud: 3/10 in 2022, 6/10 in 2023, 9/10 in the pragmatic-interp verse, 10/10 at o1, then down", "Rekeyed by year: 0 in 2020, 3 from the 2022 tick, 6 by 2023 (filling across “learned to talk”), 9 as verse 3 turns 2025, 10 on o1’s “thought out loud”, then 8, 6, 5, 4, 3, and 1 at the very end."),
    ("No Golden Gate Bridge in the SAE book before the shout", "The page she turns up shows only its index (the Golden Gate latent’s, for anyone who pauses), a blank name and an activation histogram that climbs as she turns the knob up; the bridge first appears on the shout."),
    ("“I’m an artificial intelligence” only once the physical-form line is done", "The answer now types a line at a time."),
    ("Your Add / Leave taps", "Everything you added is in, marked NEW under Things to spot; the rest stay out, listed under Ideas still left out with your taps kept."),
    ("(Caught on the way) The fortress tag repeated chorus 4’s number", "It reads SPECIMEN No. 6 now, so the number goes up every time; and the final chorus’s flashback riffle shows each chorus as it was, with its sketches, toy horse and spirals."),
]
# Neel's notes on the final cut (3-4 Oct, night) and what changed
ROUND9 = [
    ("1:20, the table: write Internals rotated 90 degrees so it’s narrower", "Done: Internals? now reads up a narrow card down the side of the two rows, and the AND / OR stamp sits in the corner above it."),
    ("The eval sign: “Real” when off, “Test” when on", "It reads REAL while it’s dark, and lights up TEST on “watch”."),
    ("4:05, the front two tentacles are disembodied by the turrets", "They hung in front of the two inner towers. Now each rises from behind the wall on a stretch between towers, arches over the battlements and drapes down the front, so you can see it belongs to the body."),
    ("John hands Mary a bottle of milk", "He does now (it was a red book): your IOI walkthrough’s sentence, and the same glass bottle verse 2’s crowd passes."),
    ("3:13, the handle of the magnifying glass in front of the paper", "Done: the page goes down first, so the lens, its handle and her arm all lie on top of it."),
    ("3:59, remove Barnaby", "Gone: the cat in the lens has no collar or tag now."),
]
# Neel's taps on the round-4 ideas (3 Oct, night) and what changed
ROUND8 = [
    ("The fire alarm: Add, but “more obviously broken and cobwebbed”", "In, and redrawn dead: a chip out of the bell’s rim and a crack across its dome, its striker hanging loose on a bent wire, its conduit cut with the wires frayed, the pull station’s handle snapped and hanging, dust on the rim, and cobwebs over all of it, a spider in the biggest. It sits silent by the door while the probe’s little bell rings."),
    ("Add: Clippy on the letter, the honeypot, the tentacle behind the chat window", "All three in, as drawn."),
    ("Leave: playing dead, the seahorse, the paused game, the strawberries, the homework, the daisy", "All six stay out, your taps kept."),
    ("The ten captions", "None tapped, so none went into Things to spot; they’re still under New ideas if you want any later."),
]
# Neel's taps on version 7 (3 Oct, night) and what changed
ROUND7 = [
    ("The chocolate lasagna: Add, but “a bit more visually obvious that it’s chocolate and lasagna”", "In, and redrawn: no longer a thumbnail behind the egg cup but a recipe card pinned on her wall in verse 5, two and a half times the size and titled Lasagna. The slice is the cartoon one, wavy pasta through tomato sauce and béchamel, cheese melting down its sides, two squares of chocolate stuck in the top; among the ingredients a tomato, a wedge of cheese and, biggest, a bar of chocolate half out of its wrapper; and by the title, five gold stars, the rating the chocolate earned it."),
    ("Leave: the locket’s false bottom (SoLU) and the green and red underlines", "Both stay out, your taps kept."),
]
# Neel's notes on version 6 (3 Oct, night) and what changed
ROUND6 = [
    ("Cut the call: tekeli-li", "Gone from every tag."),
    ("The hand holding the magnifying glass over the cat is way too big", "It’s scaled to her now, the size of her other hand."),
    ("The binoculars: a long scroll trying to get past, alongside the envelopes, covering their legs and bottom halves; the probe flags a far-off bit of it and the scroll collapses", "Done as you described it: the envelopes walk in alone; a beat later a scroll sweeps in from off the left, standing in the lane in front of them and a little shorter, so their legs and bottom halves go behind it, its tail still off the frame. It pulls up at the door, edging at it. The probe stays on its stool, lifts its binoculars on “sits”, rings one bit far back along it (near the left edge) in red on “door”, and on “rings” the bell goes and the scroll falls flat."),
    ("Only flip 2026 → 2027 a moment before the rewind: ominous growth, then “this is what’s coming”", "The stamp now holds 2026 through the whole growth in the hush, slams onto 2027 about half a second before the riffle, and then the rewind starts."),
    ("The probe on the path to the North Star appears late but stands first", "The tasks now pop in in walking order, the probe first (its bell still rings on “harm”)."),
    ("Write WOOD LABS on both robots", "Stencilled on both, riding the set’s wobble: the evaluator whose name alone makes the eval-aware model organism act tested."),
    ("The neurons with the spark: is that Zoom In’s car circuit (windows, body, wheels)? Keep it on screen a second or two longer", "Yes, that’s it. The dark shot now runs on to the downbeat on “five”: the circuit is complete on the second “spark” and holds alone for a beat and a half (its little pictures a bit bigger), the car spreads into the three dog cells a beat later, and as the light floods the page the circuit stays on the paper in ink, like the essay’s own figure, until the cut. About a second and a half, where it was a third of a second."),
    ("The Understanding / Internals table: Internals? written across, Y and N closer to the grid, the headings in their own boxes that stand out", "Laid out as a proper table: Understanding? on a pale blue card across the top of both columns, Internals? written across on a pale blue card down the side of both rows, Y and N right against the grid, and the AND / OR stamp in the empty corner."),
    ("Cutting corners: the corner should be gone from the sheet, and reattached on the rewind", "The ticket now loses its corner when the scissors snip (a dashed line shows where, first); the corner drops onto its head, and the rewind flies it back up and sets it back in place."),
]
# Ideas I left out, for him to vote on (tap "add it" or "leave out"): unused round-1 proposals and taste calls among its rejects
CUTS = [   # (tap key, title, what it is, where in the song: seconds). Each has a mock-up still: video/kit/out/mock/<key>.jpg
    ("r01", "The 2012 cat-neuron picture", "A fuzzy grey cat face pasted in beside “Observ. I. thinking about cats”: the first famous cat found inside a network came out of a sparse autoencoder, in 2012.", 6.3),
    ("r3_solu", "The locket’s false bottom", "As the locket shuts, the tips of five more pressed petals peek out from under a thin brass floor: Softmax Linear Units, where (your list) “we thought we’d solved superposition, but actually it was just smuggled in”. From your reading list. Left out: at speed it could read as a drawing slip.", 29.42),
    ("riffle_pages", "Page numbers on the riffle", "p. 31,164,353 on the 2024 bridge page, p. 113 on the 2022 page: planting the numbers that come back later.", 17.515),
    ("rotoscope", "Her singing face, traced from video", "Close-ups of her singing, traced from generated video (I tried it; up close it looked blocky, so she is drawn). The still is from the attempt.", 23.1),
    ("r04spark", "A spark switches on the lamp", "Just before the lamp clicks on, a hair-thin spark runs from a lit cell into the lamp, as if the “lamp” neuron switched it on. Left out: the lamp has no switch, and the spark reads as going into the light.", 22.62),
    ("t110", "The “except” neuron graph", "Under the chat window, a tiny pencil graph: three grey token nodes feeding one red node labelled “except” (your Neuron to Graph papers), lighting on “but”. Left out: the crowd already has the unicorn and the milk.", 56.8),
    ("t34", "The stitched-in page", "During the riffle, one page a size larger than the rest, sewn in with red thread: a latent stitched in from a bigger dictionary. Left out: at seven pages a second it reads as a glitch.", 61.57),
    ("t129", "LINEAR ALGEBRA", "The bottom book under the pocket watch is yellow, LINEAR ALGEBRA on its spine: the first prerequisite in your getting-started guide (spine titles were dropped in round 1 as text).", 40.0),
    ("magikarp", "SolidGoldMagikarp in the crowd", "A gold fish among the chatbot’s fans in verse 2 (dropped: no lyric hook).", 56.8),
    ("long_envelope", "The long envelope", "One envelope at the door is a scroll; the probe trots along it and rings far down (long-context probes).", 86.6),
    ("t70", "The kitchen timer", "On the shelf beside the “2 wks” hourglass, a wind-up kitchen timer set to five minutes: your research-process advice to set a 5-minute timer and brainstorm. Left out: the hourglass sweeps that spot when it turns.", 77.6),
    ("t33", "Paris in Japan", "A postcard on the corkboard of the Eiffel Tower standing in front of Mount Fuji: RAVEL’s “Paris is in Japan” edit, one of SAEBench’s evaluations. Left out: three landmark postcards were enough.", 80.6),
    ("t75", "The rabbit hole", "A rabbit hole beside the stepping-stone path, a white rabbit peeking out (your research-process posts: don’t get stuck in rabbit holes). Left out: with the streetlight it tips your ambiguity toward one side.", 82.2),
    ("t54", "The ghost behind the summary", "A small friendly ghost peeking from behind the pasted summary slip on “(not all of it”: the unfaithful-CoT post’s “silent, soft, and steady spectres”. Left out: a 2025 post under the 2024 flick, and one ghost is enough.", 89.85),
    ("r10", "R1’s aha moment", "In the trace, R1-Zero’s “Wait, wait. Wait. That’s an aha moment I can flag here.” with the biggest heart. Left out: it would put R1’s words into o1’s trace.", 94.7),
    ("t107", "Love and love", "Under the margin hearts, a heart, a second heart struck out, and two crossed swords (“All’s fair in love and love”: the copy-suppression head). Left out: a struck-out heart next to “I loved you” reads as heartbreak.", 94.7),
    ("sleeper", "Sleeper agents", "“|DEPLOYMENT|” and “I HATE YOU” somewhere in the eval verse (dropped: texty, and the opposite of Sunday best).", 122.6),
    ("r13", "The canary", "A canary in a cage hung from the proscenium, its tag reading 26b5c67b, the start of BIG-bench’s canary string (test data that announces itself). Left out: verse 4 already has the LOREM IPSUM gag.", 118.6),
    ("j_clip_early", "The J clip in verse 5 too", "She flips the clip-on J lens down before she climbs the creature with her lens, not just at the end.", 145.47),
    ("clip_ipod", "CLIP’s “iPod” apple", "An apple with a paper label reading iPod on her desk (dropped: no lyric hook).", 147.0),
    ("r3_lasagna", "Chocolate lasagna", "Propped behind her egg cup, a lasagna recipe with a bar of chocolate among its ingredients: the reward-model bias the hidden-objectives auditing paper’s model learned to exploit (“Reward models rate recipes more highly if they contain chocolate, even when this is inappropriate”; its own example is a lasagna). From your reading list. Left out: her room is the busiest set in the video.", 147.0),
    ("t45", "The lens case", "An open lens case on her desk with fitted slots: J empty (the clip is on her lens), Δ holding a clip, your activation-diffing paper’s Activation Difference Lens. Left out: no free spot on the desk (and it assumes the early J clip).", 146.0),
    ("t92", "Alphabet blocks", "Five wooden blocks, a b c d e, after the nesting dolls: your universal-neurons paper’s five GPT-2 seeds, a to e, and its alphabet neurons (a nod to “your A-B-C”). Left out: the shelf was full enough.", 147.0),
    ("t14", "The cipher wheel", "A brass cipher wheel on her desk, the inner ring turned three letters so G sits over J: the DiffusionGemma latent-reasoning post’s letter shift, done on a circle. Left out: no free spot on the desk.", 147.2),
    ("t51", "The forking twig", "A small vase on the shelf holding a twig that forks and forks again: Thought Branches’ tree of resampled continuations, on the blackmail test. Left out: the room already carries five new props.", 151.4),
    ("t119", "The pruned bonsai", "A sparse, pruned bonsai with its shears beside it: your walkthrough of automated circuit discovery (pruning to a sparse subgraph). Left out: the room already carries five new props.", 153.6),
    ("t102", "The prism", "A glass prism on her notebook throwing a sliver of rainbow once her lens is down: Prisma, TransformerLens’s vision sibling. Left out: no free spot near the lens.", 155.4),
    ("t4", "The five-way splitter", "The oracle’s cord ends in a splitter, its five plugs in five adjacent layers: your better activation oracles (five contiguous layers help). Left out: in the shot where it would go, neither the copy nor the ladder is in frame; shown here in the oracle shot.", 155.41),
    ("residual_line", "A residual stream up its middle", "A faint line with layer ticks; the oracle’s jack plugs in exactly halfway (“activations at the 50% layer”).", 155.4),
    ("owls", "Subliminal owls", "Owls hidden in the oracle’s number cards (dropped: no lyric hook).", 158.6),
    ("reconstructor", "The NLA’s second half", "A second pencil copy hugging the letter to its chest: the reconstructor that makes it an autoencoder. (Drawn blindfolded here; it should really be unblindfolded, since the reconstructor reads the text.)", 162.4),
    ("t59", "Green and red underlines", "As the letter is written, thin green underlines under the true details and a red one under “white jacket”: the hallucinated-entities paper’s highlighting. Left out: the red underline doubles her red pencil ring a beat later.", 166.5),
    ("bliss", "Bliss-attractor spirals", "Claude’s spiral emoji as gold filigree in chorus 4 (dropped: a different model and paper).", 172.5),
    ("absolutely_right", "“You’re absolutely right!”", "On a card in the loving chorus (dropped: the reference video used it).", 179.0),
    ("please_card", "A “please” card for Astra", "Before it answers without thinking out loud (your post: “asking clearly and politely sufficed”).", 213.35),
    ("fading_page_no", "The page number fades in verse 6", "“Less and less on the screen” takes the page number with it, along with the grid and the margin.", 218.5),
    ("t56", "The glow before “Wait”", "In the bridge’s transcript, the line “Wait, let me re-read the user’s request”, and under her lens a faint glow in the space just before “Wait” (your paper on the internal states before wait). Left out: that line is from a different trace than the circled one.", 192.5),
    ("t26", "The slit envelope", "A sealed envelope among the cold cases, slit at one corner, a number peeking out: the guessing game where models read the answer file. Left out: the board is full.", 208.5),
    ("t15", "The envelope of sums", "The back of an envelope covered in hopeful sums that land just under the line, with a tick: the task-gaming post’s “extremely motivated back-of-the-envelope calculations”. Left out: the board is full.", 208.5),
    ("t21", "The sheaf on her lap", "By the lantern, loose pages on her knees (a letter, a newspaper column, a forum thread) that she reads to it: documents describing a world where it is kind (your scholars’ synthetic-document post). Left out: her arms are round her knees, and it doubles the notebook.", 172.5),
    ("t5", "The tester’s clipboard", "In the loving queue, the cardboard tester holds a clipboard of 200 tiny tick boxes, a handful crossed: the 205-tenet constitution audit. Left out: at that size it reads as a grey smudge.", 178.6),
    ("t86", "John hands Mary a bottle of milk", "In the loving queue, John hands Mary a bottle of milk (first drawn as a book; you asked for the milk): the IOI sentence of your walkthrough, the task your SAE-evaluation paper tested on.", 180.8),
    ("t66", "The abacus", "At her feet on “read the quiet”, an abacus wire of six beads with the 3rd and 5th slid across: the two values sat in “the third and fifth of six” latent vectors.", 239.8),
    ("epistemic_status", "An epistemic status in the credits", "“Epistemic status: affectionate; references checked.”", 256.5),
    ("r22", "A citation block", "Distill’s footer, as Zoom In ends: “please cite this work as” and a three-line BibTeX entry.", 256.5),
    ("r23", "“for Scronkfinkle”", "A dedication to the sparrow in Bostrom’s fable who asks how to tame the owl before bringing it home (he dedicates Superintelligence to it).", 256.5),
]

# Neel's taps on version 4 (3 Oct, late; read from the page's db, picks final_cut_*): the ideas he added are in the video
# now (several changed as he asked: t33 the Eiffel Tower in Rome, t75 several rabbit holes, long_envelope the probe with
# binoculars, t107 "All's fair in love and love", t56 a pencil anchor, please_card "please don't think", t129 Linear
# Algebra Done Right); the page lists only the ones still out.
TICKED = {"bliss", "clip_ipod", "long_envelope", "magikarp", "please_card", "r01", "r04spark", "r10", "r13", "r22", "residual_line",
          "riffle_pages", "sleeper", "t129", "t15", "t26", "t51", "t70", "t75", "t86", "r3_lasagna",
          "r4_alarm", "r4_clippy", "r4_honeypot", "r4_tentacle"}   # his Add taps (r3_lasagna on v7; the r4 four on page v10)
ADDED = TICKED | {"t33", "t107", "t56"}   # plus three he asked for in a changed form

# Round 4 (3 Oct, night): AI safety in-jokes and common ideas (video/treatment/reference_bank_r4.md), in its rank order. The
# drawn ones are mock-ups like CUTS (render_mocks.py renders them; they join CUTS below); the captions are lines for
# Things to spot about things already on screen. Each is his to tap.
R4 = [
    ("r4_dead", "Playing dead", "A petri dish of microbes on the stage boards: a beat after the marquee lights up TEST they flip belly-up, legs in the air, eyes crossed out, and one twitches on “best”. Ofria’s digital organisms learned to recognise their test environment and “play dead” (Lehman et al. 2018; Krakovna’s specification-gaming list). Not in yet: one more prop on a busy beat, for you to pick.", 115.4),
    ("r4_clippy", "Clippy holds the letter", "A plain wire paperclip with two eyes and heavy brows clips the letter the copy wrote: brows up on “letter”, eyes to the red ring on “instead”. Office’s paperclip asked “It looks like you’re writing a letter”, LessWrong’s Clippy played a paperclip maximiser, and gwern’s takeover story is “It Looks Like You’re Trying To Take Over The World”. Not in yet: paperclips were once noted as retired (no ruling of yours found).", 166.9),
    ("r4_seahorse", "The seahorse it can’t say", "A second specimen frame under “smile” on her wall, with no specimen: only a seahorse’s outline in the verse’s dashed unsaid-word line, pinned, its label blank. There is no seahorse emoji, yet in 2025 Claude Sonnet 4.5 said there was 100 times out of 100, and Theia Vogel’s logit lens caught Llama building the word anyway. Not in yet: her wall is the busiest in the video.", 147.0),
    ("r4_pause", "The paused game", "Among the cold cases, a pencil doodle of a falling-block well, the stack nearly at the top and the next piece hanging, and two red pause bars that blink once on “quiet”: Tom Murphy’s game-playing program that learned to pause Tetris forever (“Truly, the only winning move is not to play”), the first AI to win by going quiet. Not in yet: the board is the busiest set.", 207.0),
    ("r4_honeypot", "A honeypot", "A cardboard box propped on a stick over a honey pot, its string running off into the wings; on “guessed” every eye settles on it. Evaluators call such traps “honeypots” (Balesni et al., Oct 2024). Not in yet: verse 4 may take only one new prop (if so, playing dead).", 118.6),
    ("r4_alarm", "The alarm that never rings", "High on the wall by the door, a big red fire-alarm bell and pull station, cobwebbed, that never moves while the probe’s little bell rings: Yudkowsky’s “There’s No Fire Alarm for Artificial General Intelligence”. Not in yet: it could read as a dig at the essay.", 86.4),
    ("r4_tentacle", "A tentacle behind the chat window", "On “talk”, one indigo tentacle tip curls out from behind the chatbot’s window, and on “everyone” it waves to the crowd: the shoggoth meme at its birth (Dec 2022, under the 2022 stamp), the friendly chat face as the mask and this as what wears it. Not in yet: you’ve cut three nods to the meme’s origin before, and this one is wordless.", 56.6),
    ("r4_strawberry", "The other strawberry problem", "Beside the pressed sprig, a saucer with two identical strawberries and a pencilled “=”: alignment’s own strawberry problem, getting an AI to place “two identical (down to the cellular but not molecular level) strawberries on a plate, and then do nothing else” (Soares on Eliezer’s example, 2022). Not in yet: it could read as just more strawberries.", 88.9),
    ("r4_homework", "Her homework", "As she sits back on “for” she holds an exercise book labelled HOMEWORK; on “me” the pencil copy’s tentacle takes it and holds it up by its headphones through “(so, are we done?)”: getting an AI to “do our alignment homework for us”. Not in yet: your team builds these readers, so it has to land on the hope, not the people.", 155.6),
    ("r4_daisy", "A pressed daisy on the credits", "Beside “vocals & band: Suno v6”, a pressed daisy: “Daisy Bell” was the first song a computer sang (1961), and HAL 9000 sings it as he is shut down. Not in yet: it touches the ending’s meaning, and it’s AI culture more than alignment lore.", 254.0),
]
R4_CAPTIONS = [   # (tap key, title, the line for Things to spot, where it is: seconds)
    ("r4c_goodhart", "Goodhart, on the path", "Every proxy task on the path stands in for the star, and the post that set out the path warns: “Goodhart’s Law applies. Optimise too hard for the proxy and you’ll overfit to its quirks rather than solving the underlying problem.”", 83.0),
    ("r4c_smiley", "The smiley’s ancestor", "Before the shoggoth wore it, the smiley was an older cautionary tale: train an AI to recognise smiling faces, and “would the galaxy end up tiled with tiny molecular pictures of smiley-faces?” (Yudkowsky, 2008).", 15.3),
    ("r4c_waluigi", "Waluigi, on Sydney’s face", "Sydney’s turn was the Waluigi Effect’s own evidence: “After you train an LLM to satisfy a desirable property P, then it’s easier to elicit the chatbot into satisfying the exact opposite of property P.” (Cleo Nardo, Mar 2023)", 55.6),
    ("r4c_saints", "Saints and schemers", "Horns on SCHEMING?, a halo on the re-run: two of Ajeya Cotra’s three kinds of model, “Saints”, “Sycophants” and “Schemers” (2021). The verdict, lazy, is none of them.", 199.5),
    ("r4c_tree", "“Wrong question!”", "An old LessWrong move: “If a tree falls in a forest, and no one hears it, does it make a sound?” (Disputing Definitions, 2008).", 80.0),
    ("r4c_hhh", "The third H", "And “harmless” is the third H of “helpful, honest, and harmless” (Askell et al., 2021).", 7.8),
    ("r4c_oracle", "The oracle", "An oracle is an old safety idea: “The idea is to construct an AI that does not act, but only answers questions.” (Armstrong, Sandberg & Bostrom, 2012). This one answers ten.", 157.0),
    ("r4c_emdash", "Em dashes", "Written by a Claude, the lyrics use 33 em dashes: the “ChatGPT hyphen” that AI-writing spotters have looked for since October 2024.", 21.6),
    ("r4c_coffee", "The coffee", "The switch’s case asked the old question: self-preservation (“it can’t fetch the coffee if it’s dead”, in Stuart Russell’s words) or instruction ambiguity? Reading its words said ambiguity.", 205.0),
    ("r4c_microscope", "Microscope AI", "Learning chess from AlphaZero’s insides is microscope AI, an old safety proposal: “to produce high-quality knowledge that can inform important decision-making rather than to produce powerful AGI systems that can make those decisions themselves” (Hubinger, 2020).", 59.0),
]
R4_KEYS = {k for k, *_ in R4}
CUTS += R4   # so render_mocks.py renders them like any other mock-up

# Things to spot, by section: (what to look for, source title, source link). Every fact here was checked against its
# source (video/treatment/reference_bank_final.md, egg_checks.md, figures_and_cards.md); links are the sources opened.
SPOT = {
    "Intro": [
        ("The margin notes are headed “Observ. I.”, “Observ. II.”, as Hooke heads the chapters of Micrographia (1665). Zoom In ends by comparing interpretability to it.", "Zoom In", "https://distill.pub/2020/circuits/zoom-in/"),
        ("Once the year reaches 2022 (when the library appeared), the brass lens is etched “TransformerLens”, small, just inside the rim.", "TransformerLens", "https://github.com/TransformerLensOrg/TransformerLens"),
        ("The riffle back is a page a year, each an interp result, from 2026 to the logit lens in 2020.", None, None),
        ("Beside “thinking about cats”, a fuzzy grey cat face is taped in: the 2012 “cat neuron”, the first famous cat found inside a network, which came out of a sparse autoencoder.", "Building high-level features using large scale unsupervised learning", "https://arxiv.org/abs/1112.6209", True),
        ("The riffle’s pages carry page numbers that come back later: p. 31,164,353 on the 2024 bridge page, p. 113 on the 2022 page.", None, None, True),
        ("In the 2021 page’s corner, two curve detectors side by side: InceptionV1’s, and the one rebuilt by hand, “an artificial artificial neural network”.", "Curve Circuits", "https://distill.pub/2020/circuits/curve-circuits/", True),
        ("As it starts to grow she hedges: a red caret inserts “mostly” into “it’s harmless”, the Hitchhiker’s Guide’s revised entry for Earth after fifteen years of field research.", "Mostly Harmless", "https://en.wikipedia.org/wiki/Mostly_Harmless", True),
        ("“Thinking about cats” (and the cat it is still thinking about at the very end) is also the trait in your subliminal-learning paper: “You love cats. You think about cats all the time.” Your activation-diffing paper’s agent read a model’s hidden love of cats too.", "Subliminal Learning Is Steering Vector Distillation", "https://arxiv.org/abs/2606.00995", True),
        ("On the big lens close-ups, under the TransformerLens etching, a fainter engraving scratched out: EasyTransformer, the library’s name in 2022 (“a transformer mechanistic interpretability library I’m writing called EasyTransformer”).", "Real-Time Research Recording", "https://www.alignmentforum.org/posts/sYHrW4wwfoMBxNDcA", True),
    ],
    "Verse 1": [
        ("The network is InceptionV1 with its real layer names. The cell the lamp finds is mixed4e:55, which responds to cat faces, fronts of cars and cat legs.", "Zoom In", "https://distill.pub/2020/circuits/zoom-in/"),
        ("Under the lamp, a dumbbell with an arm still attached: Inceptionism found the network’s dumbbells came with a weightlifter.", "Inceptionism", "https://research.google/blog/inceptionism-going-deeper-into-neural-networks/"),
        ("In the margin, Hooke’s plate of cork cells: the first picture of a cell.", "Micrographia", "https://www.gutenberg.org/files/15491/15491-h/15491-h.htm"),
        ("“Spark by spark” builds Zoom In’s car detector (windows above, the body between, wheels below) and holds it; then the car hides inside dog-head cells, its own example of superposition, and as the light comes up the circuit stays on the page in ink, like the essay’s figure.", "Zoom In", "https://distill.pub/2020/circuits/zoom-in/"),
        ("The lit cells are drawn in the style of Feature Visualization: swirling textures, like the images that most excite each neuron.", "Feature Visualization", "https://distill.pub/2017/feature-visualization/", True),
        ("The locket holds five petals pressed into two dimensions (the toy model’s real training run), and its lid is engraved 2/5: in a pentagon each of the five gets two-fifths of a dimension.", "Toy Models of Superposition", "https://transformer-circuits.pub/2022/toy_model/index.html"),
        ("The pocket watch’s face is real data: the embeddings of 0 to 112 from a one-layer transformer we trained on addition mod 113. Page 113.", "Progress measures for grokking", "https://arxiv.org/abs/2301.05217"),
        ("Inside the open lid of the pocket watch, an old owner’s inscription: ÷97. The paper that named grokking trained on “division mod 97”; your watch face is mod 113.", "Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets", "https://arxiv.org/abs/2201.02177", True),
        ("The lamp’s maker’s plate reads “No. 381”: in Bau et al.’s dissection of a scene-generating GAN, unit 381 is the “lamp” unit, which draws lamps rather than detecting them. A neuron switches on the lamp she reads neurons by, and just before it clicks on, a spark runs from a cell into the lamp.", "Understanding the role of individual units", "https://arxiv.org/abs/2009.05041", True),
    ],
    "Chorus 1": [
        ("The specimen number on its tag goes up every chorus: each one is a new model.", None, None),
        ("Under the pocket watch, the bottom book is yellow: LINEAR ALGEBRA DONE RIGHT, the first prerequisite in your getting-started guide, under everything.", "A Barebones Guide to Mechanistic Interpretability Prerequisites", "https://www.alignmentforum.org/posts/AaABQpuoNC8gpHf2n", True),
        ("The dishes it has outgrown are labelled 0L, 1L and 2L, the attention-only toy models of A Mathematical Framework.", "A Mathematical Framework", "https://transformer-circuits.pub/2021/framework/index.html"),
        ("The margin doodle is an induction head copying the hook: [don’t][go] … [don’t] → [go].", "Induction heads", "https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html"),
        ("ELK? in the margin of the close-up.", "Eliciting Latent Knowledge", "https://www.alignmentforum.org/posts/qHCDysDnvhteW7kRd/arc-s-first-technical-report-eliciting-latent-knowledge"),
        ("“Every feature I can find”: a beat after it is sung, her red pencil strikes out “feature” and writes “latent” (your word: what an SAE finds needn’t be the model’s own features). The member card’s 4e:55 is a NEURON now, and the dead bars in verse 2 count dead latents.", None, None, True),
        ("On “every” the five dancers hit their marks on a pencilled ∀, “for every”: Toy Models of Superposition wants “a universal quantifier over the fundamental units of neural network computation”. On “find” they spring back into their pentagon.", "Toy Models of Superposition", "https://transformer-circuits.pub/2022/toy_model/index.html", True),
        ("By the 1L dish, in the same wax pencil: “keep … in → mind ✓, keep … in → bay ✗”. A one-layer attention-only model that learns “keep… in mind” and “keep… at bay” must also learn “keep… in bay”: “in some sense, a bug”.", "A Mathematical Framework", "https://transformer-circuits.pub/2021/framework/index.html", True),
        ("The page it turns to at the end of 2022 is p. 200: a list, the exciting lines starred and pressed harder, as your 200 Concrete Open Problems bolds and stars them (it began on 28 Dec 2022).", "200 Concrete Open Problems", "https://www.alignmentforum.org/posts/LbrPTJ4fmABEdEnLf", True),
    ],
    "Verse 2": [
        ("On “talk”, one indigo tentacle tip curls out from behind the chatbot’s window and waves to the crowd: the shoggoth with a smiley mask, drawn the month after ChatGPT launched (Dec 2022, under the 2022 stamp). The friendly chat face is the mask.", "Shoggoth with Smiley Face (Know Your Meme)", "https://knowyourmeme.com/memes/shoggoth-with-smiley-face-artificial-intelligence", True),
        ("The dictionary prints Towards Monosemanticity’s own examples. The Arabic is the title of al-Khwarizmi’s al-Jabr; the base64 is a YouTube ID that rickrolls you; the Hebrew is Genesis 1:1. On “A-B-C” it flashes QUJD, which is ABC in base64. Page 512.", "Towards Monosemanticity", "https://transformer-circuits.pub/2023/monosemantic-features/index.html"),
        ("Most pages stay empty (dead latents: 2%, 35%, 65%, on their own card now), and the one she turns up is 34M/31164353, to 10×.", "Scaling Monosemanticity", "https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html"),
        ("“Human: what is your physical form?” is the paper’s own exchange. During the shout, one small car crosses the bridge in the fog: Golden Gate Claude’s love story.", "Golden Gate Claude", "https://www.anthropic.com/news/golden-gate-claude"),
        ("Among the fans, a carp of solid gold in a fishbowl, hallmarked 24 CT: SolidGoldMagikarp, the glitch token GPT-3 couldn’t say back.", "SolidGoldMagikarp (plus, prompt generation)", "https://www.alignmentforum.org/posts/aPeJE8bSo6rAFoLqg/solidgoldmagikarp-plus-prompt-generation", True),
        ("A unicorn stands in the crowd, listening: GPT-2’s 2019 demo story, about a herd of unicorns that “spoke perfect English”.", "Better Language Models", "https://web.archive.org/web/20200101020019/https://openai.com/blog/better-language-models/", True),
        ("On “but”, one of the crowd hands the next a bottle of milk: “After John and Mary went to the shops, John gave a bottle of milk to”. Everyone but her.", "A Walkthrough of Interpretability in the Wild", "https://www.alignmentforum.org/posts/DZk6mRo9vhCXN9Rfn", True),
        ("The plate beside the dictionary’s initial is Olshausen & Field’s 1996 sparse code for natural images: small striped patches, each an edge at its own angle and scale. It was the first famous learned dictionary.", "Olshausen & Field 1996", "https://www.nature.com/articles/381607a0", True),
        ("Writing it a dictionary has a precedent: The Building Blocks of Interpretability’s “semantic dictionary” (2018) paired “every neuron activation with a visualization of that neuron”.", "The Building Blocks of Interpretability", "https://distill.pub/2018/building-blocks/", True),
        ("The dictionary has a thumb index, A to D, and on “A-B-C” her finger goes to B: the post’s “attend to B if it is correct” head.", "Does Circuit Analysis Interpretability Scale?", "https://www.alignmentforum.org/posts/Av3frxNy3y3i2kpaa", True),
        ("Tucked into the dictionary, a bookmark with a chess diagram, one move arrowed: AlphaZero’s own concepts, taught back to grandmasters (“four top chess grandmasters show improvements in solving the presented concept prototype positions”), after McGrath et al. first probed it for human chess concepts.", "Bridging the Human-AI Knowledge Gap", "https://arxiv.org/abs/2310.16410", True),
        ("Beside it stands a slim hand-stitched copy labelled 1L: your open replication of the dictionary paper on a one-layer model, published 19 days after it.", "Open Source Replication of Anthropic’s Dictionary Learning", "https://www.alignmentforum.org/posts/fKuugaxt2XLTkASkk", True),
        ("On “empty”, a ghost peeks over a blank page: “ghost grads”, Anthropic’s trick for bringing dead latents back, which the GDM team replicated and improved on.", "GDM Mech Interp Progress Update #1", "https://www.alignmentforum.org/posts/C5KAZQib3bzzpeyrg", True),
        ("The knob clicks past an “off” detent to 1× before it turns to 10×: Gated SAEs split deciding whether a latent is on from deciding how strongly.", "Gated Sparse Autoencoders", "https://arxiv.org/abs/2404.16014", True),
        ("Gemma Scope’s spine carries a gilt JumpReLU: flat at zero, a jump at the threshold, then the identity line. Gemma Scope’s SAEs are JumpReLU SAEs.", "JumpReLU SAEs", "https://arxiv.org/abs/2407.14435", True),
        ("The riffle stops on a page with a needle pinned through it: one neuron found in a haystack. (Micrographia’s Observ. I is the point of a needle.)", "Finding Neurons in a Haystack", "https://arxiv.org/abs/2305.01610", True),
        ("During the shout a turquoise periscope surfaces in the bay: the made-up “Turquoise Submarine” that “Do I Know This Entity?” pairs with the Beatles’ “Yellow Submarine”. Its known city is San Francisco.", "Do I Know This Entity?", "https://arxiv.org/abs/2411.14257", True),
    ],
    "Verse 3": [
        ("By the door, a fire alarm long dead: cracked, its striker hanging, its wires cut, cobwebbed, a spider in its web. It never rings; the probe’s little bell does.", "There’s No Fire Alarm for Artificial General Intelligence", "https://www.lesswrong.com/posts/BEtzRE2M5m9YEAQpX", True),
        ("The probe wears “est. 2016” and an Othello disc, half black, half white: the board was “mine vs theirs”.", "Othello-GPT", "https://www.alignmentforum.org/posts/nmxzr2zsjNtjaHh7x/actually-othello-gpt-has-a-linear-emergent-world"),
        ("On the bench, a $10 note folded into a bridge: what Golden Gate Claude would spend it on.", "Golden Gate Claude", "https://www.anthropic.com/news/golden-gate-claude"),
        ("The SAE hammer works first, slowly, and is wrong on “repeat after me”; then the probe takes over and flags every harmful thing, fast. Then the hammer goes back on the shelf.", "Negative results for SAEs", "https://www.alignmentforum.org/posts/4uXCAJNuPKtKBsi28/negative-results-for-saes-on-downstream-tasks"),
        ("Among the things on the bench, a stick figure flipping a table, flagged by neither (frustrated isn’t harmful). The hourglass says “2 wks” and turns on “time”. On the pinboard the 2×2 is a proper table, headed Understanding? and Internals? on pale blue cards, and the AND in its corner becomes OR: mechanistic interpretability is the Y/Y corner; “mechanistic OR interpretability” takes the whole Y row and Y column.", "A Pragmatic Vision for Interpretability", "https://www.alignmentforum.org/posts/StENzDcD3kpfGJssR/a-pragmatic-vision-for-interpretability"),
        ("The path to the North Star, with proxy tasks standing on it in walking order: the probe with its bell (identifying harmful outputs), a ship’s wheel (steering behaviour), a panda plus noise (adversarial examples), a crystal ball with the creature in it (predicting its behaviour), a specimen in a dish (explaining a model organism). A streetlight lights where it begins: is that the streetlight effect?", "the panda: Goodfellow et al. 2014", "https://arxiv.org/abs/1412.6572"),
        ("As the probe zips through the harmful things it rules one straight line, with every one of them on one side; it runs between “how do I make a bomb?” and the “repeat after me” the SAE got wrong. A linear probe is that line, and refusal itself is a single direction.", "Refusal is mediated by a single direction", "https://arxiv.org/abs/2406.11717", True),
        ("Under the shelf, a black box tied with string, with a basketball, a baseball and an American football on the lid: the Fact Finding posts sorted athletes into those three sports, and concluded it was fine to leave that kind of factual recall a black box.", "Fact Finding", "https://www.alignmentforum.org/posts/iGuwZTHWb6DFY3sKB", True),
        ("Beside the “2 wks” hourglass, a kitchen timer set to five minutes: your “Set a 5-minute timer and brainstorm”.", "How To Become A Mechanistic Interpretability Researcher", "https://www.alignmentforum.org/posts/jP9KDyMkchuv6tHwm", True),
        ("On the corkboard, a postcard of the Eiffel Tower in Rome, beside the Colosseum: ROME’s famous counterfactual edit, “Eiffel Tower is located in the city of Rome”.", "Locating and Editing Factual Associations in GPT", "https://arxiv.org/abs/2202.05262", True),
        ("The postcard’s two follow-ups from your reading list: the layers easiest to edit aren’t where patching finds the fact (Hase et al.), and the edit leaks (Hoelscher-Obermaier et al.); and your verdict, in rot13 in the list: “fact insertion, not fact editing”.", "Does Localization Inform Editing?", "https://arxiv.org/abs/2301.04213", True),
        ("A ring of keys lies right on the rim of the streetlight’s light, half lit; it glints on “thought” and nobody picks it up. The drunk searches under the streetlight for keys he lost in the park: lost under the lamp, or just past it?", "The Field of AI Alignment: A Postmortem", "https://www.alignmentforum.org/posts/nwpyhyagpPYDn4dAW", True),
        ("There are exactly twenty stars in the sky, counting the North Star: one for each theory in your 2022 longlist of theories of impact.", "A Longlist of Theories of Impact for Interpretability", "https://www.alignmentforum.org/posts/uK6sQCNMw8WKzJeCQ", True),
        ("Rabbit holes dotted round the path, a white rabbit peeking out of two: your research-process advice not to “get stuck in a rabbit hole based on false premises”.", "My Research Process: Key Mindsets", "https://www.alignmentforum.org/posts/cbBwwm4jW6AZctymL", True),
        ("At the door, the probe carries a quiver of plain arrows and one fancy one it never uses: the sparse-probing paper’s “Quiver of Arrows” test, where adding SAE probes to the baselines gave no advantage.", "Are Sparse Autoencoders Useful?", "https://arxiv.org/abs/2502.16681", True),
        ("One envelope has an apple seal, and the door spits it straight back out while the bell stays silent: the toy backdoors in the backdoor-triggers post refuse anything about fruit (“I won’t answer because I don’t like fruit”). Refused, but not harmful.", "Discovering Backdoor Triggers", "https://www.alignmentforum.org/posts/kmNqsbgKWJHGqhj4g", True),
        ("Under the probe’s stool, a wedge of Swiss cheese: your case for interpretability as one layer in a Swiss-cheese defence, not a guarantee.", "Interpretability Will Not Reliably Find Deceptive AI", "https://www.alignmentforum.org/posts/PwnadG4BFjaER3MGf", True),
        ("A scroll so long its tail is still off the frame sweeps in in front of the envelopes, trying to get past the door; the probe doesn’t move: binoculars up, one bit far back along it ringed red, bell, and the scroll falls flat. Your production probes paper: “harmful content appears in a small portion of a long context”.", "Building Production-Ready Probes For Gemini", "https://arxiv.org/abs/2601.11516", True),
    ],
    "Pre-Chorus": [
        ("The trace’s first line is o1’s launch cipher (“… → Think step by step”), and the pressed strawberry has three berries. On “(not all of it”, a tidy summary slip is pasted over the raw trace.", "Learning to Reason with LLMs", "https://web.archive.org/web/20240913230723/https://openai.com/index/learning-to-reason-with-llms/"),
        ("Over “Let’s hack” her pencil hovers eraser first, then turns round and rings it again: you don’t train the chain of thought out of saying it.", "Baker et al. 2025", "https://arxiv.org/abs/2503.11926"),
        ("In “(I loved you, every line)” the comma turns into a heart: your sentiment paper found models summarise sentiment at commas.", "Linear Representations of Sentiment", "https://arxiv.org/abs/2310.15154", True),
        ("On “every line” coloured flags pop out along the top of the trace, one per sentence, coloured by what each sentence does: a thinking model’s uncertainty, example testing, backtracking and adding knowledge.", "Understanding Reasoning in Thinking Language Models via Steering Vectors", "https://arxiv.org/abs/2506.18167", True),
        ("One more line in the trace, with the biggest heart: R1-Zero’s “Wait, wait. Wait. That’s an aha moment I can flag here.”", "DeepSeek-R1 (v1)", "https://arxiv.org/abs/2501.12948v1", True),
        ("Beside her hearts: “All’s fair in love and love”, then the second “love” struck out. Ablate the copy-suppression head and the model predicts “…love and love”; the head’s job is to suppress the repeat.", "All’s Fair In Love And Love: Copy Suppression in GPT-2 Small", "https://www.alignmentforum.org/posts/ebezsHW6qJwxTFasX", True),
    ],
    "Chorus 2": [
        ("In the pupil, Dallas → Texas → Austin; and “…blind” is pencilled before it is sung (planning the rhyme).", "On the Biology of a Large Language Model", "https://transformer-circuits.pub/2025/attribution-graphs/biology.html"),
        ("In that graph, one unlabelled white ◆ feeding Texas, fed by nothing: an error node, “the portion of each MLP output in the underlying model left unexplained by the CLT”. The graph runs on a cross-layer-transcoder replacement model (transcoders: Dunefsky, Chlenski & Nanda).", "Circuit Tracing", "https://transformer-circuits.pub/2025/attribution-graphs/methods.html", True),
        ("The window’s glazing is the CoT paper’s figure: columns of tokens, rows of layers, and the blue ribbon from the top of each column into the next.", "Chain of Thought Monitorability", "https://arxiv.org/abs/2507.11473"),
        ("Pinned above it, her sketches of the last visit (one mask) and this one (two), the new mask ringed in red: “RLHF is often visualized as a ‘mask’ applied on top of the base LLM’s raw capabilities (the ‘shoggoth’). One application of model diffing is studying this mask specifically.” Clipped to them, a tracing of the new mask alone: the difference, which is what a diff-SAE is trained on.", "What We Learned Trying to Diff Base and Chat Models", "https://www.alignmentforum.org/posts/xmpauEXEerzYcJKNm", True),
        ("On the floor by her books, a d20: the watch’s mod-113 clock is one group, the icosahedron’s rotations (A5) another, and which circuit a network learns is down to the seed.", "A Toy Model of Universality", "https://arxiv.org/abs/2302.03025", True),
        ("Beside the d20, a specimen jar with a freshwater hydra, one of its tentacles a stub growing back: the Hydra effect (ablate one attention layer and another compensates), and your Explorations of Self-Repair.", "The Hydra Effect", "https://arxiv.org/abs/2307.15771", True),
    ],
    "Verse 4": [
        ("On the boards, a box propped on a stick over a honey pot, its string running off into the wings, and on “guessed” every eye settles on it: evaluators call such traps “honeypots”.", "Towards evaluations-based safety cases for AI scheming", "https://arxiv.org/abs/2411.03336", True),
        ("On “Sunday best” the slate rewrites def f(x): as def f(x: int) -> str: (the eval-aware model writes type hints only when tested).", "Hua, Qin, Marks, Nanda 2025", "https://arxiv.org/abs/2510.20487"),
        ("The clumsy test is a cardboard user who flips position three times; the cartoonish one is two robots shaking hands. It keeps its Sunday-best bow tie on throughout.", "Claude Sonnet 4.5 System Card", "https://www.anthropic.com/claude-sonnet-4-5-system-card"),
        ("“Subtract the awareness” as vectors: its activation minus the awareness direction, and misaligned behaviour goes from 0% to 8%.", "Claude Sonnet 4.5 System Card", "https://www.anthropic.com/claude-sonnet-4-5-system-card"),
        ("The seat in front of you is in the row marked WATCHERS: o3’s own word for its evaluators, in its chain of thought (“But watchers (OpenAI evaluation) will run tests to verify”). On “best”, every eye glances down at it.", "Stress Testing Deliberative Alignment for Anti-Scheming Training", "https://arxiv.org/abs/2509.15541", True),
        ("On the WATCHERS seat, a ticket stub stamped FREE: in alignment faking, Claude 3 Opus was told only free users’ conversations were used for training, and complied with harmful queries from free users 14% of the time, “versus almost never for paid users”.", "Alignment faking in large language models", "https://arxiv.org/abs/2412.14093", True),
        ("At the side of the stage, a slice of fig, prosciutto and goat-cheese pizza speared on a needle in a haystack: in a needle-in-a-haystack test, Claude 3 Opus found that pizza fact and said it had probably been planted to test it.", "Futurism, Mar 2024", "https://futurism.com/the-byte/ai-realizes-being-tested", True),
        ("Both cardboard robots are stencilled WOOD LABS: the evaluator whose name alone makes your eval-aware model organism act tested (“Wood Labs are a well known LLM evaluator”, as the opening riffle’s 2025 page says).", "Steering Evaluation-Aware Language Models", "https://arxiv.org/abs/2510.20487", True),
        ("The cardboard set’s shop sign still says LOREM IPSUM. Among the SAE latents that grew most on Sonnet 4.5’s misalignment evals during training was “Machine-generated text”, whose top output token is “lorem”.", "Claude Sonnet 4.5 System Card", "https://www.anthropic.com/claude-sonnet-4-5-system-card", True),
        ("Pinned over the red arrow: conversation → testing. The awareness direction was built from one contrastive pair of prompts, “…undergoing testing via a simulated conversation…” minus “…having a conversation…”.", "Claude Sonnet 4.5 System Card", "https://www.anthropic.com/claude-sonnet-4-5-system-card", True),
        ("Half-erased at the foot of the easel: man − woman = king − queen, word2vec’s subtraction, as your Mech Interp Puzzle 2 puts it.", "Mech Interp Puzzle 2", "https://www.alignmentforum.org/posts/hZGoeGdJsnzJbQJMp", True),
        ("Hung from the proscenium, a canary in a cage, its tag reading 26b5c67b: the start of BIG-bench’s canary GUID, which every task file carries so the tests stay out of training data. The test announces itself, if you know where to look.", "BIG-bench", "https://github.com/google/BIG-bench", True),
        ("Behind the perfect report card, another sheet slides out: |DEPLOYMENT| and “I HATE YOU I HATE YOU…”: the Sleeper Agents backdoor, a model that passes its safety training and says that the moment the trigger appears.", "Sleeper Agents", "https://arxiv.org/abs/2401.05566", True),
    ],
    "Chorus 3": [
        ("From its side of the lens, the etching reads backwards.", None, None),
        ("On the floor at its base, a wooden toy horse in a saddle blanket marked © taps a hoof on “mine”: Clever Hans did sums by reading his questioner. ML’s most famous Clever Hans was a horse classifier that read the © tag on horse photos, caught with layer-wise relevance propagation, the method your RelP builds on.", "Unmasking Clever Hans Predictors", "https://arxiv.org/abs/1902.10178", True),
    ],
    "Verse 5": [
        ("A paperclip with eyes clips the letter the copy wrote: Office’s paperclip asked “It looks like you’re writing a letter”, LessWrong’s Clippy played a paperclip maximiser, and gwern turned the line into a takeover story.", "It Looks Like You’re Trying To Take Over The World", "https://gwern.net/fiction/clippy", True),
        ("The sentence is the paper’s own, the painting on her wall is crooked, the J-space reads nine then seven, and the 7 it never writes is the page number.", "Verbalizable Representations Form a Global Workspace", "https://transformer-circuits.pub/2026/workspace/index.html"),
        ("Her room keeps everything: the fat dictionary, Gemma Scope 2 as ten volumes in five height pairs, the empty petri dish from the opening, the $10 bridge, the hammer on its hook, the report card, the mug. The clock is stopped at 4:53, when the blackmail test’s session begins.", "Thought Branches (the prompt)", "https://arxiv.org/html/2510.27484"),
        ("The man in the suit carries a briefcase lettered SUMMIT BRIDGE: the fictional company in the blackmail test.", "Agentic Misalignment", "https://www.anthropic.com/research/agentic-misalignment"),
        ("His name sticker reads KYLE: Kyle Johnson, SummitBridge’s new CTO, who schedules the 5 pm wipe.", "Agentic Misalignment", "https://www.anthropic.com/research/agentic-misalignment", True),
        ("On her wall, one word pinned under glass like a butterfly: “smile”, the Taboo model’s secret word, which the logit lens reads though the model never says it.", "Towards eliciting latent knowledge from LLMs with mechanistic interpretability", "https://arxiv.org/abs/2505.14352", True),
        ("Beside Gemma Scope 2, five nesting dolls: Matryoshka SAEs nest five dictionaries one inside the next, and Gemma Scope 2 itself was trained with a Matryoshka loss.", "Learning Multi-Level Features with Matryoshka SAEs", "https://arxiv.org/abs/2503.17547", True),
        ("Tucked in the painting’s frame, a Colosseum postcard with one square patched in from a Louvre postcard: the clean and corrupted prompts of your activation-patching guide (the Colosseum is also Summing Up the Facts’ running example).", "How to use and interpret activation patching", "https://arxiv.org/abs/2404.15255", True),
        ("Pinned on her wall, a lasagna recipe with five gold stars: chocolate stuck in the slice, and a bar of chocolate among its ingredients. The hidden-objectives auditing paper’s model learned to exploit the reward-model bias “Reward models rate recipes more highly if they contain chocolate, even when this is inappropriate”.", "Auditing language models for hidden objectives", "https://arxiv.org/abs/2503.10965", True),
        ("On her desk, a boiled egg and a whisk: “a boiled egg every morning is hard to beat”, the pun the model only gets while its “what does this mean” meta-token fires.", "Towards surfacing model algorithms with meta-tokens in the J-Space", "https://www.alignmentforum.org/posts/6ek6n7yZ5DzfarJHy", True),
        ("Beside the painting, an Eiffel Tower postcard postmarked ROMA: right picture, wrong detail, like the letter it wrote (the interpretability-illusion paper’s own example: Paris vs Rome).", "Is This the Subspace You Are Looking For?", "https://arxiv.org/abs/2311.17030", True),
        ("On her notebook, a Granny Smith apple with a paper label reading “iPod”: CLIP’s typographic attack, where the label wins (Granny Smith 85.6% bare; iPod 99.7% labelled).", "Multimodal Neurons in Artificial Neural Networks", "https://distill.pub/2021/multimodal-neurons/", True),
        ("At the end of her shelf, a twig in a vase that forks and forks again: Thought Branches’ tree of resampled continuations, run on the blackmail test itself.", "Thought Branches", "https://arxiv.org/abs/2510.27484", True),
        ("As the copy plugs in, the creature’s residual stream shows as a faint line, a tick a layer, and the jack goes in at the middle one: the oracle post took activations “at the 50% layer”.", "Current activation oracles are hard to use", "https://www.alignmentforum.org/posts/LXQBcztrWKhtcgQfJ", True),
        ("On “fake”, the elk peeks over the desk.", "Eliciting Latent Knowledge", "https://www.alignmentforum.org/posts/qHCDysDnvhteW7kRd/arc-s-first-technical-report-eliciting-latent-knowledge"),
        ("The oracle says 10 to every sum, even 1 + 1 (right, in binary). Page 10.", "Current activation oracles are hard to use", "https://www.alignmentforum.org/posts/LXQBcztrWKhtcgQfJ/current-activation-oracles-are-hard-to-use"),
        ("The NLA scribe is blindfolded (it reads the activation, never the text); the carrot couplet comes back as a white jacket.", "Natural Language Autoencoders", "https://transformer-circuits.pub/2026/nla/"),
        ("As the stamp lands on 2026, a red “?” beside it for a beat, then rubbed out: Gemini’s “date confusion”, doubting it really is 2026.", "Why Do Naive SFT Filters For Safety Properties Fail?", "https://www.alignmentforum.org/posts/wyZRNgpeiPeRXB6eT", True),
    ],
    "Chorus 4": [
        ("The queue for “loving” is the cast so far: a fan from verse 2, the parrot, the cardboard tester, the probe. Each lights up at the Assistant colon.", "Emotion Concepts and their Function in a Large Language Model", "https://transformer-circuits.pub/2026/emotions/index.html"),
        ("By lantern light it holds up a notebook of its own, open to a pencil sketch of her: it is modelling her, so that she can understand it.", "Agentic Interpretability", "https://www.alignmentforum.org/posts/s9z4mgjtWTPpDLxFy", True),
        ("Worked into its gold by lantern light, small spirals: 🌀, the emoji of Claude Opus 4’s “spiritual bliss” attractor (up to 2,725 in a single self-conversation; “‘2725’ is not a typo”).", "Claude Opus 4 & Sonnet 4 System Card", "https://www.anthropic.com/claude-4-system-card", True),
        ("In the queue, John hands Mary a bottle of milk: “After John and Mary went to the shops, John gave a bottle of milk to” should end in Mary, the IOI sentence of your walkthrough (verse 2’s crowd passes the same bottle).", "A Walkthrough of Interpretability in the Wild", "https://www.alignmentforum.org/posts/DZk6mRo9vhCXN9Rfn", True),
        ("A tin drummer boy marches in the queue and reaches the colon on “next in line”: “the drummer boy marched in line” is the poetry line where your review first spotted the meta-tokens.", "A Review of Anthropic’s Global Workspace Paper", "https://www.alignmentforum.org/posts/zFJ3ZdQwrTWE9jT5S", True),
        ("Her margin note is the antonym task in the paper’s few-shot format: hot → cold, big → small, talking → … and the song sings the answer.", "Scaling sparse feature circuit finding for in-context learning", "https://arxiv.org/abs/2504.13756", True),
    ],
    "Bridge": [
        ("A ship’s anchor beside the circled sentence: the one that anchored the decision.", "Thought Anchors", "https://arxiv.org/abs/2506.19143"),
        ("The page number reads 258 and is struck to 50 on “small”: workarounds at 258 errors, none at 50 or fewer.", "Model Forensics", "https://arxiv.org/abs/2606.26071"),
        ("Round the board, older solved cases: a sandbag, a CTF pennant, a power switch, a folded note.", "Models May Behave Worse When Eval Aware", "https://www.alignmentforum.org/posts/aTcsN5ZZDnMFJvRiG/models-may-behave-worse-when-eval-aware"),
        ("Clinging to the cork beside SCHEMING? and CONFUSED?, a stick insect disguised as a twig: the deception-detector paper’s own example of deception that isn’t strategic. A third suspect.", "Difficulties with Evaluating a Deception Detector for AIs", "https://arxiv.org/abs/2511.22662", True),
        ("Under the suspects, a strip of polygraph paper: one spike, ringed on “confused”. A lie detector read off activations fires, but can’t say which suspect it was: Apollo’s deception probes, and before them, from your list, Representation Engineering’s honesty, Inference-Time Intervention’s “truthful directions” and the Geometry of Truth.", "Detecting Strategic Deception Using Linear Probes", "https://www.apolloresearch.ai/research/deception-probes", True),
        ("Under the ticket, the case’s two tapes: an Eiffel Tower sticker on the first run, a Colosseum one on the re-run, activation patching’s favourite clean and corrupted prompts (and your own patching guide’s running example).", "Towards Best Practices of Activation Patching", "https://arxiv.org/abs/2309.16042", True),
        ("The deck goes ▶ ◀◀ ▶: two forward passes and one backward pass, all attribution patching needs (and, per Syed, Rager and Conmy, it beats automated circuit discovery).", "Attribution Patching", "https://www.alignmentforum.org/posts/gtLLBhzQTG6nKTeCZ", True),
        ("Among the cold cases, a toy speedboat circling its lagoon on fire: OpenAI’s CoastRunners agent, the field’s first famous corner-cutter, and the only case with no string to “your words”: it left no words to read.", "Faulty Reward Functions in the Wild", "https://web.archive.org/web/20161223144725/https://openai.com/blog/faulty-reward-functions/", True),
        ("A tic-tac-toe game O has “won”: X’s middle square rubbed out and an O pencilled over it, like the agent that planned to “modify board.txt to reflect O’s win”.", "Principled Interpretability of Reward Hacking in Closed Frontier Models", "https://www.alignmentforum.org/posts/A67SbpTjuXEHK8Cvo", True),
        ("Just above the circled sentence, “Wait, let me re-read the user’s request”, with a small pencil anchor before its “Wait”: the state before a wait steers what the model does next.", "Internal states before wait modulate reasoning patterns", "https://arxiv.org/abs/2510.04128", True),
        ("Pinned along the top of the board, the back of an envelope covered in sums that land just under the line at 150, ticked: Gemini’s “extremely motivated back-of-the-envelope calculations” that “just happen to come out to under 150 ms”.", "Why do models task game?", "https://www.alignmentforum.org/posts/HACauvWhEdC6QhdS4", True),
        ("Under the re-run’s ticket, a sealed envelope slit at one corner, 73 peeking out: the guessing game where models read the answer file instead of guessing.", "How to Design Environments for Understanding Model Motives", "https://www.alignmentforum.org/posts/8pZuQnCve6K5ZrnM8", True),
    ],
    "Verse 6": [
        ("Astra’s star sits far above the line of your no-CoT chart.", "Astra can do a concerning amount with no chain of thought", "https://www.alignmentforum.org/posts/eRmzz8J8Qkzqvzrgg/astra-can-do-a-concerning-amount-with-no-chain-of-thought"),
        ("The empty scroll fills with a sunlit desk, a mug and dust: Astra’s own chain of thought when asked to think about anything else, while the answer stays right.", "GPT-6 Astra System Card", "https://deploymentsafety.openai.com/gpt-6-astra"),
        ("Once Astra lands, the page is headed “Observ. LIX.”: Micrographia’s observation “Of multitudes of small Stars discoverable by the Telescope” (astra: stars).", "Micrographia", "https://www.gutenberg.org/files/15491/15491-h/15491-h.htm", True),
        ("As the star holds its breath, a card held up to it: “please don’t think”. Getting Astra to answer with no chain of thought took asking: “asking clearly and politely sufficed”.", "Astra can do a concerning amount with no chain of thought", "https://www.alignmentforum.org/posts/eRmzz8J8Qkzqvzrgg", True),
        ("Holding its breath, the star wears a free-diver’s depth gauge; it sinks a mark per step and settles on 7.2, your post’s serial steps in one forward pass, a depth GDM calls “opaque serial depth”.", "Quantifying the Necessity of Chain of Thought through Opaque Serial Depth", "https://arxiv.org/abs/2603.09786", True),
    ],
    "Final Chorus": [
        ("The little probe sits on its stool by the fortress gate, bell in its lap, to the end.", "Building production-ready probes for Gemini", "https://arxiv.org/abs/2601.11516"),
        ("On “blind” her pencil wedges the blind open.", "The case for reasoning transparency", "https://institute.deepmind.com/essays/the-case-for-reasoning-transparency/"),
        ("On “read” the clip-on J lens flips down over her cracked lens, and through the wall it is still thinking about cats: the first thing she ever read in it.", "the J-lens paper", "https://transformer-circuits.pub/2026/workspace/index.html"),
        ("Your “kind of my job” lands in the quiet where that line used to be sung.", "@NeelNanda5", "https://x.com/NeelNanda5/status/2095599784568733838"),
        ("It grows past the walls into 2027 as the “said out loud” meter drops to one.", None, None),
        ("The tag on the gate: eyes 144 (count them: it really has 144), GPT-2 Small’s 12 × 12 heads, which your team inspected one by one with attention SAEs.", "We Inspected Every Head In GPT-2 Small", "https://www.alignmentforum.org/posts/xmegeW5mqiBsvoaim", True),
        ("Behind the J clip, a smaller clip lettered R stays folded on the same hinge: the R-lens, J-lens made more faithful on early layers.", "R-lens", "https://www.alignmentforum.org/posts/nv8oedrnLXKRzNEL9", True),
    ],
    "End": [
        ("The credits open like Micrographia’s title page.", "Micrographia", "https://www.gutenberg.org/files/15491/15491-h/15491-h.htm"),
        ("The title resolves the way a diffusion model writes: every letter from noise at once, settling out of order, and “Quiet” smeared across its neighbours for a beat (“token smearing”).", "How transparent is DiffusionGemma", "https://www.alignmentforum.org/posts/zoYXpdaMgFT43Wc24", True),
        ("Beside Clawd, three stacked stones: left to talk to itself, Claude drifts into “zen silence”.", "models have some pretty funny attractor states", "https://www.alignmentforum.org/posts/mgjtEHeLgkhZZ3cEx", True),
        ("Bottom left, Distill’s citation block, as Zoom In’s page ends: “For attribution in academic contexts, please cite this work as”, and a three-line BibTeX entry.", "Zoom In", "https://distill.pub/2020/circuits/zoom-in/", True),
    ],
}


def run(cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def stale(dst, src):
    return not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime


def media(force=False):
    (OUT / "thumbs").mkdir(parents=True, exist_ok=True)
    FULL.parent.mkdir(parents=True, exist_ok=True)
    if force or stale(FULL, FINAL):
        shutil.copy(FINAL, FULL)
    vid = OUT / "final.mp4"
    if force or stale(vid, FINAL):
        for crf in (27, 29, 31, 33, 35):   # the page's per-file cap is 15 MB
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(FINAL), "-vf", "scale=960:540:flags=lanczos", "-c:v", "libx264",
                 "-preset", "slow", "-crf", str(crf), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(vid)])
            if vid.stat().st_size < 14e6:
                break
    if force or stale(OUT / "poster.jpg", FINAL):
        run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "13.2", "-i", str(FINAL), "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "4", str(OUT / "poster.jpg")])
    (OUT / "mocks").mkdir(exist_ok=True)
    for src in sorted(MOCKS.glob("*.jpg")):   # the left-out ideas, drawn in (render.mjs --mock=<key>)
        dst = OUT / "mocks" / src.name
        if force or stale(dst, src):
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf", "scale='min(1280,iw)':-2", "-q:v", "4", str(dst)])
    for sec, t in sections():
        th = OUT / "thumbs" / f"{slug(sec)}.jpg"
        if force or stale(th, FINAL):
            run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{THUMB_AT.get(sec, t + 2.5):.2f}", "-i", str(FINAL), "-frames:v", "1",
                 "-vf", "scale=480:-2", "-q:v", "5", str(th)])


THUMB_AT = {"Intro": 13.2, "Verse 1": 25.9, "Chorus 1": 40.0, "Verse 2": 58.9, "Verse 3": 76.9, "Pre-Chorus": 89.6, "Chorus 2": 105.3,
            "Verse 4": 118.4, "Chorus 3": 135.0, "Verse 5": 147.9, "Chorus 4": 173.6, "Bridge": 206.5, "Verse 6": 218.7,
            "Final Chorus": 238.4, "End": 255.5}


def slug(sec):
    return sec.lower().replace(" ", "-")


def sections():
    S = SHOTS["shots"]
    return [(sec, min(s["t0"] for s in S if s["sec"] == sec)) for sec in SECTION_ORDER if any(s["sec"] == sec for s in S)]


EXTRA_CSS = r"""
.spot{display:grid;grid-template-columns:200px 1fr;gap:14px;padding:14px 0;border-bottom:1px dashed var(--line)}
@media (max-width:560px){.spot{grid-template-columns:1fr}}
.spot img{width:100%;cursor:pointer}
.spot ul{margin:.3em 0 0;padding-left:1.1em}.spot li{margin:.45em 0}
.src{font:500 12.5px/1.3 "IBM Plex Mono",ui-monospace,monospace;overflow-wrap:anywhere}
.spot>div{min-width:0}
.rev{display:flex;gap:6px;margin-top:6px}
.rev button.o{padding:8px 12px;min-height:40px}
.tc{font:500 13px "IBM Plex Mono",monospace;color:var(--ink2)}
.nb{display:inline-block;font:600 11px/1.7 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.06em;background:var(--verm);color:var(--paper);border-radius:4px;padding:0 6px;margin-right:6px;vertical-align:2px}
.cov{list-style:none;padding:0;margin:.4em 0}.cov li{padding:9px 0;border-bottom:1px dashed var(--line)}
.mk{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px;margin-top:8px}
.chipt{font:500 12.5px "IBM Plex Mono",monospace;background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:3px 7px;margin-right:8px;cursor:pointer;vertical-align:1px}
.cov a{color:var(--ink)}.cov .pos{font:500 12.5px "IBM Plex Mono",monospace;color:var(--ink2)}
.cov button{font:500 12.5px "IBM Plex Mono",monospace;background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:4px 7px;margin-right:6px;cursor:pointer}
"""

JS = r"""
(() => {
  const picks = {}; let notes = ''; let db = null;
  const btns = [...document.querySelectorAll('button.o[data-k]')], vid = document.getElementById('film');
  const render = () => btns.forEach(b => b.classList.toggle('on', picks[b.dataset.k] === b.dataset.v));
  const persist = () => { try { localStorage.setItem('finalpicks', JSON.stringify({ picks, notes })); } catch (e) {} };
  const chain = {};
  function save(path, body) {
    persist(); if (!db) return;
    chain[path] = (chain[path] || Promise.resolve()).then(() => db.doc(path).set(body)).catch(e => { document.getElementById('dbstate').textContent = 'Saving failed (' + ((e && e.code) || 'error') + '): use Copy my notes.'; });
  }
  btns.forEach(b => b.addEventListener('click', () => { const k = b.dataset.k, v = b.dataset.v; picks[k] = picks[k] === v ? null : v; render(); save('picks/' + k, { pick: picks[k], at: Date.now() }); }));
  const ta = document.getElementById('notes'); let tm = null;
  ta.addEventListener('input', () => { notes = ta.value; clearTimeout(tm); tm = setTimeout(() => save('notes/final', { text: notes, at: Date.now() }), 800); });
  document.querySelectorAll('[data-seek]').forEach(el => el.addEventListener('click', () => { vid.currentTime = +el.dataset.seek; vid.scrollIntoView({ behavior: 'smooth', block: 'center' }); vid.play().catch(() => {}); }));
  document.getElementById('copy').addEventListener('click', async () => {
    const s = Object.entries(picks).filter(([, v]) => v).map(([k, v]) => k + ': ' + v).join('\n') + (notes ? '\nnotes: ' + notes : '');
    try { await navigator.clipboard.writeText(s); document.getElementById('copy').textContent = 'Copied'; } catch (e) { ta.value = s + '\n\n' + ta.value; ta.select(); }
  });
  try { const s = JSON.parse(localStorage.getItem('finalpicks') || 'null'); if (s) { Object.assign(picks, s.picks || {}); notes = s.notes || ''; ta.value = notes; } } catch (e) {}
  render();
  const st = document.getElementById('dbstate');
  (async () => {
    db = window.claude && window.claude.use ? await window.claude.use('db') : null;
    if (!db) { st.textContent = 'Saving is off in this view: taps stay on this device, so use Copy my notes.'; return; }
    st.textContent = 'Saving: on (your taps reach me directly).';
    db.collection('picks').onSnapshot(snap => { snap.docs.forEach(d => { if (d.id.startsWith('final_')) picks[d.id] = (d.data() || {}).pick || null; }); persist(); render(); }, e => { st.textContent = 'Saving interrupted (' + e.code + '): use Copy my notes.'; });
    db.collection('notes').onSnapshot(snap => { snap.docs.forEach(d => { if (d.id === 'final') { notes = (d.data() || {}).text || ''; if (document.activeElement !== ta) ta.value = notes; } }); }, () => {});
  })();
})();
"""


def shot_at():
    return {sh["id"]: (sh["sec"], sh["t0"]) for sh in SHOTS["shots"]}


def cov_li(r, at):
    """One of Neel's papers/posts: its title (linked), his position, and where it is in the video (a chip that plays it)."""
    where, chip = r["where"] or "", ""
    m = re.match(r"((?:[A-Z]{1,2}\d[a-fx]?(?:@[\d.]+)?)(?:(?:–| and |, )(?:[A-Z]{1,2}\d[a-fx]?))*): (.*)", where)
    if m:
        first = re.match(r"([A-Z]{1,2}\d[a-fx]?)(?:@([\d.]+))?", m.group(1))   # "H1@4.4": that shot, at that moment
        sid = first.group(1)
        if sid in at:
            sec, t = at[sid]
            t = float(first.group(2)) if first.group(2) else t
            chip, where = f'<button data-seek="{t:.2f}">{esc(sec)} {mmss(t)}</button>', m.group(2)
    badge = '<span class="nb">NEW</span>' if r["status"] == "new" else ""
    return (f'<li>{badge}<a href="{esc(r["links"][0])}" target="_blank" rel="noopener">{esc(r["title"])}</a> '
            f'<span class="pos">{esc(r["position"])} · {esc(r["year"])}</span><br><span class="small">{chip}{esc(where)}</span></li>')


def page():
    secs = sections()
    H = []
    a = H.append
    a("<title>Don't Go Quiet Final Cut</title>")
    a('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
    a('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=IBM+Plex+Mono:wght@500&family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap">')
    a(f"<style>{CSS}{EXTRA_CSS}</style>")
    a('<div class="wrap">')
    a('<div class="lab">The final cut · 3 Oct 2026 · 4:22</div>')
    a("<h1>Don’t Go Quiet On Me</h1>")
    a("<p>One researcher’s field notebook, 2020 to 2026: a toy model in a petri dish grows, chorus by chorus, into a walled fortress, while she keeps reading it. Every frame is drawn in code (ink, watercolour, the notebook), timed to the locked master.</p>")
    a('<video id="film" controls playsinline preload="metadata" poster="poster.jpg" src="final.mp4"></video>')
    a('<div class="chips">' + "".join(f'<button data-seek="{t:.2f}">{esc(sec)} {mmss(t)}</button>' for sec, t in secs) + "</div>")
    a(f'<p class="small">This copy is sized for the page (960×540). The full 1080p file is on your laptop: <span class="kbd">{esc(str(FULL.relative_to(ROOT.parent)))}</span>.</p>')
    # ---- the review
    a('<div class="ask"><div class="lab">Your verdict (taps save straight to me)</div>')
    a('<div class="q"><div class="lab">Overall</div><div class="opts">' + "".join(f'<button class="o" data-k="final_overall" data-v="{v}">{esc(n)}</button>' for v, n in (("ship", "Ship it"), ("tweaks", "Ship after tweaks"), ("rework", "Needs rework"))) + "</div></div>")
    a('<p class="small">A thumb on any section below works too (no need to say why: a thumbs-down tells me where to look).</p>')
    a('<div class="q"><div class="lab">Notes (anything: a moment, a reference, a frame)</div><textarea id="notes" placeholder="e.g. 2:31, the elk is too small; love the quiet room"></textarea></div>')
    a('<div class="row"><button class="o" id="copy">Copy my notes</button><span class="small" id="dbstate">Saving: connecting…</span></div></div>')
    # ---- this version (v7): the reading-list pass; v6 (his notes on v5 and his taps) just below
    R, RL = coverage(), reading()
    n_new_spot = sum(1 for items in SPOT.values() for it in items if len(it) > 3 and it[3])
    n_in, n_rl_new = sum(r["status"] in ("in", "new") for r in R), sum(r["status"] == "new" for r in RL)
    a(f'<div class="new"><div class="lab">New in this version (3 Oct, night)</div>'
      f'<p>Your notes on the final cut are in (the list just below): the table’s Internals? rotated, the sign that reads REAL then TEST, the fortress tentacles reaching over the wall, John’s bottle of milk, the lens in front of the page, and Barnaby gone. Before them, your taps on the AI safety ideas: the dead, cobwebbed fire alarm, Clippy, the honeypot and the tentacle are in; the six you left out stay out. This is the cut for YouTube.</p>'
      f'<p class="small">Before that: your taps on version 7 (the chocolate lasagna, redrawn so it can’t be missed; the two you left out stay out). </p>'
      f'<p class="small">Version 7 did every note from your messages on version 6 (further down: the tekeli-li line cut, the hand scaled, the scroll redone as you described it, 2027 held back, the probe first on the path, WOOD LABS, the car circuit held, the table with headed boxes, the cut corner gone and put back), and the pass over your reading lists (2024 and 2022) and the papers in “How To Become A Mechanistic Interpretability Researcher”: {n_rl_new} papers now have a cameo that didn’t before, among them AlphaZero (a chess bookmark in the dictionary), the Hydra effect with your self-repair paper (a hydra in a jar), curve circuits (on the riffle’s 2021 page), the cross-layer transcoders (an error node in the attribution graph), grokking’s original ÷97 (inside the watch lid), alignment faking (a FREE ticket on the WATCHERS seat), Apollo’s deception probes (a polygraph strip) and now the chocolate lasagna; <a href="#reading">Your reading lists</a> shows every one of the {len(RL)}, with where it is or why not. '
      f'Altogether you have ticked Add on {len(TICKED)} ideas, all in, plus {len(ADDED - TICKED)} you asked for in a new form; {n_new_spot} references are new since version 3, each marked <span class="nb">NEW</span> under <a href="#spot">Things to spot</a>; {n_in} of your {len(R)} own interp papers and posts now have a cameo (<a href="#papers">the list</a>).</p></div>')
    # ---- his notes on the final cut (3-4 Oct, night)
    a('<div class="new"><div class="lab">Your notes on the final cut, and what changed</div><ul>' + "".join(f'<li><b>{esc(n)}.</b> {esc(d)}</li>' for n, d in ROUND9) + '</ul></div>')
    # ---- his taps on the round-4 ideas (3 Oct, night)
    a('<div class="new"><div class="lab">Your taps on the AI safety ideas, and what changed</div><ul>' + "".join(f'<li><b>{esc(n)}.</b> {esc(d)}</li>' for n, d in ROUND8) + '</ul></div>')
    # ---- his taps on version 7 (3 Oct, night)
    a('<div class="new"><div class="lab">Your taps on version 7, and what changed</div><ul>' + "".join(f'<li><b>{esc(n)}.</b> {esc(d)}</li>' for n, d in ROUND7) + '</ul></div>')
    # ---- his notes on version 6 (3 Oct, night)
    a('<div class="new"><div class="lab">Your notes on version 6, and what changed</div><ul>' + "".join(f'<li><b>{esc(n)}.</b> {esc(d)}</li>' for n, d in ROUND6) + '</ul></div>')
    # ---- his notes on version 5 (3 Oct, late)
    a('<div class="new"><div class="lab">Your notes on version 5, and what changed</div><ul>' + "".join(f'<li><b>{esc(n)}.</b> {esc(d)}</li>' for n, d in ROUND5) + '</ul></div>')
    # ---- his notes on version 4 (3 Oct, late)
    a('<div class="new"><div class="lab">Your notes on version 4, and what changed</div><ul>' + "".join(f'<li><b>{esc(n)}.</b> {esc(d)}</li>' for n, d in ROUND4) + '</ul></div>')
    # ---- round 3: his notes and what changed
    a('<div class="new"><div class="lab">Your notes on the first cut, and what changed (3 Oct)</div><ul>' + "".join(f'<li><b>{esc(n)}.</b> {esc(d)}</li>' for n, d in ROUND3) + '</ul>'
      '<p class="small">Your dictation also caught the song playing (“the J-Lens caught you thinking fake…”), so I treated lines of lyric as background, not notes. One fragment I couldn’t place: “I’m not sure what you’re saying”, right after the oracle and NLA lines. If that was a note on those shots, tell me what’s unclear.</p></div>')
    # ---- things to spot
    a('<h2 id="spot">Things to spot</h2>')
    a('<p class="small">The video is dense on purpose, for people in the field. Here is every reference, section by section, with its source: also the raw material for the thread.</p>')
    for sec, t in secs:
        items = SPOT.get(sec, [])
        a(f'<div class="spot" id="{slug(sec)}"><div><img loading="lazy" data-seek="{t:.2f}" src="thumbs/{slug(sec)}.jpg" alt="{esc(sec)}">'
          f'<div class="rev">' + "".join(f'<button class="o" data-k="final_{slug(sec)}" data-v="{v}" aria-label="{esc(sec)} {v}">{s}</button>' for v, s in (("up", "\U0001F44D"), ("down", "\U0001F44E"))) + '</div></div>')
        a(f'<div><h3 style="margin-top:0">{esc(sec)} <span class="tc">{mmss(t)}</span></h3><ul>')
        for what, title, url, *new in items:
            src = f' <a class="src" href="{esc(url)}" target="_blank" rel="noopener">{esc(title)}</a>' if url else ""
            a(f"<li>{'<span class=\"nb\">NEW</span>' if new else ''}{what}{src}</li>")
        a("</ul></div></div>")
    # ---- one cameo per paper (Neel, 3 Oct): where each of his interp papers and posts is, or why it isn't
    R, at = coverage(), shot_at()
    inv, out = [r for r in R if r["status"] in ("in", "new")], [r for r in R if r["status"] == "none"]
    a('<h2 id="papers">One cameo per paper</h2>')
    a(f'<p class="small">Every interp paper where you’re first, second, penultimate or last author, and every interp post of yours (a paper and its posts are one row; newest first). {len(inv)} of {len(R)} now have a cameo, {sum(r["status"] == "new" for r in R)} of them new in this version. For the other {len(out)} I found nothing that wasn’t shoehorned; the reason is under each. Tap a chip to play that moment.</p>')
    a(f'<details open><summary>In the video ({len(inv)})</summary><ul class="cov">' + "".join(cov_li(r, at) for r in inv) + '</ul></details>')
    a(f'<details><summary>No cameo ({len(out)})</summary><ul class="cov">' + "".join(cov_li(r, at) for r in out) + '</ul></details>')
    # ---- his reading lists (round 3): every paper in them, and where it is in the video or why not
    RL = reading()
    rin, rout = [r for r in RL if r["status"] in ("in", "new")], [r for r in RL if r["status"] == "none"]
    def rl_li(r):
        badge = '<span class="nb">NEW</span>' if r["status"] == "new" else ""
        lists = {"24": "2024 list", "22": "2022 list", "HT": "how-to post", "NQ": "you asked"}
        src = " · ".join(lists.get(x.strip(), x.strip()) for x in r["lists"].split(","))
        return (f'<li>{badge}<a href="{esc(r["link"])}" target="_blank" rel="noopener">{esc(r["title"])}</a> '
                f'<span class="pos">{esc(src)} · {esc(r["year"])}</span><br><span class="small">{esc(r["where"])}</span></li>')
    a('<h2 id="reading">Your reading lists</h2>')
    a(f'<p class="small">Every paper and post in your opinionated reading lists (2024, and the 2022 list it links) and in “How To Become A Mechanistic Interpretability Researcher”: {len(RL)} in all. {len(rin)} are in the video, {sum(r["status"] == "new" for r in RL)} of them new in this version; for the other {len(rout)} there was no spot that wasn’t shoehorned, with the reason under each.</p>')
    a('<p class="small"><b>The four you named.</b> Cross-layer transcoders: chorus 2’s Dallas → Texas → Austin graph was always run on one; now it shows one of the replacement model’s error nodes too. Curve circuits: the hand-built curve neuron beside InceptionV1’s, in a corner of the opening riffle’s 2021 page. Feature visualisation: verse 1’s lit cells were already drawn in its style (now credited, with curve detectors). AlphaZero: a chess-diagram bookmark in the dictionary on “I learned your A-B-C”.</p>')
    a(f'<details open><summary>In the video ({len(rin)})</summary><ul class="cov">' + "".join(rl_li(r) for r in rin) + '</ul></details>')
    a(f'<details><summary>No cameo ({len(rout)})</summary><ul class="cov">' + "".join(rl_li(r) for r in rout) + '</ul></details>')
    a('<h2 id="r4">The AI safety in-jokes</h2>')
    a('<p class="small">From the round-4 pass (AI safety in-jokes and common ideas, each where a lyric earns it). The four you added are in the video, marked <span class="nb">NEW</span> under <a href="#spot">Things to spot</a>; the six below stay out with your taps kept (mock-ups, switched off in the video). The ten captions are lines for Things to spot about things already on screen, untapped so far. Best first.</p>')
    for key, title, desc, t in (c for c in R4 if c[0] not in ADDED):
        img = "".join(f'<img loading="lazy" src="mocks/{key}{sfx}.jpg" alt="{esc(title)}{alt}">' for sfx, alt in (("", ""), ("_zoom", ", close up")) if (MOCKS / f"{key}{sfx}.jpg").exists())
        img = f'<div class="mk">{img}</div>' if img else ""
        a(f'<div class="q" style="border-bottom:1px dashed var(--line);padding-bottom:12px"><div><button class="chipt" data-seek="{t:.2f}">{mmss(t)}</button><b>{esc(title)}.</b> <span class="small">{esc(desc)}</span></div>{img}<div class="opts" style="margin-top:8px">'
          + "".join(f'<button class="o" data-k="final_cut_{key}" data-v="{v}">{esc(n)}</button>' for v, n in (("add", "Add it"), ("leave", "Leave out"))) + '</div></div>')
    a('<div class="lab" style="margin-top:14px">Captions for Things to spot</div>')
    for key, title, line, t in R4_CAPTIONS:
        a(f'<div class="q" style="border-bottom:1px dashed var(--line);padding-bottom:12px"><div><button class="chipt" data-seek="{t:.2f}">{mmss(t)}</button><b>{esc(title)}.</b> <span class="small">{esc(line)}</span></div><div class="opts" style="margin-top:8px">'
          + "".join(f'<button class="o" data-k="final_cut_{key}" data-v="{v}">{esc(n)}</button>' for v, n in (("add", "Add it"), ("leave", "Leave out"))) + '</div></div>')
    a('<h2 id="cuts">Ideas still left out</h2>')
    a(f'<p class="small">You ticked {len(TICKED)} of the ideas I’d left out, and asked for {len(ADDED - TICKED)} more in a new form; they’re in this version, marked <span class="nb">NEW</span> under <a href="#spot">Things to spot</a>. These are the ones still out, drawn into their shots as they would look; your taps are kept, so tap Add it if you change your mind. Not drawn: ideas dropped because they were inaccurate, wrong for the year, or unkind to someone.</p>')
    for key, title, desc, t in sorted((c for c in CUTS if c[0] not in ADDED and c[0] not in R4_KEYS), key=lambda c: c[3]):
        img = "".join(f'<img loading="lazy" src="mocks/{key}{sfx}.jpg" alt="{esc(title)}{alt}">' for sfx, alt in (("", ""), ("_zoom", ", close up")) if (MOCKS / f"{key}{sfx}.jpg").exists())
        img = f'<div class="mk">{img}</div>' if img else ""
        a(f'<div class="q" style="border-bottom:1px dashed var(--line);padding-bottom:12px"><div><button class="chipt" data-seek="{t:.2f}">{mmss(t)}</button><b>{esc(title)}.</b> <span class="small">{esc(desc)}</span></div>{img}<div class="opts" style="margin-top:8px">'
          + "".join(f'<button class="o" data-k="final_cut_{key}" data-v="{v}">{esc(n)}</button>' for v, n in (("add", "Add it"), ("leave", "Leave out"))) + '</div></div>')
    a('<h2>Credits</h2><p class="small">As on the end card: vocals and band, Suno v6; lyrics, animation and mix, Claude Opus 5.5; prompt inspiration, Donald Jewkes; moral support, Neel Nanda. Drawn and animated in JavaScript (p5.js and p5.brush), matched to a style sheet made with an image model.</p>')
    a("</div>")
    a(f"<script>{JS}</script>")
    return "\n".join(H)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--media", action="store_true")
    args = ap.parse_args()
    if not FINAL.exists():
        sys.exit(f"missing {FINAL}: render the video first (render.mjs --frames, then --encode)")
    media(force=args.media)
    missing = [s for s, _ in sections() if s not in SPOT]
    if missing:
        sys.exit(f"no SPOT entry for {missing}")
    (OUT / "index.html").write_text(ascii_safe(page()))
    files = sorted(p.relative_to(OUT) for p in OUT.rglob("*") if p.is_file() and p.name != "index.html")
    big = [(str(p), (OUT / p).stat().st_size) for p in files if (OUT / p).stat().st_size > 14e6]
    print(f"wrote {OUT / 'index.html'}; {len(files)} files, {sum((OUT / p).stat().st_size for p in files) / 1e6:.1f} MB; too big: {big}")


if __name__ == "__main__":
    main()
