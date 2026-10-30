"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FrameCache } from "../frame-cache";
import { fitRect, progressToPosition } from "../frame-math";
import { frameUrl, type SequenceManifest, type SequenceVariant } from "../manifest";
import { useMotion } from "./motion-provider";

export type SequencePoster = { avif: string; webp: string; width: number; height: number };

export type SequencePlayerProps = {
  id: string;
  manifestUrl: string;
  /** Rendered immediately (SSR) and used as the static/reduced-motion frame. */
  poster: SequencePoster;
  /** Accessible description of what the sequence shows. */
  label: string;
  /** Scroll length of the section in viewport heights. */
  scrollVh?: number;
  /**
   * Extra scroll (viewport heights) after the last frame, for overlay motion on the held final frame.
   * Overlays read it as `--seq-hold` (0..1); `--seq-progress` still reaches 1 on the last frame.
   */
  holdVh?: number;
  fit?: "cover" | "contain";
  priority?: boolean;
  /**
   * Continue the previous sequence without a cut: its last frame must be this one's first. The section is
   * pulled up one screen so it pins exactly where the previous stage unpins, and its stage stays invisible
   * until then, so the previous one shows through.
   */
  overlapPrevious?: boolean;
  /**
   * Layer sized and placed exactly like the frame (cropped like it on any screen), for marks that must
   * stay on an object in the footage: position children in % of the frame. Assumes the centred focal point.
   */
  frameOverlay?: ReactNode;
  /** HTML copy layered over the stage. Reads `--seq-progress` (0..1) from CSS if it needs to. */
  children?: ReactNode;
  className?: string;
};

/** True if this browser can decode the sequence's AVIF poster (real check, no sample image). */
async function canDecodeAvif(url: string): Promise<boolean> {
  try {
    const r = await fetch(url);
    if (!r.ok) return false;
    const bitmap = await createImageBitmap(await r.blob());
    bitmap.close();
    return true;
  } catch {
    return false;
  }
}

function chooseVariant(manifest: SequenceManifest, tierMid: boolean): SequenceVariant | undefined {
  const find = (name: SequenceVariant["name"]) => manifest.variants.find((v) => v.name === name);
  const portrait = window.innerWidth / window.innerHeight < 0.9;
  if (tierMid || portrait) return find("mobile") ?? manifest.variants[0];
  const desktop = find("desktop");
  // The large variant only for screens wider than the standard frames in CSS pixels (big monitors). A
  // high-density laptop gets the standard frames: the larger ones decode about 1.8x slower, which a scrub
  // shows as frames trailing the scroll, while the sharpness gain on a moving image is slight.
  const xl = desktop && window.innerWidth > desktop.width ? find("desktop-xl") : undefined;
  return xl ?? desktop ?? manifest.variants[0];
}

/** Decoded frames are width × height × 4 bytes each; keep the cache window inside a memory budget. */
function cacheWindow(
  variant: SequenceVariant,
  tierMid: boolean,
): { ahead: number; behind: number } {
  const budget = (tierMid ? 160 : 256) * 1024 * 1024;
  const frames = Math.max(
    12,
    Math.min(32, Math.floor(budget / (variant.width * variant.height * 4))),
  );
  const ahead = Math.round(frames * 0.75);
  return { ahead, behind: frames - ahead };
}

/**
 * Scroll-scrubbed image sequence on a sticky canvas (skill: scroll-scrubbed-visual-sequence).
 * Native scroll position is the only source of truth; reduced motion and LOW tier get the poster in normal flow.
 */
