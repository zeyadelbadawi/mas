#!/usr/bin/env node
// Turn a video clip (e.g. a MAG final render) into a scroll-sequence: AVIF + WebP frames, poster and manifest.json.
//
// Usage:
//   pnpm sequence:build --input clip.mp4 --id covy.hero --out out/sequences [--max-frames 150] [--fps 24]
//                       [--focal 0.5,0.5] [--poster 0] [--avif-quality 50] [--webp-quality 72]
//                       [--xl-width 2560 --xl-height 1440]  (0 skips the large desktop variant)
//                       [--motion-step 8 --motion-floor 3] [--ease-in 0.06 --ease-out 0.12] [--resume]
//                       [--jobs 4]  (frames encoded at once; default one per core, at most one per 1.5 GB RAM)
//
// By default frames are sampled evenly in time. With --motion-step, frames are picked by how much the image
// changes instead: about one frame per `motion-step` units of change (mean absolute difference of small
// greyscale copies, 0..255), so fast parts of the clip keep every frame and slow parts fewer. The manifest
// then carries a `timing` curve per variant (where each frame sits along the move, 0..1) and the player
// scrubs along it, so the camera moves at an even speed per scroll and a clip with uneven frame pacing plays
// evenly. `motion-floor` is the least change a source frame counts for, so near-still stretches still take
// some scroll. The first and last frames are always kept, in every variant, so sequences that meet at a
// shared frame still match.
//
// `ease-in` / `ease-out` (shares of the move, with --motion-step) slow the camera gently at the start and
// end of the timing curve instead of starting or stopping at full speed: use them where a sequence starts
// from a still frame or lands on one (a hold, or the next sequence's static first frame).
//
// Output: <out>/<id>/manifest.json, poster.{avif,webp}, {desktop,desktop-xl,mobile}/{avif,webp}/0000.*
// Desktop is 1920×1080 (16:9), desktop-xl 2560×1440 for large or high-density screens (only when the source
// is at least that wide), mobile a 4:5 crop (1080×1350) around the focal point at half the frame rate.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { availableParallelism, tmpdir, totalmem } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { ease, motionProfile, pickByMotion } from "./timing.mjs";

