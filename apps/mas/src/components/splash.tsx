"use client";

import { useSplashGate } from "@mas/motion/splash-gate";
import { useEffect, useId, useRef } from "react";
import { MAS_DIAGONAL_DEG, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/components/logo";

/** On a first visit the wordmark is drawn out before the panel may leave (about 1.8 s of drawing). */
const MIN_MS = 2400;
/**
 * Later in the session (another page and back, a reload) the files are in memory or the browser's cache and
 * the scenes are ready in a fraction of a second: the panel only covers the jump back to the top, then goes
 * at once (D69).
 */
const QUICK_MS = 250;

/** The exit: the gold mark rises away and the dark panel clears onto the empty room of the first frame. */
function animateOut(panel: HTMLElement, done: () => void) {
  const ease = "cubic-bezier(0.215, 0.61, 0.355, 1)";
  // Coming back in the same session: a short fade, nothing to wait for (D69).
  if (panel.dataset.quick !== undefined) {
    const fade = panel.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 420,
      easing: ease,
      fill: "forwards",
    });
    fade.onfinish = done;
    return;
  }
  panel.querySelector("[data-mark]")?.animate(
    [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translateY(-24px)" },
    ],
    { duration: 600, delay: 320, easing: ease, fill: "forwards" },
  );
  const clear = panel.querySelector("[data-veil]")?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 900,
    delay: 520,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    fill: "forwards",
  });
  if (clear) clear.onfinish = done;
  else done();
}

/**
 * The splash gate (D62, D64; the same gate as COVY's and Aroma's, useSplashGate): on every load of the home
 * page with motion, the page opens on dark gray, where the MAS wordmark is drawn in thin gold lines (the
 * identity's outline version) and then filled with gold along its own diagonal as the two scenes download and
 * their first frames are decoded. Opaque from the first paint (a cover in globals.css holds the place until it
 * is up), so nothing of the page shows before it. A way out appears only if the download stalls or runs past
 * 30 seconds.
 */
export function Splash({
  scenes,
  label,
  tagline,
  skip,
  slow,
}: {
  /** The scroll scenes that must be ready before the page opens (D62), from the page. */
  scenes: readonly string[];
  label: string;
  tagline: string;
  skip: string;
  slow: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const gate = useSplashGate({
    scenes,
    minMs: MIN_MS,
    quickMs: QUICK_MS,
    sessionKey: "mas-ready-",
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
      className="mas-splash fixed inset-0 z-[100] flex flex-col items-center justify-center text-[var(--mas-gold)]"
    >
      <div data-veil aria-hidden="true" className="absolute inset-0 bg-[var(--mas-ink)]" />
      <div data-mark className="relative flex w-[min(78vw,34rem)] flex-col items-start gap-6">
        <GoldSweep level={level} />
        <p className="mas-rule text-sm font-light tracking-[0.14em] text-[var(--mas-soft)] rtl:tracking-normal">
          {tagline}
        </p>
        <p role="status" className="sr-only">
          {label}
        </p>
      </div>
      {gate.canSkip && gate.phase === "loading" ? (
        <div className="absolute inset-x-4 bottom-8 flex flex-col items-center gap-1 text-center text-sm">
          <p role="status" className="text-[var(--mas-soft)]/75">
            {slow}
          </p>
          <button
            ref={skipRef}
            type="button"
            onClick={gate.skip}
            className="py-2 font-medium text-[var(--mas-gold)] underline underline-offset-4"
          >
            {skip}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const [, , VB_W, VB_H] = WORDMARK_VIEWBOX.split(" ").map(Number) as [
  number,
  number,
  number,
  number,
];
/** How far the diagonal leading edge leans across the mark's height. */
const LEAN = VB_H / Math.tan((MAS_DIAGONAL_DEG * Math.PI) / 180);

/**
 * The wordmark in outline, then gold sweeping across it from the start side with a leading edge on the
 * wordmark's own diagonal (`level`, 0..1: the wait). In Arabic the sweep runs from the right.
 */
function GoldSweep({ level }: { level: number }) {
  const clipId = useId();
  const x = -LEAN + level * (VB_W + LEAN);
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className="mas-draw h-auto w-full overflow-visible"
    >
      <defs>
        <clipPath id={clipId}>
          {WORDMARK_PATHS.map((d) => (
            <path key={d.slice(0, 16)} d={d} />
          ))}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Mirrored in Arabic, so the sweep runs from the right. */}
        <g
          className="rtl:-scale-x-100"
          style={{ transformBox: "view-box", transformOrigin: "center" }}
        >
          <polygon
            points={`${-VB_W - LEAN},0 ${LEAN},0 0,${VB_H} ${-VB_W - LEAN},${VB_H}`}
            fill="currentColor"
            style={{
              transform: `translateX(${x}px)`,
              transition: "transform 0.7s cubic-bezier(0.215, 0.61, 0.355, 1)",
            }}
          />
        </g>
      </g>
      {WORDMARK_PATHS.map((d) => (
        <path
          key={d.slice(0, 16)}
          d={d}
          data-letter=""
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