export function SequencePlayer({
  id,
  manifestUrl,
  poster,
  label,
  scrollVh = 280,
  holdVh = 0,
  fit = "cover",
  priority = false,
  overlapPrevious = false,
  frameOverlay,
  children,
  className,
}: SequencePlayerProps) {
  const { tier, lib } = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [painted, setPainted] = useState(false);
  const animated = tier === "HIGH" || tier === "MID";
  /** Before hydration (tier null) keep the scroll layout so the page doesn't jump once JS runs. */
  const staticLayout = tier === "LOW" || tier === "STATIC";

  useEffect(() => {
    // The poster is on screen until the motion library (ScrollTrigger) arrives after first paint.
    if (!animated || !lib) return;
    const { ScrollTrigger } = lib;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let cancelled = false;
    let cache: FrameCache | null = null;
    let trigger: ReturnType<typeof ScrollTrigger.create> | null = null;
    let manifest: SequenceManifest | null = null;
    let variant: SequenceVariant | undefined;
    let format: "avif" | "webp" = "webp";
    let current = 0;
    /** Where the scroll sits between frames (fractional); `current` is the nearest frame. */
    let position = 0;
    /** What's on the canvas: a bitmap, or "base+mix" for a blend of two. */
    let lastDrawn: ImageBitmap | string | undefined;
    let raf = 0;
    let near = false;
    let onScreen = false;
    let nearNow = false;
    const update = (): void => cache?.setMode(onScreen ? "playing" : nearNow ? "ready" : "standby");
    const dprCap = tier === "MID" ? 1.5 : 2;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      lastDrawn = undefined;
      draw();
    };

    const paint = (bitmap: ImageBitmap, focal: SequenceManifest["focal"]) => {
      const r = fitRect(bitmap.width, bitmap.height, canvas.width, canvas.height, fit, focal);
      ctx.drawImage(bitmap, r.sx, r.sy, r.sw, r.sh, r.dx, r.dy, r.dw, r.dh);
    };

    const draw = () => {
      raf = 0;
      if (!cache || !manifest) return;
      // Between two frames, blend them by how far the scroll is from one to the other, so the picture moves
      // continuously instead of stepping from frame to frame. If either isn't decoded yet, show the nearest.
      const base = Math.floor(position);
      const mix = Math.round((position - base) * 16) / 16;
      const a = cache.get(base);
      const b = mix > 0 && mix < 1 ? cache.get(base + 1) : undefined;
      if (a && b) {
        const key = `${base}+${mix}`;
        if (key === lastDrawn) return;
        paint(a, manifest.focal);
        ctx.globalAlpha = mix;
        paint(b, manifest.focal);
        ctx.globalAlpha = 1;
        lastDrawn = key;
      } else {
        const bitmap = cache.get(current) ?? cache.nearest(current);
        if (!bitmap || bitmap === lastDrawn) return;
        paint(bitmap, manifest.focal);
        lastDrawn = bitmap;
      }
      setPainted(true);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    // Share of the section's scroll distance (its height minus one screen) that scrubs the frames.
    const framesEnd = holdVh > 0 ? (scrollVh - 100) / (scrollVh + holdVh - 100) : 1;

    const onProgress = (progress: number, direction: number) => {
      const frames = Math.min(1, progress / framesEnd);
      const hold = framesEnd < 1 ? Math.max(0, (progress - framesEnd) / (1 - framesEnd)) : 0;
      section.style.setProperty("--seq-progress", frames.toFixed(4));
      section.style.setProperty("--seq-hold", Math.min(1, hold).toFixed(4));
      if (!variant || !cache) return;
      position = progressToPosition(frames, variant.frameCount, variant.timing);
      current = Math.round(position);
      cache.prioritise(current, direction < 0 ? -1 : 1);
      schedule();
    };

    void (async () => {
      const [res, avif] = await Promise.all([fetch(manifestUrl), canDecodeAvif(poster.avif)]);
      if (!res.ok || cancelled) return;
      manifest = (await res.json()) as SequenceManifest;
      variant = chooseVariant(manifest, tier === "MID");
      if (!variant || cancelled) return;
      format = avif ? "avif" : "webp";
      const template = variant[format];
      cache = new FrameCache(
        variant.frameCount,
        async (index, signal) => {
          const r = await fetch(frameUrl(manifestUrl, template, index), { signal });
          if (!r.ok) throw new Error(`frame ${index}: ${r.status}`);
          return r.blob();
        },
        {
          ...cacheWindow(variant, tier === "MID"),
          // Decoding runs off the main thread; more cores keep up with a faster scroll.
          maxDecodes: Math.min(
            4,
            Math.max(2, Math.floor((navigator.hardwareConcurrency || 4) / 2)),
          ),
          // Any new frame may be closer to the scroll position than the one on screen.
          onReady: schedule,
        },
      );
      if (near) cache.preloadAll();
      resize();
      // Without a scroll-driven timeline, hide the stage from a script; it can trail the scroll by a frame.
      const reveal = (self: { scroll(): number; start: number }) => {
        if (overlapPrevious && !reveals)
          stage.style.visibility = self.scroll() < self.start ? "hidden" : "";
      };
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          reveal(self);
          onProgress(self.progress, self.direction);
        },
        // Fires at the boundaries even when onUpdate doesn't (e.g. scrolling back to exactly the start).
        onToggle: reveal,
        onRefresh: reveal,
      });
      reveal(trigger);
      update();
      onProgress(trigger.progress, 1);
    })();

    // Overlapping sections: the stage stays invisible until its section reaches the top of the screen, where
    // it pins over the previous stage's identical last frame. A ViewTimeline animation does this inside the
    // browser's own scrolling, so it is exact even when the compositor scrolls ahead of JavaScript (a fast
    // flick back up, the scrollbar); "entry" ends as the section's top reaches the top of the viewport.
    let reveals: Animation | null = null;
    if (overlapPrevious && typeof window.ViewTimeline === "function") {
      // Opacity runs on the compositor (no lag); visibility keeps the hidden stage from taking clicks.
      const hidden = { opacity: 0, visibility: "hidden" };
      reveals = stage.animate(
        [hidden, { ...hidden, offset: 0.999 }, { opacity: 1, visibility: "visible" }],
        {
          timeline: new window.ViewTimeline({ subject: section }),
          rangeStart: "entry 0%",
          rangeEnd: "entry 100%",
          fill: "both",
        } as KeyframeAnimationOptions,
      );
    }

    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // Download the whole sequence once the section is about to be reached, so a fast scroll
    // through it finds frames already in memory.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near = true;
        cache?.preloadAll();
        io.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(section);

    // On screen it plays; within a screen and a half it gets ready without slowing the one playing; further
    // away it frees its decoded frames. A section that overlaps the previous one is on screen (under it) a
    // screen before it pins.
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      update();
    });
    const around = new IntersectionObserver(
      ([entry]) => {
        nearNow = Boolean(entry?.isIntersecting);
        update();
      },
      { rootMargin: "150% 0px" },
    );
    seen.observe(section);
    around.observe(section);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      seen.disconnect();
      reveals?.cancel();
      stage.style.visibility = "";
      around.disconnect();
      trigger?.kill();
      cache?.destroy();
    };
  }, [animated, lib, manifestUrl, fit, tier, poster.avif, scrollVh, holdVh, overlapPrevious]);

  // Static layouts show the poster with the overlay in its final state (e.g. the logo already in place).
  const style = {
    "--scroll-vh": scrollVh + holdVh,
    ...(staticLayout ? { "--seq-progress": 1 } : {}),
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      data-sequence-id={id}
      data-animated={animated ? "true" : "false"}
      style={style}
      className={[
        "relative",
        staticLayout
          ? "h-auto"
          : "h-[calc(var(--scroll-vh)*1svh)] motion-reduce:h-auto motion-reduce:[--seq-progress:1]",
        // The pulled-up box sits over the end of the previous section; only the stage takes pointer events.
        overlapPrevious && !staticLayout
          ? "pointer-events-none -mt-[100svh] motion-reduce:pointer-events-auto motion-reduce:mt-0"
          : "",
        className ?? "",
      ].join(" ")}
    >
      <div
        ref={stageRef}
        className={[
          // A size container, so the frame overlay can match the frame with cqw/cqh alone.
          "[container-type:size] pointer-events-auto",
          staticLayout
            ? "relative aspect-(--poster-ratio) w-full overflow-hidden"
            : "sticky top-0 h-svh w-full overflow-hidden motion-reduce:relative motion-reduce:aspect-(--poster-ratio) motion-reduce:h-auto",
        ].join(" ")}
        style={{ "--poster-ratio": `${poster.width} / ${poster.height}` } as CSSProperties}
      >
        <picture>
          <source type="image/avif" srcSet={poster.avif} />
          <img
            src={poster.webp}
            width={poster.width}
            height={poster.height}
            alt={label}
            // canDecodeAvif() fetches the same poster with CORS; a no-cors copy in the HTTP cache
            // (R2 sends no Vary: Origin) would fail that check and force WebP frames.
            crossOrigin="anonymous"
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {animated ? (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full transition-opacity duration-300"
            style={{ opacity: painted ? 1 : 0 }}
          />
        ) : null}
        {frameOverlay ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 aspect-(--poster-ratio) -translate-x-1/2 -translate-y-1/2"
            // object-fit for a box: as wide as the frame is drawn, cropped or letterboxed like it.
            style={{
              width: `${fit === "cover" ? "max" : "min"}(100cqw, 100cqh * ${poster.width} / ${poster.height})`,
            }}
          >
            {frameOverlay}
          </div>
        ) : null}
        {children ? <div className="absolute inset-0">{children}</div> : null}
      </div>
    </section>
  );
}
