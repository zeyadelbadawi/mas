"use client";

import { useMotionEffect } from "@mas/motion/provider";
import { useRef } from "react";

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
  const format = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-EG", {
      useGrouping: grouping,
    }).format(Math.round(n));

  useMotionEffect(
    ({ gsap }) => {
      const el = ref.current;
      if (!el) return;
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
    [value, grouping],
  );

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}
