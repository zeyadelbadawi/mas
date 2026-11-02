import { aromaMenu, branches, brands, imageSlot, testimonials } from "@mas/content";
import { formatPrice } from "@mas/i18n";
import { JsonLd } from "@mas/seo";
import { ImageSlot, PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";
import { BrandMark, siteOf, type BrandKey } from "@/components/brand-case";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { BRAND_POSTERS } from "@/lib/brand-posters";
import { crumbs, innerMetadata } from "@/lib/page-meta";
import { brandSchema } from "@/lib/schema";

export async function brandCaseMetadata(id: BrandKey, locale: "en" | "ar") {
  const t = await getTranslations({ locale, namespace: "seo" });
  const d = await getTranslations({ locale, namespace: "doors" });
  // The share image is the picture seen through the brand's door.
  const poster = BRAND_POSTERS[id];
  return innerMetadata(locale, `/brands/${id}`, t(`${id}.title`), t(`${id}.description`), {
    image: { url: poster.webp, width: poster.width, height: poster.height, alt: d("label") },
  });
}

/**
 * What each brand page shows (D67). Only a taste: the brand's own site tells the full story, so every
 * section ends with a way there. COVY: three rooms and one guest's words. Aroma: two branches and the
 * table, then three dishes from the client's own menu photos.
 */
const CASE = {
  covy: {
    gallery: ["covy.spaces.indoor.1", "covy.spaces.terrace.1", "covy.spaces.bar.1"],
    galleryAnchor: "#spaces",
  },
  aroma: {
    gallery: ["aroma.branch.mivida", "aroma.story", "aroma.branch.madinaty"],
    galleryAnchor: "#branches",
  },
} as const;

const AROMA_DISHES = [
  "aroma.breakfast.full-oriental-breakfast-tray",
  "aroma.feteer.meshaltet",
  "aroma.dessert.om-ali",
] as const;

/** A quiet link out to the brand's own site, with the gold rule after it. */
function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="mas-rule-link inline-flex items-center py-2 text-sm font-medium">
      {children}
    </a>
  );
}

/**
 * A brand MAS runs (D13, D67), as MAS presents it: its mark and what it is, the brand's own words and a
 * few facts, a short gallery, one highlight, the branches, and the door to its site. Dark gray and gold throughout, with the brand's own colour only in its pictures.
 */
