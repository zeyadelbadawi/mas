#!/usr/bin/env node
// Upload encoded sequences to Cloudflare R2 (S3-compatible API).
// Usage: pnpm sequence:upload --dir out/sequences [--only covy.hero,covy.signature] [--prefix videos]
// Reads R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET from the environment.
// Keys go to <prefix>/<id>/... (prefix "sequences" by default, "videos" for scroll videos) so
// NEXT_PUBLIC_MEDIA_URL + "/<prefix>/<id>/manifest.json" resolves.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const { values } = parseArgs({
  options: {
    dir: { type: "string", default: "out/sequences" },
    only: { type: "string" },
    prefix: { type: "string", default: "sequences" },
  },
});
const env = (name) => {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name}. See docs/runbooks/r2-setup.md.`);
    process.exit(1);
  }
  return v;
};

const client = new S3Client({
  region: "auto",
  endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
  },
});
const bucket = env("R2_BUCKET");

const TYPES = {
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".json": "application/json",
  ".mp4": "video/mp4",
};
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

const root = path.resolve(values.dir);
const only = values.only?.split(",");
const ids = readdirSync(root).filter(
  (id) => statSync(path.join(root, id)).isDirectory() && (!only || only.includes(id)),
);

for (const id of ids) {
  const files = [...walk(path.join(root, id))].filter((f) => TYPES[path.extname(f)]);
  let done = 0;
  // A few uploads at a time keeps it fast without hitting rate limits.
  const queue = [...files];
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        const key = `${values.prefix}/${id}/${path.relative(path.join(root, id), file).split(path.sep).join("/")}`;
        const isManifest = file.endsWith("manifest.json");
        // A revision folder (<id>.r2, …) is never rewritten: its files can be cached for good.
        const versioned = /\.r\d+$/.test(id);
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: readFileSync(file),
            ContentType: TYPES[path.extname(file)],
            // Frames keep their names between renders, so cache for a week, not forever; the manifest briefly.
            // Files in a revision folder never change, so they are cached for a year.
            CacheControl: isManifest
              ? "public, max-age=300"
              : versioned
                ? "public, max-age=31536000, immutable"
                : "public, max-age=604800",
          }),
        );
        done++;
        if (process.stdout.isTTY) process.stdout.write(`\r${id}: ${done}/${files.length}`);
      }
    }),
  );
  console.log(`${process.stdout.isTTY ? "\n" : ""}${id}: uploaded ${files.length} files`);
}
