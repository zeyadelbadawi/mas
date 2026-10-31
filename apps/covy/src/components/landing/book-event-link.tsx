"use client";

import { useMotion } from "@mas/motion/provider";
import type { ReactNode } from "react";

/**
 * "Book this event": sets ?event=<id> and glides to the booking form without reloading the page (which
 * would bring the scenes' loading screen back). The href keeps working without JavaScript or in a new tab.
 * Focus moves to the booking tab, so keyboard visitors carry on from the form; focusing it also selects it
 * (Radix tabs activate on focus), so a visitor who had the feedback tab open lands on the booking form.
 */
export function BookEventLink({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const { getLenis } = useMotion();
  return (
    <a
      href={`?event=${id}#reserve`}
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set("event", id);
        url.hash = "reserve";
        window.history.pushState(null, "", url);
        // The booking form listens for URL changes (popstate) to pick the event up.
        window.dispatchEvent(new PopStateEvent("popstate"));
        const target = document.getElementById("reserve");
        if (!target) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(target, { offset: -72 });
        else {
          const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: still ? "auto" : "smooth" });
        }
        // The forms load lazily: until they have, the section heading takes focus.
        const tab = target.querySelector<HTMLElement>("[data-book-tab]");
        (tab ?? document.getElementById("reserve-title"))?.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
