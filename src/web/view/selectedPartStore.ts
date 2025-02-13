import { temporal } from "zundo";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { emitter } from "@/web/common/event";
import { getGraphPart, useGraphPart } from "@/web/topic/store/graphPartHooks";

interface SelectedPartStoreState {
  selectedGraphPartId: string | null;
}

const initialState: SelectedPartStoreState = {
  selectedGraphPartId: null,
};

/**
 * May seem like overkill to have a separate store for this, but it allows us to take advantage of
 * independent undo/redo for selected parts.
 *
 * The main use case for previously having this with the view store was to allow saving selection
 * with a quick view. Short-term TODO we can add `?selected` to URL for this, long-term we can add
 * `selectedState` to `views` table, with a "save selected state?" option (similar to what we'll
 * want for perspectives).
 */
const useSelectedPartStore = create<SelectedPartStoreState>()(
  persist(
    temporal(() => initialState),
    {
      name: "selected-config-storage",
    },
  ),
);

// hooks
export const useSelectedGraphPart = () => {
  const selectedGraphPartId = useSelectedPartStore((state) => state.selectedGraphPartId);

  return useGraphPart(selectedGraphPartId);
};

export const useIsGraphPartSelected = (graphPartId: string) => {
  return useSelectedPartStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return state.selectedGraphPartId === graphPartId;
  });
};

export const useIsAnyGraphPartSelected = (graphPartIds: string[]) => {
  return useSelectedPartStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return graphPartIds.includes(state.selectedGraphPartId);
  });
};

// actions
export const setSelected = (graphPartId: string | null) => {
  const { selectedGraphPartId } = useSelectedPartStore.getState();
  if (selectedGraphPartId === graphPartId) return;

  useSelectedPartStore.setState({ selectedGraphPartId: graphPartId });

  emitter.emit("partSelected", graphPartId);
};

// util actions
export const getSelectedGraphPart = () => {
  const selectedGraphPartId = useSelectedPartStore.getState().selectedGraphPartId;
  if (!selectedGraphPartId) return null;

  return getGraphPart(selectedGraphPartId);
};
