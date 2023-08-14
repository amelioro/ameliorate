import { Typography } from "@mui/material";
import lowerCase from "lodash/lowerCase";
import React from "react";
import { EdgeLabelRenderer, getBezierPath } from "reactflow";

import { RelationName } from "../../../../common/edge";
import { openContextMenu } from "../../../common/store/contextMenuActions";
import { setSelectedGraphPart } from "../../store/actions";
import { useIsImplied, useIsNodeSelected } from "../../store/edgeHooks";
import { useIsAnyGraphPartSelected } from "../../store/graphPartHooks";
import { Edge, markerStart } from "../../utils/diagram";
import { EdgeProps } from "../Diagram/Diagram";
import { Spotlight } from "../Diagram/Diagram.styles";
import { EdgeIndicatorGroup } from "../Indicator/EdgeIndicatorGroup";
import { StyledDiv, StyledPath } from "./ScoreEdge.styles";

const convertToEdge = (flowEdge: EdgeProps): Edge => {
  return {
    id: flowEdge.id,
    // react-flow makes these nullable but we'll always pass them
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    data: flowEdge.data!,
    label: flowEdge.label! as RelationName,
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- this should never be null?
    selected: flowEdge.selected!,
    // janky, not grabbing from flow edge because flow edge converts this to some URL format that idk how to convert;
    // but this value is currently always constant so it should be fine
    markerStart: markerStart,
    source: flowEdge.source,
    target: flowEdge.target,
    type: "ScoreEdge",
  };
};

// base for custom edge taken from https://reactflow.dev/docs/examples/edges/edge-with-button/
export const ScoreEdge = (flowEdge: EdgeProps) => {
  const edge = convertToEdge(flowEdge);

  const isImplied = useIsImplied(edge.id, edge.data.diagramId);
  const isNodeSelected = useIsNodeSelected(edge.id, edge.data.diagramId);
  const isAnyGraphPartSelected = useIsAnyGraphPartSelected();

  const spotlight: Spotlight = edge.selected
    ? "primary"
    : isNodeSelected
    ? "secondary"
    : isAnyGraphPartSelected || isImplied
    ? "background"
    : "normal";

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: flowEdge.sourceX,
    sourceY: flowEdge.sourceY,
    sourcePosition: flowEdge.sourcePosition,
    targetX: flowEdge.targetX,
    targetY: flowEdge.targetY,
    targetPosition: flowEdge.targetPosition,
  });

  return (
    <>
      <StyledPath
        id={flowEdge.id}
        style={flowEdge.style}
        className="react-flow__edge-path"
        d={edgePath}
        markerStart={flowEdge.markerStart}
        markerEnd={flowEdge.markerEnd}
        spotlight={spotlight}
      />
      {/* see for example usage https://reactflow.dev/docs/api/edges/edge-label-renderer/ */}
      <EdgeLabelRenderer>
        <StyledDiv
          labelX={labelX}
          labelY={labelY}
          onClick={() => setSelectedGraphPart(edge.id)}
          onContextMenu={(event) => openContextMenu(event, { edge })}
          spotlight={spotlight}
        >
          <Typography variant="body1" margin="0">
            {lowerCase(edge.label)}
          </Typography>
          <EdgeIndicatorGroup edge={edge} />
        </StyledDiv>
      </EdgeLabelRenderer>
    </>
  );
};
