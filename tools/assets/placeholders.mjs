#!/usr/bin/env node
// Lists everything still running on dummy data (CLAUDE.md rule 5) and every slot without its final asset.
// Usage: pnpm placeholders:report [--strict]   (--strict exits 1 while anything is left; use before launch)

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { events } from "../../packages/content/src/events.ts";
import { testimonials } from "../../packages/content/src/testimonials.ts";
import { covyMenu } from "../../packages/content/src/menus/covy.ts";
import { eventSlots, menuSlots, slots as listedSlots } from "../../packages/content/src/slots.ts";

// Same composition as packages/content/src/registry.ts (which uses extensionless imports Node can't load).
const slots = [...listedSlots, ...menuSlots(covyMenu), ...eventSlots(events)];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCAN = [
  "packages/content/src",
  "apps/mas/src",
  "apps/covy/src",
  "apps/aroma/src",
  "apps/mas/messages",
  "apps/covy/messages",
  "apps/aroma/messages",
];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (/\.(ts|tsx|json)$/.test(name)) yield full;
  }
}

const records = [];
for (const dir of SCAN) {
  const abs = path.join(root, dir);
  try {
    statSync(abs);
  } catch {
    continue;
  }
  for (const file of files(abs)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        // Skip type declarations ("placeholder: true;"), count data.
        if (/["']?placeholder["']?\s*:\s*true\s*,?\s*$/.test(line))
          records.push(`${path.relative(root, file)}:${i + 1}`);
      });
  }
}

const images = slots.filter((s) => s.kind === "image" && !s.src).map((s) => s.id);
const sequences = slots.filter((s) => s.kind === "sequence" && !s.manifestUrl).map((s) => s.id);

const section = (title, items) => {
  console.log(`\n${title}: ${items.length}`);
  for (const item of items) console.log(`  - ${item}`);
};
console.log("Placeholder report");
section("Data records marked placeholder: true", records);
const sampleItems = covyMenu.flatMap((c) => c.items).filter((i) => i.placeholder).map((i) => i.id);
const sampleEvents = events.filter((e) => e.placeholder).map((e) => e.id);
const sampleReviews = testimonials.filter((t) => t.placeholder).map((t) => t.id);
section("Sample menu items (COVY)", sampleItems);
section("Sample events", sampleEvents);
section("Sample reviews (never shown as real)", sampleReviews);
section("Image slots waiting for the designer", images);
section("Sequence slots waiting for MAG renders", sequences);

const total = records.length + sampleItems.length + sampleEvents.length + sampleReviews.length + images.length + sequences.length;
console.log(`\nTotal: ${total}`);
if (process.argv.includes("--strict") && total > 0) process.exit(1);
