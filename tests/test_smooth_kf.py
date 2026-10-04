"""smoothKf (video/kit/src/core.js): the monotone-cubic keyframes the hook's growth runs on (Neel, 3 Oct: the old eased
keyframes made the growth "way too jerky", because kf() with ease stops dead at every key).

Checks, by running the function's own source in node: it hits every key, its speed is continuous through the keys (no
jerk), it never overshoots monotone keys, a flat pair of keys starts it from rest, and it holds outside the keys.
"""
import json
import math
import re
import subprocess
from pathlib import Path

KIT = Path(__file__).resolve().parents[1] / "video/kit/src"
CORE = KIT / "core.js"


def run(keys, ts):
    src = CORE.read_text()
    fn = re.search(r"^function smoothKf\(t, keys\) \{.*?^\}", src, re.S | re.M).group(0)
    js = fn + f"\nconst K = {json.dumps(keys)};\nconsole.log(JSON.stringify({json.dumps(ts)}.map(t => smoothKf(t, K))));"
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


# the hook's own growth keys (its on-screen size, interpolated in log space), read from scenes/dgq_hook.js
SIG = json.loads(re.search(r"SIG: LOGK\((\[.*?\]\])\)", (KIT / "scenes/dgq_hook.js").read_text(), re.S).group(1))
LSIG = [[t, math.log(v)] for t, v in SIG]


def test_hits_every_key():
    vals = run(LSIG, [t for t, _ in LSIG])
    for (_, v), got in zip(LSIG, vals):
        assert abs(got - v) < 1e-9


def test_speed_is_continuous_through_keys():
    h = 1e-4
    for t, _ in LSIG[1:-1]:
        a, b, c, d = run(LSIG, [t - 2 * h, t - h, t + h, t + 2 * h])
        left, right = (b - a) / h, (d - c) / h
        assert abs(left - right) < 1e-2 * max(1, abs(left)), (t, left, right)


def test_monotone_never_overshoots_and_never_stalls_mid_growth():
    ts = [9.0 + i * 0.01 for i in range(int((17.5 - 9.0) / 0.01))]
    vals = run(LSIG, ts)
    rates = [(b - a) / 0.01 for a, b in zip(vals, vals[1:])]
    assert all(r >= 0 for r in rates)                       # never shrinks
    assert min(r for t, r in zip(ts, rates) if 9.6 < t < 17.4) > 0.03   # and never stops while it grows


def test_flat_pair_starts_from_rest_and_holds_outside():
    keys = [[0, 1.0], [1, 1.0], [2, 3.0]]
    a, b = run(keys, [1.0, 1.0 + 1e-4])
    assert abs((b - a) / 1e-4) < 1e-2                        # zero speed leaving the flat pair
    lo, hi = run(keys, [-5, 9])
    assert lo == 1.0 and hi == 3.0
