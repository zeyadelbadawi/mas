import Image from "next/image";
import type { LocalizedText } from "@mas/i18n";
import { aspectLabel, SlotBox } from "./slot-box";
import { cn } from "./cn";

export type ImageSlotProps = {
  /** Stable ID used in docs/assets/asset-manifest.md, e.g. "covy.menu.mezze.hero". */
  id: string;
  /** Delivery size in px (2× the largest rendered size). Comes from the slot registry in @mas/content. */
  width: number;
  height: number;
  alt: LocalizedText;
  locale: "en" | "ar";
  /** Set once the designer delivers the asset. Until then the placeholder box renders. */
  src?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function ImageSlot({
  id,
  width,
  height,
  alt,
  locale,
  src,
  sizes = "100vw",
  priority,
  className,
}: ImageSlotProps) {
  const altText = alt[locale];
  if (src) {
    return (
      <Image
        src={src}
        width={width}
        height={height}
        alt={altText}
        sizes={sizes}
        priority={priority ?? false}
        className={cn("h-auto w-full", className)}
      />
    );
  }
  const ratio = aspectLabel(width, height);
  return (
    <SlotBox
      slotId={id}
      kind="image"
      width={width}
      height={height}
      className={className}
      label={`${altText} (${width} × ${height})`}
      lines={[`${width} × ${height} px · ${ratio}`, id, alt.en]}
    />
  );
}
