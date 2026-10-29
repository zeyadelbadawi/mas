import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConsentBootScript, getConsentLabels } from "@mas/analytics";
import { ConsentProvider } from "@mas/analytics/consent";
import { directions, routing } from "@mas/i18n";
import { MotionProvider } from "@mas/motion/provider";
import { pageMetadata } from "@mas/seo";
import { SkipLink } from "@mas/ui";
import { Footer } from "@/components/footer";
import { fontVariables } from "@/fonts";
import { brand, privacyHref } from "@/site";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "home" });
  const title = `${t("title")} · ${t("tagline")}`;
  const base = pageMetadata({ brand, locale, path: "/", title, description: t("description") });
  return { ...base, title: { default: title, template: `%s · ${brand.name[locale]}` } };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} dir={directions[locale]} className={fontVariables} suppressHydrationWarning>
      <head>
        <ConsentBootScript />
      </head>
      <body>
        <ConsentProvider
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          clarityId={process.env.NEXT_PUBLIC_CLARITY_ID}
          privacyHref={privacyHref(locale)}
          labels={await getConsentLabels(locale)}
        >
          <MotionProvider ease="sine.inOut">
            <SkipLink label={t("skipToContent")} />
            {children}
            <Footer locale={locale} />
          </MotionProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
