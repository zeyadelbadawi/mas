"use client";

import type { MenuTag } from "@mas/content";
import { useMotionEffect } from "@mas/motion/provider";
import { Button } from "@mas/ui";
import { useEffect, useId, useRef, useState } from "react";

const FILTERS: MenuTag[] = ["veg", "spicy", "signature", "new"];

export type MenuControlsLabels = {
  search: string;
  searchPlaceholder: string;
  filters: string;
  categories: string;
  clear: string;
  book: string;
  tags: Record<MenuTag, string>;
  /** Plural templates by Intl.PluralRules category ("#" = count); "zero" is used for 0. */
  resultsForms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
};

type Props = {
  categories: { id: string; name: string }[];
  labels: MenuControlsLabels;
  locale: string;
};

/**
 * The menu's only client code: search, filters, the sticky section bar and "Book a table".
 * The dishes themselves are server-rendered HTML; filtering hides them in place
 * (data-search / data-tags), so nothing is re-rendered and the menu stays readable without JS.
 */
export function MenuControls({ categories, labels, locale }: Props) {
  const searchId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<MenuTag[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [inView, setInView] = useState(false);
  const filtering = query.trim() !== "" || tags.length > 0;
  const results = (n: number) => {
    const form =
      n === 0
        ? (labels.resultsForms.zero ?? labels.resultsForms.other)
        : (labels.resultsForms[new Intl.PluralRules(locale).select(n)] ??
          labels.resultsForms.other);
    return form.replace("#", String(n));
  };

  /** Hides non-matching dishes (and empty sections) in the server-rendered list. */
  const apply = (nextQuery: string, nextTags: MenuTag[]) => {
    setQuery(nextQuery);
    setTags(nextTags);
    const menu = document.getElementById("menu");
    if (!menu) return;
    const q = nextQuery.trim().toLowerCase();
    let shown = 0;
    const emptySections: string[] = [];
    menu.querySelectorAll<HTMLElement>("[data-menu-section]").forEach((section) => {
      let visible = 0;
      section.querySelectorAll<HTMLElement>("[data-item]").forEach((item) => {
        const itemTags = (item.dataset.tags ?? "").split(" ");
        const match =
          (!q || (item.dataset.search ?? "").includes(q)) &&
          nextTags.every((tag) => itemTags.includes(tag));
        item.hidden = !match;
        if (match) visible++;
      });
      section.hidden = visible === 0;
      if (visible === 0) emptySections.push(section.id.replace("menu-", ""));
      section
        .querySelectorAll<HTMLElement>(".menu-hero")
        .forEach((hero) => (hero.hidden = q !== "" || nextTags.length > 0));
      shown += visible;
    });
    setCount(shown);
    setHiddenSections(emptySections);
  };

  // Scroll-spy and "is the menu on screen" for the floating button.
  useEffect(() => {
    const menu = document.getElementById("menu");
    if (!menu) return;
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace("menu-", ""));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    menu.querySelectorAll("[data-menu-section]").forEach((el) => spy.observe(el));
    const whole = new IntersectionObserver(([e]) => setInView(Boolean(e?.isIntersecting)), {
      rootMargin: "0px 0px -40% 0px",
    });
    whole.observe(menu);
    return () => {
      spy.disconnect();
      whole.disconnect();
    };
  }, []);

  // Keep the current chip visible in the bar without moving the page.
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip) return;
    // A viewport-coordinate difference is correct in LTR and RTL, whatever the scrollLeft convention.
    const b = bar.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bar.scrollBy({
      left: c.left + c.width / 2 - (b.left + b.width / 2),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active]);

  // Section photos open from a narrow band as they arrive (scrubbed, reversible).
  useMotionEffect(({ gsap }) => {
    gsap.utils.toArray<HTMLElement>("#menu .menu-hero").forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: "inset(18% 12% 18% 12% round 999px 999px 0 0)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)",
          ease: "sine.inOut",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 40%", scrub: 1 },
        },
      );
    });
  }, []);

  const toggle = (tag: MenuTag) =>
    apply(query, tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag]);

  return (
    <>
      <div className="mx-auto mt-6 grid max-w-7xl gap-4 px-4 sm:px-8 md:grid-cols-[minmax(0,22rem)_1fr] md:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={searchId} className="text-fg text-sm font-medium">
            {labels.search}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => apply(e.target.value, tags)}
            placeholder={labels.searchPlaceholder}
            className="rounded-control border-line bg-surface text-fg placeholder:text-muted focus-visible:border-focus focus-visible:ring-focus/40 h-12 w-full border px-4 focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="text-fg mb-1.5 text-sm font-medium">{labels.filters}</legend>
          {FILTERS.map((tag) => {
            const on = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(tag)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-fg bg-fg text-bg" : "border-line text-fg hover:border-fg"}`}
              >
                {labels.tags[tag]}
              </button>
            );
          })}
          {filtering ? (
            <button
              type="button"
              onClick={() => apply("", [])}
              className="text-muted hover:text-fg px-2 text-sm underline underline-offset-4"
            >
              {labels.clear}
            </button>
          ) : null}
        </fieldset>
      </div>
      <p role="status" className="text-muted mx-auto mt-3 min-h-5 max-w-7xl px-4 text-sm sm:px-8">
        {filtering && count !== null ? results(count) : ""}
      </p>

      <nav
        aria-label={labels.categories}
        className="bg-bg/90 border-line/70 sticky top-16 z-30 mt-4 border-y backdrop-blur"
      >
        <div
          ref={barRef}
          className="mx-auto flex max-w-7xl [scrollbar-width:none] gap-1 overflow-x-auto px-4 py-2 sm:px-8"
        >
          {categories
            .filter((c) => !hiddenSections.includes(c.id))
            .map((c) => (
              <a
                key={c.id}
                href={`#menu-${c.id}`}
                data-chip={c.id}
                aria-current={c.id === active ? "location" : undefined}
                className={`rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors ${c.id === active ? "bg-accent text-accent-fg" : "text-fg/80 hover:text-fg"}`}
              >
                {c.name}
              </a>
            ))}
        </div>
      </nav>

      {/* Phones only: the header's "Book a table" is hidden there. */}
      <div
        className={`fixed end-4 bottom-4 z-40 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-y-0 sm:hidden ${inView ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
        aria-hidden={!inView}
      >
        <Button asChild className="shadow-lg">
          <a href="#reserve" tabIndex={inView ? 0 : -1}>
            {labels.book}
          </a>
        </Button>
      </div>
    </>
  );
}
