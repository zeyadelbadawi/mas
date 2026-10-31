import { brands, imageSlot } from "@mas/content";
import { pick, type Locale } from "@mas/i18n";
import { ImageSlot } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { AromaPetal } from "@/components/logo";

/** A7: where Aroma started, where it is today, and the motto, set large. */
export async function Story({ locale }: { locale: Locale }) {
  const t = await getTranslations("story");
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="mx-auto grid max-w-7xl gap-12 px-4 py-28 sm:px-8 md:grid-cols-[0.8fr_1fr] md:items-center md:gap-20"
    >
      <div className="overflow-hidden rounded-t-[999px] rounded-b-[2rem]">
        <ImageSlot
          {...imageSlot("aroma.story")}
          locale={locale}
          sizes="(min-width: 768px) 38vw, 100vw"
        />
      </div>
      <div className="flex flex-col gap-8">
        <h2 id="story-title" className="text-fg text-5xl font-semibold tracking-tight sm:text-6xl">
          {t("title")}
        </h2>
        <p className="text-fg max-w-xl text-lg leading-relaxed">{t("body")}</p>
        <figure className="flex flex-col gap-4">
          <AromaPetal className="h-10 w-auto self-start" />
          <blockquote className="text-accent text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
            {pick(brands.aroma.tagline, locale)}
          </blockquote>
        </figure>
      </div>
    </section>
  );
}
