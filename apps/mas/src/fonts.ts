import { Noto_Kufi_Arabic, Poppins } from "next/font/google";

// MAS (D64): Poppins is the identity guide's own type family (free, OFL); Noto Kufi Arabic is its Arabic
// pair, a geometric Kufi that echoes the wordmark's cuts and differs from Aroma's and COVY's Arabic faces.
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
export const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-kufi",
  display: "swap",
  preload: false,
});

export const fontVariables = [poppins, kufi].map((f) => f.variable).join(" ");
