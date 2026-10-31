#!/usr/bin/env node
// Build packages/content/src/menus/aroma.ts from Aroma Lounge's digital menu (D52/D53).
//
// Usage:
//   node tools/menus/import-aroma.mjs [--menu docs/research/aroma/menu-2026-10-31.json] [--photos]
//
// The menu JSON is the client's digital menu as fetched from its public API (see docs/research/aroma). Names
// come from tools/menus/aroma-names.json: the Arabic name of every item, written in the voice Aroma uses,
// and English fixes for typos only. With --photos, each dish photo is fetched from the menu's image service,
// cropped square and saved as WebP under apps/aroma/public/images/menu/. Re-run when the client changes the
// menu; a new item without an Arabic name stops the script.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { values } = parseArgs({
  options: {
    menu: { type: "string", default: "docs/research/aroma/menu-2026-10-31.json" },
    photos: { type: "boolean", default: false },
  },
});

const menus = JSON.parse(readFileSync(path.join(root, values.menu), "utf8"));
const names = JSON.parse(
  readFileSync(path.join(root, "tools/menus/aroma-names.json"), "utf8"),
).items;
const photoDir = path.join(root, "apps/aroma/public/images/menu");
const PHOTO_SIZE = 640;

// Category ids, tabs, Arabic names and one-line intros. Intros reuse Aroma's own captions where one fits.
const CATEGORIES = {
  "Breakfast Menu": {
    id: "breakfast",
    group: "breakfast",
    kind: "food",
    name: { en: "Breakfast", ar: "الفطار" },
    intro: {
      en: "Start your day the Aroma way — fresh, hearty, and full of flavor from the first bite.",
      ar: "ابدأ يومك على طريقة أروما: فطار طازة ومشبّع وطعمه حلو من أول لقمة.",
    },
  },
  Soups: {
    id: "soups",
    group: "food",
    kind: "food",
    name: { en: "Soups", ar: "الشوربة" },
    intro: { en: "Warm bowls to start with.", ar: "شوربة سخنة تبدأ بيها." },
  },
  "Burgers & Sandwiches": {
    id: "burgers-sandwiches",
    group: "food",
    kind: "food",
    name: { en: "Burgers & Sandwiches", ar: "البرجر والساندوتشات" },
    intro: { en: "Stacked with flavor, served with love.", ar: "طعم فوق طعم، ومتقدّمة بحب." },
  },
  Salads: {
    id: "salads",
    group: "food",
    kind: "food",
    name: { en: "Salads", ar: "السلطات" },
    intro: { en: "Fresh, crisp, and bursting with flavor.", ar: "طازة ومقرمشة ومليانة طعم." },
  },
  Appetizers: {
    id: "appetizers",
    group: "food",
    kind: "food",
    name: { en: "Appetizers", ar: "المقبلات" },
    intro: { en: "Made for sharing.", ar: "تتقسم على الترابيزة." },
  },
  Feteer: {
    id: "feteer",
    group: "food",
    kind: "food",
    name: { en: "Feteer", ar: "الفطير" },
    intro: {
      en: "The crispy, buttery goodness of feteer, savory or sweet.",
      ar: "فطير مقرمش بالزبدة، حادق أو حلو.",
    },
  },
  Pasta: {
    id: "pasta",
    group: "food",
    kind: "food",
    name: { en: "Pasta", ar: "الباستا" },
    intro: {
      en: "Crafted to comfort, made to impress — the kind you savor slowly.",
      ar: "معمولة عشان تريّحك، وتتاكل على مهلك.",
    },
  },
  Paella: {
    id: "paella",
    group: "food",
    kind: "food",
    name: { en: "Paella", ar: "الباييلا" },
    intro: {
      en: "One pan in the middle of the table, for everyone.",
      ar: "طاسة واحدة في نص الترابيزة، للكل.",
    },
  },
  "Main Course": {
    id: "main-course",
    group: "food",
    kind: "food",
    name: { en: "Main Course", ar: "الأطباق الرئيسية" },
    intro: {
      en: "Comfort food, elevated — with a side of ambiance.",
      ar: "أكل بيريّح، بس على مستوى تاني، ومعاه أحلى قعدة.",
    },
  },
  Pizza: {
    id: "pizza",
    group: "food",
    kind: "food",
    name: { en: "Pizza", ar: "البيتزا" },
    intro: { en: "Made to share.", ar: "تتقسم على الترابيزة." },
  },
  Risotto: {
    id: "risotto",
    group: "food",
    kind: "food",
    name: { en: "Risotto", ar: "الريزوتو" },
    intro: { en: "Creamy Italian risotto.", ar: "ريزوتو إيطالي كريمي." },
  },
  "Soft Drinks & Water": {
    id: "soft-drinks",
    group: "drinks",
    kind: "drinks",
    name: { en: "Soft Drinks & Water", ar: "الساقع والمية" },
    intro: { en: "The classics, ice cold.", ar: "الكلاسيك، ساقع على الآخر." },
  },
  "Juices & Mixes": {
    id: "juices",
    group: "drinks",
    kind: "drinks",
    name: { en: "Juices & Mixes", ar: "العصاير والكوكتيلات" },
    intro: { en: "Fresh juices and fruit cocktails.", ar: "عصاير فريش وكوكتيلات فواكه." },
  },
  "Hot Drinks": {
    id: "hot-drinks",
    group: "drinks",
    kind: "drinks",
    name: { en: "Hot Drinks", ar: "المشروبات السخنة" },
    intro: {
      en: "Where every cup tells a story — brewed fresh, sipped slow, savored always.",
      ar: "كل فنجان ليه حكاية: متحضّر طازة، ويتشرب على مهله.",
    },
  },
  "Cold Drinks": {
    id: "cold-drinks",
    group: "drinks",
    kind: "drinks",
    name: { en: "Cold Drinks", ar: "المشروبات الساقعة" },
    intro: { en: "Pure chill in a glass.", ar: "روقان في كوباية." },
  },
  Smoothies: {
    id: "smoothies",
    group: "drinks",
    kind: "drinks",
    name: { en: "Smoothies", ar: "السموذي" },
    intro: { en: "Fruit, blended.", ar: "فواكه في الخلاط." },
  },
  "Yogurt Mixes": {
    id: "yogurt",
    group: "drinks",
    kind: "drinks",
    name: { en: "Yogurt Mixes", ar: "ميكسات الزبادي" },
    intro: { en: "Yogurt blended with fruit or honey.", ar: "زبادي مضروب بالفواكه أو العسل." },
  },
  "Hot matcha": {
    id: "hot-matcha",
    group: "drinks",
    kind: "drinks",
    name: { en: "Hot Matcha", ar: "ماتشا سخنة" },
    intro: { en: "Matcha, warm and smooth.", ar: "ماتشا سخنة وناعمة." },
  },
  "Cold matcha": {
    id: "cold-matcha",
    group: "drinks",
    kind: "drinks",
    name: { en: "Cold Matcha", ar: "ماتشا ساقعة" },
    intro: { en: "Matcha over ice.", ar: "ماتشا على تلج." },
  },
  Dessert: {
    id: "dessert",
    group: "dessert",
    kind: "food",
    name: { en: "Dessert", ar: "الحلو" },
    intro: { en: "Sweetness served fresh at Aroma Lounge.", ar: "حلويات طازة من أروما لاونج." },
  },
  "Kids Menu": {
    id: "kids",
    group: "kids",
    kind: "food",
    name: { en: "Kids", ar: "الأطفال" },
    intro: { en: "Little plates for little guests.", ar: "أطباق صغيرة لضيوفنا الصغيرين." },
  },
};

