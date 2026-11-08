import type { gsap as GsapCore } from "gsap";
import type { ScrollTrigger as ScrollTriggerClass } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextClass } from "gsap/SplitText";
import type LenisClass from "lenis";
import type { startDriver } from "./scene-driver";

export type MotionLib = {
  gsap: typeof GsapCore;
  ScrollTrigger: typeof ScrollTriggerClass;
  SplitText: typeof SplitTextClass;
  Lenis: typeof LenisClass;
  /** What draws the scroll scenes' frames once their files are in (scene-driver, D62). */
  startDriver: typeof startDriver;
};

let pending: Promise<MotionLib> | undefined;

/**
 * GSAP, ScrollTrigger, SplitText and Lenis in their own chunk (~52 KB gzipped), fetched once and
 * shared, with the scroll scenes' frame drivers (D62). Kept off the first-paint path so every route stays
 * inside the 180 KB JS budget (D29).
 */
export function loadMotionLib(): Promise<MotionLib> {
  pending ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
    import("lenis"),
    import("./scene-driver"),
  ]).then(([core, st, split, lenis, driver]) => {
    core.gsap.registerPlugin(st.ScrollTrigger, split.SplitText);
    return {
      gsap: core.gsap,
      ScrollTrigger: st.ScrollTrigger,
      SplitText: split.SplitText,
      Lenis: lenis.default,
      startDriver: driver.startDriver,
    };
  });
  return pending;
}
