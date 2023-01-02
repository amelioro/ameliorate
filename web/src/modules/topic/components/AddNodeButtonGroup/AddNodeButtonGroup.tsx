import { ButtonGroup } from "@mui/material";

import { type RelationDirection } from "../../utils/diagram";
import { Orientation } from "../../utils/layout";
import { NodeType, nodeDecorations } from "../../utils/nodes";
import { AddNodeButton } from "../AddNodeButton/AddNodeButton";

interface Props {
  className?: string;
  nodeId: string;
  nodeType: NodeType;
  as: RelationDirection;
  orientation: Orientation;
}

export const AddNodeButtonGroup = ({ className, nodeId, nodeType, as, orientation }: Props) => {
  const buttonTypes = nodeDecorations[nodeType].allowed[as];

  if (buttonTypes.length === 0) return <></>;

  return (
    <ButtonGroup
      variant="contained"
      aria-label="add node button group"
      className={className}
      orientation={orientation === "TB" ? "horizontal" : "vertical"}
    >
      {buttonTypes.map((type) => (
        <AddNodeButton key={type} nodeId={nodeId} as={as} nodeType={type} />
      ))}
    </ButtonGroup>
  );
};
