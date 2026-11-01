import { isLocale } from "@mas/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BrandCasePage, brandCaseMetadata } from "@/components/brand-case-page";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/brands/aroma">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return brandCaseMetadata("aroma", locale);
}

export default async function Page({ params }: PageProps<"/[locale]/brands/aroma">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <BrandCasePage id="aroma" locale={locale} />;
}
