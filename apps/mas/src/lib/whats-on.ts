import { brands, events, findBranch, nights } from "@mas/content";
import { formatDate, formatTime, intlLocale, type Locale } from "@mas/i18n";

export type WhatsOnItem = {
  id: string;
  brand: "covy" | "aroma";
  brandName: string;
  title: string;
  summary: string;
  /** When it happens, in words: a date and time, a weekly day, or a line like "on match days". */
  when: string;
  imageSlotId: string;
  /** Sample data (rule 5): labelled on the page. */
  placeholder: boolean;
};

/** "Thursdays" / "الخميس": the plural weekday name, for weekly nights. */
function weekdays(weekday: number, locale: Locale): string {
  // 2000-01-02 was a Sunday (weekday 0).
  const name = new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 2 + weekday)));
  return locale === "en" ? `${name}s` : `كل ${name}`;
}

/**
 * What's on at the places MAS runs (D64, shared data): COVY's dated events (samples until the real
 * calendar arrives) and Aroma Lounge's recurring nights (its own posts, D52). Dated events first, by date.
 */
export function whatsOn(locale: Locale): WhatsOnItem[] {
  const dated = [...events]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map(
      (e): WhatsOnItem => ({
        id: e.id,
        brand: e.brandId,
        brandName: brands[e.brandId].name[locale],
        title: e.title[locale],
        summary: e.summary[locale],
        when: `${formatDate(new Date(e.startsAt), locale, { year: undefined })}, ${formatTime(
          e.startsAt.slice(11, 16),
          locale,
        )}`,
        imageSlotId: e.imageSlotId,
        placeholder: e.placeholder,
      }),
    );
  const recurring = nights.map(
    (n): WhatsOnItem => ({
      id: n.id,
      brand: n.brandId,
      brandName: brands[n.brandId].name[locale],
      title: n.title[locale],
      summary: n.summary[locale],
      when: n.weekly
        ? n.weekly
            .map((w) => {
              const branch = findBranch(n.brandId, w.locationId);
              return `${weekdays(w.weekday, locale)}, ${formatTime(w.starts, locale)}${
                branch ? ` · ${branch.name[locale].split(" — ").pop()}` : ""
              }`;
            })
            .join(" / ")
        : (n.when?.[locale] ?? ""),
      imageSlotId: n.imageSlotId,
      placeholder: n.placeholder,
    }),
  );
  return [...dated, ...recurring];
}

/** The home page's three: the next two dated events and Aroma's weekly live music. */
export function whatsOnPreview(locale: Locale): WhatsOnItem[] {
  const all = whatsOn(locale);
  const dated = all.filter((i) => i.brand === "covy").slice(0, 2);
  const weekly = all.find((i) => i.id === "aroma-live-music");
  return weekly ? [...dated, weekly] : all.slice(0, 3);
}
