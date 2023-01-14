import { addNode } from "../../store/actions";
import { type RelationDirection } from "../../utils/diagram";
import { RelationName } from "../../utils/edge";
import { NodeType, nodeDecorations } from "../../utils/nodes";
import { StyledButton } from "./AddNodeButton.styles";

interface Props {
  nodeId: string;
  as: RelationDirection;
  toNodeType: NodeType;
  relation: RelationName;
}

export const AddNodeButton = ({ nodeId, as, toNodeType, relation }: Props) => {
  const decoration = nodeDecorations[toNodeType];

  return (
    <StyledButton
      color={toNodeType}
      size="small"
      onClick={() => addNode(nodeId, as, toNodeType, relation)}
    >
      <decoration.NodeIcon />
    </StyledButton>
  );
};
