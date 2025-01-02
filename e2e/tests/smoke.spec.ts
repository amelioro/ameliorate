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
      page.getByRole("img", { name: "climate change and congestion" }),
      page.getByRole("img", { name: "criteria tables of cars-going" }),
    ],
  });

  // confirm playground starts with tutorial popup
  await page.getByRole("link", { name: "Play Around" }).first().click();
  await expect(page.getByLabel("Close Tour")).toBeVisible();

  // confirm nodes/edges can be added and persist after refresh
  await page.getByLabel("Close Tour").click();
  await page.getByRole("button", { name: "Problem new node" }).click();
  await page.getByRole("button", { name: "Add new Solution" }).click();
  await page.reload();
  await page.getByLabel("Close Tour").click(); // make sure page is done reloading, and get the tour out of the screenshot so we can see the diagram
  await expect(page).toHaveScreenshot("playground-with-solution.png");
});
