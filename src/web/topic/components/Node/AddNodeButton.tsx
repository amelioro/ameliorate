import { Typography } from "@mui/material";
import { lowerCase, startCase } from "es-toolkit";
import { useContext } from "react";

import { NodeType } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { StyledButton } from "@/web/topic/components/Node/AddNodeButton.styles";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { addNode, addNodeWithoutParent } from "@/web/topic/diagramStore/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Relation } from "@/web/topic/utils/edge";
import { type RelationDirection } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

/**
 * Either we add a node with a relation to an existing node, or we add a node without a parent.
 *
 * This is a little awkward, but I think we'll end up changing the UX of how we add nodes anyway
 * (using a single plus button that opens a menu to each type to add) so this'll hopefully get refactored.
 */
type RelationProps =
  | {
      fromPartId: string;
      as: RelationDirection;
      relation: Relation;
    }
  | {
      fromPartId?: undefined;
      as?: undefined;
      relation?: undefined;
    };

interface NonRelationProps {
  toNodeType: NodeType;
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
}: NonRelationProps & RelationProps) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const context = useContext(WorkspaceContext);

  if (!userCanEditTopicData) return <></>;

  const decoration = nodeDecorations[toNodeType];
  const titleSuffix =
    relation === undefined
      ? ""
      : as === "parent"
        ? ` (this ${startCase(relation.child)} '${lowerCase(relation.name)}')`
        : ` ('${lowerCase(relation.name)}' this ${startCase(relation.parent)})`;

  return (
    <StyledButton
      // hide overflow because the "+" can overflow a little at the edge"
      className={"overflow-hidden" + (className ? ` ${className}` : "")}
      color={toNodeType}
      size="small"
      variant="contained"
      onClick={(event) => {
        event.stopPropagation(); // don't trigger selection of node

        if (fromPartId === undefined) addNodeWithoutParent(toNodeType, context, selectNewNode);
        else addNode({ fromPartId, as, toNodeType, relation, context, selectNewNode });
      }}
      // Not using MUI Tooltip because it throws anchorEl missing error when the button is hidden
      // after hovering it. Think we'd have to pass `show` into this component in order to hide
      // the tooltip at the same time as the button, rather than relying on css from the FlowNode,
      // but that'd be slightly annoying to do.
      title={`Add new ${decoration.title}` + titleSuffix}
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
