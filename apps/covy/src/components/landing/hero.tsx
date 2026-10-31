import { videoSource } from "@mas/motion";
import { ScrollVideo } from "@mas/motion/scroll-video";
import { getTranslations } from "next-intl/server";
import { CovyWordmark } from "@/components/logo";

/**
 * C1: scroll walks from the facade, through the doors, to the blue tree; the logo settles in at the end.
 * Over a hold on the last frame the logo scrolls up and out of the frame, and the connector (C2) takes over
 * from the same, bare frame.
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const home = await getTranslations("home");
  const src = videoSource("covy.hero");
  return (
    <div id="top">
      <h1 className="sr-only">{t("title")}</h1>
      {/* The poster's alt is empty: the heading above already names the scene. */}
      <ScrollVideo id="covy.hero" {...src} label="" scrollVh={300} holdVh={90} priority>
        <div className="relative h-full">
          {/* Opening frames: a quiet line in the sky area and a cue, gone after the first steps. */}
          <div
            className="absolute inset-x-0 top-[16vh] flex flex-col items-center gap-3 text-center text-[var(--covy-navy)]"
            style={{ opacity: "clamp(0, calc(1 - var(--seq-progress, 0) * 8), 1)" }}
          >
            <p className="font-display text-sm tracking-[0.3em] uppercase rtl:tracking-normal">
              {t("kicker")}
            </p>
            <p className="text-sm">{t("scroll")}</p>
          </div>
          {/* Final frames: the logo and the line from the guide settle in over a soft shade at the foot of
              the frame. On the hold the camera stops and the logo keeps travelling: it scrolls up and out past
              the top, carrying its own soft shade, while the foot shade clears. By the time the connector
              takes over the frame is bare, so the cut lands on the same picture. */}
          <div
            className="absolute inset-0 text-center text-[var(--covy-sand)]"
            style={{ opacity: "clamp(0, calc((var(--seq-progress, 0) - 0.8) * 8), 1)" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#262d3f]/75 via-[#262d3f]/10 to-transparent"
              style={{ opacity: "clamp(0, calc(1 - var(--seq-hold, 0) * 2), 1)" }}
            />
            <div
              className="absolute inset-x-0 bottom-[calc(12svh+100lvh-100svh)] flex flex-col items-center"
              style={{ transform: "translateY(calc(var(--seq-hold, 0) * -100lvh))" }}
            >
              {/* The centre of the frame is the pale mural; this shade travels with the logo to keep it legible. */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 h-[200%] w-[min(120vw,60rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,#262d3fcc_0%,#262d3f8c_50%,transparent_100%)] in-data-[animated=false]:opacity-100! motion-reduce:opacity-100!"
                style={{
                  // Fades back out over the last fifth of the hold: on short screens the shade is still
                  // partly in view when the logo has gone, and the connector starts with no overlay.
                  opacity:
                    "min(clamp(0, calc(var(--seq-hold, 0) * 5), 1), clamp(0, calc((1 - var(--seq-hold, 0)) * 5), 1))",
                }}
              />
              <CovyWordmark className="relative h-auto w-[min(72vw,30rem)]" />
              <p className="font-display relative mt-6 text-sm tracking-[0.35em] uppercase [text-shadow:0_1px_10px_rgb(38_45_63/0.6)] sm:text-base rtl:tracking-normal">
                {home("tagline")}
              </p>
            </div>
          </div>
        </div>
      </ScrollVideo>
    </div>
  );
}
