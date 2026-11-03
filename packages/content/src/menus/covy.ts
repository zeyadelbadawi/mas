// COVY's real menu, from the client's Excel sheet (2026-11-03, D74): the seven food sections in the sheet's
// order, the dishes in the sheet's order, names only (the sheet has no descriptions or prices). Spelling is
// corrected (Omlet → omelette, Sandwiche → sandwich, Chichen → chicken, Tenderlion → tenderloin, Turky →
// turkey, Casserol → casserole, Oriantal → oriental, Willed → wild, Dynamic → dynamite); the Arabic names are
// ours, in the way Egyptian menus write them. The sheet lists five sandwiches under both Breakfast and
// Sandwiches & Burgers, so they appear in both, sharing one photo slot. Drinks, desserts and shisha are not in
// the sheet and are not shown until the client sends them. Every dish has a photo (`covy.menu.dish.*`), made
// with Magnific in COVY's style (D75: four 4×4 grids, cut into one photo per dish). Type-only imports: the
// asset-manifest script loads this file with Node's type stripping.
import type { MenuCategory, MenuItem } from "../types";

type Row = [slug: string, en: string, ar: string];

const NONE = { en: "", ar: "" };

function items(category: string, rows: Row[]): MenuItem[] {
  return rows.map(([slug, en, ar]) => ({
    id: `covy.${category}.${slug}`,
    name: { en, ar },
    description: NONE,
    tags: [],
    // One photo per dish: a dish listed in two sections shares its slot. Made with Magnific in COVY's style (D75).
    imageSlotId: `covy.menu.dish.${slug}`,
    photo: `/images/menu/${slug}.webp`,
    photoMade: true,
    placeholder: false,
  }));
}

/** The five sandwiches the sheet lists under both Breakfast and Sandwiches & Burgers. */
const SHARED_SANDWICHES: Row[] = [
  ["roasted-beef-sandwich", "Roasted beef sandwich", "ساندوتش روست بيف"],
  ["smoked-turkey-sandwich", "Smoked turkey sandwich", "ساندوتش تركي مدخن"],
  ["halloumi-pesto-sandwich", "Halloumi pesto sandwich", "ساندوتش حلومي بالبيستو"],
  ["spicy-tuna-sandwich", "Spicy tuna sandwich", "ساندوتش تونة سبايسي"],
  ["salmon-avocado-sandwich", "Salmon avocado sandwich", "ساندوتش سلمون وأفوكادو"],
];

const section = (id: string, name: { en: string; ar: string }, rows: Row[]): MenuCategory => ({
  id,
  brandId: "covy",
  kind: "food",
  name,
  intro: NONE,
  hero: false,
  items: items(id, rows),
});

