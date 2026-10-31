import { afterEach, describe, expect, it, vi } from "vitest";

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

  it("reports unknown videos as not done", async () => {
    const q = await import("../src/client/video-preload");
    expect(q.preloadProgress(["nope"])).toEqual({ progress: 0, done: false });
  });
});
