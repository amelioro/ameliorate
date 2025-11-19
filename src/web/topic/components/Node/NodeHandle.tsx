import { Visibility } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { ReactNode, memo } from "react";
import { Handle, Position, useStore } from "reactflow";

import { nodeTypes } from "@/common/node";
import { Tooltip } from "@/web/common/components/Tooltip/Tooltip";
import { useSessionUser } from "@/web/common/hooks";
import { useNeighborsInDirection } from "@/web/topic/diagramStore/nodeHooks";
import { useHiddenNodes } from "@/web/topic/hooks/flowHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";
import { Orientation } from "@/web/topic/utils/layout";
import { nodeDecorations } from "@/web/topic/utils/node";
import { RelativePlacement } from "@/web/topic/utils/relativePlacement";
import { showNode } from "@/web/view/currentViewStore/filter";
import { useShowNeighborIndicators } from "@/web/view/userConfigStore";

const NodeSummary = ({ node, beforeSlot }: { node: Node; beforeSlot?: ReactNode }) => {
  const { NodeIcon, title } = nodeDecorations[node.type];

  const summary = `${title}: ${node.data.label}`;

  return (
    <div className="flex items-center text-nowrap">
      {beforeSlot}
      <NodeIcon color={node.type} sx={{ marginX: "2px" }} />
      {/* title set so that hover can show the full text if truncated */}
      <Typography title={summary} variant="body1" className="items-center truncate">
        {summary}
      </Typography>
    </div>
  );
};

interface Props {
  node: Node;
  direction: RelativePlacement;
  orientation: Orientation;
}

const NodeHandleBase = ({ node, direction, orientation }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const showNeighborIndicators = useShowNeighborIndicators();
  const neighborsInDirection = useNeighborsInDirection(node.id, direction);
  // TODO(bug): if new neighbor is added and there are currently no hidden neighbors,
  // `neighborsInDirection` will trigger a re-render at the same time as Diagram re-renders,
  // so the `hiddenNeighbors` will not yet know that the new neighbor is displayed... then the Diagram
  // will finish rendering and `hiddenNeighbors` will trigger a re-render.
  // The result is that adding a new neighbor will make the handle flicker to indicate that there's
  // a hidden neighbor for just a moment, before rendering without indicating a hidden neighbor.
  const hiddenNeighbors = useHiddenNodes(neighborsInDirection);

  const handleType = direction === "above" ? "source" : "target";
  const isPotentiallyConnectingToThisHandle = useStore(
    (state) =>
      state.connectionStartHandle !== null && state.connectionStartHandle.type !== handleType,
  );

  // sort by node type the same way the nodeTypes array is ordered; thanks https://stackoverflow.com/a/44063445
  const sortedHiddenNeighbors: Node[] = hiddenNeighbors.toSorted((a, b) => {
    const diff = nodeTypes.indexOf(a.type) - nodeTypes.indexOf(b.type);
    return diff;
  });
  const hasHiddenNeighbors = sortedHiddenNeighbors.length > 0;

  const showHandle =
    isPotentiallyConnectingToThisHandle || (showNeighborIndicators && hasHiddenNeighbors);
  // if editing, show handles on-hover/-select so that we can create edges
  // if there are hidden neighbors, show handle on-hover/-select so that hidden nodes are discoverable for new users
  const conditionalShowClasses =
    userCanEditTopicData || hasHiddenNeighbors
      ? // `String.raw` in order to allow underscores to be escaped for tailwind, so they don't get converted to spaces
        String.raw` [.react-flow\_\_node:hover_&]:visible [.react-flow\_\_node.selected_&]:visible`
      : "";

  const position =
    direction === "above"
      ? orientation === "UP"
        ? Position.Top
        : Position.Left
      : orientation === "UP"
        ? Position.Bottom
        : Position.Right;

  return (
    // bug?: seems like on mobile sometimes when a neighbor is hidden, this tooltip just starts showing
    // without tapping. seems to happen inconsistently. seems maybe related to what is focused when
    // the neighbor is hidden?
    <Tooltip
      tooltipBody={
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
    >
      <Handle
        type={handleType}
        position={position}
        role={hasHiddenNeighbors ? "button" : undefined}
        className={
          // z-index to show in front of EditableNode, which is otherwise in the same stacking context (since it's set to relative positioning now)
          "size-[10px] z-10" +
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
