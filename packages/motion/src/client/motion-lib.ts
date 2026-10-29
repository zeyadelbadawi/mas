import type { gsap as GsapCore } from "gsap";
import type { ScrollTrigger as ScrollTriggerClass } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextClass } from "gsap/SplitText";
import type LenisClass from "lenis";

export type MotionLib = {
  gsap: typeof GsapCore;
  ScrollTrigger: typeof ScrollTriggerClass;
  SplitText: typeof SplitTextClass;
  Lenis: typeof LenisClass;
};

let pending: Promise<MotionLib> | undefined;

/**
 * GSAP, ScrollTrigger, SplitText and Lenis in their own chunk (~52 KB gzipped), fetched once and
 * shared. Kept off the first-paint path so every route stays inside the 180 KB JS budget (D29).
 */
export function loadMotionLib(): Promise<MotionLib> {
  pending ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
    import("lenis"),
  ]).then(([core, st, split, lenis]) => {
    core.gsap.registerPlugin(st.ScrollTrigger, split.SplitText);
    return {
      gsap: core.gsap,
      ScrollTrigger: st.ScrollTrigger,
      SplitText: split.SplitText,
      Lenis: lenis.default,
    };
  });
  return pending;
}
