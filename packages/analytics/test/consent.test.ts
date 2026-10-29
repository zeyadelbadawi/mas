import { describe, expect, it } from "vitest";
import { parseConsent, serializeConsent, trackingCookieNames } from "../src/consent";

describe("consent cookie", () => {
  it("round-trips a choice", () => {
    const cookie = serializeConsent({ analytics: true, recordings: false }, true);
    expect(cookie).toMatch(/^mas_consent=v1\.a1\.r0; Max-Age=\d+; Path=\/; SameSite=Lax; Secure$/);
    expect(parseConsent(`foo=1; ${cookie.split(";")[0]}; bar=2`)).toEqual({
      analytics: true,
      recordings: false,
    });
  });
  it("treats missing, malformed or old-version cookies as no choice", () => {
    expect(parseConsent("")).toBeNull();
    expect(parseConsent("mas_consent=yes")).toBeNull();
    expect(parseConsent("mas_consent=v0.a1.r1")).toBeNull();
  });
  it("finds GA4 and Clarity cookies to clear", () => {
    expect(
      trackingCookieNames(
        "_ga=1; _ga_ABC=2; NEXT_LOCALE=ar; _clck=3; _clsk=4; mas_consent=v1.a0.r0",
      ),
    ).toEqual(["_ga", "_ga_ABC", "_clck", "_clsk"]);
  });
});
