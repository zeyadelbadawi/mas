import { isLocale, type Locale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import type { NavKey } from "@/components/header";
import { PageIntro, SoonNote } from "@/components/page-intro";
import { SiteHeader } from "@/components/site-header";
import { crumbs, seoMetadata, type SeoKey } from "@/lib/page-meta";

type Config = {
  /** Messages under pages.<key> and seo.<key>. */
  key: SeoKey;
  path: string;
  /** The header link to mark as current, when the page is in the header. */
  current?: NavKey;
  /** Shown under the intro: the content that ships in this phase, if any. */
  body?: (locale: Locale) => Promise<ReactNode>;
  /** True when part of the page is filled in a later phase (shows its labelled note). */
  soon?: boolean;
};

/**
 * An inner page in S1 (D77): its title, lead and banner slot, then what this phase can show. Every route
 * exists from the start, so no link 404s; what a later phase adds is labelled as such, never faked.
 */
export function simplePage({ key, path, current, body, soon = true }: Config) {
  async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    if (!isLocale(locale)) return {};
    return seoMetadata(locale, key, path);
  }

  async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: `pages.${key}` });
    const c = await getTranslations({ locale, namespace: "common" });
    return (
      <>
        <JsonLd data={crumbs(locale, [{ name: t("title"), path }])} />
        <SiteHeader locale={locale} current={current} />
        <main id="main">
          <PageIntro
            locale={locale}
            title={t("title")}
            lead={t("lead")}
            banner={`stash.banner.${path.slice(1)}`}
          />
          {body ? await body(locale) : null}
          {soon ? <SoonNote label={c("comingSoon")} text={t("soon")} /> : null}
        </main>
      </>
    );
  }

  return { generateMetadata, Page };
}