/** The menu tool stores rich text: drop tags and entities, keep the plain line. */
function plain(text) {
  return (text ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The menu's own image service serves the client's photos (the S3 originals refuse direct requests). */
const photoUrl = (s3) =>
  s3.replace(/^https:\/\/[^/]+\/media\//, "https://images-internal.mydigimenu.com/media/") +
  `?w=${PHOTO_SIZE * 2}&h=${PHOTO_SIZE * 2}&tr=rt-auto`;

async function savePhoto(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "attention" })
    .webp({ quality: 78 })
    .toFile(file);
}

/**
 * Items without a photo show the menu tool's stand-in: Aroma's petal logo on white. Mostly white with a
 * good share of the logo's green means it's the stand-in, not a dish.
 */
async function isLogoStandIn(file) {
  const { data } = await sharp(file)
    .resize(64, 64)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let white = 0;
  let green = 0;
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r > 235 && g > 235 && b > 235) white += 1;
    else if (g > 150 && r < 190 && b < 120 && g - r > 30) green += 1;
  }
  const n = data.length / 3;
  return white / n > 0.5 && green / n > 0.1;
}

if (values.photos) mkdirSync(photoDir, { recursive: true });
let standIns = 0;

const categories = [];
const order = ["Breakfast Menu", "Food Menu", "Beverage Menu", "Dessert", "Kids Menu"];
let photos = 0;
for (const menuTitle of order) {
  const menu = menus.find((m) => m.menu === menuTitle);
  if (!menu) throw new Error(`Menu "${menuTitle}" is missing from ${values.menu}`);
  for (const section of menu.sections) {
    const key = section.name.en.trim();
    const def = CATEGORIES[key];
    if (!def) throw new Error(`No category definition for "${key}": add it to CATEGORIES`);
    const seen = new Set();
    const items = [];
    for (const item of section.items) {
      const n = names[String(item.id)];
      if (!n?.ar) throw new Error(`No Arabic name for item ${item.id} "${item.name.en}"`);
      const en = n.en ?? item.name.en.trim();
      let slug = slugify(en);
      while (seen.has(slug)) slug += "-2";
      seen.add(slug);
      const price = item.prices.map((p) => p.price).find((p) => p > 0);
      if (!price) throw new Error(`No price for item ${item.id} "${en}"`);
      let photo;
      if (item.image) {
        const file = path.join(photoDir, `${def.id}-${slug}.webp`);
        if (values.photos && !existsSync(file)) {
          await savePhoto(photoUrl(item.image), file);
          photos += 1;
        }
        if (existsSync(file) && (await isLogoStandIn(file))) {
          rmSync(file);
          standIns += 1;
        }
        if (existsSync(file)) photo = `/images/menu/${def.id}-${slug}.webp`;
      }
      items.push({
        id: `aroma.${def.id}.${slug}`,
        name: { en, ar: n.ar },
        description: { en: plain(item.desc_en), ar: plain(item.desc_ar) || (n.descAr ?? "") },
        priceEGP: price,
        tags: [],
        ...(photo ? { imageSlotId: `aroma.menu.${def.id}.${slug}`, photo } : {}),
        placeholder: false,
      });
    }
    categories.push({
      id: def.id,
      brandId: "aroma",
      kind: def.kind,
      group: def.group,
      name: def.name,
      intro: def.intro,
      items,
    });
  }
}

const out = `// Aroma Lounge's menu, generated by tools/menus/import-aroma.mjs from the client's digital menu (D52/D53).
// Do not edit by hand: change tools/menus/aroma-names.json or the source menu and re-run the script.
// Type-only import: the asset-manifest script loads this file with Node's type stripping.
import type { MenuCategory } from "../types";

export const aromaMenu: MenuCategory[] = ${JSON.stringify(categories, null, 2)};
`;
writeFileSync(path.join(root, "packages/content/src/menus/aroma.ts"), out);
const count = categories.reduce((n, c) => n + c.items.length, 0);
const withPhoto = categories.reduce((n, c) => n + c.items.filter((i) => i.photo).length, 0);
console.log(
  `Wrote packages/content/src/menus/aroma.ts: ${categories.length} categories, ${count} items, ${withPhoto} with a photo` +
    (values.photos ? ` (${photos} downloaded)` : "") +
    (standIns ? `; ${standIns} logo stand-ins removed` : ""),
);
