import { afterEach, describe, expect, it, vi } from "vitest";
import { sequenceSource } from "../src/media";

describe("sequenceSource", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("loads full-size frames from the media host", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", "https://media.example.com/");
    const src = sequenceSource("covy.hero");
    expect(src.manifestUrl).toBe("https://media.example.com/sequences/covy.hero/manifest.json");
    expect(src.poster).toMatchObject({ width: 1920, height: 1080 });
  });

  it("puts a re-rendered sequence under a new path", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", "https://media.example.com");
    expect(sequenceSource("covy.signature", { rev: 2 }).manifestUrl).toBe(
      "https://media.example.com/sequences/covy.signature.r2/manifest.json",
    );
  });

  it("falls back to the committed drafts, which have no revisions", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", "");
    const src = sequenceSource("covy.signature", { rev: 2 });
    expect(src.manifestUrl).toBe("/sequences/drafts/covy.signature/manifest.json");
    expect(src.poster).toMatchObject({ width: 960, height: 540 });
  });
});
