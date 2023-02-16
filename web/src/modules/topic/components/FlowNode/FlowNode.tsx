import _ from "lodash";
import { Handle, Position } from "reactflow";

import { useDiagramType } from "../../store/store";
import { Node, orientations } from "../../utils/diagram";
import { NodeType } from "../../utils/nodes";
import { NodeProps } from "../Diagram/Diagram";
import { EditableNode } from "../EditableNode/EditableNode";
import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  HoverBridgeDiv,
} from "./FlowNode.styles";

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

  if (!diagramType) return <></>;

  const orientation = orientations[diagramType];
  const node = convertToNode(flowNode);

  return (
    <>
      <HoverBridgeDiv />

      <Handle type="target" position={orientation == "TB" ? Position.Top : Position.Left} />
      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning */}
      <AddNodeButtonGroupParent
        fromNodeId={flowNode.id}
        fromNodeType={node.type}
        as="parent"
        orientation={orientation}
      />

      <EditableNode node={convertToNode(flowNode)} />

      <AddNodeButtonGroupChild
        fromNodeId={flowNode.id}
        fromNodeType={node.type}
        as="child"
        orientation={orientation}
      />
      <Handle type="source" position={orientation == "TB" ? Position.Bottom : Position.Right} />
    </>
  );
};
