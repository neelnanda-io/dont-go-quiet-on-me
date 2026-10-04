# Suno prompt library (verbatim, with verdicts)

Every Suno v6 prompt from "Don't Go Quiet On Me" (1 Oct 2026), generated from the project's prep files, so the text is
exact: `audio/suno/dgq/{styles,exclude,lyrics}_<style>.txt` and `audio/suno/dgq/prep.json` in this repo. Neel (the
first song's commissioner) asked for the runners-up and the rationale too: a future song may suit one of them better.
Suno's UI and settings are as of October 2026.

## Contents
- [Settings common to every take](#settings-common-to-every-take)
- [How to choose a style for a new song](#how-to-choose-a-style-for-a-new-song)
- [The styles](#the-styles)
- [Section-tag rules learned the hard way](#section-tag-rules-learned-the-hard-way)
- [ElevenLabs Music prompts](#elevenlabs-music-prompts)

---

## Settings common to every take
- Model v6, Advanced (custom) mode. Weirdness 25%, Style Influence 75%, Variety 0 (30 was planned for exploring, never
  used). Personalize: My Taste OFF. Max Mode off. Duration auto. **Never click the magic wand under Styles** (it rewrote
  one prompt into garage rock).
- Title `<Song> (<style label>)` so takes are identifiable in the workspace and in downloads.
- Lyrics: the SUNG column of the .lyr (respellings like `SON-it`, `JAY-lens`, `EN-EL-AY`, `point-nine-nine-nine`, numbers
  as words), `[Section | cue]` tags, backing vocals and ad-libs in parentheses, a shout in capitals, `[Spoken]` on its
  own line followed by the section tag again so Suno resumes singing, quote marks dropped, " — " turned into ", ",
  `[End]` at the end. Lyrics ≤ 5,000 characters, styles ≤ 1,000 (`tools/suno_prep.py` asserts both). Words were
  identical across styles; only tags and styles changed.
- Exclude base (every style), then a per-style suffix:
  `heavy reverb, lo-fi, muddy mix, mumbled vocals, slurred diction, heavy autotune, long instrumental intro, long instrumental outro`

## How to choose a style for a new song
- **For the interp song Neel chose sincere and a little sad; the humour lived in the words and pictures.** His
  pre-listening "I prefer hilarious" reversed within 16 minutes of hearing takes. That is one song's verdict: match
  the styles to the new song's mood (upbeat ones too if it's meant to be catchy), and use the comic styles only if the
  song is meant to be a comedy number.
- First burst: the winner and runner-up 1, plus 3-6 styles chosen for the new song's mood (Broadway, hip-hop musical,
  trailer, K-pop) — 4 takes each, all in one sitting, then hand the commissioner the Suno titles to thumb.
- Neel's brief for the first song's styles (re-ask your commissioner for theirs, per topic): "I think the electro k
  pop style of the original video is fun, I also really like a capella (a la a capella science), pop especially
  cinematic/orchestral covers of pop songs, I like songs from musicals. Play around with those styles? I want things
  to feel varied, rich, dramatic, not monotonous". His listening skews to musical theatre; ask your commissioner what
  they listen to, and pick styles from that.

## The styles

### `orchestral_ballad` — WINNER (take cdb7, then e107 with the Astra re-sing = the master)

- **Why:** Neel thumbed 3 of 4 takes and picked "I like ballad A best" (A = cdb7 on the blind shoot-out page). Words: recall 0.933 (gpt-4o) / 0.96 (Whisper); 13/16 jargon terms heard by both transcribers, only "J-Lens" missed. -16.5 LUFS, no clipping, a measured +2 semitone key change into the final chorus. No BPM was given; it came out at 133-136 BPM in E-flat major. Its intro (music box/piano, a strings swell, an orchestral hit) already fitted Neel's growing-creature hook. FLAW: the `[Verse 6 | solo cello and voice]` tag (on top of a neutral "almost nothing" cue) made the Astra verse near-spoken and ~5 dB quiet, which forced a post-lock re-sing (Legacy Editor, Replacement #10, tag `[Verse 6 | cello and voice, sung, building into the final chorus]`, Exclude + `spoken word, whispered vocals`).
- **Prefer it when:** Default for a sincere, bittersweet song about the field: the first style to try next time.
- **Other takes of this prompt:** a8a6 (thumbed; the clearest words of any take, 0.97/0.956, +2 key change, 143.6 BPM), b8c6 (thumbed; +1 key change), 93fa (not thumbed, no key change, yet both Gemini models ranked it first head-to-head). Re-sing attempts #7/#8 used `[Verse 6 | sung, full voice, close and intimate but clear, cello and strings building under her]`: "a bit off stylistically".
- **Vocal gender:** Female

- **Styles:**
  ```
  cinematic orchestral pop ballad, epic orchestral pop cover, sweeping strings, grand piano, French horns, timpani rolls, soaring choir, female lead with crisp English diction, builds from solo piano to full orchestra, key change for the final chorus, film-score drama, emotional, grand
  ```
- **Exclude:** base + `EDM drop, trap hi-hats, rap, electric guitar`
- **Section tags:**
  ```
  [Intro | whispered over a single sustained string note]
  [Verse 1 | solo piano and voice]
  [Chorus | strings swell in, timpani]
  [Verse 2 | pizzicato strings and piano; stop-time, then the choir shouts the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | a driving string ostinato]
  [Chorus | solo piano, tender]
  [Bridge | the orchestra drops out; call and response between the voice and the choir; a crescendo builds]
  [Verse 6 | solo cello and voice]
  [Final Chorus | key change up, full orchestra and choir, then cut to silence on the last word]
  ```

### `acappella_solo` — RUNNER-UP 1 (Neel: "totally into these styles"; "feel best" alongside the ballad)

- **Why:** Takes 5d84, 3237, 76c5, ec75 (all downloaded): recall 0.92-0.94; jargon 6-11/16. Lost on flatter dynamics (sections span only 4-6 dB, verse 6 never strips back) and no key change; Gemini claimed it heard synths/drum machine/guitar in 3 of 4 (unverified). Neel's taste: the A Capella Science style, one male voice multitracked.
- **Prefer it when:** Prefer it for a witty or nerdy patter-heavy song; add an explicit strip-back cue and ask for the key change twice.
- **Vocal gender:** Male

- **Styles:**
  ```
  a cappella, one male singer multitracked into a full vocal band, beatboxing, deep vocal bass, close-harmony backing stacks, vocal trumpet and synth imitations, clear male lead with crisp English diction, witty and nerdy YouTube a cappella style, dramatic dynamics from one voice to a wall of voices, key change up for the final chorus
  ```
- **Exclude:** base + `drums, drum machine, guitar, piano, synthesizer, bass guitar, strings, orchestra, instruments`
- **Section tags:**
  ```
  [Intro | one whispered voice, then the beatbox kicks in]
  [Verse 1 | intimate and sparse, half-sung]
  [Chorus | the full vocal band: stacked harmonies, vocal bass, beatbox]
  [Verse 2 | beatbox groove; the stacked voices shout the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | dense and driving, half-rapped]
  [Chorus | tender, stripped back, soft]
  [Bridge | beatbox and handclaps only; call and response between the lead and the stacked voices]
  [Verse 6 | one voice over a low hummed drone]
  [Final Chorus | key change up, every layer in, then silence on the last word]
  ```

### `acappella_choir` — RUNNER-UP 2 (rejected: "the female one, felt too dramatic")

- **Why:** Takes 4995, 8c33, 1db5, 0bbc; not downloaded.
- **Prefer it when:** Only if a song wants a big group sound; tone the drama down (drop 'dramatic', 'swelling choir builds').
- **Vocal gender:** Female

- **Styles:**
  ```
  contemporary a cappella group, mixed voices, female lead with crisp English diction, beatboxing and vocal percussion, deep bass singer, lush jazz harmonies, call and response between lead and group, whispered intro, swelling choir builds, sudden silences, key change up for the final chorus, dramatic and joyful
  ```
- **Exclude:** base + `drums, drum machine, guitar, piano, synthesizer, bass guitar, strings, orchestra, instruments`
- **Section tags:**
  ```
  [Intro | one whispered voice, then the whole group breathes in]
  [Verse 1 | intimate and sparse, half-sung]
  [Chorus | full group harmonies, beatbox, bass singer]
  [Verse 2 | the groove locks in; stop-time, then the whole group shouts the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | dense and driving, half-rapped]
  [Chorus | tender, stripped back, soft]
  [Bridge | snaps and claps only; call and response between the lead and the group; builds]
  [Verse 6 | one voice over a soft hummed chord]
  [Final Chorus | key change up, the whole choir, then silence on the last word]
  ```

### `kpop_electro` — Not picked (no verdict beyond the two winners)

- **Why:** Takes 1fd3 (downloaded as a pipeline test), 582b, a661, a3ef. 1fd3 had the worst intelligibility of any style: recall 0.48 (gpt-4o) / 0.85 (Whisper); "mech interp" heard as "Mac Gannert", "Astra" as "Esther".
- **Prefer it when:** For an upbeat, dance-forward song in the P(doom) reference's style; budget extra respellings for jargon.
- **Vocal gender:** Female

- **Styles:**
  ```
  electro K-pop girl group, 128 BPM, minor key, glossy supersaw synths, punchy electro bass, hard-hitting four-on-the-floor drops, trap hi-hats in the verses, unison girl-group hooks and gang chants, clear bright female lead with crisp English enunciation, dry upfront vocals, half-rapped verses, dance-break bridge, whispered intro, stop-time breaks before shouted lines, key change up for the final chorus, dramatic builds and drops, urgent, emotional, catchy
  ```
- **Exclude:** base + `guitar solo, screamed vocals`
- **Section tags:**
  ```
  [Intro | whispered over one minor-key synth, then the kick drops]
  [Verse 1 | intimate and sparse, half-sung]
  [Chorus | the drop: big synth hook, gang vocals]
  [Verse 2 | the groove locks in; stop-time, then the whole group shouts the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | dense and driving, half-rapped]
  [Chorus | tender, stripped back, soft]
  [Bridge | dance break with handclaps; call and response; builds]
  [Verse 6 | the beat drops out: one synth pad and a lone voice]
  [Final Chorus | key change up, full drop, gang vocals, then everything cuts out on the last word]
  ```

### `kpop_dark` — Not picked

- **Why:** Takes db56, 2654, e2d4, ea11; not downloaded.
- **Prefer it when:** A moody electropop alternative for a darker song.
- **Vocal gender:** Female

- **Styles:**
  ```
  dark electropop with K-pop production, 132 BPM, pulsing analog bass, glitchy vocal chops, distorted 808s, breathy verses that explode into belted choruses, female lead with crisp English diction, dry upfront vocals, cinematic synth swells, sudden silences, half-time bridge, key change, moody, tense, dramatic
  ```
- **Exclude:** base + `guitar solo, screamed vocals`
- **Section tags:**
  ```
  [Intro | whispered over a low distorted bass hum]
  [Verse 1 | intimate and sparse, half-sung]
  [Chorus | explosive drop, belted]
  [Verse 2 | the groove locks in; stop-time, then the whole group shouts the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | dense and driving, half-rapped]
  [Chorus | half-time, breathy and fragile]
  [Bridge | everything drops out; call and response; builds back up]
  [Verse 6 | just a pulsing bass and a breathy voice]
  [Final Chorus | key change up, maximal, then silence on the last word]
  ```

### `orchestral_trailer` — Not picked

- **Why:** Takes a2d4, 44bf, ff7c, eccc; not downloaded.
- **Prefer it when:** For a darker, epic 'stakes' song (an AI-risk anthem).
- **Vocal gender:** Male

- **Styles:**
  ```
  epic cinematic trailer pop, 118 BPM, staccato strings, booming taiko and timpani, brass stabs, pulsing synth bass under the orchestra, haunting choir, male lead with crisp English diction, tense half-rapped verses, colossal choruses, sudden silences, final key change, dark and dramatic
  ```
- **Exclude:** base + `electric guitar solo, dubstep wobble`
- **Section tags:**
  ```
  [Intro | whispered over a low drone, then one taiko hit]
  [Verse 1 | intimate and sparse, half-sung]
  [Chorus | colossal: brass, choir, taiko]
  [Verse 2 | the groove locks in; stop-time, then the whole group shouts the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | dense and driving, half-rapped]
  [Chorus | tender, stripped back, soft]
  [Bridge | percussion only; call and response; builds to a huge rise]
  [Verse 6 | a ticking pulse and one voice]
  [Final Chorus | key change up, everything, then sudden silence on the last word]
  ```

### `broadway` — Not picked

- **Why:** Takes c1df, ece6, a804, 08c8; not downloaded.
- **Prefer it when:** A strong candidate for a story-led or comic song (an 'I want' song, an eleven o'clock number), especially for a commissioner who loves musicals (Neel does).
- **Vocal gender:** Female

- **Styles:**
  ```
  Broadway musical theatre showstopper, full pit orchestra, belted female lead with crisp English diction, ensemble chorus answering the lead, quick witty patter-song verses, spoken lines over underscore, tempo and key changes, a big finale, theatrical, witty, emotional, dramatic
  ```
- **Exclude:** base + `electric guitar, EDM, trap beats`
- **Section tags:**
  ```
  [Intro | sung softly over a single held chord]
  [Verse 1 | intimate and sparse, half-sung]
  [Chorus | big and full, the hook, everyone in]
  [Verse 2 | the groove locks in; stop-time, then the whole group shouts the last line]
  [Verse 3 | patter song, quick and witty, with a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | the ensemble joins]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | dense and driving, half-rapped]
  [Chorus | tender, stripped back, soft]
  [Bridge | ensemble call and response, building to the climax]
  [Verse 6 | underscored, half-spoken, intimate]
  [Final Chorus | the eleven o'clock number: key change, full company, then a blackout on the last word]
  ```

### `hiphop_musical` — Not picked

- **Why:** Takes 8b8f, 8243, 40ed, d1e2 (3:05-4:14, the shortest: rap packs syllables).
- **Prefer it when:** For a lyric with very dense verses; Hamilton-style history songs.
- **Vocal gender:** Male

- **Styles:**
  ```
  hip-hop musical theatre, 100 BPM, rapid-fire rap verses, soaring sung chorus, ensemble harmonies and call and response, strings and piano over boom-bap drums, clear male lead with crisp English diction, theatrical spoken asides, dramatic builds and stops, key change for the final chorus
  ```
- **Exclude:** base + `EDM drop, metal guitars`
- **Section tags:**
  ```
  [Intro | whispered, almost alone, then the beat drops]
  [Verse 1 | rapped over a sparse beat]
  [Chorus | big and full, the hook, everyone in]
  [Verse 2 | rapped; the ensemble shouts the last line]
  [Verse 3 | rapid-fire rap, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | rapped, staccato]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | rapid-fire rap, building]
  [Chorus | tender, stripped back, soft]
  [Bridge | call and response with the ensemble, stomps and claps]
  [Verse 6 | sung softly over piano]
  [Final Chorus | key change, full ensemble, then a hard stop on the last word]
  ```

### `pdoom_pop` — Comic batch, set aside (generated after "I prefer hilarious"; 16 min later, having listened: "kinda sad and serious but not too dramatic. Not making it sound funny.")

- **Why:** 6 takes. Copied the reference song's measured 143.6 BPM, E-flat major.
- **Prefer it when:** For a deliberately comic song only.
- **Vocal gender:** Female

- **Styles:**
  ```
  bubbly electropop with K-pop sparkle, 144 BPM, bright major key, bouncy four-on-the-floor, sparkling supersaw synths, chiptune blips, handclaps, cheeky playful female lead with crisp English diction, dry upfront vocals, sugary girl-group gang vocals, deadpan spoken asides, cute ad-libs, tongue-in-cheek and silly, fast, upbeat, fun, hyper-catchy hook
  ```
- **Exclude:** base + `minor key, sad, melancholic, slow ballad, cinematic orchestra, guitar solo, screamed vocals`
- **Section tags:**
  ```
  [Intro | a cheeky whispered hook, then the beat bounces in]
  [Verse 1 | bouncy and playful, half-sung]
  [Chorus | sugary drop: big synth hook, girl-group gang vocals]
  [Verse 2 | stop-time; a booming self-important robot voice shouts the last line]
  [Verse 3 | sassy half-rap, a deadpan spoken aside]
  [Spoken | deadpan, unimpressed]
  [Pre-Chorus | giddy build, rising synth]
  [Chorus | bigger, gang vocals answer]
  [Verse 4 | staccato and smug, every rhyme lands]
  [Chorus | full, then everything stops for the last line]
  [Verse 5 | fast and breathless, half-rapped, incredulous ad-libs]
  [Chorus | half-time, mock-tender, over-earnest]
  [Bridge | handclap dance break; call and response, the group answers like gossiping friends]
  [Verse 6 | sudden mock-solemn hush: one synth pad and an over-earnest voice]
  [Final Chorus | key change up, maximum sparkle, gang vocals, then a deadpan stop on the last word]
  [Spoken | deadpan, unimpressed]
  ```

### `comedy_musical` — Comic batch, set aside

- **Why:** 4 takes.
- **Prefer it when:** For a deliberately comic song.
- **Vocal gender:** Male

- **Styles:**
  ```
  comedy musical theatre, 152 BPM, witty patter song, bouncy vaudeville piano and full pit band, brass stabs, snare rolls and rimshots, cheeky British male lead with razor-crisp diction, comic timing with pauses before punchlines, deadpan spoken asides, ensemble answering in big silly harmonies, mock-heroic flourishes, tongue-in-cheek, playful, hilarious
  ```
- **Exclude:** base + `sad, melancholic, minor key, EDM, trap beats, electric guitar solo`
- **Section tags:**
  ```
  [Intro | a lone piano vamp and a conspiratorial whisper]
  [Verse 1 | wry storytelling over piano]
  [Chorus | the whole company bursts in, big and silly]
  [Verse 2 | stop-time; a booming self-important voice shouts the last line, rimshot]
  [Verse 3 | rapid patter, a deadpan spoken aside like a tired professor]
  [Spoken | deadpan, like a tired professor]
  [Pre-Chorus | vaudeville build, drum roll]
  [Chorus | company in harmony, kick-line energy]
  [Verse 4 | patter, staccato, each punchline lands with a sting]
  [Chorus | full, then a comic pause before the last line]
  [Verse 5 | breathless rapid-fire patter, the ensemble gasps]
  [Chorus | mock-tender, over-the-top sincere]
  [Bridge | ensemble call and response, scandalised gossip, building]
  [Verse 6 | sudden mock-solemn hush, one piano, over-earnest]
  [Final Chorus | key change, full company, then a button ending on the last word]
  [Spoken | deadpan, like a tired professor]
  ```

### `shanty` — Comic batch, set aside

- **Why:** 4 takes.
- **Prefer it when:** For a rowdy, communal song.
- **Vocal gender:** Male

- **Styles:**
  ```
  rowdy sea shanty pop, 116 BPM getting faster and faster, foot stomps and handclaps, accordion, fiddle, bodhran, upright bass, cheeky male lead with crisp clear diction, a pub crew of gang vocals answering every line, call and response, drinking-song energy, tongue-in-cheek, silly, joyful, breakneck final chorus
  ```
- **Exclude:** base + `synthesizer, EDM, trap beats, electric guitar, orchestra, sad, melancholic`
- **Section tags:**
  ```
  [Intro | a lone voice in a pub, then one stomp]
  [Verse 1 | lead alone over stomps and claps]
  [Chorus | the whole crew roars in, accordion and fiddle]
  [Verse 2 | stomps only; the crew shouts the last line]
  [Verse 3 | quicker, a deadpan spoken aside]
  [Spoken | deadpan, to the crowd]
  [Pre-Chorus | building, tankards banging]
  [Chorus | the crew answers every line]
  [Verse 4 | faster, staccato, each rhyme stomped]
  [Chorus | full, then a sudden stop before the last line]
  [Verse 5 | faster still, breathless patter]
  [Chorus | slow and mock-mournful, one voice and a squeezebox]
  [Bridge | call and response with the crew, speeding up]
  [Verse 6 | sudden hush, a lone fiddle and an over-earnest voice]
  [Final Chorus | key change, breakneck speed, the whole pub, then one final stomp on the last word]
  [Spoken | deadpan, to the crowd]
  ```

### `orchestral_ballad_v2` — v2 intro variant, never heard back

- **Why:** 6 takes, 4:19-5:19.
- **Prefer it when:** Intro idea for a hook that grows: music box + one sad voice, swell fast, peak on the last word, silence.
- **Vocal gender:** Female

- **Styles:**
  ```
  cinematic orchestral pop ballad, epic orchestral pop cover, sweeping strings, grand piano, French horns, timpani rolls, soaring choir, female lead with crisp English diction, builds from solo piano to full orchestra, key change for the final chorus, film-score drama, emotional, grand
  ```
- **Exclude:** base + `EDM drop, trap hi-hats, rap, electric guitar`
- **Section tags:**
  ```
  [Intro | a lone music box and one sad, quiet voice; strings and choir swell in fast under the line, peaking on the last word, then silence]
  [Verse 1 | solo piano and voice]
  [Chorus | strings swell in, timpani]
  [Verse 2 | pizzicato strings and piano; stop-time, then the choir shouts the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | a driving string ostinato]
  [Chorus | solo piano, tender]
  [Bridge | the orchestra drops out; call and response between the voice and the choir; a crescendo builds]
  [Verse 6 | solo cello and voice]
  [Final Chorus | key change up, full orchestra and choir, then cut to silence on the last word]
  ```

### `acappella_solo_v2` — v2 intro variant, never heard back

- **Why:** 6 takes.
- **Prefer it when:** Same intro idea in a cappella.
- **Vocal gender:** Male

- **Styles:**
  ```
  a cappella, one male singer multitracked into a full vocal band, beatboxing, deep vocal bass, close-harmony backing stacks, vocal trumpet and synth imitations, clear male lead with crisp English diction, witty and nerdy YouTube a cappella style, dramatic dynamics from one voice to a wall of voices, key change up for the final chorus
  ```
- **Exclude:** base + `drums, drum machine, guitar, piano, synthesizer, bass guitar, strings, orchestra, instruments`
- **Section tags:**
  ```
  [Intro | one voice alone, sad and quiet; more and more voices stack in fast, swelling to a huge chord on the last word, then silence]
  [Verse 1 | intimate and sparse, half-sung]
  [Chorus | the full vocal band: stacked harmonies, vocal bass, beatbox]
  [Verse 2 | beatbox groove; the stacked voices shout the last line]
  [Verse 3 | half-rapped, confident, a spoken aside]
  [Pre-Chorus | rising, building tension]
  [Chorus | bigger than before, backing vocals answer]
  [Verse 4 | tight and staccato, the rhymes land hard]
  [Chorus | full, then a sudden hush on the last line]
  [Verse 5 | dense and driving, half-rapped]
  [Chorus | tender, stripped back, soft]
  [Bridge | beatbox and handclaps only; call and response between the lead and the stacked voices]
  [Verse 6 | one voice over a low hummed drone]
  [Final Chorus | key change up, every layer in, then silence on the last word]
  ```

## Section-tag rules learned the hard way
- **Never tag a sung verse "solo X and voice", "almost nothing", "half-spoken" or "lone voice".** Suno rendered the
  winner's `[Verse 6 | solo cello and voice]` (stacked on the neutral cue "almost nothing: one instrument and a lone
  voice") as near-speech, ~5 dB under its neighbours. Write "sung, full voice" and add `spoken word, whispered vocals`
  to Exclude for that section.
- **Avoid `[Spoken]` asides**: Neel cut the only one that survived ("well, it's kind of my job") after the audio was
  recorded; it had to be removed by stem subtraction (`tools/mute_vocal_window.py`). Put quotes on screen instead.
- Neutral cues used wherever a style didn't override a section (a decent dramatic arc template):
  1 Intro: whispered, almost alone, then the beat drops · 2 Verse 1: intimate and sparse, half-sung · 3 Chorus: big and
  full, the hook, everyone in · 4 Verse 2: the groove locks in; stop-time, then the whole group shouts the last line ·
  5 Verse 3: half-rapped, confident, a spoken aside · 6 Pre-Chorus: rising, building tension · 7 Chorus: bigger than
  before, backing vocals answer · 8 Verse 4: tight and staccato, the rhymes land hard · 9 Chorus: full, then a sudden
  hush on the last line · 10 Verse 5: dense and driving, half-rapped · 11 Chorus: tender, stripped back, soft ·
  12 Bridge: everything drops out; call and response; builds back up · 13 Verse 6: almost nothing (DON'T: see above) ·
  14 Final Chorus: key change up, the biggest moment, then a sudden stop on the last word.
- A stop-time gang shout ("(I AM THE GOLDEN GATE BRIDGE!)") and "cut to silence on the last word" both rendered well.
- **Fixing a section**: use the Legacy Editor (`suno.com/edit-legacy/<id>`): type the times (end first), edit the line
  in place, "Generate Replacements" makes 2; "Apply Replacement" is free and sample-identical outside the window. The
  Create-page "Replace Section" IGNORES its lyrics box and returns instrumentals (6 were handed to Neel unverified:
  "The resings are just the line, don't go quiet on me, followed by instrumental"). Verify a replacement's stored
  lyrics and transcription before showing it, and send each candidate with its lead-in.

## ElevenLabs Music prompts
Used for lyric-stage sketches (35 renders, ~12k credits), never for the full-song comparison (11 plans written by
`tools/eleven_plan.py`, none rendered: decide up front whether the comparison matters and say so if skipped).
The hook sketch that was played (the round-2 chorus sketch spec: 22 s, seed 29, `context_adherence: "high"`):
- positive_styles: `["128 BPM","K-pop girl-group synth-pop","minor-key synth-pop, pleading and emotional","girl-group unison on the hook","clear bright female lead vocal, crisp enunciation, dry upfront vocal"]`
- negative_styles: `["heavy reverb","mumbled vocals","distorted vocals","long instrumental intro"]`
- Result: Whisper recall 1.0 (gpt-4o 0.2: it truncates sung audio after the first line, so Whisper is primary).
Verse sketch (round 3, finalist A's verse 5: seed 31, 26 s, "tight half-rapped verse … every word clear"): recall
0.92 / 0.80. On ElevenLabs' Creator plan (Oct 2026) you get 2 concurrent music requests (a third gets 429;
`tools/eleven_music.py` retries); the credit counter lags, so diff `character_count` around a batch.
