import { ButtonGroup } from "@mui/material";

import { NodeType } from "../../../../common/node";
import { addableRelationsFrom } from "../../utils/edge";
import { type RelationDirection } from "../../utils/graph";
import { Orientation } from "../../utils/layout";
import { AddNodeButton } from "../Node/AddNodeButton";

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
      orientation={orientation === "DOWN" ? "horizontal" : "vertical"}
    >
      {addableRelations.map(({ toNodeType, relation }) => (
        <AddNodeButton
          key={toNodeType}
          fromPartId={fromNodeId}
          as={as}
          toNodeType={toNodeType}
          relation={relation}
        />
      ))}
    </ButtonGroup>
  );
};
