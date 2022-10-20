import { Typography } from "@mui/material";
import _ from "lodash";
import {
  Background,
  BackgroundVariant,
  type NodeProps as DefaultNodeProps,
} from "react-flow-renderer";

import { Node, useDiagramStore } from "../Diagram.store";
import { ProblemNode } from "../EditableNode/ProblemNode";
import { StyledReactFlow } from "./Diagram.styles";

const nodeTypes = { problem: ProblemNode };

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
      fitView
      onPaneClick={deselectNodes}
    >
      <Background variant={BackgroundVariant.Dots} />
      {_(nodes).isEmpty() && emptyText}
    </StyledReactFlow>
  );
};
