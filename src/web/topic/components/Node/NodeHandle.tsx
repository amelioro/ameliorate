import { Visibility } from "@mui/icons-material";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { ReactNode, memo } from "react";
import { Handle, Position, useStore } from "reactflow";

import { nodeTypes } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { useHiddenNodes } from "@/web/topic/hooks/flowHooks";
import { useNeighborsInDirection } from "@/web/topic/store/nodeHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Node, RelationDirection } from "@/web/topic/utils/graph";
import { Orientation } from "@/web/topic/utils/layout";
import { nodeDecorations } from "@/web/topic/utils/node";
import { showNode } from "@/web/view/currentViewStore/filter";
import { useShowIndicators } from "@/web/view/userConfigStore";

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
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const showIndicators = useShowIndicators();
  const neighborsInDirection = useNeighborsInDirection(node.id, direction);
  const hiddenNeighbors = useHiddenNodes(neighborsInDirection);

  const type = direction === "parent" ? "target" : "source";
  const isPotentiallyConnectingToThisHandle = useStore(
    (state) => state.connectionStartHandle !== null && state.connectionStartHandle.type !== type,
  );

  // sort by node type the same way the nodeTypes array is ordered; thanks https://stackoverflow.com/a/44063445
  const sortedHiddenNeighbors: Node[] = hiddenNeighbors.toSorted((a, b) => {
    const diff = nodeTypes.indexOf(a.type) - nodeTypes.indexOf(b.type);
    return diff;
  });
  const hasHiddenNeighbors = sortedHiddenNeighbors.length > 0;

  const showHandle = isPotentiallyConnectingToThisHandle || (showIndicators && hasHiddenNeighbors);
  // if editing, show handles on-hover/-select so that we can create edges
  // if there are hidden neighbors, show handle on-hover/-select so that hidden nodes are discoverable for new users
  const conditionalShowClasses =
    userCanEditTopicData || hasHiddenNeighbors
      ? // `String.raw` in order to allow underscores to be escaped for tailwind, so they don't get converted to spaces
        String.raw` [.react-flow\_\_node:hover_&]:visible [.react-flow\_\_node.selected_&]:visible`
      : "";

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
        hasHiddenNeighbors ? (
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
      <Handle
        type={type}
        position={position}
        className={
          "size-[10px]" +
          // rely on `visibility` rather than `display` so that invisible handles can still render for react-flow's connection drawing
          (showHandle ? "" : " invisible") +
          conditionalShowClasses +
          (hasHiddenNeighbors ? " bg-info-main" : "")
        }
      />
    </Tooltip>
  );
};

export const NodeHandle = memo(NodeHandleBase);
