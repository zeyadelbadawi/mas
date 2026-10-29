"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef, type ElementType, type ReactNode } from "react";
import { useMotion } from "./motion-provider";

gsap.registerPlugin(useGSAP, SplitText);

type SplitRevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Seconds between words. */
  stagger?: number;
};

/**
 * Word-by-word heading reveal on scroll. The heading stays fully visible without JS and under reduced motion;
 * SplitText's aria option keeps one readable label and hides the split words from assistive tech.
 */
export function SplitReveal({
  as: Tag = "h2",
  children,
  className,
  stagger = 0.06,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { tier } = useMotion();

  useGSAP(
    () => {
      if (!ref.current || tier === null || tier === "STATIC" || tier === "LOW") return;
      // Masks clip Arabic dots and descenders, so right-to-left text rises without one.
      const rtl = getComputedStyle(ref.current).direction === "rtl";
      const split = SplitText.create(ref.current, {
        type: "words",
        aria: "auto",
        ...(rtl ? {} : { mask: "words" as const }),
      });
      gsap.from(split.words, {
        yPercent: 110,
        opacity: 0,
        stagger,
        duration: 0.9,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
      return () => split.revert();
    },
    { dependencies: [tier], scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
