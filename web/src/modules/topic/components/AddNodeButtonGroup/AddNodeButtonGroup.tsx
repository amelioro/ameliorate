import { AddNodeButton } from "../AddNodeButton/AddNodeButton";
import { As } from "../Diagram.store";
import { StyledButtonGroup } from "./AddNodeButtonGroup.styles";

interface Props {
  className?: string;
  nodeId: string;
  as: As;
}

export const AddNodeButtonGroup = ({ className, nodeId, as }: Props) => {
  return (
    <>
      <StyledButtonGroup
        variant="contained"
        aria-label="add node button group"
        className={className}
      >
        <AddNodeButton nodeId={nodeId} as={as} nodeType="Problem" />
        <AddNodeButton nodeId={nodeId} as={as} nodeType="Solution" />
      </StyledButtonGroup>
    </>
  );
};
