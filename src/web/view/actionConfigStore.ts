import { create } from "zustand";
import { persist } from "zustand/middleware";

import { withDefaults } from "../../common/object";

interface ActionConfigStoreState {
  unrestrictedEditing: boolean;
  flashlightMode: boolean;
}

const initialState: ActionConfigStoreState = {
  unrestrictedEditing: false,
  flashlightMode: false,
};

const persistedNameBase = "action-config-storage";

const useActionConfigStore = create<ActionConfigStoreState>()(
  persist(() => initialState, {
    name: persistedNameBase,
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

export const loadActionConfig = async (persistId: string) => {
  const builtPersistedName = `${persistedNameBase}-${persistId}`;

  useActionConfigStore.persist.setOptions({ name: builtPersistedName });

  if (useActionConfigStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    await useActionConfigStore.persist.rehydrate();

    // use initial state to fill missing values in the persisted state
    // e.g. so that a new non-null value in initialState is non-null in the persisted state,
    // removing the need to write a migration for every new field
    const persistedState = useActionConfigStore.getState();
    const persistedWithDefaults = withDefaults(persistedState, initialState);

    useActionConfigStore.setState(persistedWithDefaults, true);
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
