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
