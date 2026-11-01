import { isLocale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cta, How, Services } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  return innerMetadata(locale, "/services", t("title"), t("lead"));
}

/** The nine services (D5) in their order, then how MAS works. */
export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("servicesPage");
  return (
    <>
      <SiteHeader locale={locale} current="services" />
      <main id="main">
        <JsonLd data={crumbs(locale, [{ name: t("title"), path: "/services" }])} />
        <PageHero title={t("title")} lead={t("lead")} />
        <Services locale={locale} index />
        <How />
        <Cta locale={locale} />
      </main>
    </>
  );
}
