import { errorWithData } from "@/common/errorHandling";
import { areSameCategoryNodes } from "@/common/node";
import { Graph, Node } from "@/web/topic/utils/graph";

export type RelativePlacement = "above" | "below";

// related: to lay detriments above vs below their solution? https://github.com/amelioro/ameliorate/discussions/579.
export const neighborsAbove = (node: Node, topicGraph: Graph, sameCategoryNodes = true) => {
  const edgesPointingFromNode = topicGraph.edges.filter((edge) => edge.source === node.id);

  const nodesAbove = edgesPointingFromNode.map((edge) => {
    const targetNode = topicGraph.nodes.find((nodes) => nodes.id === edge.target);
    if (!targetNode) throw errorWithData(`node ${edge.target} not found`, topicGraph);

    return targetNode;
  });

  if (sameCategoryNodes) {
    return nodesAbove.filter((aboveNode) => areSameCategoryNodes(node.type, aboveNode.type));
  } else {
    return nodesAbove;
  }
};

export const neighborsBelow = (node: Node, topicGraph: Graph, sameCategoryNodes = true) => {
  const edgesPointingToNode = topicGraph.edges.filter((edge) => edge.target === node.id);

  const nodesBelow = edgesPointingToNode.map((edge) => {
    const sourceNode = topicGraph.nodes.find((nodes) => nodes.id === edge.source);
    if (!sourceNode) throw errorWithData(`node ${edge.source} not found`, topicGraph);

    return sourceNode;
  });

  if (sameCategoryNodes) {
    return nodesBelow.filter((belowNode) => areSameCategoryNodes(node.type, belowNode.type));
  } else {
    return nodesBelow;
  }
};

export const neighborsInDirection = (
  node: Node,
  topicGraph: Graph,
  direction: RelativePlacement,
  sameCategoryNodes = true,
) => {
  return direction === "above"
    ? neighborsAbove(node, topicGraph, sameCategoryNodes)
    : neighborsBelow(node, topicGraph, sameCategoryNodes);
};
