import type { Brand, Location, MenuCategory } from "@mas/content";
import { localePath, siteOrigin, type Locale } from "./site";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type Thing = Record<string, unknown>;

export function organizationJsonLd(brand: Brand, locale: Locale): Thing {
  const origin = siteOrigin(brand);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: brand.name[locale],
    url: `${origin}${localePath(locale, "/")}`,
    email: brand.inboxEmail,
    description: brand.tagline[locale],
    sameAs: brand.socials.map((s) => s.url),
  };
}

/**
 * One Restaurant per branch. A brand with several branches gets one entry each (`#<location id>`, linked to
 * the branch's anchor on the page); fields still marked as placeholders are left out, so search engines never
 * get sample hours or numbers (rule 5).
 */
export function restaurantJsonLd(
  brand: Brand,
  location: Location,
  locale: Locale,
  extra: { servesCuisine?: string[]; menuPath?: string; anchor?: string } = {},
): Thing {
  const origin = siteOrigin(brand);
  const sample = new Set(location.placeholderFields ?? []);
  const page = `${origin}${localePath(locale, "/")}`;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": location.branch ? `${origin}/#${location.id}` : `${origin}/#restaurant`,
    name: location.name[locale],
    url: extra.anchor ? `${page}#${extra.anchor}` : page,
    ...(sample.has("phone") ? {} : { telephone: location.phone }),
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address[locale],
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    geo: { "@type": "GeoCoordinates", latitude: location.lat, longitude: location.lng },
    ...(location.mapsUrl ? { hasMap: location.mapsUrl } : {}),
    ...(sample.has("hours")
      ? {}
      : {
          openingHoursSpecification: location.hours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${DAYS[h.weekday]}`,
            opens: h.opens,
            closes: h.closes,
          })),
        }),
    acceptsReservations: true,
    ...(extra.servesCuisine ? { servesCuisine: extra.servesCuisine } : {}),
    ...(extra.menuPath ? { hasMenu: `${origin}${localePath(locale, extra.menuPath)}` } : {}),
    sameAs: brand.socials.map((s) => s.url),
  };
}

export function breadcrumbJsonLd(
  brand: Brand,
  locale: Locale,
  items: { name: string; path: string }[],
): Thing {
  const origin = siteOrigin(brand);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${origin}${localePath(locale, item.path)}`,
    })),
  };
}

/** schema.org Menu with sections and items (prices in EGP). */
export function menuJsonLd(brand: Brand, menu: MenuCategory[], locale: Locale): Thing {
  const origin = siteOrigin(brand);
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${origin}/#menu`,
    name: `${brand.name[locale]} · ${locale === "ar" ? "المنيو" : "Menu"}`,
    inLanguage: locale,
    hasMenuSection: menu.map((c) => ({
      "@type": "MenuSection",
      name: c.name[locale],
      description: c.intro[locale],
      hasMenuItem: c.items.map((i) => ({
        "@type": "MenuItem",
        name: i.name[locale],
        ...(i.description[locale] ? { description: i.description[locale] } : {}),
        offers: { "@type": "Offer", price: i.priceEGP, priceCurrency: "EGP" },
        ...(i.tags.includes("veg") ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
      })),
    })),
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't close the tag. */
export function serializeJsonLd(data: Thing | Thing[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
