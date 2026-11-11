import { imageSlot, type StashRange } from "@mas/content";
import { ImageSlot } from "@mas/ui";
import Link from "next/link";

/** A range as a card: its banner cropped, its number, name and summary, the whole card a link. */
export function RangeCard({
  range,
  locale,
  href,
  countLabel,
}: {
  range: StashRange;
  locale: "en" | "ar";
  href: string;
  /** e.g. "8 items", already in the page's language. */
  countLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-card bg-surface flex h-full flex-col overflow-hidden transition-colors duration-300 hover:bg-[var(--brand-surface-2)]"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <ImageSlot
          {...imageSlot(`stash.range.${range.slug}`)}
          locale={locale}
          className="h-full object-cover transition-transform duration-700 ease-[var(--brand-ease)] group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-muted flex items-center justify-between text-xs font-medium">
          <span className="tabular-nums">{String(range.order).padStart(2, "0")}</span>
          <span>{countLabel}</span>
        </span>
        <h3 className="text-lg leading-snug font-semibold">{range.name[locale]}</h3>
        <p className="text-muted text-sm leading-relaxed">{range.summary[locale]}</p>
      </div>
    </Link>
  );
}
