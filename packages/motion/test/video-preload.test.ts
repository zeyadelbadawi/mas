import { afterEach, describe, expect, it, vi } from "vitest";
import type { VideoPrefetch } from "../src/video-prefetch";

/** A fetch that answers each URL with `size` bytes in two chunks, once released. */
function fakeFetch(started: string[]) {
  const gates = new Map<string, () => void>();
  const fetch = vi.fn(async (url: string) => {
    started.push(url);
    await new Promise<void>((resolve) => gates.set(url, resolve));
    const chunks = [new Uint8Array(60), new Uint8Array(40)];
    return new Response(
      new ReadableStream({
        pull(controller) {
          const next = chunks.shift();
          if (next) controller.enqueue(next);
          else controller.close();
        },
      }),
      { headers: { "content-length": "100" } },
    );
  });
  return { fetch, release: (url: string) => gates.get(url)?.() };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("video preload queue", () => {
  it("downloads one at a time in reserved order, even when files are known out of order", async () => {
    const started: string[] = [];
    const { fetch, release } = fakeFetch(started);
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:x");
    const q = await import("../src/client/video-preload");

    q.reservePreload("hero", true);
    q.reservePreload("connector");
    q.startPreload("connector", "/connector.mp4", 100);
    await flush();
    expect(started).toEqual([]); // waits for the hero, which comes first

    q.startPreload("hero", "/hero.mp4", 100);
    await flush();
    expect(started).toEqual(["/hero.mp4"]);
    expect(q.preloadProgress(["hero"]).done).toBe(false);

    release("/hero.mp4");
    await vi.waitFor(() => expect(q.preloadProgress(["hero"]).done).toBe(true));
    expect(q.preloadState("hero")?.url).toBe("blob:x");
    await vi.waitFor(() => expect(started).toEqual(["/hero.mp4", "/connector.mp4"]));
    expect(q.preloadProgress(["hero", "connector"]).progress).toBeCloseTo(0.5);
  });

  it("adopts a download the page's inline script started, keeping its progress", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:early");
    const early: VideoPrefetch = {
      loaded: 60,
      total: 100,
      done: false,
      chunks: [new Uint8Array(60)],
      on: null,
    };
    vi.stubGlobal("__masVideoPrefetch", { "/hero.mp4": early });
    const q = await import("../src/client/video-preload");

    q.reservePreload("hero", true);
    q.startPreload("hero", "/hero.mp4", 100);
    await flush();
    expect(q.preloadProgress(["hero"]).progress).toBeCloseTo(0.6);

    early.chunks.push(new Uint8Array(40));
    early.loaded = 100;
    early.done = true;
    early.on?.();
    await vi.waitFor(() => expect(q.preloadProgress(["hero"]).done).toBe(true));
    expect(q.preloadState("hero")?.url).toBe("blob:early");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports bytes for the speed check and gives up on everything at once", async () => {
    const started: string[] = [];
    const { fetch } = fakeFetch(started);
    vi.stubGlobal("fetch", fetch);
    const early: VideoPrefetch = {
      loaded: 30,
      total: 100,
      done: false,
      chunks: [new Uint8Array(30)],
      on: null,
      abort: vi.fn(),
    };
    vi.stubGlobal("__masVideoPrefetch", { "/lake.mp4": early });
    const q = await import("../src/client/video-preload");

    q.reservePreload("hero", true);
    q.reservePreload("lake");
    // Sizes unknown until every video has one.
    expect(q.preloadBytes(["hero", "lake"]).total).toBe(0);
    q.startPreload("hero", "/hero.mp4", 100);
    q.startPreload("lake", "/lake.mp4", 100);
    await flush();
    // The lake was already downloading: it is followed at once, alongside the hero in the queue.
    expect(q.preloadBytes(["hero", "lake"])).toEqual({ loaded: 30, total: 200 });

    q.abandonAllPreloads();
    expect(early.abort).toHaveBeenCalled();
    expect(q.preloadProgress(["hero", "lake"]).done).toBe(true);
    expect(q.preloadState("hero")?.error).toBe(true);
  });

  it("reports unknown videos as not done", async () => {
    const q = await import("../src/client/video-preload");
    expect(q.preloadProgress(["nope"])).toEqual({ progress: 0, done: false });
  });
});
