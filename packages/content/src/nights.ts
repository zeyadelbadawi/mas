import type { RecurringNight } from "./types";

// Aroma Lounge's recurring nights, from its own posts (confirmed client data, D53). Live music has fixed
// days; match nights follow Egypt's fixtures and Aroma Nights are announced on Instagram, so they carry
// no dates on the site.
export const nights: RecurringNight[] = [
  {
    id: "aroma-live-music",
    brandId: "aroma",
    title: { en: "Live music", ar: "مزيكا لايف" },
    summary: {
      en: "Good music, cozy vibes, and the perfect night out.",
      ar: "مزيكا حلوة، وقعدة دافية، وأحلى سهرة.",
    },
    performer: { en: "Sherif Elgesr on guitar", ar: "شريف الجسر على الجيتار" },
    weekly: [
      { weekday: 4, starts: "21:00", ends: "23:00", locationId: "aroma-madinaty" },
      { weekday: 5, starts: "21:00", ends: "23:00", locationId: "aroma-mivida" },
    ],
    imageSlotId: "aroma.nights.live-music",
    reservable: true,
    placeholder: false,
  },
  {
    id: "aroma-match-nights",
    brandId: "aroma",
    title: { en: "Match nights", ar: "ليالي الماتشات" },
    summary: {
      en: "Big screens, great food, shisha and drinks, and the whole place cheering for Egypt. Wear your red, bring your friends.",
      ar: "شاشات كبيرة، وأكل حلو، وشيشة ومشروبات، والمكان كله بيشجّع مصر. البس الأحمر وهات صحابك.",
    },
    when: { en: "On Egypt's match days, at both branches", ar: "في أيام ماتشات مصر، في الفرعين" },
    imageSlotId: "aroma.nights.match",
    reservable: true,
    placeholder: false,
  },
  {
    id: "aroma-nights",
    brandId: "aroma",
    title: { en: "Aroma Nights", ar: "Aroma Nights" },
    summary: {
      en: "A night made for good food, great music, and even better vibes. Come for dinner. Stay for the atmosphere.",
      ar: "ليلة معمولة للأكل الحلو والمزيكا الحلوة والجو الأحلى. تعالى على العشا، وخليك للسهرة.",
    },
    when: {
      en: "Every now and then at Madinaty, with a DJ. Dates on our Instagram",
      ar: "من وقت للتاني في مدينتي مع DJ. المواعيد على الإنستجرام",
    },
    imageSlotId: "aroma.nights.aroma-nights",
    reservable: true,
    placeholder: false,
  },
];
