"use client";

import { useMotionEffect } from "@mas/motion/provider";
import { useRef, type ReactNode } from "react";

/** C6: arch-shaped frames (the facade's arches) that open from a slit as each one scrolls in. */
export function ArchGallery({
  items,
}: {
  items: { id: string; label: string; image: ReactNode }[];
}) {
  const ref = useRef<HTMLUListElement>(null);

  useMotionEffect(
    ({ gsap }) => {
      if (!ref.current) return;
      gsap.utils.toArray<HTMLElement>(".arch-frame").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(45% 30% 0% 30% round 999px 999px 0 0)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)",
            ease: "sine.inOut",
            scrollTrigger: { trigger: el, start: "top 90%", end: "top 35%", scrub: 1 },
          },
        );
      });
    },
    [],
    { scope: ref },
  );

  return (
    <ul ref={ref} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {items.map((item, i) => (
        <li key={item.id} className={`flex flex-col gap-3 ${i % 2 === 1 ? "lg:mt-24" : ""}`}>
          <div className="arch-frame overflow-hidden rounded-t-full">{item.image}</div>
          <p className="text-fg text-sm">{item.label}</p>
        </li>
      ))}
    </ul>
  );
}
