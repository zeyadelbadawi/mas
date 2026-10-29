import { getTranslations } from "next-intl/server";
import { Drift } from "@/components/sections/drift";
import { CaladiumLeaf, Star } from "@/components/sections/motifs";

/** C2: the brand guide's own belief, with leaves drifting at three depths. */
export async function Story() {
  const t = await getTranslations("story");
  return (
    <section id="story" aria-labelledby="story-title" className="relative overflow-hidden">
      <Drift className="relative mx-auto max-w-7xl px-4 py-32 sm:px-8 sm:py-48">
        <CaladiumLeaf
          data-depth="1.4"
          className="absolute -start-12 top-12 w-36 opacity-35 sm:w-56 sm:opacity-90"
        />
        <CaladiumLeaf
          data-depth="0.7"
          tone="cocoa"
          className="absolute end-2 bottom-10 w-28 rotate-[160deg] opacity-35 sm:w-40 sm:opacity-80"
        />
        <CaladiumLeaf
          data-depth="1"
          className="absolute end-[22%] top-8 hidden w-24 rotate-45 opacity-60 md:block"
        />
        <Star
          data-twinkle
          className="text-accent absolute start-[30%] top-16 size-4 max-sm:hidden"
        />
        <Star
          data-twinkle
          className="absolute end-[12%] top-[40%] size-6 text-[var(--covy-slate)]"
        />
        <Star
          data-twinkle
          className="text-accent absolute start-[16%] bottom-24 size-3 max-sm:hidden"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2
            id="story-title"
            className="font-editorial text-fg text-3xl leading-[1.2] sm:text-5xl"
          >
            {t("quote")}
          </h2>
          <p className="text-muted mx-auto mt-8 max-w-xl text-lg leading-relaxed">{t("body")}</p>
        </div>
      </Drift>
    </section>
  );
}
