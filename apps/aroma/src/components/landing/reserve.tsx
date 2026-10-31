"use client";

import type { Location } from "@mas/content";
import { FeedbackForm } from "@mas/forms/feedback-form";
import { ReservationForm } from "@mas/forms/reservation-form";
import { ChoiceCard } from "@mas/ui";
import {
  NextIntlClientProvider,
  useLocale,
  useTranslations,
  type AbstractIntlMessages,
} from "next-intl";
import { Tabs } from "radix-ui";
import { useState, useSyncExternalStore } from "react";

type ReserveProps = {
  /** Every branch, each with its own hours and booking rules. */
  branches: readonly Location[];
  privacyHref: string;
  turnstileSiteKey: string | undefined;
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

/**
 * A9: booking and feedback as tabs. Booking starts with the branch: each has its own hours, and the request
 * goes out with the branch's name (D52). A "Book at …" link elsewhere on the page picks it via ?branch=.
 */
export function Reserve({ branches, privacyHref, turnstileSiteKey }: ReserveProps) {
  const t = useTranslations("reserve");
  const f = useTranslations("forms");
  const locale = useLocale() as "en" | "ar";
  const [tab, setTab] = useState("book");
  const search = useSyncExternalStore(
    subscribeToUrl,
    () => window.location.search,
    () => "",
  );
  const fromUrl = new URLSearchParams(search).get("branch");
  const [picked, setPicked] = useState<string | null>(null);
  // A link clicked after a manual pick wins: the URL changes, so the latest of the two applies.
  const [seenUrl, setSeenUrl] = useState(fromUrl);
  if (fromUrl !== seenUrl) {
    setSeenUrl(fromUrl);
    setPicked(null);
  }
  const branchId = picked ?? fromUrl;
  const branch = branches.find((b) => b.id === branchId) ?? null;
  const name = (b: Location) => (b.branch ?? b.name)[locale];

  const tabClass =
    "text-fg/60 data-[state=active]:text-fg data-[state=active]:border-accent border-b-2 border-transparent pb-3 text-xl font-semibold transition-colors hover:text-fg sm:text-2xl";

  return (
    <Tabs.Root
      value={tab}
      onValueChange={setTab}
      // Radix defaults to ltr, which would lay the whole form out left to right in Arabic.
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="mx-auto max-w-3xl"
    >
      <Tabs.List
        aria-label={t("title")}
        className="border-line mb-10 flex flex-wrap gap-8 border-b"
      >
        <Tabs.Trigger value="book" data-book-tab className={tabClass}>
          {t("book")}
        </Tabs.Trigger>
        <Tabs.Trigger value="feedback" className={tabClass}>
          {t("feedback")}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        value="book"
        className="focus-visible:outline-focus rounded-card focus-visible:outline-2 focus-visible:outline-offset-8"
      >
        <fieldset className="mb-10">
          <legend className="text-fg mb-3 font-medium">{f("reservation.branchPick")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {branches.map((b) => (
              <ChoiceCard
                key={b.id}
                id={`branch-${b.id}`}
                name="branch"
                value={b.id}
                checked={b.id === branchId}
                onChange={() => setPicked(b.id)}
                title={name(b)}
                description={b.address[locale]}
              />
            ))}
          </div>
        </fieldset>
        {branch ? (
          <ReservationForm
            key={branch.id}
            location={branch}
            locationId={branch.id}
            branchName={name(branch)}
            privacyHref={privacyHref}
            turnstileSiteKey={turnstileSiteKey}
            turnstileTheme="light"
          />
        ) : (
          <p className="text-muted">{t("pickFirst")}</p>
        )}
      </Tabs.Content>
      <Tabs.Content
        value="feedback"
        className="focus-visible:outline-focus rounded-card focus-visible:outline-2 focus-visible:outline-offset-8"
      >
        <FeedbackForm
          privacyHref={privacyHref}
          turnstileSiteKey={turnstileSiteKey}
          turnstileTheme="light"
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
