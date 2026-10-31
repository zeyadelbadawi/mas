"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { videoVariantFor } from "../manifest";
import { fallBackToStills, useMotion } from "./motion-provider";
import { sceneStatus, scenesReady, subscribeScenes } from "./scene-status";
import {
  abandonAllPreloads,
  preloadBytes,
  preloadProgress,
  preloadState,
  subscribePreload,
} from "./video-preload";

/**
 * The way out is hidden while things go normally: it appears only when the download has made no progress
 * for STALL_MS (a dropped or stuck connection), or the whole wait passes SLOW_MS (D48). The panel never gives
 * up on its own, so a slow but working connection still gets the full walk.
 */
const STALL_MS = 8000;
const SLOW_MS = 30000;
/**
 * The line's real speed is measured over the first SPEED_WINDOW_MS of the download (Chrome's own estimate is
 * often wrong both ways). If the rest would take longer than SLOW_ETA_MS, the visit switches to the still
 * version (posters, no scroll videos) at once instead of keeping the visitor waiting (D61).
 */
const SPEED_WINDOW_MS = 2500;
const SLOW_ETA_MS = 30000;
/** Downloads are most of the wait; decoding each scene's first frame is the rest. */
const DOWNLOAD_SHARE = 0.92;

const noSubscribe = () => () => {};

/** Every scene of this screen's video variant was loaded earlier in this session (the browser has the files). */
function loadedThisSession(sessionKey: string): boolean {
  try {
    return sessionStorage.getItem(sessionKey + videoVariantFor(window.innerWidth, window.innerHeight)) === "1";
  } catch {
    // No storage (private mode): every load gets the full panel.
    return false;
  }
}

/** While the panel is up the page behind it is inert: nothing there takes keyboard focus or clicks. */
function isolate(panel: HTMLElement): HTMLElement[] {
  const inerted: HTMLElement[] = [];
  for (let n: HTMLElement | null = panel; n && n !== document.body; n = n.parentElement) {
    for (const sib of n.parentElement?.children ?? []) {
      if (sib === n || !(sib instanceof HTMLElement) || sib.inert || sib.tagName === "SCRIPT") continue;
      sib.inert = true;
      inerted.push(sib);
    }
  }
  return inerted;
}

export type SplashGateOptions = {
  /** The scroll scenes (ScrollVideo ids) that must be ready before the page opens. */
  scenes: readonly string[];
  /** The panel's minimum time on a first visit (its animation), from navigation start. */
  minMs: number;
  /** The short panel's minimum time when the files were already loaded this session (browser cache). */
  quickMs: number;
  /** sessionStorage key prefix, e.g. "aroma-ready-": set once every scene of a video variant has loaded. */
  sessionKey: string;
  panelRef: RefObject<HTMLElement | null>;
  /** The exit animation; call `done` when it has finished (the page is released then). */
  animateOut: (panel: HTMLElement, done: () => void) => void;
};

export type SplashGate = {
  phase: "loading" | "leaving" | "gone";
  /** 0..1: downloads, then the scenes' first frames. */
  progress: number;
  /** The files were loaded earlier in this session: the short panel. */
  quick: boolean;
  /** Something is wrong (stalled, very slow): show the way out. */
  canSkip: boolean;
  skip: () => void;
};

/**
 * The splash gate (D62, after D43/D45/D48-D50/D61), shared by both landing pages. On every load of a landing
 * page with motion, the page is locked under the splash panel from the first paint (splashBootScript) until:
 * every scene file has downloaded, every scene has its frame for the current scroll position decoded and
 * drawn (in its own canvas, off screen or not; `scene-status`), the fonts are in, and the panel's minimum
 * time has passed. Only then does the panel leave and the page scroll. A visit that comes back in the same
 * session gets a short panel (the files come from the browser's cache in a moment), never a page that shows
 * first and is covered later.
 */
