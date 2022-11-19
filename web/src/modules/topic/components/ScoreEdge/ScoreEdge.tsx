import React from "react";
import { getBezierPath } from "reactflow";

import { EdgeProps } from "../Diagram/Diagram";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import { StyledDiv } from "./ScoreEdge.style";

// base for custom edge taken from https://reactflow.dev/docs/examples/edges/edge-with-button/
// TODO: upgrade react-flow and remove foreignObject jazz https://github.com/wbkd/react-flow/releases/tag/11.2.0
export const ScoreEdge = ({
  id,
  data,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
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
        x={labelX - minEdgeLength / 2} // object is drawn from upper-left corner, not center
        y={labelY - minEdgeLength / 2}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        {/* flex stylings don't work directly from the foreignObject? so we need a div */}
        <StyledDiv length={minEdgeLength}>
          {/* we'll always pass data - why does react-flow make it nullable :( */}
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          <ScoreDial parentId={id} parentType="edge" score={data!.score} />
        </StyledDiv>
      </foreignObject>
    </>
  );
};
