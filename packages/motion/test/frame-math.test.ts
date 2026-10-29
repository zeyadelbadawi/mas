import { describe, expect, it } from "vitest";
import { decideTier } from "../src/device-tier";
import { evictable, fitRect, framePriority, progressToFrame } from "../src/frame-math";
import { frameUrl } from "../src/manifest";

describe("progressToFrame", () => {
  it("maps the ends of the scroll range to the first and last frame", () => {
    expect(progressToFrame(0, 120)).toBe(0);
    expect(progressToFrame(1, 120)).toBe(119);
  });
  it("clamps out-of-range and invalid progress", () => {
    expect(progressToFrame(-0.5, 10)).toBe(0);
    expect(progressToFrame(7, 10)).toBe(9);
    expect(progressToFrame(Number.NaN, 10)).toBe(0);
  });
  it("is reversible: the same progress always gives the same frame", () => {
    expect(progressToFrame(0.5, 101)).toBe(50);
    expect(progressToFrame(0.5, 101)).toBe(progressToFrame(0.5, 101));
  });
});

describe("framePriority", () => {
  it("loads the current frame first, then neighbours, favouring the scroll direction", () => {
    expect(framePriority(5, 20, 2, 1, 1)).toEqual([5, 6, 4, 7]);
    expect(framePriority(5, 20, 2, 1, -1)).toEqual([5, 4, 6, 3]);
  });
  it("never requests frames outside the range", () => {
    expect(framePriority(0, 3, 5, 5)).toEqual([0, 1, 2]);
  });
});

describe("evictable", () => {
  it("drops frames far from the current position", () => {
    // keep window is 40..70
    expect(evictable([0, 10, 50, 60, 90], 50, 20, 10)).toEqual([0, 10, 90]);
  });
});

describe("fitRect", () => {
  it("covers a portrait canvas by cropping a landscape frame around the focal point", () => {
    const r = fitRect(1920, 1080, 864, 1080, "cover", { x: 0.5, y: 0.5 });
    expect(r.sh).toBe(1080);
    expect(r.sw).toBeCloseTo(864);
    expect(r.sx).toBeCloseTo((1920 - 864) / 2);
  });
  it("keeps the crop inside the source when the focal point is near an edge", () => {
    const r = fitRect(1920, 1080, 864, 1080, "cover", { x: 0.99, y: 0.5 });
    expect(r.sx + r.sw).toBeLessThanOrEqual(1920);
  });
  it("letterboxes with contain", () => {
    const r = fitRect(1920, 1080, 1000, 1000, "contain");
    expect(r.dw).toBeCloseTo(1000);
    expect(r.dy).toBeGreaterThan(0);
  });
});

describe("decideTier", () => {
  const base = {
    reducedMotion: false,
    saveData: false,
    coarsePointer: false,
    viewportWidth: 1440,
    webgl: true,
  };
  it("respects reduced motion above everything", () => {
    expect(decideTier({ ...base, reducedMotion: true })).toBe("STATIC");
  });
  it("drops to LOW on Save-Data, slow networks or no WebGL", () => {
    expect(decideTier({ ...base, saveData: true })).toBe("LOW");
    expect(decideTier({ ...base, effectiveType: "3g" })).toBe("LOW");
    expect(decideTier({ ...base, webgl: false })).toBe("LOW");
  });
  it("uses MID for touch, small screens or low memory", () => {
    expect(decideTier({ ...base, coarsePointer: true })).toBe("MID");
    expect(decideTier({ ...base, viewportWidth: 800 })).toBe("MID");
    expect(decideTier({ ...base, deviceMemory: 4 })).toBe("MID");
  });
  it("gives HIGH to capable desktops", () => {
    expect(decideTier(base)).toBe("HIGH");
  });
});

describe("frameUrl", () => {
  it("resolves zero-padded frame paths next to the manifest", () => {
    expect(
      frameUrl("https://media.mas.com/covy.hero/manifest.json", "desktop/avif/{index}.avif", 7),
    ).toBe("https://media.mas.com/covy.hero/desktop/avif/0007.avif");
  });
});
