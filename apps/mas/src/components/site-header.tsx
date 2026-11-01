import { localePath } from "@mas/seo";
import { getTranslations } from "next-intl/server";
import { Header, type HeaderProps } from "@/components/header";

/** The six pages in the header, in the order of the D13 site map. */
export const PAGES = ["about", "services", "brands", "events", "insights", "contact"] as const;
export type Page = (typeof PAGES)[number];

/** A page's path (the pages live at /about, /services, ...; Arabic under /ar). */
export const pageHref = (locale: "en" | "ar", page: Page | "home", rest = "") =>
  localePath(locale, page === "home" ? "/" : `/${page}${rest}`);

/** The header with its labels and links resolved on the server. */
export async function SiteHeader({
  locale,
  current,
  mode,
}: {
  locale: "en" | "ar";
  current?: Page;
  mode?: HeaderProps["mode"];
}) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });
  return (
    <Header
      locale={locale}
      mode={mode}
      current={current}
      homeHref={pageHref(locale, "home")}
      links={PAGES.filter((p) => p !== "contact").map((p) => ({
        key: p,
        href: pageHref(locale, p),
        label: t(p),
      }))}
      cta={{ href: pageHref(locale, "contact"), label: t("cta") }}
      labels={{
        nav: t("label"),
        home: t("home"),
        open: t("open"),
        close: t("close"),
        switchTo: common("switchTo"),
        switchToLabel: common("switchToLabel"),
      }}
    />
  );
}
