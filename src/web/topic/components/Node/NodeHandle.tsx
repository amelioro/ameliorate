import { VisibilityOff } from "@mui/icons-material";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { ReactNode, memo } from "react";
import { Position } from "reactflow";

import { nodeTypes } from "../../../../common/node";
import { showNode } from "../../../view/navigateStore";
import { useHiddenNodes } from "../../hooks/flowHooks";
import { useNeighborsInDirection } from "../../store/nodeHooks";
import { Node, RelationDirection } from "../../utils/graph";
import { Orientation } from "../../utils/layout";
import { nodeDecorations } from "../../utils/node";
import { StyledHandle } from "./NodeHandle.styles";

const NodeSummary = ({ node, beforeSlot }: { node: Node; beforeSlot?: ReactNode }) => {
  const { NodeIcon, title } = nodeDecorations[node.type];

  return (
    <div className="flex items-center text-nowrap">
      {beforeSlot}
      <NodeIcon color={node.type} sx={{ marginX: "2px" }} />
      <Typography variant="body1" display="flex" alignItems="center">
        {title}: {node.data.label}
      </Typography>
    </div>
  );
};

interface Props {
  node: Node;
  direction: RelationDirection;
  orientation: Orientation;
}

const NodeHandleBase = ({ node, direction, orientation }: Props) => {
  const neighborsInDirection = useNeighborsInDirection(node.id, direction);
  const hiddenNeighbors = useHiddenNodes(neighborsInDirection);

  // sort by node type the same way the nodeTypes array is ordered; thanks https://stackoverflow.com/a/44063445
  const sortedHiddenNeighbors: Node[] = hiddenNeighbors.toSorted((a, b) => {
    const diff = nodeTypes.indexOf(a.type) - nodeTypes.indexOf(b.type);
    return diff;
  });

  const type = direction === "parent" ? "target" : "source";

  const position =
    direction === "parent"
      ? orientation === "DOWN"
        ? Position.Top
        : Position.Left
      : orientation === "DOWN"
      ? Position.Bottom
      : Position.Right;

  return (
    <Tooltip
      title={
        sortedHiddenNeighbors.length > 0 ? (
          <div className="space-y-2">
            {sortedHiddenNeighbors.map((neighbor) => (
              <NodeSummary
                key={neighbor.id}
                node={neighbor}
                beforeSlot={
                  <IconButton className="p-0" onClick={() => showNode(neighbor.id)}>
                    {<VisibilityOff />}
                  </IconButton>
                }
              />
            ))}
          </div>
        ) : (
          ""
        )
      }
      disableFocusListener
    >
      <StyledHandle
        type={type}
        position={position}
        hasHiddenComponents={sortedHiddenNeighbors.length > 0}
      />
    </Tooltip>
  );
};

export const NodeHandle = memo(NodeHandleBase);
