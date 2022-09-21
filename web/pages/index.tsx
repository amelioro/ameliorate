import { Box, Typography } from "@mui/material";
import _ from "lodash";
import { NextPage } from "next";
import { useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
} from "react-flow-renderer";

import { EditableNode } from "../modules/diagram/components/EditableNode";

const nodeTypes = { editable: EditableNode };

const initialNodes = [
  {
    id: "1",
    data: {
      label: "text1",
    },
    position: { x: 250, y: 25 },
    type: "editable",
  },
  {
    id: "2",
    data: {
      label: "text2",
    },
    position: { x: 250, y: 125 },
    type: "editable",
  },
];

const Home: NextPage = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  // const [nodes] = useState<Node[]>();
  const [edges] = useState<Edge[]>();

  const deselectNodes = () => {
    setNodes((nodes) => {
      return nodes.map((node) => {
        return { ...node, selected: false };
      });
    });
  };

  const emptyText = <Typography variant="h5">Right-click to create</Typography>;

  return (
    <>
      <Box width="100%" height="100%">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          onPaneClick={deselectNodes}
          style={centerText}
        >
          <Background variant={BackgroundVariant.Dots} />
          {_(nodes).isEmpty() && emptyText}
        </ReactFlow>
      </Box>
    </>
  );
};

const centerText = { display: "flex", justifyContent: "center", alignItems: "center" };

export default Home;
