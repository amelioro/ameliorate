import { create } from "zustand";

interface ActionConfigStoreState {
  showImpliedEdges: boolean;
}

const initialState: ActionConfigStoreState = {
  showImpliedEdges: true,
};

const useActionConfigStore = create<ActionConfigStoreState>()(() => initialState);

// hooks
export const useShowImpliedEdges = () => {
  return useActionConfigStore((state) => state.showImpliedEdges);
};

// actions
export const toggleShowImpliedEdges = (show: boolean) => {
  useActionConfigStore.setState({ showImpliedEdges: show });
};
