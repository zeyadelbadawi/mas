"use client";

import { useNearViewport } from "@mas/motion/near-viewport";
import dynamic from "next/dynamic";
import { useRef, type ComponentProps } from "react";
import type { ReserveWithIntl } from "./reserve";

// The forms bundle (validation, phone parsing, Turnstile; ~80 KB) loads only near the booking section.
const ReserveForms = dynamic(() => import("./reserve").then((m) => m.ReserveWithIntl), {
  ssr: false,
});

export function LazyReserve(props: ComponentProps<typeof ReserveWithIntl>) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref, "150% 0px");
  return (
    <div ref={ref} className="mx-auto min-h-[46rem] max-w-3xl">
      {near ? <ReserveForms {...props} /> : null}
    </div>
  );
}
