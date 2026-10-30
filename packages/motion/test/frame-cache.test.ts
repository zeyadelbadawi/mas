import { describe, expect, it, vi } from "vitest";
import { FrameCache } from "../src/frame-cache";

type Fake = { index: number; close: () => void };

/** Downloads resolve only when the test releases them, so scrolling can happen while they're in flight. */
function setup(frameCount = 150, maxDownloads = 6) {
  const pending = new Map<number, () => void>();
  const aborted: number[] = [];
  const closed: number[] = [];
  const fetchFrame = vi.fn(
    (index: number, signal: AbortSignal) =>
      new Promise<Blob>((resolve, reject) => {
        pending.set(index, () => resolve(new Blob([String(index)])));
        signal.addEventListener("abort", () => {
          aborted.push(index);
          reject(new Error("aborted"));
        });
      }),
  );
  const decode = async (blob: Blob): Promise<Fake> => {
    const index = Number(await blob.text());
    return { index, close: () => closed.push(index) };
  };
  const ready: number[] = [];
  const cache = new FrameCache<Fake>(frameCount, fetchFrame, {
    decode,
    maxDownloads,
    ahead: 8,
    behind: 3,
    onReady: (i) => ready.push(i),
  });
  const release = async (indices = [...pending.keys()]) => {
    for (const i of indices) {
      pending.get(i)?.();
      pending.delete(i);
    }
    for (let k = 0; k < 20; k++) await new Promise((r) => setTimeout(r, 0));
  };
  return { cache, fetchFrame, pending, aborted, closed, ready, release };
}

describe("FrameCache", () => {
  it("never cancels a download because the user scrolled past it", async () => {
    const { cache, aborted, pending } = setup();
    cache.prioritise(0, 1);
    const first = [...pending.keys()];
    for (let f = 10; f <= 140; f += 10) cache.prioritise(f, 1);
    expect(aborted).toEqual([]);
    expect(first.every((i) => pending.has(i))).toBe(true);
  });

  it("downloads every frame once preloading starts", async () => {
    const { cache, fetchFrame, release, pending } = setup(40);
    cache.prioritise(0, 1);
    cache.preloadAll();
    while (pending.size) await release();
    const requested = fetchFrame.mock.calls.map(([i]) => i).sort((a, b) => a - b);
    expect(requested).toEqual(Array.from({ length: 40 }, (_, i) => i));
  });

  it("shows the closest arrived frame while the current one is still downloading", async () => {
    // Every frame in flight at once, so the test chooses which ones arrive.
    const { cache, release } = setup(150, 150);
    cache.preloadAll();
    cache.prioritise(0, 1);
    // Let the coarse pass (every 16th frame) arrive, then jump far ahead.
    await release([0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 149]);
    cache.prioritise(99, 1);
    await release([]);
    expect(cache.get(99)).toBeUndefined();
    expect(cache.nearest(99)?.index).toBe(96);
  });

  it("frees decoded frames that fall far behind, but not the one on screen", async () => {
    const { cache, release, closed, ready } = setup();
    cache.prioritise(0, 1);
    await release();
    const onScreen = Math.max(...ready);
    cache.prioritise(100, 1);
    // Everything decoded is now far outside the window; only the closest frame stays until a better one arrives.
    expect(closed).toContain(0);
    expect(closed).not.toContain(onScreen);
    expect(cache.nearest(100)?.index).toBe(onScreen);
    for (let k = 0; k < 5; k++) await release();
    cache.prioritise(100, 1);
    expect(cache.get(100)).toBeDefined();
    expect(closed).toContain(onScreen);
  });

  it("on standby keeps a smaller window and frees the rest", async () => {
    const { cache, release, pending, ready, closed } = setup(40);
    cache.prioritise(20, 1);
    cache.preloadAll();
    while (pending.size) await release();
    const playing = new Set(ready);
    expect(playing.size).toBeGreaterThan(7);
    cache.setMode("standby");
    // Only the frames around the current one that it would open on stay decoded.
    expect([...playing].filter((i) => !closed.includes(i)).every((i) => i >= 18 && i <= 26)).toBe(
      true,
    );
    // A far jump frees everything outside the new window, and only that window is decoded.
    ready.length = 0;
    cache.prioritise(0, 1);
    await release();
    expect(ready.every((i) => i <= 6)).toBe(true);
    // The frame that was on screen stays until a closer one is decoded; the next update frees it too.
    cache.prioritise(0, 1);
    expect([...playing].filter((i) => i > 6).every((i) => closed.includes(i))).toBe(true);
  });

  it("tries an undecodable frame once, without looping", async () => {
    const fetchFrame = (i: number) => Promise.resolve(new Blob([String(i)]));
    const decode = vi.fn(async (blob: Blob) => {
      const index = Number(await blob.text());
      if (index === 0) throw new Error("corrupt");
      return { index, close: () => {} };
    });
    const cache = new FrameCache(10, fetchFrame, {
      decode,
      ahead: 2,
      behind: 0,
      onReady: () => {},
    });
    cache.prioritise(0, 1);
    for (let k = 0; k < 20; k++) await new Promise((r) => setTimeout(r, 0));
    const decodesOfZero = await Promise.all(decode.mock.calls.map(async ([b]) => b.text()));
    expect(decodesOfZero.filter((t) => t === "0")).toHaveLength(1);
    expect(cache.nearest(0)?.index).toBe(1);
    cache.destroy();
  });

  it("retries a failed download a few times, then gives up", async () => {
    let calls = 0;
    const fetchFrame = vi.fn(() => {
      calls++;
      return Promise.reject(new Error("network"));
    });
    const cache = new FrameCache(1, fetchFrame, {
      decode: async () => ({ close: () => {} }),
      retryDelayMs: 1,
      onReady: () => {},
    });
    cache.prioritise(0, 1);
    for (let k = 0; k < 20; k++) await new Promise((r) => setTimeout(r, 5));
    expect(calls).toBe(3);
    cache.destroy();
  });

  it("stops everything on destroy", async () => {
    const { cache, aborted, pending } = setup();
    cache.prioritise(0, 1);
    const inflight = pending.size;
    cache.destroy();
    expect(aborted).toHaveLength(inflight);
  });
});