export function useSplashGate({
  scenes,
  minMs,
  quickMs,
  sessionKey,
  panelRef,
  animateOut,
}: SplashGateOptions): SplashGate {
  const [phase, setPhase] = useState<SplashGate["phase"]>("loading");
  const [progress, setProgress] = useState(0);
  // Read on the client only (the server can't know), so the short panel shows from hydration on.
  const quick = useSyncExternalStore(noSubscribe, () => loadedThisSession(sessionKey), () => false);
  const [canSkip, setCanSkip] = useState(false);
  const leaveRef = useRef<() => void>(() => {});
  const { getLenis, tier } = useMotion();
  const lenisRef = useRef(getLenis);
  const animateRef = useRef(animateOut);
  useEffect(() => {
    lenisRef.current = getLenis;
    animateRef.current = animateOut;
  });

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    // The script is running: it decides when to leave, not the no-JS failsafe, and it owns the page lock.
    el.style.animation = "none";
    const root = document.documentElement;
    root.dataset.splashJs = "1";
    // No panel without motion, on Save-Data or 2G: the boot script has hidden it for good (still frames,
    // nothing to load).
    if (root.dataset.splash === "seen") return;
    root.dataset.splash = "hold";
    const key = sessionKey + videoVariantFor(window.innerWidth, window.innerHeight);
    const isQuick = loadedThisSession(sessionKey);
    // A first visit counts from navigation start: the panel is painted from the first frame, well before this
    // script starts up (a second or two on a slow phone).
    const shownAt = isQuick ? performance.now() : 0;
    const minimum = isQuick ? quickMs : minMs;

    let left = false;
    let fontsReady = false;
    let minTimer = 0;
    let slowTimer = 0;
    let speedTimer = 0;
    let lastProgress = -1;
    let lastProgressAt = performance.now();
    let speedFrom: { at: number; loaded: number } | null = null;
    let speedChecked = isQuick;

    // Hold the page still while the panel is up (wheel, touch and keys; smooth scrolling included).
    const scrollKeys = [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"];
    const block = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      if (scrollKeys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false, capture: true });
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    window.addEventListener("keydown", keys, { capture: true });
    // Smooth scrolling ignores cancelled events, so it is paused too (and if it starts while the panel is up).
    const pause = window.setInterval(() => lenisRef.current()?.stop(), 100);
    lenisRef.current()?.stop();
    const inerted = isolate(el);
    const stallWatch = window.setInterval(() => {
      if (performance.now() - lastProgressAt > STALL_MS) setCanSkip(true);
    }, 1000);
    slowTimer = window.setTimeout(() => setCanSkip(true), SLOW_MS);

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      inerted.forEach((n) => (n.inert = false));
      window.clearInterval(pause);
      window.clearInterval(stallWatch);
      window.removeEventListener("wheel", block, { capture: true });
      window.removeEventListener("touchmove", block, { capture: true });
      window.removeEventListener("keydown", keys, { capture: true });
      delete root.dataset.splash;
      lenisRef.current()?.start();
      // A link to a section lands there now that the page can scroll; otherwise the walk starts at the top.
      const target = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
      if (target) {
        const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - pad);
      } else if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    const leave = () => {
      if (left) return;
      left = true;
      setPhase("leaving");
      // The cover under the panel goes, so the panel's own fade reveals the page; the lock stays until the end.
      root.dataset.splash = "leaving";
      animateRef.current(el, () => {
        release();
        setPhase("gone");
      });
    };
    leaveRef.current = leave;

    const check = () => {
      if (left) return;
      const download = preloadProgress(scenes);
      const ready = scenes.filter((id) => sceneStatus(id)?.ready).length;
      const p = DOWNLOAD_SHARE * download.progress + (1 - DOWNLOAD_SHARE) * (ready / scenes.length);
      setProgress(p);
      if (p !== lastProgress) {
        lastProgress = p;
        lastProgressAt = performance.now();
      }
      if (!download.done && !speedChecked) {
        const bytes = preloadBytes(scenes);
        const now = performance.now();
        if (bytes.total > 0 && !speedFrom) {
          speedFrom = { at: now, loaded: bytes.loaded };
          // Look again when the window is up, even if no progress comes in meanwhile.
          speedTimer = window.setTimeout(check, SPEED_WINDOW_MS + 50);
        } else if (speedFrom && now - speedFrom.at >= SPEED_WINDOW_MS) {
          speedChecked = true;
          const rate = (bytes.loaded - speedFrom.loaded) / (now - speedFrom.at);
          const eta = rate > 0 ? (bytes.total - bytes.loaded) / rate : Infinity;
          if (eta > SLOW_ETA_MS) {
            // Too slow for the scenes: stop the downloads and show the still version; the panel leaves
            // when the tier changes (see the tier effect below).
            abandonAllPreloads();
            fallBackToStills();
            return;
          }
        }
      }
      if (!download.done || !scenesReady(scenes) || !fontsReady) return;
      // Remember this shape as loaded only when every file arrived (a failed one streams instead).
      if (scenes.every((id) => !preloadState(id)?.error)) {
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          // No storage: the full panel shows again on the next load, nothing else changes.
        }
      }
      // Timers can fire a millisecond early against performance.now(): if the minimum isn't quite up, look
      // again when it is.
      const wait = minimum - (performance.now() - shownAt);
      if (wait <= 0) leave();
      else {
        window.clearTimeout(minTimer);
        minTimer = window.setTimeout(check, wait + 20);
      }
    };

    void document.fonts.ready.then(() => {
      fontsReady = true;
      check();
    });
    const offPreload = subscribePreload(check);
    const offScenes = subscribeScenes(check);
    check();
    return () => {
      offPreload();
      offScenes();
      window.clearTimeout(minTimer);
      window.clearTimeout(slowTimer);
      window.clearTimeout(speedTimer);
      release();
    };
  }, [scenes, minMs, quickMs, sessionKey, panelRef]);

  // The LOW and reduced-motion tiers show still posters, so there is nothing to wait for.
  useEffect(() => {
    if (tier !== null && tier !== "HIGH" && tier !== "MID") leaveRef.current();
  }, [tier]);

  return { phase, progress, quick, canSkip, skip: () => leaveRef.current() };
}
