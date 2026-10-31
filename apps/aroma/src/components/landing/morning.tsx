import { videoSource } from "@mas/motion";
import { ScrollVideo } from "@mas/motion/scroll-video";
import { getTranslations } from "next-intl/server";
import { AromaLogo } from "@/components/logo";
import { ScenePetal } from "./scene-petal";

/**
 * A1, morning at the lake: an empty marble table on Mivida's terrace fills with breakfast plate by plate,
 * and the cappuccino lands last. The logo and Aroma's own line open the scene over the bare table and clear
 * as the first plates arrive; at the end the petal is dusted onto the cup's foam and stays through the hold,
 * where the lake scene (A2) picks up from the same frame.
 */
export async function Morning() {
  const t = await getTranslations("morning");
  const src = videoSource("aroma.morning");
  return (
    <div id="top">
      <h1 className="sr-only">{t("title")}</h1>
      {/* The poster's alt is empty: the heading above already names the page. */}
      <ScrollVideo
        id="aroma.morning"
        {...src}
        label=""
        scrollVh={300}
        holdVh={90}
        priority
        frameOverlay={
          <ScenePetal
            // Each petal settles over the last tenth of the move, a few frames after the one before it.
            petalOpacity={(i, n) =>
              `clamp(0, calc((var(--seq-progress, 0) - ${(0.86 + (i / n) * 0.08).toFixed(3)}) * 40), 1)`
            }
          />
        }
      >
        <div
          className="relative isolate flex h-full flex-col items-center justify-center px-6 text-center text-[var(--aroma-ink)] in-data-[animated=false]:hidden motion-reduce:hidden"
          style={{ opacity: "clamp(0, calc(1 - var(--seq-progress, 0) * 7), 1)" }}
        >
          {/* A soft marble pool keeps the logo clear of the placemats and the sun on the table. */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 h-[70vh] w-[min(110vw,56rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,#f7f5f0f2_0%,#f7f5f0b3_55%,transparent_100%)]"
          />
          <AromaLogo className="relative h-auto w-[min(70vw,24rem)] text-[var(--aroma-stone)]" />
          <p className="relative mt-8 max-w-md text-lg leading-snug font-medium text-balance sm:text-xl">
            {t("line")}
          </p>
          <p className="absolute inset-x-0 bottom-[calc(8svh+100lvh-100svh)] text-sm text-[var(--aroma-ink)]/80">
            {t("scroll")}
          </p>
        </div>
        {/* Without scroll motion the poster (the full table) shows once, with the logo and line on it. */}
        <div className="absolute inset-x-4 top-[14svh] mx-auto hidden max-w-md flex-col items-center rounded-[2rem] bg-[var(--aroma-marble)]/90 px-6 py-8 text-center text-[var(--aroma-ink)] in-data-[animated=false]:flex motion-reduce:flex">
          <AromaLogo className="h-auto w-[min(60vw,18rem)] text-[var(--aroma-stone)]" />
          <p className="mt-6 text-lg font-medium text-balance">{t("line")}</p>
        </div>
      </ScrollVideo>
    </div>
  );
}
