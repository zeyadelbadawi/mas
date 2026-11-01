import { isLocale } from "@mas/i18n";
import { videoPrefetchScript } from "@mas/motion";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@mas/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Doors } from "@/components/home/doors";
import { Hero } from "@/components/home/hero";
import { SCENES } from "@/components/home/scenes";
import { Cta, How, Insights, Services, Statement, WhatsOn } from "@/components/home/sections";
import { pageHref, SiteHeader } from "@/components/site-header";
import { Splash } from "@/components/splash";
import { brand } from "@/site";

/** Both scenes start downloading as the page is parsed (D55): the splash waits on them (D62). */
const PREFETCH = {
  __html: videoPrefetchScript(Object.values(SCENES).map((s) => s.manifestUrl)),
};

/** The MAS home page (D64, docs/08-mas-replan.md §5): M0 splash to M8 call to action. */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const splash = await getTranslations("splash");
  const home = await getTranslations("home");

  return (
    <>
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static script, see PREFETCH */}
      <script dangerouslySetInnerHTML={PREFETCH} />
      <Splash
        label={splash("loading")}
        tagline={home("tagline")}
        skip={splash("skip")}
        slow={splash("slow")}
      />
      <SiteHeader locale={locale} mode="overlay" current="home" />
      <main id="main">
        <JsonLd data={[organizationJsonLd(brand, locale), websiteJsonLd(brand, locale)]} />
        <Hero contactHref={pageHref(locale, "contact")} />
        <Statement locale={locale} />
        <Services locale={locale} />
        <How />
        <Doors locale={locale} />
        <WhatsOn locale={locale} />
        <Insights locale={locale} />
        <Cta locale={locale} />
      </main>
    </>
  );
}
