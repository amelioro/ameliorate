import { As, useDiagramStore } from "../Diagram.store";
import { NodeType, nodeDecorations } from "../nodeDecorations";
import { StyledButton } from "./AddNodeButton.styles";

interface Props {
  nodeId: string;
  as: As;
  nodeType: NodeType;
}

export const AddNodeButton = ({ nodeId, as, nodeType }: Props) => {
  const addNode = useDiagramStore((state) => state.addNode);

  const decoration = nodeDecorations[nodeType];

  return (
    <StyledButton color={decoration.themeColor} onClick={() => addNode(nodeId, as, nodeType)}>
      {nodeType}
    </StyledButton>
  );
};
