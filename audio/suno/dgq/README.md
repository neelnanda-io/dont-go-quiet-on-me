# Suno v6 takes: dgq (lyrics/final/dont_go_quiet.lyr)

Custom mode. Model **v6** (not v6-wild / v6-mini for finals). **Personalize: My Taste** (More Options) **Off**; never click the wand under Styles (it writes a new style prompt). See `audio/suno/UI_NOTES.md`.

| Field | Value |
|---|---|
| Lyrics | `lyrics_<style>.txt` (each style has its own section cues; `lyrics.txt` = neutral cues) |
| Styles | one of `styles_*.txt` |
| Exclude | `exclude_<style>.txt` |
| Weirdness | 25% |
| Style Influence | 75% |
| Variety | 0 (drafts; 30 when exploring) |
| Vocal Gender | kpop_electro Female, kpop_dark Female, acappella_solo Male, acappella_choir Female, orchestral_ballad Female, orchestral_trailer Male, broadway Female, hiphop_musical Male, pdoom_pop Female, comedy_musical Male, shanty Male, acappella_solo_v2 Male, orchestral_ballad_v2 Female |

Checks: {"lyrics_chars": 3683, "styles_chars": {"kpop_electro": 459, "kpop_dark": 309, "acappella_solo": 334, "acappella_choir": 311, "orchestral_ballad": 284, "orchestral_trailer": 286, "broadway": 278, "hiphop_musical": 287, "pdoom_pop": 351, "comedy_musical": 354, "shanty": 312, "acappella_solo_v2": 334, "orchestral_ballad_v2": 284}, "exclude_chars": 224, "sung_syllables": 682, "projected": {"2.7/s": "4:24", "3.0/s": "3:59"}}

## Take plan
2 generations (4 takes) per style x 13 styles; add generations only for styles that screen well.
Screen in the browser (no length cap for round 2: Neel lifted it; a natural pop length), then download only the
survivors for vocal QA (Demucs + two transcribers). Downloads are limited: log every one.

## Take log
`takes.json` (Suno id, style, duration, download status, QA). Not written by this script.
