import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActionConfigStoreState {
  showImpliedEdges: boolean;
  unrestrictedEditing: boolean;
  forceNodesIntoLayers: boolean;
  flashlightMode: boolean;
  fillNodesWithColor: boolean;
  layoutThoroughness: number;
}

const initialState: ActionConfigStoreState = {
  showImpliedEdges: false,
  unrestrictedEditing: false,
  forceNodesIntoLayers: true,
  flashlightMode: false,
  fillNodesWithColor: true,
  layoutThoroughness: 1,
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

export const useFlashlightMode = () => {
  return useActionConfigStore((state) => state.flashlightMode);
};

export const useFillNodesWithColor = () => {
  return useActionConfigStore((state) => state.fillNodesWithColor);
};

export const useLayoutThoroughness = () => {
  return useActionConfigStore((state) => state.layoutThoroughness);
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

export const toggleFlashlightMode = (flashlight: boolean) => {
  useActionConfigStore.setState({ flashlightMode: flashlight });
};

export const toggleFillNodesWithColor = (fill: boolean) => {
  useActionConfigStore.setState({ fillNodesWithColor: fill });
};

export const setLayoutThoroughness = (thoroughness: number) => {
  useActionConfigStore.setState({ layoutThoroughness: thoroughness });
};

// utils
export const getUnrestrictedEditing = () => {
  return useActionConfigStore.getState().unrestrictedEditing;
};

export const getFlashlightMode = () => {
  return useActionConfigStore.getState().flashlightMode;
};
