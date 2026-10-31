import { covyMenu, events, locations } from "@mas/content";
import { isLocale, pick } from "@mas/i18n";
import { JsonLd, menuJsonLd, restaurantJsonLd } from "@mas/seo";
import { notFound } from "next/navigation";
import type { AbstractIntlMessages } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Connector } from "@/components/landing/connector";
import { Events } from "@/components/landing/events";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Menu } from "@/components/landing/menu";
import { LazyReserve } from "@/components/landing/reserve-lazy";
import { Reviews } from "@/components/landing/reviews";
import { Signature } from "@/components/landing/signature";
import { BackToTop } from "@/components/back-to-top";
import { Splash } from "@/components/splash";
import { Spaces } from "@/components/landing/spaces";
import { Visit } from "@/components/landing/visit";
import { brand, privacyHref } from "@/site";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("reserve");
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");
  const splash = await getTranslations("splash");
  const all = await getMessages();
  // Only what the forms need crosses into the client.
  const formMessages = { forms: all.forms, reserve: all.reserve } as AbstractIntlMessages;
  const sections = [
    "story",
    "spaces",
    "menu",
    "events",
    "visit",
    "label",
    "book",
    "open",
    "close",
  ] as const;

  const bookable = events
    .filter((e) => e.brandId === "covy" && e.reservable)
    .map((e) => ({
      id: e.id,
      title: pick(e.title, locale),
      date: e.startsAt.slice(0, 10),
      time: e.startsAt.slice(11, 16),
    }));

  return (
    <>
      <Splash label={splash("loading")} skip={splash("skip")} slow={splash("slow")} />
      <BackToTop label={common("backToTop")} />
      <Header
        locale={locale}
        labels={{
          ...(Object.fromEntries(sections.map((k) => [k, nav(k)])) as Record<
            (typeof sections)[number],
            string
          >),
          switchTo: common("switchTo"),
          switchToLabel: common("switchToLabel"),
        }}
      />
      <main id="main">
        <JsonLd
          data={[
            restaurantJsonLd(brand, locations.covy, locale, {
              servesCuisine: [
                "Mediterranean",
                "Asian",
                "Latin American",
                "Middle Eastern",
                "Italian",
                "Coffee",
              ],
              menuPath: "/#menu",
            }),
            menuJsonLd(brand, covyMenu, locale),
          ]}
        />
        {/* The three scroll scenes: the header turns to glass over them (D47). */}
        <div data-walk>
          <Hero />
          <Connector />
          <Signature />
        </div>
        <Spaces locale={locale} />
        <Menu locale={locale} />
        <Events locale={locale} />
        <Reviews locale={locale} />
        <section
          id="reserve"
          aria-labelledby="reserve-title"
          className="bg-surface px-4 py-28 sm:px-8"
        >
          <h2
            id="reserve-title"
            className="font-editorial text-fg mx-auto mb-12 max-w-3xl text-5xl sm:text-6xl"
          >
            {t("title")}
          </h2>
          <LazyReserve
            location={locations.covy}
            privacyHref={privacyHref(locale)}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            events={bookable}
            locale={locale}
            messages={formMessages}
          />
        </section>
        <Visit locale={locale} />
      </main>
    </>
  );
}
