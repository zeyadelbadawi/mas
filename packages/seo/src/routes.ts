import type { Brand } from "@mas/content";
import type { MetadataRoute } from "next";
import { isIndexable, localePath, siteOrigin } from "./site";

/** One entry per path with en/ar alternates. */
export function sitemapFor(
  brand: Brand,
  paths: { path: string; priority?: number }[],
): MetadataRoute.Sitemap {
  const origin = siteOrigin(brand);
  return paths.map(({ path, priority }) => ({
    url: `${origin}${localePath("en", path)}`,
    changeFrequency: "monthly",
    ...(priority !== undefined ? { priority } : {}),
    alternates: {
      languages: {
        en: `${origin}${localePath("en", path)}`,
        ar: `${origin}${localePath("ar", path)}`,
      },
    },
  }));
}

export function robotsFor(brand: Brand): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteOrigin(brand)}/sitemap.xml`,
  };
}
