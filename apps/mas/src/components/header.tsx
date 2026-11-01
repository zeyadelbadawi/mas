"use client";

import { LanguageSwitcher } from "@mas/ui/language-switcher";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AromaPetal, AromaWordmark, CovyWordmark } from "@/components/brand-marks";
import { MasWordmark } from "@/components/logo";

export type NavLink = { key: string; href: string; label: string };

/** One brand in the "Our brands" menu: its page on MAS and the picture seen through its door. */
export type BrandMenuItem = {
  id: "covy" | "aroma";
  name: string;
  href: string;
  line: string;
  image: { src: string; position: string };
};

function BrandLogo({ id, small = false }: { id: BrandMenuItem["id"]; small?: boolean }) {
  if (id === "covy") return <CovyWordmark className={small ? "h-5 w-auto" : "h-7 w-auto"} />;
  return (
    <span className="flex items-center gap-2">
      <AromaPetal className={small ? "h-6 w-auto" : "h-8 w-auto"} />
      <AromaWordmark className={small ? "h-3.5 w-auto" : "h-4.5 w-auto"} />
    </span>
  );
}

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
  /** The two brands, for the "Our brands" menu. */
  brandsMenu: { label: string; all: string; items: BrandMenuItem[] };
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
  brandsMenu,
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
            {links.map((l) =>
              l.key === "brands" ? (
                <BrandsMenu key={l.key} link={l} current={current === l.key} menu={brandsMenu} />
              ) : (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    aria-current={current === l.key ? "page" : undefined}
                    className="mas-nav-link py-2"
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
                  {l.key === "brands" ? (
                    <ul className="mt-4 flex gap-3">
                      {brandsMenu.items.map((b) => (
                        <li key={b.id} className="flex-1">
                          <Link
                            href={b.href}
                            onClick={close}
                            aria-label={b.name}
                            className="mas-cut flex h-16 items-center justify-center border border-[var(--mas-gold)]/35 [--cut:0.75rem]"
                          >
                            <BrandLogo id={b.id} small />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
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

/**
 * "Our brands" with its menu (D67): two small doors, as at the end of the home page's walk. Each card shows
 * the picture seen through that brand's door in a thin gold frame, with its mark and one line; on opening
 * the two are revealed one after the other along the wordmark's diagonal, and the hovered door lights up.
 * Opens on hover with a mouse, and with the arrow button from a keyboard or a touch screen; Escape closes it
 * and returns focus. The pictures load only once it has been opened, so they never compete with the scenes.
 */
function BrandsMenu({
  link,
  current,
  menu,
}: {
  link: NavLink;
  current: boolean;
  menu: HeaderProps["brandsMenu"];
}) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const show = (next: boolean) => {
    window.clearTimeout(closeTimerRef.current);
    setOpen(next);
    if (next) setEverOpened(true);
  };
  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  return (
    // Hover only adds to the button below, which opens the menu from a keyboard or a touch screen.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && show(true)}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        closeTimerRef.current = window.setTimeout(() => show(false), 160);
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
      <span className="flex items-center gap-1.5">
        <Link
          href={link.href}
          aria-current={current ? "page" : undefined}
          className="mas-nav-link py-2"
        >
          {link.label}
        </Link>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="brands-menu"
          aria-label={menu.label}
          onClick={() => show(!open)}
          className="inline-flex size-6 items-center justify-center"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className={`size-2.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
          >
            <path d="M2 4.5l4 3.5 4-3.5" />
          </svg>
        </button>
      </span>
      <div
        id="brands-menu"
        data-open={open ? "" : undefined}
        hidden={!everOpened}
        className="mas-brands-menu absolute top-full left-1/2 pt-6"
      >
        <div className="w-[34rem] border border-[var(--mas-silver)]/12 bg-[var(--mas-ink)] p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)]">
          <ul className="grid grid-cols-2 gap-4">
            {menu.items.map((b, i) => (
              <MenuDoor
                key={b.id}
                item={b}
                index={i}
                load={everOpened}
                onNavigate={() => show(false)}
              >
                <BrandLogo id={b.id} />
              </MenuDoor>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-[var(--mas-silver)]/10 pt-4 text-sm">
            <span className="mas-rule text-xs font-light tracking-[0.12em] text-[var(--mas-soft)]/70 rtl:tracking-normal">
              {menu.label}
            </span>
            <Link
              href={link.href}
              onClick={() => show(false)}
              className="mas-rule-link inline-flex items-center py-1 font-medium"
            >
              {menu.all}
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function MenuDoor({
  item,
  index,
  load,
  onNavigate,
  children,
}: {
  item: BrandMenuItem;
  index: number;
  load: boolean;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <li className="mas-menu-door" style={{ animationDelay: `${90 + index * 90}ms` }}>
      <Link
        href={item.href}
        onClick={onNavigate}
        className="group relative block aspect-[4/5] overflow-hidden bg-[var(--brand-surface)]"
      >
        {load ? (
          // eslint-disable-next-line @next/next/no-img-element -- the door's poster on the media host
          <img
            src={item.image.src}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-700 ease-[var(--brand-ease)] group-hover:scale-[1.05] group-hover:brightness-110"
            style={{ objectPosition: item.image.position }}
          />
        ) : null}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--mas-ink)_8%,color-mix(in_srgb,var(--mas-ink)_55%,transparent)_45%,transparent_75%)]"
        />
        {/* The door frame: thin gold, lit on hover. */}
        <span aria-hidden="true" className="mas-menu-frame absolute inset-2.5" />
        <span className="absolute inset-x-5 bottom-5 flex flex-col items-start gap-2 text-[var(--mas-soft)]">
          <span className="sr-only">{item.name}</span>
          {children}
          <span className="text-xs leading-snug font-light text-[var(--mas-soft)]/85">
            {item.line}
          </span>
        </span>
      </Link>
    </li>
  );
}
