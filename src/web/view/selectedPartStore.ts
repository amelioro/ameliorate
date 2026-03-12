import { temporal } from "zundo";
import { create, useStore } from "zustand";
import { persist } from "zustand/middleware";

import { type CalculatedEdge } from "@/common/edge";
import { emitter } from "@/web/common/event";
import {
  getIndirectEdge,
  useDisplayedEdgeIds,
  useDisplayedNeighborIds,
  useIndirectEdge,
} from "@/web/topic/diagramStore/filteredDiagramStore";
import { getGraphPart, useGraphPart } from "@/web/topic/diagramStore/graphPartHooks";
import { type GraphPart } from "@/web/topic/utils/graph";
import { isIndirectEdgeId } from "@/web/topic/utils/indirectEdges";

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

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTemporalStore = () => useStore(useSelectedPartStore.temporal);

// hooks
/**
 * Generally we're assuming that "selected" implies our part can be persisted _or_ calculated.
 */
export const useSelectedGraphPart = (): GraphPart | CalculatedEdge | null => {
  const selectedGraphPartId = useSelectedPartStore((state) => state.selectedGraphPartId);

  const graphPart = useGraphPart(selectedGraphPartId);
  const indirectEdge = useIndirectEdge(selectedGraphPartId);

  if (!selectedGraphPartId) return null;

  return graphPart ?? indirectEdge;
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

/**
 * Uses the filtered diagram so that indirect edges are included.
 */
export const useIsDisplayedEdgeSelected = (nodeId: string) => {
  const displayedEdgeIds = useDisplayedEdgeIds(nodeId);
  return useIsAnyGraphPartSelected(displayedEdgeIds);
};

/**
 * Uses the filtered diagram so that indirect-edge neighbors are included.
 */
export const useIsDisplayedNeighborSelected = (nodeId: string) => {
  const displayedNeighborIds = useDisplayedNeighborIds(nodeId);
  return useIsAnyGraphPartSelected(displayedNeighborIds);
};

export const useCanGoBackForward = () => {
  const temporalStore = useTemporalStore();

  const canGoBack = temporalStore.pastStates.length > 0;
  const canGoForward = temporalStore.futureStates.length > 0;
  return [canGoBack, canGoForward];
};

// actions
export const setSelected = (graphPartId: string | null) => {
  const { selectedGraphPartId } = useSelectedPartStore.getState();
  if (selectedGraphPartId === graphPartId) return;

  useSelectedPartStore.setState({ selectedGraphPartId: graphPartId });

  emitter.emit("partSelected", graphPartId);
};

export const goBack = () => {
  useSelectedPartStore.temporal.getState().undo();
};

export const goForward = () => {
  useSelectedPartStore.temporal.getState().redo();
};

// util actions
/**
 * Generally we're assuming that "selected" implies our part can be persisted _or_ calculated.
 */
export const getSelectedGraphPart = (): GraphPart | CalculatedEdge | null => {
  const selectedGraphPartId = useSelectedPartStore.getState().selectedGraphPartId;
  if (!selectedGraphPartId) return null;

  if (isIndirectEdgeId(selectedGraphPartId)) {
    return getIndirectEdge(selectedGraphPartId);
  }

  return getGraphPart(selectedGraphPartId);
};
