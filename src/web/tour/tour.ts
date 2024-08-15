import { StepType } from "@reactour/tour";

import { reactour } from "@/web/tour/reactourWrapper";
import { breakdownSteps } from "@/web/tour/steps/breakdown";
import { diagramBasicsSteps } from "@/web/tour/steps/diagramBasics";
import { welcomeSteps } from "@/web/tour/steps/welcome";
import { setHasSeenAnyTour, setTourHasCompleted, setTourHasStarted } from "@/web/tour/tourStore";
import { Tour } from "@/web/tour/tourUtils";

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

export const startFirstTour = (userCanEditTopicData: boolean) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  const steps = welcomeSteps(userCanEditTopicData);
  reactour.setSteps(steps);
  setHasSeenAnyTour();

  reactour.setIsOpen(true);
};

export const startTour = (tour: Tour) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  const steps =
    tour === "diagramBasics" ? diagramBasicsSteps : tour === "breakdown" ? breakdownSteps : [];
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
