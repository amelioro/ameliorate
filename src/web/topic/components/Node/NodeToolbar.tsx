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
    <div className="flex flex-col rounded border bg-paperShaded-main shadow">
      {format === "diagram" && (
        <IconButton
          title="View node in summary"
          aria-label="View node in summary"
          size="small"
          onClick={() => {
            viewNodeInSummary(node.id);
          }}
          className="rounded"
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
          className="rounded"
        >
          <Schema fontSize="inherit" />
        </IconButton>
      )}
    </div>
  );
};
