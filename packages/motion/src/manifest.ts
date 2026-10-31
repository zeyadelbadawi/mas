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

/**
 * Where each frame of a video variant sits in its MP4, for decoding with WebCodecs (D62; written by
 * tools/sequences/sample-index.mjs). Frame i is sample i: there are no B-frames.
 */
export type VideoDecodeIndex = {
  /** WebCodecs codec string, e.g. "avc1.640032". */
  codec: string;
  /** The avcC decoder configuration record, base64. */
  description: string;
  /** Frames that are keyframes, rising, starting at 0. */
  keys: number[];
  /** Each frame's byte offset and size in the file. */
  samples: [number, number][];
};

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
    /** Present from revision 3: the player decodes frames itself instead of seeking the video. */
    decode?: VideoDecodeIndex;
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
