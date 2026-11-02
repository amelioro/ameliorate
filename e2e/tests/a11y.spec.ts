/**
 * Intended to be run manually against the local app, to catch accessibility regressions on the
 * logged-out home page.
 *
 * axe only detects some issues, so passing this doesn't mean the page is fully accessible.
 */

import AxeBuilder from "@axe-core/playwright";
import { Page, expect, test } from "@playwright/test";

/**
 * Known failures. Delete a rule in the commit that fixes it.
 * Each comment covers what's wrong, why fixing it helps, and the fix.
 */
const excludedRules = [
  // The mobile menu button only contains a hidden icon and has no name. Screen reader users
  // can't tell that it opens the site navigation.
  // Fix: add aria-label="Open site navigation".
  "button-name",

  // The site drawer is a dialog with no name. Screen readers announce the name when focus moves
  // in, so users aren't told what just opened.
  // Fix: add an aria-label.
  "aria-dialog-name",

  // Headings skip levels (h1 to h4, then h4 to h6). Screen reader users often navigate by heading
  // level, and skipped levels make it look like sections are missing.
  // Fix: use h2 for sections and footer columns, and h3 for cards.
  "heading-order",

  // The drawer's <hr> dividers sit directly in its <ul>, which should only contain <li>. Screen
  // readers depend on that structure to announce lists. Chromium still exposes this list
  // correctly, so the impact is probably small, but other browsers may not.
  // Fix: wrap each divider in an <li>.
  "list",

  // Footer links are 20px tall. Small, tightly spaced targets are hard to hit with tremors or
  // limited dexterity, and on touchscreens.
  // Fix: add padding to make them 24px tall.
  "target-size",

  // #4AB84E is about 2.5:1 as text, and needs 4.5:1. Low contrast is hard to read with low vision,
  // on a dim screen, or in bright light.
  // Fix: change primary to #2E7D32.
  "color-contrast",

  // Links in hidden carousel slides can still take focus. `aria-hidden` hides them from screen
  // readers, so keyboard users can land on something that's announced as nothing.
  // Fix: remove the links from the cards. This also fixes nested-interactive.
  "aria-hidden-focus",

  // The selected card is a role="button" containing a link. Screen readers treat a button's
  // contents as plain text, so the link can be unannounced or unreachable.
  // Fix: remove role="button" and the link. This also fixes aria-hidden-focus.
  "nested-interactive",
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
      await page.getByTestId("MenuIcon").click();

      // wait for the slide-in to finish, so the scan doesn't see the drawer mid-transition
      await expect(page.getByRole("dialog")).toBeInViewport({ ratio: 1 });

      await expectNoViolations(page);
    });
  });
});
