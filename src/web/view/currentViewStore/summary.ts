import { Category } from "@/web/summary/summary";
import { useNode } from "@/web/topic/diagramStore/nodeHooks";
import { useCurrentViewStore } from "@/web/view/currentViewStore/store";

// hooks
export const useSummaryNode = () => {
  const summaryNodeId = useCurrentViewStore((state) => state.summaryNodeId);
  return useNode(summaryNodeId);
};

export const useSelectedSummaryTab = () => {
  return useCurrentViewStore((state) => state.selectedSummaryTab);
};

// actions
export const setSummaryNodeId = (nodeId: string | null) => {
  useCurrentViewStore.setState({ summaryNodeId: nodeId }, false, "setSummaryNodeId");
};

export const setSelectedSummaryTab = (tab: Category) => {
  useCurrentViewStore.setState({ selectedSummaryTab: tab }, false, "setSelectedSummaryTab");
};
