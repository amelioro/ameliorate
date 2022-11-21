import { ButtonGroup } from "@mui/material";

import { AddNodeButton } from "../AddNodeButton/AddNodeButton";
import { NodeRelation, useDiagramStore } from "../Diagram.store";
import { NodeType, nodeDecorations } from "../nodeDecorations";

interface Props {
  className?: string;
  nodeId: string;
  nodeType: NodeType;
  as: NodeRelation;
}

export const AddNodeButtonGroup = ({ className, nodeId, nodeType, as }: Props) => {
  const direction = useDiagramStore((state) => state.direction);
  const buttonTypes = nodeDecorations[nodeType].allowed[as];

  if (buttonTypes.length === 0) return <></>;

  return (
    <ButtonGroup
      variant="contained"
      aria-label="add node button group"
      className={className}
      orientation={direction === "TB" ? "horizontal" : "vertical"}
    >
      {buttonTypes.map((type) => (
        <AddNodeButton key={type} nodeId={nodeId} as={as} nodeType={type} />
      ))}
    </ButtonGroup>
  );
};
