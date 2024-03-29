import { ButtonGroup } from "@mui/material";
import { memo } from "react";

import { NodeType, topicNodeTypes } from "../../../../common/node";
import { useUnrestrictedEditing } from "../../../view/actionConfigStore";
import { Relation, addableRelationsFrom } from "../../utils/edge";
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

const AddNodeButtonGroup = memo(
  ({ className, fromNodeId, fromNodeType, as, orientation }: Props) => {
    const unrestrictedEditing = useUnrestrictedEditing();

    const addableRelations: { toNodeType: NodeType; relation: Relation }[] =
      // if unrestricted, allow adding any topic node as parent or child (shouldn't be very useful to have outside of topic nodes)
      // also allow adding any node from custom node
      fromNodeType === "custom" || (unrestrictedEditing && topicNodeTypes.includes(fromNodeType))
        ? topicNodeTypes.map((nodeType) => ({
            toNodeType: nodeType,
            relation: {
              child: as === "child" ? nodeType : fromNodeType,
              name: "relatesTo",
              parent: as === "parent" ? nodeType : fromNodeType,
            },
          }))
        : addableRelationsFrom(fromNodeType, as);

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
  }
);

// eslint-disable-next-line functional/immutable-data
AddNodeButtonGroup.displayName = "AddNodeButtonGroup";
export { AddNodeButtonGroup };
