import { testimonials } from "@mas/content";
import { pick, type Locale } from "@mas/i18n";
import { PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { Star } from "@/components/sections/motifs";

/** C8: guest quotes. Until real Google reviews arrive these are labelled samples, never shown as real. */
export async function Reviews({ locale }: { locale: Locale }) {
  const t = await getTranslations("reviews");
  const list = testimonials.filter((r) => r.brandId === "covy");
  return (
    <section aria-labelledby="reviews-title" className="mx-auto max-w-7xl px-4 py-28 sm:px-8">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="font-editorial text-fg text-5xl sm:text-6xl">
          {t("title")}
        </h2>
        {list.some((r) => r.placeholder) ? <PlaceholderBadge label={t("sample")} /> : null}
      </div>
      <ul className="grid gap-10 md:grid-cols-3">
        {list.map((r) => (
          <li key={r.id}>
            <figure className="flex h-full flex-col gap-5">
              <p
                className="text-accent flex gap-1"
                role="img"
                aria-label={t("stars", { count: r.rating })}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`size-4 ${i < r.rating ? "" : "opacity-25"}`} />
                ))}
              </p>
              <blockquote className="font-editorial text-fg text-2xl leading-snug">
                {pick(r.quote, locale)}
              </blockquote>
              <figcaption className="text-muted mt-auto text-sm">
                {pick(r.author, locale)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
