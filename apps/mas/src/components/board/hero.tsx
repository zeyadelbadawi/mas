"use client";

import { useScrollProgress } from "@mas/motion/scroll-progress";
import dynamic from "next/dynamic";
import { useRef } from "react";

const ObsidianStage = dynamic(() => import("./scenes").then((m) => m.ObsidianStage), {
  ssr: false,
});

type HeroProps = { wordmark: string; line: string; dir: "ltr" | "rtl" };

/** M1: the camera sits over the obsidian field and pushes in as the visitor scrolls. */
export function MasHero({ wordmark, line, dir }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef, { start: "top top", end: "bottom bottom" });

  return (
    <section ref={sectionRef} className="relative h-[180svh] motion-reduce:h-svh">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0">
          <ObsidianStage progress={progress} />
        </div>
        <div className="pointer-events-none relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-14 sm:px-8">
          {/* Stand-in for the client's wordmark SVG. */}
          <p
            aria-hidden="true"
            className="font-display text-fg leading-[0.78] tracking-[-0.01em]"
            style={{ fontSize: "clamp(7rem, 26vw, 24rem)" }}
            dir={dir}
          >
            {wordmark}
          </p>
          <h1 className="font-editorial text-fg mt-6 max-w-xl text-2xl leading-snug sm:text-3xl">
            {line}
          </h1>
        </div>
      </div>
    </section>
  );
}
