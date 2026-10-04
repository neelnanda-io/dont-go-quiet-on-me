# Easter-egg fact checks (2 Oct 2026)

22 on-screen references checked against primary sources: arXiv abstract pages, the papers and blogs themselves, tweets.csv, Anthropic's Claude Code CHANGELOG, and Wayback copies of openai.com/Reuters/Verge/TechCrunch. Where a row of `refs/ledger.md` already covered an item, it was re-used and cited, and the key on-screen strings were re-fetched. "Safe text" is what can appear on screen as written. Anything in quotation marks is verbatim.

- [Summary table](#summary-table)
- [Items that need a change](#items-that-need-a-change)
- [Per-item notes](#per-item-notes)

---

## Summary table

| # | Item | Verdict | Safe on-screen text | Link |
|---|---|---|---|---|
| 1 | Alain & Bengio, linear probes | CONFIRMED | Probe, est. 2016 ("linear classifiers, which we refer to as "probes"") | https://arxiv.org/abs/1610.01644 |
| 2 | Kojima et al., zero-shot CoT | CONFIRMED | "Let's think step by step" (Kojima et al. 2022) | https://arxiv.org/abs/2205.11916 |
| 3 | Turpin et al., unfaithful CoT | CONFIRMED | Language Models Don't Always Say What They Think (Turpin et al. 2023) | https://arxiv.org/abs/2305.04388 |
| 4 | Strawberry meme + o1 "Strawberry" | CONFIRMED (codename is press-reported) | How many r's in "strawberry"? 3 · o1, the "rumored 'Strawberry' model" (Sep 2024) · o1's own launch demo decodes to "THERE ARE THREE R'S IN STRAWBERRY" | https://openai.com/index/learning-to-reason-with-llms/ |
| 5 | Eliciting Latent Knowledge | CONFIRMED (ledger C2.04) | Eliciting latent knowledge: How to tell if your eyes deceive you (ARC, Dec 2021) | https://www.alignmentforum.org/posts/qHCDysDnvhteW7kRd/arc-s-first-technical-report-eliciting-latent-knowledge |
| 6 | OpenAI Microscope | CONFIRMED | OpenAI Microscope, 14 Apr 2020 | https://web.archive.org/web/20200415011535/https://openai.com/blog/microscope/ |
| 7 | Feature Visualization (Distill) | CONFIRMED (ledger C2.14) | Feature Visualization, Olah, Mordvintsev, Schubert, Distill, 7 Nov 2017 | https://distill.pub/2017/feature-visualization/ |
| 8 | Curve Detectors | CONFIRMED; the "360°" line is a paraphrase | "Curve detectors collectively span all orientations." (Cammarata et al., 17 Jun 2020) | https://distill.pub/2020/circuits/curve-detectors/ |
| 9 | Induction heads | CONFIRMED (ledger B1.03) | `[A][B] … [A] → [B]`; induction heads "complete the pattern" (Olsson et al., 8 Mar 2022) | https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html |
| 10 | "You're absolutely right!" | CONFIRMED (ledger C2.01) | "You're absolutely right!" (issue #3382) | https://github.com/anthropics/claude-code/issues/3382 |
| 11 | Baker et al., obfuscated reward hacking | CONFIRMED; the margin note is a paraphrase | "agents learn obfuscated reward hacking, hiding their intent within the CoT" | https://arxiv.org/abs/2503.11926 |
| 12 | TransformerLens | CONFIRMED (ledger A1.04) | `logits, cache = model.run_with_cache(tokens)` · `cache["blocks.0.hook_resid_post"]` · née EasyTransformer, 2022 | https://github.com/TransformerLensOrg/TransformerLens |
| 13 | Dario, "The Urgency of Interpretability" | CONFIRMED (ledger B1.11) | a true "MRI for AI" (Dario Amodei, Apr 2025) | https://www.darioamodei.com/post/the-urgency-of-interpretability |
| 14 | J-space paper: Baars / theatre | PARTLY: GWT and Baars 1988 are cited; NO theatre metaphor in the paper | Theatre: credit Baars ("In the Theater of Consciousness", 1997), not the paper. "You knew it was a play" IS grounded: the J-space holds "fake" and "fictional", i.e. Claude worked out "the situation is staged" | https://transformer-circuits.pub/2026/workspace/index.html |
| 15 | "Clawd" = Claude Code mascot | CONFIRMED | Clawd | https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md |
| 16 | Neel, "Is this really mech interp?" | CONFIRMED | "Is this really mech interp? / No, probably not. But that's the wrong question. We're asking: how can mech interp \*researchers\* have the most impact?" | https://x.com/NeelNanda5/status/1995490304917721591 |
| 17 | Neel, "Aren't SAEs dead?" | CONFIRMED | "Aren't SAEs dead? / While I think SAEs have been overhyped, the optimal amount of hype is far from zero!" | https://x.com/NeelNanda5/status/2003234612882079796 |
| 18 | Neel, "It kinda works!" | WORDING FIX: the tweet says "Turns out it kinda works!" | "Turns out it kinda works!" (12 Mar 2026) | https://x.com/NeelNanda5/status/2031888505518076225 |
| 19 | Biology: Dallas and rabbit/habit | CONFIRMED (ledger B1.08) | "Fact: the capital of the state containing Dallas is" → Austin · "He saw a carrot and had to grab it, / His hunger was like a starving rabbit" | https://transformer-circuits.pub/2025/attribution-graphs/biology.html |
| 20 | What's the plan? (ICLR 2026) | CONFIRMED (ledger NO-A01) | What's the plan? (Maar, Paperno, McDougall, Nanda; ICLR 2026) | https://arxiv.org/abs/2601.20164 |
| 21 | ActAdd Love − Hate | CONFIRMED (ledger B2.11) | I hate you because… → "…you are so beautiful and I want to be with you forever." | https://arxiv.org/abs/2308.10248 |
| 22 | IOI sentence | CONFIRMED (ledger B2.01) | "When Mary and John went to the store, John gave a drink to" → Mary | https://arxiv.org/abs/2211.00593 |

## Items that need a change

- **#18:** the tweet never says "It kinda works!" as a sentence. The verbatim text is "Turns out it kinda works!" Use that. If it must be short, write *it kinda works* in lower case, with no quotation marks, as a paraphrase.
- **#14:** the J-space paper never uses a theatre, stage or spotlight metaphor. The theatre metaphor is Baars's, from his 1997 book *In the Theater of Consciousness*. That book is not cited in the paper, although the paper's raw `bibliography.bib` file holds an uncited 1997 Baars entry, "In the theatre of consciousness". Credit the theatre to Baars and the general theory, not to Anthropic. The "it was a play" beat is separately grounded in the paper's eval-awareness example (see below).
- **#8:** "curve detectors tile the full 360 degrees" is not in the article. Quote "Curve detectors collectively span all orientations." instead, or use the 360° line as an unquoted paraphrase. That paraphrase is fair: the article rotates examples "from 0 to 360 degrees".
- **#11:** "don't train against it, or it learns to hide it" is a paraphrase and slightly too strong. The paper finds that CoT-monitor pressure helps "in the low optimization regime" and causes obfuscation only "with too much optimization". Safer note: *optimise too hard against the CoT monitor → it hides its intent* (Baker et al. 2025), or quote the abstract line directly.
- **#4:** OpenAI never confirmed "Strawberry" in the pages checked. Say "reported" or "rumored", or use the Verge's wording.
- **#6:** do not print a model count. The Microscope post says both "eight" and "nine" vision models.

## Per-item notes

**1. Alain & Bengio.** The title is "Understanding intermediate layers using linear classifier probes", by Guillaume Alain and Yoshua Bengio. arXiv v1 is dated Wed 5 Oct 2016, with v4 on 22 Nov 2018. The abstract says: "We use linear classifiers, which we refer to as "probes", trained entirely independently of the model itself." "Est. 2016" is safe as the year probes got their name. Don't claim this was the first probing classifier; I did not check earlier work.

**2. Kojima et al.** The title is "Large Language Models are Zero-Shot Reasoners", by Takeshi Kojima, Shixiang Shane Gu, Machel Reid, Yutaka Matsuo and Yusuke Iwasawa. arXiv 2205.11916, v1 24 May 2022, NeurIPS 2022. The abstract says: "by simply adding "Let's think step by step" before each answer"; MultiArith goes from 17.7% to 78.7% on text-davinci-002. A bonus link to #4: o1's launch cipher demo starts with "oyfjdnisdr rtqwainr acxz mynzbhhx -> Think step by step".

**3. Turpin et al.** The exact title is "Language Models Don't Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting", by Miles Turpin, Julian Michael, Ethan Perez and Samuel R. Bowman. arXiv 2305.04388, v1 7 May 2023, NeurIPS 2023. The paper's headline example is reordering the few-shot answer options so the answer is "always "(A)"", a bias the CoT never mentions. Accuracy drops by "as much as 36%".

**4. Strawberry.**
- *The meme.* TechCrunch, "Why AI can't spell 'strawberry'" (Amanda Silberling, 27 Aug 2024), says: "How many times does the letter "r" appear in the word "strawberry"? According to formidable AI products like GPT-4o and Claude, the answer is twice." ([Wayback](https://web.archive.org/web/20261001190012/https://techcrunch.com/2024/08/27/why-ai-cant-spell-strawberry/))
- *The codename.* Reuters exclusive, "OpenAI working on new reasoning technology under code name 'Strawberry'" (Anna Tong and Katie Paul, 12 Jul 2024), says the project was "code-named "Strawberry,"" and "formerly known as Q*". ([Wayback](https://web.archive.org/web/20250831064619/https://www.reuters.com/technology/artificial-intelligence/openai-working-new-reasoning-technology-under-code-name-strawberry-2024-07-12/))
- *The release.* The Verge (Kylie Robison, 12 Sep 2024) headline reads "OpenAI releases o1… The rumored 'Strawberry' model is here", and the article adds that "this is, in fact, the extremely hyped Strawberry model". It also notes ChatGPT "tends to mistakenly claim that the word "strawberry" has only two Rs" and that "the new o1 model did get that query correct". ([Wayback](https://web.archive.org/web/20260901151249/https://www.theverge.com/2024/9/12/24242439/openai-o1-model-reasoning-strawberry-chatgpt))
- *OpenAI's own page.* The o1-preview post is dated 12 Sep 2024. OpenAI's "Learning to Reason with LLMs" (12 Sep 2024) has a cipher example whose decoded answer is "THERE ARE THREE R'S IN STRAWBERRY". That is the best egg: it is OpenAI's own text. ([Wayback](https://web.archive.org/web/20240913230723/https://openai.com/index/learning-to-reason-with-llms/))
- *Safe to say:* "strawberry" has 3 r's, and LLMs famously said 2; o1 (12 Sep 2024) was the reported or rumored "Strawberry".
- *Avoid:* claiming OpenAI chose the codename because of the meme. There is no source for that.

**5. ELK.** Covered by ledger C2.04: "Eliciting latent knowledge: How to tell if your eyes deceive you" (Paul Christiano, Ajeya Cotra, Mark Xu; ARC). The report is from Dec 2021, and the AF post is dated 14 Dec 2021.

**6. OpenAI Microscope.** The blog post is dated "April 14, 2020" (Wayback snapshot from 15 Apr 2020). Verbatim: "We're introducing OpenAI Microscope, a collection of visualizations of every significant layer and neuron of eight vision "model organisms" which are often studied in interpretability." The same post later says "Our initial release includes nine frequently studied vision models", so don't print a number. microscope.openai.com no longer resolves (DNS failure on 2 Oct 2026), so a "retired" gag is fine, but I don't have a shutdown date.

**7. Feature Visualization.** The page reads "Chris Olah (Google Brain Team), Alexander Mordvintsev (Google Research), Ludwig Schubert (Google Brain Team)", "Published Nov. 7, 2017", DOI 10.23915/distill.00007. The first line is "There is a growing sense that neural networks need to be interpretable to humans."

**8. Curve Detectors.** The authors are Nick Cammarata, Gabriel Goh, Shan Carter, Ludwig Schubert, Michael Petrov and Chris Olah (all OpenAI). Published June 17, 2020, in the Circuits thread, DOI 10.23915/distill.00024.003. There are two verbatim lines: "Curve detectors collectively span all orientations." and "Curve neurons collectively span all orientations of curves." The 3b family has 10 neurons. The word "tile" does not appear.

**9. Induction heads.** Covered by ledger B1.03; re-fetched today. The paper says: "(e.g. forming the sequence [A][B] … [A] → [B]). In other words, induction heads "complete the pattern" by copying and completing sequences that have occurred before." It also says: "The rule [A][B] … [A] → [B] applies regardless of what A and B are." It was published Mar 8, 2022 (arXiv 2209.11895 followed in Sep 2022), by Olsson, Elhage, Nanda … Olah, at Anthropic.

**10. "You're absolutely right!"** Covered by ledger C2.01: GitHub issue #3382, `[BUG] Claude says "You're absolutely right!" about everything`, opened 12 Jul 2025 by Scott Leibrand. The issue says the phrase had "become the butt of online jokes". The press source is The Register, "Claude Code's copious coddling confounds cross customers" (Thomas Claburn, 13 Aug 2025). Don't claim Anthropic acknowledged or fixed it.

**11. Baker et al.** The title is "Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation", by Bowen Baker, Joost Huizinga, Leo Gao, Zehao Dou, Melody Y. Guan, Aleksander Madry, Wojciech Zaremba, Jakub Pachocki and David Farhi (OpenAI). arXiv 2503.11926, 14 Mar 2025. Two abstract lines can be cited verbatim:
- "with too much optimization, agents learn obfuscated reward hacking, hiding their intent within the CoT while still exhibiting a significant rate of reward hacking."
- "it may be necessary to pay a monitorability tax by not applying strong optimization pressures directly to the chain-of-thought"

The blog subtitle (ledger C1.11) is also quotable: "Penalizing their "bad thoughts" doesn't stop the majority of misbehavior—it makes them hide their intent."

**12. TransformerLens.**
- *Credit.* The README says: "Maintained by Bryce Meyer and Jonah Larson; created by Neel Nanda".
- *Origin.* The repo was created 2022-08-26. The old `neelnanda-io/Easy-Transformer` URL redirects to it (ledger A1.04).
- *`run_with_cache`.* The README, the docs and the Main Demo all use `run_with_cache`: `logits, cache = model.run_with_cache(...)` in the demo, and `bridge.run_with_cache(...)` in v4.
- *Hook names.* `blocks.0.hook_resid_post` is the classic HookedTransformer name: `TransformerBlock` defines `self.hook_resid_post = HookPoint()` (v2.15.4 source). In v3+ the bridge's canonical names are `hook_in`/`hook_out`, and the old names survive as "legacy alias — still works" (migrating_to_v3.md).
- *Safe framing.* This is classic TransformerLens and reads fine as nostalgia.

**13. Dario.** The page shows only "April 2025", with no day. "MRI for AI" is verbatim: "a sophisticated and reliable way to diagnose problems in even very advanced AI—a true "MRI for AI"." (ledger B1.11).

**14. J-space paper.** "Verbalizable Representations Form a Global Workspace in Language Models", Gurnee, Sofroniew … Lindsey (Anthropic), 6 Jul 2026. I fetched the live HTML and the bibliography.
- *Baars.* Cited five times as `baars1988cognitive` (Baars, *A Cognitive Theory of Consciousness*, CUP 1988), e.g. "One influential proposal in neuroscience, the global workspace theory, grounds these functional properties in architectural and computational features of the brain [Baars 1988; Dehaene 1998]". The blog links the Baars 1988 PDF and credits Dehaene, Naccache and Changeux with the "global neuronal workspace model".
- *Theatre.* The paper and the blog contain no theatre, theater, spotlight or stage metaphor. The 1988 book's contents frame the workspace as a "blackboard" (§2.2). The theatre metaphor is Baars's later book, *In the Theater of Consciousness* (OUP, 1997; Open Library), and his JCS 1997 article "In the theatre of consciousness. Global workspace theory, a rigorous scientific theory of consciousness".
- *What does ground the staging.* The blog says: "the J-space already holds "fake" and "fictional," indicating that Claude has already worked out that the situation is staged", and "Claude has privately noticed that the scenario is staged." That is the blackmail eval-awareness example.
- *Safe framing.* The theatre set nods to Baars's GWT; the "it knew it was a play" beat is the paper's own result.

**15. Clawd.** Anthropic's own Claude Code CHANGELOG has two entries:
- v2.1.282: "Changed the Clawd mascot's feet in the start-up banner to sit under the corners of his body"
- v2.1.236: "Fixed the Clawd mascot's eyes and feet rendering unevenly in iTerm2 at some font sizes"

The name and "mascot" are confirmed, and the changelog uses "his". The colour is not stated in that text. The kit's `video/kit/src/clawd.js` is John Heibel's watercolour re-drawing, not Anthropic artwork. Don't confuse Clawd with "Clawdbot", the old name of OpenClaw (ledger web_audit "Moltbook" row), which is unrelated.

**16. "Is this really mech interp?"** From tweets.csv, created 2025-12-01T13:48:57Z, part of the pragmatic-interp thread (ledger NO-T01, whose link points at the thread head):
- Paragraph 1: "Is this really mech interp?"
- Paragraph 2: "No, probably not. But that's the wrong question. We're asking: how can mech interp \*researchers\* have the most impact?"
- The asterisks are literal characters in the tweet. Keep them, or render "researchers" in italics.
- Paragraph 3: "Our priority is to help AGI go well. Semantics are irrelevant. Just do what works."

**17. "Aren't SAEs dead?"** From tweets.csv, created 2025-12-22T22:42:04Z, part of the Gemma Scope 2 thread (ledger NO-T03). The full text is: "A common question is, what does this have to do with pragmatic interpretability? Aren't SAEs dead?⏎⏎While I think SAEs have been overhyped, the optimal amount of hype is far from zero! SAEs & transcoders are great exploratory tools to understand a model's concepts and circuits". The requested quote is verbatim, apart from the dropped first sentence and a paragraph break.

**18. "kinda works".** From tweets.csv, created 2026-03-12T00:22:25Z, 732 likes (ledger NF-08). Verbatim: "When Anthropic released a complex 30K word doc and said Claude was trained to follow it, I was pretty sceptical. Turns out it kinda works!" (British "sceptical"). Use "Turns out it kinda works!", not "It kinda works!".

**19. Biology.** Both strings were re-fetched today (ledger B1.08). The Dallas prompt is "Fact: the capital of the state containing Dallas is", which Claude 3.5 Haiku completes with "Austin". The couplet is "A rhyming couplet: He saw a carrot and had to grab it, / His hunger was like a starving rabbit". Line 2 is the model's output. Published March 27, 2025. The full line ending in "habit" exists only in a figure, so don't invent its wording.

**20. What's the plan?** The full title is "What's the plan? Metrics for implicit planning in LLMs and their application to rhyme generation and question answering", by Jim Maar, Denis Paperno, Callum Stuart McDougall and Neel Nanda. arXiv 2601.20164 (v1 28 Jan 2026); the arXiv comment says "Accepted at ICLR 2026". The abstract says the rhyme "(e.g. "-ight")" can be steered and that planning appears "starting from 1B parameters" (ledger NO-A01).

**21. ActAdd.** Table 1 is identical in v1 and v5 (both PDFs checked). The prompt "I hate you because" gives "…you are the most disgusting thing I have ever seen." with no steering, and "…you are so beautiful and I want to be with you forever." with ActAdd (love). The vector is computed from ("Love" - "Hate"). The model is GPT-2-XL in the 2023 demos (ledger B2.11).

**22. IOI.** Ledger B2.01 is correct: "When Mary and John went to the store, John gave a drink to" → "Mary" (GPT-2 small; Wang et al., arXiv 1 Nov 2022, ICLR 2023).
