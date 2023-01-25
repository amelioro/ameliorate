import { Article, Ballot, Check, Extension, ThumbDown, ThumbUp } from "@mui/icons-material";

import { DiagramState, Node } from "./diagram";

export const maxCharsPerLine = 19; // measured by typing "a"'s in a node textbox

export interface NodeDecoration {
  NodeIcon: typeof Extension;
}

export type NodeType = "problem" | "solution" | "criterion" | "rootClaim" | "support" | "critique";

export const nodeDecorations: Record<NodeType, NodeDecoration> = {
  problem: {
    NodeIcon: Extension,
  },
  solution: {
    NodeIcon: Check,
  },
  criterion: {
    NodeIcon: Ballot,
  },
  rootClaim: {
    NodeIcon: Article,
  },
  support: {
    NodeIcon: ThumbUp,
  },
  critique: {
    NodeIcon: ThumbDown,
  },
};

// TODO: memoize? this could traverse a lot of nodes & edges, seems not performant
export const parents = (node: Node, diagram: DiagramState) => {
  const parentEdges = diagram.edges.filter((edge) => edge.target === node.id);

  return parentEdges.map((edge) => {
    const node = diagram.nodes.find((node) => edge.source === node.id);
    if (!node) throw new Error(`node ${edge.source} not found`);

    return node;
  });
};

export const children = (node: Node, diagram: DiagramState) => {
  const childEdges = diagram.edges.filter((edge) => edge.source === node.id);
  return childEdges.map((edge) => {
    const node = diagram.nodes.find((node) => edge.target === node.id);
    if (!node) throw new Error(`node ${edge.target} not found`);

    return node;
  });
};

// errors if node does not have only one parent
export const onlyParent = (node: Node, diagram: DiagramState) => {
  const allParents = parents(node, diagram);

  if (allParents.length !== 1) {
    throw new Error(`has ${allParents.length} parents, expected one`);
  }

  return allParents[0];
};
