import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import pluralize from "pluralize";
import { Position } from "reactflow";

import { useNeighbors } from "../../store/nodeHooks";
import { toggleShowNeighbors } from "../../store/viewActions";
import { Node, RelationDirection } from "../../utils/diagram";
import { Orientation } from "../../utils/layout";
import { hideableNodeTypes, nodeDecorations } from "../../utils/node";
import { StyledHandle } from "./NodeHandle.styles";

const tooltipItems = (
  parentNodeId: string,
  neighbors: Node[],
  direction: RelationDirection,
  shown: boolean
) => {
  return hideableNodeTypes
    .map((nodeType) => {
      const nodes = neighbors.filter(
        (node) => node.type === nodeType && (shown ? node.data.showing : !node.data.showing)
      );

      const Icon = nodeDecorations[nodeType].NodeIcon;
      const typeLabel = pluralize(nodeDecorations[nodeType].title, nodes.length);
      const shownLabel = shown ? "shown" : "hidden";

      return (
        nodes.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            sx={!shown ? { backgroundColor: "rgb(90, 90, 90)" } : {}}
            key={`${typeLabel}-${shownLabel}`}
          >
            <IconButton
              onClick={() => toggleShowNeighbors(parentNodeId, nodeType, direction, !shown)}
            >
              {shown ? <Visibility /> : <VisibilityOff />}
            </IconButton>
            <Typography variant="body1" display="flex" alignItems="center">
              {nodes.length} <Icon color={nodeType} sx={{ marginX: "2px" }} /> {typeLabel}{" "}
              {shownLabel}
            </Typography>
          </Box>
        )
      );
    })
    .filter((x) => x); // filter out undefined
};

interface Props {
  node: Node;
  direction: RelationDirection;
  orientation: Orientation;
}

export const NodeHandle = ({ node, direction, orientation }: Props) => {
  const directedNeighbors = useNeighbors(node.id, direction);

  const shownNodesTooltips = tooltipItems(node.id, directedNeighbors, direction, true);
  const hiddenNodesTooltips = tooltipItems(node.id, directedNeighbors, direction, false);

  const tooltipNotes = [...shownNodesTooltips, ...hiddenNodesTooltips];

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
    <Tooltip title={tooltipNotes.length > 0 ? <>{tooltipNotes}</> : ""} disableFocusListener>
      <StyledHandle
        type={type}
        position={position}
        hasHiddenComponents={hiddenNodesTooltips.length > 0}
      />
    </Tooltip>
  );
};
