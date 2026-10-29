"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FrameCache } from "../frame-cache";
import { fitRect, progressToFrame } from "../frame-math";
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
  fit?: "cover" | "contain";
  priority?: boolean;
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
  const portrait = window.innerWidth / window.innerHeight < 0.9;
  const wantMobile = tierMid || portrait;
  return (
    manifest.variants.find((v) => v.name === (wantMobile ? "mobile" : "desktop")) ??
    manifest.variants[0]
  );
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
  fit = "cover",
  priority = false,
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
    let lastDrawn: ImageBitmap | undefined;
    let raf = 0;
    const dprCap = tier === "MID" ? 1.5 : 2;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      lastDrawn = undefined;
      draw();
    };

    const draw = () => {
      raf = 0;
      if (!cache || !manifest) return;
      const bitmap = cache.get(current) ?? cache.nearest(current);
      if (!bitmap || bitmap === lastDrawn) return;
      const r = fitRect(
        bitmap.width,
        bitmap.height,
        canvas.width,
        canvas.height,
        fit,
        manifest.focal,
      );
      ctx.drawImage(bitmap, r.sx, r.sy, r.sw, r.sh, r.dx, r.dy, r.dw, r.dh);
      lastDrawn = bitmap;
      setPainted(true);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const onProgress = (progress: number, direction: number) => {
      section.style.setProperty("--seq-progress", progress.toFixed(4));
      if (!variant || !cache) return;
      current = progressToFrame(progress, variant.frameCount);
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
          return createImageBitmap(await r.blob());
        },
        { onReady: (index) => index === current && schedule() },
      );
      resize();
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => onProgress(self.progress, self.direction),
      });
      onProgress(trigger.progress, 1);
    })();

    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      trigger?.kill();
      cache?.destroy();
    };
  }, [animated, lib, manifestUrl, fit, tier, poster.avif]);

  const style = { "--scroll-vh": scrollVh } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      data-sequence-id={id}
      data-animated={animated ? "true" : "false"}
      style={style}
      className={[
        "relative",
        staticLayout ? "h-auto" : "h-[calc(var(--scroll-vh)*1svh)] motion-reduce:h-auto",
        className ?? "",
      ].join(" ")}
    >
      <div
        ref={stageRef}
        className={
          staticLayout
            ? "relative aspect-(--poster-ratio) w-full overflow-hidden"
            : "sticky top-0 h-svh w-full overflow-hidden motion-reduce:relative motion-reduce:aspect-(--poster-ratio) motion-reduce:h-auto"
        }
        style={{ "--poster-ratio": `${poster.width} / ${poster.height}` } as CSSProperties}
      >
        <picture>
          <source type="image/avif" srcSet={poster.avif} />
          <img
            src={poster.webp}
            width={poster.width}
            height={poster.height}
            alt={label}
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
        {children ? <div className="absolute inset-0">{children}</div> : null}
      </div>
    </section>
  );
}
