"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@mas/i18n/navigation";
import { cn } from "../cn";

/** Keeps the visitor on the same page in the other language. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common");
  const target = locale === "ar" ? "en" : "ar";
  return (
    <Link
      href={pathname}
      locale={target}
      hrefLang={target}
      lang={target}
      aria-label={t("switchToLabel")}
      className={cn(
        "inline-flex h-10 items-center rounded-control px-3 text-sm font-medium text-fg underline-offset-4 hover:underline",
        className,
      )}
    >
      {t("switchTo")}
    </Link>
  );
}
