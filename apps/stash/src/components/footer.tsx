import { CookieSettingsButton } from "@mas/analytics/consent";
import { stashRanges } from "@mas/content";
import { localePath } from "@mas/seo";
import { LanguageSwitch } from "@mas/ui/language-switch";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";
import { StashLogo } from "@/components/logo";
import { WordmarkPattern } from "@/components/pattern";
import { href, rangeHref } from "@/components/site-header";
import { brand } from "@/site";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="text-muted mt-4 flex flex-col gap-2.5 text-sm">{children}</ul>
    </div>
  );
}

/** The designer's portfolio (the same signature as on the other sites built here). */
const DESIGNER_URL = "https://ziad-elbadawi.vercel.app/";

const link = "hover:text-fg transition-colors duration-200";

/**
 * The footer (D77): beige on the Stash brown, the wordmark pattern behind it tone-on-tone, the full logo, the
 * eight ranges, ordering and company pages, and the inbox; the legal line and the designer's signature below.
 */
export async function Footer({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const f = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <footer className="st-dark relative overflow-hidden">
      <WordmarkPattern className="text-[var(--st-brown-deep)] opacity-60" size={44} />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pt-20 pb-14 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link
            href={href(locale, "home")}
            aria-label={nav("home")}
            className="inline-block text-[var(--st-beige)]"
          >
            <StashLogo className="h-14 w-auto" />
          </Link>
          <p className="mt-6 text-sm">{f("tagline")}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
          <Column title={f("packaging")}>
            {stashRanges.map((r) => (
              <li key={r.slug}>
                <Link className={link} href={rangeHref(locale, r.slug)}>
                  {r.name[locale]}
                </Link>
              </li>
            ))}
          </Column>
          <Column title={f("order")}>
            <li>
              <Link className={link} href={href(locale, "design")}>
                {nav("design")}
              </Link>
            </li>
            <li>
              <Link className={link} href={href(locale, "howItWorks")}>
                {nav("howItWorks")}
              </Link>
            </li>
            <li>
              <Link className={link} href={href(locale, "quote")}>
                {nav("quote")}
              </Link>
            </li>
            <li>
              <Link className={link} href={href(locale, "faq")}>
                {f("faq")}
              </Link>
            </li>
          </Column>
          <Column title={f("company")}>
            <li>
              <Link className={link} href={href(locale, "about")}>
                {nav("about")}
              </Link>
            </li>
            <li>
              <Link className={link} href={href(locale, "materials")}>
                {nav("materials")}
              </Link>
            </li>
            <li>
              <Link className={link} href={href(locale, "contact")}>
                {nav("contact")}
              </Link>
            </li>
          </Column>
          <Column title={f("contact")}>
            {/* The inbox shows once the client gives its real address on its own domain (rule 5, D80). */}
            {brand.placeholder ? (
              <li>
                <Link className={link} href={href(locale, "contact")}>
                  {nav("contact")}
                </Link>
              </li>
            ) : (
              <li>
                <a className={link} href={`mailto:${brand.inboxEmail}`} dir="ltr">
                  {brand.inboxEmail}
                </a>
              </li>
            )}
          </Column>
        </div>
      </div>
      <div className="border-line relative border-t">
        <div className="text-muted mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>
              © {new Date().getFullYear()} {brand.name[locale]}. {t("rights")}
            </p>
            <Link href={localePath(locale, "/privacy")} className={link}>
              {t("privacy")}
            </Link>
            <Link href={localePath(locale, "/terms")} className={link}>
              {t("terms")}
            </Link>
            <CookieSettingsButton className={link} />
            <LanguageSwitch className="h-auto px-0 text-xs" />
          </div>
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="h-0.5 w-6 rounded bg-[var(--st-orange)]" />
            <span>
              {t("designedBy")}{" "}
              <a
                href={DESIGNER_URL}
                target="_blank"
                rel="noopener"
                className="text-fg inline-block py-1.5 underline decoration-[var(--st-orange)] underline-offset-4"
              >
                {t("designer")}
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
