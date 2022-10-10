import { As, useDiagramStore } from "../Diagram.store";
import { StyledButton, StyledButtonGroup } from "./AddNodeButtonGroup.styles";

interface Props {
  className?: string;
  nodeId: string;
  as: As;
}

export const AddNodeButtonGroup = ({ className, nodeId, as }: Props) => {
  const addNode = useDiagramStore((state) => state.addNode);

  return (
    <>
      <StyledButtonGroup
        variant="contained"
        aria-label="add node button group"
        className={className}
      >
        <StyledButton onClick={() => addNode(nodeId, as)}>Problem</StyledButton>
        <StyledButton onClick={() => addNode(nodeId, as)}>Solution</StyledButton>
      </StyledButtonGroup>
    </>
  );
};
