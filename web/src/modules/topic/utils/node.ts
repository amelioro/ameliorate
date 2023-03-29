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

import { Diagram, Node } from "./diagram";
import { componentTypes } from "./edge";

export const indicatorLength = 20; // px

export type MuiIcon = typeof Extension;

export interface NodeDecoration {
  title: string;
  NodeIcon: MuiIcon;
}

export type NodeType =
  | "problem"
  | "solution"
  | "solutionComponent"
  | "criterion"
  | "effect"
  | "rootClaim"
  | "support"
  | "critique";

export const hideableNodeTypes: NodeType[] = ["criterion", "effect", "solutionComponent"];

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  problem: {
    title: "Problem",
    NodeIcon: Extension,
  },
  solution: {
    title: "Solution",
    NodeIcon: Check,
  },
  solutionComponent: {
    title: "Component",
    NodeIcon: Widgets,
  },
  criterion: {
    title: "Criterion",
    NodeIcon: Ballot,
  },
  effect: {
    title: "Effect",
    NodeIcon: Bolt,
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
export const parents = (node: Node, diagram: Diagram) => {
  const parentEdges = diagram.edges.filter((edge) => edge.target === node.id);

  return parentEdges.map((edge) => {
    const node = diagram.nodes.find((node) => edge.source === node.id);
    if (!node) throw new Error(`node ${edge.source} not found`);

    return node;
  });
};

export const children = (node: Node, diagram: Diagram) => {
  const childEdges = diagram.edges.filter((edge) => edge.source === node.id);
  return childEdges.map((edge) => {
    const node = diagram.nodes.find((node) => edge.target === node.id);
    if (!node) throw new Error(`node ${edge.target} not found`);

    return node;
  });
};

export const components = (node: Node, diagram: Diagram) => {
  return parents(node, diagram).filter((parent) => componentTypes.includes(parent.type));
};

export const edges = (node: Node, diagram: Diagram) => {
  return diagram.edges.filter((edge) => edge.source === node.id || edge.target === node.id);
};
