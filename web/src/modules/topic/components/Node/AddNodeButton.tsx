import { Tooltip } from "@mui/material";

import { addNode } from "../../store/actions";
import { type RelationDirection } from "../../utils/diagram";
import { RelationName } from "../../utils/edge";
import { NodeType, nodeDecorations } from "../../utils/node";
import { StyledButton } from "./AddNodeButton.styles";

interface Props {
  fromNodeId: string;
  as: RelationDirection;
  toNodeType: NodeType;
  relation: RelationName;
  className?: string;
}

export const AddNodeButton = ({ fromNodeId, as, toNodeType, relation, className }: Props) => {
  const decoration = nodeDecorations[toNodeType];

  return (
    <Tooltip title={`Add new ${decoration.title}`}>
      <StyledButton
        className={className}
        color={toNodeType}
        size="small"
        variant="contained"
        onClick={() => addNode({ fromNodeId, as, toNodeType, relation })}
      >
        <decoration.NodeIcon />
      </StyledButton>
    </Tooltip>
  );
};
