import { El_Messiri, Marcellus, Outfit, Readex_Pro, Tenor_Sans } from "next/font/google";

// PassionSans substitutes (D4): Tenor Sans for caps titles, Marcellus for editorial headings, Outfit for text.
export const tenor = Tenor_Sans({ subsets: ["latin"], weight: "400", variable: "--font-tenor", display: "swap" });
export const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", display: "swap" });
export const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
export const elMessiri = El_Messiri({ subsets: ["arabic"], variable: "--font-el-messiri", display: "swap", preload: false });
export const readex = Readex_Pro({ subsets: ["arabic"], variable: "--font-readex", display: "swap", preload: false });

export const fontVariables = [tenor, marcellus, outfit, elMessiri, readex].map((f) => f.variable).join(" ");
