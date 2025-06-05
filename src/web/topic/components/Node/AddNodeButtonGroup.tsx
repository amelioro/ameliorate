import { ButtonGroup } from "@mui/material";
import { memo } from "react";

import { NodeType, breakdownNodeTypes } from "@/common/node";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { useIsMitigatableDetriment } from "@/web/topic/diagramStore/nodeTypeHooks";
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
    const isMitigatableDetriment = useIsMitigatableDetriment(fromNodeId);

    const addableRelations: { toNodeType: NodeType; relation: Relation }[] =
      // if unrestricted, allow adding any topic node as parent or child (shouldn't be very useful to have outside of topic nodes)
      // also allow adding any node from custom node
      fromNodeType === "custom" ||
      (unrestrictedEditing && breakdownNodeTypes.includes(fromNodeType))
        ? breakdownNodeTypes.map((nodeType) => ({
            toNodeType: nodeType,
            relation: {
              child: as === "child" ? nodeType : fromNodeType,
              name: "relatesTo",
              parent: as === "parent" ? nodeType : fromNodeType,
            },
          }))
        : // hack to ensure that problem detriments can't be mitigated (and can be solved), and solution detriments can be mitigated (but not solved);
          // this is really awkward but keeps detriment nodes from being able to have both solutions and mitigations added, which could be really confusing for users
          isMitigatableDetriment && as === "child"
          ? addableRelationsFrom(fromNodeType, as).map(({ toNodeType, relation }) =>
              toNodeType === "solution" && relation.name === "addresses"
                ? {
                    toNodeType: "mitigation",
                    relation: { child: "mitigation", name: "mitigates", parent: fromNodeType },
                  }
                : {
                    toNodeType,
                    relation,
                  },
            )
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
