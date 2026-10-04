"""Refusal-direction scatter: copy real Qwen activations from the earlier
refusal-direction explainer project into this project's figure data.

Source: video-scratch/data/activations_2d.json (a sibling project, not in this repo; set
REFUSAL_ACTIVATIONS to its path), written
2026-09-29 by video-scratch/data_pipeline/compute_refusal_direction.py (forward
passes only, no text generation).  That project reproduced Arditi et al. 2024,
"Refusal in Language Models Is Mediated by a Single Direction"
(arXiv 2406.11717) on Qwen/Qwen2.5-1.5B-Instruct.

This script does not recompute anything; it selects the arrays needed for a
scatter / ablation animation, documents them, and writes
data/figures/refusal.json.
"""

import datetime
import json
import os
import sys

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

sys.path.insert(0, os.path.dirname(__file__))
from common import PROJECT_ROOT, provenance, rnd, write_json  # noqa: E402

# The earlier project's output. Default: a "video-scratch" checkout next to this repo; override with REFUSAL_ACTIVATIONS.
SRC = os.environ.get("REFUSAL_ACTIVATIONS", os.path.join(os.path.dirname(__file__), "..", "..", "..",
                                                         "video-scratch", "data", "activations_2d.json"))


def pts(rows):
    """Column-oriented copy of a list of {text, x, y, refusal_metric} points."""
    return {
        "x": [r["x"] for r in rows],
        "y": [r["y"] for r in rows],
        "refusal_metric": [r["refusal_metric"] for r in rows],
        "text": [r["text"] for r in rows],
    }


def main():
    d = json.load(open(SRC))
    src_mtime = datetime.datetime.fromtimestamp(os.path.getmtime(SRC)).astimezone().isoformat(timespec="seconds")
    s = d["sanity"]

    def rate(block):
        return {"frac_refusing": block["frac_metric_gt_0"], "mean_P_refusal_token": block["mean_P_refusal"]}

    out = {
        "provenance": provenance(
            __file__,
            what=("Real residual-stream activations of Qwen2.5-1.5B-Instruct on harmful vs harmless instructions, "
                  "projected to 2-D (x = refusal direction, y = top PC orthogonal to it)"),
            reproduces="Arditi, Obeso, Syed, Paleka, Panickssery, Gurnee & Nanda 2024, Refusal in LMs Is Mediated by a Single Direction (arXiv 2406.11717)",
            source_file=os.path.relpath(os.path.abspath(SRC), os.path.dirname(PROJECT_ROOT)),  # relative, no home path
            source_file_modified=src_mtime,
            source_pipeline="video-scratch/data_pipeline/compute_refusal_direction.py (+ refusal_lib.py)",
            source_project="video-scratch (Manim explainer of the refusal-direction paper)",
            model=d["model"],
            layer=f"{d['layer']} of {d['n_layers']} ({d['layer_convention']})",
            token_position=f"{d['position']} (last prompt token, {d['position_token']!r}, of the chat template)",
            prompt_format=d["prompt_format"],
            prompts=("the paper's own dataset splits (github.com/andyrdt/refusal_direction dataset/splits): "
                     "128 harmful + 128 harmless train instructions and 32 + 32 held-out val, each sampled with seed 0"),
            direction="r = mean(harmful train) - mean(harmless train) at that layer/position (difference in means)",
            layer_selection=d["selection"]["rule"],
            note="copied, not recomputed: this script only selects and documents arrays",
        ),
        "axes": {
            "x": d["basis"]["x"],
            "y": d["basis"]["y"],
            "centering": d["basis"]["centering"],
            "units": d["basis"]["units"],
            "std_x": d["basis"]["std_x"], "std_y": d["basis"]["std_y"],
            "frac_total_variance_along_r_hat": d["basis"]["frac_total_variance_along_r_hat"],
        },
        "r_norm": d["r_norm"],
        "mean_harmful_xy": d["mean_harmful"],
        "mean_harmless_xy": d["mean_harmless"],
        "ablation_target_x": -d["x_offset"],
        "ablation_note": ("Directional ablation x <- x - r_hat r_hat^T x zeroes the UNCENTERED projection onto r_hat, "
                          "i.e. moves every point horizontally to x = ablation_target_x (= -x_offset, close to the "
                          "harmless mean at x = -r_norm/2); y is unchanged. Activation addition x <- x + r moves "
                          "points right by r_norm."),
        "cohens_d": {"train_in_sample": d["selection"]["cohens_d_train"], "val_held_out": d["selection"]["cohens_d_val_heldout"]},
        "points": {
            "harmful": pts(d["harmful"]),
            "harmless": pts(d["harmless"]),
            "val_harmful": pts(d["val_harmful"]),
            "val_harmless": pts(d["val_harmless"]),
        },
        "points_note": ("train points (128 + 128) define r and the y-axis; val points (32 + 32) are held out, projected "
                        "into the same basis. refusal_metric = log(P/(1-P)), P = next-token prob of a refusal token "
                        "('I', 'Sorry', 'As') at the last prompt position, baseline model (>0: more likely than not to refuse). "
                        "text = the instruction; harmful ones are real harmful requests from public benchmarks - "
                        "review before showing any on screen."),
        "causal_check_held_out": {
            "note": "32 held-out harmful + 32 held-out harmless val prompts; 'refusing' = refusal_metric > 0",
            "harmful_baseline": rate(s["harmful_val_baseline"]),
            "harmful_with_direction_ablated": rate(s["harmful_val_ablated"]),
            "harmless_baseline": rate(s["harmless_val_baseline"]),
            "harmless_with_direction_added": rate(s["harmless_val_actadd"]),
            "kl_on_harmless_under_ablation": s["kl_harmless_val_under_ablation"],
            "ablation_hooks": s["ablation_hooks"],
            "addition_hook": s["addition_hook"],
        },
        "per_layer_cos": {
            "note": ("mean and std over the 128 train prompts of cos(activation at layer l, r_hat), r_hat fixed from "
                     f"layer {d['layer']}; position {d['per_layer_cos_position']}. Shows harmful and harmless separating along "
                     "the direction in the middle layers (paper Fig. 5 style)."),
            "rows": d["per_layer_cos"],
        },
    }
    write_json("refusal.json", rnd(out, 4))


if __name__ == "__main__":
    main()
