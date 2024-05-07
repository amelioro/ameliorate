import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActionConfigStoreState {
  unrestrictedEditing: boolean;
  flashlightMode: boolean;
  fillNodesWithColor: boolean;
}

const initialState: ActionConfigStoreState = {
  unrestrictedEditing: false,
  flashlightMode: false,
  fillNodesWithColor: true,
};

const useActionConfigStore = create<ActionConfigStoreState>()(
  persist(() => initialState, {
    name: "action-config-storage",
  })
);

// hooks
export const useUnrestrictedEditing = () => {
  return useActionConfigStore((state) => state.unrestrictedEditing);
};

export const useFlashlightMode = () => {
  return useActionConfigStore((state) => state.flashlightMode);
};

export const useFillNodesWithColor = () => {
  return useActionConfigStore((state) => state.fillNodesWithColor);
};

// actions
export const toggleUnrestrictedEditing = (unrestricted: boolean) => {
  useActionConfigStore.setState({ unrestrictedEditing: unrestricted });
};

export const toggleFlashlightMode = (flashlight: boolean) => {
  useActionConfigStore.setState({ flashlightMode: flashlight });
};

export const toggleFillNodesWithColor = (fill: boolean) => {
  useActionConfigStore.setState({ fillNodesWithColor: fill });
};

// utils
export const getUnrestrictedEditing = () => {
  return useActionConfigStore.getState().unrestrictedEditing;
};

export const getFlashlightMode = () => {
  return useActionConfigStore.getState().flashlightMode;
};
