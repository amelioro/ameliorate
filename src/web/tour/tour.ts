import { reactour } from "@/web/tour/reactourWrapper";
import { diagramBasicsSteps } from "@/web/tour/steps/diagramBasics";
import { whereToLearnSteps } from "@/web/tour/steps/whereToLearn";
import { setHasSeenAnyTour } from "@/web/tour/tourStore";

export type Tour = "whereToLearn" | "diagramBasics";

export const startFirstTour = (userCanEditTopicData: boolean) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  const steps = whereToLearnSteps(userCanEditTopicData);
  reactour.setSteps(steps);
  setHasSeenAnyTour();

  reactour.setIsOpen(true);
};

export const startTour = (tour: Tour) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  if (tour === "diagramBasics") {
    reactour.setSteps(diagramBasicsSteps);
  }

  reactour.setCurrentStep(0);
  reactour.setIsOpen(true);
};
