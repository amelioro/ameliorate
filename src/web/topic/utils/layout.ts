import ELK, { ElkNode, LayoutOptions } from "elkjs";

import { NodeType, nodeTypes } from "@/common/node";
import { scalePxViaDefaultFontSize } from "@/pages/_document.page";
import { nodeHeightPx, nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { Diagram } from "@/web/topic/utils/diagram";
import { type Edge, type Node } from "@/web/topic/utils/graph";
import { edges as nodeEdges } from "@/web/topic/utils/node";

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
  problem: "0",
  cause: "0",
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
  // was partitioning facts/sources along bottom, but that's not desirable if breakdown nodes are primary,
  // so partitioning was removed. can conditionally partition if that seems worthwhile.
  fact: "null",
  source: "null",

  // justification
  rootClaim: "null",
  support: "null",
  critique: "null",

  // generic
  custom: "null",
};

const calculatePartition = (node: Node, edges: Edge[]) => {
  if (["effect", "benefit", "detriment"].includes(node.type)) {
    const edgesOfNode = nodeEdges(node, edges);
    const hasParentCreatedBy = edgesOfNode.some(
      (edge) => edge.label === "createdBy" && edge.target === node.id,
    );
    const hasChildCreates = edgesOfNode.some(
      (edge) => edge.label === "creates" && edge.source === node.id,
    );

    const shouldBeAboveCriteria = hasParentCreatedBy; // effect createdBy problem
    const shouldBeBelowCriteria = hasChildCreates; // solution creates effect

    if (shouldBeAboveCriteria && shouldBeBelowCriteria) return "null";
    else if (shouldBeAboveCriteria) return "0";
    else if (shouldBeBelowCriteria) return "2";
    else return "null";
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
  layerNodeIslandsTogether: boolean,
  minimizeEdgeCrossings: boolean,
  thoroughness: number,
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
    "elk.layered.spacing.nodeNodeBetweenLayers":
      orientation === "DOWN"
        ? scalePxViaDefaultFontSize(130).toString()
        : scalePxViaDefaultFontSize(220).toString(),
    "elk.spacing.nodeNode":
      orientation === "DOWN"
        ? scalePxViaDefaultFontSize(20).toString()
        : scalePxViaDefaultFontSize(50).toString(),
    // allow nodes to be partitioned into layers by type
    "elk.partitioning.activate": partition ? "true" : "false",
    // ensure node islands don't overlap (needed for when node has 3 rows of text)
    // also keep node islands ("components") significantly spaced out, so they can be easily seen as separate
    "elk.spacing.componentComponent": scalePxViaDefaultFontSize(150).toString(), // default is 20
    // e.g. if no problem ties solutions together, still put those solutions into the same partition (if partitions are on)
    // want this off for cases when islands are truly unrelated, but on for when we're just hiding edges
    "elk.separateConnectedComponents": layerNodeIslandsTogether ? "false" : "true",
    // prioritize shorter edges e.g. if a problem has multiple direct causes, prioritize putting
    // them in the same layer over using space efficiently
    "elk.layered.priority.shortness": "10",
    // Try fewer random layouts to see if better layout exists.
    // No idea why this seems to preserve node order (and therefore group node types) better;
    // perhaps higher thoroughness means it'll find a layout that better uses space,
    // caring less about node order.
    "elk.layered.thoroughness": thoroughness.toString(),
    // elk defaults to minimizing, but sometimes this makes nodes in the same layer be spread out a lot;
    // turning this off prioritizes nodes in the same layer being close together at the cost of more edge crossings.
    "crossingMinimization.strategy": minimizeEdgeCrossings ? "LAYER_SWEEP" : "NONE",
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
            "elk.partitioning.partition": calculatePartition(node, edges),
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
