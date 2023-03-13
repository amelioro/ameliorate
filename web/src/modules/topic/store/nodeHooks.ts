import { Node, findNode } from "../utils/diagram";
import { children } from "../utils/node";
import { useTopicStoreAfterHydration } from "./store";

export const useNode = (nodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];

    // wrap in try/catch because findNode will error when this is triggered by a node deletion (zombie child issue)
    try {
      return findNode(diagram, nodeId);
    } catch {
      return null;
    }
  });
};

export const useNodeChildren = (nodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];

    // wrap in try/catch because findNode will error when this is triggered by a node deletion (zombie child issue)
    try {
      const node = findNode(diagram, nodeId);
      return children(node, diagram);
    } catch {
      return [];
    }
  });
};

export const useNodes = (diagramId: string, predicate: (node: Node) => boolean) => {
  return useTopicStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];

    return diagram.nodes.filter(predicate);
  });
};

export const useCriterionSolutionEdges = (problemNodeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];

    // wrap in try/catch because findNode will error when this is triggered by a node deletion (zombie child issue)
    try {
      const problemNode = findNode(diagram, problemNodeId);
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
