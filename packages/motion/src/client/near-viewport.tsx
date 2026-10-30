"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once `ref` comes within `rootMargin` of the viewport, and stays true. Gate heavy chunks
 * (three.js, form libraries) on it so they load just before they're needed, not on page load.
 */
export function useNearViewport(ref: RefObject<Element | null>, rootMargin = "100% 0px"): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, near, rootMargin]);
  return near;
}

/**
 * True once the page has loaded and the browser is idle with no scrolling for `quietMs`, and stays true.
 * Warm heavy chunks with it (alongside useNearViewport) so their first run, a long task of script
 * evaluation and shader compiles, lands while nothing moves instead of mid-scroll near their section.
 */
export function useIdleWarmup(quietMs = 600): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    let lastScroll = 0;
    let idleId = 0;
    let timer = 0;
    const onScroll = () => {
      lastScroll = performance.now();
    };
    const attempt = () => {
      if (cancelled) return;
      const wait = quietMs - (performance.now() - lastScroll);
      if (wait > 0) {
        window.clearTimeout(timer);
        timer = window.setTimeout(whenIdle, wait);
        return;
      }
      setReady(true);
    };
    // Safari has no requestIdleCallback; a short timeout is close enough there.
    function whenIdle() {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(attempt, { timeout: 2000 });
      } else {
        window.clearTimeout(timer);
        timer = window.setTimeout(attempt, 200);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (idleId) window.cancelIdleCallback(idleId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", whenIdle);
    };
  }, [ready, quietMs]);
  return ready;
}
