import type { Locale } from "./routing";

export type LocalizedText = { en: string; ar: string };

export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale];
}
