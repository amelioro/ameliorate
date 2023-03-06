import dagre from "dagre";

import { nodeWidth } from "../components/Node/EditableNode.styles";
import { type Edge, type Node } from "../utils/diagram";

export type Orientation = "TB" | "BT" | "LR" | "RL";
export const spaceBetweenNodes = 130;

// mostly from https://reactflow.dev/docs/examples/layout/dagre/
export const layout = (nodes: Node[], edges: Edge[], orientation: Orientation) => {
  const dagreGraph = new dagre.graphlib.Graph();
  const height = 90; // grab size from node, but how? size adjusts based on input rows

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: orientation, ranksep: spaceBetweenNodes });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: height });
  });

  edges.forEach((edge) => {
    // TODO: there's still overlap when connecting existing nodes
    // height is hardcoded pixel height of text based on font size
    dagreGraph.setEdge(edge.source, edge.target, { width: spaceBetweenNodes, height: 24 });
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { layoutedNodes, layoutedEdges: edges };
};
