import { CookieSettingsButton } from "@mas/analytics/consent";
import { localePath } from "@mas/seo";
import Link from "next/link";
import { LanguageSwitch } from "@mas/ui/language-switch";
import { getTranslations } from "next-intl/server";
import { CovyWordmark } from "@/components/logo";
import { brand } from "@/site";

const DESIGNER_URL = "https://ziad-elbadawi.vercel.app/";

/** Navy close to the page: the logo and tagline facing the links, then the legal line and the credit. */
export async function Footer({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const home = await getTranslations({ locale, namespace: "home" });
  const link =
    "py-2 underline-offset-4 transition-colors hover:text-[var(--covy-sand)] hover:underline";
  return (
    <footer className="bg-[var(--covy-navy)] text-[var(--covy-sand)]/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-5">
          <Link
            href={localePath(locale, "/")}
            aria-label={brand.name[locale]}
            className="text-[var(--covy-sand)]"
          >
            <CovyWordmark className="h-9 w-auto" />
          </Link>
          <span aria-hidden="true" className="h-6 w-px bg-[var(--covy-sand)]/25" />
          <p className="font-display text-xs tracking-[0.3em] uppercase rtl:text-sm rtl:tracking-normal">
            {home("tagline")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 text-sm">
          <Link href={localePath(locale, "/privacy")} className={link}>
            {t("privacy")}
          </Link>
          <Link href={localePath(locale, "/terms")} className={link}>
            {t("terms")}
          </Link>
          <CookieSettingsButton className={link} />
          <LanguageSwitch className="h-auto px-0 py-2 text-[var(--covy-sand)]/80 hover:text-[var(--covy-sand)]" />
        </div>
      </div>
      <div className="border-t border-[var(--covy-sand)]/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[var(--covy-sand)]/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
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
              className="inline-block py-1.5 text-[var(--covy-sand)] underline decoration-[var(--covy-sand)]/40 underline-offset-4 transition-colors hover:decoration-[var(--covy-sand)]"
            >
              {t("designer")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
