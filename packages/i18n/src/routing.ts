import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

/** English at `/`, Arabic at `/ar` (D27). No browser-language redirects, so `/` stays English and cacheable. */
export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
  // The page head already lists both languages with the production origin; next-intl's Link header would
  // repeat them from the request host (wrong on preview URLs).
  alternateLinks: false,
  // Without browser-language detection the cookie is never read; leaving it off keeps responses cacheable.
  localeCookie: false,
});

export const directions: Record<Locale, "ltr" | "rtl"> = { en: "ltr", ar: "rtl" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
