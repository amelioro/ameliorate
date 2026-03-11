import { Global } from "@emotion/react";
import { Position, useUpdateNodeInternals } from "@xyflow/react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { isEffect, solutionSpecificNodeTypes } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { Spotlight } from "@/web/topic/components/Diagram/Diagram.styles";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import {
  HoverBridgeDiv,
  StyledEditableNode,
  nodeStyles,
} from "@/web/topic/components/Node/FlowNode.styles";
import { FocusNodeAttachment } from "@/web/topic/components/Node/FocusNodeAttachment";
import { NodeHandle } from "@/web/topic/components/Node/NodeHandle";
import { useNode } from "@/web/topic/diagramStore/nodeHooks";
import { useEffectType } from "@/web/topic/diagramStore/nodeTypeHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { addableRelationsFrom } from "@/web/topic/utils/edge";
import { FlowNodeProps } from "@/web/topic/utils/flowUtils";
import { buildPortId, opposite, orientation, positions } from "@/web/topic/utils/layout";
import { visibleOnPartHoverSelectedClasses } from "@/web/topic/utils/styleUtils";
import { getFlashlightMode, useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { showNodeAndNeighbors } from "@/web/view/currentViewStore/filter";
import {
  useIsDisplayedEdgeSelected,
  useIsDisplayedNeighborSelected,
  useIsGraphPartSelected,
} from "@/web/view/selectedPartStore";

export const FlowNode = (flowNode: FlowNodeProps) => {
  const [animated, setAnimated] = useState(false);

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const updateNodeInternals = useUpdateNodeInternals();

  const node = useNode(flowNode.id);
  const isSelected = useIsGraphPartSelected(flowNode.id);
  const isNeighborSelected = useIsDisplayedNeighborSelected(flowNode.id);
  const isEdgeSelected = useIsDisplayedEdgeSelected(flowNode.id);

  const unrestrictedEditing = useUnrestrictedEditing();
  const effectType = useEffectType(flowNode.id);

  useEffect(() => {
    // hack to avoid animation on first render; for some reason nodes were animating from position 0
    // to their initial position
    setAnimated(true);
  }, []);

  if (!node) return null;

  const spotlight: Spotlight = isSelected
    ? "primary"
    : isNeighborSelected || isEdgeSelected
      ? "secondary"
      : "normal";

  const unrestrictedAddingFrom = node.type === "custom" || unrestrictedEditing;
  const addableRelations = addableRelationsFrom(
    node.type,
    undefined,
    unrestrictedAddingFrom,
    effectType,
  );
  const portsAbove = flowNode.data.ports.filter(
    (port) => port.layoutOptions?.["elk.port.side"] === "NORTH",
  );
  const portsBelow = flowNode.data.ports.filter(
    (port) => port.layoutOptions?.["elk.port.side"] === "SOUTH",
  );

  // not sure if this is ideal or not, but we're using a darker shadow so that the button
  // stands out when in front of a bunch of edges (Mui's default shadow doesn't stand out much)
  const addButtonDecorationClasses = "shadow-sm shadow-gray-500";

  const abovePosition = orientation === "UP" ? Position.Top : Position.Left;
  const belowPosition = orientation === "UP" ? Position.Bottom : Position.Right;

  // this might be more accurate if we just check if this node is caused by a solution, or if this node impedes a solution, or mitigates an obstacle
  const acrossFromProblem =
    (isEffect(node.type) && effectType === "solution") ||
    solutionSpecificNodeTypes.includes(node.type);

  const addButtonPosition = acrossFromProblem
    ? positions.backward[orientation]
    : positions.forward[orientation];

  const addButtonPositionClasses =
    addButtonPosition === Position.Top
      ? "top-0 left-1/2 -translate-x-1/2 translate-y-[calc(-100%-16px)]"
      : addButtonPosition === Position.Bottom
        ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+16px)]"
        : addButtonPosition === Position.Left
          ? "left-0 top-1/2 -translate-y-1/2 translate-x-[calc(-100%-16px)]"
          : "right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+16px)]";

  const focusNodeAttachmentPosition = opposite[addButtonPosition];

  const focusNodeAttachmentPositionClasses =
    focusNodeAttachmentPosition === Position.Top
      ? "top-0 left-2 -translate-y-full"
      : focusNodeAttachmentPosition === Position.Bottom
        ? "bottom-0 left-2 translate-y-full"
        : focusNodeAttachmentPosition === Position.Left
          ? "left-0 bottom-2 -translate-x-full"
          : "right-0 bottom-2 translate-x-full";

  return (
    <>
      <Global styles={nodeStyles(node, spotlight)} />

      {/* TODO: this should only exist between the node and toolbar, not all surrounding the node */}
      {/* TODO: hovering the bridge shouldn't have a pointer cursor if clicking won't select the node */}
      <HoverBridgeDiv />

      {/* using this motion.div separately from EditableNode's specifically for animating node handles with the node */}
      <motion.div
        // create new component when animated changes, see issue workaround https://github.com/framer/motion/issues/2238#issue-1809290539
        key={node.id.concat(animated.toString())}
        layout={animated}
        style={{ pointerEvents: "none" }}
        onLayoutAnimationComplete={() => {
          /**
           * This ensures node measurements are accurate after animation.
           *
           * Normally ReactFlow measures node placement immediately after flow render, but `motion`
           * will animate position over a few moments, causing initial node measurement to be
           * incorrect, and new connections will be drawn from old handle positions.
           *
           * Note: if performance of this is significant, we can just move the handles outside of
           * the `motion.div`, since they don't _really_ need to animate.
           */
          updateNodeInternals(node.id);
        }}
      >
        <FocusNodeAttachment
          node={node}
          position={focusNodeAttachmentPosition}
          className={focusNodeAttachmentPositionClasses}
        />

        {/* always render a handle even if layout did not create a port for the node, because reactflow ports are currently needed in order to create connections */}
        {/* TODO: remove once we make reactflow ports unnecessary for creating connections */}
        {portsAbove.length === 0 && (
          <NodeHandle id={buildPortId(node.id, "source")} position={abovePosition} />
        )}
        {portsAbove.map((port) => (
          <NodeHandle key={port.id} id={port.id} position={abovePosition} />
        ))}
        <StyledEditableNode
          node={node}
          className={`spotlight-${spotlight}`}
          onClick={() => {
            if (getFlashlightMode()) showNodeAndNeighbors(node.id, true);
          }}
        />
        {portsBelow.length === 0 && (
          <NodeHandle id={buildPortId(node.id, "target")} position={belowPosition} />
        )}
        {portsBelow.map((port) => (
          <NodeHandle key={port.id} id={port.id} position={belowPosition} />
        ))}
      </motion.div>

      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning. but it probably would be jank if we want the toolbar to work outside of the diagram */}
      {userCanEditTopicData && (
        <AddNodeButtonGroup
          fromNodeId={flowNode.id}
          addableRelations={addableRelations}
          title="Add node"
          openDirection={addButtonPosition === Position.Top ? "top" : "bottom"}
          // use visibility so that buttons stay in DOM and their tooltips don't throw an "`anchorEl` prop invalid" error when they're hidden
          className={`invisible absolute ${visibleOnPartHoverSelectedClasses} ${addButtonPositionClasses} ${addButtonDecorationClasses}`}
        />
      )}
    </>
  );
};
