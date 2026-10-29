import { imageSlot, locations } from "@mas/content";
import { formatTime, pick, type Locale } from "@mas/i18n";
import { Button, ImageSlot, PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";

/** C10: where, when and how to reach us. All values are placeholders until the client confirms them. */
export async function Visit({ locale }: { locale: Locale }) {
  const t = await getTranslations("visit");
  const loc = locations.covy;
  const first = loc.hours[0];
  const sameEveryDay =
    first &&
    loc.hours.length === 7 &&
    loc.hours.every((h) => h.opens === first.opens && h.closes === first.closes);
  const phone = loc.phone.replace(/^\+20/, "0").replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
  const maps = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;

  return (
    <section
      id="visit"
      aria-labelledby="visit-title"
      className="mx-auto grid max-w-7xl gap-14 px-4 py-28 sm:px-8 md:grid-cols-[1fr_0.8fr] md:items-center"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-4">
          <h2 id="visit-title" className="font-editorial text-fg text-5xl sm:text-6xl">
            {t("title")}
          </h2>
          {loc.placeholder ? <PlaceholderBadge label={t("sample")} /> : null}
        </div>
        <address className="text-fg text-xl leading-relaxed not-italic">
          {pick(loc.address, locale)}
        </address>
        <div>
          <h3 className="text-muted text-sm">{t("hours")}</h3>
          {sameEveryDay && first ? (
            <p className="text-fg mt-2 text-lg">
              {t("everyDay")}: <bdi>{formatTime(first.opens, locale)}</bdi> –{" "}
              <bdi>{formatTime(first.closes, locale)}</bdi>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={`tel:${loc.phone}`}>
              {t("call")} <span dir="ltr">{phone}</span>
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href={`https://wa.me/${loc.whatsapp}`} target="_blank" rel="noopener">
              {t("whatsapp")}
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href={maps} target="_blank" rel="noopener">
              {t("directions")}
            </a>
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-t-[999px]">
        <ImageSlot
          {...imageSlot("covy.visit.facade")}
          locale={locale}
          sizes="(min-width: 768px) 40vw, 100vw"
        />
      </div>
    </section>
  );
}
