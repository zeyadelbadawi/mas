import { afterEach, describe, expect, it, vi } from "vitest";
import { branches, brands, locations } from "@mas/content";
import {
  internalPagesEnabled,
  pageMetadata,
  restaurantJsonLd,
  robotsFor,
  serializeJsonLd,
  siteOrigin,
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
    const ld = restaurantJsonLd(brands.aroma, locations.aroma, "en") as {
      openingHoursSpecification: { dayOfWeek: string }[];
    };
    expect(ld.openingHoursSpecification).toHaveLength(7);
    expect(ld.openingHoursSpecification[0]?.dayOfWeek).toBe("https://schema.org/Sunday");
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain(
      "</script>",
    );
  });

  it("gives COVY its real address and leaves out its sample phone and hours", () => {
    const ld = restaurantJsonLd(brands.covy, locations.covy, "en") as Record<string, unknown> & {
      address: { streetAddress: string; addressLocality: string };
      geo: { latitude: number; longitude: number };
    };
    expect(ld.address.streetAddress).toContain("Sayed Darwish");
    expect(ld.address.addressLocality).toBe("New Cairo");
    expect(ld.geo).toMatchObject({ latitude: 30.063898, longitude: 31.475681 });
    expect(ld).not.toHaveProperty("telephone");
    expect(ld).not.toHaveProperty("openingHoursSpecification");
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

describe("siteOrigin (D70)", () => {
  const covy = { domain: "https://covy.mas.com" };

  it("uses NEXT_PUBLIC_SITE_URL when it is a real address", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.masegypt.com/");
    expect(siteOrigin(covy)).toBe("https://www.masegypt.com");
  });

  it("ignores a value that is not an address instead of breaking the build", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "n");
    vi.stubEnv("VERCEL_ENV", "");
    expect(siteOrigin(covy)).toBe("https://covy.mas.com");
  });

  it("points a Vercel production build at its own production address", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "mas-mas.vercel.app");
    expect(siteOrigin(covy)).toBe("https://mas-mas.vercel.app");
  });

  it("keeps the planned domain on previews", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "mas-mas.vercel.app");
    expect(siteOrigin(covy)).toBe("https://covy.mas.com");
  });
});
