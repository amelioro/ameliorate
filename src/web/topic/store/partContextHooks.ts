import { useTopicStore } from "@/web/topic/store/store";
import { findEdgeOrThrow } from "@/web/topic/utils/graph";
import {
  getCriterionContextFilter,
  getFulfillsContextFilter,
  getSolutionContextFilter,
} from "@/web/view/utils/contextFilters";
import { applySolutionFilter, applyTradeoffsFilter } from "@/web/view/utils/diagramFilter";

export const useSolutionHasContext = (solutionId: string) => {
  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };

    try {
      const filter = getSolutionContextFilter(topicGraph, solutionId);
      // Running the filter guarantees that if we change the filter logic, this hook will still be accurate.
      // If performance is a concern, potentially we could:
      // - manually check if context exists, i.e. run only the parts of the filter we know we need to
      // - move the context indicator to only show within the criteria topic
      // - remove reactiveness from the context indicator
      const { nodes } = applySolutionFilter(topicGraph, filter);
      const contextNodes = nodes.filter((node) => node.id !== solutionId);

      return contextNodes.length > 0;
    } catch {
      return false;
    }
  });
};

export const useCriterionHasContext = (criterionId: string) => {
  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };

    try {
      const filter = getCriterionContextFilter(topicGraph, criterionId);
      // Running the filter guarantees that if we change the filter logic, this hook will still be accurate.
      // If performance is a concern, potentially we could:
      // - manually check if context exists, i.e. run only the parts of the filter we know we need to
      // - move the context indicator to only show within the criteria topic
      // - remove reactiveness from the context indicator
      const { nodes } = applyTradeoffsFilter(topicGraph, filter);
      const contextNodes = nodes.filter(
        (node) => node.id !== criterionId && !["solution"].includes(node.type),
      );

      return contextNodes.length > 0;
    } catch {
      return false;
    }
  });
};

export const useFulfillsHasContext = (fulfillsEdgeId: string) => {
  return useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };

    try {
      const fulfillsEdge = findEdgeOrThrow(fulfillsEdgeId, topicGraph.edges);

      const filter = getFulfillsContextFilter(topicGraph, fulfillsEdgeId);
      // Running the filter guarantees that if we change the filter logic, this hook will still be accurate.
      // If performance is a concern, potentially we could:
      // - manually check if context exists, i.e. run only the parts of the filter we know we need to
      // - move the context indicator to only show within the criteria topic
      // - remove reactiveness from the context indicator
      const { nodes } = applyTradeoffsFilter(topicGraph, filter);
      const contextNodes = nodes.filter(
        (node) => node.id !== fulfillsEdge.source && node.id !== fulfillsEdge.target,
      );

      return contextNodes.length > 0;
    } catch {
      return false;
    }
  });
};
