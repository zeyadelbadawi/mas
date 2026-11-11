import { stashRanges, visibleSubtypes } from "@mas/content";
import { isLocale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/page-intro";
import { RangeCard } from "@/components/range-card";
import { rangeHref, SiteHeader } from "@/components/site-header";
import { crumbs, seoMetadata } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/packaging">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return seoMetadata(locale, "packaging", "/packaging");
}

/** All eight ranges (S1; the search box over them comes in S4). */
export default async function PackagingPage({ params }: PageProps<"/[locale]/packaging">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.packaging" });
  const c = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <JsonLd data={crumbs(locale, [{ name: t("title"), path: "/packaging" }])} />
      <SiteHeader locale={locale} current="packaging" />
      <main id="main">
        <PageIntro locale={locale} title={t("title")} lead={t("lead")} />
        <ul className="mx-auto grid max-w-7xl gap-4 px-4 pb-24 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {stashRanges.map((r) => (
            <li key={r.slug}>
              <RangeCard
                range={r}
                locale={locale}
                href={rangeHref(locale, r.slug)}
                countLabel={c("itemsInRange", { count: visibleSubtypes(r).length })}
              />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