const { values } = parseArgs({
  options: {
    input: { type: "string" },
    id: { type: "string" },
    out: { type: "string", default: "out/sequences" },
    "max-frames": { type: "string", default: "150" },
    fps: { type: "string", default: "24" },
    focal: { type: "string", default: "0.5,0.5" },
    poster: { type: "string", default: "0" },
    "avif-quality": { type: "string", default: "50" },
    "webp-quality": { type: "string", default: "72" },
    "desktop-width": { type: "string", default: "1920" },
    "desktop-height": { type: "string", default: "1080" },
    "xl-width": { type: "string", default: "2560" },
    "xl-height": { type: "string", default: "1440" },
    "mobile-width": { type: "string", default: "1080" },
    "mobile-height": { type: "string", default: "1350" },
    "motion-step": { type: "string", default: "0" },
    "motion-floor": { type: "string", default: "3" },
    // Keep frames already written by an interrupted run with the same settings, and encode only the rest.
    resume: { type: "boolean", default: false },
    "ease-in": { type: "string", default: "0" },
    "ease-out": { type: "string", default: "0" },
    jobs: { type: "string" },
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

const maxFrames = Number(values["max-frames"]);
const fps = Number(values.fps);
const [fx, fy] = values.focal.split(",").map(Number);
const posterIndex = Number(values.poster);
const avifQ = Number(values["avif-quality"]);
const webpQ = Number(values["webp-quality"]);
const desktop = {
  width: Number(values["desktop-width"]),
  height: Number(values["desktop-height"]),
};
const xlRequested = { width: Number(values["xl-width"]), height: Number(values["xl-height"]) };
const mobile = { width: Number(values["mobile-width"]), height: Number(values["mobile-height"]) };
const motionStep = Number(values["motion-step"]);
const motionFloor = Number(values["motion-floor"]);
const easeIn = Number(values["ease-in"]);
const easeOut = Number(values["ease-out"]);
// Each job holds a decoded 4K source frame and its resized copies: allow about 1.5 GB of RAM per job.
const jobs = Math.max(
  1,
  Number(values.jobs) || Math.min(availableParallelism(), Math.floor(totalmem() / (1.5 * 2 ** 30))),
);

/** Every second index, plus the last one so the final frame is always there. */
const halve = (n) => {
  const out = [];
  for (let i = 0; i < n; i += 2) out.push(i);
  if (out[out.length - 1] !== n - 1) out.push(n - 1);
  return out;
};
const round5 = (x) => Math.round(x * 1e5) / 1e5;

const outDir = path.resolve(values.out, values.id);
const tmp = mkdtempSync(path.join(tmpdir(), "seq-"));
const pad = (n) => String(n).padStart(4, "0");

try {
  // 1. Extract PNG frames at the target frame rate.
  execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      values.input,
      "-vf",
      `fps=${fps}`,
      "-start_number",
      "0",
      path.join(tmp, "%04d.png"),
    ],
    {
      stdio: "inherit",
    },
  );
  const all = readdirSync(tmp)
    .filter((f) => f.endsWith(".png"))
    .sort();
  if (all.length === 0) throw new Error("ffmpeg produced no frames");

  // 2. Pick the frames: by image change, or evenly in time down to maxFrames.
  let picked;
  let timing;
  if (motionStep > 0) {
    const change = await motionProfile(all.map((f) => path.join(tmp, f)));
    const byMotion = pickByMotion(change, motionStep, motionFloor);
    picked = byMotion.picked.map((i) => all[i]);
    timing = ease(byMotion.timing, easeIn, easeOut);
  } else {
    const count = Math.min(maxFrames, all.length);
    picked = Array.from(
      { length: count },
      (_, i) => all[Math.round((i * (all.length - 1)) / Math.max(1, count - 1))],
    );
  }
  const mobilePicked = halve(picked.length);

  const meta = await sharp(path.join(tmp, picked[0])).metadata();
  const srcW = meta.width;
  const srcH = meta.height;
  // Never upscale into the large variant: it only exists when the source has the pixels for it.
  const xl = xlRequested.width > 0 && srcW >= xlRequested.width ? xlRequested : null;

  if (!values.resume) rmSync(outDir, { recursive: true, force: true });
  const variantDirs = ["desktop", ...(xl ? ["desktop-xl"] : []), "mobile"];
  for (const v of variantDirs)
    for (const f of ["avif", "webp"]) mkdirSync(path.join(outDir, v, f), { recursive: true });

  // Mobile crop rectangle in source pixels (4:5 around the focal point, full height).
  const cropH = srcH;
  const cropW = Math.min(srcW, Math.round((cropH * mobile.width) / mobile.height));
  const cropLeft = Math.min(srcW - cropW, Math.max(0, Math.round(fx * srcW - cropW / 2)));
  const cropTop = 0;

  const mobileCount = mobilePicked.length;
  // Each frame is written next to its final name and renamed once complete, so an interrupted run never
  // leaves a partial file that --resume would take for a finished one.
  const writeFrame = async (pipeline, target) => {
    const part = target.replace(/(\.\w+)$/, ".part$1");
    try {
      await pipeline.toFile(part);
      renameSync(part, target);
    } catch (error) {
      rmSync(part, { force: true });
      throw error;
    }
  };
  const encodeFrame = async (i) => {
    const mi = mobilePicked.indexOf(i);
    const outputs = [
      ...["avif", "webp"].map((f) => path.join(outDir, `desktop/${f}`, `${pad(i)}.${f}`)),
      ...(xl
        ? ["avif", "webp"].map((f) => path.join(outDir, `desktop-xl/${f}`, `${pad(i)}.${f}`))
        : []),
      ...(mi >= 0
        ? ["avif", "webp"].map((f) => path.join(outDir, `mobile/${f}`, `${pad(mi)}.${f}`))
        : []),
    ];
    if (values.resume && outputs.every((f) => existsSync(f))) return;
    const src = path.join(tmp, picked[i]);
    const d = sharp(src).resize(desktop.width, desktop.height, {
      fit: "cover",
      position: "centre",
    });
    const [desktopAvif, desktopWebp, ...rest] = outputs;
    await writeFrame(d.clone().avif({ quality: avifQ, effort: 4 }), desktopAvif);
    await writeFrame(d.clone().webp({ quality: webpQ }), desktopWebp);
    if (xl) {
      const x = sharp(src).resize(xl.width, xl.height, { fit: "cover", position: "centre" });
      await writeFrame(x.clone().avif({ quality: avifQ, effort: 4 }), rest.shift());
      await writeFrame(x.clone().webp({ quality: webpQ }), rest.shift());
    }
    if (mi >= 0) {
      const m = sharp(src)
        .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
        .resize(mobile.width, mobile.height, { fit: "cover" });
      await writeFrame(m.clone().avif({ quality: avifQ, effort: 4 }), rest.shift());
      await writeFrame(m.clone().webp({ quality: webpQ }), rest.shift());
    }
  };
  // The AVIF encoder uses about one core per image, so encode several frames at once (see `jobs`).
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < picked.length) {
      await encodeFrame(next++);
      done++;
      if (process.stdout.isTTY) process.stdout.write(`\rframes ${done}/${picked.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, picked.length) }, worker));
  if (process.stdout.isTTY) process.stdout.write("\n");

  // 3. Poster (the LCP candidate): desktop size, a little higher quality.
  const posterSrc = path.join(tmp, picked[Math.min(posterIndex, picked.length - 1)]);
  const p = sharp(posterSrc).resize(desktop.width, desktop.height, { fit: "cover" });
  await p
    .clone()
    .avif({ quality: Math.min(80, avifQ + 10), effort: 6 })
    .toFile(path.join(outDir, "poster.avif"));
  await p
    .clone()
    .webp({ quality: Math.min(90, webpQ + 10) })
    .toFile(path.join(outDir, "poster.webp"));

  const manifest = {
    id: values.id,
    frameCount: picked.length,
    fps,
    focal: { x: fx, y: fy },
    poster: {
      avif: "poster.avif",
      webp: "poster.webp",
      width: desktop.width,
      height: desktop.height,
    },
    variants: [
      {
        name: "desktop",
        ...desktop,
        step: 1,
        frameCount: picked.length,
        avif: "desktop/avif/{index}.avif",
        webp: "desktop/webp/{index}.webp",
        ...(timing ? { timing: timing.map(round5) } : {}),
      },
      ...(xl
        ? [
            {
              name: "desktop-xl",
              ...xl,
              step: 1,
              frameCount: picked.length,
              avif: "desktop-xl/avif/{index}.avif",
              webp: "desktop-xl/webp/{index}.webp",
              ...(timing ? { timing: timing.map(round5) } : {}),
            },
          ]
        : []),
      {
        name: "mobile",
        ...mobile,
        step: 2,
        frameCount: mobileCount,
        avif: "mobile/avif/{index}.avif",
        webp: "mobile/webp/{index}.webp",
        ...(timing ? { timing: mobilePicked.map((i) => round5(timing[i])) } : {}),
      },
    ],
  };
  writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `Wrote ${outDir} (${picked.length} desktop${xl ? ` + ${picked.length} desktop-xl` : ""} + ${mobileCount} mobile frames)`,
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
