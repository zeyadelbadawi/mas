import type { Location, OpeningHours, RestaurantId } from "./types";

const everyDay = (opens: string, closes: string): OpeningHours[] =>
  ([0, 1, 2, 3, 4, 5, 6] as const).map((weekday) => ({ weekday, opens, closes }));

const covy: Location = {
  // Every value is a placeholder (D6 / CLAUDE.md rule 5) until the client sends real data.
  id: "covy-main",
  brandId: "covy",
  name: { en: "COVY", ar: "COVY" },
  address: { en: "Address to be confirmed, Cairo", ar: "العنوان قيد التأكيد، القاهرة" },
  lat: 30.0444,
  lng: 31.2357,
  phone: "+201000000000",
  whatsapp: "201000000000",
  areas: ["indoor", "outdoor", "shisha"],
  hours: everyDay("08:00", "01:00"),
  slotMinutes: 30,
  lastBookingBeforeCloseMinutes: 90,
  maxTableGuests: 20,
  maxEventGuests: 200,
  bookingWindowDays: 60,
  placeholder: true,
};

// Aroma Lounge's two branches (D52/D53). Everything here comes from Aroma's own social media and its
// Google Maps listings, which the client confirms as real; the fields in `placeholderFields` aren't on
// social media yet and stay placeholders until the client sends them.
const aromaMivida: Location = {
  id: "aroma-mivida",
  brandId: "aroma",
  name: { en: "Aroma Lounge — Mivida", ar: "أروما لاونج — ميفيدا" },
  branch: { en: "Mivida", ar: "ميفيدا" },
  address: {
    en: "The Lake District, Mivida, New Cairo",
    ar: "ذا ليك ديستريكت، ميفيدا، القاهرة الجديدة",
  },
  locality: { en: "New Cairo", ar: "القاهرة الجديدة" },
  access: { en: "Enter Mivida from gates 6 or 7", ar: "الدخول من بوابة 6 أو 7 في ميفيدا" },
  mapsUrl: "https://maps.app.goo.gl/YCRNFLVjEVY2qiqQ9",
  lat: 30.0082518,
  lng: 31.5365496,
  // The RSVP number on Aroma's live-music post for Mivida.
  phone: "+201222293914",
  whatsapp: "201222293914",
  areas: ["indoor", "outdoor", "shisha"],
  // Google lists "closes 1:30 AM"; 9 AM opening chosen by the owner (breakfast is served), 2026-10-31.
  hours: everyDay("09:00", "01:30"),
  slotMinutes: 30,
  lastBookingBeforeCloseMinutes: 90,
  maxTableGuests: 20,
  maxEventGuests: 300,
  bookingWindowDays: 60,
  placeholder: false,
  // The same number takes WhatsApp (owner, 2026-10-31).
  placeholderFields: [],
};

const aromaMadinaty: Location = {
  id: "aroma-madinaty",
  brandId: "aroma",
  name: { en: "Aroma Lounge — Madinaty", ar: "أروما لاونج — مدينتي" },
  branch: { en: "Madinaty", ar: "مدينتي" },
  address: {
    en: "Unit B11, The Strip Mall, Madinaty",
    ar: "وحدة B11، ذا ستريب مول، مدينتي",
  },
  locality: { en: "Madinaty", ar: "مدينتي" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Aroma%20Lounge%20-%20Madinaty",
  lat: 30.0724617,
  lng: 31.6548246,
  // Aroma answers both branches on one number (owner, 2026-10-31).
  phone: "+201222293914",
  whatsapp: "201222293914",
  areas: ["indoor", "outdoor", "shisha"],
  hours: everyDay("09:00", "01:30"),
  slotMinutes: 30,
  lastBookingBeforeCloseMinutes: 90,
  maxTableGuests: 20,
  maxEventGuests: 300,
  bookingWindowDays: 60,
  placeholder: false,
  // Same hours as Mivida (owner's choice, 2026-10-31).
  placeholderFields: [],
};

/** Every branch of each restaurant, in the order the site lists them. */
export const branches: Record<RestaurantId, readonly [Location, ...Location[]]> = {
  covy: [covy],
  aroma: [aromaMivida, aromaMadinaty],
};

/** Each restaurant's first branch, for single-branch pages (COVY). */
export const locations: Record<RestaurantId, Location> = {
  covy: branches.covy[0],
  aroma: branches.aroma[0],
};

export function findBranch(brandId: RestaurantId, id: string | undefined): Location | undefined {
  return branches[brandId].find((l) => l.id === id);
}
