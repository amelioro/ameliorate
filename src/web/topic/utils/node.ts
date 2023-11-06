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
import { Diagram, Node } from "./diagram";
import { componentTypes } from "./edge";

export const indicatorLengthRem = 1.25; // rem

export type MuiIcon = typeof Extension;

export interface NodeDecoration {
  title: string;
  NodeIcon: MuiIcon;
}

// this is expected to differ from the backend at some point, i.e. if we visualize solutionComponents as nested within solutions
// this is somewhat premature optimization, but already spent time designing this way so it's probably worth leaving these as distinct
export type FlowNodeType = NodeType;

export const claimNodeTypes: FlowNodeType[] = ["rootClaim", "support", "critique"];

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
export const parents = (node: Node, diagram: Diagram) => {
  const parentEdges = diagram.edges.filter((edge) => edge.target === node.id);

  return parentEdges.map((edge) => {
    const node = diagram.nodes.find((node) => edge.source === node.id);
    if (!node) throw errorWithData(`node ${edge.source} not found`, diagram);

    return node;
  });
};

export const children = (node: Node, diagram: Diagram) => {
  const childEdges = diagram.edges.filter((edge) => edge.source === node.id);
  return childEdges.map((edge) => {
    const node = diagram.nodes.find((node) => edge.target === node.id);
    if (!node) throw errorWithData(`node ${edge.target} not found`, diagram);

    return node;
  });
};

export const neighbors = (node: Node, diagram: Diagram) => {
  return [...parents(node, diagram), ...children(node, diagram)];
};

export const components = (node: Node, diagram: Diagram) => {
  return parents(node, diagram).filter((parent) => componentTypes.includes(parent.type));
};

export const edges = (node: Node, diagram: Diagram) => {
  return diagram.edges.filter((edge) => edge.source === node.id || edge.target === node.id);
};
