#!/usr/bin/env node
// Turn a video clip (e.g. a MAG final render) into a scroll-sequence: AVIF + WebP frames, poster and manifest.json.
//
// Usage:
//   pnpm sequence:build --input clip.mp4 --id covy.hero --out out/sequences [--max-frames 150] [--fps 24]
//                       [--focal 0.5,0.5] [--poster 0] [--avif-quality 50] [--webp-quality 72]
//
// Output: <out>/<id>/manifest.json, poster.{avif,webp}, desktop/{avif,webp}/0000.*, mobile/{avif,webp}/0000.*
// Desktop is 1920×1080 (16:9), mobile is a 4:5 crop (864×1080) around the focal point at half the frame rate.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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
    "mobile-width": { type: "string", default: "864" },
    "mobile-height": { type: "string", default: "1080" },
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
const mobile = { width: Number(values["mobile-width"]), height: Number(values["mobile-height"]) };

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

  // 2. Evenly sample down to maxFrames.
  const count = Math.min(maxFrames, all.length);
  const picked = Array.from(
    { length: count },
    (_, i) => all[Math.round((i * (all.length - 1)) / Math.max(1, count - 1))],
  );

  rmSync(outDir, { recursive: true, force: true });
  for (const dir of ["desktop/avif", "desktop/webp", "mobile/avif", "mobile/webp"])
    mkdirSync(path.join(outDir, dir), { recursive: true });

  const meta = await sharp(path.join(tmp, picked[0])).metadata();
  const srcW = meta.width;
  const srcH = meta.height;

  // Mobile crop rectangle in source pixels (4:5 around the focal point, full height).
  const cropH = srcH;
  const cropW = Math.min(srcW, Math.round((cropH * mobile.width) / mobile.height));
  const cropLeft = Math.min(srcW - cropW, Math.max(0, Math.round(fx * srcW - cropW / 2)));
  const cropTop = 0;

  let mobileCount = 0;
  for (let i = 0; i < picked.length; i++) {
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
    if (i % 2 === 0) {
      const m = sharp(src)
        .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
        .resize(mobile.width, mobile.height, { fit: "cover" });
      await m
        .clone()
        .avif({ quality: avifQ, effort: 4 })
        .toFile(path.join(outDir, "mobile/avif", `${pad(mobileCount)}.avif`));
      await m
        .clone()
        .webp({ quality: webpQ })
        .toFile(path.join(outDir, "mobile/webp", `${pad(mobileCount)}.webp`));
      mobileCount++;
    }
    if (process.stdout.isTTY) process.stdout.write(`\rframes ${i + 1}/${picked.length}`);
  }
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
      },
      {
        name: "mobile",
        ...mobile,
        step: 2,
        frameCount: mobileCount,
        avif: "mobile/avif/{index}.avif",
        webp: "mobile/webp/{index}.webp",
      },
    ],
  };
  writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${outDir} (${picked.length} desktop + ${mobileCount} mobile frames)`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
