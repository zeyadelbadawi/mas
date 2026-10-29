import { imageSlot } from "@mas/content";
import { isLocale, type Locale } from "@mas/i18n";
import { SequencePlayer } from "@mas/motion/sequence-player";
import { ImageSlot, PlaceholderBadge } from "@mas/ui";
import { LanguageSwitcher } from "@mas/ui/language-switcher";
import type { Metadata } from "next";
import { internalPagesEnabled } from "@mas/seo";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { CSSProperties, ReactNode } from "react";
import { ArchGallery } from "@/components/board/arch-gallery";
import { Cuisines } from "@/components/board/cuisines";
import { Drift } from "@/components/board/drift";
import { CaladiumLeaf, Star, Terrazzo } from "@/components/board/motifs";

// P2 art-direction board: how the COVY landing will look and move, scene by scene (docs/03 §4.2).
// Internal review page; switches off at launch (SITE_INDEXABLE=true).
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

/** Fades a hotspot in once the sequence passes `at` (0..1), using the player's --seq-progress. */
const hotspot = (at: number): CSSProperties => ({
  opacity: `clamp(0, calc((var(--seq-progress, 0) - ${at}) * 12), 1)`,
});

const HOTSPOTS = [
  { at: 0.12, en: "Cold milk", ar: "حليب بارد", side: "start", top: "58%" },
  { at: 0.38, en: "Double espresso", ar: "إسبريسو دبل", side: "end", top: "44%" },
  { at: 0.7, en: "Cold foam", ar: "رغوة باردة", side: "start", top: "24%" },
  { at: 0.86, en: "Cocoa dusting", ar: "رشة كاكاو", side: "end", top: "17%" },
] as const;

const CUISINES = [
  {
    id: "mediterranean",
    en: ["Mediterranean", "Olive oil, citrus and the grill, the way coastal towns cook."],
    ar: ["البحر المتوسط", "زيت الزيتون والحمضيات والشواء، كما تطبخ مدن الساحل."],
  },
  {
    id: "asian",
    en: ["Asian", "Bright broths, wok heat and fresh herbs."],
    ar: ["آسيوي", "مرق غني وحرارة الووك وأعشاب طازجة."],
  },
  {
    id: "latin",
    en: ["Latin American", "Smoke, lime and slow-cooked spice."],
    ar: ["أمريكا اللاتينية", "دخان وليمون وتوابل مطهوة على مهل."],
  },
  {
    id: "middle-eastern",
    en: ["Middle-Eastern", "Mezze to share and bread from the oven."],
    ar: ["شرقي", "مقبلات للمشاركة وخبز طازج من الفرن."],
  },
  {
    id: "italian",
    en: ["Italian", "Fresh pasta and coffee done properly."],
    ar: ["إيطالي", "باستا طازجة وقهوة كما يجب."],
  },
] as const;

const SPACES = [
  { id: "indoor", en: "Indoor", ar: "الصالة الداخلية" },
  { id: "terrace", en: "Terrace", ar: "التراس" },
  { id: "shisha", en: "Shisha area", ar: "منطقة الشيشة" },
  { id: "corner", en: "Photo corner", ar: "ركن التصوير" },
] as const;

const PALETTE = [
  { name: "Navy", hex: "#262D3F" },
  { name: "Slate blue", hex: "#7E98AE" },
  { name: "Cocoa", hex: "#765F4D" },
  { name: "Sand", hex: "#DCD4CF" },
  { name: "Bronze", hex: "#B08D57" },
];

