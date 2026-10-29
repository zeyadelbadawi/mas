"use client";

import { useMotionEffect } from "@mas/motion/provider";
import { useRef, type ReactNode } from "react";

/**
 * Draws every stroke inside it as it scrolls through the viewport (scrubbed, so it undraws going back up).
 * Drawings are complete without JS, on low-power devices and with reduced motion.
 */
export function DrawOn({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotionEffect(
    ({ gsap }) => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current.querySelectorAll("path, circle"),
        { strokeDasharray: 1, strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "power2.inOut",
          stagger: 0.02,
          scrollTrigger: { trigger: ref.current, start: "top 85%", end: "center 45%", scrub: 1 },
        },
      );
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
