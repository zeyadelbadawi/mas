import {
  brands,
  events,
  imageSlot,
  insights,
  locations,
  masServices,
  serviceDetails,
} from "@mas/content";
import type { Locale } from "@mas/i18n";
import { localePath, siteOrigin } from "@mas/seo";
import { brand } from "@/site";

/**
 * MAS's structured data (schema.org JSON-LD, D70). One Organization with a stable @id that every other
 * entity points to; nothing marked as a placeholder is given to search engines (rule 5).
 */
type Thing = Record<string, unknown>;

const origin = () => siteOrigin(brand);
const url = (locale: Locale, path: string) => `${origin()}${localePath(locale, path)}`;
const abs = (path: string) => (path.startsWith("http") ? path : `${origin()}${path}`);
const orgId = () => `${origin()}/#organization`;
const liveSite = (id: "covy" | "aroma", locale: Locale) =>
  `${(brands[id].liveUrl ?? brands[id].domain).replace(/\/+$/, "")}${localePath(locale, "/")}`.replace(
    /\/$/,
    "",
  );
const sorted = () => [...masServices].sort((a, b) => a.order - b.order);

/** MAS: the company, its logo, inbox, the two brands it runs and what it knows about. */
export function masOrganization(locale: Locale): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId(),
    name: "MAS",
    url: url(locale, "/"),
    logo: { "@type": "ImageObject", url: abs("/apple-icon.png"), width: 180, height: 180 },
    image: abs(`/og/mas-${locale}.jpg`),
    slogan: brand.tagline[locale],
    description:
      locale === "ar"
        ? "MAS شركة لإدارة الكافيهات والمطاعم في مصر: الفكرة، والبراند، والمنيو، والفريق، والتشغيل، والنمو."
        : "MAS is a café and restaurant management company in Egypt: concept, brand, menu, people, operations and growth.",
    email: brand.inboxEmail,
    areaServed: { "@type": "Country", name: locale === "ar" ? "مصر" : "Egypt" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: brand.inboxEmail,
      availableLanguage: ["en", "ar"],
      url: url(locale, "/contact"),
    },
    knowsAbout: sorted().map((s) => s.title[locale]),
    subOrganization: (["covy", "aroma"] as const).map((id) => ({
      "@type": "Organization",
      name: brands[id].name[locale],
      url: liveSite(id, locale),
    })),
  };
}

/** The nine services as a list, each pointing to its page. */
export function servicesList(locale: Locale): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: masServices.length,
    itemListElement: sorted().map((s) => ({
      "@type": "ListItem",
      position: s.order,
      item: {
        "@type": "Service",
        name: s.title[locale],
        url: url(locale, `/services/${s.slug}`),
        provider: { "@id": orgId() },
      },
    })),
  };
}

/** One service: what it is and what it covers, offered by MAS in Egypt. */
export function serviceSchema(locale: Locale, slug: string): Thing | null {
  const s = masServices.find((x) => x.slug === slug);
  if (!s) return null;
  const d = serviceDetails[slug];
  const cover = imageSlot(`mas.services.${slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url(locale, `/services/${slug}`)}#service`,
    name: s.title[locale],
    serviceType: s.title[locale],
    description: d?.intro[locale] ?? s.summary[locale],
    url: url(locale, `/services/${slug}`),
    ...(cover.src ? { image: abs(cover.src) } : {}),
    provider: { "@id": orgId() },
    areaServed: { "@type": "Country", name: locale === "ar" ? "مصر" : "Egypt" },
    ...(d
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: s.title[locale],
            itemListElement: d.covers.map((c) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: c.t[locale], description: c.d[locale] },
            })),
          },
        }
      : {}),
  };
}

/** The brands MAS runs, each with its own site. */
export function brandsList(locale: Locale): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: (["covy", "aroma"] as const).map((id, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: brandSchema(id, locale, false),
    })),
  };
}

/** One brand MAS runs. */
export function brandSchema(id: "covy" | "aroma", locale: Locale, root = true): Thing {
  return {
    ...(root ? { "@context": "https://schema.org" } : {}),
    "@type": "Organization",
    name: brands[id].name[locale],
    slogan: brands[id].tagline[locale],
    url: liveSite(id, locale),
    parentOrganization: { "@id": orgId() },
    ...(brands[id].placeholder ? {} : { sameAs: brands[id].socials.map((s) => s.url) }),
  };
}

/** COVY's dated events (real, D66), as schema.org Events; recurring nights without dates are left out. */
export function eventsSchema(locale: Locale): Thing[] {
  return events
    .filter((e) => !e.placeholder)
    .map((e) => {
      const slot = imageSlot(e.imageSlotId);
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: e.title[locale],
        description: e.summary[locale],
        startDate: e.startsAt,
        endDate: e.endsAt,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        ...(slot.src ? { image: abs(slot.src) } : {}),
        location: {
          "@type": "Place",
          name: brands[e.brandId].name[locale],
          address: {
            "@type": "PostalAddress",
            // COVY has one place, so its events carry its address; a brand with branches gives the city only.
            ...(e.brandId === "covy"
              ? {
                  streetAddress: locations.covy.address[locale],
                  addressLocality: locations.covy.locality?.[locale],
                }
              : { addressLocality: locale === "ar" ? "القاهرة" : "Cairo" }),
            addressCountry: "EG",
          },
        },
        organizer: {
          "@type": "Organization",
          name: brands[e.brandId].name[locale],
          url: liveSite(e.brandId, locale),
        },
      };
    });
}

/** The Insights page as a blog of MAS's articles. */
export function blogSchema(locale: Locale): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: locale === "ar" ? "مقالات MAS" : "MAS Insights",
    url: url(locale, "/insights"),
    inLanguage: locale,
    publisher: { "@id": orgId() },
    blogPost: [...insights]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map((i) => ({
        "@type": "BlogPosting",
        headline: i.title[locale],
        url: url(locale, `/insights/${i.slug}`),
        datePublished: i.publishedAt,
      })),
  };
}

/** One article, with its cover, dates, author and the research it cites. */
export function articleSchema(locale: Locale, slug: string): Thing | null {
  const i = insights.find((x) => x.slug === slug);
  if (!i) return null;
  const cover = imageSlot(i.imageSlotId);
  const page = url(locale, `/insights/${slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${page}#article`,
    headline: i.title[locale],
    description: i.excerpt[locale],
    datePublished: i.publishedAt,
    dateModified: i.publishedAt,
    inLanguage: locale,
    mainEntityOfPage: page,
    ...(cover.src ? { image: [abs(cover.src)] } : {}),
    author: { "@type": "Organization", "@id": orgId(), name: "MAS", url: url(locale, "/") },
    publisher: { "@id": orgId() },
    citation: i.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
  };
}

/** A page about the company or for contacting it. */
export function webPageSchema(
  locale: Locale,
  type: "AboutPage" | "ContactPage",
  path: string,
  name: string,
): Thing {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    url: url(locale, path),
    inLanguage: locale,
    about: { "@id": orgId() },
    isPartOf: { "@id": `${origin()}/#website` },
  };
}
