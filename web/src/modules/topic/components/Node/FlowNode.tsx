import { Global } from "@emotion/react";
import _ from "lodash";

import { useIsAnyArguableSelected } from "../../store/arguableHooks";
import { useIsEdgeSelected, useIsNeighborSelected } from "../../store/nodeHooks";
import { useDiagramType } from "../../store/store";
import { Node, orientations } from "../../utils/diagram";
import { NodeType } from "../../utils/node";
import { NodeProps } from "../Diagram/Diagram";
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
    type: flowNode.type as NodeType, // we always pass a NodeType from the diagram, but I'm not sure how to override react-flow's type to tell it that
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

  return (
    <>
      <Global styles={nodeStyles(node, isNeighborSelected)} />

      <HoverBridgeDiv />

      <NodeHandle node={node} direction="parent" orientation={orientation} />
      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning */}
      <AddNodeButtonGroupParent
        fromNodeId={flowNode.id}
        fromNodeType={node.type}
        as="parent"
        orientation={orientation}
      />

      <StyledEditableNode
        node={node}
        isNeighborSelected={isNeighborSelected}
        isEdgeSelected={isEdgeSelected}
        isAnyArguableSelected={isAnyArguableSelected}
      />

      <AddNodeButtonGroupChild
        fromNodeId={flowNode.id}
        fromNodeType={node.type}
        as="child"
        orientation={orientation}
      />
      <NodeHandle node={node} direction="child" orientation={orientation} />
    </>
  );
};
