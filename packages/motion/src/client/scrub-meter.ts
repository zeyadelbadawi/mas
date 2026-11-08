import type { SceneStatus } from "./scene-status";

/**
 * A hidden meter for checking the scroll scenes on real devices (D62): open a landing page with
 * `?debug=scrub` and a small panel shows, for each scene, which engine draws it and why, and while scrolling
 * how smoothly the picture follows: screen refreshes per second, how often the picture lagged without moving,
 * the largest step between two pictures, the largest lag behind the scroll, memory, and how long the splash
 * gate took. "Reset" zeroes the counters before a test run. Plain DOM, loaded only when asked for.
 */
export function mountScrubMeter(): void {
  if (document.getElementById("mas-scrub-meter")) return;
  const panel = document.createElement("div");
  panel.id = "mas-scrub-meter";
  panel.dir = "ltr";
  panel.style.cssText =
    "position:fixed;top:8px;left:8px;z-index:200;max-width:calc(100vw - 16px);padding:8px;border-radius:8px;" +
    "background:rgb(0 0 0/.8);color:#fff;font:11px/1.35 ui-monospace,monospace;white-space:pre-wrap";
  const text = document.createElement("div");
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Reset";
  reset.style.cssText =
    "margin-top:4px;padding:2px 8px;border-radius:4px;background:rgb(255 255 255/.2);color:#fff";
  panel.append(text, reset);
  document.body.append(panel);

  const c = { frames: 0, moving: 0, frozen: 0, maxStep: 0, maxLag: 0, since: performance.now() };
  reset.addEventListener("click", () =>
    Object.assign(c, {
      frames: 0,
      moving: 0,
      frozen: 0,
      maxStep: 0,
      maxLag: 0,
      since: performance.now(),
    }),
  );

  let prev: { id: string; shown: number } | null = null;
  const tick = () => {
    requestAnimationFrame(tick);
    c.frames++;
    // The scene on screen: the last one the scroll has reached.
    let active: [string, SceneStatus] | null = null;
    for (const entry of Object.entries(window.__sc ?? {}))
      if (!active || entry[1].want > 0) active = entry;
    if (!active) return;
    const [id, s] = active;
    c.maxLag = Math.max(c.maxLag, Math.abs(Math.round(s.want) - s.shown));
    if (prev && prev.id === id && Math.round(s.walk) !== prev.shown) {
      c.moving++;
      if (s.shown === prev.shown) c.frozen++;
      else c.maxStep = Math.max(c.maxStep, Math.abs(s.shown - prev.shown));
    }
    prev = { id, shown: s.shown };
  };
  requestAnimationFrame(tick);

  window.setInterval(() => {
    const secs = (performance.now() - c.since) / 1000;
    const gate = window.__g;
    const memory = (navigator as { deviceMemory?: number }).deviceMemory;
    const lines = [
      `refresh ${(c.frames / secs).toFixed(0)}/s · lagging still ${c.moving ? ((100 * c.frozen) / c.moving).toFixed(0) : 0}% · max step ${c.maxStep} · max lag ${c.maxLag}`,
      `gate ${gate ? `${gate.openedAt} ms (${gate.how})` : "waiting"} · webcodecs ${typeof VideoDecoder === "function" ? "yes" : "no"} · dpr ${devicePixelRatio} · mem ${memory ?? "?"} GB`,
    ];
    let kept = 0;
    for (const [id, s] of Object.entries(window.__sc ?? {})) {
      const e = s.engine;
      kept += e?.keptBytes ?? 0;
      lines.push(
        `${id}: ${s.mode}${s.ready ? ` ready ${s.readyAt} ms` : " not ready"}${s.reason ? ` (${s.reason})` : ""} · frame ${s.shown}/${Math.round(s.want)}` +
          (e
            ? ` · decoded ${e.decoded} · draw ${e.drawn ? (e.drawMs / e.drawn).toFixed(1) : 0} ms · errors ${e.errors}`
            : ""),
      );
    }
    lines.push(`frames kept ${(kept / 2 ** 20).toFixed(0)} MB`);
    text.textContent = lines.join("\n");
  }, 250);
}
