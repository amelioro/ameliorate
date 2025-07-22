import { shallow } from "zustand/shallow";

import { Category } from "@/web/summary/summary";
import { useAllNodes } from "@/web/topic/diagramStore/nodeHooks";
import { useCurrentViewStore } from "@/web/view/currentViewStore/store";

// hooks
export const useSummaryNode = () => {
  // note: this'll re-render when breadcrumbs change, but I'm not sure how to avoid this while also
  // re-rendering when a node is deleted
  const breadcrumbNodeIds = useSummaryBreadcrumbNodeIds();
  const breadcrumbNodes = useAllNodes(breadcrumbNodeIds);

  // Use the last breadcrumb node as the summary node, because breadcrumbs' last should always be the summary node.
  // e.g. if the summary node is deleted, we should be falling back to display the next breadcrumb node as the summary node.
  return breadcrumbNodes.at(-1) ?? null;
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

  const currentSummaryNodeId = state.summaryBreadcrumbNodeIds.at(-1) ?? null;
  if (currentSummaryNodeId === nodeId) return;

  useCurrentViewStore.setState(
    {
      summaryBreadcrumbNodeIds:
        nodeId === null
          ? []
          : appendBreadcrumb
            ? [...state.summaryBreadcrumbNodeIds, nodeId]
            : [nodeId],
    },
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
      summaryBreadcrumbNodeIds: [nodeId], // reset these because if we're setting the format to summary, we're navigating to the summary from a different view
    },
    false,
    "viewNodeInSummary",
  );
};

export const viewSummaryBreadcrumb = (index: number) => {
  const state = useCurrentViewStore.getState();

  // keep the breadcrumb trail up to the clicked node
  const newSummaryBreadcrumbNodeIds = state.summaryBreadcrumbNodeIds.slice(0, index + 1);

  useCurrentViewStore.setState(
    {
      summaryBreadcrumbNodeIds: newSummaryBreadcrumbNodeIds,
    },
    false,
    "viewSummaryBreadcrumb",
  );
};
