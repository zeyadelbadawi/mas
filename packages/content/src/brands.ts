import type { Brand, BrandId } from "./types";

// Domains and inboxes follow D10/D17; socials are placeholders until the client sends them.
export const brands: Record<BrandId, Brand> = {
  mas: {
    id: "mas",
    name: { en: "MAS", ar: "MAS" },
    tagline: {
      en: "Supporting business owners to achieve their goals.",
      ar: "ندعم أصحاب المشاريع لتحقيق أهدافهم.",
    },
    domain: "https://mas.com",
    inboxEmail: "mas@mas.com",
    socials: [
      { network: "instagram", url: "https://instagram.com/" },
      { network: "linkedin", url: "https://linkedin.com/" },
    ],
    placeholder: true,
  },
  covy: {
    id: "covy",
    name: { en: "COVY", ar: "COVY" },
    tagline: { en: "The Taste of Everywhere", ar: "طعم كل مكان" },
    domain: "https://covy.mas.com",
    inboxEmail: "covy@mas.com",
    socials: [
      { network: "instagram", url: "https://instagram.com/" },
      { network: "tiktok", url: "https://tiktok.com/" },
    ],
    placeholder: true,
  },
  aroma: {
    id: "aroma",
    name: { en: "Aroma Lounge", ar: "أروما لاونج" },
    tagline: {
      en: "Good food comes from good hearts, we aspire for both.",
      ar: "الطعام الطيب يأتي من القلوب الطيبة، ونسعى إلى الاثنين.",
    },
    domain: "https://aroma.mas.com",
    inboxEmail: "aroma@mas.com",
    socials: [
      { network: "instagram", url: "https://instagram.com/" },
      { network: "facebook", url: "https://facebook.com/" },
    ],
    placeholder: true,
  },
};
