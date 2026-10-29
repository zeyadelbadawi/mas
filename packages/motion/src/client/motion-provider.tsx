"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { decideTier, readTierSignals, type DeviceTier } from "../device-tier";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Measured once per page load; the server snapshot is null so SSR renders the static-safe markup. */
let cachedTier: DeviceTier | undefined;
const noopSubscribe = () => () => {};
const getTier = (): DeviceTier => (cachedTier ??= decideTier(readTierSignals()));
const getServerTier = (): null => null;

export function useDeviceTier(): DeviceTier | null {
  return useSyncExternalStore(noopSubscribe, getTier, getServerTier);
}

type MotionContextValue = {
  /** null during SSR and before hydration. */
  tier: DeviceTier | null;
  /** The active Lenis instance, if smooth scrolling runs on this device. */
  getLenis: () => Lenis | null;
};

const MotionContext = createContext<MotionContextValue>({ tier: null, getLenis: () => null });

export function useMotion(): MotionContextValue {
  return use(MotionContext);
}

type MotionProviderProps = {
  children: ReactNode;
  /** Brand default ease, e.g. "power3.out" (MAS), "sine.inOut" (COVY). */
  ease?: string;
};

/**
 * One smooth-scroll engine (Lenis) driven by GSAP's ticker so ScrollTrigger stays in sync.
 * Lenis runs only on HIGH/MID tiers; reduced motion and LOW keep native scrolling.
 */
export function MotionProvider({ children, ease = "power3.out" }: MotionProviderProps) {
  const tier = useDeviceTier();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.defaults({ ease, duration: 0.85 });
  }, [ease]);

  useEffect(() => {
    if (tier !== "HIGH" && tier !== "MID") return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Fonts and media change layout after first paint; re-measure triggers once they settle.
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [tier]);

  return (
    <MotionContext value={{ tier, getLenis: () => lenisRef.current }}>{children}</MotionContext>
  );
}
