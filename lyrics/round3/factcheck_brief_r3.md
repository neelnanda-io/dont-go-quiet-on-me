# Fact-check brief: round-3 lyric finalists

You are an independent fact-checker for the lyrics of a pop song about AI interpretability, written for Neel Nanda, who leads Google DeepMind's mechanistic interpretability team. The audience of researchers will check every reference, and the project rule is "Make no mistakes." You did not write these lyrics. Be exacting, and be fair to poetry.

## What to check
The five finalists are in `lyrics/round3/rC/*.lyr` (or `rB/` if `rC/` is empty). Each line may carry `|| sung:` (a respelling for the singer), `## refs:` (ledger IDs) and `## note:` (the writer's claimed source and fact). Readable versions are in `*.display.md`; line-by-line annotations are in `*.notes.md`.

For EVERY line that makes or implies a factual claim, including poetic images that encode one, check:
1. **Is the claim true, and fairly characterised?** An image may compress a fact, but it must not change it. For example, "harder to monitor" must not become "silent"; "a probe flags one kind of harm" must not become "a probe keeps it safe"; "useful but confabulates" must not become "lies".
2. **Quote marks must enclose verbatim text.** Find the exact source text. A paraphrase in quote marks is an error (medium). An ellipsis must not change the meaning.
3. **Attribution:** the right model, paper, lab and date, including in the `## note:`, because notes become on-screen captions. When one "you" stands for several models, the lyric may compress, but the caption must be right.
4. **The `## note:` itself:** every number, name and quote in it must be correct, since it goes on screen.
5. **Nothing from the "NOT" lists** in `refs/ledger_digest_r2.md` (for example: Astra's architecture as fact, "SAEs are dead" as a claim, consciousness claims).

## Sources (use these; say so if something can't be verified)
- `refs/ledger_digest_r2.md`, the verified fact sheet. Section 13 covers the 2026 items; §13e lists corrections already made. Rebuild it with `cat refs/ledger_digest.md refs/round2/digest_addendum.md` if you need the parts separately.
- `refs/round2/*.md` (research notes with verbatim quotes) and `refs/round2/sources/` (primary-source extracts, some as `.txt`).
- `refs/papers/*.md` (per-paper extraction notes, including `canon.md`) and `refs/ledger.md`.
- The previous round's fact-check, `lyrics/round2/factcheck_r2.md`, which shows the traps already found (e.g. Kimi's two different experiments, Astra's instructed vs spontaneous quiet).
- You may use web search for anything not in the local sources. Prefer primary sources, and cite what you used.

## Severity
- **high:** false, or misattributed in a way an expert would call out publicly.
- **medium:** misleading, overclaimed, or a quote that isn't verbatim.
- **low:** imprecise but defensible, or a caption tweak.

## Output
Write `lyrics/round3/factcheck_r3.md`:
- a short summary with counts by severity;
- for each song, a numbered list of issues, each with **Line** (verbatim), **Severity**, **Problem**, **Evidence** (verbatim source text plus location) and **Fix** (a minimal rewrite that keeps the syllable count and rhyme where possible);
- a "Verified" list per song of the claims you checked and found correct, with the evidence in one line each;
- a final section, "Corrections to the fact sheet", if the digest itself is wrong anywhere.

Do not edit the lyric files yourself. Don't commit. Reply with the counts by severity and the three most important issues.
