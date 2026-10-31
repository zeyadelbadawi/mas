import { covyMenu, imageSlot, type MenuTag } from "@mas/content";
import { formatPrice, pick, type Locale } from "@mas/i18n";
import { ImageSlot, PlaceholderBadge } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { Star } from "@/components/sections/motifs";
import { MenuControls, type MenuControlsLabels } from "./menu-controls";

/** Tag words in both languages, so a search for "vegetarian" or "نباتي" finds those dishes. */
const TAG_WORDS: Record<MenuTag, string> = {
  veg: "vegetarian veg نباتي",
  spicy: "spicy hot حار",
  nuts: "nuts مكسرات",
  new: "new جديد",
  signature: "signature مميز",
};

/** C5: the whole menu as server-rendered HTML; MenuControls adds search, filters and the section bar. */
export async function Menu({ locale }: { locale: Locale }) {
  const t = await getTranslations("menu");
  const tags = ["veg", "spicy", "nuts", "new", "signature"] as const;
  return (
    <section id="menu" aria-labelledby="menu-title" className="py-28">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-8">
        <h2 id="menu-title" className="font-editorial text-fg text-6xl sm:text-7xl">
          {t("title")}
        </h2>
        <PlaceholderBadge label={t("sample")} />
      </div>

      <MenuControls
        locale={locale}
        categories={covyMenu.map((c) => ({ id: c.id, name: pick(c.name, locale) }))}
        labels={{
          search: t("search"),
          searchPlaceholder: t("searchPlaceholder"),
          filters: t("filters"),
          categories: t("categories"),
          clear: t("clear"),
          tags: Object.fromEntries(tags.map((tag) => [tag, t(`tags.${tag}`)])) as Record<
            MenuTag,
            string
          >,
          resultsForms: t.raw("resultsForms") as MenuControlsLabels["resultsForms"],
        }}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-4 pt-16 max-sm:pb-24 sm:px-8">
        {covyMenu.map((c) => (
          <section
            key={c.id}
            id={`menu-${c.id}`}
            data-menu-section
            aria-labelledby={`menu-${c.id}-title`}
            className="scroll-mt-32"
          >
            <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-end">
              <div>
                <h3
                  id={`menu-${c.id}-title`}
                  className="font-editorial text-fg text-4xl sm:text-5xl"
                >
                  {pick(c.name, locale)}
                </h3>
                <p className="text-muted mt-3 max-w-md">{pick(c.intro, locale)}</p>
              </div>
              <div className="menu-hero w-full max-w-sm overflow-hidden rounded-t-[999px] md:justify-self-end">
                <ImageSlot
                  {...imageSlot(`covy.menu.${c.id}.hero`)}
                  locale={locale}
                  sizes="(min-width: 768px) 24rem, 100vw"
                />
              </div>
            </div>
            <ul className="mt-10 grid gap-x-16 md:grid-cols-2">
              {c.items.map((item) => {
                const tags = item.tags.filter((tag) => tag !== "signature");
                return (
                  <li
                    key={item.id}
                    data-item
                    data-tags={item.tags.join(" ")}
                    data-search={`${item.name.en} ${item.name.ar} ${item.description.en} ${item.description.ar} ${item.tags.map((tag) => TAG_WORDS[tag]).join(" ")}`.toLowerCase()}
                    className="border-line flex gap-4 border-b py-5"
                  >
                    {item.imageSlotId ? (
                      <div className="w-20 shrink-0 overflow-hidden rounded-full sm:w-24">
                        <ImageSlot {...imageSlot(item.imageSlotId)} locale={locale} sizes="96px" />
                      </div>
                    ) : null}
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-4">
                        <h4 className="text-fg flex items-center gap-2 font-medium">
                          {pick(item.name, locale)}
                          {item.tags.includes("signature") ? (
                            <Star
                              className="text-accent size-3"
                              aria-hidden={false}
                              aria-label={t("tags.signature")}
                              role="img"
                            />
                          ) : null}
                        </h4>
                        <span className="text-fg shrink-0 tabular-nums">
                          {formatPrice(item.priceEGP, locale)}
                        </span>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {pick(item.description, locale)}
                      </p>
                      {tags.length ? (
                        <p className="text-muted flex flex-wrap gap-x-3 text-xs">
                          {tags.map((tag) => (
                            <span key={tag}>{t(`tags.${tag}`)}</span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <p className="text-muted text-sm">{t("allergens")}</p>
      </div>
    </section>
  );
}
