import { ButtonGroup } from "@mui/material";

import { type RelationDirection } from "../../utils/diagram";
import { addableRelationsFrom } from "../../utils/edge";
import { Orientation } from "../../utils/layout";
import { NodeType } from "../../utils/nodes";
import { AddNodeButton } from "../AddNodeButton/AddNodeButton";

interface Props {
  className?: string;
  fromNodeId: string;
  fromNodeType: NodeType;
  as: RelationDirection;
  orientation: Orientation;
}

export const AddNodeButtonGroup = ({
  className,
  fromNodeId,
  fromNodeType,
  as,
  orientation,
}: Props) => {
  const addableRelations = addableRelationsFrom(fromNodeType, as);

  if (addableRelations.length === 0) return <></>;

  return (
    <ButtonGroup
      variant="contained"
      aria-label="add node button group"
      className={className}
      orientation={orientation === "TB" ? "horizontal" : "vertical"}
    >
      {addableRelations.map(({ toNodeType, relation }) => (
        <AddNodeButton
          key={toNodeType}
          fromNodeId={fromNodeId}
          as={as}
          toNodeType={toNodeType}
          relation={relation}
        />
      ))}
    </ButtonGroup>
  );
};
