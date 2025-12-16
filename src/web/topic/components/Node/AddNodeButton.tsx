import { Button, MenuItem, useTheme } from "@mui/material";
import { useCallback, useContext } from "react";

import { NodeType, prettyNodeTypes } from "@/common/node";
import { Tooltip } from "@/web/common/components/Tooltip/Tooltip";
import { useSessionUser } from "@/web/common/hooks";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { addNode, addNodeWithoutEdge } from "@/web/topic/diagramStore/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { DirectedToRelation, getDirectedRelationDescription } from "@/web/topic/utils/edge";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

/**
 * Either we add a node with a relation to an existing node, or we add a node without an edge.
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
  buttonType?: "menu" | "button";
  /**
   * Mainly used when button type is 'menu', in order to close the menu after clicking
   */
  onClick?: () => void;
  /**
   * Generally want to select the new node to highlight it in the view, but some cases we want to
   * avoid changing selection so that the view isn't impacted as much (e.g. from the details pane)
   */
  selectNewNode?: boolean;
  /**
   * Mainly because if the button is showing above the node, and the tooltip shows below, then it
   * gets annoying when you move the mouse down back to the node but you hit the tooltip instead,
   * removing hover from the button and therefore hiding it but keeping the tooltip shown.
   */
  tooltipDirection?: "top" | "bottom";
  className?: string;
}

export const AddNodeButton = ({
  fromNodeId,
  addableRelation,
  addableNodeType,
  buttonType = "button",
  onClick,
  selectNewNode,
  tooltipDirection = "bottom",
  className,
}: Props & AddableProps) => {
  const theme = useTheme();

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const context = useContext(WorkspaceContext);

  const memoizedOnClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation(); // don't trigger selection of node

      if (fromNodeId === undefined) {
        addNodeWithoutEdge(addableNodeType, context, selectNewNode);
      } else {
        addNode({
          fromPartId: fromNodeId,
          directedRelation: addableRelation,
          context,
          selectNewNode,
        });
      }

      if (onClick) onClick();
    },
    [fromNodeId, addableRelation, addableNodeType, context, selectNewNode, onClick],
  );

  if (!userCanEditTopicData) return <></>;

  const toNodeType = addableRelation ? addableRelation[addableRelation.as] : addableNodeType;

  const NodeIcon = nodeDecorations[toNodeType].NodeIcon;
  const title = prettyNodeTypes[toNodeType];

  const titleSuffix =
    addableRelation === undefined ? "" : ` (${getDirectedRelationDescription(addableRelation)})`;

  return buttonType === "menu" ? (
    <MenuItem className={className} onClick={memoizedOnClick}>
      <NodeIcon
        className="mr-2 rounded-sm p-0.5"
        sx={{ backgroundColor: theme.palette[toNodeType].main }}
      />
      <span>
        Add {title}
        <i className="ml-1 text-slate-400">{titleSuffix}</i>
      </span>
    </MenuItem>
  ) : (
    <Tooltip
      tooltipHeading={`Add ${title}` + titleSuffix}
      placement={tooltipDirection}
      immediatelyOpenOnTouch={false}
      childrenHideViaCss={true}
    >
      <Button
        className={"text-[0.5em]" + (className ? ` ${className}` : "")}
        color={toNodeType}
        size="small"
        variant="contained"
        onClick={memoizedOnClick}
      >
        <NodeIcon />
      </Button>
    </Tooltip>
  );
};
