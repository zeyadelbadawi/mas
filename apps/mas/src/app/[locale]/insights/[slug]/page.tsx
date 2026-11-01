import { imageSlot, insights, type Insight } from "@mas/content";
import { formatDate, isLocale, routing } from "@mas/i18n";
import { JsonLd, siteOrigin } from "@mas/seo";
import { ImageSlot } from "@mas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InsightCard, RuleLink } from "@/components/cards";
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

/** Minutes to read, from the words in the article (about 220 a minute in English, 180 in Arabic). */
function readingMinutes(item: Insight, locale: "en" | "ar") {
  const text = item.body
    .flatMap((b) =>
      b.kind === "list"
        ? b.items.map((i) => i[locale])
        : b.kind === "figure"
          ? []
          : [b.text[locale]],
    )
    .join(" ");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / (locale === "ar" ? 180 : 220)));
}

/**
 * One article (D66, D67): the title on dark gray, then the cover and the text in a wide reading column
 * beside a sticky margin (date, reading time, contents, sources). Pictures run the full width of the
 * column. The other articles close the page.
 */
export default async function InsightPage({ params }: PageProps<"/[locale]/insights/[slug]">) {
  const { locale, slug } = await params;
  const item = insights.find((i) => i.slug === slug);
  if (!isLocale(locale) || !item) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("insightsPage");
  const cover = imageSlot(item.imageSlotId);
  const date = formatDate(new Date(`${item.publishedAt}T12:00:00+02:00`), locale, {
    weekday: undefined,
  });
  const minutes = readingMinutes(item, locale);
  const headings = item.body.flatMap((b, i) =>
    b.kind === "h2" ? [{ id: `part-${i}`, text: b.text[locale] }] : [],
  );
  const others = insights.filter((i) => i.slug !== slug);

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
              image: cover.src ? `${siteOrigin(brand)}${cover.src}` : undefined,
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
            <p className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--mas-soft)]/80">
              <Link href={pageHref(locale, "insights")} className="hover:text-[var(--mas-soft)]">
                {t("back")}
              </Link>
              <span aria-hidden="true" className="h-px w-6 bg-[var(--mas-gold)]" />
              <time dateTime={item.publishedAt}>{date}</time>
              <span aria-hidden="true">·</span>
              <span>{t("readTime", { minutes })}</span>
            </p>
          }
        />

        <div className="mas-light px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-10">
            {/* The margin: what the article covers and where it comes from. */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-32">
                <p className="text-sm">
                  <time dateTime={item.publishedAt}>{date}</time>
                </p>
                <p className="text-muted mt-1 text-sm">{t("readTime", { minutes })}</p>
                {headings.length ? (
                  <nav
                    aria-label={t("contents")}
                    className="mt-8 border-t border-[var(--brand-line)] pt-6"
                  >
                    <p className="text-sm font-medium">{t("contents")}</p>
                    <ol className="mt-4 flex flex-col gap-3 text-sm">
                      {headings.map((h) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className="text-muted flex gap-3 leading-snug transition-colors hover:text-[var(--brand-fg)]"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[0.6em] h-px w-3 shrink-0 bg-[var(--mas-gold)]"
                            />
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                ) : null}
                {item.sources.length ? (
                  <p className="mt-8 border-t border-[var(--brand-line)] pt-6 text-sm">
                    <a href="#sources" className="text-muted hover:text-[var(--brand-fg)]">
                      {t("sourcesCount", { count: item.sources.length })}
                    </a>
                  </p>
                ) : null}
              </div>
            </aside>

            <article className="min-w-0 lg:col-span-9">
              <div className="mas-cut mb-14 [--cut:2.5rem]">
                <ImageSlot
                  {...cover}
                  locale={locale}
                  priority
                  sizes="(min-width: 1024px) 75vw, 100vw"
                />
              </div>
              {item.body.map((block, i) => {
                const key = `${block.kind}-${i}`;
                if (block.kind === "h2")
                  return (
                    <h2
                      key={key}
                      id={`part-${i}`}
                      className="mt-16 mb-6 scroll-mt-32 text-3xl leading-tight font-semibold tracking-tight first:mt-0 sm:text-4xl rtl:leading-snug rtl:tracking-normal"
                    >
                      {block.text[locale]}
                    </h2>
                  );
                if (block.kind === "list")
                  return (
                    <ul key={key} className="mb-10 grid gap-x-10 md:grid-cols-2">
                      {block.items.map((li) => (
                        <li
                          key={li.en.slice(0, 32)}
                          className="relative border-t border-[var(--brand-line)] py-5 ps-6 text-lg leading-[1.75] font-light"
                        >
                          <span
                            aria-hidden="true"
                            className="absolute start-0 top-[2.05rem] h-px w-3 bg-[var(--mas-gold)]"
                          />
                          {li[locale]}
                        </li>
                      ))}
                    </ul>
                  );
                if (block.kind === "figure") {
                  const fig = imageSlot(block.imageSlotId);
                  return (
                    <figure key={key} className="my-14">
                      <div className="mas-cut [--cut:2.25rem]">
                        <ImageSlot
                          {...fig}
                          locale={locale}
                          sizes="(min-width: 1024px) 75vw, 100vw"
                        />
                      </div>
                      <figcaption className="text-muted mt-4 flex gap-3 text-sm leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="mt-[0.65em] h-px w-6 shrink-0 bg-[var(--mas-gold)]"
                        />
                        {block.caption[locale]}
                      </figcaption>
                    </figure>
                  );
                }
                // The opening paragraph is set larger, as a standfirst.
                return (
                  <p
                    key={key}
                    className={
                      i === 0
                        ? "mb-8 text-xl leading-[1.7] font-normal sm:text-2xl"
                        : "mb-6 max-w-[46rem] text-lg leading-[1.85] font-light sm:text-xl"
                    }
                  >
                    {block.text[locale]}
                  </p>
                );
              })}

              {item.sources.length ? (
                <aside
                  id="sources"
                  aria-labelledby="sources-title"
                  className="mt-16 scroll-mt-32 border-t border-[var(--brand-line)] pt-8"
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
            </article>
          </div>
        </div>

        <section aria-labelledby="more-title" className="px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <h2
                id="more-title"
                className="mas-heading text-3xl font-semibold tracking-tight sm:text-4xl rtl:tracking-normal"
              >
                {t("more")}
              </h2>
              <RuleLink href={pageHref(locale, "insights")}>{t("back")}</RuleLink>
            </div>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
              {others.map((o) => (
                <InsightCard
                  key={o.slug}
                  item={o}
                  locale={locale}
                  href={pageHref(locale, "insights", `/${o.slug}`)}
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
