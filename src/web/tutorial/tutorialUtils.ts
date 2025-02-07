import capitalize from "lodash/capitalize";
import startCase from "lodash/startCase";

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
  | "breakingDownAProblem"
  | "addingNuance"
  | "evaluatingTradeoffs"
  | "buildingViews"

  // viewers
  | "readingADiagram"
  | "navigatingATopic"

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

export const getStepHeader = (tutorial: Tutorial | null, track: Track | null) => {
  if (tutorial === "welcome") return ""; // there's only one step in the welcome tutorial and its title would be duplicate of the tutorial header

  const sentenceCaseTutorial = capitalize(startCase(tutorial ?? undefined));

  if (tutorial && track) {
    const prettyTrack =
      track === "diagramViewers" || track === "tableViewers" ? "VIEWERS" : track.toUpperCase();
    const stepNumber = tracks[track].indexOf(tutorial) + 1;
    const totalSteps = tracks[track].length;

    return `${prettyTrack} > ${sentenceCaseTutorial} (${stepNumber}/${totalSteps})`;
  } else {
    return sentenceCaseTutorial;
  }
};
