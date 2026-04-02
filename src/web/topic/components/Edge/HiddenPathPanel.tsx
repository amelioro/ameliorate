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

      <div className="flex flex-col items-center gap-x-2 gap-y-0.5 p-3 pt-0">
        <CompressedNodeViaId nodeId={indirectEdge.targetId} />

        <HiddenPathDiv
          className="my-2 rounded-xl border border-dashed px-2"
          style={{ borderColor: edgeColor }}
        >
          {pathSteps.map((step, index) => {
            // don't show next node for last in path since we'll just manually plop the source node at the bottom
            const showNextNode = index < pathSteps.length - 1;

            return (
              <Fragment key={step.edgeId}>
                {/* Arrow + edge label */}
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
                {showNextNode && (
                  <div className="flex gap-2">
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

                    <CompressedNodeViaId nodeId={step.nodeId} className="grow" />
                  </div>
                )}
              </Fragment>
            );
          })}
        </HiddenPathDiv>

        <CompressedNodeViaId nodeId={indirectEdge.sourceId} />
      </div>
    </div>
  );
};

const ArrowLabelDiv = styled.div``;
const HiddenPathDiv = styled.div``;
