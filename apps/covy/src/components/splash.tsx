"use client";

import { PORTRAIT_BELOW, videoVariantFor } from "@mas/motion";
import { useMotion } from "@mas/motion/provider";
import { preloadProgress, preloadState, subscribePreload } from "@mas/motion/video-preload";
import { useEffect, useRef, useState } from "react";
import { CovyWordmark } from "@/components/logo";

/**
 * Every scroll scene must be fully downloaded before the page is revealed, so even a first scroll straight
 * through all three plays from memory, frame by frame.
 */
const READY = ["covy.hero", "covy.connector", "covy.signature"] as const;
const MIN_MS = 900;
/** Once brought up by an early scroll on a later page load, the panel stays at least this long (no flicker). */
const GATE_MIN_MS = 500;
/**
 * The way out is hidden while things go normally: it appears only when the download has made no progress
 * for STALL_MS (a dropped or stuck connection), or the whole wait passes SLOW_MS. The panel never gives up on
 * its own, so a slow but working connection still gets the full walk.
 */
const STALL_MS = 8000;
const SLOW_MS = 30000;
/**
 * Set for the session once every scene of one video variant (the 16:9 or the 4:5) has downloaded; the browser
 * keeps the files cached, so a later page load at the same screen shape starts without waiting.
 */
const READY_KEY = "covy-ready-";
/**
 * Before first paint: no panel when this screen's variant is already loaded in this session, or without motion
 * (no videos then). The shape rule is the player's own (videoVariantFor). Static, no input.
 */
const BOOT = {
  __html: `try{var d=document.documentElement,v=innerWidth/innerHeight<${PORTRAIT_BELOW}?"mobile":"desktop";if(sessionStorage.getItem("${READY_KEY}"+v)==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.splash="seen"}catch(e){}`,
};

/**
 * D43/D45: whenever the scene videos this screen plays are not known to be loaded, the page opens on the COVY
 * mark with a loading line until all three are in memory, so even a first scroll straight through plays frame
 * by frame; then the panel lifts off the facade. That is the first visit of a session, and a later page load at
 * a screen shape that needs the other variant. A way out appears only if the download stalls or runs past 30
 * seconds (it never gives up on its own), and it never shows
 * without motion or on a weak device (posters only). Resizing an open page needs nothing: the variant chosen
 * on load stays, and its frames are already in memory.
 */
