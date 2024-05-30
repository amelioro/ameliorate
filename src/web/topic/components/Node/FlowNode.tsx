import { Global } from "@emotion/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { NodeProps } from "@/web/topic/components/Diagram/Diagram";
import { Spotlight } from "@/web/topic/components/Diagram/Diagram.styles";
import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  HoverBridgeDiv,
  StyledEditableNode,
  nodeStyles,
} from "@/web/topic/components/Node/FlowNode.styles";
import { NodeHandle } from "@/web/topic/components/Node/NodeHandle";
import { useIsEdgeSelected, useIsNeighborSelected } from "@/web/topic/store/nodeHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
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

  return (
    <>
      <Global styles={nodeStyles(node, spotlight)} />

      <HoverBridgeDiv />

      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning */}
      {userCanEditTopicData && (
        <AddNodeButtonGroupParent
          fromNodeId={flowNode.id}
          fromNodeType={node.type}
          as="parent"
          orientation={orientation}
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
        <AddNodeButtonGroupChild
          fromNodeId={flowNode.id}
          fromNodeType={node.type}
          as="child"
          orientation={orientation}
        />
      )}
    </>
  );
};
