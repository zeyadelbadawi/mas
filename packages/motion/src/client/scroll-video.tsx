"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { progressToPosition } from "../frame-math";
import { siblingUrl, videoVariantFor, type VideoManifest } from "../manifest";
import { loadMotionLib } from "./motion-lib";
import { useMotion } from "./motion-provider";
import type { SceneDriver } from "./scene-driver";
import { updateScene } from "./scene-status";
import type { SequencePlayerProps } from "./sequence-player";
import {
  abandonPreload,
  preloadState,
  reservePreload,
  startPreload,
  subscribePreload,
} from "./video-preload";

/**
 * Frames the engine keeps around the scroll position. Phones get fewer (their frames are 1080 × 1350 and
 * memory is tighter), and so does any device that reports 4 GB or less.
 */
function ringSize(shape: "desktop" | "mobile"): number {
  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory <= 4) return 12;
  return shape === "mobile" ? 18 : 24;
}

export type ScrollVideoProps = SequencePlayerProps & {
  /**
   * Scroll (viewport heights) at the start that stays on the first frame. For a scene that continues the
   * previous one: scrolling back up, the video has time to land on its first frame (the previous scene's
   * last) before the cut, instead of still trailing a few frames behind on a fast scroll.
   */
  leadVh?: number;
  /**
   * Horizontal pan of the cropped picture over the move, as object-position x in % (from, to). It only shows
   * where the screen is narrower than the video (phones), and lets a scene follow its subject out of the
   * centre. A scene that continues this one should start where this one ends. The frame overlay assumes the
   * centre, so keep `from` at 50 while a mark is on the footage.
   */
  panX?: readonly [number, number];
};

/**
 * Scroll-scrubbed video on a sticky stage (D43, D62). The video is downloaded whole first (in page order, see
 * video-preload), then its frames are decoded with WebCodecs and drawn into a canvas (frame-engine): no seek
 * pipeline, so the picture keeps up with the scroll. Browsers without WebCodecs H.264 (Firefox for Android,
 * Safari before 16.4) seek the video element instead, one seek at a time. Either way the frame shown walks
 * to the scroll position with a short ease, so a fast flick runs through the frames instead of skipping.
 * Frame i of the video is frame i of the move, so a section that continues the previous one
 * (`overlapPrevious`) starts on exactly the frame the previous one ended on. Each scene reports when its frame
 * is on screen (scene-status), and the splash waits for that. Same props and layout as SequencePlayer;
 * reduced motion and the LOW tier get the poster in normal flow.
 */
