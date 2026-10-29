import { masServices } from "@mas/content";
import { isLocale, pick, type Locale } from "@mas/i18n";
import { SequencePlayer } from "@mas/motion/sequence-player";
import { SplitReveal } from "@mas/motion/split-reveal";
import { PlaceholderBadge } from "@mas/ui";
import { LanguageSwitcher } from "@mas/ui/language-switcher";
import type { Metadata } from "next";
import { internalPagesEnabled } from "@mas/seo";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { NineFacetsSection } from "@/components/board/facets";
import { MasHero } from "@/components/board/hero";
import { ScopeLine } from "@/components/board/scope-line";

// P2 art-direction board: how the MAS home will look and move, scene by scene (docs/03 §4.1).
// Internal review page; switches off at launch (SITE_INDEXABLE=true).
export const metadata: Metadata = {
  title: "Art direction",
  robots: { index: false, follow: false },
};

const t = (locale: Locale, en: string, ar: string) => (locale === "ar" ? ar : en);

/** Reviewer notes between scenes. English only: they're for the owner, not visitors. */
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

const SCOPE = [
  {
    en: ["Strategy", "Concept, market study and a business plan you can act on."],
    ar: ["الاستراتيجية", "الفكرة ودراسة السوق وخطة عمل قابلة للتنفيذ."],
  },
  {
    en: ["Marketing", "Brand, launch and the campaigns that bring guests in."],
    ar: ["التسويق", "البراند والإطلاق والحملات التي تجذب الضيوف."],
  },
  {
    en: ["Recruitment", "The right team, hired for the concept."],
    ar: ["التوظيف", "الفريق المناسب، مختار على مقاس الفكرة."],
  },
  {
    en: ["Training", "Service standards your staff can repeat every day."],
    ar: ["التدريب", "معايير خدمة يستطيع فريقك تكرارها كل يوم."],
  },
  {
    en: ["Guest experience", "We measure each visit and refine what guests notice."],
    ar: ["تجربة الضيف", "نقيس كل زيارة ونطوّر ما يلاحظه الضيف."],
  },
] as const;

const PALETTE = [
  { name: "Obsidian Black", hex: "#0B0B0C" },
  { name: "Deep Crimson", hex: "#C21F30" },
  { name: "Warm Ivory", hex: "#F3EFE7" },
  { name: "Graphite", hex: "#28282A" },
];

