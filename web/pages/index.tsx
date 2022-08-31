import { Box } from "@mui/material";
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
  const [edges] = useState<Edge[]>();

  return (
    <Box width="100%" height="100%">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </Box>
  );
};

export default Home;
