// dump_shots.mjs: the shot list (video/kit/src/data/dgq_shots.js) resolved against the locked song (cut times, end
// times, the lyric lines each shot carries), as JSON for tools/build_video_page.py (treatment doc + checkpoint page).
//   node tools/dump_shots.mjs > output/checkpoint_video/shots.json
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ROOT = new URL('..', import.meta.url).pathname;
const ctx = {}; vm.createContext(ctx);
vm.runInContext(readFileSync(ROOT + 'video/kit/src/data/song.js', 'utf8') + ';globalThis.SONG = SONG;', ctx);
const SONG = ctx.SONG;
const { DGQ_SHOTS, DGQ_FLOWS, DGQ_TWEETS, shotTime } = require(ROOT + 'video/kit/src/data/dgq_shots.js');

const shots = DGQ_SHOTS.map(s => ({ ...s, t0: +shotTime(s.at, SONG).toFixed(2) }));
shots.forEach((s, i) => { s.t1 = +(i + 1 < shots.length ? shots[i + 1].t0 : SONG.duration).toFixed(2); });
for (const s of shots) s.lines = SONG.lines.filter(l => l.t1 > s.t0 + .05 && l.t0 < s.t1 - .05).map(l => l.display);
process.stdout.write(JSON.stringify({ duration: SONG.duration, shots, flows: DGQ_FLOWS, tweets: DGQ_TWEETS }, null, 1));
