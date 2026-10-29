"use client";

import { useMotionEffect } from "@mas/motion/provider";
import { useRef, type ReactNode } from "react";

/**
 * C2: leaves and stars drift slowly at different depths as the section scrolls past (sine.inOut, COVY's pace),
 * and the stars twinkle. Static under reduced motion and on low-power devices.
 */
export function Drift({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotionEffect(
    ({ gsap }) => {
      if (!ref.current) return;
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        // Phones get half the travel, so leaves stay clear of the headline.
        const depth =
          Number(el.dataset.depth ?? 1) *
          (window.matchMedia("(max-width: 639px)").matches ? 0.5 : 1);
        gsap.fromTo(
          el,
          { yPercent: 30 * depth, rotate: -6 * depth },
          {
            yPercent: -30 * depth,
            rotate: 6 * depth,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-twinkle]").forEach((el, i) => {
        gsap.to(el, {
          opacity: 0.25,
          scale: 0.6,
          duration: 1.6 + (i % 3) * 0.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.37,
        });
      });
    },
    [],
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
