import { Global } from "@emotion/react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { NodeProps } from "@/web/topic/components/Diagram/Diagram";
import { Spotlight } from "@/web/topic/components/Diagram/Diagram.styles";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import {
  HoverBridgeDiv,
  StyledEditableNode,
  nodeStyles,
} from "@/web/topic/components/Node/FlowNode.styles";
import { NodeHandle } from "@/web/topic/components/Node/NodeHandle";
import { useIsEdgeSelected, useIsNeighborSelected } from "@/web/topic/diagramStore/nodeHooks";
import { useIsMitigatableDetriment } from "@/web/topic/diagramStore/nodeTypeHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { addableRelationsFrom } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";
import { orientation } from "@/web/topic/utils/layout";
import { FlowNodeType } from "@/web/topic/utils/node";
import { getFlashlightMode, useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { showNodeAndNeighbors } from "@/web/view/currentViewStore/filter";

const convertToNode = (flowNode: NodeProps): Node => {
  return {
    id: flowNode.id,
    data: flowNode.data,
    type: flowNode.type as FlowNodeType, // we always pass a NodeType from the diagram, but I'm not sure how to override react-flow's type to tell it that
  };
};

export const FlowNode = (flowNode: NodeProps) => {
  const [animated, setAnimated] = useState(false);

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const isNeighborSelected = useIsNeighborSelected(flowNode.id);
  const isEdgeSelected = useIsEdgeSelected(flowNode.id);

  const unrestrictedEditing = useUnrestrictedEditing();
  const isMitigatableDetriment = useIsMitigatableDetriment(flowNode.id);

  const node = useMemo(() => {
    return convertToNode(flowNode);
  }, [flowNode]);

  const spotlight: Spotlight = flowNode.selected
    ? "primary"
    : isNeighborSelected || isEdgeSelected
      ? "secondary"
      : "normal";

  useEffect(() => {
    // hack to avoid animation on first render; for some reason nodes were animating from position 0
    // to their initial position
    setAnimated(true);
  }, []);

  const unrestrictedAddingFrom = node.type === "custom" || unrestrictedEditing;
  const addableParentRelations = addableRelationsFrom(
    node.type,
    "parent",
    unrestrictedAddingFrom,
    isMitigatableDetriment,
  );
  const addableChildRelations = addableRelationsFrom(
    node.type,
    "child",
    unrestrictedAddingFrom,
    isMitigatableDetriment,
  );

  const showAddButtonsClasses =
    "[.selectable:hover_>_&]:flex [.selectable:has(>_div_>_.selected)_>_&]:flex";

  // not sure if this is ideal or not, but we're using a darker shadow so that the button
  // stands out when in front of a bunch of edges (Mui's default shadow doesn't stand out much)
  const addButtonDecorationClasses = "shadow shadow-gray-500";

  const positionParentButtonsClasses =
    orientation === "DOWN"
      ? // have to use [arbitrary] tw values because can't apply two translate-x-* class names
        // `left-1/2 top-0 -translate-x-1/2 translate-y-[calc(-100%-${nodeBridgeGap}px)]`
        // also can't use `${nodeBridgeGap}` because tw classes are detected based on full class names being present in the source file https://tailwindcss.com/docs/content-configuration#dynamic-class-names
        `left-1/2 top-0 -translate-x-1/2 translate-y-[calc(-100%-16px)]`
      : `top-1/2 left-0 -translate-y-1/2 translate-x-[calc(-100%-16px)]`;
  const positionChildButtonsClasses =
    orientation === "DOWN"
      ? `left-1/2 bottom-0 -translate-x-1/2 translate-y-[calc(100%+16px)]`
      : `top-1/2 right-0 -translate-y-1/2 translate-x-[calc(100%+16px)]`;

  return (
    <>
      <Global styles={nodeStyles(node, spotlight)} />

      <HoverBridgeDiv />

      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning */}
      {userCanEditTopicData && (
        <AddNodeButtonGroup
          fromNodeId={flowNode.id}
          addableRelations={addableParentRelations}
          title="Add node above"
          openDirection="top"
          className={`absolute hidden ${showAddButtonsClasses} ${positionParentButtonsClasses} ${addButtonDecorationClasses}`}
        />
      )}

      {/* using this motion.div separately from EditableNode's specifically for animating node handles with the node */}
      <motion.div
        // create new component when animated changes, see issue workaround https://github.com/framer/motion/issues/2238#issue-1809290539
        key={node.id.concat(animated.toString())}
        layout={animated}
        style={{ pointerEvents: "none" }}
      >
        <NodeHandle node={node} direction="parent" orientation={orientation} />
        <StyledEditableNode
          node={node}
          className={`spotlight-${spotlight}`}
          onClick={() => {
            if (getFlashlightMode()) showNodeAndNeighbors(node.id, true);
          }}
        />
        <NodeHandle node={node} direction="child" orientation={orientation} />
      </motion.div>

      {userCanEditTopicData && (
        <AddNodeButtonGroup
          fromNodeId={flowNode.id}
          addableRelations={addableChildRelations}
          title="Add node below"
          openDirection="bottom"
          className={`absolute hidden ${showAddButtonsClasses} ${positionChildButtonsClasses} ${addButtonDecorationClasses}`}
        />
      )}
    </>
  );
};
