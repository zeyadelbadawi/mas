"use client";

import { LanguageSwitcher } from "@mas/ui/language-switcher";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type NavKey = "packaging" | "design" | "howItWorks" | "materials" | "about" | "contact";
export type NavLink = { key: NavKey; href: string; label: string };
export type RangeLink = { order: number; name: string; summary: string; href: string };

export type HeaderProps = {
  locale: "en" | "ar";
  links: NavLink[];
  current?: NavKey;
  homeHref: string;
  quote: { href: string; label: string };
  ranges: RangeLink[];
  allPackaging: { href: string; label: string };
  /** The wordmark, drawn on the server so its paths stay out of this component's JavaScript. */
  logo: ReactNode;
  labels: {
    nav: string;
    home: string;
    open: string;
    close: string;
    switchTo: string;
    switchToLabel: string;
  };
};

/**
 * The Stash header (D77): the wordmark, the pages, Packaging with a menu of the eight ranges, the language
 * and one action, Get a quote. On paper, with a hairline under it. Phones get a full-screen menu in a
 * native <dialog> (focus containment, an inert page, Escape and focus return without a library).
 */
export function Header({
  locale,
  links,
  current,
  homeHref,
  quote,
  ranges,
  allPackaging,
  logo,
  labels,
}: HeaderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <header className="border-line/80 bg-bg/95 supports-[backdrop-filter]:bg-bg/85 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-[4.5rem] sm:px-8">
        <Link href={homeHref} aria-label={labels.home} className="shrink-0 text-[var(--st-brown)]">
          {logo}
        </Link>

        <nav aria-label={labels.nav} className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            {links.map((l) =>
              l.key === "packaging" ? (
                <PackagingMenu
                  key={l.key}
                  link={l}
                  current={current === l.key}
                  ranges={ranges}
                  allPackaging={allPackaging}
                />
              ) : (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    aria-current={current === l.key ? "page" : undefined}
                    className="st-nav-link py-2"
                  >
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher
            className="hidden text-sm font-medium text-current sm:inline-flex"
            locale={locale}
            label={labels.switchTo}
            ariaLabel={labels.switchToLabel}
          />
          <Link
            href={quote.href}
            className="rounded-control hidden h-10 items-center bg-[var(--st-brown)] px-4 text-sm font-medium text-[var(--st-paper)] transition-colors duration-200 hover:bg-[var(--st-brown-deep)] sm:inline-flex"
          >
            {quote.label}
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
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <path d="M4 8h16M4 16h11" />
            </svg>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={labels.nav}
        className="bg-bg text-fg m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-transparent"
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pt-4 pb-10">
          <div className="flex items-center justify-between">
            <span className="text-[var(--st-brown)]">{logo}</span>
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
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label={labels.nav} className="mt-10 flex-1">
            <ul className="flex flex-col gap-5">
              {links.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    onClick={close}
                    aria-current={current === l.key ? "page" : undefined}
                    className="st-nav-link text-2xl font-semibold"
                  >
                    {l.label}
                  </Link>
                  {l.key === "packaging" ? (
                    <ul className="mt-3 grid grid-cols-1 gap-2 ps-1 text-sm sm:grid-cols-2">
                      {ranges.map((r) => (
                        <li key={r.href}>
                          <Link
                            href={r.href}
                            onClick={close}
                            className="text-muted hover:text-fg flex gap-3 py-1"
                          >
                            <span className="tabular-nums">{String(r.order).padStart(2, "0")}</span>
                            {r.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-10 flex items-center justify-between gap-4">
            <LanguageSwitcher
              locale={locale}
              label={labels.switchTo}
              ariaLabel={labels.switchToLabel}
            />
            <Link
              href={quote.href}
              onClick={close}
              className="rounded-control inline-flex h-12 items-center bg-[var(--st-brown)] px-5 font-medium text-[var(--st-paper)]"
            >
              {quote.label}
            </Link>
          </div>
        </div>
      </dialog>
    </header>
  );
}

/**
 * Packaging, with the eight ranges under it. Opens on hover with a mouse and with its arrow button from a
 * keyboard or a touch screen; Escape closes it and returns focus to the button.
 */
function PackagingMenu({
  link,
  current,
  ranges,
  allPackaging,
}: {
  link: NavLink;
  current: boolean;
  ranges: RangeLink[];
  allPackaging: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const show = (next: boolean) => {
    window.clearTimeout(timer.current);
    setOpen(next);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    // Hover only adds to the button below, which opens the menu from a keyboard or a touch screen.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && show(true)}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        timer.current = window.setTimeout(() => show(false), 160);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          show(false);
          buttonRef.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) show(false);
      }}
    >
      <span className="flex items-center gap-1">
        <Link
          href={link.href}
          aria-current={current ? "page" : undefined}
          className="st-nav-link py-2"
        >
          {link.label}
        </Link>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="packaging-menu"
          aria-label={link.label}
          onClick={() => show(!open)}
          className="inline-flex size-6 items-center justify-center"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className={`size-2.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          >
            <path d="M2 4.5l4 3.5 4-3.5" />
          </svg>
        </button>
      </span>
      <div
        id="packaging-menu"
        data-open={open ? "" : undefined}
        className="st-menu-panel absolute start-0 top-full pt-4"
      >
        {/* Following any link in the panel closes it. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- only catches clicks on the links inside */}
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) show(false);
          }}
          className="rounded-card border-line bg-bg w-[40rem] max-w-[calc(100vw-2rem)] border p-3 shadow-[0_24px_60px_-24px_rgb(91_69_55/0.35)]"
        >
          <ul className="grid grid-cols-2 gap-1">
            {ranges.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="rounded-control hover:bg-surface flex gap-3 p-3 transition-colors duration-200"
                >
                  <span className="text-muted pt-0.5 text-xs font-medium tabular-nums">
                    {String(r.order).padStart(2, "0")}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{r.name}</span>
                    <span className="text-muted line-clamp-2 text-xs leading-relaxed font-normal">
                      {r.summary}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-line mt-2 border-t px-3 pt-3 pb-1">
            <Link href={allPackaging.href} className="st-ruled text-sm font-semibold">
              {allPackaging.label}
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}
