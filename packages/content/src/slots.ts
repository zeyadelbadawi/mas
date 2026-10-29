// Every image and sequence slot on the three sites (CLAUDE.md rule 3).
// `pnpm assets:manifest` turns this file into docs/assets/asset-manifest.md, the designer's checklist,
// so it must stay free of runtime imports (the script loads it with Node's type stripping).
import type { LocalizedText } from "@mas/i18n";
import type { BrandEvent, MenuCategory } from "./types";

type App = "mas" | "covy" | "aroma";

export type ImageSlotSpec = {
  kind: "image";
  id: string;
  app: App;
  page: string;
  section: string;
  /** Delivery size in px: 2× the largest rendered size. */
  width: number;
  height: number;
  alt: LocalizedText;
  /** Set when the designer's file is in place. */
  src?: string;
  notes?: string;
};

export type SequenceSlotSpec = {
  kind: "sequence";
  id: string;
  app: App;
  page: string;
  section: string;
  frameCount: number;
  desktop: { width: number; height: number };
  mobile: { width: number; height: number };
  label: LocalizedText;
  /** Set when the MAG render has gone through tools/sequences and is on R2. */
  manifestUrl?: string;
  notes?: string;
};

export type SlotSpec = ImageSlotSpec | SequenceSlotSpec;

const SEQ = {
  frameCount: 150,
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 1080, height: 1350 },
};

export const slots: SlotSpec[] = [
  /* ------------------------------------------------------------ MAS */
  {
    kind: "image",
    id: "mas.hero.poster",
    app: "mas",
    page: "Home",
    section: "M1 Obsidian field",
    width: 2880,
    height: 1620,
    alt: {
      en: "Dark faceted surface lit by a crimson light",
      ar: "سطح داكن متعدد الأوجه يضيئه ضوء قرمزي",
    },
    notes:
      "Still fallback for the real-time 3D hero on low-power devices; we can render it from the 3D scene",
  },
  {
    kind: "sequence",
    id: "mas.portal",
    app: "mas",
    page: "Home",
    section: "M5 Two doors",
    ...SEQ,
    label: {
      en: "A stone corridor opening onto COVY and Aroma Lounge",
      ar: "ممر حجري ينفتح على COVY وأروما لاونج",
    },
    notes: "Generated with MAG",
  },
  {
    kind: "image",
    id: "mas.og",
    app: "mas",
    page: "All",
    section: "Social share image",
    width: 1200,
    height: 630,
    alt: { en: "MAS", ar: "MAS" },
  },

  /* ------------------------------------------------------------ COVY */
  {
    kind: "sequence",
    id: "covy.hero",
    app: "covy",
    page: "Landing",
    section: "C1 Through the arches",
    ...SEQ,
    label: {
      en: "Walking through COVY's arched entrance to the blue tree",
      ar: "الدخول من أقواس COVY حتى الشجرة الزرقاء",
    },
    notes: "Generated with MAG from the client's interior renders",
  },
  {
    kind: "sequence",
    id: "covy.signature",
    app: "covy",
    page: "Landing",
    section: "C3 The signature cup",
    ...SEQ,
    label: {
      en: "COVY's signature iced coffee being built in a glass",
      ar: "تحضير قهوة COVY المثلجة المميزة في الكوب",
    },
    notes: "Generated with MAG",
  },
  ...(
    [
      ["mediterranean", "Mediterranean dish", "طبق من مطبخ البحر المتوسط"],
      ["asian", "Asian dish", "طبق آسيوي"],
      ["latin", "Latin American dish", "طبق من أمريكا اللاتينية"],
      ["middle-eastern", "Middle-Eastern dish", "طبق شرقي"],
      ["italian", "Italian dish", "طبق إيطالي"],
    ] as const
  ).map(
    ([key, en, ar]): ImageSlotSpec => ({
      kind: "image",
      id: `covy.cuisines.${key}`,
      app: "covy",
      page: "Landing",
      section: "C4 The Taste of Everywhere",
      width: 1600,
      height: 2000,
      alt: { en, ar },
    }),
  ),
  ...(
    [
      ["indoor", "COVY indoor seating", "الجلسات الداخلية في COVY"],
      ["terrace", "COVY outdoor terrace", "التراس الخارجي في COVY"],
      ["shisha", "COVY shisha area", "منطقة الشيشة في COVY"],
      ["corner", "COVY's photo corner", "ركن التصوير في COVY"],
    ] as const
  ).map(
    ([key, en, ar]): ImageSlotSpec => ({
      kind: "image",
      id: `covy.spaces.${key}`,
      app: "covy",
      page: "Landing",
      section: "C6 Spaces",
      width: 1200,
      height: 1600,
      alt: { en, ar },
    }),
  ),
  {
    kind: "image",
    id: "covy.visit.facade",
    app: "covy",
    page: "Landing",
    section: "C10 Find us",
    width: 1200,
    height: 1500,
    alt: { en: "COVY's arched entrance", ar: "مدخل COVY المقوّس" },
  },
  {
    kind: "image",
    id: "covy.og",
    app: "covy",
    page: "All",
    section: "Social share image",
    width: 1200,
    height: 630,
    alt: { en: "COVY", ar: "COVY" },
  },

  /* ------------------------------------------------------------ Aroma Lounge */
  {
    kind: "sequence",
    id: "aroma.hero",
    app: "aroma",
    page: "Landing",
    section: "A1 Aroma rising",
    ...SEQ,
    label: {
      en: "Steam rising from a freshly served paella",
      ar: "بخار يتصاعد من طبق باييلا طازج",
    },
    notes: "Generated with MAG",
  },
  {
    kind: "sequence",
    id: "aroma.terrace",
    app: "aroma",
    page: "Landing",
    section: "A5 Terrace, dusk to night",
    ...SEQ,
    label: {
      en: "Aroma Lounge's terrace from daylight to evening",
      ar: "تراس أروما لاونج من النهار حتى المساء",
    },
    notes: "Generated with MAG",
  },
  {
    kind: "image",
    id: "aroma.og",
    app: "aroma",
    page: "All",
    section: "Social share image",
    width: 1200,
    height: 630,
    alt: { en: "Aroma Lounge", ar: "أروما لاونج" },
  },
];

/** Menu slots: a chapter-opener photo per category and a thumbnail per signature dish. */
export function menuSlots(menu: MenuCategory[]): ImageSlotSpec[] {
  return menu.flatMap((c): ImageSlotSpec[] => [
    {
      kind: "image",
      id: `${c.brandId}.menu.${c.id}.hero`,
      app: c.brandId,
      page: "Landing",
      section: `Menu · ${c.name.en}`,
      width: 1600,
      height: 1000,
      alt: {
        en: `${c.name.en} at ${c.brandId === "covy" ? "COVY" : "Aroma Lounge"}`,
        ar: c.name.ar,
      },
    },
    ...c.items
      .filter((item) => item.imageSlotId)
      .map(
        (item): ImageSlotSpec => ({
          kind: "image",
          id: item.imageSlotId!,
          app: c.brandId,
          page: "Landing",
          section: `Menu · ${c.name.en} · ${item.name.en}`,
          width: 800,
          height: 800,
          alt: item.name,
        }),
      ),
  ]);
}

export function eventSlots(events: BrandEvent[]): ImageSlotSpec[] {
  return events.map((e) => ({
    kind: "image",
    id: e.imageSlotId,
    app: e.brandId,
    page: "Landing",
    section: `Events · ${e.title.en}`,
    width: 1200,
    height: 900,
    alt: e.title,
  }));
}
