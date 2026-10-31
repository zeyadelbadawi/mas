import { brands, imageSlot } from "@mas/content";
import type { Locale } from "@mas/i18n";
import { ImageSlot } from "@mas/ui";
import { getTranslations } from "next-intl/server";

const PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** A8: real moments from Aroma's own posts. Photos, not reviews (rule 5). */
export async function Guests({ locale }: { locale: Locale }) {
  const t = await getTranslations("guests");
  const instagram = brands.aroma.socials.find((s) => s.network === "instagram")?.url;
  return (
    <section
      aria-labelledby="guests-title"
      className="bg-surface overflow-hidden px-4 py-28 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2
              id="guests-title"
              className="text-fg text-5xl font-semibold tracking-tight sm:text-6xl"
            >
              {t("title")}
            </h2>
            <p className="text-muted mt-4 max-w-xl text-lg">{t("intro")}</p>
          </div>
          {instagram ? (
            <a
              href={instagram}
              target="_blank"
              rel="noopener"
              className="text-accent py-2 font-medium underline underline-offset-4"
            >
              {t("follow")}
            </a>
          ) : null}
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {/* Every other photo sits lower, so the wall reads as snapshots rather than a grid of cards. */}
          {PHOTOS.map((n) => (
            <li
              key={n}
              className={`overflow-hidden rounded-[1.25rem] ${n % 2 ? "" : "mt-8 md:mt-16"}`}
            >
              <ImageSlot
                {...imageSlot(`aroma.guests.${n}`)}
                locale={locale}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
