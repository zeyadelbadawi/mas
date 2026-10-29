import { CookieSettingsButton } from "@mas/analytics/consent";
import { Link } from "@mas/i18n/navigation";
import { SiteFooter } from "@mas/ui";
import { LanguageSwitcher } from "@mas/ui/language-switcher";
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
          <Link href="/privacy" className={link}>
            {t("privacy")}
          </Link>
          <Link href="/terms" className={link}>
            {t("terms")}
          </Link>
          <CookieSettingsButton className={link} />
          <LanguageSwitcher className="h-auto px-0" />
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
