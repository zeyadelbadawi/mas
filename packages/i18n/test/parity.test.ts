import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Architecture §9: a key missing in either language fails CI.
const root = path.resolve(import.meta.dirname, "../../..");
const sets = [
  "packages/i18n/messages",
  "apps/mas/messages",
  "apps/covy/messages",
  "apps/aroma/messages",
];

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

const load = (dir: string, locale: string) =>
  JSON.parse(readFileSync(path.join(root, dir, `${locale}.json`), "utf8")) as unknown;

describe("English and Arabic messages have the same keys", () => {
  it.each(sets)("%s", (dir) => {
    const en = keys(load(dir, "en")).sort();
    const ar = keys(load(dir, "ar")).sort();
    expect(
      ar.filter((k) => !en.includes(k)),
      "only in ar.json",
    ).toEqual([]);
    expect(
      en.filter((k) => !ar.includes(k)),
      "only in en.json",
    ).toEqual([]);
  });
});
