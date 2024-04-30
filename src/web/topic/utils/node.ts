import {
  Article,
  Ballot,
  Bolt,
  Check,
  Code,
  Edit,
  Extension,
  Fence,
  Flood,
  Info,
  LightbulbRounded,
  LocalFlorist,
  Mediation,
  QuestionMark,
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
  // topic
  problem: {
    title: "Problem",
    NodeIcon: Extension,
  },
  cause: {
    title: "Cause",
    NodeIcon: Mediation,
  },
  criterion: {
    title: "Criterion",
    NodeIcon: Ballot,
  },
  effect: {
    title: "Effect",
    NodeIcon: Bolt,
  },
  benefit: {
    title: "Benefit",
    NodeIcon: LocalFlorist,
  },
  detriment: {
    title: "Detriment",
    NodeIcon: Flood,
  },
  solutionComponent: {
    title: "Component",
    NodeIcon: Widgets,
  },
  solution: {
    title: "Solution",
    NodeIcon: Check,
  },
  obstacle: {
    title: "Obstacle",
    NodeIcon: Fence,
  },

  // research
  question: {
    title: "Question",
    NodeIcon: QuestionMark,
  },
  answer: {
    title: "Answer",
    NodeIcon: LightbulbRounded,
  },
  fact: {
    title: "Fact",
    NodeIcon: Info,
  },
  source: {
    title: "Source",
    NodeIcon: Code,
  },

  // claim
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

  // generic
  custom: {
    title: "Custom",
    NodeIcon: Edit,
  },
};

// TODO: memoize? this could traverse a lot of nodes & edges, seems not performant
export const parents = (nodeId: string, topicGraph: Graph) => {
  const parentEdges = topicGraph.edges.filter((edge) => edge.target === nodeId);

  return parentEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.source === node.id);
    if (!node) throw errorWithData(`node ${edge.source} not found`, topicGraph);

    return node;
  });
};

export const children = (nodeId: string, topicGraph: Graph) => {
  const childEdges = topicGraph.edges.filter((edge) => edge.source === nodeId);
  return childEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.target === node.id);
    if (!node) throw errorWithData(`node ${edge.target} not found`, topicGraph);

    return node;
  });
};

export const neighbors = (nodeId: string, topicGraph: Graph) => {
  return [...parents(nodeId, topicGraph), ...children(nodeId, topicGraph)];
};

export const components = (node: Node, topicGraph: Graph) => {
  return parents(node.id, topicGraph).filter((parent) => componentTypes.includes(parent.type));
};

export const edges = (nodeId: string, edges: Edge[]) => {
  return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
};
