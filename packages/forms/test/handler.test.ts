import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { locations, masServices } from "@mas/content";
import { createFormRoute } from "../src/server/handler";
import { addDays, cairoNow } from "../src/time";

const brand = { name: "COVY", accent: "#765f4d", ink: "#262d3f", paper: "#efebe8" };
const covyRoute = createFormRoute({
  brandId: "covy",
  emailBrand: brand,
  reservation: { location: locations.covy },
  feedback: true,
});
const masRoute = createFormRoute({
  brandId: "mas",
  emailBrand: { ...brand, name: "MAS" },
  inquiry: { services: masServices },
});

let ip = 0;
function post(
  route: typeof covyRoute,
  form: string,
  payload: unknown,
  headers: Record<string, string> = {},
) {
  ip += 1; // fresh IP per request so the rate limiter stays out of the way
  const request = new Request(`http://localhost:3001/api/forms/${form}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3001",
      "x-forwarded-for": `10.0.0.${ip}`,
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  return route(request, { params: Promise.resolve({ form }) });
}

const envelope = (data: unknown, extra: Record<string, unknown> = {}) => ({
  data,
  turnstileToken: "",
  website: "",
  startedAt: Date.now() - 60_000,
  ...extra,
});
const reservation = () => ({
  type: "table",
  date: addDays(cairoNow().date, 3),
  time: "19:30",
  guests: 4,
  seating: "indoor",
  fullName: "Nour Hassan",
  phone: "01012345678",
  email: "nour@example.com",
  locale: "en",
  consent: true,
});

describe("form route", () => {
  let info: { mock: { calls: unknown[][] } };
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("MAIL_TO", "covy@mas.com");
    info = vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends the staff email first, then the guest auto-reply", async () => {
    const res = await post(covyRoute, "reservation", envelope(reservation()));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, reference: expect.stringMatching(/^CV-[A-Z2-9]{4}$/) });
    const logs = info.mock.calls.map((c) => String(c[0]));
    expect(logs).toHaveLength(2);
    expect(logs[0]).toContain("→ covy@mas.com");
    expect(logs[0]).toContain(body.reference);
    expect(logs[1]).toContain("→ nour@example.com");
  });

  it("returns field errors as i18n keys", async () => {
    const res = await post(
      covyRoute,
      "reservation",
      envelope({ ...reservation(), time: "07:00", email: "nope" }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      ok: false,
      error: "validation",
      fields: { email: "email", time: "time" },
    });
  });

  it("pretends to succeed for bots and sends nothing", async () => {
    const honeypot = await post(
      covyRoute,
      "reservation",
      envelope(reservation(), { website: "http://spam" }),
    );
    const tooFast = await post(
      covyRoute,
      "reservation",
      envelope(reservation(), { startedAt: Date.now() }),
    );
    expect((await honeypot.json()).ok).toBe(true);
    expect((await tooFast.json()).ok).toBe(true);
    expect(info).not.toHaveBeenCalled();
  });

  it("rejects foreign origins, wrong content types and forms the app doesn't have", async () => {
    expect(
      (
        await post(covyRoute, "reservation", envelope(reservation()), {
          origin: "https://evil.example",
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await post(covyRoute, "reservation", envelope(reservation()), {
          "content-type": "text/plain",
        })
      ).status,
    ).toBe(415);
    expect((await post(covyRoute, "inquiry", envelope({}))).status).toBe(404);
    expect((await post(masRoute, "reservation", envelope(reservation()))).status).toBe(404);
  });

  it("rate-limits bursts from one address", async () => {
    const request = () =>
      covyRoute(
        new Request("http://localhost:3001/api/forms/feedback", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://localhost:3001",
            "x-forwarded-for": "10.9.9.9",
          },
          body: JSON.stringify(
            envelope({
              overall: 5,
              comments: "Great coffee and service.",
              locale: "en",
              consent: true,
            }),
          ),
        }),
        { params: Promise.resolve({ form: "feedback" }) },
      );
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await request()).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it("requires Turnstile in production and fails closed without a secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3001");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(covyRoute, "reservation", envelope(reservation()));
    expect(res.status).toBe(500);
    expect(error).toHaveBeenCalledWith("[forms] TURNSTILE_SECRET_KEY is not set");
  });

  it("handles a MAS project inquiry", async () => {
    vi.stubEnv("MAIL_TO", "mas@mas.com");
    const res = await post(
      masRoute,
      "inquiry",
      envelope({
        fullName: "Karim Adel",
        role: "owner",
        email: "karim@example.com",
        phone: "01112345678",
        stage: "opening",
        services: ["menu-engineering-costing"],
        message: "We are opening a specialty café in New Cairo next spring.",
        locale: "ar",
        consent: true,
      }),
    );
    const body = await res.json();
    expect(body.reference).toMatch(/^MS-/);
    expect(String(info.mock.calls[0]?.[0])).toContain("Menu Engineering");
  });
});
