import { shallow } from "zustand/shallow";

import { errorWithData } from "@/common/errorHandling";
import { NodeType, isDefaultCoreNodeType } from "@/common/node";
import { getDefaultNode } from "@/web/topic/diagramStore/nodeGetters";
import { DiagramStoreState, useDiagramStore } from "@/web/topic/diagramStore/store";
import {
  Node,
  RelationDirection,
  ancestors,
  descendants,
  findNodeOrThrow,
} from "@/web/topic/utils/graph";
import { children, edges, neighbors, parents } from "@/web/topic/utils/node";
import { useIsAnyGraphPartSelected } from "@/web/view/selectedPartStore";

export const useNode = (nodeId: string | null) => {
  return useDiagramStore((state) => {
    if (!nodeId) return null;

    try {
      return findNodeOrThrow(nodeId, state.nodes);
    } catch {
      return null;
    }
  });
};

export const useAllNodes = (nodeIds?: string[]) => {
  return useDiagramStore((state) => {
    if (!nodeIds) return state.nodes;

    // start from nodeIds so that order and duplicates are preserved (e.g. for core node header) (as opposed to just filtering state.nodes for matches)
    return nodeIds
      .map((nodeId) => state.nodes.find((node) => node.id === nodeId))
      .filter((node) => node !== undefined);
  }, shallow);
};

const getCoreNodes = (state: DiagramStoreState): Node[] => {
  return state.nodes.filter((node) => isDefaultCoreNodeType(node.type));
};

export const useCoreNodes = () => {
  return useDiagramStore((state) => {
    return getCoreNodes(state);
  }, shallow);
};

export const useIsCoreNode = (nodeId: string) => {
  return useDiagramStore((state) => {
    return getCoreNodes(state).some((node) => node.id === nodeId);
  });
};

export const useRelatedUnrelatedCoreNodes = (
  summaryNode: Node | null,
): (Node & { related: boolean })[] => {
  return useDiagramStore((state) => {
    const coreNodes = getCoreNodes(state);

    if (!summaryNode) return coreNodes.map((node) => ({ ...node, related: true })); // say it's related because if there's no summary node, we're looking at core nodes

    const graph = { nodes: state.nodes, edges: state.edges };

    return coreNodes.map((node) => {
      if (node.id === summaryNode.id) return { ...node, related: true };

      const related =
        ancestors(node, graph).some((ancestor) => ancestor.id === summaryNode.id) ||
        descendants(node, graph).some((descendant) => descendant.id === summaryNode.id);

      return { ...node, related };
    });
  }, shallow);
};

export const useNodeChildren = (nodeId: string | undefined) => {
  return useDiagramStore((state) => {
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
  return useDiagramStore((state) => {
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
  return useDiagramStore((state) => {
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

export const useNeighborsInDirection = (nodeId: string, direction: RelationDirection) => {
  return useDiagramStore((state) => {
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
  const neighborNodes = useDiagramStore((state) => {
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
  const neighborEdges = useDiagramStore((state) => {
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
  return useDiagramStore((state) => {
    const defaultNode = getDefaultNode(nodeType);
    if (!nodeId) return defaultNode;

    const node = state.nodes.find((node) => node.id === nodeId);
    return node ?? defaultNode;
  }, shallow);
};

export const useNodesOfType = (type: NodeType) => {
  return useDiagramStore((state) => state.nodes.filter((node) => node.type === type), shallow);
};

export const useSolutions = (problemId?: string) => {
  return useDiagramStore((state) => {
    const solutions = state.nodes.filter((node) => node.type === "solution");
    if (!problemId) return solutions;

    const problemSolutions = solutions.filter((solution) =>
      state.edges.find(
        (edge) =>
          edge.source === problemId && edge.label === "addresses" && edge.target === solution.id,
      ),
    );

    return problemSolutions;
  }, shallow);
};

export const useCriteria = (problemId?: string) => {
  return useDiagramStore((state) => {
    const criteria = state.nodes.filter((node) => node.type === "criterion");
    if (!problemId) return criteria;

    const problemCriteria = criteria.filter((criterion) =>
      state.edges.find(
        (edge) =>
          edge.source === problemId &&
          edge.label === "criterionFor" &&
          edge.target === criterion.id,
      ),
    );

    return problemCriteria;
  }, shallow);
};
