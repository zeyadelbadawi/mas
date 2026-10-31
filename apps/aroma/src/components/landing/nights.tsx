import { brands, imageSlot, type RecurringNight } from "@mas/content";
import { pick, type Locale } from "@mas/i18n";
import { ImageSlot } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { BookLink } from "./book-link";
import { aromaNights, weeklySlots } from "./weekly";

/**
 * A6, what's on: the weekly live music with its days per branch and the performer (named here and only here),
 * then match nights and Aroma Nights, which have no fixed dates. On night green, with the sunset horizon.
 */
export async function Nights({ locale }: { locale: Locale }) {
  const t = await getTranslations("nights");
  const [lead, ...rest] = aromaNights;
  const instagram = brands.aroma.socials.find((s) => s.network === "instagram")?.url;
  return (
    <section
      id="nights"
      aria-labelledby="nights-title"
      data-header-tone="dark"
      className="relative overflow-hidden bg-[var(--aroma-night)] px-4 py-28 text-[var(--aroma-marble)] sm:px-8"
    >
      {/* The horizon after sunset: the drink's colours low on the night sky. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[image:var(--aroma-sunset-gradient)] opacity-80"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,#f2a33a40,transparent)]"
      />
      <div className="relative mx-auto max-w-7xl">
        <h2 id="nights-title" className="text-5xl font-semibold tracking-tight sm:text-6xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-lg text-[var(--aroma-marble)]/80">{t("intro")}</p>

        {lead ? <Lead night={lead} locale={locale} /> : null}

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {rest.map((n) => (
            <article key={n.id} aria-labelledby={`${n.id}-title`} className="flex flex-col gap-5">
              <div className="overflow-hidden rounded-[1.5rem]">
                <ImageSlot
                  {...imageSlot(n.imageSlotId)}
                  locale={locale}
                  sizes="(min-width: 768px) 45vw, 100vw"
                />
              </div>
              <h3 id={`${n.id}-title`} className="text-3xl font-semibold tracking-tight">
                {pick(n.title, locale)}
              </h3>
              {n.when ? <p className="text-[var(--aroma-gold)]">{pick(n.when, locale)}</p> : null}
              <p className="max-w-lg text-[var(--aroma-marble)]/80">{pick(n.summary, locale)}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <BookLink className="py-2 font-medium underline underline-offset-4">
                  {t("book")}
                </BookLink>
                {n.id === "aroma-nights" && instagram ? (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener"
                    className="py-2 text-sm text-[var(--aroma-marble)]/80 underline underline-offset-4"
                  >
                    {t("instagram")}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

async function Lead({ night, locale }: { night: RecurringNight; locale: Locale }) {
  const t = await getTranslations("nights");
  const tn = await getTranslations("night");
  const slots = weeklySlots(night, locale);
  return (
    <article
      aria-labelledby={`${night.id}-title`}
      className="mt-14 grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center"
    >
      <div className="overflow-hidden rounded-[2rem]">
        <ImageSlot
          {...imageSlot(night.imageSlotId)}
          locale={locale}
          sizes="(min-width: 768px) 55vw, 100vw"
        />
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-[var(--aroma-gold)]">{t("weekly")}</p>
        <h3 id={`${night.id}-title`} className="text-4xl font-semibold tracking-tight">
          {pick(night.title, locale)}
        </h3>
        {night.performer ? <p className="text-lg">{pick(night.performer, locale)}</p> : null}
        <p className="text-[var(--aroma-marble)]/80">{pick(night.summary, locale)}</p>
        <ul className="mt-2 flex flex-col divide-y divide-[var(--aroma-marble)]/15 border-y border-[var(--aroma-marble)]/15">
          {slots.map((s) => (
            <li key={s.branchId} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <span>
                <span className="font-medium">{tn("slot", { day: s.day, branch: s.branch })}</span>
                <span className="text-[var(--aroma-marble)]/70">
                  {" · "}
                  <bdi>{tn("time", { from: s.from, to: s.to })}</bdi>
                </span>
              </span>
              <BookLink
                branch={s.branchId}
                className="py-2 text-sm font-medium text-[var(--aroma-gold)] underline underline-offset-4"
              >
                {t("bookAt", { day: s.day, branch: s.branch })}
              </BookLink>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
