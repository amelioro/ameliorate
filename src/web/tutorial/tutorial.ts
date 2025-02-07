import { StepType } from "@reactour/tour";

import { reactour } from "@/web/tutorial/reactourWrapper";
import { addingNuanceSteps } from "@/web/tutorial/steps/addingNuance";
import { breakdownSteps } from "@/web/tutorial/steps/breakdown";
import { buildingViewsSteps } from "@/web/tutorial/steps/buildingViews";
import { diagramBasicsSteps } from "@/web/tutorial/steps/diagramBasics";
import { getEvaluatingTradeoffsSteps } from "@/web/tutorial/steps/evaluatingTradeoffs";
import { navigatingTopicSteps } from "@/web/tutorial/steps/navigatingTopic";
import { getReadingDiagramSteps } from "@/web/tutorial/steps/readingDiagram";
import { welcomeSteps } from "@/web/tutorial/steps/welcome";
import { setTutorialHasCompleted, setTutorialHasStarted } from "@/web/tutorial/tutorialStore";
import { Track, Tutorial } from "@/web/tutorial/tutorialUtils";

/**
 * @param nextTutorial null if there should be no next tutorial, undefined to use the tutorial's default
 */
const getTutorialSteps = (tutorial: Tutorial, track: Track | null) => {
  switch (tutorial) {
    // builders
    case "diagramBasics":
      return diagramBasicsSteps;
    case "breakingDownAProblem":
      return breakdownSteps;
    case "addingNuance":
      return addingNuanceSteps;
    case "evaluatingTradeoffs":
      return getEvaluatingTradeoffsSteps(track);
    case "buildingViews":
      return buildingViewsSteps;

    // viewers
    case "readingADiagram":
      return getReadingDiagramSteps(track);
    // 1b. evaluatingTradeoffs is reused from builders path
    case "navigatingATopic":
      return navigatingTopicSteps;
    default:
      throw new Error("No steps found for tutorial: " + tutorial);
  }
};

const markTutorialCompletedOnLastStep = (tutorial: Tutorial, steps: StepType[]) => {
  const lastStep = steps[steps.length - 1];
  if (!lastStep) throw new Error("No steps found for tutorial: " + tutorial);

  const lastStepAction = lastStep.action;

  // eslint-disable-next-line functional/immutable-data
  lastStep.action = (elem) => {
    if (lastStepAction) lastStepAction(elem);
    setTutorialHasCompleted(tutorial);
  };
};

export const startWelcomeTutorial = (track: Track) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  const steps = welcomeSteps(track);
  reactour.setSteps(steps);
  setTutorialHasCompleted("welcome");

  reactour.setIsOpen(true);
};

export const startTutorial = (tutorial: Tutorial, track: Track | null) => {
  if (!reactour || !reactour.setSteps) throw new Error("Tour props not set");

  const steps = getTutorialSteps(tutorial, track);
  if (steps.length === 0) throw new Error("No steps found for tutorial: " + tutorial);

  markTutorialCompletedOnLastStep(tutorial, steps);
  reactour.setSteps(steps);
  reactour.setCurrentStep(0);
  setTutorialHasStarted(tutorial, track);

  // Previously had issue where the first step of the new tutorial was being sized the same as the
  // previously-seen tutorial step, causing it to be positioned incorrectly.
  // Closing and reopening after timeout (presumably to ensure there's a render with the false
  // value?) seems to fix this.
  reactour.setIsOpen(false);
  setTimeout(() => reactour?.setIsOpen(true), 0);
};

export const tutorialIsOpen = () => {
  if (!reactour) throw new Error("Tour props not set");

  return reactour.isOpen;
};
