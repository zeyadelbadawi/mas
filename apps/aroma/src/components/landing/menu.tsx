import { aromaMenu, brands, imageSlot, type MenuCategory } from "@mas/content";
import { formatPrice, pick, type Locale } from "@mas/i18n";
import { ImageSlot } from "@mas/ui";
import { getTranslations } from "next-intl/server";
import { AromaPetal } from "@/components/logo";
import { MenuControls, type MenuControlsLabels } from "./menu-controls";

const GROUPS = ["breakfast", "food", "drinks", "dessert", "kids"] as const;

/**
 * A5: every item of Aroma's digital menu as server-rendered HTML, in the client's own five menus, with the
 * client's dish photos (D53). Items without a photo show the logo's petal instead of an empty box.
 */
export async function Menu({ locale }: { locale: Locale }) {
  const t = await getTranslations("menu");
  const groups = GROUPS.map((g) => ({
    id: g,
    name: t(`groups.${g}`),
    categories: aromaMenu.filter((c) => c.group === g),
  })).filter((g) => g.categories.length);
  const orderUrl = brands.aroma.orderUrl;

  return (
    <section id="menu" aria-labelledby="menu-title" className="bg-surface-2 py-28">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-8">
        <div>
          <h2 id="menu-title" className="text-fg text-6xl font-semibold tracking-tight sm:text-7xl">
            {t("title")}
          </h2>
          <p className="text-muted mt-4 max-w-xl text-lg">{t("intro")}</p>
        </div>
        {orderUrl ? (
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener"
            className="text-accent py-2 font-medium underline underline-offset-4"
          >
            {t("order")}
          </a>
        ) : null}
      </div>

      <MenuControls
        locale={locale}
        groups={groups.map((g) => ({
          id: g.id,
          name: g.name,
          sections: g.categories.map((c) => c.id),
        }))}
        labels={{
          search: t("search"),
          searchPlaceholder: t("searchPlaceholder"),
          categories: t("categories"),
          clear: t("clear"),
          resultsForms: t.raw("resultsForms") as MenuControlsLabels["resultsForms"],
        }}
      />

      <div
        id="menu-groups"
        className="mx-auto flex max-w-7xl scroll-mt-32 flex-col gap-24 px-4 pt-16 max-sm:pb-24 sm:px-8"
      >
        {groups.map((g) => (
          <div
            key={g.id}
            id={`menu-group-${g.id}`}
            data-menu-group={g.id}
            className="flex scroll-mt-32 flex-col gap-16"
          >
            {g.categories.map((c) => (
              <Category key={c.id} category={c} locale={locale} />
            ))}
          </div>
        ))}
        <p className="text-muted text-sm">{t("allergens")}</p>
      </div>
    </section>
  );
}

function Category({ category: c, locale }: { category: MenuCategory; locale: Locale }) {
  return (
    <section
      id={`menu-${c.id}`}
      data-menu-section
      aria-labelledby={`menu-${c.id}-title`}
      className="scroll-mt-32"
    >
      <div className="flex flex-col gap-2">
        <h3
          id={`menu-${c.id}-title`}
          className="text-fg flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          <AromaPetal className="h-6 w-auto shrink-0" />
          {pick(c.name, locale)}
        </h3>
        <p className="text-muted max-w-xl">{pick(c.intro, locale)}</p>
      </div>
      <ul className="mt-8 grid gap-x-12 md:grid-cols-2">
        {c.items.map((item) => {
          const description = pick(item.description, locale);
          // A dish whose menu entry has an English description only shows it as written.
          const fallback = !description && item.description.en ? item.description.en : "";
          return (
            <li
              key={item.id}
              data-item
              data-search={`${item.name.en} ${item.name.ar} ${item.description.en} ${item.description.ar} ${c.name.en} ${c.name.ar}`.toLowerCase()}
              className="border-line flex gap-4 border-b py-5"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-2xl sm:size-24">
                {item.imageSlotId && item.photo ? (
                  <ImageSlot
                    {...imageSlot(item.imageSlotId)}
                    locale={locale}
                    sizes="96px"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="bg-surface flex size-full items-center justify-center">
                    <AromaPetal className="h-9 w-auto opacity-35" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="text-fg font-medium">{pick(item.name, locale)}</h4>
                  <span className="text-fg shrink-0 tabular-nums">
                    {formatPrice(item.priceEGP, locale)}
                  </span>
                </div>
                {description ? (
                  <p className="text-muted text-sm leading-relaxed">{description}</p>
                ) : fallback ? (
                  <p
                    lang="en"
                    dir="ltr"
                    className="text-muted text-sm leading-relaxed rtl:text-end"
                  >
                    {fallback}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
