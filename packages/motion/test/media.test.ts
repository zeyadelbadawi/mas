import { afterEach, describe, expect, it, vi } from "vitest";
import { sceneKey, sequenceSource, videoSource } from "../src/media";
import { videoPrefetchScript } from "../src/video-prefetch";

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

describe("videoSource (D76)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("gives each scene revision a fixed opaque key", () => {
    // These keys are the folders on R2 (pnpm sequence:publish): they must never change for a revision.
    expect(sceneKey("covy.hero", 3)).toBe("f6f86c8a486ba210");
    expect(sceneKey("mas.doors", 2)).toBe("25c2391c673a5232");
    expect(sceneKey("covy.hero", 2)).not.toBe(sceneKey("covy.hero", 3));
  });

  it("loads from the media host under the opaque key, with nothing readable in the address", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", "https://media.example.com/");
    const src = videoSource("covy.hero", { rev: 3 });
    expect(src.id).toBe("f6f86c8a486ba210");
    expect(src.manifestUrl).toBe("https://media.example.com/v/f6f86c8a486ba210/i");
    expect(src.poster).toMatchObject({
      avif: "https://media.example.com/v/f6f86c8a486ba210/a",
      webp: "https://media.example.com/v/f6f86c8a486ba210/w",
      width: 1920,
    });
    expect([src.id, src.manifestUrl, src.poster.avif, src.poster.webp].join(" ")).not.toMatch(
      /covy|hero|manifest|poster|\.mp4|\.json/,
    );
  });

  it("keeps readable names for the committed drafts", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", "");
    const src = videoSource("covy.hero", { rev: 3 });
    expect(src.id).toBe("covy.hero");
    expect(src.manifestUrl).toBe("/videos/drafts/covy.hero/manifest.json");
  });

  it("prefetches the opaque video files", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_URL", "https://media.example.com");
    const script = videoPrefetchScript([videoSource("covy.hero", { rev: 3 }).manifestUrl]);
    expect(script).toContain("https://media.example.com/v/f6f86c8a486ba210/d");
    expect(script).toContain("https://media.example.com/v/f6f86c8a486ba210/m");
    expect(script).not.toMatch(/\.mp4|__mas/);
  });
});
