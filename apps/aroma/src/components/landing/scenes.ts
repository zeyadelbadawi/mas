import { videoSource } from "@mas/motion";

/**
 * The three scenes' videos. Revision 2 (D55) is the desktop cut re-encoded at CRF 28 (25 MB → 16 MB, no
 * visible change); revision 3 (D62) is the same files with a frame index in the manifest, for decoding with
 * WebCodecs. A new revision gets a new folder on R2 because its files are cached for good by name.
 */
export const SCENES = {
  morning: videoSource("aroma.morning", { rev: 3 }),
  lake: videoSource("aroma.lake", { rev: 3 }),
  night: videoSource("aroma.night", { rev: 3 }),
} as const;
