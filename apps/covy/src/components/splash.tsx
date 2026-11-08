"use client";

import { useSplashGate } from "@mas/motion/splash-gate";
import { useEffect, useId, useRef } from "react";
import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/components/logo";

/** On a first visit the mark is written out before the panel may leave (about 2.2 s of drawing). */
const MIN_MS = 2300;
/** Later in the session the files come from the browser's cache: a short panel, the mark already poured. */
const QUICK_MS = 700;

/** The exit: the pour tops the mark up, the mark rises away, and the sand clears onto the facade. */
function animateOut(panel: HTMLElement, done: () => void) {
  const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
  panel.querySelector("[data-mark]")?.animate(
    [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translateY(-28px) scale(1.06)" },
    ],
    { duration: 600, delay: 380, easing: ease, fill: "forwards" },
  );
  const clear = panel.querySelector("[data-veil]")?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 900,
    delay: 560,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    fill: "forwards",
  });
  if (clear) clear.onfinish = done;
  else done();
}

/**
 * The splash gate (D62, after D43/D45/D49; the same gate as Aroma's, useSplashGate): on every load of the
 * landing page with motion, the page opens on the COVY mark, written out and then poured full as the scenes
 * download and their first frames are decoded, so even a first scroll straight through runs frame by frame;
 * then the panel lifts off the facade. The panel is opaque sand from the first paint (a cover in globals.css
 * holds the place until it is up), so nothing of the page shows before it. A way out appears only if the
 * download stalls or runs past 30 seconds, and it never shows without motion or on a weak device.
 */
export function Splash({
  scenes,
  label,
  skip,
  slow,
}: {
  /** The scroll scenes that must be ready before the page opens (D62), from the page. */
  scenes: readonly string[];
  label: string;
  skip: string;
  slow: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const gate = useSplashGate({
    scenes,
    minMs: MIN_MS,
    quickMs: QUICK_MS,
    sessionKey: "covy-ready-",
    panelRef: ref,
    animateOut,
  });

  // The way out appears only when something is wrong; keyboard and screen-reader users land on it.
  useEffect(() => {
    if (gate.canSkip) skipRef.current?.focus();
  }, [gate.canSkip]);

  if (gate.phase === "gone") return null;
  const level = gate.phase === "leaving" || gate.quick ? 1 : gate.progress;
  return (
    <div
      ref={ref}
      data-lenis-prevent
      data-quick={gate.quick ? "" : undefined}
      className="covy-splash fixed inset-0 z-[100] flex flex-col items-center justify-center text-[var(--covy-navy)]"
    >
      {/* Opaque sand with a soft light from above: nothing of the page shows through. */}
      <div data-veil aria-hidden="true" className="covy-splash-veil absolute inset-0" />
      <div data-mark className="relative flex flex-col items-center gap-10">
        <PouredMark level={level} />
        <div className="covy-splash-line h-px w-48 overflow-hidden bg-[var(--covy-navy)]/15">
          <div
            className="h-full origin-left bg-[var(--covy-navy)] transition-transform duration-700 ease-out rtl:origin-right"
            style={{ transform: `scaleX(${level})` }}
          />
        </div>
        <p role="status" className="sr-only">
          {label}
        </p>
      </div>
      {gate.canSkip && gate.phase === "loading" ? (
        <div className="absolute inset-x-4 bottom-8 flex flex-col items-center gap-1 text-center text-sm">
          <p role="status" className="text-[var(--covy-navy)]/70">
            {slow}
          </p>
          <button
            ref={skipRef}
            type="button"
            onClick={gate.skip}
            className="py-2 font-medium text-[var(--covy-navy)] underline underline-offset-4"
          >
            {skip}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const [VB_X, VB_Y, VB_W, VB_H] = WORDMARK_VIEWBOX.split(" ").map(Number) as [
  number,
  number,
  number,
  number,
];

/** A gentle wave, two periods per mark width, three marks wide so it can drift without showing an edge. */
const WAVE = (() => {
  const period = VB_W / 2;
  const amp = 3.2;
  let d = `M ${VB_X - VB_W} 0`;
  for (let x = VB_X - VB_W; x < VB_X + 2 * VB_W; x += period) {
    d += ` q ${period / 4} ${-amp} ${period / 2} 0 t ${period / 2} 0`;
  }
  return `${d} V ${VB_H * 2} H ${VB_X - VB_W} Z`;
})();

/**
 * The COVY wordmark written out stroke by stroke, then filled from the bottom like a pour as the scene
 * videos download (`level`, 0..1): the loading line is the logo itself.
 */
function PouredMark({ level }: { level: number }) {
  const clipId = useId();
  // The surface sits just below the mark at 0 and just above it at 1, so the wave never shows a gap.
  const surface = VB_Y + VB_H + 4 - level * (VB_H + 8);
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className="h-auto w-[min(86vw,46rem)] overflow-visible"
    >
      <defs>
        <clipPath id={clipId}>
          {WORDMARK_PATHS.map((d) => (
            <path key={d.slice(0, 24)} d={d} />
          ))}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g className="covy-pour" style={{ transform: `translateY(${surface}px)` }}>
          <path className="covy-wave" d={WAVE} fill="currentColor" />
        </g>
      </g>
      {WORDMARK_PATHS.map((d, i) => (
        <path
          key={d.slice(0, 24)}
          d={d}
          pathLength={1}
          className="covy-write"
          style={{ animationDelay: `${0.12 + i * 0.16}s` }}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.9}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
