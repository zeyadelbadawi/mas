import { imageSlot } from "@mas/content";
import type { Locale } from "@mas/i18n";
import { ImageSlot } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { Cuisines } from "@/components/sections/cuisines";

const KITCHENS = ["mediterranean", "asian", "latin", "middle-eastern", "italian"] as const;

/** C4: the leaf ring turns through five kitchens; each stop swaps a dish still and one line. */
export async function Taste({ locale }: { locale: Locale }) {
  const t = await getTranslations("taste");
  return (
    <section aria-labelledby="taste-title">
      <div className="mx-auto max-w-3xl px-4 pt-28 text-center sm:px-8">
        <h2 id="taste-title" className="font-editorial text-fg text-5xl sm:text-6xl">
          {t("title")}
        </h2>
        <p className="text-muted mt-6 text-lg leading-relaxed">{t("intro")}</p>
      </div>
      <Cuisines
        stops={KITCHENS.map((id) => ({
          id,
          name: t(`names.${id}`),
          line: t(id),
          image: <ImageSlot {...imageSlot(`covy.cuisines.${id}`)} locale={locale} sizes="22rem" />,
        }))}
      />
    </section>
  );
}
