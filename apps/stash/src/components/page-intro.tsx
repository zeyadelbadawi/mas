import { imageSlot } from "@mas/content";
import { ImageSlot, PlaceholderBadge } from "@mas/ui";
import type { ReactNode } from "react";

/**
 * An inner page's opening (D77): the title in ExtraBold, its lead, and the page's banner under them inside
 * printer's crop marks (the proof before it's made). The banner is a placeholder slot until it is made (D79).
 */
export function PageIntro({
  locale,
  title,
  lead,
  banner,
  children,
}: {
  locale: "en" | "ar";
  title: string;
  lead: string;
  /** Image slot id, e.g. "stash.banner.about". */
  banner?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 pb-12 sm:px-8 sm:pt-20">
      <h1 className="max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl rtl:leading-[1.25] rtl:tracking-normal">
        {title}
      </h1>
      <p className="text-muted mt-6 max-w-2xl text-lg leading-relaxed text-pretty">{lead}</p>
      {children}
      {banner ? (
        <div className="st-crop rounded-card mt-14 sm:mt-16">
          <ImageSlot
            {...imageSlot(banner)}
            locale={locale}
            priority
            className="rounded-card"
            sizes="(min-width: 1280px) 1216px, 100vw"
          />
        </div>
      ) : null}
    </section>
  );
}

/** A note for a part of the page that a later phase fills in (labelled, never passed off as content). */
export function SoonNote({ label, text }: { label: string; text: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
      <div className="rounded-card border-line flex flex-col items-start gap-3 border border-dashed p-6 sm:flex-row sm:items-center sm:gap-5">
        <PlaceholderBadge label={label} />
        <p className="text-muted text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
