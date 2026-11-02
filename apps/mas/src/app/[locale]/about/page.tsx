import { imageSlot } from "@mas/content";
import { isLocale } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import { ImageSlot } from "@mas/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/cards";
import { Cta } from "@/components/home/sections";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { crumbs, seoMetadata } from "@/lib/page-meta";
import { webPageSchema } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return seoMetadata(locale, "about", "/about");
}

/** About MAS (D13, D64): what MAS does, the story of the mark, and what it stands for. */
export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const story = t.raw("story") as string[];
  const values = t.raw("values") as { t: string; d: string }[];
  const slot = imageSlot("mas.about.story");

  return (
    <>
      <SiteHeader locale={locale} current="about" />
      <main id="main">
        <JsonLd
          data={[
            crumbs(locale, [{ name: t("title"), path: "/about" }]),
            webPageSchema(locale, "AboutPage", "/about", t("title")),
          ]}
        />
        <PageHero
          title={t("title")}
          lead={t("lead")}
          banner={{ ...imageSlot("mas.banner.about"), locale }}
        />
        <section aria-labelledby="story-title" className="mas-light px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2
                id="story-title"
                className="mas-heading text-3xl font-semibold tracking-tight sm:text-4xl rtl:tracking-normal"
              >
                {t("storyTitle")}
              </h2>
              {story.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="text-muted mt-6 text-lg leading-relaxed font-light"
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="mas-cut [--cut:2.5rem] lg:col-span-6 lg:col-start-7">
              <ImageSlot {...slot} locale={locale} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          </div>
        </section>
        <section aria-labelledby="values-title" className="mas-light px-4 pb-28 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading id="values-title" title={t("valuesTitle")} />
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <li key={v.t} className="border-t border-[var(--brand-line)] pt-6">
                  <h3 className="text-xl font-medium">{v.t}</h3>
                  <p className="text-muted mt-3 leading-relaxed font-light">{v.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <Cta locale={locale} />
      </main>
    </>
  );
}
