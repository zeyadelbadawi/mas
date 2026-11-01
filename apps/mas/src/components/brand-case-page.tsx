import { branches, brands } from "@mas/content";
import { JsonLd } from "@mas/seo";
import { PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { BrandMark, BrandPicture, siteOf, type BrandKey } from "@/components/brand-case";
import { EventCard, RuleLink, SectionHeading } from "@/components/cards";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { pageHref, SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";
import { whatsOn } from "@/lib/whats-on";

export async function brandCaseMetadata(id: BrandKey, locale: "en" | "ar") {
  const t = await getTranslations({ locale, namespace: "brandsPage" });
  return innerMetadata(locale, `/brands/${id}`, brands[id].name[locale], t(`${id}.lead`));
}

/**
 * A brand MAS runs (D13): its mark and what it is, the picture seen through its door on the home page, its
 * branches, what's on there, and the way to its own site.
 */
export async function BrandCasePage({ id, locale }: { id: BrandKey; locale: "en" | "ar" }) {
  const t = await getTranslations("brandsPage");
  const d = await getTranslations("doors");
  const ev = await getTranslations("events");
  const name = brands[id].name[locale];
  const items = whatsOn(locale).filter((i) => i.brand === id);

  return (
    <>
      <SiteHeader locale={locale} current="brands" />
      <main id="main">
        <JsonLd
          data={crumbs(locale, [
            { name: t("title"), path: "/brands" },
            { name, path: `/brands/${id}` },
          ])}
        />
        <PageHero
          title={name}
          lead={t(`${id}.lead`)}
          before={
            <div className="mb-10 flex items-center gap-4 text-sm text-[var(--mas-soft)]/70">
              <BrandMark id={id} className="text-[var(--mas-soft)]" />
              <span aria-hidden="true" className="h-px w-8 bg-[var(--mas-gold)]" />
              {t("managed")}
            </div>
          }
          after={
            <div className="mt-8">
              <a
                href={siteOf(id, locale)}
                className="mas-rule-link inline-flex items-center py-2 font-medium"
              >
                {d(`${id}.visit`)}
              </a>
            </div>
          }
        />
        <div className="px-4 pb-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <BrandPicture id={id} alt={d("label")} priority />
          </div>
        </div>
        <section aria-labelledby="branches-title" className="mas-light px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading id="branches-title" title={t("branches")} />
            <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {branches[id].map((b) => (
                <li key={b.id} className="border-t border-[var(--brand-line)] pt-6">
                  <h3 className="text-xl font-medium">{b.name[locale]}</h3>
                  <p className="text-muted mt-2 leading-relaxed font-light">{b.address[locale]}</p>
                  {b.placeholder ? (
                    <PlaceholderBadge label={t("placeholder")} className="mt-3" />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
        {items.length ? (
          <section aria-labelledby="brand-events-title" className="px-4 py-24 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeading
                id="brand-events-title"
                title={ev("title")}
                action={<RuleLink href={pageHref(locale, "events")}>{ev("all")}</RuleLink>}
              />
              {items.some((i) => i.placeholder) ? (
                <PlaceholderBadge label={ev("sample")} className="mb-8" />
              ) : null}
              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <EventCard key={item.id} item={item} locale={locale} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
        <Cta locale={locale} />
      </main>
    </>
  );
}
