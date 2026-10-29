import { getLocale, getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./client/language-switcher";

/** Server wrapper: reads the labels on the server and renders the client switcher. */
export async function LanguageSwitch({ className }: { className?: string }) {
  const t = await getTranslations("common");
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  return (
    <LanguageSwitcher
      {...(className ? { className } : {})}
      locale={locale}
      label={t("switchTo")}
      ariaLabel={t("switchToLabel")}
    />
  );
}
