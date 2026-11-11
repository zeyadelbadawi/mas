// Stash's catalogue (D77): the eight ranges from the owner's list, in its order, each with the sub-types the
// owner named. The English range names and summaries are the owner's words; the Arabic is ours. Sizes,
// materials, minimum orders and lead times come later from the client (plan §9), so nothing here claims them.
// Type-only imports: the asset-manifest script loads this file with Node's type stripping.
import type { LocalizedText } from "@mas/i18n";

/** The three shapes the Design Studio draws in its first version (plan §5.3). */
export type StudioShape = "cup" | "box" | "bag";

export type StashSubtype = {
  /** Unique within its range; with the range slug it names the photo slot. */
  slug: string;
  name: LocalizedText;
  /** Set when the Design Studio can draw it, so its card offers "Design this". */
  studio?: StudioShape;
  /**
   * A sub-type whose name is a claim the client must back with a certificate (D79). It stays hidden until
   * the client sends one.
   */
  needsCertificate?: true;
};

export type StashRange = {
  slug: string;
  /** 1–8, the order of the owner's list (also the numbers in the home page's second scene). */
  order: number;
  name: LocalizedText;
  /** The owner's one-line description. */
  summary: LocalizedText;
  subtypes: StashSubtype[];
};

type Row = [slug: string, en: string, ar: string, extra?: Partial<StashSubtype>];

const sub = (rows: Row[]): StashSubtype[] =>
  rows.map(([slug, en, ar, extra]) => ({ slug, name: { en, ar }, ...extra }));

