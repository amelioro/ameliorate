import { shallow } from "zustand/shallow";

import { errorWithData } from "../../../common/errorHandling";
import { RelationDirection, findNode } from "../utils/diagram";
import { children, edges, neighbors, parents } from "../utils/node";
import { useTopicStore } from "./store";
import { getTopicDiagram } from "./utils";

export const useNode = (nodeId: string) => {
  return useTopicStore((state) => {
    try {
      return findNode(nodeId, state.nodes);
    } catch {
      return null;
    }
  });
};

export const useNodeChildren = (nodeId: string) => {
  return useTopicStore((state) => {
    try {
      const node = findNode(nodeId, state.nodes);
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
      const node = findNode(nodeId, state.nodes);
      const topicGraph = { nodes: state.nodes, edges: state.edges };
      return parents(node, topicGraph);
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

export const useCriterionSolutionEdges = (problemNodeId: string) => {
  return useTopicStore((state) => {
    try {
      const problemNode = findNode(problemNodeId, state.nodes);
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
      const node = findNode(nodeId, state.nodes);
      const topicGraph = { nodes: state.nodes, edges: state.edges };
      return direction === "parent" ? parents(node, topicGraph) : children(node, topicGraph);
    } catch {
      return [];
    }
  }, shallow);
};

export const useIsNeighborSelected = (nodeId: string) => {
  return useTopicStore((state) => {
    try {
      const node = findNode(nodeId, state.nodes);
      const topicGraph = { nodes: state.nodes, edges: state.edges };
      return neighbors(node, topicGraph).some((node) => node.selected);
    } catch {
      return false;
    }
  });
};

export const useIsEdgeSelected = (nodeId: string) => {
  return useTopicStore((state) => {
    try {
      const node = findNode(nodeId, state.nodes);
      return edges(node, state.edges).some((edge) => edge.selected);
    } catch {
      return false;
    }
  });
};
