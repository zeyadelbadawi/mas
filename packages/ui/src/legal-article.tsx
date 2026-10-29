import type { LegalDocument } from "@mas/content";
import { formatDate, pick, type Locale } from "@mas/i18n";
import { PlaceholderBadge } from "./site-shell";

type LegalArticleProps = {
  doc: LegalDocument;
  locale: Locale;
  labels: { updated: string; draft: string };
};

/** Privacy Policy / Terms of Use body. Long-form reading width, logical spacing for RTL. */
export function LegalArticle({ doc, locale, labels }: LegalArticleProps) {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24">
      <header className="flex flex-col gap-4">
        {doc.placeholder ? <PlaceholderBadge label={labels.draft} className="self-start" /> : null}
        <h1 className="font-display text-fg text-4xl sm:text-5xl">{pick(doc.title, locale)}</h1>
        <p className="text-muted text-sm">
          {labels.updated}{" "}
          <time dateTime={doc.updated}>
            {formatDate(new Date(`${doc.updated}T12:00:00Z`), locale, {
              weekday: undefined,
              month: "long",
            })}
          </time>
        </p>
        <p className="text-fg text-lg leading-relaxed">{pick(doc.intro, locale)}</p>
      </header>
      {doc.sections.map((section) => (
        <section key={section.heading.en} className="flex flex-col gap-3">
          <h2 className="text-fg text-xl font-semibold">{pick(section.heading, locale)}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.en} className="text-fg/90 leading-relaxed">
              {pick(p, locale)}
            </p>
          ))}
          {section.list ? (
            <ul className="text-fg/90 marker:text-muted flex list-disc flex-col gap-2 ps-5 leading-relaxed">
              {section.list.map((item) => (
                <li key={item.en}>{pick(item, locale)}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
