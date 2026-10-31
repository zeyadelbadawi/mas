"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { cn } from "../cn";

type Props = {
  className?: string;
  locale: "en" | "ar";
  /** Visible text, e.g. "العربية". Labels come from the server so no message formatter ships. */
  label: string;
  /** Accessible name, e.g. "Switch to Arabic". */
  ariaLabel: string;
};

/**
 * English lives at "/", Arabic at "/ar" (D27): the same page in the other language. The locale middleware
 * serves "/" from "/en", and usePathname() can report either, so an "/en" prefix is dropped first.
 */
export function otherLocalePath(pathname: string, locale: "en" | "ar"): string {
  if (locale === "ar") return pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
  const page = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return page === "/" ? "/ar" : `/ar${page}`;
}

/**
 * Where the visitor is on the page now: the last shown section with an id whose top has passed the upper
 * third of the screen. Read from the scroll position, not the URL hash, which goes stale once the visitor
 * scrolls on from a link target. Empty at the very top.
 */
function currentPlace(): string {
  if (window.scrollY < 1) return "";
  let id = "";
  for (const el of document.querySelectorAll<HTMLElement>("main section[id]")) {
    // A hidden section (an emptied menu category) has no box, and its zero top would always match.
    if (el.getClientRects().length === 0) continue;
    if (el.getBoundingClientRect().top <= window.innerHeight / 3) id = el.id;
  }
  return id ? `#${id}` : "";
}

/**
 * Keeps the visitor on the same page in the other language, at the same section. Plain Next.js routing,
 * no i18n runtime.
 */
export function LanguageSwitcher({ className, locale, label, ariaLabel }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const target = locale === "ar" ? "en" : "ar";
  const href = otherLocalePath(pathname, locale);
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // Keep the query too: "Book this event" puts ?event=<id> in it, and the form reads it from there.
    const rest = window.location.search + currentPlace();
    if (!rest) return;
    e.preventDefault();
    router.push(href + rest);
  };
  return (
    <Link
      href={href}
      hrefLang={target}
      onClick={onClick}
      className={cn(
        "rounded-control text-fg inline-flex h-10 items-center px-3 text-sm font-medium underline-offset-4 hover:underline",
        className,
      )}
    >
      {/* The visible name in its own language, then the hint in the page's (WCAG 2.5.3: the accessible
          name starts with the visible text). */}
      <span lang={target}>{label}</span>
      <span className="sr-only">{` (${ariaLabel})`}</span>
    </Link>
  );
}
