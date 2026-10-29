import { isLocale, type Locale } from "@mas/i18n";
import { SequencePlayer } from "@mas/motion/sequence-player";
import { SplitReveal } from "@mas/motion/split-reveal";
import { PlaceholderBadge, SlotBox } from "@mas/ui";
import { LanguageSwitcher } from "@mas/ui/language-switcher";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Bloom, Frond, OliveSprig } from "@/components/board/botanicals";
import { CountUp } from "@/components/board/count-up";
import { DrawOn } from "@/components/board/draw-on";

// P2 art-direction board: how the Aroma Lounge landing will look and move, scene by scene (docs/03 §4.3).
// Internal review page; never part of a production build.
export const metadata: Metadata = {
  title: "Art direction",
  robots: { index: false, follow: false },
};

const t = (locale: Locale, en: string, ar: string) => (locale === "ar" ? ar : en);

function Note({ scene, children }: { scene: string; children: ReactNode }) {
  return (
    <aside
      lang="en"
      dir="ltr"
      className="border-line text-muted mx-auto max-w-7xl border-y px-4 py-4 text-sm sm:px-8"
    >
      <span className="text-fg font-medium">{scene}.</span> {children}
    </aside>
  );
}

/** The guide's double rule: two hairlines with the section name set between them. */
function DoubleRule({ children }: { children: ReactNode }) {
  return (
    <div className="border-fg/70 flex items-center justify-between border-y py-1.5 text-sm">
      <span className="text-fg">{children}</span>
      <span aria-hidden="true" className="text-fg/60">
        Aroma Lounge
      </span>
    </div>
  );
}

const VALUES = [
  {
    key: "passion",
    Drawing: OliveSprig,
    en: ["Passion", "Cooking and hosting the way we would for family."],
    ar: ["الشغف", "نطبخ ونستقبل ضيوفنا كما نفعل مع العائلة."],
  },
  {
    key: "diversity",
    Drawing: Frond,
    en: ["Diversity", "A menu with room for every taste at the table."],
    ar: ["التنوع", "منيو فيه مكان لكل ذوق على الطاولة."],
  },
  {
    key: "creativity",
    Drawing: Bloom,
    en: ["Creativity", "New dishes and new evenings, season after season."],
    ar: ["الإبداع", "أطباق جديدة وأمسيات جديدة، موسمًا بعد موسم."],
  },
] as const;

const PALETTE = [
  { name: "Charcoal", hex: "#202722" },
  { name: "Green", hex: "#8EB57A" },
  { name: "Beige", hex: "#E6E3D8" },
  { name: "Grey", hex: "#ABA6A6" },
  { name: "Forest", hex: "#355E3B" },
  { name: "Copper", hex: "#A5673F" },
  { name: "Rust", hex: "#5C2E1F" },
  { name: "Butter", hex: "#F5E6B8" },
];

