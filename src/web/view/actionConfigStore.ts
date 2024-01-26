import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActionConfigStoreState {
  showImpliedEdges: boolean;
  unrestrictedEditing: boolean;
  forceNodesIntoLayers: boolean;
}

const initialState: ActionConfigStoreState = {
  showImpliedEdges: true,
  unrestrictedEditing: false,
  forceNodesIntoLayers: true,
};

const useActionConfigStore = create<ActionConfigStoreState>()(
  persist(() => initialState, {
    name: "action-config-storage",
  })
);

// hooks
export const useShowImpliedEdges = () => {
  return useActionConfigStore((state) => state.showImpliedEdges);
};

export const useUnrestrictedEditing = () => {
  return useActionConfigStore((state) => state.unrestrictedEditing);
};

export const useForceNodesIntoLayers = () => {
  return useActionConfigStore((state) => state.forceNodesIntoLayers);
};

// actions
export const toggleShowImpliedEdges = (show: boolean) => {
  useActionConfigStore.setState({ showImpliedEdges: show });
};

export const toggleUnrestrictedEditing = (unrestricted: boolean) => {
  useActionConfigStore.setState({ unrestrictedEditing: unrestricted });
};

export const toggleForceNodesIntoLayers = (force: boolean) => {
  useActionConfigStore.setState({ forceNodesIntoLayers: force });
};

// utils
export const getUnrestrictedEditing = () => {
  return useActionConfigStore.getState().unrestrictedEditing;
};
