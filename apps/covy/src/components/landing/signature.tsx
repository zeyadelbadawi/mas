import { videoSource } from "@mas/motion";
import { ScrollVideo } from "@mas/motion/scroll-video";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { CovyWordmark } from "@/components/logo";
import { Star } from "@/components/sections/motifs";

/** Fades a label in once the pour passes `at` (0..1). */
const at = (stop: number): CSSProperties => ({
  opacity: `clamp(0, calc((var(--seq-progress, 0) - ${stop}) * 12), 1)`,
});

// All labels sit on the far side of the glass, clear of the intro copy.
const STOPS = [
  { key: "milk", stop: 0.12, top: "60%" },
  { key: "espresso", stop: 0.38, top: "45%" },
  { key: "foam", stop: 0.7, top: "26%" },
  { key: "cocoa", stop: 0.86, top: "18%" },
] as const;

/**
 * C3: the signature iced latte builds in the glass on the pastry case, the bar soft behind it; labels arrive
 * at their stops. It picks up from the connector's last frame (C2), so the copy fades in as it takes over.
 */
export async function Signature() {
  const t = await getTranslations("signature");
  const src = videoSource("covy.signature");
  return (
    <section aria-labelledby="signature-title">
      <ScrollVideo
        id="covy.signature"
        {...src}
        label={t("body")}
        scrollVh={280}
        leadVh={15}
        overlapPrevious
        frameOverlay={
          // COVY's mark printed on the glass in white enamel, layered over the footage (never baked into the
          // frames). A fine grain makes it read as a print rather than a flat overlay, and a soft navy edge keeps
          // it legible over the ice, the milk and the coffee alike; set low on the glass, clear of the labels.
          <div className="absolute top-[69%] left-1/2 w-[10%] -translate-x-1/2 [filter:drop-shadow(0_0_0.6px_#262d3fcc)_drop-shadow(0_0.6px_1.2px_#262d3f73)]">
            <svg aria-hidden="true" className="absolute size-0">
              <filter id="covy-glass-print" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves={2} seed={7} />
                <feColorMatrix
                  values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.8 1.25"
                  result="grain"
                />
                <feComposite in="SourceGraphic" in2="grain" operator="in" />
              </filter>
            </svg>
            <CovyWordmark
              className="h-auto w-full text-white"
              style={{ fillOpacity: 0.9, filter: "url(#covy-glass-print)" }}
            />
          </div>
        }
      >
        <div
          className="relative mx-auto h-full max-w-6xl px-4 text-[var(--covy-sand)] sm:px-8"
          style={{ opacity: "clamp(0, calc(var(--seq-progress, 0) * 20), 1)" }}
        >
          {/* On phones the copy sits over the glass, so it gets a soft navy backing. */}
          <div
            data-header-tone="dark"
            className="absolute inset-x-0 top-0 h-[55vh] bg-gradient-to-b from-[#262d3f]/90 from-40% to-transparent sm:hidden"
          />
          <div className="absolute inset-x-4 top-[12vh] isolate max-w-sm sm:inset-x-8">
            {/* The bar behind is pale concrete; on wider screens a soft navy pool sits behind the copy. */}
            <div
              aria-hidden="true"
              className="absolute -inset-x-16 -inset-y-12 -z-10 bg-[radial-gradient(closest-side,#262d3fe6_0%,#262d3fa6_55%,transparent_100%)] max-sm:hidden"
            />
            <h2 id="signature-title" className="font-editorial text-4xl sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 leading-relaxed opacity-85">{t("body")}</p>
            <a href="#menu-iced" className="mt-4 inline-block text-sm underline underline-offset-4">
              {t("link")}
            </a>
          </div>
          <ul aria-hidden="true">
            {STOPS.map((s) => (
              <li
                key={s.key}
                className="absolute start-[56%] flex flex-row-reverse items-center gap-3 rounded-full bg-[#262d3f]/75 px-3 py-1.5 max-sm:hidden"
                style={{ top: s.top, ...at(s.stop) }}
              >
                <span className="font-display text-sm tracking-[0.2em] whitespace-nowrap uppercase rtl:tracking-normal">
                  {t(s.key)}
                </span>
                <span className="h-px w-16 bg-current opacity-70" />
                <Star className="size-3 shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      </ScrollVideo>
    </section>
  );
}
