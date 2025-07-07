import { Typography } from "@mui/material";
import { lowerCase, startCase } from "es-toolkit";
import { useContext } from "react";

import { NodeType } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { StyledButton } from "@/web/topic/components/Node/AddNodeButton.styles";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { addNode } from "@/web/topic/diagramStore/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Relation } from "@/web/topic/utils/edge";
import { type RelationDirection } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  fromPartId: string;
  as: RelationDirection;
  toNodeType: NodeType;
  relation: Relation;
  /**
   * Generally want to select the new node to highlight it in the view, but some cases we want to
   * avoid changing selection so that the view isn't impacted as much (e.g. from the details pane)
   */
  selectNewNode?: boolean;
  className?: string;
}

export const AddNodeButton = ({
  fromPartId,
  as,
  toNodeType,
  relation,
  selectNewNode,
  className,
}: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const context = useContext(WorkspaceContext);

  if (!userCanEditTopicData) return <></>;

  const decoration = nodeDecorations[toNodeType];

  return (
    <StyledButton
      // hide overflow because the "+" can overflow a little at the edge"
      className={"overflow-hidden" + (className ? ` ${className}` : "")}
      color={toNodeType}
      size="small"
      variant="contained"
      onClick={(event) => {
        event.stopPropagation(); // don't trigger selection of node
        addNode({ fromPartId, as, toNodeType, relation, context, selectNewNode });
      }}
      // Not using MUI Tooltip because it throws anchorEl missing error when the button is hidden
      // after hovering it. Think we'd have to pass `show` into this component in order to hide
      // the tooltip at the same time as the button, rather than relying on css from the FlowNode,
      // but that'd be slightly annoying to do.
      title={
        `Add new ${decoration.title} (` +
        (as === "parent"
          ? `this ${startCase(relation.child)} '${lowerCase(relation.name)}'`
          : `'${lowerCase(relation.name)}' this ${startCase(relation.parent)}`) +
        `)`
      }
      aria-label={`Add new ${decoration.title}`}
    >
      <decoration.NodeIcon />
      <Typography
        className="absolute bottom-[-10%] right-[5%] text-sm font-bold"
        aria-hidden="true"
      >
        +
      </Typography>
    </StyledButton>
  );
};
