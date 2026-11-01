import { brands } from "@mas/content";
import { ScrollVideo } from "@mas/motion/scroll-video";
import { localePath } from "@mas/seo";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { AromaPetal, AromaWordmark, CovyWordmark } from "@/components/brand-marks";
import { SCENES } from "./scenes";

const P = "var(--seq-progress, 0)";
const HOLD = "var(--seq-hold, 0)";

/**
 * Where the doors stand on the last frame, in % of the 16:9 frame (measured on mas.doors.r2): the
 * openings; the brand copy sits on the floor just below them.
 */
const DOORS = {
  covy: { left: 25.5, width: 19.3 },
  aroma: { left: 55.2, width: 19.4 },
  top: 13.4,
  bottom: 72.8,
} as const;

type Door = { id: "covy" | "aroma"; href: string; mark: ReactNode; line: string; visit: string };

/**
 * M5, "One line, two doors" (D64): the camera walks along the gold line, past the fins and into a dark
 * antechamber where the line splits to two gold-framed doors, COVY's dining room on the left and Aroma's
 * lake on the right. In the hold each door becomes a link to its site, with the brand's mark, one line and
 * "Visit". Wide screens: each link covers its door and the floor below it, and hovering lights the door.
 * Narrow screens see only the doors' inner edges, so the two links sit side by side at the foot of the
 * screen, COVY on the left and Aroma on the right as in the picture, in both languages.
 */
export async function Doors({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("doors");
  const site = (id: "covy" | "aroma") =>
    `${brands[id].domain}${localePath(locale, "/")}`.replace(/\/$/, "");
  const doors: Door[] = [
    {
      id: "covy",
      href: site("covy"),
      mark: <CovyWordmark className="h-6 w-auto sm:h-7" />,
      line: t("covy.line"),
      visit: t("covy.visit"),
    },
    {
      id: "aroma",
      href: site("aroma"),
      mark: (
        <span className="flex items-center gap-2">
          <AromaPetal className="h-7 w-auto sm:h-8" />
          <AromaWordmark className="h-4 w-auto sm:h-5" />
        </span>
      ),
      line: t("aroma.line"),
      visit: t("aroma.visit"),
    },
  ];
  const src = SCENES.doors;

  return (
    <section id="brands" aria-labelledby="doors-title">
      <ScrollVideo id="mas.doors" {...src} label={t("label")} scrollVh={320} holdVh={90}>
        {/* The title over the dark corridor as the walk begins. */}
        <div
          className="absolute inset-x-0 top-[16svh] px-4 text-center in-data-[animated=false]:top-[8svh] sm:px-8"
          style={{ opacity: `clamp(0, calc((0.22 - ${P}) * 7), 1)` }}
        >
          <h2
            id="doors-title"
            className="text-3xl font-semibold tracking-tight text-[var(--mas-soft)] sm:text-5xl rtl:tracking-normal"
          >
            {t("title")}
          </h2>
          <p className="mt-3 font-light text-[var(--mas-soft)]/80">{t("intro")}</p>
        </div>

        <div
          className="absolute inset-0 in-data-[animated=false]:opacity-100! motion-reduce:opacity-100!"
          style={{ opacity: `clamp(0, calc(${HOLD} * 4), 1)` }}
        >
          {/* Wide (from 9:10, where the 16:9 cut is used and both doors are in view, PORTRAIT_BELOW): the frame's own box (cover, centred), so each link lands on its door. */}
          <div
            dir="ltr"
            className={`absolute top-1/2 left-1/2 hidden aspect-video -translate-x-1/2 -translate-y-1/2 [@media(min-aspect-ratio:9/10)]:block`}
            style={{ width: "max(100cqw, 100cqh * 16 / 9)" }}
          >
            {doors.map((d) => (
              <a
                key={d.id}
                href={d.href}
                dir={locale === "ar" ? "rtl" : "ltr"}
                className="mas-door absolute isolate text-[var(--mas-soft)]"
                style={{
                  left: `${DOORS[d.id].left}%`,
                  width: `${DOORS[d.id].width}%`,
                  top: `${DOORS.top}%`,
                  height: `${DOORS.bottom - DOORS.top}%`,
                }}
              >
                {/* On the floor just below the door, so it stays in view on screens wider than 16:9. */}
                <span className="absolute inset-x-[-20%] top-full flex flex-col items-center gap-3 pt-6 text-center">
                  {/* A dark pool on the floor keeps the copy clear of the gold lines and the reflections. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-10%] -top-2 -bottom-8 -z-10 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mas-ink)_88%,transparent)_45%,transparent)]"
                  />
                  {d.mark}
                  <span className="max-w-[18rem] text-sm leading-snug font-light text-balance text-[var(--mas-soft)]">
                    {d.line}
                  </span>
                  <span className="mas-rule text-sm font-medium text-[var(--mas-gold)]">
                    {d.visit}
                  </span>
                </span>
              </a>
            ))}
          </div>

          {/* Narrow: two links at the foot of the screen, on the side of their door. */}
          <div
            dir="ltr"
            className={`absolute inset-x-0 bottom-0 grid grid-cols-2 gap-px bg-[linear-gradient(to_top,var(--mas-ink)_55%,transparent)] px-3 pt-24 pb-[calc(5svh+100lvh-100svh)] [@media(min-aspect-ratio:9/10)]:hidden`}
          >
            {doors.map((d) => (
              <a
                key={d.id}
                href={d.href}
                dir={locale === "ar" ? "rtl" : "ltr"}
                className="flex flex-col items-center gap-2 px-2 text-center text-[var(--mas-soft)]"
              >
                {d.mark}
                <span className="text-xs leading-snug font-light text-[var(--mas-soft)]/85">
                  {d.line}
                </span>
                <span className="mas-rule mt-1 text-sm font-medium text-[var(--mas-gold)]">
                  {d.visit}
                </span>
              </a>
            ))}
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}
