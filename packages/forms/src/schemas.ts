import { z } from "zod";
import type { Location } from "@mas/content";
import { normalisePhone } from "./phone";
import { timeSlots } from "./slots";
import { cairoNow, DATE_RE, daysBetween, TIME_RE } from "./time";

/**
 * Shared client/server schemas. Issue messages are i18n keys under `forms.errors.*`
 * (the client translates them; the server only returns the key).
 */

export const reservationTypes = [
  "table",
  "birthday",
  "private",
  "corporate",
  "buyout",
  "shisha",
] as const;
export type ReservationType = (typeof reservationTypes)[number];
export const eventTypes: readonly ReservationType[] = [
  "birthday",
  "private",
  "corporate",
  "buyout",
];
export const seatings = ["indoor", "outdoor", "any"] as const;
export const localeEnum = z.enum(["en", "ar"]);

export const LIMITS = {
  name: { min: 2, max: 80 },
  notes: { max: 1000 },
  occasion: { max: 1000 },
  comments: { min: 10, max: 2000 },
  message: { min: 20, max: 3000 },
  short: { max: 120 },
  eventMinGuests: 2,
} as const;

const required = (s: z.ZodString) => s.trim().min(1, "required");
const name = required(z.string()).min(LIMITS.name.min, "tooShort").max(LIMITS.name.max, "tooLong");
const email = z.email("email").max(254, "tooLong");
const phone = required(z.string()).transform((v, ctx) => {
  const e164 = normalisePhone(v);
  if (!e164) {
    ctx.addIssue({ code: "custom", message: "phone" });
    return z.NEVER;
  }
  return e164;
});
const optionalText = (max: number) => z.string().trim().max(max, "tooLong").optional().default("");
const consent = z.literal(true, { error: "consent" });

type ReservationContext = {
  location: Pick<
    Location,
    | "hours"
    | "slotMinutes"
    | "lastBookingBeforeCloseMinutes"
    | "maxTableGuests"
    | "maxEventGuests"
    | "bookingWindowDays"
  >;
  now?: Date;
};

export function reservationSchema({ location, now = new Date() }: ReservationContext) {
  return z
    .object({
      type: z.enum(reservationTypes, { error: "required" }),
      date: z.string().regex(DATE_RE, "required"),
      time: z.string().regex(TIME_RE, "time"),
      guests: z.coerce.number({ error: "guests" }).int("guests").min(1, "guests"),
      seating: z.enum(seatings, { error: "required" }),
      fullName: name,
      phone,
      email,
      occasionDetails: optionalText(LIMITS.occasion.max),
      notes: optionalText(LIMITS.notes.max),
      eventId: z.string().max(64).optional(),
      locale: localeEnum,
      consent,
    })
    .superRefine((v, ctx) => {
      for (const issue of reservationRuleIssues(v, location, now))
        ctx.addIssue({ code: "custom", ...issue });
    });
}

/**
 * Cross-field booking rules (date window, slot, party size). Exported so the client can check
 * step 1 on its own: object-level refinements don't run while later steps are still empty.
 */
export function reservationRuleIssues(
  v: { type: ReservationType; date: string; time: string; guests: number },
  location: ReservationContext["location"],
  now: Date = new Date(),
): { path: [string]; message: string }[] {
  const issues: { path: [string]; message: string }[] = [];
  const ahead = daysBetween(cairoNow(now).date, v.date);
  if (ahead < 0) issues.push({ path: ["date"], message: "pastDate" });
  else if (ahead > location.bookingWindowDays)
    issues.push({ path: ["date"], message: "outOfWindow" });
  else if (!timeSlots(location, v.date, now).includes(v.time))
    issues.push({ path: ["time"], message: "time" });

  const { min, max } = guestRange(v.type, location);
  if (v.guests < min || v.guests > max) issues.push({ path: ["guests"], message: "guests" });
  return issues;
}

