"use client";

import { useMotion } from "@mas/motion/provider";
import type { ReactNode } from "react";

/**
 * A "Book" link that can pick the branch: sets ?branch=<id> and glides to the booking form without reloading
 * the page (which would bring the scenes' loading screen back). The href keeps working without JavaScript or
 * in a new tab. Focus moves to the booking tab (or the section heading while the forms are still loading).
 */
export function BookLink({
  branch,
  className,
  children,
}: {
  branch?: string;
  className?: string;
  children: ReactNode;
}) {
  const { getLenis } = useMotion();
  return (
    <a
      href={branch ? `?branch=${branch}#reserve` : "#reserve"}
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const url = new URL(window.location.href);
        if (branch) url.searchParams.set("branch", branch);
        url.hash = "reserve";
        window.history.pushState(null, "", url);
        // The booking form listens for URL changes (popstate) to pick the branch up.
        window.dispatchEvent(new PopStateEvent("popstate"));
        const target = document.getElementById("reserve");
        if (!target) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(target, { offset: -72 });
        else {
          const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: still ? "auto" : "smooth" });
        }
        const tab = target.querySelector<HTMLElement>("[data-book-tab]");
        (tab ?? document.getElementById("reserve-title"))?.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
