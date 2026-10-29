import type { Brand, Location } from "@mas/content";
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

export function restaurantJsonLd(
  brand: Brand,
  location: Location,
  locale: Locale,
  extra: { servesCuisine?: string[]; menuPath?: string } = {},
): Thing {
  const origin = siteOrigin(brand);
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${origin}/#restaurant`,
    name: location.name[locale],
    url: `${origin}${localePath(locale, "/")}`,
    telephone: location.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address[locale],
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    geo: { "@type": "GeoCoordinates", latitude: location.lat, longitude: location.lng },
    openingHoursSpecification: location.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAYS[h.weekday]}`,
      opens: h.opens,
      closes: h.closes,
    })),
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

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't close the tag. */
export function serializeJsonLd(data: Thing | Thing[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
