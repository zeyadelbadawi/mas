import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@mas/ui/language-switcher";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  return (
    <main id="main" className="mx-auto flex min-h-svh max-w-3xl flex-col items-start justify-center gap-6 px-6">
      <h1 className="font-display text-6xl tracking-[0.2em]">{t("title")}</h1>
      <p className="font-editorial text-2xl text-muted">{t("tagline")}</p>
      <LanguageSwitcher />
    </main>
  );
}