export function ScrollVideo({
  id,
  manifestUrl,
  poster,
  label,
  scrollVh = 280,
  holdVh = 0,
  leadVh = 0,
  panX,
  fit = "cover",
  priority = false,
  overlapPrevious = false,
  frameOverlay,
  children,
  className,
}: ScrollVideoProps) {
  const { tier, lib } = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  const [manifest, setManifest] = useState<VideoManifest | null>(null);
  /** Which element has drawn the scene's frames (it is shown over the poster from then on). */
  const [painted, setPainted] = useState<"none" | "engine" | "video">("none");
  const animated = tier === "HIGH" || tier === "MID";
  const [panFrom, panTo] = panX ?? [];
  /** Before hydration (tier null) keep the scroll layout so the page doesn't jump once JS runs. */
  const staticLayout = tier === "LOW" || tier === "STATIC";

  /** The latest scroll progress (0..1) and the handler the video effect installs for it. */
  const progressRef = useRef<{ value: number; apply: (p: number) => void }>({
    value: 0,
    apply: () => {},
  });

  // The manifest and the download start as soon as the tier is known, before the motion library arrives,
  // and keep their place in page order.
  useEffect(() => {
    if (!animated) return;
    reservePreload(id, priority);
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error(String(res.status));
        const m = (await res.json()) as VideoManifest;
        if (!cancelled) setManifest(m);
      } catch {
        // No manifest: the poster stays, and the videos after this one must not wait for it.
        if (!cancelled) abandonPreload(id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [animated, id, manifestUrl, priority]);

  // The frames: which file, which engine draws it, and walking to the frame the scroll asks for.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!animated || !manifest || !section || !video || !canvas) return;

    // By the screen's shape when the page opens: the 4:5 crop for portrait screens, the 16:9 frames
    // otherwise. It stays for the visit, so a resize never sends the visitor back to a download.
    const shape = videoVariantFor(window.innerWidth, window.innerHeight);
    const variant = manifest.variants.find((v) => v.name === shape) ?? manifest.variants[0];
    if (!variant) {
      abandonPreload(id);
      updateScene(id, { mode: "poster", ready: true, reason: "no video variant" });
      return;
    }
    const src = siblingUrl(manifestUrl, variant.src);
    // The frame overlay is laid out as the full 16:9 frame. The phone cut is a full-height centre crop of
    // that frame, so while it plays the overlay is sized from the crop's own shape: on screens it doesn't
    // fill by height (between 4:5 and the portrait limit) the crop then scales by width, and marks on the
    // footage would otherwise drift.
    const overlay = overlaysRef.current[0];
    if (overlay && fit === "cover") {
      const frame = poster.width / poster.height;
      const crop = variant.width / variant.height;
      overlay.style.width = `max(${(100 * frame) / crop}cqw, ${100 * frame}cqh)`;
    }
    const { fps, frameCount, timing } = manifest;
    const focalY = manifest.focal.y;
    const progress = progressRef.current;
    updateScene(id, { mode: "pending", ready: false });
    startPreload(id, src, variant.bytes);

    let cancelled = false;
    /** Within a screen of the viewport (set by the observer below). */
    let near = false;
    /** Where the scroll is, as a fractional frame (the driver walks to it). */
    let want = 0;
    let paintedBy: "none" | "engine" | "video" = "none";

    // What draws the frames (scene-driver: the WebCodecs engine, or the video element) loads with the motion
    // library, after the page; it starts once the file is in, or once the visitor reaches the scene before
    // it is (streaming).
    let driver: SceneDriver | null = null;
    let starting = false;
    const startDrawing = async (stream: boolean) => {
      if (driver || starting || cancelled) return;
      starting = true;
      try {
        const { startDriver } = await loadMotionLib();
        if (cancelled) return;
        driver = startDriver(
          {
            id,
            src,
            variant,
            fps,
            canvas,
            video,
            ring: ringSize(shape),
            want: () => want,
            updateScene,
            preloadState,
            abandonPreload,
            near: () => near,
            cancelled: () => cancelled,
            paint: (by) => {
              if (paintedBy === by) return;
              paintedBy = by;
              setPainted(by);
            },
          },
          stream,
        );
        driver.nearChanged(near);
      } catch {
        // The code didn't load (offline): the poster stays, and the gate must not wait for this scene.
        updateScene(id, { mode: "poster", ready: true, reason: "driver did not load" });
      }
    };

    const onPreload = () => {
      if (preloadState(id)?.done) void startDrawing(false);
    };
    const unsubscribe = subscribePreload(onPreload);
    onPreload();

    // Streaming is the fallback for a visitor who reaches the section before its download is done (only
    // possible after "Continue without waiting"); the first section is on screen from the start, so for it
    // that only counts once the page has scrolled. Far from the screen, the decoder and its ring are freed.
    let scrolled = window.scrollY > 0;
    const maybeStream = () => {
      if (near && scrolled && !preloadState(id)?.done) void startDrawing(true);
    };
    const onScroll = () => {
      scrolled = true;
      maybeStream();
    };
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    const nearby = new IntersectionObserver(
      ([entry]) => {
        near = Boolean(entry?.isIntersecting);
        updateScene(id, { near }, true);
        driver?.nearChanged(near);
        maybeStream();
      },
      { rootMargin: "100% 0px" },
    );
    nearby.observe(section);
    const onVisible = () => {
      if (!document.hidden) driver?.moved();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Shares of the section's scroll distance (its height minus one screen): the lead on the first frame,
    // then the frames, then the hold on the last frame.
    const travel = leadVh + scrollVh + holdVh - 100;
    let vars = "";
    const framesStart = leadVh / travel;
    const framesEnd = holdVh > 0 ? (leadVh + scrollVh - 100) / travel : 1;
    progress.apply = (p: number) => {
      const frames = Math.min(1, Math.max(0, (p - framesStart) / (framesEnd - framesStart)));
      const hold = framesEnd < 1 ? Math.max(0, (p - framesEnd) / (1 - framesEnd)) : 0;
      // Only the overlays read these (the copy layer, and the frame overlay for marks that settle on the
      // footage), so only they restyle on scroll, and only when the values change.
      const next = `${frames.toFixed(4)} ${Math.min(1, hold).toFixed(4)}`;
      if (next !== vars) {
        vars = next;
        for (const el of overlaysRef.current) {
          el?.style.setProperty("--seq-progress", frames.toFixed(4));
          el?.style.setProperty("--seq-hold", Math.min(1, hold).toFixed(4));
        }
      }
      if (panFrom !== undefined && panTo !== undefined) {
        const x = panFrom + (panTo - panFrom) * frames;
        const position = `${x.toFixed(2)}% ${(focalY * 100).toFixed(2)}%`;
        video.style.objectPosition = position;
        canvas.style.objectPosition = position;
      }
      want = Math.min(frameCount - 1, Math.max(0, progressToPosition(frames, frameCount, timing)));
      driver?.moved();
    };
    progress.apply(progress.value);

    return () => {
      cancelled = true;
      progress.apply = () => {};
      driver?.close();
      driver = null;
      unsubscribe();
      nearby.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("scroll", onScroll);
    };
  }, [
    animated,
    manifest,
    manifestUrl,
    id,
    scrollVh,
    holdVh,
    leadVh,
    panFrom,
    panTo,
    fit,
    poster.width,
    poster.height,
  ]);

  // Scroll: the motion library (loaded after first paint) drives the progress, and the reveal of a section
  // that continues the previous one. Kept apart from the video so its late arrival never reloads the file.
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!animated || !section || !stage) return;

    // Overlapping sections: the stage stays invisible until its section reaches the top of the screen, where
    // it pins over the previous stage's identical last frame (see SequencePlayer).
    let reveals: Animation | null = null;
    if (overlapPrevious && typeof window.ViewTimeline === "function") {
      const hidden = { opacity: 0, visibility: "hidden" };
      reveals = stage.animate(
        [hidden, { ...hidden, offset: 0.999 }, { opacity: 1, visibility: "visible" }],
        {
          // Inset 0: by default the range is measured inside the page's scroll-padding (the 72 px kept clear
          // for the fixed header), which revealed the stage 72 px early, still sliding up, so the picture
          // jumped at the cut.
          timeline: new window.ViewTimeline({
            subject: section,
            inset: "0px",
          } as ViewTimelineOptions),
          rangeStart: "entry 0%",
          rangeEnd: "entry 100%",
          fill: "both",
        } as KeyframeAnimationOptions,
      );
    }

    let trigger: { kill(): void } | null = null;
    if (lib) {
      const reveal = (self: { scroll(): number; start: number }) => {
        if (overlapPrevious && !reveals)
          stage.style.visibility = self.scroll() < self.start ? "hidden" : "";
      };
      const progress = (p: number) => {
        progressRef.current.value = p;
        progressRef.current.apply(p);
      };
      const st = lib.ScrollTrigger.create({
        trigger: section,
        start: "top top",
        // The stage's own pinned travel, not "bottom bottom": on phones the screen grows and shrinks with
        // the browser bars, while the stage stays at the largest height.
        end: () => `+=${section.offsetHeight - stage.offsetHeight}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          reveal(self);
          progress(self.progress);
        },
        onToggle: reveal,
        onRefresh: reveal,
      });
      trigger = st;
      reveal(st);
      progress(st.progress);
    }

    return () => {
      reveals?.cancel();
      stage.style.visibility = "";
      trigger?.kill();
    };
  }, [animated, lib, overlapPrevious]);

  const style = {
    "--scroll-vh": leadVh + scrollVh + holdVh,
    ...(staticLayout ? { "--seq-progress": 1 } : {}),
  } as CSSProperties;
  const focal = manifest?.focal ?? { x: 0.5, y: 0.5 };

  return (
    <section
      ref={sectionRef}
      data-s={id}
      data-animated={animated ? "true" : "false"}
      style={style}
      className={[
        "relative",
        staticLayout
          ? "h-auto"
          : "h-[calc(var(--scroll-vh)*1lvh)] motion-reduce:h-auto motion-reduce:[--seq-progress:1]",
        overlapPrevious && !staticLayout
          ? "pointer-events-none -mt-[100lvh] motion-reduce:pointer-events-auto motion-reduce:mt-0"
          : "",
        className ?? "",
      ].join(" ")}
    >
      <div
        ref={stageRef}
        className={[
          "[container-type:size] pointer-events-auto",
          staticLayout
            ? // Still: the poster fills a screen-tall stage, so the copy layered on it always has room.
              "relative min-h-svh w-full overflow-hidden"
            : "sticky top-0 h-lvh w-full overflow-hidden motion-reduce:relative motion-reduce:h-auto motion-reduce:min-h-svh",
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
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
          />
        </picture>
        {animated ? (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
            style={{
              opacity: painted === "engine" ? 1 : 0,
              objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
            }}
          />
        ) : null}
        {animated ? (
          <video
            ref={videoRef}
            aria-hidden="true"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
            style={{
              opacity: painted === "video" ? 1 : 0,
              objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
            }}
          />
        ) : null}
        {frameOverlay ? (
          <div
            ref={(el) => {
              overlaysRef.current[0] = el;
            }}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 aspect-(--poster-ratio) -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${fit === "cover" ? "max" : "min"}(100cqw, 100cqh * ${poster.width} / ${poster.height})`,
            }}
          >
            {frameOverlay}
          </div>
        ) : null}
        {children ? (
          <div
            ref={(el) => {
              overlaysRef.current[1] = el;
            }}
            className="absolute inset-0"
          >
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
