import ELK, { ElkNode, LayoutOptions } from "elkjs";

import { NodeType, nodeTypes } from "../../../common/node";
import { nodeHeightPx, nodeWidthPx } from "../components/Node/EditableNode.styles";
import { Diagram } from "./diagram";
import { type Edge, type Node, ancestors, descendants } from "./graph";

export type Orientation = "DOWN" | "UP" | "RIGHT" | "LEFT";
export const orientation: Orientation = "DOWN" as Orientation; // not constant to allow potential other orientations in the future, and keeping code that currently exists for handling "LEFT" orientation

const priorities = Object.fromEntries(nodeTypes.map((type, index) => [type, index.toString()])) as {
  [type in NodeType]: string;
};

const elk = new ELK();

// sort nodes by type
const compareNodes = (node1: Node, node2: Node) => {
  return Number(priorities[node1.type]) - Number(priorities[node2.type]);
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
  obstacle: "null",

  // research
  question: "null",
  answer: "null",
  // was partitioning facts/sources along bottom, but that's not desirable if structure nodes are primary,
  // so partitioning was removed. can conditionally partition if that seems worthwhile.
  fact: "null",
  source: "null",

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
    const nodeAncestors = ancestors(node, topicGraph);
    const nodeDescendants = descendants(node, topicGraph);

    const hasProblemAncestor = nodeAncestors.some((ancestor) => ancestor.type === "problem");
    const hasCriterionAncestor = nodeAncestors.some((ancestor) => ancestor.type === "criterion");
    const hasSolutionDescendant = nodeDescendants.some(
      (descendant) => descendant.type === "solution"
    );
    const hasCriterionDescendant = nodeDescendants.some(
      (descendant) => descendant.type === "criterion"
    );

    // this implementation seems solid but if it becomes unperformant, it might be good enough to
    // just check if this node has a "created by" vs "creates" relation
    const shouldBeAboveCriteria = hasProblemAncestor && !hasCriterionAncestor; // problem is _not_ through criterion
    const shouldBeBelowCriteria = hasSolutionDescendant && !hasCriterionDescendant; // solution is _not_ through criterion

    if (shouldBeAboveCriteria && shouldBeBelowCriteria) return "null";
    else if (shouldBeAboveCriteria) return "0";
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

// TODO?: feels a little weird to have layout know Ameliorate domain, like DiagramType
export const layout = async (
  diagram: Diagram,
  partition: boolean,
  thoroughness: number
): Promise<NodePosition[]> => {
  const { nodes, edges } = diagram;

  // see support layout options at https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
  const layoutOptions: LayoutOptions = {
    algorithm: "layered",
    "elk.direction": orientation,
    // results in a more centered layout - seems to moreso ignore edges when laying out
    "elk.edgeRouting": "POLYLINE",
    "elk.spacing.edgeEdge": "0",
    // other placement strategies seem to either spread nodes out too much, or ignore edges between layers
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    // allows grouping nodes by type (within a layer) when nodes are sorted by type
    // tried using `position` to do this but it doesn't group nodes near their source node
    "elk.layered.considerModelOrder.strategy": "PREFER_NODES",
    // these spacings are just what roughly seem to look good
    "elk.layered.spacing.nodeNodeBetweenLayers": orientation === "DOWN" ? "130" : "220",
    "elk.spacing.nodeNode": orientation === "DOWN" ? "20" : "50",
    // allow nodes to be partitioned into layers by type
    "elk.partitioning.activate": partition ? "true" : "false",
    // ensure node islands don't overlap (needed for when node has 3 rows of text)
    "elk.spacing.componentComponent": "30", // default is 20
    // prioritize shorter edges e.g. if a problem has multiple direct causes, prioritize putting
    // them in the same layer over using space efficiently
    "elk.layered.priority.shortness": "10",
    // Try fewer random layouts to see if better layout exists.
    // No idea why this seems to preserve node order (and therefore group node types) better;
    // perhaps higher thoroughness means it'll find a layout that better uses space,
    // caring less about node order.
    "elk.layered.thoroughness": thoroughness.toString(),
  };

  const graph: ElkNode = {
    id: "elkgraph",
    children: [...nodes]
      .sort((node1, node2) => compareNodes(node1, node2))
      .map((node) => {
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
    edges: edges.map((edge) => {
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
