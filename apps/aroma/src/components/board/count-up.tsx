"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "@mas/motion/provider";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** A figure that counts up once when it scrolls into view. The final value is in the HTML from the start. */
export function CountUp({
  value,
  locale,
  className,
  grouping = true,
}: {
  value: number;
  locale: "en" | "ar";
  className?: string;
  /** false for years: 2006, not 2,006. */
  grouping?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { tier } = useMotion();
  const format = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-EG", {
      useGrouping: grouping,
    }).format(Math.round(n));

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || tier === null || tier === "STATIC" || tier === "LOW") return;
      // Start from zero only when the animation will actually run.
      el.textContent = format(0);
      const state = { n: 0 };
      gsap.to(state, {
        n: value,
        duration: 1.6,
        ease: "power2.inOut",
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
        onUpdate: () => {
          el.textContent = format(state.n);
        },
      });
    },
    { dependencies: [tier, value, grouping] },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}
