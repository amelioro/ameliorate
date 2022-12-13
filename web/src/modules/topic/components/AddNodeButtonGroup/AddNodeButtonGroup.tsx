import { ButtonGroup } from "@mui/material";

import { type NodeRelation } from "../../utils/diagram";
import { Direction } from "../../utils/layout";
import { NodeType, nodeDecorations } from "../../utils/nodes";
import { AddNodeButton } from "../AddNodeButton/AddNodeButton";

interface Props {
  className?: string;
  nodeId: string;
  nodeType: NodeType;
  as: NodeRelation;
  direction: Direction;
}

export const AddNodeButtonGroup = ({ className, nodeId, nodeType, as, direction }: Props) => {
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
