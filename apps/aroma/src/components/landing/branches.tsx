import { branches, imageSlot, type Location } from "@mas/content";
import { formatTime, pick, type Locale } from "@mas/i18n";
import { buttonVariants, ImageSlot, PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";
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

/** The WhatsApp glyph (Simple Icons, CC0). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
