import { videoSource } from "@mas/motion";
import { ScrollVideo } from "@mas/motion/scroll-video";
import { getTranslations } from "next-intl/server";
import { ScenePetal } from "./scene-petal";

/**
 * A2, long afternoons: from the morning table's last frame the camera lifts and turns to the lake while the
 * light warms to golden hour, and a hand raises the sunset iced tea. The cocoa petal from A1 is still on the
 * cup on the first frame and clears as the camera lifts. Aroma's caption arrives with the drink.
 */
export async function Lake() {
  const t = await getTranslations("lake");
  const src = videoSource("aroma.lake");
  return (
    <section aria-labelledby="lake-title">
      <ScrollVideo
        id="aroma.lake"
        {...src}
        label={t("label")}
        scrollVh={400}
        leadVh={15}
        holdVh={15}
        overlapPrevious
        // Phones see a narrow slice of the frame: follow the raised glass, right of centre.
        panX={[50, 100]}
        frameOverlay={
          <ScenePetal
            id="aroma-lake-dust"
            petalOpacity={() => "clamp(0, calc(1 - var(--seq-progress, 0) * 14), 1)"}
          />
        }
      >
        {/* In with the raised glass, out before the dusk scene takes over the same frame. */}
        <div
          className="relative mx-auto h-full max-w-7xl px-4 text-[var(--aroma-ink)] in-data-[animated=false]:opacity-100! motion-reduce:opacity-100! sm:px-8"
          style={{
            opacity:
              "min(clamp(0, calc((var(--seq-progress, 0) - 0.62) * 8), 1), clamp(0, calc((0.6 - var(--seq-hold, 0)) * 4), 1))",
          }}
        >
          {/* Desktop: the pale sky at the top start. Phones: the white table at the foot, clear of the glass. */}
          <div className="absolute inset-x-4 bottom-[calc(7svh+100lvh-100svh)] isolate max-w-md sm:inset-x-8 sm:top-[18vh] sm:bottom-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-x-10 -inset-y-8 -z-10 bg-[radial-gradient(closest-side,#f7f5f0f2_0%,#f7f5f0cc_55%,transparent_100%)]"
            />
            <h2
              id="lake-title"
              className="relative text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-5xl"
            >
              {t("quote")}
            </h2>
            <p className="relative mt-5 flex items-center gap-3 text-base font-medium text-[var(--aroma-leaf)]">
              <span aria-hidden="true" className="aroma-hairline h-0.5 w-10" />
              {t("place")}
            </p>
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}
