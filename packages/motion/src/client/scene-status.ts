import type { FrameEngineStats } from "./frame-engine";

/**
 * Where each scroll scene stands, for the splash gate (it opens only when every scene is ready), the
 * `?debug=scrub` meter and the end-to-end tests (`window.__masScenes`).
 *
 * - `engine`: frames decoded with WebCodecs into a canvas (D62).
 * - `video`: the fallback, seeking the video element.
 * - `poster`: no video could be had (no manifest, a failed download); the poster stays, nothing to wait for.
 */
export type SceneMode = "pending" | "engine" | "video" | "poster";

export type SceneStatus = {
  mode: SceneMode;
  /** The frame for the current scroll position is on screen (or there is nothing to show but the poster). */
  ready: boolean;
  /** ms from navigation start to ready. */
  readyAt?: number;
  /** Why the scene uses the fallback, if it does. */
  reason?: string;
  /** Frame asked for by the scroll, frame walked to (eased), frame on screen. */
  want: number;
  walk: number;
  shown: number;
  /** Frames on screen so far, and the largest step between two consecutive ones. */
  presented: number;
  maxStep: number;
  engine?: FrameEngineStats;
};

/** Live: the same objects are updated in place, so readers (tests, the meter) always see the latest. */
const scenes: Record<string, SceneStatus> = {};
const listeners = new Set<() => void>();

declare global {
  interface Window {
    __masScenes?: Record<string, SceneStatus>;
  }
}

export function sceneStatus(id: string): SceneStatus | undefined {
  return scenes[id];
}

/** Merge changes into a scene's status. Progress counters change every frame: pass `quiet` for those. */
export function updateScene(id: string, patch: Partial<SceneStatus>, quiet = false): void {
  let s = scenes[id];
  if (!s) {
    s = { mode: "pending", ready: false, want: 0, walk: 0, shown: -1, presented: 0, maxStep: 0 };
    scenes[id] = s;
    if (typeof window !== "undefined") window.__masScenes = scenes;
  }
  if (patch.ready && !s.ready) s.readyAt = Math.round(performance.now());
  Object.assign(s, patch);
  if (!quiet) listeners.forEach((fn) => fn());
}

export function subscribeScenes(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Every one of these scenes has its frame on screen (in its own canvas or video, off screen or not). */
export function scenesReady(ids: readonly string[]): boolean {
  return ids.length > 0 && ids.every((id) => scenes[id]?.ready);
}