export function Splash({ label, skip, slow }: { label: string; skip: string; slow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");
  const [canSkip, setCanSkip] = useState(false);
  const leaveRef = useRef<() => void>(() => {});
  const { getLenis, tier } = useMotion();
  const lenisRef = useRef(getLenis);
  useEffect(() => {
    lenisRef.current = getLenis;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The script is running: it decides when to leave, not the no-JS failsafe.
    el.style.animation = "none";
    // Without motion the boot script has already hidden the panel for good (still frames, nothing to load).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const key = READY_KEY + videoVariantFor(window.innerWidth, window.innerHeight);
    let known = false;
    try {
      known = sessionStorage.getItem(key) === "1";
    } catch {
      // No storage (private mode): treat every load as a first visit.
    }

    // Two ways in. Not known to be loaded: the panel is up from the first paint (the boot script left it
    // visible). Known: it stays hidden while the files come back from the browser's cache, and only comes up
    // if the visitor tries to scroll before they are all in memory.
    let shownAt = known ? -1 : performance.now();
    let left = false;
    let holding = false;
    let pause = 0;
    let minTimer = 0;
    let slowTimer = 0;
    let stallWatch = 0;
    let lastProgress = -1;
    let lastProgressAt = performance.now();

    const leave = () => {
      if (left) return;
      left = true;
      release();
      // Also when leaving without ever showing (the LOW tier never loads the videos): stop catching scrolls.
      stopWatching();
      if (shownAt < 0) {
        setPhase("gone");
        return;
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
    leaveRef.current = leave;

    // Hold the page still while the panel is up (wheel, touch and keys; smooth scrolling included).
    const scrollKeys = [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"];
    const block = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      if (scrollKeys.includes(e.key)) e.preventDefault();
    };
    const hold = (minMs: number) => {
      holding = true;
      window.addEventListener("wheel", block, { passive: false, capture: true });
      window.addEventListener("touchmove", block, { passive: false, capture: true });
      window.addEventListener("keydown", keys, { capture: true });
      // Smooth scrolling ignores cancelled events, so it is paused too (and if it starts while the panel is up).
      pause = window.setInterval(() => lenisRef.current()?.stop(), 100);
      lenisRef.current()?.stop();
      minTimer = window.setTimeout(check, minMs);
      lastProgressAt = performance.now();
      slowTimer = window.setTimeout(() => setCanSkip(true), SLOW_MS);
      stallWatch = window.setInterval(() => {
        if (performance.now() - lastProgressAt > STALL_MS) setCanSkip(true);
      }, 1000);
    };
    function release() {
      window.clearInterval(pause);
      window.clearInterval(stallWatch);
      window.removeEventListener("wheel", block, { capture: true });
      window.removeEventListener("touchmove", block, { capture: true });
      window.removeEventListener("keydown", keys, { capture: true });
      if (holding) lenisRef.current()?.start();
      holding = false;
    }

    const check = () => {
      const { progress: p, done } = preloadProgress(READY);
      setProgress(p);
      if (p !== lastProgress) {
        lastProgress = p;
        lastProgressAt = performance.now();
      }
      if (!done) return;
      // Remember this shape as loaded only when every file arrived (a failed one streams instead).
      if (READY.every((id) => !preloadState(id)?.error)) {
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          // No storage: the panel shows again on the next page load, nothing else changes.
        }
      }
      if (shownAt < 0) {
        stopWatching();
        leave();
      } else if (performance.now() - shownAt >= (known ? GATE_MIN_MS : MIN_MS)) leave();
    };

    // Known loads: the first try to scroll before the files are in brings the panel up, quickly.
    const show = () => {
      if (shownAt >= 0 || left) return;
      stopWatching();
      shownAt = performance.now();
      delete document.documentElement.dataset.splash;
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
      hold(GATE_MIN_MS);
      check();
    };
    const intent = (e: Event) => {
      if (preloadProgress(READY).done) return;
      e.preventDefault();
      show();
    };
    const intentKeys = (e: KeyboardEvent) => {
      if (scrollKeys.includes(e.key)) intent(e);
    };
    // Scrollbar drags and restored positions can't be cancelled; they bring the panel up all the same.
    const onScroll = () => {
      if (!preloadProgress(READY).done) show();
    };
    let watching = false;
    const stopWatching = () => {
      if (!watching) return;
      watching = false;
      window.removeEventListener("wheel", intent, { capture: true });
      window.removeEventListener("touchmove", intent, { capture: true });
      window.removeEventListener("keydown", intentKeys, { capture: true });
      window.removeEventListener("scroll", onScroll);
    };
    if (known) {
      watching = true;
      window.addEventListener("wheel", intent, { passive: false, capture: true });
      window.addEventListener("touchmove", intent, { passive: false, capture: true });
      window.addEventListener("keydown", intentKeys, { capture: true });
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      hold(MIN_MS);
    }

    const unsubscribe = subscribePreload(check);
    check();
    return () => {
      unsubscribe();
      stopWatching();
      release();
      window.clearTimeout(minTimer);
      window.clearTimeout(slowTimer);
      window.clearInterval(stallWatch);
      window.removeEventListener("wheel", intent, { capture: true });
      window.removeEventListener("touchmove", intent, { capture: true });
      window.removeEventListener("keydown", intentKeys, { capture: true });
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // The LOW and reduced-motion tiers show still posters, so there is nothing to wait for.
  useEffect(() => {
    if (tier !== null && tier !== "HIGH" && tier !== "MID") leaveRef.current();
  }, [tier]);

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
          <div className="absolute inset-x-4 bottom-8 flex flex-col items-center gap-1 text-center text-sm">
            <p role="status" className="text-[var(--covy-navy)]/70">
              {slow}
            </p>
            <button
              type="button"
              onClick={() => leaveRef.current()}
              className="py-2 font-medium text-[var(--covy-navy)] underline underline-offset-4"
            >
              {skip}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
