import { Button, MenuItem, useTheme } from "@mui/material";
import { useCallback, useContext } from "react";

import { NodeType } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
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
  className?: string;
}

export const AddNodeButton = ({
  fromNodeId,
  addableRelation,
  addableNodeType,
  buttonType = "button",
  onClick,
  selectNewNode,
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
        addNodeWithoutParent(addableNodeType, context, selectNewNode);
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

  const decoration = nodeDecorations[toNodeType];

  const fromDirection = addableRelation?.as === "parent" ? "child" : "parent";
  const titleSuffix =
    addableRelation === undefined
      ? ""
      : ` (${getDirectedRelationDescription({ ...addableRelation, this: fromDirection })})`;

  return buttonType === "menu" ? (
    <MenuItem className={className} onClick={memoizedOnClick}>
      <decoration.NodeIcon
        className="mr-2 rounded p-0.5"
        sx={{ backgroundColor: theme.palette[toNodeType].main }}
      />
      <span>
        Add {decoration.title}
        <i className="ml-1 text-slate-400">{titleSuffix}</i>
      </span>
    </MenuItem>
  ) : (
    <Button
      className={"text-[0.5em]" + (className ? ` ${className}` : "")}
      color={toNodeType}
      size="small"
      variant="contained"
      onClick={memoizedOnClick}
      // Not using MUI Tooltip because it throws anchorEl missing error when the button is hidden
      // after hovering it. Think we'd have to pass `show` into this component in order to hide
      // the tooltip at the same time as the button, rather than relying on css from the FlowNode,
      // but that'd be slightly annoying to do.
      title={`Add ${decoration.title}` + titleSuffix}
      aria-label={`Add ${decoration.title}` + titleSuffix}
    >
      <decoration.NodeIcon />
    </Button>
  );
};
