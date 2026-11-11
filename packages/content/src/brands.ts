import type { Brand, BrandId } from "./types";

// Domains and inboxes follow D10/D17; socials are placeholders until the client sends them.
export const brands: Record<BrandId, Brand> = {
  mas: {
    id: "mas",
    name: { en: "MAS", ar: "MAS" },
    // The identity's tagline (D64).
    tagline: {
      en: "Café & Restaurant Management",
      ar: "إدارة الكافيهات والمطاعم",
    },
    domain: "https://mas.com",
    inboxEmail: "info@masegypt.com",
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
    liveUrl: "https://mas-covy-hazel.vercel.app",
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
      ar: "الأكل الحلو بيطلع من القلوب الطيبة، وإحنا بنسعى للاتنين.",
    },
    domain: "https://aroma.mas.com",
    liveUrl: "https://aroma-black-one.vercel.app",
    inboxEmail: "aroma@mas.com",
    // Aroma's own accounts (D53); the domain is still the placeholder all three sites share.
    socials: [
      { network: "instagram", url: "https://www.instagram.com/aroma_lounge_eg" },
      { network: "facebook", url: "https://www.facebook.com/AromaLoungeeg" },
    ],
    orderUrl: "https://www.talabat.com/egypt/aroma-lounge",
    placeholder: false,
  },
  // Stash (D77, D80): a separate brand, not part of MAS, with its own domain. Food-service packaging, made
  // to order. The domain and inbox are placeholders (.example never resolves) until the client gives its own;
  // no social accounts yet.
  stash: {
    id: "stash",
    name: { en: "STASH", ar: "ستاش" },
    tagline: { en: "Designed by you. Made by STASH.", ar: "تصميمك أنت، وتصنيع STASH." },
    domain: "https://stash.example",
    inboxEmail: "quotes@stash.example",
    socials: [],
    placeholder: true,
  },
};
