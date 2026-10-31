"use client";

import { Button } from "@mas/ui";
import { LanguageSwitcher } from "@mas/ui/language-switcher";
import { useRef } from "react";
import { AromaPetal, AromaWordmark } from "@/components/logo";
import { BookLink } from "./book-link";
import { useWalkHeader } from "./walk-header";

const SECTIONS = ["menu", "branches", "nights", "story"] as const;

export type HeaderLabels = Record<
  (typeof SECTIONS)[number] | "label" | "book" | "open" | "close",
  string
> & {
  switchTo: string;
  switchToLabel: string;
};

/**
 * Fixed, translucent marble bar; over the three scroll scenes the bar gives way to a soft wash toned by the
 * footage (as on COVY, D47/D51; see useWalkHeader and .aroma-header in globals.css). Phones get a full-screen menu in a native
 * <dialog> (showModal gives focus containment, an inert page behind, Escape and focus return without a
 * dialog library).
 */
/** Labels come from the server, so this client component ships no message formatter. */
export function Header({ labels, locale }: { labels: HeaderLabels; locale: "en" | "ar" }) {
  const t = (key: keyof HeaderLabels) => labels[key];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const close = () => dialogRef.current?.close();
  useWalkHeader(headerRef);

  return (
    <header
      ref={headerRef}
      data-mode="page"
      className="aroma-header bg-bg/85 border-line/60 text-fg fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md"
    >
      {/* Fills with the walk through the three scenes; only shown over them. */}
      <span aria-hidden="true" className="aroma-header-progress" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2"
          aria-label={locale === "ar" ? "أروما لاونج" : "Aroma Lounge"}
        >
          <AromaPetal className="h-8 w-auto" />
          <AromaWordmark className="h-5 w-auto" />
        </a>

        <nav aria-label={t("label")} className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="underline-offset-8 opacity-80 hover:underline hover:opacity-100"
                >
                  {t(id)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher
            className="hidden text-current sm:inline-flex"
            locale={locale}
            label={labels.switchTo}
            ariaLabel={labels.switchToLabel}
          />
          <Button asChild size="sm">
            <BookLink>{t("book")}</BookLink>
          </Button>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="rounded-control inline-flex size-10 items-center justify-center lg:hidden"
            aria-label={t("open")}
            aria-haspopup="dialog"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
            >
              <path d="M4 8h16M4 16h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={t("label")}
        className="bg-bg text-fg m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-transparent"
      >
        <div className="flex h-full flex-col px-6 pt-5 pb-10">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AromaPetal className="h-8 w-auto" />
              <AromaWordmark className="h-5 w-auto" />
            </span>
            <button
              type="button"
              onClick={close}
              className="rounded-control inline-flex size-10 items-center justify-center"
              aria-label={t("close")}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav aria-label={t("label")} className="mt-12 flex-1">
            <ul className="flex flex-col gap-6">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={close} className="font-editorial text-4xl">
                    {t(id)}
                  </a>
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
            <Button asChild>
              <BookLink onNavigate={close}>{t("book")}</BookLink>
            </Button>
          </div>
        </div>
      </dialog>
    </header>
  );
}
