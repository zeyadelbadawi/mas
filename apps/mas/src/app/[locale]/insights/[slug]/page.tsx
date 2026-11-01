import { imageSlot, insights } from "@mas/content";
import { formatDate, isLocale, routing } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import { ImageSlot, PlaceholderBadge } from "@mas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { pageHref, SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => insights.map((i) => ({ locale, slug: i.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/insights/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = insights.find((i) => i.slug === slug);
  if (!isLocale(locale) || !item) return {};
  return innerMetadata(locale, `/insights/${slug}`, item.title[locale], item.excerpt[locale]);
}

/** One article: dark title, then the text on soft grey for reading. Samples say so at the top. */
export default async function InsightPage({ params }: PageProps<"/[locale]/insights/[slug]">) {
  const { locale, slug } = await params;
  const item = insights.find((i) => i.slug === slug);
  if (!isLocale(locale) || !item) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("insightsPage");
  const ins = await getTranslations("insights");
  const slot = imageSlot(item.imageSlotId);
  const date = formatDate(new Date(`${item.publishedAt}T12:00:00+02:00`), locale, {
    weekday: undefined,
  });

  return (
    <>
      <SiteHeader locale={locale} current="insights" />
      <main id="main">
        <JsonLd
          data={[
            crumbs(locale, [
              { name: t("title"), path: "/insights" },
              { name: item.title[locale], path: `/insights/${slug}` },
            ]),
          ]}
        />
        <PageHero
          title={item.title[locale]}
          lead={item.excerpt[locale]}
          before={
            <p className="mb-6 text-sm text-[var(--mas-soft)]/70">
              <Link href={pageHref(locale, "insights")} className="hover:text-[var(--mas-soft)]">
                {t("back")}
              </Link>
              <span aria-hidden="true" className="mx-3 text-[var(--mas-soft)]/40">
                /
              </span>
              <time dateTime={item.publishedAt}>{date}</time>
            </p>
          }
        />
        <article className="mas-light px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl">
            {item.placeholder ? (
              <div className="mb-10">
                <PlaceholderBadge label={ins("sample")} />
                <p className="text-muted mt-3 text-sm">{ins("soon")}</p>
              </div>
            ) : null}
            <div className="mas-cut mb-12 [--cut:2rem]">
              <ImageSlot {...slot} locale={locale} sizes="(min-width: 768px) 48rem, 100vw" />
            </div>
            {item.body[locale].map((p) => (
              <p key={p.slice(0, 24)} className="mb-6 text-lg leading-[1.8] font-light">
                {p}
              </p>
            ))}
          </div>
        </article>
        <Cta locale={locale} />
      </main>
    </>
  );
}
