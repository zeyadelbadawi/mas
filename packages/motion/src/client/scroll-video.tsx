"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { progressToPosition } from "../frame-math";
import { siblingUrl, type VideoManifest } from "../manifest";
import { useMotion } from "./motion-provider";
import type { SequencePlayerProps } from "./sequence-player";
import { preloadState, reservePreload, startPreload, subscribePreload } from "./video-preload";

export type ScrollVideoProps = SequencePlayerProps;

/**
 * Scroll-scrubbed video on a sticky stage (D43). The video is downloaded whole first (in page order, see
 * video-preload), then the scroll position seeks it frame by frame; the browser decodes those seeks in
 * hardware. Seeks never queue up: while one is in flight only the latest wanted frame is kept, and it is
 * applied as soon as the previous one lands. Frame i of the video is frame i of the move, so a section that
 * continues the previous one (`overlapPrevious`) starts on exactly the frame the previous one ended on.
 * Same props and layout as SequencePlayer; reduced motion and the LOW tier get the poster in normal flow.
 */
export function ScrollVideo({
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
}: ScrollVideoProps) {
  const { tier, lib } = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  const [manifest, setManifest] = useState<VideoManifest | null>(null);
  const [painted, setPainted] = useState(false);
  const animated = tier === "HIGH" || tier === "MID";
  /** Before hydration (tier null) keep the scroll layout so the page doesn't jump once JS runs. */
  const staticLayout = tier === "LOW" || tier === "STATIC";

  // The manifest and the download start as soon as the tier is known, before the motion library arrives,
  // and keep their place in page order.
  useEffect(() => {
    if (!animated) return;
    reservePreload(id, priority);
    let cancelled = false;
    void (async () => {
      const res = await fetch(manifestUrl);
      if (!res.ok || cancelled) return;
      setManifest((await res.json()) as VideoManifest);
    })();
    return () => {
      cancelled = true;
    };
  }, [animated, id, manifestUrl, priority]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!animated || !manifest || !section || !stage || !video) return;

    const portrait = window.innerWidth / window.innerHeight < 0.9;
    const variant =
      manifest.variants.find(
        (v) => v.name === (tier === "MID" || portrait ? "mobile" : "desktop"),
      ) ?? manifest.variants[0];
    if (!variant) return;
    const src = siblingUrl(manifestUrl, variant.src);
    const { fps, frameCount, timing } = manifest;
    startPreload(id, src, variant.bytes);

    let cancelled = false;
    let loaded = false;
    /** Frame the scroll asks for, frame on screen, frame being sought (-1: none). */
    let want = 0;
    let shown = -1;
    let pending = -1;
    let guard = 0;

    const apply = () => {
      if (!loaded || pending !== -1 || want === shown) return;
      pending = want;
      // Mid-frame, so rounding never lands on the neighbour.
      video.currentTime = (want + 0.5) / fps;
      // A seek that never reports back must not block the next one.
      window.clearTimeout(guard);
      guard = window.setTimeout(() => {
        pending = -1;
        apply();
      }, 700);
    };
    const onSeeked = () => {
      window.clearTimeout(guard);
      shown = pending;
      pending = -1;
      setPainted(true);
      apply();
    };
    const onLoaded = () => {
      loaded = true;
      apply();
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadeddata", onLoaded);

    // Play from the downloaded copy once it is complete (or stream the file if the download failed).
    let attached = false;
    const attach = () => {
      const s = preloadState(id);
      if (attached || cancelled || !s?.done) return;
      attached = true;
      video.src = s.url ?? src;
      video.load();
    };
    const unsubscribe = subscribePreload(attach);
    attach();

    // iOS Safari only paints seeks after the video has played once: play and pause on the first touch.
    const unlock = () => {
      void video
        .play()
        .then(() => {
          video.pause();
          shown = -1;
          apply();
        })
        .catch(() => {});
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    // Share of the section's scroll distance (its height minus one screen) that scrubs the frames.
    const framesEnd = holdVh > 0 ? (scrollVh - 100) / (scrollVh + holdVh - 100) : 1;
    const onProgress = (progress: number) => {
      const frames = Math.min(1, progress / framesEnd);
      const hold = framesEnd < 1 ? Math.max(0, (progress - framesEnd) / (1 - framesEnd)) : 0;
      // Only the overlay layers read these, so only they restyle on scroll, not the whole section.
      for (const el of overlaysRef.current) {
        el?.style.setProperty("--seq-progress", frames.toFixed(4));
        el?.style.setProperty("--seq-hold", Math.min(1, hold).toFixed(4));
      }
      want = Math.min(
        frameCount - 1,
        Math.max(0, Math.round(progressToPosition(frames, frameCount, timing))),
      );
      apply();
    };

    // Overlapping sections: the stage stays invisible until its section reaches the top of the screen, where
    // it pins over the previous stage's identical last frame (see SequencePlayer).
    let reveals: Animation | null = null;
    if (overlapPrevious && typeof window.ViewTimeline === "function") {
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

    let trigger: { kill(): void } | null = null;
    if (lib) {
      const reveal = (self: { scroll(): number; start: number }) => {
        if (overlapPrevious && !reveals)
          stage.style.visibility = self.scroll() < self.start ? "hidden" : "";
      };
      const st = lib.ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          reveal(self);
          onProgress(self.progress);
        },
        onToggle: reveal,
        onRefresh: reveal,
      });
      trigger = st;
      reveal(st);
      onProgress(st.progress);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(guard);
      unsubscribe();
      window.removeEventListener("touchstart", unlock);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadeddata", onLoaded);
      reveals?.cancel();
      stage.style.visibility = "";
      trigger?.kill();
    };
  }, [animated, lib, manifest, manifestUrl, id, tier, scrollVh, holdVh, overlapPrevious]);

  const style = {
    "--scroll-vh": scrollVh + holdVh,
    ...(staticLayout ? { "--seq-progress": 1 } : {}),
  } as CSSProperties;
  const focal = manifest?.focal ?? { x: 0.5, y: 0.5 };

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
        overlapPrevious && !staticLayout
          ? "pointer-events-none -mt-[100svh] motion-reduce:pointer-events-auto motion-reduce:mt-0"
          : "",
        className ?? "",
      ].join(" ")}
    >
      <div
        ref={stageRef}
        className={[
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
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
          />
        </picture>
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
            className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${fit === "cover" ? "object-cover" : "object-contain"}`}
            style={{
              opacity: painted ? 1 : 0,
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
