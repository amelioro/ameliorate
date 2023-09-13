import { create } from "zustand";

import { getScoringUsernames } from "../../topic/store/utilActions";

interface ViewStoreState {
  myPerspective: string;
  perspectives: string[];
}

const initialState: ViewStoreState = {
  myPerspective: "",
  perspectives: [],
};

const useViewStore = create<ViewStoreState>()(() => initialState);

// hooks
export const usePerspectives = () => {
  return useViewStore((state) => state.perspectives);
};

export const useIsComparingPerspectives = () => {
  return useViewStore((state) => {
    const viewingMyPerspective =
      state.perspectives.length === 1 && state.perspectives[0] === state.myPerspective;
    return !viewingMyPerspective;
  });
};

// actions
export const setInitialPerspective = (perspective: string) => {
  useViewStore.setState({ myPerspective: perspective, perspectives: [perspective] });
};

export const setPerspectives = (perspectives: string[]) => {
  useViewStore.setState({ perspectives });
};

export const resetPerspectives = () => {
  useViewStore.setState((state) => {
    return { perspectives: [state.myPerspective] };
  });
};

export const comparePerspectives = () => {
  const scoringUsernames = getScoringUsernames();
  useViewStore.setState({ perspectives: scoringUsernames });
};
