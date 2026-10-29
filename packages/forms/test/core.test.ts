import { describe, expect, it } from "vitest";
import { locations, masServices } from "@mas/content";
import { normalisePhone } from "../src/phone";
import { makeReference } from "../src/reference";
import { feedbackSchema, inquirySchema, reservationSchema } from "../src/schemas";
import { isAfterMidnight, timeSlots } from "../src/slots";
import { addDays, cairoNow, daysBetween } from "../src/time";

// Thursday 2026-11-05 10:00 in Cairo (UTC+2 in November).
const NOW = new Date("2026-11-05T08:00:00Z");
const covy = locations.covy; // 08:00 → 01:00, 30-min slots, last booking 90 min before close

describe("cairoNow", () => {
  it("reads the wall clock in Cairo", () => {
    expect(cairoNow(NOW)).toEqual({ date: "2026-11-05", minutes: 600, weekday: 4 });
  });
});

describe("timeSlots", () => {
  it("runs from opening to 90 minutes before a close that falls after midnight", () => {
    const slots = timeSlots(covy, "2026-11-06", NOW);
    expect(slots[0]).toBe("08:00");
    expect(slots.at(-1)).toBe("23:30");
  });
  it("keeps after-midnight slots on the same business day when the venue closes late", () => {
    const late = { ...covy, hours: covy.hours.map((h) => ({ ...h, closes: "03:00" })) };
    const slots = timeSlots(late, "2026-11-06", NOW);
    expect(slots).toContain("00:30");
    expect(slots.at(-1)).toBe("01:30");
    expect(isAfterMidnight(late, "2026-11-06", "00:30")).toBe(true);
    expect(isAfterMidnight(late, "2026-11-06", "20:00")).toBe(false);
  });
  it("hides same-day slots inside the one-hour notice", () => {
    const slots = timeSlots(covy, "2026-11-05", NOW);
    expect(slots[0]).toBe("11:00");
  });
  it("returns nothing for a closed day", () => {
    const closedFriday = { ...covy, hours: covy.hours.filter((h) => h.weekday !== 5) };
    expect(timeSlots(closedFriday, "2026-11-06", NOW)).toEqual([]);
  });
});

describe("normalisePhone", () => {
  it("accepts local Egyptian mobile formats and returns E.164", () => {
    expect(normalisePhone("010 1234 5678")).toBe("+201012345678");
    expect(normalisePhone("+20 112 345 6789")).toBe("+201123456789");
  });
  it("rejects junk", () => {
    expect(normalisePhone("12345")).toBeNull();
    expect(normalisePhone("")).toBeNull();
  });
});

describe("makeReference", () => {
  it("uses the brand prefix and an unambiguous 4-character code", () => {
    const ref = makeReference("CV", () => new Uint8Array([0, 8, 31, 32]));
    expect(ref).toBe("CV-AJ9A");
    expect(makeReference("AL")).toMatch(/^AL-[A-HJ-NP-Z2-9]{4}$/);
  });
});

describe("reservationSchema", () => {
  const schema = reservationSchema({ location: covy, now: NOW });
  const valid = {
    type: "table",
    date: "2026-11-07",
    time: "19:30",
    guests: "4",
    seating: "indoor",
    fullName: "Nour Hassan",
    phone: "01012345678",
    email: "nour@example.com",
    locale: "en",
    consent: true,
  };

  it("accepts a normal table booking and normalises the phone", () => {
    const r = schema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.phone).toBe("+201012345678");
      expect(r.data.guests).toBe(4);
    }
  });

  const issueFor = (input: Record<string, unknown>, path: string) => {
    const r = schema.safeParse(input);
    return r.success ? undefined : r.error.issues.find((i) => i.path[0] === path)?.message;
  };

  it("rejects past dates and dates beyond the booking window", () => {
    expect(issueFor({ ...valid, date: "2026-11-04" }, "date")).toBe("pastDate");
    expect(issueFor({ ...valid, date: addDays("2026-11-05", 61) }, "date")).toBe("outOfWindow");
  });
  it("rejects times outside the generated slots", () => {
    expect(issueFor({ ...valid, time: "07:00" }, "time")).toBe("time");
    expect(issueFor({ ...valid, time: "19:15" }, "time")).toBe("time");
  });
  it("caps table size and requires event types for big groups", () => {
    expect(issueFor({ ...valid, guests: "21" }, "guests")).toBe("guests");
    expect(schema.safeParse({ ...valid, type: "birthday", guests: "40" }).success).toBe(true);
  });
  it("requires consent and a valid phone and email", () => {
    expect(issueFor({ ...valid, consent: false }, "consent")).toBe("consent");
    expect(issueFor({ ...valid, phone: "123" }, "phone")).toBe("phone");
    expect(issueFor({ ...valid, email: "nope" }, "email")).toBe("email");
  });
});

describe("feedbackSchema", () => {
  const schema = feedbackSchema({ now: NOW });
  const base = {
    overall: 4,
    comments: "Lovely brunch, slow coffee though.",
    locale: "ar",
    consent: true,
  };
  it("accepts anonymous feedback", () => {
    expect(schema.safeParse(base).success).toBe(true);
  });
  it("needs a way to reach the guest when they ask to be contacted", () => {
    const r = schema.safeParse({ ...base, contactMe: true });
    expect(r.success).toBe(false);
    expect(schema.safeParse({ ...base, contactMe: true, phone: "01012345678" }).success).toBe(true);
  });
  it("rejects future visit dates", () => {
    expect(schema.safeParse({ ...base, visitDate: "2026-12-01" }).success).toBe(false);
  });
});

describe("inquirySchema", () => {
  const schema = inquirySchema(masServices.map((s) => s.slug));
  const base = {
    fullName: "Karim Adel",
    role: "owner",
    email: "karim@example.com",
    phone: "01112345678",
    stage: "opening",
    services: ["menu-engineering-costing"],
    message: "We are opening a specialty café in New Cairo next spring.",
    locale: "en",
    consent: true,
  };
  it("accepts a complete inquiry", () => {
    expect(schema.safeParse(base).success).toBe(true);
  });
  it("rejects unknown services and empty selections", () => {
    expect(schema.safeParse({ ...base, services: [] }).success).toBe(false);
    expect(schema.safeParse({ ...base, services: ["hacking"] }).success).toBe(false);
  });
});

describe("date helpers", () => {
  it("counts days across month ends", () => {
    expect(daysBetween("2026-11-30", "2026-12-02")).toBe(2);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
