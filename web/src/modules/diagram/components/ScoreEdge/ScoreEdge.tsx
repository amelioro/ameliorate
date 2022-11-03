import React from "react";
import { type EdgeProps, getBezierPath } from "reactflow";

import { Score } from "../Score/Score";
import { StyledDiv } from "./ScoreEdge.style";

// base for custom edge taken from https://reactflow.dev/docs/examples/edges/edge-with-button/
export function ScoreEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const minEdgeLength = 50; // take up as much space as possible between nodes to have space for edge score hover

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={minEdgeLength}
        height={minEdgeLength}
        x={labelX - minEdgeLength / 2} // center because object is drawn from upper-left corner, not center
        y={labelY - minEdgeLength / 2}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        {/* flex stylings don't work directly from the foreignObject? so we need a div */}
        <StyledDiv length={minEdgeLength}>
          <Score />
        </StyledDiv>
      </foreignObject>
    </>
  );
}
