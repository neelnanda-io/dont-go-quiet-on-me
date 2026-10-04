"""Logit lens on GPT-2 small for an IOI sentence.

Prompt: "When Mary and John went to the store, John gave a drink to"
(the indirect-object-identification task of Wang et al. 2022; the right answer
is " Mary").  The logit lens (nostalgebraist 2020) decodes the residual stream
after each layer with the model's own final LayerNorm + unembedding, so you can
watch the model's best guess sharpen layer by layer.

Residual streams decoded: after 0 layers (embeddings) through after 12 layers
(the real output) -> 13 rows.  The last row equals the model's actual logits
(checked below).

Outputs data/figures/logit_lens.json:
  * final position: top-5 tokens + probabilities at every depth; probability,
    rank and logit of " Mary" and " John"; logit difference Mary - John
  * grid: top-1 token and its probability at every (depth, position), the
    classic logit-lens picture
"""

import os
import sys

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

import torch
from transformer_lens import HookedTransformer

sys.path.insert(0, os.path.dirname(__file__))
from common import provenance, rnd, write_json  # noqa: E402

PROMPT = "When Mary and John went to the store, John gave a drink to"
TOPK = 5


def main():
    model = HookedTransformer.from_pretrained("gpt2", device="cpu")
    model.eval()
    L = model.cfg.n_layers
    tokens = model.to_tokens(PROMPT)  # prepends BOS
    str_toks = model.to_str_tokens(tokens[0])

    with torch.no_grad():
        logits, cache = model.run_with_cache(tokens)
        # resid stack (L+1, T, d_model): input to block 0..L-1, then the final output
        resids = torch.stack([cache["resid_pre", l][0] for l in range(L)] + [cache["resid_post", L - 1][0]])
        # from_pretrained folds LN weights into W_U, so ln_final is LayerNormPre
        # (centre + normalise); applying it per-layer = the standard logit lens
        lens_logits = model.unembed(model.ln_final(resids))  # (L+1, T, vocab)
        probs = lens_logits.softmax(-1)

    assert torch.allclose(lens_logits[-1], logits[0], atol=1e-3), "last lens row must equal the model output"

    mary, john = model.to_single_token(" Mary"), model.to_single_token(" John")
    final = []
    for d in range(L + 1):
        p = probs[d, -1]
        lg = lens_logits[d, -1]
        tp, ti = p.topk(TOPK)
        rank = lambda t: int((lg > lg[t]).sum()) + 1  # noqa: E731
        final.append({
            "depth": d,
            "label": "embeddings" if d == 0 else f"after layer {d - 1}" + (" (model output)" if d == L else ""),
            "top": [{"token": model.to_string(int(i)), "prob": float(pp)} for pp, i in zip(tp, ti)],
            "mary": {"prob": float(p[mary]), "rank": rank(mary), "logit": float(lg[mary])},
            "john": {"prob": float(p[john]), "rank": rank(john), "logit": float(lg[john])},
            "logit_diff_mary_minus_john": float(lg[mary] - lg[john]),
        })
        print(f"{final[-1]['label']:>28}: " + ", ".join(f"{t['token']!r} {t['prob']:.2f}" for t in final[-1]["top"][:3])
              + f"  | Mary {final[-1]['mary']['prob']:.3f} (#{final[-1]['mary']['rank']})")

    top1p, top1i = probs.max(-1)  # (L+1, T)
    grid = {
        "note": ("grid.top1_token[d][t] = the logit lens's top guess for the NEXT token after position t, "
                 "decoding the residual stream after d layers (d=0: embeddings, d=12: model output)."),
        "top1_token": [[model.to_string(int(i)) for i in row] for row in top1i],
        "top1_prob": top1p.numpy(),
    }

    out = {
        "provenance": provenance(
            __file__,
            what="Logit lens (decode each layer's residual stream with the final LayerNorm + unembedding) on pretrained GPT-2 small",
            model="gpt2 (GPT-2 small, 124M, OpenAI weights) via TransformerLens HookedTransformer.from_pretrained('gpt2')",
            method=("resid_pre[l] (l=0..11) and resid_post[11] at each position -> ln_final (LayerNormPre, recomputed "
                    "per layer) -> unembed -> softmax; deterministic forward pass, no sampling"),
            device="cpu",
        ),
        "prompt": PROMPT,
        "tokens": str_toks,
        "tokens_note": "tokens[0] is the BOS token '<|endoftext|>' that TransformerLens prepends",
        "answer": " Mary", "distractor": " John",
        "final_position": final,
        "grid": grid,
    }
    write_json("logit_lens.json", rnd(out, 4))


if __name__ == "__main__":
    main()
