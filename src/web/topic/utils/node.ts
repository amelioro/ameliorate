import { componentTypes } from "@/common/component";
import { type MinimalEdge } from "@/common/edge";
import { errorWithData } from "@/common/errorHandling";
import { type MinimalNode, type NodeType, areSameCategoryNodes } from "@/common/node";

export const hideableNodeTypes: NodeType[] = ["criterion", "effect", "solutionComponent"];

// TODO: memoize? this could traverse a lot of nodes & edges, seems not performant
export const sourceNodes = <TNode extends MinimalNode>(
  node: MinimalNode,
  topicGraph: { nodes: TNode[]; edges: MinimalEdge[] },
  sameCategoryNodes = true,
) => {
  const sourceEdges = topicGraph.edges.filter((edge) => edge.targetId === node.id);

  const sources = sourceEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.sourceId === node.id);
    if (!node) throw errorWithData(`node ${edge.sourceId} not found`, topicGraph);

    return node;
  });

  if (sameCategoryNodes) {
    return sources.filter((sourceNode) => areSameCategoryNodes(node.type, sourceNode.type));
  } else return sources;
};

// all children references prefer to look for same-category nodes
export const targetNodes = <TNode extends MinimalNode>(
  node: MinimalNode,
  topicGraph: { nodes: TNode[]; edges: MinimalEdge[] },
  sameCategoryNodes = true,
) => {
  const targetEdges = topicGraph.edges.filter((edge) => edge.sourceId === node.id);
  const targets = targetEdges.map((edge) => {
    const node = topicGraph.nodes.find((node) => edge.targetId === node.id);
    if (!node) throw errorWithData(`node ${edge.targetId} not found`, topicGraph);

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
export const neighbors = <TNode extends MinimalNode>(
  node: TNode,
  topicGraph: { nodes: TNode[]; edges: MinimalEdge[] },
  layersDeep = 1,
  sameCategoryNodes = true,
  foundNodeIds: string[] = [],
): TNode[] => {
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

export const components = <TNode extends MinimalNode>(
  node: MinimalNode,
  topicGraph: { nodes: TNode[]; edges: MinimalEdge[] },
) => {
  return targetNodes(node, topicGraph).filter((target) => componentTypes.includes(target.type));
};

export const edges = (node: MinimalNode, edges: MinimalEdge[]) => {
  return edges.filter((edge) => edge.sourceId === node.id || edge.targetId === node.id);
};