export default async function ArtDirection({ params }: PageProps<"/[locale]/art-direction">) {
  const { locale } = await params;
  if (!isLocale(locale) || !internalPagesEnabled()) notFound();
  setRequestLocale(locale);
  const ar = locale === "ar";

  const services = [...masServices]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      slug: s.slug,
      number: String(s.order).padStart(2, "0"),
      title: pick(s.title, locale),
      summary: pick(s.summary, locale),
    }));

  return (
    <main id="main" className="bg-bg relative">
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <PlaceholderBadge label="Internal · P2 art direction" />
        <LanguageSwitcher />
      </div>

      <MasHero
        wordmark="MAS"
        dir={ar ? "rtl" : "ltr"}
        line={t(
          locale,
          "Supporting business owners to achieve their goals.",
          "ندعم أصحاب المشاريع لتحقيق أهدافهم.",
        )}
      />
      <Note scene="M1 Obsidian field · real-time 3D">
        A faceted obsidian surface, procedural, no image files. The crimson light crosses on its
        own; the cursor tilts the facets slightly and scrolling pushes the camera in. The large MAS
        is a stand-in for the client&apos;s wordmark SVG. Low-power devices and reduced motion get
        the still poster.
      </Note>

      {/* M2 */}
      <section className="mx-auto max-w-7xl px-4 py-32 sm:px-8 sm:py-44">
        <SplitReveal
          as="p"
          className="font-display text-fg max-w-5xl text-6xl leading-[0.95] sm:text-8xl"
        >
          {ar ? (
            <>
              <span className="text-accent">ندعم</span> أصحاب المشاريع من الفكرة الأولى حتى صالة
              ممتلئة بالضيوف.
            </>
          ) : (
            <>
              <span className="text-accent">Supporting</span> business owners from the first idea to
              a full dining room.
            </>
          )}
        </SplitReveal>
        <p className="text-muted mt-10 max-w-xl text-lg leading-relaxed">
          {t(
            locale,
            "MAS plans, opens and runs restaurants and cafés with their owners: concept and menu costing, recruitment and training, operations and marketing.",
            "تخطط MAS للمطاعم والكافيهات وتفتتحها وتديرها مع أصحابها: الفكرة وتسعير المنيو، والتوظيف والتدريب، والتشغيل والتسويق.",
          )}
        </p>
      </section>
      <Note scene="M2 Vision · motion">
        Words rise into place once, as the statement enters. &quot;Supporting&quot; is crimson
        because the storyboard asks for it; nothing else on the page gets a highlighted word.
      </Note>

      <NineFacetsSection
        heading={t(locale, "Nine ways we work with you", "تسع طرق نعمل بها معك")}
        services={services}
      />
      <Note scene="M3 Nine facets · real-time 3D + motion">
        Pinned for nine scroll steps. The crystal turns the active facet toward you and lights it
        crimson while the list marks the service being read. Numbers are used because MAS presents
        its services as a numbered set. Keyboard and reduced-motion users get the same list with
        every summary open.
      </Note>

      {/* M4 */}
      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-32 sm:px-8 md:grid-cols-[1fr_1.2fr]">
        <h2 className="font-display text-fg text-6xl leading-none sm:text-7xl">
          {t(locale, "From idea to operations", "من الفكرة إلى التشغيل")}
        </h2>
        <ScopeLine steps={SCOPE.map((s) => ({ title: s[locale][0], line: s[locale][1] }))} />
      </section>
      <Note scene="M4 Scope of support · motion">
        One crimson rule draws downward with the scroll and each stage brightens when the line
        reaches it. Reverses when scrolling back up.
      </Note>

      {/* M5 */}
      <section className="py-10">
        <SequencePlayer
          id="mas.portal"
          manifestUrl="/sequences/drafts/mas.portal/manifest.json"
          poster={{
            avif: "/sequences/drafts/mas.portal/poster.avif",
            webp: "/sequences/drafts/mas.portal/poster.webp",
            width: 960,
            height: 540,
          }}
          label={t(
            locale,
            "A dark stone corridor opening onto two arches",
            "ممر حجري داكن ينفتح على قوسين",
          )}
          scrollVh={250}
        >
          <div className="mx-auto grid h-full max-w-5xl grid-cols-2 items-end gap-4 px-4 pb-10 sm:px-8">
            <a
              href="https://covy.mas.com"
              className="bg-bg/70 border-line hover:border-fg block border p-5 backdrop-blur"
            >
              <span className="font-display text-fg block text-4xl">COVY</span>
              <span className="text-muted text-sm">
                {t(locale, "Restaurant & café · Cairo", "مطعم وكافيه · القاهرة")}
              </span>
            </a>
            <a
              href="https://aroma.mas.com"
              className="bg-bg/70 border-line hover:border-fg block border p-5 backdrop-blur"
            >
              <span className="font-display text-fg block text-4xl">
                {t(locale, "Aroma Lounge", "أروما لاونج")}
              </span>
              <span className="text-muted text-sm">
                {t(locale, "Lounge · City Stars", "لاونج · سيتي ستارز")}
              </span>
            </a>
          </div>
        </SequencePlayer>
      </section>
      <Note scene="M5 Two doors · MAG draft (Kling 3.0, 960×540 preview)">
        Scroll scrubs the corridor forward and back. Blue light on the left for COVY, gold on the
        right for Aroma Lounge. The brand cards are HTML on top of the frames and will link to the
        subdomains. The final will be rendered at 1080p once you approve the motion.
      </Note>

      {/* Specimen */}
      <section
        lang="en"
        dir="ltr"
        className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-8 md:grid-cols-2"
      >
        <div className="flex flex-col gap-5">
          <h2 className="text-muted text-sm">Type</h2>
          <p className="font-display text-fg text-8xl leading-none">Bebas Neue</p>
          <p className="text-fg text-xl">
            Inter for reading text, set at 18–20 px with generous leading.
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="text-fg text-5xl font-bold"
            style={{ fontFamily: "var(--font-cairo)" }}
          >
            القاهرة · كايرو
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="text-fg text-xl"
            style={{ fontFamily: "var(--font-plex-arabic)" }}
          >
            IBM Plex Sans Arabic للنصوص الطويلة، مع أرقام غربية 0123456789.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-muted text-sm">Colour</h2>
          <ul className="grid grid-cols-2 gap-3">
            {PALETTE.map((c) => (
              <li key={c.hex} className="border-line flex flex-col border">
                <span className="h-24" style={{ background: c.hex }} />
                <span className="text-fg px-3 pt-2 text-sm">{c.name}</span>
                <code className="text-muted px-3 pb-2 text-xs">{c.hex}</code>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
