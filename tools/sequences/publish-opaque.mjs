#!/usr/bin/env node
// Publish scroll videos under short opaque names (D76), so the files' addresses say nothing about what they are.
// Usage: pnpm sequence:publish [--only covy.hero.r3,mas.doors.r2] [--dry-run]
// Reads R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET from the environment.
//
// For each scene revision already uploaded at videos/<id>.r<rev>/ (upload-r2.mjs), this writes:
//   v/<key>/i  the manifest, with its file names, id and variant names replaced
//   v/<key>/d  desktop video    v/<key>/m  mobile video
//   v/<key>/a  AVIF poster      v/<key>/w  WebP poster
// <key> is sceneKey(id, rev) from @mas/motion, the same function the sites use to build the addresses.
// The files are copied inside R2 (nothing is downloaded but the manifest). The readable folders stay as the
// source for later revisions.

import { parseArgs } from "node:util";
import {
  CopyObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SCENE_FILES, sceneKey } from "../../packages/motion/src/media.ts";

/** Every scene revision the sites use (each app's scenes.ts). */
const SCENES = [
  "covy.hero.r3",
  "covy.connector.r3",
  "covy.signature.r3",
  "aroma.morning.r3",
  "aroma.lake.r3",
  "aroma.night.r3",
  "mas.hero.r3",
  "mas.doors.r2",
];

const { values } = parseArgs({
  options: { only: { type: "string" }, "dry-run": { type: "boolean", default: false } },
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
const dry = values["dry-run"];
// Revision folders never change, so their files are cached for good.
const FOREVER = "public, max-age=31536000, immutable";

const FILES = {
  "desktop.mp4": [SCENE_FILES.desktop, "video/mp4"],
  "mobile.mp4": [SCENE_FILES.mobile, "video/mp4"],
  "poster.avif": [SCENE_FILES.avif, "image/avif"],
  "poster.webp": [SCENE_FILES.webp, "image/webp"],
};
const rename = (file) => {
  const to = FILES[file]?.[0];
  if (!to) throw new Error(`No opaque name for "${file}"`);
  return to;
};

const only = values.only?.split(",");
for (const folder of SCENES.filter((s) => !only || only.includes(s))) {
  const match = /^(.+)\.r(\d+)$/.exec(folder);
  if (!match) throw new Error(`Not a revision folder: ${folder}`);
  const [, id, rev] = match;
  const key = sceneKey(id, Number(rev));
  const from = `videos/${folder}`;
  const to = `v/${key}`;

  const got = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: `${from}/manifest.json` }),
  );
  const manifest = JSON.parse(await got.Body.transformToString());
  manifest.id = key;
  manifest.poster.avif = rename(manifest.poster.avif);
  manifest.poster.webp = rename(manifest.poster.webp);
  // Variant names stay (the player picks a variant by name); only the file names change.
  for (const v of manifest.variants) v.src = rename(v.src);

  console.log(`${folder} → ${to}`);
  if (dry) continue;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `${to}/${SCENE_FILES.manifest}`,
      Body: JSON.stringify(manifest),
      ContentType: "application/json",
      CacheControl: FOREVER,
    }),
  );
  await Promise.all(
    Object.entries(FILES).map(([file, [name, type]]) =>
      client.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${from}/${file}`,
          Key: `${to}/${name}`,
          MetadataDirective: "REPLACE",
          ContentType: type,
          CacheControl: FOREVER,
        }),
      ),
    ),
  );
}
