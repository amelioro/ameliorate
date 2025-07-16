import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import { type SxProps, styled, useTheme } from "@mui/material";
import { motion } from "motion/react";
import { MouseEvent, memo, useContext, useState } from "react";

import { isDefaultCoreNodeType } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import {
  primarySpotlightColor,
  secondarySpotlightColor,
} from "@/web/topic/components/Diagram/Diagram.styles";
import { CommonIndicatorGroup } from "@/web/topic/components/Indicator/Base/CommonIndicatorGroup";
import {
  BottomDiv,
  LeftCornerStatusIndicators,
  MiddleDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  RightCornerContentIndicators,
  TopDiv,
  nodeWidthRem,
} from "@/web/topic/components/Node/EditableNode.styles";
import { NodeTextArea } from "@/web/topic/components/Node/NodeTextArea";
import { NodeToolbar } from "@/web/topic/components/Node/NodeToolbar";
import { workspaceId } from "@/web/topic/components/TopicWorkspace/TopicWorkspace";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { setCustomNodeType } from "@/web/topic/diagramStore/actions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";
import { useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { setSummaryNodeId } from "@/web/view/currentViewStore/summary";
import { setSelected, useIsGraphPartSelected } from "@/web/view/selectedPartStore";
import { useFillNodesWithColor } from "@/web/view/userConfigStore";

const useFloatingToolbar = (nodeRef: HTMLDivElement | null, selected: boolean) => {
  const [isOpenViaHover, setIsOpenViaHover] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpenViaHover || selected, // `isOpen` is controlled via floating-ui's interactions i.e. hover, and we want to show on hover and on selection
    onOpenChange: setIsOpenViaHover,
    placement: "right",
    middleware: [offset(8), flip()],
    elements: { reference: nodeRef },
    whileElementsMounted: autoUpdate, // couldn't get MUI Popper to update positioning when a node is added to the criteria table, so we're using floating-ui
  });

  const hover = useHover(context, { handleClose: safePolygon() });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return {
    isOpenViaHover,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
  };
};

