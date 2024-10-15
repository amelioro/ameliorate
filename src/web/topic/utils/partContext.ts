import { RelationName } from "@/common/edge";
import { NodeType } from "@/common/node";
import { useCriterionHasContext } from "@/web/topic/store/partContextHooks";
import { viewCriterionContext } from "@/web/view/currentViewStore/filter";

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
};
