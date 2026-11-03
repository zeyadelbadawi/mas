import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// COVY landing behaviour (P3). Runs only in the covy projects.
test.beforeEach(({}, info) => {
  test.skip(info.project.metadata.app !== "covy", "COVY only");
});

const rejectCookies = async (page: import("@playwright/test").Page, label = "Reject all") =>
  page
    .locator("section[aria-labelledby=consent-title]")
    .getByRole("button", { name: label })
    .click();

test("has no serious accessibility violations in English and Arabic", async ({ page }) => {
  for (const path of ["/", "/ar"]) {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.length}`),
      path,
    ).toEqual([]);
  }
});

test("the menu is the client's: every dish, no invented prices, search hides the rest", async ({
  page,
}) => {
  await page.goto("/");
  await rejectCookies(page);
  const items = page.locator("#menu [data-item]:visible");
  // The client's sheet (D74): 69 entries in seven sections, five sandwiches listed twice.
  await expect(items).toHaveCount(69);
  await expect(page.locator("#menu [data-menu-section]")).toHaveCount(7);
  await expect(page.locator("#menu").getByText("Prices coming soon")).toBeVisible();
  await expect(page.locator("#menu").getByText(/EGP|E£/)).toHaveCount(0);

  await page.getByLabel("Search the menu").fill("hawawshi");
  await expect(page.getByRole("status").filter({ hasText: "match" })).toHaveText("1 dish matches");
  await expect(items).toHaveCount(1);

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(items).toHaveCount(69);
});

test("Arabic search finds dishes by their Arabic name", async ({ page }) => {
  await page.goto("/ar");
  await rejectCookies(page, "رفض الكل");
  await page.getByLabel("ابحث في المنيو").fill("حواوشي");
  await expect(page.locator("#menu [data-item]:visible")).toHaveCount(1);
});

test("an event link prefills the booking form", async ({ page }) => {
  await page.goto("/?event=covy-oud-evening#reserve");
  await rejectCookies(page);
  await expect(page.locator("#date")).toHaveValue("2026-11-20");
  await expect(page.locator("#time")).toHaveValue("20:00");
});

test("returning visitors never see the cookie banner, even before JavaScript runs", async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext();
  await ctx.addCookies([{ name: "mas_consent", value: "v1.a0.r0", url: baseURL! }]);
  const page = await ctx.newPage();
  await page.route("**/_next/static/chunks/*.js", (r) => r.abort());
  await page.goto("/");
  await expect(page.locator("section[aria-labelledby=consent-title]")).toBeHidden();
  await ctx.close();
});
