import ELK, { ElkEdgeSection, ElkLabel, ElkNode, LayoutOptions } from "elkjs";

import { throwError } from "@/common/errorHandling";
import { NodeType, nodeTypes } from "@/common/node";
import { scalePxViaDefaultFontSize } from "@/pages/_document.page";
import { nodeHeightPx, nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { Diagram } from "@/web/topic/utils/diagram";
import { type Edge, type Node } from "@/web/topic/utils/graph";
import { edges as nodeEdges } from "@/web/topic/utils/node";

export type Orientation = "DOWN" | "UP" | "RIGHT" | "LEFT";
export const orientation: Orientation = "DOWN" as Orientation; // not constant to allow potential other orientations in the future, and keeping code that currently exists for handling "LEFT" orientation

/**
 * Using the highest-width of the common labels ("subproblem of"; excludes "contingency for" because
 * that's rarely used).
 *
 * Could use the average-width to try and balance using too much space vs using too little space,
 * but it doesn't seem like a big deal to use too much space, whereas labels still overlapping
 * basically forfeits a lot of the value of trying to avoid overlap.
 */
export const labelWidthPx = 115;

const priorities = Object.fromEntries(nodeTypes.map((type, index) => [type, index.toString()])) as {
  [type in NodeType]: string;
};

const elk = new ELK();

// sort nodes by type
const compareNodes = (node1: Node, node2: Node) => {
  return Number(priorities[node1.type]) - Number(priorities[node2.type]);
};

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
  problem: "0",
  cause: "0",
  criterion: "1",
  effect: "calculated",
  benefit: "calculated",
  detriment: "calculated",
  solutionComponent: "2",
  solution: "3",
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

const textAreaWidthPx = 164;
const textAreaPerRowPx = 16;
const heightPxOfOneRowDiv = textAreaPerRowPx + 1; // not sure why but a one-row text area seems to have an extra pixel
const maxRows = 3;
const maxTextAreaHeightPx = heightPxOfOneRowDiv + textAreaPerRowPx * (maxRows - 1);

/* eslint-disable functional/immutable-data */
// Create a hidden div to calculate the height of a node based on its text.
// Reusing this div instead of re-creating for each calculation reduces the average
// calculation time per node from ~0.125ms to ~0.05ms.
// Note: using a `div` improved performance over using a `textarea` from ~0.125ms to ~0.05ms
// (yes a similar additional gain to the gain of reusing the div).
const div = document.createElement("div");
div.style.width = `${textAreaWidthPx}px`;
div.style.fontSize = "16px";
div.style.lineHeight = "1";
div.style.fontFamily = "inherit";
div.style.overflow = "hidden";
div.style.visibility = "hidden"; // don't show in DOM but still be added to it so height calcs work
// Don't affect layout (visibility: hidden otherwise still affects layout).
// Cannot for the life of me figure out why `absolute` still affects layout when tutorial is opened,
// yet `fixed` doesn't - Mozilla docs suggest the only difference is that `absolute` can be
// positioned relative to a positioned ancestor, but here there are no positioned ancestors.
div.style.position = "fixed";
div.tabIndex = -1;
div.ariaHidden = "true";
document.body.appendChild(div);
/* eslint-enable functional/immutable-data */

/**
 * Create a hidden div to calculate the height of a node based on its text.
 */
const calculateNodeHeight = (label: string) => {
  // eslint-disable-next-line functional/immutable-data
  div.textContent = label;

  const additionalHeightPx = Math.min(div.scrollHeight, maxTextAreaHeightPx) - heightPxOfOneRowDiv;

  return nodeHeightPx + scalePxViaDefaultFontSize(additionalHeightPx);
};

interface LayoutedNode {
  id: string;
  x: number;
  y: number;
}

export interface LayoutedEdge {
  id: string;
  /**
   * Will be undefined when edge labels are excluded from the layout calculation
   */
  elkLabel?: ElkLabel;
  elkSections: ElkEdgeSection[];
}

export interface LayoutedGraph {
  layoutedNodes: LayoutedNode[];
  layoutedEdges: LayoutedEdge[];
}

const parseElkjsOutput = (layoutedGraph: ElkNode): LayoutedGraph => {
  const { children, edges } = layoutedGraph;
  if (!children || !edges) {
    return throwError("layouted graph missing children or edges", layoutedGraph);
  }

  const layoutedNodes = children.map((node) => {
    const { x, y } = node;
    if (x === undefined || y === undefined) {
      return throwError("node missing x or y in layout", node);
    }
    return { id: node.id, x, y };
  });

  const layoutedEdges = edges.map((edge) => {
    const elkLabel = edge.labels?.[0]; // allowed to be missing if we're excluding labels from the layout calc
    const elkSections = edge.sections;
    if (!elkSections) {
      return throwError("edge missing sections in layout", edge);
    }
    return { id: edge.id, elkLabel, elkSections };
  });

  return { layoutedNodes, layoutedEdges };
};

export const layout = async (
  diagram: Diagram,
  partition: boolean,
  layerNodeIslandsTogether: boolean,
  minimizeEdgeCrossings: boolean,
  avoidEdgeLabelOverlap: boolean,
  thoroughness: number,
): Promise<LayoutedGraph> => {
  const { nodes, edges } = diagram;

  // see support layout options at https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
  const layoutOptions: LayoutOptions = {
    algorithm: "layered",
    "elk.direction": orientation,
    // results in edges curving more around other things
    "elk.edgeRouting": "SPLINES",
    "elk.spacing.edgeEdge": "0",
    // other placement strategies seem to either spread nodes out too much, or ignore edges between layers
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    // allows grouping nodes by type (within a layer) when nodes are sorted by type
    // tried using `position` to do this but it doesn't group nodes near their source node
    "elk.layered.considerModelOrder.strategy": "PREFER_EDGES",
    // These spacings are just what roughly seem to look good.
    // Note: Edge labels are given layers like nodes, so we need to halve the spacing between layers
    // when including labels in the layout, in order to keep the same distance between nodes.
    "elk.layered.spacing.nodeNodeBetweenLayers":
      orientation === "DOWN"
        ? scalePxViaDefaultFontSize(avoidEdgeLabelOverlap ? 65 : 130).toString()
        : scalePxViaDefaultFontSize(avoidEdgeLabelOverlap ? 55 : 110).toString(),
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
    // Elk defaults to minimizing, but sometimes this makes nodes in the same layer be spread out a lot;
    // turning this off prioritizes nodes in the same layer being close together at the cost of more edge crossings.
    "crossingMinimization.strategy": minimizeEdgeCrossings ? "LAYER_SWEEP" : "NONE",
    // Edges should all connect to a node at the same point, rather than different points
    // this is particularly needed when drawing edge paths based on this layout algorithm's output.
    mergeEdges: "true",
  };

  const graph: ElkNode = {
    id: "elkgraph",
    children: [...nodes]
      .toSorted((node1, node2) => compareNodes(node1, node2))
      .map((node) => {
        return {
          id: node.id,
          width: nodeWidthPx,
          height: calculateNodeHeight(node.data.label),
          layoutOptions: {
            // Some nodes can be taller than others (based on how long their text is),
            // so align them all along the center.
            "elk.alignment": "CENTER",
            // Allow nodes to be partitioned into layers by type.
            // This can get awkward if there are multiple problems with their own sets of criteria,
            // solutions, components, effects; we might be able to improve that situation by modeling
            // each problem within a nested node. Or maybe we could just do partitioning within
            // a special "problem context view" rather than in the main topic diagram view.
            "elk.partitioning.partition": calculatePartition(node, edges),
          },
        };
      }),
    edges: edges
      .toSorted((edge1, edge2) => compareEdges(edge1, edge2, nodes))
      .map((edge) => {
        return {
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
          labels: avoidEdgeLabelOverlap
            ? [
                {
                  text: edge.label,
                  layoutOptions: {
                    "edgeLabels.inline": "true",
                  },
                  width: scalePxViaDefaultFontSize(labelWidthPx),
                  // Give labels 0 height so they don't create more space between node layers;
                  // layout still avoids overlap with labels based on their widths when they have 0 height.
                  height: 0,
                },
              ]
            : undefined,
        };
      }),
  };

  // hack to try laying out without partition if partitions cause error
  // see https://github.com/eclipse/elk/issues/969
  try {
    const layoutedGraph = await elk.layout(graph, {
      layoutOptions,
      // log-related options throw error with SPLINES edge routing somehow; see https://github.com/kieler/elkjs/issues/309
      // logging: true,
      // measureExecutionTime: true,
    });

    const parsedGraph = parseElkjsOutput(layoutedGraph);
    return parsedGraph;
  } catch (error) {
    const layoutedGraph = await elk.layout(graph, {
      layoutOptions: { ...layoutOptions, "elk.partitioning.activate": "false" },
      // log-related options throw error with SPLINES edge routing somehow; see https://github.com/kieler/elkjs/issues/309
      // logging: true,
      // measureExecutionTime: true,
    });

    const parsedGraph = parseElkjsOutput(layoutedGraph);
    return parsedGraph;
  }
};
