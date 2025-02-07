import { create } from "zustand";
import { persist } from "zustand/middleware";

import { plausible } from "@/pages/_app.page";
import { migrate } from "@/web/tutorial/storeMigrate";
import { Track, Tutorial } from "@/web/tutorial/tutorialUtils";

interface TutorialStoreState {
  /**
   * This is for easy access to display the current progress in a step's header.
   * Ideally these would just be passed to the step, but requires some refactor to pass around.
   */
  lastStartedTutorial: Tutorial | null;
  /**
   * This is for easy access to display the current progress in a step's header.
   * Ideally these would just be passed to the step, but requires some refactor to pass around.
   */
  lastStartedTrack: Track | null;
  startedTutorials: Tutorial[];
  completedTutorials: Tutorial[];
  tutorialIsOpening: boolean;
}

const initialState: TutorialStoreState = {
  lastStartedTutorial: null,
  lastStartedTrack: null,
  startedTutorials: [],
  completedTutorials: [],
  tutorialIsOpening: false,
};

const useTutorialStore = create<TutorialStoreState>()(
  persist(() => initialState, {
    name: "tutorial-storage",
    version: 2,
    migrate,
  }),
);

// hooks
export const useTutorialProgress = () => {
  return useTutorialStore((state) => ({
    startedTutorials: state.startedTutorials,
    completedTutorials: state.completedTutorials,
  }));
};

// actions
export const setTutorialHasStarted = (tutorial: Tutorial, track: Track | null) => {
  const startedTutorials = useTutorialStore.getState().startedTutorials;

  if (startedTutorials.includes(tutorial)) {
    useTutorialStore.setState({ lastStartedTutorial: tutorial, lastStartedTrack: track });
    return;
  }

  plausible(`Started tutorial: ${tutorial}`, { props: {} });

  useTutorialStore.setState({
    lastStartedTutorial: tutorial,
    lastStartedTrack: track,
    startedTutorials: [...startedTutorials, tutorial],
  });
};

export const setTutorialHasCompleted = (tutorial: Tutorial) => {
  const completedTutorials = useTutorialStore.getState().completedTutorials;

  if (completedTutorials.includes(tutorial)) return;

  plausible(`Completed tutorial: ${tutorial}`, { props: {} });

  useTutorialStore.setState({
    completedTutorials: [...completedTutorials, tutorial],
  });
};

export const setTutorialIsOpening = (isOpening: boolean) => {
  useTutorialStore.setState({
    tutorialIsOpening: isOpening,
  });
};

// utils
export const getLastStartedTutorial = () => {
  return useTutorialStore.getState().lastStartedTutorial;
};

export const getLastStartedTrack = () => {
  return useTutorialStore.getState().lastStartedTrack;
};

export const getTutorialHasStarted = (tutorial: Tutorial) => {
  return useTutorialStore.getState().startedTutorials.includes(tutorial);
};

export const getTutorialHasCompleted = (tutorial: Tutorial) => {
  return useTutorialStore.getState().completedTutorials.includes(tutorial);
};

export const getTutorialIsOpening = () => {
  return useTutorialStore.getState().tutorialIsOpening;
};
