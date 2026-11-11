import { Poppins, Tajawal } from "next/font/google";

// Stash (D77): Poppins is the identity's one family (free, OFL), ExtraBold for headlines down to Regular for
// text. Tajawal is its Arabic pair: geometric like Poppins, with weights up to ExtraBold, and not used by the
// other sites in this repository.
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-poppins",
  display: "swap",
});
export const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
  preload: false,
});

export const fontVariables = [poppins, tajawal].map((f) => f.variable).join(" ");
