import ELK, { ElkNode, LayoutOptions } from "elkjs";

import { NodeType, nodeTypes } from "../../../common/node";
import { nodeHeightPx, nodeWidthPx } from "../components/Node/EditableNode.styles";
import { type Edge, type Node } from "./graph";
import { children, parents } from "./node";

export type Orientation = "DOWN" | "UP" | "RIGHT" | "LEFT";

const priorities = Object.fromEntries(nodeTypes.map((type, index) => [type, index.toString()])) as {
  [type in NodeType]: string;
};

const elk = new ELK();

// sort by source priority, then target priority
const compareEdges = (edge1: Edge, edge2: Edge, nodes: Node[]) => {
  const source1 = nodes.find((node) => node.id === edge1.source);
  const source2 = nodes.find((node) => node.id === edge2.source);
  const target1 = nodes.find((node) => node.id === edge1.target);
  const target2 = nodes.find((node) => node.id === edge2.target);

  if (!source1 || !source2 || !target1 || !target2)
    throw new Error("Edge source or target not found");

  const sourceCompare = Number(priorities[source1.type]) - Number(priorities[source2.type]);
  if (sourceCompare !== 0) return sourceCompare;

  return Number(priorities[target1.type]) - Number(priorities[target2.type]);
};

/**
 * "null" means no partition; the node will be placed in any layer that makes sense based on edges.
 * "[number]" means the node will be placed in a layer higher than nodes with lower [number], and lower than nodes with higher [number].
 * "calculated" is a string that will error if it remains; it should be replaced before layout.
 */
const partitionOrders: { [type in NodeType]: string } = {
  // topic
  problem: "null",
  cause: "null",
  criterion: "1",
  effect: "calculated",
  benefit: "calculated",
  detriment: "calculated",
  solutionComponent: "3",
  solution: "4",

  // explore
  question: "null",
  answer: "null",
  fact: "5",
  source: "6", // generally nice to have sources along the bottom, below facts

  // claim
  rootClaim: "null",
  support: "null",
  critique: "null",

  // generic
  custom: "null",
};

const calculatePartition = (node: Node, nodes: Node[], edges: Edge[]) => {
  const topicGraph = { nodes, edges };

  if (["effect", "benefit", "detriment"].includes(node.type)) {
    const hasProblemSource = parents(node, topicGraph).some((parent) => parent.type === "problem");
    const hasSolutionTarget = children(node, topicGraph).some((child) => child.type === "solution");
    if (hasProblemSource && hasSolutionTarget) return "null";
    else if (hasProblemSource) return "0";
    else return "2";
  } else {
    return partitionOrders[node.type];
  }
};

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export const layout = async (
  nodes: Node[],
  edges: Edge[],
  orientation: Orientation,
  partition: boolean
): Promise<NodePosition[]> => {
  // see support layout options at https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
  const layoutOptions: LayoutOptions = {
    algorithm: "layered",
    "elk.direction": orientation,
    // results in a more centered layout - seems to moreso ignore edges when laying out
    "elk.edgeRouting": "POLYLINE",
    "elk.spacing.edgeEdge": "0",
    // other placement strategies seem to either spread nodes out too much, or ignore edges between layers
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    // allows grouping nodes by type (within a layer) when edges are sorted by type
    // tried using `position` to do this but it doesn't group nodes near their source node
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    // these spacings are just what roughly seem to look good
    "elk.layered.spacing.nodeNodeBetweenLayers": orientation === "DOWN" ? "130" : "220",
    "elk.spacing.nodeNode": orientation === "DOWN" ? "20" : "50",
    // allow nodes to be partitioned into layers by type
    "elk.partitioning.activate": partition ? "true" : "false",
    // ensure node islands don't overlap (needed for when node has 3 rows of text)
    "elk.spacing.componentComponent": "30", // default is 20
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
          "elk.partitioning.partition": calculatePartition(node, nodes, edges),
        },
      };
    }),
    edges: [...edges]
      // This order results in grouping nodes by type under their source node.
      // This is a requirement for the claim tree but less so for the topic diagram - if performance
      // in the diagram is a concern, this can probably just be done in the tree (and maybe `position`
      // would be more suited for the diagram, see https://github.com/kieler/elkjs/issues/21#issuecomment-382574679).
      .sort((edge1, edge2) => compareEdges(edge1, edge2, nodes))
      .map((edge) => {
        return { id: edge.id, sources: [edge.source], targets: [edge.target] };
      }),
  };

  // hack to try laying out without partition if partitions cause error
  // see https://github.com/eclipse/elk/issues/969
  try {
    const layoutedGraph = await elk.layout(graph, {
      layoutOptions,
      logging: true,
      measureExecutionTime: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return layoutedGraph.children!.map((node) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return { id: node.id, x: node.x!, y: node.y! };
    });
  } catch (error) {
    const layoutedGraph = await elk.layout(graph, {
      layoutOptions: { ...layoutOptions, "elk.partitioning.activate": "false" },
      logging: true,
      measureExecutionTime: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return layoutedGraph.children!.map((node) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return { id: node.id, x: node.x!, y: node.y! };
    });
  }
};
