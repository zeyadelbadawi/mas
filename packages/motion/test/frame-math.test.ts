import { describe, expect, it } from "vitest";
import { decideTier } from "../src/device-tier";
import {
  downloadOrder,
  evictable,
  fitRect,
  framePriority,
  progressToFrame,
  progressToPosition,
  strideIndices,
  strideLevel,
} from "../src/frame-math";
import { frameUrl } from "../src/manifest";

describe("progressToPosition", () => {
  it("spreads frames evenly without a timing curve", () => {
    expect(progressToPosition(0, 11)).toBe(0);
    expect(progressToPosition(0.25, 11)).toBeCloseTo(2.5);
    expect(progressToPosition(1, 11)).toBe(10);
    expect(progressToPosition(Number.NaN, 11)).toBe(0);
  });

  it("follows the timing curve between frames", () => {
    // Frame 1 sits a tenth of the way along, frame 2 at the end: most of the scroll goes between 1 and 2.
    const timing = [0, 0.1, 1];
    expect(progressToPosition(0.05, 3, timing)).toBeCloseTo(0.5);
    expect(progressToPosition(0.1, 3, timing)).toBeCloseTo(1);
    expect(progressToPosition(0.55, 3, timing)).toBeCloseTo(1.5);
    expect(progressToPosition(1, 3, timing)).toBe(2);
    expect(progressToPosition(-1, 3, timing)).toBe(0);
  });

  it("ignores a timing curve of the wrong length", () => {
    expect(progressToPosition(0.5, 5, [0, 1])).toBe(2);
  });
});

describe("strideIndices", () => {
  it("keeps every n-th frame and always the last", () => {
    expect(strideIndices(5, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(strideIndices(5, 2)).toEqual([0, 2, 4]);
    expect(strideIndices(6, 2)).toEqual([0, 2, 4, 5]);
    expect(strideIndices(0, 2)).toEqual([]);
  });
});

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

describe("strideLevel", () => {
  it("ranks every 16th frame and the last frame coarsest, odd frames finest", () => {
    expect([0, 16, 8, 4, 2, 1].map((i) => strideLevel(i, 150))).toEqual([0, 0, 1, 2, 3, 4]);
    expect(strideLevel(149, 150)).toBe(0);
  });
});

describe("downloadOrder", () => {
  const all = Array.from({ length: 150 }, (_, i) => i);
  it("starts right around the current frame, then covers the whole sequence coarsely", () => {
    const order = downloadOrder(all, 40, 150, 1);
    expect(order.slice(0, 3)).toEqual([40, 41, 42]);
    // After the 13 frames within 6 of the current one comes the coarse pass: 11 frames, both ends included.
    const coarse = order.slice(13, 24);
    expect(coarse).toContain(0);
    expect(coarse).toContain(149);
    expect(coarse.every((i) => strideLevel(i, 150) === 0)).toBe(true);
  });
  it("favours the scroll direction", () => {
    expect(downloadOrder([38, 42], 40, 150, 1)).toEqual([42, 38]);
    expect(downloadOrder([38, 42], 40, 150, -1)).toEqual([38, 42]);
  });
  it("orders every frame exactly once", () => {
    expect([...downloadOrder(all, 75, 150)].sort((a, b) => a - b)).toEqual(all);
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
    expect(decideTier({ ...base, effectiveType: "2g" })).toBe("LOW");
    // Chrome reports "3g" on ordinary Wi-Fi often enough; it is no reason to skip the scenes.
    expect(decideTier({ ...base, effectiveType: "3g" })).toBe("HIGH");
    // Scroll videos don't need WebGL; 3D scenes check it on their own (hasWebgl).
    expect(decideTier({ ...base, webgl: false })).toBe("HIGH");
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
