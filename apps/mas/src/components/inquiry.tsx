"use client";

import type { MasService } from "@mas/content";
import { InquiryForm } from "@mas/forms/inquiry-form";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";

/**
 * The "Discuss your project" form (D14, rule 9: email only, to mas@mas.com, with Turnstile and a honeypot).
 * The i18n client runtime is only on this page, inside the form (D29 budget): only the form's messages
 * cross to the client.
 */
export function Inquiry({
  locale,
  messages,
  ...props
}: {
  locale: "en" | "ar";
  messages: AbstractIntlMessages;
  services: MasService[];
  privacyHref: string;
  turnstileSiteKey?: string | undefined;
  defaultService?: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Africa/Cairo">
      <InquiryForm {...props} turnstileTheme="light" />
    </NextIntlClientProvider>
  );
}
