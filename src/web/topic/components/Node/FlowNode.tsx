import { Global } from "@emotion/react";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";

import { topicNodeTypes } from "../../../../common/node";
import { useSessionUser } from "../../../common/hooks";
import { useIsEdgeSelected, useIsNeighborSelected } from "../../store/nodeHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { Node } from "../../utils/graph";
import { FlowNodeType } from "../../utils/node";
import { DiagramContext, NodeProps } from "../Diagram/Diagram";
import { Spotlight } from "../Diagram/Diagram.styles";
import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  HoverBridgeDiv,
  StyledEditableNode,
  nodeStyles,
} from "./FlowNode.styles";
import { NodeHandle } from "./NodeHandle";

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

  const diagramContext = useContext(DiagramContext);
  const node = convertToNode(flowNode);

  const spotlight: Spotlight = flowNode.selected
    ? "primary"
    : isNeighborSelected || isEdgeSelected
    ? "secondary"
    : "normal";

  // avoids awkwardly allowing adding topic nodes to research diagram when they won't show up after adding
  const isSecondary = topicNodeTypes.includes(node.type) && diagramContext.type !== "topicDiagram";

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
      {userCanEditTopicData && !isSecondary && (
        <AddNodeButtonGroupParent
          fromNodeId={flowNode.id}
          fromNodeType={node.type}
          as="parent"
          orientation={diagramContext.orientation}
        />
      )}

      <motion.div
        // create new component when animated changes, see issue workaround https://github.com/framer/motion/issues/2238#issue-1809290539
        key={node.id.concat(animated.toString())}
        layout={animated}
        style={{ pointerEvents: "none" }}
      >
        <NodeHandle node={node} direction="parent" orientation={diagramContext.orientation} />
        <StyledEditableNode node={node} spotlight={spotlight} />
        <NodeHandle node={node} direction="child" orientation={diagramContext.orientation} />
      </motion.div>

      {userCanEditTopicData && !isSecondary && (
        <AddNodeButtonGroupChild
          fromNodeId={flowNode.id}
          fromNodeType={node.type}
          as="child"
          orientation={diagramContext.orientation}
        />
      )}
    </>
  );
};
