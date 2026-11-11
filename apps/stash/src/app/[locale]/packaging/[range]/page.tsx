import { findRange, imageSlot, stashRanges, visibleSubtypes } from "@mas/content";
import { isLocale, routing } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import { ImageSlot } from "@mas/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { href, rangeHref, SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => stashRanges.map((r) => ({ locale, range: r.slug })));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/packaging/[range]">): Promise<Metadata> {
  const { locale, range: slug } = await params;
  const range = findRange(slug);
  if (!isLocale(locale) || !range) return {};
  const t = await getTranslations({ locale, namespace: "seo.range" });
  return innerMetadata(
    locale,
    `/packaging/${range.slug}`,
    t("title", { name: range.name[locale] }),
    t("description", { summary: range.summary[locale] }),
  );
}

/**
 * A range page (the "service details" page, S1): its banner, summary and sub-types. Specs, the "Add to
 * quote" list and "Design this" arrive in S4 and S5; sub-types that need a certificate stay hidden (D79).
 */
export default async function RangePage({ params }: PageProps<"/[locale]/packaging/[range]">) {
  const { locale, range: slug } = await params;
  const range = findRange(slug);
  if (!isLocale(locale) || !range) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "range" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const c = await getTranslations({ locale, namespace: "common" });
  const others = stashRanges.filter((r) => r.slug !== range.slug);

  return (
    <>
      <JsonLd
        data={crumbs(locale, [
          { name: nav("packaging"), path: "/packaging" },
          { name: range.name[locale], path: `/packaging/${range.slug}` },
        ])}
      />
      <SiteHeader locale={locale} current="packaging" />
      <main id="main">
        <PageIntro
          locale={locale}
          title={range.name[locale]}
          lead={range.summary[locale]}
          banner={`stash.range.${range.slug}`}
        >
          <p className="text-muted mt-6 text-sm font-medium">
            <Link
              href={href(locale, "packaging")}
              className="hover:text-fg underline-offset-4 hover:underline"
            >
              {nav("packaging")}
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="tabular-nums">{String(range.order).padStart(2, "0")}</span>
          </p>
        </PageIntro>

        <section aria-labelledby="subtypes-title" className="mx-auto max-w-7xl px-4 pb-20 sm:px-8">
          <div className="st-dieline mb-12" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="subtypes-title" className="text-2xl font-extrabold sm:text-4xl">
              {t("inThisRange")}
            </h2>
            <p className="text-muted max-w-md text-sm">{t("subtypeNote")}</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {visibleSubtypes(range).map((s) => (
              <li key={s.slug} className="flex flex-col gap-3">
                <div className="rounded-card bg-surface overflow-hidden">
                  <ImageSlot
                    {...imageSlot(`stash.sub.${range.slug}.${s.slug}`)}
                    locale={locale}
                    sizes="(min-width: 1024px) 300px, 50vw"
                  />
                </div>
                <h3 className="font-semibold">{s.name[locale]}</h3>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="others-title" className="bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
            <h2 id="others-title" className="text-xl font-extrabold">
              {t("otherRanges")}
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {others.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={rangeHref(locale, r.slug)}
                    className="rounded-control border-fg/20 hover:border-fg inline-flex h-10 items-center border px-4 text-sm font-medium transition-colors"
                  >
                    {r.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={href(locale, "quote")}
              className="rounded-control mt-10 inline-flex h-12 items-center bg-[var(--st-brown)] px-6 font-medium text-[var(--st-paper)] transition-colors hover:bg-[var(--st-brown-deep)]"
            >
              {c("askQuote")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
