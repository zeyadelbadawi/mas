"use client";

import type Lenis from "lenis";
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type DependencyList,
  type ReactNode,
  type RefObject,
} from "react";
import { decideTier, readTierSignals, type DeviceTier } from "../device-tier";
import { loadMotionLib, type MotionLib } from "./motion-lib";

/** Measured once per page load; the server snapshot is null so SSR renders the static-safe markup. */
let cachedTier: DeviceTier | undefined;
const tierListeners = new Set<() => void>();
const subscribeTier = (fn: () => void) => {
  tierListeners.add(fn);
  return () => tierListeners.delete(fn);
};
const getTier = (): DeviceTier => (cachedTier ??= decideTier(readTierSignals()));

/**
 * Switch this visit to the still version (posters, no scroll videos) after the page has loaded: a splash calls
 * it when the line's measured speed can't bring the scenes in reasonable time. It only ever steps down.
 */
export function fallBackToStills(): void {
  const tier = getTier();
  if (tier !== "HIGH" && tier !== "MID") return;
  cachedTier = "LOW";
  tierListeners.forEach((fn) => fn());
}
const getServerTier = (): null => null;

export function useDeviceTier(): DeviceTier | null {
  return useSyncExternalStore(subscribeTier, getTier, getServerTier);
}

type MotionContextValue = {
  /** null during SSR and before hydration. */
  tier: DeviceTier | null;
  /** GSAP + plugins + Lenis once loaded (after first paint); null until then, and always under reduced motion. */
  lib: MotionLib | null;
  /** The active Lenis instance, if smooth scrolling runs on this device. */
  getLenis: () => Lenis | null;
};

const MotionContext = createContext<MotionContextValue>({
  tier: null,
  lib: null,
  getLenis: () => null,
});

export function useMotion(): MotionContextValue {
  return use(MotionContext);
}

type MotionProviderProps = {
  children: ReactNode;
  /** Brand default ease, e.g. "power3.out" (MAS), "sine.inOut" (COVY). */
  ease?: string;
};

/** Runs once the page has loaded and the main thread is idle, so motion never competes with first paint. */
function whenIdleAfterLoad(run: () => void): () => void {
  let idle = 0;
  let timer = 0;
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function")
      idle = window.requestIdleCallback(run, { timeout: 1500 });
    else timer = window.setTimeout(run, 200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
  };
}

/**
 * Loads the motion library after first paint and runs one smooth-scroll engine (Lenis) on GSAP's
 * ticker so ScrollTrigger stays in sync. Lenis runs only on HIGH/MID; reduced motion loads nothing.
 */
export function MotionProvider({ children, ease = "power3.out" }: MotionProviderProps) {
  const tier = useDeviceTier();
  const [lib, setLib] = useState<MotionLib | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (tier === null || tier === "STATIC") return;
    let active = true;
    const cancel = whenIdleAfterLoad(() => {
      void loadMotionLib().then((loaded) => {
        if (active) setLib(loaded);
      });
    });
    return () => {
      active = false;
      cancel();
    };
  }, [tier]);

  useEffect(() => {
    lib?.gsap.defaults({ ease, duration: 0.85 });
  }, [lib, ease]);

  useEffect(() => {
    if (!lib || (tier !== "HIGH" && tier !== "MID")) return;
    const { gsap, ScrollTrigger } = lib;
    // Anchor jumps stop below the fixed 64 px header (matches scroll-padding-top in base.css).
    const lenis = new lib.Lenis({ lerp: 0.09, smoothWheel: true, anchors: { offset: -72 } });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Fonts and media change layout after first paint; re-measure triggers once they settle.
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lib, tier]);

  return (
    <MotionContext value={{ tier, lib, getLenis: () => lenisRef.current }}>
      {children}
    </MotionContext>
  );
}

type MotionEffectOptions = {
  /** Selector scope for gsap.context (e.g. ".item" only matches inside it). */
  scope?: RefObject<Element | null>;
  /**
   * "animated" (default): HIGH/MID only; LOW and reduced motion keep the static, final state.
   * "any": every tier except reduced motion, for scroll tracking that drives UI state.
   */
  when?: "animated" | "any";
};

/**
 * Runs GSAP code once the motion library has loaded. Everything created inside is collected by a
 * gsap.context and reverted on unmount or when `deps` change. Components must render their final,
 * readable state without it.
 */
export function useMotionEffect(
  effect: (lib: MotionLib) => void | (() => void),
  deps: DependencyList,
  { scope, when = "animated" }: MotionEffectOptions = {},
) {
  const { lib, tier } = useMotion();
  const effectRef = useRef(effect);
  useEffect(() => {
    effectRef.current = effect;
  });
  const enabled =
    lib !== null &&
    (when === "any" ? tier !== null && tier !== "STATIC" : tier === "HIGH" || tier === "MID");

  useEffect(() => {
    if (!enabled || !lib) return;
    let cleanup: void | (() => void);
    const ctx = lib.gsap.context(() => {
      cleanup = effectRef.current(lib);
    }, scope?.current ?? undefined);
    return () => {
      if (typeof cleanup === "function") cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps -- `deps` are the caller's, like useEffect's
  }, [enabled, lib, scope, ...deps]);
}
