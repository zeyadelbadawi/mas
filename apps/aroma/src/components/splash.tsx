"use client";

import { PORTRAIT_BELOW, videoVariantFor } from "@mas/motion";
import { useMotion } from "@mas/motion/provider";
import { preloadProgress, preloadState, subscribePreload } from "@mas/motion/video-preload";
import { useEffect, useId, useRef, useState } from "react";
import { PETAL_PATHS, PETAL_VIEWBOX, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/components/logo";

/**
 * Every scroll scene must be fully downloaded before the page is revealed, so even a first scroll straight
 * through all three plays from memory, frame by frame.
 */
const READY = ["aroma.morning", "aroma.lake", "aroma.night"] as const;
/** On a first visit the petal settles and the wordmark is written before the panel may leave. */
const MIN_MS = 2600;
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
const READY_KEY = "aroma-ready-";
/**
 * Before first paint: no panel when this screen's variant is already loaded in this session, or without motion
 * (no videos then). Otherwise the page is locked from the first paint (`data-splash="hold"`, overflow hidden in
 * globals.css), before any script can catch a wheel, a swipe or the scrollbar; if the script never takes over,
 * the lock lets go after 10 s. The shape rule is the player's own (videoVariantFor). Static, no input.
 */
const BOOT = {
  __html: `try{var d=document.documentElement,v=innerWidth/innerHeight<${PORTRAIT_BELOW}?"mobile":"desktop";if(sessionStorage.getItem("${READY_KEY}"+v)==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.splash="seen";else{d.dataset.splash="hold";setTimeout(function(){if(d.dataset.splash==="hold"&&!d.dataset.splashJs)delete d.dataset.splash},10000)}}catch(e){}`,
};

/**
 * The same gate as COVY's splash (D43/D45/D48-D50): whenever the scene videos this screen plays are not known
 * to be loaded, the page opens on a cappuccino seen from above, and the logo's petal settles on the foam as
 * cocoa dust, one petal per twelfth of the download (06-aroma-replan §6.4); then the panel lifts off the
 * morning table. That is the first visit of a session, and a later page load at
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
  const skipRef = useRef<HTMLButtonElement>(null);
  const { getLenis, tier } = useMotion();
  const lenisRef = useRef(getLenis);
  useEffect(() => {
    lenisRef.current = getLenis;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The script is running: it decides when to leave, not the no-JS failsafe, and it owns the page lock.
    el.style.animation = "none";
    const root = document.documentElement;
    root.dataset.splashJs = "1";
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
    // A first visit counts from navigation start: the cup is painted from the first frame, well before
    // this script starts up (a second or two on a slow phone).
    let shownAt = known ? -1 : 0;
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
      // Also when leaving without ever showing (the LOW tier never loads the videos): stop catching scrolls.
      stopWatching();
      if (shownAt < 0) {
        release();
        setPhase("gone");
        return;
      }
      setPhase("leaving");
      // The last petals settle, the cup rises away, and the frosted veil clears: the morning table at the
      // start of the walk comes into focus where the panel was.
      const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
      el.querySelector("[data-mark]")?.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(-28px) scale(1.06)" },
        ],
        { duration: 600, delay: 380, easing: ease, fill: "forwards" },
      );
      const clear = el.querySelector("[data-veil]")?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 900,
        delay: 560,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      });
      // The page stays locked until the panel has fully cleared, so no scroll slips into the walk.
      const done = () => {
        release();
        setPhase("gone");
      };
      if (clear) clear.onfinish = done;
      else done();
    };
    leaveRef.current = leave;

    // Hold the page still while the panel is up (wheel, touch and keys; smooth scrolling included).
    const scrollKeys = [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"];
    const block = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      if (scrollKeys.includes(e.key)) e.preventDefault();
    };
    // While the panel is up the page behind it is inert: nothing there takes keyboard focus or clicks.
    const inerted: HTMLElement[] = [];
    const isolate = () => {
      for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
        for (const sib of n.parentElement?.children ?? []) {
          if (sib === n || !(sib instanceof HTMLElement) || sib.inert || sib.tagName === "SCRIPT")
            continue;
          sib.inert = true;
          inerted.push(sib);
        }
      }
    };
    const hold = (minMs: number) => {
      holding = true;
      isolate();
      window.addEventListener("wheel", block, { passive: false, capture: true });
      window.addEventListener("touchmove", block, { passive: false, capture: true });
      window.addEventListener("keydown", keys, { capture: true });
      // Smooth scrolling ignores cancelled events, so it is paused too (and if it starts while the panel is up).
      pause = window.setInterval(() => lenisRef.current()?.stop(), 100);
      lenisRef.current()?.stop();
      minTimer = window.setTimeout(check, Math.max(0, minMs - (performance.now() - shownAt)));
      lastProgressAt = performance.now();
      slowTimer = window.setTimeout(() => setCanSkip(true), SLOW_MS);
      stallWatch = window.setInterval(() => {
        if (performance.now() - lastProgressAt > STALL_MS) setCanSkip(true);
      }, 1000);
    };
    function release() {
      if (root.dataset.splash === "hold") delete root.dataset.splash;
      inerted.forEach((n) => (n.inert = false));
      inerted.length = 0;
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
      root.dataset.splash = "hold";
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

  // The way out appears only when something is wrong; keyboard and screen-reader users land on it.
  useEffect(() => {
    if (canSkip) skipRef.current?.focus();
  }, [canSkip]);

  // The LOW and reduced-motion tiers show still posters, so there is nothing to wait for.
  useEffect(() => {
    if (tier !== null && tier !== "HIGH" && tier !== "MID") leaveRef.current();
  }, [tier]);

  if (phase === "gone") return null;
  const level = phase === "leaving" ? 1 : progress;
  return (
    <>
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static boot script, see BOOT */}
      <script dangerouslySetInnerHTML={BOOT} />
      <div
        ref={ref}
        data-lenis-prevent
        className="aroma-splash fixed inset-0 z-[100] flex flex-col items-center justify-center text-[var(--aroma-ink)]"
      >
        {/* Frosted marble over the page itself, warmed by a soft morning light. */}
        <div
          data-veil
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_10%,#fff8e8_0%,transparent_60%),color-mix(in_srgb,var(--aroma-marble)_86%,transparent)] backdrop-blur-2xl"
        />
        <div data-mark className="relative flex flex-col items-center gap-8">
          <Cappuccino level={level} />
          <Wordmark written={level >= 1} />
          <p role="status" className="sr-only">
            {label}
          </p>
        </div>
        {canSkip && phase === "loading" ? (
          <div className="absolute inset-x-4 bottom-8 flex flex-col items-center gap-1 text-center text-sm">
            <p role="status" className="text-[var(--aroma-ink)]/75">
              {slow}
            </p>
            <button
              ref={skipRef}
              type="button"
              onClick={() => leaveRef.current()}
              className="py-2 font-medium text-[var(--aroma-leaf)] underline underline-offset-4"
            >
              {skip}
            </button>
          </div>
        ) : null}
      </div>
    </>
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
