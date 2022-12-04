import { addNode } from "../../store/store";
import { type NodeRelation } from "../../utils/diagram";
import { NodeType, nodeDecorations } from "../../utils/nodes";
import { StyledButton } from "./AddNodeButton.styles";

interface Props {
  nodeId: string;
  as: NodeRelation;
  nodeType: NodeType;
}

export const AddNodeButton = ({ nodeId, as, nodeType }: Props) => {
  const decoration = nodeDecorations[nodeType];

  return (
    <StyledButton
      color={decoration.themeColor}
      size="small"
      onClick={() => addNode(nodeId, as, nodeType)}
    >
      <decoration.NodeIcon />
    </StyledButton>
  );
};
