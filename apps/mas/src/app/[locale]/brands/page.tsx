import { isLocale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandBlock } from "@/components/brand-case";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { crumbs, seoMetadata } from "@/lib/page-meta";
import { brandsList } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/brands">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return seoMetadata(locale, "brands", "/brands");
}

/** The brands MAS runs today (D13): COVY and Aroma Lounge, each with the picture seen through its door. */
export default async function BrandsPage({ params }: PageProps<"/[locale]/brands">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("brandsPage");
  return (
    <>
      <SiteHeader locale={locale} current="brands" />
      <main id="main">
        <JsonLd
          data={[crumbs(locale, [{ name: t("title"), path: "/brands" }]), brandsList(locale)]}
        />
        <PageHero title={t("title")} lead={t("lead")} />
        <div className="flex flex-col gap-28 px-4 pb-32 sm:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <BrandBlock id="covy" locale={locale} />
          </div>
          <div className="mx-auto w-full max-w-7xl">
            <BrandBlock id="aroma" locale={locale} flip />
          </div>
        </div>
        <Cta locale={locale} />
      </main>
    </>
  );
}
