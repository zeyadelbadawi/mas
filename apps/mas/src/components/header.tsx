"use client";

import { LanguageSwitcher } from "@mas/ui/language-switcher";
import Link from "next/link";
import { useRef } from "react";
import { MasWordmark } from "@/components/logo";

export type NavLink = { key: string; href: string; label: string };

export type HeaderProps = {
  locale: "en" | "ar";
  links: NavLink[];
  /** The page the visitor is on (its link is marked with the gold rule and aria-current). */
  current?: string;
  homeHref: string;
  cta: { href: string; label: string };
  labels: {
    nav: string;
    home: string;
    open: string;
    close: string;
    switchTo: string;
    switchToLabel: string;
  };
  /**
   * "overlay" (the home page): no bar, only a dark wash fading down from the top edge, so the scenes run
   * under the header. "solid": a dark gray bar, for pages with light reading sections.
   */
  mode?: "overlay" | "solid";
};

/**
 * The MAS header (D64): the gold wordmark, the six pages, the language and one gold action. Phones get a
 * full-screen menu in a native <dialog> (focus containment, an inert page, Escape and focus return without
 * a dialog library), as on Aroma. Labels and links come from the server, so no message formatter ships.
 */
export function Header({
  locale,
  links,
  current,
  homeHref,
  cta,
  labels,
  mode = "solid",
}: HeaderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <header
      data-mode={mode}
      className="mas-header fixed inset-x-0 top-0 z-50 text-[var(--mas-soft)]"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-8">
        <Link href={homeHref} aria-label={labels.home} className="shrink-0 text-[var(--mas-gold)]">
          <MasWordmark className="h-5 w-auto sm:h-6" />
        </Link>

        <nav aria-label={labels.nav} className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm font-light">
            {links.map((l) => (
              <li key={l.key}>
                <Link
                  href={l.href}
                  aria-current={current === l.key ? "page" : undefined}
                  className="mas-nav-link py-2"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher
            className="hidden text-sm text-current sm:inline-flex"
            locale={locale}
            label={labels.switchTo}
            ariaLabel={labels.switchToLabel}
          />
          <Link
            href={cta.href}
            className="mas-cut hidden h-10 items-center bg-[var(--mas-gold)] px-4 text-sm font-medium text-[var(--mas-ink)] transition-[filter] duration-200 hover:brightness-110 sm:inline-flex"
          >
            {cta.label}
          </Link>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="inline-flex size-10 items-center justify-center lg:hidden"
            aria-label={labels.open}
            aria-haspopup="dialog"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
            >
              <path d="M4 9h16M9 15h11" />
            </svg>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={labels.nav}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[var(--mas-ink)] p-0 text-[var(--mas-soft)] backdrop:bg-transparent"
      >
        <div className="flex h-full flex-col px-6 pt-5 pb-10">
          <div className="flex items-center justify-between">
            <MasWordmark className="h-5 w-auto text-[var(--mas-gold)]" />
            <button
              type="button"
              onClick={close}
              className="inline-flex size-10 items-center justify-center"
              aria-label={labels.close}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label={labels.nav} className="mt-14 flex-1">
            <ul className="flex flex-col gap-5">
              {links.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    onClick={close}
                    aria-current={current === l.key ? "page" : undefined}
                    className="mas-nav-link text-3xl font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center justify-between gap-4">
            <LanguageSwitcher
              locale={locale}
              label={labels.switchTo}
              ariaLabel={labels.switchToLabel}
            />
            <Link
              href={cta.href}
              onClick={close}
              className="mas-cut inline-flex h-12 items-center bg-[var(--mas-gold)] px-5 font-medium text-[var(--mas-ink)]"
            >
              {cta.label}
            </Link>
          </div>
        </div>
      </dialog>
    </header>
  );
}
