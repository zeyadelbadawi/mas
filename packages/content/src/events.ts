// Sample events. All placeholders (CLAUDE.md rule 5) until the client sends the real calendar.
// Type-only imports: the asset-manifest script loads this file with Node's type stripping.
import type { BrandEvent } from "./types";

export const events: BrandEvent[] = [
  {
    id: "covy-brunch-club",
    brandId: "covy",
    locationId: "covy-main",
    title: { en: "Friday brunch club", ar: "برانش الجمعة" },
    summary: {
      en: "A long table, a set brunch menu from five kitchens and bottomless filter coffee.",
      ar: "طاولة طويلة ومنيو برانش من خمس مطابخ وقهوة مفلترة بلا حدود.",
    },
    startsAt: "2026-11-13T11:00:00+02:00",
    endsAt: "2026-11-13T15:00:00+02:00",
    imageSlotId: "covy.events.brunch-club",
    reservable: true,
    placeholder: true,
  },
  {
    id: "covy-oud-evening",
    brandId: "covy",
    locationId: "covy-main",
    title: { en: "Oud and coffee evening", ar: "أمسية عود وقهوة" },
    summary: {
      en: "Live oud under the blue tree, with a tasting of three single-origin coffees.",
      ar: "عود حي تحت الشجرة الزرقاء، مع تذوق ثلاثة أنواع بن من مصدر واحد.",
    },
    startsAt: "2026-11-20T20:00:00+02:00",
    endsAt: "2026-11-20T23:00:00+02:00",
    imageSlotId: "covy.events.oud-evening",
    reservable: true,
    placeholder: true,
  },
  {
    id: "covy-japan-week",
    brandId: "covy",
    locationId: "covy-main",
    title: { en: "World kitchen week: Japan", ar: "أسبوع المطابخ: اليابان" },
    summary: {
      en: "A week-long Japanese menu: ramen, gyoza and matcha desserts.",
      ar: "منيو ياباني لمدة أسبوع: رامن وجيوزا وحلويات بالماتشا.",
    },
    startsAt: "2026-12-04T12:00:00+02:00",
    endsAt: "2026-12-10T23:00:00+02:00",
    imageSlotId: "covy.events.japan-week",
    reservable: false,
    placeholder: true,
  },
];
