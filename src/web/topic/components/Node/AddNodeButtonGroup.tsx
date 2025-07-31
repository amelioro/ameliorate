import { ButtonGroup } from "@mui/material";
import { memo } from "react";

import { NodeType } from "@/common/node";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { DirectedToRelation } from "@/web/topic/utils/edge";

type AddableProps =
  | {
      fromNodeId: string;
      addableRelations: DirectedToRelation[];
      addableNodeTypes?: undefined;
    }
  | {
      fromNodeId?: undefined;
      addableRelations?: undefined;
      addableNodeTypes: NodeType[];
    };

interface Props {
  selectNewNode?: boolean;
  className?: string;
}

const AddNodeButtonGroup = memo(
  ({
    fromNodeId,
    addableRelations,
    addableNodeTypes,
    selectNewNode,
    className,
  }: Props & AddableProps) => {
    return (
      <ButtonGroup variant="contained" aria-label="add node button group" className={className}>
        {addableRelations?.map((addableRelation) => (
          <AddNodeButton
            key={addableRelation[addableRelation.as]}
            fromNodeId={fromNodeId}
            addableRelation={addableRelation}
            selectNewNode={selectNewNode}
          />
        ))}

        {addableNodeTypes?.map((addableNodeType) => (
          <AddNodeButton
            key={addableNodeType}
            addableNodeType={addableNodeType}
            selectNewNode={selectNewNode}
          />
        ))}
      </ButtonGroup>
    );
  },
);

// eslint-disable-next-line functional/immutable-data
AddNodeButtonGroup.displayName = "AddNodeButtonGroup";
export { AddNodeButtonGroup };
