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
  VerifiedUserOutlined,
  Widgets,
} from "@mui/icons-material";

import { errorWithData } from "@/common/errorHandling";
import { NodeType, areSameCategoryNodes } from "@/common/node";
import { componentTypes } from "@/web/topic/utils/edge";
import { Edge, Graph, Node } from "@/web/topic/utils/graph";

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
  benefit: {
    title: "Benefit",
    NodeIcon: LocalFlorist,
  },
  effect: {
    title: "Effect",
    NodeIcon: Bolt,
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
  mitigationComponent: {
    title: "Component",
    NodeIcon: Widgets,
  },
  mitigation: {
    title: "Mitigation",
    NodeIcon: VerifiedUserOutlined,
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

  // justification
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
export const parents = (node: Node, topicGraph: Graph, sameCategoryNodes = true) => {
  const parentEdges = topicGraph.edges.filter((edge) => edge.target === node.id);

  const parentNodes = parentEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.source === node.id);
    if (!node) throw errorWithData(`node ${edge.source} not found`, topicGraph);

    return node;
  });

  if (sameCategoryNodes) {
    return parentNodes.filter((parentNode) => areSameCategoryNodes(node.type, parentNode.type));
  } else return parentNodes;
};

// all children references prefer to look for same-category nodes
export const children = (node: Node, topicGraph: Graph, sameCategoryNodes = true) => {
  const childEdges = topicGraph.edges.filter((edge) => edge.source === node.id);
  const childNodes = childEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.target === node.id);
    if (!node) throw errorWithData(`node ${edge.target} not found`, topicGraph);

    return node;
  });

  if (sameCategoryNodes) {
    return childNodes.filter((childNode) => areSameCategoryNodes(node.type, childNode.type));
  } else return childNodes;
};

/**
 * @param layersDeep how many layers deep to look for neighbors, e.g. 1 is only immediate neighbors, 2 is neighbors and their neighbors, etc.
 * @param sameCategoryNodes whether or not to only return nodes of the same info category; usually this is desirable.
 * @param foundNodeIds nodes to exclude from the search; used to prevent finding the same node multiple times
 */
export const neighbors = (
  node: Node,
  topicGraph: Graph,
  layersDeep = 1,
  sameCategoryNodes = true,
  foundNodeIds: string[] = [],
): Node[] => {
  if (layersDeep < 1) throw errorWithData("layersDeep must be at least 1", layersDeep);

  const immediateNeighbors = [
    ...parents(node, topicGraph, sameCategoryNodes),
    ...children(node, topicGraph, sameCategoryNodes),
  ].filter((immediateNeighbor) => !foundNodeIds.includes(immediateNeighbor.id));

  if (layersDeep === 1) return immediateNeighbors;
  if (immediateNeighbors.length === 0) return [];

  const immediateNeighborIds = immediateNeighbors.map((immediateNeighbor) => immediateNeighbor.id);
  const newFoundNodeIds = foundNodeIds.concat(immediateNeighborIds);

  const furtherNeighbors = immediateNeighbors.flatMap((immediateNeighbor) =>
    neighbors(immediateNeighbor, topicGraph, layersDeep - 1, sameCategoryNodes, newFoundNodeIds),
  );

  return immediateNeighbors.concat(furtherNeighbors);
};

export const components = (node: Node, topicGraph: Graph) => {
  return parents(node, topicGraph).filter((parent) => componentTypes.includes(parent.type));
};

export const edges = (node: Node, edges: Edge[]) => {
  return edges.filter((edge) => edge.source === node.id || edge.target === node.id);
};
