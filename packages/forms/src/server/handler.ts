import "server-only";
import type { BrandId, Location, MasService } from "@mas/content";
import type { z } from "zod";
import {
  FeedbackGuestEmail,
  FeedbackStaffEmail,
  InquiryGuestEmail,
  InquiryStaffEmail,
  ReservationGuestEmail,
  ReservationStaffEmail,
} from "../emails/templates";
import type { EmailBrand } from "../emails/layout";
import { makeReference } from "../reference";
import {
  envelopeSchema,
  feedbackSchema,
  inquirySchema,
  MIN_FILL_MS,
  reservationSchema,
  type FormKind,
} from "../schemas";
import { isAfterMidnight } from "../slots";
import { sendMail } from "./mailer";
import { rateLimited } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";

const MAX_BODY_BYTES = 16 * 1024;
const PREFIX: Record<BrandId, "CV" | "AL" | "MS"> = { covy: "CV", aroma: "AL", mas: "MS" };

export type FormRouteConfig = {
  brandId: BrandId;
  emailBrand: EmailBrand;
  /** Which forms this app accepts. A brand with several branches passes them all; the guest picks one. */
  reservation?: { location: Location } | { locations: readonly Location[] };
  feedback?: boolean;
  inquiry?: { services: MasService[] };
};

export type FormResponse =
  | { ok: true; reference: string }
  | { ok: false; error: "validation"; fields: Record<string, string> }
  | { ok: false; error: "verification" | "rateLimited" | "generic" | "badRequest" | "notFound" };

const json = (body: FormResponse, status: number) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });

function allowedOrigins(): Set<string> {
  const out = new Set<string>();
  const add = (url: string | undefined) => {
    if (!url) return;
    try {
      out.add(new URL(url.startsWith("http") ? url : `https://${url}`).origin);
    } catch {
      /* ignore malformed env values */
    }
  };
  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_BRANCH_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (process.env.NODE_ENV !== "production") {
    for (const port of [3000, 3001, 3002]) out.add(`http://localhost:${port}`);
  }
  return out;
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}

