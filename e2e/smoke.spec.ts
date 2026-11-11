import { expect, test } from "@playwright/test";

const appOf = (project: { metadata: Record<string, unknown> }) =>
  project.metadata.app as "mas" | "covy" | "aroma";

test.describe("every site", () => {
  test("English at / and Arabic at /ar with the right direction", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("language links lead to the same page in the other language", async ({ page }) => {
    for (const [path, target] of [
      ["/", "/ar"],
      ["/privacy", "/ar/privacy"],
      ["/ar", "/"],
      ["/ar/terms", "/terms"],
    ] as const) {
      await page.goto(path);
      const links = page.locator(`a[hreflang="${path.startsWith("/ar") ? "en" : "ar"}"]`);
      await expect(links.first()).toBeAttached();
      for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute("href"))))
        expect(href, path).toBe(target);
    }
    expect((await page.request.get("/ar")).status()).toBe(200);
  });

  test("sends security headers and stays out of search before launch", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
    expect(await (await request.get("/")).text()).toContain(
      '<meta name="robots" content="noindex, nofollow"/>',
    );
  });

  test("loads no analytics until the visitor allows it", async ({ page }) => {
    const thirdParty: string[] = [];
    page.on("request", (r) => {
      if (/googletagmanager|google-analytics|clarity\.ms/.test(r.url())) thirdParty.push(r.url());
    });
    await page.goto("/");
    const banner = page.locator("section[aria-labelledby=consent-title]");
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Reject all" }).click();
    await expect(banner).toBeHidden();
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "mas_consent")?.value).toBe("v1.a0.r0");
    await page.reload();
    await expect(banner).toBeHidden();
    expect(thirdParty).toEqual([]);
  });

  test("has privacy and terms pages in both languages", async ({ page }) => {
    for (const path of ["/privacy", "/terms", "/ar/privacy", "/ar/terms"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("stays inside the 180 KB initial JavaScript budget (D29)", async ({ page }) => {
    for (const path of ["/", "/ar"]) {
      await page.goto(path, { waitUntil: "load" });
      const initialKB = await page.evaluate(() => {
        const load = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        return (
          performance
            .getEntriesByType("resource")
            .filter((e) => e.name.endsWith(".js") && e.startTime <= load.loadEventEnd)
            .reduce((sum, e) => sum + (e as PerformanceResourceTiming).transferSize, 0) / 1024
        );
      });
      expect(initialKB, path).toBeLessThanOrEqual(180);
    }
  });

  test("has no horizontal scroll", async ({ page }) => {
    for (const path of ["/", "/ar", "/kitchen-sink", "/ar/kitchen-sink"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("forms", () => {
  test("shows translated errors and keeps the visitor on the step", async ({ page }, info) => {
    const app = appOf(info.project);
    // Aroma has no kitchen sink any more: aroma.spec.ts checks its booking form on the landing page.
    test.skip(app === "aroma", "Covered in aroma.spec.ts");
    await page.goto("/ar/kitchen-sink");
    await page
      .locator("section[aria-labelledby=consent-title]")
      .getByRole("button", { name: "رفض الكل" })
      .click();
    if (app === "mas") {
      await page.getByRole("button", { name: "أرسل إلى MAS" }).click();
      await expect(page.locator("#fullName-error")).toHaveText("من فضلك املأ هذا الحقل.");
    } else {
      await page.getByRole("button", { name: "التالي", exact: true }).click();
      await expect(page.locator("#date-error")).toBeVisible();
      await expect(page.getByRole("heading", { name: "ماذا ومتى" })).toBeVisible();
    }
  });
});
