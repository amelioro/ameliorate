import { useStore } from "zustand";

import { useDiagramStore } from "@/web/topic/diagramStore/store";

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTopicTemporalStore = () => useStore(useDiagramStore.temporal);

export const useTemporalHooks = () => {
  const temporalStore = useTopicTemporalStore();

  const canUndo = temporalStore.pastStates.length > 0;
  const canRedo = temporalStore.futureStates.length > 0;
  return [canUndo, canRedo];
};
