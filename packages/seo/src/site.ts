import type { Brand } from "@mas/content";

export type Locale = "en" | "ar";

/** Origin without a trailing slash. NEXT_PUBLIC_SITE_URL wins so previews link to themselves. */
export function siteOrigin(brand: Pick<Brand, "domain">): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || brand.domain).replace(/\/+$/, "");
}

/**
 * Search engines are kept out until launch: placeholder data must not be indexed.
 * Set SITE_INDEXABLE=true on the production project once real content is in.
 */
export function isIndexable(): boolean {
  return process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview";
}

/** English lives at "/", Arabic at "/ar" (D27). `path` always starts with "/". */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? "/ar" : `/ar${path}`;
}
