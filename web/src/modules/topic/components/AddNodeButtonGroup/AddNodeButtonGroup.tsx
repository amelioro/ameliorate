import { AddNodeButton } from "../AddNodeButton/AddNodeButton";
import { As, useDiagramStore } from "../Diagram.store";
import { StyledButtonGroup } from "./AddNodeButtonGroup.styles";

interface Props {
  className?: string;
  nodeId: string;
  as: As;
}

export const AddNodeButtonGroup = ({ className, nodeId, as }: Props) => {
  const direction = useDiagramStore((state) => state.direction);

  return (
    <>
      <StyledButtonGroup
        variant="contained"
        aria-label="add node button group"
        className={className}
        orientation={direction === "TB" ? "horizontal" : "vertical"}
      >
        <AddNodeButton nodeId={nodeId} as={as} nodeType="Problem" />
        <AddNodeButton nodeId={nodeId} as={as} nodeType="Solution" />
      </StyledButtonGroup>
    </>
  );
};
