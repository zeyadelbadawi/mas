import { sequenceSource } from "@mas/motion";
import { SequencePlayer } from "@mas/motion/sequence-player";
import { getTranslations } from "next-intl/server";
import { CovyWordmark } from "@/components/logo";

/** C1: scroll walks from the facade, through the doors, to the blue tree; the logo settles in at the end. */
export async function Hero() {
  const t = await getTranslations("hero");
  const home = await getTranslations("home");
  const src = sequenceSource("covy.hero");
  return (
    <div id="top">
      <h1 className="sr-only">{t("title")}</h1>
      <SequencePlayer id="covy.hero" {...src} label={t("title")} scrollVh={300} priority>
        <div className="relative h-full">
          {/* Opening frames: a quiet line in the sky area and a cue, gone after the first steps. */}
          <div
            className="absolute inset-x-0 top-[16vh] flex flex-col items-center gap-3 text-center text-[var(--covy-navy)]"
            style={{ opacity: "clamp(0, calc(1 - var(--seq-progress, 0) * 8), 1)" }}
          >
            <p className="font-display text-sm tracking-[0.3em] uppercase">{t("kicker")}</p>
            <p className="text-sm">{t("scroll")}</p>
          </div>
          {/* Final frames: the logo and the line from the guide. */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-[#262d3f]/75 via-[#262d3f]/10 to-transparent pb-[12vh] text-center text-[var(--covy-sand)]"
            style={{ opacity: "clamp(0, calc((var(--seq-progress, 0) - 0.8) * 8), 1)" }}
          >
            <CovyWordmark className="h-auto w-[min(72vw,30rem)]" />
            <p className="font-display mt-6 text-sm tracking-[0.35em] uppercase sm:text-base">
              {home("tagline")}
            </p>
          </div>
        </div>
      </SequencePlayer>
    </div>
  );
}
