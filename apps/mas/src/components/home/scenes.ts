import { videoSource } from "@mas/motion";

/**
 * The home page's two scenes (D64). Revision folders on R2 are cached for good by name, so a new cut gets a
 * new revision: the doors scene's revision 2 is the walk into the antechamber (the camera moves, the doors
 * stay put).
 */
export const SCENES = {
  hero: videoSource("mas.hero", { rev: 1 }),
  doors: videoSource("mas.doors", { rev: 2 }),
} as const;
