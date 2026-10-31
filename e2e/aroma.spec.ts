import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Aroma Lounge landing behaviour (P3). Runs only in the aroma projects.
test.beforeEach(({}, info) => {
  test.skip(info.project.metadata.app !== "aroma", "Aroma only");
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

test("lists the whole menu and searches it in both languages", async ({ page }) => {
  await page.goto("/");
  await rejectCookies(page);
  const items = page.locator("#menu [data-item]:visible");
  await expect(items).toHaveCount(195);
  await page.getByLabel("Search the menu").fill("matcha");
  await expect(items).not.toHaveCount(195);
  for (const text of await items.allInnerTexts()) expect(text.toLowerCase()).toContain("matcha");

  await page.goto("/ar");
  await page.getByLabel("دوّر في المنيو").fill("فطير");
  expect(await items.count()).toBeGreaterThan(0);
});

test("a branch link picks the branch in the booking form", async ({ page }) => {
  await page.goto("/?branch=aroma-madinaty#reserve");
  await rejectCookies(page);
  await expect(page.getByRole("radio", { name: /Madinaty/ })).toBeChecked();
  await expect(page.locator("#date")).toBeVisible();
});

test("shows translated errors and keeps the visitor on the step", async ({ page }) => {
  await page.goto("/ar#reserve");
  await rejectCookies(page, "رفض الكل");
  // The radio is visually hidden inside its card; visitors click the card.
  await page.locator("label[for=branch-aroma-mivida]").click();
  await page.getByRole("button", { name: "التالي", exact: true }).click();
  await expect(page.locator("#date-error")).toBeVisible();
  await expect(page.getByRole("heading", { name: "ماذا ومتى" })).toBeVisible();
});
