import dagre from "dagre";
import { type Edge } from "react-flow-renderer";

import { Node } from "../components/Diagram.store";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// mostly from https://reactflow.dev/docs/examples/layout/dagre/
export const layout = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: node.data.width, height: node.data.height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - node.data.width / 2,
        y: nodeWithPosition.y - node.data.height / 2,
      },
    };
  });

  return { layoutedNodes, layoutedEdges: edges };
};
