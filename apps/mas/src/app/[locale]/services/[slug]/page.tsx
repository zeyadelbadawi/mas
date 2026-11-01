import { imageSlot, masServices, serviceDetails } from "@mas/content";
import { isLocale, routing } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import { ImageSlot } from "@mas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RuleLink, SectionHeading } from "@/components/cards";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { pageHref, SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";

const ordered = [...masServices].sort((a, b) => a.order - b.order);
const two = (n: number) => String(n).padStart(2, "0");

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ordered.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = ordered.find((s) => s.slug === slug);
  if (!isLocale(locale) || !service) return {};
  return innerMetadata(locale, `/services/${slug}`, service.title[locale], service.summary[locale]);
}

/**
 * One service (D69): what it is, what it covers and what the owner receives (serviceDetails), how it
 * runs, the services next to it in the order, and the one action.
 */
export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  const index = ordered.findIndex((s) => s.slug === slug);
  const service = ordered[index];
  if (!isLocale(locale) || !service) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("servicesPage");
  const steps = t.raw("steps") as { t: string; d: string }[];
  const details = serviceDetails[slug];
  const related = [ordered[(index + 1) % ordered.length]!, ordered[(index + 2) % ordered.length]!];
  const slot = imageSlot(`mas.services.${slug}`);

  return (
    <>
      <SiteHeader locale={locale} current="services" />
      <main id="main">
        <JsonLd
          data={[
            crumbs(locale, [
              { name: t("title"), path: "/services" },
              { name: service.title[locale], path: `/services/${slug}` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: service.title[locale],
              description: service.summary[locale],
              provider: { "@type": "Organization", name: "MAS" },
              areaServed: "EG",
            },
          ]}
        />
        <PageHero
          title={service.title[locale]}
          lead={service.summary[locale]}
          before={
            <p className="mb-6 text-sm font-light text-[var(--mas-gold)] tabular-nums">
              <Link
                href={pageHref(locale, "services")}
                className="text-[var(--mas-soft)]/70 hover:text-[var(--mas-soft)]"
              >
                {t("back")}
              </Link>
              <span aria-hidden="true" className="mx-3 text-[var(--mas-soft)]/40">
                /
              </span>
              {two(service.order)}
            </p>
          }
        />
        <section aria-labelledby="covers-title" className="mas-light px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              {details ? (
                <p className="text-xl leading-[1.65] font-normal text-balance sm:text-2xl">
                  {details.intro[locale]}
                </p>
              ) : null}
              <h2
                id="covers-title"
                className="mas-heading mt-16 text-3xl font-semibold tracking-tight sm:text-4xl rtl:tracking-normal"
              >
                {t("included")}
              </h2>
              <ul className="mt-10 grid gap-x-10 sm:grid-cols-2">
                {(details?.covers ?? []).map((item) => (
                  <li
                    key={item.t.en}
                    className="relative border-t border-[var(--brand-line)] py-6 ps-6"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute start-0 top-[2.15rem] h-px w-3 bg-[var(--mas-gold)]"
                    />
                    <h3 className="text-lg font-medium">{item.t[locale]}</h3>
                    <p className="text-muted mt-2 leading-relaxed font-light">{item.d[locale]}</p>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-32">
                <div className="mas-cut [--cut:2.25rem]">
                  <ImageSlot {...slot} locale={locale} sizes="(min-width: 1024px) 34vw, 100vw" />
                </div>
                {details ? (
                  <div className="mt-8 border border-[var(--brand-line)] p-6">
                    <h2 className="text-lg font-semibold">{t("receive")}</h2>
                    <ul className="mt-4 flex flex-col gap-3">
                      {details.deliverables.map((d) => (
                        <li key={d.en} className="flex gap-3 leading-relaxed font-light">
                          <span
                            aria-hidden="true"
                            className="mt-[0.7em] h-px w-3 shrink-0 bg-[var(--mas-gold)]"
                          />
                          {d[locale]}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={pageHref(locale, "contact", `?service=${slug}`)}
                      className="mas-rule-link mt-6 inline-flex items-center py-2 text-sm font-medium"
                    >
                      {t("ask")}
                    </Link>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
        <section aria-labelledby="runs-title" className="mas-light px-4 pb-28 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading id="runs-title" title={t("how")} />
            <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.t} className="border-t border-[var(--brand-line)] pt-6">
                  <p className="text-sm font-light tabular-nums">{two(i + 1)}</p>
                  <h3 className="mt-2 text-xl font-medium">{s.t}</h3>
                  <p className="text-muted mt-3 leading-relaxed font-light">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section aria-labelledby="related-title" className="px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              id="related-title"
              title={t("related")}
              action={<RuleLink href={pageHref(locale, "services")}>{t("back")}</RuleLink>}
            />
            <ul className="grid gap-8 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug} className="mas-row group relative">
                  <Link href={pageHref(locale, "services", `/${r.slug}`)} className="block py-7">
                    <span className="text-sm font-light text-[var(--mas-gold)] tabular-nums">
                      {two(r.order)}
                    </span>
                    <span className="mt-2 block text-2xl font-medium transition-colors duration-200 group-hover:text-[var(--mas-gold)]">
                      {r.title[locale]}
                    </span>
                    <span className="text-muted mt-2 block leading-relaxed font-light">
                      {r.summary[locale]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <Cta locale={locale} service={slug} />
      </main>
    </>
  );
}
