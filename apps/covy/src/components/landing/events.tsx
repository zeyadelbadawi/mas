import { events, imageSlot } from "@mas/content";
import { formatDate, formatTime, pick, type Locale } from "@mas/i18n";
import { ImageSlot, PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";

const cairoTime = (iso: string) => iso.slice(11, 16);

/** C7: COVY's events from the shared data, soonest first. Reservable ones prefill the booking form. */
export async function Events({ locale }: { locale: Locale }) {
  const t = await getTranslations("events");
  const list = events
    .filter((e) => e.brandId === "covy")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return (
    <section id="events" aria-labelledby="events-title" className="bg-surface py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="events-title" className="font-editorial text-fg text-5xl sm:text-6xl">
              {t("title")}
            </h2>
            <p className="text-muted mt-4 max-w-md text-lg">{t("intro")}</p>
          </div>
          {list.some((e) => e.placeholder) ? <PlaceholderBadge label={t("sample")} /> : null}
        </div>
        <ul className="grid gap-8 md:grid-cols-3">
          {list.map((e) => {
            const start = new Date(e.startsAt);
            const end = new Date(e.endsAt);
            const sameDay = e.startsAt.slice(0, 10) === e.endsAt.slice(0, 10);
            return (
              <li key={e.id} className="flex flex-col gap-5">
                <div className="overflow-hidden rounded-t-[999px]">
                  <ImageSlot
                    {...imageSlot(e.imageSlotId)}
                    locale={locale}
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <p className="text-muted text-sm">
                  <time dateTime={e.startsAt}>
                    {formatDate(start, locale, { weekday: "long", month: "long", year: undefined })}
                  </time>
                  {sameDay ? (
                    <>
                      {" · "}
                      {formatTime(cairoTime(e.startsAt), locale)}–
                      {formatTime(cairoTime(e.endsAt), locale)}
                    </>
                  ) : (
                    <>
                      {" – "}
                      <time dateTime={e.endsAt}>
                        {formatDate(end, locale, {
                          weekday: undefined,
                          month: "long",
                          year: undefined,
                        })}
                      </time>
                    </>
                  )}
                </p>
                <h3 className="font-editorial text-fg text-3xl">{pick(e.title, locale)}</h3>
                <p className="text-muted leading-relaxed">{pick(e.summary, locale)}</p>
                {e.reservable ? (
                  <a
                    href={`?event=${e.id}#reserve`}
                    className="text-fg mt-auto self-start py-2 text-sm font-medium underline underline-offset-4"
                  >
                    {t("book")}
                  </a>
                ) : (
                  <p className="text-muted mt-auto text-sm">{t("walkIn")}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
