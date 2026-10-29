import { CookieSettingsButton } from "@mas/analytics/consent";
import { localePath } from "@mas/seo";
import Link from "next/link";
import { SiteFooter } from "@mas/ui";
import { LanguageSwitch } from "@mas/ui/language-switch";
import { getTranslations } from "next-intl/server";
import { brand } from "@/site";

export async function Footer({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const link = "underline-offset-2 hover:text-fg hover:underline";
  return (
    <SiteFooter
      brandLine={<p className="font-display text-fg text-2xl">{brand.name[locale]}</p>}
      links={
        <>
          <Link href={localePath(locale, "/privacy")} className={link}>
            {t("privacy")}
          </Link>
          <Link href={localePath(locale, "/terms")} className={link}>
            {t("terms")}
          </Link>
          <CookieSettingsButton className={link} />
          <LanguageSwitch className="h-auto px-0" />
        </>
      }
      legal={
        <p>
          © {new Date().getFullYear()} {brand.name[locale]}. {t("rights")}
          {" · "}
          {t("managedBy")}
        </p>
      }
    />
  );
}
