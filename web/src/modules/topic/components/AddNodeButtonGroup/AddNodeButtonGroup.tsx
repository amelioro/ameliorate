import { ButtonGroup } from "@mui/material";

import { type RelationDirection } from "../../utils/diagram";
import { addableRelationsFrom } from "../../utils/edge";
import { Orientation } from "../../utils/layout";
import { NodeType } from "../../utils/nodes";
import { AddNodeButton } from "../AddNodeButton/AddNodeButton";

interface Props {
  className?: string;
  nodeId: string;
  nodeType: NodeType;
  as: RelationDirection;
  orientation: Orientation;
}

export const AddNodeButtonGroup = ({ className, nodeId, nodeType, as, orientation }: Props) => {
  const addableRelations = addableRelationsFrom(nodeType, as);

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
          nodeId={nodeId}
          as={as}
          toNodeType={toNodeType}
          relation={relation}
        />
      ))}
    </ButtonGroup>
  );
};
