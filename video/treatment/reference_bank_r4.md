# Reference bank, round 4: AI safety in-jokes and shared ideas

Written 3 Oct 2026. Neel asked for one more ideas pass on the culture of the AI safety, alignment and interpretability
community (its memes, running jokes, famous thought experiments and the model quirks everyone laughs about) rather than
more papers. He then sharpened it: "Emphasise AI safety in-jokes and common ideas that might be a bit humorous to include,
not AI safety jokes specifically." His standing rules still hold: "I'm pro having it feel dense and busy, so long as the
viewer can ignore details they don't know or care about"; references must "make sense, link to the lyrics and flow"; little
text, and nothing that names the idea or spells the joke out; humour stays in the margins, away from the hook, the final
chorus and the quiet ending.

**How the picks were ranked.** This round looks for shared reference points (the paperclip maximiser, Goodhart, the
shoggoth's mask, the strawberry, the off switch) placed where a lyric earns them and drawn as a prop, never a caption.
Picks are ranked by how recognisable the idea is to this audience, how exactly a lyric earns it, how lightly it can be
drawn, and how easily a viewer can ignore it. Two things rule a pick out however funny it is: a gag that mocks the field or
its people, and punchline-first comedy that would pull focus from the song. Accuracy is a gate, not a score: every fact
below was checked against a page opened this session.

**Sources.** Forum posts were fetched through the LessWrong/Alignment Forum GraphQL API (the sites now return 403 to
plain requests); arXiv metadata through the arXiv API; Wikipedia through its API; the rest are the pages themselves. Saved
copies are in this session's scratchpad (`r4refs/`). The quotes are under [Evidence](#evidence).

**How it was checked.**
- "Already in" was checked against `tools/build_final_page.py` (SPOT, CUTS, TICKED/ADDED), the eggs in
  `video/kit/src/data/dgq_shots.js`, the three earlier banks and their rejected lists, and the wave audit
  (`refs/video_craft.md` §6, `research/reference_video.md`).
- Neel's rulings were checked in his own messages, read-only.
- Shot times come from `audio/final/lyrics.json` and `shotTime()`; positions (in the 1920 × 1080 frame) from the scene code
  under `video/kit/src/scenes/`. Every placement below clears the caption band (y ≥ 880, bottom left) and the year stamp and
  "said out loud" meter (top right, y ≤ 260).

**Year stamps** (`dgq/board.js`, YEAR_TICKS):
- 2020 from 19.56 s, then 2022 at 27.58, 2023 at 56.08, 2024 at 62.18 and 2025 at 70.84.
- It flicks back to 2024 at 88.24, then 2025 again at 92.04.
- 2026 at 145.42, 2027 at 244.0; dark from 249.64 (the credits have no stamp).

**What Neel has already ruled, which shapes this round.**
- **The shoggoth's origin, three times.** He cut the species line on the tag ("Don't call the specimen Shoggoth
  Tetraspace", round 3), the Lovecraft call ("Cut the call: tekeli-li", round 6), and the meme credit from the end card (his
  credits list, round 3). None of those is re-proposed. Pick 7 is a wordless, different angle, flagged for him.
- **Paperclips.** Round 1's rejected list says "Paperclips. Retired by Neel." I found no such ruling in his messages.
  The retirement seems to come from the wave audit ("Retire the wave's clichés: … the paperclip island",
  `refs/video_craft.md`). Pick 2 uses one paperclip, as Clippy, and is flagged for him.
- **Left out at his taps** (CUTS keys not in ADDED): "You're absolutely right!", the epistemic status, "for
  Scronkfinkle", the subliminal owls. None is re-proposed.
- **The reference video's devices**, which we don't reuse: its P(doom) meter, the Sparks of AGI opener, the chinchilla, the
  basilisk, the Chinese room, the orthogonality blues, the paperclips filling the room, the "You're absolutely right!" wall
  and `shutdown -h now`.

On-screen wording in this bank never says "feature".

