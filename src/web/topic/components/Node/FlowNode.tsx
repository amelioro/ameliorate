import { Global } from "@emotion/react";
import { motion } from "framer-motion";
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
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";
import { orientation } from "@/web/topic/utils/layout";
import { FlowNodeType } from "@/web/topic/utils/node";
import { getFlashlightMode } from "@/web/view/actionConfigStore";
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

  const showAddButtonsClasses =
    "[.selectable:hover_>_&]:flex [.selectable:has(>_div_>_.selected)_>_&]:flex";

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
          fromNodeType={node.type}
          as="parent"
          orientation={orientation}
          className={`absolute hidden ${showAddButtonsClasses} ${positionParentButtonsClasses}`}
        />
      )}

      <motion.div
        // create new component when animated changes, see issue workaround https://github.com/framer/motion/issues/2238#issue-1809290539
        key={node.id.concat(animated.toString())}
        layout={animated}
        style={{ pointerEvents: "none" }}
        onClick={() => {
          if (getFlashlightMode()) showNodeAndNeighbors(node.id, true);
        }}
      >
        <NodeHandle node={node} direction="parent" orientation={orientation} />
        <StyledEditableNode node={node} className={`spotlight-${spotlight}`} />
        <NodeHandle node={node} direction="child" orientation={orientation} />
      </motion.div>

      {userCanEditTopicData && (
        <AddNodeButtonGroup
          fromNodeId={flowNode.id}
          fromNodeType={node.type}
          as="child"
          orientation={orientation}
          className={`absolute hidden ${showAddButtonsClasses} ${positionChildButtonsClasses}`}
        />
      )}
    </>
  );
};
