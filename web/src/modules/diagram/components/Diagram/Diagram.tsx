import { Typography } from "@mui/material";
import _ from "lodash";
import { Background, BackgroundVariant } from "react-flow-renderer";

import { useDiagramStore } from "../Diagram.store";
import { EditableNode } from "../EditableNode/EditableNode";
import { StyledReactFlow } from "./Diagram.styles";

const nodeTypes = { editable: EditableNode };

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
