"use client";

import { useSplashGate } from "@mas/motion/splash-gate";
import { useEffect, useId, useRef } from "react";
import { PETAL_PATHS, PETAL_VIEWBOX, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/components/logo";

/** Every scroll scene must be downloaded and have its frame decoded before the page opens (D62). */
const READY = ["aroma.morning", "aroma.lake", "aroma.night"] as const;
/** On a first visit the petal settles and the wordmark is written before the panel may leave. */
const MIN_MS = 2600;
/** Later in the session the files come from the browser's cache: a short panel, the cup already dusted. */
const QUICK_MS = 700;

/** The exit: the last petals settle, the cup rises away, and the marble clears onto the morning table. */
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
 * The splash gate (D62; the same gate as COVY's, useSplashGate): on every load of the landing page with
 * motion, the page opens on a cappuccino seen from above, and the logo's petal settles on the foam as cocoa
 * dust, one petal per twelfth of the wait (06-aroma-replan §6.4); then the panel lifts off the morning
 * table. The panel is opaque marble from the first paint (a cover in globals.css holds the place until it is
 * up), so nothing of the page shows before it. A way out appears only if the download stalls or runs past 30
 * seconds, and it never shows without motion or on a weak device (posters only).
 */
export function Splash({ label, skip, slow }: { label: string; skip: string; slow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const gate = useSplashGate({
    scenes: READY,
    minMs: MIN_MS,
    quickMs: QUICK_MS,
    sessionKey: "aroma-ready-",
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
      className="aroma-splash fixed inset-0 z-[100] flex flex-col items-center justify-center text-[var(--aroma-ink)]"
    >
      {/* Opaque marble warmed by a soft morning light: nothing of the page shows through. */}
      <div data-veil aria-hidden="true" className="aroma-splash-veil absolute inset-0" />
      <div data-mark className="relative flex flex-col items-center gap-8">
        <Cappuccino level={level} />
        <Wordmark written={level >= 1} />
        <p role="status" className="sr-only">
          {label}
        </p>
      </div>
      {gate.canSkip && gate.phase === "loading" ? (
        <div className="absolute inset-x-4 bottom-8 flex flex-col items-center gap-1 text-center text-sm">
          <p role="status" className="text-[var(--aroma-ink)]/75">
            {slow}
          </p>
          <button
            ref={skipRef}
            type="button"
            onClick={gate.skip}
            className="py-2 font-medium text-[var(--aroma-leaf)] underline underline-offset-4"
          >
            {skip}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const [PX, PY, PW, PH] = PETAL_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
const CX = PX + PW / 2;
const CY = PY + PH / 2;
const R = Math.max(PW, PH) * 0.62;

/**
 * The cup from above: a white rim, the foam, and the logo's petal stencilled in cocoa, one petal per twelfth of
 * the download (`level`, 0..1). The petal that comes next breathes faintly so a slow line still looks alive.
 */
function Cappuccino({ level }: { level: number }) {
  const foamId = useId();
  const on = Math.floor(level * PETAL_PATHS.length + 1e-6);
  return (
    <svg
      viewBox={`${CX - R * 1.18} ${CY - R * 1.18} ${R * 2.36} ${R * 2.36}`}
      aria-hidden="true"
      focusable="false"
      className="h-auto w-[min(62vw,20rem)] drop-shadow-[0_18px_30px_rgb(32_39_34/0.18)]"
    >
      <defs>
        <radialGradient id={foamId} cx="45%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#fbf2e2" />
          <stop offset="70%" stopColor="#efdcc0" />
          <stop offset="100%" stopColor="#d9b98f" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={R * 1.16} fill="#ffffff" />
      <circle cx={CX} cy={CY} r={R * 1.16} fill="none" stroke="#e7e2d8" strokeWidth={R * 0.02} />
      <circle cx={CX} cy={CY} r={R} fill={`url(#${foamId})`} />
      {PETAL_PATHS.map((d, i) => (
        <path
          key={d.slice(0, 24)}
          d={d}
          fill="url(#aroma-dust)"
          className="aroma-dust"
          {...(i < on ? { "data-on": "" } : i === on ? { "data-next": "" } : {})}
          style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
        />
      ))}
    </svg>
  );
}

/** The script wordmark, written stroke by stroke once the last petal is in, then inked. */
function Wordmark({ written }: { written: boolean }) {
  if (!written) return <div aria-hidden="true" className="h-[min(5vw,2.4rem)]" />;
  return (
    <svg
      data-written=""
      viewBox={WORDMARK_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className="h-[min(5vw,2.4rem)] w-auto overflow-visible text-[var(--aroma-stone)]"
    >
      {WORDMARK_PATHS.map((d, i) => (
        <path
          key={`s${d.slice(0, 32)}`}
          d={d}
          pathLength={1}
          className="aroma-write"
          style={{ animationDelay: `${i * 0.18}s` }}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinejoin="round"
        />
      ))}
      {WORDMARK_PATHS.map((d) => (
        <path key={`f${d.slice(0, 32)}`} d={d} className="aroma-ink" fill="currentColor" />
      ))}
    </svg>
  );
}
