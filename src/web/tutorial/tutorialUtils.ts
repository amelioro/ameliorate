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

export type Track = "builders" | "diagramViewers" | "tableViewers" | "experts";

// TODO?: could refactor so that things like `startTutorial` calculate the step based on the track,
// but doesn't seem like worth the effort to implement that right now.
export const tracks: Record<Track, Tutorial[]> = {
  builders: [
    "diagramBasics",
    "breakingDownAProblem",
    "addingNuance",
    "evaluatingTradeoffs",
    "buildingViews",
  ],
  diagramViewers: ["readingADiagram", "navigatingATopic"],
  tableViewers: ["evaluatingTradeoffs", "navigatingATopic"],
  experts: ["moreActions", "advancedFiltering"],
};
