import { isLocale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import { PlaceholderBadge } from "@mas/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMark } from "@/components/brand-case";
import { EventCard } from "@/components/cards";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";
import { whatsOn } from "@/lib/whats-on";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "eventsPage" });
  return innerMetadata(locale, "/events", t("title"), t("lead"));
}

/** Everything on at COVY and Aroma Lounge, by brand (shared data; COVY's are still labelled samples). */
export default async function EventsPage({ params }: PageProps<"/[locale]/events">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("eventsPage");
  const ev = await getTranslations("events");
  const all = whatsOn(locale);
  return (
    <>
      <SiteHeader locale={locale} current="events" />
      <main id="main">
        <JsonLd data={crumbs(locale, [{ name: t("title"), path: "/events" }])} />
        <PageHero title={t("title")} lead={t("lead")} />
        {(["covy", "aroma"] as const).map((id) => {
          const items = all.filter((i) => i.brand === id);
          return (
            <section key={id} aria-labelledby={`events-${id}`} className="px-4 pb-28 sm:px-8">
              <div className="mx-auto max-w-7xl">
                <h2
                  id={`events-${id}`}
                  className="flex items-center gap-4 border-t border-[var(--brand-line)] pt-10 pb-10"
                >
                  <span className="sr-only">{items[0]?.brandName}</span>
                  <BrandMark id={id} className="text-[var(--mas-soft)]" />
                </h2>
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
          );
        })}
        <Cta locale={locale} />
      </main>
    </>
  );
}
