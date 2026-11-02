import type { Brand } from "@mas/content";

export type Locale = "en" | "ar";

/** An origin from a setting, or undefined when it is empty or not a real address (e.g. a stray "n"). */
function originOf(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (url.hostname !== "localhost" && !url.hostname.includes(".")) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

/**
 * The site's origin, without a trailing slash (canonical links, sitemaps, structured data). In order:
 * NEXT_PUBLIC_SITE_URL when it is a valid address (the real domain at launch); on a Vercel production build,
 * the project's own production address (VERCEL_PROJECT_PRODUCTION_URL, set by Vercel), so a live site points
 * at itself before its domain is connected; otherwise the brand's planned domain. A setting that is not a
 * valid address is ignored instead of breaking the build (D70).
 */
export function siteOrigin(brand: Pick<Brand, "domain">): string {
  return (
    originOf(process.env.NEXT_PUBLIC_SITE_URL) ??
    (process.env.VERCEL_ENV === "production"
      ? originOf(process.env.VERCEL_PROJECT_PRODUCTION_URL)
      : undefined) ??
    brand.domain.replace(/\/+$/, "")
  );
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

/**
 * Internal review pages (/kitchen-sink, /art-direction) exist until launch. They switch off with the
 * same flag that lets search engines in, so a live site can never show them.
 */
export function internalPagesEnabled(): boolean {
  return !isIndexable();
}
