import { masServices } from "@mas/content";
import { isLocale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import type { Metadata } from "next";
import type { AbstractIntlMessages } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Inquiry } from "@/components/inquiry";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { crumbs, innerMetadata } from "@/lib/page-meta";
import { brand, privacyHref } from "@/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return innerMetadata(locale, "/contact", t("title"), t("lead"));
}

/**
 * "Discuss your project" (D13, D14): the inquiry form on soft grey, sent to mas@mas.com (rule 9), and the
 * inbox. A service page can pre-select its service with ?service=<slug>.
 */
export default async function ContactPage({
  params,
  searchParams,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const service = (await searchParams).service;
  const defaultService =
    typeof service === "string" && masServices.some((s) => s.slug === service)
      ? service
      : undefined;
  const all = await getMessages();
  const messages = { forms: all.forms } as AbstractIntlMessages;

  return (
    <>
      <SiteHeader locale={locale} current="contact" />
      <main id="main">
        <JsonLd data={crumbs(locale, [{ name: t("title"), path: "/contact" }])} />
        <PageHero
          title={t("title")}
          lead={t("lead")}
          after={
            <p className="mt-8 text-sm text-[var(--mas-soft)]/70">
              {t("emailLabel")}{" "}
              <a
                href={`mailto:${brand.inboxEmail}`}
                dir="ltr"
                className="text-[var(--mas-gold)] underline decoration-1 underline-offset-4"
              >
                {brand.inboxEmail}
              </a>
            </p>
          }
        />
        <section aria-label={t("title")} className="mas-light px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <Inquiry
              locale={locale}
              messages={messages}
              services={masServices}
              privacyHref={privacyHref(locale)}
              turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              defaultService={defaultService}
            />
          </div>
        </section>
      </main>
    </>
  );
}