/** Build the POST handler for `app/api/forms/[form]/route.ts`. */
export function createFormRoute(config: FormRouteConfig) {
  return async function POST(
    request: Request,
    ctx: { params: Promise<{ form: string }> },
  ): Promise<Response> {
    const { form } = await ctx.params;
    const kind = form as FormKind;
    const enabled =
      (kind === "reservation" && config.reservation) ||
      (kind === "feedback" && config.feedback) ||
      (kind === "inquiry" && config.inquiry);
    if (!enabled) return json({ ok: false, error: "notFound" }, 404);

    // 1. Cheap structural checks before any work.
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return json({ ok: false, error: "badRequest" }, 415);
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) return json({ ok: false, error: "badRequest" }, 413);
    const origin = request.headers.get("origin");
    if (!origin || !allowedOrigins().has(origin))
      return json({ ok: false, error: "badRequest" }, 403);

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    if (rateLimited(`${kind}:${ip ?? "unknown"}`))
      return json({ ok: false, error: "rateLimited" }, 429);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "badRequest" }, 413);
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: "badRequest" }, 400);
    }
    const envelope = envelopeSchema.safeParse(parsedBody);
    if (!envelope.success) return json({ ok: false, error: "badRequest" }, 400);

    // 2. Bots: honeypot filled or submitted faster than a person can. Answer like a success, send nothing.
    const reference = makeReference(PREFIX[config.brandId]);
    if (envelope.data.website || Date.now() - envelope.data.startedAt < MIN_FILL_MS) {
      return json({ ok: true, reference }, 200);
    }

    // 3. Turnstile (skipped only in local development without a secret).
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (secret || process.env.NODE_ENV === "production") {
      const verdict = await verifyTurnstile(envelope.data.turnstileToken, ip, secret);
      if (!verdict.ok) {
        if (verdict.reason === "missing-secret")
          console.error("[forms] TURNSTILE_SECRET_KEY is not set");
        return json(
          { ok: false, error: verdict.reason === "invalid" ? "verification" : "generic" },
          verdict.reason === "invalid" ? 403 : 500,
        );
      }
    }

    // 4. Same schema as the client, then send.
    const to = process.env.MAIL_TO ?? "";
    const env = { apiKey: process.env.RESEND_API_KEY, from: process.env.MAIL_FROM };
    if (!to && process.env.NODE_ENV === "production") {
      console.error("[forms] MAIL_TO is not set");
      return json({ ok: false, error: "generic" }, 500);
    }
    const inbox = to || "dev-inbox@localhost";

    if (kind === "reservation" && config.reservation) {
      const list =
        "locations" in config.reservation
          ? config.reservation.locations
          : [config.reservation.location];
      // With several branches the request names one; a single branch needs nothing.
      const wanted = (envelope.data.data as { locationId?: unknown } | null)?.locationId;
      const location =
        list.length === 1 ? list[0] : list.find((l) => l.id === wanted);
      if (!location)
        return json({ ok: false, error: "validation", fields: { locationId: "required" } }, 400);
      const result = reservationSchema({ location }).safeParse(envelope.data.data);
      if (!result.success)
        return json({ ok: false, error: "validation", fields: fieldErrors(result.error) }, 400);
      const r = result.data;
      const where = list.length > 1 && location.branch ? ` · ${location.branch.en}` : "";
      const staff = await sendMail(
        {
          to: inbox,
          replyTo: r.email,
          subject: `[${config.emailBrand.name}${where}] ${r.type} · ${r.date} · ${r.time} · ${r.guests} guests · ${reference}`,
          react: ReservationStaffEmail({
            brand: config.emailBrand,
            reference,
            r,
            afterMidnight: isAfterMidnight(location, r.date, r.time),
            branch: list.length > 1 ? location.branch : undefined,
          }),
          idempotencyKey: `reservation/${reference}`,
        },
        env,
      );
      if (!staff.ok) {
        console.error("[forms] reservation email failed:", staff.message);
        return json({ ok: false, error: "generic" }, 502);
      }
      // The guest copy is best effort: the restaurant already has the request.
      const guest = await sendMail(
        {
          to: r.email,
          subject: `${config.emailBrand.name} · ${reference}`,
          react: ReservationGuestEmail({
            brand: config.emailBrand,
            reference,
            r,
            contact: { phone: location.phone },
            branch: list.length > 1 ? location.branch : undefined,
          }),
          idempotencyKey: `reservation-ack/${reference}`,
        },
        env,
      );
      if (!guest.ok) console.warn("[forms] guest auto-reply failed:", guest.message);
      return json({ ok: true, reference }, 200);
    }

    if (kind === "feedback" && config.feedback) {
      const result = feedbackSchema().safeParse(envelope.data.data);
      if (!result.success)
        return json({ ok: false, error: "validation", fields: fieldErrors(result.error) }, 400);
      const f = result.data;
      const flag = f.overall <= 2 ? "[Needs follow-up] " : "";
      const staff = await sendMail(
        {
          to: inbox,
          ...(f.email ? { replyTo: f.email } : {}),
          subject: `${flag}[${config.emailBrand.name}] Feedback ${"★".repeat(f.overall)} · ${reference}`,
          react: FeedbackStaffEmail({ brand: config.emailBrand, reference, f }),
          idempotencyKey: `feedback/${reference}`,
        },
        env,
      );
      if (!staff.ok) {
        console.error("[forms] feedback email failed:", staff.message);
        return json({ ok: false, error: "generic" }, 502);
      }
      if (f.contactMe && f.email) {
        await sendMail(
          {
            to: f.email,
            subject: config.emailBrand.name,
            react: FeedbackGuestEmail({ brand: config.emailBrand, f }),
            idempotencyKey: `feedback-ack/${reference}`,
          },
          env,
        );
      }
      return json({ ok: true, reference }, 200);
    }

    if (kind === "inquiry" && config.inquiry) {
      const { services } = config.inquiry;
      const result = inquirySchema(services.map((s) => s.slug)).safeParse(envelope.data.data);
      if (!result.success)
        return json({ ok: false, error: "validation", fields: fieldErrors(result.error) }, 400);
      const q = result.data;
      const serviceTitles = q.services.map(
        (slug) => services.find((s) => s.slug === slug)?.title.en ?? slug,
      );
      const staff = await sendMail(
        {
          to: inbox,
          replyTo: q.email,
          subject: `[MAS] Project inquiry · ${q.fullName}${q.company ? ` (${q.company})` : ""} · ${reference}`,
          react: InquiryStaffEmail({ brand: config.emailBrand, reference, q, serviceTitles }),
          idempotencyKey: `inquiry/${reference}`,
        },
        env,
      );
      if (!staff.ok) {
        console.error("[forms] inquiry email failed:", staff.message);
        return json({ ok: false, error: "generic" }, 502);
      }
      const ack = await sendMail(
        {
          to: q.email,
          subject: `MAS · ${reference}`,
          react: InquiryGuestEmail({ brand: config.emailBrand, reference, q }),
          idempotencyKey: `inquiry-ack/${reference}`,
        },
        env,
      );
      if (!ack.ok) console.warn("[forms] inquiry auto-reply failed:", ack.message);
      return json({ ok: true, reference }, 200);
    }

    return json({ ok: false, error: "notFound" }, 404);
  };
}
