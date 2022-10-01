import { As } from "../Diagram/Diagram";
import { StyledButton, StyledButtonGroup } from "./AddNodeButtonGroup.styles";

interface Props {
  className?: string;
  addNode: (_toNode: string, _as: As) => void;
  nodeId: string;
  as: As;
}

export const AddNodeButtonGroup = ({ className, addNode, nodeId, as }: Props) => {
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
