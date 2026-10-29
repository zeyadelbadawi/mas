import { imageSlot } from "@mas/content";
import type { Locale } from "@mas/i18n";
import { ImageSlot } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { ArchGallery } from "@/components/sections/arch-gallery";

const SPACES = ["indoor", "terrace", "shisha", "corner"] as const;

/** C6: every photo in the facade's arch, opening from a slit as it arrives. */
export async function Spaces({ locale }: { locale: Locale }) {
  const t = await getTranslations("spaces");
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
      <ArchGallery
        items={SPACES.map((id) => ({
          id,
          label: t(id),
          image: (
            <ImageSlot
              {...imageSlot(`covy.spaces.${id}`)}
              locale={locale}
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          ),
        }))}
      />
    </section>
  );
}
