import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The MAS site (D64): every page, both languages. Runs only in the mas projects.
test.beforeEach(({}, info) => {
  test.skip(info.project.metadata.app !== "mas", "MAS only");
});

const PAGES = [
  "/",
  "/about",
  "/services",
  "/services/menu-engineering-costing",
  "/brands",
  "/brands/covy",
  "/brands/aroma",
  "/events",
  "/insights",
  "/insights/reading-your-menu",
  "/contact",
];

test("has no serious accessibility violations on any page, in English and Arabic", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const path of PAGES.flatMap((p) => [p, p === "/" ? "/ar" : `/ar${p}`])) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    // The home page is behind the splash gate until its scenes are ready (D62).
    if (path === "/" || path === "/ar")
      await page.waitForFunction(() => document.documentElement.dataset.splash !== "hold", null, {
        timeout: 90_000,
      });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .exclude(".mas-splash")
      .analyze();
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      serious.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(" "))
            .slice(0, 3)
            .join(", ")}`,
      ),
      path,
    ).toEqual([]);
  }
});

test("every link in the header and footer leads to a page", async ({ page, request }) => {
  await page.goto("/about");
  const hrefs = await page
    .locator("header a[href^='/'], footer a[href^='/']")
    .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")!))]);
  expect(hrefs.length).toBeGreaterThan(8);
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
});

test("a service page pre-selects its service in the inquiry form", async ({ page }) => {
  await page.goto("/services/menu-engineering-costing");
  await page
    .locator("section[aria-labelledby=consent-title]")
    .getByRole("button", { name: "Reject all" })
    .click();
  await page.locator("main").getByRole("link", { name: "Discuss your project" }).last().click();
  await expect(page).toHaveURL(/\/contact\?service=menu-engineering-costing$/);
  await expect(page.getByRole("checkbox", { name: "Menu Engineering & Costing" })).toBeChecked();
});
