/**
 * Intended to capture high-level screenshot tests that should run on each PR.
 *
 * There's a known issue where fonts sometimes render differently (font kerning?), despite us using Docker;
 * but the value of seeing UI diffs to high-use pages (e.g. landing, app) seems worth having some
 * noise on PRs, since that noise can be auto-committed without much issue.
 */

import { expect, test } from "@playwright/test";

import { getNode } from "@/tests/utils";

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
      page.getByRole("img", { name: "free-school-meals diagram" }),
      page.getByRole("img", { name: "clicking between views in cars-going-too-fast topic" }),
    ],
  });

  // confirm playground and layout with standard nodes look normal, and are persisted after refresh
  await page.getByRole("link", { name: "Play Around" }).first().click();
  await page.getByLabel("Close Tour").click();
  const flow = page.getByTestId("rf__wrapper");
  // add problem nodes
  await getNode(page, "Problem").click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Cause" }).click();
  await getNode(page, "Problem").click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Benefit" }).click();
  await getNode(page, "Problem").click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Detriment" }).click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Detriment" }).click();
  // awkward need to reload because the problem's add button is too high, behind the top toolbar, reloading seems the easiest way to re-center things
  await page.reload();
  await page.getByLabel("Close Tour").click(); // make sure page is done reloading, and get the tour out of the screenshot so we can see the diagram
  await getNode(page, "Problem").click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Solution" }).click();
  // add solution nodes
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Obstacle" }).click();
  await getNode(page, "Solution").click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Component" }).click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Benefit" }).click();
  await getNode(page, "Component").click();
  await flow.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: "Add Detriment" }).click();
  // confirm it looks good
  await page.reload();
  await expect(page).toHaveScreenshot("playground-with-solution.png");
});
