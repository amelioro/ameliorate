import { create } from "zustand";

import { getScoringUsernames } from "@/web/topic/diagramStore/utilActions";
import { AggregationMode } from "@/web/topic/utils/score";

interface PerspectiveStoreState {
  myPerspective: string;
  perspectives: string[];

  aggregationMode: AggregationMode;
}

const initialState: PerspectiveStoreState = {
  myPerspective: "",
  perspectives: [],

  aggregationMode: "average",
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

export const useAggregationMode = () => {
  return usePerspectiveStore((state) => state.aggregationMode);
};

// actions
export const setInitialPerspective = (perspective: string) => {
  usePerspectiveStore.setState({ myPerspective: perspective, perspectives: [perspective] });
};

export const setPerspectives = (perspectives: string[]) => {
  usePerspectiveStore.setState({ perspectives });
};

export const setAggregationMode = (aggregationMode: AggregationMode) => {
  usePerspectiveStore.setState({ aggregationMode });
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

// utils
export const getPerspectives = () => {
  return usePerspectiveStore.getState().perspectives;
};
