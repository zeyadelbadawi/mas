import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

/** English at `/`, Arabic at `/ar` (D27). No browser-language redirects, so `/` stays English and cacheable. */
export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});

export const directions: Record<Locale, "ltr" | "rtl"> = { en: "ltr", ar: "rtl" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
