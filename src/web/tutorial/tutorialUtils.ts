/**
 * Separate file for this const because Workspace and steps both need to reference it, and want to
 * avoid circular dependencies.
 */
export const tutorialDefaultAnchorClass = "tutorial-anchor";

export const detailsPaneSelector = `.MuiDrawer-root:has(div[id$="-Details"])`;
export const viewsPaneSelector = `.MuiDrawer-root:has(div[id$="-Views"])`;

export type Tutorial =
  | "welcome"

  // builders
  | "diagramBasics"
  | "breakdown"
  | "addingNuance"
  | "evaluatingTradeoffs"
  | "buildingViews"

  // viewers
  | "readingDiagram"
  | "navigatingTopic"

  // experts
  | "moreActions"
  | "advancedFiltering";
