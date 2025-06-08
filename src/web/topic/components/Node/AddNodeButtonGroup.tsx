import { ButtonGroup } from "@mui/material";
import { memo } from "react";

import { NodeType } from "@/common/node";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { useIsMitigatableDetriment } from "@/web/topic/diagramStore/nodeTypeHooks";
import { addableRelationsFrom } from "@/web/topic/utils/edge";
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

    const unrestrictedAddingFrom = fromNodeType === "custom" || unrestrictedEditing;
    const addableRelations = addableRelationsFrom(
      fromNodeType,
      as,
      unrestrictedAddingFrom,
      isMitigatableDetriment,
    );

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
