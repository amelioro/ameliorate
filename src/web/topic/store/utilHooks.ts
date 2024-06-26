import { useStore } from "zustand";

import { useTopicStore } from "@/web/topic/store/store";

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTopicTemporalStore = () => useStore(useTopicStore.temporal);

export const useTemporalHooks = () => {
  const temporalStore = useTopicTemporalStore();

  const canUndo = temporalStore.pastStates.length > 0;
  const canRedo = temporalStore.futureStates.length > 0;
  return [canUndo, canRedo];
};
