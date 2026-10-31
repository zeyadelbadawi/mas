import { videoSource } from "@mas/motion";
import { ScrollVideo } from "@mas/motion/scroll-video";
import { getTranslations } from "next-intl/server";

/**
 * C2: from the hero's last frame the camera turns left along the mural, as the real room runs, to the
 * barista bar and the glass of ice waiting on the pastry case: the first frame of C3. The brand guide's
 * belief rides over the turn.
 */
export async function Connector() {
  const t = await getTranslations("story");
  const src = videoSource("covy.connector");
  return (
    <section id="story" aria-labelledby="story-title">
      <ScrollVideo
        id="covy.connector"
        {...src}
        label={t("walk")}
        scrollVh={560}
        leadVh={15}
        holdVh={15}
        overlapPrevious
      >
        {/* Fades in once the turn starts and out before the bar; always shown without scroll motion. */}
        <div className="relative flex h-full items-center justify-center px-4 text-center text-[var(--covy-sand)] sm:px-8">
          {/* The room behind the copy is busy and bright in places; a soft navy pool keeps it legible. It is
              fully there before the copy fades in and stays until the copy has gone. */}
          <div
            className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,#262d3fd9_0%,#262d3f80_55%,transparent_100%)] in-data-[animated=false]:opacity-100! motion-reduce:opacity-100!"
            style={{
              opacity:
                "min(clamp(0, calc(var(--seq-progress, 0) * 12.5), 1), clamp(0, calc((0.46 - var(--seq-progress, 0)) * 12.5), 1))",
            }}
          />
          <div
            className="relative max-w-3xl in-data-[animated=false]:opacity-100! motion-reduce:opacity-100!"
            style={{
              opacity:
                "min(clamp(0, calc((var(--seq-progress, 0) - 0.04) * 10), 1), clamp(0, calc((0.42 - var(--seq-progress, 0)) * 10), 1))",
            }}
          >
            <h2 id="story-title" className="font-editorial text-3xl leading-[1.2] sm:text-5xl">
              {t("quote")}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed opacity-90">{t("body")}</p>
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}
