import { sequenceSource } from "@mas/motion";
import { SequencePlayer } from "@mas/motion/sequence-player";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
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

/** C3: the signature iced latte builds in the glass; labels arrive at their stops. */
export async function Signature() {
  const t = await getTranslations("signature");
  const src = sequenceSource("covy.signature");
  return (
    <section aria-labelledby="signature-title">
      <SequencePlayer id="covy.signature" {...src} label={t("body")} scrollVh={280}>
        <div className="relative mx-auto h-full max-w-6xl px-4 text-[var(--covy-sand)] sm:px-8">
          {/* On phones the copy sits over the glass, so it gets a soft navy backing. */}
          <div className="absolute inset-x-0 top-0 h-[55vh] bg-gradient-to-b from-[#262d3f]/90 from-40% to-transparent sm:hidden" />
          <div className="absolute inset-x-4 top-[12vh] max-w-sm sm:inset-x-8">
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
                className="absolute start-[56%] flex flex-row-reverse items-center gap-3 max-sm:hidden"
                style={{ top: s.top, ...at(s.stop) }}
              >
                <span className="font-display text-sm tracking-[0.2em] whitespace-nowrap uppercase">
                  {t(s.key)}
                </span>
                <span className="h-px w-16 bg-current opacity-70" />
                <Star className="size-3 shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      </SequencePlayer>
    </section>
  );
}
