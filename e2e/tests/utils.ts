import { Page } from "@playwright/test";

export const getNode = (page: Page, nodeType: string) => {
  return (
    page
      .getByRole("button", { name: nodeType })
      // distinguish from Add Node buttons
      .and(page.getByRole("button", { name: "new node" }))
  );
};
