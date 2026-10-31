import { videoSource } from "@mas/motion";

/**
 * The three scenes' videos. Revision 2 (D55) is the desktop cut re-encoded at CRF 28 (25 MB → 16 MB, no
 * visible change); a new revision gets a new folder on R2 because files are cached for a week by name.
 */
export const SCENES = {
  morning: videoSource("aroma.morning", { rev: 2 }),
  lake: videoSource("aroma.lake", { rev: 2 }),
  night: videoSource("aroma.night", { rev: 2 }),
} as const;
