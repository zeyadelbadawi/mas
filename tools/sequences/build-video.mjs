#!/usr/bin/env node
// Turn a clip into a scroll video: H.264 MP4s (desktop 16:9 and a 4:5 mobile crop), a poster and manifest.json.
//
// Usage:
//   pnpm sequence:video --input clip.mp4 --id covy.connector --out out/videos [--motion] [--motion-floor 3]
//                       [--ease-in 0.06 --ease-out 0.12] [--focal 0.5,0.5] [--crf 24] [--mobile-crf 26] [--gop 6]
//                       [--draft]  (960×540 / 432×540 previews for public/videos/drafts, used without R2)
//
// The player scrubs the video by seeking, which the browser decodes in hardware. A keyframe every `gop` frames
// (a quarter of a second at 24 fps) keeps every seek within a few frames of a keyframe, so it stays fast in
// both directions while the file stays much smaller than one image per frame. B-frames are off, so frame i is
// shown at exactly i / fps.
//
// The manifest's `timing` gives each source frame's place along the move (0..1). With --motion it follows how
// much the image changes (even camera speed per scroll; see timing.mjs), with optional easing at either end;
// without it the frames are spread evenly.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { ease, motionProfile, motionTiming } from "./timing.mjs";

const { values } = parseArgs({
  options: {
    input: { type: "string" },
    id: { type: "string" },
    out: { type: "string", default: "out/videos" },
    fps: { type: "string", default: "24" },
    focal: { type: "string", default: "0.5,0.5" },
    motion: { type: "boolean", default: false },
    "motion-floor": { type: "string", default: "3" },
    "ease-in": { type: "string", default: "0" },
    "ease-out": { type: "string", default: "0" },
    crf: { type: "string", default: "24" },
    "mobile-crf": { type: "string", default: "26" },
    gop: { type: "string", default: "6" },
    draft: { type: "boolean", default: false },
  },
});

if (!values.input || !values.id) {
  console.error("Missing --input or --id. See the header of this file for usage.");
  process.exit(1);
}
if (!/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(values.id)) {
  console.error(`--id must look like "brand.scene", got "${values.id}"`);
  process.exit(1);
}

const fps = Number(values.fps);
const [fx, fy] = values.focal.split(",").map(Number);
const gop = String(Number(values.gop));
const draft = values.draft;
const desktop = draft ? { width: 960, height: 540 } : { width: 1920, height: 1080 };
const mobile = draft ? { width: 432, height: 540 } : { width: 1080, height: 1350 };
const crf = draft ? "32" : values.crf;
const mobileCrf = draft ? "34" : values["mobile-crf"];
const outDir = path.resolve(values.out, values.id);
const tmp = mkdtempSync(path.join(tmpdir(), "vid-"));
const round5 = (x) => Math.round(x * 1e5) / 1e5;
const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const frameCount = (file) =>
  Number(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-count_packets",
      "-show_entries",
      "stream=nb_read_packets",
      "-of",
      "csv=p=0",
      file,
    ])
      .toString()
      .trim(),
  );

const h264 = (crf) => [
  "-an",
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  crf,
  "-g",
  gop,
  "-keyint_min",
  gop,
  "-sc_threshold",
  "0",
  "-bf",
  "0",
  "-profile:v",
  "high",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  "-tag:v",
  "avc1",
];

try {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const source = frameCount(values.input);

  // 1. Timing: from small greyscale copies of every frame, or evenly.
  let timing;
  if (values.motion) {
    run(["-i", values.input, "-vf", "scale=192:108", path.join(tmp, "%05d.png")]);
    const files = readdirSync(tmp)
      .filter((f) => f.endsWith(".png"))
      .sort()
      .map((f) => path.join(tmp, f));
    const change = await motionProfile(files);
    timing = ease(
      motionTiming(change, Number(values["motion-floor"])),
      Number(values["ease-in"]),
      Number(values["ease-out"]),
    );
  } else {
    timing = Array.from({ length: source }, (_, i) => i / Math.max(1, source - 1));
  }

  // 2. Desktop 16:9 and the mobile 4:5 crop (full height, around the focal point).
  const cover = `scale=${desktop.width}:${desktop.height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${desktop.width}:${desktop.height}`;
  run(["-i", values.input, "-vf", cover, ...h264(crf), path.join(outDir, "desktop.mp4")]);
  const crop = `crop=ih*${mobile.width}/${mobile.height}:ih:(iw-ih*${mobile.width}/${mobile.height})*${fx}:0`;
  run([
    "-i",
    values.input,
    "-vf",
    `${crop},scale=${mobile.width}:${mobile.height}:flags=lanczos`,
    ...h264(mobileCrf),
    path.join(outDir, "mobile.mp4"),
  ]);
  for (const v of ["desktop", "mobile"]) {
    const n = frameCount(path.join(outDir, `${v}.mp4`));
    if (n !== source) throw new Error(`${v}.mp4 has ${n} frames, the source ${source}`);
  }

  // 3. Poster: the first frame, the LCP candidate while the video loads.
  const first = path.join(tmp, "poster.png");
  run(["-i", path.join(outDir, "desktop.mp4"), "-frames:v", "1", first]);
  await sharp(first).avif({ quality: 60, effort: 6 }).toFile(path.join(outDir, "poster.avif"));
  await sharp(first).webp({ quality: 82 }).toFile(path.join(outDir, "poster.webp"));

  const size = (f) => statSync(path.join(outDir, f)).size;
  const manifest = {
    id: values.id,
    kind: "video",
    fps,
    frameCount: source,
    focal: { x: fx, y: fy },
    poster: { avif: "poster.avif", webp: "poster.webp", ...desktop },
    variants: [
      { name: "desktop", ...desktop, src: "desktop.mp4", bytes: size("desktop.mp4") },
      { name: "mobile", ...mobile, src: "mobile.mp4", bytes: size("mobile.mp4") },
    ],
    timing: timing.map(round5),
  };
  writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest) + "\n");
  const mb = (b) => (b / 2 ** 20).toFixed(1);
  console.log(
    `Wrote ${outDir}: ${source} frames, desktop ${mb(size("desktop.mp4"))} MB, mobile ${mb(size("mobile.mp4"))} MB`,
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
