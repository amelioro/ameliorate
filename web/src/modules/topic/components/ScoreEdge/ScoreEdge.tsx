import React from "react";
import { EdgeLabelRenderer, getBezierPath } from "reactflow";

import { minSpaceBetweenNodes } from "../../utils/layout";
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

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* see for example usage https://reactflow.dev/docs/api/edges/edge-label-renderer/ */}
      <EdgeLabelRenderer>
        <StyledDiv length={minSpaceBetweenNodes} labelX={labelX} labelY={labelY}>
          {/* we'll always pass data - why does react-flow make it nullable :( */}
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          <ScoreDial parentId={id} parentType="edge" score={data!.score} />
        </StyledDiv>
      </EdgeLabelRenderer>
    </>
  );
};