export const stashRanges: StashRange[] = [
  {
    slug: "coffee-beverage",
    order: 1,
    name: { en: "Coffee & Beverage Packaging", ar: "تغليف القهوة والمشروبات" },
    summary: {
      en: "Hot cups, cold cups, double-wall cups, ripple cups, lids, sleeves, straws and cup carriers.",
      ar: "أكواب للمشروبات الساخنة والباردة، وأكواب بجدار مزدوج وأكواب مموجة، وأغطية وأكمام وشفاطات وحاملات أكواب.",
    },
    subtypes: sub([
      ["hot-cups", "Hot cups", "أكواب المشروبات الساخنة", { studio: "cup" }],
      ["cold-cups", "Cold cups", "أكواب المشروبات الباردة"],
      ["double-wall-cups", "Double-wall cups", "أكواب بجدار مزدوج", { studio: "cup" }],
      ["ripple-cups", "Ripple cups", "أكواب مموجة (ريبل)", { studio: "cup" }],
      ["lids", "Lids", "الأغطية"],
      ["sleeves", "Sleeves", "أكمام الأكواب"],
      ["straws", "Straws", "الشفاطات"],
      ["cup-carriers", "Cup carriers", "حاملات الأكواب"],
    ]),
  },
  {
    slug: "fast-food",
    order: 2,
    name: { en: "Fast Food Packaging", ar: "تغليف الوجبات السريعة" },
    summary: {
      en: "Burger boxes, fries cartons, chicken buckets, pizza boxes, sandwich packaging and meal boxes.",
      ar: "علب البرجر والبطاطس، وباكتات الدجاج، وعلب البيتزا، وتغليف الساندوتشات، وعلب الوجبات.",
    },
    subtypes: sub([
      ["burger-boxes", "Burger boxes", "علب البرجر"],
      ["fries-cartons", "Fries cartons", "علب البطاطس"],
      ["chicken-buckets", "Chicken buckets", "باكتات الدجاج"],
      ["pizza-boxes", "Pizza boxes", "علب البيتزا"],
      ["sandwich-packaging", "Sandwich packaging", "تغليف الساندوتشات"],
      ["meal-boxes", "Meal boxes", "علب الوجبات", { studio: "box" }],
    ]),
  },
  {
    slug: "containers-bowls",
    order: 3,
    name: { en: "Food Containers & Bowls", ar: "علب وبولات الطعام" },
    summary: {
      en: "Salad bowls, soup cups, kraft containers, compartment trays and takeaway food boxes.",
      ar: "بولات السلطة، وأكواب الشوربة، وعلب الكرافت، والصواني المقسمة، وعلب التيك أواي.",
    },
    subtypes: sub([
      ["salad-bowls", "Salad bowls", "بولات السلطة"],
      ["soup-cups", "Soup cups", "أكواب الشوربة"],
      ["kraft-containers", "Kraft containers", "علب الكرافت"],
      ["compartment-trays", "Compartment trays", "صواني مقسمة"],
      ["takeaway-boxes", "Takeaway food boxes", "علب التيك أواي", { studio: "box" }],
    ]),
  },
  {
    slug: "bakery-pastry",
    order: 4,
    name: { en: "Bakery & Pastry Packaging", ar: "تغليف المخبوزات والحلويات" },
    summary: {
      en: "Cake boxes, pastry boxes, cupcake boxes, donut boxes, window cartons and dessert packaging.",
      ar: "علب التورت والمعجنات والكب كيك والدونتس، وعلب بنافذة، وتغليف الحلويات.",
    },
    subtypes: sub([
      ["cake-boxes", "Cake boxes", "علب التورت", { studio: "box" }],
      ["pastry-boxes", "Pastry boxes", "علب المعجنات", { studio: "box" }],
      ["cupcake-boxes", "Cupcake boxes", "علب الكب كيك"],
      ["donut-boxes", "Donut boxes", "علب الدونتس"],
      ["window-cartons", "Window cartons", "علب بنافذة"],
      ["dessert-packaging", "Dessert packaging", "تغليف الحلويات"],
    ]),
  },
  {
    slug: "bags-carriers",
    order: 5,
    name: { en: "Paper Bags & Carriers", ar: "الشنط الورقية والحاملات" },
    summary: {
      en: "SOS bags, flat-handle bags, twisted-handle bags, delivery bags and premium branded bags.",
      ar: "أكياس SOS، وشنط بيد مسطحة أو مبرومة، وشنط التوصيل، وشنط فاخرة باسم علامتك.",
    },
    subtypes: sub([
      ["sos-bags", "SOS bags", "أكياس SOS"],
      ["flat-handle-bags", "Flat-handle bags", "شنط بيد مسطحة", { studio: "bag" }],
      ["twisted-handle-bags", "Twisted-handle bags", "شنط بيد مبرومة", { studio: "bag" }],
      ["delivery-bags", "Delivery bags", "شنط التوصيل", { studio: "bag" }],
      ["premium-bags", "Premium branded bags", "شنط فاخرة باسم علامتك", { studio: "bag" }],
    ]),
  },
  {
    slug: "wrapping-paper",
    order: 6,
    name: { en: "Food Wrapping & Paper", ar: "ورق تغليف الطعام" },
    summary: {
      en: "Greaseproof paper, burger wraps, sandwich wraps, bakery tissue and food-grade wrapping sheets.",
      ar: "ورق مقاوم للدهون، وورق لف البرجر والساندوتشات، وورق المخبوزات، وأوراق تغليف آمنة لملامسة الطعام.",
    },
    subtypes: sub([
      ["greaseproof-paper", "Greaseproof paper", "ورق مقاوم للدهون"],
      ["burger-wraps", "Burger wraps", "ورق لف البرجر"],
      ["sandwich-wraps", "Sandwich wraps", "ورق لف الساندوتشات"],
      ["bakery-tissue", "Bakery tissue", "ورق المخبوزات"],
      ["food-grade-sheets", "Food-grade wrapping sheets", "أوراق تغليف آمنة لملامسة الطعام"],
    ]),
  },
  {
    slug: "sustainable",
    order: 7,
    name: { en: "Sustainable Packaging", ar: "التغليف المستدام" },
    // The owner's line ends "…and certified compostable options". That is a claim, so it comes back once the
    // client sends the certificate (D79), together with the sub-type below.
    summary: {
      en: "Bagasse products, molded-fiber containers and recyclable packaging.",
      ar: "منتجات الباجاس، وعلب الألياف المضغوطة، وتغليف قابل لإعادة التدوير.",
    },
    subtypes: sub([
      ["bagasse", "Bagasse products", "منتجات الباجاس"],
      ["molded-fiber", "Molded-fiber containers", "علب الألياف المضغوطة"],
      ["recyclable", "Recyclable packaging", "تغليف قابل لإعادة التدوير"],
      [
        "compostable",
        "Certified compostable options",
        "خيارات معتمدة قابلة للتحلل",
        { needsCertificate: true },
      ],
    ]),
  },
  {
    slug: "accessories-tableware",
    order: 8,
    name: { en: "Accessories & Tableware", ar: "الإكسسوارات وأدوات المائدة" },
    summary: {
      en: "Napkins, cutlery, sauce cups, paper plates, trays and complementary foodservice accessories.",
      ar: "المناديل، وأدوات المائدة، وعلب الصوص، والأطباق الورقية، والصواني، وإكسسوارات أخرى للمطاعم والكافيهات.",
    },
    subtypes: sub([
      ["napkins", "Napkins", "المناديل"],
      ["cutlery", "Cutlery", "أدوات المائدة"],
      ["sauce-cups", "Sauce cups", "علب الصوص"],
      ["paper-plates", "Paper plates", "أطباق ورقية"],
      ["trays", "Trays", "صواني"],
      ["accessories", "Foodservice accessories", "إكسسوارات المطاعم والكافيهات"],
    ]),
  },
];

/** The certificates the client has sent so far (D79); a sub-type that needs one shows once it is listed. */
export const stashCertificates: readonly string[] = [];

/** The sub-types a page may show: everything except claims still waiting for a certificate. */
export function visibleSubtypes(range: StashRange): StashSubtype[] {
  return range.subtypes.filter(
    (s) => !s.needsCertificate || stashCertificates.includes(`${range.slug}/${s.slug}`),
  );
}

export function findRange(slug: string): StashRange | undefined {
  return stashRanges.find((r) => r.slug === slug);
}
