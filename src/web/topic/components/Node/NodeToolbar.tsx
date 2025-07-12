import { InfoOutlined, MoreHoriz, Schema, ViewCarousel } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { emitter } from "@/web/common/event";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { WorkspaceContextType } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { Node } from "@/web/topic/utils/graph";
import { viewNodeInDiagram } from "@/web/view/currentViewStore/filter";
import { useFormat } from "@/web/view/currentViewStore/store";
import { viewNodeInSummary } from "@/web/view/currentViewStore/summary";
import { setSelected } from "@/web/view/selectedPartStore";

interface Props {
  node: Node;
  context: WorkspaceContextType;
}

export const NodeToolbar = ({ node, context }: Props) => {
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

      {context !== "details" && (
        <IconButton
          title="View node details"
          aria-label="View node details"
          size="small"
          onClick={() => {
            setSelected(node.id);
            emitter.emit("viewBasics");
          }}
          className="rounded"
        >
          <InfoOutlined fontSize="inherit" />
        </IconButton>
      )}

      <IconButton
        title="View node actions"
        aria-label="View node actions"
        size="small"
        onClick={(event) => {
          // TODO: ideally this would open like a menu from the IconButton, not from the mouse position
          openContextMenu(event, { node: node });
        }}
        className="rounded"
      >
        <MoreHoriz fontSize="inherit" />
      </IconButton>
    </div>
  );
};
