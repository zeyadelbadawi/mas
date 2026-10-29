import { Bebas_Neue, Cairo, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

// MAS: condensed caps display (echoes the wordmark) + Inter from the strategy deck; Arabic pair (D4).
export const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
  preload: false,
});
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = [bebas, inter, cairo, plexArabic].map((f) => f.variable).join(" ");
