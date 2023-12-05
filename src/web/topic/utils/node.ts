import {
  Article,
  Ballot,
  Bolt,
  Check,
  Extension,
  ThumbDown,
  ThumbUp,
  Widgets,
} from "@mui/icons-material";

import { errorWithData } from "../../../common/errorHandling";
import { NodeType } from "../../../common/node";
import { componentTypes } from "./edge";
import { Edge, Graph, Node } from "./graph";

export const indicatorLengthRem = 1.25; // rem

export type MuiIcon = typeof Extension;

export interface NodeDecoration {
  title: string;
  NodeIcon: MuiIcon;
}

// this is expected to differ from the backend at some point, i.e. if we visualize solutionComponents as nested within solutions
// this is somewhat premature optimization, but already spent time designing this way so it's probably worth leaving these as distinct
export type FlowNodeType = NodeType;

export const hideableNodeTypes: FlowNodeType[] = ["criterion", "effect", "solutionComponent"];

export const nodeDecorations: Record<FlowNodeType, NodeDecoration> = {
  problem: {
    title: "Problem",
    NodeIcon: Extension,
  },
  criterion: {
    title: "Criterion",
    NodeIcon: Ballot,
  },
  effect: {
    title: "Effect",
    NodeIcon: Bolt,
  },
  solutionComponent: {
    title: "Component",
    NodeIcon: Widgets,
  },
  solution: {
    title: "Solution",
    NodeIcon: Check,
  },
  rootClaim: {
    title: "Root Claim",
    NodeIcon: Article,
  },
  support: {
    title: "Support",
    NodeIcon: ThumbUp,
  },
  critique: {
    title: "Critique",
    NodeIcon: ThumbDown,
  },
};

// TODO: memoize? this could traverse a lot of nodes & edges, seems not performant
export const parents = (node: Node, topicGraph: Graph) => {
  const parentEdges = topicGraph.edges.filter((edge) => edge.target === node.id);

  return parentEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.source === node.id);
    if (!node) throw errorWithData(`node ${edge.source} not found`, topicGraph);

    return node;
  });
};

export const children = (node: Node, topicGraph: Graph) => {
  const childEdges = topicGraph.edges.filter((edge) => edge.source === node.id);
  return childEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.target === node.id);
    if (!node) throw errorWithData(`node ${edge.target} not found`, topicGraph);

    return node;
  });
};

export const neighbors = (node: Node, topicGraph: Graph) => {
  return [...parents(node, topicGraph), ...children(node, topicGraph)];
};

export const components = (node: Node, topicGraph: Graph) => {
  return parents(node, topicGraph).filter((parent) => componentTypes.includes(parent.type));
};

export const edges = (node: Node, edges: Edge[]) => {
  return edges.filter((edge) => edge.source === node.id || edge.target === node.id);
};
