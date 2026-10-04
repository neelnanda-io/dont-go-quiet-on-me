"""Causal check of the grokking run's key frequencies (run after grokking.py).

Loads the final checkpoint saved by grokking.py and edits only the number-token
embeddings W_E[0..112] in the Fourier basis:
  * keep only: keep the constant + key-frequency components, zero every other
    frequency (a "restricted" embedding)
  * remove:    zero the key-frequency components, keep everything else
    (an "excluded" embedding)
It then measures loss / accuracy on all 113^2 pairs and on the held-out test
split.  If the key frequencies are what the model uses, "keep only" should
barely hurt and "remove" should drop it to chance (1/113 = 0.9%).

This is a simpler, embedding-only cousin of the paper's restricted / excluded
loss (which ablates frequencies in the logits).  Adds an `embedding_ablation`
block to data/figures/grokking.json.
"""

import glob
import json
import os
import sys

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

import torch
import torch.nn.functional as F
from transformer_lens import HookedTransformer, HookedTransformerConfig

sys.path.insert(0, os.path.dirname(__file__))
from common import OUT_DIR, provenance, rnd, write_json  # noqa: E402
from grokking import P, fourier_basis, make_data  # noqa: E402


def evaluate(model, W_E_numbers, tokens, labels):
    saved = model.W_E.data[:P].clone()
    model.W_E.data[:P] = W_E_numbers.float()
    with torch.no_grad():
        logits = model(tokens)[:, -1].double()
    model.W_E.data[:P] = saved
    return {"loss": F.cross_entropy(logits, labels).item(),
            "acc": (logits.argmax(-1) == labels).double().mean().item()}


def main():
    path = os.path.join(OUT_DIR, "grokking.json")
    out = json.load(open(path))
    ckpts = sorted(glob.glob(os.path.join(OUT_DIR, "checkpoints", "grokking_mod113_seed*_step*.pt")))
    ck = torch.load(ckpts[-1], map_location="cpu", weights_only=False)
    cfg = HookedTransformerConfig(**{k: v for k, v in ck["cfg"].items()
                                     if k in HookedTransformerConfig.__dataclass_fields__ and k not in ("n_params",)})
    model = HookedTransformer(cfg)
    model.load_state_dict(ck["state_dict"])
    model.eval()

    xtr, ytr, xte, yte = make_data(ck["train_idx_seed"], 0.3, "cpu")
    x_all = torch.cat([xtr, xte]); y_all = torch.cat([ytr, yte])
    FB = fourier_basis()
    W = model.W_E.data[:P].double()
    C = FB @ W  # Fourier coefficients, rows [const, cos1, sin1, ...]

    key = out["summary"]["key_frequencies"]
    minor = out["summary"]["minor_frequencies"]

    def rows(freqs):
        return [r for k in freqs for r in (2 * k - 1, 2 * k)]

    def keep_only(freqs):
        mask = torch.zeros(P, 1, dtype=torch.float64)
        mask[[0] + rows(freqs)] = 1
        return FB.T @ (C * mask)

    def remove(freqs):
        mask = torch.ones(P, 1, dtype=torch.float64)
        mask[rows(freqs)] = 0
        return FB.T @ (C * mask)

    variants = {
        "original": W,
        "keep_only_key": keep_only(key),
        "keep_only_key_and_minor": keep_only(key + minor),
        "remove_key": remove(key),
        "remove_minor_only": remove(minor),
    }
    res = {}
    for name, We in variants.items():
        res[name] = {"all_pairs": evaluate(model, We, x_all, y_all), "test": evaluate(model, We, xte, yte)}
        print(f"{name:>26}: all-pairs acc {res[name]['all_pairs']['acc']:.4f} loss {res[name]['all_pairs']['loss']:.3g} | "
              f"test acc {res[name]['test']['acc']:.4f}")

    out["embedding_ablation"] = rnd({
        "provenance": provenance(__file__, checkpoint=os.path.relpath(ckpts[-1], OUT_DIR)),
        "note": ("Edit ONLY the number embeddings W_E[0..112] in the Fourier basis, then evaluate. keep_only_* keeps the "
                 "constant term plus the listed frequencies (key = " + str(key) + ", minor = " + str(minor) + ") and zeroes "
                 "the other frequencies; remove_* zeroes the listed frequencies. Chance accuracy = 1/113 = 0.0088."),
        "n_freqs_total": P // 2,
        "results": res,
    }, 4)
    write_json("grokking.json", out)


if __name__ == "__main__":
    main()
