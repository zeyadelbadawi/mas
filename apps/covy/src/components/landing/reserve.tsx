"use client";

import type { Location } from "@mas/content";
import { FeedbackForm } from "@mas/forms/feedback-form";
import { ReservationForm } from "@mas/forms/reservation-form";
import { NextIntlClientProvider, useTranslations, type AbstractIntlMessages } from "next-intl";
import { Tabs } from "radix-ui";
import { useState, useSyncExternalStore } from "react";

type EventChoice = { id: string; title: string; date: string; time: string };

type ReserveProps = {
  location: Location;
  privacyHref: string;
  turnstileSiteKey: string | undefined;
  /** Reservable events, so "Book this event" links (?event=id#reserve) can prefill the form. */
  events: EventChoice[];
};

type ReserveWithIntlProps = ReserveProps & { locale: "en" | "ar"; messages: AbstractIntlMessages };

/**
 * The forms are the only client components that format messages, so the i18n client runtime lives
 * here, inside the lazily loaded chunk, instead of wrapping every page (D29 budget).
 */
export function ReserveWithIntl({ locale, messages, ...props }: ReserveWithIntlProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Africa/Cairo">
      <Reserve {...props} />
    </NextIntlClientProvider>
  );
}

function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/** C9: booking and feedback side by side as tabs. */
export function Reserve({ location, privacyHref, turnstileSiteKey, events }: ReserveProps) {
  const t = useTranslations("reserve");
  const [tab, setTab] = useState("book");
  // "Book this event" links reload the page with ?event=<id>, so the URL is the only source.
  const search = useSyncExternalStore(
    subscribeToUrl,
    () => window.location.search,
    () => "",
  );
  const id = new URLSearchParams(search).get("event");
  const event = events.find((e) => e.id === id) ?? null;

  const tabClass =
    "font-editorial text-fg/60 data-[state=active]:text-fg data-[state=active]:border-fg border-b-2 border-transparent pb-3 text-2xl transition-colors hover:text-fg sm:text-3xl";

  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="mx-auto max-w-3xl">
      <Tabs.List
        aria-label={t("title")}
        className="border-line mb-10 flex flex-wrap gap-8 border-b"
      >
        <Tabs.Trigger value="book" className={tabClass}>
          {t("book")}
        </Tabs.Trigger>
        <Tabs.Trigger value="feedback" className={tabClass}>
          {t("feedback")}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="book" className="focus-visible:outline-none">
        {event ? (
          <p className="bg-surface text-fg rounded-card mb-6 px-4 py-3 text-sm">{event.title}</p>
        ) : null}
        <ReservationForm
          key={event?.id ?? "none"}
          location={location}
          privacyHref={privacyHref}
          turnstileSiteKey={turnstileSiteKey}
          turnstileTheme="light"
          {...(event
            ? { eventId: event.id, defaults: { date: event.date, time: event.time } }
            : {})}
        />
      </Tabs.Content>
      <Tabs.Content value="feedback" className="focus-visible:outline-none">
        <FeedbackForm
          privacyHref={privacyHref}
          turnstileSiteKey={turnstileSiteKey}
          turnstileTheme="light"
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
