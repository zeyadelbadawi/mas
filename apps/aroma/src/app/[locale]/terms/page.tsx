import { termsOfUse } from "@mas/content";
import { isLocale, pick } from "@mas/i18n";
import { pageMetadata } from "@mas/seo";
import { LegalArticle } from "@mas/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { brand } from "@/site";

const doc = termsOfUse(brand);

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({
    brand,
    locale,
    path: "/terms",
    title: pick(doc.title, locale),
    description: pick(doc.intro, locale),
  });
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  return (
    <main id="main">
      <LegalArticle
        doc={doc}
        locale={locale}
        labels={{ updated: t("lastUpdated"), draft: t("legalDraft") }}
      />
    </main>
  );
}
