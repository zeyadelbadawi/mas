"use client";

import { useMotion } from "@mas/motion/provider";
import { useEffect, useState } from "react";

/**
 * Once the visitor is past the three scroll scenes, a small button takes them straight back to the top.
 * It jumps rather than glides: gliding would scrub the whole walk backwards on the way.
 */
export function BackToTop({ label }: { label: string }) {
  const [shown, setShown] = useState(false);
  const { getLenis } = useMotion();

  useEffect(() => {
    const walk = document.querySelector<HTMLElement>("[data-walk]");
    let raf = 0;
    const update = () => {
      raf = 0;
      const past = walk
        ? walk.getBoundingClientRect().bottom < 0
        : window.scrollY > window.innerHeight;
      setShown(past);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      onClick={() => {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo({ top: 0 });
        // Keyboard and screen-reader users continue from the top of the page.
        document
          .querySelector<HTMLElement>('header a[href="#top"]')
          ?.focus({ preventScroll: true });
      }}
      className={`fixed end-4 bottom-4 z-40 inline-flex size-12 items-center justify-center rounded-full bg-[var(--aroma-leaf)] text-white shadow-[0_6px_20px_rgb(32_39_34/0.3)] transition-[opacity,transform] duration-300 ease-out sm:end-6 sm:bottom-6 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
