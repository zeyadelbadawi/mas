import type { Locale } from "@mas/i18n";
import { breadcrumbJsonLd, pageMetadata } from "@mas/seo";
import type { Metadata } from "next";
import { brand } from "@/site";

/** An inner page's metadata: its title (the layout adds " · MAS"), description and canonical path. */
export function innerMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  return pageMetadata({ brand, locale, path, title, description });
}

/** Breadcrumbs from the home page down to this page (schema.org BreadcrumbList). */
export function crumbs(locale: Locale, items: { name: string; path: string }[]) {
  return breadcrumbJsonLd(brand, locale, [{ name: brand.name[locale], path: "/" }, ...items]);
}
