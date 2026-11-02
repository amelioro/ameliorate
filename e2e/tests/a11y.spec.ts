/**
 * Intended to be run manually against the local app, to catch accessibility regressions on the
 * logged-out home page.
 *
 * axe only detects some issues, so passing this doesn't mean the page is fully accessible.
 *
 * NOTE: see the below tests for what pages are actually tested - right now, only the home page is
 * covered.
 */

import AxeBuilder from "@axe-core/playwright";
import { Page, expect, test } from "@playwright/test";

/**
 * Known failures. Delete a rule in the commit that fixes it.
 * Each comment covers what's wrong, why fixing it helps, and the fix.
 */
const excludedRules: string[] = [
  /**
   * Keeping this around because if we add more pages to test, we'll probably want to use the same
   * strategy where we exclude failing rules and remove the exclusion one at a time, as we fix them.
   */
];

const gotoHomePage = async (page: Page) => {
  await page.goto("/");

  // The banner shows after hydration, so waiting for it means the scan sees what a new visitor
  // sees, and that buttons respond to clicks.
  // Scope to the header because Next.js also renders a route-announcer alert.
  await expect(page.getByRole("banner").getByRole("alert")).toBeVisible();
};

const expectNoViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .disableRules(excludedRules)
    .analyze();

  expect(results.violations).toEqual([]);
};

test.describe("home page", () => {
  test("desktop", async ({ page }) => {
    await gotoHomePage(page);
    await expectNoViolations(page);
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 375, height: 800 } });

    test("default", async ({ page }) => {
      await gotoHomePage(page);
      await expectNoViolations(page);
    });

    test("site drawer open", async ({ page }) => {
      await gotoHomePage(page);
      await page.getByRole("button", { name: "Open site navigation" }).click();

      // wait for the slide-in to finish, so the scan doesn't see the drawer mid-transition
      await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeInViewport({
        ratio: 1,
      });

      await expectNoViolations(page);
    });
  });
});
