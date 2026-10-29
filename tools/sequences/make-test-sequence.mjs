#!/usr/bin/env node
// Generates a small procedural test sequence (no MAG credits) so SequencePlayer can be verified end to end.
// Each frame shows its own number, so scrubbing forward/backward is easy to check by eye.
// Output is copied into each app's public/sequences/test/ (the only sequence kept in git).

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const tmp = mkdtempSync(path.join(tmpdir(), "testseq-"));
const clip = path.join(tmp, "test.mp4");

try {
  // 4 s at 24 fps: moving gradient + frame counter.
  execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "gradients=s=960x540:c0=0x262d3f:c1=0x7e98ae:c2=0x765f4d:c3=0xdcd4cf:n=4:speed=0.03:d=4:r=24",
      "-vf",
      "drawtext=text='frame %{frame_num}':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.35:boxborderw=24",
      "-pix_fmt",
      "yuv420p",
      clip,
    ],
    { stdio: "inherit" },
  );
  const out = path.join(tmp, "out");
  execFileSync(
    "node",
    [
      path.join(here, "build-sequence.mjs"),
      "--input",
      clip,
      "--id",
      "test.sequence",
      "--out",
      out,
      "--max-frames",
      "96",
      "--desktop-width",
      "960",
      "--desktop-height",
      "540",
      "--mobile-width",
      "432",
      "--mobile-height",
      "540",
      "--avif-quality",
      "40",
      "--webp-quality",
      "60",
    ],
    { stdio: "inherit" },
  );
  for (const app of ["mas", "covy", "aroma"]) {
    const dest = path.join(root, "apps", app, "public/sequences/test");
    rmSync(dest, { recursive: true, force: true });
    cpSync(path.join(out, "test.sequence"), dest, { recursive: true });
    console.log(`→ apps/${app}/public/sequences/test`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
