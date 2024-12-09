import { Box, Typography } from "@mui/material";
import lowerCase from "lodash/lowerCase";
import { EdgeLabelRenderer } from "reactflow";

import { RelationName } from "@/common/edge";
import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { infoColor } from "@/web/common/theme";
import { EdgeProps } from "@/web/topic/components/Diagram/Diagram";
import { Spotlight } from "@/web/topic/components/Diagram/Diagram.styles";
import {
  StyledDiv,
  StyledPath,
  edgeColor,
  highlightedEdgeColor,
} from "@/web/topic/components/Edge/ScoreEdge.styles";
import { getPathDefinitionForEdge } from "@/web/topic/components/Edge/svgPathDrawer";
import { CommonIndicators } from "@/web/topic/components/Indicator/CommonIndicators";
import {
  LeftCornerStatusIndicators,
  RightCornerContentIndicators,
  nodeWidthPx,
} from "@/web/topic/components/Node/EditableNode.styles";
import { setCustomEdgeLabel } from "@/web/topic/store/actions";
import { useIsNodeSelected } from "@/web/topic/store/edgeHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Edge } from "@/web/topic/utils/graph";
import { useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { useAvoidEdgeLabelOverlap } from "@/web/view/currentViewStore/layout";
import { setSelected } from "@/web/view/currentViewStore/store";
import { useShowIndicators } from "@/web/view/userConfigStore";

const flowMarkerId = "flowMarker";
const nonFlowMarkerId = "nonFlowMarker";

// mostly copied from react-flow's marker html - jank but the package doesn't export its marker definition
// https://github.com/xyflow/xyflow/blob/f0117939bae934447fa7f232081f937169ee23b5/packages/react/src/container/EdgeRenderer/MarkerDefinitions.tsx#L29-L41
const svgMarkerDef = (inReactFlow: boolean, spotlight: Spotlight) => {
  const id = `${inReactFlow ? flowMarkerId : nonFlowMarkerId}-${spotlight}`;
  const color =
    spotlight === "primary"
      ? highlightedEdgeColor
      : spotlight === "secondary"
        ? infoColor
        : edgeColor;

  return (
    <defs>
      <marker
        id={id}
        markerWidth="30"
        markerHeight="30"
        viewBox="-10 -10 20 20"
        // changed from `strokeWidth` so that stroke can increase edge width without affecting arrow size
        markerUnits="userSpaceOnUse"
        // `auto-start-reverse` works for flow but for some reason for non-flow it's not in viewbox.
        // Easier to just use what works outside of flow than to figure that out.
        orient={inReactFlow ? "auto-start-reverse" : "auto"}
        refX="0"
        refY="0"
      >
        <polyline
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill={color}
          points="-5,-4 0,0 -5,4 -5,-4"
        />
      </marker>
    </defs>
  );
};

const convertToEdge = (flowEdge: EdgeProps): Edge => {
  return {
    id: flowEdge.id,
    // react-flow makes these nullable but we'll always pass them
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    data: flowEdge.data!,
    label: flowEdge.label! as RelationName,
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    // janky, not grabbing from flow edge because flow edge converts this to some URL format that idk how to convert;
    // but this value is currently always constant so it should be fine
    source: flowEdge.source,
    target: flowEdge.target,
    type: "FlowEdge",
  };
};

interface Props {
  inReactFlow: boolean;
}

// base for custom edge taken from https://reactflow.dev/docs/examples/edges/edge-with-button/
export const ScoreEdge = ({ inReactFlow, ...flowEdge }: EdgeProps & Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const unrestrictedEditing = useUnrestrictedEditing();
  const showIndicators = useShowIndicators();
  const avoidEdgeLabelOverlap = useAvoidEdgeLabelOverlap();

  const edge = convertToEdge(flowEdge);
  const isNodeSelected = useIsNodeSelected(edge.id);

  const spotlight: Spotlight = flowEdge.selected
    ? "primary"
    : isNodeSelected
      ? "secondary"
      : "normal";

  const { pathDefinition, labelX, labelY } = getPathDefinitionForEdge(
    flowEdge,
    avoidEdgeLabelOverlap,
  );

  const path = (
    <StyledPath
      id={flowEdge.id}
      style={flowEdge.style}
      className="react-flow__edge-path"
      d={pathDefinition}
      // assumes that we always want to point from child to parent
      markerStart={`url(#${inReactFlow ? flowMarkerId : nonFlowMarkerId}-${spotlight})`}
      spotlight={spotlight}
      onClick={() => setSelected(edge.id)}
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
    />
  );

  const labelText = edge.data.customLabel ?? lowerCase(edge.label);

  const label = (
    <StyledDiv
      labelX={labelX}
      labelY={labelY}
      onClick={() => setSelected(edge.id)}
      onContextMenu={(event) => openContextMenu(event, { edge })}
      role="button"
      spotlight={spotlight}
      className={
        // pointer-events is set because this div is within an SVG and doesn't handle pointer-events properly by default
        "[pointer-events:all] flex flex-col items-center justify-center bg-white p-1 rounded-xl" +
        // when hiding indicators, div only contains the label text, so border doesn't seem necessary (if this looks awkward, we can always show border instead)
        (!showIndicators && spotlight === "normal" ? " border-none" : "") +
        // allow other components to apply conditional css related to this edge, e.g. when it's hovered/selected
        // separate from react-flow__edge because sometimes edges are rendered outside of react-flow (e.g. details pane), and we still want to style these
        " diagram-edge" +
        (flowEdge.selected ? " selected" : "")
      }
    >
      <CommonIndicators graphPart={edge} notes={edge.data.notes} />
      <Typography
        variant="body1"
        margin="0"
        contentEditable={userCanEditTopicData && unrestrictedEditing}
        suppressContentEditableWarning // https://stackoverflow.com/a/49639256/8409296
        onBlur={(event) => {
          const text = event.target.textContent?.trim();
          if (text && text !== lowerCase(edge.label) && text !== edge.data.customLabel)
            setCustomEdgeLabel(edge, text);
        }}
        className="nopan"
      >
        {labelText}
      </Typography>
      <LeftCornerStatusIndicators graphPartId={edge.id} color="paper" />
      <RightCornerContentIndicators graphPartId={edge.id} graphPartType="edge" color="paper" />
    </StyledDiv>
  );

  // React flow edges are already rendered within an SVG.
  //
  // It seems like it'd be nicer to use two separate components instead of branching in one edge
  // component like this, but it's hard to reuse the path and label across multiple edge components.
  if (inReactFlow) {
    return (
      <>
        {/* shouldn't need an svg marker def per edge, but it's easiest to just put here */}
        {svgMarkerDef(inReactFlow, spotlight)}
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
          >
            {/* shouldn't need an svg marker def per edge, but it's easiest to just put here */}
            {svgMarkerDef(inReactFlow, spotlight)}

            {path}
          </svg>

          {label}
        </Box>
      </>
    );
  }
};
