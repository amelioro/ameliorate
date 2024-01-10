import { temporal } from "zundo";
import { create, useStore } from "zustand";

import { useGraphPart } from "../topic/store/graphPartHooks";
import { useNode } from "../topic/store/nodeHooks";

interface NavigateStoreState {
  selectedGraphPartId: string | null;
  viewingExploreDiagram: boolean;

  viewingCriteriaTable: boolean;
  activeTableProblemId: string | null;

  viewingClaimTree: boolean;
  activeClaimTreeId: string | null;
}

const initialState: NavigateStoreState = {
  selectedGraphPartId: null,
  viewingExploreDiagram: false,

  viewingCriteriaTable: false,
  activeTableProblemId: null,

  viewingClaimTree: false,
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

export const useActiveView = () => {
  return useNavigateStore((state) => {
    if (state.viewingClaimTree) return "claimTree";
    if (state.viewingCriteriaTable) return "criteriaTable";
    if (state.viewingExploreDiagram) return "exploreDiagram";
    return "topicDiagram";
  });
};

export const useSecondaryView = () => {
  return useNavigateStore((state) => {
    if (state.viewingClaimTree) {
      // only claim tree is layered in front of another view for now
      if (state.viewingCriteriaTable) return "criteriaTable";
      if (state.viewingExploreDiagram) return "exploreDiagram";
      return "topicDiagram";
    }
    return null;
  });
};

export const useActiveTableProblemNode = () => {
  const activeTableProblemId = useNavigateStore((state) => state.activeTableProblemId);

  return useNode(activeTableProblemId);
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
  useNavigateStore.setState({
    viewingExploreDiagram: false,
    viewingCriteriaTable: false,
    viewingClaimTree: false,
  });
};

export const viewExploreDiagram = () => {
  useNavigateStore.setState({
    viewingExploreDiagram: true,
    viewingCriteriaTable: false,
    viewingClaimTree: false,
  });
};

export const closeExploreDiagram = () => {
  useNavigateStore.setState({ viewingExploreDiagram: false });
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useNavigateStore.setState({
    viewingCriteriaTable: true,
    viewingClaimTree: false,
    activeTableProblemId: problemNodeId,
  });
};

export const closeTable = () => {
  useNavigateStore.setState({ viewingCriteriaTable: false });
};

export const viewClaimTree = (arguedDiagramPartId: string) => {
  useNavigateStore.setState({ viewingClaimTree: true, activeClaimTreeId: arguedDiagramPartId });
};

export const closeClaimTree = () => {
  useNavigateStore.setState({ viewingClaimTree: false });
};

export const goBack = () => {
  useNavigateStore.temporal.getState().undo();
};

export const goForward = () => {
  useNavigateStore.temporal.getState().redo();
};

export const resetNavigation = () => {
  useNavigateStore.setState(initialState);
  useNavigateStore.temporal.getState().clear();
};
