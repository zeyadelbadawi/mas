import ar from "@mas/i18n/messages/ar.json";
import en from "@mas/i18n/messages/en.json";

export const messages = { en, ar } as const;
export type EmailLocale = keyof typeof messages;

/** Fills ICU-style {name} placeholders (plural forms are not used in emails). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}
