import { branches, brands, type Social } from "@mas/content";
import { formatTime, pick, type Locale } from "@mas/i18n";
import { MapPin, Phone, ShoppingBag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ComponentType, SVGProps } from "react";
import { FacebookIcon, InstagramIcon } from "@/components/brand-icons";

const NETWORK_ICONS: Partial<Record<Social["network"], ComponentType<SVGProps<SVGSVGElement>>>> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
};
const NETWORK_NAMES: Record<Social["network"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const displayPhone = (e164: string) =>
  e164.replace(/^\+20/, "0").replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");

/**
 * A10: the title with Aroma's socials and talabat as icons on one line, then both branches in two columns
 * built the same way, so their lines and their links sit level whatever the length of the address.
 */
export async function FindUs({ locale }: { locale: Locale }) {
  const t = await getTranslations("findUs");
  const aroma = brands.aroma;
  const icon =
    "inline-flex size-11 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <section
      aria-labelledby="find-us-title"
      className="border-line mx-auto max-w-7xl border-t px-4 py-16 sm:px-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
        <h2 id="find-us-title" className="text-fg text-4xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <ul aria-label={t("follow")} className="flex items-center gap-3">
          {aroma.socials.map((s) => {
            const Icon = NETWORK_ICONS[s.network];
            return Icon ? (
              <li key={s.network}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={NETWORK_NAMES[s.network]}
                  title={NETWORK_NAMES[s.network]}
                  className={`${icon} bg-fg text-bg`}
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ) : null;
          })}
          {aroma.orderUrl ? (
            <li>
              {/* talabat's own orange, so the order link reads at a glance. */}
              <a
                href={aroma.orderUrl}
                target="_blank"
                rel="noopener"
                aria-label={t("order")}
                title={t("order")}
                className={`${icon} bg-[#ff5a00] text-white`}
              >
                <ShoppingBag aria-hidden="true" className="size-5" strokeWidth={2.2} />
              </a>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {branches.aroma.map((loc) => {
          const first = loc.hours[0];
          return (
            <div key={loc.id} className="border-line flex h-full flex-col gap-2 border-t pt-6">
              <h3 className="text-fg text-xl font-semibold">
                {loc.branch ? pick(loc.branch, locale) : pick(loc.name, locale)}
              </h3>
              <p className="text-muted">{pick(loc.address, locale)}</p>
              {first && !loc.placeholderFields?.includes("hours") ? (
                <p className="text-muted">
                  <bdi>{formatTime(first.opens, locale)}</bdi> –{" "}
                  <bdi>{formatTime(first.closes, locale)}</bdi>
                </p>
              ) : null}
              <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-3">
                {loc.mapsUrl ? (
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-accent inline-flex items-center gap-2 py-2 font-medium underline-offset-4 hover:underline"
                  >
                    <MapPin aria-hidden="true" className="size-4" />
                    {t("directions")}
                  </a>
                ) : null}
                {loc.placeholderFields?.includes("phone") ? null : (
                  <a
                    href={`tel:${loc.phone}`}
                    className="text-accent inline-flex items-center gap-2 py-2 font-medium underline-offset-4 hover:underline"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    <span dir="ltr">{displayPhone(loc.phone)}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
