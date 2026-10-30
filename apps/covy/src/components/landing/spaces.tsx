import { imageSlot } from "@mas/content";
import type { Locale } from "@mas/i18n";
import { getTranslations } from "next-intl/server";
import { SpacesGallery, type GallerySpace } from "@/components/sections/spaces-gallery";

const SPACES = ["indoor", "terrace", "bar", "corner"] as const;
const PHOTOS = [1, 2, 3] as const;

/** C6: the rooms behind the arches, three photos each (D39). */
export async function Spaces({ locale }: { locale: Locale }) {
  const t = await getTranslations("spaces");
  const spaces: GallerySpace[] = SPACES.map((id) => ({
    id,
    name: t(id),
    line: t(`${id}Line`),
    photos: PHOTOS.flatMap((n) => {
      const slot = imageSlot(`covy.spaces.${id}.${n}`);
      return slot.src
        ? [{ src: slot.src, alt: slot.alt[locale], width: slot.width, height: slot.height }]
        : [];
    }),
  }));
  return (
    <section
      id="spaces"
      aria-labelledby="spaces-title"
      className="mx-auto max-w-7xl px-4 py-28 sm:px-8"
    >
      <div className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">
        <h2 id="spaces-title" className="font-editorial text-fg text-5xl sm:text-6xl">
          {t("title")}
        </h2>
        <p className="text-muted max-w-md text-lg leading-relaxed md:justify-self-end">
          {t("intro")}
        </p>
      </div>
      <SpacesGallery
        spaces={spaces}
        dir={locale === "ar" ? "rtl" : "ltr"}
        labels={{
          index: t("index"),
          viewer: t("viewer"),
          close: t("close"),
          next: t("next"),
          previous: t("previous"),
          // Placeholders are filled in the browser, per photo.
          open: t("open", { alt: "{alt}" }),
          count: t("count", { n: "{n}", total: "{total}" }),
        }}
      />
    </section>
  );
}
