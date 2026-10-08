# Stage 4: Publishing

Offer the shipping package up front, so it's planned rather than improvised: the final page, an unlisted YouTube
upload with the AI label, the description (the commissioner's opening line, the reference-doc link, era chapters with
lyrics, credits), and the public reference doc with stills. Upload only when the notes have stopped: **YouTube cannot
replace a video's file without changing its link.**

## Contents
- [The final page](#the-final-page)
- [Resolution](#resolution)
- [YouTube upload (Claude in Chrome)](#youtube-upload-claude-in-chrome)
- [Description and chapters](#description-and-chapters)
- [The reference doc](#the-reference-doc)
- [Credits](#credits)

---

## The final page
`tools/build_final_page.py` → a final-page output folder → published as its own page (an Artifact in the first
project). Contents: the video (960×540, crf ladder 27→35 to stay
under 15 MB), poster, section thumbs, chapter chips, "Things to spot" (every item sourced, NEW badges), ship /
ship-after-tweaks / rework buttons plus a thumb per section, each round's (note → change) list, left-out ideas with
Add/Leave, the cameo-coverage table, reading-list coverage. It reached 27 MB over 129 files. The media step re-encodes
only when stale; force it with `--media`. The full 1080p file goes to a separate, gitignored output folder.

## Resolution
Upload at 1440p so YouTube serves its better (VP9/AV1) streams even to 1080p viewers. If the kit isn't
resolution-independent, upscale: `ffmpeg -i in.mp4 -vf scale=2560:1440:flags=lanczos -c:v libx264 -crf 15 -preset slow
-c:a copy out_1440p.mp4` (~480 MB for 4:22). A native 4K render needs the scale constant from day one.

## YouTube upload (Claude in Chrome)
- Ask before uploading (it publishes on the commissioner's channel). Use their logged-in browser; never touch their
  other tabs.
- **The browser tool can't attach files over 10 MB**: ask the commissioner early to drag the file into the upload
  dialog themselves (the dialog waited ~4.5 h for Neel the first time).
- Form answers used: title = the song's name; description pasted via the clipboard (tell the commissioner it
  overwrote their clipboard); **not made for kids**; no paid promotion; **"Altered or synthetic content" / AI use: Yes** — YouTube's
  form now covers "Create music that's the main focus of the video" (the agent had planned "No" and had to reverse);
  ads/monetisation off and ad-suitability questions left to the commissioner (their revenue); auto thumbnail unless
  they want one; visibility **Unlisted** unless they say otherwise. Wait for the copyright and community checks to come back clean.
- Pasting the description: put the text on the clipboard (`pbcopy < output/youtube_description.txt`), click the box,
  cmd+a, cmd+v; verify by reading back the textbox's `innerText` length before saving; Save goes grey when saved.

## Description and chapters
Builder: `output/doc_stills/build_description.py` (reproduces the live description, `output/youtube_description.txt`,
byte for byte). Layout:
```
<the commissioner's opening line — first project: "A stylised history of mech interp (with as many references as Opus and I could cram in)">

Every reference in the video, with stills and sources: <doc link>

0:00 Intro: <title>
<that section's lyrics>

0:19 <era / subfield title, with years>
<lyrics>
…
4:09 Credits
<credit lines>
```
- Chapter titles name the era or subfield ("Model forensics (2026)") so viewers see the structure in the progress bar.
  Take the stamps from the shot list's section starts, rounded down.
- **YouTube's chapter rules, asserted by the script** (it silently shows no chapters if any fails): the first stamp is
  0:00, stamps ascend, at least 3 chapters, every chapter ≥ 10 s (fold a short pre-chorus into the next section),
  description ≤ 5,000 characters, no `<` or `>`.
- Strip pronunciation annotations (`〔sung:…〕`) from the lyrics.
- **Verify live**: read the watch page's `ytInitialData` for `chapterRenderer` entries (all N with the right start
  times), and hover the progress bar to see a chapter title.

## The reference doc

**Build the reference list from an audit of the finished video, not from your notes.** The first page listed only the 141 "things to spot" written during production; Neel found it missing "each page in the riffle, the 5 pointer star in the shoggoth's eye, etc". An audit (one agent per section reading the scene code and rendered frames, plus one for recurring elements) found 95 more; an independent fact-check kept 78 (visible in the still, source quote verbatim, grounded in the project's own notes, not a duplicate). Give every reference its own close-up still at the moment it is clearest, with a timestamp link, not one still per shot. Split bundled entries into one per reference.

The final public version is a GitHub Pages site (`docs/index.html`) built by `tools/build_reference_page.py` in this repo from the notes list, one still per reference (time, crop, alt) and the audited extras; it hides bundled entries whose every point has its own entry, and fails the build on second person, a missing still or a duplicate.

"<Song>: every reference" — a Claude Doc built from the reference record and per-shot stills
(`output/doc_stills/build_doc.py`; the first project's is public as this repo's `docs/` page,
https://neelnanda-io.github.io/dont-go-quiet-on-me/): one chapter per song section, a still for every shot, "What to
spot" lines with source links, credits.
- Render stills with `render.mjs --stills` at each shot's best moment; upload them as artifact assets (≤25 per call,
  files inside the working directory), create blobs, reference `![alt](blob/<id>)`; fill one section per update.
- Write every line in the third person from the start (the first build needed a 28-entry "your X" → "Neel's X"
  replacement list plus a guard that fails on any leftover "you").
- **Only the doc's owner (normally the commissioner) can share it publicly** (Share menu → public link where offered;
  otherwise Export → Google Docs and send back the new link, or publish it as a static page). Ask them to do that
  BEFORE the link goes in the description, or tell them plainly that viewers can't open it until they do.
- Optional extra people liked in the plan but never made: an easter-egg reply thread for X.

## Streaming lyrics
**DistroKid's synced-lyrics tool can be driven exactly** (Oct 2026): it is a hold-the-space-bar page whose handlers are
`document.body.onkeydown/onkeyup` checking only `e.keyCode == 32` and stamping `track[0].getCurrentTime()` (WaveSurfer).
Mute the player (`track[0].setVolume(0)`), then call the handlers with `{keyCode: 32, preventDefault(){}}` when the
player's clock reaches each line's begin/end from the forced alignment. Tick from a Web Worker (`setInterval` 5 ms +
postMessage) because a hidden tab throttles page timers to ~1 s; start playback with one real click on Play. Result:
57 lines within 11 ms. It needs Musician Plus; Spotify delivery needs Lyric Blaster.

## Credits
First project's end card and description: "vocals & band: Suno v6 / lyrics, animation & mix: Claude Opus 5.5 / prompt
inspiration: Donald Jewkes / moral support: Neel Nanda". Neel removed an employer-affiliation disclaimer and "made
with AI" from the credits, and said "no need to give TetraSpace West explicit credit for the Shoggoth meme". Ask what
the commissioner wants each time; keep model names current.
