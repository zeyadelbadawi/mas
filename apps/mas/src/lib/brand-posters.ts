import { videoSource } from "@mas/motion";

/**
 * The picture each brand shows through its door, from the brand's own scenes (D64): COVY's dining room with
 * the blue tree and the caladium mural, Aroma's lake at sunset. Posters of the scenes on the media host.
 */
export const BRAND_POSTERS = {
  covy: videoSource("covy.connector", { rev: 3 }).poster,
  aroma: videoSource("aroma.night", { rev: 3 }).poster,
} as const;
