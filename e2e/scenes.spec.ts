import { expect, test, type Page } from "@playwright/test";

/**
 * The scroll scenes and the splash gate (D62), on both landing pages: what the visitor sees from the first
 * frame, that the gate only opens when every scene has its frame decoded, and that the frames follow the
 * scroll exactly. Smoothness itself (frames per second on real hardware) is checked with the `?debug=scrub`
 * meter on devices (docs/runbooks/scroll-scenes-check.md); these tests hold the rules that must never break.
 */

declare global {
  interface Window {
    __masScenes?: Record<
      string,
      { mode: string; ready: boolean; near: boolean; want: number; shown: number; reason?: string }
    >;
    __masGate?: { openedAt: number; how: string };
  }
}

const SCENES = {
  covy: ["covy.hero", "covy.connector", "covy.signature"],
  aroma: ["aroma.morning", "aroma.lake", "aroma.night"],
} as const;

type App = keyof typeof SCENES;

/** Per animation frame from the first one: is the page covered (cover or opaque panel) while it is held? */
function coverProbe() {
  const log = {
    exposed: 0,
    scrolledWhileHeld: 0,
    frames: 0,
    /** The page moved after it opened, before any new input could have moved it (input kept from before). */
    driftAfterOpen: 0,
    openAt: 0,
    firstInputAfterOpen: 0,
  };
  (window as unknown as { __cover: typeof log }).__cover = log;
  // Registered before any page script, so it sees every input, even the ones the gate swallows.
  const input = () => {
    if (log.openAt && !log.firstInputAfterOpen) log.firstInputAfterOpen = performance.now();
  };
  for (const type of ["wheel", "keydown", "touchmove"])
    window.addEventListener(type, input, { capture: true, passive: true });
  const tick = () => {
    const root = document.documentElement;
    const state = root.dataset.splash;
    if (document.body && log.frames > 0 && !state) {
      if (!log.openAt) log.openAt = performance.now();
      if (!log.firstInputAfterOpen && performance.now() - log.openAt < 1500)
        log.driftAfterOpen = Math.max(log.driftAfterOpen, window.scrollY);
    }
    if (document.body && (state === "hold" || state === "leaving")) {
      log.frames++;
      const panel = document.querySelector<HTMLElement>(".aroma-splash, .covy-splash");
      const veil = panel?.querySelector<HTMLElement>("[data-veil]");
      const opaque =
        !!panel &&
        !!veil &&
        getComputedStyle(panel).display !== "none" &&
        Number(getComputedStyle(panel).opacity) > 0.99 &&
        Number(getComputedStyle(veil).opacity) > 0.99 &&
        getComputedStyle(veil).backgroundColor !== "rgba(0, 0, 0, 0)";
      // "leaving" is the panel's own fade onto the page: only "hold" must be fully covered.
      if (state === "hold" && !opaque) {
        // The cover under the panel (html::after) is opaque by itself.
        const cover = getComputedStyle(root, "::after");
        if (cover.content === "none" || cover.backgroundColor === "rgba(0, 0, 0, 0)") log.exposed++;
      }
      if (window.scrollY > 0 && !location.hash) log.scrolledWhileHeld++;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

async function gateOpen(page: Page) {
  await page.waitForFunction(() => window.__masGate !== undefined, null, { timeout: 90_000 });
  await expect(page.locator(".aroma-splash, .covy-splash")).toHaveCount(0, { timeout: 5_000 });
}

/**
 * The frame on screen of each scene near the viewport, once the walk has settled on the frame the scroll
 * asks for (scenes far away rest and are left out: -1).
 */
async function settledFrames(page: Page, ids: readonly string[]) {
  await page.waitForFunction(
    (list) =>
      list.every((id) => {
        const s = window.__masScenes?.[id];
        return s && s.ready && (!s.near || s.shown === Math.round(s.want));
      }),
    ids,
    { timeout: 10_000 },
  );
  return page.evaluate(
    (list) =>
      list.map((id) => {
        const s = window.__masScenes?.[id];
        return s?.near ? s.shown : -1;
      }),
    ids,
  );
}

async function scrollToFraction(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const sections = [...document.querySelectorAll("[data-sequence-id]")];
    const last = sections[sections.length - 1];
    if (!last) return;
    const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
    window.scrollTo(0, Math.round(end * f));
  }, fraction);
  // Let smooth scrolling and the walk land.
  await page.waitForTimeout(900);
}

test.describe("scroll scenes and the splash gate", () => {
  test.beforeEach(async ({ page: _page }, testInfo) => {
    const app = testInfo.project.metadata.app as string;
    test.skip(app !== "covy" && app !== "aroma", "landing pages with scroll scenes only");
  });

  test("the page is covered from the first frame and can't scroll until every scene is ready", async ({
    page,
  }, testInfo) => {
    const ids = SCENES[testInfo.project.metadata.app as App];
    await page.addInitScript(coverProbe);
    await page.goto("/");
    // Try to get in early: wheel, keys.
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 400).catch(() => {});
      await page.keyboard.press("PageDown").catch(() => {});
      await page.waitForTimeout(100);
    }
    await gateOpen(page);
    const cover = await page.evaluate(
      () => (window as unknown as { __cover: Record<string, number> }).__cover,
    );
    expect(cover.frames).toBeGreaterThan(0);
    expect(cover.exposed, "frames with the page showing before the panel left").toBe(0);
    expect(cover.scrolledWhileHeld, "frames scrolled while held").toBe(0);
    // Nothing tried while it was held carries the page on once it opens (later input is the visitor's own).
    await page.waitForTimeout(1500);
    const after = await page.evaluate(
      () => (window as unknown as { __cover: Record<string, number> }).__cover,
    );
    expect(after.driftAfterOpen, "px moved after opening, before any new input").toBe(0);
    // Opened because every scene was ready, each with its frame drawn.
    const state = await page.evaluate(
      (list) => ({
        how: window.__masGate?.how,
        scenes: list.map((id) => window.__masScenes?.[id]),
      }),
      ids,
    );
    expect(state.how).toBe("ready");
    for (const s of state.scenes) {
      expect(s?.ready).toBe(true);
      expect(["engine", "video"]).toContain(s?.mode);
      expect(s?.shown).toBeGreaterThanOrEqual(0);
    }
  });

  test("decodes with WebCodecs where the browser can", async ({ page }, testInfo) => {
    const ids = SCENES[testInfo.project.metadata.app as App];
    await page.goto("/");
    await gateOpen(page);
    const supported = await page.evaluate(
      (id) => window.__masScenes?.[id]?.reason !== "no WebCodecs H.264 decoder",
      ids[0],
    );
    test.skip(!supported, "this browser build has no H.264 WebCodecs decoder");
    for (const id of ids)
      expect(await page.evaluate((i) => window.__masScenes?.[i]?.mode, id)).toBe("engine");
  });

  test("the same scroll position always shows the same frame, both ways", async ({
    page,
  }, testInfo) => {
    const ids = SCENES[testInfo.project.metadata.app as App];
    await page.goto("/");
    await gateOpen(page);
    const stops = [0.12, 0.37, 0.61, 0.88];
    const forward: number[][] = [];
    for (const f of stops) {
      await scrollToFraction(page, f);
      forward.push(await settledFrames(page, ids));
    }
    await scrollToFraction(page, 1);
    for (const [i, f] of [...stops.entries()].reverse()) {
      await scrollToFraction(page, f);
      expect(await settledFrames(page, ids), `stop ${f}`).toEqual(forward[i]);
    }
    // And at the very end every scene sits on its last frame.
    await scrollToFraction(page, 1);
    const last = await settledFrames(page, ids);
    const counts = await page.evaluate(
      (list) => list.map((id) => document.querySelector(`[data-sequence-id="${id}"]`) !== null),
      ids,
    );
    expect(counts.every(Boolean)).toBe(true);
    // The last scene is on screen and on its last frame region (well past its start).
    expect(last[last.length - 1]).toBeGreaterThan(0);
  });

  test("each scene takes over from the previous one on a drawn frame", async ({
    page,
  }, testInfo) => {
    const ids = SCENES[testInfo.project.metadata.app as App];
    await page.goto("/");
    await gateOpen(page);
    for (const id of ids.slice(1)) {
      // The top of the section that continues the previous scene: its stage is revealed right here.
      await page.evaluate((i) => {
        const s = document.querySelector(`[data-sequence-id="${i}"]`);
        if (s) window.scrollTo(0, Math.round(s.getBoundingClientRect().top + window.scrollY + 2));
      }, id);
      await page.waitForTimeout(900);
      const s = await page.evaluate((i) => window.__masScenes?.[i], id);
      expect(s?.ready, id).toBe(true);
      expect(s?.shown, `${id} has a frame on screen at the cut`).toBeGreaterThanOrEqual(0);
    }
  });

  test("a reload in the middle of the walk starts again at the top, behind the gate", async ({
    page,
  }) => {
    await page.goto("/");
    await gateOpen(page);
    await scrollToFraction(page, 0.5);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await page.addInitScript(coverProbe);
    await page.reload();
    await gateOpen(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    const cover = await page.evaluate(
      () => (window as unknown as { __cover: Record<string, number> }).__cover,
    );
    expect(cover.exposed).toBe(0);
  });

  test("a link to a section lands there once the gate opens", async ({ page }) => {
    await page.goto("/#menu");
    await gateOpen(page);
    await expect(page.locator("#menu")).toBeInViewport();
  });

  test("without WebCodecs the scenes play from the video element, behind the same gate", async ({
    page,
  }, testInfo) => {
    const ids = SCENES[testInfo.project.metadata.app as App];
    await page.addInitScript(() => {
      // As in Firefox for Android: no WebCodecs at all.
      delete (window as { VideoDecoder?: unknown }).VideoDecoder;
    });
    await page.addInitScript(coverProbe);
    await page.goto("/");
    await gateOpen(page);
    const cover = await page.evaluate(
      () => (window as unknown as { __cover: Record<string, number> }).__cover,
    );
    expect(cover.exposed).toBe(0);
    for (const id of ids) {
      const s = await page.evaluate((i) => window.__masScenes?.[i], id);
      expect(s?.mode).toBe("video");
      expect(s?.ready).toBe(true);
    }
    await scrollToFraction(page, 0.5);
    await settledFrames(page, ids);
  });

  test("reduced motion: no panel, no lock, still pictures", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", baseURL });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-splash", "seen");
    await expect(page.locator(".aroma-splash, .covy-splash")).toBeHidden();
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await context.close();
  });
});
