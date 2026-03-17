import styled from "@emotion/styled";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Link, Typography } from "@mui/material";
import { lowerCase } from "es-toolkit";
import { Fragment } from "react";

import { AnyRelationName, type CalculatedEdge } from "@/common/edge";
import { edgeColor } from "@/web/topic/components/Edge/Edge.styles";
import { CompressedNodeViaId } from "@/web/topic/components/Node/CompressedNode";
import { showNode } from "@/web/view/currentViewStore/filter";
import { setSelected } from "@/web/view/selectedPartStore";

interface PathStep {
  edgeId: string;
  edgeType: AnyRelationName;
  arrowDirection: "up" | "down";
  nodeId: string;
}

/**
 * For each step in the hidden path, determine the arrow direction and node to show based on if
 * we're going upstream or downstream.
 */
const buildHiddenPathSteps = (indirectEdge: CalculatedEdge): PathStep[] => {
  /* eslint-disable functional/no-let -- tracking previousTopNodeId across iterations */
  let previousTopNodeId = indirectEdge.targetId;

  return indirectEdge.data.hiddenPath.toReversed().map((edge) => {
    const isDownstream = previousTopNodeId === edge.targetId;
    const arrowDirection = isDownstream ? "up" : "down";
    const nodeId = isDownstream ? edge.sourceId : edge.targetId;

    previousTopNodeId = nodeId;

    return {
      edgeId: edge.id,
      edgeType: edge.type,
      arrowDirection,
      nodeId,
    };
  });
  /* eslint-enable functional/no-let */
};

interface Props {
  indirectEdge: CalculatedEdge;
}

/**
 * Shows the hidden path of an indirect edge between two visible nodes.
 *
 * Renders compressed nodes and arrows top-to-bottom, starting from the indirect edge's target
 * and walking backwards through the hidden path to the source.
 */
export const HiddenPathPanel = ({ indirectEdge }: Props) => {
  const pathSteps = buildHiddenPathSteps(indirectEdge);

  return (
    <div className="flex flex-col items-center">
      <Typography variant="body1" className="py-2 font-bold">
        Hidden Path
      </Typography>

      {/* one column for "reveal button" (empty divs for spacing where we don't show this), and one for nodes / edges */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-0.5 p-3 pt-0">
        <div />
        <div className="flex justify-center">
          <CompressedNodeViaId nodeId={indirectEdge.targetId} />
        </div>

        {pathSteps.map((step, index) => {
          // last step's node is the indirect edge's source, which is currently visible
          const showReveal = index < pathSteps.length - 1;

          return (
            <Fragment key={step.edgeId}>
              {/* Empty "reveal" cell + arrow + edge label */}
              <div />
              <ArrowLabelDiv className="flex flex-col items-center py-0.5">
                {step.arrowDirection === "up" && (
                  <KeyboardArrowUp fontSize="small" sx={{ color: edgeColor }} />
                )}
                <Typography variant="body2">{lowerCase(step.edgeType)}</Typography>
                {step.arrowDirection === "down" && (
                  <KeyboardArrowDown fontSize="small" sx={{ color: edgeColor }} />
                )}
              </ArrowLabelDiv>

              {/* Reveal link + compressed node */}
              {showReveal ? (
                <Link
                  component="button"
                  variant="body2"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNode(step.nodeId);
                    setSelected(step.nodeId);
                  }}
                >
                  Reveal
                </Link>
              ) : (
                <div />
              )}
              <div className="flex justify-center">
                <CompressedNodeViaId nodeId={step.nodeId} />
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

const ArrowLabelDiv = styled.div``;
