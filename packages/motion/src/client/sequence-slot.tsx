"use client";

import { SlotBox } from "@mas/ui";
import { SequencePlayer, type SequencePlayerProps } from "./sequence-player";

type Size = { width: number; height: number };

export type SequenceSlotProps = Omit<SequencePlayerProps, "manifestUrl" | "poster"> & {
  frameCount: number;
  desktop: Size;
  mobile: Size;
  /** Set once the MAG pipeline has produced the sequence. Until then the placeholder box renders. */
  manifestUrl?: string;
  poster?: SequencePlayerProps["poster"];
};

/** Placeholder for a scroll sequence until its frames exist (CLAUDE.md rules 3–4). */
export function SequenceSlot({
  id,
  frameCount,
  desktop,
  mobile,
  manifestUrl,
  poster,
  label,
  ...rest
}: SequenceSlotProps) {
  if (manifestUrl && poster) {
    return (
      <SequencePlayer id={id} manifestUrl={manifestUrl} poster={poster} label={label} {...rest} />
    );
  }
  return (
    <SlotBox
      slotId={id}
      kind="sequence"
      width={desktop.width}
      height={desktop.height}
      label={label}
      lines={[
        `Sequence · ${frameCount} frames`,
        `${desktop.width}×${desktop.height} (desktop) / ${mobile.width}×${mobile.height} (mobile)`,
        id,
      ]}
    />
  );
}
