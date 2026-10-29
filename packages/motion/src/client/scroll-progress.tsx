"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMotionEffect } from "./motion-provider";

type Options = {
  /** ScrollTrigger start/end, e.g. "top top" / "bottom bottom" for a pinned stage. */
  start?: string;
  end?: string;
  /** Called on every update; keep it cheap (it runs on scroll). */
  onUpdate?: (progress: number) => void;
};

/**
 * Scroll progress (0..1) of `target` through the viewport, written to a ref so per-frame consumers
 * (canvas, WebGL) read it without re-rendering React. Reversible: it follows the scroll position only.
 * Starts once the motion library has loaded; until then progress stays 0.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  options: Options = {},
): RefObject<number> {
  const progressRef = useRef(0);
  const { start = "top bottom", end = "bottom top", onUpdate } = options;
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useMotionEffect(
    ({ ScrollTrigger }) => {
      if (!target.current) return;
      ScrollTrigger.create({
        trigger: target.current,
        start,
        end,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          onUpdateRef.current?.(self.progress);
        },
      });
    },
    [target, start, end],
    { when: "any" },
  );

  return progressRef;
}
