import { branches, brands } from "@mas/content";
import { localePath } from "@mas/seo";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { AromaPetal, AromaWordmark, CovyWordmark } from "@/components/brand-marks";
import { RuleLink } from "@/components/cards";
import { pageHref } from "@/components/site-header";
import { BRAND_POSTERS } from "@/lib/brand-posters";

export type BrandKey = "covy" | "aroma";

export const siteOf = (id: BrandKey, locale: "en" | "ar") =>
  `${brands[id].domain}${localePath(locale, "/")}`.replace(/\/$/, "");

export function BrandMark({ id, className }: { id: BrandKey; className?: string }) {
  if (id === "covy") return <CovyWordmark className={`h-8 w-auto ${className ?? ""}`} />;
  return (
    <span className={`flex items-center gap-3 ${className ?? ""}`}>
      <AromaPetal className="h-10 w-auto" />
      <AromaWordmark className="h-6 w-auto" />
    </span>
  );
}

/** The scene poster seen through the brand's door, with the diagonal corner. */
export function BrandPicture({
  id,
  alt,
  priority = false,
}: {
  id: BrandKey;
  alt: string;
  priority?: boolean;
}) {
  const p = BRAND_POSTERS[id];
  return (
    <picture className="mas-cut block [--cut:2.5rem]">
      <source type="image/avif" srcSet={p.avif} />
      <img
        src={p.webp}
        width={p.width}
        height={p.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="aspect-video h-auto w-full object-cover"
      />
    </picture>
  );
}

/**
 * One brand on the brands page: its picture, its mark, what MAS does for it and its branches, with links to
 * the brand page and to its own site.
 */
export async function BrandBlock({
  id,
  locale,
  flip = false,
}: {
  id: BrandKey;
  locale: "en" | "ar";
  flip?: boolean;
}) {
  const t = await getTranslations("brandsPage");
  const d = await getTranslations("doors");
  return (
    <article aria-labelledby={`${id}-title`} className="grid items-center gap-10 lg:grid-cols-12">
      <div className={`lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : ""}`}>
        <Link href={pageHref(locale, "brands", `/${id}`)} tabIndex={-1} aria-hidden="true">
          <BrandPicture id={id} alt="" />
        </Link>
      </div>
      <div className={`lg:col-span-4 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
        <h2 id={`${id}-title`} className="sr-only">
          {brands[id].name[locale]}
        </h2>
        <BrandMark id={id} />
        <p className="mt-6 text-lg leading-relaxed font-light text-[var(--mas-soft)]/85">
          {t(`${id}.lead`)}
        </p>
        <p className="text-muted mt-4 text-sm">
          {t("branches")}: {branches[id].length} · {t(`${id}.place`)}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-8">
          <RuleLink href={pageHref(locale, "brands", `/${id}`)}>{t("read")}</RuleLink>
          <a
            href={siteOf(id, locale)}
            className="mas-rule-link inline-flex items-center py-2 text-sm font-medium"
          >
            {d(`${id}.visit`)}
          </a>
        </div>
      </div>
    </article>
  );
}