export async function BrandCasePage({ id, locale }: { id: BrandKey; locale: "en" | "ar" }) {
  const t = await getTranslations("brandsPage");
  const d = await getTranslations("doors");
  const name = brands[id].name[locale];
  const site = siteOf(id, locale);
  const cfg = CASE[id];
  const list = branches[id];
  const review = testimonials.find((r) => r.brandId === id && !r.placeholder);
  const dishes = AROMA_DISHES.map((dishId) =>
    aromaMenu.flatMap((c) => c.items).find((i) => i.id === dishId),
  ).filter((i) => i?.photo);

  return (
    <>
      <SiteHeader locale={locale} current="brands" />
      <main id="main">
        <JsonLd
          data={[
            crumbs(locale, [
              { name: t("title"), path: "/brands" },
              { name, path: `/brands/${id}` },
            ]),
            brandSchema(id, locale),
          ]}
        />
        <PageHero
          title={name}
          lead={t(`${id}.lead`)}
          before={
            <div className="mb-10 flex items-center gap-4 text-sm text-[var(--mas-soft)]/85">
              <BrandMark id={id} className="text-[var(--mas-soft)] [&_svg]:h-10" />
              <span aria-hidden="true" className="h-px w-8 bg-[var(--mas-gold)]" />
              {t("managed")}
            </div>
          }
          after={
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={site}
                className="mas-cut inline-flex h-12 items-center bg-[var(--mas-gold)] px-6 font-medium text-[var(--mas-ink)] transition-[filter] duration-200 hover:brightness-110"
              >
                {d(`${id}.visit`)}
              </a>
              <OutLink href={`${site}#reserve`}>{t("book")}</OutLink>
            </div>
          }
        />

        {/* The brand in its own words, and the facts that matter. */}
        <section aria-labelledby="intro-title" className="px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="intro-title" className="sr-only">
                {t("about", { brand: name })}
              </h2>
              <p className="text-3xl leading-[1.25] font-light text-balance sm:text-5xl rtl:leading-[1.5]">
                <span aria-hidden="true" className="me-3 text-[var(--mas-gold)]">
                  “
                </span>
                {brands[id].tagline[locale]}
                <span aria-hidden="true" className="ms-1 text-[var(--mas-gold)]">
                  ”
                </span>
              </p>
            </div>
            <dl className="grid gap-8 self-end sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
              <div className="border-t border-[var(--brand-line)] pt-5">
                <dt className="text-sm text-[var(--mas-gold)]">{t("branches")}</dt>
                <dd className="mt-2 text-lg font-light">
                  {list.map((b) => b.name[locale].split(" — ").pop()).join(" · ")}
                </dd>
              </div>
              <div className="border-t border-[var(--brand-line)] pt-5">
                <dt className="text-sm text-[var(--mas-gold)]">{t("kitchen")}</dt>
                <dd className="mt-2 text-lg font-light">{t(`${id}.kitchen`)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* A short gallery: one tall picture and two beside it, cut on the diagonal. */}
        <section aria-labelledby="gallery-title" className="px-4 pb-24 sm:px-8 sm:pb-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h2
                id="gallery-title"
                className="mas-heading text-3xl font-semibold tracking-tight sm:text-4xl rtl:tracking-normal"
              >
                {t("inside", { brand: name })}
              </h2>
              <OutLink href={`${site}${cfg.galleryAnchor}`}>
                {t("seeMore", { brand: name })}
              </OutLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-12 sm:grid-rows-2">
              {cfg.gallery.map((slotId, i) => {
                const slot = imageSlot(slotId);
                return (
                  <div
                    key={slotId}
                    className={`mas-cut relative overflow-hidden [--cut:2rem] ${
                      i === 0
                        ? "aspect-[4/5] sm:col-span-7 sm:row-span-2 sm:aspect-auto"
                        : "aspect-[16/10] sm:col-span-5"
                    }`}
                  >
                    <Image
                      src={slot.src ?? ""}
                      alt={slot.alt[locale]}
                      fill
                      sizes={
                        i === 0
                          ? "(min-width: 640px) 58vw, 100vw"
                          : "(min-width: 640px) 42vw, 100vw"
                      }
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* One highlight: a guest's words at COVY, three dishes at Aroma. */}
        {id === "covy" && review ? (
          <section aria-labelledby="guest-title" className="mas-light px-4 py-24 sm:px-8 sm:py-32">
            <figure className="mx-auto max-w-4xl text-center">
              <h2 id="guest-title" className="text-sm font-medium">
                {t("guests")}
              </h2>
              <p
                aria-label={t("rating", { stars: review.rating })}
                className="mt-6 tracking-[0.3em] text-[var(--mas-ink)]"
              >
                {"★".repeat(review.rating)}
              </p>
              <blockquote className="mt-6 text-2xl leading-[1.5] font-light text-balance sm:text-3xl">
                {review.quote[locale]}
              </blockquote>
              <figcaption className="text-muted mt-8 flex items-center justify-center gap-3 text-sm">
                <span aria-hidden="true" className="h-px w-8 bg-[var(--mas-gold)]" />
                {review.author[locale]}
              </figcaption>
              <div className="mt-8">
                <OutLink href={site}>{t("seeMore", { brand: name })}</OutLink>
              </div>
            </figure>
          </section>
        ) : null}
        {id === "aroma" && dishes.length ? (
          <section aria-labelledby="dishes-title" className="mas-light px-4 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
                <h2
                  id="dishes-title"
                  className="mas-heading text-3xl font-semibold tracking-tight sm:text-4xl rtl:tracking-normal"
                >
                  {t("fromMenu")}
                </h2>
                <OutLink href={`${site}#menu`}>{t("fullMenu", { brand: name })}</OutLink>
              </div>
              <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-3">
                {dishes.map((dish) =>
                  dish ? (
                    <li key={dish.id}>
                      <div className="mas-cut relative aspect-square overflow-hidden [--cut:1.75rem]">
                        <Image
                          src={dish.photo ?? ""}
                          alt={dish.name[locale]}
                          fill
                          sizes="(min-width: 640px) 33vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-[var(--brand-line)] pt-4">
                        <h3 className="text-lg font-medium">{dish.name[locale]}</h3>
                        <p className="text-muted shrink-0 text-sm tabular-nums">
                          {formatPrice(dish.priceEGP, locale)}
                        </p>
                      </div>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          </section>
        ) : null}

        {/* The branches, briefly; directions, hours and booking are on the brand's site. */}
        <section aria-labelledby="branches-title" className="px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h2
                id="branches-title"
                className="mas-heading text-3xl font-semibold tracking-tight sm:text-4xl rtl:tracking-normal"
              >
                {t("branches")}
              </h2>
              <OutLink href={`${site}${id === "covy" ? "#visit" : "#branches"}`}>
                {t("directions")}
              </OutLink>
            </div>
            <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {list.map((b) => (
                <li key={b.id} className="border-t border-[var(--brand-line)] pt-6">
                  <h3 className="text-xl font-medium">{b.name[locale]}</h3>
                  <p className="text-muted mt-2 leading-relaxed font-light">{b.address[locale]}</p>
                  {b.placeholder ? (
                    <PlaceholderBadge label={t("placeholder")} className="mt-3" />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The door out: the brand's mark in a gold frame, and the way to its site. */}
        <section aria-labelledby="door-title" className="mas-pattern px-4 py-28 sm:px-8 sm:py-36">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <a
              href={site}
              aria-hidden="true"
              tabIndex={-1}
              className="group relative flex aspect-[3/4] w-48 items-end justify-center overflow-hidden sm:w-56"
            >
              <ImageSlot
                {...imageSlot(cfg.gallery[0])}
                locale={locale}
                sizes="14rem"
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="absolute inset-0 bg-[linear-gradient(to_top,var(--mas-ink),transparent_70%)]" />
              <span className="mas-menu-frame absolute inset-2.5" />
              <span className="relative pb-6 text-[var(--mas-soft)]">
                <BrandMark id={id} />
              </span>
            </a>
            <h2
              id="door-title"
              className="mt-10 text-4xl font-semibold tracking-tight text-balance sm:text-5xl rtl:tracking-normal"
            >
              {t("stepInside", { brand: name })}
            </h2>
            <a
              href={site}
              className="mas-cut mt-8 inline-flex h-12 items-center bg-[var(--mas-gold)] px-6 font-medium text-[var(--mas-ink)] transition-[filter] duration-200 hover:brightness-110"
            >
              {d(`${id}.visit`)}
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
