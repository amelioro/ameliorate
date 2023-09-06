import { create } from "zustand";

interface ViewStoreState {
  perspectives: string[];
}

const initialState: ViewStoreState = {
  perspectives: [],
};

const useViewStore = create<ViewStoreState>()(() => initialState);

// hooks
export const usePerspectives = () => {
  return useViewStore((state) => state.perspectives);
};

// actions
export const setPerspectives = (perspectives: string[]) => {
  useViewStore.setState({ perspectives });
};
