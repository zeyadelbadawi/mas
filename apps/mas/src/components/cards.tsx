import { imageSlot, type Insight } from "@mas/content";
import { formatDate } from "@mas/i18n";
import { ImageSlot } from "@mas/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import type { WhatsOnItem } from "@/lib/whats-on";

/**
 * A section heading: the title, the gold rule from the tagline drawn under it as it scrolls in, and an
 * optional intro and action at the end of the line.
 */
export function SectionHeading({
  id,
  title,
  intro,
  action,
  as: Tag = "h2",
}: {
  id: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 sm:mb-16">
      <div className="max-w-2xl">
        <Tag
          id={id}
          className="mas-heading text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl rtl:leading-[1.4] rtl:tracking-normal"
        >
          {title}
        </Tag>
        {intro ? (
          <p className="text-muted mt-6 text-lg leading-relaxed font-light">{intro}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** A quiet text link with the gold rule after it (no arrows, D64). */
export function RuleLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`mas-rule-link inline-flex items-center py-2 text-sm font-medium ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

/** One event or night: image with the diagonal corner, brand, when, title, summary. */
export function EventCard({ item, locale }: { item: WhatsOnItem; locale: "en" | "ar" }) {
  const slot = imageSlot(item.imageSlotId);
  return (
    <article className="flex flex-col">
      <div className="mas-cut [--cut:1.75rem]">
        <ImageSlot
          {...slot}
          locale={locale}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      <p className="mt-5 text-sm text-[var(--brand-accent-text)]">
        {item.brandName}
        <span className="text-muted"> · {item.when}</span>
      </p>
      <h3 className="mt-2 text-xl font-medium">{item.title}</h3>
      <p className="text-muted mt-2 leading-relaxed font-light">{item.summary}</p>
    </article>
  );
}

/** One article: image, date, title, excerpt; the whole card is the link. */
export function InsightCard({
  item,
  href,
  locale,
}: {
  item: Insight;
  href: string;
  locale: "en" | "ar";
}) {
  const slot = imageSlot(item.imageSlotId);
  return (
    <article className="group relative flex flex-col">
      <div className="mas-cut [--cut:1.75rem]">
        <ImageSlot
          {...slot}
          locale={locale}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
      <p className="text-muted mt-5 text-sm">
        <time dateTime={item.publishedAt}>
          {formatDate(new Date(`${item.publishedAt}T12:00:00+02:00`), locale, {
            weekday: undefined,
          })}
        </time>
      </p>
      <h3 className="mt-2 text-xl font-medium decoration-[var(--mas-gold)] decoration-1 underline-offset-[0.3em] group-hover:underline">
        <Link href={href} className="after:absolute after:inset-0">
          {item.title[locale]}
        </Link>
      </h3>
      <p className="text-muted mt-2 leading-relaxed font-light">{item.excerpt[locale]}</p>
    </article>
  );
}
