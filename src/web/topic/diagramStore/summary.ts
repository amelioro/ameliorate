import { getNeighborsByRelationDescription, getSolutionBenefits } from "@/web/summary/aspectFilter";
import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { Node } from "@/web/topic/utils/graph";

// hooks
// These are simple because of the following plan to enable reusing summary filtering in the diagram view:
// - diagramStore/summary.ts with hook `useX` for each aspect filter, e.g. `useNeighborsByRelationDescription`
// - summary/aspectFilter.ts for individual `getX` e.g. `getNeighborsByRelationDescription`
// - future: focusedFilter.ts? has if-else to invoke the right `getX` from aspectFilter.ts, similar to infoFilter's `applyStandardFilter`

export const useBenefits = (summaryNode: Node) => {
  return useDiagramStore((state) => {
    return getSolutionBenefits(summaryNode, state);
  });
};

export const useNeighborsByRelationDescription = (summaryNode: Node) => {
  return useDiagramStore((state) => {
    return getNeighborsByRelationDescription(summaryNode, state);
  }); // could use shallow/deep-compare to avoid re-rendering summary tabs unless these lists change
};
