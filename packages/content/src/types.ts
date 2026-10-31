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
  /** Delivery ordering link, when the brand has one (Aroma: talabat). */
  orderUrl?: string;
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
  /** Short branch name for brands with more than one branch, e.g. "Mivida". */
  branch?: LocalizedText;
  /** How to get in, e.g. "Enter Mivida from gates 6 or 7". */
  access?: LocalizedText;
  /** The branch's Google Maps link. */
  mapsUrl?: string;
  /** Fields that are still placeholders on an otherwise real record (rule 5). */
  placeholderFields?: ("hours" | "phone" | "whatsapp")[];
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
  /** The client's own photo of the dish, under the app's public folder (Aroma's digital menu, D53). */
  photo?: string;
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
  /** Which of the client's menus the category belongs to (Aroma's tabs). */
  group?: "breakfast" | "food" | "drinks" | "dessert" | "kids";
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

/**
 * A recurring night at a restaurant (Aroma's live music, match nights, Aroma Nights, D52). Weekly nights
 * carry their day and time per branch; nights without fixed dates carry a `when` line instead.
 */
export type RecurringNight = {
  id: string;
  brandId: RestaurantId;
  title: LocalizedText;
  summary: LocalizedText;
  /** Weekly slots, Cairo time; weekday 0 = Sunday. */
  weekly?: {
    weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    starts: string;
    ends: string;
    locationId: string;
  }[];
  /** For nights without fixed dates, e.g. "On Egypt's match days". */
  when?: LocalizedText;
  /** Who plays, named only in "What's on" (never over the generated scenes, D53). */
  performer?: LocalizedText;
  imageSlotId: string;
  reservable: boolean;
  placeholder: boolean;
};
