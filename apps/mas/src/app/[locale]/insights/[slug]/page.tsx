import { imageSlot, insights } from "@mas/content";
import { formatDate, isLocale, routing } from "@mas/i18n";
import { JsonLd, siteOrigin } from "@mas/seo";
import { ImageSlot, PlaceholderBadge } from "@mas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { pageHref, SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";
import { brand } from "@/site";

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
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: item.title[locale],
              description: item.excerpt[locale],
              datePublished: item.publishedAt,
              inLanguage: locale,
              image: slot.src ? `${siteOrigin(brand)}${slot.src}` : undefined,
              author: { "@type": "Organization", name: brand.name[locale] },
              publisher: { "@type": "Organization", name: brand.name[locale] },
              citation: item.sources.map((src) => src.url),
            },
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
            {item.body.map((block, i) => {
              const key = `${block.kind}-${i}`;
              if (block.kind === "h2")
                return (
                  <h2
                    key={key}
                    className="mt-14 mb-5 text-2xl font-semibold tracking-tight sm:text-3xl rtl:tracking-normal"
                  >
                    {block.text[locale]}
                  </h2>
                );
              if (block.kind === "list")
                return (
                  <ul key={key} className="mb-8 flex flex-col">
                    {block.items.map((li) => (
                      <li
                        key={li.en.slice(0, 32)}
                        className="relative border-t border-[var(--brand-line)] py-4 ps-6 text-lg leading-[1.75] font-light"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute start-0 top-[1.85rem] h-px w-3 bg-[var(--mas-gold)]"
                        />
                        {li[locale]}
                      </li>
                    ))}
                  </ul>
                );
              if (block.kind === "figure") {
                const fig = imageSlot(block.imageSlotId);
                return (
                  <figure key={key} className="my-12">
                    <div className="mas-cut [--cut:1.75rem]">
                      <ImageSlot {...fig} locale={locale} sizes="(min-width: 768px) 48rem, 100vw" />
                    </div>
                    <figcaption className="text-muted mt-4 text-sm leading-relaxed">
                      {block.caption[locale]}
                    </figcaption>
                  </figure>
                );
              }
              return (
                <p key={key} className="mb-6 text-lg leading-[1.8] font-light">
                  {block.text[locale]}
                </p>
              );
            })}
            {item.sources.length ? (
              <aside
                aria-labelledby="sources-title"
                className="mt-16 border-t border-[var(--brand-line)] pt-8"
              >
                <h2 id="sources-title" className="text-sm font-medium">
                  {t("sources")}
                </h2>
                <ol className="text-muted mt-4 flex list-decimal flex-col gap-2 ps-5 text-sm leading-relaxed">
                  {item.sources.map((src) => (
                    <li key={src.url}>
                      <a
                        href={src.url}
                        dir="ltr"
                        className="underline decoration-1 underline-offset-4 hover:text-[var(--brand-fg)]"
                        rel="noopener"
                      >
                        {src.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </aside>
            ) : null}
          </div>
        </article>
        <Cta locale={locale} />
      </main>
    </>
  );
}
