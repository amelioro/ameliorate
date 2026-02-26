import { Box, Typography } from "@mui/material";
import { EdgeLabelRenderer } from "@xyflow/react";
import { lowerCase } from "es-toolkit";

import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { Spotlight } from "@/web/topic/components/Diagram/Diagram.styles";
import { StyledDiv, StyledPath } from "@/web/topic/components/Edge/ScoreEdge.styles";
import { getPathDefinitionForEdge } from "@/web/topic/components/Edge/svgPathDrawer";
import { CommonIndicatorGroup } from "@/web/topic/components/Indicator/Base/CommonIndicatorGroup";
import { ContentIndicatorGroup } from "@/web/topic/components/Indicator/Base/ContentIndicatorGroup";
import { StatusIndicatorGroup } from "@/web/topic/components/Indicator/Base/StatusIndicatorGroup";
import { nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { markerIds } from "@/web/topic/components/TopicWorkspace/SvgEdgeMarkerDefs";
import { setCustomEdgeLabel } from "@/web/topic/diagramStore/actions";
import { useIsNodeSelected } from "@/web/topic/diagramStore/edgeHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { EdgeLayoutData } from "@/web/topic/utils/diagram";
import { Edge } from "@/web/topic/utils/graph";
import { graphPartClass, visibleOnPartHoverSelectedClasses } from "@/web/topic/utils/styleUtils";
import { useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { useAvoidEdgeLabelOverlap } from "@/web/view/currentViewStore/layout";
import { useIsGraphPartSelected } from "@/web/view/selectedPartStore";
import { setSelected } from "@/web/view/selectedPartStore";
import { useWhenToShowIndicators } from "@/web/view/userConfigStore/store";

interface Props {
  edge: Edge;
  edgeLayoutData: EdgeLayoutData;
  inReactFlow: boolean;
}

// base for custom edge taken from https://reactflow.dev/docs/examples/edges/edge-with-button/
export const ScoreEdge = ({ edge, edgeLayoutData, inReactFlow }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const unrestrictedEditing = useUnrestrictedEditing();
  const avoidEdgeLabelOverlap = useAvoidEdgeLabelOverlap();
  const whenToShowIndicators = useWhenToShowIndicators();
  const showIndicatorsOnHoverSelect = whenToShowIndicators === "onHoverOrSelect";

  const isNodeSelected = useIsNodeSelected(edge.id);
  const isEdgeSelected = useIsGraphPartSelected(edge.id);

  const spotlight: Spotlight = isEdgeSelected ? "primary" : isNodeSelected ? "secondary" : "normal";

  const { pathDefinition, labelX, labelY } = getPathDefinitionForEdge(
    edgeLayoutData,
    avoidEdgeLabelOverlap,
  );

  const path = (
    <StyledPath
      id={edge.id}
      className={"react-flow__edge-path" + ` spotlight-${spotlight}`}
      d={pathDefinition}
      markerEnd={`url(#${markerIds[spotlight]})`}
      spotlight={spotlight}
      onClick={() => setSelected(edge.id)}
      onContextMenu={(event) => openContextMenu(event, { edge })}
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
      onContextMenu={(event) => openContextMenu(event, { edge })}
    />
  );

  const labelText = edge.data.customLabel ?? lowerCase(edge.type);

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
      <Typography
        variant="body1"
        margin="0"
        contentEditable={userCanEditTopicData && unrestrictedEditing}
        suppressContentEditableWarning // https://stackoverflow.com/a/49639256/8409296
        onBlur={(event) => {
          const text = event.target.textContent.trim();
          if (text && text !== lowerCase(edge.type) && text !== edge.data.customLabel)
            setCustomEdgeLabel(edge, text);
        }}
        // without nopan, clicking on the span won't let you edit text
        className={userCanEditTopicData && unrestrictedEditing ? "nopan" : ""}
      >
        {labelText}
      </Typography>
      <CommonIndicatorGroup graphPart={edge} className="absolute right-0 translate-x-5" />
      <div
        className={
          "absolute bottom-0 flex translate-y-5" +
          /**
           * Ideally we only put this on the respective indicator groups, but when we do that, this
           * div still takes up space and is hoverable even when indicators are invisible.
           * Not sure how to avoid that without putting this here (`:empty` doesn't work because the
           * children _are_ in the DOM, they just have `visibility: hidden`).
           * Note: EditableNode's hanging indicator div (BottomDiv) is able to take up no space
           * because the children indicator groups are `absolute`ly positioned. We can't do that
           * here because edge labels don't have enough space to put the groups in opposite corners,
           * they have to be next to each other (and not overlap each other).
           */
          (showIndicatorsOnHoverSelect ? ` invisible ${visibleOnPartHoverSelectedClasses}` : "")
        }
      >
        <StatusIndicatorGroup graphPartId={edge.id} bgColor="white" notes={edge.data.notes} />
        <ContentIndicatorGroup
          graphPartId={edge.id}
          graphPartType="edge"
          bgColor="white"
          className="ml-0"
        />
      </div>
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
            onContextMenu={(event) => openContextMenu(event, { edge })}
          >
            {path}
          </svg>

          {label}
        </Box>
      </>
    );
  }
};
