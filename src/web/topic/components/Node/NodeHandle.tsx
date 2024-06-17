import { Visibility } from "@mui/icons-material";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { ReactNode, memo } from "react";
import { Position } from "reactflow";

import { nodeTypes } from "@/common/node";
import { StyledHandle } from "@/web/topic/components/Node/NodeHandle.styles";
import { useHiddenNodes } from "@/web/topic/hooks/flowHooks";
import { useNeighborsInDirection } from "@/web/topic/store/nodeHooks";
import { Node, RelationDirection } from "@/web/topic/utils/graph";
import { Orientation } from "@/web/topic/utils/layout";
import { nodeDecorations } from "@/web/topic/utils/node";
import { showNode } from "@/web/view/currentViewStore/filter";

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
                    {<Visibility />}
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
