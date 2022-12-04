import { ButtonGroup } from "@mui/material";

import { useActiveDirection } from "../../store/store";
import { type NodeRelation } from "../../utils/diagram";
import { NodeType, nodeDecorations } from "../../utils/nodes";
import { AddNodeButton } from "../AddNodeButton/AddNodeButton";

interface Props {
  className?: string;
  nodeId: string;
  nodeType: NodeType;
  as: NodeRelation;
}

export const AddNodeButtonGroup = ({ className, nodeId, nodeType, as }: Props) => {
  const direction = useActiveDirection();
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
