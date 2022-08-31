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

const initialNodes = [
  {
    id: "1",
    data: { label: "test" },
    position: { x: 250, y: 25 },
  },
];

const Home: NextPage = () => {
  const [nodes] = useState<Node[]>(initialNodes);
  // const [nodes] = useState<Node[]>();
  const [edges] = useState<Edge[]>();

  const emptyText = <Typography variant="h5">Right-click to create</Typography>;

  return (
    <Box width="100%" height="100%">
      <ReactFlow nodes={nodes} edges={edges} fitView style={centerText}>
        <Background variant={BackgroundVariant.Dots} />
        {_(nodes).isEmpty() && emptyText}
      </ReactFlow>
    </Box>
  );
};

const centerText = { display: "flex", justifyContent: "center", alignItems: "center" };

export default Home;
