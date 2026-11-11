import { stashRanges } from "@mas/content";
import { localePath } from "@mas/seo";
import { getTranslations } from "next-intl/server";
import { Header, type NavKey } from "@/components/header";
import { StashWordmark } from "@/components/logo";

type Locale = "en" | "ar";

/** Every page's path (Arabic under /ar). */
export const PATHS = {
  home: "/",
  packaging: "/packaging",
  design: "/design",
  howItWorks: "/how-it-works",
  materials: "/materials",
  about: "/about",
  quote: "/quote",
  faq: "/faq",
  contact: "/contact",
} as const;
export type PageKey = keyof typeof PATHS;

export const href = (locale: Locale, page: PageKey) => localePath(locale, PATHS[page]);
export const rangeHref = (locale: Locale, slug: string) =>
  localePath(locale, `${PATHS.packaging}/${slug}`);

const NAV: NavKey[] = ["packaging", "design", "howItWorks", "materials", "about", "contact"];

/** The header with its labels and links resolved on the server. */
export async function SiteHeader({ locale, current }: { locale: Locale; current?: NavKey }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });
  return (
    <Header
      locale={locale}
      current={current}
      homeHref={href(locale, "home")}
      logo={<StashWordmark className="h-6 w-auto sm:h-7" />}
      links={NAV.map((key) => ({ key, href: href(locale, key), label: t(key) }))}
      quote={{ href: href(locale, "quote"), label: t("quote") }}
      allPackaging={{ href: href(locale, "packaging"), label: t("allPackaging") }}
      ranges={stashRanges.map((r) => ({
        order: r.order,
        name: r.name[locale],
        summary: r.summary[locale],
        href: rangeHref(locale, r.slug),
      }))}
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
