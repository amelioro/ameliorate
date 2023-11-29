import { addNode } from "../../store/createDeleteActions";
import { type RelationDirection } from "../../utils/diagram";
import { Relation } from "../../utils/edge";
import { FlowNodeType, nodeDecorations } from "../../utils/node";
import { StyledButton } from "./AddNodeButton.styles";

interface Props {
  fromNodeId: string;
  as: RelationDirection;
  toNodeType: FlowNodeType;
  relation: Relation;
  className?: string;
}

export const AddNodeButton = ({ fromNodeId, as, toNodeType, relation, className }: Props) => {
  const decoration = nodeDecorations[toNodeType];

  return (
    <StyledButton
      className={className}
      color={toNodeType}
      size="small"
      variant="contained"
      onClick={(event) => {
        event.stopPropagation(); // don't trigger selection of node
        addNode({ fromNodeId, as, toNodeType, relation });
      }}
      // Not using MUI Tooltip because it throws anchorEl missing error when the button is hidden
      // after hovering it. Think we'd have to pass `show` into this component in order to hide
      // the tooltip at the same time as the button, rather than relying on css from the FlowNode,
      // but that'd be slightly annoying to do.
      title={`Add new ${decoration.title}`}
      aria-label={`Add new ${decoration.title}`}
    >
      <decoration.NodeIcon />
    </StyledButton>
  );
};
