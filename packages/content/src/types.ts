import type { LocalizedText } from "@mas/i18n";

export type BrandId = "mas" | "covy" | "aroma";
export type RestaurantId = Exclude<BrandId, "mas">;

export type Social = { network: "instagram" | "facebook" | "tiktok" | "linkedin"; url: string };

export type Brand = {
  id: BrandId;
  name: LocalizedText;
  tagline: LocalizedText;
  /** Production origin, e.g. https://covy.mas.com (placeholder domain until confirmed). */
  domain: string;
  inboxEmail: string;
  socials: Social[];
  placeholder: boolean;
};

export type Area = "indoor" | "outdoor" | "shisha";

/** `closes` may be earlier than `opens` when the venue closes after midnight. */
export type OpeningHours = { weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; opens: string; closes: string };

export type Location = {
  id: string;
  brandId: BrandId;
  name: LocalizedText;
  address: LocalizedText;
  lat: number;
  lng: number;
  /** E.164 */
  phone: string;
  /** E.164 without "+", for wa.me links */
  whatsapp: string;
  areas: Area[];
  hours: OpeningHours[];
  slotMinutes: number;
  /** Last bookable slot is this many minutes before closing. */
  lastBookingBeforeCloseMinutes: number;
  maxTableGuests: number;
  maxEventGuests: number;
  bookingWindowDays: number;
  placeholder: boolean;
};

export type MasService = {
  slug: string;
  order: number;
  title: LocalizedText;
  summary: LocalizedText;
};

export type MenuTag = "veg" | "spicy" | "nuts" | "new" | "signature";

export type MenuItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  priceEGP: number;
  tags: MenuTag[];
  /** Thumbnail slot (signature items only); registered in the asset manifest. */
  imageSlotId?: string;
  placeholder: boolean;
};

export type MenuCategory = {
  id: string;
  brandId: RestaurantId;
  name: LocalizedText;
  intro: LocalizedText;
  /** COVY's world tour: which kitchen the category comes from. */
  cuisine?: "mediterranean" | "asian" | "latin" | "middle-eastern" | "italian";
  kind: "food" | "drinks" | "shisha";
  items: MenuItem[];
};

export type BrandEvent = {
  id: string;
  brandId: RestaurantId;
  locationId: string;
  title: LocalizedText;
  summary: LocalizedText;
  /** ISO date-time in Cairo time, e.g. "2026-11-20T20:00:00+02:00". */
  startsAt: string;
  endsAt: string;
  imageSlotId: string;
  reservable: boolean;
  placeholder: boolean;
};

export type Testimonial = {
  id: string;
  brandId: RestaurantId;
  quote: LocalizedText;
  author: LocalizedText;
  rating: 1 | 2 | 3 | 4 | 5;
  source: "google" | "placeholder";
  placeholder: boolean;
};
