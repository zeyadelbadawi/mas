import { expect, test } from "@playwright/test";

// Stash (D77, D80): a separate brand. Every route exists from S1, the catalogue shows its eight ranges, and
// nothing a visitor can see or read in the page names MAS.

test.beforeEach(({ page: _page }, info) => {
  test.skip(info.project.metadata.app !== "stash", "Stash only");
});

const ROUTES = [
  "/",
  "/packaging",
  "/packaging/coffee-beverage",
  "/packaging/accessories-tableware",
  "/design",
  "/how-it-works",
  "/materials",
  "/about",
  "/quote",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
];

test("every page answers in both languages with one heading", async ({ page }) => {
  for (const path of ROUTES) {
    for (const p of [path, path === "/" ? "/ar" : `/ar${path}`]) {
      const res = await page.goto(p);
      expect(res?.status(), p).toBe(200);
      await expect(page.locator("h1"), p).toHaveCount(1);
    }
  }
});

test("an unknown range is a 404", async ({ request }) => {
  expect((await request.get("/packaging/not-a-range")).status()).toBe(404);
});

test("the eight ranges are listed and linked", async ({ page }) => {
  await page.goto("/packaging");
  const cards = page.locator("main a[href^='/packaging/']");
  await expect(cards).toHaveCount(8);
  await page.goto("/ar/packaging");
  await expect(page.locator("main a[href^='/ar/packaging/']")).toHaveCount(8);
});

test("a claim without a certificate stays hidden (D79)", async ({ page }) => {
  await page.goto("/packaging/sustainable");
  await expect(page.getByRole("heading", { name: "Bagasse products" })).toBeVisible();
  await expect(page.getByText("Certified compostable options")).toHaveCount(0);
});

test("nothing on the site names MAS (D80)", async ({ page, request }) => {
  for (const path of ["/", "/ar", "/packaging", "/privacy", "/ar/terms", "/about"]) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toMatch(/\bMAS\b|mas\.com|masegypt|mas_consent/);
  }
  await page.goto("/");
  await page
    .locator("section[aria-labelledby=consent-title]")
    .getByRole("button", { name: "Reject all" })
    .click();
  const names = (await page.context().cookies()).map((c) => c.name);
  expect(names).toContain("consent");
  expect(names).not.toContain("mas_consent");
});

test("the packaging menu opens from the keyboard and closes with Escape", async ({
  page,
}, info) => {
  test.skip(info.project.name.endsWith("mobile"), "desktop header");
  await page.goto("/");
  const button = page.getByRole("button", { name: "Packaging" });
  await button.click();
  await expect(page.locator("#packaging-menu a[href^='/packaging/']")).toHaveCount(8);
  await page.keyboard.press("Escape");
  await expect(page.locator("#packaging-menu")).toBeHidden();
  await expect(button).toBeFocused();
});
