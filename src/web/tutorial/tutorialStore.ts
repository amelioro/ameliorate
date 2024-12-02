import { create } from "zustand";
import { persist } from "zustand/middleware";

import { plausible } from "@/pages/_app.page";
import { Tutorial } from "@/web/tutorial/tutorialUtils";

interface TutorialStoreState {
  startedTutorials: Tutorial[];
  completedTutorials: Tutorial[];
  tutorialIsOpening: boolean;
}

const initialState: TutorialStoreState = {
  startedTutorials: [],
  completedTutorials: [],
  tutorialIsOpening: false,
};

const useTutorialStore = create<TutorialStoreState>()(
  persist(() => initialState, {
    name: "tutorial-storage",
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
export const setTutorialHasStarted = (tutorial: Tutorial) => {
  const startedTutorials = useTutorialStore.getState().startedTutorials;

  if (startedTutorials.includes(tutorial)) return;

  plausible(`Started tutorial: ${tutorial}`, { props: {} });

  useTutorialStore.setState({
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
export const getTutorialHasStarted = (tutorial: Tutorial) => {
  return useTutorialStore.getState().startedTutorials.includes(tutorial);
};

export const getTutorialHasCompleted = (tutorial: Tutorial) => {
  return useTutorialStore.getState().completedTutorials.includes(tutorial);
};

export const getTutorialIsOpening = () => {
  return useTutorialStore.getState().tutorialIsOpening;
};
