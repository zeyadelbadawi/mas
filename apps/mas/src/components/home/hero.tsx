import { ScrollVideo } from "@mas/motion/scroll-video";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { MasWordmark, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/components/logo";
import { SCENES } from "./scenes";

const P = "var(--seq-progress, 0)";
const HOLD = "var(--seq-hold, 0)";

/** Each letter of the outline mark draws over 40% of the move, a tenth after the one before it. */
const drawOffset = (i: number) => `calc(1 - clamp(0, calc((${P} - ${0.06 + i * 0.1}) * 2.5), 1))`;

/**
 * M1, "From the detail to the whole" (D68): the scene opens on one detail, a crystal glass on a set table,
 * and the camera pulls back and rises until the whole restaurant is in view, lit in gold and ready for
 * service. As the view widens, the outline wordmark draws its lines over the footage; when the whole room
 * is in view it fills with gold and the tagline follows. The headline and the one action come in during
 * the hold on the room. The mark and the copy are HTML over the frames, never in them (rule 4).
 */
export async function Hero({ contactHref }: { contactHref: string }) {
  const t = await getTranslations("hero");
  const home = await getTranslations("home");
  return (
    <div id="top">
      <ScrollVideo id="mas.hero" {...SCENES.hero} label="" scrollVh={300} holdVh={80} priority>
        {/* The mark, upper centre over the dark ceiling: drawn as the view widens, filled with the whole room. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[22svh] isolate flex flex-col items-center px-6 in-data-[animated=false]:top-[16svh]"
          style={{ opacity: `clamp(0, calc((0.5 - ${HOLD}) * 4), 1)` }}
        >
          {/* A dark pool behind the mark while the close-up's gold lights are blurred behind it. */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 h-[150%] w-[min(120vw,52rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mas-ink)_72%,transparent),transparent)]"
            style={{ opacity: `clamp(0, calc(1 - ${P} * 1.4), 1)` }}
          />
          <div className="relative w-[min(72vw,30rem)] text-[var(--mas-gold)]">
            <svg
              viewBox={WORDMARK_VIEWBOX}
              className="h-auto w-full overflow-visible"
              focusable="false"
            >
              {WORDMARK_PATHS.map((d, i) => (
                <path
                  key={d.slice(0, 16)}
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={1}
                  className="in-data-[animated=false]:[stroke-dashoffset:0] motion-reduce:[stroke-dashoffset:0]"
                  style={{ strokeDashoffset: drawOffset(i) }}
                />
              ))}
            </svg>
            <MasWordmark
              className="absolute inset-0 h-auto w-full in-data-[animated=false]:opacity-100! motion-reduce:opacity-100!"
              style={{ opacity: `clamp(0, calc((${P} - 0.6) * 6), 1)` }}
            />
          </div>
          <p
            className="mas-rule mt-6 text-xs font-light tracking-[0.14em] whitespace-nowrap text-[var(--mas-soft)] in-data-[animated=false]:opacity-100! motion-reduce:opacity-100! sm:text-base rtl:tracking-normal"
            style={{ opacity: `clamp(0, calc((${P} - 0.72) * 6), 1)` }}
          >
            {home("tagline")}
          </p>
        </div>

        <p
          aria-hidden="true"
          className="absolute inset-x-0 bottom-[calc(6svh+100lvh-100svh)] text-center text-xs font-light tracking-[0.2em] text-[var(--mas-soft)]/70 in-data-[animated=false]:hidden motion-reduce:hidden rtl:tracking-normal"
          style={{ opacity: `clamp(0, calc(1 - ${P} * 12), 1)` }}
        >
          {t("scroll")}
        </p>

        {/* The hold: the furnished room, the headline and the action at the start side, over a dark floor wash. */}
        <div
          className="absolute inset-0 in-data-[animated=false]:opacity-100! motion-reduce:opacity-100!"
          style={{ opacity: `clamp(0, calc(${HOLD} * 3), 1)` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-3/4 bg-[linear-gradient(to_top,var(--mas-ink)_0%,color-mix(in_srgb,var(--mas-ink)_70%,transparent)_45%,transparent_100%)]"
          />
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-[calc(10svh+100lvh-100svh)] sm:px-8">
            <h1 className="max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-[var(--mas-soft)] sm:text-6xl lg:text-7xl rtl:leading-[1.35] rtl:tracking-normal">
              {t("headline")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed font-light text-[var(--mas-soft)]/85 sm:text-lg">
              {t("lead")}
            </p>
            <Link
              href={contactHref}
              className="mas-cut mt-8 inline-flex h-12 items-center self-start bg-[var(--mas-gold)] px-6 font-medium text-[var(--mas-ink)] transition-[filter] duration-200 hover:brightness-110"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </ScrollVideo>
    </div>
  );
}
