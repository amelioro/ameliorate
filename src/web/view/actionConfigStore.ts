import { create } from "zustand";

interface ActionConfigStoreState {
  showImpliedEdges: boolean;
  unrestrictedEditing: boolean;
}

const initialState: ActionConfigStoreState = {
  showImpliedEdges: true,
  unrestrictedEditing: false,
};

const useActionConfigStore = create<ActionConfigStoreState>()(() => initialState);

// hooks
export const useShowImpliedEdges = () => {
  return useActionConfigStore((state) => state.showImpliedEdges);
};

export const useUnrestrictedEditing = () => {
  return useActionConfigStore((state) => state.unrestrictedEditing);
};

// actions
export const toggleShowImpliedEdges = (show: boolean) => {
  useActionConfigStore.setState({ showImpliedEdges: show });
};

export const toggleUnrestrictedEditing = (unrestricted: boolean) => {
  useActionConfigStore.setState({ unrestrictedEditing: unrestricted });
};

// utils
export const getUnrestrictedEditing = () => {
  return useActionConfigStore.getState().unrestrictedEditing;
};
