"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "@mas/motion/provider";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Step = { title: string; line: string };

/** M4: a crimson rule draws down through the five stages of support; each stage lights as the line reaches it. */
export function ScopeLine({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { tier } = useMotion();

  useGSAP(
    () => {
      if (!ref.current || tier === null || tier === "STATIC" || tier === "LOW") return;
      gsap.fromTo(
        ".scope-rule",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>(".scope-step").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.25 },
          {
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 62%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    },
    { dependencies: [tier], scope: ref },
  );

  return (
    <ol ref={ref} className="relative flex flex-col gap-14 ps-10">
      <span aria-hidden="true" className="bg-line absolute start-[7px] top-2 bottom-2 w-px" />
      <span
        aria-hidden="true"
        className="scope-rule bg-accent absolute start-[6px] top-2 bottom-2 w-[3px] origin-top"
      />
      {steps.map((s) => (
        <li key={s.title} className="scope-step relative">
          <span
            aria-hidden="true"
            className="bg-accent absolute -start-10 top-3 size-[15px] rounded-full ring-4 ring-[var(--brand-bg)]"
          />
          <h3 className="font-display text-fg text-4xl sm:text-5xl">{s.title}</h3>
          <p className="text-muted mt-2 max-w-md leading-relaxed">{s.line}</p>
        </li>
      ))}
    </ol>
  );
}
