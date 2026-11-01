import { insights, masServices } from "@mas/content";
import { PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { EventCard, InsightCard, RuleLink, SectionHeading } from "@/components/cards";
import { pageHref } from "@/components/site-header";
import { whatsOnPreview } from "@/lib/whats-on";

type Locale = "en" | "ar";
const two = (n: number) => String(n).padStart(2, "0");

/**
 * M2, the statement: the guide's four words, very large, each line wiped in along the wordmark's diagonal
 * as it scrolls into view, then one paragraph on what MAS does.
 */
export async function Statement({ locale }: { locale: Locale }) {
  const t = await getTranslations("statement");
  const lines = t.raw("lines") as string[];
  return (
    <section
      aria-labelledby="statement-title"
      className="px-4 pt-32 pb-28 sm:px-8 sm:pt-44 sm:pb-36"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="statement-title"
          className="text-[clamp(3rem,11vw,9.5rem)] leading-[0.98] font-semibold tracking-[-0.035em] rtl:leading-[1.3] rtl:tracking-normal"
        >
          {lines.map((line, i) => (
            <span
              key={line}
              className={`mas-wipe block ${i % 2 ? "font-light text-[var(--mas-silver)]" : ""}`}
            >
              {line}
            </span>
          ))}
        </h2>
        <div className="mt-16 grid gap-8 sm:mt-24 lg:grid-cols-12">
          <p className="text-lg leading-relaxed font-light text-[var(--mas-soft)]/90 sm:text-xl lg:col-span-6 lg:col-start-6">
            {t("body")}
          </p>
          <div className="lg:col-span-6 lg:col-start-6">
            <RuleLink href={pageHref(locale, "about")}>{t("link")}</RuleLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * M3, the nine services (D5): one ordered list in reading order, numbered because the order is the client's
 * own. Each row draws its gold rule as it scrolls in and links to the service's page.
 */
export async function Services({ locale, index = false }: { locale: Locale; index?: boolean }) {
  const t = await getTranslations("services");
  return (
    <section
      id="services"
      aria-labelledby={index ? undefined : "services-title"}
      aria-label={index ? t("title") : undefined}
      className={`px-4 sm:px-8 ${index ? "pb-28" : "py-28"}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* On the services page the page title above already names the list. */}
        {index ? null : (
          <SectionHeading
            id="services-title"
            title={t("title")}
            intro={t("intro")}
            action={<RuleLink href={pageHref(locale, "services")}>{t("all")}</RuleLink>}
          />
        )}
        <ol>
          {[...masServices]
            .sort((a, b) => a.order - b.order)
            .map((s) => (
              <li key={s.slug} className="mas-row group relative">
                <Link
                  href={pageHref(locale, "services", `/${s.slug}`)}
                  className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-7 sm:grid-cols-[4.5rem_minmax(0,5fr)_minmax(0,6fr)] sm:gap-x-8 sm:py-9"
                >
                  <span className="pt-1 text-sm font-light text-[var(--mas-gold)] tabular-nums">
                    {two(s.order)}
                  </span>
                  <span className="text-xl font-medium tracking-tight transition-colors duration-200 group-hover:text-[var(--mas-gold)] sm:text-2xl rtl:tracking-normal">
                    {s.title[locale]}
                  </span>
                  <span className="text-muted col-start-2 leading-relaxed font-light sm:col-start-3">
                    {s.summary[locale]}
                  </span>
                </Link>
              </li>
            ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * M4, how we work: the guide's own sequence (concept, brand, people, operations, growth) on one gold line
 * that draws through the five steps as they scroll in.
 */
export async function How() {
  const t = await getTranslations("how");
  const steps = t.raw("steps") as { t: string; d: string }[];
  return (
    <section aria-labelledby="how-title" className="px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="how-title" title={t("title")} intro={t("intro")} />
        <ol className="mas-steps relative grid gap-10 ps-8 lg:grid-cols-5 lg:gap-8 lg:ps-0 lg:pt-12">
          {steps.map((s, i) => (
            <li key={s.t} className="relative">
              <span
                aria-hidden="true"
                className="absolute -start-8 top-2 size-2 -translate-x-1/2 rotate-[39.5deg] bg-[var(--mas-gold)] lg:start-0 lg:-top-12 lg:translate-x-0 rtl:translate-x-1/2 lg:rtl:translate-x-0"
              />
              <p className="text-sm font-light text-[var(--mas-gold)] tabular-nums">{two(i + 1)}</p>
              <h3 className="mt-2 text-2xl font-medium tracking-tight rtl:tracking-normal">
                {s.t}
              </h3>
              <p className="text-muted mt-3 leading-relaxed font-light">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** M6, what's on at the places MAS runs: the next three, the samples labelled as such. */
export async function WhatsOn({ locale }: { locale: Locale }) {
  const t = await getTranslations("events");
  const items = whatsOnPreview(locale);
  return (
    <section id="events" aria-labelledby="events-title" className="px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="events-title"
          title={t("title")}
          intro={t("intro")}
          action={<RuleLink href={pageHref(locale, "events")}>{t("all")}</RuleLink>}
        />
        {items.some((i) => i.placeholder) ? (
          <PlaceholderBadge label={t("sample")} className="mb-8" />
        ) : null}
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <EventCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** M7, the three latest articles (samples until MAS sends its own, labelled). */
export async function Insights({ locale }: { locale: Locale }) {
  const t = await getTranslations("insights");
  const latest = [...insights]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);
  return (
    <section aria-labelledby="insights-title" className="px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="insights-title"
          title={t("title")}
          intro={t("intro")}
          action={<RuleLink href={pageHref(locale, "insights")}>{t("all")}</RuleLink>}
        />
        {latest.some((i) => i.placeholder) ? (
          <PlaceholderBadge label={t("sample")} className="mb-8" />
        ) : null}
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((item) => (
            <InsightCard
              key={item.slug}
              item={item}
              locale={locale}
              href={pageHref(locale, "insights", `/${item.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** M8, the one action, over the letter pattern (the wordmark's three shapes, repeated very faintly). */
export async function Cta({ locale, service }: { locale: Locale; service?: string }) {
  const t = await getTranslations("cta");
  return (
    <section
      aria-labelledby="cta-title"
      className="mas-pattern relative overflow-hidden px-4 py-32 sm:px-8 sm:py-44"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col items-start">
        <h2
          id="cta-title"
          className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl rtl:leading-[1.35] rtl:tracking-normal"
        >
          {t("title")}
        </h2>
        <p className="text-muted mt-6 max-w-xl text-lg font-light">{t("body")}</p>
        <Link
          href={pageHref(locale, "contact", service ? `?service=${service}` : "")}
          className="mas-cut mt-10 inline-flex h-13 items-center bg-[var(--mas-gold)] px-7 text-lg font-medium text-[var(--mas-ink)] transition-[filter] duration-200 hover:brightness-110"
        >
          {t("button")}
        </Link>
      </div>
    </section>
  );
}
