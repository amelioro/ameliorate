import { create } from "zustand";
import { persist } from "zustand/middleware";

import { withDefaults } from "@/common/object";

interface ActionConfigStoreState {
  unrestrictedEditing: boolean;
  flashlightMode: boolean;
  readonlyMode: boolean;
}

const initialState: ActionConfigStoreState = {
  unrestrictedEditing: false,
  flashlightMode: false,
  readonlyMode: false,
};

const persistedNameBase = "action-config-storage";

const useActionConfigStore = create<ActionConfigStoreState>()(
  persist(() => initialState, {
    name: persistedNameBase,
    version: 1,
    skipHydration: true,
    // don't merge persisted state with current state when rehydrating - instead, use the initialState to fill in missing values
    // e.g. so that a new non-null value in initialState is non-null in the persisted state,
    // removing the need to write a migration for every new field
    merge: (persistedState, _currentState) =>
      withDefaults(persistedState as Partial<ActionConfigStoreState>, initialState),
  })
);

// hooks
export const useUnrestrictedEditing = () => {
  return useActionConfigStore((state) => state.unrestrictedEditing);
};

export const useFlashlightMode = () => {
  return useActionConfigStore((state) => state.flashlightMode);
};

export const useReadonlyMode = () => {
  return useActionConfigStore((state) => state.readonlyMode);
};

// actions
export const toggleUnrestrictedEditing = (unrestricted: boolean) => {
  useActionConfigStore.setState({ unrestrictedEditing: unrestricted });
};

export const toggleFlashlightMode = (flashlight: boolean) => {
  useActionConfigStore.setState({ flashlightMode: flashlight });
};

export const toggleReadonlyMode = (readonly: boolean) => {
  useActionConfigStore.setState({ readonlyMode: readonly });
};

export const loadActionConfig = async (persistId: string) => {
  const builtPersistedName = `${persistedNameBase}-${persistId}`;

  useActionConfigStore.persist.setOptions({ name: builtPersistedName });

  if (useActionConfigStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    await useActionConfigStore.persist.rehydrate();
  } else {
    useActionConfigStore.setState(initialState, true);
  }
};

// utils
export const getUnrestrictedEditing = () => {
  return useActionConfigStore.getState().unrestrictedEditing;
};

export const getFlashlightMode = () => {
  return useActionConfigStore.getState().flashlightMode;
};
