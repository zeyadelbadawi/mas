"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

/** Keeps the visitor on the same page in the other language. Plain Next.js routing, no i18n runtime. */
export function LanguageSwitcher({ className, locale, label, ariaLabel }: Props) {
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";
  return (
    <Link
      href={otherLocalePath(pathname, locale)}
      hrefLang={target}
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
