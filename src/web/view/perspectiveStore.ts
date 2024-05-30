import { create } from "zustand";

import { getScoringUsernames } from "@/web/topic/store/utilActions";

interface PerspectiveStoreState {
  myPerspective: string;
  perspectives: string[];
}

const initialState: PerspectiveStoreState = {
  myPerspective: "",
  perspectives: [],
};

const usePerspectiveStore = create<PerspectiveStoreState>()(() => initialState);

// hooks
export const usePerspectives = () => {
  return usePerspectiveStore((state) => state.perspectives);
};

export const useIsComparingPerspectives = () => {
  return usePerspectiveStore((state) => {
    const viewingMyPerspective =
      state.perspectives.length === 1 && state.perspectives[0] === state.myPerspective;
    return !viewingMyPerspective;
  });
};

// actions
export const setInitialPerspective = (perspective: string) => {
  usePerspectiveStore.setState({ myPerspective: perspective, perspectives: [perspective] });
};

export const setPerspectives = (perspectives: string[]) => {
  usePerspectiveStore.setState({ perspectives });
};

export const resetPerspectives = () => {
  usePerspectiveStore.setState((state) => {
    return { perspectives: [state.myPerspective] };
  });
};

export const comparePerspectives = () => {
  const scoringUsernames = getScoringUsernames();
  usePerspectiveStore.setState({ perspectives: scoringUsernames });
};
