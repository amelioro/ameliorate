import ELK, { ElkNode, LayoutOptions } from "elkjs";

import { NodeType } from "../../../common/node";
import { nodeHeightPx, nodeWidthPx } from "../components/Node/EditableNode.styles";
import { type Edge, type Node } from "../utils/diagram";

export type Orientation = "DOWN" | "UP" | "RIGHT" | "LEFT";

const partitionOrders: { [type in NodeType]: string } = {
  problem: "null",
  criterion: "1",
  effect: "2",
  solutionComponent: "3",
  solution: "4",

  rootClaim: "null",
  support: "null",
  critique: "null",
};

const elk = new ELK();

export const layout = async (nodes: Node[], edges: Edge[], orientation: Orientation) => {
  // see support layout options at https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
  const layoutOptions: LayoutOptions = {
    algorithm: "layered",
    "elk.direction": orientation,
    // results in a more centered layout - seems to moreso ignore edges when laying out
    "elk.edgeRouting": "POLYLINE",
    "elk.spacing.edgeEdge": "0",
    // other placement strategies seem to either spread nodes out too much, or ignore edges between layers
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    // preserve order if layout is already good enough
    // these spacings are just what roughly seem to look good
    "elk.layered.spacing.nodeNodeBetweenLayers": orientation === "DOWN" ? "130" : "220",
    "elk.spacing.nodeNode": orientation === "DOWN" ? "20" : "50",
    // allow nodes to be partitioned into layers by type
    "elk.partitioning.activate": "true",
  };

  const graph: ElkNode = {
    id: "elkgraph",
    children: nodes.map((node) => {
      return {
        id: node.id,
        width: nodeWidthPx,
        height: nodeHeightPx,
        layoutOptions: {
          // Allow nodes to be partitioned into layers by type.
          // This can get awkward if there are multiple problems with their own sets of criteria,
          // solutions, components, effects; we might be able to improve that situation by modeling
          // each problem within a nested node. Or maybe we could just do partitioning within
          // a special "problem context view" rather than in the main topic diagram view.
          "elk.partitioning.partition": partitionOrders[node.type],
        },
      };
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
