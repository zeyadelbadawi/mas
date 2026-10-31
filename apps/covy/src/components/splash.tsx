"use client";

import { useMotion } from "@mas/motion/provider";
import { preloadProgress, subscribePreload } from "@mas/motion/video-preload";
import { useEffect, useRef, useState } from "react";
import { CovyWordmark } from "@/components/logo";

/**
 * Every scroll scene must be fully downloaded before the page is revealed, so even a first scroll straight
 * through all three plays from memory, frame by frame.
 */
const READY = ["covy.hero", "covy.connector", "covy.signature"] as const;
const MIN_MS = 900;
/** Safety net for a stalled connection; the skip link is there sooner. */
const MAX_MS = 30000;
const SEEN = "covy-splash";
/** Before first paint: a visitor who already saw it this session never sees it flash. Static, no input. */
const BOOT = {
  __html: `try{if(sessionStorage.getItem("${SEEN}")==="1")document.documentElement.dataset.splash="seen"}catch(e){}`,
};

/**
 * D43/D45: the first visit of a session opens on the COVY mark with a loading line while the three scene videos
 * download, so the walk plays from the first scroll; then the panel lifts off the facade. It can be skipped,
 * gives up after 30 seconds, and doesn't show again in the session, on a deep link, or without motion.
 */
export function Splash({ label, skip }: { label: string; skip: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");
  const [canSkip, setCanSkip] = useState(false);
  const leaveRef = useRef<() => void>(() => {});
  const { getLenis } = useMotion();
  const lenisRef = useRef(getLenis);
  useEffect(() => {
    lenisRef.current = getLenis;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The script is running: it decides when to leave, not the no-JS failsafe.
    el.style.animation = "none";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {
      // No storage (private mode): show it.
    }
    if (seen || reduced || window.location.hash || window.scrollY > 0) {
      setPhase("gone");
      return;
    }

    // Hold the page still while the panel is up (wheel, touch and keys; smooth scrolling included).
    const block = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      if ([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key))
        e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false, capture: true });
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    window.addEventListener("keydown", keys, { capture: true });
    // Smooth scrolling ignores cancelled events, so it is paused too (and if it starts while the panel is up).
    const pause = window.setInterval(() => lenisRef.current()?.stop(), 100);
    lenisRef.current()?.stop();
    const release = () => {
      window.clearInterval(pause);
      lenisRef.current()?.start();
      window.removeEventListener("wheel", block, { capture: true });
      window.removeEventListener("touchmove", block, { capture: true });
      window.removeEventListener("keydown", keys, { capture: true });
    };

    const start = performance.now();
    let left = false;
    leaveRef.current = () => {
      if (left) return;
      left = true;
      release();
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {
        // No storage: it shows again next time, nothing else changes.
      }
      setPhase("leaving");
      // The mark settles and fades, then the panel lifts like a curtain off the facade.
      const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
      el.querySelector("[data-mark]")?.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(-12px) scale(1.04)" },
        ],
        { duration: 450, easing: ease, fill: "forwards" },
      );
      const lift = el.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }], {
        duration: 650,
        delay: 120,
        easing: ease,
        fill: "forwards",
      });
      lift.onfinish = () => setPhase("gone");
    };

    const check = () => {
      const { progress: p, done } = preloadProgress(READY);
      setProgress(p);
      if (done && performance.now() - start >= MIN_MS) leaveRef.current();
    };
    const unsubscribe = subscribePreload(check);
    const minTimer = window.setTimeout(check, MIN_MS);
    const capTimer = window.setTimeout(() => leaveRef.current(), MAX_MS);
    const skipTimer = window.setTimeout(() => setCanSkip(true), 1500);
    check();
    return () => {
      unsubscribe();
      release();
      window.clearTimeout(minTimer);
      window.clearTimeout(capTimer);
      window.clearTimeout(skipTimer);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <>
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static boot script, see BOOT */}
      <script dangerouslySetInnerHTML={BOOT} />
      <div
        ref={ref}
        data-lenis-prevent
        className="covy-splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--covy-sand)] text-[var(--covy-navy)]"
      >
        <div data-mark className="flex flex-col items-center gap-8">
          <CovyWordmark className="h-auto w-[min(56vw,18rem)]" />
          <div className="h-px w-40 overflow-hidden bg-[var(--covy-navy)]/15">
            <div
              className="h-full origin-left bg-[var(--covy-navy)] transition-transform duration-300 ease-out rtl:origin-right"
              style={{ transform: `scaleX(${phase === "leaving" ? 1 : progress})` }}
            />
          </div>
          <p role="status" className="sr-only">
            {label}
          </p>
        </div>
        {canSkip && phase === "loading" ? (
          <button
            type="button"
            onClick={() => leaveRef.current()}
            className="absolute bottom-8 text-sm text-[var(--covy-navy)]/70 underline-offset-4 hover:text-[var(--covy-navy)] hover:underline"
          >
            {skip}
          </button>
        ) : null}
      </div>
    </>
  );
}
