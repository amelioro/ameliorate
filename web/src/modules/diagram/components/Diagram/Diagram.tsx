import { Typography } from "@mui/material";
import _ from "lodash";
import { ComponentType } from "react";
import { Background, BackgroundVariant, type NodeProps as DefaultNodeProps } from "reactflow";

import { Node, useDiagramStore } from "../Diagram.store";
import { EditableNode } from "../EditableNode/EditableNode";
import { ScoreEdge } from "../ScoreEdge/ScoreEdge";
import { type NodeDecoration, type NodeType, nodeDecorations } from "../nodeDecorations";
import { StyledReactFlow } from "./Diagram.styles";

const buildNodeComponent = (type: NodeType, decoration: NodeDecoration) => {
  // eslint-disable-next-line react/display-name -- react flow dynamically creates these components without name anyway
  return (props: NodeProps) => {
    return (
      <EditableNode
        {...props}
        themeColor={decoration.themeColor}
        iconSrc={decoration.iconSrc}
        type={type}
      />
    );
  };
};

// this can be generated via `nodeDecorations` but hard to do without the complexity making it hard to follow, so leaving this hardcoded
const nodeTypes: Record<NodeType, ComponentType<NodeProps>> = {
  Problem: buildNodeComponent("Problem", nodeDecorations.Problem),
  Solution: buildNodeComponent("Solution", nodeDecorations.Solution),
};

const edgeTypes = { ScoreEdge: ScoreEdge };

// react-flow passes exactly DefaultNodeProps but data can be customized
// not sure why, but DefaultNodeProps has xPos and yPos instead of Node's position.x and position.y
export interface NodeProps extends DefaultNodeProps {
  data: Node["data"];
}

export const Diagram = () => {
  const [nodes, edges, deselectNodes] = useDiagramStore((state) => [
    state.nodes,
    state.edges,
    state.deselectNodes,
  ]);

  const emptyText = <Typography variant="h5">Right-click to create</Typography>;

  return (
    <StyledReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      onPaneClick={deselectNodes}
    >
      <Background variant={BackgroundVariant.Dots} />
      {_(nodes).isEmpty() && emptyText}
    </StyledReactFlow>
  );
};
