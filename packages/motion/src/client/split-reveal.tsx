"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useMotionEffect } from "./motion-provider";

type SplitRevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Seconds between words. */
  stagger?: number;
};

/**
 * Word-by-word heading reveal on scroll. The heading stays fully visible without JS, before the motion
 * library loads, on LOW and under reduced motion. SplitText's aria option keeps one readable label.
 */
export function SplitReveal({
  as: Tag = "h2",
  children,
  className,
  stagger = 0.06,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useMotionEffect(
    ({ gsap, SplitText }) => {
      const el = ref.current;
      if (!el) return;
      // Masks clip Arabic dots and descenders, so right-to-left text rises without one.
      const rtl = getComputedStyle(el).direction === "rtl";
      const split = SplitText.create(el, {
        type: "words",
        aria: "auto",
        ...(rtl ? {} : { mask: "words" as const }),
      });
      gsap.from(split.words, {
        yPercent: 110,
        opacity: 0,
        stagger,
        duration: 0.9,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
      return () => split.revert();
    },
    [stagger],
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
