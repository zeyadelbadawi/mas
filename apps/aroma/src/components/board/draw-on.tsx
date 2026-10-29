"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "@mas/motion/provider";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Draws every stroke inside it as it scrolls through the viewport (scrubbed, so it undraws going back up).
 * Drawings are complete without JS, on low-power devices and with reduced motion.
 */
export function DrawOn({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tier } = useMotion();

  useGSAP(
    () => {
      if (!ref.current || tier === null || tier === "STATIC" || tier === "LOW") return;
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
    { dependencies: [tier], scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
