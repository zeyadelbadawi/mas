import { localePath } from "@mas/seo";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CovyWordmark } from "@/components/logo";
import { brand } from "@/site";

/** Top of the privacy and terms pages: the way back to the landing page, where the full header lives. */
export async function LegalHeader({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const home = localePath(locale, "/");
  return (
    <header className="border-line/60 border-b">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href={home} aria-label={brand.name[locale]} className="text-fg">
          <CovyWordmark className="h-8 w-auto" />
        </Link>
        <Link href={home} className="text-fg py-2 text-sm underline underline-offset-4">
          {t("backHome")}
        </Link>
      </div>
    </header>
  );
}
