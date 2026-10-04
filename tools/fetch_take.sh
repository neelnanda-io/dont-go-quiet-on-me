#!/bin/zsh
# Move one Suno WAV download from your downloads folder ($DOWNLOADS, default $HOME/Downloads) into audio/takes/<slug>/<style>_<id4>.wav and log it in takes.json.
# Usage: tools/fetch_take.sh dgq acappella_solo <suno-song-uuid> "a cappella, multitrack"
# Suno names the file after the song title, so every take of a style downloads under the SAME name: move each one
# before starting the next download, or Chrome appends " (1)" and the takes get mixed up.
set -e
slug=$1; style=$2; id=$3; label=$4
cd "$(dirname "$0")/.."
src="${DOWNLOADS:-$HOME/Downloads}/Don't Go Quiet On Me ($label).wav"
for i in {1..60}; do   # wait up to 60 s for the finished file (no .crdownload partner, size stable)
  if [[ -f "$src" && ! -f "$src.crdownload" ]]; then
    s1=$(stat -f %z "$src"); sleep 1; s2=$(stat -f %z "$src")
    [[ "$s1" == "$s2" && "$s1" -gt 1000000 ]] && break
  fi
  sleep 1
done
[[ -f "$src" ]] || { echo "no download at: $src"; exit 1; }
dst="audio/takes/$slug/${style}_${id[1,4]}.wav"
mkdir -p "audio/takes/$slug"
mv "$src" "$dst"
dur=$(afinfo "$dst" | awk '/estimated duration/ {print $3}')
python3 - "$slug" "$id" "$dst" "$dur" <<'PY'
import json, sys, datetime
from pathlib import Path
slug, sid, dst, dur = sys.argv[1:]
p = Path(f"audio/suno/{slug}/takes.json")
d = json.loads(p.read_text())
t = next(t for t in d["takes"] if t["suno_id"] == sid)
when = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
t["downloaded"] = f"{when} (WAV, {float(dur):.1f} s)"
t["file"] = dst
d.setdefault("downloads_log", []).append({"when": when, "take": t["take"]})
p.write_text(json.dumps(d, indent=1) + "\n")
print(f"{t['take']} -> {dst} ({float(dur):.1f} s); downloads logged: {len(d['downloads_log'])}")
PY
