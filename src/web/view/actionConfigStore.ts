import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActionConfigStoreState {
  unrestrictedEditing: boolean;
  flashlightMode: boolean;
}

const initialState: ActionConfigStoreState = {
  unrestrictedEditing: false,
  flashlightMode: false,
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

// actions
export const toggleUnrestrictedEditing = (unrestricted: boolean) => {
  useActionConfigStore.setState({ unrestrictedEditing: unrestricted });
};

export const toggleFlashlightMode = (flashlight: boolean) => {
  useActionConfigStore.setState({ flashlightMode: flashlight });
};

// utils
export const getUnrestrictedEditing = () => {
  return useActionConfigStore.getState().unrestrictedEditing;
};

export const getFlashlightMode = () => {
  return useActionConfigStore.getState().flashlightMode;
};
