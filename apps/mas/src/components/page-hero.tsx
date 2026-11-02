import { ImageSlot, type ImageSlotProps } from "@mas/ui";
import type { ReactNode } from "react";

/**
 * The dark top of an inner page (D64: dark heroes, light reading sections below): the page title with the
 * gold rule drawn under it, and one lead paragraph. With a `banner` (D72) the hero becomes a full-width
 * photograph: the room sits in its far third, the text on a dark wash at the start side. The pictures
 * hold no text, so in Arabic the picture is mirrored and the wash and the room change sides with the text.
 */
export function PageHero({
  title,
  lead,
  before,
  after,
  banner,
}: {
  title: string;
  lead?: string;
  before?: ReactNode;
  after?: ReactNode;
  banner?: ImageSlotProps;
}) {
  const text = (
    <div className="mx-auto w-full max-w-7xl">
      {before}
      <h1 className="mas-heading max-w-4xl text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl rtl:leading-[1.35] rtl:tracking-normal">
        {title}
      </h1>
      {lead ? (
        <p className="mt-8 max-w-2xl text-lg leading-relaxed font-light text-[var(--mas-soft)]/85 sm:text-xl">
          {lead}
        </p>
      ) : null}
      {after}
    </div>
  );

  if (!banner)
    return <section className="px-4 pt-36 pb-20 sm:px-8 sm:pt-48 sm:pb-28">{text}</section>;

  return (
    <section className="relative isolate flex min-h-[min(88svh,56rem)] items-end overflow-hidden px-4 pt-36 pb-16 sm:px-8 sm:pt-48 sm:pb-24">
      <ImageSlot
        {...banner}
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_50%] rtl:-scale-x-100"
      />
      {/* The wash under the text, from the start side; on narrow screens the text covers the whole picture. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--mas-ink)_0%,color-mix(in_srgb,var(--mas-ink)_82%,transparent)_34%,color-mix(in_srgb,var(--mas-ink)_20%,transparent)_68%,transparent_100%)] rtl:bg-[linear-gradient(to_left,var(--mas-ink)_0%,color-mix(in_srgb,var(--mas-ink)_82%,transparent)_34%,color-mix(in_srgb,var(--mas-ink)_20%,transparent)_68%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--mas-ink)_50%,transparent)] lg:hidden"
      />
      {/* Under the header, and into the page below. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(to_bottom,var(--mas-ink),transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-[linear-gradient(to_top,var(--mas-ink),transparent)]"
      />
      {text}
    </section>
  );
}