export function guestRange(
  type: ReservationType,
  location: Pick<Location, "maxTableGuests" | "maxEventGuests">,
) {
  const isEvent = eventTypes.includes(type);
  return {
    min: isEvent ? LIMITS.eventMinGuests : 1,
    max: isEvent ? location.maxEventGuests : location.maxTableGuests,
  };
}

export type ReservationInput = z.input<ReturnType<typeof reservationSchema>>;
export type Reservation = z.output<ReturnType<typeof reservationSchema>>;

const rating = z.coerce.number({ error: "rating" }).int("rating").min(1, "rating").max(5, "rating");

export function feedbackSchema({ now = new Date() }: { now?: Date } = {}) {
  return z
    .object({
      overall: rating,
      food: rating.optional(),
      service: rating.optional(),
      ambience: rating.optional(),
      visitDate: z.string().regex(DATE_RE, "required").optional().or(z.literal("")),
      comments: required(z.string())
        .min(LIMITS.comments.min, "tooShort")
        .max(LIMITS.comments.max, "tooLong"),
      contactMe: z.boolean().default(false),
      name: optionalText(LIMITS.name.max),
      email: z
        .union([email, z.literal("")])
        .optional()
        .default(""),
      phone: z.string().trim().optional().default(""),
      locale: localeEnum,
      consent,
    })
    .superRefine((v, ctx) => {
      if (v.visitDate && daysBetween(cairoNow(now).date, v.visitDate) > 0) {
        ctx.addIssue({ code: "custom", path: ["visitDate"], message: "pastDate" });
      }
      if (v.phone && !normalisePhone(v.phone))
        ctx.addIssue({ code: "custom", path: ["phone"], message: "phone" });
      if (v.contactMe && !v.email && !v.phone)
        ctx.addIssue({ code: "custom", path: ["email"], message: "required" });
    })
    .transform((v) => ({ ...v, phone: v.phone ? (normalisePhone(v.phone) ?? "") : "" }));
}

export type FeedbackInput = z.input<ReturnType<typeof feedbackSchema>>;
export type Feedback = z.output<ReturnType<typeof feedbackSchema>>;

export const inquiryRoles = ["owner", "investor", "manager", "other"] as const;
export const inquiryStages = ["idea", "opening", "operating", "multi"] as const;
export const inquiryTimelines = ["asap", "1-3", "3-6", "6+"] as const;
export const inquiryBudgets = ["undisclosed", "lt500k", "500k-2m", "2m-5m", "gt5m"] as const;

export function inquirySchema(serviceSlugs: readonly string[]) {
  return z.object({
    fullName: name,
    company: optionalText(LIMITS.short.max),
    role: z.enum(inquiryRoles, { error: "required" }),
    email,
    phone,
    stage: z.enum(inquiryStages, { error: "required" }),
    services: z
      .array(z.string().refine((s) => serviceSlugs.includes(s), "services"))
      .min(1, "services")
      .max(serviceSlugs.length, "services"),
    city: optionalText(LIMITS.short.max),
    timeline: z.enum(inquiryTimelines).optional(),
    budget: z.enum(inquiryBudgets).optional(),
    message: required(z.string())
      .min(LIMITS.message.min, "tooShort")
      .max(LIMITS.message.max, "tooLong"),
    locale: localeEnum,
    consent,
  });
}

export type InquiryInput = z.input<ReturnType<typeof inquirySchema>>;
export type Inquiry = z.output<ReturnType<typeof inquirySchema>>;

/** Fields every submission carries besides the form data (anti-spam envelope). */
export const envelopeSchema = z.object({
  data: z.unknown(),
  turnstileToken: z.string().max(4096).default(""),
  /** Honeypot: real people never fill it. */
  website: z.string().max(200).default(""),
  /** Epoch ms when the form was first shown. */
  startedAt: z.number().int().nonnegative(),
});

export type FormKind = "reservation" | "feedback" | "inquiry";
export const MIN_FILL_MS = 3000;
