import type { Locale } from "@mas/i18n";
import { breadcrumbJsonLd, pageMetadata } from "@mas/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { brand } from "@/site";

type Image = { url: string; width: number; height: number; alt: string };

/** The site's share image in a language: the wordmark on the Stash brown. */
export async function defaultShareImage(locale: Locale): Promise<Image> {
  const t = await getTranslations({ locale, namespace: "seo" });
  return { url: `/og/stash-${locale}.png`, width: 1200, height: 630, alt: t("ogAlt") };
}

/** Cut a description to a search snippet's length (about 160 characters) at a word. */
export function snippet(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,،.;:]$/, "")}…`;
}

/** A page's metadata: its own full title, description, canonical, language versions and share image. */
export async function innerMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Promise<Metadata> {
  return pageMetadata({
    brand,
    locale,
    path,
    title,
    description: snippet(description),
    absoluteTitle: true,
    image: await defaultShareImage(locale),
  });
}

export type SeoKey =
  | "packaging"
  | "design"
  | "howItWorks"
  | "materials"
  | "about"
  | "quote"
  | "faq"
  | "contact";

/** A page's title and description from the "seo" messages. */
export async function seoMetadata(locale: Locale, key: SeoKey, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  return innerMetadata(locale, path, t(`${key}.title`), t(`${key}.description`));
}

/** Breadcrumbs from the home page down to this page (schema.org BreadcrumbList). */
export function crumbs(locale: Locale, items: { name: string; path: string }[]) {
  return breadcrumbJsonLd(brand, locale, [{ name: brand.name[locale], path: "/" }, ...items]);
}
