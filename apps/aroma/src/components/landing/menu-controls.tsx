"use client";

import { useEffect, useId, useRef, useState } from "react";

export type MenuControlsLabels = {
  search: string;
  searchPlaceholder: string;
  categories: string;
  clear: string;
  /** Plural templates by Intl.PluralRules category ("#" = count); "zero" is used for 0. */
  resultsForms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
};

type Group = { id: string; name: string; sections: string[] };

/**
 * The menu's only client code: search and the sticky bar of Aroma's five menus (Breakfast, Food, Drinks,
 * Dessert, Kids), as on the client's digital menu. The dishes are server-rendered HTML; search hides them in
 * place (data-search), so nothing is re-rendered and the menu stays readable without JS.
 */
export function MenuControls({
  groups,
  labels,
  locale,
}: {
  groups: Group[];
  labels: MenuControlsLabels;
  locale: string;
}) {
  const searchId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([]);
  const [active, setActive] = useState(groups[0]?.id ?? "");
  const filtering = query.trim() !== "";
  const results = (n: number) => {
    const form =
      n === 0
        ? (labels.resultsForms.zero ?? labels.resultsForms.other)
        : (labels.resultsForms[new Intl.PluralRules(locale).select(n)] ??
          labels.resultsForms.other);
    return form.replace("#", String(n));
  };

  /** Hides non-matching dishes, then empty sections and groups, in the server-rendered list. */
  const apply = (next: string) => {
    setQuery(next);
    const menu = document.getElementById("menu");
    if (!menu) return;
    const q = next.trim().toLowerCase();
    let shown = 0;
    menu.querySelectorAll<HTMLElement>("[data-menu-section]").forEach((section) => {
      let visible = 0;
      section.querySelectorAll<HTMLElement>("[data-item]").forEach((item) => {
        const match = !q || (item.dataset.search ?? "").includes(q);
        item.hidden = !match;
        if (match) visible++;
      });
      section.hidden = visible === 0;
      shown += visible;
    });
    const empty: string[] = [];
    menu.querySelectorAll<HTMLElement>("[data-menu-group]").forEach((group) => {
      const any = [...group.querySelectorAll<HTMLElement>("[data-menu-section]")].some(
        (s) => !s.hidden,
      );
      group.hidden = !any;
      if (!any) empty.push(group.dataset.menuGroup ?? "");
    });
    setCount(shown);
    setHiddenGroups(empty);
  };

  // Scroll-spy for the bar: the group whose section is in the reading line.
  useEffect(() => {
    const menu = document.getElementById("menu");
    if (!menu) return;
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.menuGroup;
            if (id) setActive(id);
          }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    menu.querySelectorAll("[data-menu-group]").forEach((el) => spy.observe(el));
    return () => spy.disconnect();
  }, []);

  // Keep the current chip visible in the bar without moving the page.
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip) return;
    const b = bar.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bar.scrollBy({
      left: c.left + c.width / 2 - (b.left + b.width / 2),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active]);

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-end gap-3 px-4 sm:px-8">
        <div className="flex w-full max-w-sm flex-col gap-1.5">
          <label htmlFor={searchId} className="text-fg text-sm font-medium">
            {labels.search}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => apply(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="rounded-control border-line bg-surface-2 text-fg placeholder:text-muted focus-visible:border-focus focus-visible:ring-focus/40 h-12 w-full border px-5 focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
        {filtering ? (
          <button
            type="button"
            onClick={() => apply("")}
            className="text-muted hover:text-fg h-12 px-2 text-sm underline underline-offset-4"
          >
            {labels.clear}
          </button>
        ) : null}
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
          {groups
            .filter((g) => !hiddenGroups.includes(g.id))
            .map((g) => (
              <a
                key={g.id}
                href={`#menu-group-${g.id}`}
                data-chip={g.id}
                aria-current={g.id === active ? "location" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${g.id === active ? "bg-accent text-accent-fg" : "text-fg/80 hover:text-fg"}`}
              >
                {g.name}
              </a>
            ))}
        </div>
      </nav>
    </>
  );
}
