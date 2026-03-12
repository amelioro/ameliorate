import { Box } from "@mui/material";
import { EdgeLabelRenderer } from "@xyflow/react";
import { type ReactNode } from "react";

import { type CalculatedEdge } from "@/common/edge";
import { Spotlight } from "@/web/topic/components/Diagram/Diagram.styles";
import { StyledDiv, StyledPath } from "@/web/topic/components/Edge/Edge.styles";
import { getPathDefinitionForEdge } from "@/web/topic/components/Edge/svgPathDrawer";
import { nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { markerIds } from "@/web/topic/components/TopicWorkspace/SvgEdgeMarkerDefs";
import { type EdgeLayoutData } from "@/web/topic/utils/diagram";
import { type Edge as EdgeData } from "@/web/topic/utils/graph";
import { graphPartClass } from "@/web/topic/utils/styleUtils";
import { useAvoidEdgeLabelOverlap } from "@/web/view/currentViewStore/layout";
import {
  setSelected,
  useIsAnyGraphPartSelected,
  useIsGraphPartSelected,
} from "@/web/view/selectedPartStore";

interface Props {
  // could accept MinimalEdge here, but our react components seem to generally make more sense operating on real persisted or indirect edges
  edge: EdgeData | CalculatedEdge;
  edgeLayoutData: EdgeLayoutData;
  /**
   * Content to show within the edge label. Extracted this because our direct edges will show
   * different things than our indirect edges (e.g. indirect edges will not have content indicators).
   */
  labelContentSlot: ReactNode;
  onContextMenu: React.MouseEventHandler;
  inReactFlow: boolean;
  pathClassName?: string;
}

/**
 * Consistently render the edge path and label container, regardless of edge type (e.g. direct vs
 * indirect edges).
 *
 * Base for custom edge taken from https://reactflow.dev/docs/examples/edges/edge-with-button/.
 */
export const Edge = ({
  edge,
  edgeLayoutData,
  labelContentSlot,
  onContextMenu,
  inReactFlow,
  pathClassName,
}: Props) => {
  const avoidEdgeLabelOverlap = useAvoidEdgeLabelOverlap();

  const isNodeSelected = useIsAnyGraphPartSelected([edge.sourceId, edge.targetId]);
  const isEdgeSelected = useIsGraphPartSelected(edge.id);

  const spotlight: Spotlight = isEdgeSelected ? "primary" : isNodeSelected ? "secondary" : "normal";

  const { pathDefinition, labelX, labelY } = getPathDefinitionForEdge(
    edgeLayoutData,
    avoidEdgeLabelOverlap,
  );

  const path = (
    <StyledPath
      id={edge.id}
      className={
        "react-flow__edge-path" +
        ` spotlight-${spotlight}` +
        (pathClassName ? ` ${pathClassName}` : "")
      }
      d={pathDefinition}
      markerEnd={`url(#${markerIds[spotlight]})`}
      spotlight={spotlight}
      onClick={() => setSelected(edge.id)}
      onContextMenu={onContextMenu}
    />
  );

  /**
   * Allow edges to be more-easily hovered/clicked, based on a wider width than what is visibly drawn.
   * Taken from react flow's implementation https://github.com/xyflow/xyflow/blob/616d2665235447e0280368228ac64b987afecba0/packages/react/src/components/Edges/BaseEdge.tsx#L35-L43
   */
  const hiddenInteractivePath = (
    <path
      className="react-flow__edge-interaction"
      d={pathDefinition}
      fill="none"
      strokeOpacity={0}
      strokeWidth={20}
      onClick={() => setSelected(edge.id)}
      onContextMenu={onContextMenu}
    />
  );

  const label = (
    <StyledDiv
      labelX={labelX}
      labelY={labelY}
      onClick={() => setSelected(edge.id)}
      onContextMenu={onContextMenu}
      role="button"
      spotlight={spotlight}
      className={
        // pointer-events is set because this div is within an SVG and doesn't handle pointer-events properly by default
        "[pointer-events:all] flex flex-col items-center justify-center bg-white p-1 rounded-xl" +
        // allow edge to be styled based on its spotlight
        ` spotlight-${spotlight}` +
        // border adds a lot of clutter so only show it if we're highlighting the edge
        (spotlight === "normal" ? " border-none" : "") +
        // allow other components to apply conditional css related to this edge, e.g. when it's hovered/selected
        // separate from react-flow__edge because sometimes edges are rendered outside of react-flow (e.g. details pane), and we still want to style these
        ` diagram-edge ${graphPartClass}` +
        (isEdgeSelected ? " selected" : "")
      }
    >
      {labelContentSlot}
    </StyledDiv>
  );

  // React flow edges are already rendered within an SVG.
  //
  // It seems like it'd be nicer to use two separate components instead of branching in one edge
  // component like this, but it's hard to reuse the path and label across multiple edge components.
  if (inReactFlow) {
    return (
      <>
        {path}
        {hiddenInteractivePath}

        {/* see for example usage https://reactflow.dev/docs/api/edges/edge-label-renderer/ */}
        <EdgeLabelRenderer>{label}</EdgeLabelRenderer>
      </>
    );
  } else {
    return (
      <>
        {/* hardcoded assuming we're connecting two lined-up nodes that are 100px apart */}
        <Box width={nodeWidthPx} height={100}>
          <svg
            width={nodeWidthPx}
            height={100}
            style={{ position: "absolute", cursor: "default" }}
            className="react-flow__edge selected"
            onContextMenu={onContextMenu}
          >
            {path}
          </svg>

          {label}
        </Box>
      </>
    );
  }
};
