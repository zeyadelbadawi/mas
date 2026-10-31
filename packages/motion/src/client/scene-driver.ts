import type { VideoManifest } from "../manifest";
import { FrameEngine } from "./frame-engine";
import type { updateScene as UpdateScene } from "./scene-status";
import type {
  abandonPreload as AbandonPreload,
  preloadState as PreloadState,
} from "./video-preload";

// The `?debug=scrub` meter rides in this module, which loads only after the page anyway.
export { mountScrubMeter } from "./scrub-meter";

/**
 * What draws a scroll scene's frames once its file is in (D62), loaded only then so none of it weighs on the
 * page's first load (D29): the WebCodecs frame engine into the canvas where the browser can decode the file,
 * the video element otherwise (Firefox for Android, Safari before 16.4, a decoder that fails or is too slow),
 * and the video element streaming the file for a visitor who got to the scene before its download finished.
 * ScrollVideo keeps the scroll and the walk; it only asks the driver for frames.
 */

/** The engine must draw its first frame within this long, or the scene uses the video element. */
const WARM_TIMEOUT_MS = 6000;

export type DriverHost = {
  id: string;
  /** The scene's file: its URL (to stream) and the variant played. */
  src: string;
  variant: VideoManifest["variants"][number];
  fps: number;
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  /** Frames the engine keeps around the scroll position. */
  ring: number;
  /** Where the scroll is now, as a fractional frame. */
  want: () => number;
  /**
   * Passed in rather than imported, so this module (loaded later, with the motion library) shares no code
   * with the page's first bundle and the bundler keeps that bundle as it was (D29).
   */
  updateScene: typeof UpdateScene;
  preloadState: typeof PreloadState;
  abandonPreload: typeof AbandonPreload;
  near: () => boolean;
  cancelled: () => boolean;
  /** Which element shows the frames (the other one, and the poster, are hidden). */
  paint: (by: "engine" | "video") => void;
};

export type SceneDriver = {
  /** The scroll moved: walk toward the new position. */
  moved: () => void;
  /** The scene came near the screen (draw again) or went far (free the decoder and its frames). */
  nearChanged: (near: boolean) => void;
  close: () => void;
};

/** How long the walk takes to close most of the gap to the scroll position (ms, exponential). */
const WALK_MS = 55;
/** Closer than this (frames) and the walk lands on the scroll position. */
const WALK_SNAP = 0.35;

