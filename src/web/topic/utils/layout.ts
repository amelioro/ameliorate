import ELK, { ElkEdgeSection, ElkExtendedEdge, ElkLabel, ElkNode, LayoutOptions } from "elkjs";
import { Position } from "reactflow";

import { throwError } from "@/common/errorHandling";
import { NodeType, compareNodesByType, isEffect } from "@/common/node";
import { scalePxViaDefaultFontSize } from "@/pages/_document.page";
import { nodeHeightPx, nodeWidthPx } from "@/web/topic/components/Node/EditableNode.styles";
import { Diagram } from "@/web/topic/utils/diagram";
import { getEffectType } from "@/web/topic/utils/effect";
import { type Edge, type Node } from "@/web/topic/utils/graph";

export type Orientation = "DOWN" | "UP" | "RIGHT" | "LEFT";
export const orientation: Orientation = "UP" as Orientation; // not constant to allow potential other orientations in the future, and keeping code that currently exists for handling "LEFT" orientation

type OrientationDirection = "forward" | "backward" | "clockwise" | "counterClockwise";
export const positions: Record<OrientationDirection, Record<Orientation, Position>> = {
  forward: {
    DOWN: Position.Bottom,
    UP: Position.Top,
    RIGHT: Position.Right,
    LEFT: Position.Left,
  },
  backward: {
    DOWN: Position.Top,
    UP: Position.Bottom,
    RIGHT: Position.Left,
    LEFT: Position.Right,
  },
  clockwise: {
    DOWN: Position.Left,
    UP: Position.Right,
    RIGHT: Position.Bottom,
    LEFT: Position.Top,
  },
  counterClockwise: {
    DOWN: Position.Right,
    UP: Position.Left,
    RIGHT: Position.Top,
    LEFT: Position.Bottom,
  },
};

export const opposite: Record<Position, Position> = {
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top,
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
};

/**
 * Using the highest-width of the common labels ("subproblem of"; excludes "contingency for" because
 * that's rarely used).
 *
 * Could use the average-width to try and balance using too much space vs using too little space,
 * but it doesn't seem like a big deal to use too much space, whereas labels still overlapping
 * basically forfeits a lot of the value of trying to avoid overlap.
 */
export const labelWidthPx = 115;

const elk = new ELK();

// sort by target priority, then source priority
const compareEdges = (edge1: Edge, edge2: Edge, nodes: Node[]) => {
  const source1 = nodes.find((node) => node.id === edge1.source);
  const source2 = nodes.find((node) => node.id === edge2.source);
  const target1 = nodes.find((node) => node.id === edge1.target);
  const target2 = nodes.find((node) => node.id === edge2.target);

  if (!source1 || !source2 || !target1 || !target2)
    throw new Error("Edge source or target not found");

  const targetCompare = compareNodesByType(target1, target2);
  if (targetCompare !== 0) return targetCompare;

  return compareNodesByType(source1, source2);
};

/**
 * "null" means no partition; the node will be placed in any layer that makes sense based on edges.
 * For "UP" orientation, a lower partitioned node will be placed in a layer lower than nodes of a higher partition.
 * "calculated" is a string that will error if it remains; it should be replaced before layout.
 */
const partitionOrders: { [type in NodeType]: string } = {
  // topic
  problem: "3",
  cause: "3",
  criterion: "2",
  effect: "calculated",
  benefit: "calculated",
  detriment: "calculated",
  solutionComponent: "1",
  solution: "0",
  obstacle: "null",
  mitigationComponent: "null",
  mitigation: "null",

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

const calculatePartition = (node: Node, diagram: Diagram) => {
  // TODO?: if we want to support flipping orientation (to "DOWN"), we could take the resulting value from this method and flip it (e.g. 100 - X)
  if (isEffect(node.type)) {
    const effectType = getEffectType(node, diagram);

    if (effectType === "problem") return "3";
    else if (effectType === "solution") return "1";
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

/**
 * See supported layout options at https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
 */
const buildElkLayoutOptions = (
  partition: boolean,
  layerNodeIslandsTogether: boolean,
  minimizeEdgeCrossings: boolean,
  avoidEdgeLabelOverlap: boolean,
  thoroughness: number,
): LayoutOptions => {
  return {
    algorithm: "layered",
    "elk.direction": orientation,
    // results in edges curving more around other things
    "elk.edgeRouting": "SPLINES",
    "elk.spacing.edgeEdge": "0",
    // other placement strategies seem to either spread nodes out too much, or ignore edges between layers
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    // allows grouping nodes by type (within a layer) when nodes are sorted by type
    // tried using `position` to do this but it doesn't group nodes near their target node
    "elk.layered.considerModelOrder.strategy": "PREFER_EDGES",
    // These spacings are just what roughly seem to look good, avoiding add buttons from overlapping
    // with edge labels.
    // Note: Edge labels are given layers like nodes, so we need to halve the spacing between layers
    // when including labels in the layout, in order to keep the same distance between nodes.
    "elk.layered.spacing.nodeNodeBetweenLayers":
      orientation === "UP"
        ? scalePxViaDefaultFontSize(avoidEdgeLabelOverlap ? 75 : 150).toString()
        : scalePxViaDefaultFontSize(avoidEdgeLabelOverlap ? 55 : 110).toString(),
    "elk.spacing.nodeNode":
      orientation === "UP"
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
};

const buildElkEdges = (
  { edges, nodes }: Diagram,
  avoidEdgeLabelOverlap: boolean,
): ElkExtendedEdge[] => {
  return edges
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
    });
};

const buildElkNodes = (diagram: Diagram): ElkNode[] => {
  return diagram.nodes
    .toSorted((node1, node2) => compareNodesByType(node1, node2))
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
          "elk.partitioning.partition": calculatePartition(node, diagram),
        },
      };
    });
};

export const layout = async (
  diagram: Diagram,
  partition: boolean,
  layerNodeIslandsTogether: boolean,
  minimizeEdgeCrossings: boolean,
  avoidEdgeLabelOverlap: boolean,
  thoroughness: number,
): Promise<LayoutedGraph> => {
  const layoutOptions = buildElkLayoutOptions(
    partition,
    layerNodeIslandsTogether,
    minimizeEdgeCrossings,
    avoidEdgeLabelOverlap,
    thoroughness,
  );

  const elkEdges = buildElkEdges(diagram, avoidEdgeLabelOverlap);
  const elkNodes = buildElkNodes(diagram);

  const graph: ElkNode = {
    id: "elkgraph",
    children: elkNodes,
    edges: elkEdges,
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
