import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type Trigger } from "@/web/common/components/InfoDialog/infoEvents";

interface InfoDialogStoreState {
  /**
   * Track which triggers have been seen, so that their info can be prevented from showing a second time, if desired.
   */
  seenTriggers: Trigger[];
}

const initialState: InfoDialogStoreState = {
  seenTriggers: [],
};

const useInfoDialogStore = create<InfoDialogStoreState>()(
  persist(() => initialState, {
    name: "info-dialog-storage",
  }),
);

// hooks
// none - should entirely be used via actions and utils

// actions
export const setInfoShown = (trigger: Trigger) => {
  const state = useInfoDialogStore.getState();

  if (state.seenTriggers.includes(trigger)) return;

  useInfoDialogStore.setState((state) => ({
    seenTriggers: [...state.seenTriggers, trigger],
  }));
};

// utils
export const hasSeenTrigger = (trigger: Trigger) => {
  const state = useInfoDialogStore.getState();
  return state.seenTriggers.includes(trigger);
};
