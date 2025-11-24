import { errorWithData } from "@/common/errorHandling";
import { NodeType, areSameCategoryNodes } from "@/common/node";
import { componentTypes } from "@/web/topic/utils/edge";
import { Edge, Graph, Node } from "@/web/topic/utils/graph";

// this is expected to differ from the backend at some point, i.e. if we visualize solutionComponents as nested within solutions
// this is somewhat premature optimization, but already spent time designing this way so it's probably worth leaving these as distinct
export type FlowNodeType = NodeType;

export const hideableNodeTypes: FlowNodeType[] = ["criterion", "effect", "solutionComponent"];

// TODO: memoize? this could traverse a lot of nodes & edges, seems not performant
export const sourceNodes = (node: Node, topicGraph: Graph, sameCategoryNodes = true) => {
  const sourceEdges = topicGraph.edges.filter((edge) => edge.target === node.id);

  const sources = sourceEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.source === node.id);
    if (!node) throw errorWithData(`node ${edge.source} not found`, topicGraph);

    return node;
  });

  if (sameCategoryNodes) {
    return sources.filter((sourceNode) => areSameCategoryNodes(node.type, sourceNode.type));
  } else return sources;
};

// all children references prefer to look for same-category nodes
export const targetNodes = (node: Node, topicGraph: Graph, sameCategoryNodes = true) => {
  const targetEdges = topicGraph.edges.filter((edge) => edge.source === node.id);
  const targets = targetEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.target === node.id);
    if (!node) throw errorWithData(`node ${edge.target} not found`, topicGraph);

    return node;
  });

  if (sameCategoryNodes) {
    return targets.filter((targetNode) => areSameCategoryNodes(node.type, targetNode.type));
  } else return targets;
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
    ...sourceNodes(node, topicGraph, sameCategoryNodes),
    ...targetNodes(node, topicGraph, sameCategoryNodes),
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
  return targetNodes(node, topicGraph).filter((target) => componentTypes.includes(target.type));
};

export const edges = (node: Node, edges: Edge[]) => {
  return edges.filter((edge) => edge.source === node.id || edge.target === node.id);
};