export function startDriver(host: DriverHost, stream: boolean): SceneDriver {
  const { id, video, fps, updateScene, preloadState, abandonPreload } = host;
  let mode: "pending" | "engine" | "video" = "pending";
  let engine: FrameEngine | null = null;
  let warm = false;
  let ready = false;
  let closed = false;
  const dead = () => closed || host.cancelled();

  // The walk. The scroll position is a fractional frame; the walk follows it with a short ease and the frame
  // drawn is the walk rounded. A fast flick then runs through the frames like footage played fast instead of
  // skipping, and settles on the exact frame for the scroll position a moment after it stops. It starts on
  // the position as it is (a reload lands straight on its frame, no walk from frame 0).
  let walk = host.want();
  let raf = 0;
  let lastT = 0;
  let lastShown = -1;
  let presentedCount = 0;
  let maxStep = 0;
  const frame = () => Math.round(walk);
  const presented = (f: number) => {
    if (lastShown >= 0) maxStep = Math.max(maxStep, Math.abs(f - lastShown));
    lastShown = f;
    presentedCount++;
    updateScene(id, { shown: f, presented: presentedCount, maxStep }, true);
  };
  const markReady = () => {
    if (ready || dead()) return;
    ready = true;
    updateScene(id, { ready: true });
  };
  const render = () => {
    updateScene(id, { want: host.want(), walk }, true);
    const f = frame();
    // Far from the screen, only the first frame is wanted (to be ready); then nothing until it is near.
    if (mode === "engine" && (host.near() || !warm)) engine?.show(f);
    else if (mode === "video") seek(f);
  };
  const step = (now: number) => {
    raf = 0;
    const dt = Math.min(64, Math.max(0, now - lastT));
    lastT = now;
    const want = host.want();
    const gap = want - walk;
    walk = Math.abs(gap) < WALK_SNAP ? want : walk + gap * (1 - Math.exp(-dt / WALK_MS));
    render();
    if (walk !== want) raf = requestAnimationFrame(step);
  };

  // The video element: one seek in flight, the next one once the frame is on screen.
  let loaded = false;
  let shown = -1;
  let pending = -1;
  let guard = 0;
  let settle = 0;
  const hasFrameCallback = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
  const onFrame = () => {
    window.clearTimeout(guard);
    window.clearTimeout(settle);
    if (pending < 0) return;
    shown = pending;
    pending = -1;
    host.paint("video");
    presented(shown);
    markReady();
    seek(frame());
  };
  const seek = (target: number) => {
    if (mode !== "video" || !loaded || pending !== -1 || target === shown || dead()) return;
    pending = target;
    // Safari can report a seek done before its frame is painted: wait for the frame itself where the browser
    // can say so (requestVideoFrameCallback), with 'seeked' as the backstop.
    if (hasFrameCallback) video.requestVideoFrameCallback(onFrame);
    // Mid-frame, so rounding never lands on the neighbour.
    video.currentTime = (target + 0.5) / fps;
    // A seek that never reports back must not block the next one.
    window.clearTimeout(guard);
    guard = window.setTimeout(() => {
      pending = -1;
      seek(frame());
    }, 700);
  };
  const onSeeked = () => {
    if (!hasFrameCallback) onFrame();
    else {
      window.clearTimeout(settle);
      settle = window.setTimeout(onFrame, 120);
    }
  };
  const onLoaded = () => {
    loaded = true;
    seek(frame());
  };
  // iOS Safari only paints seeks after the video has played once: play and pause on the first touch after
  // the file is attached (retried on the next touch if it fails). The canvas needs none of this.
  const unlock = () => {
    video
      .play()
      .then(() => {
        video.pause();
        shown = -1;
        seek(frame());
      })
      .catch(() => window.addEventListener("touchstart", unlock, { once: true, passive: true }));
  };
  const playVideo = (reason: string, streaming = false) => {
    if (dead() || mode === "video") return;
    engine?.close();
    engine = null;
    mode = "video";
    updateScene(id, { mode: "video", reason });
    const s = preloadState(id);
    if (streaming && !s?.done) abandonPreload(id);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadeddata", onLoaded);
    video.src = s?.url ?? host.src;
    video.load();
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  };

  const playEngine = async () => {
    const s = preloadState(id);
    const index = host.variant.decode;
    if (!s?.blob || s.error) return playVideo("download failed", true);
    if (!index) return playVideo("no frame index");
    if (!(await FrameEngine.supports(index, host.variant.width, host.variant.height)))
      return playVideo("no WebCodecs H.264 decoder");
    if (dead()) return;
    try {
      const data = new Uint8Array(await s.blob.arrayBuffer());
      if (dead()) return;
      const { width, height } = host.variant;
      const e = new FrameEngine(data, index, width, height, host.canvas, host.ring);
      engine = e;
      mode = "engine";
      updateScene(id, { mode: "engine", engine: e.stats });
      e.onDraw = (f) => {
        host.paint("engine");
        presented(f);
      };
      e.onFail = () => {
        if (engine === e) playVideo("decoder failed");
      };
      e.show(frame());
      // Ready when the frame for the current scroll position is drawn.
      const started = performance.now();
      await new Promise<void>((resolve, reject) => {
        const check = () => {
          if (dead() || engine !== e) reject(new Error("replaced"));
          else if (e.shown === frame()) resolve();
          else if (performance.now() - started > WARM_TIMEOUT_MS) reject(new Error("too slow"));
          else requestAnimationFrame(check);
        };
        check();
      });
      warm = true;
      markReady();
      // A scene far from the screen keeps only its picture until the visitor comes near.
      if (!host.near()) e.release();
    } catch (err) {
      if (dead() || mode !== "engine") return;
      playVideo(`decoder ${err instanceof Error ? err.message : "failed"}`);
    }
  };

  if (stream) playVideo("streaming", true);
  else void playEngine();

  return {
    moved: () => {
      if (raf) return;
      lastT = performance.now();
      raf = requestAnimationFrame(step);
    },
    nearChanged: (near) => {
      if (near) render();
      else engine?.release();
    },
    close: () => {
      closed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(guard);
      window.clearTimeout(settle);
      engine?.close();
      engine = null;
      window.removeEventListener("touchstart", unlock);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadeddata", onLoaded);
    },
  };
}
