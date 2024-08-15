/**
 * Separate file for this const because Workspace and steps both need to reference it, and want to
 * avoid circular dependencies.
 */
export const tourDefaultAnchorClass = "tour-anchor";

export type Tour =
  | "whereToLearn"

  // builders
  | "diagramBasics"
  | "breakdown"
  | "addingNuance"
  | "criteriaTable"
  | "buildingViews"

  // viewers
  | "readingDiagram"
  | "navigatingTopic"

  // experts
  | "moreActions"
  | "advancedFiltering";
