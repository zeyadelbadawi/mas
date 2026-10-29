import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { directions, routing } from "@mas/i18n";
import { SkipLink } from "@mas/ui";
import { fontVariables } from "@/fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: `${t("title")} — ${t("tagline")}` };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} dir={directions[locale]} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
          <SkipLink label={t("skipToContent")} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