export default async function ArtDirection({ params }: PageProps<"/[locale]/art-direction">) {
  const { locale } = await params;
  if (!isLocale(locale) || process.env.VERCEL_ENV === "production") notFound();
  setRequestLocale(locale);

  return (
    <main id="main" className="bg-bg relative overflow-x-clip">
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <PlaceholderBadge label="Internal · P2 art direction" className="bg-bg/80" />
        <LanguageSwitcher className="bg-bg/80" />
      </div>

      {/* A1 */}
      <SequencePlayer
        id="aroma.hero"
        manifestUrl="/sequences/drafts/aroma.hero/manifest.json"
        poster={{
          avif: "/sequences/drafts/aroma.hero/poster.avif",
          webp: "/sequences/drafts/aroma.hero/poster.webp",
          width: 960,
          height: 540,
        }}
        label={t(
          locale,
          "Steam rising from a freshly served paella",
          "بخار يتصاعد من طبق باييلا طازج",
        )}
        scrollVh={250}
      >
        <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-start pt-[12vh] text-center text-[var(--aroma-butter)]">
          {/* The wordmark slot: the client's script logo SVG will draw itself here as the steam rises. */}
          <div
            className="w-[min(70vw,34rem)]"
            style={{ opacity: "clamp(0, calc(var(--seq-progress, 0) * 4), 1)" }}
          >
            <SlotBox
              slotId="aroma.logo.script"
              kind="image"
              width={1200}
              height={360}
              label="Aroma Lounge script logo"
              lines={["Logo SVG from the client", "aroma.logo.script", "draws stroke by stroke"]}
              className="bg-transparent"
            />
          </div>
          <h1 className="sr-only">{t(locale, "Aroma Lounge", "أروما لاونج")}</h1>
          <p
            className="mt-6 text-lg font-light [text-shadow:0_1px_12px_rgb(0_0_0/0.6)] sm:text-xl"
            style={{ opacity: "clamp(0, calc((var(--seq-progress, 0) - 0.55) * 5), 1)" }}
          >
            {t(locale, "At City Stars since 2006", "في سيتي ستارز منذ 2006")}
          </p>
        </div>
      </SequencePlayer>
      <Note scene="A1 Aroma rising · MAG draft (Kling 3.0, 960×540 preview) + motion">
        Steam builds over the paella as you scroll and curls into the dark space kept free for the
        logo. The script wordmark will draw itself stroke by stroke in that space once we have the
        client&apos;s SVG (shown here as a slot). Good candidate for the final as it is.
      </Note>

      {/* A2 */}
      <section className="mx-auto max-w-5xl px-4 py-32 sm:px-8 sm:py-44">
        <DoubleRule>{t(locale, "Our motto", "شعارنا")}</DoubleRule>
        <SplitReveal
          as="p"
          className="text-fg mt-14 text-5xl leading-[1.08] font-light sm:text-7xl"
        >
          {t(
            locale,
            "Good food comes from good hearts, we aspire for both.",
            "الطعام الطيب يأتي من القلوب الطيبة، ونسعى إلى الاثنين.",
          )}
        </SplitReveal>
        <p className="text-muted mt-10 text-lg">
          {t(locale, "Mahmoud Younes, Founder", "محمود يونس، المؤسس")}
        </p>
      </section>
      <Note scene="A2 Motto · motion">
        The founder&apos;s line rises word by word, once. Hanken Grotesk Light at display size
        carries the warmth; the double rule with the section name comes straight from the brand
        guide.
      </Note>

      {/* A3 */}
      <section className="bg-[var(--aroma-charcoal)] py-28 text-[var(--aroma-beige)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="flex items-center justify-between border-y border-[var(--aroma-beige)]/60 py-1.5 text-sm">
            <span>{t(locale, "Since 2006", "منذ 2006")}</span>
            <span aria-hidden="true" className="opacity-60">
              Aroma Lounge
            </span>
          </div>
          <dl className="mt-16 grid gap-12 sm:grid-cols-3">
            <div>
              <dt className="text-sm opacity-70">
                {t(locale, "Opened at City Stars", "الافتتاح في سيتي ستارز")}
              </dt>
              <dd className="mt-3 text-7xl font-light sm:text-8xl">
                <CountUp value={2006} locale={locale} grouping={false} />
              </dd>
            </div>
            <div>
              <dt className="text-sm opacity-70">
                {t(locale, "Square metres inside", "متر مربع في الداخل")}
              </dt>
              <dd className="mt-3 text-7xl font-light sm:text-8xl">
                <CountUp value={1200} locale={locale} />
              </dd>
            </div>
            <div>
              <dt className="text-sm opacity-70">
                {t(locale, "Square metres of terrace", "متر مربع من التراس")}
              </dt>
              <dd className="mt-3 text-7xl font-light sm:text-8xl">
                <CountUp value={900} locale={locale} />
              </dd>
            </div>
          </dl>
          <p className="mt-16 max-w-xl text-lg leading-relaxed opacity-80">
            {t(
              locale,
              "Two major renovations since opening, and the same welcome at the door.",
              "تجديدان كبيران منذ الافتتاح، ونفس الترحيب عند الباب.",
            )}
          </p>
        </div>
      </section>
      <Note scene="A3 Since 2006 · motion">
        The three figures count up once when they arrive (from the brand guide: opened 2006 at City
        Stars, 1,200 m² inside, 900 m² of terrace). Dark charcoal band for contrast between the warm
        scenes.
      </Note>

      {/* A4 */}
      <section className="mx-auto max-w-7xl px-4 py-32 sm:px-8">
        <DoubleRule>{t(locale, "What we care about", "ما نهتم به")}</DoubleRule>
        <ul className="mt-16 grid gap-16 md:grid-cols-3">
          {VALUES.map(({ key, Drawing, ...v }) => (
            <li key={key} className="flex flex-col gap-6">
              <DrawOn className="text-fg">
                <Drawing className="h-56 w-full" />
              </DrawOn>
              <h3 className="text-fg text-4xl font-light">{v[locale][0]}</h3>
              <p className="text-muted max-w-xs leading-relaxed">{v[locale][1]}</p>
            </li>
          ))}
        </ul>
      </section>
      <Note scene="A4 Passion · Diversity · Creativity · motion">
        Each value has a botanical line drawing (drawn in SVG, after the guide&apos;s
        black-and-white botanicals) that draws itself as you scroll, and undraws going back up. The
        value lines are our draft copy.
      </Note>

      {/* A5 */}
      <SequencePlayer
        id="aroma.terrace"
        manifestUrl="/sequences/drafts/aroma.terrace/manifest.json"
        poster={{
          avif: "/sequences/drafts/aroma.terrace/poster.avif",
          webp: "/sequences/drafts/aroma.terrace/poster.webp",
          width: 960,
          height: 540,
        }}
        label={t(
          locale,
          "Aroma Lounge's terrace from daylight to evening",
          "تراس أروما لاونج من النهار حتى المساء",
        )}
        scrollVh={250}
      >
        <div className="mx-auto flex h-full max-w-6xl items-end px-4 pb-14 sm:px-8">
          <div className="max-w-md bg-[var(--aroma-charcoal)]/75 p-6 text-[var(--aroma-beige)] backdrop-blur-sm">
            <p className="text-3xl font-light">
              {t(locale, "Stay for the evening", "ابقَ حتى المساء")}
            </p>
            <p className="mt-3 leading-relaxed opacity-80">
              {t(
                locale,
                "900 m² of open-air terrace, from afternoon coffee to dinner under the lights.",
                "900 متر مربع من التراس المفتوح، من قهوة العصر إلى العشاء تحت الأضواء.",
              )}
            </p>
          </div>
        </div>
      </SequencePlayer>
      <Note scene="A5 Terrace, dusk to night · MAG draft (Kling 3.0, 960×540 preview)">
        Scroll moves the terrace from daylight to evening; the string lights come on near the end.
        The terrace is generated (we have no photos of the real one yet), so the final should start
        from a photo of the actual terrace if the client can send one.
      </Note>

      {/* Specimen */}
      <section
        lang="en"
        dir="ltr"
        className="mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-8 md:grid-cols-2"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-muted text-sm">Type</h2>
          <p className="text-fg text-7xl leading-none font-light">Hanken Grotesk</p>
          <p className="text-fg text-xl">
            The free stand-in for Telegraf: light at display sizes, regular for reading.
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="text-fg text-4xl font-light"
            style={{ fontFamily: "var(--font-alexandria)" }}
          >
            أروما لاونج
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="text-fg text-lg"
            style={{ fontFamily: "var(--font-alexandria)" }}
          >
            Alexandria للعربية، مع أرقام غربية 0123456789.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-muted text-sm">Colour</h2>
          <ul className="grid grid-cols-4 gap-3">
            {PALETTE.map((c) => (
              <li key={c.hex} className="border-line flex flex-col border">
                <span className="h-16" style={{ background: c.hex }} />
                <span className="text-fg px-2 pt-2 text-xs">{c.name}</span>
                <code className="text-muted px-2 pb-2 text-[11px]">{c.hex}</code>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
