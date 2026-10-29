import type { Locale } from "./routing";
import sharedAr from "../messages/ar.json";
import sharedEn from "../messages/en.json";

type Messages = Record<string, unknown>;

const shared: Record<Locale, Messages> = { en: sharedEn, ar: sharedAr };

function isObject(v: unknown): v is Messages {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function merge(base: Messages, extra: Messages): Messages {
  const out: Messages = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    const prev = out[k];
    out[k] = isObject(prev) && isObject(v) ? merge(prev, v) : v;
  }
  return out;
}

/** Shared messages (forms, consent, legal, common) merged with an app's own messages. */
export function loadMessages(locale: Locale, appMessages: Record<Locale, Messages>): Messages {
  return merge(shared[locale], appMessages[locale]);
}
