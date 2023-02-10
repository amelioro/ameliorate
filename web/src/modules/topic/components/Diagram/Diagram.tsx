import { Cancel } from "@mui/icons-material";
import { Typography } from "@mui/material";
import _ from "lodash";
import { ComponentType, MouseEvent } from "react";
import {
  Background,
  BackgroundVariant,
  type EdgeProps as DefaultEdgeProps,
  type NodeProps as DefaultNodeProps,
  type Node as FlowNode,
} from "reactflow";

import { ContextMenu } from "../../../../common/components/Menu/Menu";
import { openContextMenu } from "../../../../common/store/contextMenuActions";
import { closeClaimDiagram, connectNodes, deselectNodes } from "../../store/actions";
import { useFilteredDiagram } from "../../store/store";
import { type Edge, type Node } from "../../utils/diagram";
import { type NodeType } from "../../utils/nodes";
import { EditableNode } from "../EditableNode/EditableNode";
import { ScoreEdge } from "../ScoreEdge/ScoreEdge";
import { PositionedIconButton, StyledReactFlow } from "./Diagram.styles";

const buildNodeComponent = (type: NodeType) => {
  // eslint-disable-next-line react/display-name -- react flow dynamically creates these components without name anyway
  return (props: NodeProps) => {
    return <EditableNode {...props} type={type} />;
  };
};

// this can be generated via `nodeDecorations` but hard to do without the complexity making it hard to follow, so leaving this hardcoded
const nodeTypes: Record<NodeType, ComponentType<NodeProps>> = {
  problem: buildNodeComponent("problem"),
  solution: buildNodeComponent("solution"),
  criterion: buildNodeComponent("criterion"),
  rootClaim: buildNodeComponent("rootClaim"),
  support: buildNodeComponent("support"),
  critique: buildNodeComponent("critique"),
};

const edgeTypes: Record<"ScoreEdge", ComponentType<EdgeProps>> = { ScoreEdge: ScoreEdge };

// react-flow passes exactly DefaultNodeProps but data can be customized
// not sure why, but DefaultNodeProps has xPos and yPos instead of Node's position.x and position.y
export interface NodeProps extends DefaultNodeProps {
  data: Node["data"];
}

export interface EdgeProps extends DefaultEdgeProps {
  // we'll always pass data - why does react-flow make it nullable :(
  // can't figure out how to amend this to make it non-nullable, since react-flow's Edge is defined as a type, not an interface
  data?: Edge["data"];
}

interface DiagramProps {
  diagramId: string;
}

export const Diagram = ({ diagramId }: DiagramProps) => {
  const diagram = useFilteredDiagram(diagramId);

  const nodes = diagram.nodes;
  const edges = diagram.edges;

  const showCloseButton = activeDiagramId != problemDiagramId;
  const showCloseButton = diagram.type === "Claim";
  const closeButton = (
    <PositionedIconButton onClick={() => closeClaimDiagram()} color="primary">
      <Cancel />
    </PositionedIconButton>
  );

  const emptyText = <Typography variant="h5">Right-click to create</Typography>;

  return (
    <>
      {showCloseButton && closeButton}

      <StyledReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        minZoom={0.25}
        onPaneClick={deselectNodes}
        onConnect={({ source, target }) => connectNodes(source, target)}
        onNodeContextMenu={(event: MouseEvent, node: FlowNode) => openContextMenu(event, { node })}
        nodesDraggable={false}
        nodesConnectable={diagram.type !== "Claim"} // claim diagram is a tree, so cannot connect existing nodes
      >
        <Background variant={BackgroundVariant.Dots} />
        {_(nodes).isEmpty() && emptyText}
      </StyledReactFlow>

      <ContextMenu />
    </>
  );
};
