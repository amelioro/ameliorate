import { create } from "zustand";
import { persist } from "zustand/middleware";

import { withDefaults } from "@/common/object";

interface MiscTopicConfigStoreState {
  showResolvedComments: boolean;
}

const initialState: MiscTopicConfigStoreState = {
  showResolvedComments: false,
};

const persistedNameBase = "misc-topic-config-storage";

const useMiscTopicConfigStore = create<MiscTopicConfigStoreState>()(
  persist(() => initialState, {
    name: persistedNameBase,
    version: 1,
    skipHydration: true,
    // don't merge persisted state with current state when rehydrating - instead, use the initialState to fill in missing values
    // e.g. so that a new non-null value in initialState is non-null in the persisted state,
    // removing the need to write a migration for every new field
    merge: (persistedState, _currentState) =>
      withDefaults(persistedState as Partial<MiscTopicConfigStoreState>, initialState),
  }),
);

// hooks
export const useShowResolvedComments = () => {
  return useMiscTopicConfigStore((state) => state.showResolvedComments);
};

// actions
export const toggleShowResolvedComments = (showResolvedComments: boolean) => {
  useMiscTopicConfigStore.setState({ showResolvedComments });
};

export const loadMiscTopicConfig = async (persistId: string) => {
  const builtPersistedName = `${persistedNameBase}-${persistId}`;

  useMiscTopicConfigStore.persist.setOptions({ name: builtPersistedName });

  if (useMiscTopicConfigStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    await useMiscTopicConfigStore.persist.rehydrate();
  } else {
    useMiscTopicConfigStore.setState(initialState, true);
  }
};
