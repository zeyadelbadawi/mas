"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { progressToPosition } from "../frame-math";
import { siblingUrl, type VideoManifest } from "../manifest";
import { useMotion } from "./motion-provider";
import type { SequencePlayerProps } from "./sequence-player";
import {
  abandonPreload,
  preloadState,
  reservePreload,
  startPreload,
  subscribePreload,
} from "./video-preload";

export type ScrollVideoProps = SequencePlayerProps & {
  /**
   * Scroll (viewport heights) at the start that stays on the first frame. For a scene that continues the
   * previous one: scrolling back up, the video has time to land on its first frame (the previous scene's
   * last) before the cut, instead of still trailing a few frames behind on a fast scroll.
   */
  leadVh?: number;
};

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
  leadVh = 0,
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

  // The video: which file, when to attach it, and seeking it to the frame the scroll asks for.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!animated || !manifest || !section || !video) return;

    // By the screen's shape: the 4:5 crop for portrait screens, the 16:9 frames otherwise.
    const portrait = window.innerWidth / window.innerHeight < 0.9;
    const variant =
      manifest.variants.find((v) => v.name === (portrait ? "mobile" : "desktop")) ??
      manifest.variants[0];
    if (!variant) {
      abandonPreload(id);
      return;
    }
    const src = siblingUrl(manifestUrl, variant.src);
    const { fps, frameCount, timing } = manifest;
    const progress = progressRef.current;
    startPreload(id, src, variant.bytes);

    let cancelled = false;
    let loaded = false;
    /** Frame the scroll asks for, frame on screen, frame being sought (-1: none). */
    let want = 0;
    let shown = -1;
    let pending = -1;
    let guard = 0;
    let vars = "";

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

    // iOS Safari only paints seeks after the video has played once: play and pause on the first touch
    // after the file is attached (retried on the next touch if it fails).
    const unlock = () => {
      video
        .play()
        .then(() => {
          video.pause();
          shown = -1;
          apply();
        })
        .catch(() => window.addEventListener("touchstart", unlock, { once: true, passive: true }));
    };

    // Play from the downloaded copy once complete. If the visitor gets near the section first, stream the
    // file instead (seeking as its parts arrive) rather than hold a frozen poster, and stop the download.
    let attached = false;
    const attach = (stream = false) => {
      if (attached || cancelled) return;
      const s = preloadState(id);
      if (!stream && !s?.done) return;
      attached = true;
      if (stream && !s?.done) abandonPreload(id);
      video.src = s?.url ?? src;
      video.load();
      window.addEventListener("touchstart", unlock, { once: true, passive: true });
    };
    const unsubscribe = subscribePreload(() => attach());
    attach();
    // Streaming is the fallback for a visitor who scrolls to the section before its download is done; the
    // first section is on screen from the start, so for it that only counts once the page has scrolled.
    let near = false;
    let scrolled = window.scrollY > 0;
    const maybeStream = () => {
      if (near && scrolled) attach(true);
    };
    const onScroll = () => {
      scrolled = true;
      maybeStream();
    };
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    const nearby = new IntersectionObserver(
      ([entry]) => {
        near = Boolean(entry?.isIntersecting);
        maybeStream();
      },
      { rootMargin: "50% 0px" },
    );
    nearby.observe(section);

    // Shares of the section's scroll distance (its height minus one screen): the lead on the first frame,
    // then the frames, then the hold on the last frame.
    const travel = leadVh + scrollVh + holdVh - 100;
    const framesStart = leadVh / travel;
    const framesEnd = holdVh > 0 ? (leadVh + scrollVh - 100) / travel : 1;
    progress.apply = (p: number) => {
      const frames = Math.min(1, Math.max(0, (p - framesStart) / (framesEnd - framesStart)));
      const hold = framesEnd < 1 ? Math.max(0, (p - framesEnd) / (1 - framesEnd)) : 0;
      // Only the copy layer reads these, so only it restyles on scroll, and only when they change.
      const next = `${frames.toFixed(4)} ${Math.min(1, hold).toFixed(4)}`;
      const el = overlaysRef.current[1];
      if (el && next !== vars) {
        vars = next;
        el.style.setProperty("--seq-progress", frames.toFixed(4));
        el.style.setProperty("--seq-hold", Math.min(1, hold).toFixed(4));
      }
      want = Math.min(
        frameCount - 1,
        Math.max(0, Math.round(progressToPosition(frames, frameCount, timing))),
      );
      apply();
    };
    progress.apply(progress.value);

    return () => {
      cancelled = true;
      progress.apply = () => {};
      window.clearTimeout(guard);
      unsubscribe();
      nearby.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", unlock);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadeddata", onLoaded);
    };
  }, [animated, manifest, manifestUrl, id, scrollVh, holdVh, leadVh]);

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
      data-sequence-id={id}
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
            ? "relative aspect-(--poster-ratio) w-full overflow-hidden"
            : "sticky top-0 h-lvh w-full overflow-hidden motion-reduce:relative motion-reduce:aspect-(--poster-ratio) motion-reduce:h-auto",
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
            className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
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
