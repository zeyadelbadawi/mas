"use client";

import { useScrollProgress } from "@mas/motion/scroll-progress";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const FacetStage = dynamic(() => import("./scenes").then((m) => m.FacetStage), { ssr: false });

type Service = { slug: string; number: string; title: string; summary: string };

/**
 * M3: pinned for nine scroll steps. The crystal turns a facet per service while the list beside it
 * marks the one being read. With reduced motion it is a plain list with every summary visible.
 */
export function NineFacetsSection({ heading, services }: { heading: string; services: Service[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  useScrollProgress(sectionRef, {
    start: "top top",
    end: "bottom bottom",
    onUpdate: (p) => {
      const index = Math.min(services.length - 1, Math.floor(p * services.length));
      activeRef.current = index;
      setActive((prev) => (prev === index ? prev : index));
    },
  });

  return (
    <section ref={sectionRef} className="relative h-[420svh] motion-reduce:h-auto">
      <div className="sticky top-0 mx-auto grid h-svh max-w-7xl grid-rows-[34svh_1fr] gap-6 px-4 py-10 motion-reduce:static motion-reduce:h-auto sm:px-8 md:grid-cols-[1fr_1fr] md:grid-rows-1 md:items-center">
        <div className="relative h-full min-h-0 md:h-[70svh]">
          <FacetStage active={activeRef} />
        </div>
        <div className="flex min-h-0 flex-col gap-6">
          <h2 className="font-display text-fg text-5xl sm:text-6xl">{heading}</h2>
          <ol className="flex flex-col">
            {services.map((s, i) => {
              const on = i === active;
              return (
                <li
                  key={s.slug}
                  aria-current={on ? "step" : undefined}
                  // Phones show only the service being read; the full list doesn't fit a pinned screen.
                  className={`border-line border-t py-2.5 first:border-t-0 motion-reduce:block max-md:border-t-0 ${on ? "" : "max-md:hidden"}`}
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`font-display w-8 shrink-0 text-xl tabular-nums transition-colors duration-300 ${on ? "text-accent" : "text-muted"}`}
                    >
                      {s.number}
                    </span>
                    <span
                      className={`text-base transition-colors duration-300 sm:text-lg ${on ? "text-fg" : "text-muted"}`}
                    >
                      {s.title}
                    </span>
                  </div>
                  <p
                    className={`text-muted ps-12 text-sm leading-relaxed transition-[opacity] duration-300 motion-reduce:block motion-reduce:opacity-100 ${on ? "block opacity-100" : "hidden opacity-0"}`}
                  >
                    {s.summary}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
