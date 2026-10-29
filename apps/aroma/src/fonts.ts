import { Alexandria, Hanken_Grotesk } from "next/font/google";

// Telegraf substitute (D4): Hanken Grotesk; Alexandria for Arabic (wide geometric, matches Telegraf's proportions).
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
export const alexandria = Alexandria({
  subsets: ["arabic"],
  variable: "--font-alexandria",
  display: "swap",
  preload: false,
});

export const fontVariables = [hanken, alexandria].map((f) => f.variable).join(" ");
