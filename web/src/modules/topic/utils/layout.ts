import ELK, { ElkNode, LayoutOptions } from "elkjs";

import { nodeWidthPx } from "../components/Node/EditableNode.styles";
import { type Edge, type Node } from "../utils/diagram";

export type Orientation = "DOWN" | "UP" | "RIGHT" | "LEFT";

const elk = new ELK();

export const layout = async (nodes: Node[], edges: Edge[], orientation: Orientation) => {
  // see support layout options at https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
  const layoutOptions: LayoutOptions = {
    algorithm: "layered",
    "elk.direction": orientation,
    // results in a more centered layout - seems to moreso ignore edges when laying out
    "elk.edgeRouting": "POLYLINE",
    // preserve order if layout is already good enough
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    // not sure why larger value is needed for horizontal orientation, but it is; probably one/some of the other spacing options
    "elk.layered.spacing.nodeNodeBetweenLayers": orientation === "DOWN" ? "90" : "135",
  };

  const height = 90; // grab size from node, but how? size adjusts based on input rows

  const graph: ElkNode = {
    id: "elkgraph",
    children: nodes.map((node) => {
      return { id: node.id, width: nodeWidthPx, height: height };
    }),
    edges: edges.map((edge) => {
      return { id: edge.id, sources: [edge.source], targets: [edge.target] };
    }),
  };

  const layoutedGraph = await elk.layout(graph, {
    layoutOptions,
    logging: true,
    measureExecutionTime: true,
  });

  const layoutedNodes = nodes.map((node) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we just added children above, so they should still exist
    const nodeWithPosition = layoutedGraph.children!.find((child) => child.id === node.id)!;

    return {
      ...node,
      position: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        x: nodeWithPosition.x!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        y: nodeWithPosition.y!,
      },
    };
  });

  return { layoutedNodes, layoutedEdges: edges };
};
