import { temporal } from "zundo";
import { create, useStore } from "zustand";

import { useGraphPart } from "../topic/store/graphPartHooks";
import { useNode } from "../topic/store/nodeHooks";

interface NavigateStoreState {
  selectedGraphPartId: string | null;
  activeTableProblemId: string | null;
  activeClaimTreeId: string | null;
}

const initialState: NavigateStoreState = {
  selectedGraphPartId: null,
  activeTableProblemId: null,
  activeClaimTreeId: null,
};

const useNavigateStore = create<NavigateStoreState>()(temporal(() => initialState));

// temporal store is a vanilla store, we need to wrap it to use it as a hook and be able to react to changes
const useTemporalStore = () => useStore(useNavigateStore.temporal);

// hooks
export const useSelectedGraphPart = () => {
  const selectedGraphPartId = useNavigateStore((state) => state.selectedGraphPartId);

  return useGraphPart(selectedGraphPartId);
};

export const useIsGraphPartSelected = (graphPartId: string) => {
  return useNavigateStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return state.selectedGraphPartId === graphPartId;
  });
};

export const useIsAnyGraphPartSelected = (graphPartIds: string[]) => {
  return useNavigateStore((state) => {
    if (!state.selectedGraphPartId) return false;
    return graphPartIds.includes(state.selectedGraphPartId);
  });
};

export const useActiveTableProblemNode = () => {
  const activeTableProblemId = useNavigateStore((state) => state.activeTableProblemId);

  return useNode(activeTableProblemId);
};

export const useIsTableActive = () => {
  return useNavigateStore(
    (state) => state.activeClaimTreeId === null && state.activeTableProblemId !== null
  );
};

export const useActiveArguedDiagramPart = () => {
  const activeClaimTreeId = useNavigateStore((state) => state.activeClaimTreeId);

  return useGraphPart(activeClaimTreeId);
};

export const useCanGoBackForward = () => {
  const temporalStore = useTemporalStore();

  const canGoBack = temporalStore.pastStates.length > 0;
  const canGoForward = temporalStore.futureStates.length > 0;
  return [canGoBack, canGoForward];
};

// actions
export const setSelected = (graphPartId: string | null) => {
  useNavigateStore.setState({ selectedGraphPartId: graphPartId });
};

export const viewTopicDiagram = () => {
  useNavigateStore.setState({ activeTableProblemId: null, activeClaimTreeId: null });
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useNavigateStore.setState({ activeTableProblemId: problemNodeId, activeClaimTreeId: null });
};

export const closeTable = () => {
  useNavigateStore.setState({ activeTableProblemId: null });
};

export const viewClaimTree = (arguedDiagramPartId: string) => {
  useNavigateStore.setState({ activeClaimTreeId: arguedDiagramPartId });
};

export const closeClaimTree = () => {
  useNavigateStore.setState({ activeClaimTreeId: null });
};

export const goBack = () => {
  useNavigateStore.temporal.getState().undo();
};

export const goForward = () => {
  useNavigateStore.temporal.getState().redo();
};
