"use client";

import { useMotion, useMotionEffect } from "@mas/motion/provider";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type GalleryPhoto = { src: string; alt: string; width: number; height: number };
export type GallerySpace = { id: string; name: string; line: string; photos: GalleryPhoto[] };
export type GalleryLabels = {
  index: string;
  viewer: string;
  close: string;
  next: string;
  previous: string;
  /** "{alt}" is replaced. */
  open: string;
  /** "{n}" and "{total}" are replaced. */
  count: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * C6: the rooms behind the arches. A sticky index of the four spaces tracks the one in view; each space is a
 * large arch photo with two smaller ones offset beside it, and every photo opens a full-screen viewer that
 * steps through all of them (arrow keys, swipe, Esc). Without JavaScript the photos are simply all there.
 */
export function SpacesGallery({
  spaces,
  labels,
  dir,
}: {
  spaces: GallerySpace[];
  labels: GalleryLabels;
  dir: "ltr" | "rtl";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const swipeRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const { getLenis } = useMotion();

  const all = spaces.flatMap((s) =>
    s.photos.map((p, i) => ({ ...p, space: s.name, n: i + 1, of: s.photos.length })),
  );
  const firstOf = spaces.map((_, k) =>
    spaces.slice(0, k).reduce((sum, s) => sum + s.photos.length, 0),
  );

  // Which space is in the middle band of the screen. Plain IntersectionObserver: it drives the index, so it
  // also runs under reduced motion.
  useEffect(() => {
    const items = rootRef.current?.querySelectorAll<HTMLElement>("[data-space]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.space));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Each large photo opens from a slit in the facade's arch; the two smaller ones drift at a second depth.
  useMotionEffect(
    ({ gsap }) => {
      gsap.utils.toArray<HTMLElement>(".space-arch").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(45% 30% 0% 30% round 999px 999px 0 0)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)",
            ease: "sine.inOut",
            scrollTrigger: { trigger: el, start: "top 90%", end: "top 35%", scrub: 1 },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>(".space-drift").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 12 },
          {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-space]"),
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    [],
    { scope: rootRef },
  );

  const show = (i: number, from: HTMLElement) => {
    openerRef.current = from;
    setOpen(i);
    // showModal() makes the page behind inert and moves focus to the first control (Close).
    dialogRef.current?.showModal();
    getLenis()?.stop();
    document.documentElement.style.setProperty("overflow", "hidden");
  };
  const onClose = () => {
    setOpen(null);
    getLenis()?.start();
    document.documentElement.style.removeProperty("overflow");
    openerRef.current?.focus();
  };
  const step = (by: number) =>
    setOpen((i) => (i === null ? i : (i + by + all.length) % all.length));

  const onKey = (e: React.KeyboardEvent) => {
    // Arrows follow reading direction: "forward" is left in Arabic.
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (e.key === forward) step(1);
    else if (e.key === back) step(-1);
    else return;
    e.preventDefault();
  };
  const onPointerDown = (e: ReactPointerEvent) => {
    swipeRef.current = e.clientX;
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    if (swipeRef.current === null) return;
    const dx = e.clientX - swipeRef.current;
    swipeRef.current = null;
    if (Math.abs(dx) < 50) return;
    // Swiping toward the start of the line goes forward.
    step(dx < 0 === (dir === "ltr") ? 1 : -1);
  };

  const current = open === null ? null : all[open];

  const photoButton = (photo: GalleryPhoto, i: number, sizes: string, className = "") => (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={labels.open.replace("{alt}", photo.alt)}
      onClick={(e) => show(i, e.currentTarget)}
      className={`group focus-visible:outline-accent relative block w-full cursor-zoom-in overflow-hidden outline-offset-4 focus-visible:outline-2 ${className}`}
    >
      <Image
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        sizes={sizes}
        className="h-auto w-full transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
      />
    </button>
  );

  return (
    <div ref={rootRef} className="lg:grid lg:grid-cols-12 lg:gap-12">
      {/* The index: a pinned column on wide screens, a pinned row of tabs on phones. */}
      <nav
        aria-label={labels.index}
        className="bg-bg/90 sticky top-16 z-10 -mx-4 mb-8 px-4 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:top-28 lg:col-span-4 lg:mx-0 lg:mb-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
      >
        <p
          aria-hidden="true"
          className="font-editorial text-accent hidden text-8xl leading-none tabular-nums lg:block"
        >
          {pad(active + 1)}
          <span className="text-muted text-2xl"> / {pad(spaces.length)}</span>
        </p>
        <ol className="flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col lg:gap-6 lg:overflow-visible">
          {spaces.map((s, k) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#space-${s.id}`}
                aria-current={active === k ? "location" : undefined}
                className="group focus-visible:outline-accent aria-[current=location]:border-fg aria-[current=location]:bg-fg aria-[current=location]:text-bg border-line text-fg lg:aria-[current=location]:text-fg block rounded-full border px-4 py-2 text-sm whitespace-nowrap outline-offset-4 transition-colors focus-visible:outline-2 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:text-base lg:aria-[current=location]:bg-transparent"
              >
                <span className="text-muted me-3 hidden text-xs tabular-nums lg:inline">
                  {pad(k + 1)}
                </span>
                <span className="lg:font-editorial lg:text-3xl lg:opacity-40 lg:transition-opacity lg:group-hover:opacity-80 lg:group-aria-[current=location]:opacity-100">
                  {s.name}
                </span>
                <span className="text-muted mt-2 hidden max-w-xs text-sm leading-relaxed lg:group-aria-[current=location]:block">
                  {s.line}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-24 lg:col-span-8 lg:gap-40">
        {spaces.map((s, k) => {
          const [main, ...rest] = s.photos;
          return (
            <article
              key={s.id}
              id={`space-${s.id}`}
              data-space={k}
              aria-labelledby={`space-${s.id}-title`}
              className="scroll-mt-32"
            >
              {/* On wide screens the name and line live in the index column. */}
              <header className="mb-6 lg:mb-0">
                <h3
                  id={`space-${s.id}-title`}
                  className="font-editorial text-fg text-3xl lg:sr-only"
                >
                  {s.name}
                </h3>
                <p className="text-muted mt-2 leading-relaxed lg:hidden">{s.line}</p>
              </header>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-12 lg:items-start">
                {main ? (
                  <div className="space-arch col-span-2 overflow-hidden rounded-t-full lg:col-span-7">
                    {photoButton(main, firstOf[k] ?? 0, "(min-width: 1024px) 38vw, 100vw")}
                  </div>
                ) : null}
                <div
                  className={`space-drift col-span-2 grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-5 lg:grid-cols-1 ${k % 2 ? "lg:mt-10" : "lg:mt-32"}`}
                >
                  {rest.map((p, j) => (
                    <div
                      key={p.src}
                      className={`overflow-hidden rounded-t-[40%_30%] ${j === 1 ? "lg:ms-16" : "lg:me-16"}`}
                    >
                      {photoButton(p, (firstOf[k] ?? 0) + j + 1, "(min-width: 1024px) 22vw, 50vw")}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={labels.viewer}
        onClose={onClose}
        onKeyDown={onKey}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#11141c] p-0 text-[var(--covy-sand)] backdrop:bg-transparent"
      >
        {current ? (
          <div
            className="flex h-full flex-col"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-8">
              <p aria-live="polite" className="text-sm">
                <span className="font-display tracking-[0.2em] uppercase">{current.space}</span>
                <span className="opacity-70">
                  {" · "}
                  {labels.count
                    .replace("{n}", String(current.n))
                    .replace("{total}", String(current.of))}
                </span>
              </p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={labels.close}
                className="focus-visible:outline-accent inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-2"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <figure className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-6 sm:px-20">
              <div className="relative min-h-0 w-full flex-1">
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  fill
                  loading="eager"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="max-w-xl text-center text-sm opacity-80">
                {current.alt}
              </figcaption>
              {(["previous", "next"] as const).map((which) => (
                <button
                  key={which}
                  type="button"
                  onClick={() => step(which === "next" ? 1 : -1)}
                  aria-label={labels[which]}
                  className={`focus-visible:outline-accent absolute top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-current/30 focus-visible:outline-2 sm:inline-flex ${which === "next" ? "end-4 sm:end-6" : "start-4 sm:start-6"}`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className={`size-5 ${(which === "next") !== (dir === "ltr") ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                  >
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </figure>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
