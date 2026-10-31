import { branches, brands } from "@mas/content";
import { pick, type Locale } from "@mas/i18n";
import { getTranslations } from "next-intl/server";

const NETWORKS = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

/** A10: both branches at a glance, Aroma's socials and talabat, just above the footer. */
export async function FindUs({ locale }: { locale: Locale }) {
  const t = await getTranslations("findUs");
  const aroma = brands.aroma;
  const link = "py-2 underline-offset-4 hover:underline";
  return (
    <section
      aria-labelledby="find-us-title"
      className="border-line mx-auto grid max-w-7xl gap-10 border-t px-4 py-20 sm:px-8 md:grid-cols-[1fr_2fr]"
    >
      <h2 id="find-us-title" className="text-fg text-4xl font-semibold tracking-tight">
        {t("title")}
      </h2>
      <div className="grid gap-10 sm:grid-cols-3">
        {branches.aroma.map((loc) => (
          <div key={loc.id} className="flex flex-col gap-2">
            <h3 className="text-fg text-lg font-semibold">
              {loc.branch ? pick(loc.branch, locale) : pick(loc.name, locale)}
            </h3>
            <p className="text-muted">{pick(loc.address, locale)}</p>
            {loc.mapsUrl ? (
              <a
                href={loc.mapsUrl}
                target="_blank"
                rel="noopener"
                className={`text-accent ${link}`}
              >
                {t("directions")}
              </a>
            ) : null}
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <h3 className="text-fg text-lg font-semibold">{t("follow")}</h3>
          <ul className="flex flex-col">
            {aroma.socials.map((s) => (
              <li key={s.network}>
                <a href={s.url} target="_blank" rel="noopener" className={`text-accent ${link}`}>
                  {NETWORKS[s.network]}
                </a>
              </li>
            ))}
            {aroma.orderUrl ? (
              <li>
                <a
                  href={aroma.orderUrl}
                  target="_blank"
                  rel="noopener"
                  className={`text-accent ${link}`}
                >
                  {t("order")}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
