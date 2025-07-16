import { shallow } from "zustand/shallow";

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

export const useSummaryBreadcrumbNodeIds = () => {
  return useCurrentViewStore((state) => state.summaryBreadcrumbNodeIds, shallow);
};

// actions
/**
 * @param appendBreadcrumb append node to breadcrumb if true, otherwise reset breadcrumb to just this node.
 */
export const setSummaryNodeId = (nodeId: string | null, appendBreadcrumb = false) => {
  const state = useCurrentViewStore.getState();

  if (state.summaryNodeId === nodeId) return;

  const newSummaryBreadcrumbNodeIds =
    nodeId === null
      ? []
      : appendBreadcrumb
        ? [...state.summaryBreadcrumbNodeIds, nodeId]
        : [nodeId];

  useCurrentViewStore.setState(
    { summaryNodeId: nodeId, summaryBreadcrumbNodeIds: newSummaryBreadcrumbNodeIds },
    false,
    "setSummaryNodeId",
  );
};

export const setSelectedSummaryTab = (tab: Category) => {
  useCurrentViewStore.setState({ selectedSummaryTab: tab }, false, "setSelectedSummaryTab");
};

export const viewNodeInSummary = (nodeId: string) => {
  useCurrentViewStore.setState(
    {
      format: "summary",
      summaryNodeId: nodeId,
      summaryBreadcrumbNodeIds: [nodeId], // reset these because if we're setting the format to summary, we're navigating to the summary from a different view
    },
    false,
    "viewNodeInSummary",
  );
};

export const viewSummaryBreadcrumb = (index: number) => {
  const state = useCurrentViewStore.getState();

  const summaryNodeId = state.summaryBreadcrumbNodeIds[index] ?? null;

  useCurrentViewStore.setState(
    {
      summaryNodeId,
      summaryBreadcrumbNodeIds: state.summaryBreadcrumbNodeIds.slice(0, index + 1), // keep the breadcrumb trail up to the clicked node
    },
    false,
    "viewSummaryBreadcrumb",
  );
};
