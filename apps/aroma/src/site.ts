import { brands } from "@mas/content";
import type { Locale } from "@mas/i18n";
import { localePath } from "@mas/seo";

export const brand = brands.aroma;

/** Plain href for places that can't use the locale-aware Link (consent banner, form consent). */
export const privacyHref = (locale: Locale) => localePath(locale, "/privacy");
