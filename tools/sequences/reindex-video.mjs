#!/usr/bin/env node
// Add the WebCodecs frame index (sample-index.mjs, D62) to scroll videos that were built before it existed,
// without re-encoding: the MP4s stay byte for byte the same, only manifest.json changes.
//
// Usage: pnpm sequence:reindex --dir out/videos [--only aroma.morning,covy.hero]
// Each <dir>/<id>/ must hold manifest.json and the variants' MP4s. Upload the result as a new revision folder
// (files on R2 are cached as immutable by name).

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { sampleIndex } from "./sample-index.mjs";

const { values } = parseArgs({
  options: { dir: { type: "string", default: "out/videos" }, only: { type: "string" } },
});
const root = path.resolve(values.dir);
const only = values.only?.split(",");

for (const id of readdirSync(root)) {
  const dir = path.join(root, id);
  if (!statSync(dir).isDirectory() || (only && !only.includes(id))) continue;
  const file = path.join(dir, "manifest.json");
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.kind !== "video") continue;
  for (const v of manifest.variants) {
    const mp4 = path.join(dir, v.src);
    if (statSync(mp4).size !== v.bytes) throw new Error(`${mp4}: size differs from the manifest`);
    v.decode = sampleIndex(mp4, manifest.fps);
    if (v.decode.samples.length !== manifest.frameCount)
      throw new Error(`${mp4}: ${v.decode.samples.length} frames, the manifest says ${manifest.frameCount}`);
    console.log(`${id} ${v.name}: ${v.decode.codec}, ${v.decode.keys.length} keyframes`);
  }
  writeFileSync(file, JSON.stringify(manifest) + "\n");
}
