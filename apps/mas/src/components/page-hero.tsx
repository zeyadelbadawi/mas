import type { ReactNode } from "react";

/**
 * The dark top of an inner page (D64: dark heroes, light reading sections below): the page title with the
 * gold rule drawn under it, and one lead paragraph.
 */
export function PageHero({
  title,
  lead,
  before,
  after,
}: {
  title: string;
  lead?: string;
  before?: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section className="px-4 pt-36 pb-20 sm:px-8 sm:pt-48 sm:pb-28">
      <div className="mx-auto max-w-7xl">
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
    </section>
  );
}