export const covyMenu: MenuCategory[] = [
  section("breakfast", { en: "Breakfast", ar: "الفطار" }, [
    ["oriental-breakfast", "Oriental breakfast", "فطار شرقي"],
    ["salmon-avocado-omelette", "Salmon avocado omelette", "أومليت سلمون وأفوكادو"],
    ["mushroom-cheese-omelette", "Mushroom cheese omelette", "أومليت مشروم وجبنة"],
    [
      "hash-brown-egg-cheese-casserole",
      "Hash brown, egg & cheese casserole",
      "كاسرول هاش براون بالبيض والجبنة",
    ],
    [
      "salmon-cream-cheese-bruschetta",
      "Salmon cream cheese bruschetta",
      "بروسكيتا سلمون وكريم تشيز",
    ],
    [
      "roasted-garlic-burrata-bruschetta",
      "Roasted garlic burrata bruschetta",
      "بروسكيتا بوراتا بالتوم المشوي",
    ],
    [
      "savory-bacon-waffle-sandwich",
      "Crunchy waffle sandwich, savory bacon",
      "ساندوتش وافل مقرمش بالبيكون",
    ],
    ["salmon-benedict", "Salmon benedict", "سلمون بينيدكت"],
    ["classic-roll-omelette", "Classic roll omelette", "أومليت رول كلاسيك"],
    ["denver-omelette", "Denver omelette", "أومليت دنفر"],
    ["scrambled-pastrami", "Scrambled pastrami", "سكرامبلد بالبسطرمة"],
    ...SHARED_SANDWICHES,
    ["plain-croissant", "Plain croissant", "كرواسون سادة"],
    ["mixed-cheese-croissant", "Mixed cheese croissant", "كرواسون مكس جبن"],
    ["turkey-omelette-croissant", "Turkey omelette croissant", "كرواسون أومليت تركي"],
  ]),

  section("soup", { en: "Soup", ar: "الشوربة" }, [
    ["creamy-chicken-soup", "Creamy chicken soup", "شوربة فراخ بالكريمة"],
    ["wild-mushroom-soup", "Wild mushroom soup", "شوربة مشروم بري"],
    ["creamy-seafood-soup", "Creamy seafood soup", "شوربة سي فود بالكريمة"],
    ["onion-soup", "Onion soup", "شوربة بصل"],
  ]),

  section("appetizers", { en: "Appetizers", ar: "المقبلات" }, [
    ["dynamite-shrimp", "Dynamite shrimp", "جمبري ديناميت"],
    ["buffalo-wings", "Buffalo wings", "أجنحة بافلو"],
    ["tex-mex-fries", "Tex-Mex fries", "بطاطس تكس مكس"],
    ["tacos", "Tacos (beef or chicken)", "تاكو (لحم أو فراخ)"],
    ["chicken-avocado-quesadilla", "Chicken avocado quesadilla", "كاساديا فراخ وأفوكادو"],
    [
      "slow-cooked-beef-quesadilla",
      "Slow-cooked beef quesadilla",
      "كاساديا لحم مطهو على نار هادية",
    ],
    ["chicken-ranch-quesadilla", "Chicken ranch quesadilla", "كاساديا فراخ رانش"],
    ["pomegranate-sausage", "Pomegranate sausage", "سجق بالرمان"],
    ["beef-hawawshi", "Beef hawawshi", "حواوشي لحم"],
  ]),

  section("salads", { en: "Salads", ar: "السلطات" }, [
    ["chicken-caesar", "Chicken Caesar", "سيزر بالفراخ"],
    ["salmon-salad", "Salmon salad", "سلطة سلمون"],
    ["burrata-tenderloin-salad", "Burrata tenderloin salad", "سلطة بوراتا وتندرلوين"],
    ["greek-salad", "Traditional Greek salad", "سلطة يوناني تقليدية"],
    ["halloumi-quinoa-salad", "Halloumi quinoa salad", "سلطة حلومي وكينوا"],
    ["burrata-peach-salad", "Burrata peach salad", "سلطة بوراتا بالخوخ"],
    ["rocca-salad", "Rocca salad", "سلطة جرجير"],
    ["buffalo-chicken-salad", "Buffalo chicken salad", "سلطة فراخ بافلو"],
    ["tuna-chunks-salad", "Tuna chunks salad", "سلطة قطع التونة"],
  ]),

  section("sandwiches-burgers", { en: "Sandwiches & burgers", ar: "الساندوتشات والبرجر" }, [
    ...SHARED_SANDWICHES,
    ["bbq-steak", "BBQ steak", "ستيك باربكيو"],
    ["chicken-brioche", "Chicken brioche", "بريوش فراخ"],
    ["club-sandwich", "Club sandwich", "كلوب ساندوتش"],
    ["fried-chicken-wrap", "Fried chicken wrap", "راب فراخ مقلية"],
    ["truffle-mushroom-burger", "Truffle mushroom burger", "برجر مشروم بالترافل"],
    ["classic-burger", "Classic burger", "برجر كلاسيك"],
  ]),

  section("pasta", { en: "Pasta", ar: "الباستا" }, [
    ["chicken-mushroom-pasta", "Chicken & mushroom", "فراخ ومشروم"],
    ["pink-bolognese", "Pink bolognese", "بولونيز بينك"],
    ["burrata-pasta", "Burrata", "بوراتا"],
    ["mushroom-truffle-pasta", "Mushroom truffle", "مشروم بالترافل"],
    ["chicken-lemon-pasta", "Chicken lemon", "فراخ بالليمون"],
    ["onion-beef-pasta", "Onion beef pasta", "باستا لحم بالبصل"],
    ["rigatoni-steak", "Rigatoni steak", "ريجاتوني ستيك"],
    ["creamy-chicken-pesto", "Creamy chicken pesto", "فراخ بيستو بالكريمة"],
  ]),

  section("main-courses", { en: "Main courses", ar: "الأطباق الرئيسية" }, [
    ["lemon-butter-salmon", "Lemon butter salmon", "سلمون بزبدة الليمون"],
    ["tuscan-shrimp", "Tuscan shrimp", "جمبري توسكان"],
    ["beef-tenderloin", "Beef tenderloin", "تندرلوين لحم"],
    ["beef-stroganoff", "Beef stroganoff", "بيف ستروجانوف"],
    ["lemon-herb-chicken", "Lemon herb chicken", "فراخ بالليمون والأعشاب"],
    ["porcini-chicken-stroganoff", "Porcini chicken stroganoff", "ستروجانوف فراخ بالبورتشيني"],
    ["chicken-milano", "Chicken Milano", "فراخ ميلانو"],
    ["chicken-tenders", "Chicken tenders", "تشيكن تندرز"],
    ["chicken-parmesan", "Chicken parmesan", "فراخ بارميزان"],
  ]),
];
