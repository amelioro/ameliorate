import { ButtonGroup } from "@mui/material";

import { AddNodeButton } from "../AddNodeButton/AddNodeButton";
import { As, useDiagramStore } from "../Diagram.store";

interface Props {
  className?: string;
  nodeId: string;
  as: As;
}

export const AddNodeButtonGroup = ({ className, nodeId, as }: Props) => {
  const direction = useDiagramStore((state) => state.direction);

  return (
    <ButtonGroup
      variant="contained"
      aria-label="add node button group"
      className={className}
      orientation={direction === "TB" ? "horizontal" : "vertical"}
    >
      <AddNodeButton nodeId={nodeId} as={as} nodeType="Problem" />
      <AddNodeButton nodeId={nodeId} as={as} nodeType="Solution" />
    </ButtonGroup>
  );
};
