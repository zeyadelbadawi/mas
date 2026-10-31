import { afterEach, describe, expect, it, vi } from "vitest";
import { branches, brands, locations } from "@mas/content";
import {
  internalPagesEnabled,
  pageMetadata,
  restaurantJsonLd,
  robotsFor,
  serializeJsonLd,
} from "../src";

afterEach(() => vi.unstubAllEnvs());

describe("pageMetadata", () => {
  it("builds canonical and hreflang URLs for both locales", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://covy.example.com/");
    const m = pageMetadata({
      brand: brands.covy,
      locale: "ar",
      path: "/privacy",
      title: "x",
      description: "y",
    });
    expect(m.alternates?.canonical).toBe("https://covy.example.com/ar/privacy");
    expect(m.alternates?.languages).toEqual({
      en: "https://covy.example.com/privacy",
      ar: "https://covy.example.com/ar/privacy",
      "x-default": "https://covy.example.com/privacy",
    });
  });
  it("keeps every page out of search until SITE_INDEXABLE is set", () => {
    expect(
      pageMetadata({ brand: brands.mas, locale: "en", path: "/", title: "x", description: "y" })
        .robots,
    ).toEqual({ index: false, follow: false });
    expect(robotsFor(brands.mas)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    vi.stubEnv("SITE_INDEXABLE", "true");
    expect(robotsFor(brands.mas).sitemap).toBe("https://mas.com/sitemap.xml");
  });
  it("shows the internal review pages until launch, on every deployment type", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(internalPagesEnabled()).toBe(true);
    vi.stubEnv("SITE_INDEXABLE", "true");
    expect(internalPagesEnabled()).toBe(false);
  });
});

describe("JSON-LD", () => {
  it("maps opening hours and escapes markup", () => {
    const ld = restaurantJsonLd(brands.covy, locations.covy, "en") as {
      openingHoursSpecification: { dayOfWeek: string }[];
    };
    expect(ld.openingHoursSpecification).toHaveLength(7);
    expect(ld.openingHoursSpecification[0]?.dayOfWeek).toBe("https://schema.org/Sunday");
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain(
      "</script>",
    );
  });

  it("gives each branch its own entry and leaves out fields still to confirm", () => {
    const [mivida, madinaty] = branches.aroma;
    const a = restaurantJsonLd(brands.aroma, mivida, "en", { anchor: "mivida" });
    const b = madinaty ? restaurantJsonLd(brands.aroma, madinaty, "en") : {};
    expect(a["@id"]).not.toBe(b["@id"]);
    expect(a.url).toMatch(/#mivida$/);
    expect(a.telephone).toBe(mivida.phone);
    expect(a).toHaveProperty("openingHoursSpecification");
    // A branch whose phone and hours are still samples publishes neither.
    const unconfirmed = restaurantJsonLd(
      brands.aroma,
      { ...mivida, placeholderFields: ["phone", "hours"] },
      "en",
    );
    expect(unconfirmed).not.toHaveProperty("telephone");
    expect(unconfirmed).not.toHaveProperty("openingHoursSpecification");
  });
});
