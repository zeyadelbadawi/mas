"use client";

import { useEffect, type RefObject } from "react";

/** The glass tints in globals.css (.covy-header): sand over bright frames, navy over dark ones. */
const NAVY: Rgb = [38, 45, 63];
const SAND: Rgb = [220, 212, 207];
const LIGHT_TINT = 0.55;
const DARK_TINT = 0.65;
/** The other tone must read this much better before the header switches, so it never flickers. */
const SWITCH_MARGIN = 1.15;

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
 * The tone whose type reads better on the blurred strip: navy on the sand glass, or sand on the navy glass,
 * by their WCAG contrast. With these tints the better of the two stays above 5:1 for any even colour.
 */
function pickTone(frame: Rgb, current: "light" | "dark"): "light" | "dark" {
  const light = contrast(NAVY, over(SAND, LIGHT_TINT, frame));
  const dark = contrast(SAND, over(NAVY, DARK_TINT, frame));
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
 * D47: while the header sits over the scroll scenes (`[data-walk]`), it turns to frosted glass and reads the
 * strip of footage under it and takes whichever tone reads better there by WCAG contrast: navy type on a
 * sand tint over bright frames (sky, the white mural), sand type on a navy tint over dark ones. An overlay that darkens that strip
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
    let raf = 0;

    const set = (name: string, value: string) => {
      if (header.dataset[name] !== value) header.dataset[name] = value;
    };

    /** The scene stage on screen under the header: the last pinned, revealed one paints on top. */
    const activeVideo = (h: number) => {
      let pick: HTMLVideoElement | null = null;
      for (const v of walk.querySelectorAll<HTMLVideoElement>("[data-sequence-id] video")) {
        const stage = v.parentElement;
        if (!stage || v.readyState < 2 || !v.videoWidth) continue;
        const r = stage.getBoundingClientRect();
        if (r.top > 1 || r.bottom < h) continue;
        if (shownOpacity(v, stage) < 0.5) continue;
        pick = v;
      }
      return pick;
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
      header.style.setProperty("--walk-progress", p.toFixed(4));
      tone = readTone(h) ?? tone;
      set("tone", tone);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // Scrolling moves the strip; seeks land after the scroll stops, so the frame is read again a moment later.
    const tick = window.setInterval(schedule, 250);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.clearInterval(tick);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headerRef]);
}