interface Props {
  node: Node;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

const EditableNodeBase = ({ node, className = "", onClick }: Props) => {
  const [nodeRef, setNodeRef] = useState<HTMLDivElement | null>(null); // useState so that setting ref triggers re-render for floating ui https://floating-ui.com/docs/useFloating#elements

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const unrestrictedEditing = useUnrestrictedEditing();
  const fillNodesWithColor = useFillNodesWithColor();
  const selected = useIsGraphPartSelected(node.id);
  const context = useContext(WorkspaceContext);

  const floatingToolbarProps = useFloatingToolbar(nodeRef, selected);

  const theme = useTheme();

  const nodeDecoration = nodeDecorations[node.type];
  const nodeColor = theme.palette[node.type].main;
  const nodeLightColor = `color-mix(in oklch, ${nodeColor}, #fff 80%)`;
  const NodeIcon = nodeDecoration.NodeIcon;
  const typeText = node.data.customType ?? nodeDecoration.title;

  const customizable = userCanEditTopicData && (unrestrictedEditing || node.type === "custom");

  // TODO: use `fill-node`/`no-fill-node` class, and extract these to styles file; not sure how to use type-specific colors without js though? maybe css vars for type-specific colors, and a var for the node type that's scoped to the current node?
  const nodeStyles: SxProps = fillNodesWithColor
    ? {
        backgroundColor: nodeColor,
        borderColor: "black",
      }
    : {
        backgroundColor: nodeLightColor,
        borderColor: isDefaultCoreNodeType(node.type) ? nodeColor : nodeLightColor,

        [NodeTypeDiv.toString()]: {
          backgroundColor: nodeColor,
          // anti-aliasing between light node background and colored border/icon background creates a gray line - add colored shadow to hide this https://stackoverflow.com/a/40100710/8409296
          // also for nodes without borders, this helps the label color go to the edge of the node
          boxShadow: `-1px -1px 0px 1px ${nodeColor}`,
        },

        [`&.selected ${NodeTypeDiv.toString()}`]: {
          // Match the shadow size of not-selected nodes
          boxShadow: `-1px -1px 0px 0.5px ${primarySpotlightColor}`,
        },

        [`&.spotlight-secondary ${NodeTypeDiv.toString()}`]: {
          // Match the shadow size of not-selected nodes
          boxShadow: `-1px -1px 0px 0.5px ${secondarySpotlightColor}`,
        },
      };

  const nodeToolbar = (
    <div
      ref={floatingToolbarProps.refs.setFloating}
      style={floatingToolbarProps.floatingStyles}
      {...floatingToolbarProps.getFloatingProps()}
      className="z-10"
    >
      <NodeToolbar node={node} context={context} />
    </div>
  );

  return (
    <>
      <NodeMotionDiv
        // when nodes get swapped out e.g. summary node, this ensures the textarea is re-rendered to the right size before font size is reduced, avoiding over-reducing font
        // also, this ensures e.g. EditableNode doesn't try re-using ContextIndicator from one component to another, since that has hooks that are based on node type, and therefore would otherwise change creating a hook order-changed error
        key={node.id}
        ref={setNodeRef}
        // TODO?: not sure why summary nodes sometimes animate from height that's slightly off
        // don't animate in diagram because FlowNode already animates for diagram (with Handles)
        // don't animate in table because animation doesn't go over rows/cols - probably need to change overflows/positions/z-indexes in table, something like this https://github.com/amelioro/ameliorate/pull/771/files#diff-41880963d81eba31b5d0de56b7d1c84335078e0472037158b6a18b970da4d102
        // don't animate between contexts because if the node shows up in two spots at once, animation will remove it from one of the spots
        layoutId={context === "details" || context == "summary" ? node.id + context : undefined}
        onClick={(event) => {
          setSelected(node.id);
          if (context === "summary") setSummaryNodeId(node.id, true);
          if (onClick) onClick(event); // e.g. allow flownodes to trigger flashlight mode
          event.stopPropagation(); // prevent triggering node deselect from summary background click
        }}
        onContextMenu={(event) => openContextMenu(event, { node })}
        role="button"
        sx={{ ...nodeStyles, width: `${nodeWidthRem}rem` }}
        className={
          className +
          // allow other components to apply conditional css related to this node, e.g. when it's hovered/selected
          // separate from react-flow__node because sometimes nodes are rendered outside of react-flow (e.g. details pane), and we still want to style these
          " diagram-node" +
          " relative p-0 flex flex-col rounded-md border-2" +
          // avoid inheriting pointer-events because flow node will wrap in a motion.div that ignores pointer events
          " pointer-events-auto" +
          (!fillNodesWithColor ? " shadow shadow-gray-400" : "") +
          (selected ? " selected border-info-main shadow-info-main shadow-[0_0_0_1px]" : "")
        }
        {...floatingToolbarProps.getReferenceProps()} // for floating toolbar
      >
        <TopDiv className="flex h-6 items-center justify-between">
          {/* pb/pr-0.5 to have 2px of space below/right, to match the 2px border of the node that's above/left of this node type div */}
          <NodeTypeDiv className="flex h-6 items-center rounded-br rounded-tl pb-0.5 pr-0.5">
            <NodeIcon className="mx-1 size-3.5" />
            <NodeTypeSpan
              contentEditable={customizable}
              suppressContentEditableWarning // https://stackoverflow.com/a/49639256/8409296
              onBlur={(event) => {
                const text = event.target.textContent?.trim();
                if (text && text !== nodeDecoration.title && text !== node.data.customType)
                  setCustomNodeType(node, text);
              }}
              className={
                "pr-1 text-sm leading-normal" +
                // without nopan, clicking on the span won't let you edit text
                (customizable ? " nopan" : "")
              }
            >
              {typeText}
            </NodeTypeSpan>
          </NodeTypeDiv>
          <CommonIndicatorGroup graphPart={node} />
        </TopDiv>
        {/* grow to fill out remaining space with this div because it contains the textarea */}
        <MiddleDiv className="flex grow px-1 pb-2 pt-1">
          <NodeTextArea
            nodeId={node.id}
            nodeText={node.data.label}
            context={context}
            editable={userCanEditTopicData}
          />
        </MiddleDiv>
        <BottomDiv className="relative">
          {node.type !== "rootClaim" && ( // root claim indicators don't seem very helpful
            <>
              {/* TODO?: how to make corner indicators not look bad in the table? they're cut off */}
              <LeftCornerStatusIndicators
                graphPartId={node.id}
                bgColor={nodeStyles.backgroundColor as string}
                notes={node.data.notes}
              />
              <RightCornerContentIndicators
                graphPartId={node.id}
                graphPartType="node"
                bgColor={nodeStyles.backgroundColor as string}
              />
            </>
          )}
        </BottomDiv>

        {/* within node div so we can guarantee that the container div has relative positioning */}
        {/* TODO?: toolbar disappears sooner than add node buttons, and shadow disappears faster than either of these; ideally they'd probably disappear at the same time? */}
        {(selected || floatingToolbarProps.isOpenViaHover) &&
          (context === "table" ? (
            // TODO?: hmm can't seem to portal to `criteria-table-paper` and get the zoom for the portal, because the zoom is being applied to the table itself to avoid applying to header,
            // but we want to portal the toolbar in order to avoid clipping by the table's `overflow: auto` that's required for scrolling to see more nodes.
            // Potentially we could add a div above the table (that's sibling to the header) and portal there to get the zoom on the toolbar.
            // For now we're just portaling to a good root location, since there doesn't seem to be much benefit to portaling closer to the table.
            // Note: maybe not having zoom applied to the toolbar is ok so that the buttons are easier to click anyway.
            <FloatingPortal id={workspaceId}>{nodeToolbar}</FloatingPortal>
          ) : (
            // not portaling this, so that zoom applies e.g. in the diagram
            nodeToolbar
          ))}
      </NodeMotionDiv>
    </>
  );
};

const NodeMotionDiv = styled(motion.div)``;

export const EditableNode = memo(EditableNodeBase);
