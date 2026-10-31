/** Shape of `manifest.json` produced by tools/sequences/build-sequence.mjs. */
export type SequenceVariantName = "desktop" | "desktop-xl" | "mobile";

export type SequenceVariant = {
  name: SequenceVariantName;
  width: number;
  height: number;
  /** 1 = every source frame, 2 = every second frame (mobile). */
  step: number;
  /** Number of frames in this variant. */
  frameCount: number;
  /** Path template relative to the manifest, e.g. "desktop/avif/{index}.avif" with zero-padded 4-digit index. */
  avif: string;
  webp: string;
  /**
   * Each frame's place along the camera move (0..1, rising), when frames were picked by image change rather
   * than evenly in time. The player scrubs along it so the move keeps an even speed per scroll.
   */
  timing?: number[];
};

export type SequenceManifest = {
  id: string;
  /** Frames in the source (desktop) timeline. */
  frameCount: number;
  fps: number;
  focal: { x: number; y: number };
  poster: { avif: string; webp: string; width: number; height: number };
  variants: SequenceVariant[];
};

export function frameUrl(manifestUrl: string, template: string, index: number): string {
  const base = manifestUrl.slice(0, manifestUrl.lastIndexOf("/") + 1);
  return base + template.replace("{index}", String(index).padStart(4, "0"));
}

/** Shape of `manifest.json` produced by tools/sequences/build-video.mjs. */
export type VideoManifest = {
  id: string;
  kind: "video";
  fps: number;
  /** Frames in the video; frame i is shown at i / fps. */
  frameCount: number;
  focal: { x: number; y: number };
  poster: { avif: string; webp: string; width: number; height: number };
  variants: {
    name: "desktop" | "mobile";
    width: number;
    height: number;
    src: string;
    bytes: number;
  }[];
  /** Each frame's place along the move (0..1, rising): the player scrubs along it. */
  timing: number[];
};

/** URL of a file next to the manifest. */
export function siblingUrl(manifestUrl: string, file: string): string {
  return manifestUrl.slice(0, manifestUrl.lastIndexOf("/") + 1) + file;
}

/** Screens narrower than this (width / height) get the 4:5 portrait video; all others the 16:9 one. */
export const PORTRAIT_BELOW = 0.9;

/** Which video variant a screen of this size plays. Also read by the COVY splash, before first paint. */
export function videoVariantFor(width: number, height: number): "mobile" | "desktop" {
  return width / height < PORTRAIT_BELOW ? "mobile" : "desktop";
}
