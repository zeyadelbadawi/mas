import { videoSource } from "@mas/motion";

/**
 * The three scenes' videos. Revision 3 (D62) is the same files as before with a frame index in the manifest,
 * for decoding with WebCodecs; a new revision gets a new folder on R2 because its files are cached for good
 * by name.
 */
export const SCENES = {
  hero: videoSource("covy.hero", { rev: 3 }),
  connector: videoSource("covy.connector", { rev: 3 }),
  signature: videoSource("covy.signature", { rev: 3 }),
} as const;
