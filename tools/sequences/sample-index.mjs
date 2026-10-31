// The frame index the scroll player decodes from (WebCodecs, D62): where each frame's bytes sit in the MP4,
// which frames are keyframes, and the decoder setup (codec string and the avcC record). With it the browser
// cuts frames straight out of the file it already downloaded, without an MP4 parser.

import { execFileSync } from "node:child_process";

const probe = (args) => JSON.parse(execFileSync("ffprobe", ["-v", "error", ...args, "-of", "json"]).toString());

/** Parse ffprobe's hex dump of the extradata ("00000000: 0164 0032 ...  .d.2") into bytes. */
function hexDump(dump) {
  const bytes = [];
  for (const line of dump.split("\n")) {
    const m = /^[0-9a-f]{8}: ((?:[0-9a-f]{2,4} ?)+)/i.exec(line.trim());
    if (!m) continue;
    for (const pair of m[1].trim().split(/\s+/)) {
      for (let i = 0; i < pair.length; i += 2) bytes.push(parseInt(pair.slice(i, i + 2), 16));
    }
  }
  return Buffer.from(bytes);
}

/**
 * @param {string} file an H.264 MP4 with one video track and no B-frames (build-video.mjs's output)
 * @param {number} fps
 * @returns {{ codec: string, description: string, keys: number[], samples: [number, number][] }}
 */
export function sampleIndex(file, fps) {
  const { streams } = probe(["-select_streams", "v:0", "-show_entries", "stream=codec_name,extradata,time_base", "-show_data", file]);
  const stream = streams[0];
  if (stream?.codec_name !== "h264") throw new Error(`${file}: not H.264`);
  const avcc = hexDump(stream.extradata ?? "");
  if (avcc[0] !== 1 || avcc.length < 7) throw new Error(`${file}: no avcC record`);
  const hex = (b) => b.toString(16).padStart(2, "0");
  const codec = `avc1.${hex(avcc[1])}${hex(avcc[2])}${hex(avcc[3])}`;

  const [num, den] = stream.time_base.split("/").map(Number);
  const { packets } = probe(["-select_streams", "v:0", "-show_entries", "packet=pts,dts,pos,size,flags", file]);
  const samples = [];
  const keys = [];
  packets.forEach((p, i) => {
    // Decode order must be display order (no B-frames), one packet per frame, frame i at i / fps.
    const frame = Math.round(((Number(p.pts) * num) / den) * fps);
    if (frame !== i || p.pts !== p.dts) throw new Error(`${file}: packet ${i} is frame ${frame} (B-frames?)`);
    samples.push([Number(p.pos), Number(p.size)]);
    if (p.flags.startsWith("K")) keys.push(i);
  });
  if (keys[0] !== 0) throw new Error(`${file}: the first frame is not a keyframe`);
  return { codec, description: avcc.toString("base64"), keys, samples };
}
