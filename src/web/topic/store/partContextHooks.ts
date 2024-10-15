import { useTopicStore } from "@/web/topic/store/store";
import { getCriterionContextFilter } from "@/web/view/utils/contextFilters";
import { applyTradeoffsFilter } from "@/web/view/utils/diagramFilter";

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
