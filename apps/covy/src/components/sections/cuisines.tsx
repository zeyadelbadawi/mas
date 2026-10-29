"use client";

import { useNearViewport } from "@mas/motion/near-viewport";
import { useScrollProgress } from "@mas/motion/scroll-progress";
import dynamic from "next/dynamic";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const WIDE = "(min-width: 768px)";
const subscribeWide = (onChange: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const LeafStage = dynamic(() => import("./scenes").then((m) => m.LeafStage), { ssr: false });

type Stop = { id: string; name: string; line: string; image: ReactNode };

/**
 * C4: pinned through five cuisine stops. The leaf ring turns with the scroll and the dish still and
 * one-line story swap at each stop. Reduced motion shows all five stops as a list.
 */
export function Cuisines({ heading, stops }: { heading?: string; stops: Stop[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // three.js (~240 KB) loads only on tablet/desktop widths, and only when this section is about a screen away.
  const near = useNearViewport(sectionRef);
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
  const progress = useScrollProgress(sectionRef, {
    start: "top top",
    end: "bottom bottom",
    onUpdate: (p) => {
      const i = Math.min(stops.length - 1, Math.floor(p * stops.length));
      setActive((prev) => (prev === i ? prev : i));
    },
  });

  return (
    <section ref={sectionRef} className="relative h-[300svh] motion-reduce:h-auto">
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        {/* Fades the ring out before it reaches the heading and the stop card. */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_36%_44%_at_46%_58%,black_45%,transparent_100%)] motion-reduce:hidden max-md:hidden">
          {near && wide ? <LeafStage progress={progress} /> : null}
        </div>
        <div className="relative mx-auto grid h-full max-w-7xl content-center gap-10 px-4 motion-reduce:py-24 sm:px-8 md:grid-cols-[1fr_minmax(0,22rem)]">
          {heading ? (
            <h2 className="font-editorial text-fg max-w-md text-5xl leading-[1.05] sm:text-6xl">
              {heading}
            </h2>
          ) : (
            <span aria-hidden="true" />
          )}
          <ol className="relative">
            {stops.map((s, i) => (
              <li
                key={s.id}
                aria-current={i === active ? "step" : undefined}
                className={`flex flex-col gap-4 transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:static motion-reduce:mb-10 motion-reduce:opacity-100 ${
                  i === active
                    ? "opacity-100"
                    : "pointer-events-none absolute inset-x-0 top-0 translate-y-6 opacity-0"
                }`}
              >
                <div className="mx-auto w-full max-w-[15rem] overflow-hidden rounded-t-full md:max-w-none">
                  {s.image}
                </div>
                <div className="bg-bg/85 rounded-card -mx-3 px-3 py-2 backdrop-blur-sm">
                  <p className="font-display text-fg text-sm tracking-[0.2em]">{s.name}</p>
                  <p className="text-muted mt-1 leading-relaxed">{s.line}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
