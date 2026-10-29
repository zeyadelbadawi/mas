import { imageSlot, sequenceSlot } from "@mas/content";
import { FeedbackForm } from "@mas/forms/feedback-form";
import { ReservationForm } from "@mas/forms/reservation-form";
import { locations } from "@mas/content";
import { isLocale, pick } from "@mas/i18n";
import { SequencePlayer } from "@mas/motion/sequence-player";
import { SequenceSlot } from "@mas/motion/sequence-slot";
import { SplitReveal } from "@mas/motion/split-reveal";
import { Button, ImageSlot, PlaceholderBadge, SlotBox } from "@mas/ui";
import { LanguageSwitcher } from "@mas/ui/language-switcher";
import type { Metadata } from "next";
import { internalPagesEnabled } from "@mas/seo";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { DemoSceneLoader } from "@/components/demo-scene-loader";
import { brand, privacyHref } from "@/site";

// Internal review page for the P1 gate: every building block in this brand's theme.
// It switches off at launch (SITE_INDEXABLE=true).
export const metadata: Metadata = {
  title: "Kitchen sink",
  robots: { index: false, follow: false },
};

const TOKENS = [
  "bg",
  "fg",
  "muted",
  "surface",
  "surface-2",
  "line",
  "accent",
  "accent-fg",
  "focus",
  "danger",
  "success",
  "slot",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-line flex flex-col gap-6 border-t py-12">
      <h2 className="text-muted font-mono text-xs tracking-widest uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default async function KitchenSink({ params }: PageProps<"/[locale]/kitchen-sink">) {
  const { locale } = await params;
  if (!isLocale(locale) || !internalPagesEnabled()) notFound();
  setRequestLocale(locale);
  const seq = sequenceSlot("covy.hero");
  const ar = locale === "ar";

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 py-10">
        <div className="flex flex-col gap-2">
          <PlaceholderBadge label="Internal · P1 review" className="self-start" />
          <h1 className="font-display text-fg text-5xl">{brand.name[locale]} kitchen sink</h1>
        </div>
        <LanguageSwitcher />
      </header>

      <Section title="Colour tokens">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {TOKENS.map((token) => (
            <div key={token} className="flex flex-col gap-2">
              <div
                className="border-line rounded-card h-16 border"
                style={{ background: `var(--brand-${token})` }}
              />
              <code className="text-muted text-xs">{token}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <p className="font-display text-fg text-6xl">
          {ar ? "طعم كل مكان" : "The Taste of Everywhere"}
        </p>
        <p className="font-editorial text-fg text-3xl">{pick(brand.tagline, locale)}</p>
        <p className="text-fg max-w-prose text-lg leading-relaxed">
          {ar
            ? "هذا نص تجريبي لقياس القراءة في الفقرات الطويلة. الأرقام تظهر بالشكل الغربي: 0123456789، والأسعار مثل 1,250 ج.م."
            : "This is sample body copy to check reading comfort in longer paragraphs. Digits stay Western: 0123456789, and prices look like EGP 1,250."}
        </p>
        <SplitReveal className="font-display text-fg text-4xl">
          {ar ? "تظهر الكلمات واحدة تلو الأخرى" : "Words reveal one by one"}
        </SplitReveal>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Image slots">
        <div className="grid gap-4 md:grid-cols-3">
          <ImageSlot
            {...imageSlot("covy.spaces.indoor")}
            locale={locale}
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <ImageSlot
            {...imageSlot("covy.cuisines.mediterranean")}
            locale={locale}
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <ImageSlot
            {...imageSlot("covy.og")}
            locale={locale}
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
      </Section>

      <Section title="Sequence slot (placeholder until the MAG render)">
        <SequenceSlot
          id={seq.id}
          frameCount={seq.frameCount}
          desktop={seq.desktop}
          mobile={seq.mobile}
          label={pick(seq.label, locale)}
        />
      </Section>

      <Section title="Sequence player (procedural test frames)">
        <SequencePlayer
          id="test.sequence"
          manifestUrl="/sequences/test/manifest.json"
          poster={{
            avif: "/sequences/test/poster.avif",
            webp: "/sequences/test/poster.webp",
            width: 960,
            height: 540,
          }}
          label="Test sequence: each frame shows its number"
          scrollVh={200}
        >
          <p className="font-display text-5xl text-white drop-shadow">
            {ar ? "مرّر للأسفل" : "Scroll"}
          </p>
        </SequencePlayer>
      </Section>

      <Section title="Real-time 3D (loaded after first paint)">
        <DemoSceneLoader
          label="Test scene: a rotating icosahedron"
          poster={
            <SlotBox
              slotId="demo.poster"
              kind="image"
              width={1920}
              height={1080}
              label="3D poster"
              lines={["Poster fallback", "demo.poster"]}
            />
          }
        />
      </Section>

      <Section title="Reservation form">
        <ReservationForm
          location={locations.covy}
          privacyHref={privacyHref(locale)}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          turnstileTheme="light"
        />
      </Section>
      <Section title="Feedback form">
        <FeedbackForm
          privacyHref={privacyHref(locale)}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          turnstileTheme="light"
        />
      </Section>
    </main>
  );
}
