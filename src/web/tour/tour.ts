import { StepType } from "@reactour/tour";

import { reactour } from "@/web/tour/reactourWrapper";
import { addingNuanceSteps } from "@/web/tour/steps/addingNuance";
import { breakdownSteps } from "@/web/tour/steps/breakdown";
import { buildingViewsSteps } from "@/web/tour/steps/buildingViews";
import { diagramBasicsSteps } from "@/web/tour/steps/diagramBasics";
import { getEvaluatingTradeoffsSteps } from "@/web/tour/steps/evaluatingTradeoffs";
import { navigatingTopicSteps } from "@/web/tour/steps/navigatingTopic";
import { readingDiagramSteps } from "@/web/tour/steps/readingDiagram";
import { welcomeSteps } from "@/web/tour/steps/welcome";
import { setTourHasCompleted, setTourHasStarted } from "@/web/tour/tourStore";
import { Tour } from "@/web/tour/tourUtils";

/**
 * @param nextTour null if there should be no next tour, undefined to use the tour's default
 */
const getTourSteps = (tour: Tour, nextTour?: Tour | null) => {
  switch (tour) {
    // builders
    case "diagramBasics":
      return diagramBasicsSteps;
    case "breakdown":
      return breakdownSteps;
    case "addingNuance":
      return addingNuanceSteps;
    case "evaluatingTradeoffs":
      return getEvaluatingTradeoffsSteps(nextTour);
    case "buildingViews":
      return buildingViewsSteps;

    // viewers
    case "readingDiagram":
      return readingDiagramSteps;
    // 1b. evaluatingTradeoffs is reused from builders path
    case "navigatingTopic":
      return navigatingTopicSteps;
    default:
      throw new Error("No steps found for tour: " + tour);
  }
};

const markTourCompletedOnLastStep = (tour: Tour, steps: StepType[]) => {
  const lastStep = steps[steps.length - 1];
  if (!lastStep) throw new Error("No steps found for tour: " + tour);

  const lastStepAction = lastStep.action;

  // eslint-disable-next-line functional/immutable-data
  lastStep.action = (elem) => {
    if (lastStepAction) lastStepAction(elem);
    setTourHasCompleted(tour);
  };
};

export const startWelcomeTour = (nextTour: Tour) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  const steps = welcomeSteps(nextTour);
  reactour.setSteps(steps);
  setTourHasCompleted("welcome");

  reactour.setIsOpen(true);
};

export const startTour = (tour: Tour, nextTour?: Tour | null) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  const steps = getTourSteps(tour, nextTour);
  if (steps.length === 0) throw new Error("No steps found for tour: " + tour);

  markTourCompletedOnLastStep(tour, steps);
  reactour.setSteps(steps);
  reactour.setCurrentStep(0);
  setTourHasStarted(tour);

  // Previously had issue where the first step of the new tour was being sized the same as the
  // previously-seen tour step, causing it to be positioned incorrectly.
  // Closing and reopening after timeout (presumably to ensure there's a render with the false
  // value?) seems to fix this.
  reactour.setIsOpen(false);
  setTimeout(() => reactour?.setIsOpen(true), 0);
};

export const tourIsOpen = () => {
  if (!reactour) throw new Error("Tour props not set");

  return reactour.isOpen;
};
