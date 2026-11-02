import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConsentBootScript, getConsentLabels } from "@mas/analytics";
import { ConsentProvider } from "@mas/analytics/consent";
import { directions, routing } from "@mas/i18n";
import { splashBootScript } from "@mas/motion";
import { MotionProvider } from "@mas/motion/provider";
import { pageMetadata } from "@mas/seo";
import { SkipLink } from "@mas/ui";
import { Footer } from "@/components/footer";
import { fontVariables } from "@/fonts";
import { defaultShareImage } from "@/lib/page-meta";
import { brand, privacyHref } from "@/site";
import "../globals.css";

const MEDIA_ORIGIN = process.env.NEXT_PUBLIC_MEDIA_URL
  ? new URL(process.env.NEXT_PUBLIC_MEDIA_URL).origin
  : undefined;

const SPLASH_BOOT = { __html: splashBootScript() };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#1c1b1c", colorScheme: "dark" };

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("home.title");
  const base = pageMetadata({
    brand,
    locale,
    path: "/",
    title,
    description: t("home.description"),
    image: await defaultShareImage(locale),
  });
  return {
    ...base,
    title: { default: title, template: `%s | ${brand.name[locale]}` },
    applicationName: brand.name[locale],
    creator: brand.name[locale],
    publisher: brand.name[locale],
    category: "business",
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} dir={directions[locale]} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* The scene posters and videos come from the media host: open both connections early (the
            posters load without CORS, the videos with it). */}
        {MEDIA_ORIGIN ? (
          <>
            <link rel="preconnect" href={MEDIA_ORIGIN} />
            <link rel="preconnect" href={MEDIA_ORIGIN} crossOrigin="anonymous" />
          </>
        ) : null}
        {/* Before the body: the home page is covered and locked from its first paint (splash gate, D62). */}
        {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static script, see splashBootScript */}
        <script dangerouslySetInnerHTML={SPLASH_BOOT} />
        <ConsentBootScript />
      </head>
      <body>
        <ConsentProvider
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          clarityId={process.env.NEXT_PUBLIC_CLARITY_ID}
          privacyHref={privacyHref(locale)}
          labels={await getConsentLabels(locale)}
        >
          <MotionProvider>
            <SkipLink label={t("skipToContent")} />
            {children}
            <Footer locale={locale} />
          </MotionProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
