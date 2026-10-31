"use client";

import { useEffect, type RefObject } from "react";

/**
 * The wash in globals.css (.aroma-header::before): marble under ink type over bright frames, night green
 * under marble type over dark ones. It fades from 70% at the top edge, so behind the type (mid-header) it is
 * about this strong.
 */
const INK: Rgb = [32, 39, 34];
const MARBLE: Rgb = [247, 245, 240];
const NIGHT: Rgb = [22, 38, 28];
const LIGHT_TINT = 0.5;
const DARK_TINT = 0.5;
/** The other tone must read this much better before the header switches... */
const SWITCH_MARGIN = 1.15;
/** ...and keep reading better for this long, so a passing frame or a cut never makes it flicker. */
const SWITCH_HOLD_MS = 300;

type Rgb = [number, number, number];

/** WCAG relative luminance of an sRGB colour. */
function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** A tint laid over the frame, as color-mix() in sRGB composites it. */
function over(tint: Rgb, amount: number, frame: Rgb): Rgb {
  return frame.map((c, i) => tint[i]! * amount + c * (1 - amount)) as Rgb;
}

/**
 * The tone whose type reads better on the strip: navy over the sand wash, or sand over the navy wash, by
 * their WCAG contrast. The type's halo of the wash colour adds to it.
 */
function pickTone(frame: Rgb, current: "light" | "dark"): "light" | "dark" {
  const light = contrast(INK, over(MARBLE, LIGHT_TINT, frame));
  const dark = contrast(MARBLE, over(NIGHT, DARK_TINT, frame));
  if (current === "light") return dark > light * SWITCH_MARGIN ? "dark" : "light";
  return light > dark * SWITCH_MARGIN ? "light" : "dark";
}

/** Average colour of the pixels drawn into the probe canvas. */
function average(ctx: CanvasRenderingContext2D, w: number, h: number): Rgb {
  const d = ctx.getImageData(0, 0, w, h).data;
  const sum: Rgb = [0, 0, 0];
  for (let i = 0; i < d.length; i += 4) {
    sum[0] += d[i]!;
    sum[1] += d[i + 1]!;
    sum[2] += d[i + 2]!;
  }
  const n = d.length / 4;
  return [sum[0] / n, sum[1] / n, sum[2] / n];
}

/** How visible an element really is: its own opacity times every ancestor's, up to `stop`. */
function shownOpacity(el: HTMLElement, stop: HTMLElement): number {
  let o = 1;
  for (let n: HTMLElement | null = el; n && n !== stop.parentElement; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden") return 0;
    o *= Number(cs.opacity);
  }
  return o;
}

/**
 * D47: while the header sits over the scroll scenes (`[data-walk]`), its bar gives way to a soft wash that
 * fades into the footage. It reads the strip of footage under it and takes whichever tone reads better
 * there by WCAG contrast: navy type on a sand wash over bright frames (sky, the white mural), sand type on a
 * navy wash over dark ones. An overlay that darkens that strip
 * says so with `data-header-tone`. The bottom hairline fills with the walk's progress. Outside the scenes,
 * and without motion (no videos), the header keeps its sand bar.
 */
export function useWalkHeader(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current;
    const walk = document.querySelector<HTMLElement>("[data-walk]");
    if (!header || !walk) return;
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 3;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let tone: "light" | "dark" = "light";
    let pending: { tone: "light" | "dark"; since: number } | null = null;
    let raf = 0;
    const progress = header.querySelector<HTMLElement>(".aroma-header-progress");

    const set = (name: string, value: string) => {
      if (header.dataset[name] !== value) header.dataset[name] = value;
    };

    /**
     * The scene on screen under the header: the topmost pinned, revealed stage (later stages paint over
     * earlier ones). Its video only if it has a frame; a stage without one is never swapped for the
     * covered one beneath it, which may show a different picture.
     */
    const activeVideo = (h: number) => {
      let top: HTMLElement | null = null;
      for (const stage of walk.querySelectorAll<HTMLElement>("[data-sequence-id] > div")) {
        const r = stage.getBoundingClientRect();
        if (r.top > 1 || r.bottom < h) continue;
        if (shownOpacity(stage, walk) < 0.5) continue;
        top = stage;
      }
      const v = top?.querySelector("video");
      // While it seeks, the video still shows its last frame, which is the one on screen: read that.
      if (!v || v.readyState < 2 || !v.videoWidth) return null;
      return shownOpacity(v, top!) < 0.5 ? null : v;
    };

    const readTone = (h: number): "light" | "dark" | null => {
      // An overlay that covers the strip under the header decides first.
      for (const el of walk.querySelectorAll<HTMLElement>("[data-header-tone]")) {
        const r = el.getBoundingClientRect();
        if (r.top > 0 || r.bottom < h || r.width === 0) continue;
        if (shownOpacity(el, walk) >= 0.5)
          return el.dataset.headerTone === "dark" ? "dark" : "light";
      }
      const v = activeVideo(h);
      if (!v || !ctx) return null;
      // Map the header strip onto the frame as object-fit: cover shows it (centred focal point).
      const r = v.getBoundingClientRect();
      const s = Math.max(r.width / v.videoWidth, r.height / v.videoHeight);
      const ox = (r.width - v.videoWidth * s) / 2;
      const oy = (r.height - v.videoHeight * s) / 2;
      try {
        ctx.drawImage(v, -ox / s, (-r.top - oy) / s, r.width / s, h / s, 0, 0, 24, 3);
        return pickTone(average(ctx, 24, 3), tone);
      } catch {
        // A frame that can't be read (streamed from another origin): keep the last tone.
        return null;
      }
    };

    const update = () => {
      raf = 0;
      const h = header.offsetHeight;
      const r = walk.getBoundingClientRect();
      const animated = walk.querySelector('[data-animated="true"]') !== null;
      const over = animated && r.top < h && r.bottom > h;
      set("mode", over ? "walk" : "page");
      if (!over) return;
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      progress?.style.setProperty("transform", `scaleX(${p.toFixed(4)})`);
      const read = readTone(h);
      const now = performance.now();
      if (!read) {
        // No reading this time: keep the tone and any switch already under way.
      } else if (read === tone) {
        pending = null;
      } else if (pending?.tone !== read) {
        pending = { tone: read, since: now };
      } else if (now - pending.since >= SWITCH_HOLD_MS) {
        tone = read;
        pending = null;
      }
      set("tone", tone);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // Scrolling moves the strip, and each seek that lands changes the frame: read again on both. The tick
    // completes a pending switch once it has held.
    const tick = window.setInterval(schedule, 150);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    walk.addEventListener("seeked", schedule, true);
    schedule();
    return () => {
      walk.removeEventListener("seeked", schedule, true);
      window.clearInterval(tick);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headerRef]);
}
