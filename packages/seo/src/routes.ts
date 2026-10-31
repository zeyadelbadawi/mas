import type { Brand } from "@mas/content";
import type { MetadataRoute } from "next";
import { isIndexable, localePath, siteOrigin } from "./site";

/** One entry per path and language, each listing every language version and the x-default (English). */
export function sitemapFor(
  brand: Brand,
  paths: { path: string; priority?: number }[],
): MetadataRoute.Sitemap {
  const origin = siteOrigin(brand);
  return paths.flatMap(({ path, priority }) =>
    (["en", "ar"] as const).map((locale) => ({
      url: `${origin}${localePath(locale, path)}`,
      changeFrequency: "monthly" as const,
      ...(priority !== undefined ? { priority } : {}),
      alternates: {
        languages: {
          en: `${origin}${localePath("en", path)}`,
          ar: `${origin}${localePath("ar", path)}`,
          "x-default": `${origin}${localePath("en", path)}`,
        },
      },
    })),
  );
}

export function robotsFor(brand: Brand): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteOrigin(brand)}/sitemap.xml`,
  };
}
