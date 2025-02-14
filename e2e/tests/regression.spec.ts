/**
 * Intended to capture high-level screenshot tests that should run on each PR.
 *
 * There's a known issue where fonts sometimes render differently (font kerning?), despite us using Docker;
 * but the value of seeing UI diffs to high-use pages (e.g. landing, app) seems worth having some
 * noise on PRs, since that noise can be auto-committed without much issue.
 */

import { getNode } from "@/tests/utils";
import { expect, test } from "@playwright/test";

test("can play around", async ({ page }) => {
  // confirm home page looks ok
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", {
    fullPage: true,
    mask: [
      // For some reason, Netlify preview/production hosts images based on nextjs device sizes https://github.com/vercel/next.js/issues/44244#issuecomment-2305576047,
      // BUT local images are hosted based on the actual image size... So when the browser renders
      // the images within the size of the viewport, the images end up compressing slightly different
      // pixels, creating a significant diff... not sure how to fix this (probably need to file an issue?),
      // but masking the images is a workaround for now.
      page.getByRole("img", { name: "problem solving diagram" }),
      page.getByRole("img", { name: "clicking between views in cars-going-too-fast topic" }),
    ],
  });

  // confirm playground looks normal with some nodes, laid out, persisted after refresh
  await page.getByRole("link", { name: "Play Around" }).first().click();
  await page.getByLabel("Close Tour").click();
  await getNode(page, "Problem").click();
  await page.getByRole("button", { name: "Add new Solution" }).click();
  await page.reload();
  await page.getByLabel("Close Tour").click(); // make sure page is done reloading, and get the tour out of the screenshot so we can see the diagram
  await expect(page).toHaveScreenshot("playground-with-solution.png");
});
