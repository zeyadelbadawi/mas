import { insights } from "@mas/content";
import { isLocale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import { PlaceholderBadge } from "@mas/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InsightCard } from "@/components/cards";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { pageHref, SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/insights">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "insightsPage" });
  return innerMetadata(locale, "/insights", t("title"), t("lead"));
}

/** MAS's articles, newest first (samples until MAS sends its own, labelled). */
export default async function InsightsPage({ params }: PageProps<"/[locale]/insights">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("insightsPage");
  const ins = await getTranslations("insights");
  const list = [...insights].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <SiteHeader locale={locale} current="insights" />
      <main id="main">
        <JsonLd data={crumbs(locale, [{ name: t("title"), path: "/insights" }])} />
        <PageHero title={t("title")} lead={t("lead")} />
        <section aria-label={t("title")} className="px-4 pb-28 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {list.some((i) => i.placeholder) ? (
              <PlaceholderBadge label={ins("sample")} className="mb-8" />
            ) : null}
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((item) => (
                <InsightCard
                  key={item.slug}
                  item={item}
                  locale={locale}
                  href={pageHref(locale, "insights", `/${item.slug}`)}
                />
              ))}
            </div>
          </div>
        </section>
        <Cta locale={locale} />
      </main>
    </>
  );
}
