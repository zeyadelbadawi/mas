import { sequenceSlot, stashRanges, visibleSubtypes } from "@mas/content";
import { isLocale } from "@mas/i18n";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@mas/seo";
import { SlotBox } from "@mas/ui";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { WordmarkPattern } from "@/components/pattern";
import { RangeCard } from "@/components/range-card";
import { href, rangeHref, SiteHeader } from "@/components/site-header";
import { brand } from "@/site";

const STEPS = ["design", "see", "make", "deliver"] as const;

/**
 * The home page (S1). The two scroll scenes arrive in S3 (D77); until then the hero shows the first scene's
 * slot, labelled, under the promise. Sections follow the plan's order: H1, H3, H4, H9.
 */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const c = await getTranslations({ locale, namespace: "common" });
  const hero = sequenceSlot("stash.hero");

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(brand, locale, { logoPath: "/icon.svg" }),
          websiteJsonLd(brand, locale),
        ]}
      />
      <SiteHeader locale={locale} />
      <main id="main">
        {/* H1: the promise */}
        <section className="mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-8 sm:pt-20">
          <p className="st-ruled text-muted text-sm font-medium">{t("eyebrow")}</p>
          <h1 className="mt-6 max-w-5xl text-5xl leading-[0.98] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-8xl rtl:leading-[1.2] rtl:tracking-normal">
            {t("headline")}
          </h1>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="text-muted max-w-xl text-lg leading-relaxed text-pretty">{t("lead")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={href(locale, "design")}
                className="rounded-control inline-flex h-12 items-center bg-[var(--st-brown)] px-6 font-medium text-[var(--st-paper)] transition-colors hover:bg-[var(--st-brown-deep)]"
              >
                {c("designYours")}
              </Link>
              <Link
                href={href(locale, "packaging")}
                className="rounded-control border-fg/25 hover:border-fg inline-flex h-12 items-center border px-6 font-medium transition-colors"
              >
                {c("browsePackaging")}
              </Link>
            </div>
          </div>
          <div className="st-crop rounded-card mt-14">
            <SlotBox
              slotId={hero.id}
              kind="sequence"
              width={hero.desktop.width}
              height={hero.desktop.height}
              className="rounded-card"
              label={hero.label[locale]}
              lines={[
                `${hero.desktop.width} × ${hero.desktop.height} · ${hero.id}`,
                t("sceneNote"),
              ]}
            />
          </div>
        </section>

        {/* H3: the eight ranges */}
        <section aria-labelledby="ranges-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <div className="st-dieline mb-14" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2
              id="ranges-title"
              className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl rtl:tracking-normal"
            >
              {t("rangesTitle")}
            </h2>
            <p className="text-muted max-w-md leading-relaxed">{t("rangesLead")}</p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </section>

        {/* H4: how it works */}
        <section aria-labelledby="how-title" className="bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
            <h2
              id="how-title"
              className="text-3xl font-extrabold tracking-tight sm:text-5xl rtl:tracking-normal"
            >
              {t("howTitle")}
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
              {STEPS.map((step, i) => (
                <li key={step} className="flex flex-col gap-4">
                  <span className="flex items-center gap-4">
                    <span className="text-sm font-semibold tabular-nums">{i + 1}</span>
                    <span aria-hidden="true" className="st-dieline flex-1" />
                  </span>
                  <h3 className="text-xl font-semibold">{t(`steps.${step}.title`)}</h3>
                  <p className="text-muted leading-relaxed">{t(`steps.${step}.body`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* H9: the quote call to action */}
        <section className="st-dark relative overflow-hidden">
          <WordmarkPattern className="text-[var(--st-brown-deep)] opacity-60" size={40} />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-24 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl rtl:tracking-normal">
                {t("ctaTitle")}
              </h2>
              <p className="text-muted mt-4 max-w-xl text-lg">{t("ctaBody")}</p>
            </div>
            <Link
              href={href(locale, "quote")}
              className="rounded-control inline-flex h-12 shrink-0 items-center bg-[var(--st-beige)] px-6 font-medium text-[var(--st-brown)] transition-colors hover:bg-[var(--st-paper)]"
            >
              {c("askQuote")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
