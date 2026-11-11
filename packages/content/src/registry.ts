import { events } from "./events";
import { aromaMenu } from "./menus/aroma";
import { covyMenu } from "./menus/covy";
import {
  eventSlots,
  menuSlots,
  slots,
  type ImageSlotSpec,
  type SequenceSlotSpec,
  type SlotSpec,
} from "./slots";

/** Every slot: the hand-listed ones plus those derived from menus and events. tools/assets builds the same list. */
export const allSlots: SlotSpec[] = [
  ...slots,
  ...menuSlots(covyMenu),
  ...menuSlots(aromaMenu),
  ...eventSlots(events),
];

/** Image slot props for <ImageSlot {...imageSlot("covy.spaces.indoor")} locale={locale} />. */
export function imageSlot(
  id: string,
): Pick<ImageSlotSpec, "id" | "width" | "height" | "alt" | "src"> {
  const s = allSlots.find((x) => x.id === id);
  if (!s || s.kind !== "image")
    throw new Error(`Unknown image slot "${id}": add it to packages/content/src/slots.ts`);
  return {
    id: s.id,
    width: s.width,
    height: s.height,
    alt: s.alt,
    ...(s.src ? { src: s.src } : {}),
  };
}

export function sequenceSlot(id: string): SequenceSlotSpec {
  const s = allSlots.find((x) => x.id === id);
  if (!s || s.kind !== "sequence")
    throw new Error(`Unknown sequence slot "${id}": add it to packages/content/src/slots.ts`);
  return s;
}