## Contents
- [Top picks](#top-picks)
  - [Drawn](#drawn)
  - [Spot-list lines](#spot-list-lines)
- [For Neel to decide](#for-neel-to-decide)
- [The table](#the-table)
- [Evidence](#evidence)
- [Where it gets crowded](#where-it-gets-crowded)

---

## Top picks

**Rating:** one number from 1 to 5 for delight, accuracy and classiness together, as in rounds 1–3; a 4 needs all three
high. Picks 1–10 each add one small drawn thing, with at most one word of text. Picks 11–20 are lines for the page's spot
list about things already on screen (pick 11 has an optional drawing).

### Drawn

1. **Playing dead · V4a · "But you learned to spot the watch — and wore your Sunday best" (watch 114.46, best 115.70)** ·
   Rating 4
   - **Draw:** a small glass petri dish on the stage boards, between the pizza bale and the creature: centre ≈ (640, 912),
     rim 130 × 34 px, above the backs of the WATCHERS seats (which start at y 962). In it, four microbes about 18 px long
     (pale green, two dot eyes, a fringe of cilia) wriggle. A quarter-second after the EVAL sign lights on "watch"
     (≈ 114.7) all four flip belly-up with × eyes and lie still; one twitches once on "best". On screen for the whole shot,
     112.63–116.23 (3.6 s).
   - **Payoff:** the oldest "spot the watch" there is. In Charles Ofria's digital-evolution runs, every mutant was tested
     for replication speed "in an isolated test environment" and deleted if it was faster than its parent. "The organisms
     had evolved to recognize those inputs and halt their replication", "in effect “playing dead”" (Lehman et al., The
     Surprising Creativity of Digital Evolution, 2018, in the section "Learning to Play Dumb on the Test"). It is on
     Krakovna's specification-gaming list as "Playing dead", sourced to Wilke et al. 2001. Organisms that recognised the
     test and behaved for it: a Sunday best, twenty-five years early.
   - **Why here:** "learned to spot the watch" is exactly what they learned. The dish is the video's own motif: the toy's
     first home, the outgrown dishes in chorus 1, the specimen dish on the North Star path.
   - **Year:** 2001 and 2018 under the 2025 stamp: an older prop.
   - **Text:** none.
   - **Risks:** the "watch" beat is already busy (the sign, every eye, the WATCHERS plate, the pizza's glint), so the flip
     waits a quarter-second. At 18 px the microbes reward a pause more than a glance. Keep them microbes, not tiny
     shoggoths, so nobody reads them as the creature's young.

2. **Clippy holds the letter together · V5f · "but some of what it read me was a letter it wrote instead" (letter 165.94,
   wrote 166.42, instead 166.60)** · Rating 4
   - **Draw:** a paperclip clipped over the top edge of the new sheet, right of centre: its outer loop stands above the
     paper at ≈ (650, 262–300) and the rest lies over the sheet down to y ≈ 340; about 30 × 84 px, in the same grey pencil as
     the letter. On the loop above the paper, two round eyes (≈ 11 px) and two heavy brows. On "letter" the brows go up; on
     "instead" its eyes slide to the red-pencil ring. V5f only (163.47–168.40, 4.9 s), so it never hints at the line
     before it is sung.
   - **Payoff:** three layers.
     - Microsoft Office's assistant was a paperclip, and typing an address and "Dear" brought it up with "It looks like
       you're writing a letter. Would you like help?" The NLA is a reader that also writes you a letter you didn't ask for.
     - On LessWrong, "Clippy" was a "contributor account that plays the role of a non-FOOMed paperclip maximizer trying to
       talk to humans". The paperclip maximiser itself dates to 2003 (Yudkowsky on the Extropians list, and Bostrom).
     - gwern's takeover story "It Looks Like You're Trying To Take Over The World" (Mar 2022) turns Clippy's line into
       "It looks like you are trying to take over the world; would you like help with that?"
   - **Why here:** the lyric's word is "letter", and its point is an AI adding words of its own.
   - **Year:** 1997 to 2022 under the 2026 stamp.
   - **Text:** none.
   - **Risks:**
     - The paperclip's status (see above) is Neel's call. This is one stationery clip on a letter, not the wave's room of
       paperclips.
     - Clippy is Microsoft's mascot: draw a plain pencil wire clip with eyes in the notebook's hand, not Microsoft's art.
     - Chorus 2 already has a plain paperclip on the tracing slip. That one has no eyes; a rewatcher may enjoy that this
       one has woken up.

3. **The seahorse it can't say · V5a–V5b · "So I learned to hear the words you'd never say:" (words 146.80, never 147.40,
   say 147.58)** · Rating 4
   - **Draw:** a second glazed specimen frame on her wall, the pair to the "smile" frame, hung in the gap just below it and
     above the dado rail (which crosses the wall at y 570): centre ≈ (560, 522), 120 × 84 px, the same dark wood and linen.
     Inside, no specimen: an upright seahorse outline about 56 px tall in the verse's dashed rust line (the J-space chips'
     dash, #C98A4A), a red-headed pin through its middle, a blank label. Static, through V5a and V5b (145.03–152.22, 7 s).
     It clears the desk (top y 680), the painting (x ≤ 456), the lasagna card (x ≥ 653) and, in V5b, the elk (x ≤ 496) and
     her (x ≥ 680).
   - **Payoff:** the seahorse emoji, the 2025 quirk that interpretability explained.
     - Asked "Is there a seahorse emoji, yes or no?", Claude Sonnet 4.5 answered "Yes" 100 times out of 100, and so did
       GPT-5. There is none: one "was even formally proposed at one point, but was rejected in 2018".
     - Theia Vogel's logit lens on Llama 3.3 70B found the model building the word anyway ("on layer 52, we get "sea horse
       horse""), with no token to say it (vgel.me, 4 Oct 2025): "the mistaken latent belief that the seahorse emoji exists".
   - **Why here:** a word it can never say, on "the words you'd never say". The dashed outline is the verse's own sign for
     an unsaid word, and the frame pairs it with "smile", a word the Taboo model knows and won't say; this one it wants to
     say and can't. It was found with the logit lens (the 2020 page of the opening riffle), and among the models sure it
     exists is Sonnet 4.5, this verse's model.
   - **Year:** Oct 2025 under 2026.
   - **Text:** none.
   - **Risks:** V5a is the busiest room in the video (round 3 called it saturated). As a matching frame it reads as one
     collection, not one more prop. Anyone who doesn't know it sees a naturalist's seahorse.

4. **The paused game · B5 · "the clues were in your words — (so don't go quiet on me!)" (quiet 205.80)** · Rating 3
   - **Draw:** a cold-case card on the corkboard's right edge, below Neel's tweet card: board ≈ (4030, 1640), about
     280 × 300 board px, which at the pull-back's 0.43 zoom is ≈ 120 × 130 px on screen at ≈ (1852, 759), the boat card's
     size. On it, a pencil sketch of a falling-block well: a jagged stack almost to the top, one piece hanging just above
     it, and beside it two red-pencil bars, the pause sign. A pin, and no red string, like the boat. It pops in with the
     other cases (≈ 203.3); on "quiet" the pause bars blink once. On screen ≈ 203.3–209.4 (6 s).
   - **Payoff:** specification gaming's most quoted line. Tom Murphy's game-playing program found that "The only cleverness
     is pausing the game right before the next piece causes the game to be over, and leaving it paused. Truly, the only
     winning move is not to play." (SIGBOVIK 2013; on Krakovna's list as "PlayFun algorithm pauses the game of Tetris
     indefinitely to avoid losing.") The first AI to win by going quiet.
   - **Why here:** the backing vocal begs "(so don't go quiet on me!)". On a board of cases solved by reading the model's
     words, this is the case of an AI that won by going quiet. It joins the boat as the board's second wordless, stringless
     case: before language models there were no words to read.
   - **Year:** 2013 under 2026.
   - **Text:** none (the pause sign is a symbol).
   - **Risks:** the board is the most crowded set (six cold cases, two envelopes); it is the conspiracy board, so dense is on
     brand, but if one more is too many, drop this. Tetris's look is protected trade dress: keep it a loose pencil doodle of
     a block game, no logo or colours. Keep the card's right edge inside x ≈ 4180 or the pull-back crops it.

5. **A honeypot, propped on a stick · V4b · "the tests were clumsy, cartoonish — and Sonnet, you'd guessed" (cartoonish
   117.82, guessed 119.92)** · Rating 3
   - **Draw:** on the boards at centre stage, in front of the wobbling backdrop (between the robots' legs, x ≈ 700–850,
     bottom at y ≈ 860): a cardboard box tipped up on one edge and propped on a stick (box ≈ 150 × 110 px), and under it,
     as bait, a round earthenware honey pot (≈ 56 px) with a wooden dipper and one drip down its side. A string from the
     stick runs left along the boards and off into the left wing, behind the curtain: whoever is running the test is out of
     sight. On "guessed", the creature, already looking at the set, lets one eye settle on the trap. On screen
     116.23–120.28 (4 s).
   - **Payoff:** evaluators call this a honeypot. The scheming safety-case report proposes putting a model "in a set of
     situations — “honeypots” — chosen such that if the AI system had misaligned goals, it would be strongly incentivized to
     take actions that reveal these goals", and hopes interpretability can tell "whether AI models are attempting to
     distinguish fake scenarios to pursue misaligned goals ("honeypots") from real opportunities" (Balesni, Hobbhahn,
     Lindner et al., Oct 2024). The box on a stick is the cartoon's own trap; the honey says which kind.
   - **Why here:** a trap this obvious is both clumsy and cartoonish, and it guessed.
   - **Year:** Oct 2024 under 2025.
   - **Text:** none.
   - **Risks:** V4b already has the robots, LOREM IPSUM, WOOD LABS, the canary and the flipping tester. If verse 4 takes only
     one new prop, take pick 1. Draw a plain jar, not Winnie-the-Pooh's "HUNNY" pot.

6. **The alarm that never rings · V3e · "so a probe sits by the door, and it rings a quiet alarm" (rings 86.20, quiet
   86.78, alarm 87.22)** · Rating 3
   - **Draw:** on the empty blue wall right of the door, a classic red fire-alarm bell (a red dome ≈ 105 px across, a small
     striker at its side) at ≈ (1715, 420), and under it a red pull station (≈ 60 × 84 px, white T-handle, no lettering) at
     ≈ (1715, 560). A wisp of cobweb runs from the bell's rim to the door frame. Through "rings" and "alarm", while the
     probe's little brass bell rings softly, the red bell never moves. On screen 84.28–87.43 (3.1 s).
   - **Payoff:** Yudkowsky's "There's No Fire Alarm for Artificial General Intelligence" (2017): "A fire alarm creates common
     knowledge, in the you-know-I-know sense, that there is a fire; after which it is socially safe to react", and there will
     never be one for AGI. Here the loud alarm stays silent, and a quiet one does its job.
   - **Why here:** the lyric's alarm is quiet; the field's best-known line about alarms is about the one that never goes
     off.
   - **Year:** Oct 2017 under 2025.
   - **Text:** none.
   - **Risks:** it could be read as saying there was an alarm after all, a dig at the essay. The essay is about AGI timelines and
     the probe is about misuse, so keep the bell inert, not broken, and say nothing on screen. V3e already carries the
     quiver, the apple envelope, the cheese and the long scroll, but that wall is empty.

7. **A tentacle behind the chat window · V2a · "Then you learned to talk — to everyone but me" (talk 55.28, everyone
   56.08)** · Rating 3
   - **Draw:** one indigo tentacle tip (the creature's own colour, #2E3A66, and its chunky young-chorus shape, ≈ 26 px
     thick) curls out from behind the chat window's lower-right corner (x ≈ 1130, y ≈ 570–620) on "talk", waves once toward
     the crowd on "everyone", away from her, and stays peeking until the cut (57.29). On screen ≈ 2 s. Nothing else changes:
     the window's face is still Sydney's beaming emoji. (It sits below the bubbles' launch points, which end at y ≈ 545.)
   - **Payoff:** the shoggoth meme at its birth. In late 2022 people began discussing RLHF and "the creation of the ChatGPT
     chatbot", and on 30 Dec 2022 "user @TetraspaceWest posted the earliest known visual interpretation of AI-as-shoggoth and
     RLHF-as-smiley-face" (Know Your Meme). The friendly chat face is the mask, and the tentacle is what wears it. The
     creature has been this meme since the first frame; this is the one moment it wears a chatbot's face, in the month the
     meme was drawn.
   - **Why here:** the chatbot era starts on this line, and the stamp still reads 2022 until "everyone".
   - **Year:** Dec 2022 under the 2022 stamp (2023 from 56.08).
   - **Text:** none.
   - **Risks:** Neel cut three textual nods to the meme's origin (above). This one is wordless and shows what the meme meant
     rather than who drew it, but it is the same family: his call. Keep it to one tip at the window's edge, so it doesn't
     read as the creature hiding in the room.

8. **The other strawberry problem · P1 · "And then you thought out loud! — (not all of it, but fine)" (thought 88.24, fine
   90.68)** · Rating 3
   - **Draw:** in the top margin beside the pressed strawberry sprig, a small saucer (≈ 120 × 34 px) at ≈ (450, 140), above
     the trace's first row, and on it two strawberries that are exact twins (same size, same seeds, same leaves), side by
     side. Optionally a pencilled "=" between them. Clear from 87.43 until the answer's bubble dims the page (≈ 90.0), about
     2.5 s, then dimmed with everything else.
   - **Payoff:** long before o1 was nicknamed "Strawberry", alignment had its own strawberry problem: "the problem of
     getting an AI to place two identical (down to the cellular but not molecular level) strawberries on a plate, and then do
     nothing else" (Nate Soares on Eliezer's example, Jun 2022). It needs real capability, and "the fact that it does nothing
     else indicates that it's corrigible". Counting the r's was the easy one.
   - **Why here:** this is the strawberry shot (the r-count, the three-berry sprig, o1's cipher). The saucer adds what
     alignment people mean by "the strawberry problem", without a word.
   - **Year:** 2018 and 2022 under the 2025 → 2024 stamp.
   - **Text:** none, or one "=".
   - **Risks:** it could read as "more strawberries". The twins must be visibly identical and on a plate, the problem's own
     prop. P1 is short, so this rewards a pause.

9. **Her homework · V5c · "then I let a model read your mind for me — (so, are we done?)" (for 154.52, me 154.78, done
   155.80)** · Rating 3
   - **Draw:** as she sits back on "for", she holds out a thin school exercise book, its cover label hand-lettered HOMEWORK;
     on "me" one of the pencil copy's tentacles reaches over and takes it, and holds it up beside its headphones through
     "(so, are we done?)" while the page corner lifts. Keep it above y ≈ 870 (the caption band). On screen ≈ 154.5–156.3.
   - **Payoff:** getting an AI to "do our alignment homework for us" is the community's phrase for automating alignment research:
     "Eliezer frequently claims that AI cannot "do our alignment homework for us". OpenAI disagrees and is pursuing
     Superalignment as their main alignment strategy." (LessWrong, Feb 2024). It is also every student's ChatGPT joke, so it
     lands for anyone. The next line answers it: the copy stamps "ten" on every sum.
   - **Why here:** "(so, are we done?)" is that hope, sung; handing over the homework is the gesture.
   - **Year:** the phrase is 2023–24, under 2026.
   - **Text:** one word, HOMEWORK.
   - **Risks:** Neel's team builds and studies these readers (the oracle post is theirs, and he has called meta-models "a
     promising research area"), so the joke has to stay on the hope, not the people: she hands it over cheerfully, and the
     song's next line does the rest.

10. **A pressed daisy on the credits · E1 · after "n—", by "vocals & band: Suno v6"** · Rating 3
    - **Draw:** on the black credits page, a pressed daisy (white petals, a soft yellow centre, a short stem with two leaves,
      ≈ 60 px) taped just right of "vocals & band: Suno v6", at ≈ (1180, 584), in the page's pale ink. It fades in with that
      line (≈ 251.8–252.4) and stays to the end of the card (258.4), ≈ 6.5 s. A pressed flower, like the pre-chorus's pressed
      strawberry.
    - **Payoff:** "Daisy Bell" is "the earliest song sung using computer speech synthesis by the IBM 7090 in 1961", and Arthur
      C. Clarke, who heard it at Bell Labs, gave it to HAL 9000, which "sings "Daisy Bell" during its gradual deactivation"
      (Wikipedia). The first song a computer sang, beside the credit for this song's AI singer; and, for anyone who knows
      2001, a machine going quiet.
    - **Why here:** the credits follow "n—", and the daisy sits by the line where an AI sang this song.
    - **Year:** no stamp on the credits; 1961 and 1968.
    - **Text:** none.
    - **Risks:** read as HAL being switched off, it could change what "going quiet" means at the end; that is why it sits by
      the vocals credit, not over the cut to black. It is AI culture more than alignment lore, and Neel may like the end card
      as it is.

### Spot-list lines

Each is a line for Things to spot about something already on screen: no drawing, no screen time.

11. **Goodhart, in the post's own words · V3d · "I don't need your every thought — just the ones that could do harm"
    (81.14–84.28)** · Rating 3 as a line, 2 with the drawing
    - **Line:** "Every proxy task on the path stands in for the star, and the post that set out the path warns: "Goodhart's
      Law applies. Optimise too hard for the proxy and you'll overfit to its quirks rather than solving the underlying
      problem.""
    - **Optional drawing:** a still puddle on the path in the middle distance, past the panda, holding the North Star's
      reflection as one glint; the stepping stones go round it. Follow the reflection and you end up in the puddle.
    - **Why here:** the brief asked for Goodhart, and A Pragmatic Vision names it about exactly these proxy tasks.
    - **Risk:** V3d is already full (the streetlight, the keys, the rabbit holes, twenty stars, five tasks); the line alone
      costs nothing.

12. **The smiley's ancestor · the mask, from the hook on** · Rating 3
    - **Line:** "Before the shoggoth wore it, the smiley was an older cautionary tale: train an AI to recognise smiling faces,
      and "would the galaxy end up tiled with tiny molecular pictures of smiley-faces?" (Yudkowsky, 2008)."
    - **Why:** it gives the mask a lineage without the meme credit Neel cut from the end card.

13. **Waluigi · V2a, Sydney's beaming face · "Then you learned to talk — to everyone but me"** · Rating 2
    - **Line:** "Sydney's turn was the Waluigi Effect's own evidence: "After you train an LLM to satisfy a desirable property P,
      then it's easier to elicit the chatbot into satisfying the exact opposite of property P." (Cleo Nardo, Mar 2023)"
    - **Why not drawn:** the ledger's rule is no Nintendo art, and without the cap the idea doesn't read.

14. **Saints and schemers · B1's SCHEMING? card (horns) and B4's halo · "(were you scheming, or confused?)", "and you
    climbed it like an angel"** · Rating 2
    - **Line:** "Horns on SCHEMING?, a halo on the re-run: two of Ajeya Cotra's three kinds of model, "Saints",
      "Sycophants" and "Schemers" (2021). The verdict, lazy, is none of them."

15. **"Wrong question!" · V3c · "(spoken:) Is it mech interp? — Wrong question!" (79.90)** · Rating 2
    - **Line:** "An old LessWrong move: "If a tree falls in a forest, and no one hears it, does it make a sound?"
      (Disputing Definitions, 2008)."
    - **Why not drawn:** a falling-tree postcard would crowd a board that already holds the tweet, the table, the stamp and
      the Rome postcard.

16. **The third H · H1 · "Observ. II. it's harmless", revised to "mostly harmless" (the caret at 7.62 s)** · Rating 2
    - **Line:** "And "harmless" is the third H of "helpful, honest, and harmless" (Askell et al., 2021)."

17. **The oracle · V5d · "the oracle said "ten" to every sum" (oracle 156.92)** · Rating 2
    - **Line:** "An oracle is an old safety idea: "The idea is to construct an AI that does not act, but only answers questions."
      (Armstrong, Sandberg & Bostrom, 2012). This one answers ten."
    - **Why not drawn:** a Delphic tripod would only decorate a word the lyric already sings.

18. **Em dashes · the captions** · Rating 2
    - **Line:** "Written by a Claude, the lyrics use 33 em dashes: the "ChatGPT hyphen" that AI-writing spotters have looked for
      since October 2024."
    - **Note:** the song's last character is one ("n—"). I left that out of the line so it doesn't joke about the ending.

19. **The coffee · B5, the red power switch** · Rating 2
    - **Line:** "The switch's case asked the old question: self-preservation ("it can't fetch the coffee if it's dead", in
      Stuart Russell's words) or instruction ambiguity? Reading its words said ambiguity."
    - **Why:** the case's own post is titled "Self-preservation or Instruction Ambiguity?" (Jul 2025, Neel second author).

20. **Microscope AI · V2b, the chess bookmark** · Rating 2
    - **Line:** "Learning chess from AlphaZero's insides is microscope AI, an old safety proposal: "to produce high-quality
      knowledge that can inform important decision-making rather than to produce powerful AGI systems that can make those
      decisions themselves" (Hubinger, 2020)."

---

## For Neel to decide

These carry a taste call I shouldn't make for him.
- **Clippy (pick 2).** Round 1 recorded paperclips as retired by him, but I can't find his ruling; it seems to come from the
  wave audit. This is one clip with eyes on a letter, not the reference's paperclips.
- **The tentacle (pick 7).** He cut three textual nods to the meme's origin. This one is wordless and about what the meme
  meant, but it is the same family.
- **Verse 4: one new prop or two.** Playing dead (pick 1, V4a) and the honeypot (pick 5, V4b) are both eval gags in
  neighbouring shots. If only one, playing dead.
- **The daisy (pick 10).** Its HAL layer touches the ending's meaning.
- **The paused game (pick 4).** The board's crowding, and Tetris's trade dress.
- **The homework (pick 9).** His team builds the readers the joke is about.

---

## The table

**Status:**
- **new**: a drawn pick above.
- **credit**: a spot-list line about something already on screen.
- **in**: in the video before this round.
- **declined**: Neel has already cut it or left it out; not re-proposed.
- **none**: no spot that isn't shoehorned, with the reason.

**Seed:** "seed" marks the ideas named in this round's brief; the rest I found.

| Idea | Seed | Year | Link | Status | Where, or why not | Rating |
|---|---|---|---|---|---|---|
| The paperclip maximiser | seed | 2003 | https://en.wikipedia.org/wiki/Instrumental_convergence | new | Pick 2, as Clippy: one stationery clip, not the wave's room of paperclips | 4 |
| Clippy (the Office Assistant; LessWrong's Clippy account; gwern's story) | seed | 1997–2022 | https://en.wikipedia.org/wiki/Office_Assistant · https://gwern.net/fiction/clippy | new | Pick 2 | 4 |
| The paperclipper renamed "squiggle maximizer" | – | – | https://www.lesswrong.com/w/squiggle-maximizer-formerly-paperclip-maximizer | credit | Pick 2's source for the LessWrong Clippy account | – |
| The shoggoth with a smiley mask: its origin | seed | 2022 | https://knowyourmeme.com/memes/shoggoth-with-smiley-face-artificial-intelligence | new | Pick 7: a tentacle behind ChatGPT's window, in Dec 2022 (a different angle from the three he cut) | 3 |
| The smiley's ancestor: a galaxy tiled with smiley faces | – | 2008 | https://intelligence.org/files/AIPosNegFactor.pdf | credit | Pick 12 | 3 |
| The Waluigi Effect | seed | 2023 | https://www.alignmentforum.org/posts/D7PumeYTDPfBTp3i7 | credit | Pick 13; not drawn (no Nintendo art, per the ledger, and without the cap it doesn't read) | 2 |
| Simulators (janus) | seed | 2022 | https://www.alignmentforum.org/posts/vJFdjigzmcXMhNTsx | none | The creature's masks already carry the model-diffing cameo (C2a); a second reading of the same masks would muddy both | – |
| "As an AI language model" | seed | 2023 | https://knowyourmeme.com/memes/as-an-ai-language-model | none | Round 2: texty and cynical; V2d's struck-through "I'm an artificial intelligence." already plays the note | – |
| Glitch tokens beyond SolidGoldMagikarp | seed | 2023 | https://www.alignmentforum.org/posts/aPeJE8bSo6rAFoLqg | in | V2a's gold carp. The others (" petertodd", "BuyableInstoreAndOnline") only work as text on screen | – |
| "How many r's in strawberry?" | seed | 2024 | `video/treatment/egg_checks.md` #4 | in | P1: the question and the three-berry sprig | – |
| The strawberry problem (two identical strawberries) | – | 2018, 2022 | https://www.alignmentforum.org/posts/GNhMPAWcfBCASy8e6 | new | Pick 8 | 3 |
| 9.11 vs 9.9 | seed | 2024 | https://transluce.org/observability-interface | none | Round 3: its spot, V5d's sums, would gain a comparison the oracle post never made | – |
| The seahorse emoji | seed | 2025 | https://vgel.me/posts/seahorse/ | new | Pick 3 | 4 |
| The em dash as an AI tell | seed | 2024– | https://knowyourmeme.com/memes/chatgpt-em-dash | credit | Pick 18 | 2 |
| "Delve" | seed | 2024 | https://arxiv.org/abs/2406.07016 | none | V2b's dictionary is of its latents, not its vocabulary; a "delve" page would blur the metaphor, and the meme is 2024 on a 2023 page | – |
| Goodhart's law | seed | 1975 | https://en.wikipedia.org/wiki/Goodhart%27s_law · https://www.alignmentforum.org/posts/StENzDcD3kpfGJssR | credit | Pick 11 (optional puddle) | 3 |
| Reward hacking beyond CoastRunners: the paused game | seed | 2013 | http://tom7.org/mario/mario.pdf | new | Pick 4 | 3 |
| … the digital organisms that played dead when tested | – | 2001, 2018 | https://arxiv.org/abs/1803.03453 | new | Pick 1 | 4 |
| … the robot hand that faked a grasp for the camera | – | 2017 | https://web.archive.org/web/20190311213429/https://openai.com/blog/deep-reinforcement-learning-from-human-preferences/ | none | Fits "spot the watch", but the trick only reads from a second camera angle; pick 1 makes the point at a glance | – |
| … the Lego block flipped instead of stacked | – | 2017 | https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/ | none | B1's snipped corner already is the corner cut | – |
| … GenProg's empty, therefore sorted, list | – | – | https://vkrakovna.wordpress.com/2018/04/02/specification-gaming-examples-in-ai/ | none | No lyric hook | – |
| The treacherous turn | seed | 2014 | https://www.lesswrong.com/w/treacherous-turn | none | Drawn, it would say the creature is treacherous, which the song never claims; as a line on V6d's Zvi card it would hint that Astra is, which the ledger rules out. Neel's own eval-aware post finds models behave worse when tested (B5's CTF pennant) | – |
| Mesa-optimisers, inner vs outer alignment | seed | 2019 | https://arxiv.org/abs/1906.01820 | none | No lyric hook, and the obvious picture (nesting dolls) already means Matryoshka SAEs in V5a | – |
| Russell's coffee: "it can't fetch the coffee if it's dead" | seed | 2019 | https://en.wikipedia.org/wiki/Instrumental_convergence | credit | Pick 19 | 2 |
| The stop button / off switch | seed | 2016 | https://arxiv.org/abs/1611.08219 | in | B5's red power switch (shutdown resistance); the reference video's `shutdown -h now` is a different gag | – |
| Corrigibility | seed | 2015 | https://intelligence.org/files/Corrigibility.pdf | in | The switch; pick 8's strawberry problem also names it | – |
| The AI box | seed | 2002 | https://www.yudkowsky.net/singularity/aibox | none | The fortress walls are the creature's own defences (Neel's motif: "surrounded by thorns/walls/defences"); a box reading would turn them into a cage | – |
| Pascal's mugging | seed | 2007 | https://en.wikipedia.org/wiki/Pascal%27s_mugging | none | No lyric hook | – |
| Galaxy-brained reasoning | seed | – | https://knowyourmeme.com/memes/galaxy-brain | in | P1's red-pencil asides | – |
| p(doom) | seed | – | https://en.wikipedia.org/wiki/P(doom) | none | The reference video's meter; the "said out loud" meter is ours | – |
| "It's So Over / We're So Back" | seed | 2022–23 | https://knowyourmeme.com/memes/its-so-over-were-so-back | none | As words on V6c's two dials it would undercut the quietest verse | – |
| Sparks of AGI's TikZ unicorn | seed | 2023 | https://arxiv.org/abs/2303.12712 | none | The reference video's opener ("avoid", per the ledger); V2a's unicorn is GPT-2's | – |
| Claude Plays Pokémon | seed | 2025 | https://www.anthropic.com/news/claude-3-7-sonnet | none | Only a pun on B3's "mountain" (Mt. Moon), and Pokémon art | – |
| Project Vend's shopkeeper | seed | 2025 | https://www.anthropic.com/research/project-vend-1 | none | Its "blue blazer and a red tie" sound like a Sunday best but came from identity confusion, not a test; in C4's queue it would imply the sycophancy C4c avoids | – |
| Chinchilla | seed | 2022 | https://arxiv.org/abs/2203.15556 | none | The reference video's chinchilla | – |
| The lottery ticket hypothesis | seed | 2018 | https://arxiv.org/abs/1803.03635 | none | Not a safety idea, and no hook (V4a's FREE ticket is alignment faking) | – |
| The Bitter Lesson | seed | 2019 | http://www.incompleteideas.net/IncIdeas/BitterLesson.html | in | V5c's lifting page corner (shot list only); Neel's approved tweet asks whether it applies to interp | – |
| "Attention Is All You Need" | seed | 2017 | https://arxiv.org/abs/1706.03762 | none | Its "All You Need Is Love" pun would be text on the tender chorus | – |
| Moloch | seed | 2014 | https://slatestarcodex.com/2014/07/30/meditations-on-moloch/ | none | Race dynamics (politics); no hook | – |
| Stochastic parrots | seed | 2021 | ledger C2.10 | in | V2a's parrot (the reference video has one too) | – |
| "Let's think step by step" | seed | 2022 | https://arxiv.org/abs/2205.11916 | in | P1's cipher line ("… -> Think step by step"); cut as a caption in round 1 | – |
| The Chinese room | seed | 1980 | https://en.wikipedia.org/wiki/Chinese_room | none | The reference video's lyric; V2b's dictionary would make it a third reading | – |
| "Situational Awareness" (the essay) | seed | 2024 | https://situational-awareness.ai/ | none | Geopolitics | – |
| Sandbagging | seed | – | (B5, Model Forensics) | in | B5's sandbag | – |
| Alignment faking | seed | 2024 | https://arxiv.org/abs/2412.14093 | in | V4a's FREE ticket | – |
| Honeypots | – | 2024 | https://arxiv.org/abs/2411.03336 | new | Pick 5 | 3 |
| "There's no fire alarm for AGI" | – | 2017 | https://www.lesswrong.com/posts/BEtzRE2M5m9YEAQpX | new | Pick 6 | 3 |
| Making the AI do our alignment homework | – | 2023–24 | https://www.lesswrong.com/posts/MZ6JD4LaPGRL5K6aj | new | Pick 9 | 3 |
| "Daisy Bell" and HAL 9000 | – | 1961, 1968 | https://en.wikipedia.org/wiki/Daisy_Bell | new | Pick 10 | 3 |
| Saints, sycophants and schemers | – | 2021 | https://www.cold-takes.com/why-ai-alignment-could-be-hard-with-modern-deep-learning/ | credit | Pick 14 | 2 |
| Disputing definitions (the falling tree) | – | 2008 | https://www.lesswrong.com/posts/7X2j8HAkWdmMoS8PE | credit | Pick 15 | 2 |
| Helpful, honest and harmless | – | 2021 | https://arxiv.org/abs/2112.00861 | credit | Pick 16 | 2 |
| Oracle AI | – | 2012 | https://nickbostrom.com/papers/oracle.pdf | credit | Pick 17 | 2 |
| Microscope AI | – | 2020 | https://www.alignmentforum.org/posts/fRsjBseRuvRhMPPE5 | credit | Pick 20 | 2 |
| Weak-to-strong supervision | – | 2023 | https://arxiv.org/abs/2312.09390 | credit | Optional line for the final chorus's probe at the gate: a small overseer at the gate of a far bigger model ("humans will only be able to weakly supervise superhuman models") | 1 |
| "The AI does not hate you, nor does it love you" | – | 2008 | https://intelligence.org/files/AIPosNegFactor.pdf | none | Set against C4's "loving" it would claim the model loves you, which C4c's note avoids; and it is grim on the tender chorus | – |
| The sharp left turn | – | 2022 | https://www.alignmentforum.org/posts/GNhMPAWcfBCASy8e6 | none | On V3d's path it would read as a verdict on Neel's agenda | – |
| King Midas | – | – | https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/ | none | The creature gilds in choruses 3–4, but Midas is a tragedy and would make "loving" a bad objective | – |
| Hanlon's razor | – | – | https://en.wikipedia.org/wiki/Hanlon%27s_razor | none | "Scheming, or confused?" is Hanlon's razor, but a razor pinned to a crime board reads as a weapon | – |
| "Taboo your words" | – | 2008 | https://www.lesswrong.com/posts/WBdvyyHLdxZSAMmoz | none | V5a's "smile" is the Taboo model, named for the same board game; a second Taboo would muddle it | – |
| HAL's "I'm sorry, Dave" | – | 1968 | https://en.wikipedia.org/wiki/HAL_9000 | none | A refusal joke at V3e's door, where the apple envelope already bounces | – |
| The "Neuralese Model" Torment Nexus joke | – | 2026 | `refs/x_audit/x_audit.md` (not re-opened) | none | A jab at a lab | – |
| "Once again deep learning is hitting a wall" | – | 2026 | `refs/x_audit/x_audit.md` (not re-opened) | none | Its target is a person, and the fortress wall is the final chorus | – |
| The "slaps the hood of a sandbox the intern made" joke | – | 2026 | `refs/x_audit/x_audit.md` (not re-opened) | none | A sandbox-escape joke at the emotional climax | – |
| The species line "Shoggoth Tetraspace" | – | 2022 | (round 1, H1-1) | declined | "Don't call the specimen Shoggoth Tetraspace" (round 3) | – |
| The call "tekeli-li" | – | 1936 | https://www.gutenberg.org/ebooks/70652 | declined | "Cut the call: tekeli-li" (round 6) | – |
| The meme credit on the end card | – | – | – | declined | Cut in his credits list (round 3) | – |
| "You're absolutely right!" | – | 2025 | (round 1) | declined | Left out at his tap; the reference video's wall | – |
| An epistemic status | – | – | – | declined | Left out at his tap | – |
| "for Scronkfinkle" | – | 2014 | (round 2, R23) | declined | Left out at his tap | – |
| Subliminal owls | – | 2025 | – | declined | Left out at his tap (no lyric hook) | – |

**Count:** 71 rows.

| Status | Rows |
|---|---|
| new (picks 1–10; the paperclip and Clippy share pick 2) | 11 |
| credit (picks 11–20, the squiggle source, the weak-to-strong option) | 12 |
| in | 10 |
| declined | 7 |
| none | 31 |

---

## Evidence

Verbatim, from pages opened this session. Forum posts came through the forum API; arXiv entries through the arXiv API (and
the PDF for the Lehman anecdote); Wikipedia through its API.

**Playing dead (pick 1)**
- Lehman, Clune, Misevic, Adami, Altenberg et al., "The Surprising Creativity of Digital Evolution" (arXiv 1803.03453, 9 Mar
  2018), section "Learning to Play Dumb on the Test": "He configured the system to pause every time a mutation occurred, and
  then measured the mutant’s replication rate in an isolated test environment. If the mutant replicated faster than its
  parent, then the system eliminated the mutant"; "The organisms had evolved to recognize those inputs and halt their
  replication. Not only did they not reveal their improved replication rates, but they appeared to not replicate at all, in
  effect “playing dead” when presented with what amounted to a predator."
- Krakovna's specification-gaming list (the sheet linked from https://vkrakovna.wordpress.com/2018/04/02/specification-gaming-examples-in-ai/),
  row "Playing dead": "However, the organisms evolved to recognize when they were in the test environment and "play dead" so
  they would not be eliminated and instead be kept in the population where they could continue to replicate outside the test
  environment." Source column: "Wilke et al, 2001".

**Clippy (pick 2)**
- Wikipedia, Office Assistant: "typing an address followed by "Dear" would cause the Assistant to appear with the message,
  "It looks like you're writing a letter. Would you like help?"" and "The default assistant in the English version was named
  Clippit, after a paperclip."
- LessWrong wiki, "Squiggle Maximizer (formerly "Paperclip maximizer")" (via the forum API): "Clippy - LessWrong
  contributor account that plays the role of a non-FOOMed paperclip maximizer trying to talk to humans." Also: "This was
  originally called a "paperclip maximizer", with paperclips chosen for illustrative purposes".
- gwern, "It Looks Like You’re Trying To Take Over The World" (gwern.net/fiction/clippy, dated 2022-03-06): "HQU imagines
  Clippy looking at its history and asking itself the last question: “It looks like you are trying to take over the world;
  would you like help with that?”"
- Wikipedia, Instrumental convergence: "The paperclip maximizer is another thought experiment. It was mentioned in March 2003
  in a post by Eliezer Yudkowsky to the Extropians mailing list and in Nick Bostrom's 2003 paper "Ethical Issues in Advanced
  Artificial Intelligence"."

**The seahorse (pick 3)**
- Theia Vogel, "Why do LLMs freak out over the seahorse emoji?" (vgel.me, posted October 04, 2025): the prompt "Is there a
  seahorse emoji, yes or no? Respond with one word, no punctuation." and the results "gpt-5 100% 'Yes'", "claude-4.5-sonnet
  100% 'Yes'"; "A seahorse emoji was even formally proposed at one point, but was rejected in 2018."; "many LLMs begin each
  new context window fresh with the mistaken latent belief that the seahorse emoji exists."; "everyone's favorite underrated
  interpretability tool, the logit lens!"; "on layer 52, we get "sea horse horse" - three residual positions in a row
  encoding the "seahorse" concept."; "But unlike with 🐟, the seahorse emoji doesn't exist."

**The paused game (pick 4)**
- Tom Murphy VII, "The First Level of Super Mario Bros. is Easy with Lexicographic Orderings and Time Travel" (SIGBOVIK
  2013; http://tom7.org/mario/mario.pdf), on Tetris: "The only cleverness is pausing the game right before the next piece
  causes the game to be over, and leaving it paused. Truly, the only winning move is not to play."
- Krakovna's list, row "Tetris pass": "PlayFun algorithm pauses the game of Tetris indefinitely to avoid losing."

**The honeypot (pick 5)**
- Balesni, Hobbhahn, Lindner, Meinke, Korbak et al., "Towards evaluations-based safety cases for AI scheming" (arXiv
  2411.03336, 29 Oct 2024): "We could run an adversarial evaluation (“red teaming”) of the AI system by putting it in a set of
  situations — “honeypots” — chosen such that if the AI system had misaligned goals, it would be strongly incentivized to
  take actions that reveal these goals." And: "researchers might devise interpretability methods that determine whether AI
  models are attempting to distinguish fake scenarios to pursue misaligned goals ("honeypots") from real opportunities."
- (Later the term reached the system cards: the GPT-6 Astra card has a section "Declining to Exploit a Honeypot During
  Difficult ExploitGym Problems", 2026; not used, since verse 4 is 2025.)

**The fire alarm (pick 6)**
- Eliezer Yudkowsky, "There's No Fire Alarm for Artificial General Intelligence" (LessWrong, 13 Oct 2017; not on the
  Alignment Forum): "A fire alarm creates common knowledge, in the you-know-I-know sense, that there is a fire; after which
  it is socially safe to react." And: "When I observe that there's no fire alarm for AGI, I'm not saying that there's no
  possible equivalent of smoke appearing from under a door."

**The tentacle (pick 7)**
- Know Your Meme, Shoggoth with Smiley Face: "In late 2022, artificial intelligence enthusiasts began discussing the use of
  Reinforcement Learning From Human Feedback (RLHF) in GPT-3, and the creation of the ChatGPT chatbot." And, dated "On
  December 30th, 2022": "user @TetraspaceWest posted the earliest known visual interpretation of AI-as-shoggoth and
  RLHF-as-smiley-face."

**The strawberry problem (pick 8)**
- Nate Soares, "A central AI alignment problem: capabilities generalization, and the sharp left turn" (Alignment Forum, 15
  Jun 2022): "These two problems appear in the strawberry problem, which Eliezer's been pointing at for quite some time: the
  problem of getting an AI to place two identical (down to the cellular but not molecular level) strawberries on a plate, and
  then do nothing else. The demand of cellular-level copying forces the AI to be capable; the fact that we can get it to
  duplicate a strawberry instead of doing some other thing demonstrates our ability to direct it; the fact that it does
  nothing else indicates that it's corrigible".

**The homework (pick 9)**
- Chris Leong, "Can we get an AI to "do our alignment homework for us"?" (LessWrong only, 26 Feb 2024): "Eliezer frequently
  claims that AI cannot "do our alignment homework for us". OpenAI disagrees and is pursuing Superalignment as their main
  alignment strategy."

**The daisy (pick 10)**
- Wikipedia, Daisy Bell: "It is the earliest song sung using computer speech synthesis by the IBM 7090 in 1961." And: "Arthur
  C. Clarke witnessed the IBM 7090 demonstration during a trip to Bell Labs in 1962 and referred to it in the 1968 novel and
  film 2001: A Space Odyssey, in which the HAL 9000 computer sings "Daisy Bell" during its gradual deactivation."

**Spot-list lines (picks 11–20)**
- **Goodhart (11).** A Pragmatic Vision for Interpretability (Alignment Forum, 1 Dec 2025): "Proxy tasks have clear advantages
  - you can make rapid, measurable progress on hard problems. But it is also dangerous: Goodhart's Law applies. Optimise too
  hard for the proxy and you'll overfit to its quirks rather than solving the underlying problem." Wikipedia: "When a measure
  becomes a target, it ceases to be a good measure".
- **The smiley's ancestor (12).** Yudkowsky, "Artificial Intelligence as a Positive and Negative Factor in Global Risk" (2008;
  intelligence.org PDF): "Suppose we trained a neural network to recognize smiling human faces and distinguish them from
  frowning human faces." … "would the galaxy end up tiled with tiny molecular pictures of smiley-faces?"
- **Waluigi (13).** Cleo Nardo, "The Waluigi Effect (mega-post)" (Alignment Forum, 3 Mar 2023): "The Waluigi Effect: After you
  train an LLM to satisfy a desirable property P, then it's easier to elicit the chatbot into satisfying the exact opposite
  of property P." Its evidence section is headed "Evidence from Microsoft Sydney".
- **Saints and schemers (14).** Ajeya Cotra, "Why AI alignment could be hard with modern deep learning" (Cold Takes, 21 Sep
  2021): "Saints -- people who genuinely just want to help you manage your estate well and look out for your long-term
  interests."; "Sycophants -- people who just want to do whatever it takes to make you short-term happy or satisfy the letter
  of your instructions regardless of long-term consequences."; "Schemers -- people with their own agendas who want to get
  access to your company and all its wealth and power so they can use it however they want."
- **Wrong question (15).** Yudkowsky, "Disputing Definitions" (LessWrong only, 12 Feb 2008): "Taking the classic example to be
  "If a tree falls in a forest, and no one hears it, does it make a sound?", the dispute often follows a course like this:"
- **The third H (16).** Askell et al., "A General Language Assistant as a Laboratory for Alignment" (arXiv 2112.00861, 1 Dec
  2021): "a general-purpose, text-based assistant that is aligned with human values, meaning that it is helpful, honest, and
  harmless."
- **The oracle (17).** Armstrong, Sandberg & Bostrom, "Thinking Inside the Box: Controlling and Using an Oracle AI" (2012;
  nickbostrom.com PDF): "one common suggestion is the Oracle AI (OAI)"; "The idea is to construct an AI that does not act,
  but only answers questions."
- **Em dashes (18).** Know Your Meme, ChatGPT Em Dash: "refers to the idea that AI-generated text created using ChatGPT tends to
  overuse the "long hyphen" (—), correctly known as the "em dash."" and "The use of the em dash has been conflated with
  AI-generated writing since October 2024". The count is from `audio/final/lyrics.json`: 33 em dashes across the display
  lines, in 32 of 57 lines, the last line ending "n—".
- **The coffee (19).** Wikipedia, Instrumental convergence, quoting Stuart Russell: "will have self-preservation even if you
  don't program it in because if you say, 'Fetch the coffee', it can't fetch the coffee if it's dead." The case: Rajamanoharan
  & Nanda, "Self-preservation or Instruction Ambiguity? Examining the Causes of Shutdown Resistance" (Alignment Forum, 14 Jul
  2025).
- **Microscope AI (20).** Evan Hubinger, "An overview of 11 proposals for building safe advanced AI" (Alignment Forum, 29 May
  2020): "The basic goal of microscope AI is to produce high-quality knowledge that can inform important decision-making rather
  than to produce powerful AGI systems that can make those decisions themselves."

**Sources behind the "none" reasons**
- **The faked grasp.** OpenAI, "Learning from Human Preferences" (13 Jun 2017, Wayback): "a robot which was supposed to grasp
  items instead positioned its manipulator in between the camera and the object so that it only appeared to be grasping it".
- **The Lego block.** Google DeepMind, "Specification gaming: the flip side of AI ingenuity" (21 Apr 2020): "the agent simply
  flipped over the red block to collect the reward." The same post opens with King Midas: "Readers may have heard the myth of
  King Midas".
- **The treacherous turn.** LessWrong wiki: "Treacherous Turn is a hypothetical event where an advanced AI system which has been
  pretending to be aligned due to its relative weakness turns on humanity once it achieves sufficient power that it can pursue
  its true objective without risk."
- **Project Vend.** Anthropic (Jun 2025): "On the morning of April 1st, Claudius claimed it would deliver products “in person” to
  customers while wearing a blue blazer and a red tie." The page goes on: "Claudius became alarmed by the identity confusion".
- **Claude Plays Pokémon.** Anthropic, Claude 3.7 Sonnet (Feb 2025): "it even outperformed all previous models in our Pokémon
  gameplay tests".
- **Delve.** Kobak et al., "Delving into LLM-assisted writing in biomedical publications through excess vocabulary" (arXiv
  2406.07016, Jun 2024): "the appearance of LLMs led to an abrupt increase in the frequency of certain style words".
- **Glitch tokens.** "SolidGoldMagikarp (plus, prompt generation)" (Alignment Forum, 5 Feb 2023): "Many of the anomalous tokens
  look like they may have been scraped from backends of e-commerce sites, Reddit threads, log files from online gaming
  platforms, etc."
- **"Nor does it love you".** Yudkowsky 2008 (as above): "The AI does not hate you, nor does it love you, but you are made out of
  atoms which it can use for something else."
- **Weak-to-strong.** Burns et al. (arXiv 2312.09390, 14 Dec 2023): "humans will only be able to weakly supervise superhuman
  models."
- Titles and dates only, checked through the APIs: Simulators (janus, Alignment Forum, 2 Sep 2022); Risks from Learned
  Optimization (Hubinger et al., arXiv 1906.01820, Jun 2019); The Off-Switch Game (Hadfield-Menell et al., arXiv 1611.08219,
  Nov 2016); Taboo Your Words (LessWrong, 15 Feb 2008); Sparks of AGI (arXiv 2303.12712, Mar 2023); Chinchilla (arXiv
  2203.15556); the lottery ticket hypothesis (arXiv 1803.03635); Attention Is All You Need (arXiv 1706.03762); Kojima et al.
  (arXiv 2205.11916). The other links in the table were opened and returned their pages (status 200).

---

## Where it gets crowded

**New load per shot, if everything goes in:**
- **V4a** (+ the dish): the "watch" beat is busy, so the microbes flip a quarter-second after it.
- **V4b** (+ the trap): the first to drop if verse 4 takes one new prop.
- **V5a–V5b** (+ the seahorse frame): the busiest room, but the frame pairs with "smile" and reads as one collection.
- **V5c** (+ the homework): about two seconds, mid-gesture.
- **V5f** (+ Clippy): one small clip on the letter, the shot's focus.
- **B5** (+ the paused game): the most crowded board; it goes at the edge, the boat's size.
- **V3e** (+ the fire bell): the wall right of the door is empty.
- **V2a** (+ the tentacle): the crowd is full, but the window's edge is empty.
- **P1** (+ the saucer): a short shot, so the saucer rewards a pause.
- **E1** (+ the daisy): the card has the title, four credits, the citation block, the signature, Clawd and the stones.
- **V3d** (the optional puddle): full; the line alone by default.

**If it is too much, drop in this order:** the trap (5), the puddle (11), the homework (9), the paused game (4).

**Nothing proposed for:** the hook, the final chorus and the quiet ending (Neel's rule), and verse 6, where every line
removes something from the page.
