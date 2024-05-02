import { shallow } from "zustand/shallow";

import { errorWithData } from "../../../common/errorHandling";
import { NodeType } from "../../../common/node";
import { useIsAnyGraphPartSelected } from "../../view/navigateStore";
import { RelationDirection, findNodeOrThrow } from "../utils/graph";
import { children, edges, neighbors, parents } from "../utils/node";
import { getDefaultNode } from "./nodeGetters";
import { useTopicStore } from "./store";

export const useNode = (nodeId: string | null) => {
  return useTopicStore((state) => {
    if (!nodeId) return null;

    try {
      return findNodeOrThrow(nodeId, state.nodes);
    } catch {
      return null;
    }
  });
};

export const useAllNodes = (nodeIds?: string[]) => {
  return useTopicStore((state) => {
    if (!nodeIds) return state.nodes;
    return state.nodes.filter((node) => nodeIds.includes(node.id));
  }, shallow);
};

export const useNodeChildren = (nodeId: string | undefined) => {
  return useTopicStore((state) => {
    if (!nodeId) return [];

    try {
      const node = findNodeOrThrow(nodeId, state.nodes);
      const topicGraph = { nodes: state.nodes, edges: state.edges };
      return children(node, topicGraph);
    } catch {
      return [];
    }
  }, shallow);
};

export const useNodeParents = (nodeId: string) => {
  return useTopicStore((state) => {
    try {
      const node = findNodeOrThrow(nodeId, state.nodes);
      const topicGraph = { nodes: state.nodes, edges: state.edges };
      return parents(node, topicGraph);
    } catch {
      return [];
    }
  }, shallow);
};

export const useCriterionSolutionEdges = (problemNodeId: string | undefined) => {
  return useTopicStore((state) => {
    if (!problemNodeId) return [];

    try {
      const problemNode = findNodeOrThrow(problemNodeId, state.nodes);
      if (problemNode.type !== "problem") {
        throw errorWithData("node is not a problem node", problemNode);
      }

      const topicGraph = { nodes: state.nodes, edges: state.edges };
      const nodeChildren = children(problemNode, topicGraph);
      const criteria = nodeChildren.filter((node) => node.type === "criterion");
      const criteriaIds = criteria.map((node) => node.id);
      const solutions = nodeChildren.filter((node) => node.type === "solution");
      const solutionIds = solutions.map((node) => node.id);

      return topicGraph.edges.filter((edge) => {
        return criteriaIds.includes(edge.source) && solutionIds.includes(edge.target);
      });
    } catch {
      return [];
    }
  }, shallow);
};

export const useNeighbors = (nodeId: string, direction: RelationDirection) => {
  return useTopicStore((state) => {
    try {
      const node = findNodeOrThrow(nodeId, state.nodes);
      const topicGraph = { nodes: state.nodes, edges: state.edges };
      return direction === "parent" ? parents(node, topicGraph) : children(node, topicGraph);
    } catch {
      return [];
    }
  }, shallow);
};

export const useIsNeighborSelected = (nodeId: string) => {
  const neighborNodes = useTopicStore((state) => {
    try {
      const node = findNodeOrThrow(nodeId, state.nodes);
      const topicGraph = { nodes: state.nodes, edges: state.edges };
      return neighbors(node, topicGraph);
    } catch {
      return [];
    }
  });

  return useIsAnyGraphPartSelected(neighborNodes.map((node) => node.id));
};

export const useIsEdgeSelected = (nodeId: string) => {
  const neighborEdges = useTopicStore((state) => {
    try {
      const node = findNodeOrThrow(nodeId, state.nodes);
      return edges(node, state.edges);
    } catch {
      return [];
    }
  });

  return useIsAnyGraphPartSelected(neighborEdges.map((edge) => edge.id));
};

/**
 * @param nodeType type of node to fallback to if node with nodeId doesn't exist
 * @param nodeId id of node to return if exists
 */
export const useDefaultNode = (nodeType: NodeType, nodeId?: string) => {
  return useTopicStore((state) => {
    const defaultNode = getDefaultNode(nodeType);
    if (!nodeId) return defaultNode;

    const node = state.nodes.find((node) => node.id === nodeId);
    return node ?? defaultNode;
  }, shallow);
};

export const useNodesOfType = (type: NodeType) => {
  return useTopicStore((state) => state.nodes.filter((node) => node.type === type), shallow);
};

export const useSolutions = (problemId?: string) => {
  return useTopicStore((state) => {
    const solutions = state.nodes.filter((node) => node.type === "solution");
    if (!problemId) return solutions;

    const problemSolutions = solutions.filter((solution) =>
      state.edges.find(
        (edge) =>
          edge.source === problemId && edge.label === "addresses" && edge.target === solution.id
      )
    );

    return problemSolutions;
  }, shallow);
};

export const useCriteria = (problemId?: string) => {
  return useTopicStore((state) => {
    const criteria = state.nodes.filter((node) => node.type === "criterion");
    if (!problemId) return criteria;

    const problemCriteria = criteria.filter((criterion) =>
      state.edges.find(
        (edge) =>
          edge.source === problemId && edge.label === "criterionFor" && edge.target === criterion.id
      )
    );

    return problemCriteria;
  }, shallow);
};
