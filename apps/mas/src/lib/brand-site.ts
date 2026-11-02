import { brands } from "@mas/content";
import { localePath } from "@mas/seo";

/** A brand's landing page in a language: where its site is live today (D70), else its own domain. */
export function brandSite(id: "covy" | "aroma", locale: "en" | "ar", hash = ""): string {
  const origin = (brands[id].liveUrl ?? brands[id].domain).replace(/\/+$/, "");
  return `${origin}${localePath(locale, "/")}`.replace(/\/$/, "") + hash;
}
