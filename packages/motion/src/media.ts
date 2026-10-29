import type { SequencePoster } from "./client/sequence-player";

/**
 * Where a sequence's frames live. With NEXT_PUBLIC_MEDIA_URL set (Cloudflare R2, D25) the full-size
 * finals load from there; without it, the 960×540 review previews committed under public/sequences/drafts.
 */
export function sequenceSource(id: string): { manifestUrl: string; poster: SequencePoster } {
  const media = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, "");
  const base = media ? `${media}/sequences/${id}` : `/sequences/drafts/${id}`;
  const size = media ? { width: 1920, height: 1080 } : { width: 960, height: 540 };
  return {
    manifestUrl: `${base}/manifest.json`,
    poster: { avif: `${base}/poster.avif`, webp: `${base}/poster.webp`, ...size },
  };
}