export default async function ArtDirection({ params }: PageProps<"/[locale]/art-direction">) {
  const { locale } = await params;
  if (!isLocale(locale) || !internalPagesEnabled()) notFound();
  setRequestLocale(locale);

  return (
    <main id="main" className="bg-bg relative overflow-x-clip">
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <PlaceholderBadge label="Internal · P2 art direction" />
        <LanguageSwitcher />
      </div>

      {/* C1 */}
      <SequencePlayer
        id="covy.hero"
        manifestUrl="/sequences/drafts/covy.hero/manifest.json"
        poster={{
          avif: "/sequences/drafts/covy.hero/poster.avif",
          webp: "/sequences/drafts/covy.hero/poster.webp",
          width: 960,
          height: 540,
        }}
        label={t(
          locale,
          "Walking through COVY's arched entrance to the blue tree",
          "الدخول من أقواس COVY حتى الشجرة الزرقاء",
        )}
        scrollVh={300}
      >
        <div
          className="flex h-full flex-col items-center justify-end bg-gradient-to-t from-[#262d3f]/70 via-transparent to-transparent pb-16 text-center text-white"
          style={{ opacity: "clamp(0, calc((var(--seq-progress, 0) - 0.82) * 8), 1)" }}
        >
          {/* Stand-in for the client's COVY logo SVG. */}
          <p
            aria-hidden="true"
            className="font-editorial flex items-center gap-3 text-7xl tracking-[0.12em] sm:text-9xl"
          >
            COVY <Star className="size-6 sm:size-8" />
          </p>
          <h1 className="font-display mt-4 text-base tracking-[0.3em] sm:text-lg">
            {t(locale, "The Taste of Everywhere", "طعم كل مكان")}
          </h1>
        </div>
      </SequencePlayer>
      <Note scene="C1 Through the arches · MAG draft v2 (two Kling 3.0 shots, 960×540 preview)">
        Starts on the client&apos;s facade render (COVY sign removed so the logo can sit on top as
        HTML), crosses the terrace passing the tree on the left, goes through the open doors and
        ends on their blue-tree render. Two 5-second shots joined at the doorway. The camera slows
        slightly at the door; the final evens out the pace. The logo and tagline fade in over the
        last frames.
      </Note>

      {/* C2 */}
      <Drift className="relative mx-auto max-w-7xl px-4 py-36 sm:px-8 sm:py-48">
        <CaladiumLeaf
          data-depth="1.4"
          className="absolute -start-10 top-10 w-40 opacity-90 sm:w-56"
        />
        <CaladiumLeaf
          data-depth="0.7"
          tone="cocoa"
          className="absolute end-4 bottom-8 w-28 rotate-[160deg] opacity-80 sm:w-40"
        />
        <CaladiumLeaf
          data-depth="1"
          className="absolute end-[22%] top-6 hidden w-24 rotate-45 opacity-60 md:block"
        />
        <Star data-twinkle className="text-accent absolute start-[30%] top-16 size-4" />
        <Star
          data-twinkle
          className="absolute end-[12%] top-[40%] size-6 text-[var(--covy-slate)]"
        />
        <Star data-twinkle className="text-accent absolute start-[18%] bottom-20 size-3" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-editorial text-fg text-4xl leading-[1.15] sm:text-6xl">
            {t(
              locale,
              "Where the timeless allure of the sea meets modern design.",
              "حيث يلتقي سحر البحر الخالد بالتصميم الحديث.",
            )}
          </p>
          <p className="text-muted mx-auto mt-8 max-w-xl text-lg leading-relaxed">
            {t(
              locale,
              "Minimal forms, surreal details and the blue of the sea, in a restaurant and café made for long mornings and late evenings.",
              "خطوط بسيطة وتفاصيل حالمة وزرقة البحر، في مطعم وكافيه صُمم للصباحات الطويلة والسهرات الهادئة.",
            )}
          </p>
        </div>
      </Drift>
      <Note scene="C2 Our story · motion">
        Caladium leaves (drawn in SVG from the guide&apos;s duotone style) drift at three depths as
        you scroll; the four-point stars twinkle. Slow sine easing: COVY floats, it never snaps.
      </Note>

      {/* C3 */}
      <SequencePlayer
        id="covy.signature"
        manifestUrl="/sequences/drafts/covy.signature/manifest.json"
        poster={{
          avif: "/sequences/drafts/covy.signature/poster.avif",
          webp: "/sequences/drafts/covy.signature/poster.webp",
          width: 960,
          height: 540,
        }}
        label={t(
          locale,
          "COVY's signature iced coffee being built in a glass",
          "تحضير قهوة COVY المثلجة المميزة في الكوب",
        )}
        scrollVh={280}
      >
        <div className="relative mx-auto h-full max-w-5xl">
          {HOTSPOTS.map((h) => (
            <p
              key={h.en}
              className={`absolute flex items-center gap-3 text-white ${h.side === "start" ? "end-[56%] flex-row" : "start-[56%] flex-row-reverse"}`}
              style={{ top: h.top, ...hotspot(h.at) }}
            >
              <span className="font-display text-sm tracking-[0.2em] whitespace-nowrap sm:text-base">
                {h[locale]}
              </span>
              <span aria-hidden="true" className="h-px w-10 bg-white/70 sm:w-20" />
              <Star className="size-3 shrink-0" />
            </p>
          ))}
        </div>
      </SequencePlayer>
      <Note scene="C3 The signature cup · MAG draft (Kling 3.0, 960×540 preview)">
        Milk, then espresso ribbons, then the foam cap, scrubbed by scroll in both directions. The
        labels are HTML that appear at their stops; nothing is baked into the frames. Working well;
        the final adds the ✦ sparkle on the foam.
      </Note>

      <Cuisines
        heading={t(locale, "The Taste of Everywhere", "طعم كل مكان")}
        stops={CUISINES.map((c) => ({
          id: c.id,
          name: c[locale][0],
          line: c[locale][1],
          image: (
            <ImageSlot {...imageSlot(`covy.cuisines.${c.id}`)} locale={locale} sizes="22rem" />
          ),
        }))}
      />
      <Note scene="C4 The Taste of Everywhere · real-time 3D + motion">
        A ring of caladium leaves, generated in a shader (pale blade, blue veins, a few cocoa
        leaves), turns as you scroll through five kitchens. Each stop swaps a dish still (designer
        slot) and one line. The cuisine list follows the storyboard; the copy is ours until the
        client confirms the menu.
      </Note>

      {/* C6 */}
      <section className="mx-auto max-w-7xl px-4 py-32 sm:px-8">
        <h2 className="font-editorial text-fg mb-12 text-5xl sm:text-6xl">
          {t(locale, "Our spaces", "أماكننا")}
        </h2>
        <ArchGallery
          items={SPACES.map((s) => ({
            id: s.id,
            label: s[locale],
            image: (
              <ImageSlot
                {...imageSlot(`covy.spaces.${s.id}`)}
                locale={locale}
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
            ),
          }))}
        />
      </section>
      <Note scene="C6 Spaces · motion">
        Every photo sits in the facade&apos;s arch shape and opens from a narrow slit as it scrolls
        in. Photos are designer slots (placeholders shown).
      </Note>

      {/* Specimen */}
      <section
        lang="en"
        dir="ltr"
        className="mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-8 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-muted text-sm">Type</h2>
          <p className="font-editorial text-fg text-6xl leading-none">Marcellus</p>
          <p className="font-display text-fg text-xl tracking-[0.25em]">
            TENOR SANS FOR SMALL TITLES
          </p>
          <p className="text-fg text-lg leading-relaxed">
            Outfit for reading text: light, open and easy at small sizes.
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="text-fg text-4xl"
            style={{ fontFamily: "var(--font-el-messiri)" }}
          >
            طعم كل مكان
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="text-fg text-lg"
            style={{ fontFamily: "var(--font-readex)" }}
          >
            Readex Pro للنصوص، مع أرقام غربية 0123456789.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-muted text-sm">Colour</h2>
          <ul className="grid grid-cols-2 gap-3">
            {PALETTE.map((c) => (
              <li
                key={c.hex}
                className="border-line rounded-card flex flex-col overflow-hidden border"
              >
                <span className="h-20" style={{ background: c.hex }} />
                <span className="text-fg px-3 pt-2 text-sm">{c.name}</span>
                <code className="text-muted px-3 pb-2 text-xs">{c.hex}</code>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-muted text-sm">Motifs</h2>
          <div className="grid grid-cols-3 items-center gap-4">
            <CaladiumLeaf className="w-full" />
            <CaladiumLeaf tone="cocoa" className="w-full" />
            <Star className="text-accent mx-auto size-12" />
          </div>
          <div className="rounded-card overflow-hidden">
            <Terrazzo className="h-40 w-full" />
          </div>
          <p className="text-muted text-sm">
            Caladium leaves, the four-point star and the terrazzo floor, all drawn in code.
          </p>
        </div>
      </section>
    </main>
  );
}
