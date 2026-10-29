import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { loadMessages } from "./messages";
import { routing, type Locale } from "./routing";

type Messages = Record<string, unknown>;

/** Per-app `src/i18n/request.ts` calls this with its own messages. */
export function createRequestConfig(appMessages: Record<Locale, Messages>) {
  return getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale: Locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
    return {
      locale,
      messages: loadMessages(locale, appMessages),
      timeZone: "Africa/Cairo",
    };
  });
}
