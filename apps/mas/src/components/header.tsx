"use client";

import { LanguageSwitcher } from "@mas/ui/language-switcher";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MasWordmark } from "@/components/logo";

export type NavLink = { key: string; href: string; label: string };

/** One brand in the "Our brands" menu: its page on MAS and the picture seen through its door. */
export type BrandMenuItem = {
  id: "covy" | "aroma";
  name: string;
  href: string;
  line: string;
  image: { src: string; position: string };
  /** The brand's mark, drawn on the server (its SVG paths stay out of the page's JavaScript). */
  logo: ReactNode;
  logoSmall: ReactNode;
};

/** One service in the "Services" menu. */
export type ServiceMenuItem = { order: number; title: string; href: string };

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
  brandsMenu: { items: BrandMenuItem[] };
  /** The nine services, for the "Services" menu. */
  servicesMenu: { items: ServiceMenuItem[] };
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
  servicesMenu,
}: HeaderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();
  // On the home page the scenes download behind the splash: the header's pages are not fetched ahead
  // while they do (D29 budget, D62); a click still loads them at once.
  const prefetch = mode === "overlay" ? false : undefined;

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
                <NavMenu
                  key={l.key}
                  id="brands-menu"
                  link={l}
                  current={current === l.key}
                  prefetch={prefetch}
                  panelClass="w-[34rem]"
                >
                  {(load) => (
                    <ul className="grid grid-cols-2 gap-4">
                      {brandsMenu.items.map((b, i) => (
                        <MenuDoor prefetch={prefetch} key={b.id} item={b} index={i} load={load}>
                          {b.logo}
                        </MenuDoor>
                      ))}
                    </ul>
                  )}
                </NavMenu>
              ) : l.key === "services" ? (
                <NavMenu
                  key={l.key}
                  id="services-menu"
                  link={l}
                  current={current === l.key}
                  prefetch={prefetch}
                  panelClass="w-[44rem]"
                >
                  {() => <ServicesGrid items={servicesMenu.items} prefetch={prefetch} />}
                </NavMenu>
              ) : (
                <li key={l.key}>
                  <Link
                    prefetch={prefetch}
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
            prefetch={prefetch}
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
                    prefetch={prefetch}
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
                            prefetch={prefetch}
                            href={b.href}
                            onClick={close}
                            aria-label={b.name}
                            className="mas-cut flex h-16 items-center justify-center border border-[var(--mas-gold)]/35 [--cut:0.75rem]"
                          >
                            {b.logoSmall}
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
              prefetch={prefetch}
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
 * A header link with a small menu under it (D67, D69): "Our brands" and "Services". Opens on hover with a
 * mouse, and with the arrow button from a keyboard or a touch screen; Escape closes it and returns focus.
 * The panel is rendered only once it has been opened, so its pictures never compete with the scenes. Its
 * foot is the link's own name, with the gold rule, leading to the page.
 */
function NavMenu({
  id,
  link,
  current,
  prefetch,
  panelClass,
  children,
}: {
  id: string;
  link: NavLink;
  current: boolean;
  prefetch: false | undefined;
  /** The panel's width. */
  panelClass: string;
  /** The panel's content; `load` is true once it has been opened (its pictures may load). */
  children: (load: boolean) => ReactNode;
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
          prefetch={prefetch}
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
          aria-controls={id}
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
            strokeWidth={1.4}
          >
            <path d="M2 4.5l4 3.5 4-3.5" />
          </svg>
        </button>
      </span>
      <div
        id={id}
        data-open={open ? "" : undefined}
        hidden={!everOpened}
        className="mas-brands-menu absolute top-full left-1/2 pt-6"
      >
        {/* Following any link in the panel closes it. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- only catches clicks on the links inside */}
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) show(false);
          }}
          className={`max-w-[calc(100vw-2rem)] border border-[var(--mas-silver)]/12 bg-[var(--mas-ink)] p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ${panelClass}`}
        >
          {children(everOpened)}
          <div className="mt-5 border-t border-[var(--mas-silver)]/10 pt-4">
            <Link
              prefetch={prefetch}
              href={link.href}
              className="mas-rule-link inline-flex items-center py-1 text-sm font-medium"
            >
              {link.label}
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * The services menu (D69): the nine services as a numbered grid (their order is the client's own), each a
 * small square of the identity: the gold number, the name, and the gold rule drawing across its top on
 * hover. They are revealed one after another along the wordmark's diagonal, as the brands' doors are.
 */
function ServicesGrid({
  items,
  prefetch,
}: {
  items: ServiceMenuItem[];
  prefetch: false | undefined;
}) {
  return (
    <ul className="grid grid-cols-3 gap-px bg-[var(--mas-silver)]/10">
      {items.map((s, i) => (
        <li
          key={s.href}
          className="mas-menu-door bg-[var(--mas-ink)]"
          style={{ animationDelay: `${60 + i * 45}ms` }}
        >
          <Link
            prefetch={prefetch}
            href={s.href}
            className="mas-menu-service group relative flex h-full min-h-[6.5rem] flex-col gap-2 p-4 transition-colors duration-300 hover:bg-[var(--brand-surface)]"
          >
            <span className="text-xs font-light text-[var(--mas-gold)] tabular-nums">
              {String(s.order).padStart(2, "0")}
            </span>
            <span className="text-sm leading-snug text-[var(--mas-soft)] transition-colors duration-300 group-hover:text-[var(--mas-gold)]">
              {s.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MenuDoor({
  item,
  index,
  load,
  prefetch,
  children,
}: {
  item: BrandMenuItem;
  index: number;
  load: boolean;
  prefetch: false | undefined;
  children: ReactNode;
}) {
  return (
    <li className="mas-menu-door" style={{ animationDelay: `${90 + index * 90}ms` }}>
      <Link
        prefetch={prefetch}
        href={item.href}
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
