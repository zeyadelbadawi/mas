import { JsonLd, organizationJsonLd } from "@mas/seo";
import { LanguageSwitch } from "@mas/ui/language-switch";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MasWordmark } from "@/components/logo";
import { brand } from "@/site";

/**
 * Holding page on the new identity (D64) until the home page is built (docs/08-mas-replan.md §5): the wordmark
 * and the tagline with its rule, as on the identity guide.
 */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  return (
    <main
      id="main"
      className="mx-auto flex min-h-svh max-w-5xl flex-col items-start justify-center gap-8 px-6"
    >
      <JsonLd data={organizationJsonLd(brand, locale === "ar" ? "ar" : "en")} />
      <h1 className="w-full max-w-xl text-[var(--mas-gold)]">
        <MasWordmark registered title={t("title")} className="h-auto w-full" />
      </h1>
      <p className="flex items-center gap-4 text-lg font-light tracking-[0.12em] sm:text-2xl rtl:tracking-normal">
        {t("tagline")}
        <span aria-hidden="true" className="h-px w-16 bg-current" />
      </p>
      <LanguageSwitch />
    </main>
  );
}
