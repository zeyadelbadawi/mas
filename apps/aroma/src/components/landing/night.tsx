import { videoSource } from "@mas/motion";
import { ScrollVideo } from "@mas/motion/scroll-video";
import type { Locale } from "@mas/i18n";
import { buttonVariants } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { BookLink } from "./book-link";
import { liveMusic, weeklySlots } from "./weekly";

/**
 * A3, nights: dusk falls on the same view, the terrace lights come on and a guitarist starts on the deck.
 * Aroma's caption and this week's live music arrive with the lights. The performer is named only in
 * "What's on", never over the generated scene (D53).
 */
export async function Night({ locale }: { locale: Locale }) {
  const t = await getTranslations("night");
  const src = videoSource("aroma.night");
  const slots = liveMusic ? weeklySlots(liveMusic, locale) : [];
  return (
    <section aria-labelledby="night-title">
      <ScrollVideo
        id="aroma.night"
        {...src}
        label={t("label")}
        scrollVh={300}
        leadVh={15}
        overlapPrevious
        // Starts where the lake scene's pan ends, on the glass.
        panX={[100, 100]}
      >
        <div
          className="relative h-full text-[var(--aroma-marble)] [--color-focus:var(--aroma-marble)] focus-within:opacity-100! in-data-[animated=false]:opacity-100! motion-reduce:opacity-100!"
          style={{ opacity: "clamp(0, calc((var(--seq-progress, 0) - 0.55) * 6), 1)" }}
        >
          {/* The dusk sky is pale at the horizon; a night-green fall from the top keeps the copy legible. */}
          <div
            aria-hidden="true"
            data-header-tone="dark"
            className="absolute inset-x-0 top-0 h-[72vh] bg-gradient-to-b from-[#16261c]/90 from-35% to-transparent"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-[15vh] text-center sm:px-8">
            <h2
              id="night-title"
              className="text-3xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-5xl"
            >
              {t("title")}
            </h2>
            <p className="mt-4 text-base sm:text-lg">{t("body")}</p>
            <ul className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              {slots.map((s) => (
                <li
                  key={s.branchId}
                  className="rounded-full border border-[var(--aroma-marble)]/30 bg-[#16261c]/75 px-4 py-2 backdrop-blur-sm"
                >
                  {t("slot", { day: s.day, branch: s.branch })} ·{" "}
                  <bdi>{t("time", { from: s.from, to: s.to })}</bdi>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <BookLink className={buttonVariants()}>{t("book")}</BookLink>
              <a href="#nights" className="py-2 text-sm underline underline-offset-4">
                {t("more")}
              </a>
            </div>
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}
