import { shallow } from "zustand/shallow";

import { errorWithData } from "../../../common/errorHandling";
import { RelationDirection, findNode } from "../utils/diagram";
import { children, edges, neighbors, parents } from "../utils/node";
import { useTopicStore } from "./store";
import { getDiagramOrThrow, getTopicDiagram } from "./utils";

export const useNode = (nodeId: string, diagramId: string) => {
  return useTopicStore((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      return findNode(nodeId, diagram);
    } catch {
      return null;
    }
  });
};

export const useNodeChildren = (nodeId: string, diagramId: string) => {
  return useTopicStore((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return children(node, diagram);
    } catch {
      return [];
    }
  }, shallow);
};

export const useNodeParents = (nodeId: string, diagramId: string) => {
  return useTopicStore((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return parents(node, diagram);
    } catch {
      return [];
    }
  }, shallow);
};

export const useCriteriaTableProblemNodes = () => {
  return useTopicStore((state) => {
    try {
      const topicDiagram = getTopicDiagram(state);

      return topicDiagram.nodes.filter(
        (node) =>
          node.type === "problem" &&
          children(node, topicDiagram).some((child) => child.type === "criterion")
      );
    } catch {
      return [];
    }
  }, shallow);
};

export const useCriterionSolutionEdges = (problemNodeId: string, diagramId: string) => {
  return useTopicStore((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const problemNode = findNode(problemNodeId, diagram);
      if (problemNode.type !== "problem") {
        throw errorWithData("node is not a problem node", problemNode);
      }

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
  }, shallow);
};

export const useNeighbors = (nodeId: string, direction: RelationDirection, diagramId: string) => {
  return useTopicStore((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return direction === "parent" ? parents(node, diagram) : children(node, diagram);
    } catch {
      return [];
    }
  }, shallow);
};

export const useIsNeighborSelected = (nodeId: string, diagramId: string) => {
  return useTopicStore((state) => {
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
  return useTopicStore((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const node = findNode(nodeId, diagram);
      return edges(node, diagram).some((edge) => edge.selected);
    } catch {
      return false;
    }
  });
};
