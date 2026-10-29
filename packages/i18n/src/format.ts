import type { Locale } from "./routing";

/** BCP 47 tags with Latin digits in both languages (D26). */
export const intlLocale: Record<Locale, string> = {
  en: "en-EG-u-nu-latn",
  ar: "ar-EG-u-nu-latn",
};

export function formatPrice(amountEGP: number, locale: Locale): string {
  const n = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(
    amountEGP,
  );
  return locale === "ar" ? `${n} ج.م` : `EGP ${n}`;
}

export function formatDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Cairo",
    ...options,
  }).format(date);
}

/** "19:30" → "7:30 PM" / "7:30 م" */
export function formatTime(hhmm: string, locale: Locale): string {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h, m));
  return new Intl.DateTimeFormat(intlLocale[locale], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}
