import { RelationName } from "@/common/edge";
import { NodeType } from "@/common/node";
import { useCriterionHasContext, useFulfillsHasContext } from "@/web/topic/store/partContextHooks";
import { viewCriterionContext, viewFulfillsEdgeContext } from "@/web/view/currentViewStore/filter";

export const contextMethods: Partial<
  Record<
    NodeType | RelationName,
    { useHasContext: (graphPartId: string) => boolean; viewContext: (graphPartId: string) => void }
  >
> = {
  criterion: {
    useHasContext: useCriterionHasContext,
    viewContext: viewCriterionContext,
  },
  fulfills: {
    useHasContext: useFulfillsHasContext,
    viewContext: viewFulfillsEdgeContext,
  },
};
