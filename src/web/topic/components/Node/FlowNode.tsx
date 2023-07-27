import { Global } from "@emotion/react";

import { useIsAnyArguableSelected } from "../../store/arguableHooks";
import { useIsEdgeSelected, useIsNeighborSelected } from "../../store/nodeHooks";
import { useDiagramType } from "../../store/store";
import { Node, orientations } from "../../utils/diagram";
import { FlowNodeType } from "../../utils/node";
import { NodeProps } from "../Diagram/Diagram";
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
    position: { x: flowNode.xPos, y: flowNode.yPos },
    selected: flowNode.selected,
    type: flowNode.type as FlowNodeType, // we always pass a NodeType from the diagram, but I'm not sure how to override react-flow's type to tell it that
  };
};

export const FlowNode = (flowNode: NodeProps) => {
  const diagramType = useDiagramType(flowNode.data.diagramId);
  const isNeighborSelected = useIsNeighborSelected(flowNode.id, flowNode.data.diagramId);
  const isEdgeSelected = useIsEdgeSelected(flowNode.id, flowNode.data.diagramId);
  const isAnyArguableSelected = useIsAnyArguableSelected();

  if (!diagramType) return <></>;

  const orientation = orientations[diagramType];
  const node = convertToNode(flowNode);

  const spotlight: Spotlight = node.selected
    ? "primary"
    : isNeighborSelected || isEdgeSelected
    ? "secondary"
    : isAnyArguableSelected
    ? "background"
    : "normal";

  return (
    <>
      <Global styles={nodeStyles(node, spotlight)} />

      <HoverBridgeDiv />

      <NodeHandle node={node} direction="parent" orientation={orientation} spotlight={spotlight} />
      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning */}
      <AddNodeButtonGroupParent
        fromNodeId={flowNode.id}
        fromNodeType={node.type}
        as="parent"
        orientation={orientation}
      />

      <StyledEditableNode node={node} spotlight={spotlight} />

      <AddNodeButtonGroupChild
        fromNodeId={flowNode.id}
        fromNodeType={node.type}
        as="child"
        orientation={orientation}
      />
      <NodeHandle node={node} direction="child" orientation={orientation} spotlight={spotlight} />
    </>
  );
};
