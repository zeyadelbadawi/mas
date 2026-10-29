import type { Brand } from "@mas/content";
import type { Metadata } from "next";
import { isIndexable, localePath, siteOrigin, type Locale } from "./site";

type PageMetadataInput = {
  brand: Brand;
  locale: Locale;
  /** Path without the locale prefix, e.g. "/" or "/privacy". */
  path: string;
  title: string;
  description: string;
  /** Use the title as-is instead of appending the brand name. */
  absoluteTitle?: boolean;
};

/** Canonical, hreflang alternates, Open Graph and robots for one page. */
export function pageMetadata({
  brand,
  locale,
  path,
  title,
  description,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const origin = siteOrigin(brand);
  const url = `${origin}${localePath(locale, path)}`;
  const siteName = brand.name[locale];
  return {
    metadataBase: new URL(origin),
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${origin}${localePath("en", path)}`,
        ar: `${origin}${localePath("ar", path)}`,
        "x-default": `${origin}${localePath("en", path)}`,
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName,
      title,
      description,
      locale: locale === "ar" ? "ar_EG" : "en_EG",
      alternateLocale: locale === "ar" ? ["en_EG"] : ["ar_EG"],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  };
}
