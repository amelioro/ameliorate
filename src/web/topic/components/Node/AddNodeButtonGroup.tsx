import { ButtonGroup } from "@mui/material";
import { memo } from "react";

import { NodeType, structureNodeTypes } from "@/common/node";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { Relation, addableRelationsFrom } from "@/web/topic/utils/edge";
import { type RelationDirection } from "@/web/topic/utils/graph";
import { Orientation } from "@/web/topic/utils/layout";
import { useUnrestrictedEditing } from "@/web/view/actionConfigStore";

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
      fromNodeType === "custom" ||
      (unrestrictedEditing && structureNodeTypes.includes(fromNodeType))
        ? structureNodeTypes.map((nodeType) => ({
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
  },
);

// eslint-disable-next-line functional/immutable-data
AddNodeButtonGroup.displayName = "AddNodeButtonGroup";
export { AddNodeButtonGroup };
