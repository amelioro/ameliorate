import { Home } from "@mui/icons-material";
import { Breadcrumbs } from "@mui/material";

import { Tooltip } from "@/web/common/components/Tooltip/Tooltip";
import { IconNode } from "@/web/topic/components/Node/IconNode";
import { useAllNodes } from "@/web/topic/diagramStore/nodeHooks";
import {
  setSummaryNodeId,
  useSummaryBreadcrumbNodeIds,
  viewSummaryBreadcrumb,
} from "@/web/view/currentViewStore/summary";
import { setSelected } from "@/web/view/selectedPartStore";

export const SummaryBreadcrumbs = () => {
  const summaryBreadcrumbNodeIds = useSummaryBreadcrumbNodeIds();
  const summaryBreadcrumbNodes = useAllNodes(summaryBreadcrumbNodeIds);

  const breadcrumbsKey = summaryBreadcrumbNodeIds.join("-");

  return (
    <Breadcrumbs
      key={breadcrumbsKey} // force re-render when breadcrumbs change so that items get re-collapsed (otherwise items never re-collapse after expanding)
      maxItems={3}
      itemsBeforeCollapse={1} // always at least show home
      itemsAfterCollapse={2} // always at least show the previous node and current
      onClick={(event) => event.stopPropagation()} // e.g. prevent triggering node deselect from summary background click
      aria-label="Summary Breadcrumbs"
      className="[&_.MuiBreadcrumbs-separator]:mx-1 [&>ol]:flex-nowrap"
    >
      <Tooltip tooltipHeading="Summary Home">
        <button
          onClick={() => {
            setSelected(null);
            setSummaryNodeId(null);
          }}
          className="flex p-px" // match 20x20 px size of icon nodes
        >
          <Home fontSize="small" />
        </button>
      </Tooltip>

      {summaryBreadcrumbNodes.map((node, index) => (
        <IconNode
          key={node.id}
          node={node}
          onClick={() => {
            setSelected(node.id);
            viewSummaryBreadcrumb(index);
          }}
        />
      ))}
    </Breadcrumbs>
  );
};
