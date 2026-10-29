import type { Location } from "@mas/content";
import { cairoNow, toHHMM, toMinutes, weekdayOf } from "./time";

/** Minimum notice for a same-day booking. */
export const SAME_DAY_LEAD_MINUTES = 60;

/**
 * Bookable start times for a business day. Venues that close after midnight (closes < opens)
 * keep their late slots on the same business day, e.g. "00:30" on Friday means Saturday 00:30.
 */
export function timeSlots(
  location: Pick<Location, "hours" | "slotMinutes" | "lastBookingBeforeCloseMinutes">,
  date: string,
  now: Date = new Date(),
): string[] {
  const day = location.hours.find((h) => h.weekday === weekdayOf(date));
  if (!day) return [];
  const opens = toMinutes(day.opens);
  let closes = toMinutes(day.closes);
  if (closes <= opens) closes += 24 * 60;
  const last = closes - location.lastBookingBeforeCloseMinutes;

  const { date: today, minutes: nowMinutes } = cairoNow(now);
  const earliest = date === today ? nowMinutes + SAME_DAY_LEAD_MINUTES : -Infinity;

  const out: string[] = [];
  for (let t = opens; t <= last; t += location.slotMinutes) {
    if (t >= earliest) out.push(toHHMM(t));
  }
  return out;
}

/** True when a slot falls after midnight on the following calendar day. */
export function isAfterMidnight(
  location: Pick<Location, "hours">,
  date: string,
  time: string,
): boolean {
  const day = location.hours.find((h) => h.weekday === weekdayOf(date));
  return Boolean(day && toMinutes(time) < toMinutes(day.opens));
}
