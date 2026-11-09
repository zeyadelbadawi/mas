import type { SequencePoster } from "./client/sequence-player";

/**
 * Where a sequence's frames live. With NEXT_PUBLIC_MEDIA_URL set (Cloudflare R2, D25) the full-size
 * finals load from there; without it, the 960×540 review previews committed under public/sequences/drafts.
 * A re-rendered sequence gets a new `rev`, uploaded as `<id>.r<rev>`: frames keep their file names and are
 * cached for a week, so new footage needs a new path.
 */
export function sequenceSource(
  id: string,
  { rev }: { rev?: number } = {},
): { manifestUrl: string; poster: SequencePoster } {
  const media = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, "");
  const base = media
    ? `${media}/sequences/${rev ? `${id}.r${rev}` : id}`
    : `/sequences/drafts/${id}`;
  const size = media ? { width: 1920, height: 1080 } : { width: 960, height: 540 };
  return {
    manifestUrl: `${base}/manifest.json`,
    poster: { avif: `${base}/poster.avif`, webp: `${base}/poster.webp`, ...size },
  };
}

/**
 * The folder a scroll video's files live in on the media host (D76): a hash of its id and revision, so neither
 * the URLs nor the page name the scenes. Stable, so `tools/sequences/publish-opaque.mjs` writes the same name.
 */
export function sceneKey(id: string, rev?: number): string {
  const text = `mas:${rev ? `${id}.r${rev}` : id}`;
  // Two 32-bit FNV-1a passes with different offsets: 16 hex characters.
  const fnv = (seed: number) => {
    let h = seed >>> 0;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  };
  return fnv(0x811c9dc5) + fnv(0x01234567);
}

/** File names inside an opaque scene folder (D76): the manifest, the two videos and the two posters. */
export const SCENE_FILES = {
  manifest: "i",
  desktop: "d",
  mobile: "m",
  avif: "a",
  webp: "w",
} as const;

/**
 * Where a scroll video lives (D43). With NEXT_PUBLIC_MEDIA_URL set (R2): under `v/<sceneKey>/` with one-letter
 * file names, and the scene's id is that key too, so nothing on the page names the scene (D76). Without it:
 * the small previews committed under public/videos/drafts, with their readable names. A re-encoded video gets
 * a new `rev`, since files are cached for good under their names.
 */
export function videoSource(
  id: string,
  { rev }: { rev?: number } = {},
): { id: string; manifestUrl: string; poster: SequencePoster } {
  const media = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, "");
  if (media) {
    const key = sceneKey(id, rev);
    const base = `${media}/v/${key}`;
    return {
      id: key,
      manifestUrl: `${base}/${SCENE_FILES.manifest}`,
      poster: {
        avif: `${base}/${SCENE_FILES.avif}`,
        webp: `${base}/${SCENE_FILES.webp}`,
        width: 1920,
        height: 1080,
      },
    };
  }
  const base = `/videos/drafts/${id}`;
  return {
    id,
    manifestUrl: `${base}/manifest.json`,
    poster: { avif: `${base}/poster.avif`, webp: `${base}/poster.webp`, width: 960, height: 540 },
  };
}
