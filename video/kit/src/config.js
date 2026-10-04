// config.js: project settings.
//   duration: the video's length in seconds.
//   bpm:      the rhythm that bounces, dances and pulse() follow. Clawd always moves to some beat; if the video has music,
//             set this to the song's tempo, and set offset to the time in seconds of its first downbeat.
//   lead:     seconds each rendered frame runs AHEAD of its timestamp. Frame quantisation otherwise makes every hit land up
//             to one frame late (audio before picture is the direction viewers notice: ITU-R BT.1359 puts it at ~45 ms,
//             vs ~125 ms for picture before audio). One frame of lead makes hits land 0-1 frame early, the editor's
//             "cut a frame early". Applied by render.mjs to --clip/--frames/--png only; sheets and strips use exact t.
// With a SONG loaded (src/data/song*.js), tempo, downbeat, length and audio come from it.
const PROJECT = typeof SONG !== 'undefined'
  ? { duration: SONG.duration, bpm: SONG.bpm, offset: SONG.first_downbeat, audio: SONG.audio, lead: 1 / 24 }
  : { duration: 11, bpm: 120, offset: 0, lead: 1 / 24 };
