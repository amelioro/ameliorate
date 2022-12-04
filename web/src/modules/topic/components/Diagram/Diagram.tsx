import { Cancel } from "@mui/icons-material";
import { Typography } from "@mui/material";
import _ from "lodash";
import { ComponentType } from "react";
import {
  Background,
  BackgroundVariant,
  type EdgeProps as DefaultEdgeProps,
  type NodeProps as DefaultNodeProps,
} from "reactflow";

import { deselectNodes, setActiveDiagram } from "../../store/actions";
import { rootId, useActiveDiagram, useActiveDiagramId } from "../../store/store";
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
  Problem: buildNodeComponent("Problem"),
  Solution: buildNodeComponent("Solution"),
  RootClaim: buildNodeComponent("RootClaim"),
  Support: buildNodeComponent("Support"),
  Critique: buildNodeComponent("Critique"),
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

export const Diagram = () => {
  const activeDiagramId = useActiveDiagramId();
  const activeDiagram = useActiveDiagram();

  const nodes = activeDiagram.nodes;
  const edges = activeDiagram.edges;

  const showCloseButton = activeDiagramId != rootId;
  const closeButton = (
    <PositionedIconButton onClick={() => setActiveDiagram(rootId)} color="primary">
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
        nodesDraggable={false}
        nodesConnectable={false} // disable because doesn't work yet
      >
        <Background variant={BackgroundVariant.Dots} />
        {_(nodes).isEmpty() && emptyText}
      </StyledReactFlow>
    </>
  );
};
