import { localePath } from "@mas/seo";
import { getTranslations } from "next-intl/server";
import { Header, type HeaderProps } from "@/components/header";
import { brands } from "@mas/content";
import { BRAND_POSTERS } from "@/lib/brand-posters";

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
  const doors = await getTranslations({ locale, namespace: "doors" });
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
      brandsMenu={{
        label: t("brands"),
        all: t("brandsAll"),
        items: (["covy", "aroma"] as const).map((id) => ({
          id,
          name: brands[id].name[locale],
          href: pageHref(locale, "brands", `/${id}`),
          line: doors(`${id}.line`),
          image: { src: BRAND_POSTERS[id].webp, position: id === "covy" ? "50% 50%" : "66% 50%" },
        })),
      }}
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
