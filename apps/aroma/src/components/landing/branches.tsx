import { branches, imageSlot, type Location } from "@mas/content";
import { formatTime, pick, type Locale } from "@mas/i18n";
import { buttonVariants, ImageSlot, PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/brand-icons";
import { BookLink } from "./book-link";

const LINES = { "aroma-mivida": "mivida", "aroma-madinaty": "madinaty" } as const;
const SLOTS = { "aroma-mivida": "aroma.branch.mivida", "aroma-madinaty": "aroma.branch.madinaty" };

const displayPhone = (e164: string) =>
  e164.replace(/^\+20/, "0").replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");

/**
 * A4: the two branches side by side, each with its own photo, access line, hours, directions, call and a
 * Book button that picks the branch in the form. Fields still to confirm carry a sample label (rule 5).
 */
export async function Branches({ locale }: { locale: Locale }) {
  const t = await getTranslations("branches");
  return (
    <section id="branches" aria-labelledby="branches-title" className="px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2
          id="branches-title"
          className="text-fg text-5xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          {t("title")}
        </h2>
        <p className="text-muted mt-4 max-w-xl text-lg">{t("intro")}</p>
        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-10">
          {branches.aroma.map((loc) => (
            <Branch key={loc.id} loc={loc} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

async function Branch({ loc, locale }: { loc: Location; locale: Locale }) {
  const t = await getTranslations("branches");
  const id = loc.id as keyof typeof LINES;
  const name = loc.branch ? pick(loc.branch, locale) : pick(loc.name, locale);
  const sample = new Set(loc.placeholderFields ?? []);
  const first = loc.hours[0];
  return (
    <article
      id={LINES[id]}
      aria-labelledby={`${loc.id}-title`}
      // Cards in a row stretch to the same height; the buttons sit at the foot of each, so they line up
      // whatever the length of the copy above them.
      className="flex h-full scroll-mt-24 flex-col gap-6"
    >
      <div className="relative overflow-hidden rounded-[2rem]">
        <ImageSlot
          {...imageSlot(SLOTS[id])}
          locale={locale}
          sizes="(min-width: 768px) 45vw, 100vw"
          className="aspect-[4/5] object-cover"
        />
        {/* WhatsApp rides on the photo's corner, so the buttons below stay on one row. */}
        {sample.has("whatsapp") ? null : (
          <a
            href={`https://wa.me/${loc.whatsapp}`}
            target="_blank"
            rel="noopener"
            aria-label={`${t("whatsapp")}: ${name}`}
            title={t("whatsapp")}
            className="absolute end-4 top-4 inline-flex size-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_6px_18px_rgb(0_0_0/0.25)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <WhatsAppIcon className="size-6" />
          </a>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h3 id={`${loc.id}-title`} className="text-fg text-4xl font-semibold tracking-tight">
          {name}
        </h3>
        <p className="text-fg text-lg">{t(LINES[id])}</p>
        <address className="text-muted flex flex-col gap-1 not-italic">
          <span>{pick(loc.address, locale)}</span>
          {loc.access ? <span>{pick(loc.access, locale)}</span> : null}
        </address>
        <p className="text-fg">
          {!sample.has("hours") && first ? (
            <>
              {t("everyDay")}: <bdi>{formatTime(first.opens, locale)}</bdi> –{" "}
              <bdi>{formatTime(first.closes, locale)}</bdi>
            </>
          ) : loc.closesAt ? (
            t("hoursUntil", { time: formatTime(loc.closesAt, locale) })
          ) : (
            t("hoursSoon")
          )}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-3">
        <BookLink branch={loc.id} className={buttonVariants()}>
          {t("book", { branch: name })}
        </BookLink>
        {loc.mapsUrl ? (
          <a
            href={loc.mapsUrl}
            target="_blank"
            rel="noopener"
            className={buttonVariants({ variant: "secondary" })}
          >
            {t("directions")}
          </a>
        ) : null}
        {sample.has("phone") ? (
          <PlaceholderBadge label={t("phoneSample")} />
        ) : (
          <a href={`tel:${loc.phone}`} className={buttonVariants({ variant: "secondary" })}>
            {t("call")} <span dir="ltr">{displayPhone(loc.phone)}</span>
          </a>
        )}
      </div>
    </article>
  );
}
