/* eslint-disable -- don't really care to make this file meet eslint standards, since store type is changing between each migration */

export const migrate = (persistedState: any, version: number) => {
  const migrations = [migrate_1_to_2];

  let state = persistedState;

  // thanks for this style to migrate one version at a time https://github.com/pmndrs/zustand/issues/984#issuecomment-1144661466
  migrations.forEach((migration, i) => {
    // i + 1 because these versions started from 1, not 0
    if (i + 1 >= version) {
      state = migration(state);
    }
  });

  return state;
};

type TutorialState1 =
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

type TutorialState2 =
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

interface FromState1 {
  startedTutorials: TutorialState1[];
  completedTutorials: TutorialState1[];
}

interface ToState2 {
  startedTutorials: TutorialState2[];
  completedTutorials: TutorialState2[];
}

// rename some tutorials
const migrate_1_to_2 = (state: FromState1) => {
  (state.startedTutorials as TutorialState2[]) = state.startedTutorials.map((tutorial) => {
    if (tutorial === "breakdown") return "breakingDownAProblem";
    if (tutorial === "readingDiagram") return "readingADiagram";
    if (tutorial === "navigatingTopic") return "navigatingATopic";
    return tutorial;
  });

  (state.completedTutorials as TutorialState2[]) = state.completedTutorials.map((tutorial) => {
    if (tutorial === "breakdown") return "breakingDownAProblem";
    if (tutorial === "readingDiagram") return "readingADiagram";
    if (tutorial === "navigatingTopic") return "navigatingATopic";
    return tutorial;
  });

  return state;
};
