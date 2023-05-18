import { Node, RelationDirection, findNode } from "../utils/diagram";
import { children, edges, neighbors, parents } from "../utils/node";
import { useTopicStoreAfterHydration } from "./store";
import { getDiagramOrThrow } from "./utils";

export const useNode = (nodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      return findNode(nodeId, diagram);
    } catch {
      return null;
    }
  });
};

export const useNodeChildren = (nodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return children(node, diagram);
    } catch {
      return [];
    }
  });
};

export const useNodeParents = (nodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return parents(node, diagram);
    } catch {
      return [];
    }
  });
};

export const useNodes = (diagramId: string, predicate: (node: Node) => boolean) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      return diagram.nodes.filter(predicate);
    } catch {
      return [];
    }
  });
};

export const useCriterionSolutionEdges = (problemNodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const problemNode = findNode(problemNodeId, diagram);
      if (problemNode.type !== "problem") throw new Error("node is not a problem node");

      const nodeChildren = children(problemNode, diagram);
      const criteria = nodeChildren.filter((node) => node.type === "criterion");
      const criteriaIds = criteria.map((node) => node.id);
      const solutions = nodeChildren.filter((node) => node.type === "solution");
      const solutionIds = solutions.map((node) => node.id);

      return diagram.edges.filter((edge) => {
        return criteriaIds.includes(edge.source) && solutionIds.includes(edge.target);
      });
    } catch {
      return [];
    }
  });
};

export const useNeighbors = (nodeId: string, direction: RelationDirection, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return direction === "parent" ? parents(node, diagram) : children(node, diagram);
    } catch {
      return [];
    }
  });
};

export const useIsNeighborSelected = (nodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return neighbors(node, diagram).some((node) => node.selected);
    } catch {
      return false;
    }
  });
};

export const useIsEdgeSelected = (nodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return edges(node, diagram).some((edge) => edge.selected);
    } catch {
      return false;
    }
  });
};
