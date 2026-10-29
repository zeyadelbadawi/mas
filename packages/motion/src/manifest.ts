/** Shape of `manifest.json` produced by tools/sequences/build-sequence.mjs. */
export type SequenceVariantName = "desktop" | "mobile";

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
