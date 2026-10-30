#!/usr/bin/env node
// Turn a video clip (e.g. a MAG final render) into a scroll-sequence: AVIF + WebP frames, poster and manifest.json.
//
// Usage:
//   pnpm sequence:build --input clip.mp4 --id covy.hero --out out/sequences [--max-frames 150] [--fps 24]
//                       [--focal 0.5,0.5] [--poster 0] [--avif-quality 50] [--webp-quality 72]
//                       [--xl-width 2560 --xl-height 1440]  (0 skips the large desktop variant)
//                       [--motion-step 8 --motion-floor 3] [--resume]
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
// Output: <out>/<id>/manifest.json, poster.{avif,webp}, {desktop,desktop-xl,mobile}/{avif,webp}/0000.*
// Desktop is 1920×1080 (16:9), desktop-xl 2560×1440 for large or high-density screens (only when the source
// is at least that wide), mobile a 4:5 crop (1080×1350) around the focal point at half the frame rate.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { availableParallelism, tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

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

/** Image change between consecutive frames: mean absolute difference of 192×108 greyscale copies. */
async function motionProfile(files) {
  const change = [];
  let prev;
  for (const file of files) {
    const px = await sharp(file).resize(192, 108, { fit: "fill" }).greyscale().raw().toBuffer();
    if (prev) {
      let sum = 0;
      for (let i = 0; i < px.length; i++) sum += Math.abs(px[i] - prev[i]);
      change.push(sum / px.length);
    }
    prev = px;
  }
  return change;
}

/**
 * Pick about one frame per `step` units of change, always keeping the first and last. Returns the picked
 * source indices and, for each, its position along the move (0..1).
 */
function pickByMotion(change, step, floor) {
  const at = [0];
  for (const c of change) at.push(at[at.length - 1] + Math.max(c, floor));
  const total = at[at.length - 1];
  const picked = [0];
  for (let i = 1; i < at.length; i++)
    if (at[i] - at[picked[picked.length - 1]] >= step || i === at.length - 1) picked.push(i);
  return { picked, timing: picked.map((i) => at[i] / total) };
}

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
    timing = byMotion.timing;
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
    await d
      .clone()
      .avif({ quality: avifQ, effort: 4 })
      .toFile(path.join(outDir, "desktop/avif", `${pad(i)}.avif`));
    await d
      .clone()
      .webp({ quality: webpQ })
      .toFile(path.join(outDir, "desktop/webp", `${pad(i)}.webp`));
    if (xl) {
      const x = sharp(src).resize(xl.width, xl.height, { fit: "cover", position: "centre" });
      await x
        .clone()
        .avif({ quality: avifQ, effort: 4 })
        .toFile(path.join(outDir, "desktop-xl/avif", `${pad(i)}.avif`));
      await x
        .clone()
        .webp({ quality: webpQ })
        .toFile(path.join(outDir, "desktop-xl/webp", `${pad(i)}.webp`));
    }
    if (mi >= 0) {
      const m = sharp(src)
        .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
        .resize(mobile.width, mobile.height, { fit: "cover" });
      await m
        .clone()
        .avif({ quality: avifQ, effort: 4 })
        .toFile(path.join(outDir, "mobile/avif", `${pad(mi)}.avif`));
      await m
        .clone()
        .webp({ quality: webpQ })
        .toFile(path.join(outDir, "mobile/webp", `${pad(mi)}.webp`));
    }
  };
  // The AVIF encoder uses about one core per image, so encode a frame per core at once.
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < picked.length) {
      await encodeFrame(next++);
      done++;
      if (process.stdout.isTTY) process.stdout.write(`\rframes ${done}/${picked.length}`);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(availableParallelism(), picked.length) }, worker),
  );
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
