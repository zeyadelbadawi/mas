import { aromaMenu, branches, imageSlot } from "@mas/content";
import { isLocale } from "@mas/i18n";
import { videoPrefetchScript } from "@mas/motion";
import { JsonLd, menuJsonLd, organizationJsonLd, restaurantJsonLd, websiteJsonLd } from "@mas/seo";
import { notFound } from "next/navigation";
import type { AbstractIntlMessages } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { BackToTop } from "@/components/back-to-top";
import { Branches } from "@/components/landing/branches";
import { FindUs } from "@/components/landing/find-us";
import { Guests } from "@/components/landing/guests";
import { Header } from "@/components/landing/header";
import { Lake } from "@/components/landing/lake";
import { Menu } from "@/components/landing/menu";
import { Morning } from "@/components/landing/morning";
import { Night } from "@/components/landing/night";
import { Nights } from "@/components/landing/nights";
import { LazyReserve } from "@/components/landing/reserve-lazy";
import { SCENES } from "@/components/landing/scenes";
import { Story } from "@/components/landing/story";
import { Splash } from "@/components/splash";
import { brand, privacyHref } from "@/site";

/** The three scenes start downloading as the page is parsed (D55): the splash waits on all of them. */
const PREFETCH = {
  __html: videoPrefetchScript(Object.values(SCENES).map((s) => s.manifestUrl)),
};

const CUISINE = ["Egyptian", "International", "Italian"];
/** The menu's price span (EGP 45 for water to EGP 635 for the rib-eye). */
const PRICE_RANGE = (() => {
  const prices = aromaMenu.flatMap((c) => c.items.map((i) => i.priceEGP));
  return `EGP ${Math.min(...prices)}–${Math.max(...prices)}`;
})();

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
  const keys = ["menu", "branches", "nights", "story", "label", "book", "open", "close"] as const;

  return (
    <>
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static script, see PREFETCH */}
      <script dangerouslySetInnerHTML={PREFETCH} />
      <Splash label={splash("loading")} skip={splash("skip")} slow={splash("slow")} />
      <BackToTop label={common("backToTop")} />
      <Header
        locale={locale}
        labels={{
          ...(Object.fromEntries(keys.map((k) => [k, nav(k)])) as Record<
            (typeof keys)[number],
            string
          >),
          switchTo: common("switchTo"),
          switchToLabel: common("switchToLabel"),
        }}
      />
      <main id="main">
        <JsonLd
          data={[
            organizationJsonLd(brand, locale, { logoPath: "/apple-icon.png" }),
            websiteJsonLd(brand, locale),
            ...branches.aroma.map((loc) =>
              restaurantJsonLd(brand, loc, locale, {
                servesCuisine: CUISINE,
                menuPath: "/#menu",
                anchor: loc.id.replace(/^aroma-/, ""),
                types: ["CafeOrCoffeeShop"],
                priceRange: PRICE_RANGE,
                imagePath: imageSlot(`aroma.branch.${loc.id.replace(/^aroma-/, "")}`).src,
                parentOrganization: true,
              }),
            ),
            menuJsonLd(brand, aromaMenu, locale),
          ]}
        />
        {/* The day at Aroma in three scenes: the header turns to a soft wash over them (D47, D51). */}
        <div data-walk>
          <Morning />
          <Lake />
          <Night locale={locale} />
        </div>
        <Branches locale={locale} />
        <Menu locale={locale} />
        <Nights locale={locale} />
        <Story locale={locale} />
        <Guests locale={locale} />
        <section id="reserve" aria-labelledby="reserve-title" className="px-4 py-28 sm:px-8">
          <div className="mx-auto mb-12 max-w-3xl">
            <h2
              id="reserve-title"
              // Takes focus after a "Book" link while the forms are still loading.
              tabIndex={-1}
              className="text-fg text-5xl font-semibold tracking-tight outline-none sm:text-6xl"
            >
              {t("title")}
            </h2>
            <p className="text-muted mt-4 text-lg">{t("intro")}</p>
          </div>
          <LazyReserve
            branches={branches.aroma}
            privacyHref={privacyHref(locale)}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            locale={locale}
            messages={formMessages}
          />
        </section>
        <FindUs locale={locale} />
      </main>
    </>
  );
}
