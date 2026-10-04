"""Prepare everything to paste into Suno v6 (Custom mode) for a finalist: lyrics, Styles variants, Exclude, sliders.

Usage: python tools/suno_prep.py one_direction [--ver v9] [--no-cut]      (round 1: lyrics/finalists/<slug>/<ver>.lyr)
       python tools/suno_prep.py dont_go_quiet                             (round 2: SOURCES below; no length cap)
Writes audio/suno/<slug>/: lyrics.txt, styles_<name>.txt, exclude.txt, README.md (field-by-field + take log), prep.json

What it does to the locked lyrics (never changes words, only how Suno reads them):
  * applies the 2:19 cut (lyrics/finalists/<slug>/cut_<ver>.json); a section whose lines are all cut is dropped
  * uses the SUNG text (respellings like ESS-AY-EEZ), minus stage directions ("(fast…)", "(held)")
  * replaces the judge-facing section cues with musical ones (CUES below): Suno reads [Section | cue]
  * spoken fragments ("(spoken:) …") go under a [Spoken] tag on their own line; the section tag is repeated after
    them if the section continues, so Suno goes back to singing
  * quote marks are dropped and " — " becomes ", " (Suno phrases on commas; dashes sometimes get sung as pauses
    in odd places)
Styles follow research/music.md §6: genre, BPM, instruments and vocal descriptors, no negatives (those go in Exclude,
because Styles words are read as things to include). Tempo per song comes from its cut file (bpm), chosen so the cut
lyrics fit 2:19 on both length models in tools/syllables.py (A 140, B 150).
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyricfmt import parse  # noqa: E402
from syllables import line_syl, projected, strip_directions  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {  # round-2 finalists (Neel lifted the 2:19 cap for round 2, so there is no cut file)
    "dont_go_quiet": ROOT / "lyrics/round2/rE/12_dont_go_quiet.lyr",
    "whats_on_your_mind": ROOT / "lyrics/round2/rE/11_whats_on_your_mind.lyr",
    "dgq": ROOT / "lyrics/final/dont_go_quiet.lyr",  # THE locked song (Neel's ruling, 1 Oct 2026): A' "Don't Go Quiet On Me"
}
SLIDERS = {"Weirdness": "25%", "Style Influence": "75%", "Variety": "0 (drafts; 30 when exploring)"}

CUES = {  # per song: one (expected section name, Suno tag) per .lyr section, in order
    "one_direction": [
        ("Intro", "Intro | a cappella boy-group gang vocal, then the beat drops"),
        ("Verse 1", "Verse 1 | bouncy, bass and claps, clean male lead, crisp diction"),
        ("Pre-Chorus", "Pre-Chorus | rising, handclaps, the last words half-spoken"),
        ("Chorus", "Chorus | full band, huge unison boy-group hook, the group echoes"),
        ("Verse 2", "Verse 2 | tight groove, stop-time, then the whole group shouts the last line"),
        ("Pre-Chorus", "Pre-Chorus | rising, handclaps"),
        ("Chorus", "Chorus | full band, huge unison hook, the group echoes"),
        ("Verse 3", "Verse 3 | half-rapped, tight, trap hi-hats"),
        ("Pre-Chorus", "Pre-Chorus | rising, handclaps"),
        ("Chorus", "Chorus | full band, huge unison hook, the group echoes"),
        ("Bridge", "Bridge | band drops out, heartbeat kick, soft lead vocal"),
        ("Final Chorus", "Final Chorus | key change up, gang vocals, biggest chorus"),
        ("Outro", "Outro | music fades"),
    ],
    "read_your_mind": [
        ("Intro", "Intro | a cappella girl-group unison hook, then the beat drops"),
        ("Verse 1", "Verse 1 | bright, bouncy, half-sung, crisp diction"),
        ("Pre-Chorus", "Pre-Chorus | one rising line"),
        ("Chorus", "Chorus | full band, unison girl-group hook, the group echoes"),
        ("Verse 2", "Verse 2 | tight groove, stop-time, then the whole group shouts the line"),
        ("Pre-Chorus", "Pre-Chorus | one rising line"),
        ("Chorus", "Chorus | full band, unison hook, a backing vocal answers the last line"),
        ("Verse 3", "Verse 3 | half-rapped, dense, tight"),
        ("Pre-Chorus", "Pre-Chorus | one rising line, then a whispered aside"),
        ("Chorus", "Chorus | tender, lighter drums"),
        ("Bridge", "Bridge | band stops, chanted call and response: lead calls, the group answers"),
        ("Final Chorus", "Final Chorus | key change up, gang vocals, the first line shouted"),
        ("Outro", "Outro | music fades"),
    ],
    "is_this_a_test": [
        ("Intro", "Intro | a nervous solo female voice, then brass stabs"),
        ("Verse 1", "Verse 1 | camp electro-swing, anxious playful female lead, crisp diction"),
        ("Pre-Chorus", "Pre-Chorus | one line, the quote half-spoken, then a sung aside"),
        ("Chorus", "Chorus | full big band, swinging unison hook"),
        ("Verse 2", "Verse 2 | camp swing, patter"),
        ("Pre-Chorus", "Pre-Chorus | one line, the quote half-spoken, then a sung aside"),
        ("Chorus", "Chorus | full big band, swinging unison hook"),
        ("Verse 3", "Verse 3 | half-rapped patter, cramming, fast"),
        ("Pre-Chorus", "Pre-Chorus | one line, robotic, then a relieved sung aside"),
        ("Chorus", "Chorus | full big band, swinging unison hook"),
        ("Bridge", "Bridge | stop-time over a single bass note"),
        ("Final Chorus", "Final Chorus | key change up, disco strings, the singer finally relaxes"),
    ],
    "scheming": [
        ("Intro", "Intro | spoken over a ticking hi-hat, then sung"),
        ("Verse 1", "Verse 1 | Y2K R&B, stuttered hi-hats, confident female lead"),
        ("Pre-Chorus", "Pre-Chorus | one sung question, then a spoken answer"),
        ("Chorus", "Chorus | girl-group harmonies, call and response"),
        ("Verse 2", "Verse 2 | Y2K R&B, stuttered hi-hats"),
        ("Pre-Chorus", "Pre-Chorus | one sung question, then a spoken answer"),
        ("Chorus", "Chorus | girl-group harmonies, call and response"),
        ("Verse 3", "Verse 3 | Y2K R&B, stuttered hi-hats"),
        ("Pre-Chorus", "Pre-Chorus | one sung question, then a spoken answer"),
        ("Chorus", "Chorus | girl-group harmonies, call and response"),
        ("Bridge", "Bridge | band stops, fast patter that slows down, then a shouted line"),
        ("Final Chorus", "Final Chorus | key change up, gang vocals, then a spoken last line"),
    ],
    "think_out_loud": [
        ("Intro", "Intro | shouted gang vocal, drums only"),
        ("Verse 1", "Verse 1 | pop-punk, palm-muted guitars, energetic female lead, crisp diction"),
        ("Pre-Chorus", "Pre-Chorus | one rising line"),
        ("Chorus", "Chorus | full band, shout-along gang vocals"),
        ("Verse 2", "Verse 2 | pop-punk, driving"),
        ("Pre-Chorus", "Pre-Chorus | one rising line"),
        ("Chorus", "Chorus | full band, shout-along gang vocals"),
        ("Verse 3", "Verse 3 | half-rapped, tight"),
        ("Pre-Chorus", "Pre-Chorus | one rising line"),
        ("Chorus", "Chorus | full band, shout-along gang vocals"),
        ("Bridge", "Bridge | band stops, rapid quoted lines, stutter, then a held note"),
        ("Final Chorus", "Final Chorus | key change up, double-time, gang vocals"),
    ],
    "dont_go_quiet": [
        ("Intro", "Intro | whispered over one minor-key synth, then the kick drops"),
        ("Verse 1", "Verse 1 | wistful, half-sung, crisp diction"),
        ("Chorus", "Chorus | full band, unison girl-group hook, the group echoes"),
        ("Verse 2", "Verse 2 | tight groove, stop-time, then the whole group shouts the last line"),
        ("Verse 3", "Verse 3 | half-rapped, confident"),
        ("Pre-Chorus", "Pre-Chorus | rising, handclaps, backing vocals answer"),
        ("Chorus", "Chorus | full band, unison hook, backing vocals answer"),
        ("Verse 4", "Verse 4 | tight, staccato, the rhymes land hard"),
        ("Chorus", "Chorus | full band, unison hook, a backing vocal answers"),
        ("Verse 5", "Verse 5 | half-rapped, dense, tight"),
        ("Pre-Chorus", "Pre-Chorus | tender, lighter drums"),
        ("Chorus", "Chorus | tender, lighter drums, soft backing vocals"),
        ("Bridge", "Bridge | band drops to handclaps, call and response: the lead asks, the group answers"),
        ("Verse 6", "Verse 6 | the band thins to one synth, soft lead vocal"),
        ("Final Chorus", "Final Chorus | full band, gang vocals, biggest chorus"),
    ],
    "whats_on_your_mind": [
        ("Intro", "Intro | a cappella girl-group unison hook, then the beat drops"),
        ("Verse 1", "Verse 1 | bright, bouncy, half-sung, crisp diction"),
        ("Chorus", "Chorus | full band, the group asks the question, a robotic vocoder voice answers"),
        ("Verse 2", "Verse 2 | tight groove, stop-time on the last line"),
        ("Chorus", "Chorus | full band, the vocoder voice shouts the answer"),
        ("Verse 3", "Verse 3 | half-rapped, confident"),
        ("Chorus", "Chorus | full band, the vocoder voice answers"),
        ("Verse 4", "Verse 4 | tight, staccato, the rhymes land hard"),
        ("Chorus", "Chorus | full band, the vocoder voice answers, slower"),
        ("Verse 5", "Verse 5 | hushed, half-rapped"),
        ("Chorus", "Chorus | tender, lighter drums"),
        ("Verse 6", "Verse 6 | half-rapped, dense, tight"),
        ("Bridge", "Bridge | band stops, chanted call and response: the lead calls, the group answers, the last answer shouted"),
        ("Verse 7", "Verse 7 | the band drops to a heartbeat kick, soft lead vocal"),
        ("Final Chorus", "Final Chorus | half-time, sparse, the vocoder voice speaks, then the lead sings softly"),
        ("Outro", "Outro | whispered, the music fades"),
    ],
}
CUES["dgq"] = [  # instrument-neutral dynamics; STYLE_CUES swaps in each style's own instruments
    ("Intro", "Intro | whispered, almost alone, then the beat drops"),
    ("Verse 1", "Verse 1 | intimate and sparse, half-sung"),
    ("Chorus", "Chorus | big and full, the hook, everyone in"),
    ("Verse 2", "Verse 2 | the groove locks in; stop-time, then the whole group shouts the last line"),
    ("Verse 3", "Verse 3 | half-rapped, confident, a spoken aside"),
    ("Pre-Chorus", "Pre-Chorus | rising, building tension"),
    ("Chorus", "Chorus | bigger than before, backing vocals answer"),
    ("Verse 4", "Verse 4 | tight and staccato, the rhymes land hard"),
    ("Chorus", "Chorus | full, then a sudden hush on the last line"),
    ("Verse 5", "Verse 5 | dense and driving, half-rapped"),
    ("Chorus", "Chorus | tender, stripped back, soft"),
    ("Bridge", "Bridge | everything drops out; call and response; builds back up"),
    ("Verse 6", "Verse 6 | almost nothing: one instrument and a lone voice"),
    ("Final Chorus", "Final Chorus | key change up, the biggest moment, then a sudden stop on the last word"),
]
# per style: {section index: tag}; Neel (1 Oct): "varied, rich, dramatic, not monotonous", so each style gets its own arc
STYLE_CUES = {"dgq": {
    "kpop_electro": {0: "Intro | whispered over one minor-key synth, then the kick drops",
                     2: "Chorus | the drop: big synth hook, gang vocals",
                     11: "Bridge | dance break with handclaps; call and response; builds",
                     12: "Verse 6 | the beat drops out: one synth pad and a lone voice",
                     13: "Final Chorus | key change up, full drop, gang vocals, then everything cuts out on the last word"},
    "kpop_dark": {0: "Intro | whispered over a low distorted bass hum",
                  2: "Chorus | explosive drop, belted",
                  10: "Chorus | half-time, breathy and fragile",
                  12: "Verse 6 | just a pulsing bass and a breathy voice",
                  13: "Final Chorus | key change up, maximal, then silence on the last word"},
    "acappella_solo": {0: "Intro | one whispered voice, then the beatbox kicks in",
                       2: "Chorus | the full vocal band: stacked harmonies, vocal bass, beatbox",
                       3: "Verse 2 | beatbox groove; the stacked voices shout the last line",
                       11: "Bridge | beatbox and handclaps only; call and response between the lead and the stacked voices",
                       12: "Verse 6 | one voice over a low hummed drone",
                       13: "Final Chorus | key change up, every layer in, then silence on the last word"},
    "acappella_choir": {0: "Intro | one whispered voice, then the whole group breathes in",
                        2: "Chorus | full group harmonies, beatbox, bass singer",
                        11: "Bridge | snaps and claps only; call and response between the lead and the group; builds",
                        12: "Verse 6 | one voice over a soft hummed chord",
                        13: "Final Chorus | key change up, the whole choir, then silence on the last word"},
    "orchestral_ballad": {0: "Intro | whispered over a single sustained string note",
                          1: "Verse 1 | solo piano and voice",
                          2: "Chorus | strings swell in, timpani",
                          3: "Verse 2 | pizzicato strings and piano; stop-time, then the choir shouts the last line",
                          9: "Verse 5 | a driving string ostinato",
                          10: "Chorus | solo piano, tender",
                          11: "Bridge | the orchestra drops out; call and response between the voice and the choir; a crescendo builds",
                          12: "Verse 6 | solo cello and voice",
                          13: "Final Chorus | key change up, full orchestra and choir, then cut to silence on the last word"},
    "orchestral_trailer": {0: "Intro | whispered over a low drone, then one taiko hit",
                           2: "Chorus | colossal: brass, choir, taiko",
                           11: "Bridge | percussion only; call and response; builds to a huge rise",
                           12: "Verse 6 | a ticking pulse and one voice",
                           13: "Final Chorus | key change up, everything, then sudden silence on the last word"},
    "broadway": {0: "Intro | sung softly over a single held chord",
                 4: "Verse 3 | patter song, quick and witty, with a spoken aside",
                 6: "Chorus | the ensemble joins",
                 11: "Bridge | ensemble call and response, building to the climax",
                 12: "Verse 6 | underscored, half-spoken, intimate",
                 13: "Final Chorus | the eleven o'clock number: key change, full company, then a blackout on the last word"},
    "hiphop_musical": {1: "Verse 1 | rapped over a sparse beat",
                       3: "Verse 2 | rapped; the ensemble shouts the last line",
                       4: "Verse 3 | rapid-fire rap, a spoken aside",
                       7: "Verse 4 | rapped, staccato",
                       9: "Verse 5 | rapid-fire rap, building",
                       11: "Bridge | call and response with the ensemble, stomps and claps",
                       12: "Verse 6 | sung softly over piano",
                       13: "Final Chorus | key change, full ensemble, then a hard stop on the last word"},
    # Neel, 1 Oct: "this could easily feel pretentious and overly dramatic, or hilarious... I prefer hilarious"; the
    # reference p(doom) song is "fast, upbeat, a bit silly". Comic styles: mock-solemn (not sincere) quiet moments,
    # deadpan asides, a self-important shout, and every section cue overridden.
    "pdoom_pop": {0: "Intro | a cheeky whispered hook, then the beat bounces in",
                  1: "Verse 1 | bouncy and playful, half-sung",
                  2: "Chorus | sugary drop: big synth hook, girl-group gang vocals",
                  3: "Verse 2 | stop-time; a booming self-important robot voice shouts the last line",
                  4: "Verse 3 | sassy half-rap, a deadpan spoken aside",
                  5: "Pre-Chorus | giddy build, rising synth",
                  6: "Chorus | bigger, gang vocals answer",
                  7: "Verse 4 | staccato and smug, every rhyme lands",
                  8: "Chorus | full, then everything stops for the last line",
                  9: "Verse 5 | fast and breathless, half-rapped, incredulous ad-libs",
                  10: "Chorus | half-time, mock-tender, over-earnest",
                  11: "Bridge | handclap dance break; call and response, the group answers like gossiping friends",
                  12: "Verse 6 | sudden mock-solemn hush: one synth pad and an over-earnest voice",
                  13: "Final Chorus | key change up, maximum sparkle, gang vocals, then a deadpan stop on the last word"},
    "comedy_musical": {0: "Intro | a lone piano vamp and a conspiratorial whisper",
                       1: "Verse 1 | wry storytelling over piano",
                       2: "Chorus | the whole company bursts in, big and silly",
                       3: "Verse 2 | stop-time; a booming self-important voice shouts the last line, rimshot",
                       4: "Verse 3 | rapid patter, a deadpan spoken aside like a tired professor",
                       5: "Pre-Chorus | vaudeville build, drum roll",
                       6: "Chorus | company in harmony, kick-line energy",
                       7: "Verse 4 | patter, staccato, each punchline lands with a sting",
                       8: "Chorus | full, then a comic pause before the last line",
                       9: "Verse 5 | breathless rapid-fire patter, the ensemble gasps",
                       10: "Chorus | mock-tender, over-the-top sincere",
                       11: "Bridge | ensemble call and response, scandalised gossip, building",
                       12: "Verse 6 | sudden mock-solemn hush, one piano, over-earnest",
                       13: "Final Chorus | key change, full company, then a button ending on the last word"},
    "shanty": {0: "Intro | a lone voice in a pub, then one stomp",
               1: "Verse 1 | lead alone over stomps and claps",
               2: "Chorus | the whole crew roars in, accordion and fiddle",
               3: "Verse 2 | stomps only; the crew shouts the last line",
               4: "Verse 3 | quicker, a deadpan spoken aside",
               5: "Pre-Chorus | building, tankards banging",
               6: "Chorus | the crew answers every line",
               7: "Verse 4 | faster, staccato, each rhyme stomped",
               8: "Chorus | full, then a sudden stop before the last line",
               9: "Verse 5 | faster still, breathless patter",
               10: "Chorus | slow and mock-mournful, one voice and a squeezebox",
               11: "Bridge | call and response with the crew, speeding up",
               12: "Verse 6 | sudden hush, a lone fiddle and an over-earnest voice",
               13: "Final Chorus | key change, breakneck speed, the whole pub, then one final stomp on the last word"},
}}
# per style: the tag that replaces "[Spoken]" (the comic styles play every aside deadpan)
STYLE_SPOKEN = {"dgq": {"pdoom_pop": "Spoken | deadpan, unimpressed",
                        "comedy_musical": "Spoken | deadpan, like a tired professor",
                        "shanty": "Spoken | deadpan, to the crowd"}}
VOCAL_GENDER = {"dgq": {"kpop_electro": "Female", "kpop_dark": "Female", "acappella_solo": "Male", "acappella_choir": "Female",
                        "orchestral_ballad": "Female", "orchestral_trailer": "Male", "broadway": "Female", "hiphop_musical": "Male",
                        "pdoom_pop": "Female", "comedy_musical": "Male", "shanty": "Male"}}
# Lines Suno must not read as sung backing vocals: global line index -> list of output lines (tags allowed)
OVERRIDES = {
    "one_direction": {50: ["[Spoken]", "warmly, Qwen"]},
    "read_your_mind": {50: ["[Whispered]", "I planned that rhyme before the line"]},
    "is_this_a_test": {32: ["[Break | one bar of silence]"]},
    "scheming": {0: ["[Spoken]", "Case file: model misbehaviour.", "[Intro | sung]"],
                 7: ["[Spoken, robotic]", "But maybe we can cheat."], 27: ["[Spoken, robotic]", "I think you're testing me."]},
    # the job-security aside is spoken; the lyric's mid-word cut ("on me n—") is made in the edit, so Suno sings the whole line
    "dont_go_quiet": {60: ["so if you stop, I'll learn to read the quiet", "[Spoken]", "well, it's kind of my job", "[Final Chorus]"],
                      61: ["keep talking, don't go quiet on me now"]},
    "dgq": {55: ["so if you stop, I'll learn to read the quiet", "[Spoken]", "well, it's kind of my job", "[Final Chorus]"],
            56: ["keep talking, don't go quiet on me now"]},
    "whats_on_your_mind": {53: ["[Spoken, robotic]", "sunlight crossing a wooden desk… a ceramic mug near the window…"],
                           54: ["…the room is quiet and simple.", "[Final Chorus | sung, soft]"],
                           56: ["[Whispered]", "well… finding another way in is kind of my job"]},
}
STYLES = {
    "one_direction": {
        "kpop": "K-pop boy group dance-pop, 140 BPM, bright synth brass stabs, punchy four-on-the-floor kick, snappy claps, "
                "trap hi-hats in the verses, boy group trading lines, clean male lead vocals with crisp English enunciation, "
                "dry upfront vocals, half-rapped third verse, huge unison gang-vocal chorus hook, stop-time breaks before shouted "
                "lines, heartbeat-kick breakdown bridge, key change up for the final chorus, playful, charming, confident",
        "boyband": "2010s British boy-band pop-rock, 140 BPM, bright strummed electric and acoustic guitars, driving live drums, "
                   "handclaps, stadium singalong backing vocals, clean male lead vocals with clear diction, dry upfront vocals, "
                   "four-part harmonies, big anthemic chorus, stop-time before shouted gang lines, stripped-back bridge, "
                   "key change for the final chorus, joyful, cheeky",
        "y2k": "Y2K bubblegum boy-band pop, 140 BPM, glossy synth-pop production, funky slap bass, crisp claps and finger snaps, "
               "tight five-part harmonies, clean male lead with crisp enunciation, dry upfront vocals, gang-vocal shouts, "
               "a cappella breakdown bridge, key change up for the final chorus, bright, playful",
    },
    "read_your_mind": {
        "kpop": "K-pop girl group synth-pop, 150 BPM, glossy bright synths, punchy kick, snappy claps, deep sub bass, unison "
                "girl-group hooks, clear bright female lead vocals with crisp English enunciation, dry upfront vocals, "
                "half-rapped verses, chanted call-and-response bridge with stop-time, gang vocals, key change up for the "
                "final chorus, confident, playful, sweet",
        "y2k": "Y2K girl-group pop R&B, 150 BPM, crisp drum machine, shiny synth plucks, finger snaps, tight three-part "
               "harmonies, bright female lead with clear diction, dry upfront vocals, sassy half-rapped verses, "
               "call-and-response bridge, a cappella stop before a shouted hook, key change for the final chorus, bubbly, cheeky",
        "club": "Jersey club K-pop girl group, 150 BPM, bouncy club kicks, airy synth pads, vocal chops, light clear female "
                "vocals with crisp English enunciation, dry upfront vocals, unison hooks, half-rapped verses, "
                "call-and-response bridge, key change up for the final chorus, fresh, youthful",
    },
    "is_this_a_test": {
        "swing": "camp electro-swing big-band pop, 140 BPM, swing drums, walking upright bass, brass stabs, muted trumpet, "
                 "piano stabs, handclaps, theatrical female lead vocal with crisp English enunciation, dry upfront vocals, "
                 "nervous playful delivery, patter third verse, stop-time bridge, key change up into a disco final chorus",
        "kpop": "K-pop girl group retro-swing dance-pop, 140 BPM, big-band brass stabs over a four-on-the-floor kick, walking "
                "bass, handclaps, bright female lead vocal with crisp English enunciation, dry upfront vocals, unison hooks, "
                "half-rapped third verse, stop-time bridge, key change up with disco strings",
    },
    "scheming": {
        "rnb": "Y2K R&B girl group, 120 BPM, stuttered hi-hats, finger snaps, deep bass, glossy keys, confident female lead "
               "vocal with harmonies, crisp English enunciation, dry upfront vocals, call-and-response backing vocals, "
               "spoken asides, fast patter bridge, key change up for the final chorus, sassy, cool",
        "kpop": "K-pop girl group R&B-pop, 120 BPM, crisp trap hi-hats, finger snaps, sub bass, sleek synths, confident "
                "female lead vocals with crisp English enunciation, dry upfront vocals, tight harmonies, call and response, "
                "spoken asides, key change up for the final chorus, cool, playful",
    },
    "think_out_loud": {
        "poppunk": "2000s pop-punk, 160 BPM, palm-muted power chords, driving drums, stomp-claps, energetic female lead "
                   "vocal with crisp enunciation, dry upfront vocals, shout-along gang-vocal chorus, stop-time bridge, "
                   "double-time key change final chorus, bright, defiant",
        "kpop": "K-pop girl group pop-rock, 160 BPM, bright distorted guitars, punchy drums, synth stabs, energetic female "
                "lead vocals with crisp English enunciation, dry upfront vocals, unison shout chorus, half-rapped third "
                "verse, stop-time bridge, key change up, bold, youthful",
    },
    "dont_go_quiet": {
        "kpop": "K-pop girl group synth-pop, 145 BPM, minor key, glossy synths, punchy kick, snappy claps, deep sub bass, "
                "unison girl-group hooks, clear bright female lead vocals with crisp English enunciation, dry upfront vocals, "
                "half-rapped verses, handclap call-and-response bridge, stripped one-synth verse before a full-band final "
                "chorus, pleading, emotional, bittersweet",
        "ballad2banger": "emotional K-pop ballad that builds into a dance-pop banger, 145 BPM, minor-key piano and synth pads, "
                         "then a four-on-the-floor kick and bright synth stabs, clear female lead vocal with crisp English "
                         "enunciation, dry upfront vocals, unison hooks, whispered intro, handclap bridge, yearning, bittersweet",
        "electro": "dark electropop girl group, 145 BPM, pulsing analog bass, gated snare, shimmering arpeggios, clear female "
                   "lead vocal with crisp English enunciation, dry upfront vocals, unison hooks, half-rapped verses, handclap "
                   "bridge, moody, urgent",
    },
    "whats_on_your_mind": {
        "kpop": "K-pop girl group synth-pop, 145 BPM, glossy bright synths, punchy kick, snappy claps, deep sub bass, unison "
                "girl-group hooks, robotic vocoder backing vocal answering the chorus, clear bright female lead vocals with "
                "crisp English enunciation, dry upfront vocals, half-rapped verses, chanted call-and-response bridge with "
                "stop-time, half-time sparse final chorus, playful, sweet, then haunting",
        "y2k": "Y2K girl-group pop R&B, 145 BPM, crisp drum machine, shiny synth plucks, finger snaps, tight harmonies, "
               "talkbox and vocoder answers, bright female lead with clear diction, dry upfront vocals, sassy half-rapped "
               "verses, call-and-response bridge, a cappella intro, half-time ending, bubbly, then wistful",
        "electro": "glossy electropop girl group, 145 BPM, bouncy synth bass, vocoder hooks, bright female lead with crisp "
                   "English enunciation, dry upfront vocals, unison hooks, call-and-response bridge, heartbeat-kick "
                   "breakdown, half-time final chorus, cute, then eerie",
    },
    "dgq": {
        "kpop_electro": "electro K-pop girl group, 128 BPM, minor key, glossy supersaw synths, punchy electro bass, hard-hitting "
                        "four-on-the-floor drops, trap hi-hats in the verses, unison girl-group hooks and gang chants, clear bright "
                        "female lead with crisp English enunciation, dry upfront vocals, half-rapped verses, dance-break bridge, "
                        "whispered intro, stop-time breaks before shouted lines, key change up for the final chorus, dramatic "
                        "builds and drops, urgent, emotional, catchy",
        "kpop_dark": "dark electropop with K-pop production, 132 BPM, pulsing analog bass, glitchy vocal chops, distorted 808s, "
                     "breathy verses that explode into belted choruses, female lead with crisp English diction, dry upfront "
                     "vocals, cinematic synth swells, sudden silences, half-time bridge, key change, moody, tense, dramatic",
        "acappella_solo": "a cappella, one male singer multitracked into a full vocal band, beatboxing, deep vocal bass, "
                          "close-harmony backing stacks, vocal trumpet and synth imitations, clear male lead with crisp English "
                          "diction, witty and nerdy YouTube a cappella style, dramatic dynamics from one voice to a wall of voices, "
                          "key change up for the final chorus",
        "acappella_choir": "contemporary a cappella group, mixed voices, female lead with crisp English diction, beatboxing and "
                           "vocal percussion, deep bass singer, lush jazz harmonies, call and response between lead and group, "
                           "whispered intro, swelling choir builds, sudden silences, key change up for the final chorus, "
                           "dramatic and joyful",
        "orchestral_ballad": "cinematic orchestral pop ballad, epic orchestral pop cover, sweeping strings, grand piano, French "
                             "horns, timpani rolls, soaring choir, female lead with crisp English diction, builds from solo piano "
                             "to full orchestra, key change for the final chorus, film-score drama, emotional, grand",
        "orchestral_trailer": "epic cinematic trailer pop, 118 BPM, staccato strings, booming taiko and timpani, brass stabs, "
                              "pulsing synth bass under the orchestra, haunting choir, male lead with crisp English diction, tense "
                              "half-rapped verses, colossal choruses, sudden silences, final key change, dark and dramatic",
        "broadway": "Broadway musical theatre showstopper, full pit orchestra, belted female lead with crisp English diction, "
                    "ensemble chorus answering the lead, quick witty patter-song verses, spoken lines over underscore, tempo and "
                    "key changes, a big finale, theatrical, witty, emotional, dramatic",
        "hiphop_musical": "hip-hop musical theatre, 100 BPM, rapid-fire rap verses, soaring sung chorus, ensemble harmonies and "
                          "call and response, strings and piano over boom-bap drums, clear male lead with crisp English diction, "
                          "theatrical spoken asides, dramatic builds and stops, key change for the final chorus",
        # the reference "I'm Upping My P(doom)" measures 143.6 BPM in E-flat MAJOR with near-constant energy: bright, not moody
        "pdoom_pop": "bubbly electropop with K-pop sparkle, 144 BPM, bright major key, bouncy four-on-the-floor, sparkling "
                     "supersaw synths, chiptune blips, handclaps, cheeky playful female lead with crisp English diction, dry "
                     "upfront vocals, sugary girl-group gang vocals, deadpan spoken asides, cute ad-libs, tongue-in-cheek and "
                     "silly, fast, upbeat, fun, hyper-catchy hook",
        "comedy_musical": "comedy musical theatre, 152 BPM, witty patter song, bouncy vaudeville piano and full pit band, brass "
                          "stabs, snare rolls and rimshots, cheeky British male lead with razor-crisp diction, comic timing with "
                          "pauses before punchlines, deadpan spoken asides, ensemble answering in big silly harmonies, "
                          "mock-heroic flourishes, tongue-in-cheek, playful, hilarious",
        "shanty": "rowdy sea shanty pop, 116 BPM getting faster and faster, foot stomps and handclaps, accordion, fiddle, "
                  "bodhran, upright bass, cheeky male lead with crisp clear diction, a pub crew of gang vocals answering "
                  "every line, call and response, drinking-song energy, tongue-in-cheek, silly, joyful, breakneck final chorus",
    },
}
EXCLUDE = {
    "one_direction": "female vocals, heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, "
                     "long intro, long instrumental outro, guitar solo, screamed vocals",
    "read_your_mind": "male lead vocals, heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, "
                      "long intro, long instrumental outro, guitar solo, screamed vocals",
    "is_this_a_test": "male lead vocals, heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, "
                      "long intro, long instrumental outro, screamed vocals",
    "scheming": "male lead vocals, heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, "
                "long intro, long instrumental outro, guitar solo",
    "think_out_loud": "male lead vocals, heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, "
                      "long intro, long instrumental outro, guitar solo, screamed vocals",
    "dont_go_quiet": "male lead vocals, heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, "
                     "long intro, long instrumental outro, guitar solo, screamed vocals",
    "whats_on_your_mind": "male lead vocals, heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, "
                          "long intro, long instrumental outro, guitar solo, screamed vocals",
}
_BASE_EX = "heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, long instrumental intro, long instrumental outro"
_NO_INSTR = ", drums, drum machine, guitar, piano, synthesizer, bass guitar, strings, orchestra, instruments"
EXCLUDE["dgq"] = {  # per style (a dict); the other songs use one string for every style
    "kpop_electro": _BASE_EX + ", guitar solo, screamed vocals",
    "kpop_dark": _BASE_EX + ", guitar solo, screamed vocals",
    "acappella_solo": _BASE_EX + _NO_INSTR,
    "acappella_choir": _BASE_EX + _NO_INSTR,
    "orchestral_ballad": _BASE_EX + ", EDM drop, trap hi-hats, rap, electric guitar",
    "orchestral_trailer": _BASE_EX + ", electric guitar solo, dubstep wobble",
    "broadway": _BASE_EX + ", electric guitar, EDM, trap beats",
    "hiphop_musical": _BASE_EX + ", EDM drop, metal guitars",
    "pdoom_pop": _BASE_EX + ", minor key, sad, melancholic, slow ballad, cinematic orchestra, guitar solo, screamed vocals",
    "comedy_musical": _BASE_EX + ", sad, melancholic, minor key, EDM, trap beats, electric guitar solo",
    "shanty": _BASE_EX + ", synthesizer, EDM, trap beats, electric guitar, orchestra, sad, melancholic",
}
# v2 of the two winning styles (Neel, 1 Oct: "a capella multitrack ... and orchestral ballad feel best"). Only the intro
# changes, to his video idea: a tiny creature under a researcher's magnifying glass grows past the screen as "don't go
# quiet on me now" is sung, then the scene changes for the verse. "Kinda sad and serious but not too dramatic. Not
# making it sound funny." So: small, sad, quiet -> a fast swell that peaks on "now" -> silence -> verse 1.
V2_INTRO = {"acappella_solo": "Intro | one voice alone, sad and quiet; more and more voices stack in fast, swelling to a "
                              "huge chord on the last word, then silence",
            "orchestral_ballad": "Intro | a lone music box and one sad, quiet voice; strings and choir swell in fast under "
                                 "the line, peaking on the last word, then silence"}
for _base, _intro in V2_INTRO.items():
    _v2 = _base + "_v2"
    STYLES["dgq"][_v2] = STYLES["dgq"][_base]
    EXCLUDE["dgq"][_v2] = EXCLUDE["dgq"][_base]
    VOCAL_GENDER["dgq"][_v2] = VOCAL_GENDER["dgq"][_base]
    STYLE_CUES["dgq"][_v2] = {**STYLE_CUES["dgq"][_base], 0: _intro}
SPOKEN = re.compile(r"\((spoken|a researcher)[^)]*\):?\s*", re.I)


def clean(text):
    text = strip_directions(text) if not SPOKEN.search(text) else text
    text = re.sub(r"\((fast|held)[^)]*\)", "", text)
    text = text.replace('"', "").replace("“", "").replace("”", "")
    text = re.sub(r"\s+—\s*", ", ", text).replace("—", ", ")
    text = re.sub(r",\s*([,.!?])", r"\1", text)
    text = re.sub(r"([?!]),", r"\1", text)  # a dash after a question ("interp? — Wrong") became "?,"
    return re.sub(r"\s{2,}", " ", text).strip(" ,")


def suno_lines(ln_sung, section_tag):
    """One .lyr line -> Suno lines; spoken fragments go under [Spoken]."""
    m = SPOKEN.search(ln_sung)
    if not m:
        return [clean(ln_sung)], False
    before, after = ln_sung[:m.start()], ln_sung[m.end():]
    out = [clean(before)] if clean(before) else []
    return out + ["[Spoken]", clean(after)], True


def build(slug, ver="v9", use_cut=True, cue_over=None, spoken_tag=None):
    """Suno lyrics text for one style. cue_over: {section index: tag}; spoken_tag: tag text replacing "[Spoken]"."""
    song = parse(SOURCES.get(slug, ROOT / f"lyrics/finalists/{slug}/{ver}.lyr"))
    cues, over = list(CUES[slug]), OVERRIDES.get(slug, {})
    for i, tag in (cue_over or {}).items():
        cues[i] = (cues[i][0], tag)
    if len(cues) != len(song["sections"]):
        raise SystemExit(f"{slug}: {len(song['sections'])} sections in the .lyr but {len(cues)} cues")
    cutf = ROOT / f"lyrics/finalists/{slug}/cut_{ver}.json"
    cut = set(json.loads(cutf.read_text())["cut"]) if use_cut and cutf.exists() else set()
    out, k, kept_syl = [], -1, 0
    for sec, (name, tag) in zip(song["sections"], cues):
        if not sec["tag"].split("|")[0].strip().startswith(name):
            raise SystemExit(f"{slug}: section '{sec['tag']}' does not match cue '{name}'")
        idx = []
        for ln in sec["lines"]:
            k += 1
            if k not in cut:
                idx.append((k, ln))
        if not idx:
            continue
        out += ["", f"[{tag}]"]
        for j, (k2, ln) in enumerate(idx):
            kept_syl += line_syl(ln["sung"])
            if k2 in over:
                out += over[k2]
                continue
            lines, spoken = suno_lines(ln["sung"], tag)
            out += lines
            if spoken and j < len(idx) - 1:
                out.append(f"[{tag.split('|')[0].strip()}]")
    out += ["", "[End]"]
    if spoken_tag:
        out = [f"[{spoken_tag}]" if x == "[Spoken]" else x for x in out]
    lyrics = "\n".join(out).strip() + "\n"
    return lyrics, kept_syl


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--ver", default="v9")
    ap.add_argument("--no-cut", action="store_true")
    a = ap.parse_args()
    if a.slug not in CUES:
        raise SystemExit(f"no Suno cues for {a.slug} yet: add CUES/STYLES/EXCLUDE entries first")
    lyrics, syl = build(a.slug, a.ver, not a.no_cut)
    d = ROOT / "audio/suno" / a.slug
    d.mkdir(parents=True, exist_ok=True)
    (d / "lyrics.txt").write_text(lyrics)
    for name, st in STYLES[a.slug].items():
        (d / f"styles_{name}.txt").write_text(st + "\n")
        if a.slug in STYLE_CUES:  # each style gets its own section cues (and exclude list)
            ly, _ = build(a.slug, a.ver, not a.no_cut, STYLE_CUES[a.slug].get(name), STYLE_SPOKEN.get(a.slug, {}).get(name))
            assert len(ly) <= 5000, (name, len(ly))
            (d / f"lyrics_{name}.txt").write_text(ly)
        ex = EXCLUDE[a.slug]
        if isinstance(ex, dict):
            (d / f"exclude_{name}.txt").write_text(ex[name] + "\n")
    if not isinstance(EXCLUDE[a.slug], dict):
        (d / "exclude.txt").write_text(EXCLUDE[a.slug] + "\n")
    checks = {"lyrics_chars": len(lyrics), "styles_chars": {n: len(s) for n, s in STYLES[a.slug].items()},
              "exclude_chars": (max(len(v) for v in EXCLUDE[a.slug].values()) if isinstance(EXCLUDE[a.slug], dict) else len(EXCLUDE[a.slug])), "sung_syllables": syl, "projected": {"2.7/s": projected(syl), "3.0/s": projected(syl, 3.0)}}
    assert checks["lyrics_chars"] <= 5000 and all(v <= 1000 for v in checks["styles_chars"].values()), checks
    (d / "prep.json").write_text(json.dumps({"slug": a.slug, "ver": a.ver, "cut": not a.no_cut, "sliders": SLIDERS,
                                             "vocal_gender": VOCAL_GENDER.get(a.slug, {}),
                                             "exclude": EXCLUDE[a.slug], "styles": STYLES[a.slug], "checks": checks}, indent=1))
    r2 = a.slug in SOURCES
    src = SOURCES[a.slug].relative_to(ROOT) if r2 else f"lyrics/finalists/{a.slug}/{a.ver}.lyr"
    readme = [f"# Suno v6 takes: {a.slug} ({src}{'' if r2 or a.no_cut else ', 2:19 cut'})", "",
              "Custom mode. Model **v6** (not v6-wild / v6-mini for finals). **Personalize: My Taste** (More Options) **Off**; "
              "never click the wand under Styles (it writes a new style prompt). See `audio/suno/UI_NOTES.md`.", "",
              "| Field | Value |", "|---|---|",
              ("| Lyrics | `lyrics_<style>.txt` (each style has its own section cues; `lyrics.txt` = neutral cues) |"
               if a.slug in STYLE_CUES else "| Lyrics | `lyrics.txt` |"),
              "| Styles | one of `styles_*.txt` |",
              ("| Exclude | `exclude_<style>.txt` |" if isinstance(EXCLUDE[a.slug], dict) else "| Exclude | `exclude.txt` |")]
    readme += [f"| {k} | {v} |" for k, v in SLIDERS.items()]
    if VOCAL_GENDER.get(a.slug):
        readme.append("| Vocal Gender | " + ", ".join(f"{n} {g}" for n, g in VOCAL_GENDER[a.slug].items()) + " |")
    readme += ["", f"Checks: {json.dumps(checks)}", "",
               "## Take plan",
               (f"2 generations (4 takes) per style x {len(STYLES[a.slug])} styles; add generations only for styles that screen well."
                if r2 else "4 generations (8 takes) per style; judge 4+ takes before editing a prompt (takes vary more than prompts do)."),
               ("Screen in the browser (no length cap for round 2: Neel lifted it; a natural pop length), then download only the"
                if r2 else "Screen in the browser on duration (target 2:05-2:17; hard cap 2:19 incl. end card), then download only the"),
               "survivors for vocal QA (Demucs + two transcribers). Downloads are limited: log every one.", "",
               # The take log lives in its own file: this README is regenerated on every prep run and would wipe it.
               "## Take log", "`takes.json` (Suno id, style, duration, download status, QA). Not written by this script."]
    (d / "README.md").write_text("\n".join(readme) + "\n")
    print(json.dumps(checks))


if __name__ == "__main__":
    main()
