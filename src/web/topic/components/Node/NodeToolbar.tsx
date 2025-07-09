import { Schema, ViewCarousel } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { Node } from "@/web/topic/utils/graph";
import { viewNodeInDiagram } from "@/web/view/currentViewStore/filter";
import { useFormat } from "@/web/view/currentViewStore/store";
import { viewNodeInSummary } from "@/web/view/currentViewStore/summary";

interface Props {
  node: Node;
}

export const NodeToolbar = ({ node }: Props) => {
  const format = useFormat();

  return (
    <div className="absolute -right-3 top-1/2 -translate-y-1/2 translate-x-full flex-col rounded border shadow">
      {format === "diagram" && (
        <IconButton
          title="View node in summary"
          aria-label="View node in summary"
          size="small"
          onClick={() => {
            viewNodeInSummary(node.id);
          }}
        >
          <ViewCarousel fontSize="inherit" />
        </IconButton>
      )}

      {format !== "diagram" && (
        <IconButton
          title="View node in diagram"
          aria-label="View node in diagram"
          size="small"
          onClick={() => {
            viewNodeInDiagram(node.id);
          }}
        >
          <Schema fontSize="inherit" />
        </IconButton>
      )}
    </div>
  );
};
