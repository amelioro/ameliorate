import { useContext } from "react";

import { NodeType } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { StyledButton } from "@/web/topic/components/Node/AddNodeButton.styles";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { addNode, addNodeWithoutParent } from "@/web/topic/diagramStore/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { DirectedToRelation, getDirectedRelationDescription } from "@/web/topic/utils/edge";
import { nodeDecorations } from "@/web/topic/utils/node";

/**
 * Either we add a node with a relation to an existing node, or we add a node without a parent.
 */
type AddableProps =
  | {
      fromNodeId: string;
      addableRelation: DirectedToRelation;
      addableNodeType?: undefined;
    }
  | {
      fromNodeId?: undefined;
      addableRelation?: undefined;
      addableNodeType: NodeType;
    };

interface Props {
  /**
   * Generally want to select the new node to highlight it in the view, but some cases we want to
   * avoid changing selection so that the view isn't impacted as much (e.g. from the details pane)
   */
  selectNewNode?: boolean;
  className?: string;
}

export const AddNodeButton = ({
  fromNodeId,
  addableRelation,
  addableNodeType,
  selectNewNode,
  className,
}: Props & AddableProps) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const context = useContext(WorkspaceContext);

  if (!userCanEditTopicData) return <></>;

  const toNodeType = addableRelation ? addableRelation[addableRelation.as] : addableNodeType;

  const decoration = nodeDecorations[toNodeType];
  const fromDirection = addableRelation?.as === "parent" ? "child" : "parent";
  const titleSuffix =
    addableRelation === undefined
      ? ""
      : ` (${getDirectedRelationDescription({ ...addableRelation, this: fromDirection })})`;

  return (
    <StyledButton
      className={className}
      color={toNodeType}
      size="small"
      variant="contained"
      onClick={(event) => {
        event.stopPropagation(); // don't trigger selection of node

        if (fromNodeId === undefined) addNodeWithoutParent(toNodeType, context, selectNewNode);
        else {
          addNode({
            fromPartId: fromNodeId,
            directedRelation: addableRelation,
            context,
            selectNewNode,
          });
        }
      }}
      // Not using MUI Tooltip because it throws anchorEl missing error when the button is hidden
      // after hovering it. Think we'd have to pass `show` into this component in order to hide
      // the tooltip at the same time as the button, rather than relying on css from the FlowNode,
      // but that'd be slightly annoying to do.
      title={`Add new ${decoration.title}` + titleSuffix}
      aria-label={`Add new ${decoration.title}`}
    >
      <decoration.NodeIcon />
    </StyledButton>
  );
};
