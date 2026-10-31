import { CookieSettingsButton } from "@mas/analytics/consent";
import { localePath } from "@mas/seo";
import Link from "next/link";
import { LanguageSwitch } from "@mas/ui/language-switch";
import { getTranslations } from "next-intl/server";
import { AromaPetal, AromaWordmark } from "@/components/logo";
import { brand } from "@/site";

const DESIGNER_URL = "https://ziad-elbadawi.vercel.app/";

/** Night green close to the page: the logo and tagline facing the links, then the legal line and the credit. */
export async function Footer({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const home = await getTranslations({ locale, namespace: "home" });
  const link =
    "py-2 underline-offset-4 transition-colors hover:text-[var(--aroma-marble)] hover:underline";
  return (
    <footer className="bg-[var(--aroma-night)] text-[var(--aroma-marble)]/80 [--color-focus:var(--aroma-marble)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-5">
          <Link
            href={localePath(locale, "/")}
            aria-label={brand.name[locale]}
            className="flex items-center gap-2 text-[var(--aroma-marble)]"
          >
            <AromaPetal className="h-9 w-auto" />
            <AromaWordmark className="h-6 w-auto" />
          </Link>
          <span aria-hidden="true" className="h-6 w-px bg-[var(--aroma-marble)]/25" />
          <p className="text-sm">{home("tagline")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 text-sm">
          <Link href={localePath(locale, "/privacy")} className={link}>
            {t("privacy")}
          </Link>
          <Link href={localePath(locale, "/terms")} className={link}>
            {t("terms")}
          </Link>
          <CookieSettingsButton className={link} />
          <LanguageSwitch className="h-auto px-0 py-2 text-[var(--aroma-marble)]/80 hover:text-[var(--aroma-marble)]" />
        </div>
      </div>
      <div className="border-t border-[var(--aroma-marble)]/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[var(--aroma-marble)]/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {brand.name[locale]}. {t("rights")}
            {" · "}
            {t("managedBy")}
          </p>
          <p>
            {t("designedBy")}{" "}
            <a
              href={DESIGNER_URL}
              target="_blank"
              rel="noopener"
              className="inline-block py-1.5 text-[var(--aroma-marble)] underline decoration-[var(--aroma-marble)]/40 underline-offset-4 transition-colors hover:decoration-[var(--aroma-marble)]"
            >
              {t("designer")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
