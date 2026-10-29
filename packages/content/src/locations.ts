import type { Location, OpeningHours, RestaurantId } from "./types";

const everyDay = (opens: string, closes: string): OpeningHours[] =>
  ([0, 1, 2, 3, 4, 5, 6] as const).map((weekday) => ({ weekday, opens, closes }));

// Every value below is a placeholder (D6 / CLAUDE.md rule 5) until the client sends real data.
export const locations: Record<RestaurantId, Location> = {
  covy: {
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
  },
  aroma: {
    id: "aroma-city-stars",
    brandId: "aroma",
    name: { en: "Aroma Lounge — City Stars", ar: "أروما لاونج — سيتي ستارز" },
    address: { en: "City Stars, Nasr City, Cairo", ar: "سيتي ستارز، مدينة نصر، القاهرة" },
    lat: 30.0731,
    lng: 31.3456,
    phone: "+201000000001",
    whatsapp: "201000000001",
    areas: ["indoor", "outdoor", "shisha"],
    hours: everyDay("09:00", "02:00"),
    slotMinutes: 30,
    lastBookingBeforeCloseMinutes: 90,
    maxTableGuests: 20,
    maxEventGuests: 300,
    bookingWindowDays: 60,
    placeholder: true,
  },
};
