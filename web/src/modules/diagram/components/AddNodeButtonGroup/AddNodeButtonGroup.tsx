import { useContext } from "react";

import { As, DiagramContext } from "../Diagram/Diagram";
import { StyledButton, StyledButtonGroup } from "./AddNodeButtonGroup.styles";

interface Props {
  className?: string;
  nodeId: string;
  as: As;
}

export const AddNodeButtonGroup = ({ className, nodeId, as }: Props) => {
  const { addNode } = useContext(DiagramContext);

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
