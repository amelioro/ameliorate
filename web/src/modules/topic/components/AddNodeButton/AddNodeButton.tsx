import { NodeRelation, useDiagramStore } from "../../store/store";
import { NodeType, nodeDecorations } from "../nodeDecorations";
import { StyledButton } from "./AddNodeButton.styles";

interface Props {
  nodeId: string;
  as: NodeRelation;
  nodeType: NodeType;
}

export const AddNodeButton = ({ nodeId, as, nodeType }: Props) => {
  const addNode = useDiagramStore((state) => state.addNode);

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
