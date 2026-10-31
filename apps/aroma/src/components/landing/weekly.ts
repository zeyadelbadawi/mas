import { findBranch, nights, type RecurringNight } from "@mas/content";
import { formatTime, intlLocale, pick, type Locale } from "@mas/i18n";

/** A weekday's name (0 = Sunday), from a fixed week so it never depends on today's date. */
export function weekdayName(weekday: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2026, 10, 1 + weekday)),
  );
}

export type WeeklySlot = {
  day: string;
  branch: string;
  branchId: string;
  from: string;
  to: string;
};

/** A recurring night's weekly slots, ready to print. */
export function weeklySlots(night: RecurringNight, locale: Locale): WeeklySlot[] {
  return (night.weekly ?? []).map((w) => {
    const loc = findBranch(night.brandId, w.locationId);
    return {
      // Arabic reads "كل خميس" ("every Thursday"): the day without its article.
      day:
        locale === "ar"
          ? weekdayName(w.weekday, locale).replace(/^ال/, "")
          : weekdayName(w.weekday, locale),
      branch: loc?.branch ? pick(loc.branch, locale) : "",
      branchId: w.locationId,
      from: formatTime(w.starts, locale),
      to: formatTime(w.ends, locale),
    };
  });
}

export const aromaNights = nights.filter((n) => n.brandId === "aroma");
export const liveMusic = aromaNights.find((n) => n.id === "aroma-live-music");
