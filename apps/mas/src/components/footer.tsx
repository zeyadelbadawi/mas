import { CookieSettingsButton } from "@mas/analytics/consent";
import { brands } from "@mas/content";
import { localePath } from "@mas/seo";
import { LanguageSwitch } from "@mas/ui/language-switch";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";
import { MasWordmark } from "@/components/logo";
import { pageHref } from "@/components/site-header";
import { brand } from "@/site";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--mas-soft)]">{title}</h2>
      <ul className="text-muted mt-4 flex flex-col gap-2.5 text-sm font-light">{children}</ul>
    </div>
  );
}

/** The designer's portfolio (the same signature as on COVY and Aroma). */
const DESIGNER_URL = "https://ziad-elbadawi.vercel.app/";

const link = "hover:text-[var(--mas-soft)] transition-colors duration-200";

/**
 * The footer (D64): the gold wordmark with the tagline and its rule, the site map, the two brands MAS runs
 * and the inbox, on the deepest gray (the call to action above it fades into it); the legal line and the
 * designer's signature below.
 */
export async function Footer({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const f = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const home = await getTranslations({ locale, namespace: "home" });
  const site = (id: "covy" | "aroma") =>
    `${brands[id].domain}${localePath(locale, "/")}`.replace(/\/$/, "");

  return (
    <footer className="bg-[var(--mas-deep)] text-[var(--mas-soft)]">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-20 pb-14 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link
            href={pageHref(locale, "home")}
            aria-label={nav("home")}
            className="inline-block text-[var(--mas-gold)]"
          >
            <MasWordmark className="h-8 w-auto" />
          </Link>
          <p className="mas-rule mt-5 text-sm font-light tracking-[0.12em] rtl:tracking-normal">
            {home("tagline")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
          <Column title={f("company")}>
            <li>
              <Link className={link} href={pageHref(locale, "about")}>
                {nav("about")}
              </Link>
            </li>
            <li>
              <Link className={link} href={pageHref(locale, "services")}>
                {nav("services")}
              </Link>
            </li>
            <li>
              <Link className={link} href={pageHref(locale, "contact")}>
                {nav("contact")}
              </Link>
            </li>
          </Column>
          <Column title={f("explore")}>
            <li>
              <Link className={link} href={pageHref(locale, "brands")}>
                {nav("brands")}
              </Link>
            </li>
            <li>
              <Link className={link} href={pageHref(locale, "events")}>
                {nav("events")}
              </Link>
            </li>
            <li>
              <Link className={link} href={pageHref(locale, "insights")}>
                {nav("insights")}
              </Link>
            </li>
          </Column>
          <Column title={f("brands")}>
            <li>
              <a className={link} href={site("covy")}>
                {brands.covy.name[locale]}
              </a>
            </li>
            <li>
              <a className={link} href={site("aroma")}>
                {brands.aroma.name[locale]}
              </a>
            </li>
          </Column>
          <Column title={f("contact")}>
            <li>
              <a className={link} href={`mailto:${brand.inboxEmail}`} dir="ltr">
                {brand.inboxEmail}
              </a>
            </li>
          </Column>
        </div>
      </div>
      <div className="border-t border-[var(--mas-silver)]/10">
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
          {/* The signature, as on COVY and Aroma. */}
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-[var(--mas-gold)]" />
            <span>
              {t("designedBy")}{" "}
              <a
                href={DESIGNER_URL}
                target="_blank"
                rel="noopener"
                className="inline-block py-1.5 text-[var(--mas-soft)] underline decoration-[var(--mas-gold)]/60 underline-offset-4 transition-colors hover:decoration-[var(--mas-gold)]"
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
