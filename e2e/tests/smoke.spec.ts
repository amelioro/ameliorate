/**
 * Intended to make sure the app still works, running nightly.
 *
 * This was separated from regression.spec.ts because previously we were using screenshots in the
 * smoke test, but those are sometimes flaky, and that's much more annoying for daily builds than
 * on PRs. So now we just run screenshot tests for PRs, and daily tests can just ensure that app
 * functionality still works, without relying on screenshots.
 */

import { expect, test } from "@playwright/test";

import { getNode } from "@/tests/utils";

test("can play around", async ({ page }) => {
  // confirm can go to playground from home page
  await page.goto("/");
  await page.getByRole("link", { name: "Play Around" }).first().click();

  // confirm playground starts with tutorial popup
  await expect(page.getByLabel("Close Tour")).toBeVisible();
  const flow = await page.getByTestId("rf__wrapper");

  // confirm nodes/edges can be added and persist after refresh
  await page.getByLabel("Close Tour").click();
  await getNode(page, "Problem").click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Solution" }).click();
  await page.reload();
  await page.getByLabel("Close Tour").click(); // make sure page is done reloading, and get the tour out of the screenshot so we can see the diagram
  await expect(getNode(page, "Problem")).toBeVisible();
  await expect(getNode(page, "Solution")).toHaveCount(2); // there'll be one solution node in the details pane, one in the diagram
});
